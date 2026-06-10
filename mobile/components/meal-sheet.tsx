/* ═══════════════════════════════════════════
   Detalle de una comida (bottom sheet).
   Paridad 1:1 con la web: anillo de calorías + macros,
   lista de alimentos con ilustración, y "Cambios
   inteligentes" (equivalencias/sustituciones por alimento).
   ═══════════════════════════════════════════ */
import { useState } from "react";
import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { X, ArrowLeftRight, RefreshCw, CheckCircle2 } from "lucide-react-native";
import type { Meal, Ingredient, Equivalent } from "@/lib/data";
import { EQUIV_CATALOG } from "@/lib/equivalents";
import { FoodIllu } from "@/components/food-illustrations";
import { T } from "@/lib/theme";

/* ── Anillo de calorías + barras de macros (por comida) ── */
function CalorieRing({ consumed, protein, carbs, fat }: { consumed: number; protein: number; carbs: number; fat: number }) {
  const R = 44;
  const circ = 2 * Math.PI * R;
  return (
    <View className="flex-row items-center gap-5">
      <View style={{ width: 108, height: 108 }}>
        <Svg width={108} height={108} viewBox="0 0 100 100" style={{ transform: [{ rotate: "-90deg" }] }}>
          <Circle cx={50} cy={50} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5.5} />
          <Circle cx={50} cy={50} r={R} fill="none" stroke={T.success} strokeWidth={5.5} strokeLinecap="round" strokeDasharray={`${circ} ${circ}`} />
        </Svg>
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} className="items-center justify-center">
          <Text className="text-primary text-[19px] font-light">{consumed}</Text>
          <Text className="text-tertiary text-[8px] uppercase mt-0.5" style={{ letterSpacing: 1 }}>kcal</Text>
        </View>
      </View>
      <View className="flex-1 gap-3">
        <MacroBar label="Proteína" value={protein} max={60} color={T.success} />
        <MacroBar label="Carbos" value={carbs} max={100} color={T.info} />
        <MacroBar label="Grasa" value={fat} max={40} color="#fb923c" />
      </View>
    </View>
  );
}

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(value / max, 1) * 100;
  return (
    <View>
      <View className="flex-row justify-between items-baseline mb-1">
        <Text className="text-tertiary text-[9px] uppercase" style={{ letterSpacing: 0.8 }}>{label}</Text>
        <Text className="text-[12px] font-medium" style={{ color }}>{value}g</Text>
      </View>
      <View className="h-[3px] rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
        <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </View>
    </View>
  );
}

