import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { addExerciseLog, getExerciseLogs, upsertExerciseLog } from "@/lib/db";

/* GET /api/me/logs → historial de ejecución del alumno autenticado. */
export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  return NextResponse.json(await getExerciseLogs(user.studentId));
}

/* POST /api/me/logs → el alumno registra un ejercicio ejecutado (serie por serie). */
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const b = await request.json();
  if (!b?.exerciseName) {
    return NextResponse.json({ error: "Falta el ejercicio" }, { status: 400 });
  }
  const log = await addExerciseLog(user.studentId, {
    date: b.date || new Date().toISOString().split("T")[0],
    ejercicioId: b.ejercicioId ?? null,
    exerciseName: b.exerciseName,
    muscleGroup: b.muscleGroup ?? null,
    bodyweight: !!b.bodyweight,
    prescribedSets: b.prescribedSets ?? 0,
    prescribedReps: b.prescribedReps ?? "",
    prescribedWeight: b.prescribedWeight ?? null,
    sets: Array.isArray(b.sets) ? b.sets : [],
    completed: !!b.completed,
  });
  return NextResponse.json(log, { status: 201 });
}

/* PATCH /api/me/logs → upsert today's log for an exercise (set-level persistence). */
export async function PATCH(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const b = await request.json();
  if (!b?.exerciseName) {
    return NextResponse.json({ error: "Falta el ejercicio" }, { status: 400 });
  }
  const log = await upsertExerciseLog(user.studentId, {
    date:             b.date || new Date().toISOString().split("T")[0],
    exerciseName:     b.exerciseName,
    muscleGroup:      b.muscleGroup ?? null,
    bodyweight:       !!b.bodyweight,
    prescribedSets:   b.prescribedSets ?? 0,
    prescribedReps:   String(b.prescribedReps ?? ""),
    prescribedWeight: b.prescribedWeight ?? null,
    sets:             Array.isArray(b.sets) ? b.sets : [],
    completed:        b.completed ?? undefined,
  });
  return NextResponse.json(log);
}
