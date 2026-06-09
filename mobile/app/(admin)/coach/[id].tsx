import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { getCoachStudents, type Student } from "@/lib/data";
import { Avatar, Pill } from "@/components/ui";
import { T, STAGE_COLORS, PAYMENT_LABELS } from "@/lib/theme";

export default function AdminCoachStudents() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [coach, setCoach] = useState<{ name: string; email: string } | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getCoachStudents(id)
      .then((res) => {
        setCoach(res.coach);
        setStudents(res.students);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <View className="flex-1 bg-root" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-3 border-b border-hairline gap-2">
        <Pressable onPress={() => router.back()} hitSlop={10} className="w-9 h-9 rounded-xl items-center justify-center bg-surface border border-hairline active:opacity-70">
          <ChevronLeft size={18} color={T.textSecondary} />
        </Pressable>
        <View>
          <Text className="text-primary text-[17px] font-semibold">{coach?.name ?? "Coach"}</Text>
          {coach && <Text className="text-tertiary text-[11px]">{coach.email}</Text>}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator color={T.textPrimary} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32, gap: 10 }}>
          <Text className="text-tertiary text-[11px] uppercase font-medium px-1" style={{ letterSpacing: 0.8 }}>
            Alumnos ({students.length})
          </Text>
          {students.map((s) => {
            const pay = PAYMENT_LABELS[s.paymentStatus] ?? PAYMENT_LABELS.inactive;
            const stageColor = STAGE_COLORS[s.stage] ?? T.textTertiary;
            return (
              <Pressable
                key={s.id}
                onPress={() => router.push(`/(admin)/student/${s.id}` as any)}
                className="flex-row items-center p-4 rounded-2xl bg-surface border border-hairline active:opacity-70"
              >
                <Avatar initials={s.avatarInitials} color={s.avatarColor} />
                <View className="flex-1 ml-3">
                  <Text className="text-primary text-[15px] font-medium" numberOfLines={1}>{s.name}</Text>
                  <View className="flex-row items-center gap-2 mt-1.5">
                    <Pill text={s.stage} color={stageColor} />
                    <Text className="text-tertiary text-[12px]">{s.currentWeight} kg</Text>
                  </View>
                </View>
                <View className="items-end mr-1">
                  <Text className="text-secondary text-[13px] font-medium">{s.completionRate}%</Text>
                  <View className="mt-1.5"><Pill text={pay.short} color={pay.color} bg={pay.bg} /></View>
                </View>
                <ChevronRight size={16} color={T.textTertiary} />
              </Pressable>
            );
          })}
          {students.length === 0 && (
            <Text className="text-tertiary text-[13px] text-center py-8">Este coach aún no tiene alumnos.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}
