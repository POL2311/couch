/* ═══════════════════════════════════════════
   Datos de ejemplo (modo "mock")
   Permiten ver y navegar la app SIN backend.
   Reflejan la forma exacta de los tipos reales.
   ═══════════════════════════════════════════ */
import type { AuthUser, Student, StudentDetail, Template } from "./types";

export const MOCK_USERS: Record<string, { password: string; user: AuthUser }> = {
  "coach@mycoach.app": {
    password: "coach123",
    user: { id: "u-coach", name: "Coach Demo", email: "coach@mycoach.app", role: "COACH", coachId: "c1" },
  },
  "admin@mycoach.app": {
    password: "admin123",
    user: { id: "u-admin", name: "Administrador", email: "admin@mycoach.app", role: "ADMIN" },
  },
  "cliente@mycoach.app": {
    password: "cliente123",
    user: { id: "u-cli", name: "María López", email: "cliente@mycoach.app", role: "CLIENT", studentId: "s1" },
  },
};

export const MOCK_STUDENTS: Student[] = [
  { id: "s1", name: "María López García", email: "maria.lopez@gmail.com", avatarInitials: "ML", avatarColor: "#8b5cf6", currentWeight: 62.5, previousWeight: 64.0, lastWeighIn: "2026-06-02", stage: "Definición", stageNumber: 2, paymentStatus: "active", joinedDate: "2026-01-15", streak: 18, completionRate: 94 },
  { id: "s2", name: "Carlos Ruiz Hernández", email: "carlos.ruiz@outlook.com", avatarInitials: "CR", avatarColor: "#06b6d4", currentWeight: 85.2, previousWeight: 83.0, lastWeighIn: "2026-06-03", stage: "Volumen", stageNumber: 1, paymentStatus: "active", joinedDate: "2026-02-01", streak: 12, completionRate: 87 },
  { id: "s3", name: "Ana Torres Mendoza", email: "ana.torres@gmail.com", avatarInitials: "AT", avatarColor: "#22c55e", currentWeight: 58.0, previousWeight: 58.3, lastWeighIn: "2026-05-28", stage: "Mantenimiento", stageNumber: 3, paymentStatus: "grace_period", joinedDate: "2025-11-10", streak: 0, completionRate: 45, scheduledChange: { executionDate: "2026-06-20", stage: "Definición", stageNumber: 2 } },
  { id: "s4", name: "Pedro Sánchez Ríos", email: "pedro.sanchez@hotmail.com", avatarInitials: "PS", avatarColor: "#f59e0b", currentWeight: 92.1, previousWeight: 90.5, lastWeighIn: "2026-06-04", stage: "Volumen", stageNumber: 1, paymentStatus: "active", joinedDate: "2026-03-20", streak: 25, completionRate: 96 },
  { id: "s6", name: "Diego Flores Vargas", email: "diego.flores@yahoo.com", avatarInitials: "DF", avatarColor: "#3b82f6", currentWeight: 78.3, previousWeight: 78.3, lastWeighIn: "2026-05-20", stage: "Volumen", stageNumber: 1, paymentStatus: "inactive", joinedDate: "2026-04-10", streak: 0, completionRate: 22 },
  { id: "s8", name: "Roberto Guzmán Díaz", email: "roberto.guzman@gmail.com", avatarInitials: "RG", avatarColor: "#ef4444", currentWeight: 95.0, previousWeight: 93.2, lastWeighIn: "2026-06-03", stage: "Volumen", stageNumber: 2, paymentStatus: "active", joinedDate: "2025-09-15", streak: 30, completionRate: 98 },
];

