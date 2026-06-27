"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { signOut } from "next-auth/react";
import {
  Flame, Ruler, Droplet, LogOut, Camera, Loader2, CheckCircle2, Check,
  Download, TrendingDown, Dumbbell, Utensils, ChevronRight, ChevronLeft, X,
  ArrowLeftRight, Info, Weight, BarChart3, RefreshCw,
  LayoutGrid, TrendingUp, Users, User, Sparkles, Zap, Search,
  Shield, CreditCard, Calendar, ChevronDown, ChevronUp,
  AlertTriangle, Settings, MessageSquare, Send, Heart, Printer, Lock,
  MapPin, Activity,
  Trophy, SlidersHorizontal, Plus, Bell, Pin,
} from "lucide-react";
import { Skeleton } from "@/components/skeleton";
import { downloadBadge } from "@/lib/badge";
import type { Student, StudentDetail, RoutineDay } from "@/lib/mock-data";

type Detail = StudentDetail & {
  height?: number;
  bodyFat?: number;
  photoName?: string;
  photos?: { id: string; url: string; label: string; weight: number | null; createdAt: string }[];
};
type TabId = "today" | "progress" | "squads" | "profile" | "community";

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
  calsPer100g?: number;
  fatPer100g?: number;
  icon?: string;
  photo?: string;
  note?: string;
  macroType?: "carb" | "protein";
}

const UP = (id: string) => `https://images.unsplash.com/photo-${id}?w=300&h=300&fit=crop&auto=format&q=80`;

const WATER_TARGET_ML = 3000;

// ── Cycle-date utilities (module-level so cycleDate() is usable outside PortalPage) ──
const BASE_DATE_MS    = new Date("2026-06-25T00:00:00Z").getTime();
const daysSinceBase   = () => Math.max(0, Math.floor((Date.now() - BASE_DATE_MS) / 86_400_000));
const currentCycleWeek = () => Math.floor(daysSinceBase() / 7);
const currentCycleDay  = () => (daysSinceBase() % 7) + 1;
const cycleDate = (dayIdx: number) =>
  new Date(BASE_DATE_MS + (currentCycleWeek() * 7 + dayIdx - 1) * 86_400_000)
    .toISOString().split("T")[0];

const EQUIV_CARBS: Equivalent[] = [
  { name: "Arroz blanco",    gramsPerCarb: 3.3,  calsPer100g: 130, fatPer100g: 0.3, icon: "rice",         photo: UP("1536304929831-ee1ca9d44906"), note: "Digestión rápida, post-entreno",  macroType:"carb" },
  { name: "Avena",           gramsPerCarb: 5.3,  calsPer100g: 389, fatPer100g: 6.9, icon: "oats",         photo: UP("1571068316344-75bc2b04e67b"), note: "Alta en beta-glucanos",           macroType:"carb" },
  { name: "Camote",          gramsPerCarb: 5.8,  calsPer100g:  86, fatPer100g: 0.1, icon: "sweet-potato", photo: UP("1596133322891-1f30a48df1af"), note: "Alto en potasio y vitamina A",    macroType:"carb" },
  { name: "Papa cocida",     gramsPerCarb: 6.25, calsPer100g:  77, fatPer100g: 0.1, icon: "potato",       photo: UP("1518977676601-b53f82aba655"), note: "Versátil y saciante",             macroType:"carb" },
  { name: "Tortilla de maíz",gramsPerCarb: 4.0,  calsPer100g: 218, fatPer100g: 4.0, icon: "tortilla",     photo: UP("1565299585323-38d6b0865b47"), note: "2 tortillas pequeñas por porción",macroType:"carb" },
  { name: "Pan integral",    gramsPerCarb: 4.35, calsPer100g: 247, fatPer100g: 3.5, icon: "bread",        photo: UP("1509440159596-0249088772ff"), note: "100% integral preferible",        macroType:"carb" },
  { name: "Plátano",         gramsPerCarb: 4.35, calsPer100g:  89, fatPer100g: 0.3, icon: "banana",       photo: UP("1571771894821-ce9b6c11b08e"), note: "Ideal pre-entreno",               macroType:"carb" },
];

