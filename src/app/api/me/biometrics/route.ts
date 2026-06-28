import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { logDailyWeight } from "@/lib/db";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

/**
 * POST /api/me/biometrics
 * Body: { weight: number, date?: string }
 * Upserts the day's WeightEntry and updates Student.currentWeight.
 * Returns: { date, weight }
 */
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: NO_STORE });
  }

  const b = await request.json();

  // Parse weight — accept number or numeric string, round to 1 decimal
  const raw = typeof b?.weight === "number" ? b.weight : parseFloat(b?.weight ?? "");
  if (!Number.isFinite(raw) || raw < 20 || raw > 500) {
    return NextResponse.json({ error: "Peso inválido (debe estar entre 20 y 500 kg)" }, { status: 400, headers: NO_STORE });
  }
  const weight = Math.round(raw * 10) / 10;

  // Validate date — default to today (UTC)
  const dateStr = typeof b?.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.date)
    ? b.date
    : new Date().toISOString().split("T")[0];

  const entry = await logDailyWeight(user.studentId, weight, dateStr);
  return NextResponse.json(entry, { status: 201, headers: NO_STORE });
}
