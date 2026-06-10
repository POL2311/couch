import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "@/lib/session";

/* ═══════════════════════════════════════════
   Autenticación para la app móvil (token Bearer).
   La web sigue usando cookies de NextAuth; la app usa
   un JWT firmado con el mismo AUTH_SECRET, enviado en
   el header Authorization: Bearer <token>.
   ═══════════════════════════════════════════ */

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET no está definido");
  return new TextEncoder().encode(s);
}

export type MobileTokenPayload = {
  id: string;
  role: "ADMIN" | "COACH" | "CLIENT";
  coachId?: string | null;
  studentId?: string | null;
};

/** Firma un token para la app (válido 30 días). */
export async function signMobileToken(payload: MobileTokenPayload): Promise<string> {
  return new SignJWT({
    role: payload.role,
    coachId: payload.coachId ?? null,
    studentId: payload.studentId ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.id)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

/** Verifica el token del header Authorization y devuelve el usuario, o null. */
export async function verifyMobileToken(authHeader?: string | null): Promise<SessionUser | null> {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  try {
    const { payload } = await jwtVerify(match[1], secret());
    return {
      id: payload.sub as string,
      role: (payload.role as SessionUser["role"]) ?? "CLIENT",
      coachId: (payload.coachId as string | null) ?? null,
      studentId: (payload.studentId as string | null) ?? null,
    };
  } catch {
    return null;
  }
}
