import NextAuth from "next-auth";
import type { NextAuthRequest } from "next-auth";
import { NextResponse, type NextRequest, type NextFetchEvent, type NextMiddleware } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const HOME_BY_ROLE: Record<string, string> = {
  ADMIN: "/admin",
  COACH: "/coach",
  CLIENT: "/portal",
};

// Legal/support pages required by App Store Connect review — must be reachable
// with zero auth, regardless of session state or role, so Apple's reviewer
// (and any logged-out visitor) can open them directly.
const PUBLIC_LEGAL_ROUTES = ["/soporte", "/privacidad", "/terminos"];

function isPublicLegalRoute(pathname: string): boolean {
  return PUBLIC_LEGAL_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

// `auth((req) => {...})` returns an already-bound handler — calling it as
// `authMiddleware(req, ev)` correctly re-enters next-auth's `handleAuth`
// WITH our custom function attached (the `isReqWrapper` path in
// next-auth/lib/index.js). Calling `auth(req, ev)` directly instead — i.e.
// treating `auth` itself as the request handler — takes a different branch
// (`args[0] instanceof Request`) that runs WITHOUT our custom function at
// all, falling back to the bare `authorized` callback. Since that callback
// is intentionally always `true` (see auth.config.ts), that path would let
// every request through unauthenticated, including /portal, /coach and
// /admin. Keep `auth(...)` wrapping a function — never call it bare.
const authMiddleware = auth((req: NextAuthRequest) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const session = req.auth;
  const role = session?.user?.role;

  const isRoot  = path === "/";
  const isLogin = path === "/login";

  // No autenticado → root gateway and /login are publicly accessible.
  // All other protected routes bounce back to the root gateway with callbackUrl.
  if (!session) {
    if (isRoot || isLogin) return NextResponse.next();
    const url = new URL("/", nextUrl);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  const home = HOME_BY_ROLE[role ?? "CLIENT"] ?? "/";

  // Autenticado en /login o raíz → a su home por rol
  if (isLogin || path === "/") {
    return NextResponse.redirect(new URL(home, nextUrl));
  }

  // Control de acceso por rol
  const inCoach = path.startsWith("/coach");
  const inPortal = path.startsWith("/portal");

  if (role === "CLIENT" && !inPortal) {
    return NextResponse.redirect(new URL("/portal", nextUrl));
  }
  if (role === "COACH" && !inCoach) {
    return NextResponse.redirect(new URL("/coach", nextUrl));
  }
  // ADMIN: acceso global a /admin y /coach; nunca al portal del cliente
  if (role === "ADMIN" && inPortal) {
    return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  return NextResponse.next();
}) as unknown as NextMiddleware;
// (cast note: `auth((req) => {...})` is correctly typed at RUNTIME — the
// isReqWrapper path traced above always applies since we pass a function —
// but TS's overload resolution for `auth(...)` picks the AppRouteHandlerFn
// overload instead of the NextMiddleware one, because a single-param
// callback structurally matches both. The cast asserts the shape we already
// proved is correct; it changes no runtime behavior.)

/**
 * Entry point. Checks the path BEFORE anything Auth.js-related runs — no
 * session read, no JWT decrypt, no `authorized` callback — for the public
 * legal/support pages. Every other path defers to `authMiddleware`, which
 * carries the full role-based auth logic above.
 */
export default function proxy(req: NextRequest, ev: NextFetchEvent) {
  if (isPublicLegalRoute(req.nextUrl.pathname)) {
    return NextResponse.next();
  }
  return authMiddleware(req, ev);
}

export const config = {
  // Protege las páginas; las rutas /api gestionan su propia autorización
  // (devuelven 401/403) para no redirigir por rol las peticiones fetch.
  // soporte/privacidad/terminos quedan fuera del matcher a propósito — son
  // públicas por requisito de App Store Connect y así ni siquiera se invoca
  // la función `proxy` de este archivo para ellas. El bypass explícito de
  // arriba (isPublicLegalRoute) queda como segunda capa de defensa por si
  // algún día se relaja este matcher.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads|soporte|privacidad|terminos|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
