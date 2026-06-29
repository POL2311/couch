import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getWorkoutSessionsWithBiometrics } from "@/lib/db";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

/**
 * GET /api/student/workout-session/history
 * Returns all recorded workout sessions for the authenticated student,
 * newest first, including any linked WorkoutBiometrics record.
 *
 * Returns [] (empty array) on auth failure or when no sessions exist —
 * never a 4xx payload, so the client can always safely render an empty state.
 */
export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json([], { status: 403, headers: NO_STORE });
  }

  try {
    const sessions = await getWorkoutSessionsWithBiometrics(user.studentId);
    return NextResponse.json(sessions, { headers: NO_STORE });
  } catch (err) {
    console.error("[workout-session/history] GET failed — student:", user.studentId, "error:", err);
    return NextResponse.json([], { status: 500, headers: NO_STORE });
  }
}
