import NextAuth from "next-auth";
import { NextResponse } from "next/server";
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

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const session = req.auth;
  const role = session?.user?.role;

  const isRoot  = path === "/";
  const isLogin = path === "/login";
  const isPublicLegal = PUBLIC_LEGAL_ROUTES.some(
    (r) => path === r || path.startsWith(`${r}/`)
  );

  // Always public — bypasses both the unauthenticated gate below and the
  // authenticated role-redirect logic further down.
  if (isPublicLegal) return NextResponse.next();

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
});

export const config = {
  // Protege las páginas; las rutas /api gestionan su propia autorización
  // (devuelven 401/403) para no redirigir por rol las peticiones fetch.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
