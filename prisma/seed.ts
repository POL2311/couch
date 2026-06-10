/**
 * Seed coherente — jerarquía completa + catálogo de ejercicios + sesiones.
 *
 *   ADMIN
 *    ├─ Coach Demo ──► 3 alumnos (1 "estrella" = cuenta cliente, 2 ligeros)
 *    │                 + catálogo de ejercicios + rutina PPL del catálogo
 *    │                 + sesiones de entrenamiento ya registradas
 *    └─ Coach Fitness ─► 2 alumnos ligeros
 *
 * Ejecutar:  node prisma/seed.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DIET_TEMPLATES } from "../src/lib/templates.ts";

const prisma = new PrismaClient();
const hash = (pwd: string) => bcrypt.hashSync(pwd, 10);

/* ── Catálogo de ejercicios del coach demo ── */
const CATALOGO = [
  { name: "Press de Banca Plano", muscleGroup: "Pecho", equipment: "Barra", bodyweight: false },
  { name: "Press Inclinado con Mancuernas", muscleGroup: "Pecho", equipment: "Mancuerna", bodyweight: false },
  { name: "Aperturas en Polea", muscleGroup: "Pecho", equipment: "Polea", bodyweight: false },
  { name: "Fondos en Paralelas", muscleGroup: "Pecho", equipment: "Peso corporal", bodyweight: true },
  { name: "Press Militar", muscleGroup: "Hombro", equipment: "Barra", bodyweight: false },
  { name: "Elevaciones Laterales", muscleGroup: "Hombro", equipment: "Mancuerna", bodyweight: false },
  { name: "Press Arnold", muscleGroup: "Hombro", equipment: "Mancuerna", bodyweight: false },
  { name: "Face Pull", muscleGroup: "Hombro", equipment: "Polea", bodyweight: false },
  { name: "Extensión de Tríceps en Polea", muscleGroup: "Brazo", equipment: "Polea", bodyweight: false },
  { name: "Press Francés", muscleGroup: "Brazo", equipment: "Barra", bodyweight: false },
  { name: "Curl con Barra", muscleGroup: "Brazo", equipment: "Barra", bodyweight: false },
  { name: "Curl Martillo", muscleGroup: "Brazo", equipment: "Mancuerna", bodyweight: false },
  { name: "Dominadas", muscleGroup: "Espalda", equipment: "Peso corporal", bodyweight: true },
  { name: "Remo con Barra", muscleGroup: "Espalda", equipment: "Barra", bodyweight: false },
  { name: "Jalón al Pecho", muscleGroup: "Espalda", equipment: "Polea", bodyweight: false },
  { name: "Remo en Polea Baja", muscleGroup: "Espalda", equipment: "Polea", bodyweight: false },
  { name: "Sentadilla", muscleGroup: "Pierna", equipment: "Barra", bodyweight: false },
  { name: "Prensa", muscleGroup: "Pierna", equipment: "Máquina", bodyweight: false },
  { name: "Peso Muerto Rumano", muscleGroup: "Pierna", equipment: "Barra", bodyweight: false },
  { name: "Extensión de Pierna", muscleGroup: "Pierna", equipment: "Máquina", bodyweight: false },
  { name: "Curl Femoral", muscleGroup: "Pierna", equipment: "Máquina", bodyweight: false },
  { name: "Hip Thrust", muscleGroup: "Glúteo", equipment: "Barra", bodyweight: false },
  { name: "Plancha", muscleGroup: "Core", equipment: "Peso corporal", bodyweight: true },
];

type CatEntry = { id: string; muscleGroup: string; bodyweight: boolean };

