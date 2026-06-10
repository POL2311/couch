import { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Modal, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronRight, UserCog, Users, Wallet, Activity, Plus, X } from "lucide-react-native";
import { getAdminOverview, addCoach, type AdminOverview } from "@/lib/data";
import { Screen, PageHeader, Card } from "@/components/ui";
import { T } from "@/lib/theme";

export default function AdminHome() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getAdminOverview().then(setData).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Screen>
      <PageHeader
        title="Administración"
        hint="Panel global del SaaS"
        right={
          <Pressable onPress={() => setModalOpen(true)} className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent active:opacity-80">
            <Plus size={15} color={T.textInverse} strokeWidth={2} />
            <Text className="text-inverse text-[13px] font-medium">Nuevo</Text>
          </Pressable>
        }
      />
      {loading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator color={T.textPrimary} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100, gap: 16 }}>
          {/* Métricas globales */}
          <View className="flex-row flex-wrap gap-3">
            <KpiCard icon={Wallet} label="MRR Global" value={`$${data!.metrics.mrr.toLocaleString("es-MX")}`} />
            <KpiCard icon={UserCog} label="Coaches" value={`${data!.metrics.totalCoaches}`} />
            <KpiCard icon={Users} label="Alumnos" value={`${data!.metrics.totalStudents}`} />
            <KpiCard icon={Users} label="Clientes" value={`${data!.metrics.totalClients}`} />
            <KpiCard icon={Activity} label="Activos" value={`${data!.metrics.activeStudents}`} />
          </View>

          {/* Lista de coaches */}
          <Card>
            <View className="px-5 py-4 border-b border-hairline">
              <Text className="text-primary text-[14px] font-medium">Coaches del SaaS ({data!.coaches.length})</Text>
            </View>
            {data!.coaches.map((c, i) => (
              <Pressable
                key={c.id}
                onPress={() => router.push(`/(admin)/coach/${c.id}` as any)}
                className="flex-row items-center px-5 py-4 active:bg-surface-raised"
                style={{ borderBottomWidth: i === data!.coaches.length - 1 ? 0 : 1, borderBottomColor: T.hairline }}
              >
                <View className="w-10 h-10 rounded-full items-center justify-center bg-surface-raised">
                  <UserCog size={18} color={T.textSecondary} strokeWidth={1.75} />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-primary text-[14px] font-medium">{c.name}</Text>
                  <Text className="text-tertiary text-[12px] mt-0.5">{c.email}</Text>
                </View>
                <View className="items-end mr-2">
                  <Text className="text-secondary text-[13px] font-medium">{c.studentCount} alumnos</Text>
                  <Text className="text-tertiary text-[11px] mt-0.5">{c.activeCount} activos</Text>
                </View>
                <ChevronRight size={16} color={T.textTertiary} />
              </Pressable>
            ))}
            {data!.coaches.length === 0 && (
              <Text className="text-tertiary text-[13px] text-center py-8">Aún no hay coaches registrados.</Text>
            )}
          </Card>
        </ScrollView>
      )}

      <NewCoachModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={() => { setModalOpen(false); load(); }} />
    </Screen>
  );
}

function NewCoachModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => { setName(""); setEmail(""); setPassword(""); setSaving(false); };

  const save = async () => {
    if (!name.trim() || !email.trim() || !password) { Alert.alert("Faltan datos", "Nombre, correo y contraseña son obligatorios."); return; }
    setSaving(true);
    try {
      await addCoach({ name: name.trim(), email: email.trim(), password });
      reset();
      onCreated();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo crear la cuenta de coach.");
      setSaving(false);
    }
  };

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
        <View className="rounded-t-3xl bg-surface border-t border-hairline p-6" style={{ paddingBottom: 36 }}>
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-primary text-[18px] font-semibold">Nuevo coach</Text>
            <Pressable onPress={() => { reset(); onClose(); }} hitSlop={10} className="w-8 h-8 rounded-full items-center justify-center bg-surface-raised">
              <X size={15} color={T.textTertiary} />
            </Pressable>
          </View>

          <Field label="Nombre completo" value={name} onChange={setName} placeholder="Ana Torres" />
          <Field label="Correo" value={email} onChange={setEmail} placeholder="ana@mycoach.app" keyboardType="email-address" />
          <Field label="Contraseña" value={password} onChange={setPassword} placeholder="••••••••" secure />

          <Pressable onPress={save} disabled={saving} className="mt-5 flex-row items-center justify-center gap-2 py-4 rounded-2xl bg-accent active:opacity-80" style={{ opacity: saving ? 0.6 : 1 }}>
            {saving ? <ActivityIndicator color={T.textInverse} /> : <Text className="text-inverse text-[15px] font-semibold">Crear cuenta de coach</Text>}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function Field({ label, value, onChange, placeholder, keyboardType, secure }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; keyboardType?: any; secure?: boolean }) {
  return (
    <View className="mt-3">
      <Text className="text-secondary text-[10px] uppercase font-medium mb-1.5" style={{ letterSpacing: 1 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={T.textTertiary}
        keyboardType={keyboardType}
        secureTextEntry={secure}
        autoCapitalize={keyboardType === "email-address" || secure ? "none" : "sentences"}
        className="px-3.5 py-3 rounded-xl text-[15px] text-primary bg-surface-raised border border-hairline"
      />
    </View>
  );
}

function KpiCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View className="rounded-2xl p-5 bg-surface border border-hairline" style={{ width: "47%", flexGrow: 1 }}>
      <View className="flex-row items-center justify-between">
        <Text className="text-tertiary text-[11px] uppercase font-medium" style={{ letterSpacing: 0.8 }}>{label}</Text>
        <Icon size={15} color={T.textTertiary} strokeWidth={1.75} />
      </View>
      <Text className="text-primary text-[24px] font-semibold mt-2">{value}</Text>
    </View>
  );
}
