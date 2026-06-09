/* ═══════════════════════════════════════════
   Pestaña NUTRICIÓN (coach): selector de fecha + plan
   del día con macros + cumplimiento (marcado por el
   alumno). El registro de alimentos consumidos llega
   en una fase futura.
   ═══════════════════════════════════════════ */
import { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ChevronLeft, ChevronRight, CalendarDays, CheckCircle2, Info } from "lucide-react-native";
import type { StudentDetail } from "@/lib/data";
import * as I from "@/lib/insights";
import { Bars } from "@/components/charts";
import { T } from "@/lib/theme";

const fmtDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function NutritionTab({ detail, checks, bottomInset }: { detail: StudentDetail; checks: I.Check[]; bottomInset: number }) {
  const [date, setDate] = useState(() => I.lastDietDate(checks));
  const [showPicker, setShowPicker] = useState(false);

  const meals = detail.diet?.meals ?? [];
  const macros = detail.diet?.macros ?? { protein: 0, carbs: 0, fat: 0 };
  const doneNames = useMemo(() => I.mealsDoneOn(checks, date), [checks, date]);
  const trend = useMemo(() => I.dietComplianceByDate(checks, detail).slice(-10), [checks, detail]);
  const recent = useMemo(() => I.dietComplianceRecent(checks, detail), [checks, detail]);

  const total = meals.length;
  const done = Math.min(doneNames.length, total);
  const pct = total ? Math.round((done / total) * 100) : 0;
  const hasRecord = doneNames.length > 0;

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: bottomInset + 32, gap: 16 }}>
      {/* Selector de fecha */}
      <View className="rounded-2xl bg-surface border border-hairline overflow-hidden">
        <View className="flex-row items-center justify-between px-4 py-3">
          <Pressable onPress={() => setDate(I.addDays(date, -1))} hitSlop={8} className="w-9 h-9 rounded-lg items-center justify-center bg-surface-raised"><ChevronLeft size={16} color={T.textSecondary} /></Pressable>
          <Pressable onPress={() => setShowPicker(true)} className="flex-row items-center gap-2">
            <CalendarDays size={15} color={T.textTertiary} />
            <Text className="text-primary text-[14px] font-medium">{I.prettyDate(date)}</Text>
          </Pressable>
          <Pressable onPress={() => setDate(I.addDays(date, 1))} hitSlop={8} className="w-9 h-9 rounded-lg items-center justify-center bg-surface-raised"><ChevronRight size={16} color={T.textSecondary} /></Pressable>
        </View>
      </View>

      {/* Cumplimiento del día */}
      <View className="rounded-2xl bg-surface border border-hairline p-5">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-tertiary text-[11px] uppercase font-medium" style={{ letterSpacing: 0.8 }}>Cumplimiento del día</Text>
          <Text className="text-[14px] font-semibold" style={{ color: !hasRecord ? T.textTertiary : pct >= 80 ? T.success : T.warning }}>
            {hasRecord ? `${done}/${total} · ${pct}%` : "sin registro"}
          </Text>
        </View>
        <View className="h-2 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
          <View className="h-full rounded-full" style={{ width: `${hasRecord ? pct : 0}%`, backgroundColor: pct >= 80 ? T.success : T.warning }} />
        </View>
      </View>

      {/* Plan del día con macros */}
      <View className="rounded-2xl bg-surface border border-hairline overflow-hidden">
        <View className="px-5 py-3.5 border-b border-hairline flex-row items-center justify-between">
          <Text className="text-primary text-[14px] font-medium">{detail.diet?.name || "Dieta no asignada"}</Text>
          {!!detail.diet?.totalCalories && <Text className="text-tertiary text-[12px]">{detail.diet.totalCalories} kcal</Text>}
        </View>
        {total === 0 ? (
          <Text className="text-tertiary text-[13px] p-5">Sin dieta asignada. Usa "Gestionar" para asignar una plantilla.</Text>
        ) : (
          <>
            <View className="flex-row gap-2 p-4">
              <Macro value={`${macros.protein}g`} label="Proteína" />
              <Macro value={`${macros.carbs}g`} label="Carbos" />
              <Macro value={`${macros.fat}g`} label="Grasa" />
            </View>
            {meals.map((m, i) => {
              const marked = doneNames.includes(m.name);
              return (
                <View key={i} className="flex-row items-center px-5 py-3" style={{ borderTopWidth: 1, borderTopColor: T.hairline }}>
                  <View className="w-5 h-5 rounded-full items-center justify-center" style={{ backgroundColor: marked ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.05)", borderWidth: 1.5, borderColor: marked ? "rgba(52,211,153,0.5)" : "rgba(255,255,255,0.1)" }}>
                    {marked && <CheckCircle2 size={12} strokeWidth={2.5} color={T.success} />}
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-secondary text-[13px] font-medium">{m.time} · {m.name}</Text>
                    <Text className="text-tertiary text-[11px] mt-0.5" numberOfLines={1}>{m.items.join(" · ")}</Text>
                  </View>
                  <Text className="text-tertiary text-[11px]">{m.calories} kcal</Text>
                </View>
              );
            })}
          </>
        )}
      </View>

      {/* Tendencia de cumplimiento */}
      <View className="rounded-2xl bg-surface border border-hairline overflow-hidden">
        <View className="px-5 py-3.5 border-b border-hairline flex-row items-center justify-between">
          <Text className="text-primary text-[14px] font-medium">Cumplimiento reciente</Text>
          {recent.days > 0 && <Text className="text-tertiary text-[12px]">{recent.pct}% · {recent.days} días</Text>}
        </View>
        <View className="p-5">
          {trend.length < 2 ? (
            <Text className="text-tertiary text-[13px]">Aún no hay suficientes días registrados.</Text>
          ) : (
            <Bars data={trend.map((d) => ({ label: I.fmtShort(d.date), value: Math.round((d.done / (d.total || 1)) * 100) }))} color={T.success} />
          )}
        </View>
      </View>

      {/* Nota: registro de alimentos */}
      <View className="flex-row items-start gap-2 px-4 py-3 rounded-xl" style={{ backgroundColor: "rgba(96,165,250,0.08)" }}>
        <Info size={14} color={T.info} style={{ marginTop: 1 }} />
        <Text className="text-[12px] flex-1" style={{ color: T.textSecondary }}>
          El cumplimiento se basa en las comidas que el alumno marca como hechas. El registro de alimentos consumidos (qué comió exactamente) llegará en una fase futura.
        </Text>
      </View>

      {showPicker && (
        <DateTimePicker
          value={new Date(`${date}T12:00:00`)}
          mode="date"
          display="calendar"
          onChange={(e, d) => { setShowPicker(false); if (e.type === "set" && d) setDate(fmtDate(d)); }}
        />
      )}
    </ScrollView>
  );
}

function Macro({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 items-center py-3 rounded-xl bg-surface-raised">
      <Text className="text-primary text-[16px] font-semibold">{value}</Text>
      <Text className="text-tertiary text-[11px] mt-0.5">{label}</Text>
    </View>
  );
}
