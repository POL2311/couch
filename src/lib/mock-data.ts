/* ═══════════════════════════════════════════
   Mock Data — Students for Coach Dashboard
   ═══════════════════════════════════════════ */

export type PaymentStatus = "active" | "inactive" | "grace_period";
export type Stage = "Volumen" | "Definición" | "Mantenimiento" | "Recomposición";

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
}

export const MOCK_STUDENTS: Student[] = [
  {
    id: "s1",
    name: "María López García",
    email: "maria.lopez@gmail.com",
    avatarInitials: "ML",
    avatarColor: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    currentWeight: 62.5,
    previousWeight: 64.0,
    lastWeighIn: "2026-06-02",
    stage: "Definición",
    stageNumber: 2,
    paymentStatus: "active",
    joinedDate: "2026-01-15",
    streak: 18,
    completionRate: 94,
  },
  {
    id: "s2",
    name: "Carlos Ruiz Hernández",
    email: "carlos.ruiz@outlook.com",
    avatarInitials: "CR",
    avatarColor: "linear-gradient(135deg, #06b6d4, #3b82f6)",
    currentWeight: 85.2,
    previousWeight: 83.0,
    lastWeighIn: "2026-06-03",
    stage: "Volumen",
    stageNumber: 1,
    paymentStatus: "active",
    joinedDate: "2026-02-01",
    streak: 12,
    completionRate: 87,
  },
  {
    id: "s3",
    name: "Ana Torres Mendoza",
    email: "ana.torres@gmail.com",
    avatarInitials: "AT",
    avatarColor: "linear-gradient(135deg, #22c55e, #06b6d4)",
    currentWeight: 58.0,
    previousWeight: 58.3,
    lastWeighIn: "2026-05-28",
    stage: "Mantenimiento",
    stageNumber: 3,
    paymentStatus: "grace_period",
    joinedDate: "2025-11-10",
    streak: 0,
    completionRate: 45,
  },
  {
    id: "s4",
    name: "Pedro Sánchez Ríos",
    email: "pedro.sanchez@hotmail.com",
    avatarInitials: "PS",
    avatarColor: "linear-gradient(135deg, #f59e0b, #ef4444)",
    currentWeight: 92.1,
    previousWeight: 90.5,
    lastWeighIn: "2026-06-04",
    stage: "Volumen",
    stageNumber: 1,
    paymentStatus: "active",
    joinedDate: "2026-03-20",
    streak: 25,
    completionRate: 96,
  },
  {
    id: "s5",
    name: "Laura Méndez Cruz",
    email: "laura.mendez@gmail.com",
    avatarInitials: "LM",
    avatarColor: "linear-gradient(135deg, #ec4899, #8b5cf6)",
    currentWeight: 55.8,
    previousWeight: 57.2,
    lastWeighIn: "2026-06-01",
    stage: "Definición",
    stageNumber: 2,
    paymentStatus: "active",
    joinedDate: "2026-01-05",
    streak: 8,
    completionRate: 78,
  },
  {
    id: "s6",
    name: "Diego Flores Vargas",
    email: "diego.flores@yahoo.com",
    avatarInitials: "DF",
    avatarColor: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    currentWeight: 78.3,
    previousWeight: 78.3,
    lastWeighIn: "2026-05-20",
    stage: "Volumen",
    stageNumber: 1,
    paymentStatus: "inactive",
    joinedDate: "2026-04-10",
    streak: 0,
    completionRate: 22,
  },
  {
    id: "s7",
    name: "Sofía Ramírez Luna",
    email: "sofia.ramirez@gmail.com",
    avatarInitials: "SR",
    avatarColor: "linear-gradient(135deg, #f59e0b, #22c55e)",
    currentWeight: 67.0,
    previousWeight: 68.5,
    lastWeighIn: "2026-06-04",
    stage: "Recomposición",
    stageNumber: 1,
    paymentStatus: "active",
    joinedDate: "2026-04-01",
    streak: 14,
    completionRate: 89,
  },
  {
    id: "s8",
    name: "Roberto Guzmán Díaz",
    email: "roberto.guzman@gmail.com",
    avatarInitials: "RG",
    avatarColor: "linear-gradient(135deg, #ef4444, #f59e0b)",
    currentWeight: 95.0,
    previousWeight: 93.2,
    lastWeighIn: "2026-06-03",
    stage: "Volumen",
    stageNumber: 2,
    paymentStatus: "active",
    joinedDate: "2025-09-15",
    streak: 30,
    completionRate: 98,
  },
  {
    id: "s9",
    name: "Valentina Ortiz Peña",
    email: "vale.ortiz@outlook.com",
    avatarInitials: "VO",
    avatarColor: "linear-gradient(135deg, #06b6d4, #22c55e)",
    currentWeight: 60.2,
    previousWeight: 61.0,
    lastWeighIn: "2026-06-02",
    stage: "Definición",
    stageNumber: 3,
    paymentStatus: "active",
    joinedDate: "2025-08-20",
    streak: 45,
    completionRate: 99,
  },
  {
    id: "s10",
    name: "Emilio Castro Navarro",
    email: "emilio.castro@gmail.com",
    avatarInitials: "EC",
    avatarColor: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
    currentWeight: 73.5,
    previousWeight: 74.0,
    lastWeighIn: "2026-05-25",
    stage: "Mantenimiento",
    stageNumber: 2,
    paymentStatus: "grace_period",
    joinedDate: "2026-02-14",
    streak: 2,
    completionRate: 55,
  },
  {
    id: "s11",
    name: "Camila Herrera Solís",
    email: "camila.herrera@gmail.com",
    avatarInitials: "CH",
    avatarColor: "linear-gradient(135deg, #ec4899, #f59e0b)",
    currentWeight: 52.1,
    previousWeight: 53.4,
    lastWeighIn: "2026-06-04",
    stage: "Definición",
    stageNumber: 1,
    paymentStatus: "active",
    joinedDate: "2026-05-01",
    streak: 7,
    completionRate: 82,
  },
  {
    id: "s12",
    name: "Andrés Morales Jiménez",
    email: "andres.morales@hotmail.com",
    avatarInitials: "AM",
    avatarColor: "linear-gradient(135deg, #22c55e, #3b82f6)",
    currentWeight: 88.7,
    previousWeight: 87.0,
    lastWeighIn: "2026-06-01",
    stage: "Volumen",
    stageNumber: 1,
    paymentStatus: "inactive",
    joinedDate: "2026-03-01",
    streak: 0,
    completionRate: 15,
  },
];

