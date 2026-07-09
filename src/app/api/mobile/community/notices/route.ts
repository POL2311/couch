import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { getRecentCoachNotices } from "@/lib/db";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/mobile/community/notices
 * Returns the most recent COACH-role group messages for the student's coach room.
 * Returns an empty array (not 404) when the student has no coach yet.
 */
export async function GET(request: NextRequest) {
  const user = await verifyMobileToken(request.headers.get("authorization"));
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json([], { status: 200 });
  }

  // Resolve the student's coachId — not stored in the JWT.
  const student = await prisma.student.findUnique({
    where:  { id: user.studentId },
    select: { coachId: true },
  });

  if (!student?.coachId) {
    return NextResponse.json([]);
  }

  const notices = await getRecentCoachNotices(student.coachId, 20);
  return NextResponse.json(notices);
}
