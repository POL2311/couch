/* ═══════════════════════════════════════════
   Salas (Gym Squads y Ligas) — placeholder pulido.
   Paridad 1:1 con la web (TabSalas en
   src/app/portal/page.tsx). Función en desarrollo.
   ═══════════════════════════════════════════ */
import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Users, TrendingUp, Sparkles } from "lucide-react-native";
import { T } from "@/lib/theme";

const PREVIEWS = [
  { title: "Gym Squads", sub: "Equipos de hasta 6 personas", Icon: Users },
  { title: "Ligas Semanales", sub: "Ranking por adherencia y progreso", Icon: TrendingUp },
  { title: "Insignias Grupales", sub: "Logros compartidos con tu squad", Icon: Sparkles },
];

export default function SalasScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-root" style={{ paddingTop: insets.top }}>
      <View className="px-5 py-4 border-b border-hairline">
        <Text className="text-primary text-[24px] font-semibold">Salas</Text>
        <Text className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>Gym Squads y Ligas</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100, gap: 16 }}>
        {/* Tarjeta principal con anillos decorativos */}
        <View className="rounded-3xl p-5" style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline }}>
          <View className="items-center" style={{ paddingVertical: 40, gap: 20 }}>
            <View style={{ width: 96, height: 96, alignItems: "center", justifyContent: "center" }}>
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  style={{
                    position: "absolute",
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    borderWidth: 1,
                    borderColor: `rgba(255,255,255,${0.04 + i * 0.03})`,
                    transform: [{ scale: 1 + i * 0.28 }],
                  }}
                />
              ))}
              <View className="items-center justify-center" style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.06)" }}>
                <Users size={22} strokeWidth={1.25} color="rgba(255,255,255,0.5)" />
              </View>
            </View>

            <View className="items-center" style={{ maxWidth: 240 }}>
              <Text className="text-[16px] font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.75)" }}>Próximamente</Text>
              <Text className="text-[12px] text-center" style={{ color: "rgba(255,255,255,0.28)", lineHeight: 18 }}>
                Crea tu squad, compite en ligas semanales y gana insignias con tus compañeros de entrenamiento.
              </Text>
            </View>

            <View className="flex-row items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" }}>
              <Sparkles size={12} color="rgba(255,255,255,0.3)" />
              <Text className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>En desarrollo · Q3 2025</Text>
            </View>
          </View>
        </View>

        {/* Tarjetas de vista previa */}
        {PREVIEWS.map((item, i) => (
          <View key={i} className="flex-row items-center gap-4 rounded-2xl px-5 py-4" style={{ backgroundColor: "rgba(255,255,255,0.02)", borderWidth: 1, borderColor: "rgba(255,255,255,0.055)" }}>
            <View className="items-center justify-center" style={{ width: 40, height: 40, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.055)" }}>
              <item.Icon size={16} strokeWidth={1.4} color="rgba(255,255,255,0.38)" />
            </View>
            <View>
              <Text className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>{item.title}</Text>
              <Text className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>{item.sub}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
