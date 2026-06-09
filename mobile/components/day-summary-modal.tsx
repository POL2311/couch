/* ═══════════════════════════════════════════
   Resumen de un día (coach): qué entrenó el alumno
   y qué comidas registró ese día.
   ═══════════════════════════════════════════ */
import { View, Text, ScrollView, Pressable, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, Dumbbell, Utensils, CheckCircle2 } from "lucide-react-native";
import type { StudentDetail, ExerciseLog } from "@/lib/data";
import * as I from "@/lib/insights";
import { T } from "@/lib/theme";

export function DaySummaryModal({ open, date, logs, checks, detail, onClose }: {
  open: boolean; date: string | null; logs: ExerciseLog[]; checks: I.Check[]; detail: StudentDetail; onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  if (!date) return null;
  const s = I.daySummary(date, logs, checks, detail);
  const planMeals = detail.diet?.meals ?? [];

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
        <View className="rounded-t-3xl bg-surface border-t border-hairline" style={{ paddingBottom: insets.bottom + 24, maxHeight: "85%" }}>
          <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
            <View>
              <Text className="text-primary text-[18px] font-semibold">{I.prettyDate(date)}</Text>
              <Text className="text-tertiary text-[12px] mt-0.5">Resumen del día</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10} className="w-8 h-8 rounded-full items-center justify-center bg-surface-raised"><X size={15} color={T.textTertiary} /></Pressable>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 12, gap: 16 }}>
            {/* Entrenamiento */}
            <View>
              <View className="flex-row items-center gap-2 mb-2">
                <Dumbbell size={15} color={T.info} />
                <Text className="text-secondary text-[13px] font-medium">Entrenamiento</Text>
              </View>
              {!s.trained ? (
                <View className="rounded-xl bg-surface-raised p-4">
                  <Text className="text-tertiary text-[13px]">No registró entrenamiento este día.</Text>
                </View>
              ) : (
                <View className="rounded-xl bg-surface-raised overflow-hidden">
                  {s.exercises.map((ex: ExerciseLog, i: number) => (
                    <View key={ex.id} className="px-4 py-3" style={{ borderBottomWidth: i === s.exercises.length - 1 ? 0 : 1, borderBottomColor: T.hairline }}>
                      <Text className="text-primary text-[13px] font-medium">{ex.exerciseName}</Text>
                      <View className="flex-row flex-wrap gap-1.5 mt-1.5">
                        {ex.sets.map((st, j) => (
                          <View key={j} className="px-2 py-0.5 rounded-md" style={{ backgroundColor: st.done ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)" }}>
                            <Text className="text-[11px] font-medium" style={{ color: st.done ? T.success : T.textSecondary }}>
                              {st.reps || "—"}{!ex.bodyweight && st.weight ? `×${st.weight}` : " reps"}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Nutrición */}
            <View>
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <Utensils size={15} color={T.success} />
                  <Text className="text-secondary text-[13px] font-medium">Comidas</Text>
                </View>
                <Text className="text-tertiary text-[12px]">{s.mealsDone.length}/{s.mealsTotal} registradas</Text>
              </View>
              {planMeals.length === 0 ? (
                <View className="rounded-xl bg-surface-raised p-4"><Text className="text-tertiary text-[13px]">Sin dieta asignada.</Text></View>
              ) : (
                <View className="rounded-xl bg-surface-raised overflow-hidden">
                  {planMeals.map((m, i) => {
                    const done = s.mealsDone.includes(m.name);
                    return (
                      <View key={i} className="flex-row items-center px-4 py-3" style={{ borderBottomWidth: i === planMeals.length - 1 ? 0 : 1, borderBottomColor: T.hairline }}>
                        <View className="w-5 h-5 rounded-full items-center justify-center" style={{ backgroundColor: done ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.05)", borderWidth: 1.5, borderColor: done ? "rgba(52,211,153,0.5)" : "rgba(255,255,255,0.1)" }}>
                          {done && <CheckCircle2 size={12} strokeWidth={2.5} color={T.success} />}
                        </View>
                        <Text className="text-[13px] ml-3 flex-1" style={{ color: done ? T.textSecondary : T.textTertiary, textDecorationLine: done ? "none" : "none" }}>{m.time} · {m.name}</Text>
                        <Text className="text-tertiary text-[11px]">{done ? "✓" : "—"}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
