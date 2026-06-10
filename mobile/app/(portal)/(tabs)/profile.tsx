import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogOut, Mail, Calendar, Activity, Target } from "lucide-react-native";
import { useMe } from "@/lib/use-me";
import { useSession } from "@/lib/session";
import { Screen, PageHeader, Card, Avatar } from "@/components/ui";
import { T, STAGE_COLORS } from "@/lib/theme";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useSession();
  const { student, loading } = useMe();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  if (loading) return <View className="flex-1 bg-root items-center justify-center"><ActivityIndicator color={T.textPrimary} /></View>;

  return (
    <Screen>
      <PageHeader title="Perfil" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100, gap: 16 }}>
        {student && (
          <>
            <View className="items-center py-4">
              <Avatar initials={student.avatarInitials} color={student.avatarColor} size={72} />
              <Text className="text-primary text-[20px] font-semibold mt-3">{student.name}</Text>
              <View className="mt-2 px-3 py-1 rounded-full" style={{ backgroundColor: (STAGE_COLORS[student.stage] ?? T.textTertiary) + "1a" }}>
                <Text className="text-[12px] font-medium" style={{ color: STAGE_COLORS[student.stage] ?? T.textTertiary }}>
                  Etapa: {student.stage}
                </Text>
              </View>
            </View>

            <Card>
              <Row icon={Mail} label="Correo" value={student.email} />
              <Row icon={Calendar} label="Miembro desde" value={student.joinedDate} />
              <Row icon={Activity} label="Adherencia" value={`${student.completionRate}%`} />
              <Row icon={Target} label="Racha" value={`${student.streak} días`} last />
            </Card>
          </>
        )}

        <Pressable
          onPress={handleSignOut}
          className="flex-row items-center justify-center gap-2 py-3.5 rounded-2xl bg-surface border border-hairline active:opacity-70"
        >
          <LogOut size={16} color={T.danger} />
          <Text className="text-[14px] font-medium" style={{ color: T.danger }}>Cerrar sesión</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function Row({ icon: Icon, label, value, last }: { icon: any; label: string; value: string; last?: boolean }) {
  return (
    <View className="flex-row items-center px-5 py-4" style={{ borderBottomWidth: last ? 0 : 1, borderBottomColor: T.hairline }}>
      <Icon size={16} color={T.textTertiary} strokeWidth={1.75} />
      <Text className="text-tertiary text-[13px] ml-3 flex-1">{label}</Text>
      <Text className="text-secondary text-[13px] font-medium">{value}</Text>
    </View>
  );
}
