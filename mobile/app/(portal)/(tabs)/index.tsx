import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { CheckCircle2, Flame, Dumbbell, Utensils, Play, ChevronRight } from "lucide-react-native";
import { useMe } from "@/lib/use-me";
import { getChecks, toggleCheck, type Meal, type RoutineDay } from "@/lib/data";
import { ExerciseSession, type SessionExercise } from "@/components/exercise-session";
import { MealSheet } from "@/components/meal-sheet";
import { T } from "@/lib/theme";

const todayStr = () => new Date().toISOString().split("T")[0];

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const { student, detail, loading } = useMe();
  const [tab, setTab] = useState<"diet" | "routine">("diet");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [session, setSession] = useState<{ ex: SessionExercise; key: string } | null>(null);
  const [activeMeal, setActiveMeal] = useState<Meal | null>(null);

  const date = todayStr();

  // Carga los checks del día
  useEffect(() => {
    let alive = true;
    getChecks(date).then((list) => alive && setChecked(new Set(list))).catch(() => {});
    return () => { alive = false; };
  }, [date]);

  // Toggle optimista + persistencia
  const onToggle = useCallback(
    async (kind: "meal" | "exercise", itemKey: string) => {
      const full = `${kind}:${itemKey}`;
      const willBeDone = !checked.has(full);
      setChecked((prev) => {
        const next = new Set(prev);
        if (willBeDone) next.add(full); else next.delete(full);
        return next;
      });
      try {
        await toggleCheck(date, kind, itemKey, willBeDone);
      } catch {
        // revertir si falla
        setChecked((prev) => {
          const next = new Set(prev);
          if (willBeDone) next.delete(full); else next.add(full);
          return next;
        });
      }
    },
    [checked, date]
  );

  if (loading) return <View className="flex-1 bg-root items-center justify-center"><ActivityIndicator color={T.textPrimary} /></View>;
  if (!student || !detail) return <View className="flex-1 bg-root items-center justify-center"><Text className="text-tertiary">No se encontraron tus datos.</Text></View>;

  const todayWorkout: RoutineDay | undefined = detail.routine.days[0];

  return (
    <View className="flex-1 bg-root" style={{ paddingTop: insets.top }}>
      <View className="px-5 py-4 border-b border-hairline">
        <Text className="text-tertiary text-[13px]">Hola,</Text>
        <Text className="text-primary text-[24px] font-semibold">{student.name.split(" ")[0]}</Text>
        <View className="flex-row items-center gap-1.5 mt-1">
          <Flame size={14} color={T.warning} />
          <Text className="text-secondary text-[13px]">Racha de {student.streak} días</Text>
        </View>
      </View>

      <View className="flex-row gap-2 px-5 pt-4">
        {(["diet", "routine"] as const).map((t) => {
          const active = tab === t;
          return (
            <Pressable key={t} onPress={() => setTab(t)}
              className="flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl border"
              style={{ backgroundColor: active ? T.textPrimary : T.surface, borderColor: active ? T.textPrimary : T.hairline }}>
              {t === "diet" ? <Utensils size={14} color={active ? T.textInverse : T.textSecondary} /> : <Dumbbell size={14} color={active ? T.textInverse : T.textSecondary} />}
              <Text className="text-[13px] font-medium" style={{ color: active ? T.textInverse : T.textSecondary }}>
                {t === "diet" ? "Dieta" : "Rutina"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100, gap: 14 }}>
        {tab === "diet" ? (
          <>
            <CalorieRing kcal={detail.diet.totalCalories} protein={detail.diet.macros.protein} carbs={detail.diet.macros.carbs} fat={detail.diet.macros.fat} />
            <Text className="text-tertiary text-[11px] uppercase font-medium px-1" style={{ letterSpacing: 0.8 }}>{detail.diet.name}</Text>
            {detail.diet.meals.map((m, i) => (
              <MealCard key={i} meal={m} done={checked.has(`meal:${m.name}`)} onToggle={() => onToggle("meal", m.name)} onOpen={() => setActiveMeal(m)} />
            ))}
          </>
        ) : (
          <>
            {todayWorkout ? (
              <>
                <View className="rounded-2xl bg-surface border border-hairline p-5">
                  <Text className="text-primary text-[17px] font-semibold">{todayWorkout.day} · {todayWorkout.label}</Text>
                  <Text className="text-tertiary text-[12px] mt-1">{todayWorkout.muscleGroup}</Text>
                </View>
                {todayWorkout.exercises.map((ex, i) => {
                  const key = `${todayWorkout.day}|${ex.name}`;
                  const done = checked.has(`exercise:${key}`);
                  return (
                    <View key={i} className="p-4 rounded-2xl border" style={{ backgroundColor: done ? "rgba(52,211,153,0.04)" : T.surface, borderColor: done ? "rgba(52,211,153,0.13)" : T.hairline }}>
                      <View className="flex-row items-center">
                        <CheckCircle done={done} />
                        <View className="flex-1 ml-3">
                          <Text className="text-[14px] font-medium" style={{ color: done ? T.textTertiary : T.textPrimary, textDecorationLine: done ? "line-through" : "none" }}>{ex.name}</Text>
                          <Text className="text-tertiary text-[12px] mt-0.5">{ex.sets}×{ex.reps}{ex.weight ? ` · ${ex.weight}` : ""}{ex.bodyweight ? " · peso corporal" : ""}</Text>
                        </View>
                      </View>
                      <Pressable
                        onPress={() => setSession({ ex: { ejercicioId: ex.ejercicioId, name: ex.name, muscleGroup: ex.muscleGroup, bodyweight: !!ex.bodyweight, sets: ex.sets, reps: ex.reps, weight: ex.weight }, key })}
                        className="flex-row items-center justify-center gap-2 mt-3 py-2.5 rounded-xl active:opacity-80"
                        style={{ backgroundColor: done ? T.surfaceRaised : T.textPrimary }}
                      >
                        <Play size={14} color={done ? T.textSecondary : T.textInverse} fill={done ? T.textSecondary : T.textInverse} />
                        <Text className="text-[13px] font-semibold" style={{ color: done ? T.textSecondary : T.textInverse }}>{done ? "Repetir" : "Comenzar ejercicio"}</Text>
                      </Pressable>
                    </View>
                  );
                })}
              </>
            ) : (
              <Text className="text-tertiary text-[13px] text-center py-10">Sin rutina asignada</Text>
            )}
          </>
        )}
      </ScrollView>

      <ExerciseSession
        open={session !== null}
        exercise={session?.ex ?? null}
        onClose={() => setSession(null)}
        onCompleted={() => {
          if (session && !checked.has(`exercise:${session.key}`)) onToggle("exercise", session.key);
          setSession(null);
        }}
      />

      <MealSheet open={activeMeal !== null} meal={activeMeal} onClose={() => setActiveMeal(null)} />
    </View>
  );
}

function CheckCircle({ done, bullet }: { done: boolean; bullet?: boolean }) {
  return (
    <View className="w-5 h-5 rounded-full items-center justify-center"
      style={{ backgroundColor: done ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)", borderWidth: 1.5, borderColor: done ? "rgba(52,211,153,0.42)" : "rgba(255,255,255,0.09)" }}>
      {done && <CheckCircle2 size={11} strokeWidth={2.5} color={T.success} />}
    </View>
  );
}

function CalorieRing({ kcal, protein, carbs, fat }: { kcal: number; protein: number; carbs: number; fat: number }) {
  const R = 44;
  const circ = 2 * Math.PI * R;
  return (
    <View className="flex-row items-center gap-5 rounded-2xl bg-surface border border-hairline p-5">
      <View style={{ width: 108, height: 108 }}>
        <Svg width={108} height={108} viewBox="0 0 100 100" style={{ transform: [{ rotate: "-90deg" }] }}>
          <Circle cx={50} cy={50} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5.5} />
          <Circle cx={50} cy={50} r={R} fill="none" stroke={T.success} strokeWidth={5.5} strokeLinecap="round" strokeDasharray={`${circ * 0.66} ${circ}`} />
        </Svg>
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} className="items-center justify-center">
          <Text className="text-primary text-[20px] font-light">{kcal}</Text>
          <Text className="text-tertiary text-[8px] uppercase mt-0.5" style={{ letterSpacing: 1 }}>kcal</Text>
        </View>
      </View>
      <View className="flex-1 gap-3">
        <MacroBar label="Proteína" value={protein} max={200} color={T.success} />
        <MacroBar label="Carbos" value={carbs} max={350} color={T.info} />
        <MacroBar label="Grasa" value={fat} max={90} color="#fb923c" />
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

function MealCard({ meal, done, onToggle, onOpen }: { meal: Meal; done: boolean; onToggle: () => void; onOpen: () => void }) {
  return (
    <Pressable onPress={onOpen} className="rounded-2xl overflow-hidden border"
      style={{ backgroundColor: done ? "rgba(52,211,153,0.04)" : T.surface, borderColor: done ? "rgba(52,211,153,0.13)" : T.hairline }}>
      <View className="flex-row items-center gap-2.5 px-4 py-3.5">
        {/* El check toggle es independiente de abrir el detalle */}
        <Pressable onPress={onToggle} hitSlop={8}><CheckCircle done={done} /></Pressable>
        <Text className="text-[13px] font-medium flex-1" style={{ color: done ? T.textTertiary : T.textSecondary, textDecorationLine: done ? "line-through" : "none" }}>{meal.name}</Text>
        <Text className="text-tertiary text-[10px]">{meal.time} · {meal.calories} kcal</Text>
        <ChevronRight size={15} color={T.textTertiary} />
      </View>
      <Text className="text-tertiary text-[10px] pb-3 px-4 pl-11" numberOfLines={1}>{meal.items.join(" · ")}</Text>
    </Pressable>
  );
}
