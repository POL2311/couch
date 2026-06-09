import { auth } from "@/auth";
import { headers } from "next/headers";

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: "ADMIN" | "COACH" | "CLIENT";
  coachId?: string | null;
  studentId?: string | null;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  // 1) Web: sesión por cookie de NextAuth.
  const session = await auth();
  if (session?.user) return session.user as SessionUser;

  // 2) App móvil: token Bearer (Authorization). Import diferido para no cargar
  //    jose en el edge/middleware ni romper la ruta web.
  try {
    const h = await headers();
    const authHeader = h.get("authorization");
    if (authHeader) {
      const { verifyMobileToken } = await import("@/lib/mobile-auth");
      return await verifyMobileToken(authHeader);
    }
  } catch {
    // headers() no disponible fuera de un request → ignorar
  }
  return null;
}
