"use client";

import { useEffect, useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import {
  Flame, Ruler, Droplet, LogOut, Camera, Loader2, CheckCircle2,
  Download, TrendingDown, Dumbbell, Utensils, ChevronRight, X,
  ArrowLeftRight, Info, Weight, BarChart3, RefreshCw,
  LayoutGrid, TrendingUp, Users, User, Sparkles,
  Shield, CreditCard, Calendar, ChevronDown, ChevronUp,
  AlertTriangle,
} from "lucide-react";
import { Skeleton } from "@/components/skeleton";
import { downloadBadge } from "@/lib/badge";
import type { Student, StudentDetail, RoutineDay } from "@/lib/mock-data";

type Detail = StudentDetail & { height?: number; bodyFat?: number; photoName?: string };
type TabId = "today" | "progress" | "squads" | "profile";

/* ══════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════ */

interface Ingredient {
  name: string;
  grams: number;
  calories: number;
  unit?: string;
  unitQty?: number;
  icon?: string;
  macros?: { protein: number; carbs: number; fat: number };
}

interface Meal {
  name: string;
  time: string;
  calories: number;
  items: string[];
  macros?: { protein: number; carbs: number; fat: number };
  ingredients?: Ingredient[];
}

interface Exercise {
  name: string;
  sets: number;
  reps: string | number;
  muscleGroup?: string;
  tips?: string[];
}

/* ══════════════════════════════════════════════════════════════
   FITIA-STYLE FLAT FOOD ILLUSTRATIONS (SVG)
══════════════════════════════════════════════════════════════ */

// Each illustration is a 40×40 SVG with rich flat colors on a transparent bg.
// Used inside a styled container tile.

function IlluChicken() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width={28} height={28}>
      {/* Drumstick body */}
      <ellipse cx="20" cy="23" rx="10" ry="8" fill="#F5A623"/>
      <ellipse cx="20" cy="22" rx="9" ry="7" fill="#F7BC52"/>
      {/* Crispy top sheen */}
      <ellipse cx="17" cy="19" rx="4" ry="2.5" fill="#FBCF72" opacity="0.7"/>
      {/* Bone */}
      <rect x="18.5" y="28" width="3" height="7" rx="1.5" fill="#F0E6D3"/>
      <ellipse cx="20" cy="35.5" rx="2.5" ry="1.5" fill="#E8D5BA"/>
      {/* Shadow */}
      <ellipse cx="20" cy="31" rx="6" ry="1.5" fill="#000" opacity="0.08"/>
    </svg>
  );
}

function IlluBeef() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width={28} height={28}>
      {/* Steak base */}
      <ellipse cx="20" cy="22" rx="13" ry="9" fill="#C0392B"/>
      <ellipse cx="20" cy="21" rx="12" ry="8" fill="#E74C3C"/>
      {/* Fat marbling */}
      <ellipse cx="14" cy="20" rx="2.5" ry="1.2" fill="#F5CBA7" opacity="0.9"/>
      <ellipse cx="22" cy="18" rx="3" ry="1" fill="#F5CBA7" opacity="0.8"/>
      <ellipse cx="26" cy="23" rx="2" ry="1" fill="#F5CBA7" opacity="0.7"/>
      {/* Sear lines */}
      <path d="M12 17 Q16 15 20 17" stroke="#A93226" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M18 19 Q22 17 26 19" stroke="#A93226" strokeWidth="1.2" strokeLinecap="round"/>
      {/* Sheen */}
      <ellipse cx="15" cy="17" rx="3" ry="1.5" fill="#fff" opacity="0.1"/>
    </svg>
  );
}

function IlluEgg() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width={28} height={28}>
      {/* White */}
      <ellipse cx="20" cy="23" rx="13" ry="9" fill="#F5F0E8"/>
      {/* White sheen */}
      <ellipse cx="15" cy="19" rx="5" ry="3" fill="#fff" opacity="0.55"/>
      {/* Yolk */}
      <circle cx="20" cy="22" r="6" fill="#F39C12"/>
      <circle cx="20" cy="21.5" r="5.5" fill="#F5B041"/>
      {/* Yolk sheen */}
      <ellipse cx="18" cy="19.5" rx="2" ry="1.3" fill="#FDEBD0" opacity="0.7"/>
    </svg>
  );
}

function IlluBread() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width={28} height={28}>
      {/* Loaf base */}
      <rect x="8" y="22" width="24" height="10" rx="3" fill="#C8832A"/>
      {/* Dome */}
      <ellipse cx="20" cy="22" rx="12" ry="7" fill="#D4934A"/>
      <ellipse cx="20" cy="21" rx="11" ry="6" fill="#E8A857"/>
      {/* Score cuts */}
      <path d="M14 17 L14 24" stroke="#B8712A" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M20 15 L20 24" stroke="#B8712A" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M26 17 L26 24" stroke="#B8712A" strokeWidth="1.2" strokeLinecap="round"/>
      {/* Crust sheen */}
      <ellipse cx="17" cy="18" rx="4" ry="2" fill="#F4C878" opacity="0.5"/>
    </svg>
  );
}

function IlluMilk() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width={28} height={28}>
      {/* Glass body */}
      <path d="M13 14 L15 34 H25 L27 14 Z" fill="#E8F4FD"/>
      <path d="M13 14 L15 34 H25 L27 14 Z" fill="#BFD9F0" opacity="0.4"/>
      {/* Milk fill */}
      <path d="M14.5 20 L16 34 H24 L25.5 20 Z" fill="#fff"/>
      {/* Rim */}
      <rect x="11" y="12" width="18" height="4" rx="2" fill="#A8C8E8"/>
      <rect x="11" y="12" width="18" height="2" rx="1" fill="#C8DFF0"/>
      {/* Sheen */}
      <rect x="15" y="22" width="2.5" height="8" rx="1.2" fill="#fff" opacity="0.7"/>
    </svg>
  );
}

function IlluPotato() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width={28} height={28}>
      {/* Potato body */}
      <ellipse cx="20" cy="22" rx="13" ry="9" fill="#C9A96E"/>
      <ellipse cx="20" cy="21" rx="12" ry="8" fill="#D4B97E"/>
      {/* Eyes/spots */}
      <circle cx="14" cy="20" r="1.2" fill="#A8823E"/>
      <circle cx="25" cy="19" r="0.9" fill="#A8823E"/>
      <circle cx="21" cy="25" r="1" fill="#A8823E"/>
      {/* Sheen */}
      <ellipse cx="16" cy="17" rx="4" ry="2.5" fill="#F0D9A8" opacity="0.5"/>
    </svg>
  );
}

function IlluRice() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width={28} height={28}>
      {/* Bowl */}
      <path d="M8 24 Q8 34 20 34 Q32 34 32 24 Z" fill="#D4A853"/>
      <ellipse cx="20" cy="24" rx="12" ry="4" fill="#E8B96A"/>
      {/* Rice mound */}
      <ellipse cx="20" cy="21" rx="11" ry="7" fill="#F8F4EC"/>
      {/* Rice grains */}
      {[14,17,20,23,26,15,19,23,17,21].map((x,i)=>(
        <ellipse key={i} cx={x} cy={18 + (i%3)*2} rx="1.5" ry="0.7" fill="#EDE8DC" transform={`rotate(${i*18} ${x} ${18+(i%3)*2})`}/>
      ))}
      {/* Steam */}
      <path d="M16 13 Q17 10 16 8" stroke="#ddd" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
      <path d="M20 12 Q21 9 20 7" stroke="#ddd" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
      <path d="M24 13 Q25 10 24 8" stroke="#ddd" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
    </svg>
  );
}

