import { useEffect, useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Polyline, Circle } from "react-native-svg";
import { LogOut, CalendarRange } from "lucide-react-native";
import { getStudents, type Student } from "@/lib/data";
import { useSession } from "@/lib/session";
import { T, STAGE_COLORS, PAYMENT_LABELS, avatarBg } from "@/lib/theme";

export default function CoachDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useSession();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudents()
      .then(setStudents)
      .catch((e) => console.warn("Error cargando alumnos:", e?.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.paymentStatus === "active").length;
    const grace = students.filter((s) => s.paymentStatus === "grace_period").length;
    const inactive = students.filter((s) => s.paymentStatus === "inactive").length;
    const mrr = active * 1200 + grace * 600;
    const avgAdherence = total > 0 ? Math.round(students.reduce((a, s) => a + s.completionRate, 0) / total) : 0;
    return { total, active, grace, inactive, mrr, avgAdherence };
  }, [students]);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <View className="flex-1 bg-root" style={{ paddingTop: insets.top }}>
      {/* Header glass */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-hairline">
        <View>
          <Text className="text-primary text-[20px] font-semibold">Resumen</Text>
          <Text className="text-tertiary text-[12px] mt-0.5">Estado de tu negocio</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Pressable onPress={() => router.push("/(coach)/periodization" as any)} hitSlop={10} className="w-9 h-9 rounded-xl items-center justify-center bg-surface border border-hairline active:opacity-70">
            <CalendarRange size={16} color={T.textSecondary} strokeWidth={1.75} />
          </Pressable>
          <Pressable onPress={handleSignOut} hitSlop={10} className="w-9 h-9 rounded-xl items-center justify-center bg-surface border border-hairline active:opacity-70">
            <LogOut size={16} color={T.textSecondary} strokeWidth={1.75} />
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={T.textPrimary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32, gap: 16 }}>
          {/* KPIs */}
          <View className="flex-row flex-wrap gap-3">
            <KpiCard label="MRR" value={`$${stats.mrr.toLocaleString("es-MX")}`} suffix="MXN" />
            <KpiCard label="Adherencia" value={`${stats.avgAdherence}%`} accent={stats.avgAdherence >= 80 ? T.success : T.warning} />
            <KpiCard label="Activos" value={`${stats.active}`} suffix={`de ${stats.total}`} />
            <KpiCard label="Alertas" value={`${stats.grace + stats.inactive}`} accent={stats.grace + stats.inactive > 0 ? T.danger : T.textTertiary} />
          </View>

          {/* Curva de adherencia */}
          <View className="rounded-2xl bg-surface border border-hairline overflow-hidden">
            <View className="px-5 py-4 border-b border-hairline">
              <Text className="text-primary text-[14px] font-medium">Curva de adherencia</Text>
            </View>
            <View className="p-5">
              <AdherenceChart students={students} />
            </View>
          </View>

          {/* Lista de alumnos */}
          <View className="rounded-2xl bg-surface border border-hairline overflow-hidden">
            <View className="px-5 py-4 border-b border-hairline">
              <Text className="text-primary text-[14px] font-medium">Alumnos ({students.length})</Text>
            </View>
            {students.map((s, i) => (
              <StudentRow key={s.id} student={s} last={i === students.length - 1} />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function KpiCard({ label, value, suffix, accent = T.textPrimary }: { label: string; value: string; suffix?: string; accent?: string }) {
  return (
    <View className="rounded-2xl p-5 bg-surface border border-hairline" style={{ width: "47%", flexGrow: 1 }}>
      <Text className="text-tertiary text-[11px] uppercase font-medium" style={{ letterSpacing: 0.8 }}>{label}</Text>
      <View className="flex-row items-baseline mt-2">
        <Text className="text-[26px] font-semibold" style={{ color: accent }}>{value}</Text>
        {suffix && <Text className="text-secondary text-[13px] font-medium ml-1">{suffix}</Text>}
      </View>
    </View>
  );
}

function AdherenceChart({ students }: { students: Student[] }) {
  if (students.length < 2) {
    return <Text className="text-tertiary text-[13px] text-center py-6">Aún no hay datos suficientes</Text>;
  }
  const W = 320;
  const H = 100;
  const sorted = [...students].sort((a, b) => b.completionRate - a.completionRate);
  const points = sorted
    .map((s, i) => {
      const x = (i / (sorted.length - 1)) * W;
      const y = H - (s.completionRate / 100) * (H - 20);
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <View>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <Polyline points={points} fill="none" stroke={T.textSecondary} strokeWidth={1.5} />
        {sorted.map((s, i) => {
          const x = (i / (sorted.length - 1)) * W;
          const y = H - (s.completionRate / 100) * (H - 20);
          return <Circle key={s.id} cx={x} cy={y} r={3} fill={s.completionRate >= 80 ? T.success : T.warning} />;
        })}
      </Svg>
      <View className="flex-row justify-between mt-3 pt-2 border-t border-hairline">
        <Text className="text-tertiary text-[10px]">100%</Text>
        <Text className="text-tertiary text-[10px]">0%</Text>
      </View>
    </View>
  );
}

function StudentRow({ student, last }: { student: Student; last: boolean }) {
  const router = useRouter();
  const pay = PAYMENT_LABELS[student.paymentStatus] ?? PAYMENT_LABELS.inactive;
  const stageColor = STAGE_COLORS[student.stage] ?? T.textTertiary;
  return (
    <Pressable
      onPress={() => router.push(`/(coach)/student/${student.id}` as any)}
      className="flex-row items-center px-5 py-4 active:bg-surface-raised"
      style={{ borderBottomWidth: last ? 0 : 1, borderBottomColor: T.hairline }}
    >
      <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: avatarBg(student.avatarColor) }}>
        <Text className="text-white text-[13px] font-semibold">{student.avatarInitials}</Text>
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-primary text-[14px] font-medium" numberOfLines={1}>{student.name}</Text>
        <View className="flex-row items-center gap-2 mt-1">
          <View className="px-2 py-0.5 rounded-md" style={{ backgroundColor: stageColor + "1a" }}>
            <Text className="text-[10px] font-medium" style={{ color: stageColor }}>{student.stage}</Text>
          </View>
          <Text className="text-tertiary text-[12px]">{student.currentWeight} kg</Text>
        </View>
      </View>
      <View className="items-end">
        <Text className="text-secondary text-[13px] font-medium tabular-nums">{student.completionRate}%</Text>
        <Text className="text-[11px] mt-1" style={{ color: pay.color }}>{pay.label}</Text>
      </View>
    </Pressable>
  );
}
