import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

const LIFT_FIELD: Record<string, "prSquat" | "prDeadlift" | "prBench"> = {
  squat:    "prSquat",
  deadlift: "prDeadlift",
  bench:    "prBench",
};

/**
 * PATCH /api/me/prs
 * Body: { lift: "squat" | "deadlift" | "bench", kg: number }
 * Updates the named PR column only when the new value exceeds the stored one.
 * Returns: { prSquat, prDeadlift, prBench }
 */
export async function PATCH(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: NO_STORE });
  }

  const b = await request.json();
  const field = LIFT_FIELD[b?.lift];
  const kg    = typeof b?.kg === "number" ? b.kg : parseFloat(b?.kg);

  if (!field || !kg || kg <= 0) {
    return NextResponse.json({ error: "lift y kg (> 0) son requeridos" }, { status: 400, headers: NO_STORE });
  }

  const current = await prisma.student.findUnique({
    where:  { id: user.studentId },
    select: { prSquat: true, prDeadlift: true, prBench: true },
  });

  if (!current) {
    return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404, headers: NO_STORE });
  }

  if (kg <= current[field]) {
    return NextResponse.json(current, { headers: NO_STORE });
  }

  const updated = await prisma.student.update({
    where:  { id: user.studentId },
    data:   { [field]: kg },
    select: { prSquat: true, prDeadlift: true, prBench: true },
  });

  return NextResponse.json(updated, { headers: NO_STORE });
}
