import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getEjercicios, addEjercicio } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

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
  const created = await addEjercicio(user.coachId, {
    name, muscleGroup,
    equipment: bodyweight ? "Peso corporal" : equipment,
    bodyweight,
    videoUrl: videoUrl || undefined,
    imageUrl: imageUrl || undefined,
  });
  return NextResponse.json(created, { status: 201 });
}
