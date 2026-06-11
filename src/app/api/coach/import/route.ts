import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import path from "path";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

/* ─── Types ─────────────────────────────── */
export interface ImportWarning {
  row: number;
  name: string;
  type: "info" | "warning" | "error";
  message: string;
}
export interface ImportResult {
  total: number;
  created: number;
  skipped: number;
  warnings: ImportWarning[];
}

/* ─── Column map (Spanish → internal key) ── */
const COL = {
  name:         "Nombre Completo",
  email:        "Correo Electrónico",
  age:          "Edad",
  stage:        "Etapa Objetivo",
  stageNumber:  "Número de Mes/Etapa",
  weight:       "Peso Actual (kg)",
  height:       "Estatura (cm)",
  bodyFat:      "% Grasa (Opcional)",
  chest:        "Pecho (cm)",
  waist:        "Cintura (cm)",
  hips:         "Cadera (cm)",
  photo1front:  "Foto Mes 1 - Frente",
  photo1side:   "Foto Mes 1 - Perfil",
  photo2front:  "Foto Mes 2 - Frente",
  photo2side:   "Foto Mes 2 - Perfil",
} as const;

/* Photo columns in order, with DB labels */
const PHOTO_COLS: { col: string; label: string }[] = [
  { col: COL.photo1front, label: "Mes 1 · Frente"  },
  { col: COL.photo1side,  label: "Mes 1 · Perfil"  },
  { col: COL.photo2front, label: "Mes 2 · Frente"  },
  { col: COL.photo2side,  label: "Mes 2 · Perfil"  },
];

const VALID_STAGES = ["Volumen", "Definición", "Mantenimiento", "Recomposición"];
const AVATAR_PALETTE = ["#3b82f6","#8b5cf6","#06b6d4","#10b981","#f59e0b","#ef4444","#ec4899","#f97316","#6366f1","#14b8a6"];

/* ─── Helpers ────────────────────────────── */
function str(v: unknown): string { return v == null ? "" : String(v).trim(); }
function num(v: unknown): number { const n = parseFloat(str(v)); return isNaN(n) ? 0 : n; }

/** Strips accents, lowercases, and normalises separators — used for fuzzy photo matching. */
function normalizeKey(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")   // é→e, ñ→n, ü→u …
    .replace(/[\s-]+/g, "_");           // spaces / hyphens → underscore
}

/** Read a cell by Spanish column name, falling back to the legacy English key. */
function cell(row: Record<string, unknown>, spanishKey: string, legacyKey?: string): unknown {
  return row[spanishKey] ?? (legacyKey ? row[legacyKey] : undefined) ?? "";
}

function initials(name: string): string {
  const p = name.trim().split(/\s+/);
  return p.length > 1 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : p[0].slice(0, 2).toUpperCase();
}
function avatarColor(email: string): string {
  let h = 0;
  for (const c of email) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}
async function saveFile(content: Uint8Array, originalName: string, prefix: string): Promise<string> {
  const ext      = path.extname(originalName).toLowerCase() || ".jpg";
  const safePfx  = prefix.replace(/[^a-z0-9_]/gi, "_").slice(0, 60);
  const filename = `import_${safePfx}_${Date.now()}${ext}`;
  const dir      = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), Buffer.from(content));
  return `/uploads/${filename}`;
}

/* ══════════════════════════════════════════
   GET — Download Excel template (Spanish)
══════════════════════════════════════════ */
export async function GET() {
  const headers = Object.values(COL);   // all 15 Spanish column names in order

  const ex1 = [
    "Juan Pérez", "juan@ejemplo.com", 25, "Volumen", 1,
    82.5, 178, 18.0, 102, 88, 95,
    "juan_m1_frente.jpg", "juan_m1_perfil.jpg", "", "",
  ];
  const ex2 = [
    "Ana García", "ana@ejemplo.com", 30, "Definición", 2,
    62.0, 165, 22.5, 90, 68, 98,
    "ana_m1_frente.jpg", "", "ana_m2_frente.jpg", "",
  ];
  const ex3 = [
    "Carlos Ruiz", "carlos@ejemplo.com", 28, "Mantenimiento", 3,
    74.0, 172, 15.0, 96, 80, 90,
    "", "", "", "",
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ex1, ex2, ex3]);

  ws["!cols"]   = headers.map((h) => ({ wch: Math.max(h.length + 2, 18) }));
  ws["!freeze"] = { xSplit: 0, ySplit: 1 };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Alumnos");

  const nodeBuffer  = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const arrayBuffer = nodeBuffer.buffer.slice(
    nodeBuffer.byteOffset,
    nodeBuffer.byteOffset + nodeBuffer.byteLength
  ) as ArrayBuffer;
  const blob = new Blob([arrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  return new Response(blob, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="plantilla_registro_alumnos.xlsx"',
    },
  });
}

