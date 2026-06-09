/* ═══════════════════════════════════════════
   Ejecución de un ejercicio (serie por serie).
   El alumno registra reps y peso de cada serie y marca
   cada una / el ejercicio como completado.
   ═══════════════════════════════════════════ */
import { useState, useEffect } from "react";
import { View, Text, Pressable, TextInput, Modal, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, CheckCircle2, Dumbbell } from "lucide-react-native";
import { registrarSesion, type SetEntry } from "@/lib/data";
import { T } from "@/lib/theme";

export interface SessionExercise {
  ejercicioId?: string | null;
  name: string;
  muscleGroup?: string | null;
  bodyweight: boolean;
  sets: number;
  reps: string;
  weight?: string;
}

export function ExerciseSession({ open, exercise, onClose, onCompleted }: {
  open: boolean;
  exercise: SessionExercise | null;
  onClose: () => void;
  onCompleted: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [rows, setRows] = useState<SetEntry[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !exercise) return;
    const n = Math.max(exercise.sets || 1, 1);
    setRows(Array.from({ length: n }, () => ({ reps: String(exercise.reps ?? ""), weight: exercise.weight ?? "", done: false })));
  }, [open, exercise]);

  if (!exercise) return null;

  const upd = (i: number, patch: Partial<SetEntry>) => setRows((p) => p.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const doneCount = rows.filter((r) => r.done).length;

  const complete = async () => {
    setSaving(true);
    try {
      await registrarSesion({
        ejercicioId: exercise.ejercicioId ?? null,
        exerciseName: exercise.name,
        muscleGroup: exercise.muscleGroup ?? null,
        bodyweight: exercise.bodyweight,
        prescribedSets: exercise.sets,
        prescribedReps: String(exercise.reps ?? ""),
        prescribedWeight: exercise.weight ?? null,
        sets: rows,
        completed: true,
      });
      setSaving(false);
      onCompleted();
    } catch {
      setSaving(false);
    }
  };

  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-root" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-hairline">
          <View className="flex-row items-center gap-2 flex-1">
            <Dumbbell size={18} color={T.textSecondary} />
            <View className="flex-1">
              <Text className="text-primary text-[17px] font-semibold" numberOfLines={1}>{exercise.name}</Text>
              <Text className="text-tertiary text-[12px]">
                Prescrito: {exercise.sets}×{exercise.reps}{exercise.weight ? ` @ ${exercise.weight}` : ""}{exercise.bodyweight ? " · peso corporal" : ""}
              </Text>
            </View>
          </View>
          <Pressable onPress={onClose} hitSlop={10} className="w-9 h-9 rounded-xl items-center justify-center bg-surface border border-hairline"><X size={16} color={T.textSecondary} /></Pressable>
        </View>

        <View className="px-5 pt-4">
          <View className="flex-row px-3 mb-2">
            <Text className="w-10 text-tertiary text-[10px] uppercase" style={{ letterSpacing: 0.8 }}>Serie</Text>
            <Text className="flex-1 text-center text-tertiary text-[10px] uppercase" style={{ letterSpacing: 0.8 }}>Reps</Text>
            {!exercise.bodyweight && <Text className="flex-1 text-center text-tertiary text-[10px] uppercase" style={{ letterSpacing: 0.8 }}>Peso</Text>}
            <Text className="w-10 text-center text-tertiary text-[10px] uppercase" style={{ letterSpacing: 0.8 }}>✓</Text>
          </View>

          {rows.map((r, i) => (
            <View key={i} className="flex-row items-center px-3 py-2 rounded-xl mb-2" style={{ backgroundColor: r.done ? "rgba(52,211,153,0.06)" : T.surface, borderWidth: 1, borderColor: r.done ? "rgba(52,211,153,0.25)" : T.hairline }}>
              <Text className="w-10 text-secondary text-[14px] font-medium">S{i + 1}</Text>
              <View className="flex-1 px-1">
                <TextInput value={r.reps} onChangeText={(v) => upd(i, { reps: v })} keyboardType="numeric" placeholder="—" placeholderTextColor={T.textTertiary} className="text-center text-[15px] font-medium text-primary py-2 rounded-lg" style={{ backgroundColor: T.surfaceRaised }} />
              </View>
              {!exercise.bodyweight && (
                <View className="flex-1 px-1">
                  <TextInput value={r.weight} onChangeText={(v) => upd(i, { weight: v })} placeholder="kg" placeholderTextColor={T.textTertiary} className="text-center text-[15px] font-medium text-primary py-2 rounded-lg" style={{ backgroundColor: T.surfaceRaised }} />
                </View>
              )}
              <Pressable onPress={() => upd(i, { done: !r.done })} className="w-10 items-center">
                <View className="w-7 h-7 rounded-full items-center justify-center" style={{ backgroundColor: r.done ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.05)", borderWidth: 1.5, borderColor: r.done ? "rgba(52,211,153,0.5)" : "rgba(255,255,255,0.12)" }}>
                  {r.done && <CheckCircle2 size={14} strokeWidth={2.5} color={T.success} />}
                </View>
              </Pressable>
            </View>
          ))}
        </View>

        <View className="flex-1" />
        <View className="px-5 pb-8 pt-2 border-t border-hairline">
          <Text className="text-tertiary text-[12px] text-center mb-3">{doneCount} de {rows.length} series completadas</Text>
          <Pressable onPress={complete} disabled={saving} className="flex-row items-center justify-center gap-2 py-4 rounded-2xl bg-accent active:opacity-80" style={{ opacity: saving ? 0.6 : 1 }}>
            {saving ? <ActivityIndicator color={T.textInverse} /> : <Text className="text-inverse text-[15px] font-semibold">Completar ejercicio</Text>}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