/* ═══════════════════════════════════════════
   Extended Detail Data
   ═══════════════════════════════════════════ */

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface Meal {
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: string[];
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  rest?: string;
}

export interface RoutineDay {
  day: string;
  label: string;
  muscleGroup: string;
  exercises: Exercise[];
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

export interface StudentDetail {
  weightHistory: WeightEntry[];
  diet: {
    name: string;
    totalCalories: number;
    macros: { protein: number; carbs: number; fat: number };
    meals: Meal[];
  };
  routine: {
    name: string;
    daysPerWeek: number;
    days: RoutineDay[];
  };
  measurements: BodyMeasurements[];
  nextStageDate: string | null;
  notes: string;
}

/* Pre-built detail for student s1 (María) — reused with slight variations for others */
const BASE_DETAIL: StudentDetail = {
  weightHistory: [
    { date: "2026-01-15", weight: 66.0 },
    { date: "2026-02-01", weight: 65.5 },
    { date: "2026-02-15", weight: 65.2 },
    { date: "2026-03-01", weight: 64.8 },
    { date: "2026-03-15", weight: 64.5 },
    { date: "2026-04-01", weight: 64.0 },
    { date: "2026-04-15", weight: 63.7 },
    { date: "2026-05-01", weight: 63.3 },
    { date: "2026-05-15", weight: 63.0 },
    { date: "2026-06-02", weight: 62.5 },
  ],
  diet: {
    name: "Hipocalórica Definición",
    totalCalories: 1750,
    macros: { protein: 140, carbs: 160, fat: 50 },
    meals: [
      {
        name: "Desayuno",
        time: "07:00",
        calories: 380,
        protein: 30,
        carbs: 40,
        fat: 10,
        items: ["3 claras + 1 huevo entero revuelto", "½ taza avena con canela", "½ plátano"],
      },
      {
        name: "Snack AM",
        time: "10:00",
        calories: 200,
        protein: 25,
        carbs: 15,
        fat: 5,
        items: ["Yogur griego natural 150g", "10 almendras"],
      },
      {
        name: "Comida",
        time: "13:30",
        calories: 520,
        protein: 40,
        carbs: 50,
        fat: 15,
        items: ["150g pechuga de pollo a la plancha", "¾ taza arroz integral", "Ensalada mixta con limón", "1 cda aceite de oliva"],
      },
      {
        name: "Snack PM",
        time: "16:30",
        calories: 180,
        protein: 25,
        carbs: 10,
        fat: 5,
        items: ["Scoop de proteína whey con agua", "1 manzana"],
      },
      {
        name: "Cena",
        time: "20:00",
        calories: 470,
        protein: 35,
        carbs: 45,
        fat: 15,
        items: ["150g salmón al horno", "Camote asado 120g", "Brócoli al vapor", "1 cda aceite de oliva"],
      },
    ],
  },
  routine: {
    name: "PPL Definición 5 días",
    daysPerWeek: 5,
    days: [
      {
        day: "Lunes",
        label: "Push",
        muscleGroup: "Pecho · Hombro · Tríceps",
        exercises: [
          { name: "Press Banca", sets: 4, reps: "10", weight: "40 kg", rest: "90s" },
          { name: "Press Inclinado Mancuernas", sets: 3, reps: "12", weight: "14 kg", rest: "75s" },
          { name: "Aperturas en Polea", sets: 3, reps: "15", weight: "10 kg", rest: "60s" },
          { name: "Press Militar", sets: 4, reps: "10", weight: "25 kg", rest: "90s" },
          { name: "Elevaciones Laterales", sets: 3, reps: "15", weight: "6 kg", rest: "45s" },
          { name: "Fondos en Paralelas", sets: 3, reps: "AMRAP", rest: "60s" },
        ],
      },
      {
        day: "Martes",
        label: "Pull",
        muscleGroup: "Espalda · Bíceps",
        exercises: [
          { name: "Jalón al Pecho", sets: 4, reps: "10", weight: "45 kg", rest: "90s" },
          { name: "Remo con Barra", sets: 4, reps: "10", weight: "35 kg", rest: "90s" },
          { name: "Remo Mancuerna", sets: 3, reps: "12", weight: "14 kg", rest: "75s" },
          { name: "Face Pull", sets: 3, reps: "15", weight: "12 kg", rest: "60s" },
          { name: "Curl Bíceps Barra", sets: 3, reps: "12", weight: "20 kg", rest: "60s" },
          { name: "Curl Martillo", sets: 3, reps: "12", weight: "8 kg", rest: "45s" },
        ],
      },
      {
        day: "Miércoles",
        label: "Legs",
        muscleGroup: "Pierna · Glúteo",
        exercises: [
          { name: "Sentadilla", sets: 4, reps: "10", weight: "50 kg", rest: "120s" },
          { name: "Prensa", sets: 4, reps: "12", weight: "100 kg", rest: "90s" },
          { name: "Extensión de Pierna", sets: 3, reps: "15", weight: "30 kg", rest: "60s" },
          { name: "Curl Femoral", sets: 3, reps: "12", weight: "25 kg", rest: "60s" },
          { name: "Hip Thrust", sets: 4, reps: "12", weight: "60 kg", rest: "90s" },
          { name: "Elevación de Talones", sets: 3, reps: "20", weight: "40 kg", rest: "45s" },
        ],
      },
      {
        day: "Jueves",
        label: "Push",
        muscleGroup: "Pecho · Hombro · Tríceps",
        exercises: [
          { name: "Press Inclinado Barra", sets: 4, reps: "10", weight: "35 kg", rest: "90s" },
          { name: "Aperturas Mancuerna", sets: 3, reps: "12", weight: "10 kg", rest: "60s" },
          { name: "Press Arnold", sets: 3, reps: "12", weight: "12 kg", rest: "75s" },
          { name: "Elevación Frontal", sets: 3, reps: "12", weight: "6 kg", rest: "45s" },
          { name: "Extensión Tríceps Polea", sets: 3, reps: "15", weight: "15 kg", rest: "60s" },
          { name: "Patada Tríceps", sets: 3, reps: "12", weight: "6 kg", rest: "45s" },
        ],
      },
      {
        day: "Viernes",
        label: "Pull + Legs",
        muscleGroup: "Espalda · Pierna",
        exercises: [
          { name: "Peso Muerto Rumano", sets: 4, reps: "10", weight: "45 kg", rest: "120s" },
          { name: "Jalón Agarre Cerrado", sets: 3, reps: "12", weight: "40 kg", rest: "75s" },
          { name: "Remo en Polea Baja", sets: 3, reps: "12", weight: "35 kg", rest: "75s" },
          { name: "Zancadas Caminando", sets: 3, reps: "12 c/lado", weight: "10 kg", rest: "60s" },
          { name: "Abductora", sets: 3, reps: "15", weight: "35 kg", rest: "45s" },
          { name: "Plancha", sets: 3, reps: "45s", rest: "30s" },
        ],
      },
    ],
  },
  measurements: [
    { date: "2026-01-15", chest: 90, waist: 74, hips: 98, armL: 27, armR: 27.5, thighL: 56, thighR: 56.5 },
    { date: "2026-03-15", chest: 89, waist: 71, hips: 97, armL: 27.5, armR: 28, thighL: 55, thighR: 55.5 },
    { date: "2026-06-01", chest: 88, waist: 68, hips: 96, armL: 28, armR: 28.5, thighL: 54.5, thighR: 55 },
  ],
  nextStageDate: "2026-07-15",
  notes: "Progreso excelente en definición. Reducir 100 kcal en julio si el peso se estanca.",
};

const isBrowser = typeof window !== "undefined";

export function getStoredStudents(): Student[] {
  if (!isBrowser) return MOCK_STUDENTS;
  const stored = localStorage.getItem("mycouch_students");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return MOCK_STUDENTS;
    }
  }
  localStorage.setItem("mycouch_students", JSON.stringify(MOCK_STUDENTS));
  return MOCK_STUDENTS;
}