function IlluFish() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width={28} height={28}>
      {/* Body */}
      <ellipse cx="19" cy="22" rx="12" ry="7" fill="#5BA4CF"/>
      <ellipse cx="19" cy="21.5" rx="11" ry="6" fill="#74B9E3"/>
      {/* Tail */}
      <path d="M30 22 L37 17 L37 27 Z" fill="#4A90C4"/>
      {/* Eye */}
      <circle cx="11" cy="20" r="2" fill="#fff"/>
      <circle cx="11" cy="20" r="1" fill="#1a1a2e"/>
      {/* Scales */}
      <path d="M16 18 Q18 16 20 18" stroke="#4A90C4" strokeWidth="0.8" fill="none"/>
      <path d="M20 18 Q22 16 24 18" stroke="#4A90C4" strokeWidth="0.8" fill="none"/>
      <path d="M18 22 Q20 20 22 22" stroke="#4A90C4" strokeWidth="0.8" fill="none"/>
      {/* Fin */}
      <path d="M16 17 Q20 12 24 17" fill="#5BA4CF" stroke="#4A90C4" strokeWidth="0.5"/>
    </svg>
  );
}

function IlluOats() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width={28} height={28}>
      {/* Bowl */}
      <path d="M9 25 Q9 35 20 35 Q31 35 31 25 Z" fill="#C8934A"/>
      <ellipse cx="20" cy="25" rx="11" ry="3.5" fill="#D4A45C"/>
      {/* Oat mound */}
      <ellipse cx="20" cy="22" rx="10" ry="6.5" fill="#E8C98A"/>
      {/* Oat texture */}
      <ellipse cx="15" cy="20" rx="2" ry="1" fill="#D4B06A" transform="rotate(-20 15 20)"/>
      <ellipse cx="20" cy="19" rx="2" ry="1" fill="#D4B06A" transform="rotate(10 20 19)"/>
      <ellipse cx="25" cy="21" rx="2" ry="1" fill="#D4B06A" transform="rotate(-15 25 21)"/>
      <ellipse cx="17" cy="23" rx="2" ry="1" fill="#D4B06A" transform="rotate(25 17 23)"/>
      <ellipse cx="23" cy="24" rx="2" ry="1" fill="#D4B06A" transform="rotate(-5 23 24)"/>
    </svg>
  );
}

function IlluSweetPotato() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width={28} height={28}>
      {/* Body */}
      <ellipse cx="20" cy="23" rx="14" ry="9" fill="#E07B39"/>
      <ellipse cx="20" cy="22" rx="13" ry="8" fill="#F0904A"/>
      {/* Skin texture lines */}
      <path d="M10 22 Q15 19 20 22 Q25 25 30 22" stroke="#D06830" strokeWidth="1" fill="none" opacity="0.6"/>
      <path d="M11 26 Q16 23 21 26 Q26 29 31 26" stroke="#D06830" strokeWidth="0.8" fill="none" opacity="0.4"/>
      {/* Leaf nub */}
      <ellipse cx="20" cy="15" rx="2" ry="3" fill="#5D8A3C" transform="rotate(10 20 15)"/>
      <ellipse cx="23" cy="14" rx="1.5" ry="2.5" fill="#6DA048" transform="rotate(-10 23 14)"/>
      {/* Sheen */}
      <ellipse cx="15" cy="19" rx="4" ry="2.5" fill="#FBB06A" opacity="0.4"/>
    </svg>
  );
}

function IlluSalad() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width={28} height={28}>
      {/* Bowl */}
      <path d="M8 26 Q8 36 20 36 Q32 36 32 26 Z" fill="#C8834A"/>
      <ellipse cx="20" cy="26" rx="12" ry="3.5" fill="#D49060"/>
      {/* Greens */}
      <ellipse cx="14" cy="22" rx="5" ry="4" fill="#4CAF50" transform="rotate(-15 14 22)"/>
      <ellipse cx="22" cy="20" rx="6" ry="4" fill="#66BB6A" transform="rotate(10 22 20)"/>
      <ellipse cx="18" cy="23" rx="5" ry="3.5" fill="#388E3C" transform="rotate(-5 18 23)"/>
      {/* Tomato */}
      <circle cx="26" cy="23" r="3.5" fill="#E53935"/>
      <ellipse cx="26" cy="21" rx="1.5" ry="0.8" fill="#EF5350" opacity="0.7"/>
      {/* Cheese cube */}
      <rect x="13" y="20" width="4" height="3" rx="0.5" fill="#FDD835" transform="rotate(-10 13 20)"/>
    </svg>
  );
}

function IlluTuna() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width={28} height={28}>
      {/* Can body */}
      <ellipse cx="20" cy="27" rx="13" ry="5" fill="#A8B8C8"/>
      <rect x="7" y="18" width="26" height="9" fill="#B8C8D8"/>
      <ellipse cx="20" cy="18" rx="13" ry="5" fill="#C8D8E8"/>
      {/* Lid rim */}
      <ellipse cx="20" cy="18" rx="12" ry="4" fill="#D4DFE8"/>
      <ellipse cx="20" cy="18" rx="10" ry="3" fill="#E2EBF0"/>
      {/* Tuna inside */}
      <ellipse cx="20" cy="18" rx="8" ry="2.5" fill="#F4A261"/>
      <path d="M13 17 Q16 15 20 17 Q24 15 27 17" stroke="#E08042" strokeWidth="0.8" fill="none"/>
      {/* Pull tab */}
      <path d="M20 14 L24 11 L26 13 L22 16" fill="#9AAFC0" stroke="#888" strokeWidth="0.5"/>
    </svg>
  );
}

function IlluBanana() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width={28} height={28}>
      {/* Main curve */}
      <path d="M10 28 Q10 12 22 10 Q30 9 32 14 Q34 19 28 24 Q22 29 10 28 Z" fill="#FBBF24"/>
      <path d="M11 27 Q11 14 22 12 Q29 11 31 15 Q33 20 27 24 Q22 28 11 27 Z" fill="#FCD34D"/>
      {/* Tip */}
      <path d="M10 28 Q8 30 9 32 Q10 33 12 31 Q11 29 10 28 Z" fill="#D97706"/>
      <path d="M32 14 Q35 12 36 13 Q37 15 34 16 Q33 15 32 14 Z" fill="#D97706"/>
      {/* Sheen */}
      <path d="M14 14 Q18 12 22 13" stroke="#FEF3C7" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
    </svg>
  );
}

function IlluTortilla() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width={28} height={28}>
      {/* Stack of tortillas */}
      <ellipse cx="20" cy="28" rx="13" ry="4" fill="#C8934A"/>
      <ellipse cx="20" cy="25" rx="13" ry="4" fill="#D4A45C"/>
      <ellipse cx="20" cy="22" rx="13" ry="4" fill="#E8B96A"/>
      {/* Top tortilla detail */}
      <ellipse cx="20" cy="22" rx="12" ry="3.5" fill="#F0C878"/>
      <ellipse cx="20" cy="22" rx="10" ry="2.5" fill="#F4D28A" opacity="0.7"/>
      {/* Char spots */}
      <circle cx="15" cy="21" r="1" fill="#C8834A" opacity="0.5"/>
      <circle cx="24" cy="22" r="0.8" fill="#C8834A" opacity="0.5"/>
      <circle cx="20" cy="20" r="1.2" fill="#C8834A" opacity="0.4"/>
    </svg>
  );
}

// Map icon key → illustration component
type IlluKey = "chicken"|"beef"|"egg"|"bread"|"milk"|"potato"|"rice"|"fish"|"oats"|"sweet-potato"|"salad"|"tuna"|"banana"|"tortilla";

const ILLU_MAP: Record<string, React.FC> = {
  chicken: IlluChicken,
  beef:    IlluBeef,
  egg:     IlluEgg,
  bread:   IlluBread,
  wheat:   IlluBread,
  milk:    IlluMilk,
  potato:  IlluPotato,
  apple:   IlluSweetPotato,
  rice:    IlluRice,
  fish:    IlluFish,
  oats:    IlluOats,
  "sweet-potato": IlluSweetPotato,
  salad:   IlluSalad,
  tuna:    IlluTuna,
  banana:  IlluBanana,
  tortilla: IlluTortilla,
  default: IlluEgg,
};

