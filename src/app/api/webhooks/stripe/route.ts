import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

/**
 * Extrae el ID string de un campo que puede llegar como:
 * - string puro:         "cus_xxx"
 * - objeto expandido:    { id: "cus_xxx", ... }
 * - null / undefined     (triggers de prueba del CLI)
 */
function extractId(field: unknown): string | null {
  if (!field) return null;
  if (typeof field === "string") return field || null;
  if (typeof field === "object" && "id" in (field as object)) {
    const id = (field as { id: unknown }).id;
    return typeof id === "string" && id ? id : null;
  }
  return null;
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET no configurado");
    return NextResponse.json({ error: "Webhook secret no configurado" }, { status: 500 });
  }

  const rawBody = await request.text();
  const sig = request.headers.get("stripe-signature") ?? "";

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error("[Stripe Webhook] Firma inválida:", err.message);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  console.log(`[Stripe Webhook] Evento recibido: ${event.type} (${event.id})`);

  try {
    await handleEvent(event);
  } catch (err: any) {
    console.error(
      `[Stripe Webhook] Error fatal procesando ${event.type} (${event.id}):`,
      err.message,
      err.stack ?? ""
    );
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleEvent(event: any) {
  const obj = event.data.object;

  switch (event.type) {
    // ── Pago confirmado: activar alumno ──────────────────────────────
    case "invoice.paid": {
      const customerId = extractId(obj.customer);
      const subscriptionId = extractId(obj.subscription);

      console.log(
        `[Stripe] invoice.paid: customer=${customerId ?? "null"}, subscription=${subscriptionId ?? "null"}`
      );

      if (!customerId) {
        console.log(
          `[Stripe Webhook] invoice.paid (${event.id}): campo 'customer' vacío — ignorado de forma segura`
        );
        return;
      }

      let result: { count: number };
      try {
        result = await prisma.student.updateMany({
          where: { stripeCustomerId: customerId },
          data: subscriptionId
            ? { paymentStatus: "active", stripeSubscriptionId: subscriptionId }
            : { paymentStatus: "active" },
        });
      } catch (err: any) {
        console.error(
          `[Stripe] invoice.paid (${event.id}) — error en Prisma:`,
          { customerId, subscriptionId, message: err.message, code: err.code }
        );
        throw err;
      }

      if (result.count === 0) {
        // ID de cliente simulado por el CLI de Stripe — no existe en la BD local.
        // Retornamos sin error para que Stripe no marque el webhook como fallido.
        console.log(
          `[Stripe Webhook] Cliente simulado de prueba no encontrado en la BD local. Ignorando de forma segura.`
        );
        return;
      }

      console.log(
        `[Stripe] invoice.paid (${event.id}) → ${result.count} alumno(s) activados, customer=${customerId}`
      );
      return;
    }

    // ── Pago fallido: marcar vencido ─────────────────────────────────
    case "invoice.payment_failed": {
      const customerId = extractId(obj.customer);

      if (!customerId) {
        console.log(
          `[Stripe Webhook] invoice.payment_failed (${event.id}): campo 'customer' vacío — ignorado de forma segura`
        );
        return;
      }

      let result: { count: number };
      try {
        result = await prisma.student.updateMany({
          where: { stripeCustomerId: customerId },
          data: { paymentStatus: "past_due" },
        });
      } catch (err: any) {
        console.error(
          `[Stripe] invoice.payment_failed (${event.id}) — error en Prisma:`,
          { customerId, message: err.message, code: err.code }
        );
        throw err;
      }

      if (result.count === 0) {
        console.log(
          `[Stripe Webhook] Cliente simulado de prueba no encontrado en la BD local. Ignorando de forma segura.`
        );
        return;
      }

      console.log(
        `[Stripe] invoice.payment_failed (${event.id}) → ${result.count} alumno(s) marcados past_due, customer=${customerId}`
      );
      return;
    }

    // ── Suscripción cancelada: desactivar alumno ─────────────────────
    case "customer.subscription.deleted": {
      const customerId = extractId(obj.customer);

      if (!customerId) {
        console.log(
          `[Stripe Webhook] subscription.deleted (${event.id}): campo 'customer' vacío — ignorado de forma segura`
        );
        return;
      }

      let result: { count: number };
      try {
        result = await prisma.student.updateMany({
          where: { stripeCustomerId: customerId },
          data: { paymentStatus: "inactive", stripeSubscriptionId: null },
        });
      } catch (err: any) {
        console.error(
          `[Stripe] subscription.deleted (${event.id}) — error en Prisma:`,
          { customerId, message: err.message, code: err.code }
        );
        throw err;
      }

      if (result.count === 0) {
        console.log(
          `[Stripe Webhook] Cliente simulado de prueba no encontrado en la BD local. Ignorando de forma segura.`
        );
        return;
      }

      console.log(
        `[Stripe] subscription.deleted (${event.id}) → ${result.count} alumno(s) inactivados, customer=${customerId}`
      );
      return;
    }

    // ── Onboarding de Coach completado: marcar cuenta como lista ────────
    case "account.updated": {
      if (obj.details_submitted !== true) {
        console.log(
          `[Stripe Connect] account.updated (${event.id}): details_submitted=false para ${obj.id} — ignorado`
        );
        return;
      }

      let result: { count: number };
      try {
        result = await prisma.coach.updateMany({
          where: { stripeConnectId: obj.id },
          data: { stripeOnboardingComplete: true },
        });
      } catch (err: any) {
        console.error(
          `[Stripe Connect] account.updated (${event.id}) — error en Prisma:`,
          { accountId: obj.id, message: err.message }
        );
        throw err;
      }

      if (result.count === 0) {
        console.log(
          `[Stripe Connect] account.updated (${event.id}): cuenta ${obj.id} no encontrada en BD — ignorado de forma segura`
        );
        return;
      }

      console.log(
        `[Stripe Connect] account.updated (${event.id}): coach con cuenta ${obj.id} → onboardingComplete=true`
      );
      return;
    }

    default:
      console.log(`[Stripe Webhook] Evento no manejado: ${event.type} — ignorado`);
      return;
  }
}