/* Construye la rutina PPL del estrella REFERENCIANDO el catálogo. */
function buildStarRoutine(cat: Record<string, CatEntry>) {
  const ref = (name: string, sets: number, reps: string, weight?: string) => ({
    ejercicioId: cat[name].id, name, bodyweight: cat[name].bodyweight,
    sets, reps, weight, rest: "60s",
  });
  return {
    name: "PPL · Push/Pull/Legs 5 días",
    daysPerWeek: 5,
    days: [
      { day: "Lunes", label: "Push", muscleGroup: "Pecho · Hombro · Tríceps", exercises: [
        ref("Press de Banca Plano", 4, "8", "70 kg"),
        ref("Press Inclinado con Mancuernas", 4, "10", "26 kg"),
        ref("Press Militar", 4, "8", "40 kg"),
        ref("Elevaciones Laterales", 4, "15", "10 kg"),
        ref("Fondos en Paralelas", 3, "AMRAP"),
        ref("Extensión de Tríceps en Polea", 3, "12", "25 kg"),
      ] },
      { day: "Martes", label: "Pull", muscleGroup: "Espalda · Bíceps", exercises: [
        ref("Dominadas", 4, "8"),
        ref("Remo con Barra", 4, "10", "60 kg"),
        ref("Jalón al Pecho", 3, "12", "55 kg"),
        ref("Remo en Polea Baja", 3, "12", "50 kg"),
        ref("Curl con Barra", 4, "10", "30 kg"),
        ref("Curl Martillo", 3, "12", "12 kg"),
      ] },
      { day: "Miércoles", label: "Legs", muscleGroup: "Pierna · Glúteo", exercises: [
        ref("Sentadilla", 5, "8", "100 kg"),
        ref("Prensa", 4, "12", "180 kg"),
        ref("Peso Muerto Rumano", 4, "10", "80 kg"),
        ref("Extensión de Pierna", 3, "15", "45 kg"),
        ref("Curl Femoral", 3, "12", "40 kg"),
        ref("Hip Thrust", 4, "12", "70 kg"),
      ] },
      { day: "Jueves", label: "Push", muscleGroup: "Pecho · Hombro · Tríceps", exercises: [
        ref("Press Inclinado con Mancuernas", 4, "8", "28 kg"),
        ref("Aperturas en Polea", 4, "12", "15 kg"),
        ref("Press Arnold", 4, "10", "20 kg"),
        ref("Press Francés", 4, "10", "30 kg"),
      ] },
      { day: "Viernes", label: "Pull + Core", muscleGroup: "Espalda · Core", exercises: [
        ref("Remo con Barra", 4, "8", "65 kg"),
        ref("Face Pull", 3, "15", "20 kg"),
        ref("Curl Martillo", 3, "12", "14 kg"),
        ref("Plancha", 3, "45s"),
      ] },
    ],
  };
}

/* Sesiones ya registradas del estrella: generadas desde su rutina PPL,
   en días de entreno coherentes (2 semanas), con leve progresión de peso. */
function starLogs(cat: Record<string, CatEntry>, ppl: ReturnType<typeof buildStarRoutine>) {
  const byDayName: Record<string, any> = {};
  for (const d of ppl.days) byDayName[d.day] = d;
  // (fecha, día de la rutina, bump de peso para simular progresión)
  const sessions = [
    { date: "2026-06-01", day: "Lunes", bump: 0 },
    { date: "2026-06-02", day: "Martes", bump: 0 },
    { date: "2026-06-03", day: "Miércoles", bump: 0 },
    { date: "2026-06-04", day: "Jueves", bump: 0 },
    { date: "2026-06-05", day: "Viernes", bump: 0 },
    { date: "2026-06-08", day: "Lunes", bump: 2.5 }, // semana siguiente: +2.5 kg
  ];
  const firstReps = (r: any) => { const m = String(r).match(/\d+/); return m ? m[0] : String(r); };
  const bumpWeight = (w: string | undefined, bump: number) => {
    if (!w) return "";
    const m = w.match(/([\d.]+)\s*kg/);
    if (!m) return w;
    return `${parseFloat(m[1]) + bump} kg`;
  };
  const logs: any[] = [];
  for (const sess of sessions) {
    const rd = byDayName[sess.day];
    if (!rd) continue;
    for (const ex of rd.exercises) {
      const w = bumpWeight(ex.weight, sess.bump);
      const reps = firstReps(ex.reps);
      const sets = Array.from({ length: ex.sets }, () => ({ reps, weight: ex.bodyweight ? "" : w, done: true }));
      logs.push({
        date: sess.date, ejercicioId: ex.ejercicioId, exerciseName: ex.name,
        muscleGroup: cat[ex.name]?.muscleGroup ?? null, bodyweight: ex.bodyweight,
        prescribedSets: ex.sets, prescribedReps: String(ex.reps), prescribedWeight: ex.weight ?? null,
        setsJson: JSON.stringify(sets), completed: true,
      });
    }
  }
  return logs;
}

