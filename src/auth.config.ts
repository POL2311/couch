import type { NextAuthConfig } from "next-auth";

/**
 * Configuración edge-safe (sin Prisma ni bcrypt).
 * La usan tanto el middleware (edge) como `auth.ts` (node).
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [], // los providers reales se inyectan en auth.ts (node)
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.coachId = user.coachId ?? null;
        token.studentId = user.studentId ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = (token.role as any) ?? "CLIENT";
        session.user.coachId = (token.coachId as any) ?? null;
        session.user.studentId = (token.studentId as any) ?? null;
      }
      return session;
    },
  },
};

export default authConfig;