export function saveStudents(students: Student[]) {
  if (isBrowser) {
    localStorage.setItem("mycouch_students", JSON.stringify(students));
  }
}

/** Return detail data for any student (uses base with weight variations) */
export function getStudentDetail(studentId: string): StudentDetail | null {
  const students = getStoredStudents();
  const student = students.find((s) => s.id === studentId);
  if (!student) return null;

  // Vary the weight history based on the student's actual current weight
  const scale = student.currentWeight / 62.5;
  const history = BASE_DETAIL.weightHistory.map((e, i) => ({
    date: e.date,
    weight: Math.round((e.weight * scale + (i % 2 === 0 ? 0.2 : -0.3)) * 10) / 10,
  }));
  // Ensure last entry matches current weight
  history[history.length - 1] = { date: student.lastWeighIn, weight: student.currentWeight };

  return {
    ...BASE_DETAIL,
    weightHistory: history,
    nextStageDate: student.stageNumber < 3 ? "2026-07-15" : null,
    notes:
      student.paymentStatus === "inactive"
        ? "Cuenta suspendida por falta de pago. Contactar al alumno."
        : student.paymentStatus === "grace_period"
          ? "Pago pendiente — período de gracia activo. Enviar recordatorio."
          : BASE_DETAIL.notes,
  };
}
