import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { getStudentById, getStudentDetail } from "@/lib/db";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ── Normalisers ───────────────────────────────────────────────────────────────

/**
 * The DB stores meals with flat protein/carbs/fat fields.
 * Mobile expects them nested under `macros: { protein, carbs, fat }`.
 * We support both shapes so older/newer diet templates all work.
 */
function normaliseMeals(meals: any[]): any[] {
  if (!Array.isArray(meals)) return [];
  return meals.map((m) => ({
    name:     m.name     ?? "",
    time:     m.time     ?? "",
    calories: m.calories ?? 0,
    items:    Array.isArray(m.items) ? m.items : [],
    macros: {
      protein: m.macros?.protein ?? m.protein ?? 0,
      carbs:   m.macros?.carbs   ?? m.carbs   ?? 0,
      fat:     m.macros?.fat     ?? m.fat     ?? 0,
    },
  }));
}

function normaliseRoutineDays(days: any[]): any[] {
  if (!Array.isArray(days)) return [];
  return days.map((d) => ({
    label:     d.label     ?? d.day ?? "DÍA",
    focus:     d.focus     ?? d.muscleGroup ?? undefined,
    dayIndex:  d.dayIndex  ?? undefined,
    exercises: Array.isArray(d.exercises) ? d.exercises.map((ex: any) => ({
      name:        ex.name        ?? "Ejercicio",
      sets:        ex.sets        ?? 3,
      reps:        String(ex.reps ?? "10"),
      muscleGroup: ex.muscleGroup ?? ex.focus ?? undefined,
      tips:        Array.isArray(ex.tips) ? ex.tips : undefined,
    })) : [],
  }));
}

// ── Route handler ─────────────────────────────────────────────────────────────

/**
 * GET /api/mobile/portal
 * Returns `{ student, detail }` for the authenticated CLIENT.
 * Normalises meal macros and routine day shapes for mobile consumption.
 */
export async function GET(request: NextRequest) {
  const user = await verifyMobileToken(request.headers.get("authorization"));
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json({ error: "Sin ficha de alumno" }, { status: 403 });
  }

  // isActive gate — mirrors the /api/me rule exactly.
  const live = await prisma.student.findUnique({
    where:  { id: user.studentId },
    select: { isActive: true },
  });
  if (!live) {
    return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });
  }
  if (live.isActive === false) {
    return NextResponse.json({ error: "ACCOUNT_BLOCKED" }, { status: 403 });
  }

  const [rawStudent, rawDetail] = await Promise.all([
    getStudentById(user.studentId),
    getStudentDetail(user.studentId),
  ]);

  if (!rawStudent || !rawDetail) {
    return NextResponse.json({ error: "Datos no encontrados" }, { status: 404 });
  }

  // Pick only the fields the mobile Student interface expects.
  const student = {
    id:            rawStudent.id,
    name:          rawStudent.name,
    email:         rawStudent.email,
    currentWeight: rawStudent.currentWeight ?? 0,
    streak:        rawStudent.streak        ?? 0,
    stage:         rawStudent.stage         ?? "",
    stageNumber:   rawStudent.stageNumber   ?? 1,
    prSquat:       rawStudent.prSquat       ?? 0,
    prDeadlift:    rawStudent.prDeadlift    ?? 0,
    prBench:       rawStudent.prBench       ?? 0,
  };

  // Shape the detail, normalising meals and routine days.
  const detail = {
    height:  rawDetail.height  ?? null,
    bodyFat: rawDetail.bodyFat ?? null,
    routine: {
      name:        rawDetail.routine?.name        ?? "Rutina sin asignar",
      daysPerWeek: rawDetail.routine?.daysPerWeek ?? 0,
      days:        normaliseRoutineDays(rawDetail.routine?.days ?? []),
    },
    diet: {
      name:          rawDetail.diet?.name          ?? "Plan nutricional",
      totalCalories: rawDetail.diet?.totalCalories ?? 0,
      macros:        rawDetail.diet?.macros        ?? { protein: 0, carbs: 0, fat: 0 },
      meals:         normaliseMeals(rawDetail.diet?.meals ?? []),
    },
    weightHistory: (rawDetail.weightHistory ?? []).map((w: any) => ({
      date:   w.date,
      weight: w.weight,
    })),
    measurements: rawDetail.measurements ?? [],
  };

  return NextResponse.json({ student, detail });
}
