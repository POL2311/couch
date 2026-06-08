import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

/** Coach suspende o reactiva manualmente a un alumno. */
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "COACH" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  let body: { studentId?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { studentId, status } = body ?? {};
  if (!studentId || !["active", "inactive"].includes(status ?? "")) {
    return NextResponse.json(
      { error: "Requerido: studentId y status ('active' | 'inactive')" },
      { status: 400 }
    );
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true, coachId: true, name: true },
  });
  if (!student) return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });

  if (user.role === "COACH" && student.coachId !== user.coachId) {
    return NextResponse.json({ error: "No autorizado — alumno de otro coach" }, { status: 403 });
  }

  const updated = await prisma.student.update({
    where: { id: studentId },
    data: { paymentStatus: status! },
    select: { id: true, name: true, paymentStatus: true },
  });

  console.log(`[Coach] ${user.email} → "${updated.name}" paymentStatus: ${updated.paymentStatus}`);
  return NextResponse.json({ success: true, student: updated });
}
