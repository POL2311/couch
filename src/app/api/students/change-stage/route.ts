import { NextRequest, NextResponse } from "next/server";
import { applyStageChange } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "COACH" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const body = await request.json();
    const {
      studentIds,
      stage,
      stageNumber,
      dietTemplateId,
      routineTemplateId,
      executionDate,
      macroOverrides,
      routineSettings,
    } = body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: "IDs de alumnos inválidos o vacíos" }, { status: 400 });
    }

    if (!stage) {
      return NextResponse.json({ error: "Etapa objetivo es requerida" }, { status: 400 });
    }

    await applyStageChange(studentIds, {
      stage,
      stageNumber: parseInt(stageNumber) || 1,
      dietTemplateId: dietTemplateId || undefined,
      routineTemplateId: routineTemplateId || undefined,
      executionDate: executionDate || undefined,
      macroOverrides: macroOverrides || undefined,
      routineSettings: routineSettings || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in change-stage API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
