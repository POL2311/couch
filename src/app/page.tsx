import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LandingGateway from "./_gateway";

export default async function Home() {
redirect('/login');
}
