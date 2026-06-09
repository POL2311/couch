import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getSessionUser } from "@/lib/session";
import { getCarreraById, deleteCarrera, setCarreraPhoto } from "@/lib/db";

/* GET /api/carreras/[id] → detalle de una carrera (si el usuario puede verla). */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const carrera = await getCarreraById(id);
  if (!carrera) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  if (user.role === "CLIENT" && carrera.userId !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  return NextResponse.json(carrera);
}

/* PATCH /api/carreras/[id] → guarda la foto de fondo (multipart "photo"). */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const carrera = await getCarreraById(id);
  if (!carrera) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  if (carrera.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const form = await request.formData();
  const photoFile = form.get("photo") as File | null;
  if (!photoFile || photoFile.size === 0) {
    return NextResponse.json({ error: "Falta la foto" }, { status: 400 });
  }
  const buffer = Buffer.from(await photoFile.arrayBuffer());
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  const ext = path.extname(photoFile.name) || ".jpg";
  const filename = `run_${id}_${Date.now()}${ext}`;
  await fs.writeFile(path.join(uploadsDir, filename), buffer);
  const photoUrl = `/uploads/${filename}`;

  await setCarreraPhoto(id, photoUrl);
  return NextResponse.json({ ...carrera, photoUrl });
}

/* DELETE /api/carreras/[id] → elimina una carrera propia. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const carrera = await getCarreraById(id);
  if (!carrera) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  if (carrera.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  await deleteCarrera(id);
  return NextResponse.json({ ok: true });
}
