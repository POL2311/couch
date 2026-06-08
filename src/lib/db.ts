import { prisma } from "./prisma";
import {
  type Student,
  type StudentDetail,
  type Meal,
  type RoutineDay,
  type BodyMeasurements,
  type WeightEntry,
} from "./mock-data";

/* ═══════════════════════════════════════════
   Capa de datos — Prisma + SQLite
   Mantiene las firmas previas (JSON/db.ts) para
   compatibilidad con las API routes existentes y
   añade operaciones para las nuevas funcionalidades.
   ═══════════════════════════════════════════ */

export interface ScheduledChange {
  executionDate: string;
  stage: any;
  stageNumber: number;
  dietTemplateId?: string;
  routineTemplateId?: string;
}

export type FullStudentDetail = StudentDetail & {
  height?: number;
  bodyFat?: number;
  photoName?: string;
  scheduledChange?: ScheduledChange | null;
  photos?: { id: string; url: string; label: string; weight: number | null; createdAt: string }[];
};

const EMPTY_DIET = {
  name: "Dieta no asignada",
  totalCalories: 0,
  macros: { protein: 0, carbs: 0, fat: 0 },
  meals: [] as Meal[],
};
const EMPTY_ROUTINE = { name: "Rutina no asignada", daysPerWeek: 0, days: [] as RoutineDay[] };

function parseDiet(json: string) {
  if (!json) return EMPTY_DIET;
  try {
    return JSON.parse(json);
  } catch {
    return EMPTY_DIET;
  }
}
function parseRoutine(json: string) {
  if (!json) return EMPTY_ROUTINE;
  try {
    return JSON.parse(json);
  } catch {
    return EMPTY_ROUTINE;
  }
}

/* ── AutoCron: aplica cambios programados vencidos ── */
async function runAutoCron() {
  const todayStr = new Date().toISOString().split("T")[0];
  const due = await prisma.scheduledChange.findMany({
    where: { executionDate: { lte: todayStr } },
  });

  for (const change of due) {
    const studentUpdate: any = { stage: change.stage, stageNumber: change.stageNumber };

    if (change.dietTemplateId) {
      const t = await getTemplateById(change.dietTemplateId);
      if (t) studentUpdate.dietJson = JSON.stringify(stripTemplate(t));
    }
    if (change.routineTemplateId) {
      const t = await getTemplateById(change.routineTemplateId);
      if (t) studentUpdate.routineJson = JSON.stringify(stripTemplate(t));
    }

    await prisma.student.update({ where: { id: change.studentId }, data: studentUpdate });
    await prisma.scheduledChange.delete({ where: { id: change.id } });
    console.log(`[AutoCron] Cambio aplicado para alumno ${change.studentId}`);
  }
}

function stripTemplate(t: any) {
  // Devuelve la forma diet/routine sin id/type
  const { id, type, ...rest } = t;
  return rest;
}

/* ── Mapeo Prisma → tipos de la app ── */
function toStudent(s: any): Student & { scheduledChange?: ScheduledChange | null } {
  return {
    id: s.id,
    name: s.name,
    email: s.email,
    avatarInitials: s.avatarInitials,
    avatarColor: s.avatarColor,
    currentWeight: s.currentWeight,
    previousWeight: s.previousWeight,
    lastWeighIn: s.lastWeighIn,
    stage: s.stage,
    stageNumber: s.stageNumber,
    paymentStatus: s.paymentStatus,
    joinedDate: s.joinedDate,
    streak: s.streak,
    completionRate: s.completionRate,
    scheduledChange: s.scheduledChange
      ? {
          executionDate: s.scheduledChange.executionDate,
          stage: s.scheduledChange.stage,
          stageNumber: s.scheduledChange.stageNumber,
          dietTemplateId: s.scheduledChange.dietTemplateId || undefined,
          routineTemplateId: s.scheduledChange.routineTemplateId || undefined,
        }
      : null,
  } as any;
}