const EQUIV_PROTEIN: Equivalent[] = [
  { name: "Pechuga de Pollo", gramsPerProtein: 4.5, calsPer100g: 165, fatPer100g:  3.6, icon: "chicken", photo: UP("1604503468506-a8da13d82791"), note: "Proteína magra #1",           macroType:"protein" },
  { name: "Carne magra",      gramsPerProtein: 5.0, calsPer100g: 250, fatPer100g: 12.0, icon: "beef",    photo: UP("1529694157872-7cc33244d072"), note: "Rica en zinc y B12",          macroType:"protein" },
  { name: "Atún en agua",     gramsPerProtein: 4.0, calsPer100g: 116, fatPer100g:  0.5, icon: "tuna",    photo: UP("1559847844-5315695dadae"),    note: "Omega-3 y bajo en grasa",     macroType:"protein" },
  { name: "Salmón",           gramsPerProtein: 5.3, calsPer100g: 208, fatPer100g: 13.0, icon: "fish",    photo: UP("1467003909585-2f8a72700288"), note: "Grasa saludable omega-3",     macroType:"protein" },
  { name: "Huevo entero",     gramsPerProtein: 8.0, calsPer100g: 155, fatPer100g: 11.0, icon: "egg",     photo: UP("1482049016688-2d3e1b311543"), note: "Proteína completa",           macroType:"protein" },
  { name: "Leche descremada", gramsPerProtein:10.0, calsPer100g:  34, fatPer100g:  0.1, icon: "milk",    photo: UP("1550583724-b2692b85b150"),    note: "Calcio + proteína",           macroType:"protein" },
  { name: "Lomo de Cerdo",    gramsPerProtein: 4.8, calsPer100g: 242, fatPer100g: 14.0, icon: "beef",    photo: UP("1432139555190-58524dae6a55"), note: "Alto en B1 y zinc",           macroType:"protein" },
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

function EquivCatalog({ ingredient, selected, onSelect, onConfirm, macroType }: {
  ingredient: Ingredient;
  selected: Equivalent | null;
  onSelect: (eq: Equivalent | null) => void;
  onConfirm?: () => void;
  macroType: "protein" | "carb";
}) {
  const DS = "var(--font-display,'Barlow Condensed',sans-serif)";
  const baseCarbs   = ingredient.macros?.carbs   ?? Math.round(ingredient.calories * 0.45 / 4);
  const baseProtein = ingredient.macros?.protein ?? Math.round(ingredient.calories * 0.25 / 4);
  const baseFat     = ingredient.macros?.fat     ?? Math.round(ingredient.calories * 0.30 / 9);

  const list = EQUIV_CATALOG.filter(e => e.macroType === macroType);

  const calcGrams = (eq: Equivalent) => {
    if (eq.macroType === "protein") return Math.round(baseProtein * (eq.gramsPerProtein ?? 5));
    return Math.round(baseCarbs * (eq.gramsPerCarb ?? 0));
  };
  const calcCalOffset = (eq: Equivalent) => {
    if (!eq.calsPer100g) return null;
    return Math.round(calcGrams(eq) * eq.calsPer100g / 100) - ingredient.calories;
  };
  const calcFatDelta = (eq: Equivalent) => {
    if (!eq.fatPer100g) return null;
    const newFat = Math.round((calcGrams(eq) * eq.fatPer100g / 100) * 10) / 10;
    return Math.round((newFat - baseFat) * 10) / 10;
  };
  const calcMatchPct = (eq: Equivalent) => {
    const target   = eq.macroType === "protein" ? baseProtein : baseCarbs;
    const divisor  = eq.macroType === "protein" ? (eq.gramsPerProtein ?? 5) : (eq.gramsPerCarb ?? 3.3);
    const delivered = Math.round(calcGrams(eq) / divisor);
    return Math.min(100, Math.round((delivered / Math.max(target, 1)) * 100));
  };
  const matchLabel = (pct: number) =>
    pct >= 98 ? "COINCIDENCIA PERFECTA 100%" : pct >= 90 ? `COINCIDENCIA ALTA ${pct}%` : `COINCIDENCIA PARCIAL ${pct}%`;

  const selMatch     = selected ? calcMatchPct(selected) : null;
  const selOffset    = selected ? calcCalOffset(selected) : null;
  const selFatDelta  = selected ? calcFatDelta(selected) : null;
  const selGrams     = selected ? calcGrams(selected) : null;

  return (
    <div style={{ animation: "fadeSlideIn 0.22s ease" }}>

      {/* ── HEADER: CONVERSIÓN AUTOMÁTICA + match badge ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] font-black uppercase tracking-[0.2em]"
            style={{ fontFamily: DS, color: "#CEFF00" }}>
            CONVERSIÓN AUTOMÁTICA
          </span>
          {selMatch !== null && (
            <span className="px-2 py-[3px] rounded-md text-[8px] font-black uppercase tracking-[0.1em]"
              style={{ fontFamily: DS, background: selMatch >= 98 ? "#CEFF00" : "rgba(255,255,255,0.08)", color: selMatch >= 98 ? "#000" : "#808080" }}>
              {matchLabel(selMatch)}
            </span>
          )}
        </div>
        {selected && (
          <button onClick={() => onSelect(null)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <RefreshCw size={9} style={{ color: "rgba(255,255,255,0.4)" }} />
            <span style={{ fontFamily: DS, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)" }}>
              RESET
            </span>
          </button>
        )}
      </div>

      {/* ── COMPARISON BLOCK ── */}
      {selected && selGrams !== null && (
        <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", animation: "fadeSlideIn 0.18s ease" }}>
          <div className="text-center flex-1">
            <p className="text-[8px] font-black uppercase tracking-[0.14em] mb-0.5" style={{ color: "#808080", fontFamily: DS }}>ORIGINAL</p>
            <p className="font-black text-white tabular-nums" style={{ fontFamily: DS, fontSize: 18, lineHeight: 1 }}>{ingredient.grams}g</p>
            <p className="text-[9px] mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.35)", fontFamily: DS, textTransform: "uppercase" }}>{ingredient.name}</p>
          </div>
          <ArrowLeftRight size={14} style={{ color: "#CEFF00", flexShrink: 0 }} />
          <div className="text-center flex-1">
            <p className="text-[8px] font-black uppercase tracking-[0.14em] mb-0.5" style={{ color: "#CEFF00", fontFamily: DS }}>SUSTITUTO</p>
            <p className="font-black tabular-nums" style={{ fontFamily: DS, fontSize: 18, lineHeight: 1, color: "#CEFF00" }}>{selGrams}g</p>
            <p className="text-[9px] mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.35)", fontFamily: DS, textTransform: "uppercase" }}>{selected.name}</p>
          </div>
        </div>
      )}

      {/* ── LOCKED CATEGORY LABEL ── */}
      <div className="flex items-center gap-2 mb-4">
        <div className="px-3 py-1.5 rounded-lg flex items-center gap-1.5"
          style={{ background: "rgba(206,255,0,0.08)", border: "1px solid rgba(206,255,0,0.18)" }}>
          <Zap size={9} fill="#CEFF00" stroke="none" />
          <span style={{ fontFamily: DS, fontWeight: 900, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "#CEFF00" }}>
            {macroType === "protein" ? "PROTEÍNA — FILTRO ACTIVO" : "CARBOHIDRATO — FILTRO ACTIVO"}
          </span>
        </div>
      </div>

      {/* ── HORIZONTAL CAROUSEL ── */}
      <div className="flex overflow-x-auto gap-4 pb-4 -mx-1 px-1 mb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}>
        {list.map((eq) => {
          const grams  = calcGrams(eq);
          const offset = calcCalOffset(eq);
          const match  = calcMatchPct(eq);
          const active = selected?.name === eq.name;
          const macroSub = eq.macroType === "protein"
            ? `${Math.round(grams / (eq.gramsPerProtein ?? 5))}g Prot`
            : `${Math.round(grams / (eq.gramsPerCarb ?? 3.3))}g Carb`;

          return (
            <button
              key={eq.name}
              onClick={() => onSelect(active ? null : eq)}
              className="w-[160px] bg-[#1A1A1A] rounded-2xl p-4 flex-shrink-0 border flex flex-col justify-between relative active:scale-95 transition-all duration-200"
              style={{
                borderColor: active ? "#CEFF00" : "rgba(255,255,255,0.04)",
                boxShadow: active ? "0 0 18px rgba(206,255,0,0.14)" : "none",
                minHeight: 160,
              }}>

              {/* Active check */}
              {active && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center z-10"
                  style={{ background: "#CEFF00" }}>
                  <Check size={10} strokeWidth={3} style={{ color: "#000" }} />
                </div>
              )}

              {/* Food photo */}
              <div className="w-14 h-14 rounded-xl overflow-hidden mb-3 mx-auto flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                {eq.photo
                  ? <img src={eq.photo} alt={eq.name} className="w-full h-full object-cover object-center rounded-xl"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  : <FoodIllu iconKey={eq.icon} size={56} />
                }
              </div>

              {/* Name + macro metric */}
              <div>
                <p className="font-bold text-white uppercase leading-tight mb-1"
                  style={{ fontFamily: DS, fontStyle: "normal", fontSize: "clamp(12px,3.5vw,14px)", letterSpacing: "0.03em" }}>
                  {eq.name}
                </p>
                <p className="text-[11px] font-black tabular-nums"
                  style={{ fontFamily: DS, fontStyle: "normal", color: "#00F0FF" }}>
                  {macroSub}
                </p>
                {/* Calorie offset chip */}
                {offset !== null && (
                  <span className="text-[9px] font-black mt-1 inline-block"
                    style={{ fontFamily: DS, color: offset <= 0 ? "#CEFF00" : "rgba(255,100,100,0.85)" }}>
                    {offset > 0 ? "+" : ""}{offset} kcal
                  </span>
                )}
                {/* Alignment label when active */}
                {active && (
                  <p className="text-[8px] font-black uppercase mt-0.5"
                    style={{ fontFamily: DS, letterSpacing: "0.1em", color: match >= 98 ? "#CEFF00" : "#808080" }}>
                    {matchLabel(match)}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── TELEMETRY GRID ── */}
      {selected && (
        <div className="grid grid-cols-2 gap-3 mb-4" style={{ animation: "fadeSlideIn 0.18s ease" }}>
          <div className="rounded-2xl p-3.5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-[#808080] font-mono text-[10px] uppercase tracking-widest mb-1.5">
              DIFERENCIA CALÓRICA
            </p>
            <p className="font-black tabular-nums"
              style={{ fontFamily: DS, fontStyle: "normal", fontSize: 22, lineHeight: 1, color: selOffset !== null ? (selOffset <= 0 ? "#CEFF00" : "rgba(255,100,100,0.9)") : "#808080" }}>
              {selOffset !== null ? `${selOffset > 0 ? "+" : ""}${selOffset}` : "—"}
            </p>
            <p className="text-[9px] mt-0.5 font-black uppercase tracking-[0.12em]" style={{ color: "#808080", fontFamily: DS }}>KCAL</p>
          </div>
          <div className="rounded-2xl p-3.5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-[#808080] font-mono text-[10px] uppercase tracking-widest mb-1.5">
              VARIANZA DE GRASA
            </p>
            <p className="font-black tabular-nums"
              style={{ fontFamily: DS, fontStyle: "normal", fontSize: 22, lineHeight: 1, color: selFatDelta !== null ? (selFatDelta <= 0 ? "#CEFF00" : "rgba(255,180,60,0.9)") : "#808080" }}>
              {selFatDelta !== null ? `${selFatDelta > 0 ? "+" : ""}${selFatDelta}` : "—"}
            </p>
            <p className="text-[9px] mt-0.5 font-black uppercase tracking-[0.12em]" style={{ color: "#808080", fontFamily: DS }}>GRAMOS</p>
          </div>
        </div>
      )}

      {/* ── CTA BUTTON ── */}
      {selected && (
        <button
          onClick={() => { onConfirm?.(); }}
          className="bg-[#CEFF00] text-black font-black uppercase py-4 rounded-xl tracking-wider w-full flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          style={{ fontFamily: DS, fontStyle: "normal", fontSize: "clamp(14px,4vw,16px)", letterSpacing: "0.14em", boxShadow: "0 0 28px rgba(206,255,0,0.22)" }}>
          CONFIRMAR SUSTITUCIÓN
          <Zap size={16} fill="#000" stroke="none" />
        </button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MEAL SHEET
══════════════════════════════════════════════════════════════ */

function MealSheet({ meal, waterMl, onConfirm }: { meal: Meal; waterMl: number; onConfirm?: () => void }) {
  const DS = "var(--font-display,'Barlow Condensed',sans-serif)";
  const macros = meal.macros ?? { protein: 32, carbs: 48, fat: 14 };
  const ingredients: Ingredient[] = meal.ingredients?.length ? meal.ingredients
    : meal.items.map((name, i) => ({
        name,
        grams: [250, 180, 120, 200, 150][i % 5],
        calories: Math.round(meal.calories / meal.items.length),
        icon: ["egg", "wheat", "beef", "salad", "chicken"][i % 5],
        unitQty: [1, 2, 1.5, 1, 1][i % 5],
        unit: ["pieza", "piezas", "tazas", "porción", "porción"][i % 5],
        macros: {
          protein: Math.round(macros.protein / meal.items.length),
          carbs:   Math.round(macros.carbs   / meal.items.length),
          fat:     Math.round(macros.fat     / meal.items.length),
        },
      }));

  const [swapDrawerIdx, setSwapDrawerIdx] = useState<number | null>(null);
  const [swaps, setSwaps]                = useState<Record<number, Equivalent | null>>({});

  const lockedMacroType = (idx: number): "protein" | "carb" => {
    const ing = ingredients[idx];
    const PROTEIN_ICONS = new Set(["egg","chicken","beef","tuna","fish","milk"]);
    const CARB_ICONS    = new Set(["oats","wheat","rice","sweet-potato","potato","tortilla","bread","banana","salad","corn"]);
    const PROTEIN_KEYS  = ["huevo","pollo","pechuga","carne","atun","salmon","cerdo","res","pescado","proteina","clara","albumina"];
    const CARB_KEYS     = ["avena","arroz","camote","papa","platano","tortilla","pan","maiz","yam","pasta","quinoa","frijol","lenteja"];
    const nameLower = ing.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (ing.icon && PROTEIN_ICONS.has(ing.icon)) return "protein";
    if (ing.icon && CARB_ICONS.has(ing.icon))    return "carb";
    if (PROTEIN_KEYS.some(k => nameLower.includes(k))) return "protein";
    if (CARB_KEYS.some(k   => nameLower.includes(k))) return "carb";
    const p = ing.macros?.protein ?? Math.round(macros.protein / ingredients.length);
    const c = ing.macros?.carbs   ?? Math.round(macros.carbs   / ingredients.length);
    return p >= c ? "protein" : "carb";
  };
  const [confirmed, setConfirmed] = useState(false);

  const heroImg  = getFoodImg(meal.name);
  const waterPct = Math.min(waterMl / WATER_TARGET_ML, 1);

  const H_MACROS = [
    { label: "PROT",  value: `${macros.protein}g`, color: "#00F0FF" },
    { label: "CARBS", value: `${macros.carbs}g`,   color: "#808080" },
    { label: "GRASA", value: `${macros.fat}g`,     color: "#808080" },
  ];

  return (
    <>
      {/* ── HERO: full-bleed with horizontal macro row ── */}
      <div className="relative -mx-5 mb-6 overflow-hidden" style={{ minHeight: 260 }}>
        <img src={heroImg} alt={meal.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.48 }} />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to top, #070708 0%, rgba(7,7,8,0.2) 60%, transparent 100%)" }} />

        <div className="relative z-10 px-5 pt-10 pb-6 flex flex-col justify-end" style={{ minHeight: 260 }}>
          <p className="text-[9px] font-black uppercase mb-2"
            style={{ fontFamily: DS, fontStyle: "normal", letterSpacing: "0.24em", color: "#CEFF00" }}>
            ELITE NUTRITION
          </p>
          <h2 style={{
            fontFamily: DS, fontWeight: 900, fontStyle: "italic",
            fontSize: "clamp(32px,9.5vw,44px)", lineHeight: 0.9,
            textTransform: "uppercase", letterSpacing: "0.03em", color: "#fff",
          }}>
            {meal.name}
          </h2>

          {/* Horizontal macro pill row */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {H_MACROS.map(({ label, value, color }) => (
              <div key={label}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl"
                style={{
                  background: "rgba(20,20,20,0.86)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}>
                <span style={{ fontFamily: DS, fontStyle: "normal", fontWeight: 900, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color }}>
                  {label}
                </span>
                <span style={{ fontFamily: DS, fontStyle: "normal", fontWeight: 900, fontSize: 15, color: "#fff" }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── COMPONENTES DE LA COMIDA ── */}
      <div className="flex items-center justify-between mb-4">
        <h3 style={{ fontFamily: DS, fontStyle: "normal", fontWeight: 900, fontSize: "clamp(14px,4.2vw,17px)", textTransform: "uppercase", letterSpacing: "0.04em", color: "#fff" }}>
          COMPONENTES DE LA COMIDA
        </h3>
        <span style={{ fontFamily: DS, fontStyle: "normal", fontWeight: 900, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#CEFF00" }}>
          BETA v2.4
        </span>
      </div>

      {/* ── INGREDIENT CARDS ── */}
      <div className="mb-5">
        {ingredients.map((ing, i) => {
          const swapped       = swaps[i];
          const isSub         = !!swapped;
          const ingProt       = ing.macros?.protein ?? Math.round(macros.protein / ingredients.length);
          const ingCarb       = ing.macros?.carbs   ?? Math.round(macros.carbs   / ingredients.length);
          const dispGrams     = swapped
            ? swapped.macroType === "protein"
              ? `${Math.round(ingProt * (swapped.gramsPerProtein ?? 5))}g`
              : `${Math.round(ingCarb * (swapped.gramsPerCarb ?? 3.3))}g`
            : `${ing.grams}g`;
          const dispName      = (swapped ? swapped.name : ing.name).toUpperCase();
          const subLabel      = isSub
            ? (swapped!.macroType === "protein" ? "BASE PROTEIN" : "BASE CARB")
            : `PROT ${ingProt}G · CARB ${ingCarb}G`;
          const amountDisplay = dispGrams;

          return (
            <div key={i}>

              {/* ── Standard Ingredient Card (template-exact) ── */}
              <div className="w-full bg-[#1A1A1A] rounded-[20px] p-4 flex items-center justify-between mb-3 border relative overflow-hidden"
                style={{
                  borderColor: isSub ? "#CEFF00" : "rgba(255,255,255,0.02)",
                  boxShadow: isSub ? "0 0 22px rgba(206,255,0,0.09)" : "none",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                }}>

                {/* SUSTITUYENDO badge */}
                {isSub && (
                  <div className="absolute top-2.5 right-3 z-10 px-2 py-[3px] rounded-md"
                    style={{ background: "#CEFF00" }}>
                    <span className="font-black" style={{ fontFamily: DS, fontStyle: "normal", fontSize: 7, letterSpacing: "0.18em", textTransform: "uppercase", color: "#000" }}>
                      SUSTITUYENDO
                    </span>
                  </div>
                )}

                {/* LEFT */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 border border-white/[0.06] flex-shrink-0 relative">
                    <img src={getIngrImg(ing.icon)} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#808080] font-mono tracking-widest uppercase">
                      {subLabel}
                    </span>
                    <span className="text-xl font-bold text-white uppercase tracking-tight"
                      style={{ fontFamily: DS, fontStyle: "normal", paddingTop: isSub ? 14 : 0 }}>
                      {dispName}
                    </span>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-white tracking-tight"
                    style={{ fontFamily: DS, fontStyle: "normal" }}>
                    {amountDisplay}
                  </span>
                  <div className="text-[#808080] p-1 opacity-40 hover:opacity-100 transition-opacity">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="9"  cy="5"  r="1"/><circle cx="9"  cy="12" r="1"/><circle cx="9"  cy="19" r="1"/>
                      <circle cx="15" cy="5"  r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Volt swap badge between rows */}
              {i < ingredients.length - 1 && (
                <div className="flex items-center justify-center py-0.5 -mt-1.5 z-10 relative">
                  <button
                    onClick={() => setSwapDrawerIdx(i)}
                    className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-all"
                    style={{
                      background: swapDrawerIdx === i ? "rgba(206,255,0,0.14)" : "#CEFF00",
                      border: swapDrawerIdx === i ? "2px solid #CEFF00" : "2px solid #070708",
                      boxShadow: "0 0 16px rgba(206,255,0,0.32), 0 2px 8px rgba(0,0,0,0.5)",
                    }}>
                    <ArrowLeftRight size={14} strokeWidth={2.5}
                      style={{ color: swapDrawerIdx === i ? "#CEFF00" : "#000" }} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── STATS ROW ── */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 rounded-2xl p-4 flex items-center gap-3"
          style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.02)" }}>
          <Flame size={18} style={{ color: "#CEFF00" }} />
          <div>
            <p className="font-black tabular-nums"
              style={{ fontFamily: DS, fontStyle: "normal", fontSize: 22, lineHeight: 1, color: "#fff" }}>
              {meal.calories}
            </p>
            <p style={{ fontFamily: DS, fontStyle: "normal", fontWeight: 900, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "#808080" }}>
              KCAL TOTAL
            </p>
          </div>
        </div>
        <div className="flex-1 rounded-2xl p-4 flex items-center gap-3"
          style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.02)" }}>
          <Droplet size={18} style={{ color: "#00F0FF" }} />
          <div>
            <p className="font-black tabular-nums"
              style={{ fontFamily: DS, fontStyle: "normal", fontSize: 22, lineHeight: 1, color: "#fff" }}>
              {waterMl}ml
            </p>
            <p style={{ fontFamily: DS, fontStyle: "normal", fontWeight: 900, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "#808080" }}>
              HIDRATACIÓN
            </p>
          </div>
        </div>
      </div>

      {/* Hydration track */}
      <div className="mb-5">
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(waterPct * 100, 2)}%`, background: "#CEFF00", boxShadow: "0 0 8px rgba(206,255,0,0.4)" }} />
        </div>
      </div>

      {/* ── CTA BUTTON ── */}
      <button
        onClick={() => { if (!confirmed) { setConfirmed(true); onConfirm?.(); } }}
        className="w-full py-5 rounded-2xl flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98] transition-all"
        style={{
          fontFamily: DS, fontStyle: "normal", fontWeight: 900,
          fontSize: "clamp(15px,4.5vw,18px)", letterSpacing: "0.14em",
          textTransform: "uppercase",
          background: confirmed ? "rgba(206,255,0,0.1)" : "#CEFF00",
          color: confirmed ? "#CEFF00" : "#000",
          border: confirmed ? "1px solid rgba(206,255,0,0.3)" : "none",
          boxShadow: confirmed ? "none" : "0 0 32px rgba(206,255,0,0.25)",
        }}>
        {confirmed
          ? <Check size={18} strokeWidth={3} />
          : <CheckCircle2 size={18} strokeWidth={2.5} />}
        {confirmed ? "COMIDA CONFIRMADA" : "CONFIRMAR COMIDA"}
      </button>

      {/* ── SWAP DRAWER PORTAL ── */}
      {swapDrawerIdx !== null && typeof document !== "undefined" && createPortal(
        <>
          {/* Scrim */}
          <div
            className="fixed inset-0 z-[70] bg-black/60"
            style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", animation: "bsFadeIn 0.2s ease" }}
            onClick={() => setSwapDrawerIdx(null)}
          />
          {/* Sheet */}
          <div
            className="fixed bottom-0 left-0 right-0 z-[80] w-full overflow-y-auto"
            style={{
              background: "rgba(7,7,8,0.98)",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderRadius: "32px 32px 0 0",
              maxHeight: "85vh",
              animation: "bsSlideUp 0.3s cubic-bezier(0.32,0.72,0,1)",
              paddingBottom: "calc(24px + env(safe-area-inset-bottom,0px))",
            }}>

            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-[3px] rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
            </div>

            <div className="px-6 pt-3 pb-6">
              {/* Header row */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="font-black uppercase" style={{ fontFamily: DS, fontStyle: "normal", fontSize: "clamp(16px,5vw,20px)", letterSpacing: "0.06em", color: "#fff" }}>
                    SUSTITUCIÓN
                  </p>
                  <p className="text-[10px] font-mono tracking-widest uppercase mt-0.5" style={{ color: "#808080" }}>
                    MOTOR DE CONVERSIÓN AUTOMÁTICA
                  </p>
                </div>
                <button
                  onClick={() => setSwapDrawerIdx(null)}
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <X size={15} style={{ color: "rgba(255,255,255,0.5)" }} />
                </button>
              </div>

              {/* Target ingredient pill */}
              <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="w-11 h-11 rounded-xl overflow-hidden bg-zinc-900 border border-white/[0.06] flex-shrink-0">
                  <img src={getIngrImg(ingredients[swapDrawerIdx].icon)} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-mono tracking-widest uppercase mb-0.5" style={{ color: "#808080" }}>
                    {lockedMacroType(swapDrawerIdx) === "protein" ? "PROTEÍNA" : "CARBOHIDRATO"} — BUSCANDO ALTERNATIVAS
                  </p>
                  <p className="font-bold uppercase truncate" style={{ fontFamily: DS, fontStyle: "normal", fontSize: 15, color: "#fff" }}>
                    {ingredients[swapDrawerIdx].name}
                  </p>
                </div>
              </div>

              {/* Catalog */}
              <EquivCatalog
                ingredient={ingredients[swapDrawerIdx]}
                macroType={lockedMacroType(swapDrawerIdx)}
                selected={swaps[swapDrawerIdx] ?? null}
                onSelect={eq => setSwaps(p => ({ ...p, [swapDrawerIdx!]: eq }))}
                onConfirm={() => setSwapDrawerIdx(null)}
              />
            </div>
          </div>
        </>,
        document.body
      )}
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
            {/* ● SEGUIMIENTO EN TIEMPO REAL pill */}
            <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-2 rounded-full"
              style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(16px)", border: "1px solid rgba(206,255,0,0.35)", boxShadow: "0 0 16px rgba(206,255,0,0.12)" }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#CEFF00", boxShadow: "0 0 6px rgba(206,255,0,0.8)" }} />
              <span className="text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: "#CEFF00" }}>SEGUIMIENTO EN TIEMPO REAL</span>
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
   ELITE PRINT TEMPLATE — Athletic-grade export document
   Free for ALL users regardless of membership tier.
   Replaces the legacy flat table layouts entirely.
══════════════════════════════════════════════════════════════ */

const PT_NF = "'Barlow Condensed','Arial Narrow',Arial,sans-serif";
const PT_MF = "'Courier New',Courier,monospace";

function PrintDocHeader({ studentName, stage, stageNumber, sectionTitle }: {
  studentName: string; stage: string; stageNumber: number; sectionTitle: string;
}) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", borderBottom:"3px solid #000", paddingBottom:"14px", marginBottom:"18px" }}>
      {/* Left: brand logo + subtitle + section badge */}
      <div style={{ flex:1 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"4px" }}>
          <span style={{ fontSize:"30px", lineHeight:1 }}>⚡</span>
          <span style={{ fontFamily:PT_NF, fontWeight:900, fontStyle:"italic", fontSize:"44px", letterSpacing:"0.01em", lineHeight:1, color:"#000", textTransform:"uppercase" }}>
            MYCOACH
          </span>
        </div>
        <p style={{ fontFamily:PT_MF, fontSize:"7px", letterSpacing:"0.24em", color:"#888", marginBottom:"10px", textTransform:"uppercase" }}>
          DISCIPLINA &nbsp;•&nbsp; CONSTANCIA &nbsp;•&nbsp; FE &nbsp;•&nbsp; ENFOQUE &nbsp;•&nbsp; RESULTADOS
        </p>
        <div style={{ display:"inline-flex", alignItems:"center", background:"#000", padding:"3px 12px 4px" }}>
          <span style={{ fontFamily:PT_NF, fontWeight:900, fontSize:"9.5px", letterSpacing:"0.22em", textTransform:"uppercase", color:"#fff" }}>
            {sectionTitle}
          </span>
        </div>
      </div>
      {/* Right: underlined data fields grid */}
      <div style={{ display:"flex", flexDirection:"column", gap:"8px", minWidth:"210px" }}>
        {([
          { label:"ATLETA",   val: studentName },
          { label:"OBJETIVO", val: stage },
          { label:"NIVEL",    val: `ETAPA ${stageNumber}` },
          { label:"COACH",    val: "" },
        ] as { label: string; val: string }[]).map(({ label, val }) => (
          <div key={label} style={{ display:"flex", alignItems:"baseline", gap:"6px", justifyContent:"flex-end" }}>
            <span style={{ fontFamily:PT_MF, fontSize:"7px", letterSpacing:"0.18em", color:"#999", textTransform:"uppercase", flexShrink:0 }}>
              {label}:
            </span>
            <span style={{ fontFamily:PT_NF, fontWeight:700, fontSize:"11.5px", borderBottom:"1px solid #000", minWidth:"128px", paddingBottom:"1px", display:"inline-block", color:"#000", letterSpacing:"0.03em" }}>
              {val || " "}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrintSummaryBar({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="pt-summary-bar" style={{ display:"flex", gap:"18px", flexWrap:"wrap", marginBottom:"16px", padding:"8px 14px", background:"#f0f0f0", borderLeft:"4px solid #000" }}>
      {items.map(({ label, value }) => (
        <div key={label} style={{ textAlign:"center" }}>
          <div style={{ fontFamily:PT_MF, fontSize:"6.5px", letterSpacing:"0.2em", color:"#888", textTransform:"uppercase", marginBottom:"2px" }}>{label}</div>
          <div style={{ fontFamily:PT_NF, fontWeight:900, fontSize:"17px", color:"#000", lineHeight:1 }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

function PrintDayBadge({ dayLabel, sub, isFirst }: { dayLabel: string; sub?: string; isFirst?: boolean }) {
  return (
    <div className="pt-day-badge" style={{ display:"flex", alignItems:"center", gap:"10px", background:"#1a1a1a", padding:"7px 10px", marginTop: isFirst ? 0 : "14px", marginBottom:"1px" }}>
      <span style={{ fontFamily:PT_NF, fontWeight:900, fontSize:"15px", letterSpacing:"0.12em", textTransform:"uppercase", color:"#fff", background:"#000", padding:"2px 9px 3px", lineHeight:"1.25", display:"inline-block" }}>
        {dayLabel}
      </span>
      {sub && (
        <span style={{ fontFamily:PT_NF, fontWeight:700, fontSize:"11px", letterSpacing:"0.08em", textTransform:"uppercase", color:"#ccc" }}>
          {sub}
        </span>
      )}
    </div>
  );
}

function PrintColHeaders({ cols }: { cols: string[] }) {
  return (
    <div className="pt-col-headers" style={{ display:"grid", gridTemplateColumns:"90px 1fr 90px 54px 1fr 70px", background:"#111", padding:"4px 0" }}>
      {cols.map((h, i) => (
        <div key={i} style={{ fontFamily:PT_MF, fontSize:"6.5px", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"#fff", padding:"0 6px", borderRight: i < cols.length - 1 ? "1px solid rgba(255,255,255,0.15)" : "none" }}>
          {h}
        </div>
      ))}
    </div>
  );
}

function PrintItemRow({ c1, c2, c3, c5, c6, alt }: {
  c1: string; c2: string; c3: string; c5: string; c6: string; alt: boolean;
}) {
  const cell: React.CSSProperties = { padding:"5px 7px", borderRight:"1px solid #e0e0e0", display:"flex", alignItems:"center" };
  return (
    <div style={{ display:"grid", gridTemplateColumns:"90px 1fr 90px 54px 1fr 70px", background: alt ? "#f7f7f7" : "#fff", borderBottom:"1px solid #eaeaea", minHeight:"42px" }}>
      <div style={cell}>
        <span style={{ fontFamily:PT_NF, fontWeight:900, fontSize:"9.5px", letterSpacing:"0.04em", textTransform:"uppercase", color:"#000", whiteSpace:"pre-line", lineHeight:"1.25" }}>{c1}</span>
      </div>
      <div style={{ ...cell }}>
        <span style={{ fontFamily:PT_NF, fontWeight:600, fontSize:"11px", color:"#000", letterSpacing:"0.01em" }}>{c2}</span>
      </div>
      <div style={cell}>
        <span style={{ fontFamily:PT_MF, fontSize:"9px", fontWeight:700, color:"#000", letterSpacing:"0.03em", whiteSpace:"pre-line", lineHeight:"1.3" }}>{c3}</span>
      </div>
      <div style={{ ...cell, justifyContent:"center" }}>
        <div style={{ width:"36px", height:"36px", border:"1.5px solid #ccc", borderRadius:"3px" }} />
      </div>
      <div style={cell}>
        <span style={{ fontFamily:"Arial,sans-serif", fontSize:"8px", color:"#555", lineHeight:"1.4" }}>{c5}</span>
      </div>
      <div style={{ ...cell, borderRight:"none" }}>
        <span style={{ fontFamily:PT_MF, fontSize:"9.5px", fontWeight:700, color:"#000", whiteSpace:"pre-line", lineHeight:"1.3" }}>{c6}</span>
      </div>
    </div>
  );
}

function PrintDocFooter() {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"18px", borderTop:"2px solid #000", paddingTop:"14px", marginTop:"22px" }}>
      {/* Left: intensity legend + hydration */}
      <div>
        <div style={{ fontFamily:PT_MF, fontSize:"6.5px", letterSpacing:"0.2em", color:"#888", textTransform:"uppercase", marginBottom:"8px" }}>
          LEYENDA DE INTENSIDAD
        </div>
        {([
          { dots:"●○○", label:"Moderada", range:"60–70% 1RM" },
          { dots:"●●○", label:"Alta",     range:"75–85% 1RM" },
          { dots:"●●●", label:"Máxima",   range:"90%+ 1RM"  },
        ] as { dots: string; label: string; range: string }[]).map(({ dots, label, range }) => (
          <div key={label} style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"5px" }}>
            <span style={{ fontFamily:PT_MF, fontSize:"11px", color:"#000", minWidth:"24px", letterSpacing:"0.05em" }}>{dots}</span>
            <span style={{ fontFamily:PT_NF, fontWeight:700, fontSize:"9.5px", textTransform:"uppercase", color:"#000", minWidth:"52px" }}>{label}</span>
            <span style={{ fontFamily:PT_MF, fontSize:"7.5px", color:"#777" }}>{range}</span>
          </div>
        ))}
        <div style={{ marginTop:"10px", borderTop:"1px solid #ddd", paddingTop:"8px" }}>
          <div style={{ fontFamily:PT_MF, fontSize:"6.5px", letterSpacing:"0.2em", color:"#888", textTransform:"uppercase", marginBottom:"5px" }}>HIDRATACIÓN</div>
          {[
            "2–4L de agua por sesión de entrenamiento",
            "Electrolitos en sesiones de más de 60 min",
            "No entrenes con déficit de hidratación",
          ].map((note, i) => (
            <div key={i} style={{ display:"flex", gap:"5px", marginBottom:"3px" }}>
              <span style={{ fontFamily:PT_MF, fontSize:"7.5px", color:"#aaa", flexShrink:0 }}>✦</span>
              <span style={{ fontFamily:"Arial,sans-serif", fontSize:"7.5px", color:"#555", lineHeight:"1.4" }}>{note}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Center: brand signature */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"5px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
          <span style={{ fontSize:"22px", lineHeight:1 }}>⚡</span>
          <span style={{ fontFamily:PT_NF, fontWeight:900, fontStyle:"italic", fontSize:"30px", letterSpacing:"0.02em", color:"#000", textTransform:"uppercase", lineHeight:1 }}>
            MYCOACH
          </span>
        </div>
        <div style={{ fontFamily:PT_MF, fontSize:"6px", letterSpacing:"0.28em", color:"#aaa", textTransform:"uppercase", textAlign:"center" }}>
          ELITE ATHLETIC SYSTEM
        </div>
      </div>
      {/* Right: motivational quote card */}
      <div className="pt-quote-card" style={{ background:"#000", padding:"16px", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <p style={{ fontFamily:PT_NF, fontWeight:900, fontStyle:"italic", fontSize:"13.5px", letterSpacing:"0.03em", textTransform:"uppercase", lineHeight:"1.38", color:"#fff", textAlign:"center", margin:0 }}>
          &ldquo;EL ÚNICO MAL ENTRENAMIENTO<br />ES EL QUE NO HICISTE.&rdquo;
        </p>
      </div>
    </div>
  );
}

function ElitePrintTemplate({ student, detail, meals }: {
  student: Student; detail: Detail; meals: Meal[];
}) {
  const totalCals   = meals.reduce((s, m) => s + m.calories, 0) || detail.diet?.totalCalories || 2800;
  const dietMacros  = detail.diet?.macros   ?? { protein:140, carbs:160, fat:50 };
  const dietName    = detail.diet?.name     ?? "Plan Nutricional";
  const routineDays = detail.routine?.days  ?? [];
  const routineName = detail.routine?.name  ?? "Rutina de Entrenamiento";
  const DAY_LBL     = ["LUNES","MARTES","MIÉRCOLES","JUEVES","VIERNES","SÁBADO","DOMINGO"];

  return (
    <div className="print-only" style={{ fontFamily:"Arial,sans-serif", color:"#000", background:"#fff" }}>

      {/* ══ SECTION 1: NUTRITION PLAN ══ */}
      <div style={{ padding:"22px 26px 20px", boxSizing:"border-box" }}>
        <PrintDocHeader
          studentName={student.name}
          stage={student.stage}
          stageNumber={student.stageNumber}
          sectionTitle={`Plan Nutricional — ${dietName}`}
        />
        <PrintSummaryBar items={[
          { label:"Calorías Totales", value:`${totalCals} kcal` },
          { label:"Proteína",         value:`${dietMacros.protein}g` },
          { label:"Carbohidratos",    value:`${dietMacros.carbs}g`   },
          { label:"Grasas",           value:`${dietMacros.fat}g`     },
          { label:"Comidas / Día",    value:`${meals.length}`        },
        ]} />

        {meals.length > 0 ? (
          <div>
            <PrintDayBadge dayLabel="PLAN DIARIO" sub={dietName} isFirst />
            <PrintColHeaders cols={["COMIDA · HORA","INGREDIENTE","MACROS","VISUAL","NOTAS DEL COACH","CALORÍAS"]} />
            {meals.flatMap((meal, i) => {
              const mac = meal.macros ?? { protein:0, carbs:0, fat:0 };
              const rows = meal.ingredients?.length
                ? meal.ingredients.map((ing: Ingredient) => {
                    const mp = ing.macros?.protein ?? Math.round(mac.protein / (meal.ingredients?.length ?? 1));
                    const mc = ing.macros?.carbs   ?? Math.round(mac.carbs   / (meal.ingredients?.length ?? 1));
                    return {
                      name: `★ ${ing.name}${ing.grams ? ` (${ing.grams}g)` : ""}`,
                      macro: `P:${mp}g\nC:${mc}g`,
                      cals:  `${ing.calories}\nkcal`,
                    };
                  })
                : meal.items.map((s: string) => ({ name:`★ ${s}`, macro:"Ver plan", cals:"" }));

              return rows.map((row, j) => (
                <PrintItemRow
                  key={`m${i}i${j}`}
                  c1={j === 0 ? `${meal.name.toUpperCase()}\n${meal.time}` : ""}
                  c2={row.name}
                  c3={row.macro}
                  c5={j === 0 ? `Total toma: ${meal.calories} kcal · P:${mac.protein}g · C:${mac.carbs}g · G:${mac.fat}g` : ""}
                  c6={j === 0 ? `${meal.calories}\nkcal` : row.cals}
                  alt={(i + j) % 2 === 1}
                />
              ));
            })}
          </div>
        ) : (
          <div style={{ padding:"24px", textAlign:"center", color:"#aaa", fontSize:"12px" }}>
            Sin plan nutricional asignado por el coach.
          </div>
        )}

        <PrintDocFooter />
      </div>

      {/* PAGE BREAK */}
      <div style={{ pageBreakAfter:"always" as React.CSSProperties["pageBreakAfter"] }} />

      {/* ══ SECTION 2: WORKOUT PLAN ══ */}
      <div style={{ padding:"22px 26px 20px", boxSizing:"border-box" }}>
        <PrintDocHeader
          studentName={student.name}
          stage={student.stage}
          stageNumber={student.stageNumber}
          sectionTitle={`Rutina — ${routineName}`}
        />
        <PrintSummaryBar items={[
          { label:"Nombre",       value: routineName.length > 18 ? routineName.slice(0,17)+"…" : routineName },
          { label:"Días/Semana",  value:`${detail.routine?.daysPerWeek ?? routineDays.length}` },
          { label:"Objetivo",     value: student.stage },
          { label:"Etapa",        value:`${student.stageNumber}` },
        ]} />

        {routineDays.length > 0 ? routineDays.map((rDay, di) => {
          const dayLabel = DAY_LBL[di] ?? (rDay as { day?: string }).day ?? `DÍA ${di + 1}`;
          return (
            <div key={di}>
              <PrintDayBadge
                dayLabel={dayLabel}
                sub={rDay.muscleGroup}
                isFirst={di === 0}
              />
              <PrintColHeaders cols={["DÍA · GRUPO","EJERCICIO","SERIES × REPS","VISUAL","TÉCNICA · COMENTARIOS","DESCANSO"]} />
              {rDay.exercises.map((ex, ei) => {
                const ext = ex as Exercise & { rest?: string; weight?: string; tips?: string[] };
                const c1  = ei === 0 ? `${dayLabel}\n${rDay.muscleGroup?.toUpperCase() ?? ""}` : "";
                const c3  = `${ex.sets} × ${ex.reps}${ext.weight && ext.weight !== "—" ? `\n${ext.weight}` : ""}`;
                const c5  = (ext.tips ?? [])[0]?.slice(0, 72) ?? "";
                return (
                  <PrintItemRow
                    key={ei}
                    c1={c1}
                    c2={`★ ${ex.name}`}
                    c3={c3}
                    c5={c5}
                    c6={ext.rest ?? "90s"}
                    alt={ei % 2 === 1}
                  />
                );
              })}
            </div>
          );
        }) : (
          <div style={{ padding:"24px", textAlign:"center", color:"#aaa", fontSize:"12px" }}>
            Sin rutina de entrenamiento asignada por el coach.
          </div>
        )}

        <PrintDocFooter />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   NOTIFICATION SYSTEM
   Phase 1 · 3: floating toasts (MealToast, WorkoutToast)
   Phase 2 · 4: full-screen milestone overlays
══════════════════════════════════════════════════════════════ */

function MealToast({ macros }: { macros: { protein: number; carbs: number; fat: number } }) {
  const DS = "var(--font-display,'Barlow Condensed',sans-serif)";
  if (typeof document === "undefined") return null;
  return createPortal(
    <div style={{ position: "fixed", top: 20, left: 0, right: 0, zIndex: 9999, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ pointerEvents: "auto", background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.9)", padding: "14px 16px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "14px", maxWidth: "380px", width: "calc(100vw - 32px)", animation: "mc-toast-lifecycle 2s cubic-bezier(0.16,1,0.3,1) forwards" }}>
        <div style={{ flexShrink: 0, position: "relative", width: 46, height: 46 }}>
          <svg width="46" height="46" viewBox="0 0 46 46">
            <polygon points="23,2 42,12 42,34 23,44 4,34 4,12" fill="#CEFF00"
              style={{ filter: "drop-shadow(0 0 8px rgba(206,255,0,0.5))" }} />
          </svg>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle2 size={20} strokeWidth={3} style={{ color: "#000" }} />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: DS, fontWeight: 900, fontSize: "17px", letterSpacing: "0.04em", textTransform: "uppercase", color: "#fff", lineHeight: 1.1, marginBottom: "2px" }}>MISIÓN CUMPLIDA</p>
          <p style={{ fontFamily: "'Courier New',monospace", fontSize: "8.5px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#CEFF00", marginBottom: "7px" }}>COMIDA REGISTRADA</p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontFamily: "'Courier New',monospace", fontSize: "8px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.07em" }}>
              P: {macros.protein}g &nbsp;|&nbsp; C: {macros.carbs}g &nbsp;|&nbsp; G: {macros.fat}g
            </span>
            <span style={{ background: "rgba(206,255,0,0.1)", border: "1px solid rgba(206,255,0,0.25)", borderRadius: "6px", padding: "1px 7px", fontFamily: "'Courier New',monospace", fontSize: "7.5px", letterSpacing: "0.1em", color: "#CEFF00", fontWeight: 700 }}>100% OK</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function DietCompleteModal({ onClose, totalCals, macros }: {
  onClose: () => void;
  totalCals: number;
  macros: { protein: number; carbs: number; fat: number };
}) {
  const DS = "var(--font-display,'Barlow Condensed',sans-serif)";
  const R = 80, CIRC = 2 * Math.PI * R;
  if (typeof document === "undefined") return null;
  return createPortal(
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#070708", zIndex: 9998, overflowY: "auto", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", textAlign: "center", padding: "32px 20px 48px" }}>
      {/* Header */}
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "16px" }}>
          <div style={{ height: 1, flex: 1, background: "linear-gradient(to right, transparent, #CEFF00)" }} />
          <span style={{ fontFamily: "'Courier New',monospace", fontSize: "8.5px", letterSpacing: "0.22em", textTransform: "uppercase", color: "#CEFF00" }}>PROTOCOLO DIARIO</span>
          <div style={{ height: 1, flex: 1, background: "linear-gradient(to left, transparent, #CEFF00)" }} />
        </div>
        <h1 style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: "clamp(28px,8vw,40px)", textTransform: "uppercase", letterSpacing: "0.02em", color: "#fff", lineHeight: 1, marginBottom: "8px" }}>
          OBJETIVO DIARIO<br />ALCANZADO
        </h1>
      </div>
      {/* Radial gauge at 100% */}
      <div style={{ position: "relative", width: 200, height: 200, margin: "8px auto" }}>
        <svg width={200} height={200} viewBox="0 0 200 200" style={{ transform: "rotate(-90deg)" }}>
          <defs>
            <linearGradient id="dcGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="100%" stopColor="#CEFF00" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          <circle cx="100" cy="100" r={R} fill="none" stroke="url(#dcGaugeGrad)" strokeWidth="10"
            strokeLinecap="round" strokeDasharray={`${CIRC} 0`}
            style={{ filter: "drop-shadow(0 0 8px rgba(206,255,0,0.6))" }} />
        </svg>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px" }}>
          <span style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: "44px", color: "#fff", lineHeight: 1 }}>100%</span>
          <span style={{ fontFamily: "'Courier New',monospace", fontSize: "7px", letterSpacing: "0.18em", color: "#CEFF00", textTransform: "uppercase" }}>STATUS: ELITE</span>
          <span style={{ fontFamily: "'Courier New',monospace", fontSize: "6.5px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>PREMIUM SYNCHRONIZED</span>
        </div>
      </div>
      {/* Summary */}
      <p style={{ fontFamily: DS, fontSize: "15px", color: "rgba(255,255,255,0.55)", letterSpacing: "0.02em", maxWidth: 320, lineHeight: 1.5, margin: "12px auto" }}>
        Has cumplido con tu protocolo nutricional al 100%.<br />Recuperación optimizada.
      </p>
      {/* Three telemetry rings */}
      <div style={{ display: "flex", gap: "20px", justifyContent: "center", margin: "16px auto" }}>
        {([
          { value: `${(totalCals / 1000).toFixed(1)}k`, label: "KCAL", color: "#CEFF00", icon: false },
          { value: `${macros.protein}g`,                 label: "PROT", color: "#00F0FF", icon: false },
          { value: "",                                    label: "OK",   color: "#4ade80", icon: true  },
        ] as { value: string; label: string; color: string; icon: boolean }[]).map((item, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", border: `2px solid ${item.color}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 12px ${item.color}44` }}>
              {item.icon
                ? <CheckCircle2 size={24} strokeWidth={2} style={{ color: item.color }} />
                : <span style={{ fontFamily: DS, fontWeight: 900, fontSize: "18px", color: item.color, lineHeight: 1 }}>{item.value}</span>
              }
            </div>
            <span style={{ fontFamily: "'Courier New',monospace", fontSize: "7.5px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>{item.label}</span>
          </div>
        ))}
      </div>
      {/* Footer */}
      <div style={{ width: "100%", maxWidth: 420, marginTop: "20px" }}>
        <p style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: "clamp(14px,4vw,18px)", textTransform: "uppercase", letterSpacing: "0.04em", color: "#CEFF00", lineHeight: 1.3, textShadow: "0 0 20px rgba(206,255,0,0.4)", marginBottom: "20px" }}>
          TU CONSISTENCIA ES TU SUPERPODER.<br />MANTENTE EN LA MISIÓN.
        </p>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "14px 28px", fontFamily: DS, fontWeight: 900, fontSize: "14px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", margin: "0 auto" }}>
          <X size={14} /> CONTINUAR
        </button>
      </div>
    </div>,
    document.body
  );
}

function WorkoutToast() {
  const DS = "var(--font-display,'Barlow Condensed',sans-serif)";
  if (typeof document === "undefined") return null;
  return createPortal(
    <div style={{ position: "fixed", top: 20, left: 0, right: 0, zIndex: 9999, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ pointerEvents: "auto", background: "rgba(0,15,20,0.96)", border: "1px solid rgba(0,240,255,0.15)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.9)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", padding: "14px 16px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "14px", maxWidth: "380px", width: "calc(100vw - 32px)", animation: "mc-toast-lifecycle 2s cubic-bezier(0.16,1,0.3,1) forwards" }}>
        <div style={{ width: 44, height: 44, borderRadius: "12px", background: "rgba(0,240,255,0.08)", border: "1px solid rgba(0,240,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 12px rgba(0,240,255,0.2)" }}>
          <Dumbbell size={20} strokeWidth={2} style={{ color: "#00F0FF" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: DS, fontWeight: 900, fontSize: "17px", letterSpacing: "0.04em", textTransform: "uppercase", color: "#fff", lineHeight: 1.1, marginBottom: "2px" }}>MÓDULO COMPLETADO</p>
          <p style={{ fontFamily: "'Courier New',monospace", fontSize: "8.5px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#00F0FF" }}>SERIE REGISTRADA CORRECTAMENTE</p>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Count-up animation: interpolates 0 → target over `duration` ms with ease-out cubic.
function useCountUp(target: number, duration = 1000): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function WorkoutCompleteModal({ onClose, durationStr, exerciseCount }: {
  onClose: () => void;
  durationStr: string;
  exerciseCount: number;
}) {
  const DS = "var(--font-display,'Barlow Condensed',sans-serif)";
  const MONO = "'Courier New',monospace";
  const CARD: React.CSSProperties = {
    background: "#111",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "22px",
    padding: "20px 16px",
  };

  // Progressive counters — kcal estimated at ~8 kcal/exercise, intensity fixed aesthetic
  const kcal      = useCountUp(exerciseCount * 8);
  const intensity = useCountUp(Math.min(60 + exerciseCount * 2, 99));

  // VO2 bar animates from 0→72% on mount
  const [barW, setBarW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setBarW(72), 80); return () => clearTimeout(t); }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="animate-mc-overlay-in"
      style={{
        position: "fixed", inset: 0, background: "#070708",
        zIndex: 9998, overflowY: "auto",
      }}
    >
      <div style={{ maxWidth: 440, margin: "0 auto", padding: "28px 16px 0", display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className="animate-mc-slide-up-0" style={{ textAlign: "center", marginBottom: "24px" }}>
          {/* Brand mark */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "16px" }}>
            <Zap size={13} fill="#CEFF00" stroke="none" />
            <span style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: "14px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff" }}>
              MYCOACH
            </span>
          </div>

          {/* Session badge */}
          <div style={{ display: "inline-flex", alignItems: "center", background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.28)", borderRadius: "9999px", padding: "5px 16px", marginBottom: "16px" }}>
            <span style={{ fontFamily: MONO, fontSize: "8px", letterSpacing: "0.22em", textTransform: "uppercase", color: "#f87171" }}>• RESUMEN DE SESIÓN</span>
          </div>

          {/* Massive title */}
          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: "clamp(44px,13vw,64px)", textTransform: "uppercase", letterSpacing: "-0.01em", color: "#CEFF00", lineHeight: 0.86 }}>
              ENTRENAMIENTO
            </div>
            <div style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: "clamp(44px,13vw,64px)", textTransform: "uppercase", letterSpacing: "-0.01em", color: "#fff", lineHeight: 0.86 }}>
              FINALIZADO
            </div>
          </div>

          {/* Volt badge */}
          <div style={{ display: "inline-block", background: "#CEFF00", padding: "11px 28px", borderRadius: "14px", boxShadow: "0 0 32px rgba(206,255,0,0.4), 0 0 8px rgba(206,255,0,0.2)" }}>
            <span style={{ fontFamily: DS, fontWeight: 900, fontSize: "19px", fontStyle: "italic", letterSpacing: "0.12em", textTransform: "uppercase", color: "#000" }}>
              LÍMITE SUPERADO
            </span>
          </div>
        </div>

        {/* ── STATS BENTO (2-col) ─────────────────────────────────────── */}
        <div className="animate-mc-slide-up-1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          {/* Calories */}
          <div style={CARD}>
            <Flame size={20} strokeWidth={1.5} style={{ color: "#CEFF00", marginBottom: "14px" }} />
            <p style={{ fontFamily: MONO, fontSize: "7.5px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: "6px" }}>CALORÍAS</p>
            <p style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: "48px", color: "#CEFF00", lineHeight: 1 }}>{kcal}</p>
            <p style={{ fontFamily: MONO, fontSize: "7px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginTop: "4px" }}>KCAL QUEMADAS</p>
          </div>
          {/* Intensity */}
          <div style={CARD}>
            <BarChart3 size={20} strokeWidth={1.5} style={{ color: "#00F0FF", marginBottom: "14px" }} />
            <p style={{ fontFamily: MONO, fontSize: "7.5px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: "6px" }}>PICO</p>
            <p style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: "48px", color: "#00F0FF", lineHeight: 1 }}>{intensity}%</p>
            <p style={{ fontFamily: MONO, fontSize: "7px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginTop: "4px" }}>NIVEL INTENSIDAD</p>
          </div>
        </div>

        {/* ── VO2 MAX BLOCK ───────────────────────────────────────────── */}
        <div className="animate-mc-slide-up-2" style={{ ...CARD, border: "1px solid rgba(0,240,255,0.14)", marginBottom: "12px" }}>
          <p style={{ fontFamily: MONO, fontSize: "7.5px", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: "12px" }}>
            PROGRESIÓN VO2 MAX
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <p style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: "52px", color: "#fff", lineHeight: 1 }}>54.2</p>
            <div style={{ background: "rgba(52,211,153,0.09)", border: "1px solid rgba(52,211,153,0.28)", borderRadius: "12px", padding: "7px 14px", textAlign: "center" }}>
              <span style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: "15px", letterSpacing: "0.06em", color: "#34d399" }}>+2.4 INCREMENTO</span>
            </div>
          </div>
          {/* Animated bar */}
          <div style={{ height: "7px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${barW}%`,
              background: "linear-gradient(90deg,#00F0FF,#CEFF00)",
              borderRadius: "4px",
              boxShadow: "0 0 10px rgba(0,240,255,0.55)",
              transition: "width 1.1s cubic-bezier(0.16,1,0.3,1)",
            }} />
          </div>
          <p style={{ fontFamily: MONO, fontSize: "7px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)", marginTop: "8px" }}>
            72% HACIA SIGUIENTE UMBRAL ÉLITE
          </p>
        </div>

        {/* ── RECORD BADGES ───────────────────────────────────────────── */}
        <div className="animate-mc-slide-up-3" style={{ marginBottom: "24px" }}>
          <p style={{ fontFamily: MONO, fontSize: "7.5px", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: "12px" }}>
            🏆 INSIGNIAS DE RÉCORD
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
            {([
              { label: "PESO\nBANCA",        delta: "+15 KG" },
              { label: "PRESS\nINCLINADO",   delta: "+10 KG" },
              { label: "SENTA-\nDILLA",      delta: "+5 KG"  },
            ] as { label: string; delta: string }[]).map(({ label, delta }) => (
              <div key={label} style={{ ...CARD, padding: "18px 10px", textAlign: "center" }}>
                <p style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: "26px", color: "#CEFF00", lineHeight: 1, marginBottom: "9px" }}>
                  {delta}
                </p>
                <p style={{ fontFamily: MONO, fontSize: "7px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Spacer so footer sticks to bottom */}
        <div style={{ flex: 1, minHeight: "16px" }} />

        {/* ── FOOTER CTA ──────────────────────────────────────────────── */}
        <div className="animate-mc-slide-up-4" style={{ position: "sticky", bottom: 0, padding: "16px 0 40px", background: "linear-gradient(to bottom, rgba(7,7,8,0) 0%, #070708 38%)" }}>
          <button
            onClick={onClose}
            className="w-full bg-[#CEFF00] text-black font-black uppercase py-4 rounded-xl text-center shadow-md"
            style={{ fontFamily: DS, fontStyle: "italic", fontSize: "18px", letterSpacing: "0.14em", cursor: "pointer", border: "none", boxShadow: "0 0 36px rgba(206,255,0,0.3), 0 4px 16px rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            CERRAR RESUMEN
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}

/* ══════════════════════════════════════════════════════════════
   TAB: HOY
══════════════════════════════════════════════════════════════ */

function TabHoy({
  student, detail, meals, day,
  onMealOpen, onExerciseOpen,
  waterMl, onAddWater,
  checkedMeals, onToggleMeal,
  activeDayIndex, onAdvanceDay,
}: {
  student: Student; detail: Detail; meals: Meal[];
  day: RoutineDay | undefined;
  onMealOpen: (m: Meal) => void;
  onExerciseOpen: (e: Exercise & { muscleGroup?: string }) => void;
  waterMl: number;
  onAddWater: () => void;
  checkedMeals: Set<number>;
  onToggleMeal: (i: number) => void;
  activeDayIndex: number;
  onAdvanceDay: (delta: number) => void;
}) {
  void detail; void day; void onExerciseOpen;
  const DS   = "var(--font-display,'Barlow Condensed',sans-serif)";
  const MONO = "'Courier New',monospace";

  const totalTarget   = meals.reduce((s, m) => s + m.calories, 0) || 2800;
  const totalConsumed = meals.reduce((s, m, i) => s + (checkedMeals.has(i) ? m.calories : 0), 0);
  const caloricPct    = Math.min(totalConsumed / Math.max(totalTarget, 1), 1);
  const remaining     = Math.max(totalTarget - totalConsumed, 0);
  const waterTarget   = WATER_TARGET_ML;
  const isDayPerfect  = meals.length > 0 && checkedMeals.size === meals.length;

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

      {/* ── NUTRICIÓN HEADER + DAY SWITCHER ── */}
      <div
        className={`mb-4 rounded-2xl px-3 pt-3 pb-2 border transition-all duration-500 ease-out${
          isDayPerfect
            ? " scale-[1.02] shadow-[0_0_30px_rgba(206,255,0,0.15)]"
            : " border-transparent"
        }`}
        style={isDayPerfect ? { borderColor: "rgba(206,255,0,0.4)" } : undefined}>
        <div className="flex items-center justify-between mb-1 no-print">
          {/* Day carousel */}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => onAdvanceDay(-1)} disabled={activeDayIndex <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-xl active:scale-90 transition-transform"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", cursor: activeDayIndex <= 1 ? "not-allowed" : "pointer", opacity: activeDayIndex <= 1 ? 0.3 : 1 }}>
              <ChevronLeft size={14} style={{ color: "#fff" }} />
            </button>
            <h2 style={{ fontFamily: DS, fontWeight: 900, fontStyle: "normal", fontSize: "clamp(22px,6.5vw,28px)", textTransform: "uppercase", letterSpacing: "-0.01em", color: "#fff", lineHeight: 1 }}>
              DÍA {activeDayIndex} · NUTRICIÓN
            </h2>
            <button onClick={() => onAdvanceDay(+1)} disabled={activeDayIndex >= 7}
              className="w-8 h-8 flex items-center justify-center rounded-xl active:scale-90 transition-transform"
              style={{ background: activeDayIndex >= 7 ? "rgba(255,255,255,0.03)" : "rgba(206,255,0,0.08)", border: activeDayIndex >= 7 ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(206,255,0,0.25)", cursor: activeDayIndex >= 7 ? "not-allowed" : "pointer", opacity: activeDayIndex >= 7 ? 0.3 : 1 }}>
              <ChevronRight size={14} style={{ color: activeDayIndex >= 7 ? "#808080" : "#CEFF00" }} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl active:opacity-70 transition-opacity"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Printer size={12} style={{ color: "#808080" }} />
              <span style={{ fontFamily: DS, fontStyle: "normal", fontWeight: 900, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#808080" }}>
                EXPORTAR
              </span>
            </button>
          </div>
        </div>

        {isDayPerfect && (
          <div className="mt-2 mb-1">
            <span
              className="animate-mc-hud-scan inline-flex items-center gap-1 font-mono font-black uppercase rounded-sm px-2.5 py-1"
              style={{
                background: "#CEFF00",
                color: "#000",
                fontSize: 8,
                letterSpacing: "0.1em",
                lineHeight: 1.2,
                boxShadow: "0 0 18px rgba(206,255,0,0.5)",
              }}>
              ⚡ DÍA PERFECTO COMPLETE
            </span>
          </div>
        )}

        <p className="text-[11px] mt-1" style={{ color: "#808080", fontFamily: MONO }}>
          Alimenta tu disciplina.{" "}
          <span style={{ color: "#fff", fontWeight: 600 }}>{remaining}</span> kcal restantes.
        </p>
        <div className="mt-3">
          <div className="flex justify-between mb-1.5">
            <span className="text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: "#808080" }}>
              {totalConsumed} KCAL CONSUMIDAS
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: "#808080" }}>
              {totalTarget} KCAL OBJETIVO
            </span>
          </div>
          <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "#1A1A1A" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${caloricPct * 100 || 2}%`, background: "linear-gradient(90deg, #00F0FF 0%, #CEFF00 100%)", boxShadow: "0 0 8px rgba(206,255,0,0.5)" }} />
          </div>
        </div>
      </div>

      {/* ── RACHA DE CONSISTENCIA CARD ── */}
      <div className="rounded-3xl flex items-center gap-4 px-5 py-4 mb-5"
        style={{ background: "#CEFF00" }}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(0,0,0,0.12)" }}>
          <Utensils size={20} strokeWidth={2.5} style={{ color: "#000" }} />
        </div>
        <div>
          <p style={{ fontFamily: DS, fontWeight: 900, fontStyle: "normal", fontSize: "clamp(18px,5.8vw,23px)", textTransform: "uppercase", letterSpacing: "0.04em", color: "#000", lineHeight: 1 }}>
            DÍA {activeDayIndex} DE RACHA · {student.streak} DÍAS TOTALES
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] mt-1" style={{ color: "rgba(0,0,0,0.42)", fontFamily: DS }}>
            RACHA ACTIVA · {new Date().toISOString().split("T")[0]}
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
                  <button onClick={(e) => { e.stopPropagation(); onToggleMeal(i); }}
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
          <span style={{ fontFamily: DS, fontWeight: 900, fontStyle: "normal", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#fff" }}>HIDRATACIÓN</span>
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
            <span style={{ fontSize: "13px", color: "#808080", marginLeft: 4 }}>/ 3.0 L</span>
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

type MealMacros = { protein: number; carbs: number; fat: number };

function TabProgreso({
  student, detail, startWeight, onBadge, prs, nutritionHistory, workoutHistory, checkedMeals, meals,
}: {
  student: Student;
  detail: Detail;
  startWeight: number;
  onBadge: () => void;
  prs: { squat: number; deadlift: number; bench: number };
  nutritionHistory: Record<number, Set<number>>;
  workoutHistory: Record<number, string[]>;
  checkedMeals: Set<number>;
  meals: Array<{ name: string; macros?: MealMacros }>;
}) {
  const DS   = "var(--font-display,'Barlow Condensed',sans-serif)";
  const MONO = "'Courier New',monospace";
  const diff = +(student.currentWeight - startWeight).toFixed(1);

  /* ── Historical check-in photo registry — live from DB, Unsplash fallback ── */
  type PhotoEntry = { photo: string; mes: string; angle: string };
  const VISUAL_LOG: PhotoEntry[] = (detail.photos ?? []).length > 0
    ? (detail.photos ?? []).map(p => ({
        photo: p.url,
        mes: new Date(p.createdAt).toLocaleDateString("es-MX", { month: "long", year: "numeric" }).toUpperCase(),
        angle: p.label || "FRONTAL",
      }))
    : [
        { photo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=700&fit=crop&auto=format&q=80", mes: "MES 1 · ENERO",  angle: "FRONTAL"   },
        { photo: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&h=700&fit=crop&auto=format&q=80", mes: "MES 1 · ENERO",  angle: "POSTERIOR" },
        { photo: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&h=700&fit=crop&auto=format&q=80", mes: "MES 2 · MARZO",  angle: "FRONTAL"   },
        { photo: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&h=700&fit=crop&auto=format&q=80", mes: "MES 2 · MARZO",  angle: "LATERAL"   },
        { photo: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&h=700&fit=crop&auto=format&q=80", mes: "MES 3 · JUNIO",  angle: "FRONTAL"   },
        { photo: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&h=700&fit=crop&auto=format&q=80", mes: "MES 3 · JUNIO",  angle: "POSTERIOR" },
      ];

  /* ── State ── */
  const [dayTab,          setDayTab]          = useState(2);
  const [isGalleryOpen,   setIsGalleryOpen]   = useState(false);
  const [isComparisonOpen,setIsComparisonOpen]= useState(false);
  const [beforeIdx,       setBeforeIdx]       = useState(0);
  const [afterIdx,        setAfterIdx]        = useState(Math.max(0, VISUAL_LOG.length - 1));
  const [barsReady,       setBarsReady]       = useState(false);
  useEffect(() => { const t = setTimeout(() => setBarsReady(true), 120); return () => clearTimeout(t); }, []);

  /* ── Weight chart SVG math (inverted: weight drop = ascending success curve) ── */
  const history = detail.weightHistory;
  const PW = 320, PH = 80, PAD = 10;
  const weights = history.map(h => h.weight);
  const minW = Math.min(...weights) - 0.8;
  const maxW = Math.max(...weights) + 0.8;
  // Inverted Y: low weight (fat-loss success) → top of SVG (low Y); high weight → bottom (high Y).
  // This maps a weight-loss timeline to an ascending left→right success curve.
  const toY = (w: number) => PAD + ((w - minW) / Math.max(maxW - minW, 0.01)) * (PH - PAD * 2);
  const toX = (i: number) => PAD + (i / Math.max(weights.length - 1, 1)) * (PW - PAD * 2);
  const pts  = weights.map((w, i) => `${toX(i).toFixed(1)},${toY(w).toFixed(1)}`);
  const linePath = `M ${pts.join(" L ")}`;
  // Area fills from the line DOWN to the bottom baseline — gradient (volt→transparent top-to-bottom)
  // renders the volt glow directly beneath the ascending line, growing as weight drops.
  const areaPath = `${linePath} L ${toX(weights.length - 1)},${PH - PAD} L ${toX(0)},${PH - PAD} Z`;
  const latestW = weights[weights.length - 1] ?? maxW;

  /* ── Biometric cards ── */
  const latest = detail.measurements[detail.measurements.length - 1];
  const prev   = detail.measurements[detail.measurements.length - 2];
  const bioCards = [
    { label: "BRAZO",   curr: latest?.armR   ?? 28.5, base: prev?.armR   ?? 28,   unit: "cm", goodIfPos: true  },
    { label: "CINTURA", curr: latest?.waist  ?? 68,   base: prev?.waist  ?? 71,   unit: "cm", goodIfPos: false },
    { label: "PECHO",   curr: latest?.chest  ?? 88,   base: prev?.chest  ?? 89,   unit: "cm", goodIfPos: true  },
    { label: "PIERNA",  curr: latest?.thighR ?? 55,   base: prev?.thighR ?? 55.5, unit: "cm", goodIfPos: true  },
  ];

  const DAY_TABS = ["LUN", "MAR", "MIÉ", "HOY"];

  /* ── Gallery overlay: group by month ── */
  const months = [...new Set(VISUAL_LOG.map(v => v.mes))];

  /* ── Comparison slot helpers ── */
  const cycleBefore = () => setBeforeIdx(i => (i + 1) % VISUAL_LOG.length);
  const cycleAfter  = () => setAfterIdx(i  => (i + 1) % VISUAL_LOG.length);
  const imgStyle: React.CSSProperties = { filter: "grayscale(0.45) brightness(0.82)" };

  /* ── Shared photo card sub-render ── */
  const PhotoCard = ({ entry, height = 300, width = 220 }: { entry: PhotoEntry; height?: number; width?: number }) => (
    <div className="rounded-2xl overflow-hidden relative flex-shrink-0 border border-white/[0.04]"
      style={{ width, height }}>
      <img src={entry.photo} alt={entry.angle}
        className="absolute inset-0 w-full h-full object-cover object-center" style={imgStyle} />
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 72%)" }} />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="font-mono uppercase mb-1" style={{ fontSize: 9, letterSpacing: "0.2em", color: "#CEFF00" }}>
          {entry.mes}
        </p>
        <p className="font-black italic uppercase leading-none"
          style={{ fontFamily: DS, fontSize: "clamp(20px,5.5vw,26px)", color: "#fff" }}>
          {entry.angle}
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col pb-24">

      {/* ── 1. PERFORMANCE HEADER ── */}
      <div className="pt-5 pb-6">
        <p className="font-mono uppercase mb-2" style={{ fontSize: 9, letterSpacing: "0.22em", color: "#CEFF00" }}>
          PERFORMANCE INTELLIGENCE
        </p>
        <h1 className="font-black italic uppercase leading-none"
          style={{ fontFamily: DS, fontSize: "clamp(30px,9vw,40px)", letterSpacing: "0.03em", color: "#fff" }}>
          ANÁLISIS DE<br />RENDIMIENTO
        </h1>
      </div>

      {/* ── 2. WEIGHT SUCCESS CURVE BENTO ── */}
      <div className="w-full bg-[#1A1A1A] rounded-[24px] p-5 mb-6 border border-white/[0.02] flex flex-col relative">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "#808080" }}>PROGRESO HACIA LA META</p>
            <p className="font-black leading-none" style={{ fontFamily: DS, fontStyle: "normal", fontSize: "clamp(28px,8vw,36px)", color: "#fff" }}>
              {student.currentWeight}
              <span style={{ fontSize: "clamp(15px,4vw,18px)", color: "rgba(255,255,255,0.45)", marginLeft: 4 }}>KG</span>
            </p>
            <p className="font-mono text-[8.5px] uppercase tracking-widest mt-0.5" style={{ color: "#808080" }}>
              Eficiencia de Quema ↑
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 mt-1">
            <div className="px-3 py-1.5 rounded-full flex-shrink-0"
              style={{ background: "#CEFF00", boxShadow: "0 0 14px rgba(206,255,0,0.35)" }}>
              <span className="font-mono font-bold text-xs" style={{ color: "#000", letterSpacing: "0.06em" }}>
                {diff < 0 ? `-${Math.abs(diff)}` : diff > 0 ? `+${diff}` : `${diff}`}kg TOTAL
              </span>
            </div>
            <span className="font-mono text-[7.5px] uppercase tracking-widest"
              style={{ color: diff < 0 ? "#CEFF00" : diff > 0 ? "#f87171" : "#808080" }}>
              {diff < 0 ? "▼ PÉRDIDA ACTIVA" : diff > 0 ? "▲ GANANCIA" : "— SIN CAMBIO"}
            </span>
          </div>
        </div>
        <div className="w-full relative" style={{ height: 80 }}>
          <svg viewBox={`0 0 ${PW} ${PH}`} preserveAspectRatio="none" className="w-full h-full" style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#CEFF00" stopOpacity="0.25" />
                <stop offset="60%"  stopColor="#CEFF00" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#CEFF00" stopOpacity="0" />
              </linearGradient>
              <filter id="chartGlow">
                <feGaussianBlur stdDeviation="2.5" result="b" />
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <path d={areaPath} fill="url(#wGrad)" />
            <path d={linePath} fill="none" stroke="#CEFF00" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" filter="url(#chartGlow)" />
            <circle cx={toX(weights.length - 1)} cy={toY(latestW)}
              r="4" fill="#CEFF00" filter="url(#chartGlow)" />
          </svg>
        </div>
        <div className="grid grid-cols-4 mt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {DAY_TABS.map((d, i) => (
            <button key={d} onClick={() => setDayTab(i)} className="py-3 text-center"
              style={{ borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <span className="font-black uppercase"
                style={{ fontFamily: DS, fontStyle: "normal", fontSize: 11, letterSpacing: "0.1em",
                  color: dayTab === i ? "#CEFF00" : "rgba(255,255,255,0.22)" }}>
                {d}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. BIOMETRIC MEASUREMENTS ── */}
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: "#808080" }}>
        MEDICIONES BIOMÉTRICAS
      </p>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {bioCards.map(({ label, curr, base, unit, goodIfPos }) => {
          const delta = +(curr - base).toFixed(1);
          const isGood = goodIfPos ? delta >= 0 : delta <= 0;
          const deltaColor = delta === 0 ? "#808080" : isGood ? "#4ade80" : "rgba(248,113,113,0.9)";
          return (
            <div key={label} className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.02] flex flex-col justify-between" style={{ minHeight: 108 }}>
              <p className="font-mono text-[9px] uppercase tracking-widest mb-2" style={{ color: "#808080" }}>{label}</p>
              <p className="font-black leading-none" style={{ fontFamily: DS, fontStyle: "normal", fontSize: "clamp(30px,8.5vw,38px)", color: "#fff" }}>
                {curr}<span style={{ fontSize: "clamp(14px,4vw,17px)", color: "rgba(255,255,255,0.45)", marginLeft: 2 }}>{unit}</span>
              </p>
              <p className="font-bold text-[11px] mt-2 tabular-nums" style={{ color: deltaColor }}>
                {delta >= 0 ? "+" : ""}{delta}cm
              </p>
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          ANALYTICS SECTION — Chart 1: Macro Distribution Radar
      ══════════════════════════════════════════════════════════════ */}
      {(() => {
        const todayProtein = [...checkedMeals].reduce((s, idx) => s + (meals[idx]?.macros?.protein ?? 0), 0);
        const todayCarbs   = [...checkedMeals].reduce((s, idx) => s + (meals[idx]?.macros?.carbs   ?? 0), 0);
        const todayFat     = [...checkedMeals].reduce((s, idx) => s + (meals[idx]?.macros?.fat     ?? 0), 0);
        const tgtP = Math.max(1, meals.reduce((s, m) => s + (m.macros?.protein ?? 0), 0));
        const tgtC = Math.max(1, meals.reduce((s, m) => s + (m.macros?.carbs   ?? 0), 0));
        const tgtF = Math.max(1, meals.reduce((s, m) => s + (m.macros?.fat     ?? 0), 0));
        const CX = 100, CY = 108, R = 72;
        const radarPt = (axisIdx: number, frac: number) => {
          const angle = -Math.PI / 2 + (2 * Math.PI / 3) * axisIdx;
          return `${(CX + R * frac * Math.cos(angle)).toFixed(2)},${(CY + R * frac * Math.sin(angle)).toFixed(2)}`;
        };
        const fracs = [Math.min(todayProtein / tgtP, 1), Math.min(todayCarbs / tgtC, 1), Math.min(todayFat / tgtF, 1)];
        const consumed = fracs.map((f, i) => radarPt(i, Math.max(f, 0.04))).join(" ");
        const target   = [0, 1, 2].map(i => radarPt(i, 1)).join(" ");
        const gridPts  = (f: number) => [0, 1, 2].map(i => radarPt(i, f)).join(" ");
        const axisEnd  = (i: number) => { const [x, y] = radarPt(i, 1).split(","); return { x: parseFloat(x), y: parseFloat(y) }; };
        const legend = [
          { label: "PROTEÍNA", val: todayProtein, tgt: tgtP, color: "#CEFF00" },
          { label: "CARBS",    val: todayCarbs,   tgt: tgtC, color: "#00F0FF" },
          { label: "GRASA",    val: todayFat,     tgt: tgtF, color: "#808080" },
        ];
        return (
          <div className="w-full bg-[#1A1A1A] rounded-[24px] p-5 mb-6 border border-white/[0.02]">
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="font-mono uppercase" style={{ fontSize: 9, letterSpacing: "0.22em", color: "#CEFF00", marginBottom: 4 }}>DISTRIBUCIÓN MACRO HOY</p>
                <h2 className="font-black italic uppercase leading-none" style={{ fontFamily: DS, fontSize: 18, color: "#fff" }}>ANÁLISIS DE INGESTA</h2>
              </div>
              <div className="text-right pt-1">
                <p className="font-mono" style={{ fontSize: 7, letterSpacing: "0.1em", textTransform: "uppercase", color: "#808080" }}>TOTAL</p>
                <p className="font-black" style={{ fontFamily: DS, fontStyle: "normal", fontSize: 24, color: "#CEFF00", lineHeight: 1 }}>
                  {todayProtein * 4 + todayCarbs * 4 + todayFat * 9}<span style={{ fontSize: 10, color: "#808080" }}>kcal</span>
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center mt-2">
              <svg width="200" height="216" viewBox="0 0 200 216">
                <defs>
                  <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#CEFF00" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#CEFF00" stopOpacity="0.06" />
                  </radialGradient>
                </defs>
                {[0.25, 0.5, 0.75, 1].map(f => (
                  <polygon key={f} points={gridPts(f)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                ))}
                {[0, 1, 2].map(i => { const e = axisEnd(i); return (
                  <line key={i} x1={CX} y1={CY} x2={e.x} y2={e.y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                ); })}
                <polygon points={target}   fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
                <polygon points={consumed} fill="url(#radarFill)" stroke="#CEFF00" strokeWidth="2" strokeLinejoin="round" />
                <text x={CX}         y={CY - R - 10} textAnchor="middle" fill="#808080" fontFamily={MONO} fontSize="7.5" letterSpacing="1.5">PROTEÍNA</text>
                <text x={CX + R * 0.5 + 22} y={CY + R * 0.866 + 10} textAnchor="middle" fill="#808080" fontFamily={MONO} fontSize="7.5" letterSpacing="1.5">CARBS</text>
                <text x={CX - R * 0.5 - 22} y={CY + R * 0.866 + 10} textAnchor="middle" fill="#808080" fontFamily={MONO} fontSize="7.5" letterSpacing="1.5">GRASA</text>
                {fracs.map((f, i) => { const e = axisEnd(i); return (
                  <circle key={i} cx={CX + R * Math.max(f, 0.04) * Math.cos(-Math.PI / 2 + (2 * Math.PI / 3) * i)} cy={CY + R * Math.max(f, 0.04) * Math.sin(-Math.PI / 2 + (2 * Math.PI / 3) * i)} r="3.5" fill="#CEFF00" opacity={f > 0 ? 1 : 0.2} />
                ); })}
              </svg>
            </div>
            <div className="flex justify-around mt-1">
              {legend.map(l => (
                <div key={l.label} className="text-center">
                  <div className="w-1.5 h-1.5 rounded-full mx-auto mb-1" style={{ background: l.color }} />
                  <p className="font-mono" style={{ fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase", color: "#808080" }}>{l.label}</p>
                  <p className="font-mono" style={{ fontSize: 9, color: l.color }}>{l.val}g<span style={{ color: "#404040" }}>/{l.tgt}g</span></p>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── Chart 2: 7-Day Caloric Core Timeline ── */}
      {(() => {
        const dayKcal = (d: number) => {
          const checked = nutritionHistory[d] ?? new Set<number>();
          return [...checked].reduce((sum, idx) => {
            const m = meals[idx]; if (!m) return sum;
            return sum + (m.macros?.protein ?? 0) * 4 + (m.macros?.carbs ?? 0) * 4 + (m.macros?.fat ?? 0) * 9;
          }, 0);
        };
        const dayBurn = (d: number) => 1800 + (workoutHistory[d] ?? []).length * 60;
        const data = Array.from({ length: 7 }, (_, i) => ({ d: i + 1, intake: dayKcal(i + 1), burn: dayBurn(i + 1) }));
        const allVals = data.flatMap(d => [d.intake, d.burn]);
        const minV = Math.max(0, Math.min(...allVals) - 150);
        const maxV = Math.max(...allVals) + 150;
        const CW = 288, CH = 72, CP = 12;
        const toX = (i: number) => CP + (i / 6) * (CW - CP * 2);
        const toY = (v: number) => CP + (1 - (v - minV) / Math.max(maxV - minV, 1)) * (CH - CP * 2);
        const intakePath = "M " + data.map((d, i) => `${toX(i).toFixed(1)},${toY(d.intake).toFixed(1)}`).join(" L ");
        const burnPath   = "M " + data.map((d, i) => `${toX(i).toFixed(1)},${toY(d.burn).toFixed(1)}`).join(" L ");
        const DAY_LABELS = ["L","M","X","J","V","S","D"];
        const todayIdx = currentCycleDay() - 1;
        return (
          <div className="w-full bg-[#1A1A1A] rounded-[24px] p-5 mb-6 border border-white/[0.02]">
            <p className="font-mono uppercase mb-1" style={{ fontSize: 9, letterSpacing: "0.22em", color: "#808080" }}>CICLO 7 DÍAS</p>
            <h2 className="font-black italic uppercase leading-none mb-4" style={{ fontFamily: DS, fontSize: 18, color: "#fff" }}>KCAL CORE TIMELINE</h2>
            <div className="flex items-center gap-5 mb-3">
              <div className="flex items-center gap-1.5">
                <div style={{ width: 18, height: 2, borderRadius: 1, background: "#CEFF00" }} />
                <span className="font-mono" style={{ fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase", color: "#808080" }}>INGESTA</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="18" height="2"><line x1="0" y1="1" x2="18" y2="1" stroke="#00F0FF" strokeWidth="2" strokeDasharray="4,2.5" /></svg>
                <span className="font-mono" style={{ fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase", color: "#808080" }}>GASTO EST.</span>
              </div>
            </div>
            <svg width="100%" viewBox={`0 0 ${CW + CP * 2} ${CH + CP * 2}`} style={{ overflow: "visible" }}>
              {[0.25, 0.5, 0.75].map(f => (
                <line key={f} x1={CP} y1={toY(minV + f * (maxV - minV))} x2={CW + CP} y2={toY(minV + f * (maxV - minV))}
                  stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              ))}
              <path d={intakePath} fill="none" stroke="#CEFF00" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              <path d={burnPath}   fill="none" stroke="#00F0FF" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="5,3" />
              {data.map((d, i) => (
                <g key={d.d}>
                  <circle cx={toX(i)} cy={toY(d.intake)} r={i === todayIdx ? 4.5 : 2.5}
                    fill={d.intake > 0 ? "#CEFF00" : "#1A1A1A"} stroke="#CEFF00" strokeWidth="1.5" />
                </g>
              ))}
            </svg>
            <div className="flex justify-between" style={{ paddingInline: CP + 2 }}>
              {DAY_LABELS.map((l, i) => (
                <span key={i} className="font-mono" style={{ fontSize: 7, letterSpacing: "0.1em", textTransform: "uppercase", color: i === todayIdx ? "#CEFF00" : "#808080" }}>{l}</span>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── Chart 3: Strength Max Bars ── */}
      {(() => {
        const maxPR = Math.max(prs.squat || 1, prs.deadlift || 1, prs.bench || 1, 1);
        const prBars = [
          { label: "SQUAT",    kg: prs.squat,    color: "#CEFF00",              shadow: "rgba(206,255,0,0.35)"  },
          { label: "DEADLIFT", kg: prs.deadlift, color: "#00F0FF",              shadow: "rgba(0,240,255,0.35)"  },
          { label: "BENCH",    kg: prs.bench,    color: "rgba(255,255,255,0.75)", shadow: "transparent"           },
        ];
        return (
          <div className="w-full bg-[#1A1A1A] rounded-[24px] p-5 mb-6 border border-white/[0.02]">
            <p className="font-mono uppercase mb-1" style={{ fontSize: 9, letterSpacing: "0.22em", color: "#808080" }}>REGISTROS PERSONALES</p>
            <h2 className="font-black italic uppercase leading-none mb-5" style={{ fontFamily: DS, fontSize: 18, color: "#fff" }}>MAX STRENGTH SCAN</h2>
            <div className="flex flex-col gap-4">
              {prBars.map(bar => (
                <div key={bar.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono" style={{ fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "#808080" }}>{bar.label}</span>
                    <span className="font-mono font-black" style={{ fontSize: 14, color: bar.color }}>
                      {bar.kg > 0 ? `${bar.kg} kg` : "—"}
                    </span>
                  </div>
                  <div className="rounded-full overflow-hidden" style={{ height: 6, background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full"
                      style={{
                        width: barsReady && maxPR > 0 ? `${Math.round((bar.kg / maxPR) * 100)}%` : "0%",
                        background: bar.color,
                        boxShadow: `0 0 10px ${bar.shadow}`,
                        transition: "width 0.7s cubic-bezier(0.22,1,0.36,1)",
                      }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── 4. VISUAL LOG CAROUSEL ── */}
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: "#808080" }}>
          REGISTRO VISUAL
        </p>
        <button
          onClick={() => setIsGalleryOpen(true)}
          className="active:opacity-70 transition-opacity"
          style={{ fontFamily: DS, fontStyle: "normal", fontWeight: 900, fontSize: 12, letterSpacing: "0.06em", color: "#CEFF00" }}>
          Ver Todo
        </button>
      </div>
      <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 mb-6"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}>
        {VISUAL_LOG.slice(0, 3).map((v, i) => (
          <PhotoCard key={i} entry={v} height={300} width={220} />
        ))}
      </div>

      {/* ── 5. MASTER CTA ── */}
      <button
        onClick={() => setIsComparisonOpen(true)}
        className="bg-[#CEFF00] text-black font-black uppercase py-4 rounded-xl w-full flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        style={{ fontFamily: DS, fontStyle: "normal", fontSize: "clamp(14px,4vw,16px)",
          letterSpacing: "0.14em", boxShadow: "0 0 32px rgba(206,255,0,0.15), 0 8px 20px rgba(0,0,0,0.3)" }}>
        COMPARA TU EVOLUCIÓN
        <Camera size={18} strokeWidth={2} />
      </button>

      {/* ══════════════════════════════
          GALLERY OVERLAY PORTAL
      ══════════════════════════════ */}
      {isGalleryOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[80] overflow-y-auto"
          style={{ background: "rgba(7,7,8,0.98)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>

          {/* Sticky header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
            style={{ background: "rgba(7,7,8,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] mb-0.5" style={{ color: "#CEFF00" }}>
                REGISTRO VISUAL
              </p>
              <p className="font-black uppercase" style={{ fontFamily: DS, fontStyle: "normal", fontSize: 18, color: "#fff", letterSpacing: "0.04em" }}>
                HISTORIAL COMPLETO
              </p>
            </div>
            <button
              onClick={() => setIsGalleryOpen(false)}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <X size={15} style={{ color: "rgba(255,255,255,0.6)" }} />
            </button>
          </div>

          {/* Content grouped by month */}
          <div className="px-5 py-5 pb-10">
            {months.map(mes => (
              <div key={mes} className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-0.5 h-4 rounded-full flex-shrink-0" style={{ background: "#CEFF00" }} />
                  <p className="font-black uppercase" style={{ fontFamily: DS, fontStyle: "normal", fontSize: 14, letterSpacing: "0.08em", color: "#fff" }}>
                    {mes}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {VISUAL_LOG.filter(v => v.mes === mes).map((v, i) => (
                    <PhotoCard key={i} entry={v} height={200} width={undefined as unknown as number} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* ══════════════════════════════
          COMPARISON OVERLAY PORTAL
      ══════════════════════════════ */}
      {isComparisonOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[80] flex flex-col"
          style={{ background: "#070708" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <button
              onClick={() => setIsComparisonOpen(false)}
              className="flex items-center gap-2 active:opacity-70 transition-opacity">
              <ChevronLeft size={20} style={{ color: "#CEFF00" }} />
              <span className="font-black uppercase" style={{ fontFamily: DS, fontStyle: "normal", fontSize: 13, letterSpacing: "0.1em", color: "#CEFF00" }}>
                VOLVER
              </span>
            </button>
            <div className="text-center">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: "#808080" }}>
                COMPARATIVA VISUAL
              </p>
            </div>
            <div style={{ width: 72 }} />
          </div>

          {/* Instruction */}
          <div className="px-5 pt-4 pb-3 flex-shrink-0">
            <p className="font-mono text-[9px] uppercase tracking-widest text-center" style={{ color: "#808080" }}>
              Toca cada tarjeta para cambiar el mes
            </p>
          </div>

          {/* Split screen */}
          <div className="flex-1 flex gap-3 px-4 pb-4 overflow-hidden" style={{ minHeight: 0 }}>

            {/* ANTES slot */}
            <button
              onClick={cycleBefore}
              className="flex-1 rounded-2xl overflow-hidden relative border active:scale-[0.97] transition-all"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <img src={VISUAL_LOG[beforeIdx].photo} alt="Antes"
                className="absolute inset-0 w-full h-full object-cover object-center" style={imgStyle} />
              <div className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.25) 55%, transparent 75%)" }} />
              {/* Top label */}
              <div className="absolute top-0 left-0 right-0 p-3">
                <div className="inline-flex items-center px-2 py-1 rounded-lg"
                  style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: "#808080" }}>ANTES</span>
                </div>
              </div>
              {/* Bottom content */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="font-mono uppercase mb-0.5" style={{ fontSize: 8, letterSpacing: "0.2em", color: "#CEFF00" }}>
                  {VISUAL_LOG[beforeIdx].mes}
                </p>
                <p className="font-black italic uppercase leading-none"
                  style={{ fontFamily: DS, fontSize: "clamp(18px,5vw,22px)", color: "#fff" }}>
                  {VISUAL_LOG[beforeIdx].angle}
                </p>
                {/* Cycle hint */}
                <div className="flex items-center gap-1 mt-2">
                  {VISUAL_LOG.map((_, i) => (
                    <div key={i} className="h-0.5 rounded-full transition-all"
                      style={{ background: i === beforeIdx ? "#CEFF00" : "rgba(255,255,255,0.2)", flex: i === beforeIdx ? 2 : 1 }} />
                  ))}
                </div>
              </div>
            </button>

            {/* DESPUÉS slot */}
            <button
              onClick={cycleAfter}
              className="flex-1 rounded-2xl overflow-hidden relative border active:scale-[0.97] transition-all"
              style={{ borderColor: "rgba(206,255,0,0.2)" }}>
              <img src={VISUAL_LOG[afterIdx].photo} alt="Después"
                className="absolute inset-0 w-full h-full object-cover object-center" style={imgStyle} />
              <div className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.25) 55%, transparent 75%)" }} />
              {/* Top label */}
              <div className="absolute top-0 left-0 right-0 p-3">
                <div className="inline-flex items-center px-2 py-1 rounded-lg"
                  style={{ background: "rgba(206,255,0,0.15)", border: "1px solid rgba(206,255,0,0.3)" }}>
                  <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: "#CEFF00" }}>DESPUÉS</span>
                </div>
              </div>
              {/* Bottom content */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="font-mono uppercase mb-0.5" style={{ fontSize: 8, letterSpacing: "0.2em", color: "#CEFF00" }}>
                  {VISUAL_LOG[afterIdx].mes}
                </p>
                <p className="font-black italic uppercase leading-none"
                  style={{ fontFamily: DS, fontSize: "clamp(18px,5vw,22px)", color: "#fff" }}>
                  {VISUAL_LOG[afterIdx].angle}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {VISUAL_LOG.map((_, i) => (
                    <div key={i} className="h-0.5 rounded-full transition-all"
                      style={{ background: i === afterIdx ? "#CEFF00" : "rgba(255,255,255,0.2)", flex: i === afterIdx ? 2 : 1 }} />
                  ))}
                </div>
              </div>
            </button>
          </div>

          {/* Weight delta footer */}
          <div className="px-5 pb-6 flex-shrink-0">
            <div className="rounded-2xl p-4 flex items-center justify-between"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-center flex-1">
                <p className="font-mono text-[8px] uppercase tracking-widest mb-1" style={{ color: "#808080" }}>PESO INICIAL</p>
                <p className="font-black" style={{ fontFamily: DS, fontStyle: "normal", fontSize: 22, color: "#fff" }}>{startWeight}<span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>kg</span></p>
              </div>
              <ArrowLeftRight size={16} style={{ color: "#CEFF00", flexShrink: 0 }} />
              <div className="text-center flex-1">
                <p className="font-mono text-[8px] uppercase tracking-widest mb-1" style={{ color: "#CEFF00" }}>PESO ACTUAL</p>
                <p className="font-black" style={{ fontFamily: DS, fontStyle: "normal", fontSize: 22, color: "#CEFF00" }}>{student.currentWeight}<span style={{ fontSize: 12, color: "rgba(206,255,0,0.5)" }}>kg</span></p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
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

/* ── Premium gate overlay ── */
function PremiumGate() {
  const DS = "var(--font-display,'Barlow Condensed',sans-serif)";
  return (
    <div className="w-full flex flex-col items-center justify-center py-20 px-6 text-center"
      style={{ minHeight: 420 }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: "rgba(206,255,0,0.08)", border: "1px solid rgba(206,255,0,0.2)" }}>
        <Lock size={28} style={{ color: "#CEFF00" }} />
      </div>
      <p className="font-mono text-[9px] uppercase tracking-[0.22em] mb-2" style={{ color: "#808080" }}>
        ACCESO RESTRINGIDO
      </p>
      <h2 className="font-black italic uppercase leading-tight mb-2"
        style={{ fontFamily: DS, fontSize: "clamp(22px,6vw,28px)", color: "#fff", letterSpacing: "0.04em" }}>
        SECCIÓN BLOQUEADA
      </h2>
      <p className="font-black uppercase mb-6"
        style={{ fontFamily: DS, fontStyle: "normal", fontSize: "clamp(10px,3vw,12px)", letterSpacing: "0.12em", color: "#CEFF00" }}>
        DISPONIBLE EN PLAN BERSERKER ⚡
      </p>
      <div className="w-full max-w-xs rounded-xl py-4 flex items-center justify-center gap-2"
        style={{ background: "#CEFF00", boxShadow: "0 0 28px rgba(206,255,0,0.2)" }}>
        <Zap size={16} fill="#000" stroke="none" />
        <span className="font-black uppercase text-black"
          style={{ fontFamily: DS, fontStyle: "normal", fontSize: 14, letterSpacing: "0.12em" }}>
          ACTUALIZAR PLAN
        </span>
      </div>
    </div>
  );
}

function TabWorkout({ day, student, waterMl, onAddWater, onFocusMode, memberTier, prs, onNewPR, activeDayIndex, onLogExercise }: {
  day: RoutineDay | undefined;
  student: Student;
  waterMl: number;
  onAddWater: () => void;
  onFocusMode: (active: boolean) => void;
  memberTier: "basic" | "berserker";
  prs: { squat: number; deadlift: number; bench: number };
  onNewPR: (lift: "squat" | "deadlift" | "bench", kg: number) => void;
  activeDayIndex: number;
  onLogExercise: (dayIdx: number, exerciseName: string) => void;
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
  const waterTarget = WATER_TARGET_ML;
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

  const [workoutToast,    setWorkoutToast]    = useState(false);
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const workoutToastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect if exercise name maps to a trackable PR lift
  const detectLift = (name: string): "squat" | "deadlift" | "bench" | null => {
    const n = name.toLowerCase();
    if (n.includes("squat") || n.includes("sentadilla")) return "squat";
    if (n.includes("deadlift") || n.includes("peso muerto")) return "deadlift";
    if (n.includes("bench") || n.includes("press de banca") || n.includes("pecho")) return "bench";
    return null;
  };

  const handleSetComplete = () => {
    if (currentSet >= totalSets) return;

    const newSets = currentSet + 1;
    const isLast  = newSets >= totalSets;

    setDoneSets(d => ({ ...d, [activeExIdx]: newSets }));

    // PR check: fire on every set if weight logged and exercise is a tracked lift
    if (focusWeight > 0 && activeEx) {
      const lift = detectLift(activeEx.name);
      if (lift && focusWeight > prs[lift]) {
        onNewPR(lift, focusWeight);
      }
    }

    setWorkoutToast(true);
    if (workoutToastRef.current) clearTimeout(workoutToastRef.current);

    if (isLast) {
      setDoneEx(d => new Set([...d, activeExIdx]));
      // Log completed exercise to workout history
      if (activeEx) onLogExercise(activeDayIndex, activeEx.name);
      workoutToastRef.current = setTimeout(() => {
        setWorkoutToast(false);
        switchView("lobby");
      }, 2000);
    } else {
      startRest();
      workoutToastRef.current = setTimeout(() => setWorkoutToast(false), 2000);
    }
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

      {/* ── PROGRESO GENERAL BAR ── */}
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
              {(waterMl / 1000).toFixed(1)}<span className="text-[13px] font-normal ml-1" style={{ color: "rgba(0,240,255,0.5)" }}>/ 3.0 L</span>
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
          {Array.from({ length: 12 }).map((_, idx) => {
            const filled = waterMl >= (idx + 1) * 250;
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

      {/* ── FINALIZAR — appears once all exercises are done ── */}
      {doneEx.size >= totalEx && totalEx > 0 && (
        <div className="mx-4 mt-3 mb-2">
          <button
            onClick={() => setWorkoutComplete(true)}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98] transition-all"
            style={{ background: "#CEFF00", boxShadow: "0 0 32px rgba(206,255,0,0.3)", fontFamily: DS, fontStyle: "italic", fontWeight: 900, fontSize: "16px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#000", border: "none" }}>
            <Zap size={16} fill="#000" stroke="none" />
            FINALIZAR ENTRENAMIENTO
          </button>
        </div>
      )}
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
              : `${day?.muscleGroup ?? "FUERZA"} · SERIE ${Math.min(currentSet + 1, totalSets)} DE ${totalSets}`}
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
              {/* SEGUIMIENTO EN TIEMPO REAL — top right */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(16px)", border: "1px solid rgba(206,255,0,0.38)", boxShadow: "0 0 16px rgba(206,255,0,0.1)" }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#CEFF00", boxShadow: "0 0 6px rgba(206,255,0,0.9)" }} />
                <span className="text-[8.5px] font-black uppercase tracking-wider" style={{ color: "#CEFF00" }}>SEGUIMIENTO EN TIEMPO REAL</span>
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
              disabled={currentSet >= totalSets}
              className="w-full py-5 rounded-3xl font-black uppercase flex items-center justify-center gap-3 cursor-pointer transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
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
              <p className="text-[8px] font-black uppercase tracking-[0.18em] mb-0.5" style={{ color: "#fff" }}>PROGRESO GENERAL</p>
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
      <>
        {/* Export button — lobby only */}
        {wView === "lobby" && (
          <div className="flex justify-end items-center gap-2 px-4 pb-2 no-print">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl active:opacity-70 transition-opacity"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Printer size={12} style={{ color: "#808080" }} />
              <span style={{ fontFamily: DS, fontStyle: "normal", fontWeight: 900, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#808080" }}>
                EXPORTAR RUTINA
              </span>
            </button>
          </div>
        )}
        {wView === "lobby"   && LobbyView}
        {wView === "focus"   && FocusView}
        {wView === "library" && LibraryView}
      </>
      {workoutToast && <WorkoutToast />}
      {workoutComplete && (
        <WorkoutCompleteModal
          onClose={() => setWorkoutComplete(false)}
          durationStr={durationStr}
          exerciseCount={exercises.length}
        />
      )}
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

function TabPerfil({ student, detail, onCancelRequest, nutritionHistory, workoutHistory, activeDayIndex, prs, walletBalance }: {
  student: Student;
  detail: Detail;
  onCancelRequest: () => void;
  nutritionHistory: Record<number, Set<number>>;
  workoutHistory: Record<number, string[]>;
  activeDayIndex: number;
  prs: { squat: number; deadlift: number; bench: number };
  walletBalance: number;
}) {
  const DS   = "var(--font-display,'Barlow Condensed',sans-serif)";
  const MONO = "'Courier New',monospace";

  const [showSettings,      setShowSettings]      = useState(false);
  const [notifWorkout,      setNotifWorkout]      = useState(true);
  const [notifNutrition,    setNotifNutrition]    = useState(true);
  const [notifCommunity,    setNotifCommunity]    = useState(false);
  const [settingsSaved,     setSettingsSaved]     = useState(false);
  const [showRankDrawer,    setShowRankDrawer]    = useState(false);
  const settingsSavedRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const anyOpen = showRankDrawer || showSettings;
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showRankDrawer, showSettings]);

  /* Rank derived from streak */
  const rankTitle = student.streak >= 60 ? "LEYENDA"
    : student.streak >= 30 ? "BESTIA"
    : student.streak >= 14 ? "GUERRERO"
    : "ATLETA";
  const rankSub = student.streak >= 30 ? "ELITE" : student.streak >= 14 ? "PRO" : "NIVEL 1";

  /* Subscription tier label */
  const planLabel = student.stage === "Volumen" ? "Plan Berserker"
    : student.stage === "Definición" ? "Plan Shredder"
    : "Plan Performance";

  /* Monthly progress: streak vs 30-day target */
  const monthPct = Math.min(100, Math.round((student.streak / 30) * 100));

  /* PR data (static display values) */
  const PR_ITEMS = [
    { label: "SQUAT",    value: prs.squat > 0    ? String(prs.squat)    : "—", unit: prs.squat    > 0 ? "KG" : "SIN LOG", accentColor: "#CEFF00" },
    { label: "DEADLIFT", value: prs.deadlift > 0 ? String(prs.deadlift) : "—", unit: prs.deadlift > 0 ? "KG" : "SIN LOG", accentColor: "#00F0FF" },
    { label: "BENCH",    value: prs.bench > 0    ? String(prs.bench)    : "—", unit: prs.bench    > 0 ? "KG" : "SIN LOG", accentColor: "#808080" },
  ];

  return (
    <div className="w-full flex flex-col pb-24">

      {/* ── 1. HERO BANNER ── */}
      <div className="w-full relative overflow-hidden mb-6"
        style={{ height: 280, marginLeft: "-1rem", width: "calc(100% + 2rem)" }}>
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop&auto=format&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ filter: "grayscale(0.4) brightness(0.55)" }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(7,7,8,0.25) 0%, rgba(7,7,8,0.15) 40%, rgba(7,7,8,0.85) 85%, rgba(7,7,8,1) 100%)" }} />
        {/* Identity tagline */}
        <div className="absolute bottom-0 left-0 px-5 pb-5">
          <p className="font-black uppercase leading-tight"
            style={{ fontFamily: DS, fontStyle: "normal", fontSize: "clamp(20px,5.5vw,24px)", color: "#fff", letterSpacing: "0.02em" }}>
            UNA SERIE MÁS,
          </p>
          <p className="font-black uppercase leading-tight"
            style={{ fontFamily: DS, fontStyle: "normal", fontSize: "clamp(20px,5.5vw,24px)", color: "#fff", letterSpacing: "0.02em" }}>
            UNA COMIDA MÁS.
          </p>
          <p className="font-black italic text-sm tracking-wide mt-1"
            style={{ fontFamily: DS, color: "#CEFF00", letterSpacing: "0.06em" }}>
            DISCIPLINA ABSOLUTA.
          </p>
        </div>
        {/* Avatar chip top-right */}
        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-2xl"
          style={{ background: "rgba(7,7,8,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0"
            style={{ background: student.avatarColor ?? "linear-gradient(135deg,#8b5cf6,#ec4899)", color: "#fff", fontFamily: DS, border: "1.5px solid rgba(206,255,0,0.5)" }}>
            {student.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div className="leading-tight">
            <p className="font-black text-white truncate max-w-[110px]"
              style={{ fontFamily: DS, fontStyle: "normal", fontSize: 13 }}>
              {student.name.split(" ")[0].toUpperCase()}
            </p>
            <p className="font-mono text-[8px] uppercase tracking-widest" style={{ color: "#CEFF00" }}>
              {student.stage} · E{student.stageNumber}
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. STREAK & RANK GRID ── */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Racha — streak matrix card (spans full width) */}
        <div className="col-span-2 bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.02] flex flex-col">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "#808080" }}>
              RACHA DE DÍAS
            </p>
            <div className="flex items-center gap-2">
              <p className="font-black italic leading-none"
                style={{ fontFamily: DS, fontSize: "clamp(20px,5vw,26px)", color: "#CEFF00", letterSpacing: "0.02em" }}>
                {student.streak}
                <span style={{ fontSize: "clamp(11px,3vw,13px)", marginLeft: 3, fontStyle: "normal" }}>DÍAS</span>
              </p>
              <Flame size={13} style={{ color: "#CEFF00", filter: "drop-shadow(0 0 4px rgba(206,255,0,0.5))" }} />
            </div>
          </div>
          {/* 7-day GitHub-style matrix */}
          <div className="w-full flex justify-between items-center gap-2 mt-1 bg-[#070708]/50 p-3 rounded-xl border border-white/[0.02]">
            {[1,2,3,4,5,6,7].map(dayId => {
              const done    = (nutritionHistory[dayId]?.size ?? 0) > 0 || (workoutHistory[dayId]?.length ?? 0) > 0;
              const isToday = dayId === activeDayIndex;
              return (
                <div key={dayId} className="flex flex-col items-center"
                  style={{ flex: "1 1 0", minWidth: 0 }}>
                  <span className="font-mono uppercase text-center mb-1.5"
                    style={{ fontSize: 9, color: "#808080", letterSpacing: "0.08em", lineHeight: 1 }}>
                    D{dayId}
                  </span>
                  {done ? (
                    <div
                      className={`rounded-full flex items-center justify-center font-black font-mono${isToday ? " animate-pulse" : ""}`}
                      style={{
                        width: 28, height: 28,
                        background: "#CEFF00",
                        color: "#000",
                        fontSize: 10,
                        letterSpacing: "-0.05em",
                        boxShadow: isToday
                          ? "0 0 15px rgba(206,255,0,0.25), 0 0 0 2px #00F0FF"
                          : "0 0 15px rgba(206,255,0,0.25)",
                        border: isToday ? "2px solid #00F0FF" : "1px solid #CEFF00",
                        flexShrink: 0,
                        animation: "mc-hud-scan 0.3s cubic-bezier(0.16,1,0.3,1) both",
                        animationDelay: `${(dayId - 1) * 55}ms`,
                      }}>
                      ✓
                    </div>
                  ) : (
                    <div
                      className={`rounded-full flex items-center justify-center font-mono${isToday ? " animate-pulse" : ""}`}
                      style={{
                        width: 28, height: 28,
                        background: "rgba(26,26,26,0.4)",
                        color: "#808080",
                        fontSize: 10,
                        letterSpacing: "-0.05em",
                        boxShadow: isToday ? "0 0 0 2px #00F0FF" : "none",
                        border: isToday ? "2px solid #00F0FF" : "1px solid rgba(255,255,255,0.08)",
                        flexShrink: 0,
                        animation: "mc-overlay-in 0.3s ease both",
                        animationDelay: `${(dayId - 1) * 55}ms`,
                      }}>
                      {dayId}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rango — tappable card → Jerarquía drawer */}
        <button onClick={() => setShowRankDrawer(true)}
          className="col-span-2 bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.02] flex flex-col justify-between text-left transition-all duration-300 hover:scale-[1.01] active:scale-[0.97]"
          style={{ minHeight: 110, cursor: "pointer", transition: "all 0.3s ease" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "#808080" }}>
              RANGO · ATLETA
            </p>
            <Sparkles size={13} style={{ color: "#00F0FF", filter: "drop-shadow(0 0 4px rgba(0,240,255,0.45))" }} />
          </div>
          <div>
            <p className="font-black uppercase leading-tight"
              style={{ fontFamily: DS, fontStyle: "normal", fontSize: "clamp(20px,5.5vw,24px)", color: "#fff", letterSpacing: "0.03em" }}>
              {rankTitle}
            </p>
            <p className="font-mono font-bold text-xs mt-0.5"
              style={{ color: "#CEFF00", letterSpacing: "0.12em", filter: "drop-shadow(0 0 6px rgba(206,255,0,0.4))" }}>
              {rankSub}
            </p>
            <p className="font-mono text-[7.5px] uppercase tracking-widest mt-1.5 flex items-center gap-1" style={{ color: "#808080" }}>
              VER JERARQUÍA <ChevronRight size={8} />
            </p>
          </div>
        </button>
      </div>

      {/* ── 2.5 BILLETERA TÁCTICA ── */}
      <div className="w-full bg-[#1A1A1A] rounded-2xl px-5 py-4 mb-4 flex items-center justify-between border border-white/[0.02]">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: "#808080" }}>BILLETERA TÁCTICA</p>
          <p className="font-black leading-none" style={{ fontFamily: DS, fontStyle: "italic", fontSize: "clamp(22px,6vw,28px)", color: "#CEFF00", letterSpacing: "0.02em" }}>
            ${walletBalance.toLocaleString()}
            <span style={{ fontSize: 11, marginLeft: 4, fontStyle: "normal", color: "#808080" }}>USD</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(206,255,0,0.08)", border: "1px solid rgba(206,255,0,0.25)" }}>
            <Trophy size={15} style={{ color: "#CEFF00" }} />
          </div>
          <p className="font-mono text-[7px] uppercase tracking-widest" style={{ color: "#808080" }}>ESCROW</p>
        </div>
      </div>

      {/* ── 3. RÉCORDS PERSONALES ── */}
      <div className="w-full bg-[#1A1A1A] rounded-[24px] p-5 mb-6 border border-white/[0.02] flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "#808080" }}>
            RÉCORDS PERSONALES
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#CEFF00" }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
          </div>
        </div>

        {/* 3-col split */}
        <div className="grid grid-cols-3">
          {PR_ITEMS.map(({ label, value, unit, accentColor }, i) => (
            <div key={label}
              className="flex flex-col px-4 py-2"
              style={{
                borderLeft: `2px solid ${accentColor}`,
                borderRight: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none",
                marginLeft: i > 0 ? 0 : undefined,
              }}>
              <p className="font-mono text-[9px] uppercase tracking-widest mb-2" style={{ color: "#808080" }}>
                {label}
              </p>
              <p className="font-black leading-none" style={{ fontFamily: DS, fontStyle: "normal", fontSize: "clamp(22px,6vw,28px)", color: "#fff" }}>
                {value}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-widest mt-0.5" style={{ color: accentColor }}>
                {unit}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. MURO DE HONOR ── */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ background: "#CEFF00", boxShadow: "0 0 8px rgba(206,255,0,0.5)" }} />
        <h2 className="font-black italic uppercase tracking-wider"
          style={{ fontFamily: DS, fontSize: "clamp(16px,5vw,20px)", color: "#fff" }}>
          MURO DE HONOR
        </h2>
      </div>

      {/* Row 1: Correo */}
      <div className="w-full bg-[#1A1A1A] rounded-2xl p-4 flex items-center gap-4 mb-3 border border-white/[0.02]">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
        </div>
        <div className="min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-widest mb-0.5" style={{ color: "#808080" }}>CORREO</p>
          <p className="font-bold text-white truncate" style={{ fontFamily: DS, fontStyle: "normal", fontSize: 14 }}>
            {student.email ?? "atleta@elite.com"}
          </p>
        </div>
      </div>

      {/* Row 2: Suscripción */}
      <div className="w-full bg-[#1A1A1A] rounded-2xl p-4 flex items-center gap-4 mb-3 border border-white/[0.02]">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(206,255,0,0.07)", border: "1px solid rgba(206,255,0,0.14)" }}>
          <Zap size={15} fill="#CEFF00" stroke="none" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-widest mb-0.5" style={{ color: "#808080" }}>SUSCRIPCIÓN</p>
          <p className="font-bold text-white" style={{ fontFamily: DS, fontStyle: "normal", fontSize: 14 }}>
            {planLabel}
          </p>
        </div>
        {(student.paymentStatus === "active" || student.paymentStatus === "grace_period") && (
          <button
            onClick={onCancelRequest}
            className="flex-shrink-0 px-2.5 py-1.5 rounded-xl text-[9px] font-mono uppercase tracking-wide"
            style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.15)", color: "rgba(248,113,113,0.8)" }}>
            Cancelar
          </button>
        )}
      </div>

      {/* Row 3: Ajustes */}
      <button onClick={() => setShowSettings(true)}
        className="w-full bg-[#1A1A1A] rounded-2xl p-4 flex items-center gap-4 mb-6 border border-white/[0.02] active:opacity-70 transition-opacity text-left"
        style={{ cursor: "pointer" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <Settings size={15} style={{ color: "rgba(255,255,255,0.5)" }} />
        </div>
        <div className="min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-widest mb-0.5" style={{ color: "#808080" }}>AJUSTES</p>
          <p className="font-bold text-white" style={{ fontFamily: DS, fontStyle: "normal", fontSize: 14 }}>
            Preferencia de cuenta
          </p>
        </div>
        <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.2)", marginLeft: "auto", flexShrink: 0 }} />
      </button>

      {/* ── Account Settings Overlay ── */}
      {showSettings && (
        <div className="fixed inset-0 bg-[#070708]/95 backdrop-blur-md z-50 flex flex-col overflow-y-auto"
          style={{ animation: "mc-overlay-in 0.25s cubic-bezier(0.16,1,0.3,1) both" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-8 pb-4 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <p style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 20, textTransform: "uppercase", letterSpacing: "0.05em", color: "#fff" }}>
              PREFERENCIAS
            </p>
            <button onClick={() => setShowSettings(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full active:scale-90 transition-transform"
              style={{ background: "rgba(206,255,0,0.08)", border: "1px solid rgba(206,255,0,0.25)", cursor: "pointer" }}>
              <X size={12} style={{ color: "#CEFF00" }} />
              <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "#CEFF00", fontWeight: 900 }}>CERRAR</span>
            </button>
          </div>

          <div className="flex-1 px-5 py-6 space-y-4">

            {/* Notifications section */}
            <p style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "#808080", marginBottom: 12 }}>🔔 NOTIFICACIONES</p>
            {[
              { label: "Recordatorios de Entrenamiento", sub: "Push al inicio de tu sesión programada", val: notifWorkout,   set: setNotifWorkout   },
              { label: "Alertas de Nutrición",           sub: "Recordatorio de comidas y macros",       val: notifNutrition, set: setNotifNutrition },
              { label: "Actividad de Comunidad",         sub: "Nuevos posts y retos del equipo",        val: notifCommunity, set: setNotifCommunity },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.04)" }}>
                <div className="flex-1 min-w-0 mr-4">
                  <p style={{ fontFamily: DS, fontWeight: 900, fontSize: 14, color: "#fff" }}>{item.label}</p>
                  <p style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "#808080", marginTop: 2 }}>{item.sub}</p>
                </div>
                <button onClick={() => item.set(v => !v)}
                  className="flex-shrink-0 w-11 h-6 rounded-full relative active:scale-90 transition-transform"
                  style={{ background: item.val ? "#CEFF00" : "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", transition: "background 0.2s ease" }}>
                  <div className="absolute top-0.5 rounded-full w-5 h-5 transition-all duration-200"
                    style={{ background: item.val ? "#000" : "rgba(255,255,255,0.3)", left: item.val ? "calc(100% - 22px)" : "2px" }} />
                </button>
              </div>
            ))}

            <div className="h-px my-2" style={{ background: "rgba(255,255,255,0.04)" }} />

            {/* Account info (static read-only) */}
            <p style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "#808080", marginBottom: 12 }}>👤 CUENTA</p>
            {[
              { label: "NOMBRE",   value: student.name },
              { label: "EMAIL",    value: "configurado en perfil" },
              { label: "PLAN",     value: student.stage === "Volumen" ? "Plan Berserker" : "Plan Performance" },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: "#808080" }}>{row.label}</span>
                <span style={{ fontFamily: DS, fontWeight: 900, fontSize: 14, color: "#fff" }}>{row.value}</span>
              </div>
            ))}

            {/* Save button */}
            <button
              onClick={() => {
                setSettingsSaved(true);
                if (settingsSavedRef.current) clearTimeout(settingsSavedRef.current);
                settingsSavedRef.current = setTimeout(() => { setSettingsSaved(false); setShowSettings(false); }, 1600);
              }}
              className="w-full py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all mt-4"
              style={{ background: settingsSaved ? "rgba(206,255,0,0.12)" : "#CEFF00", border: settingsSaved ? "1.5px solid #CEFF00" : "none", cursor: "pointer", fontFamily: DS, fontStyle: "italic", fontWeight: 900, fontSize: 18, letterSpacing: "0.1em", textTransform: "uppercase", color: settingsSaved ? "#CEFF00" : "#000", boxShadow: "0 0 28px rgba(206,255,0,0.25)" }}>
              {settingsSaved ? "✓ PREFERENCIAS GUARDADAS" : "GUARDAR CAMBIOS"}
            </button>
          </div>
        </div>
      )}

      {/* ── 5. MONTHLY PROGRESS BAR ── */}
      <div className="w-full bg-[#1A1A1A] rounded-2xl p-4 mb-6 border border-white/[0.02]">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-black uppercase" style={{ fontFamily: DS, fontStyle: "normal", fontSize: "clamp(12px,3.5vw,14px)", color: "#fff", letterSpacing: "0.04em" }}>
            PROGRESO MENSUAL
          </span>
          <span className="font-black" style={{ fontFamily: DS, fontStyle: "normal", fontSize: "clamp(12px,3.5vw,14px)", color: "#CEFF00" }}>
            {monthPct}%
          </span>
          <span className="font-black uppercase" style={{ fontFamily: DS, fontStyle: "normal", fontSize: "clamp(12px,3.5vw,14px)", color: "#fff", letterSpacing: "0.04em" }}>
            COMPLETADO
          </span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-3 rounded-full transition-all duration-700"
            style={{
              width: `${monthPct}%`,
              background: "linear-gradient(to right, rgba(206,255,0,0.5), #CEFF00)",
              boxShadow: "0 0 10px rgba(206,255,0,0.35)",
            }} />
        </div>
      </div>

      {/* ── SIGN OUT ── */}
      <button onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl cursor-pointer transition-opacity hover:opacity-75"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.065)", color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
        <LogOut size={14} strokeWidth={1.5} />
        <span style={{ fontFamily: DS, fontStyle: "normal", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Cerrar Sesión
        </span>
      </button>

      {/* ── JERARQUÍA Y RANGOS DRAWER — portal-mounted to escape layout stacking ── */}
      {showRankDrawer && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 bg-[#070708]/98 z-[70] flex flex-col overflow-y-auto pb-16"
          style={{ animation: "mc-overlay-in 0.25s cubic-bezier(0.16,1,0.3,1) both" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-8 pb-4 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div>
              <p style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "#808080", marginBottom: 6 }}>🏅 SISTEMA DE RANGO</p>
              <p style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 22, textTransform: "uppercase", letterSpacing: "0.05em", color: "#fff", lineHeight: 1 }}>
                JERARQUÍA Y<br />RANGOS DE PODER
              </p>
            </div>
            <button onClick={() => setShowRankDrawer(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full active:scale-90 transition-transform flex-shrink-0 self-start mt-1"
              style={{ background: "rgba(206,255,0,0.08)", border: "1px solid rgba(206,255,0,0.25)", cursor: "pointer" }}>
              <X size={12} style={{ color: "#CEFF00" }} />
              <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "#CEFF00", fontWeight: 900 }}>CERRAR</span>
            </button>
          </div>

          {/* Rank list */}
          <div className="px-5 py-5 space-y-3">
            {[
              {
                level: 1, title: "ATLETA INIT", sub: "NIVEL 1", icon: "⬡",
                active: true,
                desc: "RANGO ACTUAL",
                progress: "Estás a 150 XP o 3 entrenamientos perfectos de subir de nivel.",
                accentColor: "#CEFF00",
                borderColor: "rgba(206,255,0,0.4)",
              },
              {
                level: 2, title: "GUERRERO PRO", sub: "NIVEL 2", icon: "◈",
                active: false, desc: "BLOQUEADO", progress: "Completa 14 días de racha continua.",
                accentColor: "rgba(255,255,255,0.25)", borderColor: "rgba(255,255,255,0.06)",
              },
              {
                level: 3, title: "TITÁN", sub: "NIVEL 3", icon: "◆",
                active: false, desc: "BLOQUEADO", progress: "Alcanza 30 días de racha y 5 PRs.",
                accentColor: "rgba(255,255,255,0.25)", borderColor: "rgba(255,255,255,0.06)",
              },
              {
                level: 4, title: "COMANDANTE", sub: "NIVEL 4", icon: "✦",
                active: false, desc: "BLOQUEADO", progress: "Mantén el 90% de asistencia por 2 meses.",
                accentColor: "rgba(255,255,255,0.25)", borderColor: "rgba(255,255,255,0.06)",
              },
              {
                level: 5, title: "PREDADOR", sub: "NIVEL 5", icon: "⬢",
                active: false, desc: "BLOQUEADO", progress: "60 días de racha y liderazgo de equipo.",
                accentColor: "rgba(255,255,255,0.25)", borderColor: "rgba(255,255,255,0.06)",
              },
              {
                level: 6, title: "BESTIA ÉLITE", sub: "NIVEL MÁXIMO", icon: "★",
                active: false, desc: "RANGO SUPREMO",
                progress: "Liderazgo de sala activo · Credenciales de equipo elite.",
                accentColor: "#CEFF00", borderColor: "rgba(206,255,0,0.2)",
                voltTheme: true,
              },
            ].map(rank => (
              <div key={rank.level}
                className="rounded-2xl p-5 flex items-start gap-4"
                style={{
                  background: rank.active
                    ? "rgba(206,255,0,0.06)"
                    : rank.voltTheme
                    ? "rgba(206,255,0,0.03)"
                    : "rgba(255,255,255,0.02)",
                  border: `1.5px solid ${rank.borderColor}`,
                  opacity: rank.active || rank.voltTheme ? 1 : 0.55,
                }}>
                {/* Badge icon */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: rank.active
                      ? "rgba(206,255,0,0.1)"
                      : rank.voltTheme
                      ? "rgba(206,255,0,0.04)"
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${rank.borderColor}`,
                  }}>
                  <span style={{ fontSize: 20, color: rank.accentColor, lineHeight: 1 }}>{rank.icon}</span>
                </div>
                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p style={{ fontFamily: DS, fontWeight: 900, fontSize: "clamp(17px,5vw,20px)", textTransform: "uppercase", color: rank.active ? "#fff" : rank.voltTheme ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.4)", lineHeight: 1, letterSpacing: "0.03em" }}>
                      {rank.title}
                    </p>
                    {rank.active && (
                      <span className="px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: "#CEFF00", fontFamily: MONO, fontSize: 7, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "#000" }}>
                        ACTIVO
                      </span>
                    )}
                    {rank.voltTheme && !rank.active && (
                      <span className="px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ border: "1px solid rgba(206,255,0,0.3)", fontFamily: MONO, fontSize: 7, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(206,255,0,0.6)" }}>
                        ELITE
                      </span>
                    )}
                  </div>
                  <p style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.18em", textTransform: "uppercase", color: rank.active ? rank.accentColor : "rgba(255,255,255,0.2)", marginBottom: 6 }}>
                    {rank.sub} · {rank.desc}
                  </p>
                  <p style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.04em", color: "rgba(255,255,255,0.35)", lineHeight: 1.55 }}>
                    {rank.progress}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TAB: COMUNIDAD — Elite Group Chat
══════════════════════════════════════════════════════════════ */


function getRank(streak: number, stage: string): string {
  if (streak >= 60) return "LEYENDA ELITE";
  if (streak >= 30) return "BESTIA ELITE";
  if (stage === "Volumen") return "BERSERKER";
  if (streak >= 14) return "GUERRERO PRO";
  return "ATLETA INIT";
}

// ── SALAS: static activity feed data ─────────────────────────────────────
const SALA_ACTIVITY_FEED = [
  {
    id: 101,
    handle: "MARCUS_ELITE",
    avatarColor: "linear-gradient(135deg,#CEFF00,#00F0FF)",
    time: "Hace 12 min",
    exercise: "Deadlift PR",
    badge: "240KG",
    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80&auto=format",
    likes: 24,
    comments: 8,
    comment: "Por fin superando los 240kg. La programación de Fells Team está dando frutos. ¡Vamos equipo!",
  },
  {
    id: 102,
    handle: "ANA_BERSERKER",
    avatarColor: "linear-gradient(135deg,#f472b6,#a78bfa)",
    time: "Hace 35 min",
    exercise: "Sentadilla 5×5",
    badge: "120KG",
    img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80&auto=format",
    likes: 17,
    comments: 5,
    comment: "Semana 8 del programa. PR en sentadilla. La constancia está marcando la diferencia.",
  },
  {
    id: 103,
    handle: "COACH_FELLS",
    avatarColor: "linear-gradient(135deg,#CEFF00,#a3e635)",
    time: "Hace 1h",
    exercise: "Press Banca",
    badge: "180KG",
    img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80&auto=format",
    likes: 41,
    comments: 12,
    comment: "El equipo está en otro nivel este mes. Números récord en 6 de 8 ejercicios clave. Sigan así.",
  },
];

// ── SALAS: telemetry ribbon data ──────────────────────────────────────────
type SalaMetric = { icon: React.ReactNode; label: string; value: string; sub: string; accent: string };
const SALA_METRICS: SalaMetric[] = [
  { icon: <Users    size={18} />, label: "MIEMBROS ACTIVOS", value: "42",   sub: "+3 ESTA SEMANA", accent: "#CEFF00" },
  { icon: <Flame    size={18} />, label: "STREAK GRUPAL",    value: "18",   sub: "DÍAS",           accent: "#CEFF00" },
  { icon: <Activity size={18} />, label: "ESFUERZO PROM.",   value: "92%",  sub: "INTENSIDAD",     accent: "#00F0FF" },
  { icon: <MapPin   size={18} />, label: "KMs TOTALES",      value: "1.2K", sub: "ESTE MES",       accent: "#00F0FF" },
];

// ── Module-level static datasets ─────────────────────────────────────────
const SALA_ROSTER: RosterMember[] = [
  { id: 1, name: "MARCUS_ELITE",  avatarInitials: "ME", avatarBgColor: "linear-gradient(135deg,#CEFF00,#00F0FF)", rankBadgeTitle: "BESTIA ELITE",  rnk: 1, rachaActiveDays: 42, isOnline: true,  isMe: false, pts: 4820, kcal: 4210, sets: 52, prs: { maxDeadlift: 220, maxSquat: 185, benchPress: 150, kcalRecord: 6200 } },
  { id: 2, name: "COACH_FELLS",   avatarInitials: "CF", avatarBgColor: "linear-gradient(135deg,#CEFF00,#a3e635)", rankBadgeTitle: "COMANDANTE",    rnk: 2, rachaActiveDays: 38, isOnline: true,  isMe: false, pts: 4650, kcal: 3980, sets: 48, prs: { maxDeadlift: 210, maxSquat: 175, benchPress: 140, kcalRecord: 5900 } },
  { id: 3, name: "ANA_BERSERKER", avatarInitials: "AB", avatarBgColor: "linear-gradient(135deg,#f472b6,#a78bfa)", rankBadgeTitle: "PREDADORA",     rnk: 3, rachaActiveDays: 31, isOnline: false, isMe: false, pts: 4100, kcal: 3650, sets: 44, prs: { maxDeadlift: 165, maxSquat: 140, benchPress: 95,  kcalRecord: 4800 } },
  { id: 4, name: "ALBERTO_Z",     avatarInitials: "AZ", avatarBgColor: "linear-gradient(135deg,#60a5fa,#a78bfa)", rankBadgeTitle: "TITÁN",         rnk: 4, rachaActiveDays: 28, isOnline: true,  isMe: true,  pts: 3105, kcal: 3105, sets: 38, prs: { maxDeadlift: 180, maxSquat: 155, benchPress: 120, kcalRecord: 5840 } },
  { id: 5, name: "DIANA_FORCE",   avatarInitials: "DF", avatarBgColor: "linear-gradient(135deg,#f87171,#fbbf24)", rankBadgeTitle: "GUERRERA PRO",  rnk: 5, rachaActiveDays: 21, isOnline: false, isMe: false, pts: 2890, kcal: 2780, sets: 32, prs: { maxDeadlift: 145, maxSquat: 125, benchPress: 85,  kcalRecord: 4200 } },
  { id: 6, name: "CARLOS_POWER",  avatarInitials: "CP", avatarBgColor: "linear-gradient(135deg,#34d399,#06b6d4)", rankBadgeTitle: "ATLETA INIT",   rnk: 6, rachaActiveDays: 14, isOnline: true,  isMe: false, pts: 2540, kcal: 2410, sets: 28, prs: { maxDeadlift: 130, maxSquat: 110, benchPress: 80,  kcalRecord: 3900 } },
  { id: 7, name: "JORGE_REX",     avatarInitials: "JR", avatarBgColor: "linear-gradient(135deg,#fb923c,#f43f5e)", rankBadgeTitle: "GUERRERO PRO",  rnk: 7, rachaActiveDays: 19, isOnline: false, isMe: false, pts: 2200, kcal: 2100, sets: 24, prs: { maxDeadlift: 155, maxSquat: 130, benchPress: 100, kcalRecord: 4100 } },
  { id: 8, name: "SARA_APEX",     avatarInitials: "SA", avatarBgColor: "linear-gradient(135deg,#c084fc,#60a5fa)", rankBadgeTitle: "BESTIA INIT",   rnk: 8, rachaActiveDays: 11, isOnline: true,  isMe: false, pts: 1980, kcal: 1850, sets: 20, prs: { maxDeadlift: 120, maxSquat: 100, benchPress: 72,  kcalRecord: 3600 } },
];

const SALA_LEADERBOARD = [
  { rank: 1, name: "MARCUS_ELITE",   pts: 4820, kcal: 4210, sets: 52, avatarColor: "linear-gradient(135deg,#CEFF00,#00F0FF)", isMe: false },
  { rank: 2, name: "COACH_FELLS",    pts: 4650, kcal: 3980, sets: 48, avatarColor: "linear-gradient(135deg,#CEFF00,#a3e635)", isMe: false },
  { rank: 3, name: "ANA_BERSERKER",  pts: 4100, kcal: 3650, sets: 44, avatarColor: "linear-gradient(135deg,#f472b6,#a78bfa)", isMe: false },
  { rank: 4, name: "ALBERTO_Z",      pts: 3105, kcal: 3105, sets: 38, avatarColor: "linear-gradient(135deg,#60a5fa,#a78bfa)", isMe: true  },
  { rank: 5, name: "DIANA_FORCE",    pts: 2890, kcal: 2780, sets: 32, avatarColor: "linear-gradient(135deg,#f87171,#fbbf24)", isMe: false },
  { rank: 6, name: "CARLOS_POWER",   pts: 2540, kcal: 2410, sets: 28, avatarColor: "linear-gradient(135deg,#34d399,#06b6d4)", isMe: false },
];

const SALA_AVISOS = [
  { id: 1, author: "COACH LUIS YÁÑEZ", time: "HACE 2 HORAS", pinned: true,
    text: "¡ALERTA DE DESAFÍO! Mañana iniciamos el protocolo de superación de fuerza en Sentadilla. Aseguren sus macronutrientes esta noche. No hay espacio para debilidad.",
    fire: 128, muscle: 94 },
  { id: 2, author: "COACH ANA SILVA", time: "HACE 6 HORAS", pinned: false,
    text: "Tutorial de Deadlift con carga máxima disponible en la biblioteca. Revisar técnica antes de la sesión del jueves.",
    fire: 47, muscle: 33 },
  { id: 3, author: "COACH LUIS YÁÑEZ", time: "HACE 1 DÍA", pinned: false,
    text: "Récord colectivo roto esta semana: 312 sesiones completadas. El equipo está operando al máximo rendimiento.",
    fire: 89, muscle: 61 },
];

type RosterMember = {
  id: number;
  name: string;
  avatarInitials: string;
  avatarBgColor: string;
  rankBadgeTitle: string;
  rnk: number;
  rachaActiveDays: number;
  isOnline: boolean;
  isMe: boolean;
  pts: number;
  kcal: number;
  sets: number;
  prs: { maxDeadlift: number; maxSquat: number; benchPress: number; kcalRecord: number };
};

type LiveStake = {
  id: number;
  opponent: string;
  opponentColor: string;
  modality: string;
  pool: number;
  myScore: number;
  rivalScore: number;
  myMax: number;
  rivalMax: number;
  status: "PENDIENTE" | "EN COMBATE TÁCTICO";
};

const CHALLENGE_MODALITIES = [
  { id: "DEADLIFT",    label: "MAX DEADLIFT",  sub: "1RM MÁXIMO KG", emoji: "🏋️" },
  { id: "CONSISTENCY", label: "CONSISTENCIA",  sub: "% SESIONES",    emoji: "📊" },
  { id: "KCAL",        label: "KCAL GOAL",     sub: "CAL TOTALES",   emoji: "🔥" },
] as const;

function TabComunidad({
  student,
  broadcastMessages,
  setBroadcastMessages,
  walletBalance,
  onClaimPrize,
  onLaunchDebit,
  nutritionTotal,
  streakCompletedDays,
  workoutHistory,
  currentRoomView,
  setCurrentRoomView,
  selectedActiveChallenge,
  setSelectedActiveChallenge,
  searchQuery,
  setSearchQuery,
  showRosterFilter,
  setShowRosterFilter,
  filterRank,
  setFilterRank,
  filterOnline,
  setFilterOnline,
  filterStreakMin,
  setFilterStreakMin,
  isCoach,
  coachId,
}: {
  student: { name: string; streak: number; stage: string; avatarColor?: string };
  broadcastMessages: string[];
  setBroadcastMessages: React.Dispatch<React.SetStateAction<string[]>>;
  walletBalance: number;
  onClaimPrize: (amount: number) => Promise<void>;
  onLaunchDebit: (amount: number) => Promise<boolean>;
  nutritionTotal: number;
  streakCompletedDays: number;
  workoutHistory: Record<number, string[]>;
  currentRoomView: "feed" | "leaderboard" | "retos" | "members" | "avisos";
  setCurrentRoomView: React.Dispatch<React.SetStateAction<"feed" | "leaderboard" | "retos" | "members" | "avisos">>;
  selectedActiveChallenge: LiveStake | null;
  setSelectedActiveChallenge: React.Dispatch<React.SetStateAction<LiveStake | null>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  showRosterFilter: boolean;
  setShowRosterFilter: React.Dispatch<React.SetStateAction<boolean>>;
  filterRank: string | null;
  setFilterRank: React.Dispatch<React.SetStateAction<string | null>>;
  filterOnline: boolean;
  setFilterOnline: React.Dispatch<React.SetStateAction<boolean>>;
  filterStreakMin: number;
  setFilterStreakMin: React.Dispatch<React.SetStateAction<number>>;
  isCoach: boolean;
  coachId: string | null;
}) {
  const DS   = "var(--font-display,'Barlow Condensed',sans-serif)";
  const MONO = "'Courier New',monospace";
  const [newBroadcastMsg, setNewBroadcastMsg] = useState("");

  // ── Server-fetched coach notices ─────────────────────────────────────────
  type ServerNotice = { id: string; senderName: string; role: string; content: string; createdAt: string };
  const [serverNotices, setServerNotices] = useState<ServerNotice[]>([]);
  useEffect(() => {
    if (currentRoomView !== "avisos" || !coachId) return;
    fetch(`/api/community/messages?coachId=${coachId}`)
      .then(r => r.ok ? r.json() : [])
      .then((msgs: ServerNotice[]) => {
        if (Array.isArray(msgs)) setServerNotices(msgs.filter(m => m.role === "COACH"));
      })
      .catch(() => {});
  }, [currentRoomView, coachId]);

  // ══ STATE MACHINE ════════════════════════════════════════════════════════
  const [hasTeam,          setHasTeam]          = useState(false);
  const [showCodeModal,    setShowCodeModal]    = useState(false);
  const [codeInput,        setCodeInput]        = useState("");
  const [codeError,        setCodeError]        = useState(false);
  const [codeSuccess,      setCodeSuccess]      = useState(false);
  // keep below so hook order never changes regardless of hasTeam value:

  // ── Feed / activity state ─────────────────────────────────────────────
  const [likedActivity,   setLikedActivity]   = useState<Set<number>>(new Set());
  const [activityFeed,    setActivityFeed]    = useState(SALA_ACTIVITY_FEED);
  const [commentOpen,     setCommentOpen]     = useState<Set<number>>(new Set());
  const [showPostModal,   setShowPostModal]   = useState(false);
  const [newPostText,     setNewPostText]     = useState("");
  // ── Challenge builder state ────────────────────────────────────────────
  const [selectedAthlete,   setSelectedAthlete]   = useState("");
  const [challengeModality, setChallengeModality] = useState("");
  const [stakeAmount,       setStakeAmount]       = useState(50);
  const [liveStakes,        setLiveStakes]        = useState<LiveStake[]>(() => [
    { id: 1, opponent: "MARCUS_ELITE",  opponentColor: "linear-gradient(135deg,#CEFF00,#00F0FF)", modality: "KCAL GOAL",   pool: 1000, myScore: 0, rivalScore: 4210, myMax: 5000, rivalMax: 5000, status: "EN COMBATE TÁCTICO" },
    { id: 2, opponent: "ANA_BERSERKER", opponentColor: "linear-gradient(135deg,#f472b6,#a78bfa)", modality: "CONSISTENCY", pool: 200,  myScore: 0, rivalScore: 31,   myMax: 7,    rivalMax: 7,    status: "PENDIENTE"        },
  ]);
  const [challengeToast,          setChallengeToast]          = useState(false);
  const [challengeToastMsg,       setChallengeToastMsg]       = useState("");
  const challengeToastRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const claimInFlight      = useRef(false);
  const rivalAcceptTimers  = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const [showModalityPicker,    setShowModalityPicker]    = useState(false);
  const [useCustomChallenge,    setUseCustomChallenge]    = useState(false);
  const [customChallengeText,   setCustomChallengeText]   = useState("");
  const [rosterMembers,         setRosterMembers]         = useState<RosterMember[]>(SALA_ROSTER);
  const [selectedRosterProfile, setSelectedRosterProfile] = useState<RosterMember | null>(null);
  const [showClaimModal,        setShowClaimModal]        = useState(false);
  const [claimedPool,           setClaimedPool]           = useState(0);
  const [infoToast,             setInfoToast]             = useState(false);
  const [infoToastMsg,          setInfoToastMsg]          = useState("");
  const infoToastRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fireInfoToast = (msg: string) => {
    setInfoToastMsg(msg);
    setInfoToast(true);
    if (infoToastRef.current) clearTimeout(infoToastRef.current);
    infoToastRef.current = setTimeout(() => setInfoToast(false), 2400);
  };

  // Computed canLaunch: requires solvency (half-stake must be <= wallet) + valid target + modality
  const canLaunch = selectedAthlete !== "" && stakeAmount <= walletBalance && (
    useCustomChallenge ? customChallengeText.trim().length > 0 : challengeModality !== ""
  );

  const launchChallenge = async () => {
    const finalModality = useCustomChallenge
      ? customChallengeText.trim().toUpperCase()
      : challengeModality;
    if (!selectedAthlete || !finalModality) return;
    const ok = await onLaunchDebit(stakeAmount);
    if (!ok) return;
    const rival = rosterMembers.find(m => m.name === selectedAthlete) ?? rosterMembers[0];
    const newStake: LiveStake = {
      id: Date.now(),
      opponent: selectedAthlete,
      opponentColor: rival.avatarBgColor,
      modality: finalModality,
      pool: stakeAmount * 2,
      myScore: 0,
      rivalScore: 0,
      myMax: stakeAmount * 2,
      rivalMax: stakeAmount * 2,
      status: "PENDIENTE",
    };
    setLiveStakes(prev => [newStake, ...prev]);
    setSelectedAthlete("");
    setChallengeModality("");
    setCustomChallengeText("");
    setUseCustomChallenge(false);
    setStakeAmount(50);
    setChallengeToastMsg("DESAFÍO TÁCTICO LANZADO • ESPERANDO APROBACIÓN");
    setChallengeToast(true);
    if (challengeToastRef.current) clearTimeout(challengeToastRef.current);
    challengeToastRef.current = setTimeout(() => setChallengeToast(false), 2200);
  };

  // Rival acceptance simulator: PENDIENTE → EN COMBATE TÁCTICO after 3500ms
  useEffect(() => {
    liveStakes.forEach(stake => {
      if (stake.status === "PENDIENTE" && !rivalAcceptTimers.current[stake.id]) {
        rivalAcceptTimers.current[stake.id] = setTimeout(() => {
          setLiveStakes(prev =>
            prev.map(s => s.id === stake.id ? { ...s, status: "EN COMBATE TÁCTICO" } : s)
          );
          delete rivalAcceptTimers.current[stake.id];
          setChallengeToastMsg("⚔️ ¡EL RIVAL ACEPTÓ TU DESAFÍO — COMBATE INICIADO!");
          setChallengeToast(true);
          if (challengeToastRef.current) clearTimeout(challengeToastRef.current);
          challengeToastRef.current = setTimeout(() => setChallengeToast(false), 3000);
        }, 3500);
      }
      if (stake.status !== "PENDIENTE" && rivalAcceptTimers.current[stake.id]) {
        clearTimeout(rivalAcceptTimers.current[stake.id]);
        delete rivalAcceptTimers.current[stake.id];
      }
    });
    // Purge timers for removed stakes
    const activeIds = new Set(liveStakes.map(s => s.id));
    Object.keys(rivalAcceptTimers.current).forEach(k => {
      const n = Number(k);
      if (!activeIds.has(n)) { clearTimeout(rivalAcceptTimers.current[n]); delete rivalAcceptTimers.current[n]; }
    });
  }, [liveStakes]);

  // Scroll lock: freeze body scroll when any modal is open
  useEffect(() => {
    const anyOpen = showModalityPicker || showCodeModal || showPostModal || showClaimModal;
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showModalityPicker, showCodeModal, showPostModal, showClaimModal]);

  // Scores-tick: bind live user data to matching stakes
  const totalWorkoutExercises = Object.values(workoutHistory).reduce((sum, arr) => sum + arr.length, 0);
  useEffect(() => {
    setLiveStakes(prev => prev.map(stake => {
      if (stake.status !== "EN COMBATE TÁCTICO") return stake;
      if (stake.modality === "KCAL GOAL")   return { ...stake, myScore: nutritionTotal };
      if (stake.modality === "CONSISTENCY") return { ...stake, myScore: streakCompletedDays };
      // Custom modality: use total logged exercise count as proxy score
      return { ...stake, myScore: totalWorkoutExercises };
    }));
  }, [nutritionTotal, streakCompletedDays, totalWorkoutExercises]);

  const initials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const toggleActivityLike = (id: number) => {
    setLikedActivity(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const activeFilterCount = (filterRank !== null ? 1 : 0) + (filterOnline ? 1 : 0) + (filterStreakMin > 0 ? 1 : 0);
  const filteredRoster = rosterMembers
    .filter(m => searchQuery === "" || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.rankBadgeTitle.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(m => !filterOnline || m.isOnline)
    .filter(m => filterRank === null || m.rankBadgeTitle.toUpperCase().includes(filterRank))
    .filter(m => m.rachaActiveDays >= filterStreakMin);

  // Sub-nav tabs definition
  const ROOM_TABS = [
    { id: "feed"        as const, label: "FEED",    Icon: LayoutGrid },
    { id: "leaderboard" as const, label: "RANKING", Icon: Trophy     },
    { id: "retos"       as const, label: "RETOS",   Icon: Zap        },
    { id: "members"     as const, label: "ROSTER",  Icon: Users      },
    { id: "avisos"      as const, label: "AVISOS",  Icon: Bell       },
  ];

  // ══ GATE VIEW (early return — all hooks are above) ════════════════════════
  if (!hasTeam) {
    return (
      <>
      <div className="w-full min-h-screen bg-[#070708] text-white flex flex-col items-center justify-center px-6 py-16">
        {/* Shield emblem */}
        <div style={{ width: 100, height: 100, borderRadius: 20, background: "rgba(206,255,0,0.04)", border: "1.5px solid rgba(206,255,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28, boxShadow: "0 0 32px rgba(206,255,0,0.12), inset 0 0 20px rgba(206,255,0,0.03)" }}>
          <Shield size={46} strokeWidth={1.2} style={{ color: "#CEFF00" }} />
        </div>

        <h1 style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: "clamp(28px,8vw,38px)", textTransform: "uppercase", letterSpacing: "0.04em", color: "#fff", textAlign: "center", lineHeight: 0.9, marginBottom: 16 }}>
          SIN SINDICATO<br />ACTIVO
        </h1>
        <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.04em", color: "#808080", textAlign: "center", lineHeight: 1.75, marginBottom: 40, maxWidth: 320 }}>
          No perteneces a ninguna sala de entrenamiento. Únete a una comunidad de élite para sincronizar tu progreso o introduce un código táctico.
        </p>

        <div className="w-full flex flex-col gap-3" style={{ maxWidth: 340 }}>
          <button onClick={() => setHasTeam(true)}
            className="bg-[#CEFF00] text-black font-black uppercase py-4 rounded-xl w-full active:scale-95 transition-transform"
            style={{ fontFamily: DS, fontStyle: "italic", fontSize: 17, letterSpacing: "0.1em", cursor: "pointer", border: "none", boxShadow: "0 0 28px rgba(206,255,0,0.3), 0 4px 16px rgba(0,0,0,0.5)" }}>
            [ UNIRSE A UNA SALA ⚡ ]
          </button>
          <button onClick={() => { setShowCodeModal(true); setCodeInput(""); setCodeError(false); setCodeSuccess(false); }}
            className="w-full py-4 rounded-xl active:opacity-70 transition-opacity"
            style={{ fontFamily: DS, fontStyle: "italic", fontWeight: 900, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", color: "#808080", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }}>
            INGRESAR CÓDIGO PRIVADO
          </button>
        </div>
      </div>

      {/* ── Private Code Modal ── */}
      {showCodeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6"
          style={{ background: "rgba(7,7,8,0.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", animation: "mc-overlay-in 0.2s ease both" }}>
          <div className="w-full max-w-sm rounded-[28px] flex flex-col overflow-hidden"
            style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 32px 80px rgba(0,0,0,0.8)", animation: "float-up 0.28s cubic-bezier(0.16,1,0.3,1) both" }}>
            {/* Header */}
            <div className="px-6 pt-6 pb-5 flex items-start justify-between"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <p style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "#808080", marginBottom: 6 }}>🔐 ACCESO TÁCTICO</p>
                <p style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 22, textTransform: "uppercase", letterSpacing: "0.04em", color: "#fff", lineHeight: 1 }}>
                  CÓDIGO PRIVADO
                </p>
              </div>
              <button onClick={() => setShowCodeModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full active:scale-90 transition-transform mt-1"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }}>
                <X size={13} style={{ color: "#808080" }} />
              </button>
            </div>
            {/* Body */}
            <div className="px-6 py-5">
              <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.06em", color: "#808080", lineHeight: 1.65, marginBottom: 20 }}>
                Ingresa la clave alfanumérica de acceso corporativo que tu coach te entregó para unirte a la sala.
              </p>
              <input
                type="text"
                value={codeInput}
                onChange={e => { setCodeInput(e.target.value.toUpperCase()); setCodeError(false); }}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    if (codeInput.trim() === "FELLS2026") {
                      setCodeSuccess(true);
                      setTimeout(() => { setShowCodeModal(false); setHasTeam(true); }, 1200);
                    } else {
                      setCodeError(true);
                    }
                  }
                }}
                placeholder="XXXXXX0000"
                maxLength={12}
                className="w-full rounded-xl px-4 py-3.5 text-center outline-none transition-all"
                style={{
                  fontFamily: MONO, fontSize: 18, fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase",
                  background: "rgba(255,255,255,0.04)",
                  border: `1.5px solid ${codeSuccess ? "#CEFF00" : codeError ? "#f87171" : "rgba(255,255,255,0.1)"}`,
                  color: codeSuccess ? "#CEFF00" : codeError ? "#f87171" : "#fff",
                  caretColor: "#CEFF00",
                }}
              />
              {codeError && (
                <p className="text-center mt-2" style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#f87171" }}>
                  ✕ CÓDIGO INVÁLIDO · ACCESO DENEGADO
                </p>
              )}
              {codeSuccess && (
                <p className="text-center mt-2" style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#CEFF00" }}>
                  ⚡ VERIFICADO · ACCESO CONCEDIDO
                </p>
              )}
            </div>
            {/* CTA */}
            <div className="px-6 pb-6">
              <button
                onClick={() => {
                  if (codeInput.trim() === "FELLS2026") {
                    setCodeSuccess(true);
                    setTimeout(() => { setShowCodeModal(false); setHasTeam(true); }, 1200);
                  } else {
                    setCodeError(true);
                  }
                }}
                className="w-full py-3.5 rounded-xl flex items-center justify-center active:scale-95 transition-all"
                style={{
                  background: codeSuccess ? "rgba(206,255,0,0.12)" : "#CEFF00",
                  border: codeSuccess ? "1.5px solid #CEFF00" : "none",
                  cursor: "pointer",
                  fontFamily: DS, fontStyle: "italic", fontWeight: 900, fontSize: 17, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: codeSuccess ? "#CEFF00" : "#000",
                  boxShadow: codeSuccess ? "none" : "0 0 24px rgba(206,255,0,0.3)",
                }}>
                {codeSuccess ? "⚡ ACCESO CONCEDIDO" : "VERIFICAR CÓDIGO"}
              </button>
            </div>
          </div>
        </div>
      )}
      </>
    );
  }

  // ══ DASHBOARD SHELL (hasTeam === true) ════════════════════════════════════
  return (
    <div className="w-full min-h-screen bg-[#070708] text-white flex flex-col md:flex-row">

      {/* ═══════════════════════════════════════════════════════════
          MOBILE STICKY TOP NAV TRACK (hidden on md+)
      ═══════════════════════════════════════════════════════════ */}
      <div className="md:hidden w-full sticky top-0 z-40 flex flex-col"
        style={{ background: "rgba(26,26,26,0.97)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {/* Team header row */}
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 62 62" fill="none">
              <polygon points="31,3 59,31 31,59 3,31" stroke="#CEFF00" strokeWidth="2" fill="rgba(206,255,0,0.04)" />
              <text x="31" y="40" textAnchor="middle" fontFamily="'Barlow Condensed',sans-serif" fontWeight="900" fontStyle="italic" fontSize="28" fill="#CEFF00">F</text>
            </svg>
            <span style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 13, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em" }}>FELLS TEAM PRO</span>
          </div>
          <button onClick={() => setHasTeam(false)}
            style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: "#808080", background: "none", border: "none", cursor: "pointer", padding: "2px 0" }}>
            SALIR ✕
          </button>
        </div>
        {/* Horizontal pill scroll track */}
        <div className="flex flex-row items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none px-3 pb-2.5">
          {ROOM_TABS.map(({ id, label, Icon }) => {
            const active = currentRoomView === id;
            return (
              <button key={id} onClick={() => setCurrentRoomView(id)}
                className="flex items-center gap-1.5 flex-shrink-0 active:scale-[0.94] active:opacity-90 transition-all duration-150 ease-out"
                style={{
                  background: active ? "#CEFF00" : "rgba(255,255,255,0.05)",
                  border: active ? "none" : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 9999,
                  padding: "6px 14px",
                  cursor: "pointer",
                }}>
                <Icon size={12} style={{ color: active ? "#000" : "#808080", flexShrink: 0 }} />
                <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: active ? "#000" : "#808080", fontWeight: 900 }}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          DESKTOP LEFT SIDEBAR (hidden on mobile)
      ═══════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex md:flex-col md:w-64 flex-shrink-0 border-r border-white/[0.06] sticky top-0 h-screen overflow-y-auto z-30"
        style={{ background: "rgba(26,26,26,0.96)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>

        {/* Logo block */}
        <div className="flex flex-col items-center gap-2 p-6 pb-4">
          <div style={{ filter: "drop-shadow(0 0 14px rgba(206,255,0,0.25))" }}>
            <svg width="46" height="46" viewBox="0 0 62 62" fill="none">
              <polygon points="31,3 59,31 31,59 3,31" stroke="#CEFF00" strokeWidth="1.6" fill="rgba(206,255,0,0.04)" />
              <polygon points="31,12 50,31 31,50 12,31" stroke="rgba(206,255,0,0.22)" strokeWidth="0.8" fill="none" />
              <text x="31" y="38" textAnchor="middle" fontFamily="'Barlow Condensed',sans-serif" fontWeight="900" fontStyle="italic" fontSize="23" fill="#CEFF00" letterSpacing="0.04em">F</text>
            </svg>
          </div>
          <div className="text-center">
            <p style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 15, color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em", lineHeight: 1 }}>FELLS TEAM PRO</p>
            <p style={{ fontFamily: MONO, fontSize: 6.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "#00F0FF", marginTop: 4 }}>HIGH PERFORMANCE UNIT</p>
          </div>
          <div className="w-full h-px mt-3" style={{ background: "rgba(255,255,255,0.06)" }} />
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-1 px-4 py-1">
          {ROOM_TABS.map(({ id, label, Icon }) => {
            const active = currentRoomView === id;
            return (
              <button key={id} onClick={() => setCurrentRoomView(id)}
                className="flex items-center gap-2.5 w-full text-left active:scale-[0.97] active:opacity-90 transition-all duration-150 ease-out"
                style={{
                  background: active ? "#CEFF00" : "transparent",
                  borderRadius: 10,
                  padding: "9px 12px",
                  border: "none",
                  cursor: "pointer",
                }}>
                <Icon size={15} style={{ color: active ? "#000" : "#808080", flexShrink: 0 }} />
                <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: active ? "#000" : "#808080", fontWeight: 900 }}>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Exit at bottom */}
        <div className="flex flex-col mt-auto p-4 pt-6">
          <div className="w-full h-px mb-4" style={{ background: "rgba(255,255,255,0.06)" }} />
          <button onClick={() => setHasTeam(false)}
            className="flex items-center gap-2 active:opacity-60"
            style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "#808080", background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>
            <LogOut size={12} style={{ color: "#808080" }} />
            SALIR DEL EQUIPO
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MAIN CONTENT AREA
      ═══════════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto pb-[90px]">

      {/* ════════════════════════════════════════════════════════════
          VIEW: FEED
      ════════════════════════════════════════════════════════════ */}
      {currentRoomView === "feed" && (
        <div className="px-4 pt-5 animate-mc-room-view-in">
          {/* Metrics ribbon */}
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none w-full mb-5">
            {SALA_METRICS.map((m, i) => (
              <div key={i} className="bg-[#1A1A1A] border border-white/[0.02] rounded-2xl p-4 flex-shrink-0 w-[132px] flex items-center gap-3 shadow-lg">
                <div style={{ color: m.accent, flexShrink: 0 }}>{m.icon}</div>
                <div className="min-w-0">
                  <p style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "#808080", marginBottom: 3, lineHeight: 1.3 }}>{m.label}</p>
                  <span style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 26, color: m.accent, lineHeight: 1 }}>{m.value}</span>
                  <p style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{m.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Feed header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 22, letterSpacing: "0.04em", textTransform: "uppercase", color: "#fff", lineHeight: 1 }}>STREAM DE ACTIVIDAD</h2>
              <p style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "#808080", marginTop: 4 }}>Real-time performance telemetry from the field</p>
            </div>
            <div className="flex items-center gap-1.5 mt-1 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#f87171" }} />
              <span style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "#f87171" }}>LIVE</span>
            </div>
          </div>

          {/* Activity cards — driven by activityFeed state */}
          {activityFeed.map(item => {
            const isLiked     = likedActivity.has(item.id);
            const showComment = commentOpen.has(item.id);
            return (
              <div key={item.id} className="w-full bg-[#1A1A1A] rounded-[22px] p-5 mb-5 border border-white/[0.02] flex flex-col">
                {/* Author row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: item.avatarColor, boxShadow: "0 0 0 2px #00F0FF, 0 0 14px rgba(0,240,255,0.28)" }}>
                      <span style={{ fontFamily: DS, fontWeight: 900, fontSize: 13, color: "#000" }}>{item.handle.slice(0, 2)}</span>
                    </div>
                    <div>
                      <p className="font-bold text-white" style={{ fontSize: 14 }}>{item.handle}</p>
                      <p style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "#808080", marginTop: 2 }}>{item.time} · {item.exercise}</p>
                    </div>
                  </div>
                  <div style={{ background: "#CEFF00", borderRadius: 8, padding: "5px 10px", flexShrink: 0 }}>
                    <span style={{ fontFamily: MONO, fontWeight: 900, fontSize: 11, letterSpacing: "0.08em", color: "#000" }}>{item.badge}</span>
                  </div>
                </div>

                {/* Image */}
                <div className="w-full rounded-2xl overflow-hidden mt-4 relative" style={{ maxHeight: 280 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.img} alt={item.exercise} className="w-full h-full object-cover" style={{ maxHeight: 280, display: "block" }} />
                  <div className="absolute bottom-3 right-3" style={{ background: "rgba(0,0,0,0.62)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", borderRadius: 9999, padding: "4px 12px", border: "1px solid rgba(255,255,255,0.12)" }}>
                    <span style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "#fff" }}>BEAST MODE</span>
                  </div>
                </div>

                {/* Caption */}
                <p className="text-[13px] leading-relaxed mt-3" style={{ color: "rgba(255,255,255,0.78)" }}>
                  <span className="font-bold text-white">{item.handle} </span>{item.comment}
                </p>

                {/* Social row — fully interactive */}
                <div className="flex items-center gap-5 mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  {/* Heart: increments like count in state */}
                  <button onClick={() => {
                    toggleActivityLike(item.id);
                    setActivityFeed(prev => prev.map(f =>
                      f.id === item.id ? { ...f, likes: isLiked ? f.likes - 1 : f.likes + 1 } : f
                    ));
                  }} className="flex items-center gap-1.5 active:scale-90 transition-transform">
                    <Heart size={15} fill={isLiked ? "#CEFF00" : "none"} stroke={isLiked ? "#CEFF00" : "#808080"} />
                    <span style={{ fontFamily: MONO, fontSize: 11, color: isLiked ? "#CEFF00" : "#808080" }}>{item.likes}</span>
                  </button>

                  {/* Comment icon: toggles sub-panel */}
                  <button onClick={() => setCommentOpen(prev => { const n = new Set(prev); n.has(item.id) ? n.delete(item.id) : n.add(item.id); return n; })}
                    className="flex items-center gap-1.5 active:scale-90 transition-transform">
                    <MessageSquare size={14} style={{ color: showComment ? "#00F0FF" : "#808080" }} />
                    <span style={{ fontFamily: MONO, fontSize: 11, color: showComment ? "#00F0FF" : "#808080" }}>{item.comments}</span>
                  </button>
                </div>

                {/* Comment sub-panel */}
                {showComment && (
                  <div className="mt-3 rounded-xl p-3" style={{ background: "rgba(0,240,255,0.04)", border: "1px solid rgba(0,240,255,0.12)" }}>
                    <p style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: "#00F0FF", marginBottom: 6 }}>COMENTARIOS</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontStyle: "italic" }}>Sé el primero en comentar este logro.</p>
                  </div>
                )}
              </div>
            );
          })}

          {/* FAB — opens post modal */}
          <button onClick={() => setShowPostModal(true)}
            className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-[#CEFF00] text-black rounded-full flex items-center justify-center font-black text-2xl shadow-lg shadow-[#CEFF00]/10 cursor-pointer animate-fade-in active:scale-90 transition-transform"
            style={{ border: "none" }}>
            <Plus size={22} strokeWidth={3} style={{ color: "#000" }} />
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          VIEW: AVISOS
      ════════════════════════════════════════════════════════════ */}
      {currentRoomView === "avisos" && (
        <div className="px-4 pt-2 animate-mc-room-view-in">
          {/* Section title */}
          <div className="flex items-start justify-between mb-6">
            <h2 style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 20, textTransform: "uppercase", letterSpacing: "0.04em", color: "#fff", lineHeight: 1 }}>
              CANAL DE INSTRUCCIÓN<br />/ AVISOS
            </h2>
            <div className="flex items-center gap-1.5 mt-1 flex-shrink-0">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#f87171" }} />
              <span style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.15em", textTransform: "uppercase", color: "#f87171" }}>EN DIRECTO • {rosterMembers.length} ACTIVOS</span>
            </div>
          </div>

          {/* Pinned broadcast */}
          <div className="rounded-2xl p-5 mb-5"
            style={{ background: "#1A1A1A", border: "1px solid rgba(239,68,68,0.35)", boxShadow: "0 0 15px rgba(239,68,68,0.15)" }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-[11px] flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", fontFamily: DS }}>CL</div>
                <div>
                  <p style={{ fontFamily: DS, fontWeight: 900, fontSize: 13, color: "#fff" }}>COACH LUIS YÁÑEZ</p>
                  <p style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#808080", marginTop: 2 }}>HACE 2 HORAS</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg flex-shrink-0"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <Pin size={11} style={{ color: "#f87171" }} />
                <span style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "#f87171" }}>FIJADO</span>
              </div>
            </div>
            <p className="text-[13px] leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.88)" }}>
              ¡ALERTA DE DESAFÍO! Mañana iniciamos el protocolo de superación de fuerza en Sentadilla. Aseguren sus macronutrientes esta noche. No hay espacio para debilidad.
            </p>
            <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>🔥 128</span>
              <span style={{ width: 1, height: 12, background: "rgba(255,255,255,0.14)", display: "inline-block" }} />
              <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>💪 94</span>
            </div>
          </div>

          {/* Historial */}
          <p style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "#808080", marginBottom: 12 }}>HISTORIAL DE INSTRUCCIONES</p>
          {coachId && serverNotices.length === 0 && (
            <div className="rounded-xl p-5 mb-4 text-center" style={{ background: "rgba(26,26,26,0.5)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <p style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#808080" }}>
                // SIN INSTRUCCIONES DEL COACH
              </p>
            </div>
          )}
          {!coachId && SALA_AVISOS.filter(a => !a.pinned).map(aviso => (
            <div key={aviso.id} className="bg-[#1A1A1A] rounded-2xl p-4 mb-4 border border-white/[0.02]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-[11px] flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#00F0FF,#0ea5e9)", color: "#000", fontFamily: DS }}>
                  {aviso.author.split(" ").slice(-2).map((w: string) => w[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p style={{ fontFamily: DS, fontWeight: 900, fontSize: 13, color: "#fff" }}>{aviso.author}</p>
                  <p style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#808080", marginTop: 2 }}>{aviso.time}</p>
                </div>
              </div>
              <p className="text-[12.5px] leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.78)" }}>{aviso.text}</p>
              <div className="flex gap-3">
                <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>🔥 {aviso.fire}</span>
                <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>💪 {aviso.muscle}</span>
              </div>
            </div>
          ))}
          {serverNotices.map(n => (
            <div key={n.id} className="bg-[#1A1A1A] rounded-2xl p-4 mb-4 border border-white/[0.02]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-[11px] flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#00F0FF,#0ea5e9)", color: "#000", fontFamily: DS }}>
                  {n.senderName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontFamily: DS, fontWeight: 900, fontSize: 13, color: "#fff" }}>{n.senderName.toUpperCase()}</p>
                  <p style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#808080", marginTop: 2 }}>
                    {new Date(n.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).toUpperCase()}
                  </p>
                </div>
              </div>
              <p className="text-[12.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>{n.content}</p>
            </div>
          ))}

          {/* Performance micro-grid */}
          <div className="grid grid-cols-2 gap-3 mt-2 mb-6">
            {([
              { label: "RENDIMIENTO",  value: "+12%", accent: "#CEFF00" },
              { label: "CONSISTENCIA", value: "98%",  accent: "#00F0FF" },
            ] as { label: string; value: string; accent: string }[]).map(item => (
              <div key={item.label} className="rounded-xl p-4 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "#808080", marginBottom: 8 }}>{item.label}</p>
                <p style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 36, color: item.accent, lineHeight: 1 }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* ── GESTIÓN DE EMISIÓN DEL COACH (Broadcast Configurator — COACH only) ── */}
          {isCoach && <div className="rounded-xl overflow-hidden mb-4"
            style={{ background: "rgba(26,26,26,0.7)", border: "1px solid rgba(206,255,0,0.12)" }}>
            {/* Config header */}
            <div className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(206,255,0,0.45)" }}>⚡ GESTIÓN DE EMISIÓN</span>
              </div>
              <span style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>
                {broadcastMessages.length} ACTIVOS
              </span>
            </div>
            {/* Current messages */}
            <div className="px-4 pt-3 pb-2 space-y-1.5">
              {broadcastMessages.length === 0 && (
                <p style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", padding: "8px 0" }}>
                  // SIN MENSAJES ACTIVOS
                </p>
              )}
              {broadcastMessages.map((msg, i) => (
                <div key={i} className="flex items-start gap-2.5 px-3 py-2.5"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 900, color: i === 0 ? "#CEFF00" : "rgba(255,255,255,0.25)", flexShrink: 0, marginTop: 1 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="flex-1 min-w-0" style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", lineHeight: 1.55, wordBreak: "break-word" }}>
                    {msg}
                  </p>
                  <button onClick={() => setBroadcastMessages(prev => prev.filter((_, j) => j !== i))}
                    className="flex-shrink-0 active:opacity-40 transition-opacity"
                    style={{ background: "transparent", border: "none", cursor: "pointer", padding: "2px" }}>
                    <X size={10} style={{ color: "rgba(248,113,113,0.5)" }} />
                  </button>
                </div>
              ))}
            </div>
            {/* Borderless HUD input + monolithic EMITIR button */}
            <div className="flex flex-col gap-0 px-4 pb-4 pt-2">
              <input
                type="text"
                value={newBroadcastMsg}
                onChange={e => setNewBroadcastMsg(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && newBroadcastMsg.trim()) {
                    setBroadcastMessages(prev => [...prev, newBroadcastMsg.trim().toUpperCase()]);
                    setNewBroadcastMsg("");
                  }
                }}
                placeholder="NUEVO MENSAJE DE EMISIÓN..."
                className="hud-input w-full"
                style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", caretColor: "#00F0FF" }}
              />
              <button
                onClick={() => {
                  if (!newBroadcastMsg.trim()) return;
                  setBroadcastMessages(prev => [...prev, newBroadcastMsg.trim().toUpperCase()]);
                  setNewBroadcastMsg("");
                }}
                className="w-full mt-3 py-3.5 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                style={{ background: "#CEFF00", border: "none", cursor: "pointer", boxShadow: "0 0 24px rgba(206,255,0,0.18)" }}>
                <Zap size={11} fill="#000" stroke="none" />
                <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: "#000" }}>
                  EMITIR BROADCAST
                </span>
              </button>
            </div>
          </div>}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          VIEW: LEADERBOARD (Podium + Ranks only)
      ════════════════════════════════════════════════════════════ */}
      {currentRoomView === "leaderboard" && (
        <div className="px-4 pt-5 animate-mc-room-view-in">
          <h2 style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 28, textTransform: "uppercase", letterSpacing: "0.04em", color: "#fff", lineHeight: 1, marginBottom: 4 }}>
            RANKING DE SINDICATO
          </h2>
          <p style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "#00F0FF", marginBottom: 18 }}>
            SALA: TITANS_ELITE_04
          </p>

          {/* Podium */}
          <div className="flex items-end gap-3 mb-5">
            {([1, 0, 2] as number[]).map(idx => {
              const m       = SALA_LEADERBOARD[idx];
              const isFirst = idx === 0;
              const h       = isFirst ? 176 : idx === 1 ? 138 : 116;
              const ring    = isFirst ? "0 0 0 2.5px #CEFF00, 0 0 20px rgba(206,255,0,0.4)" : "0 0 0 1.5px rgba(255,255,255,0.12)";
              const nc      = isFirst ? "#CEFF00" : idx === 1 ? "#00F0FF" : "#808080";
              return (
                <div key={m.rank} className="flex-1 flex flex-col items-center rounded-2xl pt-4 pb-3 gap-2"
                  style={{ height: h, background: isFirst ? "rgba(206,255,0,0.04)" : "#1A1A1A", border: isFirst ? "1px solid rgba(206,255,0,0.25)" : "1px solid rgba(255,255,255,0.04)", boxShadow: isFirst ? "0 0 24px rgba(206,255,0,0.08)" : "none", justifyContent: "center" }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: m.avatarColor, boxShadow: ring }}>
                    <span style={{ fontFamily: DS, fontWeight: 900, color: "#000", fontSize: 11 }}>{m.name.slice(0, 2)}</span>
                  </div>
                  <span style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 24, color: nc, lineHeight: 1 }}>#{m.rank}</span>
                  <p style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", textAlign: "center", lineHeight: 1.4, paddingInline: 6 }}>{m.name}</p>
                  <p style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 13, color: nc }}>{m.pts.toLocaleString()}</p>
                </div>
              );
            })}
          </div>

          {/* Ranks 4-8 */}
          <div className="space-y-3 mb-6">
            {SALA_LEADERBOARD.slice(3).map((m, i) => (
              <div key={m.rank} className="relative rounded-2xl p-4 flex items-center gap-3"
                style={{ background: m.isMe ? "rgba(206,255,0,0.04)" : "#1A1A1A", border: m.isMe ? "1.5px solid #CEFF00" : "1px solid rgba(255,255,255,0.04)", animation: "mc-overlay-in 0.3s ease both", animationDelay: `${i * 40}ms` }}>
                {m.isMe && (
                  <div className="absolute -top-3 left-4 px-2 py-0.5 rounded"
                    style={{ background: "#CEFF00", fontFamily: MONO, fontSize: 7.5, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: "#000" }}>
                    TU POSICIÓN
                  </div>
                )}
                <span style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 22, color: m.isMe ? "#CEFF00" : "#808080", width: 28, flexShrink: 0 }}>#{m.rank}</span>
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: m.avatarColor, boxShadow: m.isMe ? "0 0 0 1.5px #CEFF00" : "none" }}>
                  <span style={{ color: "#000", fontSize: 10, fontWeight: 900, fontFamily: DS }}>{m.name.slice(0, 2)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: DS, fontWeight: 900, fontSize: 14, color: m.isMe ? "#CEFF00" : "#fff" }}>{m.name}</p>
                  {m.isMe ? (
                    <div className="mt-1">
                      <p style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "#808080" }}>{m.kcal.toLocaleString()} KCAL · {m.sets} SETS</p>
                      <div className="flex gap-1 mt-1.5">
                        {[1,1,1,1,0].map((v, i) => (
                          <div key={i} className="h-1.5 flex-1 rounded-full" style={{ background: v ? "#CEFF00" : "rgba(255,255,255,0.1)" }} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "#808080" }}>{m.pts.toLocaleString()} PTS</p>
                  )}
                </div>
                <span style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 16, color: m.isMe ? "#CEFF00" : "#fff", flexShrink: 0 }}>{m.pts.toLocaleString()}</span>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          VIEW: RETOS — Challenge Hub + Battle Detail Overlay
      ════════════════════════════════════════════════════════════ */}
      {currentRoomView === "retos" && (
        <div className="relative px-4 pt-5 pb-8 animate-mc-room-view-in">

          {/* ── CHALLENGE BUILDER ── */}
          {selectedActiveChallenge === null && (
            <>
              <h2 style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 28, textTransform: "uppercase", letterSpacing: "0.04em", color: "#fff", lineHeight: 1, marginBottom: 4 }}>
                ⚡ RETOS TÁCTICOS
              </h2>
              <p style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "#00F0FF", marginBottom: 18 }}>
                ARENA 1V1 · APUESTA TÁCTICA
              </p>

              {/* Challenge Builder Card */}
              <div className="rounded-[22px] p-5 mb-5"
                style={{ background: "#1A1A1A", border: "1px solid rgba(206,255,0,0.18)", boxShadow: "0 0 28px rgba(206,255,0,0.06)" }}>
                <div className="flex items-center justify-between mb-4">
                  <p style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "#CEFF00" }}>⚡ CONFIGURAR DESAFÍO</p>
                  <span style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#808080" }}>TÁCTICA 1v1</span>
                </div>

                {/* Step 1: Rival — driven by rosterMembers state */}
                <p style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "#808080", marginBottom: 10 }}>01 · SELECCIONAR RIVAL</p>
                <div className="flex gap-3 overflow-x-auto pb-3 mb-4 scrollbar-none">
                  {rosterMembers.filter(m => !m.isMe).map(rival => {
                    const isSel = selectedAthlete === rival.name;
                    return (
                      <button key={rival.id} onClick={() => setSelectedAthlete(isSel ? "" : rival.name)}
                        className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-90 transition-transform"
                        style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 2px" }}>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ background: rival.avatarBgColor, boxShadow: isSel ? "0 0 0 2.5px #CEFF00, 0 0 16px rgba(206,255,0,0.5)" : "0 0 0 1.5px rgba(255,255,255,0.1)", transition: "box-shadow 0.15s ease" }}>
                          <span style={{ fontFamily: DS, fontWeight: 900, fontSize: 12, color: "#000" }}>{rival.avatarInitials}</span>
                        </div>
                        <span style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.1em", textTransform: "uppercase", color: isSel ? "#CEFF00" : "#808080", whiteSpace: "nowrap", fontWeight: isSel ? 900 : 400 }}>{rival.name.split("_")[0]}</span>
                        {isSel && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#CEFF00" }} />}
                      </button>
                    );
                  })}
                </div>

                {/* Step 2: Modality — dropdown trigger */}
                <p style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "#808080", marginBottom: 10 }}>02 · MODALIDAD DE COMBATE</p>
                <button onClick={() => { setShowModalityPicker(true); setUseCustomChallenge(false); setCustomChallengeText(""); }}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl mb-5 active:scale-[0.98] transition-transform"
                  style={{ background: challengeModality ? "rgba(206,255,0,0.05)" : "rgba(255,255,255,0.03)", border: challengeModality ? "1.5px solid rgba(206,255,0,0.35)" : "1px solid rgba(255,255,255,0.08)", cursor: "pointer", boxShadow: challengeModality ? "0 0 14px rgba(206,255,0,0.1)" : "none" }}>
                  <div className="flex items-center gap-2.5">
                    <span style={{ fontSize: 16 }}>
                      {challengeModality === "DEADLIFT" ? "🏋️" : challengeModality === "CONSISTENCY" ? "📊" : challengeModality === "KCAL" ? "🔥" : challengeModality ? "🎯" : "⚡"}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: challengeModality ? "#CEFF00" : "#808080", fontWeight: challengeModality ? 900 : 400 }}>
                      {challengeModality
                        ? CHALLENGE_MODALITIES.find(m => m.id === challengeModality)?.label ?? challengeModality
                        : "SELECCIONAR MODALIDAD"}
                    </span>
                  </div>
                  <ChevronDown size={14} style={{ color: challengeModality ? "#CEFF00" : "#808080", flexShrink: 0 }} />
                </button>

                {/* Step 3: Stake */}
                <p style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "#808080", marginBottom: 10 }}>03 · MONTO DE APUESTA</p>
                <div className="text-center mb-4">
                  <span style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 52, color: "#CEFF00", lineHeight: 1, letterSpacing: "-0.01em" }}>$ {stakeAmount.toFixed(2)}</span>
                  <span style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", color: "#808080", marginLeft: 8 }}>USD</span>
                  <p style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginTop: 4 }}>POOL TOTAL: $ {(stakeAmount * 2).toFixed(2)} USD</p>
                </div>
                <div className="flex gap-2 mb-4">
                  {([10, 50] as const).map(delta => (
                    <button key={delta} onClick={() => setStakeAmount(s => Math.min(1000, s + delta))}
                      className="flex-1 py-2.5 rounded-xl active:scale-95 transition-transform"
                      style={{ background: "rgba(206,255,0,0.07)", border: "1px solid rgba(206,255,0,0.2)", cursor: "pointer", fontFamily: MONO, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "#CEFF00", fontWeight: 900 }}>
                      +{delta}
                    </button>
                  ))}
                  <button onClick={() => setStakeAmount(1000)}
                    className="flex-1 py-2.5 rounded-xl active:scale-95 transition-transform"
                    style={{ background: "rgba(206,255,0,0.07)", border: "1px solid rgba(206,255,0,0.2)", cursor: "pointer", fontFamily: MONO, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "#CEFF00", fontWeight: 900 }}>
                    MAX
                  </button>
                  <button onClick={() => setStakeAmount(0)}
                    className="px-4 py-2.5 rounded-xl active:scale-95 transition-transform"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer", fontFamily: MONO, fontSize: 12, color: "#808080", fontWeight: 900 }}>
                    ✕
                  </button>
                </div>
                <div className="mb-5">
                  <input type="range" min={0} max={1000} step={10} value={stakeAmount} onChange={e => setStakeAmount(Number(e.target.value))}
                    className="w-full" style={{ accentColor: "#CEFF00", cursor: "pointer", height: 4 }} />
                  <div className="flex justify-between mt-1.5">
                    <span style={{ fontFamily: MONO, fontSize: 7.5, color: "#808080" }}>$ 0</span>
                    <span style={{ fontFamily: MONO, fontSize: 7.5, color: "#808080" }}>$ 1000 MAX</span>
                  </div>
                </div>

                {!canLaunch && (
                  <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <AlertTriangle size={11} style={{ color: "#fbbf24", flexShrink: 0 }} />
                    <span style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "#808080" }}>
                      {!selectedAthlete ? "Selecciona un rival" : "Define la modalidad del reto"}
                    </span>
                  </div>
                )}
                <button onClick={launchChallenge} disabled={!canLaunch}
                  className="w-full py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                  style={{
                    background: canLaunch ? "#CEFF00" : "rgba(255,255,255,0.06)",
                    border: "none", cursor: canLaunch ? "pointer" : "not-allowed",
                    fontFamily: DS, fontStyle: "italic", fontWeight: 900, fontSize: 18, letterSpacing: "0.1em", textTransform: "uppercase",
                    color: canLaunch ? "#000" : "#808080",
                    boxShadow: canLaunch ? "0 0 32px rgba(206,255,0,0.35)" : "none",
                    opacity: canLaunch ? 1 : 0.55,
                  }}>
                  <Zap size={18} fill={selectedAthlete && challengeModality ? "#000" : "#808080"} stroke="none" />
                  LANZAR RETO [ ⚡ ]
                </button>
              </div>

              {/* Monitor de Combate */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 22, textTransform: "uppercase", letterSpacing: "0.04em", color: "#fff", lineHeight: 1 }}>
                    ⚔️ MONITOR DE COMBATE
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#CEFF00" }} />
                    <span style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "#CEFF00" }}>{liveStakes.length} RETOS ACTIVOS</span>
                  </div>
                </div>
                {liveStakes.length === 0 && (
                  <div className="rounded-xl p-6 text-center" style={{ background: "rgba(26,26,26,0.2)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#808080", display: "block", marginBottom: 8 }}>
                      ⚔️ [ SYSTEM INTEL // ARENA VACÍA ]
                    </span>
                    <button
                      onClick={() => setCurrentRoomView("members")}
                      className="inline-flex items-center gap-1 active:scale-[0.97] active:opacity-90 transition-all duration-150"
                      style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#CEFF00", background: "none", border: "none", cursor: "pointer", textShadow: "0 0 12px rgba(206,255,0,0.5)" }}>
                      [ INICIAR DESAFÍO EN ROSTER → ]
                    </button>
                  </div>
                )}
                {liveStakes.map(stake => {
                  const myPct    = stake.myMax  > 0 ? Math.min(100, Math.round((stake.myScore    / stake.myMax)    * 100)) : 0;
                  const rivalPct = stake.rivalMax > 0 ? Math.min(100, Math.round((stake.rivalScore / stake.rivalMax) * 100)) : 0;
                  const isLive   = stake.status === "EN COMBATE TÁCTICO";
                  const myInitials = student.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
                  const rivalInit  = stake.opponent.slice(0, 2);
                  return (
                    <button key={stake.id} onClick={() => setSelectedActiveChallenge(stake)}
                      className="w-full rounded-[24px] p-5 mb-4 flex flex-col relative text-left active:scale-[0.98] transition-transform"
                      style={{ background: "#1A1A1A", border: isLive ? "1px solid rgba(206,255,0,0.2)" : "1px solid rgba(255,255,255,0.04)", boxShadow: isLive ? "0 0 20px rgba(206,255,0,0.05)" : "none", cursor: "pointer" }}>

                      {/* Status token */}
                      <div className="absolute top-4 right-4">
                        {isLive ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full animate-pulse"
                            style={{ background: "rgba(206,255,0,0.1)", border: "1px solid rgba(206,255,0,0.35)" }}>
                            <Zap size={9} fill="#CEFF00" stroke="none" />
                            <span style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.14em", textTransform: "uppercase", color: "#CEFF00", fontWeight: 900, whiteSpace: "nowrap" }}>EN COMBATE</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                            style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)" }}>
                            <span style={{ fontSize: 8 }}>⏳</span>
                            <span style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fbbf24", fontWeight: 900, whiteSpace: "nowrap" }}>AGUARDANDO</span>
                          </div>
                        )}
                      </div>

                      <p style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "#808080", marginBottom: 14 }}>{stake.modality}</p>

                      {/* Face-off */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="w-14 h-14 rounded-full flex items-center justify-center"
                            style={{ background: student.avatarColor ?? "linear-gradient(135deg,#CEFF00,#00F0FF)", boxShadow: "0 0 0 2.5px #CEFF00, 0 0 16px rgba(206,255,0,0.4)" }}>
                            <span style={{ fontFamily: DS, fontWeight: 900, fontSize: 14, color: "#000" }}>{myInitials}</span>
                          </div>
                          <span style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.1em", textTransform: "uppercase", color: "#CEFF00", fontWeight: 900 }}>TÚ</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <div className="relative flex items-center justify-center">
                            <div style={{ position: "absolute", width: 60, height: 1.5, background: "linear-gradient(to right,rgba(206,255,0,0.4),rgba(206,255,0,0.9),rgba(206,255,0,0.4))", transform: "rotate(-8deg)" }} />
                            <span style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 22, color: "#CEFF00", letterSpacing: "0.02em", position: "relative", zIndex: 1, textShadow: "0 0 12px rgba(206,255,0,0.6)" }}>VS</span>
                          </div>
                          <div className="mt-1 px-3 py-1 rounded-lg" style={{ background: "rgba(206,255,0,0.06)", border: "1px solid rgba(206,255,0,0.25)" }}>
                            <span style={{ fontFamily: MONO, fontWeight: 900, fontSize: 11, letterSpacing: "0.06em", color: "#CEFF00" }}>$ {stake.pool.toFixed(2)} USD</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="w-14 h-14 rounded-full flex items-center justify-center"
                            style={{ background: stake.opponentColor, boxShadow: "0 0 0 2px rgba(0,240,255,0.6), 0 0 14px rgba(0,240,255,0.25)" }}>
                            <span style={{ fontFamily: DS, fontWeight: 900, fontSize: 14, color: "#000" }}>{rivalInit}</span>
                          </div>
                          <span style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.1em", textTransform: "uppercase", color: "#00F0FF", fontWeight: 900, maxWidth: 64, textAlign: "center", lineHeight: 1.3 }}>{stake.opponent.split("_")[0]}</span>
                        </div>
                      </div>

                      {/* Progress bars */}
                      <div className="mb-3">
                        <div className="flex justify-between mb-2">
                          <div>
                            <p style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", color: "#CEFF00", fontWeight: 900 }}>{stake.myScore.toLocaleString()}</p>
                            <p style={{ fontFamily: MONO, fontSize: 7, color: "#808080", textTransform: "uppercase", letterSpacing: "0.08em" }}>MI MARCA</p>
                          </div>
                          <div className="text-right">
                            <p style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", color: "#00F0FF", fontWeight: 900 }}>{stake.rivalScore.toLocaleString()}</p>
                            <p style={{ fontFamily: MONO, fontSize: 7, color: "#808080", textTransform: "uppercase", letterSpacing: "0.08em" }}>RIVAL</p>
                          </div>
                        </div>
                        <div className="w-full rounded-full overflow-hidden mb-2" style={{ height: 8, background: "rgba(255,255,255,0.06)" }}>
                          <div style={{ height: "100%", width: `${myPct}%`, borderRadius: 9999, background: "linear-gradient(to right,rgba(206,255,0,0.6),#CEFF00)", boxShadow: myPct > 0 ? "0 0 8px rgba(206,255,0,0.5)" : "none", transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)", minWidth: myPct > 0 ? 4 : 0 }} />
                        </div>
                        <div className="w-full rounded-full overflow-hidden" style={{ height: 8, background: "rgba(255,255,255,0.06)" }}>
                          <div style={{ height: "100%", width: `${rivalPct}%`, borderRadius: 9999, background: "linear-gradient(to right,rgba(0,240,255,0.5),#00F0FF)", boxShadow: rivalPct > 0 ? "0 0 8px rgba(0,240,255,0.4)" : "none", transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)", minWidth: rivalPct > 0 ? 4 : 0 }} />
                        </div>
                        <div className="flex justify-between mt-1.5">
                          <span style={{ fontFamily: MONO, fontSize: 7, color: "#CEFF00" }}>{myPct}% completado</span>
                          <span style={{ fontFamily: MONO, fontSize: 7, color: "#00F0FF" }}>{rivalPct}% completado</span>
                        </div>
                      </div>

                      {/* Tap hint */}
                      <div className="flex items-center justify-center gap-1 mt-2 opacity-40">
                        <span style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.1em", textTransform: "uppercase", color: "#808080" }}>TAP PARA DETALLE →</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── DETAIL OVERLAY (when a battle card is tapped) ── */}
          {selectedActiveChallenge !== null && (() => {
            const stake = selectedActiveChallenge;
            const myPct    = stake.myMax  > 0 ? Math.min(100, Math.round((stake.myScore    / stake.myMax)    * 100)) : 0;
            const rivalPct = stake.rivalMax > 0 ? Math.min(100, Math.round((stake.rivalScore / stake.rivalMax) * 100)) : 0;
            const isLive   = stake.status === "EN COMBATE TÁCTICO";
            const myInitials = student.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
            const rivalInit  = stake.opponent.slice(0, 2);
            const iWinning   = stake.myScore > stake.rivalScore;

            return (
              <div className="fixed inset-0 z-[55] flex flex-col overflow-y-auto"
                style={{ background: "#070708", animation: "mc-overlay-in 0.3s cubic-bezier(0.16,1,0.3,1) both" }}>

                {/* Back + title bar */}
                <div className="flex items-center gap-3 px-4 pt-5 pb-4 sticky top-0 z-10"
                  style={{ background: "rgba(7,7,8,0.95)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <button onClick={() => setSelectedActiveChallenge(null)}
                    className="flex items-center justify-center w-9 h-9 rounded-full active:scale-90 transition-transform"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }}>
                    <ChevronLeft size={16} style={{ color: "#fff" }} />
                  </button>
                  <div className="flex-1">
                    <p style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 18, textTransform: "uppercase", letterSpacing: "0.04em", color: "#fff", lineHeight: 1 }}>DETALLE DE RETO</p>
                    <p style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#808080", marginTop: 2 }}>{stake.modality}</p>
                  </div>
                  {/* Status badge */}
                  {isLive ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full animate-pulse"
                      style={{ background: "rgba(206,255,0,0.1)", border: "1px solid rgba(206,255,0,0.35)" }}>
                      <Zap size={9} fill="#CEFF00" stroke="none" />
                      <span style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.14em", textTransform: "uppercase", color: "#CEFF00", fontWeight: 900, whiteSpace: "nowrap" }}>EN COMBATE</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)" }}>
                      <span style={{ fontSize: 8 }}>⏳</span>
                      <span style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fbbf24", fontWeight: 900, whiteSpace: "nowrap" }}>AGUARDANDO</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 px-4 py-5 space-y-4">
                  {/* Pool header */}
                  <div className="rounded-2xl p-5 text-center"
                    style={{ background: "rgba(206,255,0,0.04)", border: "1px solid rgba(206,255,0,0.2)", boxShadow: "0 0 28px rgba(206,255,0,0.07)" }}>
                    <p style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "#808080", marginBottom: 8 }}>POOL TOTAL EN ESCROW</p>
                    <p style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 52, color: "#CEFF00", lineHeight: 1 }}>$ {stake.pool.toFixed(2)}</p>
                    <p style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#808080", marginTop: 4 }}>USD · BLOQUEADO</p>
                  </div>

                  {/* Face-off + scores */}
                  <div className="rounded-2xl p-5"
                    style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{ background: student.avatarColor ?? "linear-gradient(135deg,#CEFF00,#00F0FF)", boxShadow: "0 0 0 2.5px #CEFF00, 0 0 20px rgba(206,255,0,0.4)" }}>
                          <span style={{ fontFamily: DS, fontWeight: 900, fontSize: 16, color: "#000" }}>{myInitials}</span>
                        </div>
                        <span style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.1em", textTransform: "uppercase", color: "#CEFF00", fontWeight: 900 }}>TÚ</span>
                        <span style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 26, color: "#CEFF00", lineHeight: 1 }}>{stake.myScore.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="relative flex items-center justify-center">
                          <div style={{ position: "absolute", width: 60, height: 1.5, background: "linear-gradient(to right,rgba(206,255,0,0.4),rgba(206,255,0,0.9),rgba(206,255,0,0.4))", transform: "rotate(-8deg)" }} />
                          <span style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 26, color: "#CEFF00", position: "relative", zIndex: 1, textShadow: "0 0 16px rgba(206,255,0,0.6)" }}>VS</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{ background: stake.opponentColor, boxShadow: "0 0 0 2px rgba(0,240,255,0.6), 0 0 18px rgba(0,240,255,0.3)" }}>
                          <span style={{ fontFamily: DS, fontWeight: 900, fontSize: 16, color: "#000" }}>{rivalInit}</span>
                        </div>
                        <span style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.1em", textTransform: "uppercase", color: "#00F0FF", fontWeight: 900, textAlign: "center" }}>{stake.opponent.split("_")[0]}</span>
                        <span style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 26, color: "#00F0FF", lineHeight: 1 }}>{stake.rivalScore.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Progress tracks */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span style={{ fontFamily: MONO, fontSize: 7, color: "#CEFF00", width: 30, textAlign: "right" }}>{myPct}%</span>
                        <div className="flex-1 rounded-full overflow-hidden" style={{ height: 10, background: "rgba(255,255,255,0.06)" }}>
                          <div style={{ height: "100%", width: `${myPct}%`, borderRadius: 9999, background: "linear-gradient(to right,rgba(206,255,0,0.6),#CEFF00)", boxShadow: myPct > 0 ? "0 0 10px rgba(206,255,0,0.5)" : "none", transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)", minWidth: myPct > 0 ? 6 : 0 }} />
                        </div>
                        <span style={{ fontFamily: MONO, fontSize: 7, color: "#808080", width: 24 }}>TÚ</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span style={{ fontFamily: MONO, fontSize: 7, color: "#00F0FF", width: 30, textAlign: "right" }}>{rivalPct}%</span>
                        <div className="flex-1 rounded-full overflow-hidden" style={{ height: 10, background: "rgba(255,255,255,0.06)" }}>
                          <div style={{ height: "100%", width: `${rivalPct}%`, borderRadius: 9999, background: "linear-gradient(to right,rgba(0,240,255,0.5),#00F0FF)", boxShadow: rivalPct > 0 ? "0 0 10px rgba(0,240,255,0.4)" : "none", transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)", minWidth: rivalPct > 0 ? 6 : 0 }} />
                        </div>
                        <span style={{ fontFamily: MONO, fontSize: 7, color: "#808080", width: 24 }}>RVL</span>
                      </div>
                    </div>
                  </div>

                  {/* Reglas de Enganche */}
                  <div className="rounded-2xl p-4"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <p style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "#808080", marginBottom: 10 }}>⚖️ REGLAS DE ENGANCHE</p>
                    {[
                      { rule: "MODALIDAD", value: stake.modality },
                      { rule: "POOL ESCROW", value: `$ ${stake.pool.toFixed(2)} USD` },
                      { rule: "ESTADO", value: stake.status },
                      { rule: "CONDICIÓN DE VICTORIA", value: "MAYOR MARCA AL VENCIMIENTO" },
                    ].map(({ rule, value }) => (
                      <div key={rule} className="flex justify-between items-center py-2.5"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "#808080" }}>{rule}</span>
                        <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff", fontWeight: 900 }}>{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <button
                    disabled={!iWinning || claimInFlight.current}
                    onClick={() => {
                      if (!iWinning || claimInFlight.current) return;
                      claimInFlight.current = true;
                      setClaimedPool(stake.pool);
                      onClaimPrize(stake.pool).finally(() => { claimInFlight.current = false; });
                      setLiveStakes(prev => prev.filter(s => s.id !== stake.id));
                      setSelectedActiveChallenge(null);
                      setShowClaimModal(true);
                    }}
                    className="w-full py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                    style={{
                      background: iWinning ? "#CEFF00" : "rgba(255,255,255,0.04)",
                      border: "none", cursor: iWinning ? "pointer" : "not-allowed",
                      fontFamily: DS, fontStyle: "italic", fontWeight: 900, fontSize: 18, letterSpacing: "0.1em", textTransform: "uppercase",
                      color: iWinning ? "#000" : "#808080",
                      boxShadow: iWinning ? "0 0 32px rgba(206,255,0,0.35)" : "none",
                      opacity: iWinning ? 1 : 0.4,
                    }}>
                    <Trophy size={18} style={{ color: iWinning ? "#000" : "#808080" }} />
                    RECLAMAR PREMIO
                  </button>
                  {!iWinning && (
                    <p style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: -8, marginBottom: 4 }}>
                      Disponible solo cuando tu marca supera al rival
                    </p>
                  )}

                  <button
                    onClick={() => {
                      if (!window.confirm("¿Seguro que quieres abandonar este reto? Perderás la apuesta.")) return;
                      setLiveStakes(prev => prev.filter(s => s.id !== stake.id));
                      setSelectedActiveChallenge(null);
                    }}
                    className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                    style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.2)", cursor: "pointer", fontFamily: MONO, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "#f87171", fontWeight: 900 }}>
                    ABANDONAR RETO
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          VIEW: MEMBERS
      ════════════════════════════════════════════════════════════ */}
      {currentRoomView === "members" && (
        <div className="px-4 pt-5 animate-mc-room-view-in">
          <h2 style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 24, textTransform: "uppercase", letterSpacing: "0.04em", color: "#fff", lineHeight: 1, marginBottom: 4 }}>
            ROSTER DE ATLETAS
          </h2>
          <p style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "#808080", marginBottom: 14 }}>
            {rosterMembers.length} REGISTRADOS
          </p>

          {/* Search bar */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "#1A1A1A", border: showRosterFilter ? "1px solid rgba(206,255,0,0.2)" : "1px solid rgba(255,255,255,0.04)", marginBottom: showRosterFilter ? 0 : 12 }}>
            <Search size={14} style={{ color: "#808080", flexShrink: 0 }} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar atleta o rango..."
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: 13, color: "#fff", fontFamily: "inherit" }} />
            <button onClick={() => setShowRosterFilter(v => !v)} className="relative flex-shrink-0 active:scale-90 transition-transform">
              <SlidersHorizontal size={14} style={{ color: activeFilterCount > 0 ? "#CEFF00" : "#808080" }} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center font-black"
                  style={{ background: "#CEFF00", color: "#000", fontSize: 7, fontFamily: MONO }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Collapsible filter strip */}
          {showRosterFilter && (
            <div className="mb-4 rounded-b-xl px-4 pb-4 pt-3"
              style={{ background: "#1A1A1A", borderLeft: "1px solid rgba(206,255,0,0.2)", borderRight: "1px solid rgba(206,255,0,0.2)", borderBottom: "1px solid rgba(206,255,0,0.2)", animation: "mc-overlay-in 0.18s ease both" }}>
              {/* Rank filter */}
              <p className="font-mono text-[8px] uppercase tracking-widest mb-2" style={{ color: "#808080" }}>RANGO</p>
              <div className="flex gap-2 flex-wrap mb-3">
                {["ATLETA", "GUERRERO", "BESTIA", "LEYENDA"].map(r => (
                  <button key={r} onClick={() => setFilterRank(filterRank === r ? null : r)}
                    className="px-2.5 py-1 rounded-lg font-mono font-black text-[8px] uppercase tracking-wider transition-all active:scale-90"
                    style={{ background: filterRank === r ? "#CEFF00" : "rgba(255,255,255,0.05)", color: filterRank === r ? "#000" : "#808080", border: filterRank === r ? "none" : "1px solid rgba(255,255,255,0.08)", letterSpacing: "0.1em" }}>
                    {r}
                  </button>
                ))}
              </div>
              {/* Online + Streak row */}
              <div className="flex items-center gap-3 flex-wrap">
                <button onClick={() => setFilterOnline(v => !v)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono font-black text-[8px] uppercase tracking-wider transition-all active:scale-90"
                  style={{ background: filterOnline ? "#CEFF00" : "rgba(255,255,255,0.05)", color: filterOnline ? "#000" : "#808080", border: filterOnline ? "none" : "1px solid rgba(255,255,255,0.08)", letterSpacing: "0.1em" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: filterOnline ? "#000" : "#22c55e" }} />
                  EN LÍNEA
                </button>
                {[0, 7, 14, 30].map(n => (
                  <button key={n} onClick={() => setFilterStreakMin(filterStreakMin === n ? 0 : n)}
                    className="px-2.5 py-1 rounded-lg font-mono font-black text-[8px] uppercase tracking-wider transition-all active:scale-90"
                    style={{ background: filterStreakMin === n && n > 0 ? "#CEFF00" : "rgba(255,255,255,0.05)", color: filterStreakMin === n && n > 0 ? "#000" : "#808080", border: filterStreakMin === n && n > 0 ? "none" : "1px solid rgba(255,255,255,0.08)", letterSpacing: "0.1em", display: n === 0 ? "none" : "block" }}>
                    +{n}D
                  </button>
                ))}
              </div>
              {activeFilterCount > 0 && (
                <button onClick={() => { setFilterRank(null); setFilterOnline(false); setFilterStreakMin(0); }}
                  className="mt-3 font-mono font-black text-[7.5px] uppercase tracking-widest active:opacity-60"
                  style={{ color: "#f87171", letterSpacing: "0.14em", background: "none", border: "none", cursor: "pointer" }}>
                  ✕ LIMPIAR FILTROS
                </button>
              )}
            </div>
          )}

          {/* 2-col grid */}
          <div className="grid grid-cols-2 gap-4 w-full">
            {filteredRoster.map(member => (
              <div key={member.id} className="relative flex flex-col rounded-2xl overflow-hidden active:scale-[0.97] active:opacity-90 transition-all duration-150 ease-out"
                style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.04)" }}>
                <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded"
                  style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <span style={{ fontFamily: MONO, fontSize: 6.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>{member.rankBadgeTitle}</span>
                </div>
                <div className="flex flex-col items-center pt-9 pb-3 px-3">
                  <div className="relative mb-3">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-sm"
                      style={{ background: member.avatarBgColor, fontFamily: DS, color: "#000" }}>
                      {member.avatarInitials}
                    </div>
                    <div className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-[#1A1A1A]"
                      style={{ background: member.isOnline ? "#CEFF00" : "#808080", boxShadow: member.isOnline ? "0 0 6px rgba(206,255,0,0.6)" : "none" }} />
                  </div>
                  <p className="font-bold text-white text-center leading-tight" style={{ fontSize: 12 }}>{member.name.replace(/_/g, " ")}</p>
                  <p style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.1em", textTransform: "uppercase", color: "#808080", marginTop: 3, textAlign: "center" }}>
                    {member.rankBadgeTitle.split(" ")[0]} · RNK #{member.rnk.toString().padStart(2, "0")}
                  </p>
                </div>
                <div className="flex" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                  <button onClick={() => setSelectedRosterProfile(member)}
                    className="flex-1 py-2.5 flex items-center justify-center active:opacity-60 transition-opacity"
                    style={{ background: "none", border: "none", borderRight: "1px solid rgba(255,255,255,0.04)", cursor: "pointer" }}>
                    <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "#808080" }}>PERFIL</span>
                  </button>
                  <button onClick={() => setCurrentRoomView("retos")}
                    className="w-12 py-2.5 flex items-center justify-center active:scale-90 transition-transform"
                    style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <Zap size={13} fill="#CEFF00" stroke="none" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {filteredRoster.length === 0 && (
            <div className="col-span-2 rounded-xl p-6 text-center mt-2" style={{ background: "rgba(26,26,26,0.2)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#808080", display: "block", marginBottom: 10 }}>
                🚫 [ NO ATHLETES MATCH RADAR REQUIREMENTS ]
              </span>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setFilterRank(null); setFilterOnline(false); setFilterStreakMin(0); setSearchQuery(""); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg active:scale-[0.97] active:opacity-90 transition-all duration-150"
                  style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#CEFF00", background: "rgba(206,255,0,0.06)", border: "1px solid rgba(206,255,0,0.18)", cursor: "pointer" }}>
                  ✕ RESET RADAR FILTERS
                </button>
              )}
            </div>
          )}
        </div>
      )}

      </div>{/* end main content */}

      {/* ═══════════════════════════════════════════════════════════
          MODALITY PICKER MODAL
      ═══════════════════════════════════════════════════════════ */}
      {showModalityPicker && (
        <>
          <div className="fixed inset-0 bg-[#070708]/85 backdrop-blur-sm z-[60]"
            onClick={() => setShowModalityPicker(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm z-[61] rounded-[24px] overflow-hidden"
            style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 0 50px rgba(0,0,0,0.9)" }}>

            {/* Picker header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <p style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "#CEFF00" }}>⚡ MODALIDAD DE COMBATE</p>
              <button onClick={() => setShowModalityPicker(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                style={{ background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer" }}>
                <X size={13} style={{ color: "#808080" }} />
              </button>
            </div>

            {/* Predefined options */}
            {!useCustomChallenge && (
              <div className="px-4 py-3">
                {CHALLENGE_MODALITIES.map(mod => (
                  <button key={mod.id} onClick={() => { setChallengeModality(mod.id); setUseCustomChallenge(false); setShowModalityPicker(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl mb-2 active:scale-[0.98] transition-transform"
                    style={{ background: challengeModality === mod.id ? "rgba(206,255,0,0.06)" : "rgba(255,255,255,0.03)", border: challengeModality === mod.id ? "1.5px solid #CEFF00" : "1px solid rgba(255,255,255,0.06)", cursor: "pointer", textAlign: "left" }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{mod.emoji}</span>
                    <div className="flex-1">
                      <p style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: challengeModality === mod.id ? "#CEFF00" : "#fff", fontWeight: 900 }}>{mod.label}</p>
                      <p style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.08em", textTransform: "uppercase", color: "#808080", marginTop: 2 }}>{mod.sub}</p>
                    </div>
                    {challengeModality === mod.id && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#CEFF00" }} />}
                  </button>
                ))}

                {/* Custom option trigger */}
                <button onClick={() => setUseCustomChallenge(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl mt-1 active:scale-[0.98] transition-transform"
                  style={{ background: "rgba(206,255,0,0.03)", border: "1.5px dashed rgba(206,255,0,0.25)", cursor: "pointer" }}>
                  <Plus size={13} style={{ color: "#CEFF00" }} />
                  <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#CEFF00", fontWeight: 900 }}>CREAR RETO PERSONALIZADO</span>
                </button>
              </div>
            )}

            {/* Custom challenge input */}
            {useCustomChallenge && (
              <div className="px-4 py-4">
                <button onClick={() => setUseCustomChallenge(false)}
                  className="flex items-center gap-1.5 mb-4 active:opacity-60"
                  style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <ChevronLeft size={14} style={{ color: "#808080" }} />
                  <span style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "#808080" }}>VOLVER</span>
                </button>
                <p style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "#808080", marginBottom: 10 }}>🎯 DEFINE TU MÉTRICA</p>
                <input
                  value={customChallengeText}
                  onChange={e => setCustomChallengeText(e.target.value.toUpperCase())}
                  placeholder="EJ: MÁXIMAS DOMINADAS, INGESTA AGUA..."
                  autoFocus
                  className="w-full bg-[#070708] border border-white/[0.08] rounded-xl text-white p-3 font-mono text-sm uppercase placeholder-[#808080] focus:border-[#CEFF00]/50 outline-none mb-4"
                  style={{ letterSpacing: "0.06em", fontSize: 12 }}
                />
                <button
                  onClick={() => {
                    if (!customChallengeText.trim()) return;
                    setChallengeModality(customChallengeText.trim());
                    setCustomChallengeText("");
                    setUseCustomChallenge(false);
                    setShowModalityPicker(false);
                  }}
                  disabled={!customChallengeText.trim()}
                  className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                  style={{
                    background: customChallengeText.trim() ? "#CEFF00" : "rgba(255,255,255,0.06)",
                    border: "none", cursor: customChallengeText.trim() ? "pointer" : "not-allowed",
                    fontFamily: DS, fontStyle: "italic", fontWeight: 900, fontSize: 16, letterSpacing: "0.1em", textTransform: "uppercase",
                    color: customChallengeText.trim() ? "#000" : "#808080",
                    opacity: customChallengeText.trim() ? 1 : 0.5,
                  }}>
                  CONFIRMAR RETO PERSONALIZADO
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
          ROSTER PROFILE — FULL-SCREEN OVERLAY (z-50 masks nav)
      ═══════════════════════════════════════════════════════════ */}
      {selectedRosterProfile !== null && (() => {
        const mp = selectedRosterProfile;
        const prRows = [
          { label: "MAX DEADLIFT", value: `${mp.prs.maxDeadlift} KG` },
          { label: "MAX SQUAT",    value: `${mp.prs.maxSquat} KG`    },
          { label: "BENCH PRESS",  value: `${mp.prs.benchPress} KG`  },
          { label: "KCAL RECORD",  value: `${mp.prs.kcalRecord.toLocaleString()} KCAL` },
        ];
        return (
          <div className="fixed inset-0 bg-[#070708]/95 backdrop-blur-md z-50 flex flex-col overflow-y-auto pb-32"
            style={{ animation: "mc-overlay-in 0.25s cubic-bezier(0.16,1,0.3,1) both" }}>

            {/* ── Top nav header ── */}
            <div className="flex items-center justify-between px-5 pt-safe-top pt-6 pb-4 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <p style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 18, textTransform: "uppercase", letterSpacing: "0.05em", color: "#fff" }}>
                PERFIL DE ATLETA DE ÉLITE
              </p>
              <button onClick={() => setSelectedRosterProfile(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full active:scale-90 transition-transform"
                style={{ background: "rgba(206,255,0,0.08)", border: "1px solid rgba(206,255,0,0.25)", cursor: "pointer" }}>
                <X size={12} style={{ color: "#CEFF00" }} />
                <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "#CEFF00", fontWeight: 900 }}>CERRAR</span>
              </button>
            </div>

            {/* ── Avatar + identity ── */}
            <div className="flex flex-col items-center px-6 pt-8 pb-6"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full flex items-center justify-center font-black text-2xl"
                  style={{ background: mp.avatarBgColor, fontFamily: DS, color: "#000", boxShadow: "0 0 0 3px rgba(206,255,0,0.3), 0 0 32px rgba(206,255,0,0.15)" }}>
                  {mp.avatarInitials}
                </div>
                <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full border-[2.5px]"
                  style={{ background: mp.isOnline ? "#CEFF00" : "#808080", borderColor: "#070708", boxShadow: mp.isOnline ? "0 0 10px rgba(206,255,0,0.7)" : "none" }} />
              </div>
              <p style={{ fontFamily: DS, fontWeight: 900, fontSize: 26, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "center", lineHeight: 1.1 }}>
                {mp.name.replace(/_/g, " ")}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-0.5 rounded-full"
                  style={{ background: "rgba(206,255,0,0.08)", border: "1px solid rgba(206,255,0,0.2)", fontFamily: MONO, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "#CEFF00", fontWeight: 900 }}>
                  {mp.rankBadgeTitle}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: "#808080" }}>
                  RNK #{mp.rnk.toString().padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* ── Bio telemetry tiles ── */}
            <div className="grid grid-cols-2 gap-3 px-5 py-5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              {[
                { label: "RACHA ACTIVA",    value: `${mp.rachaActiveDays} DÍAS`, accent: "#CEFF00" },
                { label: "ESTADO",           value: mp.isOnline ? "EN LÍNEA" : "OFFLINE",  accent: mp.isOnline ? "#CEFF00" : "#808080" },
                { label: "PTS TOTALES",      value: mp.pts.toLocaleString(),    accent: "#00F0FF" },
                { label: "KCAL ACUMULADAS",  value: mp.kcal.toLocaleString(),   accent: "#00F0FF" },
              ].map(stat => (
                <div key={stat.label} className="rounded-xl p-4 text-center"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.14em", textTransform: "uppercase", color: "#808080", marginBottom: 6 }}>{stat.label}</p>
                  <p style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 22, color: stat.accent, lineHeight: 1 }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* ── PRs Registrados ── */}
            <div className="px-5 py-5">
              <p style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "#808080", marginBottom: 14 }}>🏆 PRs REGISTRADOS</p>
              {prRows.map(pr => (
                <div key={pr.label} className="flex items-center justify-between py-3.5"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "#808080" }}>{pr.label}</span>
                  <span style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 20, color: "#fff" }}>{pr.value}</span>
                </div>
              ))}
            </div>

            {/* ── Actions ── */}
            <div className="px-5 pt-2 pb-8 flex gap-3">
              <button onClick={() => { setSelectedRosterProfile(null); setSelectedAthlete(mp.name); setCurrentRoomView("retos"); }}
                className="flex-1 py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                style={{ background: "#CEFF00", border: "none", cursor: "pointer", fontFamily: DS, fontStyle: "italic", fontWeight: 900, fontSize: 16, letterSpacing: "0.1em", textTransform: "uppercase", color: "#000", boxShadow: "0 0 28px rgba(206,255,0,0.3)" }}>
                <Zap size={16} fill="#000" stroke="none" />
                ENVIAR RETO
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── 🏆 CLAIM PRIZE CELEBRATION MODAL ── */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-[#070708]/97 backdrop-blur-md z-[70] flex flex-col items-center justify-center px-6"
          style={{ animation: "mc-overlay-in 0.35s cubic-bezier(0.16,1,0.3,1) both" }}>
          {/* Volt glow ring */}
          <div className="w-28 h-28 rounded-full flex items-center justify-center mb-6"
            style={{ background: "rgba(206,255,0,0.08)", border: "2px solid rgba(206,255,0,0.4)", boxShadow: "0 0 60px rgba(206,255,0,0.25)" }}>
            <Trophy size={48} style={{ color: "#CEFF00" }} />
          </div>
          <p style={{ fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "#CEFF00", marginBottom: 8 }}>
            ⚡ VICTORIA CONFIRMADA
          </p>
          <p style={{ fontFamily: "var(--font-display,'Barlow Condensed',sans-serif)", fontWeight: 900, fontStyle: "italic", fontSize: 42, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em", lineHeight: 1, marginBottom: 4, textAlign: "center" }}>
            PREMIO RECLAMADO
          </p>
          <p style={{ fontFamily: "var(--font-display,'Barlow Condensed',sans-serif)", fontWeight: 900, fontStyle: "italic", fontSize: 56, color: "#CEFF00", lineHeight: 1, marginBottom: 6 }}>
            $ {claimedPool.toFixed(2)}
          </p>
          <p style={{ fontFamily: "'Courier New',monospace", fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "#00F0FF", marginBottom: 4 }}>
            USD · TRANSFERIDO CON ÉXITO A TU BILLETERA
          </p>
          <p style={{ fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: "#808080", marginBottom: 32 }}>
            SALDO ACTUAL: ${walletBalance.toLocaleString()} USD
          </p>
          <div className="w-full max-w-xs space-y-3">
            <button onClick={() => setShowClaimModal(false)}
              className="w-full py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
              style={{ background: "#CEFF00", border: "none", cursor: "pointer", fontFamily: "var(--font-display,'Barlow Condensed',sans-serif)", fontStyle: "italic", fontWeight: 900, fontSize: 18, letterSpacing: "0.1em", textTransform: "uppercase", color: "#000", boxShadow: "0 0 36px rgba(206,255,0,0.4)" }}>
              CONTINUAR
            </button>
            <button onClick={() => { setShowClaimModal(false); setCurrentRoomView("retos"); }}
              className="w-full py-3 rounded-xl flex items-center justify-center active:opacity-60 transition-opacity"
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Courier New',monospace", fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "#808080" }}>
              VER MIS RETOS
            </button>
          </div>
        </div>
      )}

      {/* ── General info toast ── */}
      {infoToast && (
        <div className="fixed top-6 left-1/2 z-[65] flex items-center gap-3 px-5 py-3.5 rounded-2xl"
          style={{
            transform: "translateX(-50%)",
            background: "rgba(206,255,0,0.08)",
            border: "1px solid rgba(206,255,0,0.35)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 0 24px rgba(206,255,0,0.15)",
            animation: "mc-toast-lifecycle 2.4s cubic-bezier(0.16,1,0.3,1) forwards",
            whiteSpace: "nowrap",
          }}>
          <Zap size={13} fill="#CEFF00" stroke="none" />
          <span style={{ fontFamily: "'Courier New',monospace", fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#CEFF00", fontWeight: 900 }}>
            {infoToastMsg}
          </span>
        </div>
      )}

      {/* ── Challenge dispatch toast (cyan, 2 s) ── */}
      {challengeToast && (
        <div className="fixed top-6 left-1/2 z-[60] flex items-center gap-3 px-5 py-3.5 rounded-2xl"
          style={{
            transform: "translateX(-50%)",
            background: "rgba(0,240,255,0.1)",
            border: "1px solid rgba(0,240,255,0.45)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 0 28px rgba(0,240,255,0.2)",
            animation: "mc-toast-lifecycle 2s cubic-bezier(0.16,1,0.3,1) forwards",
            whiteSpace: "nowrap",
          }}>
          <Zap size={15} fill="#00F0FF" stroke="none" />
          <span style={{ fontFamily: "'Courier New',monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#00F0FF", fontWeight: 900 }}>
            {challengeToastMsg}
          </span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          NEW POST MODAL (opened by FAB) — centered card
      ═══════════════════════════════════════════════════════════ */}
      {showPostModal && (
        <>
          {/* Deep backdrop — hides nav bars completely */}
          <div className="fixed inset-0 bg-[#070708]/90 backdrop-blur-sm z-40"
            onClick={() => { setShowPostModal(false); setNewPostText(""); }} />

          {/* Centered card */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md w-[92%] bg-[#1A1A1A] z-50 rounded-[24px] p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/[0.06]">

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: 22, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                NUEVO POST
              </h3>
              <button onClick={() => { setShowPostModal(false); setNewPostText(""); }}
                className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }}>
                <X size={16} style={{ color: "#808080" }} />
              </button>
            </div>

            {/* Composer row */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-black flex-shrink-0"
                style={{ background: student.avatarColor ?? "linear-gradient(135deg,#CEFF00,#00F0FF)", color: "#000", fontFamily: DS }}>
                {initials(student.name)}
              </div>
              <textarea value={newPostText} onChange={e => setNewPostText(e.target.value)}
                placeholder="Comparte tu PR, entrenamiento o motivación..." rows={3} autoFocus
                className="flex-1 bg-transparent resize-none outline-none"
                style={{ fontSize: 13, color: "#fff", fontFamily: "inherit", lineHeight: 1.6, paddingBottom: 4, borderBottom: "1px solid rgba(255,255,255,0.08)" }} />
            </div>

            {/* Media upload slot */}
            <div className="w-full h-32 border border-dashed border-white/[0.1] rounded-xl flex flex-col justify-center items-center text-xs text-[#808080] bg-[#070708]/40 mb-4 cursor-pointer hover:border-[#CEFF00]/40 transition-colors">
              <Camera size={22} style={{ color: "#808080", marginBottom: 8 }} />
              <span style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#808080" }}>AÑADIR FOTO / REPORTE DE PROGRESO</span>
            </div>

            {/* Submit */}
            <button
              onClick={() => {
                if (!newPostText.trim()) return;
                setActivityFeed(prev => [{
                  id: Date.now(),
                  handle: student.name.toUpperCase().replace(/\s+/g, "_"),
                  avatarColor: student.avatarColor ?? "linear-gradient(135deg,#CEFF00,#00F0FF)",
                  time: "Ahora",
                  exercise: "Nuevo Post",
                  badge: "NEW",
                  img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80&auto=format",
                  likes: 0,
                  comments: 0,
                  comment: newPostText.trim(),
                }, ...prev]);
                setShowPostModal(false);
                setNewPostText("");
              }}
              disabled={!newPostText.trim()}
              className="w-full py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
              style={{
                background: newPostText.trim() ? "#CEFF00" : "rgba(255,255,255,0.06)",
                opacity: newPostText.trim() ? 1 : 0.5,
                border: "none", cursor: "pointer",
                fontFamily: DS, fontStyle: "italic", fontWeight: 900, fontSize: 16, letterSpacing: "0.1em", textTransform: "uppercase",
                color: newPostText.trim() ? "#000" : "#808080",
              }}>
              <Send size={16} style={{ color: newPostText.trim() ? "#000" : "#808080" }} />
              PUBLICAR POST
            </button>
          </div>
        </>
      )}

    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   BOTTOM NAV BAR
══════════════════════════════════════════════════════════════ */

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "today",     label: "Dieta",     icon: Utensils },
  { id: "progress",  label: "Stats",     icon: TrendingUp },
  { id: "squads",    label: "Workout",   icon: Dumbbell },
  { id: "community", label: "Salas",     icon: MessageSquare },
  { id: "profile",   label: "Perfil",    icon: User },
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
              className="w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 shrink-0 active:scale-[0.92] active:opacity-90"
              style={{ background: "#CEFF00", boxShadow: "0 0 16px rgba(206,255,0,0.28)" }}>
              <Icon size={22} strokeWidth={2.5} style={{ color: "#000" }} />
            </button>
          );
          return (
            <button key={id} onClick={() => onChange(id)}
              className="flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-[0.92] active:opacity-90 transition-all duration-150 ease-out flex-1 py-2"
              style={{ minWidth: 48 }}>
              <Icon size={19} strokeWidth={1.5} style={{ color: "#808080" }} />
              <span style={{ fontFamily: DS, fontWeight: 900, fontStyle: "normal", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.06em", color: "#808080" }}>
                {label}
              </span>
            </button>
          );
        })}
        <button onClick={onSignOut}
          className="flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-[0.92] active:opacity-90 transition-all duration-150 ease-out flex-1 py-2"
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

function GlobalHeader({
  student,
  broadcastMessages,
  onOpenBriefing,
}: {
  student: Student;
  broadcastMessages: string[];
  onOpenBriefing: () => void;
}) {
  const DS   = "var(--font-display,'Barlow Condensed',sans-serif)";
  const MONO = "'Courier New',monospace";

  const [tickerIdx, setTickerIdx] = useState(0);

  useEffect(() => {
    if (broadcastMessages.length <= 1) return;
    const id = setInterval(() => {
      setTickerIdx(i => (i + 1) % broadcastMessages.length);
    }, 4200);
    return () => clearInterval(id);
  }, [broadcastMessages.length]);

  const currentMsg = broadcastMessages[tickerIdx] ?? "";

  // Parse message and wrap signal-word tokens in volt capsule badges
  const SIGNAL_WORDS = [
    "CERO MARGEN DE ERROR", "DISCIPLINA ABSOLUTA", "FELLS INTEL",
    "STREAK GRUPAL", "PROTOCOLO EN EJECUCIÓN", "PLAN ACTIVO",
    "DISCIPLINA", "PROTOCOLO", "ALINEACIÓN", "RECOMPOSICIÓN",
  ];
  const renderHudMsg = (msg: string): React.ReactNode => {
    const escaped = SIGNAL_WORDS.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const parts = msg.split(new RegExp(`(${escaped.join("|")})`, "gi"));
    return parts.map((part, i) => {
      if (SIGNAL_WORDS.some(w => w.toUpperCase() === part.toUpperCase())) {
        return (
          <span key={i}
            className="bg-[#CEFF00] text-black px-1.5 py-0.5 rounded-sm font-black mx-0.5"
            style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.08em", lineHeight: 1, display: "inline-block", verticalAlign: "middle" }}>
            {part.toUpperCase()}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="sticky top-0 z-40 flex flex-col"
      style={{ background: "rgba(7,7,8,0.96)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>

      {/* ── Row 1: Brand logo + Avatar ── */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <Zap size={14} fill="#CEFF00" stroke="none" />
          <span style={{ fontFamily: DS, fontWeight: 900, fontStyle: "italic", fontSize: "clamp(16px,4.8vw,19px)", letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff" }}>
            MYCOACH
          </span>
        </div>
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-full"
            style={{ boxShadow: "0 0 0 2px #070708, 0 0 0 4px #CEFF00, 0 0 18px rgba(206,255,0,0.35)", borderRadius: "50%" }} />
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-black relative z-10"
            style={{ background: student.avatarColor ?? "linear-gradient(135deg,#8b5cf6,#ec4899)", color: "#fff", fontFamily: DS, letterSpacing: "0.02em", border: "2px solid rgba(206,255,0,0.6)" }}>
            {student.avatarInitials}
          </div>
        </div>
      </div>

      {/* ── Row 2: Stealth HUD Capsule (tappable, zero background) ── */}
      {broadcastMessages.length > 0 && (
        <button
          onClick={onOpenBriefing}
          className="w-full flex items-center px-4 pb-3 pt-0 overflow-hidden text-left active:opacity-50 transition-opacity"
          style={{ background: "transparent", border: "none", cursor: "pointer" }}>
          {/* Tech bracket prefix */}
          <span aria-hidden style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: "rgba(206,255,0,0.28)", flexShrink: 0, whiteSpace: "nowrap" }}>
            [&nbsp;TACTICAL&nbsp;//&nbsp;
          </span>
          {/* Cycling message — scan-in on key change via animation */}
          <span
            key={tickerIdx}
            className="min-w-0 overflow-hidden"
            style={{
              flex: "1 1 0",
              display: "inline-flex",
              alignItems: "center",
              gap: 0,
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#808080",
              whiteSpace: "nowrap",
              overflow: "hidden",
              animation: "mc-hud-scan 0.28s cubic-bezier(0.16,1,0.3,1) both",
            }}>
            {renderHudMsg(currentMsg)}
          </span>
          {/* Tech bracket suffix */}
          <span aria-hidden style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: "rgba(206,255,0,0.28)", flexShrink: 0, whiteSpace: "nowrap" }}>
            &nbsp;]
          </span>
        </button>
      )}
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
  const [animating, setAnimating] = useState(false);

  const [activeMeal, setActiveMeal] = useState<Meal | null>(null);
  const [activeExercise, setActiveExercise] = useState<(Exercise & { muscleGroup?: string }) | null>(null);

  // Shared hydration state — date-anchored: resets at midnight of a new calendar day
  const todayISO = new Date().toISOString().split("T")[0];
  const [waterMl, setWaterMl] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      const raw = localStorage.getItem("mc:water_ml");
      if (raw) {
        const parsed = JSON.parse(raw) as { ml: number; date: string };
        if (parsed.date === new Date().toISOString().split("T")[0]) return parsed.ml;
      }
    } catch {}
    return 0;
  });
  useEffect(() => {
    try {
      localStorage.setItem("mc:water_ml", JSON.stringify({ ml: waterMl, date: todayISO }));
    } catch {}
  }, [waterMl, todayISO]);
  const addWater = () => {
    setWaterMl(w => Math.min(w + 250, WATER_TARGET_ML));
    fetch("/api/student/water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountMl: 250, date: todayISO }),
    }).catch(() => {});
  };

  // ── Chronological Day Index — weekly cycle, resets every 7 days ──────────
  const [activeDayIndex, setActiveDayIndex] = useState<number>(() => {
    if (typeof window === "undefined") return 1;
    try {
      const savedDay   = Number(localStorage.getItem("mc:active_day") ?? "0");
      const savedWeek  = Number(localStorage.getItem("mc:cycle_week") ?? "-1");
      const thisWeek   = currentCycleWeek();
      if (savedWeek < thisWeek) {
        // New cycle — flush history dictionaries so streak matrix starts fresh
        localStorage.removeItem("mc:nutrition_history");
        localStorage.removeItem("mc:workout_history");
        return 1;
      }
      if (savedDay >= 1 && savedDay <= 7) return savedDay;
    } catch {}
    return currentCycleDay();
  });

  useEffect(() => {
    try {
      localStorage.setItem("mc:active_day",   String(activeDayIndex));
      localStorage.setItem("mc:cycle_week",   String(currentCycleWeek()));
    }
    catch {}
  }, [activeDayIndex]);

  // ── Nutrition History Dictionary — per-day independent Sets ──────────────
  // Keys are day indices 1-7. Each value is the Set of checked meal indices
  // for that day. Advancing to a new day never wipes other days' data.
  const [nutritionHistory, setNutritionHistory] = useState<Record<number, Set<number>>>(() => {
    const empty = (): Record<number, Set<number>> => ({ 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set(), 5: new Set(), 6: new Set(), 7: new Set() });
    if (typeof window === "undefined") return empty();
    try {
      const v = localStorage.getItem("mc:nutrition_history");
      if (v) {
        const parsed = JSON.parse(v) as Record<string, number[]>;
        const rec: Record<number, Set<number>> = {};
        for (let d = 1; d <= 7; d++) rec[d] = new Set(parsed[String(d)] ?? []);
        return rec;
      }
    } catch {}
    return empty();
  });

  useEffect(() => {
    try {
      const ser: Record<string, number[]> = {};
      for (let d = 1; d <= 7; d++) ser[String(d)] = [...(nutritionHistory[d] ?? new Set())];
      localStorage.setItem("mc:nutrition_history", JSON.stringify(ser));
    } catch {}
  }, [nutritionHistory]);

  // Derive active-day slice — what the UI renders
  const checkedMeals: Set<number> = nutritionHistory[activeDayIndex] ?? new Set<number>();

  // ── Workout History Dictionary — persisted to localStorage ─────────────────
  const [workoutHistory, setWorkoutHistory] = useState<Record<number, string[]>>(() => {
    const empty = (): Record<number, string[]> => ({ 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] });
    if (typeof window === "undefined") return empty();
    try {
      const raw = localStorage.getItem("mc:workout_history");
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, string[]>;
        const rec: Record<number, string[]> = {};
        for (let d = 1; d <= 7; d++) rec[d] = Array.isArray(parsed[String(d)]) ? parsed[String(d)] : [];
        return rec;
      }
    } catch {}
    return empty();
  });

  const onLogExercise = useCallback((dayIdx: number, exerciseName: string) => {
    setWorkoutHistory(prev => {
      const existing = prev[dayIdx] ?? [];
      if (existing.includes(exerciseName)) return prev;
      return { ...prev, [dayIdx]: [...existing, exerciseName] };
    });
    // Fire-and-forget server sync
    const dayName = (detail?.routine?.days ?? [])[dayIdx - 1]?.label ?? "Entrenamiento";
    fetch("/api/student/workout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: cycleDate(dayIdx), name: dayName, exerciseLogs: [{ name: exerciseName }] }),
    }).catch(() => {});
  }, [detail]);

  useEffect(() => {
    try {
      const ser: Record<string, string[]> = {};
      for (let d = 1; d <= 7; d++) ser[String(d)] = workoutHistory[d] ?? [];
      localStorage.setItem("mc:workout_history", JSON.stringify(ser));
    } catch {}
  }, [workoutHistory]);

  // ── Personal Records — reactive, updated by TabWorkout on new PR ─────────
  const [prs, setPrs] = useState<{ squat: number; deadlift: number; bench: number }>({
    squat: 0, deadlift: 0, bench: 0,
  });

  // ── System error toast (PR save failures, wallet errors) ─────────────────
  const [sysErrToast, setSysErrToast] = useState<string | null>(null);
  const sysErrToastRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fireSysErrToast = useCallback((msg: string) => {
    setSysErrToast(msg);
    if (sysErrToastRef.current) clearTimeout(sysErrToastRef.current);
    sysErrToastRef.current = setTimeout(() => setSysErrToast(null), 3500);
  }, []);

  const onNewPR = useCallback(async (lift: "squat" | "deadlift" | "bench", kg: number) => {
    // Optimistic: only advance if the new value actually beats the stored one
    setPrs(p => kg > p[lift] ? { ...p, [lift]: kg } : p);
    try {
      const res = await fetch("/api/me/prs", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ lift, kg }),
      });
      if (res.ok) {
        const d = await res.json();
        setPrs({ squat: d.prSquat, deadlift: d.prDeadlift, bench: d.prBench });
      } else {
        // Server rejected — restore authoritative values from /api/me
        const me = await fetch("/api/me").then(r => r.ok ? r.json() : null).catch(() => null);
        if (me?.student) setPrs({ squat: me.student.prSquat ?? 0, deadlift: me.student.prDeadlift ?? 0, bench: me.student.prBench ?? 0 });
        fireSysErrToast("⚠️ Error al guardar el récord. Inténtalo de nuevo.");
      }
    } catch {
      fetch("/api/me").then(r => r.ok ? r.json() : null).then(me => {
        if (me?.student) setPrs({ squat: me.student.prSquat ?? 0, deadlift: me.student.prDeadlift ?? 0, bench: me.student.prBench ?? 0 });
      }).catch(() => {});
      fireSysErrToast("⚠️ Sin conexión — récord no guardado.");
    }
  }, [fireSysErrToast]);

  // ── Wallet balance — DB-hydrated on mount, mutated via PATCH /api/me/wallet
  const [walletBalance, setWalletBalance] = useState<number>(0);

  const onClaimPrize = useCallback(async (amount: number) => {
    // Optimistic: credit immediately for zero-latency UX
    setWalletBalance(prev => prev + amount);
    try {
      const res = await fetch("/api/me/wallet", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ delta: amount }),
      });
      if (res.ok) {
        const d = await res.json();
        setWalletBalance(d.walletBalance);
      } else {
        // Revert and surface error
        setWalletBalance(prev => prev - amount);
        fireSysErrToast("⚠️ Error al procesar el premio. Contacta a soporte.");
      }
    } catch {
      setWalletBalance(prev => prev - amount);
      fireSysErrToast("⚠️ Sin conexión — premio no registrado.");
    }
  }, [fireSysErrToast]);

  const onLaunchDebit = useCallback(async (amount: number): Promise<boolean> => {
    if (amount > walletBalance) return false;
    setWalletBalance(prev => prev - amount);
    try {
      const res = await fetch("/api/me/wallet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta: -amount }),
      });
      if (res.ok) {
        const d = await res.json();
        setWalletBalance(d.walletBalance);
        return true;
      } else {
        setWalletBalance(prev => prev + amount);
        fireSysErrToast("⚠️ Saldo insuficiente — desafío no lanzado.");
        return false;
      }
    } catch {
      setWalletBalance(prev => prev + amount);
      fireSysErrToast("⚠️ Sin conexión — apuesta no debitada.");
      return false;
    }
  }, [walletBalance, fireSysErrToast]);

  // ── Live scores: computed from current nutrition & streak data ───────────
  const nutritionTotal = useMemo(() => {
    if (!detail) return 0;
    const mealsArr: { calories: number }[] = (detail as any).diet?.meals ?? [];
    return mealsArr.reduce((s: number, m: { calories: number }, i: number) => s + (checkedMeals.has(i) ? m.calories : 0), 0);
  }, [checkedMeals, detail]);

  const streakCompletedDays = useMemo(() =>
    [1,2,3,4,5,6,7].filter(d =>
      (nutritionHistory[d]?.size ?? 0) > 0 || (workoutHistory[d]?.length ?? 0) > 0
    ).length,
  [nutritionHistory, workoutHistory]);

  // ── Coach Broadcast Engine — global ticker state ──────────────────────────
  const [broadcastMessages, setBroadcastMessages] = useState<string[]>([
    "⚡ PROTOCOLO EN EJECUCIÓN • PLAN ACTIVO › DÍA 1",
    "🔥 EL ÚNICO MAL ENTRENAMIENTO ES EL QUE NO HICISTE • DISCIPLINA ABSOLUTA",
    "🦾 ALINEACIÓN DE MACROS: CERO MARGEN DE ERROR EN TU RECOMPOSICIÓN",
    "⚔️ FELLS INTEL: MIEMBROS TIENEN UN STREAK GRUPAL DEL 92% HOY",
  ]);

  // ── TabComunidad persistent navigation state (lifted from TabComunidad) ───
  const [currentRoomView, setCurrentRoomView] = useState<"feed" | "leaderboard" | "retos" | "members" | "avisos">("feed");
  const [selectedActiveChallenge, setSelectedActiveChallenge] = useState<LiveStake | null>(null);
  const [searchQuery,      setSearchQuery]      = useState("");
  const [showRosterFilter, setShowRosterFilter] = useState(false);
  const [filterRank,       setFilterRank]       = useState<string | null>(null);
  const [filterOnline,     setFilterOnline]     = useState(false);
  const [filterStreakMin,  setFilterStreakMin]   = useState(0);

  const [showBriefingDrawer, setShowBriefingDrawer] = useState(false);

  useEffect(() => {
    document.body.style.overflow = showBriefingDrawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showBriefingDrawer]);

  const [mealToast,    setMealToast]    = useState<{ protein: number; carbs: number; fat: number } | null>(null);
  const [dietComplete, setDietComplete] = useState(false);
  const mealToastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerMealChain = useCallback((
    macros: { protein: number; carbs: number; fat: number },
    nextCheckedCount: number,
    totalMeals: number,
  ) => {
    setMealToast(macros);                                    // 2. deploy toast
    if (mealToastRef.current) clearTimeout(mealToastRef.current);
    mealToastRef.current = setTimeout(() => {
      setMealToast(null);
      if (nextCheckedCount >= totalMeals && totalMeals > 0) // 3. after toast, check 100%
        setDietComplete(true);
    }, 2000);
  }, []);

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
      if (res.ok) {
        const d = await res.json();
        setStudent(d.student);
        setDetail(d.detail);
        // Hydrate gamification state from DB — fallback to 0 when field is absent
        if (d.student) {
          setPrs({
            squat:    d.student.prSquat    ?? 0,
            deadlift: d.student.prDeadlift ?? 0,
            bench:    d.student.prBench    ?? 0,
          });
          setWalletBalance(d.student.walletBalance ?? 0);
        }
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  // ── Server-side history hydration (run once on mount, after auth) ──────────

  useEffect(() => {
    // Water: fetch today's server total; overwrite localStorage cold-start cache
    fetch(`/api/student/water?date=${new Date().toISOString().split("T")[0]}`)
      .then(r => r.ok ? r.json() : null)
      .then((d: { totalMl: number } | null) => {
        if (d && typeof d.totalMl === "number")
          setWaterMl(Math.min(d.totalMl, WATER_TARGET_ML));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Nutrition: hydrate each of the 7 cycle days from DailyCheck server records
    const hydrateDay = async (d: number) => {
      try {
        const res = await fetch(`/api/me/checks?date=${cycleDate(d)}`);
        if (!res.ok) return;
        const { checks } = (await res.json()) as { checks: { kind: string; itemKey: string }[] };
        const indices = checks.filter(c => c.kind === "meal").map(c => Number(c.itemKey));
        setNutritionHistory(prev => ({ ...prev, [d]: new Set(indices) }));
      } catch {}
    };
    for (let d = 1; d <= 7; d++) hydrateDay(d);
  }, []);

  useEffect(() => {
    // Workout: map last 20 sessions back onto workoutHistory by cycle date
    fetch("/api/student/workout-session")
      .then(r => r.ok ? r.json() : [])
      .then((sessions: { date: string; exerciseLogs: string }[]) => {
        if (!Array.isArray(sessions)) return;
        const next: Record<number, string[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
        for (let d = 1; d <= 7; d++) {
          const target = cycleDate(d);
          const session = sessions.find(s => s.date === target);
          if (session) {
            try {
              const logs = JSON.parse(session.exerciseLogs ?? "[]") as { name: string }[];
              next[d] = logs.map(l => l.name);
            } catch {}
          }
        }
        setWorkoutHistory(next);
      })
      .catch(() => {});
  }, []);

  const switchTab = (t: TabId) => {
    if (t === activeTab) return;
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
  const day: RoutineDay | undefined = detail.routine.days[activeDayIndex - 1] ?? detail.routine.days[0];

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

  // ── Meal notification handlers — keyed to activeDayIndex ────────────────
  const handleToggleMeal = (i: number) => {
    const isAdding = !(nutritionHistory[activeDayIndex] ?? new Set()).has(i);
    setNutritionHistory(prev => {
      const daySet = new Set(prev[activeDayIndex] ?? []);
      isAdding ? daySet.add(i) : daySet.delete(i);
      if (isAdding) triggerMealChain(meals[i]?.macros ?? { protein: 32, carbs: 48, fat: 14 }, daySet.size, meals.length);
      return { ...prev, [activeDayIndex]: daySet };
    });
    // Server sync — optimistic; rollback on failure
    const date = cycleDate(activeDayIndex);
    fetch("/api/me/checks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, kind: "meal", itemKey: String(i), done: isAdding }),
    }).catch(() => {
      setNutritionHistory(prev => {
        const daySet = new Set(prev[activeDayIndex] ?? []);
        isAdding ? daySet.delete(i) : daySet.add(i);
        return { ...prev, [activeDayIndex]: daySet };
      });
    });
  };

  const handleSheetConfirm = () => {
    if (!activeMeal) return;
    const idx = meals.findIndex(m => m.name === activeMeal.name && m.time === activeMeal.time);
    setActiveMeal(null);
    if (idx < 0) return;
    setNutritionHistory(prev => {
      const daySet = new Set(prev[activeDayIndex] ?? []);
      const alreadyDone = daySet.has(idx);
      if (!alreadyDone) {
        daySet.add(idx);
        const mac = meals[idx]?.macros ?? { protein: 32, carbs: 48, fat: 14 };
        triggerMealChain(mac, daySet.size, meals.length);
      }
      return alreadyDone ? prev : { ...prev, [activeDayIndex]: daySet };
    });
  };

  return (
    <>
    {/* Elite Print Template — rendered outside the app shell so it is the ONLY
        visible content when window.print() is called. Free for all users. */}
    <ElitePrintTemplate student={student} detail={detail} meals={meals} />

    <div className="print-app-shell" style={{ background: "#000", minHeight: "100vh" }}>
      <div className="w-full min-h-screen relative overflow-x-hidden flex flex-col" style={{ background: "#070708" }}>

        {/* Global brand header — hidden during workout focus */}
        {!workoutFocusMode && (
          <GlobalHeader
            student={student}
            broadcastMessages={broadcastMessages}
            onOpenBriefing={() => setShowBriefingDrawer(true)}
          />
        )}

        {/* ── Coach Briefing Drawer ── */}
        {showBriefingDrawer && typeof document !== "undefined" && createPortal(
          <div className="fixed inset-0 z-[80] flex flex-col overflow-hidden"
            style={{ background: "rgba(7,7,8,0.95)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", animation: "mc-overlay-in 0.25s cubic-bezier(0.16,1,0.3,1) both" }}>

            {/* ── Command Header ── */}
            <div className="flex items-start justify-between px-5 pt-8 pb-5 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div>
                <p style={{ fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(206,255,0,0.45)", marginBottom: 8 }}>
                  ◈ SECURE CHANNEL · {broadcastMessages.length} ACTIVE TRANSMISSIONS
                </p>
                <p style={{ fontFamily: "var(--font-display,'Barlow Condensed',sans-serif)", fontWeight: 900, fontStyle: "italic", fontSize: 26, textTransform: "uppercase", letterSpacing: "0.05em", color: "#fff", lineHeight: 1 }}>
                  COACH BROADCAST<br />
                  <span style={{ color: "#CEFF00" }}>INTEL FEED</span>
                </p>
              </div>
              {/* [ CLOSE TERMINAL ✕ ] */}
              <button onClick={() => setShowBriefingDrawer(false)}
                className="flex-shrink-0 self-start mt-1 active:opacity-50 transition-opacity"
                style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", padding: "6px 10px", cursor: "pointer" }}>
                <span style={{ fontFamily: "'Courier New',monospace", fontSize: 7.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontWeight: 900 }}>
                  [ CLOSE TERMINAL ✕ ]
                </span>
              </button>
            </div>

            {/* ── Transmission Log — Bento cells ── */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-2.5 pb-16">
              {broadcastMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Bell size={32} strokeWidth={1} style={{ color: "rgba(255,255,255,0.08)", marginBottom: 12 }} />
                  <p style={{ fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>
                    // NO ACTIVE TRANSMISSIONS
                  </p>
                </div>
              ) : broadcastMessages.map((msg, i) => (
                <div key={i}
                  className="rounded-xl p-4 flex items-start gap-4 transition-all duration-200"
                  style={i === 0 ? {
                    background: "rgba(206,255,0,0.025)",
                    border: "1px solid rgba(206,255,0,0.32)",
                    boxShadow: "0 0 30px rgba(206,255,0,0.08)",
                  } : {
                    background: "rgba(26,26,26,0.4)",
                    border: "1px solid rgba(255,255,255,0.04)",
                  }}>
                  {/* Sequence index */}
                  <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 rounded"
                    style={{ background: i === 0 ? "rgba(206,255,0,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${i === 0 ? "rgba(206,255,0,0.2)" : "rgba(255,255,255,0.05)"}` }}>
                    <span style={{ fontFamily: "'Courier New',monospace", fontSize: 9, fontWeight: 900, color: i === 0 ? "#CEFF00" : "rgba(255,255,255,0.25)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {i === 0 && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#CEFF00]"
                          style={{ animation: "subtle-pulse 1.8s ease-in-out infinite", boxShadow: "0 0 6px rgba(206,255,0,0.8)" }} />
                        <span style={{ fontFamily: "'Courier New',monospace", fontSize: 6.5, fontWeight: 900, letterSpacing: "0.24em", textTransform: "uppercase", color: "#CEFF00" }}>
                          EN EMISIÓN ACTIVA
                        </span>
                      </div>
                    )}
                    <p style={{ fontFamily: "'Courier New',monospace", fontSize: 10.5, letterSpacing: "0.06em", color: i === 0 ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
                      {msg}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Footer — routing cue ── */}
            <div className="px-5 py-4 flex-shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <p style={{ fontFamily: "'Courier New',monospace", fontSize: 7.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)", textAlign: "center" }}>
                // CONFIGURA EN SALAS › AVISOS › GESTIÓN DE EMISIÓN
              </p>
            </div>
          </div>,
          document.body
        )}

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
              onAddWater={addWater}
              checkedMeals={checkedMeals}
              onToggleMeal={handleToggleMeal}
              activeDayIndex={activeDayIndex}
              onAdvanceDay={delta => setActiveDayIndex(d => Math.max(1, d + delta))} />
          )}
          {activeTab === "progress" && (
            <TabProgreso
              student={student}
              detail={detail}
              startWeight={startWeight}
              prs={prs}
              nutritionHistory={nutritionHistory}
              workoutHistory={workoutHistory}
              checkedMeals={checkedMeals}
              meals={meals}
              onBadge={() => downloadBadge({ name: student.name, photoUrl: detail.photoName, currentWeight: student.currentWeight, startWeight, streak: student.streak, height: detail.height, bodyFat: detail.bodyFat, stage: `${student.stage} · E${student.stageNumber}`, weightHistory: detail.weightHistory })} />
          )}
          {activeTab === "squads" && (
            <TabWorkout day={day} student={student}
              waterMl={waterMl}
              onAddWater={addWater}
              onFocusMode={setWorkoutFocusMode}
              memberTier={student.stageNumber >= 2 ? "berserker" : "basic"}
              prs={prs}
              onNewPR={onNewPR}
              activeDayIndex={activeDayIndex}
              onLogExercise={onLogExercise} />
          )}
          {activeTab === "community" && (
            <TabComunidad
              student={student}
              broadcastMessages={broadcastMessages}
              setBroadcastMessages={setBroadcastMessages}
              walletBalance={walletBalance}
              onClaimPrize={onClaimPrize}
              onLaunchDebit={onLaunchDebit}
              nutritionTotal={nutritionTotal}
              streakCompletedDays={streakCompletedDays}
              workoutHistory={workoutHistory}
              currentRoomView={currentRoomView}
              setCurrentRoomView={setCurrentRoomView}
              selectedActiveChallenge={selectedActiveChallenge}
              setSelectedActiveChallenge={setSelectedActiveChallenge}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              showRosterFilter={showRosterFilter}
              setShowRosterFilter={setShowRosterFilter}
              filterRank={filterRank}
              setFilterRank={setFilterRank}
              filterOnline={filterOnline}
              setFilterOnline={setFilterOnline}
              filterStreakMin={filterStreakMin}
              setFilterStreakMin={setFilterStreakMin}
              isCoach={false}
              coachId={student.coachId ?? null}
            />
          )}
          {activeTab === "profile" && (
            <TabPerfil
              student={student}
              detail={detail}
              onCancelRequest={openCancelSheet}
              nutritionHistory={nutritionHistory}
              workoutHistory={workoutHistory}
              activeDayIndex={activeDayIndex}
              prs={prs}
              walletBalance={walletBalance}
            />
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
        {activeMeal && <MealSheet meal={activeMeal} waterMl={waterMl} onConfirm={handleSheetConfirm} />}
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

      {/* ── System error toast (PR / wallet failures) ── */}
      {sysErrToast && (
        <div style={{ position: "fixed", bottom: 90, left: 0, right: 0, zIndex: 9999, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{
            pointerEvents: "auto",
            background: "rgba(20,0,0,0.96)",
            border: "1px solid rgba(248,113,113,0.35)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.9)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            padding: "12px 18px",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            maxWidth: 360,
            width: "calc(100vw - 32px)",
            animation: "mc-toast-lifecycle 3.5s cubic-bezier(0.16,1,0.3,1) forwards",
          }}>
            <span style={{ fontSize: 14 }}>⚠️</span>
            <p style={{ fontFamily: "'Courier New',monospace", fontSize: 11, letterSpacing: "0.06em", color: "#f87171", margin: 0 }}>
              {sysErrToast}
            </p>
          </div>
        </div>
      )}

      {/* ── Meal notification overlays (portal-mounted, always above shell) ── */}
      {mealToast && <MealToast macros={mealToast} />}
      {dietComplete && (
        <DietCompleteModal
          onClose={() => setDietComplete(false)}
          totalCals={meals.reduce((s, m, i) => s + (checkedMeals.has(i) ? m.calories : 0), 0)}
          macros={{
            protein: meals.reduce((s, m) => s + (m.macros?.protein ?? 0), 0),
            carbs:   meals.reduce((s, m) => s + (m.macros?.carbs   ?? 0), 0),
            fat:     meals.reduce((s, m) => s + (m.macros?.fat     ?? 0), 0),
          }}
        />
      )}

      </div>{/* end viewport shell */}
    </div>
    </>
  );
}
