import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

// ─── Validation helpers ──────────────────────────────────────────────────────

function isValidBpm(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 300;
}

function isValidKcal(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 15000;
}

function isValidDate(v: unknown): v is string {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

function safeStr(v: unknown, max = 120): string | null {
  if (typeof v !== "string") return null;
  return v.slice(0, max).trim() || null;
}

// ─── POST /api/student/workout-session/telemetry ─────────────────────────────
/**
 * Saves biometric summary from a smartwatch session.
 * Linked 1:1 to the most recent WorkoutSession for the authenticated student
 * on the given date (upsert: retry-safe if native bridge fires twice).
 *
 * Body:
 *   date           string   YYYY-MM-DD (required)
 *   avgHeartRate   integer  bpm, 0–300 (optional)
 *   maxHeartRate   integer  bpm, 0–300 (optional)
 *   activeCalories integer  kcal, 0–15000 (optional)
 *   totalCalories  integer  kcal, 0–15000 (optional)
 *   deviceSource   string   max 120 chars (optional)
 *   heartRateSeries any[]   time-series for future graph rendering (optional)
 */
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: NO_STORE });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON malformado" }, { status: 400, headers: NO_STORE });
  }

  // ── Required field ─────────────────────────────────────────────────────────
  if (!isValidDate(body.date)) {
    return NextResponse.json(
      { error: "Campo 'date' requerido con formato YYYY-MM-DD" },
      { status: 400, headers: NO_STORE },
    );
  }
  const date = body.date as string;

  // ── Optional numeric validation (reject corrupted sensor data) ─────────────
  const avgHeartRate   = body.avgHeartRate   != null ? (isValidBpm(body.avgHeartRate)   ? body.avgHeartRate   : null) : null;
  const maxHeartRate   = body.maxHeartRate   != null ? (isValidBpm(body.maxHeartRate)   ? body.maxHeartRate   : null) : null;
  const activeCalories = body.activeCalories != null ? (isValidKcal(body.activeCalories) ? body.activeCalories : null) : null;
  const totalCalories  = body.totalCalories  != null ? (isValidKcal(body.totalCalories)  ? body.totalCalories  : null) : null;
  const deviceSource   = safeStr(body.deviceSource);
  // Prisma nullable Json: use Prisma.DbNull to clear the column (not JS null)
  const heartRateSeries: Prisma.InputJsonValue | typeof Prisma.DbNull = Array.isArray(body.heartRateSeries)
    ? (body.heartRateSeries as Prisma.InputJsonValue)
    : Prisma.DbNull;

  try {
    // Resolve the most recent WorkoutSession for this student on the given date.
    // One session per student per date is the invariant enforced by upsertWorkoutSession.
    const session = await prisma.workoutSession.findFirst({
      where:   { studentId: user.studentId, date },
      orderBy: { createdAt: "desc" },
      select:  { id: true },
    });

    if (!session) {
      console.error(
        `[telemetry] No WorkoutSession found for student=${user.studentId} date=${date}`,
      );
      return NextResponse.json(
        { error: "Sesión de entrenamiento no encontrada para esta fecha" },
        { status: 404, headers: NO_STORE },
      );
    }

    // Upsert: idempotent — retrying after a dropped connection is safe.
    const bio = await prisma.workoutBiometrics.upsert({
      where:  { sessionId: session.id },
      create: {
        sessionId: session.id,
        avgHeartRate,
        maxHeartRate,
        activeCalories,
        totalCalories,
        deviceSource,
        heartRateSeries,
      },
      update: {
        avgHeartRate,
        maxHeartRate,
        activeCalories,
        totalCalories,
        deviceSource,
        heartRateSeries,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, biometricsId: bio.id }, { status: 201, headers: NO_STORE });
  } catch (err) {
    console.error("[telemetry] POST failed — student:", user.studentId, "date:", date, "error:", err);
    return NextResponse.json({ error: "Error interno al guardar telemetría" }, { status: 500, headers: NO_STORE });
  }
}
