import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

/**
 * GET /api/student/latest-notice
 * Returns the most recent COACH-role GroupMessage for the authenticated
 * student's assigned coach.  Used to drive the top Directive HUD card.
 *
 * { notice: { content: string; senderName: string } | null }
 */
export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json({ notice: null }, { status: 403, headers: NO_STORE });
  }

  try {
    const student = await prisma.student.findUnique({
      where:  { id: user.studentId },
      select: { coachId: true },
    });

    if (!student?.coachId) {
      return NextResponse.json({ notice: null }, { headers: NO_STORE });
    }

    const msg = await prisma.groupMessage.findFirst({
      where:   { coachId: student.coachId, role: "COACH" },
      orderBy: { createdAt: "desc" },
      select:  { content: true, senderName: true },
    });

    return NextResponse.json(
      { notice: msg ? { content: msg.content, senderName: msg.senderName } : null },
      { headers: NO_STORE },
    );
  } catch (err) {
    console.error("[student/latest-notice] GET failed:", err);
    return NextResponse.json({ notice: null }, { status: 500, headers: NO_STORE });
  }
}