const BASE_DETAIL: StudentDetail = {
  weightHistory: [
    { date: "2026-01-15", weight: 64.0 },
    { date: "2026-02-15", weight: 63.4 },
    { date: "2026-03-15", weight: 63.0 },
    { date: "2026-04-15", weight: 62.9 },
    { date: "2026-05-15", weight: 62.7 },
    { date: "2026-06-02", weight: 62.5 },
  ],
  diet: {
    name: "Definición 1.800 kcal",
    totalCalories: 1800,
    macros: { protein: 140, carbs: 160, fat: 50 },
    meals: [
      { name: "Desayuno", time: "07:00", calories: 380, protein: 30, carbs: 40, fat: 10, items: ["3 claras + 1 huevo", "½ taza avena", "½ plátano"] },
      { name: "Comida", time: "13:30", calories: 520, protein: 40, carbs: 50, fat: 15, items: ["150g pollo", "¾ taza arroz integral", "Ensalada"] },
      { name: "Cena", time: "20:00", calories: 470, protein: 35, carbs: 45, fat: 15, items: ["150g salmón", "Camote 120g", "Brócoli"] },
    ],
  },
  routine: {
    name: "PPL Definición 5 días",
    daysPerWeek: 5,
    days: [
      { day: "Lunes", label: "Push", muscleGroup: "Pecho · Hombro · Tríceps", exercises: [
        { name: "Press Banca", sets: 4, reps: "10", weight: "40 kg", rest: "90s" },
        { name: "Press Militar", sets: 4, reps: "10", weight: "25 kg", rest: "90s" },
      ] },
      { day: "Martes", label: "Pull", muscleGroup: "Espalda · Bíceps", exercises: [
        { name: "Jalón al Pecho", sets: 4, reps: "10", weight: "45 kg", rest: "90s" },
        { name: "Remo con Barra", sets: 4, reps: "10", weight: "35 kg", rest: "90s" },
      ] },
    ],
  },
  measurements: [
    { date: "2026-01-15", chest: 90, waist: 74, hips: 98, armL: 27, armR: 27.5, thighL: 56, thighR: 56.5 },
    { date: "2026-06-01", chest: 88, waist: 68, hips: 96, armL: 28, armR: 28.5, thighL: 54.5, thighR: 55 },
  ],
  nextStageDate: "2026-07-15",
  notes: "Progreso excelente en definición.",
};

export const MOCK_TEMPLATES: Template[] = [
  {
    id: "t-diet-1",
    type: "diet",
    name: "Definición 1.800 kcal",
    totalCalories: 1800,
    macros: { protein: 140, carbs: 160, fat: 50 },
    meals: BASE_DETAIL.diet.meals,
  },
  {
    id: "t-diet-2",
    type: "diet",
    name: "Volumen 2.800 kcal",
    totalCalories: 2800,
    macros: { protein: 180, carbs: 320, fat: 70 },
    meals: [
      { name: "Desayuno", time: "07:30", calories: 700, protein: 45, carbs: 80, fat: 18, items: ["5 claras + 2 huevos", "1 taza avena", "1 plátano", "Mantequilla de maní"] },
      { name: "Comida", time: "14:00", calories: 850, protein: 55, carbs: 95, fat: 22, items: ["200g res magra", "1.5 tazas arroz", "Aguacate"] },
      { name: "Cena", time: "21:00", calories: 750, protein: 50, carbs: 80, fat: 20, items: ["200g pollo", "Pasta integral", "Aceite de oliva"] },
    ],
  },
  {
    id: "t-routine-1",
    type: "routine",
    name: "PPL Definición 5 días",
    daysPerWeek: 5,
    days: BASE_DETAIL.routine.days,
  },
  {
    id: "t-routine-2",
    type: "routine",
    name: "Full Body 3 días",
    daysPerWeek: 3,
    days: [
      { day: "Lunes", label: "Full Body A", muscleGroup: "Cuerpo completo", exercises: [
        { name: "Sentadilla", sets: 4, reps: "8", weight: "60 kg", rest: "120s" },
        { name: "Press Banca", sets: 4, reps: "8", weight: "45 kg", rest: "90s" },
        { name: "Remo con Barra", sets: 4, reps: "10", weight: "40 kg", rest: "90s" },
      ] },
      { day: "Miércoles", label: "Full Body B", muscleGroup: "Cuerpo completo", exercises: [
        { name: "Peso Muerto", sets: 4, reps: "6", weight: "80 kg", rest: "150s" },
        { name: "Press Militar", sets: 4, reps: "8", weight: "30 kg", rest: "90s" },
        { name: "Dominadas", sets: 4, reps: "AMRAP", rest: "90s" },
      ] },
    ],
  },
];

export function mockDetailFor(studentId: string): StudentDetail | null {
  const s = MOCK_STUDENTS.find((x) => x.id === studentId);
  if (!s) return null;
  const scale = s.currentWeight / 62.5;
  const history = BASE_DETAIL.weightHistory.map((e) => ({
    date: e.date,
    weight: Math.round(e.weight * scale * 10) / 10,
  }));
  history[history.length - 1] = { date: s.lastWeighIn, weight: s.currentWeight };
  return { ...BASE_DETAIL, weightHistory: history };
}
