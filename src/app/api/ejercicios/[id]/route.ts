import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getEjercicioById, updateEjercicio, deleteEjercicio } from "@/lib/db";

/* PUT /api/ejercicios/[id] → editar (solo el coach dueño o admin). */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || (user.role !== "COACH" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const { id } = await params;
  const ej = await getEjercicioById(id);
  if (!ej) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (user.role === "COACH" && ej.coachId !== user.coachId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const { name, muscleGroup, equipment, bodyweight } = await request.json();
  if (!name?.trim() || !muscleGroup) {
    return NextResponse.json({ error: "Nombre y grupo muscular son requeridos" }, { status: 400 });
  }
  const updated = await updateEjercicio(id, { name: name.trim(), muscleGroup, equipment: equipment || "", bodyweight: !!bodyweight });
  return NextResponse.json(updated);
}

/* DELETE /api/ejercicios/[id] → eliminar (solo el coach dueño o admin). */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || (user.role !== "COACH" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const { id } = await params;
  const ej = await getEjercicioById(id);
  if (!ej) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (user.role === "COACH" && ej.coachId !== user.coachId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  await deleteEjercicio(id);
  return NextResponse.json({ success: true });
}