/* ── Fila de alimento (con sustitución activa visible) ── */
function IngredientRow({ ingredient, swappedTo, onSwapTap, showSwapBtn, swapActive }: {
  ingredient: Ingredient;
  swappedTo?: Equivalent | null;
  onSwapTap?: () => void;
  showSwapBtn?: boolean;
  swapActive?: boolean;
}) {
  const [done, setDone] = useState(false);
  const isSwapped = !!swappedTo;
  const displayName = isSwapped && swappedTo ? swappedTo.name : ingredient.name;
  const displayGrams = isSwapped && swappedTo
    ? (swappedTo.macroType === "protein"
        ? Math.round((ingredient.macros?.protein ?? Math.round(ingredient.calories * 0.25 / 4)) * (swappedTo.gramsPerProtein ?? 5))
        : Math.round((ingredient.macros?.carbs ?? Math.round(ingredient.calories * 0.5 / 4)) * (swappedTo.gramsPerCarb ?? 0)))
    : ingredient.grams;
  const iconKey = isSwapped && swappedTo ? swappedTo.icon : ingredient.icon;

  return (
    <View
      className="flex-row items-center gap-3.5 px-4 py-3.5"
      style={{ backgroundColor: isSwapped ? "rgba(96,165,250,0.04)" : "transparent", borderLeftWidth: 2, borderLeftColor: isSwapped ? "rgba(96,165,250,0.3)" : "transparent" }}
    >
      <FoodIllu iconKey={iconKey} size={48} />
      <View className="flex-1 min-w-0">
        <Text className="text-[15px] font-medium" style={{ color: done ? "rgba(255,255,255,0.28)" : "#fff", textDecorationLine: done ? "line-through" : "none" }}>
          {displayName}
        </Text>
        {isSwapped && <Text className="text-[10px]" style={{ color: "#60a5fa" }}>↔ sustituido</Text>}
      </View>
      <View className="items-end mr-1">
        <Text className="text-[15px] font-medium" style={{ color: isSwapped ? "#60a5fa" : "rgba(255,255,255,0.75)" }}>{displayGrams} g</Text>
        <Text className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{ingredient.calories} kcal</Text>
      </View>
      {showSwapBtn && (
        <Pressable
          onPress={onSwapTap}
          className="w-7 h-7 rounded-xl items-center justify-center"
          style={{ backgroundColor: swapActive ? "rgba(96,165,250,0.15)" : "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: swapActive ? "rgba(96,165,250,0.3)" : "rgba(255,255,255,0.08)" }}
        >
          <ArrowLeftRight size={11} color={swapActive ? "#60a5fa" : "rgba(255,255,255,0.3)"} />
        </Pressable>
      )}
      <Pressable
        onPress={() => setDone((d) => !d)}
        className="w-6 h-6 rounded-full items-center justify-center"
        style={{ backgroundColor: done ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.05)", borderWidth: 1.5, borderColor: done ? "rgba(52,211,153,0.5)" : "rgba(255,255,255,0.1)" }}
      >
        {done && <CheckCircle2 size={12} strokeWidth={2.5} color={T.success} />}
      </Pressable>
    </View>
  );
}

/* ── Catálogo de equivalencias para un alimento ── */
function EquivCatalog({ ingredient, selected, onSelect }: {
  ingredient: Ingredient;
  selected: Equivalent | null;
  onSelect: (eq: Equivalent | null) => void;
}) {
  const baseCarbs = ingredient.macros?.carbs ?? Math.round((ingredient.calories * 0.45) / 4);
  const baseProtein = ingredient.macros?.protein ?? Math.round((ingredient.calories * 0.25) / 4);
  const [activeTab, setActiveTab] = useState<"protein" | "carb">("protein");
  const list = EQUIV_CATALOG.filter((e) => e.macroType === activeTab);

  const calcGrams = (eq: Equivalent) =>
    eq.macroType === "protein" ? Math.round(baseProtein * (eq.gramsPerProtein ?? 5)) : Math.round(baseCarbs * (eq.gramsPerCarb ?? 0));

  return (
    <View>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-[11px] font-medium flex-1" style={{ color: "rgba(255,255,255,0.5)" }}>
          Cambios inteligentes para <Text style={{ color: "#fff" }}>{ingredient.name}</Text>
        </Text>
        {selected && (
          <Pressable onPress={() => onSelect(null)} className="flex-row items-center gap-1 px-2 py-1 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
            <RefreshCw size={9} color="rgba(255,255,255,0.38)" />
            <Text className="text-[10px]" style={{ color: "rgba(255,255,255,0.38)" }}>Reset</Text>
          </Pressable>
        )}
      </View>

      {/* Toggle Proteína / Carbos */}
      <View className="flex-row gap-1.5 mb-4 p-1 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}>
        {(["protein", "carb"] as const).map((t) => {
          const active = activeTab === t;
          return (
            <Pressable key={t} onPress={() => setActiveTab(t)} className="flex-1 py-1.5 rounded-lg items-center"
              style={{ backgroundColor: active ? "rgba(255,255,255,0.1)" : "transparent", borderWidth: 1, borderColor: active ? "rgba(255,255,255,0.1)" : "transparent" }}>
              <Text className="text-[11px] font-medium" style={{ color: active ? "#fff" : "rgba(255,255,255,0.32)" }}>
                {t === "protein" ? "🥩 Proteína" : "🌾 Carbohidratos"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Grid de 3 columnas */}
      <View className="flex-row flex-wrap" style={{ marginHorizontal: -5 }}>
        {list.map((eq) => {
          const grams = calcGrams(eq);
          const active = selected?.name === eq.name;
          return (
            <View key={eq.name} style={{ width: "33.333%", padding: 5 }}>
              <Pressable
                onPress={() => onSelect(active ? null : eq)}
                className="items-center rounded-2xl p-3"
                style={{ backgroundColor: active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)", borderWidth: 1.5, borderColor: active ? "rgba(96,165,250,0.5)" : "rgba(255,255,255,0.06)" }}
              >
                <View className="mb-2"><FoodIllu iconKey={eq.icon} size={52} /></View>
                <Text className="text-[11px] font-medium text-center mb-1.5" style={{ color: active ? "#fff" : "rgba(255,255,255,0.65)" }} numberOfLines={2}>{eq.name}</Text>
                <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: active ? "rgba(96,165,250,0.15)" : "rgba(255,255,255,0.05)" }}>
                  <Text className="text-[11px] font-semibold" style={{ color: active ? "#60a5fa" : "rgba(255,255,255,0.45)" }}>{grams}g</Text>
                </View>
                {active && (
                  <View className="absolute top-2 right-2 w-4 h-4 rounded-full items-center justify-center" style={{ backgroundColor: "#60a5fa" }}>
                    <CheckCircle2 size={10} strokeWidth={3} color="#fff" />
                  </View>
                )}
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* Conversión automática */}
      {selected && (
        <View className="rounded-2xl px-4 py-3.5 mt-3" style={{ backgroundColor: "rgba(96,165,250,0.06)", borderWidth: 1, borderColor: "rgba(96,165,250,0.15)" }}>
          <Text className="text-[9px] uppercase mb-1.5" style={{ letterSpacing: 2, color: "rgba(96,165,250,0.6)" }}>Conversión automática</Text>
          <Text className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.78)" }}>
            <Text style={{ color: "#fff" }}>{ingredient.grams}g</Text> de {ingredient.name} = <Text style={{ color: "#60a5fa" }}>{calcGrams(selected)}g</Text> de {selected.name}
          </Text>
          <Text className="text-[10px] mt-1.5" style={{ color: "rgba(255,255,255,0.25)" }}>
            {selected.macroType === "protein"
              ? `Base: ${baseProtein}g proteína · ${selected.gramsPerProtein ?? 5}g alimento / 1g proteína`
              : `Base: ${baseCarbs}g carbos · ${selected.gramsPerCarb}g alimento / 1g carbo`}
          </Text>
        </View>
      )}
    </View>
  );
}

/* ── Genera ingredientes detallados desde los items (fallback, igual que la web) ── */
function ingredientsFor(meal: Meal): Ingredient[] {
  if (meal.ingredients?.length) return meal.ingredients;
  const n = Math.max(meal.items.length, 1);
  return meal.items.map((name, i) => ({
    name,
    grams: [150, 120, 80, 200, 100][i % 5],
    calories: Math.round(meal.calories / n),
    icon: ["egg", "wheat", "beef", "salad", "chicken"][i % 5],
    unitQty: [1, 0.5, 1.5, 2, 1][i % 5],
    unit: ["pieza", "taza", "tazas", "piezas", "porción"][i % 5],
    macros: {
      protein: Math.round(meal.protein / n),
      carbs: Math.round(meal.carbs / n),
      fat: Math.round(meal.fat / n),
    },
  }));
}

export function MealSheet({ open, meal, onClose }: { open: boolean; meal: Meal | null; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [showEquiv, setShowEquiv] = useState(false);
  const [swapOpen, setSwapOpen] = useState<number | null>(null);
  const [swaps, setSwaps] = useState<Record<number, Equivalent | null>>({});

  if (!meal) return null;
  const ingredients = ingredientsFor(meal);
  const swapCount = Object.values(swaps).filter(Boolean).length;
  // Si no hay macros por comida, usa el default de la web
  const hasMacros = meal.protein || meal.carbs || meal.fat;
  const macros = hasMacros ? { protein: meal.protein, carbs: meal.carbs, fat: meal.fat } : { protein: 32, carbs: 48, fat: 14 };

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.75)" }}>
        <Pressable className="flex-1" onPress={onClose} />
        <View className="rounded-t-3xl" style={{ backgroundColor: "#0d0d0d", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", maxHeight: "90%", paddingBottom: insets.bottom }}>
          {/* Grabber + cerrar */}
          <View className="items-center pt-3 pb-2">
            <View className="w-9 rounded-full" style={{ height: 3, backgroundColor: "rgba(255,255,255,0.12)" }} />
          </View>
          <Pressable onPress={onClose} className="absolute top-3.5 right-4 w-8 h-8 items-center justify-center rounded-full z-10" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
            <X size={13} color="rgba(255,255,255,0.45)" />
          </Pressable>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="flex-row items-start justify-between mb-5 mt-1">
              <View className="flex-1 pr-3">
                <Text className="text-[22px] font-semibold" style={{ color: "#fff" }}>{meal.name}</Text>
                <Text className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.32)" }}>{meal.time}</Text>
              </View>
              <Pressable
                onPress={() => { setShowEquiv((p) => !p); setSwapOpen(null); }}
                className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl"
                style={{ backgroundColor: showEquiv ? "rgba(96,165,250,0.1)" : "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: showEquiv ? "rgba(96,165,250,0.25)" : "rgba(255,255,255,0.08)" }}
              >
                <ArrowLeftRight size={12} color={showEquiv ? "#60a5fa" : "rgba(255,255,255,0.4)"} />
                <Text className="text-[11px]" style={{ color: showEquiv ? "#60a5fa" : "rgba(255,255,255,0.4)" }}>
                  Cambios{swapCount > 0 ? ` (${swapCount})` : ""}
                </Text>
              </Pressable>
            </View>

            {/* Anillo + macros */}
            <View className="rounded-2xl p-4 mb-5" style={{ backgroundColor: "rgba(255,255,255,0.025)", borderWidth: 1, borderColor: "rgba(255,255,255,0.055)" }}>
              <CalorieRing consumed={meal.calories} protein={macros.protein} carbs={macros.carbs} fat={macros.fat} />
            </View>

            {/* Alimentos */}
            <View className="flex-row items-center justify-between mb-3 px-0.5">
              <Text className="text-[10px] uppercase font-medium" style={{ letterSpacing: 2, color: "rgba(255,255,255,0.25)" }}>Alimentos</Text>
              {swapCount > 0 && <Text className="text-[10px]" style={{ color: "#60a5fa" }}>{swapCount} sustituido(s)</Text>}
            </View>

            <View className="rounded-2xl overflow-hidden" style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" }}>
              {ingredients.map((ing, i) => (
                <View key={i} style={{ borderBottomWidth: i < ingredients.length - 1 ? 1 : 0, borderBottomColor: "rgba(255,255,255,0.055)" }}>
                  <IngredientRow
                    ingredient={ing}
                    swappedTo={swaps[i]}
                    showSwapBtn={showEquiv}
                    swapActive={swapOpen === i}
                    onSwapTap={() => setSwapOpen((p) => (p === i ? null : i))}
                  />
                  {swapOpen === i && showEquiv && (
                    <View className="px-4 pb-5 pt-3" style={{ backgroundColor: "rgba(255,255,255,0.015)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" }}>
                      <EquivCatalog
                        ingredient={ing}
                        selected={swaps[i] ?? null}
                        onSelect={(eq) => {
                          setSwaps((p) => ({ ...p, [i]: eq }));
                          if (!eq) setSwapOpen(null);
                        }}
                      />
                    </View>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
