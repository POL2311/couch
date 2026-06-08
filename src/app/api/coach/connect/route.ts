import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

/** Devuelve el estado de Stripe Connect del coach autenticado. */
export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== "COACH" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (!user.coachId) {
    return NextResponse.json({ stripeConnectId: null, stripeOnboardingComplete: false });
  }

  const coach = await prisma.coach.findUnique({
    where: { id: user.coachId },
    select: { stripeConnectId: true, stripeOnboardingComplete: true },
  });

  return NextResponse.json({
    stripeConnectId: coach?.stripeConnectId ?? null,
    stripeOnboardingComplete: coach?.stripeOnboardingComplete ?? false,
  });
}

/**
 * Gestiona el enlace de Stripe Connect Express:
 * - Si ya completó onboarding → devuelve login link al dashboard Express.
 * - Si tiene cuenta pero onboarding incompleto → regenera accountLinks.
 * - Si no tiene cuenta → crea cuenta Express y genera accountLinks.
 */
export async function POST() {
  const user = await getSessionUser();
  if (!user || (user.role !== "COACH" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (!user.coachId) {
    return NextResponse.json({ error: "Perfil de coach no encontrado" }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const coach = await prisma.coach.findUnique({
      where: { id: user.coachId },
      select: { id: true, stripeConnectId: true, stripeOnboardingComplete: true },
    });
    if (!coach) {
      return NextResponse.json({ error: "Coach no encontrado" }, { status: 404 });
    }

    // Ya onboarded → redirigir al Express Dashboard
    if (coach.stripeOnboardingComplete && coach.stripeConnectId) {
      const loginLink = await stripe.accounts.createLoginLink(coach.stripeConnectId);
      console.log(`[Stripe Connect] Login link generado para coach ${coach.id}: ${loginLink.url}`);
      return NextResponse.json({ type: "dashboard", url: loginLink.url });
    }

    // Crear cuenta Express si aún no existe
    let accountId = coach.stripeConnectId;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        metadata: { coachId: coach.id },
      });
      accountId = account.id;
      await prisma.coach.update({
        where: { id: coach.id },
        data: { stripeConnectId: accountId },
      });
      console.log(`[Stripe Connect] Cuenta Express creada: ${accountId} para coach ${coach.id}`);
    }

    // Generar URL de onboarding (accountLinks expiran; siempre se generan nuevas)
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/coach/payments?connect=refresh`,
      return_url: `${appUrl}/coach/payments?connect=success`,
      type: "account_onboarding",
    });

    console.log(`[Stripe Connect] Onboarding URL generada para cuenta ${accountId}`);
    return NextResponse.json({ type: "onboarding", url: accountLink.url });
  } catch (err: any) {
    console.error("[Stripe Connect] Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
