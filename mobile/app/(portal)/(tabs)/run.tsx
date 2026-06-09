import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, ImageBackground } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Plus, Footprints, Timer, Gauge } from "lucide-react-native";
import { getCarreras, CARRERAS_SON_LOCALES, API_URL, type Carrera } from "@/lib/data";

const absUrl = (u?: string | null) => (!u ? null : u.startsWith("http") || u.startsWith("file") ? u : `${API_URL}${u}`);
import { RouteSilhouette } from "@/components/route-silhouette";
import { Screen, PageHeader } from "@/components/ui";
import { fmtDistance, fmtDuration } from "@/lib/geo";
import { T } from "@/lib/theme";

export default function RunListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [loading, setLoading] = useState(true);

  // Recarga al volver a la pestaña (tras grabar una carrera)
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getCarreras()
        .then((c) => alive && setCarreras(c))
        .finally(() => alive && setLoading(false));
      return () => {
        alive = false;
      };
    }, [])
  );

  return (
    <Screen>
      <PageHeader
        title="Carreras"
        hint={`${carreras.length} registradas`}
        right={
          <Pressable
            onPress={() => router.push("/(portal)/run-record" as any)}
            className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent active:opacity-80"
          >
            <Plus size={15} color={T.textInverse} strokeWidth={2.5} />
            <Text className="text-inverse text-[13px] font-semibold">Nueva</Text>
          </Pressable>
        }
      />

      {CARRERAS_SON_LOCALES && (
        <View className="mx-5 mt-4 px-3.5 py-2.5 rounded-xl" style={{ backgroundColor: "rgba(251,191,36,0.1)" }}>
          <Text className="text-[12px]" style={{ color: T.warning }}>
            Modo demo: tus carreras se guardan solo en este teléfono. Se sincronizarán al activar Supabase (Fase 0).
          </Text>
        </View>
      )}

      {loading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator color={T.textPrimary} /></View>
      ) : carreras.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Footprints size={36} color={T.textTertiary} strokeWidth={1.5} />
          <Text className="text-secondary text-[15px] font-medium mt-4 text-center">Aún no tienes carreras</Text>
          <Text className="text-tertiary text-[13px] mt-1.5 text-center">Toca "Nueva" para registrar tu primera carrera con GPS.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100, gap: 14 }}>
          {carreras.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => router.push({ pathname: "/(portal)/run-detail", params: { id: c.id } } as any)}
              className="rounded-2xl bg-surface border border-hairline overflow-hidden active:opacity-80"
            >
              {c.photoUrl ? (
                <ImageBackground
                  source={{ uri: absUrl(c.photoUrl)!, headers: { "ngrok-skip-browser-warning": "true" } }}
                  style={{ height: 150 }}
                  resizeMode="cover"
                >
                  <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                    <RouteSilhouette track={c.track} width={240} height={120} color="#fff" strokeWidth={3} />
                  </View>
                </ImageBackground>
              ) : (
                <View className="items-center py-3 bg-surface-raised">
                  <RouteSilhouette track={c.track} width={260} height={120} color={T.textPrimary} strokeWidth={3} />
                </View>
              )}
              <View className="p-4">
                <Text className="text-tertiary text-[12px]">{c.date}</Text>
                <View className="flex-row gap-5 mt-2">
                  <Metric icon={Footprints} value={fmtDistance(c.distanceM)} />
                  <Metric icon={Timer} value={fmtDuration(c.durationS)} />
                  <Metric icon={Gauge} value={`${c.avgSpeedKmh} km/h`} />
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

function Metric({ icon: Icon, value }: { icon: any; value: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <Icon size={14} color={T.textTertiary} strokeWidth={1.75} />
      <Text className="text-secondary text-[14px] font-medium">{value}</Text>
    </View>
  );
}