// Bg tints per food type for the tile
const ILLU_BG: Record<string, string> = {
  chicken: "rgba(245,166,35,0.1)",
  beef:    "rgba(192,57,43,0.1)",
  egg:     "rgba(243,156,18,0.1)",
  bread:   "rgba(212,147,90,0.1)",
  wheat:   "rgba(212,147,90,0.1)",
  milk:    "rgba(100,180,230,0.1)",
  potato:  "rgba(201,169,110,0.1)",
  apple:   "rgba(224,123,57,0.1)",
  rice:    "rgba(248,244,236,0.07)",
  fish:    "rgba(91,164,207,0.1)",
  oats:    "rgba(232,201,138,0.1)",
  "sweet-potato": "rgba(224,123,57,0.12)",
  salad:   "rgba(76,175,80,0.1)",
  tuna:    "rgba(244,162,97,0.1)",
  banana:  "rgba(251,191,36,0.1)",
  tortilla:"rgba(240,200,120,0.1)",
  default: "rgba(255,255,255,0.05)",
};

function FoodIllu({ iconKey, size = 48 }: { iconKey?: string; size?: number }) {
  const key = iconKey ?? "default";
  const Comp = ILLU_MAP[key] ?? ILLU_MAP.default;
  const bg = ILLU_BG[key] ?? ILLU_BG.default;
  return (
    <div
      style={{
        width: size, height: size, borderRadius: 14,
        background: bg,
        border: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Comp />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   EQUIVALENTS CATALOG
══════════════════════════════════════════════════════════════ */

interface Equivalent {
  name: string;
  gramsPerCarb?: number;
  gramsPerProtein?: number;
  icon?: string;
  note?: string;
  macroType?: "carb" | "protein";
}

const EQUIV_CARBS: Equivalent[] = [
  { name: "Arroz blanco",    gramsPerCarb: 3.3,  icon: "rice",         note: "Digestión rápida, post-entreno",  macroType:"carb" },
  { name: "Avena",           gramsPerCarb: 5.3,  icon: "oats",         note: "Alta en beta-glucanos",           macroType:"carb" },
  { name: "Camote",          gramsPerCarb: 5.8,  icon: "sweet-potato", note: "Alto en potasio y vitamina A",    macroType:"carb" },
  { name: "Papa cocida",     gramsPerCarb: 6.25, icon: "potato",       note: "Versátil y saciante",             macroType:"carb" },
  { name: "Tortilla de maíz",gramsPerCarb: 4.0,  icon: "tortilla",     note: "2 tortillas pequeñas por porción",macroType:"carb" },
  { name: "Pan integral",    gramsPerCarb: 4.35, icon: "bread",        note: "100% integral preferible",        macroType:"carb" },
  { name: "Plátano",         gramsPerCarb: 4.35, icon: "banana",       note: "Ideal pre-entreno",               macroType:"carb" },
];

const EQUIV_PROTEIN: Equivalent[] = [
  { name: "Pechuga de Pollo", gramsPerProtein: 4.5, icon: "chicken", note: "Proteína magra #1",           macroType:"protein" },
  { name: "Carne magra",      gramsPerProtein: 5.0, icon: "beef",    note: "Rica en zinc y B12",          macroType:"protein" },
  { name: "Atún en agua",     gramsPerProtein: 4.0, icon: "tuna",    note: "Omega-3 y bajo en grasa",     macroType:"protein" },
  { name: "Salmón",           gramsPerProtein: 5.3, icon: "fish",    note: "Grasa saludable omega-3",     macroType:"protein" },
  { name: "Huevo entero",     gramsPerProtein: 8.0, icon: "egg",     note: "Proteína completa",           macroType:"protein" },
  { name: "Leche descremada", gramsPerProtein:10.0, icon: "milk",    note: "Calcio + proteína",           macroType:"protein" },
];

// Combined catalog — used for display
const EQUIV_CATALOG: Equivalent[] = [...EQUIV_PROTEIN, ...EQUIV_CARBS];

/* ══════════════════════════════════════════════════════════════
   BOTTOM SHEET
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
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose} style={{ animation: "bsFadeIn 0.2s ease" }} />
      <div className="relative rounded-t-3xl overflow-y-auto"
        style={{
          background: "#0d0d0d",
          border: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "none",
          maxHeight: "90vh",
          animation: "bsSlideUp 0.3s cubic-bezier(0.32,0.72,0,1)",
          paddingBottom: "env(safe-area-inset-bottom,0px)",
        }}>
        <div className="sticky top-0 flex justify-center pt-3 pb-2 z-10"
          style={{ background: "#0d0d0d" }}>
          <div className="w-9 h-[3px] rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
        </div>
        <button onClick={onClose}
          className="absolute top-3.5 right-4 w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.07)" }}>
          <X size={13} style={{ color: "rgba(255,255,255,0.45)" }} />
        </button>
        <div className="px-5 pb-10">{children}</div>
      </div>
      <style>{`
        @keyframes bsFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes bsSlideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CALORIE RING + MACRO BARS
══════════════════════════════════════════════════════════════ */

function CalorieRing({ consumed, protein, carbs, fat, maxP = 60, maxC = 100, maxF = 40 }: {
  consumed: number; protein: number; carbs: number; fat: number;
  maxP?: number; maxC?: number; maxF?: number;
}) {
  const R = 44, circ = 2 * Math.PI * R;
  const dash = Math.min(consumed / (consumed || 1), 1) * circ;
  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: 108, height: 108 }}>
        <svg viewBox="0 0 100 100" width={108} height={108} style={{ transform: "rotate(-90deg)" }}>
          <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5.5" />
          <circle cx="50" cy="50" r={R} fill="none" stroke="#34d399" strokeWidth="5.5"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ - dash}`}
            style={{ transition: "stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[19px] font-light tabular-nums" style={{ color: "#fff" }}>{consumed}</span>
          <span className="text-[8px] uppercase tracking-wider mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>kcal</span>
        </div>
      </div>
      <div className="flex-1 space-y-3">
        <MacroBar label="Proteína" value={protein} max={maxP} color="#34d399" />
        <MacroBar label="Carbos"   value={carbs}   max={maxC} color="#60a5fa" />
        <MacroBar label="Grasa"    value={fat}      max={maxF} color="#fb923c" />
      </div>
    </div>
  );
}

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(value / max, 1) * 100;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-[9px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.28)" }}>{label}</span>
        <span className="text-[12px] tabular-nums font-medium" style={{ color }}>
          {value}<span className="text-[8px] ml-0.5" style={{ color: "rgba(255,255,255,0.22)" }}>g</span>
        </span>
      </div>
      <div className="h-[3px] rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   INGREDIENT ROW — Fitia layout
══════════════════════════════════════════════════════════════ */

function IngredientRow({
  ingredient, isSwapped, swappedTo, onSwapTap, showSwapBtn, swapActive,
}: {
  ingredient: Ingredient;
  isSwapped?: boolean;
  swappedTo?: Equivalent | null;
  onSwapTap?: () => void;
  showSwapBtn?: boolean;
  swapActive?: boolean;
}) {
  const [done, setDone] = useState(false);
  const displayName  = isSwapped && swappedTo ? swappedTo.name : ingredient.name;
  const displayGrams = isSwapped && swappedTo
    ? (swappedTo.macroType === "protein"
        ? Math.round((ingredient.macros?.protein ?? Math.round(ingredient.calories * 0.25 / 4)) * (swappedTo.gramsPerProtein ?? 5))
        : Math.round((ingredient.macros?.carbs ?? Math.round(ingredient.calories * 0.5 / 4)) * (swappedTo.gramsPerCarb ?? 0)))
    : ingredient.grams;
  const iconKey = isSwapped && swappedTo ? swappedTo.icon : ingredient.icon;

  return (
    <div
      className="flex items-center gap-3.5 px-4 py-3.5 transition-all duration-300"
      style={{
        background: isSwapped ? "rgba(96,165,250,0.04)" : "transparent",
        borderLeft: isSwapped ? "2px solid rgba(96,165,250,0.3)" : "2px solid transparent",
      }}
    >
      {/* Illustration tile */}
      <FoodIllu iconKey={iconKey} size={48} />

      {/* Name (left-aligned, grows) */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[15px] font-medium leading-tight"
          style={{
            color: done ? "rgba(255,255,255,0.28)" : "#fff",
            textDecoration: done ? "line-through" : "none",
          }}
        >
          {displayName}
        </p>
        {isSwapped && (
          <span className="text-[10px]" style={{ color: "#60a5fa" }}>↔ sustituido</span>
        )}
      </div>

      {/* Qty + kcal (right, stacked vertically) */}
      <div className="text-right shrink-0 mr-1">
        <p className="text-[15px] font-medium tabular-nums leading-tight"
          style={{ color: isSwapped ? "#60a5fa" : "rgba(255,255,255,0.75)" }}>
          {displayGrams} g
        </p>
        <p className="text-[11px] tabular-nums mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
          {ingredient.calories} kcal
        </p>
      </div>

      {/* Swap mini-button (visible when equiv mode on) */}
      {showSwapBtn && (
        <button
          onClick={onSwapTap}
          className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150"
          style={{
            background: swapActive ? "rgba(96,165,250,0.15)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${swapActive ? "rgba(96,165,250,0.3)" : "rgba(255,255,255,0.08)"}`,
          }}
        >
          <ArrowLeftRight size={11} style={{ color: swapActive ? "#60a5fa" : "rgba(255,255,255,0.3)" }} />
        </button>
      )}

      {/* Check circle */}
      <button
        onClick={() => setDone(d => !d)}
        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
        style={{
          background: done ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.05)",
          border: `1.5px solid ${done ? "rgba(52,211,153,0.5)" : "rgba(255,255,255,0.1)"}`,
        }}
      >
        {done && <CheckCircle2 size={12} strokeWidth={2.5} style={{ color: "#34d399" }} />}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   EQUIVALENTS CATALOG — Fitia card grid style
