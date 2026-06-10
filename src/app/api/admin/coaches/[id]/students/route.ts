import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getStudents } from "@/lib/db";
import { prisma } from "@/lib/prisma";

/* GET /api/admin/coaches/[id]/students → alumnos de un coach (solo ADMIN). */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const { id } = await params;
  const coach = await prisma.coach.findUnique({ where: { id }, include: { user: true } });
  if (!coach) return NextResponse.json({ error: "Coach no encontrado" }, { status: 404 });

  const students = await getStudents(id);
  return NextResponse.json({
    coach: { id: coach.id, name: coach.user.name, email: coach.user.email },
    students,
  });
}
