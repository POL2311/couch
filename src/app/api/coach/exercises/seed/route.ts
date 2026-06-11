import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { seedDefaultEjercicios } from "@/lib/db";

export async function POST() {
  const user = await getSessionUser();
  if (!user || user.role !== "COACH" || !user.coachId) {
    return NextResponse.json({ error: "Solo el coach puede sembrar ejercicios" }, { status: 403 });
  }
  const count = await seedDefaultEjercicios(user.coachId);
  return NextResponse.json({ seeded: count });
}
