"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { signOut } from "next-auth/react";
import {
  Flame, Ruler, Droplet, LogOut, Camera, Loader2, CheckCircle2, Check,
  Download, TrendingDown, Dumbbell, Utensils, ChevronRight, ChevronLeft, X,
  ArrowLeftRight, Info, Weight, BarChart3, RefreshCw,
  LayoutGrid, TrendingUp, Users, User, Sparkles, Zap, Search,
  Shield, CreditCard, Calendar, ChevronDown, ChevronUp,
  AlertTriangle, Settings,
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

function MealSheet({ meal, waterMl }: { meal: Meal; waterMl: number }) {
  const DS = "var(--font-display,'Barlow Condensed',sans-serif)";
  const macros = meal.macros ?? { protein: 32, carbs: 48, fat: 14 };
  const ingredients: Ingredient[] = meal.ingredients?.length ? meal.ingredients
    : meal.items.map((name, i) => ({
        name,
        grams: [250, 180, 120, 200, 150][i % 5],
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

  const [swapOpen, setSwapOpen] = useState<number | null>(null);
  const [swaps, setSwaps]       = useState<Record<number, Equivalent | null>>({});
  const [logged, setLogged]     = useState(false);

  const heroImg    = getFoodImg(meal.name);
  const nutriScore = Math.min(10, 6.5 + macros.protein / 60).toFixed(1);
  const waterPct   = Math.min(waterMl / 2500, 1);

  const MACRO_PILLS = [
    { label: "PROT",  value: `${macros.protein}g`, labelColor: "#00F0FF" },
    { label: "CARBS", value: `${macros.carbs}g`,   labelColor: "#808080" },
    { label: "FAT",   value: `${macros.fat}g`,     labelColor: "#808080" },
  ];

  return (
    <>
      {/* ── CINEMA HERO ── */}
      <div className="relative -mx-5 mb-6 overflow-hidden" style={{ minHeight: 230 }}>
        <img src={heroImg} alt={meal.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.52 }} />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to top, #070708 0%, rgba(7,7,8,0.28) 55%, transparent 100%)" }} />
        <div className="relative z-10 px-5 pt-8 pb-6 flex items-end justify-between" style={{ minHeight: 230 }}>
          <div className="flex-1 pr-3">
            <p className="text-[9px] font-black uppercase mb-2"
              style={{ fontFamily: DS, fontStyle: "normal", letterSpacing: "0.22em", color: "#CEFF00" }}>
              ELITE NUTRITION
            </p>
            <h2 style={{
              fontFamily: DS, fontWeight: 900, fontStyle: "italic",
              fontSize: "clamp(34px,10.5vw,46px)", lineHeight: 0.88,
              textTransform: "uppercase", letterSpacing: "0.03em", color: "#fff",
            }}>
              {meal.name}
            </h2>
          </div>
          {/* Glassmorphic macro pills */}
          <div className="flex flex-col gap-2 shrink-0">
            {MACRO_PILLS.map(({ label, value, labelColor }) => (
              <div key={label} className="rounded-2xl flex flex-col items-center justify-center"
                style={{
                  width: 80, height: 64,
                  background: "rgba(26,26,26,0.84)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                }}>
                <p className="text-[9px] font-black uppercase"
                  style={{ fontFamily: DS, fontStyle: "normal", letterSpacing: "0.1em", color: labelColor }}>
                  {label}
                </p>
                <p className="font-black tabular-nums leading-tight"
                  style={{ fontFamily: DS, fontStyle: "normal", fontSize: 17, color: "#fff" }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ANÁLISIS DE COMPOSICIÓN heading ── */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black uppercase"
          style={{ fontFamily: DS, fontStyle: "normal", fontSize: "clamp(15px,4.5vw,18px)", letterSpacing: "0.04em", color: "#fff" }}>
          ANÁLISIS DE COMPOSICIÓN
        </h3>
        <span className="text-[9px] font-black tracking-[0.14em]"
          style={{ fontFamily: DS, fontStyle: "normal", color: "#CEFF00" }}>
          BETA v2.4
        </span>
      </div>

      {/* ── INGREDIENT ROWS ── */}
      <div className="mb-5">
        {ingredients.map((ing, i) => {
          const swapped  = swaps[i];
          const dispGrams = swapped
            ? swapped.macroType === "protein"
              ? `${Math.round((ing.macros?.protein ?? macros.protein / ingredients.length) * (swapped.gramsPerProtein ?? 5))}g`
              : `${Math.round((ing.macros?.carbs ?? macros.carbs / ingredients.length) * (swapped.gramsPerCarb ?? 3.3))}g`
            : `${ing.grams}g`;
          const dispName  = swapped ? swapped.name : ing.name;
          const subtitle  = ing.unit
            ? `${ing.unitQty ?? ""} ${ing.unit}`.trim().toUpperCase()
            : ing.name.toUpperCase();

          return (
            <div key={i}>
              {/* Bento ingredient row */}
              <div className="flex items-center gap-4 rounded-[24px] p-5"
                style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.02)" }}>
                {/* Circular thumbnail */}
                <div className="w-14 h-14 rounded-full overflow-hidden relative shrink-0"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <img src={getIngrImg(ing.icon)} alt={ing.name}
                    className="absolute inset-0 w-full h-full object-cover" />
                </div>
                {/* Name + desc */}
                <div className="flex-1 min-w-0">
                  <p className="font-black truncate"
                    style={{ fontFamily: DS, fontStyle: "normal", fontSize: "clamp(14px,4vw,16px)", lineHeight: 1.1, color: "#fff" }}>
                    {dispName}
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-[0.12em] truncate mt-0.5"
                    style={{ fontFamily: DS, fontStyle: "normal", color: "#808080" }}>
                    {subtitle}
                  </p>
                </div>
                {/* Grams + protein */}
                <div className="text-right shrink-0">
                  <p className="font-black tabular-nums leading-none"
                    style={{ fontFamily: DS, fontStyle: "normal", fontSize: "clamp(22px,6.5vw,28px)", color: "#fff" }}>
                    {dispGrams}
                  </p>
                  <p className="text-[10px] font-black mt-0.5"
                    style={{ fontFamily: DS, fontStyle: "normal", color: "#00F0FF" }}>
                    {ing.macros?.protein ?? Math.round(macros.protein / ingredients.length)}g Proteína
                  </p>
                </div>
              </div>

              {/* Swap node between rows */}
              {i < ingredients.length - 1 && (
                <div className="flex flex-col items-center gap-0 py-1.5">
                  <button
                    onClick={() => setSwapOpen(p => p === i ? null : i)}
                    className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-all"
                    style={{
                      background: swapOpen === i ? "rgba(206,255,0,0.15)" : "#CEFF00",
                      border: swapOpen === i ? "2px solid #CEFF00" : "2px solid #070708",
                      boxShadow: "0 0 14px rgba(206,255,0,0.32), 0 2px 8px rgba(0,0,0,0.5)",
                    }}>
                    <ArrowLeftRight size={14} strokeWidth={2.5}
                      style={{ color: swapOpen === i ? "#CEFF00" : "#000" }} />
                  </button>
                </div>
              )}

              {/* Inline equiv catalog */}
              {swapOpen === i && (
                <div className="rounded-2xl overflow-hidden mb-2"
                  style={{ background: "rgba(20,20,20,0.96)", border: "1px solid rgba(206,255,0,0.14)", animation: "fadeSlideIn 0.18s ease" }}>
                  <div className="px-4 pt-4 pb-3">
                    <EquivCatalog
                      ingredient={ing}
                      selected={swaps[i] ?? null}
                      onSelect={eq => { setSwaps(p => ({ ...p, [i]: eq })); if (!eq) setSwapOpen(null); }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── TELEMETRY GRID ── */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 rounded-2xl p-4 flex flex-col gap-2"
          style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.02)" }}>
          <Flame size={16} style={{ color: "#CEFF00" }} />
          <div>
            <p className="font-black tabular-nums leading-none"
              style={{ fontFamily: DS, fontStyle: "normal", fontSize: "clamp(26px,8vw,34px)", color: "#fff" }}>
              {meal.calories}
            </p>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] mt-1"
              style={{ fontFamily: DS, fontStyle: "normal", color: "#808080" }}>
              KCAL TOTAL
            </p>
          </div>
        </div>
        <div className="flex-1 rounded-2xl p-4 flex flex-col gap-2"
          style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.02)" }}>
          <Dumbbell size={16} style={{ color: "#00F0FF" }} />
          <div>
            <p className="font-black tabular-nums leading-none"
              style={{ fontFamily: DS, fontStyle: "normal", fontSize: "clamp(26px,8vw,34px)", color: "#fff" }}>
              {nutriScore}
            </p>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] mt-1"
              style={{ fontFamily: DS, fontStyle: "normal", color: "#808080", lineHeight: 1.4 }}>
              / 10{"\n"}SCORE NUTRICIONAL
            </p>
          </div>
        </div>
      </div>

      {/* ── HYDRATION MODULE ── */}
      <div className="rounded-2xl p-4 mb-5"
        style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.02)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplet size={14} style={{ color: "#00F0FF" }} />
            <p className="font-black uppercase text-white"
              style={{ fontFamily: DS, fontStyle: "normal", fontSize: 13, letterSpacing: "0.08em" }}>
              Hidratación
            </p>
          </div>
          <p className="tabular-nums text-[11px] font-black"
            style={{ fontFamily: DS, fontStyle: "normal", color: "#808080" }}>
            {waterMl}ml
            <span style={{ color: "rgba(255,255,255,0.18)" }}> / </span>
            2.5L
          </p>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(waterPct * 100, 2)}%`, background: "#CEFF00", boxShadow: "0 0 8px rgba(206,255,0,0.4)" }} />
        </div>
      </div>

      {/* ── CTA BUTTON ── */}
      <button
        onClick={() => setLogged(p => !p)}
        className="w-full py-5 rounded-2xl flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98] transition-all"
        style={{
          fontFamily: DS, fontStyle: "normal", fontWeight: 900,
          fontSize: "clamp(15px,4.5vw,18px)", letterSpacing: "0.12em",
          textTransform: "uppercase",
          background: logged ? "rgba(206,255,0,0.12)" : "#CEFF00",
          color: logged ? "#CEFF00" : "#000",
          border: logged ? "1px solid rgba(206,255,0,0.28)" : "none",
          boxShadow: logged ? "none" : "0 0 28px rgba(206,255,0,0.22)",
        }}>
        {logged
          ? <Check size={18} strokeWidth={3} />
          : <CheckCircle2 size={18} strokeWidth={2.5} />}
        {logged ? "REGISTRADO" : `LOGUEAR ${meal.name.toUpperCase()}`}
      </button>
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

/* ══════════════════════════════════════════════════════════════
   CONCENTRIC RINGS MACRO HUD
══════════════════════════════════════════════════════════════ */

function MacroSummaryCard({ totalTarget, totalConsumed, targetMacros, consumedMacros }: {
  totalTarget: number; totalConsumed: number;
  targetMacros: { protein: number; carbs: number; fat: number };
  consumedMacros: { protein: number; carbs: number; fat: number };
}) {
  const calPct  = totalTarget > 0 ? Math.min(totalConsumed / totalTarget, 1) : 0;
  const proPct  = targetMacros.protein > 0 ? Math.min(consumedMacros.protein / targetMacros.protein, 1) : 0;
  const carbPct = targetMacros.carbs   > 0 ? Math.min(consumedMacros.carbs   / targetMacros.carbs,   1) : 0;
  const fatPct  = targetMacros.fat     > 0 ? Math.min(consumedMacros.fat     / targetMacros.fat,     1) : 0;
  const ring = (r: number, pct: number) => {
    const c = 2 * Math.PI * r;
    return { c: c.toFixed(1), off: (c * (1 - pct)).toFixed(1) };
  };
  const rCal  = ring(100, calPct);
  const rPro  = ring(75,  proPct);
  const rCarb = ring(60,  carbPct);
  const rFat  = ring(45,  fatPct);

  return (
    <div className="mx-4 mt-1 mb-2 rounded-3xl overflow-hidden"
      style={{ background: "rgba(8,8,10,0.95)", backdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 40px 80px -20px rgba(0,0,0,0.8)" }}>
      <div className="flex items-center gap-2 px-5 pt-4 pb-0">
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#CEFF00" }} />
        <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "#52525b" }}>SISTEMA TÁCTICO ACTIVO</span>
      </div>
      {proPct < 0.5 && targetMacros.protein > 0 && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-xl flex items-center gap-2"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)" }}>
          <span style={{ fontSize: 11 }}>⚠</span>
          <span className="text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: "#f87171" }}>
            COMBUSTIBLE CRÍTICO: PROTEÍNA REQUERIDA
          </span>
        </div>
      )}
      <div className="flex items-center justify-around gap-4 p-5">
        {/* Rings */}
        <div className="relative flex-shrink-0" style={{ width: 190, height: 190 }}>
          <svg width={190} height={190} viewBox="0 0 240 240" style={{ transform: "rotate(-90deg)", overflow: "visible" }}>
            <defs>
              <filter id="vg"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              <filter id="cg"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <circle cx="120" cy="120" r="100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12"/>
            <circle cx="120" cy="120" r="100" fill="none" stroke="#CEFF00" strokeWidth="12" strokeLinecap="round"
              strokeDasharray={rCal.c} strokeDashoffset={rCal.off} filter="url(#vg)"
              style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)" }}/>
            <circle cx="120" cy="120" r="75" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
            <circle cx="120" cy="120" r="75" fill="none" stroke="#00F0FF" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={rPro.c} strokeDashoffset={rPro.off} filter="url(#cg)"
              style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)" }}/>
            <circle cx="120" cy="120" r="60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
            <circle cx="120" cy="120" r="60" fill="none" stroke="#acd600" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={rCarb.c} strokeDashoffset={rCarb.off}
              style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)" }}/>
            <circle cx="120" cy="120" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
            <circle cx="120" cy="120" r="45" fill="none" stroke="#c8c6c5" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={rFat.c} strokeDashoffset={rFat.off}
              style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)" }}/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: "#52525b" }}>TOTAL KCAL</span>
            <span style={{ fontFamily: "var(--font-display,'Barlow Condensed',sans-serif)", fontWeight: 900, fontStyle: "italic", fontSize: "clamp(24px,8vw,32px)", lineHeight: 1, color: "#fff", letterSpacing: "-0.04em" }}>
              {totalConsumed.toLocaleString()}
            </span>
            <span className="text-[9px] tabular-nums mt-0.5 font-bold" style={{ color: "rgba(206,255,0,0.7)" }}>/ {totalTarget.toLocaleString()}</span>
          </div>
        </div>
        {/* Macro rows */}
        <div className="flex flex-col gap-3.5 flex-1">
          {([
            { label: "PROTEÍNA",      consumed: consumedMacros.protein, target: targetMacros.protein, color: "#00F0FF", pct: proPct },
            { label: "CARBOHIDRATOS", consumed: consumedMacros.carbs,   target: targetMacros.carbs,   color: "#acd600", pct: carbPct },
            { label: "GRASAS",        consumed: consumedMacros.fat,     target: targetMacros.fat,     color: "#c8c6c5", pct: fatPct },
          ] as const).map(({ label, consumed, target, color, pct }) => (
            <div key={label} className="flex items-center justify-between gap-4 pl-3"
              style={{ borderLeft: `4px solid ${color}` }}>
              <div className="flex-1 min-w-0">
                <p className="text-[8px] font-black uppercase tracking-widest mb-0.5" style={{ color: "#52525b" }}>{label}</p>
                <p className="text-[16px] font-bold tabular-nums leading-none" style={{ color: "#e4e4e7" }}>
                  {consumed}<span className="text-[10px] font-normal ml-1" style={{ color }}>/ {target}g</span>
                </p>
              </div>
              <p className="text-[14px] font-black tabular-nums shrink-0" style={{ color }}>{Math.round(pct * 100)}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FULL-BLEED BENTO MEAL CARDS
══════════════════════════════════════════════════════════════ */

/* Photographic-style multi-layer gradient backgrounds per meal */
const MEAL_GRADIENT: Record<string, string> = {
  desayuno:  "radial-gradient(ellipse 90% 60% at 75% 15%, rgba(251,191,36,0.45) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 15% 80%, rgba(234,88,12,0.3) 0%, transparent 55%), #0d0700",
  almuerzo:  "radial-gradient(ellipse 90% 60% at 65% 20%, rgba(20,184,166,0.4) 0%, transparent 55%), radial-gradient(ellipse 55% 45% at 25% 75%, rgba(6,182,212,0.25) 0%, transparent 55%), #010c09",
  comida:    "radial-gradient(ellipse 90% 55% at 60% 15%, rgba(15,160,110,0.45) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 80% 75%, rgba(6,182,212,0.22) 0%, transparent 55%), #010c07",
  cena:      "radial-gradient(ellipse 80% 55% at 50% 15%, rgba(99,102,241,0.38) 0%, transparent 55%), radial-gradient(ellipse 55% 45% at 75% 80%, rgba(139,92,246,0.25) 0%, transparent 55%), #03030c",
  "colación": "radial-gradient(ellipse 80% 55% at 45% 20%, rgba(168,85,247,0.38) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 75% 75%, rgba(236,72,153,0.22) 0%, transparent 55%), #08000f",
  snack:     "radial-gradient(ellipse 80% 55% at 45% 20%, rgba(168,85,247,0.38) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 75% 75%, rgba(236,72,153,0.22) 0%, transparent 55%), #08000f",
  merienda:  "radial-gradient(ellipse 75% 55% at 50% 20%, rgba(236,72,153,0.32) 0%, transparent 55%), radial-gradient(ellipse 50% 45% at 25% 70%, rgba(168,85,247,0.2) 0%, transparent 55%), #0a0008",
};

function parseMealHour(time: string): number {
  const m = time.match(/(\d{1,2}):(\d{2})/);
  if (!m) return -1;
  return parseInt(m[1]) + parseInt(m[2]) / 60;
}

function FitiaMealCard({ meal, checked, onToggleCheck, onOpen }: {
  meal: Meal; checked: boolean; onToggleCheck: () => void; onOpen: () => void;
}) {
  const key      = meal.name.toLowerCase();
  const gradient = MEAL_GRADIENT[key] ?? "radial-gradient(ellipse 80% 55% at 50% 20%, rgba(100,100,100,0.3) 0%, transparent 55%), #0a0a0c";
  const macros   = meal.macros ?? { protein: 0, carbs: 0, fat: 0 };

  // Time-based state
  const nowH    = new Date().getHours() + new Date().getMinutes() / 60;
  const mealH   = parseMealHour(meal.time);
  const mealState: "past" | "active" | "upcoming" =
    checked              ? "past" :
    mealH < 0            ? "active" :
    nowH >= mealH + 1.5  ? "past" :
    nowH >= mealH - 0.25 ? "active" :
    "upcoming";

  const DS = "var(--font-display,'Barlow Condensed',sans-serif)";

  /* ── PAST / COMPLETED ── */
  if (mealState === "past") {
    return (
      <div className="mx-4 mb-3 rounded-2xl overflow-hidden transition-all duration-500"
        style={{ background: gradient, border: "1px solid rgba(52,211,153,0.2)", position: "relative" }}>
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.72)" }} />
        <div className="relative flex items-center gap-4 px-5 py-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "rgba(52,211,153,0.15)", border: "1.5px solid #34d399" }}>
            <CheckCircle2 size={15} strokeWidth={2.5} style={{ color: "#34d399" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: "#34d399" }}>
              ✓ COMPLETO · {meal.time}
            </p>
            <h4 style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: "clamp(20px,6vw,26px)", lineHeight: 0.95, textTransform: "uppercase", letterSpacing: "-0.02em", color: "rgba(255,255,255,0.35)", textDecoration: "line-through" }}>
              {meal.name}
            </h4>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] tabular-nums font-bold" style={{ color: "rgba(255,255,255,0.2)" }}>{meal.calories}</p>
            <p className="text-[8px]" style={{ color: "rgba(255,255,255,0.15)" }}>kcal</p>
          </div>
          <button onClick={e => { e.stopPropagation(); onToggleCheck(); }}
            className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-all ml-1"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>↩</span>
          </button>
        </div>
      </div>
    );
  }

  /* ── UPCOMING / PENDING ── */
  if (mealState === "upcoming") {
    return (
      <div className="mx-4 mb-3 rounded-2xl overflow-hidden transition-all duration-500"
        style={{ background: gradient, border: "1px solid rgba(255,255,255,0.05)", position: "relative", opacity: 0.55 }}>
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.68)" }} />
        <div className="relative flex items-center gap-4 px-5 py-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <span style={{ fontSize: 14 }}>🌙</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
              PENDIENTE · {meal.time}
            </p>
            <h4 style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: "clamp(20px,6vw,26px)", lineHeight: 0.95, textTransform: "uppercase", letterSpacing: "-0.02em", color: "rgba(255,255,255,0.35)" }}>
              {meal.name}
            </h4>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] tabular-nums font-bold" style={{ color: "rgba(255,255,255,0.2)" }}>{meal.calories}</p>
            <p className="text-[8px]" style={{ color: "rgba(255,255,255,0.12)" }}>kcal</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── ACTIVE / HERO ── */
  return (
    <div className="mx-4 mb-3 rounded-3xl overflow-hidden transition-all duration-500"
      style={{ background: gradient, border: "1px solid rgba(255,255,255,0.1)", position: "relative", boxShadow: "0 40px 80px -20px rgba(0,0,0,0.9)" }}>
      {/* Dark gradient overlay */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.1) 100%)" }} />
      {/* Noise texture overlay for photo realism */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundSize: "256px 256px" }} />

      <div className="relative flex flex-col p-5 gap-4" style={{ minHeight: 340 }}>
        {/* Top row: macro capsules + swap button */}
        <div className="flex items-start justify-between">
          <div className="flex gap-2 flex-wrap">
            <div className="px-3 py-1.5 rounded-full"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <span className="text-[11px] font-black tabular-nums" style={{ color: "#fff" }}>{meal.calories} kcal</span>
            </div>
            {macros.protein > 0 && (
              <div className="px-2.5 py-1.5 rounded-full"
                style={{ background: "rgba(0,240,255,0.12)", backdropFilter: "blur(12px)", border: "1px solid rgba(0,240,255,0.28)" }}>
                <span className="text-[10px] font-black tabular-nums" style={{ color: "#00F0FF" }}>P {macros.protein}g</span>
              </div>
            )}
            {macros.carbs > 0 && (
              <div className="px-2.5 py-1.5 rounded-full"
                style={{ background: "rgba(172,214,0,0.1)", backdropFilter: "blur(12px)", border: "1px solid rgba(172,214,0,0.28)" }}>
                <span className="text-[10px] font-black tabular-nums" style={{ color: "#acd600" }}>C {macros.carbs}g</span>
              </div>
            )}
          </div>
          {/* Swap toggle */}
          <button onClick={onOpen}
            className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-all"
            style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <RefreshCw size={15} strokeWidth={2} style={{ color: "rgba(255,255,255,0.7)" }} />
          </button>
        </div>

        {/* Hero meal name */}
        <div className="flex-1 flex flex-col justify-end">
          <p className="text-[9px] font-black uppercase tracking-[0.22em] mb-2" style={{ color: "#CEFF00" }}>
            {meal.time} · TURNO ACTIVO
          </p>
          <h3 style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: "clamp(52px,16vw,72px)", lineHeight: 0.85, textTransform: "uppercase", letterSpacing: "-0.03em", color: "#fff" }}>
            {meal.name}
          </h3>

          {/* PROTOCOLO RECOMENDADO section */}
          {meal.items?.length > 0 && (
            <div className="mt-3 rounded-2xl px-4 py-3"
              style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-[8px] font-black uppercase tracking-[0.22em] mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                PROTOCOLO RECOMENDADO
              </p>
              <div className="space-y-1">
                {meal.items.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full shrink-0" style={{ background: "#CEFF00" }} />
                    <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.6)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action row */}
          <div className="flex gap-3 mt-4">
            <button onClick={onOpen}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase cursor-pointer active:scale-95 transition-all"
              style={{ fontFamily: DS, fontStyle: "italic", letterSpacing: "0.1em", fontSize: "clamp(14px,4.5vw,17px)", background: "#CEFF00", color: "#000", boxShadow: "0 8px 32px rgba(206,255,0,0.4)" }}>
              <Utensils size={15} strokeWidth={2.5} /> REGISTRAR AHORA ⚡
            </button>
            <button onClick={e => { e.stopPropagation(); onToggleCheck(); }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center cursor-pointer active:scale-90 transition-all"
              style={{ background: "rgba(52,211,153,0.12)", border: "1.5px solid rgba(52,211,153,0.3)" }}>
              <CheckCircle2 size={18} strokeWidth={2} style={{ color: "#34d399" }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SINGLE-EXERCISE FOCUS CARD
══════════════════════════════════════════════════════════════ */

function ExerciseFocusSection({ day, onExerciseOpen }: {
  day: RoutineDay;
  onExerciseOpen: (e: Exercise & { muscleGroup?: string }) => void;
}) {
  const [focusIdx, setFocusIdx]   = useState(0);
  const [setIdx,   setSetIdx]     = useState(0);
  const [weight,   setWeight]     = useState<number>(0);
  const [reps,     setReps]       = useState<number>(0);
  const [restOn,   setRestOn]     = useState(false);
  const [restSecs, setRestSecs]   = useState(90);
  const [done,     setDone]       = useState<Set<number>>(new Set());
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ex         = day.exercises[focusIdx] ?? day.exercises[0];
  const targetReps = parseInt(String(ex.reps)) || 10;
  const totalSets  = ex.sets;

  useEffect(() => { setSetIdx(0); setWeight(0); setReps(targetReps); }, [focusIdx, targetReps]);
  useEffect(() => () => { if (restRef.current) clearInterval(restRef.current); }, []);

  const startRest = () => {
    setRestOn(true); setRestSecs(90);
    if (restRef.current) clearInterval(restRef.current);
    restRef.current = setInterval(() => {
      setRestSecs(s => { if (s <= 1) { clearInterval(restRef.current!); setRestOn(false); return 90; } return s - 1; });
    }, 1000);
  };

  const handleSetComplete = () => {
    startRest();
    if (setIdx + 1 < totalSets) {
      setSetIdx(s => s + 1);
    } else {
      setDone(d => new Set([...d, focusIdx]));
      if (focusIdx + 1 < day.exercises.length) setFocusIdx(i => i + 1);
    }
  };

  return (
    <div className="px-3 pb-2">
      {/* Context header */}
      <div className="flex justify-between items-end mb-3 px-1">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest block mb-0.5" style={{ color: "#CEFF00" }}>
            {day.muscleGroup ?? day.label} · Serie {setIdx + 1} de {totalSets}
          </span>
          <h2 className="font-black uppercase leading-tight" style={{ fontFamily: "var(--font-display,'Barlow Condensed',sans-serif)", fontStyle: "italic", fontSize: "clamp(20px,7vw,28px)", letterSpacing: "-0.02em", color: "#fff" }}>
            {ex.name}
          </h2>
        </div>
        <button onClick={() => onExerciseOpen({ ...ex, muscleGroup: day.muscleGroup })}
          className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer active:scale-90 transition-all"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Info size={13} style={{ color: "rgba(255,255,255,0.32)" }} />
        </button>
      </div>

      {restOn ? (
        /* ── Rest Timer: RESTING state ── */
        <div className="rounded-3xl overflow-hidden mb-3"
          style={{ background: "rgba(206,255,0,0.04)", border: "1px solid rgba(206,255,0,0.22)" }}>
          {/* Status header */}
          <div className="px-5 pt-4 pb-0 flex items-center justify-between">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.25em]" style={{ color: "rgba(206,255,0,0.5)" }}>
                RESTING · SET {setIdx} COMPLETED ✓
              </p>
              <p className="text-[11px] font-medium mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                {ex.name} — {totalSets - setIdx} series restantes
              </p>
            </div>
            <div className="px-2.5 py-1 rounded-lg"
              style={{ background: "rgba(206,255,0,0.08)", border: "1px solid rgba(206,255,0,0.2)" }}>
              <span className="text-[8px] font-black uppercase tracking-wider" style={{ color: "#CEFF00" }}>DESCANSANDO</span>
            </div>
          </div>
          {/* Big countdown */}
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <span style={{ fontFamily: "var(--font-display,'Barlow Condensed',sans-serif)", fontWeight: 900, fontStyle: "italic", fontSize: "clamp(60px,20vw,88px)", lineHeight: 1, color: "#CEFF00", letterSpacing: "-0.04em", textShadow: "0 0 40px rgba(206,255,0,0.55)" }}>
              {String(Math.floor(restSecs / 60)).padStart(2,"0")}:{String(restSecs % 60).padStart(2,"0")}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: 90 }).map((_, i) => (
                <div key={i} className="rounded-full" style={{
                  width: i < 90 - restSecs ? 2 : 2,
                  height: i < 90 - restSecs ? 3 : 2,
                  background: i < 90 - restSecs ? "#CEFF00" : "rgba(255,255,255,0.1)",
                  margin: "0 0.5px",
                }} />
              ))}
            </div>
          </div>
          <div className="px-5 pb-5">
            <button onClick={() => { if (restRef.current) clearInterval(restRef.current); setRestOn(false); setRestSecs(90); }}
              className="w-full py-3.5 rounded-2xl text-[12px] font-black uppercase tracking-widest cursor-pointer active:scale-95 transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}>
              SALTAR DESCANSO →
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Video / exercise canvas */}
          <div className="w-full rounded-3xl overflow-hidden mb-3 relative flex items-center justify-center"
            style={{ aspectRatio: "16/9", background: "radial-gradient(ellipse 80% 70% at 50% 40%, rgba(30,30,35,1) 0%, #060608 100%)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <Dumbbell size={28} strokeWidth={1.25} style={{ color: "rgba(255,255,255,0.18)" }} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.12)" }}>
                {day.muscleGroup ?? "EJERCICIO"} · GUÍA DE FORMA
              </span>
            </div>
            {/* ● LIVE FORM TRACKING pill */}
            <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-2 rounded-full"
              style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(16px)", border: "1px solid rgba(206,255,0,0.35)", boxShadow: "0 0 16px rgba(206,255,0,0.12)" }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#CEFF00", boxShadow: "0 0 6px rgba(206,255,0,0.8)" }} />
              <span className="text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: "#CEFF00" }}>LIVE FORM TRACKING</span>
            </div>
          </div>

          {/* Big input modules */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {[
              { label: "PESO (KG)", val: weight, setVal: setWeight, step: 2.5, color: "#fff", isFloat: true },
              { label: "REPS OBJETIVO", val: reps,   setVal: setReps,   step: 1,   color: "#CEFF00", isFloat: false },
            ].map(({ label, val, setVal, step, color, isFloat }) => (
              <div key={label} className="rounded-3xl flex flex-col items-center justify-center py-5 px-2"
                style={{ background: "rgba(8,8,10,0.85)", backdropFilter: "blur(32px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
                <label className="text-[8px] font-black uppercase tracking-[0.18em] mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>{label}</label>
                <input type="number" inputMode={isFloat ? "decimal" : "numeric"} value={val || ""}
                  onChange={e => setVal(isFloat ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || 0)}
                  placeholder={isFloat ? "0" : String(targetReps)}
                  className="bg-transparent border-none text-center outline-none w-full"
                  style={{ fontFamily: "var(--font-display,'Barlow Condensed',sans-serif)", fontWeight: 900, fontStyle: "italic", fontSize: "clamp(38px,12vw,56px)", lineHeight: 1, letterSpacing: "-0.04em", color }} />
                <div className="flex gap-3 mt-2">
                  <button onClick={() => setVal((v: number) => Math.max(0, isFloat ? +(v - step).toFixed(1) : v - step))}
                    className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer active:scale-90 text-[16px]"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>−</button>
                  <button onClick={() => setVal((v: number) => isFloat ? +(v + step).toFixed(1) : v + step)}
                    className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer active:scale-90 text-[16px]"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>+</button>
                </div>
              </div>
            ))}
          </div>

          {/* SET COMPLETE */}
          <button onClick={handleSetComplete}
            className="w-full py-5 rounded-3xl font-black uppercase flex items-center justify-center gap-3 cursor-pointer transition-all duration-300 active:scale-95"
            style={{ fontFamily: "var(--font-display,'Barlow Condensed',sans-serif)", fontStyle: "italic", letterSpacing: "0.12em", fontSize: "clamp(15px,5vw,19px)", background: "#CEFF00", color: "#000", boxShadow: "0 20px 40px rgba(206,255,0,0.3)" }}>
            <CheckCircle2 size={20} strokeWidth={2.5} /> SET COMPLETE
          </button>
        </>
      )}

      {/* Exercise navigator */}
      <div className="mt-4 flex items-center gap-2 px-1">
        <button onClick={() => setFocusIdx(i => Math.max(0, i - 1))} disabled={focusIdx === 0}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-20 cursor-pointer"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <ChevronLeft size={13} style={{ color: "rgba(255,255,255,0.5)" }} />
        </button>
        <div className="flex-1 flex gap-1.5 justify-center">
          {day.exercises.map((_, i) => (
            <button key={i} onClick={() => setFocusIdx(i)}
              className="rounded-full transition-all duration-300 cursor-pointer"
              style={{ width: i === focusIdx ? 24 : 6, height: 6, background: done.has(i) ? "#34d399" : i === focusIdx ? "#CEFF00" : "rgba(255,255,255,0.15)" }} />
          ))}
        </div>
        <button onClick={() => setFocusIdx(i => Math.min(day.exercises.length - 1, i + 1))} disabled={focusIdx === day.exercises.length - 1}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-20 cursor-pointer"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <ChevronRight size={13} style={{ color: "rgba(255,255,255,0.5)" }} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-3 px-1">
        <div className="flex justify-between mb-1">
          <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.22)" }}>
            {focusIdx + 1}/{day.exercises.length} EJERCICIOS
          </span>
          <span className="text-[9px] font-black" style={{ color: "rgba(255,255,255,0.22)" }}>
            {Math.round((done.size / Math.max(day.exercises.length, 1)) * 100)}% COMPLETADO
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.round((done.size / Math.max(day.exercises.length, 1)) * 100)}%`, background: "linear-gradient(90deg, #00F0FF 0%, #CEFF00 100%)", boxShadow: "0 0 8px rgba(206,255,0,0.5)" }} />
        </div>
      </div>
    </div>
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
  waterMl, onAddWater,
}: {
  student: Student; detail: Detail; meals: Meal[];
  day: RoutineDay | undefined;
  onMealOpen: (m: Meal) => void;
  onExerciseOpen: (e: Exercise & { muscleGroup?: string }) => void;
  waterMl: number;
  onAddWater: () => void;
}) {
  void detail; void day; void onExerciseOpen;
  const DS = "var(--font-display,'Barlow Condensed',sans-serif)";
  const [checkedMeals, setCheckedMeals] = useState<Set<number>>(new Set());

  const toggleMeal = (i: number) => setCheckedMeals(s => {
    const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n;
  });

  const totalTarget   = meals.reduce((s, m) => s + m.calories, 0) || 2800;
  const totalConsumed = meals.reduce((s, m, i) => s + (checkedMeals.has(i) ? m.calories : 0), 0);
  const caloricPct    = Math.min(totalConsumed / Math.max(totalTarget, 1), 1);
  const remaining     = Math.max(totalTarget - totalConsumed, 0);
  const waterTarget   = 2500;

  return (
    <div className="pb-4">

      {/* ── MOTIVATIONAL MARQUEE BANNER ── */}
      <div className="mb-5 rounded-xl px-4 py-2.5"
        style={{ background: "rgba(26,26,26,0.4)", border: "1px solid rgba(255,255,255,0.04)" }}>
        <p className="text-[9.5px] font-black uppercase truncate"
          style={{ fontFamily: DS, letterSpacing: "0.2em", color: "#808080" }}>
          <span style={{ color: "#CEFF00" }}>⚡</span>
          {" "}DISCIPLINA ABSOLUTA
          <span style={{ color: "rgba(255,255,255,0.1)" }}>{" "}•{" "}</span>
          SISTEMA TÁCTICO SINCRONIZADO
          <span style={{ color: "rgba(255,255,255,0.1)" }}>{" "}•{" "}</span>
          PLAN ACTIVO
          <span style={{ color: "#CEFF00" }}>{" "}›{" "}</span>
          DÍA {student.streak}
        </p>
      </div>

      {/* ── TODAY'S NUTRITION HEADER ── */}
      <div className="mb-4">
        <h2 style={{ fontFamily: DS, fontWeight: 900, fontStyle: "normal", fontSize: "clamp(24px,7.5vw,30px)", textTransform: "uppercase", letterSpacing: "-0.01em", color: "#fff", lineHeight: 1 }}>
          TODAY&apos;S NUTRITION
        </h2>
        <p className="text-[11px] mt-1" style={{ color: "#808080" }}>
          Fueling your discipline.{" "}
          <span style={{ color: "#fff", fontWeight: 600 }}>{remaining}</span> kcal remaining.
        </p>
        <div className="mt-3">
          <div className="flex justify-between mb-1.5">
            <span className="text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: "#808080" }}>
              {totalConsumed} KCAL CONSUMED
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: "#808080" }}>
              {totalTarget} KCAL GOAL
            </span>
          </div>
          <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "#1A1A1A" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${caloricPct * 100 || 2}%`, background: "linear-gradient(90deg, #00F0FF 0%, #CEFF00 100%)", boxShadow: "0 0 8px rgba(206,255,0,0.5)" }} />
          </div>
        </div>
      </div>

      {/* ── CONSISTENCY STREAK CARD ── */}
      <div className="rounded-3xl flex items-center gap-4 px-5 py-4 mb-5"
        style={{ background: "#CEFF00" }}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(0,0,0,0.12)" }}>
          <Utensils size={20} strokeWidth={2.5} style={{ color: "#000" }} />
        </div>
        <div>
          <p style={{ fontFamily: DS, fontWeight: 900, fontStyle: "normal", fontSize: "clamp(18px,5.8vw,23px)", textTransform: "uppercase", letterSpacing: "0.04em", color: "#000", lineHeight: 1 }}>
            DAY {student.streak} CONSISTENCY STREAK
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] mt-1" style={{ color: "rgba(0,0,0,0.42)", fontFamily: DS }}>
            ACTIVE STREAK
          </p>
        </div>
      </div>

      {/* ── CINEMA BENTO MEAL CARDS ── */}
      <div className="space-y-4">
        {meals.length === 0 ? (
          <div className="rounded-3xl py-12 flex flex-col items-center gap-3"
            style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Utensils size={32} strokeWidth={1} style={{ color: "rgba(255,255,255,0.1)" }} />
            <p className="text-[12px]" style={{ color: "#808080" }}>Tu coach aún no asigna tu dieta.</p>
          </div>
        ) : meals.map((m, i) => {
          const isChecked = checkedMeals.has(i);
          const imgSrc    = getFoodImg(m.name);
          const isSnack   = m.name.toLowerCase().includes("snack") || m.name.toLowerCase().includes("merienda");
          const cardH     = isSnack ? 155 : 225;
          return (
            <div key={i} className="rounded-3xl overflow-hidden relative cursor-pointer active:scale-[0.99] transition-all"
              style={{ background: "#000", minHeight: cardH }}
              onClick={() => onMealOpen(m)}>
              {/* Food photo */}
              <img src={imgSrc} alt="" className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: isChecked ? 0.22 : 0.58, filter: isChecked ? "grayscale(60%) saturate(0.6)" : "none", transition: "all 0.4s ease" }} />
              {/* Dark mask gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              {/* Content */}
              <div className="relative z-10 p-5 h-full flex flex-col justify-between" style={{ minHeight: cardH }}>
                {/* Top row: macro pills + check button */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    <div className="flex items-center px-2.5 py-1.5 rounded-xl"
                      style={{ background: "rgba(0,0,0,0.68)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <span style={{ fontFamily: DS, fontWeight: 900, fontStyle: "normal", fontSize: "13px", color: "#fff" }}>
                        {m.calories} kcal
                      </span>
                    </div>
                    {m.macros && m.macros.protein > 0 && (
                      <div className="flex items-center px-2.5 py-1.5 rounded-xl"
                        style={{ background: "rgba(0,0,0,0.68)", backdropFilter: "blur(12px)", border: "1px solid rgba(0,240,255,0.22)" }}>
                        <span style={{ fontFamily: DS, fontWeight: 900, fontStyle: "normal", fontSize: "13px", color: "#00F0FF" }}>{m.macros.protein}g P</span>
                      </div>
                    )}
                    {m.macros && m.macros.carbs > 0 && (
                      <div className="flex items-center px-2.5 py-1.5 rounded-xl"
                        style={{ background: "rgba(0,0,0,0.68)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <span style={{ fontFamily: DS, fontWeight: 900, fontStyle: "normal", fontSize: "13px", color: "#fff" }}>{m.macros.carbs}g C</span>
                      </div>
                    )}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); toggleMeal(i); }}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 shrink-0"
                    style={{ background: isChecked ? "#CEFF00" : "rgba(0,0,0,0.68)", border: `1px solid ${isChecked ? "#CEFF00" : "rgba(255,255,255,0.18)"}`, backdropFilter: "blur(12px)" }}>
                    <Check size={14} strokeWidth={3} style={{ color: isChecked ? "#000" : "#fff" }} />
                  </button>
                </div>
                {/* Bottom: meal title + description */}
                <div className="mt-auto pt-4">
                  <h3 style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: isSnack ? "clamp(32px,9.5vw,42px)" : "clamp(44px,13vw,58px)", lineHeight: 0.86, textTransform: "uppercase", letterSpacing: "0.03em", color: isChecked ? "rgba(255,255,255,0.38)" : "#fff" }}>
                    {m.name}
                  </h3>
                  {m.items.length > 0 && (
                    <p className="text-[11px] mt-1.5 leading-relaxed" style={{ color: "#808080" }}>
                      {m.items.slice(0, 3).join(", ")}.
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── HYDRATION SECTION ── */}
      <div className="mt-5 rounded-3xl p-5"
        style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Droplet size={14} strokeWidth={1.5} style={{ color: "#00F0FF" }} />
          <span style={{ fontFamily: DS, fontWeight: 900, fontStyle: "normal", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#fff" }}>HYDRATION</span>
        </div>
        <div className="flex gap-2 mb-4">
          {Array.from({ length: 10 }).map((_, idx) => {
            const filled = waterMl >= (idx + 1) * 250;
            return (
              <div key={idx} className="flex-1 h-9 rounded-xl overflow-hidden transition-all duration-300"
                style={{ background: filled ? "#CEFF00" : "rgba(255,255,255,0.04)", border: `1px solid ${filled ? "#CEFF00" : "rgba(255,255,255,0.06)"}`, boxShadow: filled ? "0 0 6px rgba(206,255,0,0.25)" : "none" }} />
            );
          })}
        </div>
        <div className="flex items-center justify-between">
          <p style={{ fontFamily: DS, fontWeight: 900, fontStyle: "normal", fontSize: "20px", color: "#fff" }}>
            {(waterMl / 1000).toFixed(1)}
            <span style={{ fontSize: "13px", color: "#808080", marginLeft: 4 }}>/ 2.5 L</span>
          </p>
          <button onClick={onAddWater} disabled={waterMl >= waterTarget}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl cursor-pointer active:scale-95 transition-all disabled:opacity-30"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: DS, fontStyle: "normal", fontWeight: 900, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#fff" }}>
            <Droplet size={12} strokeWidth={2} style={{ color: "#00F0FF" }} /> + 250ML
            {waterMl >= waterTarget && <span style={{ fontSize: 10, color: "#CEFF00" }}>✓</span>}
          </button>
        </div>
      </div>
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

/* ══════════════════════════════════════════════════════════════
   TAB: WORKOUT — 3-screen state machine (lobby | focus | library)
══════════════════════════════════════════════════════════════ */

const EXERCISE_LIBRARY = [
  { name: "Barbell Squat",     muscle: "Piernas", sets: 4, reps: "8-10", strength: 14, mobility: 6  },
  { name: "Bench Press",       muscle: "Pecho",   sets: 4, reps: "8",    strength: 16, mobility: 4  },
  { name: "Romanian Deadlift", muscle: "Espalda", sets: 3, reps: "10",   strength: 15, mobility: 8  },
  { name: "Pull-Up",           muscle: "Dorsal",  sets: 4, reps: "Al fallo", strength: 12, mobility: 7 },
  { name: "Shoulder Press",    muscle: "Hombros", sets: 3, reps: "10",   strength: 11, mobility: 6  },
  { name: "Hip Thrust",        muscle: "Glúteos", sets: 4, reps: "12",   strength: 13, mobility: 5  },
  { name: "Cable Row",         muscle: "Espalda", sets: 3, reps: "12",   strength: 10, mobility: 6  },
  { name: "Incline Dumbbell",  muscle: "Pecho",   sets: 3, reps: "10",   strength: 9,  mobility: 5  },
  { name: "Leg Press 45°",     muscle: "Piernas", sets: 4, reps: "12",   strength: 13, mobility: 4  },
  { name: "Face Pull",         muscle: "Hombros", sets: 3, reps: "15",   strength: 7,  mobility: 10 },
];

const MG_GRADIENT: Record<string, string> = {
  piernas: "radial-gradient(ellipse 90% 60% at 65% 20%, rgba(99,102,241,0.5) 0%, transparent 55%), #03030c",
  pecho:   "radial-gradient(ellipse 90% 60% at 60% 20%, rgba(239,68,68,0.4)  0%, transparent 55%), #0c0303",
  espalda: "radial-gradient(ellipse 90% 60% at 55% 20%, rgba(20,184,166,0.45) 0%, transparent 55%), #01100c",
  dorsal:  "radial-gradient(ellipse 90% 60% at 55% 20%, rgba(6,182,212,0.4)  0%, transparent 55%), #01090c",
  hombros: "radial-gradient(ellipse 90% 60% at 65% 20%, rgba(251,191,36,0.4) 0%, transparent 55%), #0d0900",
  glúteos: "radial-gradient(ellipse 90% 60% at 65% 20%, rgba(236,72,153,0.4) 0%, transparent 55%), #0a0005",
  default: "radial-gradient(ellipse 90% 60% at 65% 20%, rgba(206,255,0,0.2) 0%, transparent 55%), #070808",
};

function getMgGrad(muscle?: string): string {
  if (!muscle) return MG_GRADIENT.default;
  const k = muscle.toLowerCase();
  for (const [key, val] of Object.entries(MG_GRADIENT)) {
    if (k.includes(key)) return val;
  }
  return MG_GRADIENT.default;
}

const GYM_IMGS = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=30&auto=format",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=700&q=30&auto=format",
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=700&q=30&auto=format",
  "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=700&q=30&auto=format",
  "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=700&q=30&auto=format",
  "https://images.unsplash.com/photo-1544717305-2782549b5136?w=700&q=30&auto=format",
];

const FOOD_IMGS: Record<string, string> = {
  desayuno: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=700&q=30&auto=format",
  snack:    "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=700&q=30&auto=format",
  merienda: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=700&q=30&auto=format",
  almuerzo: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=700&q=30&auto=format",
  comida:   "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=700&q=30&auto=format",
  cena:     "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700&q=30&auto=format",
  default:  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&q=30&auto=format",
};

function getFoodImg(name: string): string {
  const k = name.toLowerCase();
  for (const [key, url] of Object.entries(FOOD_IMGS)) {
    if (k.includes(key)) return url;
  }
  return FOOD_IMGS.default;
}

const INGR_IMGS: Record<string, string> = {
  egg:     "https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=120&q=30&auto=format",
  wheat:   "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=120&q=30&auto=format",
  beef:    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&q=30&auto=format",
  chicken: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=120&q=30&auto=format",
  salad:   "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=120&q=30&auto=format",
  apple:   "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=120&q=30&auto=format",
};
function getIngrImg(icon?: string): string {
  return INGR_IMGS[icon ?? ""] ?? INGR_IMGS.beef;
}

function TabWorkout({ day, student, waterMl, onAddWater, onFocusMode }: {
  day: RoutineDay | undefined;
  student: Student;
  waterMl: number;
  onAddWater: () => void;
  onFocusMode: (active: boolean) => void;
}) {
  type WView = "lobby" | "focus" | "library";
  const [wView,        setWView]        = useState<WView>("lobby");
  const [animating,    setAnimating]    = useState(false);
  const [activeExIdx,  setActiveExIdx]  = useState(0);
  const [doneSets,     setDoneSets]     = useState<Record<number, number>>({});
  const [doneEx,       setDoneEx]       = useState<Set<number>>(new Set());
  const [focusWeight,  setFocusWeight]  = useState<number>(0);
  const [focusReps,    setFocusReps]    = useState<number>(10);
  const [restOn,       setRestOn]       = useState(false);
  const [restSecs,     setRestSecs]     = useState(90);
  const [restDone,     setRestDone]     = useState(false);
  const [query,        setQuery]        = useState("");
  const [wDuration,    setWDuration]    = useState(0);
  const restRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const DS = "var(--font-display,'Barlow Condensed',sans-serif)";

  const exercises   = day?.exercises ?? [];
  const totalEx     = exercises.length || 6;
  const activeEx    = exercises[activeExIdx];
  const targetReps  = activeEx ? parseInt(String(activeEx.reps)) || 10 : 10;
  const totalSets   = activeEx?.sets ?? 4;
  const currentSet  = doneSets[activeExIdx] ?? 0;
  const waterTarget = 4000;
  const waterPct    = waterMl / waterTarget;
  const waterR      = 40;
  const waterCirc   = 2 * Math.PI * waterR;
  const overallPct  = Math.round((doneEx.size / Math.max(totalEx, 1)) * 100);
  const durationStr = `${String(Math.floor(wDuration / 60)).padStart(2,"0")}:${String(wDuration % 60).padStart(2,"0")}`;

  useEffect(() => { setFocusReps(targetReps); }, [activeExIdx, targetReps]);

  useEffect(() => {
    durationRef.current = setInterval(() => setWDuration(s => s + 1), 1000);
    return () => {
      if (restRef.current) clearInterval(restRef.current);
      if (durationRef.current) clearInterval(durationRef.current);
    };
  }, []);

  const switchView = (next: WView) => {
    if (next === wView) return;
    setAnimating(true);
    setTimeout(() => { setWView(next); setAnimating(false); }, 160);
    onFocusMode(next === "focus");
  };

  const startRest = () => {
    setRestOn(true); setRestSecs(90); setRestDone(false);
    if (restRef.current) clearInterval(restRef.current);
    restRef.current = setInterval(() => {
      setRestSecs(s => {
        if (s <= 1) { clearInterval(restRef.current!); setRestDone(true); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  const skipRest = () => {
    if (restRef.current) clearInterval(restRef.current);
    setRestOn(false); setRestDone(false); setRestSecs(90);
  };

  const startNextSet = () => { setRestOn(false); setRestDone(false); setRestSecs(90); };

  const handleSetComplete = () => {
    const newSets = currentSet + 1;
    setDoneSets(d => ({ ...d, [activeExIdx]: newSets }));
    if (newSets >= totalSets) {
      setDoneEx(d => new Set([...d, activeExIdx]));
      const next = exercises.findIndex((_, i) => i > activeExIdx && !doneEx.has(i));
      if (next !== -1) setActiveExIdx(next);
    }
    startRest();
  };

  /* ─── LOBBY ─── */
  const LobbyView = (
    <div className="pb-4">

      {/* ── WORKOUT INTRO ── */}
      <div className="px-5 pt-1 pb-5">
        <p className="text-[9px] font-black uppercase tracking-[0.25em] mb-2 flex items-center gap-2" style={{ color: "#CEFF00" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: "#CEFF00" }} />
          FUERZA TOTAL · {totalEx} EJERCICIOS · 45 MIN
        </p>
        <h1 style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: "clamp(40px,13vw,56px)", lineHeight: 0.9, textTransform: "uppercase", letterSpacing: "-0.03em", color: "#fff" }}>
          {day?.muscleGroup?.toUpperCase() ?? "TODO EL CUERPO"}
        </h1>
        <p className="text-[11px] mt-2" style={{ color: "#fff" }}>{day?.label ?? "Rutina de hoy"} · Sesión activa</p>
      </div>

      {/* ── OVERALL PROGRESS BAR ── */}
      <div className="px-5 mb-4">
        <div className="flex justify-between mb-1.5">
          <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: "#fff" }}>{doneEx.size}/{totalEx} COMPLETADOS</span>
          <span className="text-[9px] font-black" style={{ color: "#CEFF00" }}>{overallPct}%</span>
        </div>
        <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${overallPct}%`, background: "linear-gradient(90deg, #00F0FF 0%, #CEFF00 100%)", boxShadow: "0 0 8px rgba(206,255,0,0.6)" }} />
        </div>
      </div>

      {/* ── EXERCISE CARDS (full-bleed bento) ── */}
      <div className="px-4 space-y-3">
        {exercises.map((ex, i) => {
          const exDone   = doneEx.has(i);
          const isActive = i === activeExIdx && !exDone;
          const exRich   = ex as Exercise & { muscleGroup?: string };
          const imgSrc   = GYM_IMGS[i % GYM_IMGS.length];

          if (exDone) return (
            <div key={i} className="rounded-3xl overflow-hidden relative" style={{ background: "#000", minHeight: 168 }}>
              <img src={imgSrc} alt="" className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: 0.18, filter: "grayscale(100%) brightness(0.45)" }} />
              <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.76)" }} />
              <div className="relative z-10 flex flex-col items-center justify-center py-8 px-5 gap-2.5">
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: "#CEFF00", boxShadow: "0 0 24px rgba(206,255,0,0.35)" }}>
                  <Check size={26} strokeWidth={3} style={{ color: "#000" }} />
                </div>
                <h3 className="font-black italic tracking-wide text-white text-center"
                  style={{ fontFamily: DS, fontSize: "clamp(22px,6.5vw,28px)", textTransform: "uppercase", marginTop: 4 }}>
                  {ex.name}
                </h3>
                <p className="text-[10px] uppercase tracking-[0.25em] font-mono" style={{ color: "#808080" }}>
                  COMPLETADO
                </p>
              </div>
            </div>
          );

          if (isActive) return (
            <div key={i} className="rounded-3xl overflow-hidden relative cursor-pointer active:scale-[0.98] transition-all"
              style={{ background: "#000", border: "1px solid rgba(206,255,0,0.32)", boxShadow: "0 0 0 1px rgba(206,255,0,0.08), 0 32px 64px -16px rgba(0,0,0,0.9)", minHeight: 200 }}
              onClick={() => switchView("focus")}>
              <img src={imgSrc} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.52 }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="relative z-10 p-5 flex flex-col gap-3 h-full">
                <div className="flex items-center justify-between">
                  <div className="px-3 py-1.5 rounded-full flex items-center gap-2"
                    style={{ background: "rgba(206,255,0,0.12)", border: "1px solid rgba(206,255,0,0.42)" }}>
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#CEFF00" }} />
                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#CEFF00" }}>EN CURSO</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#fff" }}>
                    {exRich.muscleGroup ?? day?.muscleGroup ?? "FUERZA"}
                  </span>
                </div>
                <h3 style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: "clamp(30px,9vw,42px)", lineHeight: 0.88, textTransform: "uppercase", letterSpacing: "-0.03em", color: "#fff" }}>
                  {ex.name}
                </h3>
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest mb-0.5" style={{ color: "#CEFF00" }}>SERIES</p>
                    <p className="text-[14px] font-black tabular-nums" style={{ color: "#fff" }}>
                      {currentSet + 1} / {ex.sets}
                      {focusWeight > 0 && <span className="text-[11px] font-normal ml-2" style={{ color: "#CEFF00" }}> · {focusWeight} KG</span>}
                    </p>
                  </div>
                  <div className="px-4 py-2.5 rounded-2xl flex items-center gap-2"
                    style={{ background: "#CEFF00", boxShadow: "0 8px 24px rgba(206,255,0,0.38)" }}>
                    <Zap size={13} strokeWidth={2.5} style={{ color: "#000" }} />
                    <span style={{ fontFamily: DS, fontStyle: "italic", fontWeight: 900, letterSpacing: "0.08em", fontSize: "11px", color: "#000", textTransform: "uppercase" }}>ENTRENAR</span>
                  </div>
                </div>
              </div>
            </div>
          );

          return (
            <div key={i} className="rounded-3xl overflow-hidden relative cursor-pointer active:scale-[0.98] transition-all"
              style={{ background: "#000", minHeight: 72, border: "1px solid rgba(255,255,255,0.06)" }}
              onClick={() => { setActiveExIdx(i); switchView("focus"); }}>
              <img src={imgSrc} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.28 }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="relative z-10 flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-widest mb-0.5" style={{ color: "#fff" }}>PENDIENTE</p>
                  <h3 style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: "clamp(18px,5.5vw,22px)", textTransform: "uppercase", letterSpacing: "-0.02em", color: "#fff" }}>
                    {ex.name}
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] tabular-nums" style={{ color: "#fff" }}>{ex.sets} Series</p>
                  <p className="text-[10px]" style={{ color: "#CEFF00" }}>{ex.reps}</p>
                </div>
              </div>
            </div>
          );
        })}

        {exercises.length === 0 && (
          <div className="rounded-3xl py-12 flex flex-col items-center gap-3"
            style={{ background: "rgba(8,8,10,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Dumbbell size={32} strokeWidth={1} style={{ color: "rgba(255,255,255,0.12)" }} />
            <p className="text-[12px]" style={{ color: "#fff" }}>Sin rutina asignada para hoy.</p>
          </div>
        )}
      </div>

      {/* ── HYDRATION TRACKER ── */}
      <div className="mx-4 mt-5 rounded-3xl p-5"
        style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 24px 48px -12px rgba(0,0,0,0.8)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: "#fff" }}>HIDRATACIÓN TÁCTICA</p>
            <p className="text-[22px] font-black tabular-nums" style={{ color: "#00F0FF" }}>
              {(waterMl / 1000).toFixed(1)}<span className="text-[13px] font-normal ml-1" style={{ color: "rgba(0,240,255,0.5)" }}>/ 4.0 L</span>
            </p>
          </div>
          <div className="relative" style={{ width: 88, height: 88 }}>
            <svg width={88} height={88} viewBox="0 0 96 96" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="48" cy="48" r={waterR} fill="none" stroke="rgba(0,240,255,0.06)" strokeWidth="6" />
              <circle cx="48" cy="48" r={waterR} fill="none" stroke="#00F0FF" strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={waterCirc.toFixed(1)}
                strokeDashoffset={(waterCirc * (1 - waterPct)).toFixed(1)}
                style={{ filter: "drop-shadow(0 0 6px rgba(0,240,255,0.6))", transition: "stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Droplet size={13} strokeWidth={1.5} style={{ color: "#00F0FF" }} />
              <span className="text-[11px] font-black tabular-nums" style={{ color: "#00F0FF" }}>
                {Math.round(waterPct * 100)}%
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {Array.from({ length: 8 }).map((_, idx) => {
            const filled = waterMl >= (idx + 1) * 500;
            return (
              <div key={idx} className="w-9 h-14 rounded-xl flex items-end justify-center overflow-hidden shrink-0 transition-all duration-300"
                style={{ background: filled ? "rgba(0,240,255,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${filled ? "rgba(0,240,255,0.28)" : "rgba(255,255,255,0.05)"}` }}>
                {filled && (
                  <div className="w-full transition-all duration-500"
                    style={{ height: "75%", background: "linear-gradient(to top, rgba(0,240,255,0.5), rgba(0,240,255,0.12))", borderRadius: "0 0 10px 10px" }} />
                )}
              </div>
            );
          })}
        </div>
        <button onClick={onAddWater} disabled={waterMl >= waterTarget}
          className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-black uppercase cursor-pointer active:scale-95 transition-all disabled:opacity-30"
          style={{ fontFamily: DS, fontStyle: "italic", letterSpacing: "0.1em", fontSize: "13px", background: "rgba(0,240,255,0.08)", border: "1px solid rgba(0,240,255,0.25)", color: "#00F0FF" }}>
          <Droplet size={13} strokeWidth={2.5} /> + 250ML
          {waterMl >= waterTarget && <span className="ml-2 text-[10px] font-normal normal-case tracking-normal" style={{ fontStyle: "normal" }}>✓ Meta alcanzada</span>}
        </button>
      </div>

      {/* ── LIBRARY CTA ── */}
      <div className="mx-4 mt-3">
        <button onClick={() => switchView("library")}
          className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
          style={{ fontFamily: DS, fontStyle: "italic", letterSpacing: "0.1em", fontSize: "13px", fontWeight: 900, textTransform: "uppercase", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#fff" }}>
          <Search size={13} strokeWidth={2} /> BIBLIOTECA DE EJERCICIOS
        </button>
      </div>
    </div>
  );

  /* ─── FOCUS ─── */
  const FocusView = activeEx ? (
    <div className="pb-4">

      {/* ── MYCOACH BRAND HEADER WITH BACK ── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <button onClick={() => switchView("lobby")}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-all shrink-0"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <ChevronLeft size={14} style={{ color: "#fff" }} />
          </button>
          <div className="flex items-center gap-1.5">
            <Zap size={13} fill="#CEFF00" stroke="none" />
            <span style={{ fontFamily: DS, fontWeight: 900, fontSize: "clamp(14px,4vw,17px)", letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff" }}>MYCOACH</span>
          </div>
        </div>
        <button className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Settings size={14} style={{ color: "#fff" }} />
        </button>
      </div>

      {/* ── EXERCISE CONTEXT HEADER ── */}
      <div className="flex items-end justify-between px-5 pb-4 gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[8.5px] font-black uppercase tracking-[0.22em] mb-1.5"
            style={{ color: (restOn || restDone) ? "#CEFF00" : "#fff" }}>
            {restDone
              ? "REST FINISHED"
              : restOn
              ? `RESTING — SET ${currentSet} COMPLETED ✓`
              : `${day?.muscleGroup ?? "FUERZA"} · SERIE ${currentSet + 1} DE ${totalSets}`}
          </p>
          <h1 style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: "clamp(28px,8.5vw,40px)", lineHeight: 0.88, textTransform: "uppercase", letterSpacing: "-0.03em", color: "#fff" }}>
            {activeEx.name}
          </h1>
        </div>
        <div className="text-right shrink-0 pb-0.5">
          <p className="text-[8px] uppercase tracking-wider mb-1" style={{ color: "#fff" }}>HEART RATE</p>
          <p style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: "clamp(13px,3.5vw,15px)", color: "#ff6b6b", letterSpacing: "0.04em" }}>❤ 142 BPM</p>
        </div>
      </div>

      <div className="px-3">
        {restOn ? (
          restDone ? (
            /* ── REST FINISHED STATE — full-bleed volt CTA ── */
            <div className="rounded-[32px] overflow-hidden mb-3"
              style={{ background: "rgba(6,6,8,0.97)", border: "2px solid #CEFF00", boxShadow: "0 0 40px rgba(206,255,0,0.25)" }}>
              <div className="px-5 pt-5 pb-2 flex items-center justify-between">
                <p className="text-[8px] font-black uppercase tracking-[0.22em]" style={{ color: "#CEFF00" }}>REST FINISHED</p>
                <div className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: "#CEFF00" }}>
                  <CheckCircle2 size={14} strokeWidth={3} style={{ color: "#000" }} />
                </div>
              </div>
              <div className="flex flex-col items-center py-8 gap-3">
                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(206,255,0,0.08)", border: "2px solid rgba(206,255,0,0.3)" }}>
                  <CheckCircle2 size={36} strokeWidth={2.5} style={{ color: "#CEFF00" }} />
                </div>
                <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.4)" }}>
                  00:00 — DESCANSO COMPLETADO
                </p>
              </div>
              <div className="px-5 pb-5">
                <button onClick={startNextSet}
                  className="w-full py-5 rounded-2xl cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-3"
                  style={{ fontFamily: DS, fontStyle: "normal", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "clamp(15px,5vw,19px)", background: "#CEFF00", color: "#000", boxShadow: "0 12px 32px rgba(206,255,0,0.4)" }}>
                  <Zap size={18} strokeWidth={2.5} style={{ color: "#000" }} /> START NEXT SET
                </button>
              </div>
            </div>
          ) : (
          /* ── REST TIMER PANEL — volt glow border ── */
          <div className="rounded-[32px] overflow-hidden mb-3"
            style={{ background: "rgba(6,6,8,0.97)", border: "2px solid #CEFF00", boxShadow: "0 0 30px rgba(206,255,0,0.2)" }}>
            <div className="px-5 pt-5 pb-2 flex items-center justify-between">
              <p className="text-[8px] font-black uppercase tracking-[0.22em]" style={{ color: "#CEFF00" }}>RESTING TIME REMAINING</p>
              <div className="px-2.5 py-1 rounded-lg" style={{ background: "rgba(206,255,0,0.08)", border: "1px solid rgba(206,255,0,0.22)" }}>
                <span className="text-[8px] font-black uppercase tracking-wider" style={{ color: "#CEFF00" }}>DESCANSANDO</span>
              </div>
            </div>
            <div className="flex flex-col items-center py-8 gap-4">
              <span style={{ fontFamily: DS, fontWeight: 900, fontStyle: "normal", fontSize: "clamp(72px,22vw,100px)", lineHeight: 1, color: "#CEFF00", letterSpacing: "-0.02em", textShadow: "0 0 48px rgba(206,255,0,0.55)" }}>
                {String(Math.floor(restSecs / 60)).padStart(2,"0")}:{String(restSecs % 60).padStart(2,"0")}
              </span>
              <div className="flex gap-[3px] flex-wrap justify-center" style={{ maxWidth: 260 }}>
                {Array.from({ length: 18 }).map((_, idx) => {
                  const filled = idx < Math.round((90 - restSecs) / 5);
                  return (
                    <div key={idx} className="rounded-full transition-all duration-300"
                      style={{ width: 12, height: 4, background: filled ? "#CEFF00" : "rgba(255,255,255,0.07)", boxShadow: filled ? "0 0 4px rgba(206,255,0,0.6)" : "none" }} />
                  );
                })}
              </div>
            </div>
            <div className="px-5 pb-5">
              <button onClick={skipRest}
                className="w-full py-3.5 rounded-2xl cursor-pointer active:scale-95 transition-all"
                style={{ fontFamily: DS, fontStyle: "normal", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "13px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}>
                SKIP REST →
              </button>
            </div>
          </div>
          )
        ) : (
          <>
            {/* ── VIDEO CANVAS ── */}
            <div className="w-full rounded-3xl overflow-hidden mb-3 relative"
              style={{ aspectRatio: "16/9", background: "#000", border: "1px solid rgba(255,255,255,0.07)" }}>
              <img src={GYM_IMGS[activeExIdx % GYM_IMGS.length]} alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: 0.55, filter: "saturate(0.55)" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              {/* Performance Guide — bottom left */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.14)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.22)" }}>
                  <span style={{ color: "#fff", fontSize: 10, paddingLeft: 2 }}>▶</span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: "#fff" }}>Watch Form Check</span>
              </div>
              {/* LIVE FORM TRACKING — top right */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(16px)", border: "1px solid rgba(206,255,0,0.38)", boxShadow: "0 0 16px rgba(206,255,0,0.1)" }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#CEFF00", boxShadow: "0 0 6px rgba(206,255,0,0.9)" }} />
                <span className="text-[8.5px] font-black uppercase tracking-wider" style={{ color: "#CEFF00" }}>LIVE FORM TRACKING</span>
              </div>
            </div>

            {/* ── INPUT MODULES ── */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="rounded-3xl flex flex-col items-center justify-center py-5 px-2"
                style={{ background: "#1A1A1A", backdropFilter: "blur(32px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
                <label className="text-[8px] font-black uppercase tracking-[0.18em] mb-1" style={{ color: "#fff" }}>PESO (KG)</label>
                <input type="number" inputMode="decimal"
                  value={focusWeight || ""}
                  onChange={e => setFocusWeight(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="bg-transparent border-none outline-none w-full"
                  style={{ fontFamily: DS, fontWeight: 900, fontStyle: "normal", fontSize: "clamp(38px,12vw,58px)", lineHeight: 1, letterSpacing: "-0.01em", color: "#fff", textAlign: "center" }} />
                <div className="flex gap-3 mt-2">
                  <button onClick={() => setFocusWeight(w => Math.max(0, +(w - 2.5).toFixed(1)))}
                    className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer active:scale-90 text-[17px]"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}>−</button>
                  <button onClick={() => setFocusWeight(w => +(w + 2.5).toFixed(1))}
                    className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer active:scale-90 text-[17px]"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}>+</button>
                </div>
              </div>
              <div className="rounded-3xl flex flex-col items-center justify-center py-5 px-2"
                style={{ background: "#1A1A1A", backdropFilter: "blur(32px)", border: "1px solid rgba(206,255,0,0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(206,255,0,0.05)" }}>
                <label className="text-[8px] font-black uppercase tracking-[0.18em] mb-1" style={{ color: "#CEFF00" }}>REPS OBJETIVO</label>
                <input type="number" inputMode="numeric"
                  value={focusReps || ""}
                  onChange={e => setFocusReps(parseInt(e.target.value) || 0)}
                  placeholder={String(targetReps)}
                  className="bg-transparent border-none outline-none w-full"
                  style={{ fontFamily: DS, fontWeight: 900, fontStyle: "normal", fontSize: "clamp(38px,12vw,58px)", lineHeight: 1, letterSpacing: "-0.01em", color: "#CEFF00", textAlign: "center" }} />
                <div className="flex gap-3 mt-2">
                  <button onClick={() => setFocusReps(r => Math.max(0, r - 1))}
                    className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer active:scale-90 text-[17px]"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}>−</button>
                  <button onClick={() => setFocusReps(r => r + 1)}
                    className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer active:scale-90 text-[17px]"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}>+</button>
                </div>
              </div>
            </div>

            <button onClick={handleSetComplete}
              className="w-full py-5 rounded-3xl font-black uppercase flex items-center justify-center gap-3 cursor-pointer transition-all duration-300 active:scale-95"
              style={{ fontFamily: DS, fontStyle: "italic", letterSpacing: "0.12em", fontSize: "clamp(15px,5vw,20px)", background: "#CEFF00", color: "#000", boxShadow: "0 20px 40px rgba(206,255,0,0.32)" }}>
              <CheckCircle2 size={20} strokeWidth={2.5} /> ✓ SET COMPLETE
            </button>
          </>
        )}

        {/* ── DOT NAVIGATOR ── */}
        <div className="mt-4 flex items-center gap-2">
          <button onClick={() => { if (activeExIdx > 0) setActiveExIdx(i => i - 1); }} disabled={activeExIdx === 0}
            className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-20 cursor-pointer transition-all"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <ChevronLeft size={13} style={{ color: "#fff" }} />
          </button>
          <div className="flex-1 flex gap-2 justify-center">
            {exercises.map((_, idx) => (
              <button key={idx} onClick={() => { setActiveExIdx(idx); }} className="rounded-full transition-all duration-300 cursor-pointer"
                style={{ width: idx === activeExIdx ? 24 : 6, height: 6, background: doneEx.has(idx) ? "#34d399" : idx === activeExIdx ? "#CEFF00" : "rgba(255,255,255,0.15)" }} />
            ))}
          </div>
          <button onClick={() => { if (activeExIdx < exercises.length - 1) setActiveExIdx(i => i + 1); }} disabled={activeExIdx === exercises.length - 1}
            className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-20 cursor-pointer transition-all"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <ChevronRight size={13} style={{ color: "#fff" }} />
          </button>
        </div>

        {/* ── BOTTOM: DURATION + PROGRESS BAR ── */}
        <div className="mt-4 rounded-3xl px-5 py-4"
          style={{ background: "rgba(8,8,10,0.85)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.18em] mb-0.5" style={{ color: "#fff" }}>WORKOUT DURATION</p>
              <p className="text-[17px] font-black tabular-nums" style={{ fontFamily: DS, fontStyle: "italic", color: "#fff" }}>{durationStr}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black uppercase tracking-[0.18em] mb-0.5" style={{ color: "#fff" }}>OVERALL PROGRESS</p>
              <p className="text-[17px] font-black" style={{ fontFamily: DS, fontStyle: "italic", color: "#CEFF00" }}>{overallPct}%</p>
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${overallPct || 2}%`, background: "linear-gradient(90deg, #00F0FF 0%, #CEFF00 100%)", boxShadow: "0 0 8px rgba(206,255,0,0.5)" }} />
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Dumbbell size={40} strokeWidth={0.75} style={{ color: "rgba(255,255,255,0.1)" }} />
      <p className="text-[12px]" style={{ color: "#fff" }}>No hay ejercicio activo.</p>
      <button onClick={() => switchView("lobby")} className="px-6 py-2.5 rounded-xl cursor-pointer active:scale-95"
        style={{ fontFamily: DS, fontStyle: "italic", fontWeight: 900, textTransform: "uppercase", fontSize: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff" }}>
        ← VOLVER AL LOBBY
      </button>
    </div>
  );

  /* ─── LIBRARY ─── */
  const filtered = EXERCISE_LIBRARY.filter(e =>
    e.name.toLowerCase().includes(query.toLowerCase()) ||
    e.muscle.toLowerCase().includes(query.toLowerCase())
  );

  const LibraryView = (
    <div className="pb-4">
      <div className="flex items-center gap-3 px-5 pt-4 pb-4">
        <button onClick={() => switchView("lobby")}
          className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer active:scale-90 transition-all"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <ChevronLeft size={15} style={{ color: "#fff" }} />
        </button>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.22em] mb-0.5" style={{ color: "#fff" }}>CATÁLOGO TÁCTICO</p>
          <h2 style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: "clamp(20px,6vw,26px)", lineHeight: 0.95, textTransform: "uppercase", letterSpacing: "-0.02em", color: "#fff" }}>
            BIBLIOTECA
          </h2>
        </div>
      </div>
      <div className="px-4 mb-4">
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
          style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Search size={14} strokeWidth={1.75} style={{ color: "#fff" }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="BUSCAR EJERCICIO..."
            className="flex-1 bg-transparent border-none outline-none"
            style={{ fontSize: "13px", fontFamily: DS, fontStyle: "italic", fontWeight: 700, letterSpacing: "0.04em", color: "#fff" }} />
          {query && (
            <button onClick={() => setQuery("")} className="cursor-pointer">
              <X size={13} style={{ color: "#fff" }} />
            </button>
          )}
        </div>
      </div>
      <div className="px-4 space-y-3">
        {filtered.map((ex, idx) => {
          const mg = getMgGrad(ex.muscle);
          return (
            <div key={idx} className="rounded-3xl overflow-hidden relative cursor-pointer active:scale-[0.98] transition-all"
              style={{ background: mg, border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 16px 40px -12px rgba(0,0,0,0.8)", minHeight: 72 }}>
              <img src={GYM_IMGS[idx % GYM_IMGS.length]} alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: 0.28, filter: "saturate(0.5)" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="relative z-10 p-4 flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest mb-1" style={{ color: "#fff" }}>{ex.muscle.toUpperCase()}</p>
                  <h3 style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: "clamp(18px,5.5vw,22px)", textTransform: "uppercase", letterSpacing: "-0.02em", color: "#fff" }}>
                    {ex.name}
                  </h3>
                  <p className="text-[10px] mt-1 tabular-nums" style={{ color: "#CEFF00" }}>{ex.sets} series · {ex.reps}</p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <div className="px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(206,255,0,0.1)", border: "1px solid rgba(206,255,0,0.25)" }}>
                    <span className="text-[8px] font-black uppercase" style={{ color: "#CEFF00" }}>STRENGTH {ex.strength.toString().padStart(2,"0")}</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(0,240,255,0.08)", border: "1px solid rgba(0,240,255,0.2)" }}>
                    <span className="text-[8px] font-black uppercase" style={{ color: "#00F0FF" }}>MOBILITY {ex.mobility.toString().padStart(2,"0")}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-10">
            <Search size={28} strokeWidth={1} style={{ color: "rgba(255,255,255,0.1)" }} />
            <p className="text-[12px]" style={{ color: "#fff" }}>Sin resultados para &ldquo;{query}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ opacity: animating ? 0 : 1, transform: animating ? "translateY(8px)" : "translateY(0)", transition: "opacity 0.16s ease, transform 0.16s ease" }}>
      {wView === "lobby"   && LobbyView}
      {wView === "focus"   && FocusView}
      {wView === "library" && LibraryView}
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
  { id: "today",    label: "Dieta",    icon: Utensils },
  { id: "progress", label: "Progreso", icon: TrendingUp },
  { id: "squads",   label: "Workout",  icon: Dumbbell },
  { id: "profile",  label: "Perfil",   icon: User },
];

function BottomNav({ active, onChange, onSignOut }: {
  active: TabId;
  onChange: (t: TabId) => void;
  onSignOut: () => void;
}) {
  const DS = "var(--font-display,'Barlow Condensed',sans-serif)";
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="flex items-center gap-1 px-3 rounded-full w-full max-w-md mx-auto"
        style={{
          background: "rgba(9,9,11,0.82)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.04)",
          height: 70,
          boxShadow: "0 8px 40px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.02)",
        }}>
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          if (isActive) return (
            <button key={id} onClick={() => onChange(id)}
              className="w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all shrink-0"
              style={{ background: "#CEFF00", boxShadow: "0 0 16px rgba(206,255,0,0.28)" }}>
              <Icon size={22} strokeWidth={2.5} style={{ color: "#000" }} />
            </button>
          );
          return (
            <button key={id} onClick={() => onChange(id)}
              className="flex flex-col items-center justify-center gap-0.5 cursor-pointer active:opacity-60 transition-all flex-1 py-2"
              style={{ minWidth: 48 }}>
              <Icon size={19} strokeWidth={1.5} style={{ color: "#808080" }} />
              <span style={{ fontFamily: DS, fontWeight: 900, fontStyle: "normal", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.06em", color: "#808080" }}>
                {label}
              </span>
            </button>
          );
        })}
        <button onClick={onSignOut}
          className="flex flex-col items-center justify-center gap-0.5 cursor-pointer active:opacity-50 transition-all flex-1 py-2"
          style={{ minWidth: 48 }}>
          <LogOut size={19} strokeWidth={1.5} style={{ color: "#808080" }} />
          <span style={{ fontFamily: DS, fontWeight: 900, fontStyle: "normal", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.06em", color: "#808080" }}>
            Salir
          </span>
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   GLOBAL HEADER
══════════════════════════════════════════════════════════════ */

function GlobalHeader({ student }: { student: Student }) {
  const DS = "var(--font-display,'Barlow Condensed',sans-serif)";
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-3 sticky top-0 z-40"
      style={{ background: "rgba(7,7,8,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
      <div className="flex items-center gap-2">
        <Zap size={14} fill="#CEFF00" stroke="none" />
        <span style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: "clamp(16px,4.8vw,19px)", letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff" }}>MYCOACH</span>
      </div>
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-black shrink-0"
        style={{ background: student.avatarColor ?? "#CEFF00", border: "2px solid #CEFF00", color: "#000", fontFamily: DS, letterSpacing: "0.02em" }}>
        {student.avatarInitials}
      </div>
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

  // Shared hydration state (cross-tab)
  const [waterMl, setWaterMl] = useState(0);
  const addWater = () => setWaterMl(w => Math.min(w + 250, 4000));

  // Workout focus mode (hides global header during exercise focus view)
  const [workoutFocusMode, setWorkoutFocusMode] = useState(false);

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
      <div className="w-full min-h-screen relative overflow-x-hidden flex flex-col" style={{ background: "#070708" }}>

        {/* Global brand header — hidden during workout focus */}
        {!workoutFocusMode && <GlobalHeader student={student} />}

        {/* Tab content */}
        <div
          className="flex-1 px-4 pb-24"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? "translateY(6px)" : "translateY(0)",
            transition: "opacity 0.18s ease, transform 0.18s ease",
          }}
        >
          {activeTab === "today" && (
            <TabHoy student={student} detail={detail} meals={meals} day={day}
              onMealOpen={setActiveMeal}
              onExerciseOpen={setActiveExercise}
              waterMl={waterMl}
              onAddWater={addWater} />
          )}
          {activeTab === "progress" && (
            <TabProgreso student={student} detail={detail} startWeight={startWeight}
              onBadge={() => downloadBadge({ name: student.name, photoUrl: detail.photoName, currentWeight: student.currentWeight, startWeight, streak: student.streak, height: detail.height, bodyFat: detail.bodyFat, stage: `${student.stage} · E${student.stageNumber}`, weightHistory: detail.weightHistory })} />
          )}
          {activeTab === "squads" && (
            <TabWorkout day={day} student={student}
              waterMl={waterMl}
              onAddWater={addWater}
              onFocusMode={setWorkoutFocusMode} />
          )}
          {activeTab === "profile" && (
            <TabPerfil student={student} detail={detail} onCancelRequest={openCancelSheet} />
          )}
        </div>

        {/* Floating food substitution FAB — nutrition tab only */}
        {activeTab === "today" && (
          <button
            className="fixed bottom-[100px] right-5 w-14 h-14 rounded-full flex items-center justify-center z-40 cursor-pointer active:scale-90 transition-all"
            style={{
              background: "rgba(9,9,11,0.85)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(206,255,0,0.22)",
              boxShadow: "0 8px 28px rgba(0,0,0,0.55), 0 0 14px rgba(206,255,0,0.08)",
            }}
            onClick={() => meals[0] && setActiveMeal(meals[0])}
          >
            <ArrowLeftRight size={20} style={{ color: "#CEFF00" }} />
          </button>
        )}

        {/* Bottom nav */}
        <BottomNav
          active={activeTab}
          onChange={switchTab}
          onSignOut={() => signOut({ callbackUrl: "/login" })}
        />

      {/* Sheets */}
      <BottomSheet open={!!activeMeal} onClose={() => setActiveMeal(null)}>
        {activeMeal && <MealSheet meal={activeMeal} waterMl={waterMl} />}
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

      </div>{/* end viewport shell */}
    </div>
  );
}
