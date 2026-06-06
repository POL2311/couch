import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const HOME_BY_ROLE: Record<string, string> = {
  ADMIN: "/admin",
  COACH: "/coach",
  CLIENT: "/portal",
};

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const session = req.auth;
  const role = session?.user?.role;

  const isLogin = path === "/login";

  // No autenticado → al login (excepto si ya está en login)
  if (!session) {
    if (isLogin) return NextResponse.next();
    const url = new URL("/login", nextUrl);
    if (path !== "/") url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  const home = HOME_BY_ROLE[role ?? "CLIENT"] ?? "/login";

  // Autenticado en /login o raíz → a su home por rol
  if (isLogin || path === "/") {
    return NextResponse.redirect(new URL(home, nextUrl));
  }

  // Control de acceso por rol
  const inCoach = path.startsWith("/coach");
  const inAdmin = path.startsWith("/admin");
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
  // Protege todo salvo assets estáticos y la API de autenticación
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
