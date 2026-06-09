/* ═══════════════════════════════════════════
   Editor de plantillas (crear/editar dieta o rutina).
   - Dieta: conserva macros por comida.
   - Rutina: los ejercicios se SELECCIONAN del catálogo
     (referencia por ejercicioId) + series/reps/peso por rutina.
     El nombre se resuelve del catálogo al leer.
   ═══════════════════════════════════════════ */
import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Alert, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, Plus, Trash2, Search, CheckCircle2, Dumbbell } from "lucide-react-native";
import { createTemplate, updateTemplateData, getEjercicios, MUSCLE_GROUPS, type Template, type Ejercicio } from "@/lib/data";
import { T } from "@/lib/theme";

type MealDraft = { name: string; time: string; calories: string; items: string; protein: number; carbs: number; fat: number };
type ExDraft = { ejercicioId: string | null; name: string; bodyweight: boolean; sets: string; reps: string; weight: string };
type DayDraft = { day: string; label: string; muscleGroup: string; exercises: ExDraft[] };

const emptyMeal = (): MealDraft => ({ name: "", time: "", calories: "", items: "", protein: 0, carbs: 0, fat: 0 });
const emptyDay = (): DayDraft => ({ day: "", label: "", muscleGroup: "", exercises: [] });

export function TemplateEditor({ open, type, initial, onClose, onSaved }: {
  open: boolean; type: "diet" | "routine"; initial?: Template | null; onClose: () => void; onSaved: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [kcal, setKcal] = useState(""); const [p, setP] = useState(""); const [c, setC] = useState(""); const [f, setF] = useState("");
  const [meals, setMeals] = useState<MealDraft[]>([]);
  const [days, setDays] = useState<DayDraft[]>([]);
  const [catalog, setCatalog] = useState<Ejercicio[]>([]);
  const [pickerDay, setPickerDay] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (type === "routine") getEjercicios().then(setCatalog).catch(() => {});
    if (initial && initial.type === "diet") {
      setName(initial.name); setKcal(String(initial.totalCalories ?? ""));
      setP(String(initial.macros?.protein ?? "")); setC(String(initial.macros?.carbs ?? "")); setF(String(initial.macros?.fat ?? ""));
      setMeals(initial.meals.map((m) => ({ name: m.name, time: m.time, calories: String(m.calories), items: m.items.join(", "), protein: m.protein ?? 0, carbs: m.carbs ?? 0, fat: m.fat ?? 0 })));
    } else if (initial && initial.type === "routine") {
      setName(initial.name);
      setDays(initial.days.map((d) => ({
        day: d.day, label: d.label, muscleGroup: d.muscleGroup,
        exercises: d.exercises.map((e: any) => ({ ejercicioId: e.ejercicioId ?? null, name: e.name, bodyweight: !!e.bodyweight, sets: String(e.sets ?? 3), reps: String(e.reps ?? "10"), weight: e.weight ?? "" })),
      })));
    } else {
      setName(""); setKcal(""); setP(""); setC(""); setF("");
      setMeals(type === "diet" ? [emptyMeal()] : []);
      setDays(type === "routine" ? [emptyDay()] : []);
    }
  }, [open, initial, type]);

  const save = async () => {
    if (!name.trim()) { Alert.alert("Falta el nombre", "Ponle un nombre a la plantilla."); return; }
    setSaving(true);
    try {
      let data: any;
      if (type === "diet") {
        data = {
          totalCalories: parseInt(kcal) || 0,
          macros: { protein: parseInt(p) || 0, carbs: parseInt(c) || 0, fat: parseInt(f) || 0 },
          meals: meals.filter((m) => m.name.trim()).map((m) => ({ name: m.name.trim(), time: m.time.trim(), calories: parseInt(m.calories) || 0, protein: m.protein, carbs: m.carbs, fat: m.fat, items: m.items.split(/[,\n]/).map((x) => x.trim()).filter(Boolean) })),
        };
      } else {
        data = {
          daysPerWeek: days.filter((d) => d.day.trim() || d.label.trim()).length,
          days: days.filter((d) => d.day.trim() || d.label.trim()).map((d) => ({
            day: d.day.trim(), label: d.label.trim(), muscleGroup: d.muscleGroup.trim(),
            exercises: d.exercises.map((e) => ({ ejercicioId: e.ejercicioId, name: e.name, bodyweight: e.bodyweight, sets: parseInt(e.sets) || 3, reps: e.reps.trim() || "10", weight: e.weight.trim() || undefined, rest: "60s" })),
          })),
        };
      }
      if (initial) await updateTemplateData(initial.id, name.trim(), data);
      else await createTemplate(type, name.trim(), data);
      setSaving(false); onSaved();
    } catch (e: any) { Alert.alert("Error", e?.message ?? "No se pudo guardar."); setSaving(false); }
  };

  const addExercises = (dayIdx: number, picked: Ejercicio[]) => {
    setDays((prev) => prev.map((d, j) => j === dayIdx ? { ...d, exercises: [...d.exercises, ...picked.map((e) => ({ ejercicioId: e.id, name: e.name, bodyweight: e.bodyweight, sets: "3", reps: "10", weight: "" }))] } : d));
  };

  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-root" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-hairline">
          <Text className="text-primary text-[18px] font-semibold">{initial ? "Editar" : "Nueva"} {type === "diet" ? "dieta" : "rutina"}</Text>
          <Pressable onPress={onClose} hitSlop={10} className="w-9 h-9 rounded-xl items-center justify-center bg-surface border border-hairline"><X size={16} color={T.textSecondary} /></Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 14 }} keyboardShouldPersistTaps="handled">
          <Field label="Nombre de la plantilla" value={name} onChange={setName} placeholder={type === "diet" ? "Definición 1.800 kcal" : "PPL 5 días"} />

          {type === "diet" ? (
            <>
              <Field label="Kcal totales" value={kcal} onChange={setKcal} placeholder="1800" numeric />
              <View className="flex-row gap-3">
                <View className="flex-1"><Field label="Proteína (g)" value={p} onChange={setP} numeric /></View>
                <View className="flex-1"><Field label="Carbos (g)" value={c} onChange={setC} numeric /></View>
                <View className="flex-1"><Field label="Grasa (g)" value={f} onChange={setF} numeric /></View>
              </View>
              <Text className="text-tertiary text-[11px] uppercase font-medium mt-2" style={{ letterSpacing: 0.8 }}>Comidas</Text>
              {meals.map((m, i) => (
                <View key={i} className="rounded-2xl bg-surface border border-hairline p-4 gap-2">
                  <View className="flex-row items-center justify-between"><Text className="text-secondary text-[12px] font-medium">Comida {i + 1}</Text><Pressable onPress={() => setMeals(meals.filter((_, j) => j !== i))} hitSlop={8}><Trash2 size={15} color={T.danger} /></Pressable></View>
                  <View className="flex-row gap-2">
                    <View className="flex-1"><MiniInput value={m.name} onChange={(v) => setMeals(meals.map((x, j) => j === i ? { ...x, name: v } : x))} placeholder="Desayuno" /></View>
                    <View style={{ width: 80 }}><MiniInput value={m.time} onChange={(v) => setMeals(meals.map((x, j) => j === i ? { ...x, time: v } : x))} placeholder="07:00" /></View>
                    <View style={{ width: 70 }}><MiniInput value={m.calories} onChange={(v) => setMeals(meals.map((x, j) => j === i ? { ...x, calories: v } : x))} placeholder="kcal" numeric /></View>
                  </View>
                  <MiniInput value={m.items} onChange={(v) => setMeals(meals.map((x, j) => j === i ? { ...x, items: v } : x))} placeholder="Alimentos separados por comas" multiline />
                </View>
              ))}
              <AddBtn label="Agregar comida" onPress={() => setMeals([...meals, emptyMeal()])} />
            </>
          ) : (
            <>
              <Text className="text-tertiary text-[11px] uppercase font-medium mt-2" style={{ letterSpacing: 0.8 }}>Días de entrenamiento</Text>
              {days.map((d, di) => (
                <View key={di} className="rounded-2xl bg-surface border border-hairline p-4 gap-2">
                  <View className="flex-row items-center justify-between"><Text className="text-secondary text-[12px] font-medium">Día {di + 1}</Text><Pressable onPress={() => setDays(days.filter((_, j) => j !== di))} hitSlop={8}><Trash2 size={15} color={T.danger} /></Pressable></View>
                  <View className="flex-row gap-2">
                    <View style={{ width: 100 }}><MiniInput value={d.day} onChange={(v) => setDays(days.map((x, j) => j === di ? { ...x, day: v } : x))} placeholder="Lunes" /></View>
                    <View className="flex-1"><MiniInput value={d.label} onChange={(v) => setDays(days.map((x, j) => j === di ? { ...x, label: v } : x))} placeholder="Push" /></View>
                  </View>
                  <MiniInput value={d.muscleGroup} onChange={(v) => setDays(days.map((x, j) => j === di ? { ...x, muscleGroup: v } : x))} placeholder="Pecho · Hombro · Tríceps" />

                  <Text className="text-tertiary text-[10px] uppercase font-medium mt-1" style={{ letterSpacing: 0.8 }}>Ejercicios</Text>
                  {d.exercises.map((ex, ei) => {
                    const upd = (patch: Partial<ExDraft>) => setDays(days.map((x, j) => j === di ? { ...x, exercises: x.exercises.map((y, k) => k === ei ? { ...y, ...patch } : y) } : x));
                    return (
                      <View key={ei} className="rounded-xl bg-surface-raised border border-hairline p-2.5 gap-2">
                        <View className="flex-row items-center gap-2">
                          <Dumbbell size={14} color={T.textTertiary} />
                          <Text className="flex-1 text-primary text-[13px] font-medium">{ex.name}{ex.bodyweight ? "  · peso corporal" : ""}</Text>
                          <Pressable onPress={() => setDays(days.map((x, j) => j === di ? { ...x, exercises: x.exercises.filter((_, k) => k !== ei) } : x))} hitSlop={6}><Trash2 size={14} color={T.danger} /></Pressable>
                        </View>
                        <View className="flex-row gap-2">
                          <View style={{ width: 64 }}><MiniInput value={ex.sets} onChange={(v) => upd({ sets: v })} placeholder="Series" numeric /></View>
                          <View style={{ width: 72 }}><MiniInput value={ex.reps} onChange={(v) => upd({ reps: v })} placeholder="Reps" /></View>
                          {!ex.bodyweight && <View className="flex-1"><MiniInput value={ex.weight} onChange={(v) => upd({ weight: v })} placeholder="Peso (ej. 50 kg)" /></View>}
                        </View>
                      </View>
                    );
                  })}
                  <Pressable onPress={() => setPickerDay(di)} className="flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed active:opacity-70" style={{ borderColor: T.hairlineStrong }}>
                    <Plus size={14} color={T.textSecondary} /><Text className="text-secondary text-[12px] font-medium">Ejercicio (del catálogo)</Text>
                  </Pressable>
                </View>
              ))}
              <AddBtn label="Agregar día" onPress={() => setDays([...days, emptyDay()])} />
            </>
          )}

          <Pressable onPress={save} disabled={saving} className="mt-4 flex-row items-center justify-center gap-2 py-4 rounded-2xl bg-accent active:opacity-80" style={{ opacity: saving ? 0.6 : 1 }}>
            {saving ? <ActivityIndicator color={T.textInverse} /> : <Text className="text-inverse text-[15px] font-semibold">{initial ? "Guardar cambios" : "Crear plantilla"}</Text>}
          </Pressable>
        </ScrollView>

        <ExercisePicker
          open={pickerDay !== null}
          catalog={catalog}
          onClose={() => setPickerDay(null)}
          onConfirm={(picked) => { if (pickerDay !== null) addExercises(pickerDay, picked); setPickerDay(null); }}
        />
      </View>
    </Modal>
  );
}