function toDetail(s: any): FullStudentDetail {
  return {
    weightHistory: (s.weightHistory || []).map((w: any) => ({ date: w.date, weight: w.weight })),
    diet: parseDiet(s.dietJson),
    routine: parseRoutine(s.routineJson),
    measurements: (s.measurements || []).map((m: any) => ({
      date: m.date,
      chest: m.chest,
      waist: m.waist,
      hips: m.hips,
      armL: m.armL,
      armR: m.armR,
      thighL: m.thighL,
      thighR: m.thighR,
    })),
    nextStageDate: s.nextStageDate ?? null,
    notes: s.notes ?? "",
    height: s.height ?? undefined,
    bodyFat: s.bodyFat ?? undefined,
    photoName: s.photoName ?? undefined,
    photos: (s.photos || []).map((p: any) => ({
      id: p.id,
      url: p.url,
      label: p.label,
      weight: p.weight,
      createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
    })),
    scheduledChange: s.scheduledChange
      ? {
          executionDate: s.scheduledChange.executionDate,
          stage: s.scheduledChange.stage,
          stageNumber: s.scheduledChange.stageNumber,
          dietTemplateId: s.scheduledChange.dietTemplateId || undefined,
          routineTemplateId: s.scheduledChange.routineTemplateId || undefined,
        }
      : null,
  };
}

/* ═══════════════════════════════════════════
   Alumnos
   ═══════════════════════════════════════════ */

export async function getStudents(coachId?: string): Promise<Student[]> {
  await runAutoCron();
  const students = await prisma.student.findMany({
    where: coachId ? { coachId } : undefined,
    include: { scheduledChange: true },
    orderBy: { createdAt: "desc" },
  });
  return students.map(toStudent);
}

export async function getStudentById(id: string): Promise<Student | null> {
  await runAutoCron();
  const s = await prisma.student.findUnique({ where: { id }, include: { scheduledChange: true } });
  return s ? toStudent(s) : null;
}

export async function getStudentDetail(id: string): Promise<FullStudentDetail | null> {
  await runAutoCron();
  const s = await prisma.student.findUnique({
    where: { id },
    include: {
      scheduledChange: true,
      weightHistory: { orderBy: { date: "asc" } },
      measurements: { orderBy: { date: "asc" } },
      photos: { orderBy: { createdAt: "desc" } },
    },
  });
  return s ? toDetail(s) : null;
}

export async function addStudent(
  student: Student,
  detail: FullStudentDetail,
  coachId?: string
): Promise<Student> {
  const created = await prisma.student.create({
    data: {
      name: student.name,
      email: student.email,
      avatarInitials: student.avatarInitials,
      avatarColor: student.avatarColor,
      currentWeight: student.currentWeight,
      previousWeight: student.previousWeight,
      lastWeighIn: student.lastWeighIn,
      stage: student.stage,
      stageNumber: student.stageNumber,
      paymentStatus: student.paymentStatus,
      joinedDate: student.joinedDate,
      streak: student.streak,
      completionRate: student.completionRate,
      height: detail.height ?? null,
      bodyFat: detail.bodyFat ?? null,
      photoName: detail.photoName ?? null,
      notes: detail.notes ?? "",
      nextStageDate: detail.nextStageDate ?? null,
      dietJson: detail.diet ? JSON.stringify(detail.diet) : "",
      routineJson: detail.routine ? JSON.stringify(detail.routine) : "",
      coachId: coachId ?? (await getDefaultCoachId()),
      weightHistory: {
        create: (detail.weightHistory || []).map((w) => ({ date: w.date, weight: w.weight })),
      },
      measurements: {
        create: (detail.measurements || []).map((m) => ({
          date: m.date,
          chest: m.chest,
          waist: m.waist,
          hips: m.hips,
          armL: m.armL,
          armR: m.armR,
          thighL: m.thighL,
          thighR: m.thighR,
        })),
      },
      photos: detail.photoName
        ? { create: [{ url: detail.photoName, label: "Foto inicial" }] }
        : undefined,
    },
    include: { scheduledChange: true },
  });
  return toStudent(created);
}

