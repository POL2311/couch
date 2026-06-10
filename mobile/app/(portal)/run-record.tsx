import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Play, Pause, Square, X, MapPin } from "lucide-react-native";
import { useRunTracker } from "@/lib/run-tracker";
import { RouteSilhouette } from "@/components/route-silhouette";
import { saveCarrera } from "@/lib/data";
import { useSession } from "@/lib/session";
import { fmtDistance, fmtDuration, fmtPace } from "@/lib/geo";
import { T } from "@/lib/theme";

export default function RunRecordScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useSession();
  const { status, track, distanceM, durationS, speed, start, pause, resume, finish } = useRunTracker();
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    finish();
    if (track.length < 2) {
      Alert.alert("Carrera muy corta", "No se registraron suficientes puntos GPS para guardar.");
      router.back();
      return;
    }
    setSaving(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const c = await saveCarrera({
        userId: user?.studentId ?? user?.id ?? "demo",
        date: today,
        distanceM,
        durationS,
        avgSpeedKmh: speed,
        track,
      });
      router.replace({ pathname: "/(portal)/run-detail", params: { id: c.id } } as any);
    } catch {
      Alert.alert("Error", "No se pudo guardar la carrera.");
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-root" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <Text className="text-primary text-[18px] font-semibold">Registrar carrera</Text>
        <Pressable onPress={() => router.back()} hitSlop={10} className="w-9 h-9 rounded-xl items-center justify-center bg-surface border border-hairline">
          <X size={16} color={T.textSecondary} />
        </Pressable>
      </View>

      {/* Silueta en vivo */}
      <View className="mx-5 rounded-2xl bg-surface border border-hairline items-center justify-center" style={{ height: 240 }}>
        {track.length < 2 ? (
          <View className="items-center">
            <MapPin size={28} color={T.textTertiary} strokeWidth={1.5} />
            <Text className="text-tertiary text-[13px] mt-2">
              {status === "running" ? "Esperando señal GPS…" : "El recorrido aparecerá aquí"}
            </Text>
          </View>
        ) : (
          <RouteSilhouette track={track} width={300} height={220} color={T.textPrimary} strokeWidth={3} />
        )}
      </View>

      {/* Métricas grandes */}
      <View className="flex-row flex-wrap px-5 mt-6">
        <BigMetric label="Distancia" value={fmtDistance(distanceM)} />
        <BigMetric label="Tiempo" value={fmtDuration(durationS)} />
        <BigMetric label="Velocidad" value={`${speed}`} unit="km/h" />
        <BigMetric label="Ritmo" value={fmtPace(distanceM, durationS)} />
      </View>

      {/* Controles */}
      <View className="flex-1 justify-end px-5" style={{ paddingBottom: insets.bottom + 24 }}>
        {status === "denied" && (
          <Text className="text-[13px] text-center mb-4" style={{ color: T.danger }}>
            Permiso de ubicación denegado. Actívalo en Ajustes para registrar carreras.
          </Text>
        )}

        {saving ? (
          <View className="items-center py-4"><ActivityIndicator color={T.textPrimary} /></View>
        ) : status === "idle" || status === "denied" ? (
          <Pressable onPress={start} className="flex-row items-center justify-center gap-2 py-4 rounded-2xl bg-accent active:opacity-80">
            <Play size={18} color={T.textInverse} fill={T.textInverse} />
            <Text className="text-inverse text-[16px] font-semibold">Iniciar carrera</Text>
          </Pressable>
        ) : status === "requesting" ? (
          <View className="items-center py-4"><ActivityIndicator color={T.textPrimary} /></View>
        ) : (
          <View className="flex-row gap-3">
            {status === "running" ? (
              <Pressable onPress={pause} className="flex-1 flex-row items-center justify-center gap-2 py-4 rounded-2xl bg-surface border border-hairline active:opacity-70">
                <Pause size={18} color={T.textPrimary} />
                <Text className="text-primary text-[15px] font-semibold">Pausar</Text>
              </Pressable>
            ) : (
              <Pressable onPress={resume} className="flex-1 flex-row items-center justify-center gap-2 py-4 rounded-2xl bg-surface border border-hairline active:opacity-70">
                <Play size={18} color={T.textPrimary} fill={T.textPrimary} />
                <Text className="text-primary text-[15px] font-semibold">Reanudar</Text>
              </Pressable>
            )}
            <Pressable onPress={handleFinish} className="flex-1 flex-row items-center justify-center gap-2 py-4 rounded-2xl active:opacity-80" style={{ backgroundColor: T.danger }}>
              <Square size={16} color="#fff" fill="#fff" />
              <Text className="text-white text-[15px] font-semibold">Terminar</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

function BigMetric({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <View className="w-1/2 py-3">
      <Text className="text-tertiary text-[11px] uppercase" style={{ letterSpacing: 0.8 }}>{label}</Text>
      <View className="flex-row items-baseline mt-1">
        <Text className="text-primary text-[30px] font-light">{value}</Text>
        {unit && <Text className="text-tertiary text-[13px] ml-1.5">{unit}</Text>}
      </View>
    </View>
  );
}
