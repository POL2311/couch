import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { addWaterLog, getTodayWaterTotal } from "@/lib/db";

/**
 * Resolves the studentId for the request.
 * CLIENT  → always uses session.studentId
 * COACH   → requires explicit ?studentId= param (GET) or body.studentId (POST)
 */
function resolveStudentId(user: { role: string; studentId?: string | null }, fromRequest?: string | null): string | null {
  if (user.role === "CLIENT") return user.studentId ?? null;
  if (user.role === "COACH")  return fromRequest ?? null;
  return null;
}

/**
 * GET /api/student/water?date=YYYY-MM-DD[&studentId=xxx]
 * Returns { totalMl } for the given date (defaults to today).
 * CLIENT uses session studentId; COACH must pass ?studentId= explicitly.
 */
export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "CLIENT" && user.role !== "COACH")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const params  = new URL(request.url).searchParams;
  const studentId = resolveStudentId(user, params.get("studentId"));
  if (!studentId) {
    return NextResponse.json({ error: "studentId requerido" }, { status: 400 });
  }
  const date = params.get("date") ?? new Date().toISOString().split("T")[0];
  const totalMl = await getTodayWaterTotal(studentId, date);
  return NextResponse.json({ totalMl });
}

/**
 * POST /api/student/water
 * Body: { amountMl: number, date?: string, studentId?: string }
 * Adds a water log entry; returns { totalMl } for that day.
 * CLIENT uses session studentId; COACH must pass body.studentId explicitly.
 */
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "CLIENT" && user.role !== "COACH")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const b = await request.json();
  const studentId = resolveStudentId(user, b?.studentId);
  if (!studentId) {
    return NextResponse.json({ error: "studentId requerido" }, { status: 400 });
  }
  const amountMl = typeof b?.amountMl === "number" ? b.amountMl : parseInt(b?.amountMl);
  if (!amountMl || amountMl <= 0) {
    return NextResponse.json({ error: "amountMl requerido y > 0" }, { status: 400 });
  }
  const date = b.date ?? new Date().toISOString().split("T")[0];
  await addWaterLog(studentId, amountMl, date);
  const totalMl = await getTodayWaterTotal(studentId, date);
  return NextResponse.json({ totalMl }, { status: 201 });
}
