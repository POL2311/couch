import { NextRequest, NextResponse } from "next/server";
import { getStudentById, getStudentDetail, updateStudent } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const student = await getStudentById(id);
    const detail = await getStudentDetail(id);

    if (!student || !detail) {
      return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ student, detail });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const { studentUpdates = {}, detailUpdates = {} } = body;

    await updateStudent(id, studentUpdates, detailUpdates);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
