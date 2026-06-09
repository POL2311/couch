import { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, ImageBackground } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { ChevronLeft, Camera, Image as ImageIcon, Share2, Trash2, Footprints, Timer, Gauge, Activity } from "lucide-react-native";
import { getCarrera, deleteCarrera, uploadCarreraFoto, API_URL, type Carrera } from "@/lib/data";
import { RouteSilhouette } from "@/components/route-silhouette";
import { fmtDistance, fmtDuration, fmtPace } from "@/lib/geo";
import { T } from "@/lib/theme";

const absUrl = (u?: string | null) => (!u ? null : u.startsWith("http") || u.startsWith("file") ? u : `${API_URL}${u}`);

export default function RunDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const shotRef = useRef<View>(null);

  const [carrera, setCarrera] = useState<Carrera | null>(null);
  const [loading, setLoading] = useState(true);
  const [bgPhoto, setBgPhoto] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getCarrera(id)
      .then((c) => {
        setCarrera(c);
        if (c?.photoUrl) setBgPhoto(absUrl(c.photoUrl));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const pickFrom = async (source: "camera" | "library") => {
    const opts: ImagePicker.ImagePickerOptions = { allowsEditing: true, aspect: [4, 5], quality: 0.9 };
    const res =
      source === "camera"
        ? await ImagePicker.launchCameraAsync(opts)
        : await ImagePicker.launchImageLibraryAsync({ ...opts, mediaTypes: ["images"] });
    if (res.canceled || !res.assets[0] || !id) return;
    const uri = res.assets[0].uri;
    setBgPhoto(uri); // vista previa inmediata
    try {
      const url = await uploadCarreraFoto(id, uri); // persiste la foto en la carrera
      if (url) setBgPhoto(absUrl(url));
    } catch {
      Alert.alert("Error", "No se pudo guardar la foto.");
    }
  };

  const exportImage = async () => {
    setExporting(true);
    try {
      // Carga diferida: react-native-view-shot NO está en Expo Go.
      // Así la app sigue funcionando en Expo Go y solo la captura pide dev build.
      const { captureRef } = require("react-native-view-shot");
      const uri = await captureRef(shotRef, { format: "png", quality: 1 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        const perm = await MediaLibrary.requestPermissionsAsync();
        if (perm.granted) {
          await MediaLibrary.saveToLibraryAsync(uri);
          Alert.alert("Guardado", "La imagen se guardó en tu galería.");
        }
      }
    } catch (e: any) {
      Alert.alert(
        "No se pudo exportar",
        "La captura de imagen requiere un development build (no funciona en Expo Go). Ver GUIA_APP.md."
      );
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Eliminar carrera", "¿Seguro que quieres eliminarla?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          if (id) await deleteCarrera(id);
          router.back();
        },
      },
    ]);
  };

  if (loading) return <View className="flex-1 bg-root items-center justify-center"><ActivityIndicator color={T.textPrimary} /></View>;
  if (!carrera) return <View className="flex-1 bg-root items-center justify-center"><Text className="text-tertiary">Carrera no encontrada.</Text></View>;

  return (
    <View className="flex-1 bg-root" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={() => router.back()} hitSlop={10} className="w-9 h-9 rounded-xl items-center justify-center bg-surface border border-hairline">
          <ChevronLeft size={18} color={T.textSecondary} />
        </Pressable>
        <Text className="text-primary text-[16px] font-semibold">Tu carrera</Text>
        <Pressable onPress={handleDelete} hitSlop={10} className="w-9 h-9 rounded-xl items-center justify-center bg-surface border border-hairline">
          <Trash2 size={16} color={T.danger} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32, gap: 16 }}>
        {/* ── Tarjeta compartible (lo que se captura) ── */}
        <View ref={shotRef} collapsable={false} className="rounded-2xl overflow-hidden" style={{ aspectRatio: 4 / 5, backgroundColor: "#000" }}>
          <ShareCardBackground bgPhoto={bgPhoto}>
            <View className="flex-1 justify-between p-5">
              <View>
                <Text className="text-white text-[13px] font-semibold uppercase" style={{ letterSpacing: 2 }}>MyCoach</Text>
                <Text className="text-white/70 text-[12px] mt-0.5">{carrera.date}</Text>
              </View>

              <View className="items-center">
                <RouteSilhouette track={carrera.track} width={240} height={180} color="#fff" strokeWidth={3.5} />
              </View>

              <View className="flex-row justify-between">
                <ShareStat label="Distancia" value={fmtDistance(carrera.distanceM)} />
                <ShareStat label="Tiempo" value={fmtDuration(carrera.durationS)} />
                <ShareStat label="Ritmo" value={fmtPace(carrera.distanceM, carrera.durationS)} />
              </View>
            </View>
          </ShareCardBackground>
        </View>

        {/* ── Selección de fondo ── */}
        <View className="flex-row gap-3">
          <Pressable onPress={() => pickFrom("camera")} className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl bg-surface border border-hairline active:opacity-70">
            <Camera size={16} color={T.textSecondary} />
            <Text className="text-secondary text-[13px] font-medium">Cámara</Text>
          </Pressable>
          <Pressable onPress={() => pickFrom("library")} className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl bg-surface border border-hairline active:opacity-70">
            <ImageIcon size={16} color={T.textSecondary} />
            <Text className="text-secondary text-[13px] font-medium">Galería</Text>
          </Pressable>
        </View>

        {/* ── Métricas detalladas ── */}
        <View className="rounded-2xl bg-surface border border-hairline">
          <DetailRow icon={Footprints} label="Distancia" value={fmtDistance(carrera.distanceM)} />
          <DetailRow icon={Timer} label="Duración" value={fmtDuration(carrera.durationS)} />
          <DetailRow icon={Gauge} label="Velocidad promedio" value={`${carrera.avgSpeedKmh} km/h`} />
          <DetailRow icon={Activity} label="Puntos GPS" value={`${carrera.track.length}`} last />
        </View>

        {/* ── Exportar ── */}
        <Pressable onPress={exportImage} disabled={exporting} className="flex-row items-center justify-center gap-2 py-4 rounded-2xl bg-accent active:opacity-80" style={{ opacity: exporting ? 0.6 : 1 }}>
          {exporting ? <ActivityIndicator color={T.textInverse} /> : <Share2 size={18} color={T.textInverse} />}
          <Text className="text-inverse text-[15px] font-semibold">Compartir imagen</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function ShareCardBackground({ bgPhoto, children }: { bgPhoto: string | null; children: React.ReactNode }) {
  if (bgPhoto) {
    return (
      <ImageBackground source={{ uri: bgPhoto, headers: { "ngrok-skip-browser-warning": "true" } }} style={{ flex: 1 }} resizeMode="cover">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }}>{children}</View>
      </ImageBackground>
    );
  }
  // Fondo degradado oscuro por defecto
  return <View style={{ flex: 1, backgroundColor: "#0d0d10" }}>{children}</View>;
}

function ShareStat({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-white/60 text-[10px] uppercase" style={{ letterSpacing: 1 }}>{label}</Text>
      <Text className="text-white text-[18px] font-semibold mt-0.5">{value}</Text>
    </View>
  );
}

function DetailRow({ icon: Icon, label, value, last }: { icon: any; label: string; value: string; last?: boolean }) {
  return (
    <View className="flex-row items-center px-5 py-4" style={{ borderBottomWidth: last ? 0 : 1, borderBottomColor: T.hairline }}>
      <Icon size={16} color={T.textTertiary} strokeWidth={1.75} />
      <Text className="text-tertiary text-[13px] ml-3 flex-1">{label}</Text>
      <Text className="text-secondary text-[14px] font-medium">{value}</Text>
    </View>
  );
}