function ExercisePicker({ open, catalog, onClose, onConfirm }: { open: boolean; catalog: Ejercicio[]; onClose: () => void; onConfirm: (picked: Ejercicio[]) => void }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string>("Todos");
  const [sel, setSel] = useState<Set<string>>(new Set());

  useEffect(() => { if (open) { setQuery(""); setGroup("Todos"); setSel(new Set()); } }, [open]);

  const list = catalog.filter((e) => (group === "Todos" || e.muscleGroup === group) && e.name.toLowerCase().includes(query.toLowerCase()));
  const toggle = (id: string) => setSel((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-root" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-hairline">
          <Text className="text-primary text-[17px] font-semibold">Elegir ejercicios</Text>
          <Pressable onPress={onClose} hitSlop={10} className="w-9 h-9 rounded-xl items-center justify-center bg-surface border border-hairline"><X size={16} color={T.textSecondary} /></Pressable>
        </View>

        <View className="px-5 pt-4">
          <View className="flex-row items-center px-3.5 rounded-xl bg-surface border border-hairline">
            <Search size={15} color={T.textTertiary} />
            <TextInput value={query} onChangeText={setQuery} placeholder="Buscar…" placeholderTextColor={T.textTertiary} className="flex-1 py-2.5 px-2 text-[14px] text-primary" />
          </View>
        </View>
        <View className="pt-3 pb-1">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
            {["Todos", ...MUSCLE_GROUPS].map((g) => {
              const active = group === g;
              return <Pressable key={g} onPress={() => setGroup(g)} className="px-3.5 py-2 rounded-xl border" style={{ backgroundColor: active ? T.textPrimary : T.surface, borderColor: active ? T.textPrimary : T.hairline }}><Text className="text-[12px] font-medium" style={{ color: active ? T.textInverse : T.textSecondary }}>{g}</Text></Pressable>;
            })}
          </ScrollView>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 20, gap: 10 }}>
          {catalog.length === 0 ? (
            <View className="items-center py-12"><Dumbbell size={30} color={T.textTertiary} strokeWidth={1.5} /><Text className="text-tertiary text-[13px] mt-3 text-center">Tu catálogo está vacío. Crea ejercicios en Plantillas → Catálogo.</Text></View>
          ) : list.length === 0 ? (
            <Text className="text-tertiary text-[13px] text-center py-10">Sin resultados</Text>
          ) : list.map((e) => {
            const on = sel.has(e.id);
            return (
              <Pressable key={e.id} onPress={() => toggle(e.id)} className="flex-row items-center p-4 rounded-2xl border" style={{ backgroundColor: on ? "rgba(52,211,153,0.06)" : T.surface, borderColor: on ? "rgba(52,211,153,0.35)" : T.hairline }}>
                <View className="flex-1">
                  <Text className="text-primary text-[14px] font-medium">{e.name}</Text>
                  <View className="flex-row items-center gap-2 mt-1">
                    <Text className="text-tertiary text-[12px]">{e.muscleGroup}</Text>
                    {!!e.equipment && <Text className="text-tertiary text-[12px]">· {e.equipment}</Text>}
                    {e.bodyweight && <Text className="text-[11px]" style={{ color: T.info }}>· peso corporal</Text>}
                  </View>
                </View>
                <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: on ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.05)", borderWidth: 1.5, borderColor: on ? "rgba(52,211,153,0.5)" : "rgba(255,255,255,0.1)" }}>
                  {on && <CheckCircle2 size={12} strokeWidth={2.5} color={T.success} />}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="px-5 pb-8 pt-2 border-t border-hairline">
          <Pressable onPress={() => onConfirm(catalog.filter((e) => sel.has(e.id)))} disabled={sel.size === 0} className="flex-row items-center justify-center gap-2 py-4 rounded-2xl bg-accent active:opacity-80" style={{ opacity: sel.size === 0 ? 0.5 : 1 }}>
            <Plus size={16} color={T.textInverse} strokeWidth={2.5} /><Text className="text-inverse text-[15px] font-semibold">Agregar {sel.size > 0 ? `(${sel.size})` : ""}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function Field({ label, value, onChange, placeholder, numeric }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; numeric?: boolean }) {
  return (
    <View>
      <Text className="text-secondary text-[10px] uppercase font-medium mb-1.5" style={{ letterSpacing: 1 }}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={T.textTertiary} keyboardType={numeric ? "decimal-pad" : "default"} className="px-3.5 py-3 rounded-xl text-[15px] text-primary bg-surface-raised border border-hairline" />
    </View>
  );
}

function MiniInput({ value, onChange, placeholder, numeric, multiline }: { value: string; onChange: (v: string) => void; placeholder?: string; numeric?: boolean; multiline?: boolean }) {
  return (
    <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={T.textTertiary} keyboardType={numeric ? "decimal-pad" : "default"} multiline={multiline}
      className="px-3 py-2.5 rounded-xl text-[14px] text-primary bg-surface-raised border border-hairline" style={multiline ? { minHeight: 60, textAlignVertical: "top" } : undefined} />
  );
}

function AddBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center justify-center gap-2 py-3 rounded-xl border border-dashed active:opacity-70" style={{ borderColor: T.hairlineStrong }}>
      <Plus size={15} color={T.textSecondary} /><Text className="text-secondary text-[13px] font-medium">{label}</Text>
    </Pressable>
  );
}
