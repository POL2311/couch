import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user || (user.role !== "COACH" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id: studentId } = await params;
  const body = await request.json();
  const password: string = body?.password ?? "";

  if (!password || password.length < 6) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 6 caracteres." },
      { status: 400 },
    );
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { userId: true, email: true, name: true },
  });

  if (!student) {
    return NextResponse.json({ error: "Alumno no encontrado." }, { status: 404 });
  }

  const hash = bcrypt.hashSync(password, 10);

  if (student.userId) {
    await prisma.user.update({
      where: { id: student.userId },
      data: { passwordHash: hash },
    });
  } else {
    // No user account yet — create one and link it
    const newUser = await prisma.user.create({
      data: {
        name: student.name ?? "Cliente",
        email: student.email,
        role: "CLIENT",
        passwordHash: hash,
      },
    });
    await prisma.student.update({
      where: { id: studentId },
      data: { userId: newUser.id },
    });
  }

  return NextResponse.json({ success: true });
}