/* ══════════════════════════════════════════
   POST — Bulk import
══════════════════════════════════════════ */
export async function POST(request: NextRequest): Promise<NextResponse> {
  /* Auth */
  const user = await getSessionUser();
  if (!user || (user.role !== "COACH" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const coachId = user.role === "COACH" ? (user.coachId ?? undefined) : undefined;

  /* Parse multipart */
  const formData  = await request.formData();
  const excelFile = formData.get("excel") as File | null;
  const zipFile   = formData.get("zip")   as File | null;

  if (!excelFile) return NextResponse.json({ error: "No se proporcionó archivo Excel." }, { status: 400 });

  /* ── Parse Excel ── */
  const excelBuf = Buffer.from(await excelFile.arrayBuffer());
  let wb: XLSX.WorkBook;
  try {
    wb = XLSX.read(excelBuf, { type: "buffer" });
  } catch {
    return NextResponse.json({ error: "No se pudo leer el archivo Excel. Asegúrate de que es un .xlsx válido." }, { status: 400 });
  }
  const ws   = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

  if (rows.length === 0) return NextResponse.json({ error: "El Excel está vacío." }, { status: 400 });

  /* ── Parse ZIP → normalized filename map ── */
  /* Key: normalizeKey(basename)  Value: { raw content, original name } */
  const fileMap = new Map<string, { content: Uint8Array; originalName: string }>();
  if (zipFile) {
    const zipBuf = Buffer.from(await zipFile.arrayBuffer());
    try {
      const zip = await JSZip.loadAsync(zipBuf);
      for (const [relPath, entry] of Object.entries(zip.files)) {
        if (!entry.dir) {
          const basename  = path.basename(relPath);
          const normKey   = normalizeKey(basename);
          const content   = await entry.async("uint8array");
          /* If the same normalised key appears twice, last write wins — acceptable for imports. */
          fileMap.set(normKey, { content, originalName: basename });
        }
      }
    } catch {
      return NextResponse.json({ error: "No se pudo leer el archivo ZIP." }, { status: 400 });
    }
  }

  /* ── Process rows ── */
  const result: ImportResult = { total: rows.length, created: 0, skipped: 0, warnings: [] };
  const warn = (row: number, name: string, type: ImportWarning["type"], message: string) =>
    result.warnings.push({ row, name, type, message });

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 2; // 1-indexed + header
    const row    = rows[i];

    /* ── Required fields (Spanish primary, English fallback) ── */
    const name  = str(cell(row, COL.name,  "Name"));
    const email = str(cell(row, COL.email, "Email")).toLowerCase();

    if (!name || !email) {
      warn(rowNum, name || "—", "error", "Nombre o correo vacío — fila omitida.");
      result.skipped++;
      continue;
    }

    /* Duplicate check */
    const existing = await prisma.student.findFirst({ where: { email } });
    if (existing) {
      warn(rowNum, name, "warning", `El correo "${email}" ya existe en el sistema. Fila omitida.`);
      result.skipped++;
      continue;
    }

    /* ── Coerce fields ── */
    const rawStage    = str(cell(row, COL.stage,       "Stage"));
    const stage       = VALID_STAGES.includes(rawStage) ? rawStage : "Volumen";
    const stageNumber = Math.max(1, Math.round(num(cell(row, COL.stageNumber, "StageNumber") ?? 1)));
    const weight      = num(cell(row, COL.weight,  "CurrentWeight"));
    const height      = num(cell(row, COL.height,  "Height"));
    const bodyFatRaw  = num(cell(row, COL.bodyFat, "BodyFat"));
    const bodyFat     = bodyFatRaw > 0 ? bodyFatRaw : undefined;
    const chest       = num(cell(row, COL.chest,   "Chest"));
    const waist       = num(cell(row, COL.waist,   "Waist"));
    const hips        = num(cell(row, COL.hips,    "Hips"));
    const today       = new Date().toISOString().split("T")[0];

    if (rawStage && !VALID_STAGES.includes(rawStage)) {
      warn(rowNum, name, "info", `Etapa "${rawStage}" no reconocida — se usó "Volumen".`);
    }

    /* ── Smart photo matching (normalized) ── */
    const photoUrls: { label: string; url: string }[] = [];
    for (const { col, label } of PHOTO_COLS) {
      const rawFilename = str(cell(row, col));
      if (!rawFilename) continue;

      const normFilename = normalizeKey(rawFilename);
      const entry        = fileMap.get(normFilename);

      if (!entry) {
        warn(rowNum, name, "warning",
          `Foto "${rawFilename}" no encontrada en el ZIP (buscado como "${normFilename}").`);
      } else {
        const colKey = col.replace(/[^a-z0-9]/gi, "_").toLowerCase();
        const url    = await saveFile(
          entry.content, entry.originalName,
          `${email.replace(/[^a-z0-9]/g, "_")}_${colKey}`
        );
        photoUrls.push({ label, url });
      }
    }

    /* ── Transactional insert ── */
    try {
      await prisma.$transaction(async (tx) => {
        const created = await tx.student.create({
          data: {
            name,
            email,
            avatarInitials: initials(name),
            avatarColor:    avatarColor(email),
            currentWeight:  weight,
            previousWeight: weight,
            lastWeighIn:    today,
            stage,
            stageNumber,
            paymentStatus:  "inactive",
            joinedDate:     today,
            streak:         0,
            completionRate: 0,
            height:         height  || null,
            bodyFat:        bodyFat ?? null,
            notes:          "Importado desde Excel.",
            dietJson:       "",
            routineJson:    "",
            coachId:        coachId ?? null,
            weightHistory: {
              create: weight > 0 ? [{ date: today, weight }] : [],
            },
            measurements: {
              create: (chest > 0 || waist > 0 || hips > 0)
                ? [{ date: today, chest, waist, hips, armL: 0, armR: 0, thighL: 0, thighR: 0 }]
                : [],
            },
          },
        });

        for (const { label, url } of photoUrls) {
          await tx.progressPhoto.create({
            data: { studentId: created.id, url, label, weight: weight > 0 ? weight : null },
          });
        }

        if (photoUrls.length > 0) {
          await tx.student.update({ where: { id: created.id }, data: { photoName: photoUrls[0].url } });
        }
      });

      result.created++;
    } catch (err: any) {
      warn(rowNum, name, "error", `Error al guardar: ${err?.message ?? "desconocido"}`);
      result.skipped++;
    }
  }

  return NextResponse.json(result);
}