const STAR_DIET = {
  name: "Volumen Limpio · 2.850 kcal", totalCalories: 2850, macros: { protein: 185, carbs: 330, fat: 75 },
  meals: [
    { name: "Desayuno", time: "07:30", calories: 620, protein: 42, carbs: 75, fat: 16, items: ["4 huevos + 3 claras revueltos", "80g avena con canela", "1 plátano", "1 cda mantequilla de maní"] },
    { name: "Media mañana", time: "11:00", calories: 380, protein: 30, carbs: 45, fat: 8, items: ["Yogur griego 200g", "40g granola", "Frutos rojos"] },
    { name: "Comida", time: "14:30", calories: 780, protein: 50, carbs: 90, fat: 20, items: ["200g pechuga de pollo", "1.5 tazas arroz integral", "Ensalada mixta", "1 cda aceite de oliva"] },
    { name: "Pre-entreno", time: "17:30", calories: 320, protein: 20, carbs: 55, fat: 4, items: ["2 rebanadas pan integral", "100g pavo", "1 manzana"] },
    { name: "Cena", time: "21:00", calories: 750, protein: 43, carbs: 65, fat: 27, items: ["200g salmón al horno", "200g camote asado", "Brócoli al vapor", "½ aguacate"] },
  ],
};
const STAR_WEIGHT_HISTORY = [
  { date: "2025-12-10", weight: 75.0 }, { date: "2026-01-10", weight: 75.9 }, { date: "2026-02-10", weight: 76.6 },
  { date: "2026-03-10", weight: 77.3 }, { date: "2026-04-10", weight: 78.0 }, { date: "2026-05-10", weight: 78.7 }, { date: "2026-06-05", weight: 79.2 },
];
const STAR_MEASUREMENTS = [
  { date: "2025-12-10", chest: 98, waist: 84, hips: 99, armL: 35, armR: 35.5, thighL: 57, thighR: 57.5 },
  { date: "2026-03-10", chest: 101, waist: 83, hips: 100, armL: 36.5, armR: 37, thighL: 58.5, thighR: 59 },
  { date: "2026-06-05", chest: 104, waist: 82, hips: 101, armL: 38, armR: 38.5, thighL: 60, thighR: 60.5 },
];

function makeTrack(baseLat: number, baseLng: number, points: number, scale: number) {
  const track: { lat: number; lng: number; t: number }[] = [];
  for (let i = 0; i < points; i++) {
    const a = (i / (points - 1)) * Math.PI * 2;
    track.push({ lat: baseLat + Math.sin(a) * scale * (0.6 + 0.4 * Math.sin(a * 3)), lng: baseLng + Math.cos(a) * scale * (0.8 + 0.2 * Math.cos(a * 2)), t: i * 1000 });
  }
  return track;
}
const STAR_RUNS = [
  { date: "2026-05-12", distanceM: 5230, durationS: 1680, baseLat: 19.421, baseLng: -99.161, points: 22, scale: 0.004 },
  { date: "2026-05-20", distanceM: 3420, durationS: 1140, baseLat: 19.430, baseLng: -99.140, points: 18, scale: 0.003 },
  { date: "2026-05-28", distanceM: 7140, durationS: 2460, baseLat: 19.415, baseLng: -99.170, points: 26, scale: 0.005 },
  { date: "2026-06-03", distanceM: 4480, durationS: 1440, baseLat: 19.425, baseLng: -99.155, points: 20, scale: 0.0035 },
];

async function createStudent(coachId: string, s: any) {
  return prisma.student.create({
    data: {
      name: s.name, email: s.email, avatarInitials: s.avatarInitials, avatarColor: s.avatarColor,
      currentWeight: s.currentWeight, previousWeight: s.previousWeight, lastWeighIn: s.lastWeighIn,
      stage: s.stage, stageNumber: s.stageNumber, paymentStatus: s.paymentStatus, joinedDate: s.joinedDate,
      streak: s.streak ?? 0, completionRate: s.completionRate ?? 0, height: s.height ?? null, bodyFat: s.bodyFat ?? null,
      notes: s.notes ?? "", dietJson: s.diet ? JSON.stringify(s.diet) : "", routineJson: s.routine ? JSON.stringify(s.routine) : "",
      coachId,
      weightHistory: { create: (s.weightHistory ?? []).map((w: any) => ({ date: w.date, weight: w.weight })) },
      measurements: { create: (s.measurements ?? []).map((m: any) => ({ date: m.date, chest: m.chest, waist: m.waist, hips: m.hips, armL: m.armL, armR: m.armR, thighL: m.thighL, thighR: m.thighR })) },
    },
  });
}

