import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { stripe, stripeEnabled } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(_request: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const student = await prisma.student.findUnique({
    where: { id: user.studentId },
    select: { id: true, stripeSubscriptionId: true },
  });
  if (!student) return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });

  // Cancelar en Stripe al final del período facturado
  if (stripeEnabled() && student.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.update(student.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
      console.log(`[Stripe] Suscripción ${student.stripeSubscriptionId} → cancel_at_period_end: true`);
    } catch (err: any) {
      console.warn(`[Stripe] No se pudo cancelar en Stripe: ${err.message} — continuando localmente`);
    }
  } else {
    console.log("[Dev] Sin stripeSubscriptionId — cancelación solo en Prisma");
  }

  await prisma.student.update({
    where: { id: student.id },
    data: { paymentStatus: "inactive" },
  });

  return NextResponse.json({ success: true });
}
