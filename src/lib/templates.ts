import type { Meal, RoutineDay } from "./mock-data";

export interface DietTemplate {
  id: string;
  name: string;
  totalCalories: number;
  macros: { protein: number; carbs: number; fat: number };
  meals: Meal[];
}

export interface RoutineTemplate {
  id: string;
  name: string;
  daysPerWeek: number;
  days: RoutineDay[];
}

export const DIET_TEMPLATES: DietTemplate[] = [
  {
    id: "diet_volumen",
    name: "Hipertrofia Limpia (Volumen)",
    totalCalories: 2800,
    macros: { protein: 180, carbs: 380, fat: 60 },
    meals: [
      {
        name: "Desayuno Anabólico",
        time: "07:30",
        calories: 750,
        protein: 45,
        carbs: 95,
        fat: 18,
        items: ["4 huevos enteros revueltos", "1.5 tazas de avena cocida con leche entera", "1 plátano picado", "1 cda de miel"],
      },
      {
        name: "Almuerzo de Volumen",
        time: "13:30",
        calories: 850,
        protein: 55,
        carbs: 110,
        fat: 22,
        items: ["200g de pechuga de pollo asada", "1.5 tazas de arroz blanco jazmín", "Ensalada mixta", "1 cda de aceite de oliva"],
      },
      {
        name: "Batido Pre-Entreno",
        time: "17:00",
        calories: 450,
        protein: 30,
        carbs: 65,
        fat: 8,
        items: ["1 scoop de proteína de suero (whey)", "1.5 tazas de leche de almendras", "1 taza de fresas", "50g de crema de cacahuate"],
      },
      {
        name: "Cena de Construcción",
        time: "20:30",
        calories: 750,
        protein: 50,
        carbs: 110,
        fat: 12,
        items: ["180g de filete de res magro", "300g de camote al horno", "Brócoli salteado con ajo"],
      },
    ],
  },
  {
    id: "diet_definicion",
    name: "Déficit Calórico (Definición)",
    totalCalories: 1800,
    macros: { protein: 155, carbs: 170, fat: 50 },
    meals: [
      {
        name: "Desayuno Definición",
        time: "08:00",
        calories: 380,
        protein: 35,
        carbs: 35,
        fat: 10,
        items: ["3 claras + 1 huevo entero revuelto", "½ taza avena cocida con agua", "½ taza de fresas"],
      },
      {
        name: "Almuerzo Saciante",
        time: "13:30",
        calories: 520,
        protein: 45,
        carbs: 55,
        fat: 12,
        items: ["150g de pechuga de pollo a la plancha", "¾ taza de arroz integral", "Ensalada verde gigante (sin aderezo graso)", "1 cda aceite de oliva"],
      },
      {
        name: "Merienda Proteica",
        time: "17:00",
        calories: 200,
        protein: 25,
        carbs: 10,
        fat: 6,
        items: ["Yogur griego Fage 0% grasa (170g)", "15 almendras", "Canela al gusto"],
      },
      {
        name: "Cena Ligera",
        time: "20:30",
        calories: 700,
        protein: 50,
        carbs: 70,
        fat: 22,
        items: ["180g de salmón al horno", "150g de camote asado", "Brócoli o espárragos al vapor"],
      },
    ],
  },
  {
    id: "diet_recomposicion",
    name: "Recomposición Estándar",
    totalCalories: 2200,
    macros: { protein: 170, carbs: 240, fat: 60 },
    meals: [
      {
        name: "Desayuno Recomp",
        time: "07:30",
        calories: 500,
        protein: 40,
        carbs: 55,
        fat: 12,
        items: ["3 huevos enteros revueltos", "1 taza de avena con agua", "½ plátano"],
      },
      {
        name: "Comida Equilibrada",
        time: "13:30",
        calories: 650,
        protein: 50,
        carbs: 75,
        fat: 16,
        items: ["180g pechuga de pollo", "1 taza de arroz blanco integral", "Ensalada mixta", "1 cda aceite de oliva"],
      },
      {
        name: "Snack Proteico",
        time: "17:00",
        calories: 350,
        protein: 35,
        carbs: 30,
        fat: 10,
        items: ["1.5 scoop Whey Protein con agua", "1 manzana mediana", "30g de nueces mixtas"],
      },
      {
        name: "Cena de Recuperación",
        time: "20:00",
        calories: 700,
        protein: 45,
        carbs: 80,
        fat: 22,
        items: ["160g de salmón salvaje", "200g de camote al horno", "Ensalada verde con espinaca y pepino"],
      },
    ],
  },
];

