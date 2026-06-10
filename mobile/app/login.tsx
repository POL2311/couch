import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ShieldCheck, ArrowRight } from "lucide-react-native";
import { useSession, homeForRole } from "@/lib/session";
import { T } from "@/lib/theme";

const DEMO_ACCOUNTS = [
  { role: "Coach", email: "coach@mycoach.app", password: "coach123" },
  { role: "Admin", email: "admin@mycoach.app", password: "admin123" },
  { role: "Cliente", email: "cliente@mycoach.app", password: "cliente123" },
];

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, loading } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    try {
      const user = await signIn(email, password);
      router.replace(homeForRole(user.role) as any);
    } catch (e: any) {
      setError(e?.message ?? "Ocurrió un error al iniciar sesión.");
    }
  };

  return (
    <View className="flex-1 bg-root px-6 justify-center" style={{ paddingTop: insets.top }}>
      <View className="w-full max-w-[400px] self-center">
        {/* Marca */}
        <View className="items-center mb-8">
          <View className="w-12 h-12 rounded-2xl items-center justify-center mb-4 bg-surface-raised border border-hairline">
            <ShieldCheck size={22} color={T.textPrimary} strokeWidth={1.75} />
          </View>
          <Text className="text-primary text-[15px] font-semibold uppercase" style={{ letterSpacing: 3 }}>
            MyCoach
          </Text>
          <Text className="text-tertiary text-[13px] mt-1.5">Inicia sesión en tu cuenta</Text>
        </View>

        {/* Tarjeta */}
        <View className="rounded-2xl p-6 bg-surface border border-hairline">
          <Text className="text-secondary text-[10px] uppercase font-medium mb-1.5" style={{ letterSpacing: 1 }}>
            Correo electrónico
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="tu@correo.com"
            placeholderTextColor={T.textTertiary}
            autoCapitalize="none"
            keyboardType="email-address"
            className="px-3.5 py-3 rounded-xl text-[14px] text-primary bg-surface-raised border border-hairline mb-4"
          />

          <Text className="text-secondary text-[10px] uppercase font-medium mb-1.5" style={{ letterSpacing: 1 }}>
            Contraseña
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={T.textTertiary}
            secureTextEntry
            className="px-3.5 py-3 rounded-xl text-[14px] text-primary bg-surface-raised border border-hairline"
          />

          {error && (
            <View className="mt-4 px-3 py-2 rounded-xl" style={{ backgroundColor: "rgba(248,113,113,0.1)" }}>
              <Text className="text-[12px]" style={{ color: T.danger }}>{error}</Text>
            </View>
          )}

          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            className="mt-5 flex-row items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent active:opacity-80"
            style={{ opacity: loading ? 0.5 : 1 }}
          >
            {loading ? (
              <ActivityIndicator color={T.textInverse} />
            ) : (
              <>
                <Text className="text-inverse text-[14px] font-semibold">Entrar</Text>
                <ArrowRight size={15} color={T.textInverse} strokeWidth={2} />
              </>
            )}
          </Pressable>
        </View>

        {/* Cuentas demo */}
        <View className="mt-6">
          <Text className="text-tertiary text-[10px] uppercase font-medium text-center mb-3" style={{ letterSpacing: 1 }}>
            Cuentas de demostración
          </Text>
          <View className="flex-row gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <Pressable
                key={acc.role}
                onPress={() => {
                  setEmail(acc.email);
                  setPassword(acc.password);
                  setError(null);
                }}
                className="flex-1 px-2 py-3 rounded-xl bg-surface border border-hairline active:opacity-70"
              >
                <Text className="text-secondary text-[12px] font-medium text-center">{acc.role}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
