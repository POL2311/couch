import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getSessionUser } from "@/lib/session";
import { getStudentById, getStudentDetail, updateStudent, addProgressPhoto } from "@/lib/db";

/** Devuelve la ficha del alumno vinculado a la cuenta cliente. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json({ error: "Sin ficha de alumno asociada" }, { status: 404 });
  }
  const student = await getStudentById(user.studentId);
  const detail = await getStudentDetail(user.studentId);
  if (!student || !detail) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ student, detail });
}

/** Registro de progreso diario del alumno: peso + foto opcional. */
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const id = user.studentId;

  const contentType = request.headers.get("content-type") || "";
  let weight: number | undefined;
  let photoName: string | undefined;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const w = formData.get("weight") as string;
    weight = w ? parseFloat(w) : undefined;

    const photoFile = formData.get("photo") as File | null;
    if (photoFile && photoFile.size > 0) {
      const buffer = Buffer.from(await photoFile.arrayBuffer());
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });
      const ext = path.extname(photoFile.name) || ".png";
      const filename = `progress_${Date.now()}${ext}`;
      await fs.writeFile(path.join(uploadsDir, filename), buffer);
      photoName = `/uploads/${filename}`;
    }
  } else {
    const body = await request.json();
    weight = body.weight ? parseFloat(body.weight) : undefined;
  }

  const student = await getStudentById(id);
  const detail = await getStudentDetail(id);
  if (!student || !detail) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const today = new Date().toISOString().split("T")[0];

  if (weight && weight > 0) {
    const history = [...detail.weightHistory.filter((h) => h.date !== today), { date: today, weight }];
    history.sort((a, b) => a.date.localeCompare(b.date));
    await updateStudent(
      id,
      { previousWeight: student.currentWeight, currentWeight: weight, lastWeighIn: today },
      { weightHistory: history }
    );
  }

  if (photoName) {
    await addProgressPhoto(id, { url: photoName, label: "Progreso", weight: weight ?? null });
  }

  return NextResponse.json({ success: true });
}