async function main() {
  console.log("🌱 Sembrando base de datos (jerarquía + catálogo + sesiones)…");

  // Limpieza (tablas hijas primero)
  await prisma.exerciseLog.deleteMany();
  await prisma.dailyCheck.deleteMany();
  await prisma.carrera.deleteMany();
  await prisma.scheduledChange.deleteMany();
  await prisma.weightEntry.deleteMany();
  await prisma.measurement.deleteMany();
  await prisma.progressPhoto.deleteMany();
  await prisma.ejercicio.deleteMany();
  await prisma.template.deleteMany();
  await prisma.student.deleteMany();
  await prisma.coach.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({ data: { email: "admin@mycoach.app", name: "Administrador", role: "ADMIN", passwordHash: hash("admin123") } });
  const coachDemoUser = await prisma.user.create({ data: { email: "coach@mycoach.app", name: "Coach Demo", role: "COACH", passwordHash: hash("coach123") } });
  const coachDemo = await prisma.coach.create({ data: { userId: coachDemoUser.id } });
  const coach2User = await prisma.user.create({ data: { email: "coach2@mycoach.app", name: "Coach Fitness", role: "COACH", passwordHash: hash("coach123") } });
  const coach2 = await prisma.coach.create({ data: { userId: coach2User.id } });

  // ── Catálogo de ejercicios del coach demo ──
  const cat: Record<string, CatEntry> = {};
  for (const e of CATALOGO) {
    const created = await prisma.ejercicio.create({ data: { coachId: coachDemo.id, ...e } });
    cat[e.name] = { id: created.id, muscleGroup: e.muscleGroup, bodyweight: e.bodyweight };
  }

  // ── Plantillas: dietas + 1 rutina PPL construida del catálogo ──
  for (const t of DIET_TEMPLATES) {
    const { id, ...rest } = t;
    await prisma.template.create({ data: { id, type: "diet", name: t.name, dataJson: JSON.stringify(rest), coachId: coachDemo.id } });
  }
  const ppl = buildStarRoutine(cat);
  await prisma.template.create({ data: { type: "routine", name: ppl.name, dataJson: JSON.stringify({ daysPerWeek: ppl.daysPerWeek, days: ppl.days }), coachId: coachDemo.id } });

  // ── Alumno estrella (= cuenta cliente) ──
  const clientUser = await prisma.user.create({ data: { email: "cliente@mycoach.app", name: "Diego Herrera", role: "CLIENT", passwordHash: hash("cliente123") } });
  const star = await createStudent(coachDemo.id, {
    name: "Diego Herrera", email: "cliente@mycoach.app", avatarInitials: "DH", avatarColor: "#3b82f6",
    currentWeight: 79.2, previousWeight: 78.7, lastWeighIn: "2026-06-05", stage: "Volumen", stageNumber: 1,
    paymentStatus: "active", joinedDate: "2025-12-08", streak: 24, completionRate: 88, height: 1.75, bodyFat: 14,
    notes: "6 meses de progreso constante en volumen limpio. Buen control de adherencia.",
    diet: STAR_DIET, routine: ppl, weightHistory: STAR_WEIGHT_HISTORY, measurements: STAR_MEASUREMENTS,
  });
  await prisma.student.update({ where: { id: star.id }, data: { userId: clientUser.id } });

  // Carreras del estrella
  for (const r of STAR_RUNS) {
    await prisma.carrera.create({ data: { userId: clientUser.id, date: r.date, distanceM: r.distanceM, durationS: r.durationS, avgSpeedKmh: Math.round((r.distanceM / r.durationS) * 3.6 * 10) / 10, trackJson: JSON.stringify(makeTrack(r.baseLat, r.baseLng, r.points, r.scale)) } });
  }

  // Sesiones registradas del estrella
  for (const log of starLogs(cat, ppl)) {
    await prisma.exerciseLog.create({ data: { studentId: star.id, ...log } });
  }

  // Fotos de progreso del estrella (placeholders con fecha)
  const starPhotos = [
    { url: "https://picsum.photos/seed/diego-1/400/600", label: "Inicio", weight: 75.0, createdAt: new Date("2025-12-10T08:00:00Z") },
    { url: "https://picsum.photos/seed/diego-2/400/600", label: "3 meses", weight: 77.3, createdAt: new Date("2026-03-10T08:00:00Z") },
    { url: "https://picsum.photos/seed/diego-3/400/600", label: "6 meses", weight: 79.2, createdAt: new Date("2026-06-05T08:00:00Z") },
  ];
  for (const p of starPhotos) await prisma.progressPhoto.create({ data: { studentId: star.id, ...p } });

  // Cumplimiento de DIETA del estrella (comidas marcadas por día)
  const dietDays: Record<string, string[]> = {
    "2026-06-08": ["Desayuno", "Media mañana", "Comida", "Pre-entreno", "Cena"],
    "2026-06-07": ["Desayuno", "Comida", "Pre-entreno", "Cena"],
    "2026-06-06": ["Desayuno", "Media mañana", "Comida", "Cena"],
    "2026-06-05": ["Desayuno", "Comida", "Cena"],
    "2026-06-04": ["Desayuno", "Media mañana", "Comida", "Pre-entreno", "Cena"],
    "2026-06-03": ["Desayuno", "Comida", "Pre-entreno"],
    "2026-06-02": ["Desayuno", "Media mañana", "Comida", "Cena"],
  };
  for (const [date, meals] of Object.entries(dietDays)) {
    for (const meal of meals) {
      await prisma.dailyCheck.create({ data: { studentId: star.id, date, kind: "meal", itemKey: meal } });
    }
  }

  // ── 2 alumnos ligeros del coach demo ──
  await createStudent(coachDemo.id, {
    name: "Laura Sánchez Cruz", email: "laura.sanchez@gmail.com", avatarInitials: "LS", avatarColor: "#ec4899",
    currentWeight: 58.4, previousWeight: 59.0, lastWeighIn: "2026-06-04", stage: "Definición", stageNumber: 2,
    paymentStatus: "active", joinedDate: "2026-03-15", streak: 9, completionRate: 76, height: 1.64,
    weightHistory: [{ date: "2026-03-15", weight: 61.0 }, { date: "2026-04-20", weight: 59.8 }, { date: "2026-06-04", weight: 58.4 }],
  });
  await createStudent(coachDemo.id, {
    name: "Marco Díaz Luna", email: "marco.diaz@hotmail.com", avatarInitials: "MD", avatarColor: "#f59e0b",
    currentWeight: 88.0, previousWeight: 87.5, lastWeighIn: "2026-05-29", stage: "Mantenimiento", stageNumber: 3,
    paymentStatus: "grace_period", joinedDate: "2026-02-01", streak: 0, completionRate: 41, height: 1.80,
    weightHistory: [{ date: "2026-02-01", weight: 90.0 }, { date: "2026-05-29", weight: 88.0 }],
  });

  // ── 2 alumnos ligeros del coach 2 ──
  await createStudent(coach2.id, {
    name: "Sofía Ramírez Peña", email: "sofia.ramirez@gmail.com", avatarInitials: "SR", avatarColor: "#22c55e",
    currentWeight: 64.0, previousWeight: 65.2, lastWeighIn: "2026-06-02", stage: "Recomposición", stageNumber: 1,
    paymentStatus: "active", joinedDate: "2026-04-10", streak: 15, completionRate: 91, height: 1.68,
    weightHistory: [{ date: "2026-04-10", weight: 66.0 }, { date: "2026-06-02", weight: 64.0 }],
  });
  await createStudent(coach2.id, {
    name: "Roberto Guzmán Ortiz", email: "roberto.guzman@yahoo.com", avatarInitials: "RG", avatarColor: "#a78bfa",
    currentWeight: 95.0, previousWeight: 93.2, lastWeighIn: "2026-06-03", stage: "Volumen", stageNumber: 2,
    paymentStatus: "inactive", joinedDate: "2025-11-20", streak: 0, completionRate: 30, height: 1.83,
    weightHistory: [{ date: "2025-11-20", weight: 91.0 }, { date: "2026-06-03", weight: 95.0 }],
  });

  console.log("\n✅ Seed completado. Credenciales:");
  console.log("   ADMIN   → admin@mycoach.app   / admin123");
  console.log("   COACH   → coach@mycoach.app   / coach123   (Coach Demo · 3 alumnos)");
  console.log("   COACH 2 → coach2@mycoach.app  / coach123   (Coach Fitness · 2 alumnos)");
  console.log("   ALUMNO  → cliente@mycoach.app / cliente123 (Diego Herrera · estrella)");
  console.log(`   · ${CATALOGO.length} ejercicios en catálogo, rutina PPL del catálogo, ${starLogs(cat, ppl).length} sesiones, ${STAR_RUNS.length} carreras.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
