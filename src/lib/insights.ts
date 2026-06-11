/* ═══════════════════════════════════════════
   Cálculos derivados de la ficha del alumno (WEB).
   Funciones puras — mismas que la app (mobile/lib/insights.ts)
   para PARIDAD exacta web/iOS/Android.
   ═══════════════════════════════════════════ */

export type Check = { date: string; kind: string; itemKey: string };
export interface WeightEntry { date: string; weight: number }
export interface SetEntry {
  // Old wire format (string fields)
  reps?: string | number;
  weight?: string | number;
  done?: boolean;
  // New typed format
  setNumber?: number;
  targetReps?: number;
  actualReps?: number;
  completed?: boolean;
}
export interface ExerciseLog {
  id: string; date: string; ejercicioId?: string | null; exerciseName: string;
  muscleGroup?: string | null; bodyweight: boolean;
  prescribedSets: number; prescribedReps: string; prescribedWeight?: string | null;
  sets: SetEntry[]; completed: boolean; createdAt?: string;
}
export interface Carrera { id: string; date: string; distanceM: number; durationS: number; avgSpeedKmh: number; track: { lat: number; lng: number; t: number }[]; photoUrl?: string | null }
export interface Routine { name: string; daysPerWeek: number; days: { day: string; label: string; muscleGroup: string; exercises: any[] }[] }
export interface StudentDetail {
  weightHistory: WeightEntry[];
  diet: { name: string; totalCalories: number; macros: { protein: number; carbs: number; fat: number }; meals: { name: string; time: string; calories: number; items: string[] }[] };
  routine: Routine;
  measurements: any[];
  photos?: { id: string; url: string; label: string; weight: number | null; createdAt: string }[];
}

