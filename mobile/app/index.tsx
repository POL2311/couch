import { Redirect } from "expo-router";
import { useSession, homeForRole } from "@/lib/session";

/** Punto de entrada: si hay sesión va al home por rol; si no, al login. */
export default function Index() {
  const { user } = useSession();
  if (!user) return <Redirect href="/login" />;
  return <Redirect href={homeForRole(user.role) as any} />;
}
