import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { unlinkStudentFromCoach } from "@/lib/db";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

/**
 * DELETE /api/coach/students/[id]
 * Unlinks a student from the coach by setting Student.coachId = null.
 * The student's historical data (DailyCheck, WorkoutSession, etc.) is preserved.
 * Only the owning coach may unlink their own student.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user || user.role !== "COACH" || !user.coachId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: NO_STORE });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400, headers: NO_STORE });
  }

  const unlinked = await unlinkStudentFromCoach(id, user.coachId);
  if (!unlinked) {
    return NextResponse.json(
      { error: "Alumno no encontrado o no pertenece a este coach" },
      { status: 404, headers: NO_STORE },
    );
  }

  return NextResponse.json({ success: true }, { headers: NO_STORE });
}