export const DAY_NAMES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function parse(d: string): Date { const [y, m, dd] = d.split("-").map(Number); return new Date(Date.UTC(y, m - 1, dd)); }
function fmt(date: Date): string { return date.toISOString().split("T")[0]; }
export function addDays(d: string, n: number): string { const x = parse(d); x.setUTCDate(x.getUTCDate() + n); return fmt(x); }
export function daysBetween(a: string, b: string): number { return Math.round((parse(b).getTime() - parse(a).getTime()) / 86400000); }
export function dowMon0(d: string): number { return (parse(d).getUTCDay() + 6) % 7; }
export function weekStartOf(d: string): string { return addDays(d, -dowMon0(d)); }
export function weekDays(weekStart: string): string[] { return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)); }
export function todayStr(): string { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`; }
export function fmtShort(d: string): string { return d.slice(5); }
export function prettyDate(d: string): string {
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const [, m, dd] = d.split("-").map(Number);
  return `${DAY_NAMES[dowMon0(d)]} ${dd} ${meses[m - 1]}`;
}

export function weightProgress(wh: WeightEntry[]): { start: number; current: number; delta: number } {
  if (!wh.length) return { start: 0, current: 0, delta: 0 };
  const start = wh[0].weight, current = wh[wh.length - 1].weight;
  return { start, current, delta: Math.round((current - start) * 10) / 10 };
}
export function weightInRange(wh: WeightEntry[], months: number): WeightEntry[] {
  if (!wh.length || months === 0) return wh;
  const start = addDays(wh[wh.length - 1].date, -months * 30);
  return wh.filter((w) => w.date >= start);
}

export function trainingDoneDates(logs: ExerciseLog[]): Set<string> { return new Set(logs.map((l) => l.date)); }
export type DayStatus = { date: string; dayName: string; status: "done" | "missed" | "rest" };
export function weekTraining(logs: ExerciseLog[], routine: Routine, weekStart: string): { done: number; planned: number; byDay: DayStatus[] } {
  const trained = trainingDoneDates(logs);
  const today = todayStr();
  const programmed = new Set((routine?.days ?? []).map((d) => (d.day || "").trim().toLowerCase()));
  const byDay: DayStatus[] = weekDays(weekStart).map((date, i) => {
    const dayName = DAY_NAMES[i];
    const isProgrammed = programmed.has(dayName.toLowerCase());
    const status: DayStatus["status"] = trained.has(date) ? "done" : date > today ? "rest" : isProgrammed ? "missed" : "rest";
    return { date, dayName, status };
  });
  const done = byDay.filter((b) => b.status === "done").length;
  const planned = routine?.daysPerWeek || byDay.filter((b) => b.status !== "rest").length;
  return { done, planned, byDay };
}
export function trainingLastDays(logs: ExerciseLog[], routine: Routine, ref: string, n = 7): { done: number; planned: number } {
  const start = addDays(ref, -(n - 1));
  const dates = new Set(logs.filter((l) => l.date >= start && l.date <= ref).map((l) => l.date));
  return { done: dates.size, planned: routine?.daysPerWeek || n };
}
function safeWeight(w: string | number | null | undefined): number {
  if (typeof w === "number") return isNaN(w) ? 0 : w;
  return parseFloat((String(w ?? "")).replace(/[^\d.]/g, "")) || 0;
}
function safeReps(s: SetEntry): number {
  const r = s.actualReps ?? s.reps;
  if (typeof r === "number") return isNaN(r) ? 0 : r;
  return parseFloat(String(r ?? "0")) || 0;
}

export function maxWeight(log: ExerciseLog): number {
  let mx = 0;
  for (const s of log.sets) { const w = safeWeight(s.weight); if (w > 0) mx = Math.max(mx, w); }
  return mx;
}
export function records(logs: ExerciseLog[]): { name: string; weight: number }[] {
  const best: Record<string, number> = {};
  for (const l of logs) for (const s of l.sets) { const w = safeWeight(s.weight); if (w > 0) best[l.exerciseName] = Math.max(best[l.exerciseName] ?? 0, w); }
  return Object.entries(best).map(([name, weight]) => ({ name, weight })).sort((a, b) => b.weight - a.weight);
}
export function sessionVolume(logs: ExerciseLog[]): number {
  let v = 0;
  for (const l of logs) for (const s of l.sets) { v += safeReps(s) * safeWeight(s.weight); }
  return Math.round(v);
}
export function volumeByDate(logs: ExerciseLog[]): { date: string; volume: number }[] {
  const byDate: Record<string, number> = {};
  for (const l of logs) byDate[l.date] = (byDate[l.date] ?? 0) + sessionVolume([l]);
  return Object.entries(byDate).map(([date, volume]) => ({ date, volume })).sort((a, b) => a.date.localeCompare(b.date));
}
export function byExercise(logs: ExerciseLog[]): { name: string; muscleGroup: string | null; bodyweight: boolean; sessions: ExerciseLog[] }[] {
  const map: Record<string, ExerciseLog[]> = {};
  for (const l of logs) (map[l.exerciseName] ??= []).push(l);
  return Object.entries(map).map(([name, ls]) => ({ name, muscleGroup: ls[0].muscleGroup ?? null, bodyweight: ls[0].bodyweight, sessions: ls.sort((a, b) => a.date.localeCompare(b.date)) })).sort((a, b) => b.sessions.length - a.sessions.length);
}

export function dietForDate(checks: Check[], detail: StudentDetail, date: string): { done: number; total: number } {
  const total = detail.diet?.meals?.length ?? 0;
  const done = checks.filter((c) => c.kind === "meal" && c.date === date).length;
  return { done: Math.min(done, total), total };
}
export function dietComplianceByDate(checks: Check[], detail: StudentDetail): { date: string; done: number; total: number }[] {
  const total = detail.diet?.meals?.length ?? 0;
  const byDate: Record<string, number> = {};
  for (const c of checks) if (c.kind === "meal") byDate[c.date] = (byDate[c.date] ?? 0) + 1;
  return Object.entries(byDate).map(([date, done]) => ({ date, done: Math.min(done, total), total })).sort((a, b) => a.date.localeCompare(b.date));
}
export function mealsDoneOn(checks: Check[], date: string): string[] { return checks.filter((c) => c.kind === "meal" && c.date === date).map((c) => c.itemKey); }
export function lastDietDate(checks: Check[]): string { const ds = checks.filter((c) => c.kind === "meal").map((c) => c.date).sort(); return ds.length ? ds[ds.length - 1] : todayStr(); }
export function dietComplianceRecent(checks: Check[], detail: StudentDetail): { pct: number; days: number } {
  const total = detail.diet?.meals?.length ?? 0;
  if (!total) return { pct: 0, days: 0 };
  const byDate: Record<string, number> = {};
  for (const c of checks) if (c.kind === "meal") byDate[c.date] = (byDate[c.date] ?? 0) + 1;
  const dates = Object.keys(byDate);
  if (!dates.length) return { pct: 0, days: 0 };
  const avg = dates.reduce((a, d) => a + Math.min(byDate[d], total) / total, 0) / dates.length;
  return { pct: Math.round(avg * 100), days: dates.length };
}

export function daySummary(date: string, logs: ExerciseLog[], checks: Check[], detail: StudentDetail) {
  const exercises = logs.filter((l) => l.date === date);
  const mealsTotal = detail.diet?.meals?.length ?? 0;
  const mealsDone = checks.filter((c) => c.kind === "meal" && c.date === date).map((c) => c.itemKey);
  return { date, trained: exercises.length > 0, exercises, mealsTotal, mealsDone };
}

export function lastActivityDate(logs: ExerciseLog[], carreras: Carrera[], wh: WeightEntry[]): string | null {
  const all = [...logs.map((l) => l.date), ...carreras.map((c) => c.date), ...wh.map((w) => w.date)];
  return all.length ? all.sort().slice(-1)[0] : null;
}
export function redFlags(detail: StudentDetail, logs: ExerciseLog[], checks: Check[], paymentStatus: string, isActive?: boolean): string[] {
  const flags: string[] = [];
  const today = todayStr();
  const lastTrain = logs.length ? logs.map((l) => l.date).sort().slice(-1)[0] : null;
  if (lastTrain) { const d = daysBetween(lastTrain, today); if (d >= 4) flags.push(`Sin entrenar hace ${d} días`); }
  else flags.push("Nunca ha registrado entrenamiento");
  const wh = detail.weightHistory ?? [];
  if (wh.length >= 3) { const last3 = wh.slice(-3).map((w) => w.weight); if (Math.max(...last3) - Math.min(...last3) < 0.3) flags.push("Peso estancado (últimas 3 mediciones)"); }
  // Only surface payment flags when the coach has NOT manually activated the student.
  // isActive === true means the coach override is in effect; Stripe state is irrelevant.
  if (isActive !== true) {
    if (paymentStatus === "grace_period" || paymentStatus === "past_due") flags.push("Pago pendiente");
    if (paymentStatus === "inactive") flags.push("Cuenta suspendida por pago");
  }
  if (new Set(checks.filter((c) => c.kind === "meal").map((c) => c.date)).size === 0) flags.push("Sin registro de dieta");
  return flags;
}
