import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LandingGateway from "./_gateway";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    const role = (session.user as { role?: string }).role;
    if (role === "CLIENT") redirect("/portal");
    if (role === "COACH")  redirect("/coach");
    redirect("/admin");
  }

  return <LandingGateway />;
}
