import { useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Pressable, TextInput, Modal, Image, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import { Plus, Camera, X } from "lucide-react-native";
import { useMe } from "@/lib/use-me";
import { registrarProgreso, API_URL } from "@/lib/data";
import { Screen, PageHeader, Card, CardTitle } from "@/components/ui";
import { T } from "@/lib/theme";

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { student, detail, loading, reload } = useMe();
  const [modalOpen, setModalOpen] = useState(false);

  if (loading) return <View className="flex-1 bg-root items-center justify-center"><ActivityIndicator color={T.textPrimary} /></View>;
  if (!student || !detail) return <View className="flex-1 bg-root items-center justify-center"><Text className="text-tertiary">Sin datos.</Text></View>;

  const lastM = detail.measurements[detail.measurements.length - 1];
  const delta = Math.round((student.currentWeight - student.previousWeight) * 10) / 10;

  return (
    <Screen>
      <PageHeader
        title="Progreso"
        hint="Tu evolución"
        right={
          <Pressable onPress={() => setModalOpen(true)} className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent active:opacity-80">
            <Plus size={15} color={T.textInverse} strokeWidth={2.5} />
            <Text className="text-inverse text-[13px] font-semibold">Pesaje</Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100, gap: 16 }}>
        <View className="flex-row gap-3">
          <Stat label="Peso actual" value={`${student.currentWeight}`} unit="kg" />
          <Stat label="Cambio" value={`${delta > 0 ? "+" : ""}${delta}`} unit="kg" color={delta < 0 ? T.success : delta > 0 ? T.warning : T.textPrimary} />
        </View>

        <Card>
          <CardTitle title="Evolución de peso" />
          <View className="p-5"><WeightChart history={detail.weightHistory} /></View>
        </Card>

        {lastM && (
          <Card>
            <CardTitle title="Últimas medidas (cm)" />
            <View className="flex-row flex-wrap p-3">
              {[
                ["Pecho", lastM.chest], ["Cintura", lastM.waist], ["Cadera", lastM.hips],
                ["Brazo I", lastM.armL], ["Brazo D", lastM.armR],
                ["Muslo I", lastM.thighL], ["Muslo D", lastM.thighR],
              ].map(([label, val]) => (
                <View key={label as string} className="w-1/3 p-2">
                  <View className="rounded-xl bg-surface-raised py-3 items-center">
                    <Text className="text-primary text-[16px] font-semibold">{val}</Text>
                    <Text className="text-tertiary text-[10px] mt-0.5">{label}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Historial de pesajes registrados */}
        <Card>
          <CardTitle title={`Registros de peso (${detail.weightHistory.length})`} />
          <View className="px-5 py-2">
            {[...detail.weightHistory].reverse().map((h, i, arr) => {
              const prev = arr[i + 1];
              const d = prev ? Math.round((h.weight - prev.weight) * 10) / 10 : 0;
              return (
                <View key={`${h.date}-${i}`} className="flex-row items-center justify-between py-3" style={{ borderBottomWidth: i === arr.length - 1 ? 0 : 1, borderBottomColor: T.hairline }}>
                  <Text className="text-secondary text-[13px]">{h.date}</Text>
                  <View className="flex-row items-baseline gap-2">
                    {d !== 0 && (
                      <Text className="text-[12px]" style={{ color: d < 0 ? T.success : T.warning }}>{d > 0 ? "+" : ""}{d}</Text>
                    )}
                    <Text className="text-primary text-[15px] font-semibold">{h.weight} kg</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Fotos de progreso */}
        {detail.photos && detail.photos.length > 0 && (
          <Card>
            <CardTitle title={`Fotos de progreso (${detail.photos.length})`} />
            <View className="flex-row flex-wrap p-3">
              {detail.photos.map((p) => (
                <View key={p.id} className="w-1/3 p-1.5">
                  <Image
                    source={{
                      uri: p.url.startsWith("http") ? p.url : `${API_URL}${p.url}`,
                      headers: { "ngrok-skip-browser-warning": "true" },
                    }}
                    style={{ width: "100%", aspectRatio: 3 / 4, borderRadius: 12, backgroundColor: T.surfaceRaised }}
                    resizeMode="cover"
                  />
                  <Text className="text-tertiary text-[10px] mt-1 text-center" numberOfLines={1}>
                    {p.createdAt?.slice(0, 10) ?? p.label}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}
      </ScrollView>

      <WeighInModal
        open={modalOpen}
        currentWeight={student.currentWeight}
        onClose={() => setModalOpen(false)}
        onSaved={() => { setModalOpen(false); reload(); }}
      />
    </Screen>
  );
}

function WeighInModal({ open, currentWeight, onClose, onSaved }: { open: boolean; currentWeight: number; onClose: () => void; onSaved: () => void }) {
  const [weight, setWeight] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => { setWeight(""); setPhotoUri(null); setSaving(false); };

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (!res.canceled && res.assets[0]) setPhotoUri(res.assets[0].uri);
  };

  const save = async () => {
    const w = parseFloat(weight);
    if (!w && !photoUri) { Alert.alert("Faltan datos", "Ingresa tu peso o agrega una foto."); return; }
    setSaving(true);
    try {
      await registrarProgreso({ weight: w || undefined, photoUri: photoUri ?? undefined });
      reset();
      onSaved();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo guardar.");
      setSaving(false);
    }
  };

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
        <View className="rounded-t-3xl bg-surface border-t border-hairline p-6" style={{ paddingBottom: 36 }}>
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-primary text-[18px] font-semibold">Registrar pesaje</Text>
            <Pressable onPress={() => { reset(); onClose(); }} hitSlop={10} className="w-8 h-8 rounded-full items-center justify-center bg-surface-raised">
              <X size={15} color={T.textTertiary} />
            </Pressable>
          </View>

          <Text className="text-secondary text-[10px] uppercase font-medium mb-1.5" style={{ letterSpacing: 1 }}>Peso (kg)</Text>
          <TextInput
            value={weight}
            onChangeText={setWeight}
            placeholder={`${currentWeight}`}
            placeholderTextColor={T.textTertiary}
            keyboardType="decimal-pad"
            className="px-3.5 py-3 rounded-xl text-[16px] text-primary bg-surface-raised border border-hairline"
          />

          <Pressable onPress={pickPhoto} className="mt-4 flex-row items-center justify-center gap-2 py-3 rounded-xl bg-surface-raised border border-hairline active:opacity-70">
            <Camera size={16} color={T.textSecondary} />
            <Text className="text-secondary text-[13px] font-medium">{photoUri ? "Cambiar foto" : "Agregar foto (opcional)"}</Text>
          </Pressable>
          {photoUri && <Image source={{ uri: photoUri }} style={{ width: "100%", height: 160, borderRadius: 12, marginTop: 12 }} resizeMode="cover" />}

          <Pressable onPress={save} disabled={saving} className="mt-5 flex-row items-center justify-center gap-2 py-4 rounded-2xl bg-accent active:opacity-80" style={{ opacity: saving ? 0.6 : 1 }}>
            {saving ? <ActivityIndicator color={T.textInverse} /> : <Text className="text-inverse text-[15px] font-semibold">Guardar</Text>}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function Stat({ label, value, unit, color = T.textPrimary }: { label: string; value: string; unit: string; color?: string }) {
  return (
    <View className="flex-1 rounded-2xl bg-surface border border-hairline p-4">
      <Text className="text-tertiary text-[10px] uppercase" style={{ letterSpacing: 0.8 }}>{label}</Text>
      <View className="flex-row items-baseline mt-2">
        <Text className="text-[26px] font-light" style={{ color }}>{value}</Text>
        <Text className="text-tertiary text-[11px] ml-1">{unit}</Text>
      </View>
    </View>
  );
}

function WeightChart({ history }: { history: { date: string; weight: number }[] }) {
  if (!history || history.length < 2) return <Text className="text-tertiary text-[12px] text-center py-6">Registra al menos 2 pesajes.</Text>;
  const W = 320, H = 110, pad = 14;
  const ws = history.map((h) => h.weight);
  const min = Math.min(...ws), max = Math.max(...ws);
  const range = max - min || 1;
  const pts = history.map((h, i) => ({
    x: pad + (i / (history.length - 1)) * (W - pad * 2),
    y: H - pad - ((h.weight - min) / range) * (H - pad * 2),
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;
  return (
    <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <Defs>
        <LinearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={T.success} stopOpacity={0.18} />
          <Stop offset="100%" stopColor={T.success} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={area} fill="url(#wg)" />
      <Path d={line} fill="none" stroke={T.success} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <Circle key={i} cx={p.x} cy={p.y} r={2.5} fill={T.success} stroke="#000" strokeWidth={1.5} />)}
    </Svg>
  );
}
