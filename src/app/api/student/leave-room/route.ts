import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

/**
 * POST /api/student/leave-room
 * Sets Student.coachId = null for the authenticated student, cleanly
 * detaching them from their current coach / community room.
 * Historical data (WorkoutSession, DailyCheck, etc.) is preserved.
 *
 * Returns { ok: true } on success.
 */
export async function POST() {
  const user = await getSessionUser();
  if (!user || user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: NO_STORE });
  }

  try {
    await prisma.student.update({
      where: { id: user.studentId },
      data:  { coachId: null },
    });
    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  } catch (err) {
    console.error("[student/leave-room] POST failed:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500, headers: NO_STORE });
  }
}
