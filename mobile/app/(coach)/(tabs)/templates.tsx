import { useEffect, useState, useMemo, useCallback } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Utensils, Dumbbell, Plus, Trash2, ListChecks } from "lucide-react-native";
import { getTemplates, deleteTemplate, type Template } from "@/lib/data";
import { TemplateEditor } from "@/components/template-editor";
import { Screen, PageHeader, Card } from "@/components/ui";
import { T } from "@/lib/theme";

export default function TemplatesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"diet" | "routine">("diet");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setTemplates(await getTemplates()); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const list = useMemo(() => templates.filter((t) => t.type === tab), [templates, tab]);

  const openNew = () => { setEditing(null); setEditorOpen(true); };
  const openEdit = (t: Template) => { setEditing(t); setEditorOpen(true); };

  const confirmDelete = (t: Template) => {
    Alert.alert("Eliminar plantilla", `¿Eliminar "${t.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => { await deleteTemplate(t.id); load(); } },
    ]);
  };

  return (
    <Screen>
      <PageHeader
        title="Plantillas"
        hint="Dietas y rutinas reutilizables"
        right={
          <View className="flex-row items-center gap-2">
            <Pressable onPress={() => router.push("/(coach)/exercises" as any)} className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-hairline active:opacity-70">
              <ListChecks size={15} color={T.textSecondary} />
              <Text className="text-secondary text-[13px] font-medium">Catálogo</Text>
            </Pressable>
            <Pressable onPress={openNew} className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent active:opacity-80">
              <Plus size={15} color={T.textInverse} strokeWidth={2.5} />
              <Text className="text-inverse text-[13px] font-semibold">Nueva</Text>
            </Pressable>
          </View>
        }
      />

      <View className="flex-row gap-2 px-5 pt-4">
        {(["diet", "routine"] as const).map((t) => {
          const active = tab === t;
          return (
            <Pressable key={t} onPress={() => setTab(t)} className="flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl border" style={{ backgroundColor: active ? T.textPrimary : T.surface, borderColor: active ? T.textPrimary : T.hairline }}>
              {t === "diet" ? <Utensils size={14} color={active ? T.textInverse : T.textSecondary} /> : <Dumbbell size={14} color={active ? T.textInverse : T.textSecondary} />}
              <Text className="text-[13px] font-medium" style={{ color: active ? T.textInverse : T.textSecondary }}>{t === "diet" ? "Dietas" : "Rutinas"}</Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator color={T.textPrimary} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100, gap: 12 }}>
          {list.length === 0 && <Text className="text-tertiary text-[13px] text-center py-10">No hay plantillas. Toca "Nueva" para crear una.</Text>}
          {list.map((t) =>
            t.type === "diet"
              ? <DietCard key={t.id} t={t} onEdit={() => openEdit(t)} onDelete={() => confirmDelete(t)} />
              : <RoutineCard key={t.id} t={t} onEdit={() => openEdit(t)} onDelete={() => confirmDelete(t)} />
          )}
        </ScrollView>
      )}

      <TemplateEditor open={editorOpen} type={tab} initial={editing} onClose={() => setEditorOpen(false)} onSaved={() => { setEditorOpen(false); load(); }} />
    </Screen>
  );
}

function DietCard({ t, onEdit, onDelete }: { t: Extract<Template, { type: "diet" }>; onEdit: () => void; onDelete: () => void }) {
  return (
    <Card>
      <Pressable onPress={onEdit} className="active:opacity-80">
        <View className="px-5 py-4 border-b border-hairline flex-row items-center justify-between">
          <Text className="text-primary text-[15px] font-medium flex-1">{t.name}</Text>
          <Text className="text-tertiary text-[12px] mr-3">{t.totalCalories} kcal</Text>
          <Pressable onPress={onDelete} hitSlop={8}><Trash2 size={15} color={T.danger} /></Pressable>
        </View>
        <View className="flex-row gap-2 p-4">
          <Macro value={`${t.macros.protein}g`} label="Proteína" />
          <Macro value={`${t.macros.carbs}g`} label="Carbos" />
          <Macro value={`${t.macros.fat}g`} label="Grasa" />
        </View>
        <Text className="text-tertiary text-[12px] px-5 pb-4">{t.meals.length} comidas · toca para editar</Text>
      </Pressable>
    </Card>
  );
}

function RoutineCard({ t, onEdit, onDelete }: { t: Extract<Template, { type: "routine" }>; onEdit: () => void; onDelete: () => void }) {
  return (
    <Card>
      <Pressable onPress={onEdit} className="active:opacity-80">
        <View className="px-5 py-4 border-b border-hairline flex-row items-center justify-between">
          <Text className="text-primary text-[15px] font-medium flex-1">{t.name}</Text>
          <Text className="text-tertiary text-[12px] mr-3">{t.daysPerWeek} días/sem</Text>
          <Pressable onPress={onDelete} hitSlop={8}><Trash2 size={15} color={T.danger} /></Pressable>
        </View>
        <View className="p-4 gap-2">
          {t.days.map((d) => (
            <View key={d.day} className="flex-row items-center justify-between">
              <Text className="text-secondary text-[13px]">{d.day} · {d.label}</Text>
              <Text className="text-tertiary text-[12px]">{d.exercises.length} ejs</Text>
            </View>
          ))}
          <Text className="text-tertiary text-[12px] mt-1">Toca para editar</Text>
        </View>
      </Pressable>
    </Card>
  );
}

function Macro({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 items-center py-3 rounded-xl bg-surface-raised">
      <Text className="text-primary text-[16px] font-semibold">{value}</Text>
      <Text className="text-tertiary text-[11px] mt-0.5">{label}</Text>
    </View>
  );
}
