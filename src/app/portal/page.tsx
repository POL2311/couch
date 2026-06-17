"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { signOut } from "next-auth/react";
import {
  LogOut, Camera, Loader2, CheckCircle2, Download, TrendingDown,
  Dumbbell, ChevronRight, ChevronLeft, X, ArrowLeftRight, RefreshCw,
  LayoutGrid, TrendingUp, Users, User, Sparkles, CreditCard,
  Calendar, AlertTriangle, Flame, Ruler, Droplet, Droplets, Plus, Weight,
  BarChart3, Info, Utensils, Activity, UserCircle2, Printer, MessageCircle, Send, Lock,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Skeleton } from "@/components/skeleton";
import { downloadBadge } from "@/lib/badge";
import type { Student, StudentDetail, RoutineDay } from "@/lib/mock-data";

type Detail = StudentDetail & { height?: number; bodyFat?: number; photoName?: string };
type TabId = "today" | "progress" | "comunidad" | "profile";

interface Ingredient {
  name: string; grams: number; calories: number;
  unit?: string; icon?: string;
  macros?: { protein: number; carbs: number; fat: number };
}
interface Meal {
  name: string; time: string; calories: number; items: string[];
  macros?: { protein: number; carbs: number; fat: number };
  ingredients?: Ingredient[];
}
interface Exercise {
  name: string; sets: number; reps: string | number;
  muscleGroup?: string; tips?: string[];
  imageUrl?: string; videoUrl?: string;
}

interface WorkoutSet {
  setNumber:  number;
  targetReps: number;
  actualReps: number;
  weight:     number;
  completed:  boolean;
}
interface WorkoutLogEntry {
  id: string;
  date: string;
  exerciseName: string;
  muscleGroup: string | null;
  prescribedSets: number;
  prescribedReps: string;
  sets: WorkoutSet[];
  completed: boolean;
}
interface WorkoutSessionEntry {
  id: string;
  date: string;
  name: string;
  completed: boolean;
  exerciseLogs: { exerciseName: string; sets: WorkoutSet[]; completed: boolean }[];
}

/* ══════════════════════════════════════════════════════════════
   NIKE ATHLETIC DARK PALETTE — Carbon Black + Kinetic Volt
══════════════════════════════════════════════════════════════ */
const VOLT = "#D4FF00";
const F = {
  bg:       "#070708",                          // Near-pure black
  card:     "#0e0e10",                          // Bento card surface
  cardGlass:"rgba(14,14,16,0.80)",              // Deep frosted glass
  border:   "rgba(255,255,255,0.06)",           // Hairline white
  shadow:   "0 25px 50px -12px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.04) inset",
  tp:       "#ffffff",
  ts:       "#a1a1aa",
  tt:       "#3f3f46",
  blue:     VOLT,
  blueHov:  "#c4ef00",
  blueBg:   "rgba(212,255,0,0.08)",
  track:    "rgba(255,255,255,0.08)",
  protein:  "#60a5fa",
  carbs:    "#fb923c",
  fat:      "#f472b6",
  green:    "#34d399",
  red:      "#f87171",
  volt:     VOLT,
  voltBg:   "rgba(212,255,0,0.08)",
  voltBor:  "rgba(212,255,0,0.22)",
  navBg:    "#070708",
  navBor:   "rgba(255,255,255,0.06)",
  active:   VOLT,                               // Volt for active nav state
  inactive: "#3f3f46",                          // Muted zinc
} as const;

