/* ═══════════════════════════════════════════
   Modal "Gestionar alumno" (coach): cambiar etapa
   y asignar dieta/rutina desde plantillas.
   ═══════════════════════════════════════════ */
import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, Modal } from "react-native";
import { X } from "lucide-react-native";
import { getTemplates, applyStageChange, type Template, type Stage } from "@/lib/data";
import { T, STAGE_COLORS } from "@/lib/theme";

const STAGES: Stage[] = ["Volumen", "Definición", "Mantenimiento", "Recomposición"];

export function ManageStudentModal({ open, studentId, currentStage, onClose, onApplied }: { open: boolean; studentId: string; currentStage: Stage; onClose: () => void; onApplied: () => void }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [stage, setStage] = useState<Stage>(currentStage);
  const [dietId, setDietId] = useState<string | undefined>(undefined);
  const [routineId, setRoutineId] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) { setStage(currentStage); getTemplates().then(setTemplates).catch(() => {}); } }, [open, currentStage]);

  const diets = templates.filter((t) => t.type === "diet");
  const routines = templates.filter((t) => t.type === "routine");

  const apply = async () => {
    setSaving(true);
    try {
      await applyStageChange({ studentIds: [studentId], stage, stageNumber: STAGES.indexOf(stage) + 1, dietTemplateId: dietId, routineTemplateId: routineId });
      onApplied();
      setDietId(undefined); setRoutineId(undefined); setSaving(false);
    } catch (e: any) { Alert.alert("Error", e?.message ?? "No se pudo aplicar."); setSaving(false); }
  };

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
        <View className="rounded-t-3xl bg-surface border-t border-hairline p-6" style={{ paddingBottom: 36, maxHeight: "85%" }}>
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-primary text-[18px] font-semibold">Gestionar alumno</Text>
            <Pressable onPress={onClose} hitSlop={10} className="w-8 h-8 rounded-full items-center justify-center bg-surface-raised"><X size={15} color={T.textTertiary} /></Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-secondary text-[10px] uppercase font-medium mb-2" style={{ letterSpacing: 1 }}>Etapa</Text>
            <View className="flex-row flex-wrap gap-2 mb-5">
              {STAGES.map((st) => {
                const active = stage === st; const c = STAGE_COLORS[st];
                return <Pressable key={st} onPress={() => setStage(st)} className="px-3 py-2 rounded-xl border" style={{ backgroundColor: active ? c + "1a" : T.surfaceRaised, borderColor: active ? c : T.hairline }}><Text className="text-[12px] font-medium" style={{ color: active ? c : T.textSecondary }}>{st}</Text></Pressable>;
              })}
            </View>
            <SelectList label="Asignar dieta" items={diets} selected={dietId} onSelect={setDietId} />
            <SelectList label="Asignar rutina" items={routines} selected={routineId} onSelect={setRoutineId} />
          </ScrollView>
          <Pressable onPress={apply} disabled={saving} className="mt-5 flex-row items-center justify-center gap-2 py-4 rounded-2xl bg-accent active:opacity-80" style={{ opacity: saving ? 0.6 : 1 }}>
            {saving ? <ActivityIndicator color={T.textInverse} /> : <Text className="text-inverse text-[15px] font-semibold">Aplicar cambios</Text>}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function SelectList({ label, items, selected, onSelect }: { label: string; items: Template[]; selected?: string; onSelect: (id?: string) => void }) {
  return (
    <View className="mb-5">
      <Text className="text-secondary text-[10px] uppercase font-medium mb-2" style={{ letterSpacing: 1 }}>{label}</Text>
      {items.length === 0 ? (
        <Text className="text-tertiary text-[12px]">No hay plantillas.</Text>
      ) : (
        <View className="gap-2">
          {items.map((t) => {
            const active = selected === t.id;
            return <Pressable key={t.id} onPress={() => onSelect(active ? undefined : t.id)} className="px-4 py-3 rounded-xl border" style={{ backgroundColor: active ? "rgba(255,255,255,0.06)" : T.surfaceRaised, borderColor: active ? T.hairlineStrong : T.hairline }}><Text className="text-[13px] font-medium" style={{ color: active ? T.textPrimary : T.textSecondary }}>{t.name}</Text></Pressable>;
          })}
        </View>
      )}
    </View>
  );
}