══════════════════════════════════════════════════════════════ */

function EquivCatalog({ ingredient, selected, onSelect }: {
  ingredient: Ingredient;
  selected: Equivalent | null;
  onSelect: (eq: Equivalent | null) => void;
}) {
  const baseCarbs   = ingredient.macros?.carbs    ?? Math.round(ingredient.calories * 0.45 / 4);
  const baseProtein = ingredient.macros?.protein  ?? Math.round(ingredient.calories * 0.25 / 4);
  const [activeTab, setActiveTabLocal] = useState<"protein"|"carb">("protein");

  const list = EQUIV_CATALOG.filter(e => e.macroType === activeTab);

  const calcGrams = (eq: Equivalent) => {
    if (eq.macroType === "protein") return Math.round(baseProtein * (eq.gramsPerProtein ?? 5));
    return Math.round(baseCarbs * (eq.gramsPerCarb ?? 0));
  };

  return (
    <div style={{ animation: "fadeSlideIn 0.22s ease" }}>
      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
          Cambios inteligentes para <span style={{ color: "#fff" }}>{ingredient.name}</span>
        </p>
        {selected && (
          <button onClick={() => onSelect(null)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px]"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.38)" }}>
            <RefreshCw size={9} /> Reset
          </button>
        )}
      </div>

      {/* Tab toggle: Proteína / Carbos */}
      <div className="flex gap-1.5 mb-4 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {(["protein","carb"] as const).map(t => (
          <button key={t} onClick={() => setActiveTabLocal(t)}
            className="flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200"
            style={{
              background: activeTab === t ? "rgba(255,255,255,0.1)" : "transparent",
              color: activeTab === t ? "#fff" : "rgba(255,255,255,0.32)",
              border: activeTab === t ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
            }}>
            {t === "protein" ? "🥩 Proteína" : "🌾 Carbohidratos"}
          </button>
        ))}
      </div>

      {/* Card grid — 3 cols */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {list.map((eq) => {
          const grams = calcGrams(eq);
          const active = selected?.name === eq.name;
          return (
            <button
              key={eq.name}
              onClick={() => onSelect(active ? null : eq)}
              className="relative flex flex-col items-center text-center rounded-2xl p-3 transition-all duration-200 active:scale-95"
              style={{
                background: active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                border: `1.5px solid ${active ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)"}`,
                boxShadow: active ? "0 0 0 2px rgba(96,165,250,0.2)" : "none",
              }}
            >
              {/* Illustration */}
              <div className="mb-2">
                <FoodIllu iconKey={eq.icon} size={52} />
              </div>
              {/* Name */}
              <p className="text-[11px] font-medium leading-tight mb-1.5"
                style={{ color: active ? "#fff" : "rgba(255,255,255,0.65)" }}>
                {eq.name}
              </p>
              {/* Grams pill */}
              <div className="px-2 py-0.5 rounded-full"
                style={{ background: active ? "rgba(96,165,250,0.15)" : "rgba(255,255,255,0.05)" }}>
                <span className="text-[11px] font-semibold tabular-nums"
                  style={{ color: active ? "#60a5fa" : "rgba(255,255,255,0.45)" }}>
                  {grams}g
                </span>
              </div>
              {/* Active check */}
              {active && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: "#60a5fa" }}>
                  <CheckCircle2 size={10} strokeWidth={3} style={{ color: "#fff" }} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Conversion breakdown */}
      {selected && (
        <div className="rounded-2xl px-4 py-3.5 mt-1"
          style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.15)", animation: "fadeSlideIn 0.2s ease" }}>
          <p className="text-[9px] uppercase tracking-widest mb-1.5" style={{ color: "rgba(96,165,250,0.5)" }}>Conversión automática</p>
          <p className="text-[13px] leading-relaxed font-medium" style={{ color: "rgba(255,255,255,0.78)" }}>
            <span style={{ color: "#fff" }}>{ingredient.grams}g</span>{" de "}{ingredient.name}
            {" = "}
            <span style={{ color: "#60a5fa" }}>{calcGrams(selected)}g</span>{" de "}{selected.name}
          </p>
          <p className="text-[10px] mt-1.5" style={{ color: "rgba(255,255,255,0.25)" }}>
            {selected.macroType === "protein"
              ? `Base: ${baseProtein}g proteína · ${selected.gramsPerProtein ?? 5}g alimento / 1g proteína`
              : `Base: ${baseCarbs}g carbos · ${selected.gramsPerCarb}g alimento / 1g carbo`}
          </p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MEAL SHEET
══════════════════════════════════════════════════════════════ */

function MealSheet({ meal }: { meal: Meal }) {
  const macros = meal.macros ?? { protein: 32, carbs: 48, fat: 14 };
  const ingredients: Ingredient[] = meal.ingredients?.length ? meal.ingredients
    : meal.items.map((name, i) => ({
        name,
        grams: [150, 120, 80, 200, 100][i % 5],
        calories: Math.round(meal.calories / meal.items.length),
        icon: ["egg", "wheat", "beef", "salad", "chicken"][i % 5],
        unitQty: [1, 0.5, 1.5, 2, 1][i % 5],
        unit: ["pieza", "taza", "tazas", "piezas", "porción"][i % 5],
        macros: {
          protein: Math.round(macros.protein / meal.items.length),
          carbs:   Math.round(macros.carbs   / meal.items.length),
          fat:     Math.round(macros.fat     / meal.items.length),
        },
      }));

  const [showEquiv, setShowEquiv] = useState(false);
  const [swapOpen, setSwapOpen]   = useState<number | null>(null);
  const [swaps, setSwaps]         = useState<Record<number, Equivalent | null>>({});

  const swapCount = Object.values(swaps).filter(Boolean).length;

  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-5 mt-1">
        <div className="flex-1 min-w-0 pr-3">
          <h2 className="text-[22px] font-semibold tracking-tight leading-tight" style={{ color: "#fff" }}>{meal.name}</h2>
          <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.32)" }}>{meal.time}</p>
        </div>
        {/* Equiv toggle */}
        <button
          onClick={() => { setShowEquiv(p => !p); setSwapOpen(null); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl shrink-0 transition-all duration-200"
          style={{
            background: showEquiv ? "rgba(96,165,250,0.1)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${showEquiv ? "rgba(96,165,250,0.25)" : "rgba(255,255,255,0.08)"}`,
          }}
        >
          <ArrowLeftRight size={12} style={{ color: showEquiv ? "#60a5fa" : "rgba(255,255,255,0.4)" }} />
          <span className="text-[11px]" style={{ color: showEquiv ? "#60a5fa" : "rgba(255,255,255,0.4)" }}>
            Cambios{swapCount > 0 ? ` (${swapCount})` : ""}
          </span>
        </button>
      </div>

      {/* ── Calorie ring + macro bars ── */}
      <div className="rounded-2xl p-4 mb-5"
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.055)" }}>
        <CalorieRing consumed={meal.calories} protein={macros.protein} carbs={macros.carbs} fat={macros.fat} />
      </div>

      {/* ── Ingredients list ── */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-3 px-0.5">
          <p className="text-[10px] uppercase tracking-widest font-medium"
            style={{ color: "rgba(255,255,255,0.25)" }}>Alimentos</p>
          {swapCount > 0 && (
            <p className="text-[10px]" style={{ color: "#60a5fa" }}>{swapCount} sustituido(s)</p>
          )}
        </div>

        <div className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          {ingredients.map((ing, i) => (
            <div key={i}
              style={{ borderBottom: i < ingredients.length - 1 ? "1px solid rgba(255,255,255,0.055)" : "none" }}>
              {/* Ingredient row */}
              <IngredientRow
                ingredient={ing}
                isSwapped={!!swaps[i]}
                swappedTo={swaps[i]}
                showSwapBtn={showEquiv}
                swapActive={swapOpen === i}
                onSwapTap={() => setSwapOpen(p => p === i ? null : i)}
              />

              {/* Inline equiv panel for this ingredient */}
              {swapOpen === i && showEquiv && (
                <div className="px-4 pb-5 pt-3 relative"
                  style={{
                    background: "rgba(255,255,255,0.015)",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                  }}>
                  <EquivCatalog
                    ingredient={ing}
                    selected={swaps[i] ?? null}
                    onSelect={eq => {
                      setSwaps(p => ({ ...p, [i]: eq }));
                      if (!eq) setSwapOpen(null);
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   EXERCISE SHEET
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
        <h2 className="text-[21px] font-semibold tracking-tight" style={{ color: "#fff" }}>{exercise.name}</h2>
        <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.32)" }}>
          {exercise.sets} series · {exercise.reps} reps{exercise.muscleGroup ? ` · ${exercise.muscleGroup}` : ""}
        </p>
      </div>
      <div className="w-full rounded-2xl mb-5 flex items-center justify-center"
        style={{ height: 140, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.055)" }}>
        <div className="flex flex-col items-center gap-2">
          <Dumbbell size={24} style={{ color: "rgba(255,255,255,0.1)" }} strokeWidth={1.25} />
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.15)" }}>Guía visual próximamente</span>
        </div>
      </div>
      <div className="mb-5">
        <SectionLabel icon={Info} text="Instrucciones del Coach" />
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          {tips.map((tip, i) => (
            <div key={i} className="flex gap-3 px-4 py-3"
              style={{ borderBottom: i < tips.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <span className="text-[9px] font-medium mt-0.5 shrink-0 tabular-nums" style={{ color: "rgba(255,255,255,0.18)" }}>{String(i+1).padStart(2,"0")}</span>
              <span className="text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.62)" }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SectionLabel icon={BarChart3} text="Registro de Carga" />
        <div className="grid grid-cols-3 px-4 mb-1.5">
          {["Serie","Peso (kg)","Reps"].map((h,i) => (
            <span key={h} className={`text-[9px] uppercase tracking-wide ${i > 0 ? "text-center" : ""}`}
              style={{ color: "rgba(255,255,255,0.16)" }}>{h}</span>
          ))}
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          {sets.map((s, i) => (
            <div key={i} className="grid grid-cols-3 items-center px-4 py-3"
              style={{ borderBottom: i < sets.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>S{i+1}</span>
              {(["kg","reps"] as const).map((f, fi) => (
                <input key={f} type="number" inputMode={f === "kg" ? "decimal" : "numeric"}
                  placeholder="—" value={s[f]}
                  onChange={e => upd(i, f, e.target.value)}
                  className={`w-14 ${fi === 0 ? "mx-auto" : "ml-auto"} text-center text-[13px] font-medium rounded-xl py-1.5 outline-none`}
                  style={{ background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.08)", color: s[f] ? "#fff" : "rgba(255,255,255,0.16)" }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   SHARED SMALL COMPONENTS
══════════════════════════════════════════════════════════════ */

function SectionLabel({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2.5">
      <Icon size={11} style={{ color: "rgba(255,255,255,0.22)" }} />
      <p className="text-[9px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.22)" }}>{text}</p>
    </div>
  );
}

function CardWrap({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl p-5 ${className}`}
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.065)" }}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}>
        <Icon size={12} strokeWidth={1.75} style={{ color: "rgba(255,255,255,0.42)" }} />
      </div>
      <h3 className="text-[13px] font-medium tracking-tight" style={{ color: "rgba(255,255,255,0.62)" }}>{title}</h3>
    </div>
  );
}

function StatCard({ label, value, unit, sub, subColor, icon: Icon, accent }: any) {
  return (
    <div className="rounded-3xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.065)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.22)" }}>{label}</span>
        <div className="w-7 h-7 rounded-xl flex items-center justify-center"
          style={{ background: accent ? `${accent}15` : "rgba(255,255,255,0.05)" }}>
          <Icon size={13} strokeWidth={1.75} style={{ color: accent ?? "rgba(255,255,255,0.28)" }} />
        </div>
      </div>
      <p className="text-[26px] font-thin tabular-nums leading-none" style={{ color: "#fff" }}>
        {value}<span className="text-[11px] font-normal ml-1" style={{ color: "rgba(255,255,255,0.26)" }}>{unit}</span>
      </p>
      {sub && <p className="text-[11px] mt-1.5 tabular-nums" style={{ color: subColor ?? "rgba(255,255,255,0.32)" }}>{sub}</p>}
    </div>
  );
}

function MealCard({ meal, onClick }: { meal: Meal; onClick: () => void }) {
  const [done, setDone] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{ background: done ? "rgba(52,211,153,0.04)" : "rgba(255,255,255,0.025)", border: `1px solid ${done ? "rgba(52,211,153,0.13)" : "rgba(255,255,255,0.065)"}` }}>
      <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-3">
        <button onClick={() => setDone(d => !d)}
          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
          style={{ background: done ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)", border: `1.5px solid ${done ? "rgba(52,211,153,0.42)" : "rgba(255,255,255,0.09)"}` }}>
          {done && <CheckCircle2 size={11} strokeWidth={2.5} style={{ color: "#34d399" }} />}
        </button>
        <span className="text-[13px] font-medium flex-1 truncate"
          style={{ color: done ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.88)", textDecoration: done ? "line-through" : "none" }}>
          {meal.name}
        </span>
        <span className="text-[10px] tabular-nums shrink-0" style={{ color: "rgba(255,255,255,0.22)" }}>
          {meal.time} · {meal.calories} kcal
        </span>
        <button onClick={onClick} className="p-1 rounded-lg shrink-0" style={{ background: "rgba(255,255,255,0.05)" }}>
          <ChevronRight size={12} style={{ color: "rgba(255,255,255,0.28)" }} />
        </button>
      </div>
      <p className="text-[10px] pb-3 px-4 pl-11 truncate" style={{ color: "rgba(255,255,255,0.22)" }}>
        {meal.items.join(" · ")}
      </p>
    </div>
  );
}

function ExerciseRow({ exercise, onClick }: { exercise: Exercise; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left cursor-pointer active:scale-[0.98] transition-transform"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.065)" }}>
      <span className="text-[13px] font-medium truncate" style={{ color: "rgba(255,255,255,0.82)" }}>{exercise.name}</span>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        <span className="text-[11px] tabular-nums" style={{ color: "rgba(255,255,255,0.26)" }}>{exercise.sets}×{exercise.reps}</span>
        <ChevronRight size={12} style={{ color: "rgba(255,255,255,0.18)" }} />
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
   WEIGHT CHART (mini sparkline)
══════════════════════════════════════════════════════════════ */

function WeightChart({ history }: { history: { date: string; weight: number }[] }) {
  if (!history || history.length < 2) return (
    <div className="flex items-center justify-center py-8">
      <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>Registra al menos 2 pesajes para ver la gráfica.</p>
    </div>
  );

  const W = 320, H = 100, pad = 12;
  const weights = history.map(h => h.weight);
  const minW = Math.min(...weights), maxW = Math.max(...weights);
  const range = maxW - minW || 1;
  const pts = history.map((h, i) => {
    const x = pad + (i / (history.length - 1)) * (W - pad * 2);
    const y = H - pad - ((h.weight - minW) / range) * (H - pad * 2);
    return { x, y, ...h };
  });

  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${pts[pts.length-1].x} ${H} L ${pts[0].x} ${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H, overflow: "visible" }}>
      <defs>
        <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#wGrad)" />
      <path d={pathD} fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#34d399" stroke="#000" strokeWidth="1.5" />
      ))}
      {/* Labels: first and last */}
      {[pts[0], pts[pts.length - 1]].map((p, i) => (
        <text key={i} x={p.x} y={H} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.28)">{p.date.slice(5)}</text>
      ))}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   PROGRESS FORM
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
    <form onSubmit={submit}>
      <div className="flex flex-col gap-2.5">
        <input type="number" step="0.1" inputMode="decimal" value={weight}
          onChange={e => setWeight(e.target.value)} placeholder="Peso de hoy (kg)"
          className="px-4 py-3 rounded-2xl text-[13px] outline-none"
          style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.075)", color: "#fff" }} />
        <label className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-[12px] cursor-pointer"
          style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.075)", color: photo ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.25)" }}>
          <Camera size={14} strokeWidth={1.75} />
          <span className="truncate">{photo ? photo.name : "Subir foto de progreso"}</span>
          <input type="file" accept="image/*" className="hidden" onChange={e => setPhoto(e.target.files?.[0] ?? null)} />
        </label>
        <button type="submit" disabled={status === "saving" || (!weight && !photo)}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-[13px] font-medium cursor-pointer transition-all duration-200 disabled:opacity-38"
          style={{ background: "#fff", color: "#000" }}>
          {status === "saving" ? <Loader2 size={15} className="animate-spin" />
            : status === "saved" ? <><CheckCircle2 size={15} style={{ color: "#22c55e" }} /> Guardado</>
            : "Guardar progreso"}
        </button>
      </div>
    </form>
  );
}

/* ══════════════════════════════════════════════════════════════
   TAB: HOY
══════════════════════════════════════════════════════════════ */

function TabHoy({
  student, detail, meals, day,
  onMealOpen, onExerciseOpen,
}: {
  student: Student; detail: Detail; meals: Meal[];
  day: RoutineDay | undefined;
  onMealOpen: (m: Meal) => void;
  onExerciseOpen: (e: Exercise & { muscleGroup?: string }) => void;
}) {
  const firstName = student.name.split(" ")[0];
  const today = new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div className="pt-2 pb-1">
        <p className="text-[11px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.2)" }}>{today}</p>
        <h1 className="text-[28px] font-semibold tracking-tight" style={{ color: "#fff" }}>Hola, {firstName} 👋</h1>
        <p className="text-[12px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
          {student.stage} · Etapa {student.stageNumber} · Racha de <span style={{ color: "#fb923c" }}>{student.streak} días</span>
        </p>
      </div>

      {/* Diet */}
      <CardWrap>
        <SectionHeader icon={Utensils} title="Tu dieta de hoy" />
        {meals.length === 0
          ? <p className="text-[11px] py-3 text-center" style={{ color: "rgba(255,255,255,0.18)" }}>Tu coach aún no asigna tu dieta.</p>
          : <div className="space-y-2">{meals.map((m, i) => <MealCard key={i} meal={m} onClick={() => onMealOpen(m)} />)}</div>
        }
      </CardWrap>

      {/* Routine for today */}
      <CardWrap>
        <SectionHeader icon={Dumbbell} title="Tu rutina de hoy" />
        {!day
          ? <p className="text-[11px] py-3 text-center" style={{ color: "rgba(255,255,255,0.18)" }}>Día de descanso activo. ¡Recupérate bien!</p>
          : (
            <div>
              <p className="text-[11px] mb-3" style={{ color: "rgba(255,255,255,0.28)" }}>{day.label} · {day.muscleGroup}</p>
              <div className="space-y-2">
                {day.exercises.map((ex, i) => (
                  <ExerciseRow key={i} exercise={{ ...ex, muscleGroup: day.muscleGroup }}
                    onClick={() => onExerciseOpen({ ...ex, muscleGroup: day.muscleGroup })} />
                ))}
              </div>
            </div>
          )}
      </CardWrap>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TAB: PROGRESO
══════════════════════════════════════════════════════════════ */

function TabProgreso({
  student, detail, startWeight, onBadge,
}: {
  student: Student; detail: Detail; startWeight: number;
  onBadge: () => void;
}) {
  const diff = +(student.currentWeight - startWeight).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="pt-2 pb-1">
        <h1 className="text-[24px] font-semibold tracking-tight" style={{ color: "#fff" }}>Progreso</h1>
        <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>Tu evolución en el tiempo</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2.5">
        <StatCard label="Peso actual" value={student.currentWeight} unit="kg"
          sub={diff !== 0 ? `${diff > 0 ? "+" : ""}${diff} kg desde inicio` : "Sin cambios"}
          subColor={diff <= 0 ? "#34d399" : "#f87171"} icon={TrendingDown} accent="#34d399" />
        <StatCard label="Racha" value={student.streak} unit="días" icon={Flame} accent="#fb923c" />
      </div>

      {/* Chart */}
      <CardWrap>
        <SectionHeader icon={TrendingUp} title="Evolución de peso" />
        <WeightChart history={detail.weightHistory} />
      </CardWrap>

      {/* Log form */}
      <CardWrap>
        <SectionHeader icon={Weight} title="Registrar progreso de hoy" />
        <ProgressForm onSaved={() => {}} />
      </CardWrap>

      {/* Badge */}
      <button onClick={onBadge}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-[13px] font-medium cursor-pointer transition-opacity hover:opacity-75"
        style={{ background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)" }}>
        <Download size={14} strokeWidth={1.75} /> Descargar Insignia de Progreso
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TAB: SALAS
══════════════════════════════════════════════════════════════ */

function TabSalas() {
  return (
    <div className="space-y-4">
      <div className="pt-2 pb-1">
        <h1 className="text-[24px] font-semibold tracking-tight" style={{ color: "#fff" }}>Salas</h1>
        <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>Gym Squads y Ligas</p>
      </div>

      <CardWrap>
        {/* Decorative rings */}
        <div className="flex flex-col items-center py-10 gap-5">
          <div className="relative w-24 h-24">
            {[0,1,2].map(i => (
              <div key={i} className="absolute inset-0 rounded-full border"
                style={{
                  borderColor: `rgba(255,255,255,${0.04 + i * 0.03})`,
                  transform: `scale(${1 + i * 0.28})`,
                }} />
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.06)" }}>
                <Users size={22} strokeWidth={1.25} style={{ color: "rgba(255,255,255,0.5)" }} />
              </div>
            </div>
          </div>

          <div className="text-center max-w-[240px]">
            <p className="text-[16px] font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.75)" }}>Próximamente</p>
            <p className="text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.28)" }}>
              Crea tu squad, compite en ligas semanales y gana insignias con tus compañeros de entrenamiento.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <Sparkles size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>En desarrollo · Q3 2025</span>
          </div>
        </div>
      </CardWrap>

      {/* Preview cards */}
      {[
        { title: "Gym Squads", sub: "Equipos de hasta 6 personas", icon: Users },
        { title: "Ligas Semanales", sub: "Ranking por adherencia y progreso", icon: TrendingUp },
        { title: "Insignias Grupales", sub: "Logros compartidos con tu squad", icon: Sparkles },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl px-5 py-4"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.055)" }}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,255,255,0.055)" }}>
            <item.icon size={16} strokeWidth={1.4} style={{ color: "rgba(255,255,255,0.38)" }} />
          </div>
          <div>
            <p className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>{item.title}</p>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>{item.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TAB: PERFIL
══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════
   CANCEL SUBSCRIPTION SHEET
══════════════════════════════════════════════════════════════ */

const CANCEL_REASONS = [
  "Falta de tiempo",
  "Precio muy alto",
  "Lesión o problema de salud",
  "Logré mi objetivo",
  "Otra razón",
];

function CancelSubscriptionSheet({
  reason, onReasonChange, onConfirm, status, onClose,
}: {
  reason: string;
  onReasonChange: (r: string) => void;
  onConfirm: () => void;
  status: "idle" | "loading" | "done" | "error";
  onClose: () => void;
}) {
  if (status === "done") {
    return (
      <div className="flex flex-col items-center py-10 gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)" }}>
          <CheckCircle2 size={26} strokeWidth={1.5} style={{ color: "#34d399" }} />
        </div>
        <p className="text-[17px] font-semibold" style={{ color: "#fff" }}>Suscripción cancelada</p>
        <p className="text-[13px] text-center max-w-[240px]" style={{ color: "#8E8E93" }}>
          Tu acceso se mantiene hasta el final del período actual.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-5 mt-1">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.14)" }}>
          <AlertTriangle size={18} strokeWidth={1.5} style={{ color: "#fb923c" }} />
        </div>
        <div>
          <h2 className="text-[18px] font-semibold" style={{ color: "#fff" }}>¿Por qué cancelas?</h2>
          <p className="text-[12px]" style={{ color: "#8E8E93" }}>Ayúdanos a mejorar nuestro servicio</p>
        </div>
      </div>

      <div className="space-y-2 mb-5">
        {CANCEL_REASONS.map((r) => (
          <button
            key={r}
            onClick={() => onReasonChange(r)}
            className="w-full flex items-center gap-3 px-4 rounded-2xl text-left transition-all duration-150 active:scale-[0.98]"
            style={{
              height: 52,
              background: reason === r ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.025)",
              border: `1px solid ${reason === r ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.055)"}`,
            }}
          >
            <span
              className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
              style={{
                border: `1.5px solid ${reason === r ? "#fff" : "rgba(255,255,255,0.2)"}`,
                background: reason === r ? "#fff" : "transparent",
              }}
            >
              {reason === r && <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#000" }} />}
            </span>
            <span className="text-[13px]" style={{ color: reason === r ? "#fff" : "#8E8E93" }}>{r}</span>
          </button>
        ))}
      </div>

      {status === "error" && (
        <p className="text-[12px] mb-4 px-4 py-2.5 rounded-xl text-center"
          style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.12)", color: "#f87171" }}>
          Hubo un error. Intenta de nuevo.
        </p>
      )}

      <button
        onClick={onConfirm}
        disabled={!reason || status === "loading"}
        className="w-full flex items-center justify-center gap-2 rounded-2xl text-[14px] font-medium transition-opacity disabled:opacity-40 cursor-pointer"
        style={{ height: 52, background: "rgba(248,113,113,0.09)", border: "1px solid rgba(248,113,113,0.15)", color: "#f87171" }}
      >
        {status === "loading"
          ? <Loader2 size={17} className="animate-spin" />
          : "Confirmar cancelación"}
      </button>

      <button
        onClick={onClose}
        className="w-full flex items-center justify-center mt-3 rounded-2xl text-[14px] font-medium cursor-pointer transition-opacity hover:opacity-70"
        style={{ height: 52, background: "#ffffff", color: "#000000" }}
      >
        Mantener suscripción
      </button>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   TAB: PERFIL
══════════════════════════════════════════════════════════════ */

function TabPerfil({ student, detail, onCancelRequest }: {
  student: Student; detail: Detail; onCancelRequest: () => void;
}) {
  const initials = student.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  const infoRows = [
    { label: "Correo", value: student.email ?? "—" },
    { label: "Miembro desde", value: student.joinedDate ?? "—" },
    { label: "Estado", value: student.paymentStatus ?? "Activo" },
  ];

  const bodyRows = [
    { label: "Estatura", value: detail.height && detail.height > 0 ? `${detail.height} cm` : "—", icon: Ruler, accent: "#a78bfa" },
    { label: "% Grasa corporal", value: detail.bodyFat && detail.bodyFat > 0 ? `${detail.bodyFat}%` : "—", icon: Droplet, accent: "#60a5fa" },
    { label: "Peso actual", value: `${student.currentWeight} kg`, icon: TrendingDown, accent: "#34d399" },
    { label: "Racha activa", value: `${student.streak} días`, icon: Flame, accent: "#fb923c" },
  ];

  return (
    <div className="space-y-4">
      <div className="pt-2 pb-1">
        <h1 className="text-[24px] font-semibold tracking-tight" style={{ color: "#fff" }}>Perfil</h1>
        <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>Tu cuenta y datos físicos</p>
      </div>

      {/* Avatar card */}
      <CardWrap>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 text-[20px] font-semibold"
            style={{ background: student.avatarColor ?? "rgba(255,255,255,0.08)", color: "#fff" }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[17px] font-semibold tracking-tight truncate" style={{ color: "#fff" }}>{student.name}</p>
            <p className="text-[11px] mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.32)" }}>{student.email ?? ""}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#34d399" }} />
              <span className="text-[10px]" style={{ color: "#34d399" }}>Suscripción activa</span>
            </div>
          </div>
        </div>
      </CardWrap>

      {/* Body stats */}
      <CardWrap>
        <SectionHeader icon={User} title="Datos físicos" />
        <div className="grid grid-cols-2 gap-2">
          {bodyRows.map(({ label, value, icon: Icon, accent }) => (
            <div key={label} className="rounded-2xl p-3.5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.055)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>{label}</span>
                <Icon size={11} style={{ color: accent }} />
              </div>
              <p className="text-[20px] font-light" style={{ color: value === "—" ? "rgba(255,255,255,0.2)" : "#fff" }}>{value}</p>
            </div>
          ))}
        </div>
      </CardWrap>

      {/* Account info */}
      <CardWrap>
        <SectionHeader icon={CreditCard} title="Cuenta" />
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.065)" }}>
          {infoRows.map((row, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: i < infoRows.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>{row.label}</span>
              <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.72)" }}>{row.value}</span>
            </div>
          ))}
        </div>
      </CardWrap>

      {/* Stage */}
      <CardWrap>
        <SectionHeader icon={Calendar} title="Plan activo" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[15px] font-medium" style={{ color: "#fff" }}>{student.stage}</p>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>Etapa {student.stageNumber}</p>
          </div>
          <div className="px-3 py-1.5 rounded-xl" style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.16)" }}>
            <span className="text-[11px]" style={{ color: "#34d399" }}>En curso</span>
          </div>
        </div>
      </CardWrap>

      {/* Suscripción — solo visible cuando está activa */}
      {(student.paymentStatus === "active" || student.paymentStatus === "grace_period") && (
        <CardWrap>
          <SectionHeader icon={CreditCard} title="Mi suscripción" />
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[14px] font-medium" style={{ color: "#fff" }}>Plan mensual</p>
              <p className="text-[12px] mt-0.5" style={{ color: "#8E8E93" }}>$1,200 MXN / mes</p>
            </div>
            <div className="px-3 py-1.5 rounded-xl"
              style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.13)" }}>
              <span className="text-[11px]" style={{ color: "#34d399" }}>Activa</span>
            </div>
          </div>
          <button
            onClick={onCancelRequest}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] cursor-pointer transition-opacity hover:opacity-70"
            style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.1)", color: "#f87171", minHeight: 46 }}
          >
            <X size={13} />
            Cancelar suscripción
          </button>
        </CardWrap>
      )}

      {/* Sign out */}
      <button onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-[13px] cursor-pointer transition-opacity hover:opacity-75"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.065)", color: "rgba(255,255,255,0.38)" }}>
        <LogOut size={14} strokeWidth={1.5} /> Cerrar sesión
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   BOTTOM NAV BAR
══════════════════════════════════════════════════════════════ */

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "today",    label: "Hoy",      icon: LayoutGrid },
  { id: "progress", label: "Progreso", icon: TrendingUp },
  { id: "squads",   label: "Salas",    icon: Users },
  { id: "profile",  label: "Perfil",   icon: User },
];

function BottomNav({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.065)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}>
      <div className="flex justify-around items-center px-2 h-16 max-w-xl mx-auto">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button key={id} onClick={() => onChange(id)}
              className="flex flex-col items-center gap-1 flex-1 py-2 cursor-pointer transition-all duration-200"
              style={{ opacity: isActive ? 1 : 0.38 }}>
              <div className="relative">
                <Icon size={21} strokeWidth={isActive ? 2 : 1.5}
                  style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.6)", transition: "all 0.2s ease" }} />
                {isActive && (
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: "#fff", animation: "dotPop 0.2s ease" }} />
                )}
              </div>
              <span className="text-[10px] tracking-wide"
                style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.38)", fontWeight: isActive ? 500 : 400, transition: "all 0.2s ease" }}>
                {label}
              </span>
            </button>
          );
        })}
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
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("today");
  const [prevTab, setPrevTab] = useState<TabId>("today");
  const [animating, setAnimating] = useState(false);

  // Routine day auto-selection: match today's weekday
  const todayIndex = (() => {
    const dayMap: Record<string, number> = { lunes:0, martes:1, miércoles:2, jueves:3, viernes:4, sábado:5, domingo:6 };
    const name = new Date().toLocaleDateString("es-MX", { weekday: "long" }).toLowerCase();
    return dayMap[name] ?? 0;
  })();
  const [activeDay] = useState(todayIndex);

  const [activeMeal, setActiveMeal] = useState<Meal | null>(null);
  const [activeExercise, setActiveExercise] = useState<(Exercise & { muscleGroup?: string }) | null>(null);

  // Cancel subscription sheet
  const [cancelSheetOpen, setCancelSheetOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelStatus, setCancelStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  function openCancelSheet() { setCancelSheetOpen(true); setCancelReason(""); setCancelStatus("idle"); }
  function closeCancelSheet() { setCancelSheetOpen(false); setCancelReason(""); setCancelStatus("idle"); }

  const handleCancelSubscription = useCallback(async () => {
    setCancelStatus("loading");
    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" });
      if (res.ok) {
        setCancelStatus("done");
        setStudent((prev) => prev ? { ...prev, paymentStatus: "inactive" as any } : prev);
        setTimeout(closeCancelSheet, 2400);
      } else {
        setCancelStatus("error");
      }
    } catch {
      setCancelStatus("error");
    }
  }, []);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/me");
      if (res.status === 403) {
        const body = await res.json().catch(() => ({}));
        if (body.error === "ACCOUNT_BLOCKED") {
          window.location.replace("/portal/blocked");
          return;
        }
      }
      if (res.ok) { const d = await res.json(); setStudent(d.student); setDetail(d.detail); }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const switchTab = (t: TabId) => {
    if (t === activeTab) return;
    setPrevTab(activeTab);
    setAnimating(true);
    setActiveTab(t);
    setTimeout(() => setAnimating(false), 220);
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-4 space-y-4 pt-10" style={{ background: "#000", minHeight: "100vh" }}>
        {[48, 200, 160, 80].map((h, i) => (
          <Skeleton key={i} className="rounded-3xl" style={{ height: h, background: "rgba(255,255,255,0.04)" }} />
        ))}
      </div>
    );
  }

  if (!student || !detail) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center" style={{ background: "#000" }}>
        <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.28)" }}>Tu cuenta aún no tiene una ficha de alumno asociada.</p>
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-[12px] underline" style={{ color: "rgba(255,255,255,0.45)" }}>Cerrar sesión</button>
      </div>
    );
  }

  const startWeight = detail.weightHistory[0]?.weight ?? student.currentWeight;
  const day: RoutineDay | undefined = detail.routine.days[activeDay] ?? detail.routine.days[0];

  // Enrich meals
  const meals: Meal[] = detail.diet.meals.map((m: any) => ({
    ...m,
    macros: m.macros ?? { protein: 32, carbs: 48, fat: 14 },
    ingredients: m.ingredients ?? m.items.map((item: string, i: number) => ({
      name: item, grams: [150, 120, 80, 200, 100][i % 5],
      calories: Math.round(m.calories / m.items.length),
      icon: ["egg", "wheat", "beef", "salad", "apple"][i % 5],
      unitQty: [1, 0.5, 1.5, 2, 1][i % 5],
      unit: ["pieza", "taza", "tazas", "piezas", "porción"][i % 5],
      macros: { protein: Math.round((m.macros?.protein ?? 32) / m.items.length), carbs: Math.round((m.macros?.carbs ?? 48) / m.items.length), fat: Math.round((m.macros?.fat ?? 14) / m.items.length) },
    })),
  }));

  return (
    <div style={{ background: "#000", minHeight: "100vh" }}>
      {/* Tab content */}
      <div
        className="max-w-xl mx-auto px-4 pt-8 pb-24"
        style={{
          opacity: animating ? 0 : 1,
          transform: animating ? "translateY(6px)" : "translateY(0)",
          transition: "opacity 0.18s ease, transform 0.18s ease",
        }}
      >
        {activeTab === "today" && (
          <TabHoy student={student} detail={detail} meals={meals} day={day}
            onMealOpen={setActiveMeal}
            onExerciseOpen={setActiveExercise} />
        )}
        {activeTab === "progress" && (
          <TabProgreso student={student} detail={detail} startWeight={startWeight}
            onBadge={() => downloadBadge({ name: student.name, photoUrl: detail.photoName, currentWeight: student.currentWeight, startWeight, streak: student.streak, height: detail.height, bodyFat: detail.bodyFat, stage: `${student.stage} · E${student.stageNumber}`, weightHistory: detail.weightHistory })} />
        )}
        {activeTab === "squads" && <TabSalas />}
        {activeTab === "profile" && (
          <TabPerfil student={student} detail={detail} onCancelRequest={openCancelSheet} />
        )}
      </div>

      {/* Bottom nav */}
      <BottomNav active={activeTab} onChange={switchTab} />

      {/* Sheets */}
      <BottomSheet open={!!activeMeal} onClose={() => setActiveMeal(null)}>
        {activeMeal && <MealSheet meal={activeMeal} />}
      </BottomSheet>
      <BottomSheet open={!!activeExercise} onClose={() => setActiveExercise(null)}>
        {activeExercise && <ExerciseSheet exercise={activeExercise} />}
      </BottomSheet>

      {/* Cancel subscription sheet */}
      <BottomSheet open={cancelSheetOpen} onClose={closeCancelSheet}>
        <CancelSubscriptionSheet
          reason={cancelReason}
          onReasonChange={setCancelReason}
          onConfirm={handleCancelSubscription}
          status={cancelStatus}
          onClose={closeCancelSheet}
        />
      </BottomSheet>
    </div>
  );
}
