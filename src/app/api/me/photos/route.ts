import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { addProgressPhoto } from "@/lib/db";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * POST /api/me/photos
 * Accepts multipart/form-data:
 *   file  — image (jpeg | png | webp, ≤ 5 MB)
 *   label — optional angle label ("FRONTAL", etc.)
 *
 * Storage tiers (tried in order until one succeeds):
 *   1. Vercel Blob   — when BLOB_READ_WRITE_TOKEN is set (production)
 *   2. Local uploads — writes to public/uploads/  (dev / no token)
 *   3. Base64 inline — last resort; encodes file into data URL, stored in DB string
 *
 * Returns { url, label, createdAt }
 */
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: NO_STORE });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (err) {
    console.error("[photos] formData parse failed:", err);
    return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400, headers: NO_STORE });
  }

  const file  = formData.get("file") as File | null;
  const label = ((formData.get("label") as string | null) ?? "FRONTAL").trim().toUpperCase() || "FRONTAL";

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400, headers: NO_STORE });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Tipo de archivo no permitido. Usa JPEG, PNG o WebP." },
      { status: 422, headers: NO_STORE },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `El archivo excede el límite de ${MAX_BYTES / 1024 / 1024} MB.` },
      { status: 413, headers: NO_STORE },
    );
  }

  // Read once — all storage tiers share this buffer
  const buffer    = Buffer.from(await file.arrayBuffer());
  const ext       = file.type === "image/webp" ? "webp" : file.type === "image/png" ? "png" : "jpg";
  const timestamp = Date.now();
  // Initialised to empty; all three storage tiers below must assign before the DB write
  let blobUrl     = "";

  // ── Tier 1: Vercel Blob ───────────────────────────────────────────────────────
  // Only attempted when the token is present. Failures (private store, network,
  // bad credentials) are non-fatal: we warn and fall through to local tiers.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put }  = await import("@vercel/blob");
      const blobPath = `progress/${user.studentId}/${timestamp}.${ext}`;
      const blob     = await put(blobPath, buffer, { access: "public", contentType: file.type });
      blobUrl        = blob.url;
    } catch (err) {
      console.warn("[photos] Vercel Blob failed, dropping down to local tiers:", err);
    }
  }

  // ── Tier 2: Local filesystem (dev / Blob unavailable) ────────────────────────
  if (!blobUrl) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.warn(
        "[photos] BLOB_READ_WRITE_TOKEN is not set — writing to public/uploads/. " +
        "Set this variable in .env for Vercel Blob production storage.",
      );
    }
    try {
      const { mkdir, writeFile } = await import("fs/promises");
      const { join }             = await import("path");
      const uploadsDir           = join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });
      const filename = `progress_${user.studentId}_${timestamp}.${ext}`;
      await writeFile(join(uploadsDir, filename), buffer);
      blobUrl = `/uploads/${filename}`;
    } catch (fsErr) {
      console.warn("[photos] Filesystem write failed (read-only env or permissions):", fsErr);
    }
  }

  // ── Tier 3: Base64 data URL (absolute fallback) ───────────────────────────────
  if (!blobUrl) {
    console.warn("[photos] Using base64 data URL fallback — image stored inline in DB.");
    blobUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
  }

  try {
    await addProgressPhoto(user.studentId, { url: blobUrl, label, weight: null });
  } catch (err) {
    console.error("[photos] DB insert failed:", err);
    return NextResponse.json(
      { error: "Imagen subida pero falló el registro en base de datos." },
      { status: 500, headers: NO_STORE },
    );
  }

  return NextResponse.json(
    { url: blobUrl, label, createdAt: new Date().toISOString() },
    { status: 201, headers: NO_STORE },
  );
}
