import { useEffect, useState, useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getStudents, type Student } from "@/lib/data";
import { Screen, PageHeader, Card, Avatar, Pill } from "@/components/ui";
import { T, PAYMENT_LABELS } from "@/lib/theme";

const FEE = 1200; // MXN por alumno activo (igual que la web)

export default function PaymentsScreen() {
  const insets = useSafeAreaInsets();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudents().then(setStudents).finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => {
    const action = students.filter((s) => s.paymentStatus === "grace_period" || s.paymentStatus === "past_due");
    const active = students.filter((s) => s.paymentStatus === "active");
    const disabled = students.filter((s) => s.paymentStatus === "inactive");
    const mrr = active.length * FEE + action.length * (FEE / 2);
    return { action, active, disabled, mrr };
  }, [students]);

  return (
    <Screen>
      <PageHeader title="Pagos" hint="Cobros recurrentes mensuales" />
      {loading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator color={T.textPrimary} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100, gap: 16 }}>
          {/* MRR */}
          <Card>
            <View className="p-5">
              <Text className="text-tertiary text-[11px] uppercase font-medium" style={{ letterSpacing: 0.8 }}>Ingreso mensual recurrente</Text>
              <View className="flex-row items-baseline mt-2">
                <Text className="text-primary text-[32px] font-semibold">${groups.mrr.toLocaleString("es-MX")}</Text>
                <Text className="text-secondary text-[14px] font-medium ml-2">MXN</Text>
              </View>
              <View className="flex-row items-center gap-1.5 mt-2">
                <View className="rounded-full" style={{ width: 6, height: 6, backgroundColor: T.success }} />
                <Text className="text-secondary text-[12px]">AutoCobro activo · ${FEE.toLocaleString("es-MX")}/alumno</Text>
              </View>
            </View>
          </Card>

          <Section title="Requieren acción" students={groups.action} empty="Nadie con pagos pendientes 🎉" />
          <Section title="Al día" students={groups.active} empty="Sin alumnos activos" />
          <Section title="Suspendidos" students={groups.disabled} empty="Ningún alumno suspendido" />
        </ScrollView>
      )}
    </Screen>
  );
}

function Section({ title, students, empty }: { title: string; students: Student[]; empty: string }) {
  return (
    <View className="gap-2.5">
      <Text className="text-tertiary text-[11px] uppercase font-medium px-1" style={{ letterSpacing: 0.8 }}>
        {title} ({students.length})
      </Text>
      {students.length === 0 ? (
        <Text className="text-tertiary/60 text-[12px] px-1" style={{ color: T.textTertiary }}>{empty}</Text>
      ) : (
        students.map((s) => {
          const pay = PAYMENT_LABELS[s.paymentStatus] ?? PAYMENT_LABELS.inactive;
          return (
            <View key={s.id} className="flex-row items-center p-3.5 rounded-2xl bg-surface border border-hairline">
              <Avatar initials={s.avatarInitials} color={s.avatarColor} size={36} />
              <View className="flex-1 ml-3">
                <Text className="text-primary text-[14px] font-medium" numberOfLines={1}>{s.name}</Text>
                <Text className="text-tertiary text-[12px] mt-0.5">{s.email}</Text>
              </View>
              <Pill text={pay.label} color={pay.color} bg={pay.bg} />
            </View>
          );
        })
      )}
    </View>
  );
}
