/* ═══════════════════════════════════════════
   Periodización y Ciclos (coach) — paridad 1:1 con la web
   (src/app/(dashboard)/coach/periodization/page.tsx +
   src/components/bulk-periodization-wizard.tsx).
   Distribución por etapa, cronograma de cambios
   programados (con cancelar) y wizard de programación masiva.
   ═══════════════════════════════════════════ */
import { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Modal, TextInput, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ChevronLeft, CalendarRange, Calendar, Trash2, Check, Users, SlidersHorizontal, CalendarClock, ArrowLeft, ArrowRight, X } from "lucide-react-native";
import { getStudents, getTemplates, applyStageChange, updateStudentData, type Student, type Stage, type Template } from "@/lib/data";
import { T, STAGE_COLORS } from "@/lib/theme";

const STAGES: Stage[] = ["Volumen", "Definición", "Mantenimiento", "Recomposición"];
const toISO = (d: Date) => d.toISOString().split("T")[0];
const fmtShort = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" });
const fmtLong = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });

export default function PeriodizationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getStudents().then(setStudents).catch(() => {}).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const metrics = useMemo(() => {
    const total = students.length;
    const byStage = (st: Stage) => students.filter((s) => s.stage === st).length;
    const scheduled = students
      .filter((s) => s.scheduledChange != null)
      .map((s) => ({ id: s.id, name: s.name, executionDate: s.scheduledChange!.executionDate, targetStage: s.scheduledChange!.stage, targetStageNumber: s.scheduledChange!.stageNumber }));
    return {
      total,
      counts: { Volumen: byStage("Volumen"), "Definición": byStage("Definición"), Mantenimiento: byStage("Mantenimiento"), "Recomposición": byStage("Recomposición") } as Record<Stage, number>,
      scheduled,
    };
  }, [students]);

  const cancelScheduled = (studentId: string) => {
    Alert.alert("Cancelar programación", "¿Seguro que deseas cancelar este cambio programado?", [
      { text: "No", style: "cancel" },
      {
        text: "Sí, cancelar", style: "destructive",
        onPress: async () => {
          try { await updateStudentData(studentId, {}, { scheduledChange: null }); load(); } catch { Alert.alert("Error", "No se pudo cancelar."); }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-root" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-5 py-4 border-b border-hairline">
        <Pressable onPress={() => router.back()} hitSlop={10} className="w-9 h-9 rounded-xl items-center justify-center bg-surface border border-hairline active:opacity-70">
          <ChevronLeft size={18} color={T.textSecondary} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-primary text-[20px] font-semibold">Periodización</Text>
          <Text className="text-tertiary text-[12px] mt-0.5">Distribución y cambios de etapa</Text>
        </View>
        <Pressable onPress={() => setWizardOpen(true)} className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent active:opacity-80">
          <CalendarRange size={15} color={T.textInverse} strokeWidth={2} />
          <Text className="text-inverse text-[13px] font-medium">Programar</Text>
        </Pressable>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator color={T.textPrimary} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32, gap: 16 }}>
          {/* KPIs por etapa */}
          <View className="flex-row flex-wrap gap-3">
            {STAGES.map((st) => {
              const count = metrics.counts[st];
              const color = STAGE_COLORS[st] ?? T.textSecondary;
              const pct = metrics.total > 0 ? (count / metrics.total) * 100 : 0;
              return (
                <View key={st} className="rounded-2xl p-5 bg-surface border border-hairline" style={{ width: "47%", flexGrow: 1 }}>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-secondary text-[11px] font-medium">{st}</Text>
                    <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: color + "1a" }}>
                      <Text className="text-[10px] font-semibold" style={{ color }}>{count}</Text>
                    </View>
                  </View>
                  <View className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                    <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Cronograma de cambios */}
          <View className="rounded-2xl bg-surface border border-hairline overflow-hidden">
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-hairline">
              <Text className="text-primary text-[14px] font-medium">Cronograma de cambios</Text>
              <Text className="text-tertiary text-[10px]">Ejecución automática</Text>
            </View>
            <View className="p-5 gap-4">
              {metrics.scheduled.length === 0 ? (
                <View className="items-center py-6">
                  <Calendar size={26} color={T.textTertiary} strokeWidth={1.5} />
                  <Text className="text-secondary text-[13px] font-medium mt-3">No hay cambios programados</Text>
                  <Text className="text-tertiary text-[11px] mt-1 text-center">Usa "Programar" para automatizar cambios de etapa en lote.</Text>
                </View>
              ) : (
                metrics.scheduled.map((c) => (
                  <View key={c.id} className="flex-row items-center justify-between gap-2 p-4 rounded-xl bg-surface-raised border border-hairline">
                    <View className="flex-1">
                      <Pressable onPress={() => router.push(`/(coach)/student/${c.id}` as any)}>
                        <Text className="text-primary text-[13px] font-semibold">{c.name}</Text>
                      </Pressable>
                      <Text className="text-secondary text-[11px] mt-0.5">
                        Transición a <Text className="text-primary font-medium">{c.targetStage} (E{c.targetStageNumber})</Text>
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2 shrink-0">
                      <View className="px-2.5 py-1 rounded-md border border-hairline bg-surface-raised">
                        <Text className="text-secondary text-[11px] font-semibold">{fmtShort(c.executionDate)}</Text>
                      </View>
                      <Pressable onPress={() => cancelScheduled(c.id)} hitSlop={6} className="p-2 rounded-md active:opacity-70">
                        <Trash2 size={15} color="#f87171" />
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* Distribución de alumnos */}
          <View className="rounded-2xl bg-surface border border-hairline overflow-hidden">
            <View className="px-5 py-4 border-b border-hairline">
              <Text className="text-primary text-[14px] font-medium">Distribución de alumnos</Text>
            </View>
            <View className="p-5 gap-4">
              <Text className="text-secondary text-[12px]" style={{ lineHeight: 18 }}>
                La periodización adecuada evita estancamientos. Aconseja a tus alumnos cambiar de ciclo cada 8-12 semanas.
              </Text>
              <View className="gap-3 pt-1">
                {STAGES.map((st) => {
                  const count = metrics.counts[st];
                  const pct = metrics.total > 0 ? (count / metrics.total) * 100 : 0;
                  const color = STAGE_COLORS[st] ?? T.textSecondary;
                  return (
                    <View key={st} className="gap-1">
                      <View className="flex-row justify-between">
                        <Text className="text-primary text-[12px] font-medium">{st}</Text>
                        <Text className="text-secondary text-[12px]">{count} ({Math.round(pct)}%)</Text>
                      </View>
                      <View className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                        <View className="h-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      <BulkWizard open={wizardOpen} students={students} onClose={() => setWizardOpen(false)} onSuccess={load} />
    </View>
  );
}

/* ── Asistente de programación masiva (3 pasos) ── */
const WSTEPS = [
  { n: 1, label: "Alumnos", Icon: Users },
  { n: 2, label: "Configuración", Icon: SlidersHorizontal },
  { n: 3, label: "Programar", Icon: CalendarClock },
];

function BulkWizard({ open, students, onClose, onSuccess }: { open: boolean; students: Student[]; onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [stageFilter, setStageFilter] = useState<Stage | "all">("all");
  const [stage, setStage] = useState<Stage>("Volumen");
  const [stageNumber, setStageNumber] = useState("1");
  const [dietId, setDietId] = useState("");
  const [routineId, setRoutineId] = useState("");
  const [timing, setTiming] = useState<"immediate" | "scheduled">("scheduled");
  const [executionDate, setExecutionDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 10); return toISO(d); });
  const [showPicker, setShowPicker] = useState(false);
  const [diets, setDiets] = useState<Template[]>([]);
  const [routines, setRoutines] = useState<Template[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    getTemplates().then((all) => {
      setDiets(all.filter((t) => t.type === "diet"));
      setRoutines(all.filter((t) => t.type === "routine"));
    }).catch(() => {});
  }, [open]);

  const reset = () => { setStep(1); setSelected(new Set()); setStageFilter("all"); setStage("Volumen"); setStageNumber("1"); setDietId(""); setRoutineId(""); setTiming("scheduled"); setSubmitting(false); };
  const close = () => { reset(); onClose(); };

  const visible = useMemo(() => (stageFilter === "all" ? students : students.filter((s) => s.stage === stageFilter)), [students, stageFilter]);
  const toggle = (id: string) => setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected((p) => {
    const ids = visible.map((s) => s.id);
    const allSel = ids.length > 0 && ids.every((id) => p.has(id));
    const n = new Set(p);
    ids.forEach((id) => (allSel ? n.delete(id) : n.add(id)));
    return n;
  });

  const dietName = diets.find((d) => d.id === dietId)?.name;
  const routineName = routines.find((r) => r.id === routineId)?.name;
  const canNext = step === 1 ? selected.size > 0 : true;

  const submit = async () => {
    setSubmitting(true);
    try {
      await applyStageChange({
        studentIds: Array.from(selected),
        stage,
        stageNumber: parseInt(stageNumber) || 1,
        dietTemplateId: dietId || undefined,
        routineTemplateId: routineId || undefined,
        executionDate: timing === "scheduled" ? executionDate : undefined,
      });
      onSuccess();
      close();
    } catch {
      Alert.alert("Error", "Hubo un error al guardar la programación masiva.");
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
      <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
        <View className="rounded-t-3xl bg-surface border-t border-hairline" style={{ maxHeight: "90%" }}>
          {/* Header + stepper */}
          <View className="px-6 pt-5 pb-4 border-b border-hairline">
            <View className="flex-row items-center justify-between">
              <Text className="text-primary text-[16px] font-semibold">Programación masiva</Text>
              <Pressable onPress={close} hitSlop={10} className="w-8 h-8 rounded-full items-center justify-center bg-surface-raised"><X size={15} color={T.textTertiary} /></Pressable>
            </View>
            <View className="flex-row items-center gap-2 mt-4">
              {WSTEPS.map((s, i) => {
                const active = step === s.n, done = step > s.n;
                return (
                  <View key={s.n} className="flex-row items-center gap-2 flex-1">
                    <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: active || done ? T.textPrimary : T.surfaceRaised, borderWidth: 1, borderColor: T.hairline }}>
                      {done ? <Check size={13} color={T.textInverse} /> : <Text className="text-[11px] font-semibold" style={{ color: active ? T.textInverse : T.textTertiary }}>{s.n}</Text>}
                    </View>
                    <Text className="text-[11px]" style={{ color: active ? T.textPrimary : T.textTertiary }} numberOfLines={1}>{s.label}</Text>
                    {i < WSTEPS.length - 1 && <View className="flex-1 h-px" style={{ backgroundColor: T.hairline }} />}
                  </View>
                );
              })}
            </View>
          </View>

          {/* Body */}
          <ScrollView contentContainerStyle={{ padding: 24 }} style={{ maxHeight: 420 }}>
            {step === 1 && (
              <View className="gap-3">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {(["all", ...STAGES] as const).map((f) => {
                    const a = stageFilter === f;
                    return (
                      <Pressable key={f} onPress={() => setStageFilter(f)} className="px-3 py-1.5 rounded-lg border" style={{ backgroundColor: a ? T.surfaceRaised : "transparent", borderColor: a ? T.textPrimary : T.hairline }}>
                        <Text className="text-[12px]" style={{ color: a ? T.textPrimary : T.textSecondary }}>{f === "all" ? "Todos" : f}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
                <View className="flex-row items-center justify-between">
                  <Text className="text-tertiary text-[11px]">{selected.size} seleccionado(s)</Text>
                  <Pressable onPress={toggleAll}><Text className="text-secondary text-[11px]">Seleccionar visibles</Text></Pressable>
                </View>
                <View className="rounded-xl border border-hairline overflow-hidden">
                  {visible.map((s, i) => {
                    const sel = selected.has(s.id);
                    return (
                      <Pressable key={s.id} onPress={() => toggle(s.id)} className="flex-row items-center gap-3 px-4 py-3" style={{ borderBottomWidth: i === visible.length - 1 ? 0 : 1, borderBottomColor: T.hairline, backgroundColor: sel ? T.surfaceRaised : "transparent" }}>
                        <View className="w-5 h-5 rounded-md items-center justify-center" style={{ backgroundColor: sel ? T.textPrimary : "transparent", borderWidth: 1, borderColor: sel ? T.textPrimary : T.hairline }}>
                          {sel && <Check size={13} color={T.textInverse} />}
                        </View>
                        <View className="flex-1">
                          <Text className="text-primary text-[13px]">{s.name}</Text>
                          <Text className="text-tertiary text-[11px]">{s.stage} · E{s.stageNumber}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                  {visible.length === 0 && <Text className="text-tertiary text-[12px] text-center py-6">Sin alumnos en este filtro.</Text>}
                </View>
              </View>
            )}

            {step === 2 && (
              <View className="gap-4">
                <WField label="Nueva etapa">
                  <View className="flex-row flex-wrap gap-2">
                    {STAGES.map((st) => {
                      const a = stage === st, color = STAGE_COLORS[st] ?? T.textSecondary;
                      return (
                        <Pressable key={st} onPress={() => setStage(st)} className="px-3 py-2 rounded-xl border" style={{ backgroundColor: a ? color + "1a" : T.surfaceRaised, borderColor: a ? color : T.hairline }}>
                          <Text className="text-[12px] font-medium" style={{ color: a ? color : T.textSecondary }}>{st}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </WField>
                <WField label="Número de etapa">
                  <TextInput value={stageNumber} onChangeText={setStageNumber} keyboardType="number-pad" placeholder="1" placeholderTextColor={T.textTertiary} className="px-3.5 py-3 rounded-xl text-[15px] text-primary bg-surface-raised border border-hairline" />
                </WField>
                <WField label="Plantilla de dieta (opcional)">
                  <Picker options={[{ id: "", name: "Sin cambios" }, ...diets]} value={dietId} onSelect={setDietId} />
                </WField>
                <WField label="Plantilla de rutina (opcional)">
                  <Picker options={[{ id: "", name: "Sin cambios" }, ...routines]} value={routineId} onSelect={setRoutineId} />
                </WField>
              </View>
            )}

            {step === 3 && (
              <View className="gap-4">
                <WField label="¿Cuándo aplicar?">
                  <View className="flex-row gap-2">
                    {(["immediate", "scheduled"] as const).map((t) => {
                      const a = timing === t;
                      return (
                        <Pressable key={t} onPress={() => setTiming(t)} className="flex-1 flex-row items-center gap-2 p-3 rounded-lg border" style={{ backgroundColor: a ? T.surfaceRaised : "transparent", borderColor: a ? T.textPrimary : T.hairline }}>
                          <View className="w-3.5 h-3.5 rounded-full border items-center justify-center" style={{ borderColor: a ? T.textPrimary : T.hairline }}>
                            {a && <View className="w-2 h-2 rounded-full" style={{ backgroundColor: T.textPrimary }} />}
                          </View>
                          <Text className="text-[12px] font-medium text-primary">{t === "immediate" ? "Inmediato" : "Programar"}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </WField>
                {timing === "scheduled" && (
                  <WField label="Fecha de ejecución">
                    <Pressable onPress={() => setShowPicker(true)} className="px-3.5 py-3 rounded-xl bg-surface-raised border border-hairline flex-row items-center justify-between">
                      <Text className="text-primary text-[15px]">{fmtLong(executionDate)}</Text>
                      <Calendar size={15} color={T.textTertiary} />
                    </Pressable>
                    {showPicker && (
                      <DateTimePicker
                        value={new Date(executionDate + "T00:00:00")}
                        mode="date"
                        minimumDate={new Date()}
                        onChange={(_, d) => { setShowPicker(Platform.OS === "ios"); if (d) setExecutionDate(toISO(d)); }}
                      />
                    )}
                  </WField>
                )}
                <View className="rounded-xl p-4 gap-2 bg-surface-raised border border-hairline">
                  <WSummary label="Alumnos" value={`${selected.size}`} />
                  <WSummary label="Etapa" value={`${stage} · E${stageNumber}`} />
                  <WSummary label="Dieta" value={dietName || "Sin cambios"} />
                  <WSummary label="Rutina" value={routineName || "Sin cambios"} />
                  <WSummary label="Ejecución" value={timing === "immediate" ? "Inmediata" : fmtLong(executionDate)} />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View className="flex-row items-center justify-between px-6 py-4 border-t border-hairline" style={{ paddingBottom: 28 }}>
            <Pressable onPress={() => (step === 1 ? close() : setStep(step - 1))} className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-xl border border-hairline">
              {step === 1 ? <Text className="text-secondary text-[12px] font-medium">Cancelar</Text> : <><ArrowLeft size={14} color={T.textSecondary} /><Text className="text-secondary text-[12px] font-medium">Atrás</Text></>}
            </Pressable>
            {step < 3 ? (
              <Pressable onPress={() => setStep(step + 1)} disabled={!canNext} className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent active:opacity-80" style={{ opacity: canNext ? 1 : 0.5 }}>
                <Text className="text-inverse text-[12px] font-medium">Siguiente</Text><ArrowRight size={14} color={T.textInverse} />
              </Pressable>
            ) : (
              <Pressable onPress={submit} disabled={submitting || selected.size === 0} className="flex-row items-center gap-2 px-4 py-2.5 rounded-xl bg-accent active:opacity-80" style={{ opacity: submitting || selected.size === 0 ? 0.5 : 1 }}>
                {submitting ? <ActivityIndicator color={T.textInverse} /> : <Text className="text-inverse text-[12px] font-medium">{timing === "scheduled" ? "Programar para todos" : "Aplicar a todos"}</Text>}
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function WField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="gap-1.5">
      <Text className="text-secondary text-[10px] uppercase font-medium" style={{ letterSpacing: 1 }}>{label}</Text>
      {children}
    </View>
  );
}

function WSummary({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-tertiary text-[12px]">{label}</Text>
      <Text className="text-primary text-[12px] font-medium">{value}</Text>
    </View>
  );
}

/* Selector simple tipo dropdown (chips horizontales) para plantillas. */
function Picker({ options, value, onSelect }: { options: { id: string; name: string }[]; value: string; onSelect: (id: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {options.map((o) => {
        const a = value === o.id;
        return (
          <Pressable key={o.id || "none"} onPress={() => onSelect(o.id)} className="px-3 py-2 rounded-xl border" style={{ backgroundColor: a ? T.surfaceRaised : "transparent", borderColor: a ? T.textPrimary : T.hairline }}>
            <Text className="text-[12px]" style={{ color: a ? T.textPrimary : T.textSecondary }}>{o.name}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
