import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { updateCoachMonthlyPrice } from "@/lib/db";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "COACH" || !user.coachId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const coach = await prisma.coach.findUnique({
    where: { id: user.coachId },
    select: { monthlyPrice: true },
  });
  return NextResponse.json({ monthlyPrice: coach?.monthlyPrice ?? 1200 });
}

export async function PATCH(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "COACH" || !user.coachId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const { monthlyPrice } = await request.json();
  const price = parseFloat(String(monthlyPrice));
  if (isNaN(price) || price < 0) {
    return NextResponse.json({ error: "Precio inválido." }, { status: 400 });
  }
  await updateCoachMonthlyPrice(user.coachId, price);
  return NextResponse.json({ success: true, monthlyPrice: price });
}
