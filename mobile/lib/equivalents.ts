/* ═══════════════════════════════════════════
   Catálogo de equivalencias / sustituciones de
   alimentos — portado 1:1 de la web
   (src/app/portal/page.tsx). Mantener sincronizado.
   ═══════════════════════════════════════════ */
import type { Equivalent } from "@/lib/data";

export const EQUIV_CARBS: Equivalent[] = [
  { name: "Arroz blanco", gramsPerCarb: 3.3, icon: "rice", note: "Digestión rápida, post-entreno", macroType: "carb" },
  { name: "Avena", gramsPerCarb: 5.3, icon: "oats", note: "Alta en beta-glucanos", macroType: "carb" },
  { name: "Camote", gramsPerCarb: 5.8, icon: "sweet-potato", note: "Alto en potasio y vitamina A", macroType: "carb" },
  { name: "Papa cocida", gramsPerCarb: 6.25, icon: "potato", note: "Versátil y saciante", macroType: "carb" },
  { name: "Tortilla de maíz", gramsPerCarb: 4.0, icon: "tortilla", note: "2 tortillas pequeñas por porción", macroType: "carb" },
  { name: "Pan integral", gramsPerCarb: 4.35, icon: "bread", note: "100% integral preferible", macroType: "carb" },
  { name: "Plátano", gramsPerCarb: 4.35, icon: "banana", note: "Ideal pre-entreno", macroType: "carb" },
];

export const EQUIV_PROTEIN: Equivalent[] = [
  { name: "Pechuga de Pollo", gramsPerProtein: 4.5, icon: "chicken", note: "Proteína magra #1", macroType: "protein" },
  { name: "Carne magra", gramsPerProtein: 5.0, icon: "beef", note: "Rica en zinc y B12", macroType: "protein" },
  { name: "Atún en agua", gramsPerProtein: 4.0, icon: "tuna", note: "Omega-3 y bajo en grasa", macroType: "protein" },
  { name: "Salmón", gramsPerProtein: 5.3, icon: "fish", note: "Grasa saludable omega-3", macroType: "protein" },
  { name: "Huevo entero", gramsPerProtein: 8.0, icon: "egg", note: "Proteína completa", macroType: "protein" },
  { name: "Leche descremada", gramsPerProtein: 10.0, icon: "milk", note: "Calcio + proteína", macroType: "protein" },
];

// Catálogo combinado — usado para mostrar
export const EQUIV_CATALOG: Equivalent[] = [...EQUIV_PROTEIN, ...EQUIV_CARBS];
