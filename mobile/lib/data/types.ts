/* ═══════════════════════════════════════════
   Tipos de datos — portados 1:1 de la web
   (referencia: src/lib/mock-data.ts)
   Mantener sincronizados con la web para que
   web y app hablen el mismo "idioma" de datos.
   ═══════════════════════════════════════════ */

export type PaymentStatus = "active" | "inactive" | "grace_period" | "past_due";
export type Stage = "Volumen" | "Definición" | "Mantenimiento" | "Recomposición";
export type Role = "ADMIN" | "COACH" | "CLIENT";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  coachId?: string | null;
  studentId?: string | null;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  avatarColor: string;
  currentWeight: number;
  previousWeight: number;
  lastWeighIn: string;
  stage: Stage;
  stageNumber: number;
  paymentStatus: PaymentStatus;
  joinedDate: string;
  streak: number;
  completionRate: number;
  scheduledChange?: ScheduledChange | null;
}

export interface ScheduledChange {
  executionDate: string;
  stage: Stage;
  stageNumber: number;
  dietTemplateId?: string;
  routineTemplateId?: string;
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface BodyMeasurements {
  date: string;
  chest: number;
  waist: number;
  hips: number;
  armL: number;
  armR: number;
  thighL: number;
  thighR: number;
}

export interface Ingredient {
  name: string;
  grams: number;
  calories: number;
  unit?: string;
  unitQty?: number;
  icon?: string;
  macros?: { protein: number; carbs: number; fat: number };
}

export interface Equivalent {
  name: string;
  gramsPerCarb?: number;
  gramsPerProtein?: number;
  icon?: string;
  note?: string;
  macroType?: "carb" | "protein";
}

export interface Meal {
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: string[];
  ingredients?: Ingredient[];
}

export interface Diet {
  name: string;
  totalCalories: number;
  macros: { protein: number; carbs: number; fat: number };
  meals: Meal[];
}

export interface Exercise {
  ejercicioId?: string | null; // referencia al catálogo (Etapa 3)
  name: string;
  muscleGroup?: string;
  bodyweight?: boolean;
  sets: number;
  reps: string;
  weight?: string;
  rest: string;
}

export interface RoutineDay {
  day: string;
  label: string;
  muscleGroup: string;
  exercises: Exercise[];
}

export interface Routine {
  name: string;
  daysPerWeek: number;
  days: RoutineDay[];
}

export interface StudentDetail {
  weightHistory: WeightEntry[];
  diet: Diet;
  routine: Routine;
  measurements: BodyMeasurements[];
  nextStageDate: string | null;
  notes: string;
  height?: number;
  bodyFat?: number;
  photos?: { id: string; url: string; label: string; weight: number | null; createdAt: string }[];
  scheduledChange?: ScheduledChange | null;
}

/* ── Plantillas dinámicas (dietas y rutinas) ── */
export interface DietTemplate extends Diet {
  id: string;
  type: "diet";
}
export interface RoutineTemplate extends Routine {
  id: string;
  type: "routine";
}
export type Template = DietTemplate | RoutineTemplate;

/* ── Admin: fila de coach en el panel global ── */
export interface CoachRow {
  id: string;
  name: string;
  email: string;
  studentCount: number;
  activeCount: number;
  mrr: number;
}

export interface AdminOverview {
  metrics: { totalCoaches: number; totalStudents: number; totalClients: number; activeStudents: number; mrr: number };
  coaches: CoachRow[];
}

/* ── Registro de ejecución del alumno (serie por serie) ── */
export interface SetEntry {
  reps: string;
  weight: string;
  done: boolean;
}
export interface ExerciseLog {
  id: string;
  date: string;
  ejercicioId?: string | null;
  exerciseName: string;
  muscleGroup?: string | null;
  bodyweight: boolean;
  prescribedSets: number;
  prescribedReps: string;
  prescribedWeight?: string | null;
  sets: SetEntry[];
  completed: boolean;
  createdAt: string;
}

/* ── Catálogo de ejercicios recurrentes (por coach) ── */
export interface Ejercicio {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  bodyweight: boolean;
}

export const MUSCLE_GROUPS = ["Pecho", "Espalda", "Pierna", "Glúteo", "Hombro", "Brazo", "Core", "Cardio"] as const;
export const EQUIPMENT = ["Barra", "Mancuerna", "Polea", "Máquina", "Peso corporal", "Kettlebell", "Banda"] as const;

/* ── Feed de actividad (derivado de los alumnos) ── */
export interface FeedItem {
  key: string;
  type: "weigh" | "join";
  title: string;
  desc: string;
  date: string;
  delta?: number;
}

/* ── Módulo Strava (carreras) — MODELO NUEVO (Etapa 5) ── */
export interface GpsPoint {
  lat: number;
  lng: number;
  t: number; // timestamp relativo en ms
}

export interface Carrera {
  id: string;
  userId: string;
  date: string;
  distanceM: number; // metros
  durationS: number; // segundos
  avgSpeedKmh: number;
  track: GpsPoint[]; // puntos GPS para dibujar la silueta
  photoUrl?: string | null; // foto de fondo para compartir
}
