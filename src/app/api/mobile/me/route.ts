import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/mobile/me
 * Validates the Bearer JWT and returns the caller's identity.
 * Used by the mobile app on launch to restore a saved session token.
 */
export async function GET(request: NextRequest) {
  const user = await verifyMobileToken(request.headers.get("authorization"));
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Token only carries id + role; look up name and email for the client.
  const dbUser = await prisma.user.findUnique({
    where:  { id: user.id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    id:    dbUser.id,
    name:  dbUser.name,
    email: dbUser.email,
    role:  dbUser.role,
  });
}
