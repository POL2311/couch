/* ═══════════════════════════════════════════
   Ficha del alumno (COACH/ADMIN) — rediseño con
   header fijo + 4 pestañas (Resumen, Entrenamiento,
   Nutrición, Progreso). Escala a meses de historial.
   ═══════════════════════════════════════════ */
import { useEffect, useState, useCallback, useMemo } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Polyline } from "react-native-svg";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ChevronLeft, ChevronRight, Settings2, Dumbbell, Utensils, TrendingUp, LayoutGrid, CheckCircle2, AlertTriangle, CalendarDays } from "lucide-react-native";
import {
  getStudentFull, getStudentCarreras, getStudentLogs, getStudentChecks,
  type Student, type StudentDetail, type Carrera, type ExerciseLog,
} from "@/lib/data";
import { ManageStudentModal } from "@/components/manage-student-modal";
import { DaySummaryModal } from "@/components/day-summary-modal";
import { Sparkline } from "@/components/charts";
import { TrainingTab } from "@/components/student-tabs/training-tab";
import { NutritionTab } from "@/components/student-tabs/nutrition-tab";
import { ProgressTab } from "@/components/student-tabs/progress-tab";
import * as I from "@/lib/insights";
import { T, STAGE_COLORS, avatarBg } from "@/lib/theme";

type TabId = "resumen" | "entrenamiento" | "nutricion" | "progreso";
const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: "resumen", label: "Resumen", icon: LayoutGrid },
  { id: "entrenamiento", label: "Entreno", icon: Dumbbell },
  { id: "nutricion", label: "Nutrición", icon: Utensils },
  { id: "progreso", label: "Progreso", icon: TrendingUp },
];

