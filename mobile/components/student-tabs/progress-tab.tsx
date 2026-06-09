/* ═══════════════════════════════════════════
   Pestaña PROGRESO (coach): peso con selector de rango,
   medidas, fotos de progreso y carreras MD-Route.
   ═══════════════════════════════════════════ */
import { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { Footprints, Timer, Gauge } from "lucide-react-native";
import { API_URL, type StudentDetail, type Carrera } from "@/lib/data";
import * as I from "@/lib/insights";
import { Sparkline } from "@/components/charts";
import { RouteSilhouette } from "@/components/route-silhouette";
import { fmtDistance, fmtDuration } from "@/lib/geo";
import { T } from "@/lib/theme";

const RANGES = [{ label: "1m", months: 1 }, { label: "3m", months: 3 }, { label: "6m", months: 6 }, { label: "Todo", months: 0 }];
const absUrl = (u?: string | null) => (!u ? null : u.startsWith("http") || u.startsWith("file") ? u : `${API_URL}${u}`);

export function ProgressTab({ detail, carreras, bottomInset }: { detail: StudentDetail; carreras: Carrera[]; bottomInset: number }) {
  const [months, setMonths] = useState(6);
  const wh = useMemo(() => I.weightInRange(detail.weightHistory, months), [detail, months]);
  const wp = useMemo(() => I.weightProgress(wh), [wh]);
  const measurements = detail.measurements ?? [];
  const first = measurements[0];
  const last = measurements[measurements.length - 1];
  const photos = detail.photos ?? [];

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: bottomInset + 32, gap: 16 }}>
      {/* Peso con rango */}
      <View className="rounded-2xl bg-surface border border-hairline overflow-hidden">
        <View className="px-5 py-3.5 border-b border-hairline flex-row items-center justify-between">
          <Text className="text-primary text-[14px] font-medium">Peso</Text>
          <Text className="text-[13px] font-medium" style={{ color: wp.delta < 0 ? T.success : wp.delta > 0 ? T.warning : T.textTertiary }}>
            {wp.delta !== 0 ? `${wp.delta > 0 ? "+" : ""}${wp.delta} kg` : "—"}
          </Text>
        </View>
        <View className="flex-row gap-2 px-4 pt-3">
          {RANGES.map((r) => {
            const active = months === r.months;
            return (
              <Pressable key={r.label} onPress={() => setMonths(r.months)} className="flex-1 py-2 rounded-lg items-center" style={{ backgroundColor: active ? "rgba(255,255,255,0.08)" : T.surfaceRaised }}>
                <Text className="text-[12px] font-medium" style={{ color: active ? T.textPrimary : T.textTertiary }}>{r.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View className="p-5">
          {wh.length < 2 ? <Text className="text-tertiary text-[13px]">Pocos datos en este rango.</Text> : <Sparkline data={wh.map((w) => w.weight)} suffix=" kg" height={90} />}
        </View>
      </View>

      {/* Medidas */}
      {last && (
        <View className="rounded-2xl bg-surface border border-hairline overflow-hidden">
          <View className="px-5 py-3.5 border-b border-hairline flex-row items-center justify-between">
            <Text className="text-primary text-[14px] font-medium">Medidas (cm)</Text>
            {first && first !== last && <Text className="text-tertiary text-[12px]">vs {I.fmtShort(first.date)}</Text>}
          </View>
          <View className="flex-row flex-wrap p-3">
            {([["Pecho", "chest"], ["Cintura", "waist"], ["Cadera", "hips"], ["Brazo I", "armL"], ["Brazo D", "armR"], ["Muslo I", "thighL"], ["Muslo D", "thighR"]] as const).map(([label, key]) => {
              const val = (last as any)[key];
              const d = first ? Math.round((val - (first as any)[key]) * 10) / 10 : 0;
              return (
                <View key={key} className="w-1/3 p-2">
                  <View className="rounded-xl bg-surface-raised py-3 items-center">
                    <Text className="text-primary text-[16px] font-semibold">{val}</Text>
                    <Text className="text-tertiary text-[10px] mt-0.5">{label}</Text>
                    {first && d !== 0 && <Text className="text-[10px] mt-0.5" style={{ color: d > 0 ? T.success : T.warning }}>{d > 0 ? "+" : ""}{d}</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Fotos de progreso */}
      {photos.length > 0 && (
        <View className="rounded-2xl bg-surface border border-hairline overflow-hidden">
          <View className="px-5 py-3.5 border-b border-hairline"><Text className="text-primary text-[14px] font-medium">Fotos de progreso ({photos.length})</Text></View>
          <View className="flex-row flex-wrap p-3">
            {photos.map((p) => (
              <View key={p.id} className="w-1/3 p-1.5">
                <Image source={{ uri: absUrl(p.url)!, headers: { "ngrok-skip-browser-warning": "true" } }} style={{ width: "100%", aspectRatio: 3 / 4, borderRadius: 12, backgroundColor: T.surfaceRaised }} resizeMode="cover" />
                <Text className="text-tertiary text-[10px] mt-1 text-center" numberOfLines={1}>{p.label || (p.createdAt?.slice(0, 10) ?? "")}{p.weight ? ` · ${p.weight}kg` : ""}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Carreras MD-Route */}
      <View className="rounded-2xl bg-surface border border-hairline overflow-hidden">
        <View className="px-5 py-3.5 border-b border-hairline flex-row items-center gap-2">
          <Footprints size={15} color={T.success} /><Text className="text-primary text-[14px] font-medium">MD-Route · Carreras ({carreras.length})</Text>
        </View>
        {carreras.length === 0 ? (
          <Text className="text-tertiary text-[13px] p-5">Sin carreras registradas.</Text>
        ) : (
          <View className="p-3 gap-3">
            {carreras.map((c) => (
              <View key={c.id} className="rounded-xl bg-surface-raised overflow-hidden">
                <View className="items-center py-2"><RouteSilhouette track={c.track} width={220} height={80} color={T.textPrimary} strokeWidth={2.5} /></View>
                <View className="flex-row justify-between px-4 py-2.5 border-t border-hairline">
                  <Text className="text-tertiary text-[11px]">{c.date}</Text>
                  <View className="flex-row gap-4">
                    <Metric icon={Footprints} value={fmtDistance(c.distanceM)} />
                    <Metric icon={Timer} value={fmtDuration(c.durationS)} />
                    <Metric icon={Gauge} value={`${c.avgSpeedKmh}`} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function Metric({ icon: Icon, value }: { icon: any; value: string }) {
  return (
    <View className="flex-row items-center gap-1">
      <Icon size={12} color={T.textTertiary} strokeWidth={1.75} />
      <Text className="text-secondary text-[12px] font-medium">{value}</Text>
    </View>
  );
}
