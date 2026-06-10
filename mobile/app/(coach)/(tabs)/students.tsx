import { useEffect, useState, useMemo, useCallback } from "react";
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Modal, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Plus, X } from "lucide-react-native";
import { getStudents, addStudent, type Student, type PaymentStatus, type Stage } from "@/lib/data";
import { Screen, PageHeader, Avatar, Pill } from "@/components/ui";
import { T, STAGE_COLORS, PAYMENT_LABELS } from "@/lib/theme";

type Filter = "all" | "active" | "attention" | "inactive";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "active", label: "Al día" },
  { id: "attention", label: "Pendientes" },
  { id: "inactive", label: "Suspendidos" },
];

const STAGES: Stage[] = ["Volumen", "Definición", "Mantenimiento", "Recomposición"];

function matchesFilter(s: Student, f: Filter): boolean {
  if (f === "all") return true;
  if (f === "active") return s.paymentStatus === "active";
  if (f === "attention") return s.paymentStatus === "grace_period" || s.paymentStatus === "past_due";
  if (f === "inactive") return s.paymentStatus === "inactive";
  return true;
}

export default function StudentsScreen() {
  const insets = useSafeAreaInsets();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStudents(await getStudents());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const list = useMemo(
    () => students.filter((s) => matchesFilter(s, filter) && s.name.toLowerCase().includes(query.toLowerCase())),
    [students, filter, query]
  );

  return (
    <Screen>
      <PageHeader
        title="Alumnos"
        hint={`${students.length} en total`}
        right={
          <Pressable onPress={() => setModalOpen(true)} className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent active:opacity-80">
            <Plus size={15} color={T.textInverse} strokeWidth={2.5} />
            <Text className="text-inverse text-[13px] font-semibold">Nuevo</Text>
          </Pressable>
        }
      />

      <View className="px-5 pt-4">
        <View className="flex-row items-center px-3.5 rounded-xl bg-surface border border-hairline">
          <Search size={15} color={T.textTertiary} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Buscar alumno…" placeholderTextColor={T.textTertiary} className="flex-1 py-2.5 px-2 text-[14px] text-primary" />
        </View>
      </View>

      <View className="pt-3 pb-1">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <Pressable key={f.id} onPress={() => setFilter(f.id)} className="px-3.5 py-2 rounded-xl border" style={{ backgroundColor: active ? T.textPrimary : T.surface, borderColor: active ? T.textPrimary : T.hairline }}>
                <Text className="text-[12px] font-medium" style={{ color: active ? T.textInverse : T.textSecondary }}>{f.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator color={T.textPrimary} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100, gap: 10 }}>
          {list.length === 0 ? (
            <Text className="text-tertiary text-[13px] text-center py-10">Sin resultados</Text>
          ) : (
            list.map((s) => <StudentRow key={s.id} student={s} />)
          )}
        </ScrollView>
      )}

      <NewStudentModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={() => { setModalOpen(false); load(); }} />
    </Screen>
  );
}

function NewStudentModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<Stage>("Volumen");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => { setName(""); setEmail(""); setStage("Volumen"); setWeight(""); setHeight(""); setSaving(false); };

  const save = async () => {
    if (!name.trim() || !email.trim()) { Alert.alert("Faltan datos", "Nombre y correo son obligatorios."); return; }
    setSaving(true);
    try {
      await addStudent({
        name: name.trim(),
        email: email.trim(),
        stage,
        stageNumber: STAGES.indexOf(stage) + 1,
        startingWeight: parseFloat(weight) || 0,
        height: parseFloat(height) || undefined,
      });
      reset();
      onCreated();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo crear el alumno.");
      setSaving(false);
    }
  };

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
        <View className="rounded-t-3xl bg-surface border-t border-hairline p-6" style={{ paddingBottom: 36 }}>
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-primary text-[18px] font-semibold">Nuevo alumno</Text>
            <Pressable onPress={() => { reset(); onClose(); }} hitSlop={10} className="w-8 h-8 rounded-full items-center justify-center bg-surface-raised">
              <X size={15} color={T.textTertiary} />
            </Pressable>
          </View>

          <Field label="Nombre completo" value={name} onChange={setName} placeholder="Juan Pérez" />
          <Field label="Correo" value={email} onChange={setEmail} placeholder="juan@correo.com" keyboardType="email-address" />

          <Text className="text-secondary text-[10px] uppercase font-medium mb-1.5 mt-4" style={{ letterSpacing: 1 }}>Etapa</Text>
          <View className="flex-row flex-wrap gap-2">
            {STAGES.map((st) => {
              const active = stage === st;
              const c = STAGE_COLORS[st];
              return (
                <Pressable key={st} onPress={() => setStage(st)} className="px-3 py-2 rounded-xl border" style={{ backgroundColor: active ? c + "1a" : T.surfaceRaised, borderColor: active ? c : T.hairline }}>
                  <Text className="text-[12px] font-medium" style={{ color: active ? c : T.textSecondary }}>{st}</Text>
                </Pressable>
              );
            })}
          </View>

          <View className="flex-row gap-3 mt-4">
            <View className="flex-1"><Field label="Peso inicial (kg)" value={weight} onChange={setWeight} placeholder="80" keyboardType="decimal-pad" /></View>
            <View className="flex-1"><Field label="Altura (m)" value={height} onChange={setHeight} placeholder="1.75" keyboardType="decimal-pad" /></View>
          </View>

          <Pressable onPress={save} disabled={saving} className="mt-5 flex-row items-center justify-center gap-2 py-4 rounded-2xl bg-accent active:opacity-80" style={{ opacity: saving ? 0.6 : 1 }}>
            {saving ? <ActivityIndicator color={T.textInverse} /> : <Text className="text-inverse text-[15px] font-semibold">Crear alumno</Text>}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function Field({ label, value, onChange, placeholder, keyboardType }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; keyboardType?: any }) {
  return (
    <View className="mt-3">
      <Text className="text-secondary text-[10px] uppercase font-medium mb-1.5" style={{ letterSpacing: 1 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={T.textTertiary}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
        className="px-3.5 py-3 rounded-xl text-[15px] text-primary bg-surface-raised border border-hairline"
      />
    </View>
  );
}

function StudentRow({ student }: { student: Student }) {
  const router = useRouter();
  const pay = PAYMENT_LABELS[student.paymentStatus as PaymentStatus] ?? PAYMENT_LABELS.inactive;
  const stageColor = STAGE_COLORS[student.stage] ?? T.textTertiary;
  const delta = Math.round((student.currentWeight - student.previousWeight) * 10) / 10;
  return (
    <Pressable onPress={() => router.push(`/(coach)/student/${student.id}` as any)} className="flex-row items-center p-4 rounded-2xl bg-surface border border-hairline active:opacity-70">
      <Avatar initials={student.avatarInitials} color={student.avatarColor} />
      <View className="flex-1 ml-3">
        <Text className="text-primary text-[15px] font-medium" numberOfLines={1}>{student.name}</Text>
        <View className="flex-row items-center gap-2 mt-1.5">
          <Pill text={student.stage} color={stageColor} />
          <Text className="text-tertiary text-[12px]">{student.currentWeight} kg</Text>
          {delta !== 0 && <Text className="text-[12px]" style={{ color: delta < 0 ? T.success : T.textTertiary }}>{delta > 0 ? "+" : ""}{delta}</Text>}
        </View>
      </View>
      <View className="items-end">
        <Text className="text-secondary text-[13px] font-medium">{student.completionRate}%</Text>
        <View className="mt-1.5"><Pill text={pay.short} color={pay.color} bg={pay.bg} /></View>
      </View>
    </Pressable>
  );
}
