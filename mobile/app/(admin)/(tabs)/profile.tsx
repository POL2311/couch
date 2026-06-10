import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogOut, Mail, ShieldCheck } from "lucide-react-native";
import { useSession } from "@/lib/session";
import { Screen, PageHeader, Card } from "@/components/ui";
import { T } from "@/lib/theme";

export default function AdminProfile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useSession();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <Screen>
      <PageHeader title="Perfil" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100, gap: 16 }}>
        <View className="items-center py-4">
          <View className="w-16 h-16 rounded-2xl items-center justify-center bg-surface-raised border border-hairline">
            <ShieldCheck size={26} color={T.textPrimary} strokeWidth={1.75} />
          </View>
          <Text className="text-primary text-[20px] font-semibold mt-3">{user?.name ?? "Administrador"}</Text>
          <View className="mt-2 px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
            <Text className="text-[12px] font-medium" style={{ color: T.textSecondary }}>ADMIN · Panel global</Text>
          </View>
        </View>

        <Card>
          <View className="flex-row items-center px-5 py-4">
            <Mail size={16} color={T.textTertiary} strokeWidth={1.75} />
            <Text className="text-tertiary text-[13px] ml-3 flex-1">Correo</Text>
            <Text className="text-secondary text-[13px] font-medium">{user?.email}</Text>
          </View>
        </Card>

        <Pressable onPress={handleSignOut} className="flex-row items-center justify-center gap-2 py-3.5 rounded-2xl bg-surface border border-hairline active:opacity-70">
          <LogOut size={16} color={T.danger} />
          <Text className="text-[14px] font-medium" style={{ color: T.danger }}>Cerrar sesión</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
