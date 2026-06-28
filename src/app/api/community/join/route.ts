import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import {
  findCoachByJoinCode,
  findPublicCoachById,
  linkStudentToCoach,
  getRecentCoachNotices,
} from "@/lib/db";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

/**
 * POST /api/community/join
 * Body (one of):
 *   { roomId: string }  — join a public room by coach ID (isPublic must be true)
 *   { code: string }    — join a private room by Coach.joinCode
 *   {}                  — public join: re-bind student to their existing coach (hydrate)
 *
 * The transaction is DESTRUCTIVE — Student.coachId is unconditionally replaced,
 * enforcing the 1-room-at-a-time constraint.
 *
 * Returns: { ok, coachId, coachName?, notices[] }
 * Error:   422 { error: "..." }
 */
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: NO_STORE });
  }

  const b = await request.json().catch(() => ({}));

  // ── Branch 1: Public room join by coach ID ──────────────────────────────────
  if (b.roomId && typeof b.roomId === "string") {
    const coach = await findPublicCoachById(b.roomId.trim());
    if (!coach) {
      return NextResponse.json(
        { error: "SALA NO DISPONIBLE O NO PÚBLICA" },
        { status: 422, headers: NO_STORE },
      );
    }
    await linkStudentToCoach(user.studentId, coach.id);
    const notices = await getRecentCoachNotices(coach.id);
    return NextResponse.json(
      { ok: true, coachId: coach.id, coachName: coach.user?.name ?? "COACH", notices },
      { headers: NO_STORE },
    );
  }

  // ── Branch 2: Private code join ─────────────────────────────────────────────
  const rawCode = typeof b?.code === "string" ? b.code.trim().toUpperCase() : "";

  if (rawCode) {
    const coach = await findCoachByJoinCode(rawCode);
    if (!coach) {
      return NextResponse.json(
        { error: "CÓDIGO NO COINCIDE CON NINGÚN RADAR" },
        { status: 422, headers: NO_STORE },
      );
    }
    await linkStudentToCoach(user.studentId, coach.id);
    const notices = await getRecentCoachNotices(coach.id);
    return NextResponse.json(
      { ok: true, coachId: coach.id, coachName: coach.user?.name ?? "COACH", notices },
      { headers: NO_STORE },
    );
  }

  // ── Branch 3: Empty payload — re-hydrate from existing link (no mutation) ───
  const student = await prisma.student.findUnique({
    where:  { id: user.studentId },
    select: { coachId: true },
  });
  const notices = student?.coachId ? await getRecentCoachNotices(student.coachId) : [];
  return NextResponse.json(
    { ok: true, coachId: student?.coachId ?? null, notices },
    { headers: NO_STORE },
  );
}
