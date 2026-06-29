import LandingGateway from "@/app/_gateway";

// /login is retired as a standalone route.
// Unauthenticated users are served the same cinematic root gateway.
// Authenticated users are intercepted by the middleware and redirected to their home.
export default function LoginPage() {
  return <LandingGateway />;
}
