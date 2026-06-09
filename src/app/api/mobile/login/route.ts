import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signMobileToken } from "@/lib/mobile-auth";

/* ═══════════════════════════════════════════
   Login para la app móvil.
   Valida credenciales (mismo esquema que la web) y
   devuelve { token, user }. El token va luego en el
   header Authorization: Bearer <token> en cada llamada.
   ═══════════════════════════════════════════ */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const mail = (email as string)?.trim().toLowerCase();
    if (!mail || !password) {
      return NextResponse.json({ error: "Correo y contraseña requeridos" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: mail },
      include: { coachProfile: true, student: true },
    });
    if (!user) return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });

    const role = user.role as "ADMIN" | "COACH" | "CLIENT";
    const coachId = user.coachProfile?.id ?? null;
    const studentId = user.student?.id ?? null;

    const token = await signMobileToken({ id: user.id, role, coachId, studentId });

    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role, coachId, studentId },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Error" }, { status: 500 });
  }
}