export async function updateStudent(
  id: string,
  studentUpdates: Partial<Student>,
  detailUpdates: Partial<FullStudentDetail>
): Promise<void> {
  const data: any = {};

  // Campos escalares del alumno
  const scalarKeys: (keyof Student)[] = [
    "name",
    "email",
    "currentWeight",
    "previousWeight",
    "lastWeighIn",
    "stage",
    "stageNumber",
    "paymentStatus",
    "joinedDate",
    "streak",
    "completionRate",
    "avatarInitials",
    "avatarColor",
  ];
  for (const k of scalarKeys) {
    if (studentUpdates[k] !== undefined) data[k] = studentUpdates[k];
  }

  // Campos del detalle
  if (detailUpdates.height !== undefined) data.height = detailUpdates.height;
  if (detailUpdates.bodyFat !== undefined) data.bodyFat = detailUpdates.bodyFat;
  if (detailUpdates.photoName !== undefined) data.photoName = detailUpdates.photoName;
  if (detailUpdates.notes !== undefined) data.notes = detailUpdates.notes;
  if (detailUpdates.nextStageDate !== undefined) data.nextStageDate = detailUpdates.nextStageDate;
  if (detailUpdates.diet !== undefined) data.dietJson = JSON.stringify(detailUpdates.diet);
  if (detailUpdates.routine !== undefined) data.routineJson = JSON.stringify(detailUpdates.routine);

  if (Object.keys(data).length > 0) {
    await prisma.student.update({ where: { id }, data });
  }

  // Historial de peso (reemplazo completo)
  if (detailUpdates.weightHistory !== undefined) {
    await prisma.weightEntry.deleteMany({ where: { studentId: id } });
    await prisma.weightEntry.createMany({
      data: detailUpdates.weightHistory.map((w) => ({ studentId: id, date: w.date, weight: w.weight })),
    });
  }

  // Medidas (reemplazo completo)
  if (detailUpdates.measurements !== undefined) {
    await prisma.measurement.deleteMany({ where: { studentId: id } });
    for (const m of detailUpdates.measurements) {
      await prisma.measurement.create({
        data: {
          studentId: id,
          date: m.date,
          chest: m.chest,
          waist: m.waist,
          hips: m.hips,
          armL: m.armL,
          armR: m.armR,
          thighL: m.thighL,
          thighR: m.thighR,
        },
      });
    }
  }

  // Cambio programado (upsert / borrado)
  if (detailUpdates.scheduledChange !== undefined) {
    if (detailUpdates.scheduledChange === null) {
      await prisma.scheduledChange.deleteMany({ where: { studentId: id } });
    } else {
      const sc = detailUpdates.scheduledChange;
      await prisma.scheduledChange.upsert({
        where: { studentId: id },
        create: {
          studentId: id,
          executionDate: sc.executionDate,
          stage: sc.stage,
          stageNumber: sc.stageNumber,
          dietTemplateId: sc.dietTemplateId ?? null,
          routineTemplateId: sc.routineTemplateId ?? null,
        },
        update: {
          executionDate: sc.executionDate,
          stage: sc.stage,
          stageNumber: sc.stageNumber,
          dietTemplateId: sc.dietTemplateId ?? null,
          routineTemplateId: sc.routineTemplateId ?? null,
        },
      });
    }
  }
}

/* ── Registro fotográfico (módulo 1) ── */
export async function addProgressPhoto(
  studentId: string,
  photo: { url: string; label?: string; weight?: number | null }
): Promise<void> {
  await prisma.progressPhoto.create({
    data: {
      studentId,
      url: photo.url,
      label: photo.label ?? "",
      weight: photo.weight ?? null,
    },
  });
  // Si el alumno no tenía foto principal, fijar ésta como portada.
  const s = await prisma.student.findUnique({ where: { id: studentId } });
  if (s && !s.photoName) {
    await prisma.student.update({ where: { id: studentId }, data: { photoName: photo.url } });
  }
}

export async function deleteProgressPhoto(photoId: string): Promise<void> {
  await prisma.progressPhoto.delete({ where: { id: photoId } });
}

