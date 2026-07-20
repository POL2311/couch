import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getSessionUser } from "@/lib/session";
import { getStudentById, getStudentDetail, updateStudent, addProgressPhoto } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { stripe, stripeEnabled } from "@/lib/stripe";

// Never let Next.js or a CDN cache this route — it must always hit the live DB.
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

/** Devuelve la ficha del alumno vinculado a la cuenta cliente. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401, headers: NO_STORE });
  }
  if (user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json({ error: "Sin ficha de alumno asociada" }, { status: 404, headers: NO_STORE });
  }

  // ── ACCESS GATE — isActive is the SOLE authority ──────────────────────────────
  // Rule: Coach.isActive === true  →  full portal access, NO Stripe check.
  //       Coach.isActive === false →  403 ACCOUNT_BLOCKED, regardless of paymentStatus.
  //
  // paymentStatus drives Stripe billing flows / MRR only. It NEVER blocks portal access.
  // Stripe webhooks do NOT touch isActive; only a Coach PATCH to /api/students/[id] can
  // change it. This guarantees the coach's manual override is always respected immediately.
  const liveStatus = await prisma.student.findUnique({
    where: { id: user.studentId },
    select: { isActive: true },
  });

  if (!liveStatus) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404, headers: NO_STORE });
  }

  // isActive defaults to true — only an explicit false blocks access.
  if (liveStatus.isActive === false) {
    return NextResponse.json(
      { error: "ACCOUNT_BLOCKED" },
      { status: 403, headers: NO_STORE },
    );
  }

  // isActive === true: grant access unconditionally. Load full student data.
  const student = await getStudentById(user.studentId);
  const detail = await getStudentDetail(user.studentId);
  if (!student || !detail) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404, headers: NO_STORE });
  }

  return NextResponse.json({ student, detail }, { headers: NO_STORE });
}

/** Registro de progreso diario del alumno: peso + foto opcional. */
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: NO_STORE });
  }
  const id = user.studentId;

  const contentType = request.headers.get("content-type") || "";
  let weight: number | undefined;
  let photoName: string | undefined;
  let photoLabel = "Progreso";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const w = formData.get("weight") as string;
    weight = w ? parseFloat(w) : undefined;
    photoLabel = (formData.get("label") as string) || "Progreso";

    const photoFile = formData.get("photo") as File | null;
    if (photoFile && photoFile.size > 0) {
      const buffer = Buffer.from(await photoFile.arrayBuffer());
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });
      const ext = path.extname(photoFile.name) || ".png";
      const filename = `progress_${Date.now()}${ext}`;
      await fs.writeFile(path.join(uploadsDir, filename), buffer);
      photoName = `/uploads/${filename}`;
    }
  } else {
    const body = await request.json();
    weight = body.weight ? parseFloat(body.weight) : undefined;
  }

  const student = await getStudentById(id);
  const detail = await getStudentDetail(id);
  if (!student || !detail) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404, headers: NO_STORE });
  }

  const today = new Date().toISOString().split("T")[0];

  if (weight && weight > 0) {
    const history = [...detail.weightHistory.filter((h) => h.date !== today), { date: today, weight }];
    history.sort((a, b) => a.date.localeCompare(b.date));
    await updateStudent(
      id,
      { previousWeight: student.currentWeight, currentWeight: weight, lastWeighIn: today },
      { weightHistory: history }
    );
  }

  if (photoName) {
    await addProgressPhoto(id, { url: photoName, label: photoLabel, weight: weight ?? null });
  }

  return NextResponse.json({ success: true }, { headers: NO_STORE });
}

/**
 * Borrado de cuenta en auto-servicio (Apple App Store Guideline 5.1.1(v)).
 * Solo cubre cuentas CLIENT — un Coach/Admin que se borre a sí mismo tendría
 * que orfanar o reasignar primero a todos sus alumnos, lo cual es un flujo
 * de negocio aparte y no algo que deba dispararse desde el botón de Perfil.
 */
export async function DELETE(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401, headers: NO_STORE });
  }
  if (user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json(
      { error: "Esta acción solo está disponible para cuentas de alumno" },
      { status: 403, headers: NO_STORE }
    );
  }

  const studentId = user.studentId;
  const userId = user.id;

  // Cancela cualquier suscripción de Stripe activa antes de borrar — de lo
  // contrario seguiría cobrando a una tarjeta ligada a una cuenta ya eliminada.
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { stripeSubscriptionId: true },
  });
  if (stripeEnabled() && student?.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.cancel(student.stripeSubscriptionId);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[Stripe] No se pudo cancelar ${student.stripeSubscriptionId} al borrar cuenta: ${message} — continuando con el borrado`);
    }
  }

  // Todo lo colgado de Student (peso, medidas, fotos, checks diarios, logs de
  // ejercicio, sesiones de entrenamiento + su telemetría, hidratación) tiene
  // onDelete: Cascade en el schema — se borra solo al borrar el Student.
  // GroupMessage no tiene FK (senderId es un string suelto), así que se borra
  // explícitamente. Carrera sí cascadea al borrar el User.
  // Student debe borrarse ANTES que User: la FK Student.userId es
  // onDelete: SetNull, así que borrar User primero solo huérfanaría al Student.
  await prisma.$transaction([
    prisma.groupMessage.deleteMany({ where: { senderId: userId } }),
    prisma.student.delete({ where: { id: studentId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  const response = NextResponse.json({ success: true }, { headers: NO_STORE });

  // Cierra la sesión del lado del servidor: borra toda cookie de Auth.js
  // (session-token, csrf-token, callback-url, con y sin prefijo __Secure-/__Host-)
  // para que el navegador no conserve un JWT válido de una cuenta que ya no existe.
  for (const c of request.cookies.getAll()) {
    if (c.name.includes("authjs")) {
      response.cookies.set(c.name, "", { maxAge: 0, path: "/" });
    }
  }

  return response;
}
