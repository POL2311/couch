import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getEjercicios, addEjercicio } from "@/lib/db";

/* GET /api/ejercicios → catálogo del coach (ADMIN ve todos). */
export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== "COACH" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const coachId = user.role === "COACH" ? user.coachId ?? undefined : undefined;
  return NextResponse.json(await getEjercicios(coachId));
}

/* POST /api/ejercicios → crea un ejercicio en el catálogo del coach. */
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "COACH" || !user.coachId) {
    return NextResponse.json({ error: "Solo el coach puede crear ejercicios" }, { status: 403 });
  }
  const { name, muscleGroup, equipment, bodyweight } = await request.json();
  if (!name?.trim() || !muscleGroup) {
    return NextResponse.json({ error: "Nombre y grupo muscular son requeridos" }, { status: 400 });
  }
  const created = await addEjercicio(user.coachId, {
    name: name.trim(),
    muscleGroup,
    equipment: equipment || "",
    bodyweight: !!bodyweight,
  });
  return NextResponse.json(created, { status: 201 });
}
