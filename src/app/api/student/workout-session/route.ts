import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import {
  upsertWorkoutSession,
  finalizeWorkoutSession,
  getWorkoutSession,
  getWorkoutSessions,
} from "@/lib/db";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

/**
 * GET /api/student/workout-session
 *   ?date=YYYY-MM-DD  →  single session for that date (or null)
 *   (no date)         →  last 20 sessions
 */
export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const date = new URL(request.url).searchParams.get("date");
  if (date) {
    const session = await getWorkoutSession(user.studentId, date);
    return NextResponse.json(session ?? null, { headers: NO_STORE });
  }
  return NextResponse.json(await getWorkoutSessions(user.studentId), { headers: NO_STORE });
}

/**
 * POST /api/student/workout-session
 * Body:
 *   { date, name, routineId?, notes? }          → finalizes from ExerciseLogs (auto-aggregate)
 *   { date, name, exerciseLogs: [...], notes? }  → upserts with explicit exercise data
 */
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const b = await request.json();
  if (!b?.name || !b?.date) {
    return NextResponse.json({ error: "Faltan campos obligatorios: name, date" }, { status: 400 });
  }

  const session = Array.isArray(b.exerciseLogs) && b.exerciseLogs.length > 0
    ? await upsertWorkoutSession(user.studentId, {
        date:         b.date,
        name:         b.name,
        routineId:    b.routineId ?? null,
        exerciseLogs: b.exerciseLogs,
        completed:    b.completed ?? undefined,
        notes:        b.notes ?? null,
      })
    : await finalizeWorkoutSession(user.studentId, {
        date:      b.date,
        name:      b.name,
        routineId: b.routineId ?? null,
        notes:     b.notes ?? null,
        completed: b.completed ?? undefined,
      });

  return NextResponse.json(session, { status: 201, headers: NO_STORE });
}

/**
 * PATCH /api/student/workout-session
 * Body: { date, completed?, notes? }  → toggle completion flag or add notes
 */
export async function PATCH(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const b = await request.json();
  if (!b?.date) {
    return NextResponse.json({ error: "Falta el campo date" }, { status: 400 });
  }
  const session = await finalizeWorkoutSession(user.studentId, {
    date:      b.date,
    name:      b.name ?? "Sesión",
    routineId: b.routineId ?? null,
    notes:     b.notes ?? null,
  });
  return NextResponse.json(session, { headers: NO_STORE });
}
