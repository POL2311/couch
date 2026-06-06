import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { name, email, password } = await request.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Nombre, correo y contraseña son requeridos" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (exists) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese correo" }, { status: 409 });
  }

  const created = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      role: "COACH",
      passwordHash: bcrypt.hashSync(password, 10),
      coachProfile: { create: {} },
    },
    include: { coachProfile: true },
  });

  return NextResponse.json({ id: created.coachProfile?.id, name: created.name, email: created.email });
}
