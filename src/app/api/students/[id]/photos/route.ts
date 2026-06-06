import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { addProgressPhoto, deleteProgressPhoto } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || (user.role !== "COACH" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const { id } = await params;

  const formData = await request.formData();
  const photoFile = formData.get("photo") as File | null;
  const label = (formData.get("label") as string) || "";
  const weightStr = formData.get("weight") as string;
  const weight = weightStr ? parseFloat(weightStr) : null;

  if (!photoFile || photoFile.size === 0) {
    return NextResponse.json({ error: "No se recibió ninguna imagen" }, { status: 400 });
  }

  const buffer = Buffer.from(await photoFile.arrayBuffer());
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  const ext = path.extname(photoFile.name) || ".png";
  const filename = `student_${id}_${Date.now()}${ext}`;
  await fs.writeFile(path.join(uploadsDir, filename), buffer);
  const url = `/uploads/${filename}`;

  await addProgressPhoto(id, { url, label, weight });
  return NextResponse.json({ url });
}

export async function DELETE(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "COACH" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const photoId = request.nextUrl.searchParams.get("photoId");
  if (!photoId) return NextResponse.json({ error: "photoId requerido" }, { status: 400 });
  await deleteProgressPhoto(photoId);
  return NextResponse.json({ success: true });
}
