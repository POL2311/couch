import type { NextAuthConfig } from "next-auth";

/**
 * Configuración edge-safe (sin Prisma ni bcrypt).
 * La usan tanto el middleware (edge) como `auth.ts` (node).
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  providers: [], // los providers reales se inyectan en auth.ts (node)
  callbacks: {
    // NOTA DE ARQUITECTURA: src/proxy.ts llama a `auth((req) => {...})` con una
    // función propia, no `export default auth` a secas. Según
    // node_modules/next-auth/lib/index.js (handleAuth), cuando se pasa esa
    // función custom, este callback solo puede vetar el request si devuelve un
    // `Response` — cualquier booleano se ignora y el handler custom de
    // proxy.ts siempre corre. Por eso se deja fijo en `true`: la única fuente
    // de verdad de autorización/redirects es proxy.ts. Aun así se declara aquí
    // el guard explícito de rutas públicas legales (Apple App Store Connect)
    // para que quede documentado a nivel de config y no dependa solo del proxy.
    authorized({ request: { nextUrl } }) {
      const publicPaths = ["/soporte", "/privacidad", "/terminos"];
      if (publicPaths.some((path) => nextUrl.pathname.startsWith(path))) {
        return true;
      }
      return true;
    },
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
