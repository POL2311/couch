import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getCoachNoticesAdmin } from "@/lib/db";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

/**
 * GET /api/coach/notices
 * Returns all GroupMessage rows for the authenticated coach's room (admin view).
 * Only accessible by the owning coach.
 */
export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "COACH" || !user.coachId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: NO_STORE });
  }

  const notices = await getCoachNoticesAdmin(user.coachId);
  return NextResponse.json({ notices }, { headers: NO_STORE });
}