/* ══════════════════════════════════════════════════════════════
   FOOD SVG ILLUSTRATIONS
══════════════════════════════════════════════════════════════ */
function IlluChicken() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width={26} height={26}>
      <ellipse cx="20" cy="23" rx="10" ry="8" fill="#F5A623"/>
      <ellipse cx="20" cy="22" rx="9" ry="7" fill="#F7BC52"/>
      <ellipse cx="17" cy="19" rx="4" ry="2.5" fill="#FBCF72" opacity="0.7"/>
      <rect x="18.5" y="28" width="3" height="7" rx="1.5" fill="#F0E6D3"/>
      <ellipse cx="20" cy="35.5" rx="2.5" ry="1.5" fill="#E8D5BA"/>
    </svg>
  );
}
function IlluBeef() {
  return (
    <svg viewBox="0 0 40 40" fill="none" width={26} height={26}>
      <ellipse cx="20" cy="22" rx="13" ry="9" fill="#C0392B"/>
      <ellipse cx="20" cy="21" rx="12" ry="8" fill="#E74C3C"/>
      <ellipse cx="14" cy="20" rx="2.5" ry="1.2" fill="#F5CBA7" opacity="0.9"/>
      <ellipse cx="22" cy="18" rx="3" ry="1" fill="#F5CBA7" opacity="0.8"/>
      <ellipse cx="26" cy="23" rx="2" ry="1" fill="#F5CBA7" opacity="0.7"/>
      <path d="M12 17 Q16 15 20 17" stroke="#A93226" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M18 19 Q22 17 26 19" stroke="#A93226" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function IlluEgg() {
  return (
    <svg viewBox="0 0 40 40" fill="none" width={26} height={26}>
      <ellipse cx="20" cy="23" rx="13" ry="9" fill="#F5F0E8"/>
      <ellipse cx="15" cy="19" rx="5" ry="3" fill="#fff" opacity="0.55"/>
      <circle cx="20" cy="22" r="6" fill="#F39C12"/>
      <circle cx="20" cy="21.5" r="5.5" fill="#F5B041"/>
      <ellipse cx="18" cy="19.5" rx="2" ry="1.3" fill="#FDEBD0" opacity="0.7"/>
    </svg>
  );
}
function IlluBread() {
  return (
    <svg viewBox="0 0 40 40" fill="none" width={26} height={26}>
      <rect x="8" y="22" width="24" height="10" rx="3" fill="#C8832A"/>
      <ellipse cx="20" cy="22" rx="12" ry="7" fill="#D4934A"/>
      <ellipse cx="20" cy="21" rx="11" ry="6" fill="#E8A857"/>
      <path d="M14 17 L14 24" stroke="#B8712A" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M20 15 L20 24" stroke="#B8712A" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M26 17 L26 24" stroke="#B8712A" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function IlluMilk() {
  return (
    <svg viewBox="0 0 40 40" fill="none" width={26} height={26}>
      <path d="M13 14 L15 34 H25 L27 14 Z" fill="#E8F4FD"/>
      <path d="M14.5 20 L16 34 H24 L25.5 20 Z" fill="#fff"/>
      <rect x="11" y="12" width="18" height="4" rx="2" fill="#A8C8E8"/>
      <rect x="15" y="22" width="2.5" height="8" rx="1.2" fill="#fff" opacity="0.7"/>
    </svg>
  );
}
function IlluPotato() {
  return (
    <svg viewBox="0 0 40 40" fill="none" width={26} height={26}>
      <ellipse cx="20" cy="22" rx="13" ry="9" fill="#C9A96E"/>
      <ellipse cx="20" cy="21" rx="12" ry="8" fill="#D4B97E"/>
      <circle cx="14" cy="20" r="1.2" fill="#A8823E"/>
      <circle cx="25" cy="19" r="0.9" fill="#A8823E"/>
      <ellipse cx="16" cy="17" rx="4" ry="2.5" fill="#F0D9A8" opacity="0.5"/>
    </svg>
  );
}
function IlluRice() {
  return (
    <svg viewBox="0 0 40 40" fill="none" width={26} height={26}>
      <path d="M8 24 Q8 34 20 34 Q32 34 32 24 Z" fill="#D4A853"/>
      <ellipse cx="20" cy="24" rx="12" ry="4" fill="#E8B96A"/>
      <ellipse cx="20" cy="21" rx="11" ry="7" fill="#F8F4EC"/>
      {[14,17,20,23,26,15,19,23,17,21].map((x,i)=>(
        <ellipse key={i} cx={x} cy={18+(i%3)*2} rx="1.5" ry="0.7" fill="#EDE8DC" transform={`rotate(${i*18} ${x} ${18+(i%3)*2})`}/>
      ))}
    </svg>
  );
}
function IlluFish() {
  return (
    <svg viewBox="0 0 40 40" fill="none" width={26} height={26}>
      <ellipse cx="19" cy="22" rx="12" ry="7" fill="#5BA4CF"/>
      <ellipse cx="19" cy="21.5" rx="11" ry="6" fill="#74B9E3"/>
      <path d="M30 22 L37 17 L37 27 Z" fill="#4A90C4"/>
      <circle cx="11" cy="20" r="2" fill="#fff"/>
      <circle cx="11" cy="20" r="1" fill="#1a1a2e"/>
      <path d="M16 17 Q20 12 24 17" fill="#5BA4CF" stroke="#4A90C4" strokeWidth="0.5"/>
    </svg>
  );
}
function IlluOats() {
  return (
    <svg viewBox="0 0 40 40" fill="none" width={26} height={26}>
      <path d="M9 25 Q9 35 20 35 Q31 35 31 25 Z" fill="#C8934A"/>
      <ellipse cx="20" cy="25" rx="11" ry="3.5" fill="#D4A45C"/>
      <ellipse cx="20" cy="22" rx="10" ry="6.5" fill="#E8C98A"/>
      <ellipse cx="15" cy="20" rx="2" ry="1" fill="#D4B06A" transform="rotate(-20 15 20)"/>
      <ellipse cx="20" cy="19" rx="2" ry="1" fill="#D4B06A" transform="rotate(10 20 19)"/>
      <ellipse cx="25" cy="21" rx="2" ry="1" fill="#D4B06A" transform="rotate(-15 25 21)"/>
    </svg>
  );
}
function IlluSweetPotato() {
  return (
    <svg viewBox="0 0 40 40" fill="none" width={26} height={26}>
      <ellipse cx="20" cy="23" rx="14" ry="9" fill="#E07B39"/>
      <ellipse cx="20" cy="22" rx="13" ry="8" fill="#F0904A"/>
      <path d="M10 22 Q15 19 20 22 Q25 25 30 22" stroke="#D06830" strokeWidth="1" fill="none" opacity="0.6"/>
      <ellipse cx="20" cy="15" rx="2" ry="3" fill="#5D8A3C" transform="rotate(10 20 15)"/>
    </svg>
  );
}
function IlluSalad() {
  return (
    <svg viewBox="0 0 40 40" fill="none" width={26} height={26}>
      <path d="M8 26 Q8 36 20 36 Q32 36 32 26 Z" fill="#C8834A"/>
      <ellipse cx="14" cy="22" rx="5" ry="4" fill="#4CAF50" transform="rotate(-15 14 22)"/>
      <ellipse cx="22" cy="20" rx="6" ry="4" fill="#66BB6A" transform="rotate(10 22 20)"/>
      <ellipse cx="18" cy="23" rx="5" ry="3.5" fill="#388E3C" transform="rotate(-5 18 23)"/>
      <circle cx="26" cy="23" r="3.5" fill="#E53935"/>
    </svg>
  );
}
function IlluTuna() {
  return (
    <svg viewBox="0 0 40 40" fill="none" width={26} height={26}>
      <ellipse cx="20" cy="27" rx="13" ry="5" fill="#A8B8C8"/>
      <rect x="7" y="18" width="26" height="9" fill="#B8C8D8"/>
      <ellipse cx="20" cy="18" rx="13" ry="5" fill="#C8D8E8"/>
      <ellipse cx="20" cy="18" rx="8" ry="2.5" fill="#F4A261"/>
    </svg>
  );
}
function IlluBanana() {
  return (
    <svg viewBox="0 0 40 40" fill="none" width={26} height={26}>
      <path d="M10 28 Q10 12 22 10 Q30 9 32 14 Q34 19 28 24 Q22 29 10 28 Z" fill="#FBBF24"/>
      <path d="M11 27 Q11 14 22 12 Q29 11 31 15 Q33 20 27 24 Q22 28 11 27 Z" fill="#FCD34D"/>
      <path d="M10 28 Q8 30 9 32 Q10 33 12 31 Q11 29 10 28 Z" fill="#D97706"/>
    </svg>
  );
}
function IlluTortilla() {
  return (
    <svg viewBox="0 0 40 40" fill="none" width={26} height={26}>
      <ellipse cx="20" cy="28" rx="13" ry="4" fill="#C8934A"/>
      <ellipse cx="20" cy="25" rx="13" ry="4" fill="#D4A45C"/>
      <ellipse cx="20" cy="22" rx="13" ry="4" fill="#F0C878"/>
      <circle cx="15" cy="21" r="1" fill="#C8834A" opacity="0.5"/>
      <circle cx="24" cy="22" r="0.8" fill="#C8834A" opacity="0.5"/>
    </svg>
  );
}

const ILLU_MAP: Record<string, React.FC> = {
  chicken: IlluChicken, beef: IlluBeef, egg: IlluEgg,
  bread: IlluBread, wheat: IlluBread, milk: IlluMilk,
  potato: IlluPotato, apple: IlluSweetPotato, rice: IlluRice,
  fish: IlluFish, oats: IlluOats, "sweet-potato": IlluSweetPotato,
  salad: IlluSalad, tuna: IlluTuna, banana: IlluBanana,
  tortilla: IlluTortilla, default: IlluEgg,
};

const ILLU_BG: Record<string, string> = {
  chicken:"rgba(245,166,35,0.12)", beef:"rgba(192,57,43,0.1)",
  egg:"rgba(243,156,18,0.1)", bread:"rgba(212,147,90,0.1)",
  wheat:"rgba(212,147,90,0.1)", milk:"rgba(100,180,230,0.1)",
  potato:"rgba(201,169,110,0.1)", apple:"rgba(224,123,57,0.12)",
  rice:"rgba(200,190,170,0.12)", fish:"rgba(91,164,207,0.1)",
  oats:"rgba(232,201,138,0.12)", "sweet-potato":"rgba(224,123,57,0.14)",
  salad:"rgba(76,175,80,0.1)", tuna:"rgba(168,184,200,0.14)",
  banana:"rgba(251,191,36,0.12)", tortilla:"rgba(240,200,120,0.12)",
  default:"rgba(79,122,248,0.08)",
};

function FoodIllu({ iconKey, size = 44 }: { iconKey?: string; size?: number }) {
  const key = iconKey ?? "default";
  const Comp = ILLU_MAP[key] ?? ILLU_MAP.default;
  const bg = ILLU_BG[key] ?? ILLU_BG.default;
  return (
    <div style={{
      width: size, height: size, borderRadius: 12,
      background: bg, border: `1px solid ${F.border}`,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Comp />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   EQUIVALENTS CATALOG
══════════════════════════════════════════════════════════════ */
interface Equivalent {
  name: string; gramsPerCarb?: number; gramsPerProtein?: number;
  icon?: string; note?: string; macroType?: "carb" | "protein";
}

interface FoodSubstituteDTO {
  id: string; category: string; originalFood: string; substituteFood: string; ratio: number;
}

const ICON_HINTS: [string, string][] = [
  ["Pechuga", "chicken"], ["Pollo", "chicken"], ["pollo", "chicken"],
  ["Carne", "beef"], ["Atún", "tuna"], ["Salmón", "fish"],
  ["Huevo", "egg"], ["Leche", "milk"],
  ["Arroz", "rice"], ["Avena", "oats"], ["Camote", "sweet-potato"],
  ["Papa", "potato"], ["Tortilla", "tortilla"], ["Pan", "bread"], ["Plátano", "banana"],
];
const guessIcon = (name: string): string => {
  for (const [key, icon] of ICON_HINTS) if (name.includes(key)) return icon;
  return "salad";
};
const toEquivalent = (s: FoodSubstituteDTO): Equivalent => ({
  name: s.substituteFood,
  icon: guessIcon(s.substituteFood),
  macroType: s.category === "Proteínas" ? "protein" : "carb",
  gramsPerProtein: s.category === "Proteínas" ? s.ratio : undefined,
  gramsPerCarb:    s.category === "Carbohidratos" ? s.ratio : undefined,
});
const EQUIV_CARBS: Equivalent[] = [
  { name: "Arroz blanco",     gramsPerCarb: 3.3,  icon: "rice",         macroType: "carb" },
  { name: "Avena",            gramsPerCarb: 5.3,  icon: "oats",         macroType: "carb" },
  { name: "Camote",           gramsPerCarb: 5.8,  icon: "sweet-potato", macroType: "carb" },
  { name: "Papa cocida",      gramsPerCarb: 6.25, icon: "potato",       macroType: "carb" },
  { name: "Tortilla de maíz", gramsPerCarb: 4.0,  icon: "tortilla",     macroType: "carb" },
  { name: "Pan integral",     gramsPerCarb: 4.35, icon: "bread",        macroType: "carb" },
  { name: "Plátano",          gramsPerCarb: 4.35, icon: "banana",       macroType: "carb" },
];
const EQUIV_PROTEIN: Equivalent[] = [
  { name: "Pechuga de Pollo", gramsPerProtein: 4.5, icon: "chicken", macroType: "protein" },
  { name: "Carne magra",      gramsPerProtein: 5.0, icon: "beef",    macroType: "protein" },
  { name: "Atún en agua",     gramsPerProtein: 4.0, icon: "tuna",    macroType: "protein" },
  { name: "Salmón",           gramsPerProtein: 5.3, icon: "fish",    macroType: "protein" },
  { name: "Huevo entero",     gramsPerProtein: 8.0, icon: "egg",     macroType: "protein" },
  { name: "Leche descremada", gramsPerProtein:10.0, icon: "milk",    macroType: "protein" },
];
const EQUIV_CATALOG: Equivalent[] = [...EQUIV_PROTEIN, ...EQUIV_CARBS];

/* ══════════════════════════════════════════════════════════════
   BOTTOM SHEET (light)
══════════════════════════════════════════════════════════════ */
function BottomSheet({ open, onClose, children }: {
  open: boolean; onClose: () => void; children: React.ReactNode;
}) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose} style={{ animation: "bsFadeIn 0.2s ease" }} />
      <div className="relative rounded-t-3xl overflow-y-auto"
        style={{
          background: F.card,
          borderTop: `1px solid ${F.border}`,
          maxHeight: "92vh",
          animation: "bsSlideUp 0.28s cubic-bezier(0.32,0.72,0,1)",
          paddingBottom: "env(safe-area-inset-bottom,0px)",
        }}>
        <div className="sticky top-0 flex justify-center pt-3 pb-2 z-10" style={{ background: F.card }}>
          <div className="w-9 h-[3px] rounded-full" style={{ background: F.border }} />
        </div>
        <button onClick={onClose}
          className="absolute top-3.5 right-4 w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: F.bg }}>
          <X size={14} style={{ color: F.ts }} />
        </button>
        <div className="px-5 pb-10">{children}</div>
      </div>
      <style>{`
        @keyframes bsFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes bsSlideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dotPop { from{transform:translateX(-50%) scale(0)} to{transform:translateX(-50%) scale(1)} }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MEAL SHEET (light)
══════════════════════════════════════════════════════════════ */
function EquivCatalog({ ingredient, selected, onSelect, catalog }: {
  ingredient: Ingredient; selected: Equivalent | null;
  onSelect: (eq: Equivalent | null) => void;
  catalog?: Equivalent[];
}) {
  const baseCarbs   = ingredient.macros?.carbs    ?? Math.round(ingredient.calories * 0.45 / 4);
  const baseProtein = ingredient.macros?.protein  ?? Math.round(ingredient.calories * 0.25 / 4);
  const [activeTab, setActiveTabLocal] = useState<"protein"|"carb">("protein");
  const source = catalog ?? EQUIV_CATALOG;
  const list = source.filter(e => e.macroType === activeTab);
  const calcGrams = (eq: Equivalent) =>
    eq.macroType === "protein"
      ? Math.round(baseProtein * (eq.gramsPerProtein ?? 5))
      : Math.round(baseCarbs * (eq.gramsPerCarb ?? 0));

  return (
    <div style={{ animation: "fadeSlideIn 0.22s ease" }}>
      <p className="text-[12px] font-medium mb-3" style={{ color: F.ts }}>
        Cambios para <span style={{ color: F.tp, fontWeight: 600 }}>{ingredient.name}</span>
      </p>
      <div className="flex gap-1.5 mb-4 p-1 rounded-xl" style={{ background: F.bg, border: `1px solid ${F.border}` }}>
        {(["protein","carb"] as const).map(t => (
          <button key={t} onClick={() => setActiveTabLocal(t)}
            className="flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200"
            style={{
              background: activeTab === t ? F.blue : "transparent",
              color: activeTab === t ? "#000" : F.ts,
            }}>
            {t === "protein" ? "🥩 Proteína" : "🌾 Carbohidratos"}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {list.map((eq) => {
          const grams = calcGrams(eq);
          const active = selected?.name === eq.name;
          return (
            <button key={eq.name} onClick={() => onSelect(active ? null : eq)}
              className="flex flex-col items-center text-center rounded-2xl p-3 transition-all duration-200 active:scale-95"
              style={{
                background: active ? F.blueBg : F.bg,
                border: `1.5px solid ${active ? F.blue : F.border}`,
              }}>
              <div className="mb-1.5"><FoodIllu iconKey={eq.icon} size={48} /></div>
              <p className="text-[11px] font-medium leading-tight mb-1" style={{ color: active ? F.blue : F.tp }}>{eq.name}</p>
              <span className="text-[11px] font-semibold" style={{ color: active ? F.blue : F.ts }}>{grams}g</span>
            </button>
          );
        })}
      </div>
      {selected && (
        <div className="rounded-2xl px-4 py-3" style={{ background: F.blueBg, border: `1px solid ${F.blue}30` }}>
          <p className="text-[12px] font-medium" style={{ color: F.tp }}>
            {ingredient.grams}g de {ingredient.name} = <span style={{ color: F.blue }}>{calcGrams(selected)}g</span> de {selected.name}
          </p>
        </div>
      )}
    </div>
  );
}

function MealSheet({ meal, substitutes }: { meal: Meal; substitutes?: FoodSubstituteDTO[] }) {
  const catalog: Equivalent[] = substitutes && substitutes.length > 0
    ? substitutes.map(toEquivalent)
    : EQUIV_CATALOG;
  const macros = meal.macros ?? { protein: 32, carbs: 48, fat: 14 };
  const ingredients: Ingredient[] = meal.ingredients?.length ? meal.ingredients
    : meal.items.map((name, i) => ({
        name, grams: [150, 120, 80, 200, 100][i % 5],
        calories: Math.round(meal.calories / meal.items.length),
        icon: ["egg", "wheat", "beef", "salad", "chicken"][i % 5],
        macros: {
          protein: Math.round(macros.protein / meal.items.length),
          carbs:   Math.round(macros.carbs   / meal.items.length),
          fat:     Math.round(macros.fat     / meal.items.length),
        },
      }));

  const [showEquiv, setShowEquiv] = useState(false);
  const [swapOpen, setSwapOpen] = useState<number | null>(null);
  const [swaps, setSwaps] = useState<Record<number, Equivalent | null>>({});
  const swapCount = Object.values(swaps).filter(Boolean).length;

  return (
    <>
      <div className="flex items-start justify-between mb-5 mt-1">
        <div>
          <h2 className="text-[20px] font-semibold" style={{ color: F.tp }}>{meal.name}</h2>
          <p className="text-[12px] mt-0.5" style={{ color: F.tt }}>{meal.time} · {meal.calories} kcal</p>
        </div>
        <button onClick={() => { setShowEquiv(p => !p); setSwapOpen(null); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium"
          style={{
            background: showEquiv ? F.blueBg : F.bg,
            border: `1px solid ${showEquiv ? F.blue : F.border}`,
            color: showEquiv ? F.blue : F.ts,
          }}>
          <ArrowLeftRight size={12} /> Cambios{swapCount > 0 ? ` (${swapCount})` : ""}
        </button>
      </div>

      {/* Macro pills */}
      <div className="flex gap-2 mb-5">
        {[
          { label: "P", value: macros.protein, color: F.protein },
          { label: "C", value: macros.carbs,   color: F.carbs },
          { label: "G", value: macros.fat,      color: F.fat },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-2xl"
            style={{ background: color + "12", border: `1px solid ${color}25` }}>
            <span className="text-[11px] font-medium" style={{ color }}>{label}</span>
            <span className="text-[13px] font-semibold" style={{ color }}>{value}g</span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden mb-4" style={{ border: `1px solid ${F.border}` }}>
        {ingredients.map((ing, i) => {
          const swapped = !!swaps[i];
          const swappedTo = swaps[i];
          const displayName = swapped && swappedTo ? swappedTo.name : ing.name;
          const displayGrams = swapped && swappedTo
            ? (swappedTo.macroType === "protein"
                ? Math.round((ing.macros?.protein ?? 8) * (swappedTo.gramsPerProtein ?? 5))
                : Math.round((ing.macros?.carbs ?? 10) * (swappedTo.gramsPerCarb ?? 0)))
            : ing.grams;
          const iconKey = swapped && swappedTo ? swappedTo.icon : ing.icon;
          return (
            <div key={i} style={{ borderBottom: i < ingredients.length - 1 ? `1px solid ${F.border}` : "none" }}>
              <div className="flex items-center gap-3 px-4 py-3"
                style={{ background: swapped ? F.blueBg : F.card }}>
                <FoodIllu iconKey={iconKey} size={44} />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium truncate" style={{ color: F.tp }}>{displayName}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: F.tt }}>
                    {displayGrams}g
                    {ing.macros && (
                      <span> · P:{ing.macros.protein}g C:{ing.macros.carbs}g G:{ing.macros.fat}g</span>
                    )}
                  </p>
                  {swapped && <span className="text-[10px]" style={{ color: F.blue }}>↔ sustituido</span>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {showEquiv && (
                    <button onClick={() => setSwapOpen(p => p === i ? null : i)}
                      className="w-7 h-7 rounded-xl flex items-center justify-center"
                      style={{
                        background: swapOpen === i ? F.blueBg : F.bg,
                        border: `1px solid ${swapOpen === i ? F.blue : F.border}`,
                      }}>
                      <ArrowLeftRight size={11} style={{ color: swapOpen === i ? F.blue : F.tt }} />
                    </button>
                  )}
                  <span className="text-[12px] font-medium tabular-nums" style={{ color: F.ts }}>{ing.calories} kcal</span>
                </div>
              </div>
              {swapOpen === i && showEquiv && (
                <div className="px-4 pb-5 pt-3" style={{ borderTop: `1px solid ${F.border}`, background: F.bg }}>
                  <EquivCatalog ingredient={ing} selected={swaps[i] ?? null}
                    catalog={catalog}
                    onSelect={eq => { setSwaps(p => ({ ...p, [i]: eq })); if (!eq) setSwapOpen(null); }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ── YouTube / Vimeo ID extractors ── */
function ytId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}
function vimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m ? m[1] : null;
}

/* ── Smart media block ── */
function ExerciseMedia({ videoUrl, imageUrl, muscleGroup }: {
  videoUrl?: string; imageUrl?: string; muscleGroup?: string;
}) {
  if (videoUrl) {
    const yt = ytId(videoUrl);
    if (yt) return (
      <div className="w-full rounded-2xl overflow-hidden mb-5" style={{ aspectRatio: "16/9", background: "#000" }}>
        <iframe
          src={`https://www.youtube.com/embed/${yt}?modestbranding=1&rel=0`}
          className="w-full h-full"
          style={{ border: "none", display: "block" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
    const vm = vimeoId(videoUrl);
    if (vm) return (
      <div className="w-full rounded-2xl overflow-hidden mb-5" style={{ aspectRatio: "16/9", background: "#000" }}>
        <iframe
          src={`https://player.vimeo.com/video/${vm}?badge=0&byline=0&portrait=0&title=0`}
          className="w-full h-full"
          style={{ border: "none", display: "block" }}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
    if (videoUrl.match(/\.mp4(\?|$)/i)) return (
      <video src={videoUrl} controls playsInline
        className="w-full rounded-2xl mb-5 object-cover"
        style={{ maxHeight: 220, background: "#000" }} />
    );
  }

  if (imageUrl) return (
    <div className="w-full rounded-2xl overflow-hidden mb-5" style={{ maxHeight: 220 }}>
      <img src={imageUrl} alt="Guía visual" className="w-full object-cover" style={{ maxHeight: 220 }} />
    </div>
  );

  /* Fallback — animated placeholder */
  return (
    <div className="w-full rounded-2xl mb-5 flex flex-col items-center justify-center gap-3"
      style={{ height: 148, background: F.bg, border: `1px solid ${F.border}` }}>
      <div className="relative w-14 h-14 flex items-center justify-center">
        <span className="absolute inline-flex w-full h-full rounded-full opacity-40 animate-ping"
          style={{ background: "rgba(96,165,250,0.25)" }} />
        <div className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)" }}>
          <Dumbbell size={18} strokeWidth={1.5} style={{ color: F.blue }} />
        </div>
      </div>
      <div className="text-center">
        <p className="text-[12px] font-medium" style={{ color: F.ts }}>
          {muscleGroup ?? "Ejercicio"}
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: F.tt }}>Guía visual en preparación</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   EXERCISE SHEET (light)
══════════════════════════════════════════════════════════════ */
function ExerciseSheet({ exercise }: { exercise: Exercise }) {
  const [sets, setSets] = useState<{ kg: string; reps: string }[]>(
    Array.from({ length: exercise.sets }, () => ({ kg: "", reps: "" }))
  );
  const upd = (i: number, f: "kg" | "reps", v: string) =>
    setSets(p => p.map((s, idx) => idx === i ? { ...s, [f]: v } : s));
  const tips = exercise.tips ?? [
    "Mantén la espalda recta durante todo el movimiento.",
    "Controla la fase excéntrica (bajada) en 2–3 segundos.",
    "Activa el core antes de iniciar el movimiento.",
  ];

  return (
    <>
      <div className="mb-5 mt-1">
        <h2 className="text-[20px] font-semibold" style={{ color: F.tp }}>{exercise.name}</h2>
        <p className="text-[12px] mt-0.5" style={{ color: F.tt }}>
          {exercise.sets} series · {exercise.reps} reps{exercise.muscleGroup ? ` · ${exercise.muscleGroup}` : ""}
        </p>
      </div>

      <ExerciseMedia videoUrl={exercise.videoUrl} imageUrl={exercise.imageUrl} muscleGroup={exercise.muscleGroup} />

      <div className="mb-5">
        <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: F.tt }}>
          Instrucciones del Coach
        </p>
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${F.border}` }}>
          {tips.map((tip, i) => (
            <div key={i} className="flex gap-3 px-4 py-3"
              style={{ borderBottom: i < tips.length-1 ? `1px solid ${F.border}` : "none", background: F.card }}>
              <span className="text-[9px] font-semibold mt-0.5 shrink-0" style={{ color: F.blue }}>{String(i+1).padStart(2,"0")}</span>
              <span className="text-[12px] leading-relaxed" style={{ color: F.ts }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: F.tt }}>Registro de carga</p>
      <div className="grid grid-cols-3 px-4 mb-1.5">
        {["Serie","Peso (kg)","Reps"].map((h,i) => (
          <span key={h} className={`text-[9px] uppercase tracking-wide ${i>0?"text-center":""}`} style={{ color: F.tt }}>{h}</span>
        ))}
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${F.border}` }}>
        {sets.map((s, i) => (
          <div key={i} className="grid grid-cols-3 items-center px-4 py-3"
            style={{ borderBottom: i < sets.length-1 ? `1px solid ${F.border}` : "none", background: F.card }}>
            <span className="text-[12px] font-medium" style={{ color: F.ts }}>S{i+1}</span>
            {(["kg","reps"] as const).map((field, fi) => (
              <input key={field} type="number" inputMode={field==="kg"?"decimal":"numeric"}
                placeholder="—" value={s[field]} onChange={e => upd(i, field, e.target.value)}
                className={`w-14 ${fi===0?"mx-auto":"ml-auto"} text-center text-[13px] font-medium rounded-xl py-1.5 outline-none`}
                style={{ background: F.bg, border: `1px solid ${F.border}`, color: s[field] ? F.tp : F.tt }} />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   DATE HEADER
══════════════════════════════════════════════════════════════ */
function DateHeader({ date, onPrev, onNext }: { date: Date; onPrev: () => void; onNext: () => void }) {
  const label = date.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "short" });
  const isToday = date.toDateString() === new Date().toDateString();
  return (
    <div className="flex items-center justify-between px-4 py-3 sticky top-0 z-30 no-print"
      style={{
        background: F.cardGlass,
        borderBottom: `1px solid ${F.border}`,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}>
      <button onClick={onPrev}
        className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer transition-opacity active:opacity-50"
        style={{ background: F.bg, border: `1px solid ${F.border}` }}>
        <ChevronLeft size={16} style={{ color: F.ts }} />
      </button>
      <div className="flex flex-col items-center">
        <span className="text-[13px] font-semibold capitalize" style={{ color: F.tp }}>{label}</span>
        {isToday && (
          <span className="text-[9px] font-black uppercase tracking-[0.12em] mt-0.5 px-2 py-0.5 rounded-full"
            style={{ background: F.voltBg, color: F.volt, border: `1px solid ${F.voltBor}` }}>Hoy</span>
        )}
      </div>
      <button onClick={onNext}
        className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer transition-opacity active:opacity-50"
        style={{ background: F.bg, border: `1px solid ${F.border}` }}>
        <ChevronRight size={16} style={{ color: F.ts }} />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MACRO SUMMARY CARD (Fitia style)
══════════════════════════════════════════════════════════════ */
function MacroProgressBar({ label, consumed, target, color }: {
  label: string; consumed: number; target: number; color: string;
}) {
  const pct = target > 0 ? Math.min(consumed / target, 1) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[12px] w-28 shrink-0 font-medium" style={{ color: F.ts }}>{label}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: F.track }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[11px] w-16 text-right tabular-nums shrink-0" style={{ color: F.ts }}>
        <span style={{ color: F.tp, fontWeight: 600 }}>{consumed}</span>/{target}g
      </span>
    </div>
  );
}

function MacroSummaryCard({ totalTarget, totalConsumed, targetMacros, consumedMacros }: {
  totalTarget: number; totalConsumed: number;
  targetMacros: { protein: number; carbs: number; fat: number };
  consumedMacros: { protein: number; carbs: number; fat: number };
}) {
  const remaining = Math.max(totalTarget - totalConsumed, 0);
  const pct = totalTarget > 0 ? Math.min(totalConsumed / totalTarget, 1) : 0;
  const circumference = 2 * Math.PI * 38;
  return (
    <div className="mx-4 mt-3 mb-2 rounded-2xl p-4"
      style={{ background: F.card, border: `1px solid ${F.border}`, boxShadow: F.shadow }}>
      {/* Calories row */}
      <div className="flex items-center gap-4 mb-4">
        {/* Ring */}
        <div className="relative shrink-0" style={{ width: 100, height: 100 }}>
          <svg viewBox="0 0 100 100" width={100} height={100} style={{ transform: "rotate(-90deg)" }}>
            <defs>
              <filter id="ring-glow">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <circle cx="50" cy="50" r="42" fill="none" stroke={F.track} strokeWidth="7" />
            <circle cx="50" cy="50" r="42" fill="none" stroke={F.volt} strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${pct * (2 * Math.PI * 42)} ${(1 - pct) * (2 * Math.PI * 42)}`}
              filter="url(#ring-glow)"
              style={{ transition: "stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span style={{
              fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
              fontWeight: 900, fontStyle: "italic",
              fontSize: "clamp(22px, 7vw, 28px)",
              lineHeight: 1, color: F.volt, letterSpacing: "-0.03em",
              filter: "drop-shadow(0 0 6px rgba(212,255,0,0.4))",
            }}>{Math.round(pct * 100)}%</span>
            <span className="text-[7px] font-black uppercase tracking-widest mt-0.5" style={{ color: F.tt }}>meta kcal</span>
          </div>
        </div>
        {/* Stats */}
        <div className="flex-1">
          <div className="flex gap-4 mb-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: F.tt }}>Consumido</p>
              <p className="tabular-nums leading-none font-black" style={{ color: F.tp, fontSize: "clamp(26px,8vw,34px)", letterSpacing: "-0.03em" }}>{totalConsumed}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: F.tt }}>kcal</p>
            </div>
            <div className="w-px self-stretch mx-1" style={{ background: F.border }} />
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: F.tt }}>Restante</p>
              <p className="tabular-nums leading-none font-black"
                style={{ color: remaining > 0 ? F.green : F.red, fontSize: "clamp(26px,8vw,34px)", letterSpacing: "-0.03em" }}>{remaining}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: F.tt }}>kcal</p>
            </div>
          </div>
          {/* Macro mini pills */}
          <div className="flex gap-1.5">
            {[
              { label: "P", val: consumedMacros.protein, color: F.protein },
              { label: "C", val: consumedMacros.carbs,   color: F.carbs },
              { label: "G", val: consumedMacros.fat,      color: F.fat },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ background: color + "15", color }}>
                {label} {val}g
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Progress bars */}
      <div className="space-y-2.5 pt-2" style={{ borderTop: `1px solid ${F.border}` }}>
        <MacroProgressBar label="Proteínas" consumed={consumedMacros.protein} target={targetMacros.protein} color={F.protein} />
        <MacroProgressBar label="Carbohidratos" consumed={consumedMacros.carbs} target={targetMacros.carbs} color={F.carbs} />
        <MacroProgressBar label="Grasas" consumed={consumedMacros.fat} target={targetMacros.fat} color={F.fat} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FITIA MEAL CARD
══════════════════════════════════════════════════════════════ */
const MEAL_ICONS: Record<string, { icon: string; color: string }> = {
  desayuno:  { icon: "☀️", color: "#F59E0B" },
  almuerzo:  { icon: "🌤️", color: "#4F7AF8" },
  comida:    { icon: "🌤️", color: "#4F7AF8" },
  cena:      { icon: "🌙", color: "#6366F1" },
  colación:  { icon: "🍎", color: "#10B981" },
  snack:     { icon: "🍎", color: "#10B981" },
  merienda:  { icon: "🫐", color: "#8B5CF6" },
};

function FitiaMealCard({ meal, onOpen, checked, onToggleCheck, substitutes }: {
  meal: Meal; onOpen: () => void;
  checked: boolean; onToggleCheck: () => void;
  substitutes?: FoodSubstituteDTO[];
}) {
  const mealKey = meal.name.toLowerCase();
  const mealMeta = Object.entries(MEAL_ICONS).find(([k]) => mealKey.includes(k))?.[1]
    ?? { icon: "🍽️", color: F.blue };

  const ingredients: Ingredient[] = meal.ingredients?.length ? meal.ingredients
    : meal.items.map((name, i) => ({
        name, grams: [150, 120, 80, 200, 100][i % 5],
        calories: Math.round(meal.calories / Math.max(meal.items.length, 1)),
        icon: ["egg", "wheat", "beef", "salad", "chicken"][i % 5],
        macros: {
          protein: Math.round((meal.macros?.protein ?? 20) / Math.max(meal.items.length, 1)),
          carbs:   Math.round((meal.macros?.carbs   ?? 40) / Math.max(meal.items.length, 1)),
          fat:     Math.round((meal.macros?.fat     ?? 10) / Math.max(meal.items.length, 1)),
        },
      }));

  const [swapOpen, setSwapOpen] = useState<number | null>(null);
  const [swaps, setSwaps] = useState<Record<number, FoodSubstituteDTO | null>>({});

  const ingCategory = (ing: Ingredient) =>
    (ing.macros?.protein ?? 0) > (ing.macros?.carbs ?? 0) ? "Proteínas" : "Carbohidratos";

  const calcSubGrams = (ing: Ingredient, sub: FoodSubstituteDTO) => {
    const macro = ingCategory(ing) === "Proteínas"
      ? (ing.macros?.protein ?? 0)
      : (ing.macros?.carbs ?? 0);
    return Math.round(macro * sub.ratio);
  };

  return (
    <div className="mx-4 mb-3 rounded-2xl overflow-hidden"
      style={{
        background: F.card,
        border: `1px solid ${checked ? F.green + "55" : F.border}`,
        boxShadow: checked ? `0 0 0 1px ${F.green}25, ${F.shadow}` : F.shadow,
        transition: "border-color 0.35s ease, box-shadow 0.35s ease",
      }}>
      {/* ── Meal header — master toggle ── */}
      <div className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: `1px solid ${F.border}` }}>
        <button
          onClick={onToggleCheck}
          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
          style={{
            background: checked ? F.green : "transparent",
            border: `2px solid ${checked ? F.green : F.border}`,
            boxShadow: checked ? `0 0 7px ${F.green}55` : "none",
            transition: "background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
          }}>
          {checked && <CheckCircle2 size={11} strokeWidth={3} style={{ color: "#fff" }} />}
        </button>
        <span className="text-[16px]">{mealMeta.icon}</span>
        <div className="flex-1">
          <p className="text-[14px] font-semibold" style={{ color: F.tp }}>{meal.name}</p>
          <p className="text-[11px]" style={{ color: checked ? F.green : F.tt }}>
            {checked ? `✓ Comida registrada · ${meal.calories} kcal` : meal.time}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[14px] font-bold tabular-nums"
            style={{ color: checked ? F.green : F.tp, transition: "color 0.25s" }}>{meal.calories}</p>
          <p className="text-[10px]" style={{ color: F.tt }}>kcal</p>
        </div>
        <button onClick={onOpen}
          className="w-8 h-8 flex items-center justify-center rounded-xl ml-1 cursor-pointer"
          style={{ background: F.bg }}>
          <ChevronRight size={14} style={{ color: F.ts }} />
        </button>
      </div>

      {/* ── Ingredient rows with inline swap ── */}
      {ingredients.map((ing, i) => {
        const applied = swaps[i] ?? null;
        const displayName  = applied ? applied.substituteFood : ing.name;
        const displayGrams = applied ? calcSubGrams(ing, applied) : ing.grams;
        const subOptions   = substitutes?.filter(s => s.category === ingCategory(ing)) ?? [];
        const swapping     = swapOpen === i;

        return (
          <div key={i}
            style={{ borderBottom: i < ingredients.length - 1 ? `1px solid ${F.border}` : "none" }}>
            {/* Main row */}
            <div className="flex items-center gap-3 px-4 py-3"
              style={{
                background: applied ? F.blueBg : checked ? "rgba(52,211,153,0.05)" : "transparent",
                transition: "background 0.3s ease",
              }}>
              <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: checked ? F.green : "transparent",
                  border: `1.5px solid ${checked ? F.green : F.tt}`,
                  transition: "background 0.25s ease, border-color 0.25s ease",
                }}>
                {checked && <CheckCircle2 size={8} strokeWidth={3} style={{ color: "#fff" }} />}
              </div>
              <FoodIllu iconKey={applied ? guessIcon(applied.substituteFood) : ing.icon} size={40} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate"
                  style={{
                    color: applied ? F.blue : checked ? F.ts : F.tp,
                    textDecoration: checked && !applied ? "line-through" : "none",
                    transition: "color 0.25s ease",
                  }}>
                  {displayName}
                  <span style={{ color: applied ? F.blue + "bb" : F.tt, fontWeight: 400 }}> – {displayGrams}g</span>
                </p>
                {ing.macros && !applied && (
                  <p className="text-[11px] mt-0.5" style={{ color: F.tt }}>
                    <span style={{ color: F.protein }}>P: {ing.macros.protein}g</span>
                    {" · "}
                    <span style={{ color: F.carbs }}>C: {ing.macros.carbs}g</span>
                    {" · "}
                    <span style={{ color: F.fat }}>G: {ing.macros.fat}g</span>
                  </p>
                )}
                {applied && (
                  <span className="text-[10px]" style={{ color: F.blue }}>↔ sustituido · macros iguales</span>
                )}
              </div>
              <span className="text-[12px] tabular-nums shrink-0"
                style={{ color: F.ts, opacity: checked ? 0.38 : 1, transition: "opacity 0.25s ease" }}>
                {ing.calories} kcal
              </span>
              {subOptions.length > 0 && (
                <button
                  onClick={() => setSwapOpen(p => p === i ? null : i)}
                  className="w-6 h-6 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-90"
                  style={{
                    background: applied || swapping ? F.blueBg : F.bg,
                    border: `1px solid ${applied || swapping ? F.blue : F.border}`,
                  }}>
                  <ArrowLeftRight size={10} style={{ color: applied || swapping ? F.blue : F.tt }} />
                </button>
              )}
            </div>

            {/* Inline substitute picker */}
            {swapping && subOptions.length > 0 && (
              <div className="px-3 pt-2 pb-3"
                style={{ borderTop: `1px solid ${F.border}`, background: F.bg, animation: "fadeSlideIn 0.18s ease" }}>
                <p className="text-[10px] mb-2" style={{ color: F.tt }}>
                  Sustituir por ({ingCategory(ing).toLowerCase()}):
                </p>
                <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
                  {subOptions.map(sub => {
                    const grams  = calcSubGrams(ing, sub);
                    const active = applied?.id === sub.id;
                    return (
                      <button key={sub.id}
                        onClick={() => {
                          setSwaps(p => ({ ...p, [i]: active ? null : sub }));
                          setSwapOpen(null);
                        }}
                        className="flex flex-col items-center shrink-0 px-3 py-2 rounded-xl text-center cursor-pointer transition-all active:scale-95"
                        style={{
                          minWidth: 76,
                          background: active ? F.blueBg : F.card,
                          border: `1.5px solid ${active ? F.blue : F.border}`,
                        }}>
                        <p className="text-[11px] font-medium leading-tight" style={{ color: active ? F.blue : F.tp }}>
                          {sub.substituteFood}
                        </p>
                        <p className="text-[10px] mt-0.5 tabular-nums" style={{ color: active ? F.blue : F.tt }}>
                          {grams}g
                        </p>
                      </button>
                    );
                  })}
                  {applied && (
                    <button
                      onClick={() => { setSwaps(p => ({ ...p, [i]: null })); setSwapOpen(null); }}
                      className="flex flex-col items-center justify-center shrink-0 px-3 py-2 rounded-xl cursor-pointer transition-all active:scale-95"
                      style={{ minWidth: 56, background: F.bg, border: `1px solid ${F.border}` }}>
                      <X size={12} style={{ color: F.tt }} />
                      <p className="text-[10px] mt-0.5" style={{ color: F.tt }}>Original</p>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   EXERCISE ROW — ACCORDION (with DB persistence + history)
══════════════════════════════════════════════════════════════ */
function AccordionExerciseRow({ exercise, onDetails, todayLog, prevLog, todayStr }: {
  exercise: Exercise & { muscleGroup?: string };
  onDetails: () => void;
  todayLog:  WorkoutLogEntry | null;
  prevLog:   WorkoutLogEntry | null;
  todayStr:  string;
}) {
  const targetReps = parseInt(String(exercise.reps)) || 10;
  const lastWeight = prevLog?.sets[0]?.weight ?? 0;

  const [sets, setSets] = useState<WorkoutSet[]>(() => {
    if (todayLog?.sets.length) {
      return todayLog.sets.map((s, i) => ({
        setNumber:  s.setNumber  ?? i + 1,
        targetReps: s.targetReps || targetReps,
        actualReps: s.actualReps ?? 0,
        weight:     s.weight     ?? 0,
        completed:  s.completed  ?? false,
      }));
    }
    return Array.from({ length: exercise.sets }, (_, i) => ({
      setNumber: i + 1, targetReps, actualReps: 0,
      weight: lastWeight, completed: false,
    }));
  });

  const [expanded, setExpanded] = useState(false);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback((next: WorkoutSet[], immediate = false) => {
    if (persistTimer.current) clearTimeout(persistTimer.current);
    const save = () =>
      fetch("/api/me/logs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date:           todayStr,
          exerciseName:   exercise.name,
          muscleGroup:    exercise.muscleGroup ?? null,
          prescribedSets: exercise.sets,
          prescribedReps: String(exercise.reps),
          sets:           next,
          completed:      next.every(s => s.completed),
        }),
      }).catch(() => {});
    if (immediate) save();
    else persistTimer.current = setTimeout(save, 700);
  }, [exercise, todayStr]);

  const updSet = (i: number, field: "weight" | "actualReps", raw: string) => {
    const val = field === "weight" ? (parseFloat(raw) || 0) : (parseInt(raw) || 0);
    setSets(p => { const next = p.map((s, idx) => idx === i ? { ...s, [field]: val } : s); persist(next); return next; });
  };

  const toggleSetDone = (i: number) => {
    setSets(p => {
      const next = p.map((s, idx) => idx === i ? { ...s, completed: !s.completed } : s);
      persist(next, true);
      return next;
    });
  };

  const toggleAllDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSets(p => {
      const nowAll = p.every(s => s.completed);
      const next   = p.map(s => ({ ...s, completed: !nowAll }));
      persist(next, true);
      return next;
    });
  };

  const allDone   = sets.every(s => s.completed);
  const doneCount = sets.filter(s => s.completed).length;

  const prevSummary = useMemo(() => {
    if (!prevLog?.sets.length) return null;
    const withData = prevLog.sets.filter(s => s.weight > 0);
    if (!withData.length) return null;
    const best = withData.reduce((m, s) => s.weight > m.weight ? s : m, withData[0]);
    const vol  = withData.reduce((sum, s) => sum + s.weight * (s.actualReps || s.targetReps || 0), 0);
    return { weight: best.weight, reps: best.actualReps || best.targetReps, volume: Math.round(vol) };
  }, [prevLog]);

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: allDone ? "rgba(52,211,153,0.07)" : F.card,
        border: `1px solid ${allDone ? F.green + "40" : F.border}`,
        transition: "border-color 0.3s ease, background 0.3s ease",
      }}>
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer"
        onClick={() => setExpanded(p => !p)}>
        <button onClick={toggleAllDone}
          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer"
          style={{ background: allDone ? F.green : "transparent", border: `2px solid ${allDone ? F.green : F.tt}` }}>
          {allDone && <CheckCircle2 size={10} strokeWidth={3} style={{ color: "#fff" }} />}
        </button>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: F.blueBg }}>
          <Dumbbell size={14} strokeWidth={1.75} style={{ color: F.blue }} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[13px] font-medium block truncate"
            style={{ color: allDone ? F.ts : F.tp, transition: "color 0.2s" }}>
            {exercise.name}
          </span>
          {doneCount > 0 && !allDone && (
            <span className="text-[10px]" style={{ color: F.green }}>{doneCount}/{exercise.sets} series</span>
          )}
          {prevSummary && !allDone && doneCount === 0 && (
            <span className="text-[10px]" style={{ color: F.tt }}>
              Ant: {prevSummary.weight}kg × {prevSummary.reps}
            </span>
          )}
        </div>
        <span className="text-[11px] tabular-nums px-2 py-0.5 rounded-full shrink-0"
          style={{ background: F.bg, color: F.ts }}>{exercise.sets}×{exercise.reps}</span>
        <div className="w-6 h-6 flex items-center justify-center shrink-0 transition-transform duration-250"
          style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}>
          <ChevronRight size={13} style={{ color: F.tt }} />
        </div>
      </div>

      {/* ── Accordion body ── */}
      <div style={{ maxHeight: expanded ? "560px" : "0px", overflow: "hidden", transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
        <div className="px-4 pb-4 pt-2" style={{ borderTop: `1px solid ${F.border}` }}>

          {/* Column headers */}
          <div className="grid grid-cols-[28px_1fr_1fr_28px] gap-2 px-1 mb-2">
            {["#", "Peso (kg)", "Reps", "✓"].map((h, i) => (
              <span key={i} className={`text-[9px] uppercase tracking-wide ${i > 0 ? "text-center" : ""}`}
                style={{ color: F.tt }}>{h}</span>
            ))}
          </div>

          {/* Set rows */}
          <div className="space-y-1.5">
            {sets.map((s, i) => (
              <div key={i}
                className="grid grid-cols-[28px_1fr_1fr_28px] items-center gap-2 px-1 py-1.5 rounded-xl transition-colors duration-150"
                style={{ background: s.completed ? "rgba(52,211,153,0.08)" : "transparent" }}>

                <span className="text-[11px] font-semibold text-center tabular-nums"
                  style={{ color: s.completed ? F.green : F.ts }}>
                  S{s.setNumber}
                </span>

                <input type="number" inputMode="decimal"
                  placeholder={prevLog?.sets[i]?.weight ? String(prevLog.sets[i].weight) : "—"}
                  value={s.weight || ""}
                  onChange={e => updSet(i, "weight", e.target.value)}
                  className="text-center text-[12px] font-medium rounded-xl py-1.5 outline-none w-full"
                  style={{ background: "#000", border: "1px solid #27272a", color: s.weight ? F.tp : F.tt }} />

                <input type="number" inputMode="numeric"
                  placeholder={String(s.targetReps)}
                  value={s.actualReps || ""}
                  onChange={e => updSet(i, "actualReps", e.target.value)}
                  className="text-center text-[12px] font-medium rounded-xl py-1.5 outline-none w-full"
                  style={{ background: "#000", border: "1px solid #27272a", color: s.actualReps ? F.tp : F.tt }} />

                <button onClick={() => toggleSetDone(i)}
                  className="mx-auto w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
                  style={{ background: s.completed ? F.green : "transparent", border: `2px solid ${s.completed ? F.green : F.tt}` }}>
                  {s.completed && <CheckCircle2 size={9} strokeWidth={3} style={{ color: "#fff" }} />}
                </button>
              </div>
            ))}
          </div>

          {/* Historical performance */}
          {prevSummary && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: F.bg, border: "1px solid #27272a" }}>
              <span style={{ color: F.blue, fontSize: 11 }}>⚡</span>
              <span className="text-[11px]" style={{ color: F.ts }}>
                Última sesión:{" "}
                <span style={{ color: F.tp, fontWeight: 600 }}>
                  {prevSummary.weight}kg × {prevSummary.reps} reps
                </span>
                <span style={{ color: F.tt }}> · {prevSummary.volume.toLocaleString()}kg vol</span>
              </span>
            </div>
          )}

          <button onClick={e => { e.stopPropagation(); onDetails(); }}
            className="mt-3 flex items-center gap-1.5 text-[11px] font-medium cursor-pointer"
            style={{ color: F.blue }}>
            <Info size={11} /> Ver instrucciones y notas
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   WEIGHT CHART (light)
══════════════════════════════════════════════════════════════ */
function WeightChart({ history }: { history: { date: string; weight: number }[] }) {
  if (!history || history.length < 2) return (
    <div className="flex items-center justify-center py-8">
      <p className="text-[11px]" style={{ color: F.tt }}>Registra al menos 2 pesajes para ver la gráfica.</p>
    </div>
  );
  const W = 320, H = 100, pad = 12;
  const weights = history.map(h => h.weight);
  const minW = Math.min(...weights), maxW = Math.max(...weights);
  const range = maxW - minW || 1;
  const pts = history.map((h, i) => ({
    x: pad + (i / (history.length - 1)) * (W - pad * 2),
    y: H - pad - ((h.weight - minW) / range) * (H - pad * 2),
    ...h,
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${pts[pts.length-1].x} ${H} L ${pts[0].x} ${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H, overflow: "visible" }}>
      <defs>
        <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={F.blue} stopOpacity="0.18" />
          <stop offset="100%" stopColor={F.blue} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#wGrad)" />
      <defs>
        <filter id="weight-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path d={pathD} fill="none" stroke={F.blue} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#weight-glow)" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4.5" fill={F.blue} stroke={F.card} strokeWidth="2.5" />
      ))}
      {[pts[0], pts[pts.length - 1]].map((p, i) => (
        <text key={i} x={p.x} y={H} textAnchor="middle" fontSize="8" fill={F.tt}>{p.date.slice(5)}</text>
      ))}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   PROGRESS FORM (light)
══════════════════════════════════════════════════════════════ */
function ProgressForm({ onSaved }: { onSaved: () => void }) {
  const [weight, setWeight] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight && !photo) return;
    setStatus("saving");
    const fd = new FormData();
    if (weight) fd.append("weight", weight);
    if (photo) fd.append("photo", photo);
    const res = await fetch("/api/me", { method: "POST", body: fd });
    if (res.ok) {
      setStatus("saved"); setWeight(""); setPhoto(null);
      onSaved();
      setTimeout(() => setStatus("idle"), 2200);
    } else setStatus("idle");
  };

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <input type="number" step="0.1" inputMode="decimal" value={weight}
        onChange={e => setWeight(e.target.value)} placeholder="Peso de hoy (kg)"
        className="w-full px-4 py-3 rounded-2xl text-[13px] outline-none"
        style={{ background: F.bg, border: `1px solid ${F.border}`, color: F.tp }} />
      <label className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-[12px] cursor-pointer"
        style={{ background: F.bg, border: `1px solid ${F.border}`, color: photo ? F.ts : F.tt }}>
        <Camera size={14} strokeWidth={1.75} />
        <span className="truncate">{photo ? photo.name : "Subir foto de progreso"}</span>
        <input type="file" accept="image/*" className="hidden" onChange={e => setPhoto(e.target.files?.[0] ?? null)} />
      </label>
      <button type="submit" disabled={status === "saving" || (!weight && !photo)}
        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl text-[13px] font-semibold cursor-pointer transition-opacity disabled:opacity-40"
        style={{ background: F.blue, color: "#000" }}>
        {status === "saving" ? <Loader2 size={15} className="animate-spin" />
          : status === "saved" ? <><CheckCircle2 size={15} /> Guardado</>
          : "Guardar progreso"}
      </button>
    </form>
  );
}

/* ══════════════════════════════════════════════════════════════
   SHARED: GOLDEN AVATAR
══════════════════════════════════════════════════════════════ */
function GoldenAvatar({ url, name, sizeClass = "h-14 w-14", onClick, showCamera = false }: {
  url: string | null; name: string;
  sizeClass?: string; onClick?: () => void; showCamera?: boolean;
}) {
  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 p-[3px] shadow-[0_0_16px_rgba(250,204,21,0.2)] shrink-0 relative ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}>
      <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 flex items-center justify-center">
        {url ? (
          <img src={url} alt={name} className="w-full h-full object-cover object-top" />
        ) : (
          <UserCircle2 className="w-1/2 h-1/2" strokeWidth={1.25} style={{ color: F.tt }} />
        )}
      </div>
      {showCamera && (
        <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: F.blue, border: "2px solid #000" }}>
          <Camera size={11} style={{ color: "#000" }} />
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TAB: HOY
══════════════════════════════════════════════════════════════ */
function TabHoy({ student, detail, meals, day, mealChecks, onMealToggle, onMealOpen, onExerciseOpen, avatarUrl, workoutLogs, todayStr, workoutSession, finalizingSession, onFinalizeSession, waterTotalMl, onAddWater, substitutes }: {
  student: Student; detail: Detail; meals: Meal[];
  day: RoutineDay | undefined;
  mealChecks: string[]; onMealToggle: (name: string) => void;
  onMealOpen: (m: Meal) => void;
  onExerciseOpen: (e: Exercise & { muscleGroup?: string }) => void;
  avatarUrl: string | null;
  workoutLogs: WorkoutLogEntry[];
  todayStr: string;
  workoutSession: WorkoutSessionEntry | null;
  finalizingSession: boolean;
  onFinalizeSession: (name: string) => void;
  waterTotalMl: number;
  onAddWater: (amountMl: number) => void;
  substitutes: FoodSubstituteDTO[];
}) {
  const routineRef = useRef<HTMLDivElement>(null);

  // Consumed totals: sum across all checked meals
  const targetMacros = (detail.diet as any).macros ?? { protein: 120, carbs: 220, fat: 60 };
  const targetCals   = (detail.diet as any).totalCalories ?? 1800;

  const { consumedCals, consumedMacros } = meals.reduce(
    (acc, m) => {
      if (!mealChecks.includes(m.name)) return acc;
      return {
        consumedCals: acc.consumedCals + m.calories,
        consumedMacros: {
          protein: acc.consumedMacros.protein + (m.macros?.protein ?? 0),
          carbs:   acc.consumedMacros.carbs   + (m.macros?.carbs   ?? 0),
          fat:     acc.consumedMacros.fat     + (m.macros?.fat     ?? 0),
        },
      };
    },
    { consumedCals: 0, consumedMacros: { protein: 0, carbs: 0, fat: 0 } }
  );

  const rank = getRank(student.streak);
  const heroCirc = 2 * Math.PI * 52;
  const heroFill = (student.completionRate / 100) * heroCirc;

  return (
    <div>
      {/* ── Hero Performance Card ── */}
      <div className="mx-4 mt-4 mb-1 rounded-2xl overflow-hidden"
        style={{
          background: F.cardGlass,
          border: `1px solid ${F.border}`,
          boxShadow: F.shadow,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}>
        <div className="px-5 pt-5 pb-4 flex items-center gap-5">
          {/* Big volt completion ring */}
          <div className="relative shrink-0" style={{ width: 126, height: 126 }}>
            <svg viewBox="0 0 126 126" width={126} height={126} style={{ transform: "rotate(-90deg)" }}>
              <defs>
                <filter id="hero-ring-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <circle cx="63" cy="63" r="52" fill="none" stroke={F.track} strokeWidth="9" />
              <circle cx="63" cy="63" r="52" fill="none" stroke={F.volt} strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={`${heroFill} ${heroCirc - heroFill}`}
                filter="url(#hero-ring-glow)"
                style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span style={{
                fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                fontWeight: 900, fontStyle: "italic",
                fontSize: "clamp(30px, 10vw, 38px)",
                lineHeight: 1, color: F.tp, letterSpacing: "-0.03em",
              }}>{student.completionRate}%</span>
              <span className="text-[8px] font-black uppercase tracking-widest mt-0.5" style={{ color: F.tt }}>adherencia</span>
            </div>
          </div>

          {/* Right stats column */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Name + stage */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: F.ts }}>
                {student.stage} · E{student.stageNumber}
              </p>
              <p style={{
                fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                fontStyle: "italic", fontWeight: 900,
                fontSize: "clamp(20px, 6vw, 26px)",
                textTransform: "uppercase", color: F.tp,
                lineHeight: 1, letterSpacing: "0.02em",
              }}>{student.name.split(" ")[0]}</p>
              {day && (
                <p style={{
                  fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                  fontStyle: "italic", fontWeight: 700,
                  fontSize: "clamp(12px, 3.5vw, 15px)",
                  textTransform: "uppercase", color: F.volt,
                  letterSpacing: "0.04em", lineHeight: 1.2,
                  filter: "drop-shadow(0 0 4px rgba(212,255,0,0.35))",
                }}>{(day.muscleGroup || day.label).toUpperCase()}</p>
              )}
            </div>

            {/* Streak + rank */}
            <div className="flex items-center gap-2">
              <div className="flex items-end gap-1">
                <span style={{
                  fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                  fontWeight: 900, fontSize: "clamp(24px,8vw,30px)",
                  lineHeight: 1, color: F.volt, letterSpacing: "-0.03em",
                }}>{student.streak}</span>
                <span className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: F.tt }}>días</span>
              </div>
              <div className="w-px h-6" style={{ background: F.border }} />
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                style={{ background: `${rank.color}15`, border: `1px solid ${rank.color}35`, boxShadow: rank.glow }}>
                <span className="text-[13px]">{rank.emoji}</span>
                <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: rank.color }}>{rank.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Volt accent bottom strip */}
        <div className="h-[2px] w-full" style={{
          background: `linear-gradient(90deg, transparent, ${F.volt}60, transparent)`,
        }} />
      </div>

      {/* Motivational banner */}
      <MotivationalBanner sessionCompleted={!!workoutSession?.completed} streak={student.streak} />

      {/* Macro summary — live values */}
      <MacroSummaryCard
        totalTarget={targetCals}
        totalConsumed={consumedCals}
        targetMacros={targetMacros}
        consumedMacros={consumedMacros}
      />

      {/* Diet section header + scroll CTA */}
      <div className="flex items-center justify-between px-5 mt-4 mb-2">
        <div className="flex items-center gap-2">
          {meals.length > 0 && (
            <>
              <div className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{ background: F.blueBg, border: `1px solid rgba(96,165,250,0.18)` }}>
                <Utensils size={11} strokeWidth={2} style={{ color: F.blue }} />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.15em]" style={{ color: F.ts }}>Plan de Dieta</p>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {day && (
            <button
              onClick={() => routineRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold cursor-pointer transition-opacity hover:opacity-80 active:scale-95"
              style={{ background: F.blueBg, border: `1px solid ${F.blue}30`, color: F.blue }}>
              🏋️ Ver Rutina
            </button>
          )}
          {meals.length > 0 && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold cursor-pointer transition-opacity hover:opacity-80 active:scale-95 no-print"
              style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${F.border}`, color: F.ts }}>
              <Printer size={11} strokeWidth={1.75} />
              Imprimir
            </button>
          )}
        </div>
      </div>

      {/* Meal cards — locked if ROUTINE_ONLY */}
      <div className="relative">
        {student.membershipTier === "ROUTINE_ONLY" && (
          <div className="absolute inset-0 z-10 rounded-2xl mx-4 flex flex-col items-center justify-center gap-3"
            style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", borderRadius: 16 }}>
            <Lock size={24} strokeWidth={1.5} style={{ color: "#a1a1aa" }} />
            <p className="text-[13px] font-semibold text-center px-6" style={{ color: "#f4f4f5" }}>
              Esta sección no está incluida en tu plan básico.{"\n"}Contáctanos para desbloquearla ⚡
            </p>
          </div>
        )}
        {meals.length === 0 ? (
          <div className="mx-4 rounded-2xl flex flex-col items-center py-10 gap-2"
            style={{ background: F.card, border: `1px solid ${F.border}` }}>
            <Utensils size={28} strokeWidth={1.25} style={{ color: F.tt }} />
            <p className="text-[13px]" style={{ color: F.tt }}>Tu coach aún no asigna tu dieta.</p>
          </div>
        ) : (
          meals.map((m, i) => (
            <FitiaMealCard key={i} meal={m}
              checked={mealChecks.includes(m.name)}
              onToggleCheck={() => onMealToggle(m.name)}
              onOpen={() => onMealOpen(m)}
              substitutes={substitutes} />
          ))
        )}
      </div>

      {/* Routine section header */}
      <div ref={routineRef} className="flex items-center justify-between px-5 mt-5 mb-2"
        style={{ scrollMarginTop: 16 }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center"
            style={{ background: F.voltBg, border: `1px solid ${F.voltBor}` }}>
            <Dumbbell size={11} strokeWidth={2} style={{ color: F.volt }} />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.15em]" style={{ color: F.ts }}>Rutina de Hoy</p>
        </div>
        {day && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold cursor-pointer transition-opacity hover:opacity-80 active:scale-95 no-print"
            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${F.border}`, color: F.ts }}>
            <Printer size={11} strokeWidth={1.75} />
            Imprimir
          </button>
        )}
      </div>

      {/* Routine body — locked if DIET_ONLY */}
      <div className="relative">
        {student.membershipTier === "DIET_ONLY" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 mx-4 rounded-2xl"
            style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
            <Lock size={24} strokeWidth={1.5} style={{ color: "#a1a1aa" }} />
            <p className="text-[13px] font-semibold text-center px-6" style={{ color: "#f4f4f5" }}>
              Esta sección no está incluida en tu plan básico. Contáctanos para desbloquearla ⚡
            </p>
          </div>
        )}
      {!day ? (
        <div className="mx-4 rounded-2xl flex flex-col items-center py-10 gap-2"
          style={{ background: F.card, border: `1px solid ${F.border}` }}>
          <Dumbbell size={28} strokeWidth={1.25} style={{ color: F.tt }} />
          <p className="text-[13px]" style={{ color: F.tt }}>Día de descanso activo. ¡Recupérate bien!</p>
        </div>
      ) : (
        <div className="mx-4 rounded-2xl overflow-hidden mb-4"
          style={{
            background: F.cardGlass,
            border: `1px solid ${F.border}`,
            boxShadow: F.shadow,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}>
          {/* Routine hero header — "LEG DESTRUCTION" style */}
          <div className="px-4 pt-4 pb-3"
            style={{ borderBottom: `1px solid ${F.border}` }}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {/* Tiny day label */}
                <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: F.ts }}>
                  Sesión de hoy
                </p>
                {/* MASSIVE condensed italic title */}
                <p style={{
                  fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                  fontStyle: "italic",
                  fontWeight: 900,
                  fontSize: "clamp(30px, 10vw, 48px)",
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                  color: F.volt,
                  lineHeight: 0.95,
                  filter: "drop-shadow(0 0 12px rgba(212,255,0,0.45))",
                }}>
                  {(day.muscleGroup || day.label).toUpperCase()}
                </p>
                <p className="text-[11px] mt-1" style={{ color: F.ts }}>{day.label}</p>
              </div>
              {/* Session status pill */}
              {workoutSession?.completed ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl shrink-0"
                  style={{ background: "rgba(52,211,153,0.1)", border: `1px solid rgba(52,211,153,0.25)` }}>
                  <CheckCircle2 size={10} strokeWidth={2.5} style={{ color: F.green }} />
                  <span className="text-[10px] font-bold tracking-wide uppercase" style={{ color: F.green }}>Done</span>
                </div>
              ) : workoutSession ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl shrink-0 animate-volt-pulse"
                  style={{ background: F.voltBg, border: `1px solid ${F.voltBor}` }}>
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: F.volt }} />
                  <span className="text-[10px] font-bold tracking-wide uppercase" style={{ color: F.volt }}>Live</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Exercise list */}
          <div className="p-3 space-y-2">
            {day.exercises.map((ex, i) => {
              const exLogs = workoutLogs
                .filter(l => l.exerciseName === ex.name)
                .sort((a, b) => b.date.localeCompare(a.date));
              const todayLog = exLogs.find(l => l.date === todayStr) ?? null;
              const prevLog  = exLogs.find(l => l.date !== todayStr) ?? null;
              return (
                <AccordionExerciseRow key={i}
                  exercise={{ ...ex, muscleGroup: day.muscleGroup }}
                  onDetails={() => onExerciseOpen({ ...ex, muscleGroup: day.muscleGroup })}
                  todayLog={todayLog}
                  prevLog={prevLog}
                  todayStr={todayStr} />
              );
            })}
          </div>

          {/* Strength Telemetry sparkline */}
          <StrengthTelemetry logs={workoutLogs} />

          {/* END SESSION — full-width Volt block */}
          {!workoutSession?.completed && (
            <div className="px-3 pb-3 pt-2">
              <button
                onClick={() => onFinalizeSession(`${day.label} · ${day.muscleGroup ?? ""}`)}
                disabled={finalizingSession}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
                style={{
                  background: finalizingSession ? "rgba(212,255,0,0.5)" : F.volt,
                  color: "#000",
                  fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                  fontStyle: "italic",
                  fontWeight: 900,
                  fontSize: "15px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  boxShadow: finalizingSession ? "none" : "0 4px 20px rgba(212,255,0,0.35)",
                }}>
                {finalizingSession
                  ? <><Loader2 size={16} className="animate-spin" /> Guardando…</>
                  : <><CheckCircle2 size={16} /> End Session</>}
              </button>
            </div>
          )}
        </div>
      )}
      </div>{/* end routine relative wrapper */}

      {/* Hydration card */}
      <WaterTrackerCard totalMl={waterTotalMl} onAdd={onAddWater} />

      <div style={{ height: 8 }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   WATER TRACKER CARD
══════════════════════════════════════════════════════════════ */
const WATER_TARGET_ML = 3000;
const GLASS_ML = 250;
const TOTAL_GLASSES = WATER_TARGET_ML / GLASS_ML; // 12

function WaterTrackerCard({ totalMl, onAdd }: { totalMl: number; onAdd: (ml: number) => void }) {
  const pct = Math.min((totalMl / WATER_TARGET_ML) * 100, 100);
  const liters = (totalMl / 1000);
  const done = totalMl >= WATER_TARGET_ML;

  return (
    <div className="mx-4 mt-4 rounded-2xl overflow-hidden"
      style={{
        background: F.cardGlass,
        border: `1px solid ${F.border}`,
        boxShadow: F.shadow,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}>
      <div className="px-5 pt-5 pb-4">
        {/* Header label */}
        <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: F.ts }}>
          Hidratación del Día
        </p>

        {/* Big metric row */}
        <div className="flex items-end justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <span style={{
              fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
              fontWeight: 900,
              fontSize: "clamp(60px, 20vw, 80px)",
              lineHeight: 1,
              color: done ? F.green : F.tp,
              letterSpacing: "-0.04em",
              filter: done ? `drop-shadow(0 0 14px rgba(52,211,153,0.5))` : undefined,
            }}>
              {liters.toFixed(1)}
            </span>
            <span className="text-[18px] font-light mb-1" style={{ color: F.ts }}>L</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px]" style={{ color: F.ts }}>{totalMl} / {WATER_TARGET_ML} ml</span>
            {done && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg"
                style={{ background: "rgba(52,211,153,0.1)", border: `1px solid rgba(52,211,153,0.2)` }}>
                <CheckCircle2 size={9} strokeWidth={2.5} style={{ color: F.green }} />
                <span className="text-[9px] font-bold" style={{ color: F.green }}>Meta ✓</span>
              </div>
            )}
          </div>
        </div>

        {/* Slim progress bar */}
        <div className="w-full h-[3px] rounded-full overflow-hidden mb-4" style={{ background: F.track }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: done
                ? `linear-gradient(90deg, ${F.green}, #86efac)`
                : `linear-gradient(90deg, #0ea5e9, #38bdf8)`,
              boxShadow: done ? `0 0 8px rgba(52,211,153,0.5)` : `0 0 8px rgba(56,189,248,0.5)`,
            }} />
        </div>

        {/* Log Water buttons */}
        <div className="flex gap-2">
          {[250, 500].map(ml => (
            <button key={ml} onClick={() => onAdd(ml)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl cursor-pointer transition-transform active:scale-95"
              style={{
                height: 44,
                background: ml === 500 ? "#38bdf8" : F.card,
                border: `1px solid ${ml === 500 ? "transparent" : F.border}`,
                color: ml === 500 ? "#000" : "#38bdf8",
                fontFamily: "var(--font-display, sans-serif)",
                fontWeight: 800,
                fontStyle: "italic",
                fontSize: "13px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                boxShadow: ml === 500 ? "0 4px 14px rgba(56,189,248,0.3)" : undefined,
              }}>
              <Plus size={12} strokeWidth={2.5} />
              +{ml} ml
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PHOTO LIGHTBOX
══════════════════════════════════════════════════════════════ */
function PhotoLightbox({ photos, initialIdx, onClose }: {
  photos: any[]; initialIdx: number; onClose: () => void;
}) {
  const [idx, setIdx] = useState(initialIdx);
  const photo = photos[idx];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")  setIdx(i => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setIdx(i => Math.min(photos.length - 1, i + 1));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, photos.length]);

  return (
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center"
      style={{ background: "rgba(0,0,0,0.97)" }}
      onClick={onClose}>
      <button onClick={onClose}
        className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.1)" }}>
        <X size={17} style={{ color: "#fff" }} />
      </button>
      <div className="relative w-full max-w-lg px-5" onClick={e => e.stopPropagation()}>
        <img
          src={photo.url} alt={photo.label}
          className="w-full rounded-2xl object-cover object-top"
          style={{ maxHeight: "72vh" }}
        />
        <div className="mt-3 text-center">
          <p className="text-[13px] font-medium" style={{ color: "#fff" }}>{photo.label}</p>
          {photo.weight && (
            <p className="text-[11px] mt-0.5" style={{ color: F.ts }}>{photo.weight} kg</p>
          )}
        </div>
        {photos.length > 1 && (
          <div className="flex items-center justify-between mt-5 px-2">
            <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-opacity disabled:opacity-25"
              style={{ background: "rgba(255,255,255,0.1)" }}>
              <ChevronLeft size={16} style={{ color: "#fff" }} />
            </button>
            <div className="flex gap-2 items-center">
              {photos.map((_: any, i: number) => (
                <button key={i} onClick={() => setIdx(i)}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: i === idx ? 18 : 6, height: 6,
                    background: i === idx ? "#fff" : "rgba(255,255,255,0.3)",
                  }} />
              ))}
            </div>
            <button onClick={() => setIdx(i => Math.min(photos.length - 1, i + 1))}
              disabled={idx === photos.length - 1}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-opacity disabled:opacity-25"
              style={{ background: "rgba(255,255,255,0.1)" }}>
              <ChevronRight size={16} style={{ color: "#fff" }} />
            </button>
          </div>
        )}
      </div>
      <p className="absolute bottom-7 text-[11px]" style={{ color: F.ts }}>
        {idx + 1} / {photos.length}
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MEASUREMENT SPARKLINE
══════════════════════════════════════════════════════════════ */
function MeasTrendLine({ months, metric, color }: { months: any[]; metric: string; color: string }) {
  if (months.length < 2) return null;
  const vals = months.map((m: any) => (m[metric] as number) ?? 0);
  const mn = Math.min(...vals), mx = Math.max(...vals);
  const range = mx - mn || 1;
  const W = 52, H = 18, pad = 3;
  const pts = vals.map((v, i) => ({
    x: pad + (i / (vals.length - 1)) * (W - pad * 2),
    y: H - pad - ((v - mn) / range) * (H - pad * 2),
  }));
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ overflow: "visible", flexShrink: 0 }}>
      <path d={d} fill="none" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="3" fill={color}
        style={{ filter: `drop-shadow(0 0 3px ${color}88)` }} />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   TAB: PROGRESO (light)
══════════════════════════════════════════════════════════════ */
const MEAS_LABELS: [string, string][] = [
  ["Pecho",   "chest"],
  ["Cintura", "waist"],
  ["Cadera",  "hips"],
  ["Brazo I", "armL"],
  ["Brazo D", "armR"],
  ["Muslo I", "thighL"],
  ["Muslo D", "thighR"],
];

function TabProgreso({ student, detail, startWeight, carreras, onBadge }: {
  student: Student; detail: Detail; startWeight: number;
  carreras: any[]; onBadge: () => void;
}) {
  const diff = +(student.currentWeight - startWeight).toFixed(1);

  /* ── Month timeline ── */
  const sortedMonths = useMemo(
    () => [...((detail.measurements as any[]) ?? [])].sort((a: any, b: any) => a.date.localeCompare(b.date)),
    [detail.measurements],
  );
  const [activeMonthIdx, setActiveMonthIdx] = useState(() => Math.max(0, sortedMonths.length - 1));
  const activeMeas: any = sortedMonths[activeMonthIdx];

  const allPhotos: any[] = useMemo(() => (detail as any).photos ?? [], [detail]);
  const monthPhotos = useMemo(() => {
    const re = new RegExp(`^Mes\\s*${activeMonthIdx + 1}\\b`, "i");
    return allPhotos.filter((p: any) => re.test(p.label ?? ""));
  }, [allPhotos, activeMonthIdx]);

  /* Lightbox */
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  /* Weight closest to this measurement date */
  const closestWeight = useMemo(() => {
    if (!activeMeas || !(detail.weightHistory?.length)) return null;
    return [...detail.weightHistory].sort((a, b) => {
      const t = new Date(activeMeas.date).getTime();
      return Math.abs(new Date(a.date).getTime() - t) - Math.abs(new Date(b.date).getTime() - t);
    })[0];
  }, [activeMeas, detail.weightHistory]);

  return (
    <div className="px-4 pt-4 space-y-3 pb-4">
      <div className="pb-1">
        <h1 className="text-[22px] font-bold" style={{ color: F.tp }}>Mi Progreso</h1>
        <p className="text-[12px]" style={{ color: F.tt }}>Tu evolución mes a mes</p>
      </div>

      {/* ── Monthly timeline ── */}
      {sortedMonths.length > 0 ? (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: F.card, border: `1px solid ${F.border}`, boxShadow: F.shadow }}>

          {/* Month navigation bar */}
          <div className="flex items-center gap-2 px-3 py-3"
            style={{ borderBottom: `1px solid ${F.border}` }}>
            <button
              onClick={() => setActiveMonthIdx(i => Math.max(0, i - 1))}
              disabled={activeMonthIdx === 0}
              className="w-8 h-8 flex items-center justify-center rounded-xl shrink-0 transition-opacity disabled:opacity-20 cursor-pointer"
              style={{ background: F.bg, border: `1px solid ${F.border}` }}>
              <ChevronLeft size={14} style={{ color: F.ts }} />
            </button>
            <div className="flex-1 flex items-center gap-1.5 overflow-x-auto"
              style={{ scrollbarWidth: "none" }}>
              {sortedMonths.map((_: any, i: number) => (
                <button key={i} onClick={() => setActiveMonthIdx(i)}
                  className="flex-shrink-0 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold cursor-pointer whitespace-nowrap transition-all duration-200"
                  style={{
                    background: i === activeMonthIdx ? F.volt : F.bg,
                    color: i === activeMonthIdx ? "#000" : F.ts,
                    border: `1px solid ${i === activeMonthIdx ? F.volt : F.border}`,
                    fontWeight: i === activeMonthIdx ? 900 : 600,
                  }}>
                  Mes {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setActiveMonthIdx(i => Math.min(sortedMonths.length - 1, i + 1))}
              disabled={activeMonthIdx === sortedMonths.length - 1}
              className="w-8 h-8 flex items-center justify-center rounded-xl shrink-0 transition-opacity disabled:opacity-20 cursor-pointer"
              style={{ background: F.bg, border: `1px solid ${F.border}` }}>
              <ChevronRight size={14} style={{ color: F.ts }} />
            </button>
          </div>

          {activeMeas ? (
            <>
              {/* Month meta — date + closest weight */}
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: `1px solid ${F.border}` }}>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: F.tt }}>
                    Mes {activeMonthIdx + 1}
                  </p>
                  <p className="text-[12px] mt-0.5 font-medium tabular-nums" style={{ color: F.ts }}>
                    {activeMeas.date}
                  </p>
                </div>
                {closestWeight && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                    style={{ background: F.bg, border: `1px solid ${F.border}` }}>
                    <Weight size={11} style={{ color: F.blue }} />
                    <span className="text-[13px] font-semibold tabular-nums" style={{ color: F.tp }}>
                      {closestWeight.weight} kg
                    </span>
                  </div>
                )}
              </div>

              {/* Historial de medidas — read-only */}
              <div className="px-4 pt-3 pb-4">
                <p className="text-[9px] uppercase tracking-widest font-semibold mb-3" style={{ color: F.tt }}>
                  Historial de Medidas
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {MEAS_LABELS.map(([lbl, key]) => {
                    const val = activeMeas[key];
                    const firstMeas = sortedMonths[0];
                    const prevMeas  = activeMonthIdx > 0 ? sortedMonths[activeMonthIdx - 1] : null;
                    const delta     = firstMeas && activeMonthIdx > 0
                      ? Math.round((val - firstMeas[key]) * 10) / 10
                      : null;
                    const prevDelta = prevMeas
                      ? Math.round((val - prevMeas[key]) * 10) / 10
                      : null;
                    return (
                      <div key={key} className="rounded-xl px-3 py-2.5"
                        style={{ background: F.bg, border: `1px solid ${F.border}` }}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[9px] uppercase tracking-wider" style={{ color: F.tt }}>{lbl}</p>
                          <MeasTrendLine months={sortedMonths} metric={key} color={F.blue} />
                        </div>
                        <p className="tabular-nums leading-none font-black"
                          style={{ color: val ? F.tp : F.tt, fontSize: "clamp(22px,7vw,28px)", letterSpacing: "-0.03em" }}>
                          {val ?? "—"}
                          {val ? <span className="text-[9px] font-bold ml-0.5 uppercase tracking-wider" style={{ color: F.tt }}>cm</span> : null}
                        </p>
                        {delta !== null && delta !== 0 && (
                          <p className="text-[9px] font-semibold mt-1 tabular-nums"
                            style={{ color: delta < 0 ? F.green : F.red }}>
                            {delta > 0 ? "+" : ""}{delta} inicio
                          </p>
                        )}
                        {prevDelta !== null && prevDelta !== 0 && (
                          <p className="text-[9px] mt-0.5 tabular-nums"
                            style={{ color: prevDelta < 0 ? F.green : F.red, opacity: 0.65 }}>
                            {prevDelta > 0 ? "+" : ""}{prevDelta} vs ant.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <p className="text-[12px] px-4 py-8 text-center" style={{ color: F.tt }}>
              Tu coach aún no ha registrado medidas para este mes.
            </p>
          )}

          {/* Galería de fotos del mes */}
          {monthPhotos.length > 0 && (
            <div className="px-4 pb-4" style={{ borderTop: `1px solid ${F.border}` }}>
              <p className="text-[9px] uppercase tracking-widest font-semibold py-3" style={{ color: F.tt }}>
                Galería · Mes {activeMonthIdx + 1}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {monthPhotos.map((p: any, i: number) => (
                  <button key={p.id ?? i} onClick={() => setLightboxIdx(i)}
                    className="rounded-xl overflow-hidden active:scale-95 transition-transform cursor-pointer"
                    style={{ aspectRatio: "3/4", background: F.border }}>
                    <img src={p.url} alt={p.label}
                      className="w-full h-full object-cover object-top" />
                  </button>
                ))}
              </div>
              {monthPhotos.length > 1 && (
                <p className="text-[9px] text-center mt-2.5" style={{ color: F.tt }}>
                  Toca una foto para ampliarla
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Empty state — no measurements yet */
        <div className="rounded-2xl p-8 flex flex-col items-center gap-3 text-center"
          style={{ background: F.card, border: `1px solid ${F.border}`, boxShadow: F.shadow }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: F.bg, border: `1px solid ${F.border}` }}>
            <BarChart3 size={22} strokeWidth={1.25} style={{ color: F.tt }} />
          </div>
          <p className="text-[14px] font-semibold" style={{ color: F.tp }}>Sin medidas todavía</p>
          <p className="text-[12px] max-w-[220px] leading-relaxed" style={{ color: F.tt }}>
            Tu coach registrará tus medidas mensualmente para ver tu evolución aquí.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Peso actual",  value: `${student.currentWeight}`, unit: "kg",
            sub: diff !== 0 ? `${diff > 0 ? "+" : ""}${diff} kg desde inicio` : "Sin cambios",
            subColor: diff <= 0 ? F.green : F.red, icon: TrendingDown, iconBg: F.blueBg, iconColor: F.blue },
          { label: "Racha activa", value: `${student.streak}`, unit: "días",
            sub: "¡Sigue así!", subColor: F.carbs, icon: Flame, iconBg: "#FFF7ED", iconColor: F.carbs },
        ].map(({ label, value, unit, sub, subColor, icon: Icon, iconBg, iconColor }) => (
          <div key={label} className="rounded-2xl p-4"
            style={{ background: F.card, border: `1px solid ${F.border}`, boxShadow: F.shadow }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: F.tt }}>{label}</span>
              <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
                <Icon size={13} strokeWidth={1.75} style={{ color: iconColor }} />
              </div>
            </div>
            <p className="text-[26px] font-thin tabular-nums leading-none" style={{ color: F.tp }}>
              {value}<span className="text-[11px] font-normal ml-1" style={{ color: F.tt }}>{unit}</span>
            </p>
            <p className="text-[11px] mt-1.5 font-medium" style={{ color: subColor }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-2xl p-4" style={{ background: F.card, border: `1px solid ${F.border}`, boxShadow: F.shadow }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: F.blueBg }}>
            <TrendingUp size={12} strokeWidth={2} style={{ color: F.blue }} />
          </div>
          <h3 className="text-[13px] font-semibold" style={{ color: F.tp }}>Evolución de peso</h3>
        </div>
        <WeightChart history={detail.weightHistory} />
      </div>

      {/* Log form */}
      <div className="rounded-2xl p-4" style={{ background: F.card, border: `1px solid ${F.border}`, boxShadow: F.shadow }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: F.blueBg }}>
            <Weight size={12} strokeWidth={2} style={{ color: F.blue }} />
          </div>
          <h3 className="text-[13px] font-semibold" style={{ color: F.tp }}>Registrar progreso</h3>
        </div>
        <ProgressForm onSaved={() => {}} />
      </div>

      {/* Carreras */}
      {carreras.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: F.card, border: `1px solid ${F.border}`, boxShadow: F.shadow }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "#EEF0FF" }}>
              <Activity size={12} strokeWidth={2} style={{ color: "#6366F1" }} />
            </div>
            <h3 className="text-[13px] font-semibold" style={{ color: F.tp }}>Mis carreras</h3>
          </div>
          <div className="space-y-2">
            {carreras.slice(0, 5).map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl"
                style={{ background: F.bg }}>
                <div>
                  <p className="text-[12px] font-medium" style={{ color: F.tp }}>
                    {(c.distanceM / 1000).toFixed(2)} km
                  </p>
                  <p className="text-[10px]" style={{ color: F.tt }}>{c.date}</p>
                </div>
                <p className="text-[12px] tabular-nums" style={{ color: F.ts }}>
                  {Math.floor(c.durationS / 60)}'{String(c.durationS % 60).padStart(2,"0")}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badge */}
      <button onClick={onBadge}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-[13px] font-medium cursor-pointer transition-opacity hover:opacity-75"
        style={{ background: F.card, border: `1px solid ${F.border}`, color: F.ts, boxShadow: F.shadow }}>
        <Download size={14} strokeWidth={1.75} style={{ color: F.ts }} /> Descargar Insignia de Progreso
      </button>

      {/* Photo lightbox */}
      {lightboxIdx !== null && (
        <PhotoLightbox
          photos={monthPhotos}
          initialIdx={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STRENGTH TELEMETRY — Volt sparkline SVG
══════════════════════════════════════════════════════════════ */
function StrengthTelemetry({ logs }: { logs: WorkoutLogEntry[] }) {
  const pts = logs.length > 1
    ? logs.slice(-14).map(l => l.sets.filter(s => s.completed).length)
    : [4,3,5,2,6,3,5,4,7,3,6,4,5,3];

  const max = Math.max(...pts, 1), min = Math.min(...pts, 0);
  const W = 280, H = 44;
  const norm = pts.map(p => (max === min) ? 0.5 : (p - min) / (max - min));
  const pathD = norm.map((y, i) => {
    const px = (i / (norm.length - 1)) * W;
    const py = H - y * H * 0.85 - H * 0.05;
    return `${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`;
  }).join(" ");
  const fillD = pathD + ` L${W},${H} L0,${H} Z`;

  return (
    <div className="px-4 pt-3 pb-2" style={{ borderTop: `1px solid ${F.border}` }}>
      <p className="text-[9px] font-black uppercase tracking-[0.18em] mb-2" style={{ color: F.ts }}>
        Strength Telemetry
      </p>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height: 44, display: "block" }}>
        <defs>
          <linearGradient id="voltAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={VOLT} stopOpacity="0.22" />
            <stop offset="100%" stopColor={VOLT} stopOpacity="0" />
          </linearGradient>
        </defs>
        <defs>
          <linearGradient id="voltAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={VOLT} stopOpacity="0.28" />
            <stop offset="100%" stopColor={VOLT} stopOpacity="0" />
          </linearGradient>
          <filter id="tele-glow" x="-10%" y="-60%" width="120%" height="220%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d={fillD} fill="url(#voltAreaGrad)" />
        <path d={pathD} fill="none" stroke={VOLT} strokeWidth="3"
          strokeLinecap="round" strokeLinejoin="round" filter="url(#tele-glow)" />
        {/* Last point dot */}
        {norm.length > 0 && (() => {
          const last = norm[norm.length - 1];
          const px = W;
          const py = H - last * H * 0.85 - H * 0.05;
          return <circle cx={px} cy={py} r={4} fill={VOLT} style={{ filter: "drop-shadow(0 0 6px rgba(212,255,0,0.9))" }} />;
        })()}
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   RANK BADGE UTILS
══════════════════════════════════════════════════════════════ */
function getRank(streak: number): { emoji: string; label: string; color: string; glow?: string } {
  if (streak >= 16) return { emoji: "👑", label: "Bestia Elite", color: "#f59e0b", glow: "0 0 10px rgba(245,158,11,0.35)" };
  if (streak >= 6)  return { emoji: "🔥", label: "Constante",   color: "#fb923c" };
  return { emoji: "🥚", label: "Novato", color: "#71717a" };
}

/* ══════════════════════════════════════════════════════════════
   MOTIVATIONAL BANNER
══════════════════════════════════════════════════════════════ */
const QUOTES_MORNING   = ["El cuerpo logra lo que la mente ordena. 🌅", "Cada mañana es otra oportunidad para ser imparable. ⚡", "Los campeones se forjan antes de que salga el sol. 💪"];
const QUOTES_AFTERNOON = ["A mitad del día, a mitad del camino — no pares ahora. 🔥", "El dolor es temporal; la mediocridad, para siempre. 💥", "No busques motivación — sé la razón por la que otros se motivan. 🏆"];
const QUOTES_EVENING   = ["Una sesión más y tu yo del futuro te lo agradecerá. ⭐", "La constancia supera siempre al talento. 👑", "Cierra el día sin deudas contigo mismo. 💯"];
const QUOTES_COMPLETED = ["¡Sesión completada! Eso es lo que distingue a los mejores. 🏆", "Entrenamiento listo. Nadie te puede quitar ese trabajo. 🔥", "Bestia mode ON. Otra sesión en el banco. 💪"];

function MotivationalBanner({ sessionCompleted, streak }: { sessionCompleted: boolean; streak: number }) {
  const [quote, setQuote] = useState("");
  const rank = getRank(streak);

  useEffect(() => {
    const h = new Date().getHours();
    const pool = sessionCompleted ? QUOTES_COMPLETED : h < 12 ? QUOTES_MORNING : h < 18 ? QUOTES_AFTERNOON : QUOTES_EVENING;
    setQuote(pool[Math.floor(Math.random() * pool.length)]);
  }, [sessionCompleted]);

  if (!quote) return null;

  return (
    <div className="mx-4 mt-3 rounded-2xl px-4 py-3.5 relative overflow-hidden"
      style={{
        background: sessionCompleted
          ? `linear-gradient(135deg, rgba(52,211,153,0.06) 0%, ${F.voltBg} 100%)`
          : F.voltBg,
        border: `1px solid ${sessionCompleted ? "rgba(52,211,153,0.22)" : F.voltBor}`,
      }}>
      {/* Volt accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
        style={{ background: sessionCompleted ? F.green : F.volt }} />
      <p className="text-[13px] font-semibold leading-snug pl-1" style={{ color: F.tp }}>{quote}</p>
      <div className="flex items-center gap-1.5 mt-1.5 pl-1">
        <span className="text-[11px] font-bold" style={{ color: rank.color }}>{rank.emoji} {rank.label}</span>
        <span className="text-[10px]" style={{ color: F.ts }}>· {streak} días de racha</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TAB: COMUNIDAD (group chat + gamified rank badges)
══════════════════════════════════════════════════════════════ */
interface GroupMsg { id: string; senderId: string; senderName: string; role: string; content: string; createdAt: string; }

function TabComunidad({ student }: { student: Student }) {
  const coachId = student.coachId;
  const rank = getRank(student.streak);
  const [messages, setMessages] = useState<GroupMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    if (!coachId) return;
    try {
      const res = await fetch(`/api/community/messages?coachId=${coachId}`);
      if (res.ok) { const data = await res.json(); setMessages(Array.isArray(data) ? data : []); setLoaded(true); }
    } catch {}
  }, [coachId]);

  useEffect(() => {
    loadMessages();
    const t = setInterval(loadMessages, 10000);
    return () => clearInterval(t);
  }, [loadMessages]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const sendMessage = async () => {
    if (!coachId || !input.trim() || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");
    try {
      const res = await fetch("/api/community/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coachId, content, senderName: student.name }),
      });
      if (res.ok) loadMessages();
    } finally { setSending(false); }
  };

  const fmt = (iso: string) => new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

  if (!coachId) {
    return (
      <div className="px-4 pt-4 pb-4">
        <h1 className="text-[22px] font-bold mb-1" style={{ color: F.tp }}>Comunidad</h1>
        <div className="rounded-2xl p-8 flex flex-col items-center gap-3 mt-4"
          style={{ background: F.card, border: `1px solid ${F.border}` }}>
          <MessageCircle size={28} strokeWidth={1.25} style={{ color: F.tt }} />
          <p className="text-[13px] text-center" style={{ color: F.tt }}>No estás vinculado a un coach todavía.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-4">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold" style={{ color: F.tp }}>Comunidad</h1>
            <p className="text-[12px]" style={{ color: F.tt }}>Sala de tu equipo</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: F.card, border: `1px solid ${F.border}`, boxShadow: rank.glow ?? "none" }}>
            <span style={{ fontSize: 16 }}>{rank.emoji}</span>
            <div>
              <p className="text-[11px] font-semibold" style={{ color: rank.color }}>{rank.label}</p>
              <p className="text-[10px]" style={{ color: F.tt }}>{student.streak} días</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          {([
            { emoji: "🥚", label: "Novato",       sub: "1-5 días",  color: "#71717a" },
            { emoji: "🔥", label: "Constante",    sub: "6-15 días", color: "#fb923c" },
            { emoji: "👑", label: "Bestia Elite",  sub: "16+ días",  color: "#f59e0b" },
          ] as const).map(r => (
            <div key={r.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
              style={{ background: F.card, border: `1px solid ${F.border}` }}>
              <span style={{ fontSize: 13 }}>{r.emoji}</span>
              <span className="text-[10px] font-semibold" style={{ color: r.color }}>{r.label}</span>
              <span className="text-[10px]" style={{ color: F.tt }}>{r.sub}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-3 overflow-y-auto pb-2" style={{ minHeight: 200, maxHeight: "calc(100vh - 62px - 260px)" }}>
        {!loaded ? (
          <div className="flex justify-center py-10">
            <Loader2 size={18} className="animate-spin" style={{ color: F.tt }} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-2">
            <MessageCircle size={28} strokeWidth={1.25} style={{ color: F.tt }} />
            <p className="text-[13px]" style={{ color: F.tt }}>Sé el primero en escribir algo. 💪</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMine = msg.senderName === student.name && msg.role !== "COACH";
            const isCoach = msg.role === "COACH";
            const msgRank = getRank(isMine ? student.streak : 0);
            return (
              <div key={msg.id} className={`flex gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[14px]"
                  style={{ background: isCoach ? "rgba(99,102,241,0.2)" : F.card, border: `1px solid ${F.border}` }}>
                  {isCoach ? "🏋️" : (isMine ? rank.emoji : "🥚")}
                </div>
                <div className={`max-w-[72%] flex flex-col gap-0.5 ${isMine ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-medium" style={{ color: isCoach ? "#818cf8" : F.ts }}>
                      {isCoach ? "Coach" : msg.senderName}
                    </span>
                    {!isCoach && <span className="text-[10px]" style={{ color: msgRank.color }}>{isMine ? rank.label : "Novato"}</span>}
                    <span className="text-[9px]" style={{ color: F.tt }}>{fmt(msg.createdAt)}</span>
                  </div>
                  <div className="rounded-2xl px-3 py-2"
                    style={{
                      background: isMine ? F.blueBg : isCoach ? "rgba(99,102,241,0.12)" : F.card,
                      border: `1px solid ${isMine ? F.blue + "30" : isCoach ? "rgba(99,102,241,0.25)" : F.border}`,
                    }}>
                    <p className="text-[13px] leading-snug" style={{ color: F.tp }}>{msg.content}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 pt-3" style={{ borderTop: `1px solid ${F.border}` }}>
        <div className="flex items-center gap-2">
          <input
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Escribe algo motivador…"
            className="flex-1 rounded-2xl px-4 py-2.5 text-[13px] outline-none"
            style={{ background: F.card, border: `1px solid ${F.border}`, color: F.tp }}
          />
          <button onClick={sendMessage} disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-opacity disabled:opacity-40 cursor-pointer"
            style={{ background: F.blue }}>
            {sending
              ? <Loader2 size={15} className="animate-spin" style={{ color: "#000" }} />
              : <Send size={15} style={{ color: "#000" }} />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CANCEL SUBSCRIPTION SHEET (light)
══════════════════════════════════════════════════════════════ */
const CANCEL_REASONS = [
  "Falta de tiempo", "Precio muy alto", "Lesión o problema de salud",
  "Logré mi objetivo", "Otra razón",
];

function CancelSubscriptionSheet({ reason, onReasonChange, onConfirm, status, onClose }: {
  reason: string; onReasonChange: (r: string) => void;
  onConfirm: () => void; status: "idle" | "loading" | "done" | "error";
  onClose: () => void;
}) {
  if (status === "done") {
    return (
      <div className="flex flex-col items-center py-10 gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "#D1FAE5", border: `1px solid ${F.green}30` }}>
          <CheckCircle2 size={26} strokeWidth={1.5} style={{ color: F.green }} />
        </div>
        <p className="text-[17px] font-semibold" style={{ color: F.tp }}>Suscripción cancelada</p>
        <p className="text-[13px] text-center max-w-[240px]" style={{ color: F.ts }}>
          Tu acceso se mantiene hasta el final del período actual.
        </p>
      </div>
    );
  }
  return (
    <>
      <div className="flex items-center gap-3 mb-5 mt-1">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "#FFF7ED", border: "1px solid #FED7AA" }}>
          <AlertTriangle size={18} strokeWidth={1.5} style={{ color: F.carbs }} />
        </div>
        <div>
          <h2 className="text-[18px] font-semibold" style={{ color: F.tp }}>¿Por qué cancelas?</h2>
          <p className="text-[12px]" style={{ color: F.ts }}>Ayúdanos a mejorar nuestro servicio</p>
        </div>
      </div>
      <div className="space-y-2 mb-5">
        {CANCEL_REASONS.map((r) => (
          <button key={r} onClick={() => onReasonChange(r)}
            className="w-full flex items-center gap-3 px-4 rounded-2xl text-left transition-all duration-150 active:scale-[0.98] cursor-pointer"
            style={{
              height: 52,
              background: reason === r ? F.blueBg : F.bg,
              border: `1px solid ${reason === r ? F.blue : F.border}`,
            }}>
            <span className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
              style={{ border: `1.5px solid ${reason === r ? F.blue : F.tt}`, background: reason === r ? F.blue : "transparent" }}>
              {reason === r && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </span>
            <span className="text-[13px] font-medium" style={{ color: reason === r ? F.blue : F.ts }}>{r}</span>
          </button>
        ))}
      </div>
      {status === "error" && (
        <p className="text-[12px] mb-4 px-4 py-2.5 rounded-xl text-center"
          style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: F.red }}>
          Hubo un error. Intenta de nuevo.
        </p>
      )}
      <button onClick={onConfirm} disabled={!reason || status === "loading"}
        className="w-full flex items-center justify-center gap-2 rounded-2xl text-[14px] font-semibold transition-opacity disabled:opacity-40 cursor-pointer"
        style={{ height: 52, background: "#FEF2F2", border: "1px solid #FECACA", color: F.red }}>
        {status === "loading" ? <Loader2 size={17} className="animate-spin" /> : "Confirmar cancelación"}
      </button>
      <button onClick={onClose}
        className="w-full flex items-center justify-center mt-3 rounded-2xl text-[14px] font-semibold cursor-pointer transition-opacity hover:opacity-80"
        style={{ height: 52, background: F.blue, color: "#000" }}>
        Mantener suscripción
      </button>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   TAB: PERFIL (light)
══════════════════════════════════════════════════════════════ */
function TabPerfil({ student, detail, avatarUrl, onAvatarUpdate, onCancelRequest }: {
  student: Student; detail: Detail;
  avatarUrl: string | null; onAvatarUpdate: () => void;
  onCancelRequest: () => void;
}) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const displayUrl = avatarPreview ?? avatarUrl;

  const handleAvatarFile = async (file: File) => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    setUploading(true);
    const fd = new FormData();
    fd.append("photo", file);
    fd.append("label", "avatar");
    await fetch("/api/me", { method: "POST", body: fd });
    setUploading(false);
    URL.revokeObjectURL(preview);
    setAvatarPreview(null);
    onAvatarUpdate();
  };

  return (
    <div className="px-4 pt-4 pb-4 space-y-3">
      <div>
        <h1 className="text-[22px] font-bold" style={{ color: F.tp }}>Perfil</h1>
        <p className="text-[12px]" style={{ color: F.tt }}>Tu cuenta y datos físicos</p>
      </div>

      {/* Avatar card */}
      <div className="rounded-2xl p-4" style={{ background: F.card, border: `1px solid ${F.border}`, boxShadow: F.shadow }}>
        <div className="flex items-center gap-5">
          {/* Clickable golden avatar */}
          <div className="relative shrink-0">
            <GoldenAvatar
              url={displayUrl}
              name={student.name}
              sizeClass="h-24 w-24 md:h-28 md:w-28"
              onClick={() => !uploading && avatarInputRef.current?.click()}
              showCamera={!uploading}
            />
            {uploading && (
              <div className="absolute inset-0 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.5)" }}>
                <Loader2 size={18} className="animate-spin" style={{ color: "#fff" }} />
              </div>
            )}
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarFile(f); e.target.value = ""; }} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[17px] font-semibold truncate" style={{ color: F.tp }}>{student.name}</p>
            <p className="text-[11px] mt-0.5 truncate" style={{ color: F.tt }}>{student.email ?? ""}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: F.green }} />
              <span className="text-[10px] font-medium" style={{ color: F.green }}>Suscripción activa</span>
            </div>
            <p className="text-[9px] mt-2" style={{ color: F.tt }}>Toca la foto para cambiarla</p>
          </div>
        </div>
      </div>

      {/* Body stats */}
      <div className="rounded-2xl p-4" style={{ background: F.card, border: `1px solid ${F.border}`, boxShadow: F.shadow }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: F.blueBg }}>
            <User size={12} strokeWidth={2} style={{ color: F.blue }} />
          </div>
          <h3 className="text-[13px] font-semibold" style={{ color: F.tp }}>Datos físicos</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Estatura",    value: detail.height  && detail.height  > 0 ? `${detail.height} cm`  : "—", icon: Ruler,        color: "#8B5CF6" },
            { label: "% Grasa",    value: detail.bodyFat && detail.bodyFat > 0 ? `${detail.bodyFat}%`   : "—", icon: Droplet,      color: F.blue },
            { label: "Peso actual", value: `${student.currentWeight} kg`,                                       icon: TrendingDown, color: F.green },
            { label: "Racha",      value: `${student.streak} días`,                                             icon: Flame,        color: F.carbs },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl p-3"
              style={{ background: F.bg, border: `1px solid ${F.border}` }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] uppercase tracking-wider font-medium" style={{ color: F.tt }}>{label}</span>
                <Icon size={11} style={{ color }} />
              </div>
              <p className="tabular-nums leading-tight font-black" style={{ color: value === "—" ? F.tt : F.tp, fontSize: "clamp(20px,6vw,24px)", letterSpacing: "-0.02em" }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Account info */}
      <div className="rounded-2xl overflow-hidden" style={{ background: F.card, border: `1px solid ${F.border}`, boxShadow: F.shadow }}>
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${F.border}` }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: F.blueBg }}>
            <CreditCard size={12} strokeWidth={2} style={{ color: F.blue }} />
          </div>
          <h3 className="text-[13px] font-semibold" style={{ color: F.tp }}>Cuenta</h3>
        </div>
        {[
          { label: "Correo",          value: student.email ?? "—" },
          { label: "Miembro desde",   value: student.joinedDate ?? "—" },
          { label: "Estado",          value: student.paymentStatus ?? "Activo" },
        ].map((row, i, arr) => (
          <div key={i} className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: i < arr.length-1 ? `1px solid ${F.border}` : "none" }}>
            <span className="text-[12px]" style={{ color: F.ts }}>{row.label}</span>
            <span className="text-[12px] font-medium" style={{ color: F.tp }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Plan activo */}
      <div className="rounded-2xl p-4" style={{ background: F.card, border: `1px solid ${F.border}`, boxShadow: F.shadow }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={13} style={{ color: F.blue }} />
              <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: F.tt }}>Plan activo</span>
            </div>
            <p className="text-[15px] font-semibold" style={{ color: F.tp }}>{student.stage}</p>
            <p className="text-[11px]" style={{ color: F.tt }}>Etapa {student.stageNumber}</p>
          </div>
          <div className="px-3 py-1.5 rounded-xl" style={{ background: "#D1FAE5", border: `1px solid ${F.green}30` }}>
            <span className="text-[11px] font-medium" style={{ color: F.green }}>En curso</span>
          </div>
        </div>
      </div>

      {/* Suscripción */}
      {(student.paymentStatus === "active" || student.paymentStatus === "grace_period") && (
        <div className="rounded-2xl p-4" style={{ background: F.card, border: `1px solid ${F.border}`, boxShadow: F.shadow }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: F.blueBg }}>
              <CreditCard size={12} strokeWidth={2} style={{ color: F.blue }} />
            </div>
            <h3 className="text-[13px] font-semibold" style={{ color: F.tp }}>Mi suscripción</h3>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[14px] font-semibold" style={{ color: F.tp }}>Plan mensual</p>
              <p className="text-[12px]" style={{ color: F.ts }}>$1,200 MXN / mes</p>
            </div>
            <div className="px-3 py-1.5 rounded-xl" style={{ background: "#D1FAE5", border: `1px solid ${F.green}30` }}>
              <span className="text-[11px] font-medium" style={{ color: F.green }}>Activa</span>
            </div>
          </div>
          <button onClick={onCancelRequest}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-medium cursor-pointer transition-opacity hover:opacity-80"
            style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: F.red, minHeight: 46 }}>
            <X size={13} /> Cancelar suscripción
          </button>
        </div>
      )}

      {/* Sign out */}
      <button onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-[13px] font-medium cursor-pointer transition-opacity hover:opacity-80"
        style={{ background: F.card, border: `1px solid ${F.border}`, color: F.ts, boxShadow: F.shadow }}>
        <LogOut size={14} strokeWidth={1.75} style={{ color: F.ts }} /> Cerrar sesión
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   BOTTOM NAV (Fitia light)
══════════════════════════════════════════════════════════════ */
const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "today",     label: "Dieta",     icon: Utensils },
  { id: "progress",  label: "Progreso",  icon: TrendingUp },
  { id: "comunidad", label: "Comunidad", icon: MessageCircle },
  { id: "profile",   label: "Perfil",    icon: User },
];

function BottomNav({ active, onChange, onSignOut }: {
  active: TabId; onChange: (t: TabId) => void; onSignOut: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 no-print"
      style={{
        background: F.navBg,
        borderTop: `1px solid ${F.navBor}`,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}>
      <div className="flex justify-around items-center px-2 h-[62px] max-w-xl mx-auto">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button key={id} onClick={() => onChange(id)}
              className="flex flex-col items-center gap-1 flex-1 py-2 cursor-pointer transition-all duration-200"
              style={{ minHeight: 44 }}>
              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75}
                  style={{
                    color: isActive ? F.volt : F.inactive,
                    transition: "color 0.2s ease",
                    filter: isActive ? "drop-shadow(0 0 6px rgba(212,255,0,0.55))" : undefined,
                  }} />
                {isActive && (
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ background: F.volt, animation: "dotPop 0.2s ease", boxShadow: "0 0 6px rgba(212,255,0,0.7)" }} />
                )}
              </div>
              <span className="text-[10px] font-semibold tracking-wide"
                style={{ color: isActive ? F.volt : F.inactive, transition: "color 0.2s ease" }}>
                {label}
              </span>
            </button>
          );
        })}
        {/* Logout tab */}
        <button onClick={onSignOut} aria-label="Cerrar sesión"
          className="flex flex-col items-center gap-1 flex-1 py-2 cursor-pointer transition-all duration-200 active:opacity-50"
          style={{ minHeight: 44 }}>
          <LogOut size={20} strokeWidth={1.75} style={{ color: F.inactive }} />
          <span className="text-[10px] font-semibold tracking-wide" style={{ color: F.inactive }}>Salir</span>
        </button>
      </div>
      <style>{`@keyframes dotPop { from{transform:translateX(-50%) scale(0)} to{transform:translateX(-50%) scale(1)} }`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE ROOT
══════════════════════════════════════════════════════════════ */
export default function PortalPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [detail, setDetail]   = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("today");
  const [animating, setAnimating] = useState(false);

  // Date navigation (cosmetic — backend always serves today)
  const [selectedDate, setSelectedDate] = useState(new Date());
  const shiftDate = (days: number) =>
    setSelectedDate(d => { const nd = new Date(d); nd.setDate(nd.getDate() + days); return nd; });

  // Routine day
  const todayIndex = (() => {
    const dayMap: Record<string, number> = { lunes:0, martes:1, miércoles:2, jueves:3, viernes:4, sábado:5, domingo:6 };
    return dayMap[new Date().toLocaleDateString("es-MX", { weekday: "long" }).toLowerCase()] ?? 0;
  })();
  const [activeDay] = useState(todayIndex);

  const [activeMeal, setActiveMeal]       = useState<Meal | null>(null);
  const [activeExercise, setActiveExercise] = useState<(Exercise & { muscleGroup?: string }) | null>(null);

  // Meal checks
  const [mealChecks, setMealChecks] = useState<string[]>([]);
  const [carreras, setCarreras]     = useState<any[]>([]);
  const [workoutLogs, setWorkoutLogs]       = useState<WorkoutLogEntry[]>([]);
  const [workoutSession, setWorkoutSession] = useState<WorkoutSessionEntry | null>(null);
  const [finalizingSession, setFinalizingSession]   = useState(false);
  const [celebratingSession, setCelebratingSession] = useState(false);
  const [waterTotalMl, setWaterTotalMl]             = useState(0);
  const [substitutes, setSubstitutes]           = useState<FoodSubstituteDTO[]>([]);
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetch(`/api/me/checks?date=${todayStr}`)
      .then(r => r.ok ? r.json() : { checks: [] })
      .then(d => setMealChecks((d.checks || []).filter((c: string) => c.startsWith("meal:")).map((c: string) => c.slice(5))))
      .catch(() => {});
    fetch("/api/carreras").then(r => r.ok ? r.json() : []).then(d => setCarreras(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/me/logs").then(r => r.ok ? r.json() : []).then(d => setWorkoutLogs(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(`/api/student/workout-session?date=${todayStr}`).then(r => r.ok ? r.json() : null).then(d => setWorkoutSession(d)).catch(() => {});
    fetch(`/api/student/water?date=${todayStr}`).then(r => r.ok ? r.json() : { totalMl: 0 }).then(d => setWaterTotalMl(d.totalMl ?? 0)).catch(() => {});
    fetch("/api/student/food-substitutes").then(r => r.ok ? r.json() : { substitutes: [] }).then(d => setSubstitutes(Array.isArray(d.substitutes) ? d.substitutes : [])).catch(() => {});
  }, [todayStr]);

  const finalizeSession = useCallback(async (sessionName: string) => {
    setFinalizingSession(true);
    try {
      const res = await fetch("/api/student/workout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // completed: true forces the green "Completada" pill regardless of
        // individual set completion state — the student explicitly chose to end the session.
        body: JSON.stringify({ date: todayStr, name: sessionName, completed: true }),
      });
      if (res.ok) {
        const session = await res.json();
        setWorkoutSession({ ...session, completed: true });
        // 🎉 Celebration burst
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        setCelebratingSession(true);
        setTimeout(() => setCelebratingSession(false), 3000);
      }
    } finally { setFinalizingSession(false); }
  }, [todayStr]);

  const addWater = useCallback(async (amountMl: number) => {
    setWaterTotalMl(prev => prev + amountMl); // optimistic
    try {
      const res = await fetch("/api/student/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountMl, date: todayStr }),
      });
      if (res.ok) {
        const d = await res.json();
        // Math.max prevents a stale server response from rolling back a
        // concurrent optimistic increment (rapid +250 / +500 taps).
        setWaterTotalMl(prev => Math.max(prev, d.totalMl ?? 0));
      } else {
        setWaterTotalMl(prev => prev - amountMl); // targeted rollback
      }
    } catch { setWaterTotalMl(prev => prev - amountMl); }
  }, [todayStr]);

  const toggleMeal = useCallback(async (name: string) => {
    const willBe = !mealChecks.includes(name);
    setMealChecks(prev => willBe ? [...prev, name] : prev.filter(n => n !== name));
    try {
      await fetch("/api/me/checks", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: todayStr, kind: "meal", itemKey: name, done: willBe }),
      });
    } catch {
      setMealChecks(prev => willBe ? prev.filter(n => n !== name) : [...prev, name]);
    }
  }, [mealChecks, todayStr]);

  // Cancel subscription
  const [cancelSheetOpen, setCancelSheetOpen] = useState(false);
  const [cancelReason, setCancelReason]       = useState("");
  const [cancelStatus, setCancelStatus]       = useState<"idle" | "loading" | "done" | "error">("idle");
  const openCancelSheet  = () => { setCancelSheetOpen(true);  setCancelReason(""); setCancelStatus("idle"); };
  const closeCancelSheet = () => { setCancelSheetOpen(false); setCancelReason(""); setCancelStatus("idle"); };

  const handleCancelSubscription = useCallback(async () => {
    setCancelStatus("loading");
    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" });
      if (res.ok) {
        setCancelStatus("done");
        setStudent(prev => prev ? { ...prev, paymentStatus: "inactive" as any } : prev);
        setTimeout(closeCancelSheet, 2400);
      } else { setCancelStatus("error"); }
    } catch { setCancelStatus("error"); }
  }, []);

  const fetchMe = useCallback(async () => {
    try {
      // cache: "no-store" forces the browser to skip any cached response and hit the
      // server every time — critical so a coach's isActive toggle takes effect immediately.
      const res = await fetch("/api/me", { cache: "no-store" });
      if (res.status === 403) {
        const body = await res.json().catch(() => ({}));
        if (body.error === "ACCOUNT_BLOCKED") { window.location.replace("/portal/blocked"); return; }
      }
      if (res.ok) { const d = await res.json(); setStudent(d.student); setDetail(d.detail); }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const switchTab = (t: TabId) => {
    if (t === activeTab) return;
    setAnimating(true);
    setActiveTab(t);
    setTimeout(() => setAnimating(false), 180);
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-4 space-y-4 pt-10" style={{ background: F.bg, minHeight: "100vh" }}>
        {[56, 160, 140, 120].map((h, i) => (
          <Skeleton key={i} className="rounded-2xl" style={{ height: h, background: F.border }} />
        ))}
      </div>
    );
  }

  if (!student || !detail) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center"
        style={{ background: F.bg }}>
        <p className="text-[13px]" style={{ color: F.ts }}>Tu cuenta aún no tiene una ficha de alumno asociada.</p>
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-[13px] font-medium underline" style={{ color: F.blue }}>Cerrar sesión</button>
      </div>
    );
  }

  const startWeight = detail.weightHistory[0]?.weight ?? student.currentWeight;
  const day: RoutineDay | undefined = detail.routine.days[activeDay] ?? detail.routine.days[0];

  /* Derive avatar URL: label="avatar" first, then earliest "Frente" photo, then any */
  const allPhotosDesc: any[] = (detail as any).photos ?? [];
  const avatarUrl: string | null =
    allPhotosDesc.find((p: any) => p.label === "avatar")?.url ??
    [...allPhotosDesc].reverse().find((p: any) => /frente/i.test(p.label ?? ""))?.url ??
    allPhotosDesc[allPhotosDesc.length - 1]?.url ??
    null;

  const meals: Meal[] = detail.diet.meals.map((m: any) => ({
    ...m,
    macros: m.macros ?? { protein: 32, carbs: 48, fat: 14 },
    ingredients: m.ingredients ?? m.items.map((item: string, i: number) => ({
      name: item, grams: [150, 120, 80, 200, 100][i % 5],
      calories: Math.round(m.calories / Math.max(m.items.length, 1)),
      icon: ["egg", "wheat", "beef", "salad", "chicken"][i % 5],
      macros: {
        protein: Math.round((m.macros?.protein ?? 32) / Math.max(m.items.length, 1)),
        carbs:   Math.round((m.macros?.carbs   ?? 48) / Math.max(m.items.length, 1)),
        fat:     Math.round((m.macros?.fat     ?? 14) / Math.max(m.items.length, 1)),
      },
    })),
  }));

  return (
    <div style={{ background: F.bg, minHeight: "100vh", backgroundImage: "radial-gradient(ellipse 80% 40% at 50% -20%, rgba(212,255,0,0.04) 0%, transparent 60%)" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: #fff !important; color: #111 !important; }
          .no-print { display: none !important; }
          [data-fixed], [style*="position: fixed"], [style*="position:fixed"] { display: none !important; }
          .print-header { display: flex !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .print-header { display: none; }
      `}} />

      {/* Date header — only on "today" tab */}
      {activeTab === "today" && (
        <DateHeader date={selectedDate} onPrev={() => shiftDate(-1)} onNext={() => shiftDate(1)} />
      )}

      {/* Tab content */}
      <div
        className="max-w-xl mx-auto pb-20"
        style={{
          opacity: animating ? 0 : 1,
          transform: animating ? "translateY(5px)" : "translateY(0)",
          transition: "opacity 0.16s ease, transform 0.16s ease",
        }}
      >
        {activeTab === "today" && (
          <TabHoy student={student} detail={detail} meals={meals} day={day}
            mealChecks={mealChecks} onMealToggle={toggleMeal}
            onMealOpen={setActiveMeal}
            onExerciseOpen={setActiveExercise}
            avatarUrl={avatarUrl}
            workoutLogs={workoutLogs}
            todayStr={todayStr}
            workoutSession={workoutSession}
            finalizingSession={finalizingSession}
            onFinalizeSession={finalizeSession}
            waterTotalMl={waterTotalMl}
            onAddWater={addWater}
            substitutes={substitutes} />
        )}
        {activeTab === "progress" && (
          <TabProgreso student={student} detail={detail} startWeight={startWeight} carreras={carreras}
            onBadge={() => downloadBadge({
              name: student.name, photoUrl: detail.photoName,
              currentWeight: student.currentWeight, startWeight,
              streak: student.streak, height: detail.height, bodyFat: detail.bodyFat,
              stage: `${student.stage} · E${student.stageNumber}`,
              weightHistory: detail.weightHistory,
            })} />
        )}
        {activeTab === "comunidad" && <TabComunidad student={student} />}
        {activeTab === "profile" && (
          <TabPerfil student={student} detail={detail}
            avatarUrl={avatarUrl} onAvatarUpdate={fetchMe}
            onCancelRequest={openCancelSheet} />
        )}
      </div>

      {/* Bottom nav */}
      <div className="no-print">
        <BottomNav active={activeTab} onChange={switchTab}
          onSignOut={() => signOut({ callbackUrl: "/login" })} />
      </div>

      {/* Meal detail sheet */}
      <BottomSheet open={!!activeMeal} onClose={() => setActiveMeal(null)}>
        {activeMeal && <MealSheet meal={activeMeal} substitutes={substitutes} />}
      </BottomSheet>

      {/* Exercise detail sheet */}
      <BottomSheet open={!!activeExercise} onClose={() => setActiveExercise(null)}>
        {activeExercise && <ExerciseSheet exercise={activeExercise} />}
      </BottomSheet>

      {/* Cancel subscription sheet */}
      <BottomSheet open={cancelSheetOpen} onClose={closeCancelSheet}>
        <CancelSubscriptionSheet
          reason={cancelReason} onReasonChange={setCancelReason}
          onConfirm={handleCancelSubscription} status={cancelStatus}
          onClose={closeCancelSheet} />
      </BottomSheet>

      {/* ── Session celebration overlay ── */}
      {celebratingSession && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-6 pointer-events-none">
          <style>{`
            @keyframes celebrateIn {
              from { opacity: 0; transform: scale(0.82) translateY(24px); }
              to   { opacity: 1; transform: scale(1)    translateY(0);    }
            }
            @keyframes celebrateBar {
              from { width: 100%; }
              to   { width: 0%;   }
            }
          `}</style>
          <div style={{
            width: "100%", maxWidth: 360,
            borderRadius: 28,
            padding: "36px 32px",
            textAlign: "center",
            background: "rgba(12,12,12,0.94)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)",
            animation: "celebrateIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
            <p style={{ fontSize: 52, lineHeight: 1, marginBottom: 12 }}>🔥</p>
            <p style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", color: "#f4f4f5", lineHeight: 1.25 }}>
              ¡Felicidades,<br />entrenamiento completado!
            </p>
            <p style={{ fontSize: 13, fontWeight: 500, marginTop: 10, color: "rgba(244,244,245,0.42)" }}>
              Sigue así — cada sesión cuenta
            </p>
            {/* Progress bar that drains over 3 s */}
            <div style={{ marginTop: 20, height: 3, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                borderRadius: 999,
                background: "linear-gradient(90deg, #fbbf24, #f97316, #ef4444)",
                animation: "celebrateBar 3s linear forwards",
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
