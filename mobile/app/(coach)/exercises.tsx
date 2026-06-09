import { useEffect, useState, useMemo, useCallback } from "react";
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Modal, Alert, Switch } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Search, Plus, Trash2, Dumbbell, X } from "lucide-react-native";
import { getEjercicios, createEjercicio, updateEjercicioData, deleteEjercicio, MUSCLE_GROUPS, EQUIPMENT, type Ejercicio } from "@/lib/data";
import { T } from "@/lib/theme";

export default function ExercisesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [items, setItems] = useState<Ejercicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string>("Todos");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Ejercicio | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await getEjercicios()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const list = useMemo(
    () => items.filter((e) => (group === "Todos" || e.muscleGroup === group) && e.name.toLowerCase().includes(query.toLowerCase())),
    [items, query, group]
  );

  const confirmDelete = (e: Ejercicio) => {
    Alert.alert("Eliminar ejercicio", `¿Eliminar "${e.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => { await deleteEjercicio(e.id); load(); } },
    ]);
  };

  return (
    <View className="flex-1 bg-root" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-3 border-b border-hairline gap-2">
        <Pressable onPress={() => router.back()} hitSlop={10} className="w-9 h-9 rounded-xl items-center justify-center bg-surface border border-hairline active:opacity-70">
          <ChevronLeft size={18} color={T.textSecondary} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-primary text-[17px] font-semibold">Catálogo de ejercicios</Text>
          <Text className="text-tertiary text-[11px]">{items.length} ejercicios</Text>
        </View>
        <Pressable onPress={() => { setEditing(null); setEditorOpen(true); }} className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent active:opacity-80">
          <Plus size={15} color={T.textInverse} strokeWidth={2.5} />
          <Text className="text-inverse text-[13px] font-semibold">Nuevo</Text>
        </Pressable>
      </View>

      <View className="px-5 pt-4">
        <View className="flex-row items-center px-3.5 rounded-xl bg-surface border border-hairline">
          <Search size={15} color={T.textTertiary} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Buscar ejercicio…" placeholderTextColor={T.textTertiary} className="flex-1 py-2.5 px-2 text-[14px] text-primary" />
        </View>
      </View>

      <View className="pt-3 pb-1">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
          {["Todos", ...MUSCLE_GROUPS].map((g) => {
            const active = group === g;
            return (
              <Pressable key={g} onPress={() => setGroup(g)} className="px-3.5 py-2 rounded-xl border" style={{ backgroundColor: active ? T.textPrimary : T.surface, borderColor: active ? T.textPrimary : T.hairline }}>
                <Text className="text-[12px] font-medium" style={{ color: active ? T.textInverse : T.textSecondary }}>{g}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator color={T.textPrimary} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 10 }}>
          {list.length === 0 ? (
            <View className="items-center py-12">
              <Dumbbell size={32} color={T.textTertiary} strokeWidth={1.5} />
              <Text className="text-tertiary text-[13px] mt-3 text-center">{items.length === 0 ? "Aún no tienes ejercicios. Crea el primero." : "Sin resultados"}</Text>
            </View>
          ) : (
            list.map((e) => (
              <Pressable key={e.id} onPress={() => { setEditing(e); setEditorOpen(true); }} className="flex-row items-center p-4 rounded-2xl bg-surface border border-hairline active:opacity-70">
                <View className="w-10 h-10 rounded-xl items-center justify-center bg-surface-raised"><Dumbbell size={18} color={T.textSecondary} strokeWidth={1.75} /></View>
                <View className="flex-1 ml-3">
                  <Text className="text-primary text-[14px] font-medium">{e.name}</Text>
                  <View className="flex-row items-center gap-2 mt-1">
                    <View className="px-2 py-0.5 rounded-md" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}><Text className="text-tertiary text-[11px]">{e.muscleGroup}</Text></View>
                    {!!e.equipment && <Text className="text-tertiary text-[12px]">{e.equipment}</Text>}
                    {e.bodyweight && <Text className="text-[11px]" style={{ color: T.info }}>· peso corporal</Text>}
                  </View>
                </View>
                <Pressable onPress={() => confirmDelete(e)} hitSlop={8}><Trash2 size={16} color={T.danger} /></Pressable>
              </Pressable>
            ))
          )}
        </ScrollView>
      )}

      <ExerciseEditor open={editorOpen} initial={editing} onClose={() => setEditorOpen(false)} onSaved={() => { setEditorOpen(false); load(); }} />
    </View>
  );
}

function ExerciseEditor({ open, initial, onClose, onSaved }: { open: boolean; initial: Ejercicio | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [group, setGroup] = useState<string>(MUSCLE_GROUPS[0]);
  const [equip, setEquip] = useState<string>(EQUIPMENT[0]);
  const [bodyweight, setBodyweight] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initial) { setName(initial.name); setGroup(initial.muscleGroup); setEquip(initial.equipment || EQUIPMENT[0]); setBodyweight(initial.bodyweight); }
    else { setName(""); setGroup(MUSCLE_GROUPS[0]); setEquip(EQUIPMENT[0]); setBodyweight(false); }
  }, [open, initial]);

  const save = async () => {
    if (!name.trim()) { Alert.alert("Falta el nombre", "Ponle un nombre al ejercicio."); return; }
    setSaving(true);
    try {
      const data = { name: name.trim(), muscleGroup: group, equipment: bodyweight ? "Peso corporal" : equip, bodyweight };
      if (initial) await updateEjercicioData(initial.id, data);
      else await createEjercicio(data);
      setSaving(false);
      onSaved();
    } catch (e: any) { Alert.alert("Error", e?.message ?? "No se pudo guardar."); setSaving(false); }
  };

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
        <View className="rounded-t-3xl bg-surface border-t border-hairline p-6" style={{ paddingBottom: 36, maxHeight: "88%" }}>
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-primary text-[18px] font-semibold">{initial ? "Editar" : "Nuevo"} ejercicio</Text>
            <Pressable onPress={onClose} hitSlop={10} className="w-8 h-8 rounded-full items-center justify-center bg-surface-raised"><X size={15} color={T.textTertiary} /></Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-secondary text-[10px] uppercase font-medium mb-1.5" style={{ letterSpacing: 1 }}>Nombre</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Press de Banca" placeholderTextColor={T.textTertiary} className="px-3.5 py-3 rounded-xl text-[15px] text-primary bg-surface-raised border border-hairline" />

            <Text className="text-secondary text-[10px] uppercase font-medium mb-2 mt-4" style={{ letterSpacing: 1 }}>Grupo muscular</Text>
            <View className="flex-row flex-wrap gap-2">
              {MUSCLE_GROUPS.map((g) => {
                const active = group === g;
                return <Pressable key={g} onPress={() => setGroup(g)} className="px-3 py-2 rounded-xl border" style={{ backgroundColor: active ? "rgba(255,255,255,0.08)" : T.surfaceRaised, borderColor: active ? T.hairlineStrong : T.hairline }}><Text className="text-[12px] font-medium" style={{ color: active ? T.textPrimary : T.textSecondary }}>{g}</Text></Pressable>;
              })}
            </View>

            <View className="flex-row items-center justify-between mt-5 px-1">
              <Text className="text-secondary text-[13px] font-medium">Es de peso corporal</Text>
              <Switch value={bodyweight} onValueChange={setBodyweight} trackColor={{ true: T.success, false: "#3a3a3c" }} thumbColor="#fff" />
            </View>

            {!bodyweight && (
              <>
                <Text className="text-secondary text-[10px] uppercase font-medium mb-2 mt-4" style={{ letterSpacing: 1 }}>Equipo</Text>
                <View className="flex-row flex-wrap gap-2">
                  {EQUIPMENT.filter((eq) => eq !== "Peso corporal").map((eq) => {
                    const active = equip === eq;
                    return <Pressable key={eq} onPress={() => setEquip(eq)} className="px-3 py-2 rounded-xl border" style={{ backgroundColor: active ? "rgba(255,255,255,0.08)" : T.surfaceRaised, borderColor: active ? T.hairlineStrong : T.hairline }}><Text className="text-[12px] font-medium" style={{ color: active ? T.textPrimary : T.textSecondary }}>{eq}</Text></Pressable>;
                  })}
                </View>
              </>
            )}
          </ScrollView>

          <Pressable onPress={save} disabled={saving} className="mt-5 flex-row items-center justify-center gap-2 py-4 rounded-2xl bg-accent active:opacity-80" style={{ opacity: saving ? 0.6 : 1 }}>
            {saving ? <ActivityIndicator color={T.textInverse} /> : <Text className="text-inverse text-[15px] font-semibold">{initial ? "Guardar cambios" : "Crear ejercicio"}</Text>}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