export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {
    id: "routine_ppl",
    name: "Rutina PPL (Push-Pull-Legs) 6 días",
    daysPerWeek: 6,
    days: [
      {
        day: "Lunes",
        label: "Push (Empuje)",
        muscleGroup: "Pecho · Hombro · Tríceps",
        exercises: [
          { name: "Press de Banca Plano con Barra", sets: 4, reps: "8-10", weight: "50 kg", rest: "90s" },
          { name: "Press Inclinado con Mancuernas", sets: 3, reps: "10-12", weight: "18 kg", rest: "75s" },
          { name: "Press Militar de Hombro", sets: 4, reps: "8-10", weight: "30 kg", rest: "90s" },
          { name: "Elevaciones Laterales en Polea", sets: 3, reps: "15", weight: "8 kg", rest: "60s" },
          { name: "Copa de Tríceps con Mancuerna", sets: 3, reps: "12", weight: "12 kg", rest: "65s" },
        ],
      },
      {
        day: "Martes",
        label: "Pull (Jalón)",
        muscleGroup: "Espalda · Bíceps",
        exercises: [
          { name: "Dominadas Pronas (o Jalón)", sets: 4, reps: "8-10", rest: "90s" },
          { name: "Remo con Barra T", sets: 4, reps: "10", weight: "40 kg", rest: "90s" },
          { name: "Remo Sentado en Polea Giratoria", sets: 3, reps: "12", weight: "45 kg", rest: "75s" },
          { name: "Curl de Bíceps con Barra EZ", sets: 3, reps: "12", weight: "22 kg", rest: "60s" },
          { name: "Curl de Martillo Alterno", sets: 3, reps: "12", weight: "10 kg", rest: "60s" },
        ],
      },
      {
        day: "Miércoles",
        label: "Legs (Piernas)",
        muscleGroup: "Cuádriceps · Isquios · Pantorrillas",
        exercises: [
          { name: "Sentadilla Libre con Barra", sets: 4, reps: "6-8", weight: "60 kg", rest: "120s" },
          { name: "Prensa Inclinada 45°", sets: 4, reps: "12", weight: "120 kg", rest: "90s" },
          { name: "Peso Muerto Rumano con Mancuernas", sets: 3, reps: "10", weight: "20 kg", rest: "90s" },
          { name: "Extensiones de Cuádriceps", sets: 3, reps: "15", weight: "35 kg", rest: "60s" },
          { name: "Costurera (Pantorrilla)", sets: 4, reps: "20", weight: "30 kg", rest: "45s" },
        ],
      },
    ],
  },
  {
    id: "routine_fullbody",
    name: "Rutina Full Body 3 días",
    daysPerWeek: 3,
    days: [
      {
        day: "Lunes",
        label: "Full Body A",
        muscleGroup: "Todo el Cuerpo",
        exercises: [
          { name: "Sentadilla Libre", sets: 4, reps: "8", weight: "50 kg", rest: "90s" },
          { name: "Press de Banca Plano", sets: 4, reps: "8", weight: "45 kg", rest: "90s" },
          { name: "Remo Pendlay", sets: 3, reps: "8", weight: "35 kg", rest: "75s" },
          { name: "Press Militar", sets: 3, reps: "10", weight: "25 kg", rest: "75s" },
          { name: "Elevaciones de Talones de pie", sets: 3, reps: "15", weight: "40 kg", rest: "60s" },
        ],
      },
      {
        day: "Miércoles",
        label: "Full Body B",
        muscleGroup: "Todo el Cuerpo",
        exercises: [
          { name: "Peso Muerto Convencional", sets: 3, reps: "5", weight: "70 kg", rest: "120s" },
          { name: "Press Inclinado con Mancuernas", sets: 3, reps: "10", weight: "16 kg", rest: "75s" },
          { name: "Jalón al Pecho Agarre Abierto", sets: 4, reps: "10", weight: "45 kg", rest: "75s" },
          { name: "Zancadas con Barra", sets: 3, reps: "10 c/lado", weight: "20 kg", rest: "75s" },
          { name: "Plancha Abdominal", sets: 3, reps: "60s", rest: "45s" },
        ],
      },
      {
        day: "Viernes",
        label: "Full Body C",
        muscleGroup: "Todo el Cuerpo",
        exercises: [
          { name: "Prensa 45°", sets: 4, reps: "10", weight: "100 kg", rest: "90s" },
          { name: "Fondos en Paralelas", sets: 3, reps: "AMRAP", rest: "90s" },
          { name: "Remo con Mancuerna a una mano", sets: 3, reps: "12", weight: "18 kg", rest: "75s" },
          { name: "Curl de Bíceps Alterno", sets: 3, reps: "12", weight: "10 kg", rest: "60s" },
          { name: "Rompecráneos con Barra EZ", sets: 3, reps: "12", weight: "18 kg", rest: "60s" },
        ],
      },
    ],
  },
  {
    id: "routine_torso_pierna",
    name: "Rutina Torso-Pierna 4 días",
    daysPerWeek: 4,
    days: [
      {
        day: "Lunes",
        label: "Torso Superior",
        muscleGroup: "Pecho · Espalda · Hombros · Brazos",
        exercises: [
          { name: "Press de Banca Plano", sets: 4, reps: "8", weight: "50 kg", rest: "90s" },
          { name: "Remo con Barra", sets: 4, reps: "8", weight: "40 kg", rest: "90s" },
          { name: "Press Arnold de Hombros", sets: 3, reps: "12", weight: "12 kg", rest: "75s" },
          { name: "Jalón Supino Cerrado", sets: 3, reps: "10", weight: "50 kg", rest: "75s" },
          { name: "Dips de Tríceps", sets: 3, reps: "AMRAP", rest: "60s" },
        ],
      },
      {
        day: "Martes",
        label: "Pierna Dominante Cuádriceps",
        muscleGroup: "Cuádriceps · Femorales · Pantorrillas",
        exercises: [
          { name: "Sentadilla Frontal", sets: 4, reps: "8", weight: "40 kg", rest: "90s" },
          { name: "Peso Muerto Rumano", sets: 4, reps: "10", weight: "50 kg", rest: "90s" },
          { name: "Zancadas Caminando con Mancuernas", sets: 3, reps: "12 pasos", weight: "10 kg", rest: "75s" },
          { name: "Prensa Unilateral", sets: 3, reps: "12 c/lado", weight: "40 kg", rest: "60s" },
          { name: "Elevación de Talones sentado", sets: 4, reps: "15", weight: "30 kg", rest: "45s" },
        ],
      },
    ],
  },
];
