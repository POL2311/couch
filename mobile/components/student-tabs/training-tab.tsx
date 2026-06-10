/* ═══════════════════════════════════════════
   Pestaña ENTRENAMIENTO (coach): semáforo de la semana,
   récords, carga total y historial por ejercicio
   (plegable + paginado), prescrito vs real.
   ═══════════════════════════════════════════ */
import { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { ChevronLeft, ChevronRight, Trophy, ChevronDown, Dumbbell } from "lucide-react-native";
import type { StudentDetail, ExerciseLog } from "@/lib/data";
import * as I from "@/lib/insights";
import { Sparkline, Bars } from "@/components/charts";
import { T } from "@/lib/theme";

const DAY_SHORT = ["L", "M", "X", "J", "V", "S", "D"];
const STATUS_COLOR: Record<string, string> = { done: T.success, missed: T.danger, rest: "#3a3a3c" };
const STATUS_BG: Record<string, string> = { done: "rgba(52,211,153,0.12)", missed: "rgba(248,113,113,0.12)", rest: "rgba(255,255,255,0.04)" };

export function TrainingTab({ detail, logs, bottomInset }: { detail: StudentDetail; logs: ExerciseLog[]; bottomInset: number }) {
  const lastAct = useMemo(() => (logs.length ? logs.map((l) => l.date).sort().slice(-1)[0] : I.todayStr()), [logs]);
  const [weekStart, setWeekStart] = useState(() => I.weekStartOf(lastAct));
  const week = useMemo(() => I.weekTraining(logs, detail.routine, weekStart), [logs, detail, weekStart]);
  const records = useMemo(() => I.records(logs).slice(0, 6), [logs]);
  const volume = useMemo(() => I.volumeByDate(logs).slice(-8), [logs]);
  const exercises = useMemo(() => I.byExercise(logs), [logs]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [visible, setVisible] = useState(6);

  const toggle = (name: string) => setExpanded((p) => { const n = new Set(p); n.has(name) ? n.delete(name) : n.add(name); return n; });

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: bottomInset + 32, gap: 16 }}>
      {/* Semáforo de la semana */}
      <View className="rounded-2xl bg-surface border border-hairline overflow-hidden">
        <View className="px-5 py-3.5 border-b border-hairline flex-row items-center justify-between">
          <Text className="text-primary text-[14px] font-medium">Cumplimiento semanal</Text>
          <Text className="text-[13px] font-semibold" style={{ color: week.done >= week.planned ? T.success : week.done === 0 ? T.danger : T.warning }}>{week.done}/{week.planned}</Text>
        </View>
        <View className="flex-row items-center justify-between px-4 py-2.5">
          <Pressable onPress={() => setWeekStart(I.addDays(weekStart, -7))} hitSlop={8} className="w-8 h-8 rounded-lg items-center justify-center bg-surface-raised"><ChevronLeft size={16} color={T.textSecondary} /></Pressable>
          <Text className="text-secondary text-[12px] font-medium">{I.fmtShort(week.byDay[0].date)} – {I.fmtShort(week.byDay[6].date)}</Text>
          <Pressable onPress={() => setWeekStart(I.addDays(weekStart, 7))} hitSlop={8} className="w-8 h-8 rounded-lg items-center justify-center bg-surface-raised"><ChevronRight size={16} color={T.textSecondary} /></Pressable>
        </View>
        <View className="flex-row px-3 pb-3">
          {week.byDay.map((d, i) => (
            <View key={d.date} className="flex-1 items-center mx-0.5 py-2 rounded-xl" style={{ backgroundColor: STATUS_BG[d.status] }}>
              <Text className="text-tertiary text-[10px] font-medium">{DAY_SHORT[i]}</Text>
              <View className="w-6 h-6 rounded-full items-center justify-center mt-1.5" style={{ backgroundColor: STATUS_COLOR[d.status] }}>
                <Text className="text-[10px] font-bold" style={{ color: d.status === "rest" ? T.textSecondary : "#000" }}>{parseInt(d.date.split("-")[2])}</Text>
              </View>
            </View>
          ))}
        </View>
        <View className="flex-row items-center gap-4 px-4 pb-4">
          <Legend color={STATUS_COLOR.done} label="Entrenó" />
          <Legend color={STATUS_COLOR.missed} label="No entrenó" />
          <Legend color={STATUS_COLOR.rest} label="Descanso" />
        </View>
      </View>

      {/* Récords */}
      <View className="rounded-2xl bg-surface border border-hairline overflow-hidden">
        <View className="px-5 py-3.5 border-b border-hairline flex-row items-center gap-2">
          <Trophy size={15} color={T.warning} /><Text className="text-primary text-[14px] font-medium">Récords (mejor peso)</Text>
        </View>
        {records.length === 0 ? (
          <Text className="text-tertiary text-[13px] p-5">Sin récords con peso aún.</Text>
        ) : (
          <View className="p-3 flex-row flex-wrap gap-2">
            {records.map((r) => (
              <View key={r.name} className="rounded-xl bg-surface-raised px-3 py-2.5" style={{ width: "48%", flexGrow: 1 }}>
                <Text className="text-tertiary text-[11px]" numberOfLines={1}>{r.name}</Text>
                <Text className="text-primary text-[16px] font-semibold mt-0.5">{r.weight} kg</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Carga total por sesión */}
      <View className="rounded-2xl bg-surface border border-hairline overflow-hidden">
        <View className="px-5 py-3.5 border-b border-hairline"><Text className="text-primary text-[14px] font-medium">Carga total por sesión (kg×reps)</Text></View>
        <View className="p-5">
          {volume.length < 2 ? <Text className="text-tertiary text-[13px]">Pocas sesiones para graficar.</Text> : <Bars data={volume.map((v) => ({ label: I.fmtShort(v.date), value: v.volume }))} />}
        </View>
      </View>

      {/* Historial por ejercicio (plegable + paginado) */}
      <View className="rounded-2xl bg-surface border border-hairline overflow-hidden">
        <View className="px-5 py-3.5 border-b border-hairline flex-row items-center gap-2">
          <Dumbbell size={15} color={T.info} /><Text className="text-primary text-[14px] font-medium">Historial por ejercicio</Text>
        </View>
        {exercises.length === 0 ? (
          <Text className="text-tertiary text-[13px] p-5">Sin sesiones registradas.</Text>
        ) : (
          <>
            {exercises.slice(0, visible).map((ex, idx) => {
              const open = expanded.has(ex.name);
              const series = ex.sessions.map((s) => I.maxWeight(s)).filter((w) => w > 0);
              return (
                <View key={ex.name} style={{ borderTopWidth: idx === 0 ? 0 : 1, borderTopColor: T.hairline }}>
                  <Pressable onPress={() => toggle(ex.name)} className="flex-row items-center px-5 py-3.5 active:bg-surface-raised">
                    <View className="flex-1">
                      <Text className="text-primary text-[13px] font-medium">{ex.name}</Text>
                      <Text className="text-tertiary text-[11px] mt-0.5">{ex.muscleGroup ?? ""} · {ex.sessions.length} sesion{ex.sessions.length > 1 ? "es" : ""}</Text>
                    </View>
                    <ChevronDown size={16} color={T.textTertiary} style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }} />
                  </Pressable>
                  {open && (
                    <View className="px-5 pb-4 gap-3">
                      {!ex.bodyweight && series.length >= 2 && (
                        <View className="rounded-xl bg-surface-raised p-3">
                          <Text className="text-tertiary text-[11px] mb-1">Progresión de peso máx</Text>
                          <Sparkline data={series} color={T.info} height={50} suffix=" kg" />
                        </View>
                      )}
                      {[...ex.sessions].reverse().map((s) => (
                        <View key={s.id} className="rounded-xl bg-surface-raised p-3">
                          <View className="flex-row items-center justify-between">
                            <Text className="text-secondary text-[12px] font-medium">{I.prettyDate(s.date)}</Text>
                            <Text className="text-tertiary text-[11px]">prescrito {s.prescribedSets}×{s.prescribedReps}{s.prescribedWeight ? ` @ ${s.prescribedWeight}` : ""}</Text>
                          </View>
                          <View className="flex-row flex-wrap gap-1.5 mt-2">
                            {s.sets.map((st, j) => (
                              <View key={j} className="px-2 py-0.5 rounded-md" style={{ backgroundColor: st.done ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)" }}>
                                <Text className="text-[11px] font-medium" style={{ color: st.done ? T.success : T.textSecondary }}>{st.reps || "—"}{!ex.bodyweight && st.weight ? `×${st.weight}` : " reps"}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
            {exercises.length > visible && (
              <Pressable onPress={() => setVisible((v) => v + 6)} className="px-5 py-3.5 border-t border-hairline items-center active:opacity-70">
                <Text className="text-secondary text-[13px] font-medium">Cargar más ({exercises.length - visible})</Text>
              </Pressable>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text className="text-tertiary text-[11px]">{label}</Text>
    </View>
  );
}
