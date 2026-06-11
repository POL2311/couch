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
   Capa de datos — Prisma + PostgreSQL (Neon)
   Mantiene las firmas previas para compatibilidad
   con las API routes existentes.
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
      id: m.id,
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
  if (!s) return null;
  const detail = toDetail(s);
  // Resuelve los nombres de ejercicios desde el catálogo del coach (referencia).
  if (s.coachId && detail.routine?.days) {
    const catalog = await prisma.ejercicio.findMany({ where: { coachId: s.coachId } });
    detail.routine.days = resolveDays(detail.routine.days, catalog);
  }
  return detail;
}

/** Rellena nombre/grupo/peso-corporal de cada ejercicio desde el catálogo,
 *  usando ejercicioId. Mantiene compatibilidad con rutinas antiguas (por name). */
export function resolveDays(days: any[], catalog: any[]): any[] {
  const byId = new Map(catalog.map((e) => [e.id, e]));
  return (days || []).map((d) => ({
    ...d,
    exercises: (d.exercises || []).map((ex: any) => {
      const cat = ex.ejercicioId ? byId.get(ex.ejercicioId) : null;
      return {
        ejercicioId: ex.ejercicioId ?? null,
        name: cat?.name ?? ex.name ?? "Ejercicio",
        muscleGroup: cat?.muscleGroup ?? ex.muscleGroup ?? "",
        bodyweight: cat?.bodyweight ?? ex.bodyweight ?? false,
        sets: ex.sets ?? 3,
        reps: ex.reps ?? "10",
        weight: ex.weight ?? "",
        rest: ex.rest ?? "60s",
      };
    }),
  }));
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
    macroOverrides?: { protein?: number; carbs?: number; fat?: number; calories?: number };
    routineSettings?: { splitBlock?: string; phaseWeek?: number; phaseTotalWeeks?: number; trackRpe?: boolean; weightLimits?: boolean };
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
      if (dietTemplate) {
        const dietData: any = stripTemplate(dietTemplate);
        if (changeData.macroOverrides) {
          const mo = changeData.macroOverrides;
          if (!dietData.macros) dietData.macros = {};
          if (mo.protein  != null) dietData.macros.protein  = mo.protein;
          if (mo.carbs    != null) dietData.macros.carbs    = mo.carbs;
          if (mo.fat      != null) dietData.macros.fat      = mo.fat;
          if (mo.calories != null) dietData.totalCalories   = mo.calories;
        }
        data.dietJson = JSON.stringify(dietData);
      } else if (changeData.macroOverrides && student.dietJson) {
        try {
          const existing: any = JSON.parse(student.dietJson);
          const mo = changeData.macroOverrides;
          if (!existing.macros) existing.macros = {};
          if (mo.protein  != null) existing.macros.protein  = mo.protein;
          if (mo.carbs    != null) existing.macros.carbs    = mo.carbs;
          if (mo.fat      != null) existing.macros.fat      = mo.fat;
          if (mo.calories != null) existing.totalCalories   = mo.calories;
          data.dietJson = JSON.stringify(existing);
        } catch { /* leave as-is */ }
      }
      if (routineTemplate) {
        const routineData: any = stripTemplate(routineTemplate);
        if (changeData.routineSettings) {
          Object.assign(routineData, changeData.routineSettings);
        }
        data.routineJson = JSON.stringify(routineData);
      } else if (changeData.routineSettings && student.routineJson) {
        try {
          const existing: any = JSON.parse(student.routineJson);
          Object.assign(existing, changeData.routineSettings);
          data.routineJson = JSON.stringify(existing);
        } catch { /* leave as-is */ }
      }
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

  // Cataloga ejercicios por coach (una sola lectura por coach) para resolver nombres.
  const routineCoachIds = [...new Set(rows.filter((r) => r.type === "routine" && r.coachId).map((r) => r.coachId as string))];
  const catalogs: Record<string, any[]> = {};
  for (const cid of routineCoachIds) {
    catalogs[cid] = await prisma.ejercicio.findMany({ where: { coachId: cid } });
  }

  return rows.map((t) => {
    const tpl = toTemplate(t);
    if (tpl.type === "routine" && Array.isArray((tpl as any).days) && t.coachId && catalogs[t.coachId]) {
      (tpl as any).days = resolveDays((tpl as any).days, catalogs[t.coachId]);
    }
    return tpl;
  });
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

/* ═══════════════════════════════════════════
   Registro de ejecución del alumno (ExerciseLog)
   ═══════════════════════════════════════════ */

export interface SetEntry { reps: string; weight: string; done: boolean }
export interface ExerciseLogDTO {
  id: string;
  date: string;
  ejercicioId: string | null;
  exerciseName: string;
  muscleGroup: string | null;
  bodyweight: boolean;
  prescribedSets: number;
  prescribedReps: string;
  prescribedWeight: string | null;
  sets: SetEntry[];
  completed: boolean;
  createdAt: string;
}

function toLog(l: any): ExerciseLogDTO {
  let sets: SetEntry[] = [];
  try { sets = JSON.parse(l.setsJson); } catch { sets = []; }
  return {
    id: l.id, date: l.date, ejercicioId: l.ejercicioId, exerciseName: l.exerciseName,
    muscleGroup: l.muscleGroup, bodyweight: l.bodyweight,
    prescribedSets: l.prescribedSets, prescribedReps: l.prescribedReps, prescribedWeight: l.prescribedWeight,
    sets, completed: l.completed,
    createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : String(l.createdAt),
  };
}

export async function addExerciseLog(studentId: string, data: {
  date: string; ejercicioId?: string | null; exerciseName: string; muscleGroup?: string | null;
  bodyweight?: boolean; prescribedSets?: number; prescribedReps?: string; prescribedWeight?: string | null;
  sets: SetEntry[]; completed?: boolean;
}): Promise<ExerciseLogDTO> {
  const created = await prisma.exerciseLog.create({
    data: {
      studentId, date: data.date, ejercicioId: data.ejercicioId ?? null, exerciseName: data.exerciseName,
      muscleGroup: data.muscleGroup ?? null, bodyweight: !!data.bodyweight,
      prescribedSets: data.prescribedSets ?? 0, prescribedReps: data.prescribedReps ?? "",
      prescribedWeight: data.prescribedWeight ?? null,
      setsJson: JSON.stringify(data.sets ?? []), completed: !!data.completed,
    },
  });
  return toLog(created);
}

export async function getExerciseLogs(studentId: string): Promise<ExerciseLogDTO[]> {
  const rows = await prisma.exerciseLog.findMany({
    where: { studentId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(toLog);
}

/* ═══════════════════════════════════════════
   Catálogo de ejercicios recurrentes (por coach)
   ═══════════════════════════════════════════ */

export interface EjercicioDTO {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  bodyweight: boolean;
}

function toEjercicio(e: any): EjercicioDTO {
  return { id: e.id, name: e.name, muscleGroup: e.muscleGroup, equipment: e.equipment, bodyweight: e.bodyweight };
}

/** Lista de ejercicios: COACH ve los suyos; ADMIN ve todos. */
export async function getEjercicios(coachId?: string): Promise<EjercicioDTO[]> {
  const rows = await prisma.ejercicio.findMany({
    where: coachId ? { coachId } : undefined,
    orderBy: { name: "asc" },
  });
  return rows.map(toEjercicio);
}

export async function getEjercicioById(id: string): Promise<(EjercicioDTO & { coachId: string }) | null> {
  const e = await prisma.ejercicio.findUnique({ where: { id } });
  return e ? { ...toEjercicio(e), coachId: e.coachId } : null;
}

export async function addEjercicio(
  coachId: string,
  data: { name: string; muscleGroup: string; equipment: string; bodyweight: boolean }
): Promise<EjercicioDTO> {
  const created = await prisma.ejercicio.create({ data: { coachId, ...data } });
  return toEjercicio(created);
}

export async function updateEjercicio(
  id: string,
  data: { name: string; muscleGroup: string; equipment: string; bodyweight: boolean }
): Promise<EjercicioDTO> {
  const updated = await prisma.ejercicio.update({ where: { id }, data });
  return toEjercicio(updated);
}

export async function deleteEjercicio(id: string): Promise<void> {
  await prisma.ejercicio.delete({ where: { id } });
}

/* ═══════════════════════════════════════════
   Cumplimiento diario (checks de dieta/rutina)
   ═══════════════════════════════════════════ */

/** Devuelve los ítems marcados de un alumno en una fecha, como "kind:itemKey". */
export async function getDailyChecks(studentId: string, date: string): Promise<string[]> {
  const rows = await prisma.dailyCheck.findMany({ where: { studentId, date } });
  return rows.map((r) => `${r.kind}:${r.itemKey}`);
}

/** Todos los checks de un alumno (para que el coach calcule cumplimiento). */
export async function getDailyChecksAll(studentId: string): Promise<{ date: string; kind: string; itemKey: string }[]> {
  const rows = await prisma.dailyCheck.findMany({ where: { studentId }, orderBy: { date: "desc" } });
  return rows.map((r) => ({ date: r.date, kind: r.kind, itemKey: r.itemKey }));
}

/** Marca o desmarca un ítem (idempotente). */
export async function setDailyCheck(
  studentId: string,
  date: string,
  kind: string,
  itemKey: string,
  done: boolean
): Promise<void> {
  if (done) {
    await prisma.dailyCheck.upsert({
      where: { studentId_date_kind_itemKey: { studentId, date, kind, itemKey } },
      create: { studentId, date, kind, itemKey },
      update: {},
    });
  } else {
    await prisma.dailyCheck.deleteMany({ where: { studentId, date, kind, itemKey } });
  }
}

/* ═══════════════════════════════════════════
   Carreras (módulo Strava) — capa de datos
   ═══════════════════════════════════════════ */

export interface GpsPoint {
  lat: number;
  lng: number;
  t: number;
}

export interface CarreraDTO {
  id: string;
  userId: string;
  date: string;
  distanceM: number;
  durationS: number;
  avgSpeedKmh: number;
  track: GpsPoint[];
  photoUrl: string | null;
}

function toCarrera(c: any): CarreraDTO {
  let track: GpsPoint[] = [];
  try {
    track = JSON.parse(c.trackJson);
  } catch {
    track = [];
  }
  return {
    id: c.id,
    userId: c.userId,
    date: c.date,
    distanceM: c.distanceM,
    durationS: c.durationS,
    avgSpeedKmh: c.avgSpeedKmh,
    track,
    photoUrl: c.photoUrl ?? null,
  };
}

export async function setCarreraPhoto(id: string, photoUrl: string): Promise<void> {
  await prisma.carrera.update({ where: { id }, data: { photoUrl } });
}

export async function getCarreraOwner(id: string): Promise<string | null> {
  const c = await prisma.carrera.findUnique({ where: { id }, select: { userId: true } });
  return c?.userId ?? null;
}

/** Carreras visibles para un usuario según su rol:
 *  CLIENT → las suyas · COACH → las de sus alumnos · ADMIN → todas. */
export async function getCarrerasFor(user: {
  id: string;
  role: "ADMIN" | "COACH" | "CLIENT";
  coachId?: string | null;
}): Promise<CarreraDTO[]> {
  let where: any;
  if (user.role === "CLIENT") {
    where = { userId: user.id };
  } else if (user.role === "COACH") {
    const students = await prisma.student.findMany({
      where: { coachId: user.coachId ?? undefined },
      select: { userId: true },
    });
    const userIds = students.map((s) => s.userId).filter(Boolean) as string[];
    where = { userId: { in: userIds } };
  } else {
    where = undefined; // ADMIN
  }
  const rows = await prisma.carrera.findMany({ where, orderBy: { date: "desc" } });
  return rows.map(toCarrera);
}

export async function getCarreraById(id: string): Promise<CarreraDTO | null> {
  const c = await prisma.carrera.findUnique({ where: { id } });
  return c ? toCarrera(c) : null;
}

/** Carreras (MD-Route) de un alumno concreto, por su studentId. */
export async function getCarrerasByStudent(studentId: string): Promise<CarreraDTO[]> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { userId: true },
  });
  if (!student?.userId) return [];
  const rows = await prisma.carrera.findMany({
    where: { userId: student.userId },
    orderBy: { date: "desc" },
  });
  return rows.map(toCarrera);
}

export async function addCarrera(
  userId: string,
  input: { date: string; distanceM: number; durationS: number; avgSpeedKmh: number; track: GpsPoint[] }
): Promise<CarreraDTO> {
  const created = await prisma.carrera.create({
    data: {
      userId,
      date: input.date,
      distanceM: input.distanceM,
      durationS: Math.round(input.durationS),
      avgSpeedKmh: input.avgSpeedKmh,
      trackJson: JSON.stringify(input.track ?? []),
    },
  });
  return toCarrera(created);
}

export async function deleteCarrera(id: string): Promise<void> {
  await prisma.carrera.delete({ where: { id } });
}
