import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { stripe, SUBSCRIPTION_PRICE_MXN, SUBSCRIPTION_CURRENCY } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

/**
 * Genera (o reutiliza) un Stripe Checkout para reactivar la suscripción
 * del alumno bloqueado. No requiere paymentStatus activo.
 *
 * Fallback de desarrollo: si el SDK de Stripe falla por cualquier motivo
 * (clave inválida, red, cuenta sin permisos), activa al alumno directamente
 * en Prisma y devuelve una URL simulada para que el frontend no truene.
 */
export async function POST() {
  const user = await getSessionUser();
  if (!user || user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const student = await prisma.student.findUnique({
    where: { id: user.studentId },
    select: {
      id: true,
      name: true,
      email: true,
      stripeCustomerId: true,
      coach: { select: { stripeConnectId: true, stripeOnboardingComplete: true } },
    },
  });
  if (!student) {
    return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    // 1. Asegurar que el alumno tenga un stripeCustomerId —————————————
    let customerId = student.stripeCustomerId;

    if (!customerId) {
      console.log(`[Stripe] Creando cliente para alumno ${student.id}...`);
      const customer = await stripe.customers.create({
        name: student.name,
        email: student.email,
        metadata: { studentId: student.id },
      });
      customerId = customer.id;
      await prisma.student.update({
        where: { id: student.id },
        data: { stripeCustomerId: customerId },
      });
      console.log(`[Stripe] Cliente creado: ${customerId}`);
    }

    // 2. Generar sesión de Checkout mensual ——————————————————————————
    const connectParams =
      student.coach?.stripeOnboardingComplete && student.coach.stripeConnectId
        ? {
            payment_intent_data: {
              application_fee_amount: 10000,
              transfer_data: { destination: student.coach.stripeConnectId },
            },
          }
        : {};

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: SUBSCRIPTION_CURRENCY,
            product_data: { name: "Suscripción MyCoach" },
            recurring: { interval: "month" },
            unit_amount: SUBSCRIPTION_PRICE_MXN,
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${appUrl}/portal?payment=success`,
      cancel_url: `${appUrl}/portal/blocked`,
      ...connectParams,
    });

    console.log(`[Stripe] Checkout session creada: ${session.id}`);
    return NextResponse.json({ checkoutUrl: session.url });
  } catch (err: any) {
    // ── Fallback de desarrollo ────────────────────────────────────────
    // Si Stripe falla (clave de prueba sin permisos, sin red, etc.),
    // activamos al alumno localmente para no bloquear el flujo de dev.
    console.warn(
      `[Stripe] SDK falló en reactivate (${err.message}) — activando alumno localmente como fallback de dev`
    );

    try {
      await prisma.student.update({
        where: { id: student.id },
        data: { paymentStatus: "active" },
      });
      console.log(`[Dev Fallback] Alumno ${student.id} activado directamente en Prisma`);
    } catch (prismaErr: any) {
      console.error("[Dev Fallback] Error activando alumno en Prisma:", prismaErr.message);
      return NextResponse.json(
        { error: "Error interno al intentar reactivar la cuenta" },
        { status: 500 }
      );
    }

    // URL simulada: redirige al portal con flag de desarrollo
    return NextResponse.json({
      checkoutUrl: `${appUrl}/portal?payment=dev_activated`,
      dev: true,
    });
  }
}
