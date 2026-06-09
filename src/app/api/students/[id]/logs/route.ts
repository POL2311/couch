import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getExerciseLogs } from "@/lib/db";

/* GET /api/students/[id]/logs → historial de entrenamiento del alumno.
   Acceso: ADMIN, COACH, o el propio alumno. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  if (user.role === "CLIENT" && user.studentId !== id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  return NextResponse.json(await getExerciseLogs(id));
}