export function StudentDetailView({ studentId, title = "Ficha del alumno", editable = false }: { studentId: string; title?: string; editable?: boolean }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [student, setStudent] = useState<Student | null>(null);
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [checks, setChecks] = useState<I.Check[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("resumen");
  const [manageOpen, setManageOpen] = useState(false);

  const load = useCallback(async () => {
    if (!studentId) return;
    const [full, runs, sessionLogs, dailyChecks] = await Promise.all([
      getStudentFull(studentId),
      getStudentCarreras(studentId),
      getStudentLogs(studentId),
      getStudentChecks(studentId),
    ]);
    setStudent(full?.student ?? null);
    setDetail(full?.detail ?? null);
    setCarreras(runs);
    setLogs(sessionLogs);
    setChecks(dailyChecks);
  }, [studentId]);

  useEffect(() => {
    let alive = true;
    load().finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [load]);

  return (
    <View className="flex-1 bg-root" style={{ paddingTop: insets.top }}>
      {/* Barra superior */}
      <View className="flex-row items-center px-4 py-3 gap-2">
        <Pressable onPress={() => router.back()} hitSlop={10} className="w-9 h-9 rounded-xl items-center justify-center bg-surface border border-hairline active:opacity-70">
          <ChevronLeft size={18} color={T.textSecondary} />
        </Pressable>
        <Text className="text-primary text-[15px] font-medium flex-1">{title}</Text>
        {editable && student && (
          <Pressable onPress={() => setManageOpen(true)} className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-hairline active:opacity-70">
            <Settings2 size={14} color={T.textSecondary} />
            <Text className="text-secondary text-[12px] font-medium">Gestionar</Text>
          </Pressable>
        )}
      </View>

      {loading || !student || !detail ? (
        <View className="flex-1 items-center justify-center">
          {loading ? <ActivityIndicator color={T.textPrimary} /> : <Text className="text-tertiary">No se encontró el alumno.</Text>}
        </View>
      ) : (
        <>
          {/* HEADER FIJO del alumno */}
          <StudentHeader student={student} detail={detail} />

          {/* Segmented control */}
          <View className="px-4 pt-3 pb-2">
            <View className="flex-row p-1 rounded-xl bg-surface border border-hairline">
              {TABS.map((t) => {
                const active = tab === t.id;
                return (
                  <Pressable key={t.id} onPress={() => setTab(t.id)} className="flex-1 flex-row items-center justify-center gap-1 py-2 rounded-lg" style={{ backgroundColor: active ? "rgba(255,255,255,0.08)" : "transparent" }}>
                    <t.icon size={13} color={active ? T.textPrimary : T.textTertiary} />
                    <Text className="text-[12px] font-medium" style={{ color: active ? T.textPrimary : T.textTertiary }}>{t.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Contenido de la pestaña */}
          {tab === "resumen" && <SummaryTab student={student} detail={detail} logs={logs} carreras={carreras} checks={checks} onGoTo={setTab} bottomInset={insets.bottom} />}
          {tab === "entrenamiento" && <TrainingTab detail={detail} logs={logs} bottomInset={insets.bottom} />}
          {tab === "nutricion" && <NutritionTab detail={detail} checks={checks} bottomInset={insets.bottom} />}
          {tab === "progreso" && <ProgressTab detail={detail} carreras={carreras} bottomInset={insets.bottom} />}
        </>
      )}

      {editable && student && (
        <ManageStudentModal open={manageOpen} studentId={studentId} currentStage={student.stage} onClose={() => setManageOpen(false)} onApplied={() => { setManageOpen(false); load(); }} />
      )}
    </View>
  );
}

function StudentHeader({ student, detail }: { student: Student; detail: StudentDetail }) {
  const wp = I.weightProgress(detail.weightHistory);
  const stageColor = STAGE_COLORS[student.stage] ?? T.textTertiary;
  return (
    <View className="flex-row items-center px-5 pb-1">
      <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: avatarBg(student.avatarColor) }}>
        <Text className="text-white text-[16px] font-semibold">{student.avatarInitials}</Text>
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-primary text-[18px] font-semibold">{student.name}</Text>
        <View className="flex-row items-center gap-2 mt-0.5">
          <View className="px-2 py-0.5 rounded-md" style={{ backgroundColor: stageColor + "1a" }}>
            <Text className="text-[11px] font-medium" style={{ color: stageColor }}>{student.stage}</Text>
          </View>
          <Text className="text-tertiary text-[13px]">
            {student.currentWeight} kg{wp.delta !== 0 ? ` · ${wp.delta > 0 ? "+" : ""}${wp.delta}` : ""}
          </Text>
        </View>
      </View>
    </View>
  );
}

/* ═══════════════ PESTAÑA RESUMEN ═══════════════ */
const DAY_SHORT = ["L", "M", "X", "J", "V", "S", "D"];
const fmtDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function SummaryTab({ student, detail, logs, carreras, checks, onGoTo, bottomInset }: {
  student: Student; detail: StudentDetail; logs: ExerciseLog[]; carreras: Carrera[]; checks: I.Check[]; onGoTo: (t: TabId) => void; bottomInset: number;
}) {
  const lastAct = useMemo(() => I.lastActivityDate(logs, carreras, detail.weightHistory), [logs, carreras, detail]);
  const data = useMemo(() => {
    const wk = I.trainingLastDays(logs, detail.routine, lastAct ?? I.todayStr(), 7);
    const diet = I.dietComplianceRecent(checks, detail);
    const wp = I.weightProgress(detail.weightHistory);
    const daysAgo = lastAct ? I.daysBetween(lastAct, I.todayStr()) : null;
    const flags = I.redFlags(detail, logs, checks, student.paymentStatus);
    return { wk, diet, wp, daysAgo, flags };
  }, [student, detail, logs, carreras, checks, lastAct]);

  const [weekStart, setWeekStart] = useState(() => I.weekStartOf(lastAct ?? I.todayStr()));
  const [selDate, setSelDate] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const days = I.weekDays(weekStart);
  const trainedSet = useMemo(() => new Set(logs.map((l) => l.date)), [logs]);
  const mealSet = useMemo(() => new Set(checks.filter((c) => c.kind === "meal").map((c) => c.date)), [checks]);
  const lastLabel = data.daysAgo === null ? "—" : data.daysAgo <= 0 ? "Hoy" : data.daysAgo === 1 ? "Ayer" : `${data.daysAgo} días`;

  return (
    <>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: bottomInset + 32, gap: 16 }}>
        {/* KPIs */}
        <View className="flex-row flex-wrap gap-3">
          <Kpi label="Peso" value={`${data.wp.current}`} unit="kg" sub={data.wp.delta !== 0 ? `${data.wp.delta > 0 ? "+" : ""}${data.wp.delta} kg` : "—"} subColor={data.wp.delta > 0 ? T.success : T.textTertiary} />
          <Kpi label="Entreno (sem)" value={`${data.wk.done}/${data.wk.planned}`} accent={data.wk.done >= data.wk.planned ? T.success : data.wk.done === 0 ? T.danger : T.warning} />
          <Kpi label="Dieta" value={data.diet.days ? `${data.diet.pct}%` : "—"} sub={data.diet.days ? `${data.diet.days} días` : "sin registro"} accent={data.diet.pct >= 80 ? T.success : data.diet.days ? T.warning : T.textTertiary} />
          <Kpi label="Últ. actividad" value={lastLabel} />
        </View>

        {/* Focos rojos */}
        <View className="rounded-2xl bg-surface border border-hairline p-4">
          {data.flags.length === 0 ? (
            <View className="flex-row items-center gap-2">
              <CheckCircle2 size={16} color={T.success} />
              <Text className="text-secondary text-[13px]">Todo en orden — sin focos rojos.</Text>
            </View>
          ) : (
            <View className="gap-2">
              <Text className="text-tertiary text-[11px] uppercase font-medium" style={{ letterSpacing: 0.8 }}>Focos rojos</Text>
              {data.flags.map((f, i) => (
                <View key={i} className="flex-row items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: "rgba(248,113,113,0.1)" }}>
                  <AlertTriangle size={14} color={T.danger} />
                  <Text className="text-[13px] flex-1" style={{ color: T.danger }}>{f}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Mini-gráfica de peso */}
        <View className="rounded-2xl bg-surface border border-hairline overflow-hidden">
          <View className="px-5 py-3.5 border-b border-hairline flex-row items-center justify-between">
            <Text className="text-primary text-[14px] font-medium">Peso</Text>
            <Pressable onPress={() => onGoTo("progreso")}><Text className="text-tertiary text-[12px]">Ver todo</Text></Pressable>
          </View>
          <View className="p-5"><Sparkline data={detail.weightHistory.map((w) => w.weight)} /></View>
        </View>

        {/* Resumen por día (semana navegable + calendario) */}
        <View className="rounded-2xl bg-surface border border-hairline overflow-hidden">
          <View className="px-5 py-3.5 border-b border-hairline flex-row items-center justify-between">
            <Text className="text-primary text-[14px] font-medium">Resumen por día</Text>
            <Pressable onPress={() => setShowPicker(true)} hitSlop={8} className="flex-row items-center gap-1.5">
              <CalendarDays size={15} color={T.textTertiary} />
              <Text className="text-tertiary text-[12px]">Calendario</Text>
            </Pressable>
          </View>

          {/* Navegación de semana */}
          <View className="flex-row items-center justify-between px-4 py-2.5">
            <Pressable onPress={() => setWeekStart(I.addDays(weekStart, -7))} hitSlop={8} className="w-8 h-8 rounded-lg items-center justify-center bg-surface-raised"><ChevronLeft size={16} color={T.textSecondary} /></Pressable>
            <Text className="text-secondary text-[12px] font-medium">{I.fmtShort(days[0])} – {I.fmtShort(days[6])}</Text>
            <Pressable onPress={() => setWeekStart(I.addDays(weekStart, 7))} hitSlop={8} className="w-8 h-8 rounded-lg items-center justify-center bg-surface-raised"><ChevronRight size={16} color={T.textSecondary} /></Pressable>
          </View>

          {/* Fila de 7 días */}
          <View className="flex-row px-3 pb-4 pt-1">
            {days.map((date, i) => {
              const trained = trainedSet.has(date);
              const ate = mealSet.has(date);
              const dayNum = parseInt(date.split("-")[2]);
              return (
                <Pressable key={date} onPress={() => setSelDate(date)} className="flex-1 items-center py-2 mx-0.5 rounded-xl active:opacity-70" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                  <Text className="text-tertiary text-[10px] font-medium">{DAY_SHORT[i]}</Text>
                  <Text className="text-secondary text-[14px] font-semibold mt-0.5">{dayNum}</Text>
                  <View className="flex-row gap-1 mt-1.5" style={{ height: 6 }}>
                    {trained && <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: T.info }} />}
                    {ate && <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: T.success }} />}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Leyenda */}
          <View className="flex-row items-center gap-4 px-4 pb-4">
            <View className="flex-row items-center gap-1.5"><View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: T.info }} /><Text className="text-tertiary text-[11px]">Entrenó</Text></View>
            <View className="flex-row items-center gap-1.5"><View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: T.success }} /><Text className="text-tertiary text-[11px]">Registró comidas</Text></View>
            <Text className="text-tertiary text-[11px] ml-auto">Toca un día →</Text>
          </View>
        </View>
      </ScrollView>

      <DaySummaryModal open={selDate !== null} date={selDate} logs={logs} checks={checks} detail={detail} onClose={() => setSelDate(null)} />
      {showPicker && (
        <DateTimePicker
          value={new Date(`${selDate ?? days[0]}T12:00:00`)}
          mode="date"
          display="calendar"
          onChange={(e, d) => {
            setShowPicker(false);
            if (e.type === "set" && d) {
              const ds = fmtDate(d);
              setWeekStart(I.weekStartOf(ds));
              setSelDate(ds);
            }
          }}
        />
      )}
    </>
  );
}

function Kpi({ label, value, unit, sub, subColor, accent = T.textPrimary }: { label: string; value: string; unit?: string; sub?: string; subColor?: string; accent?: string }) {
  return (
    <View className="rounded-2xl p-4 bg-surface border border-hairline" style={{ width: "47%", flexGrow: 1 }}>
      <Text className="text-tertiary text-[10px] uppercase font-medium" style={{ letterSpacing: 0.8 }}>{label}</Text>
      <View className="flex-row items-baseline mt-1.5">
        <Text className="text-[22px] font-semibold" style={{ color: accent }}>{value}</Text>
        {unit && <Text className="text-tertiary text-[12px] ml-1">{unit}</Text>}
      </View>
      {sub && <Text className="text-[11px] mt-0.5" style={{ color: subColor ?? T.textTertiary }}>{sub}</Text>}
    </View>
  );
}