/* ── Cambio de etapa masivo / programado (módulo 3) ── */
export async function applyStageChange(
  studentIds: string[],
  changeData: {
    stage: any;
    stageNumber: number;
    dietTemplateId?: string;
    routineTemplateId?: string;
    executionDate?: string;
  }
): Promise<void> {
  const todayStr = new Date().toISOString().split("T")[0];
  const targetDate = changeData.executionDate || todayStr;

  const dietTemplate = changeData.dietTemplateId ? await getTemplateById(changeData.dietTemplateId) : null;
  const routineTemplate = changeData.routineTemplateId
    ? await getTemplateById(changeData.routineTemplateId)
    : null;

  for (const id of studentIds) {
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) continue;

    if (targetDate <= todayStr) {
      // Aplicación inmediata
      const data: any = { stage: changeData.stage, stageNumber: changeData.stageNumber };
      if (dietTemplate) data.dietJson = JSON.stringify(stripTemplate(dietTemplate));
      if (routineTemplate) data.routineJson = JSON.stringify(stripTemplate(routineTemplate));
      await prisma.student.update({ where: { id }, data });
      await prisma.scheduledChange.deleteMany({ where: { studentId: id } });
    } else {
      // Programar a futuro
      await prisma.scheduledChange.upsert({
        where: { studentId: id },
        create: {
          studentId: id,
          executionDate: targetDate,
          stage: changeData.stage,
          stageNumber: changeData.stageNumber,
          dietTemplateId: changeData.dietTemplateId ?? null,
          routineTemplateId: changeData.routineTemplateId ?? null,
        },
        update: {
          executionDate: targetDate,
          stage: changeData.stage,
          stageNumber: changeData.stageNumber,
          dietTemplateId: changeData.dietTemplateId ?? null,
          routineTemplateId: changeData.routineTemplateId ?? null,
        },
      });
    }
  }
}

export async function deleteStudents(ids: string[]): Promise<void> {
  await prisma.student.deleteMany({ where: { id: { in: ids } } });
}

/* ═══════════════════════════════════════════
   Plantillas dinámicas (módulo 4)
   ═══════════════════════════════════════════ */

export interface StoredTemplate {
  id: string;
  type: "diet" | "routine";
  name: string;
  [key: string]: any;
}

function toTemplate(t: any): StoredTemplate {
  const data = (() => {
    try {
      return JSON.parse(t.dataJson);
    } catch {
      return {};
    }
  })();
  return { id: t.id, type: t.type, name: t.name, ...data };
}

export async function getTemplates(type?: "diet" | "routine"): Promise<StoredTemplate[]> {
  const rows = await prisma.template.findMany({
    where: type ? { type } : undefined,
    orderBy: { createdAt: "asc" },
  });
  return rows.map(toTemplate);
}

export async function getTemplateById(id: string): Promise<StoredTemplate | null> {
  const t = await prisma.template.findUnique({ where: { id } });
  return t ? toTemplate(t) : null;
}

export async function addTemplate(
  type: "diet" | "routine",
  name: string,
  data: any,
  coachId?: string
): Promise<StoredTemplate> {
  const { id, type: _t, name: _n, ...payload } = data || {};
  const created = await prisma.template.create({
    data: { type, name, dataJson: JSON.stringify(payload), coachId: coachId ?? null },
  });
  return toTemplate(created);
}

export async function updateTemplate(id: string, name: string, data: any): Promise<StoredTemplate> {
  const { id: _i, type: _t, name: _n, ...payload } = data || {};
  const updated = await prisma.template.update({
    where: { id },
    data: { name, dataJson: JSON.stringify(payload) },
  });
  return toTemplate(updated);
}

export async function deleteTemplate(id: string): Promise<void> {
  await prisma.template.delete({ where: { id } });
}

/* ── Coach por defecto (single-tenant fallback durante desarrollo) ── */
async function getDefaultCoachId(): Promise<string | undefined> {
  const coach = await prisma.coach.findFirst();
  return coach?.id;
}

export { getDefaultCoachId };
