import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getTeamTelemetry } from "@/lib/db";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

const todayLocal = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/**
 * GET /api/coach/telemetry
 * Returns real-time team discipline score for the authenticated coach.
 * { totalStudents, activeToday, streakPct, date }
 */
export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "COACH" || !user.coachId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: NO_STORE });
  }

  const date = todayLocal();
  const telemetry = await getTeamTelemetry(user.coachId, date);

  return NextResponse.json({ ...telemetry, date }, { headers: NO_STORE });
}
