import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getEjercicioById, updateEjercicio, deleteEjercicio } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

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

  const contentType = request.headers.get("content-type") ?? "";
  let name = "", muscleGroup = "", equipment = "", bodyweight = false;
  let videoUrl = "", imageUrl = "";

  if (contentType.includes("multipart/form-data")) {
    const fd = await request.formData();
    name        = ((fd.get("name")        as string) ?? "").trim();
    muscleGroup = (fd.get("muscleGroup")  as string) ?? "";
    equipment   = (fd.get("equipment")   as string) ?? "";
    bodyweight  = fd.get("bodyweight") === "true";
    videoUrl    = (fd.get("videoUrl")    as string) ?? "";
    imageUrl    = (fd.get("imageUrl")    as string) ?? "";
    const file  = fd.get("image") as File | null;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const dir = path.join(process.cwd(), "public", "uploads", "ejercicios");
      await fs.mkdir(dir, { recursive: true });
      const ext = path.extname(file.name) || ".jpg";
      const filename = `ej_${Date.now()}${ext}`;
      await fs.writeFile(path.join(dir, filename), buffer);
      imageUrl = `/uploads/ejercicios/${filename}`;
    }
  } else {
    const body = await request.json();
    name        = body.name?.trim() ?? "";
    muscleGroup = body.muscleGroup ?? "";
    equipment   = body.equipment ?? "";
    bodyweight  = !!body.bodyweight;
    videoUrl    = body.videoUrl ?? "";
    imageUrl    = body.imageUrl ?? "";
  }

  if (!name || !muscleGroup) {
    return NextResponse.json({ error: "Nombre y grupo muscular son requeridos" }, { status: 400 });
  }
  const updated = await updateEjercicio(id, {
    name, muscleGroup,
    equipment: bodyweight ? "Peso corporal" : equipment,
    bodyweight,
    videoUrl: videoUrl || undefined,
    imageUrl: imageUrl || undefined,
  });
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
