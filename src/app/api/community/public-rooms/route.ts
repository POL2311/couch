import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getPublicRooms, getCoachById } from "@/lib/db";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

/**
 * GET /api/community/public-rooms
 * Returns:
 *   rooms        — coaches with isPublic = true
 *   currentRoom  — the student's currently linked coach room (if any),
 *                  even if that coach has isPublic = false (private invite)
 */
export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: NO_STORE });
  }

  const [rooms, student] = await Promise.all([
    getPublicRooms(),
    prisma.student.findUnique({
      where:  { id: user.studentId },
      select: { coachId: true },
    }),
  ]);

  let currentRoom: { id: string; name: string } | null = null;
  if (student?.coachId) {
    const coach = await getCoachById(student.coachId);
    if (coach) {
      currentRoom = {
        id:   coach.id,
        name: coach.user?.name ?? "SALA PRIVADA",
      };
    }
  }

  return NextResponse.json({ rooms, currentRoom }, { headers: NO_STORE });
}
