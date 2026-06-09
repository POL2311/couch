"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, X, Loader2, Search, CheckCircle2, Dumbbell } from "lucide-react";

/* ═══════════════════════════════════════════
   Editor de plantillas (dieta / rutina) — WEB.
   Rutina: los ejercicios se SELECCIONAN del catálogo
   (referencia por ejercicioId) + series/reps/peso, en
   paridad con la app.
   ═══════════════════════════════════════════ */

type Macros = { protein: number; carbs: number; fat: number };
type Meal = { name: string; time: string; calories: number; protein: number; carbs: number; fat: number; items: string[] };
type Exercise = { ejercicioId?: string | null; name: string; bodyweight?: boolean; sets: number; reps: string; weight?: string; rest?: string };
type RoutineDay = { day: string; label: string; muscleGroup: string; exercises: Exercise[] };
interface Ejercicio { id: string; name: string; muscleGroup: string; equipment: string; bodyweight: boolean }

export interface DietData { name: string; totalCalories: number; macros: Macros; meals: Meal[] }
export interface RoutineData { name: string; daysPerWeek: number; days: RoutineDay[] }

const inputStyle = { background: "var(--bg-surface-raised)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" };
const inputCls = "px-3 py-2 rounded-lg text-[13px] outline-none border focus:border-[var(--border-strong)] transition-all duration-150 w-full";
const labelCls = "text-[10px] uppercase tracking-wider font-medium";
const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MUSCLE_GROUPS = ["Pecho", "Espalda", "Pierna", "Glúteo", "Hombro", "Brazo", "Core", "Cardio"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5"><label className={labelCls} style={{ color: "var(--text-secondary)" }}>{label}</label>{children}</div>;
}

export default function TemplateEditorModal({ type, initial, title, saveLabel = "Guardar", onClose, onSave }: {
  type: "diet" | "routine"; initial?: any; title: string; saveLabel?: string; onClose: () => void; onSave: (data: DietData | RoutineData) => Promise<void> | void;
}) {
  const [saving, setSaving] = useState(false);
  const [catalog, setCatalog] = useState<Ejercicio[]>([]);
  const [pickerDay, setPickerDay] = useState<number | null>(null);

  const [diet, setDiet] = useState<DietData>(() => type === "diet"
    ? { name: initial?.name ?? "", totalCalories: initial?.totalCalories ?? 0, macros: initial?.macros ?? { protein: 0, carbs: 0, fat: 0 }, meals: initial?.meals ?? [] }
    : { name: "", totalCalories: 0, macros: { protein: 0, carbs: 0, fat: 0 }, meals: [] });
  const [routine, setRoutine] = useState<RoutineData>(() => type === "routine"
    ? { name: initial?.name ?? "", daysPerWeek: initial?.daysPerWeek ?? 0, days: initial?.days ?? [] }
    : { name: "", daysPerWeek: 0, days: [] });

  useEffect(() => { if (type === "routine") fetch("/api/ejercicios").then((r) => r.json()).then(setCatalog).catch(() => {}); }, [type]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (type === "diet") await onSave({ ...diet, meals: diet.meals.map((m) => ({ ...m, items: m.items.filter((i) => i.trim()) })) });
      else await onSave({ ...routine, daysPerWeek: routine.days.length });
    } finally { setSaving(false); }
  };

  const addMeal = () => setDiet((d) => ({ ...d, meals: [...d.meals, { name: "", time: "08:00", calories: 0, protein: 0, carbs: 0, fat: 0, items: [""] }] }));
  const updateMeal = (i: number, patch: Partial<Meal>) => setDiet((d) => ({ ...d, meals: d.meals.map((m, j) => (j === i ? { ...m, ...patch } : m)) }));
  const removeMeal = (i: number) => setDiet((d) => ({ ...d, meals: d.meals.filter((_, j) => j !== i) }));

  const addDay = () => setRoutine((r) => ({ ...r, days: [...r.days, { day: DAYS[r.days.length % 7], label: "", muscleGroup: "", exercises: [] }] }));
  const updateDay = (i: number, patch: Partial<RoutineDay>) => setRoutine((r) => ({ ...r, days: r.days.map((d, j) => (j === i ? { ...d, ...patch } : d)) }));
  const removeDay = (i: number) => setRoutine((r) => ({ ...r, days: r.days.filter((_, j) => j !== i) }));
  const updateExercise = (di: number, ei: number, patch: Partial<Exercise>) => updateDay(di, { exercises: routine.days[di].exercises.map((e, j) => (j === ei ? { ...e, ...patch } : e)) });
  const removeExercise = (di: number, ei: number) => updateDay(di, { exercises: routine.days[di].exercises.filter((_, j) => j !== ei) });
  const addExercises = (di: number, picked: Ejercicio[]) => updateDay(di, { exercises: [...routine.days[di].exercises, ...picked.map((e) => ({ ejercicioId: e.id, name: e.name, bodyweight: e.bodyweight, sets: 3, reps: "10", weight: "", rest: "60s" }))] });

  const canSave = type === "diet" ? diet.name.trim().length > 0 : routine.name.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="fixed inset-0 backdrop-blur-sm" style={{ background: "var(--scrim)" }} onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl z-10 animate-fade-in flex flex-col max-h-[90vh]" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-strong)" }}>
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <h3 className="text-[15px] font-medium" style={{ color: "var(--text-primary)" }}>{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg cursor-pointer" style={{ color: "var(--text-tertiary)" }}><X size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          {type === "diet" ? (
            <>
              <Field label="Nombre de la dieta"><input className={inputCls} style={inputStyle} value={diet.name} onChange={(e) => setDiet({ ...diet, name: e.target.value })} placeholder="Ej. Déficit Calórico (Definición)" /></Field>
              <div className="grid grid-cols-4 gap-2">
                <Field label="Kcal"><input type="number" className={inputCls} style={inputStyle} value={diet.totalCalories} onChange={(e) => setDiet({ ...diet, totalCalories: +e.target.value })} /></Field>
                <Field label="Prot (g)"><input type="number" className={inputCls} style={inputStyle} value={diet.macros.protein} onChange={(e) => setDiet({ ...diet, macros: { ...diet.macros, protein: +e.target.value } })} /></Field>
                <Field label="Carb (g)"><input type="number" className={inputCls} style={inputStyle} value={diet.macros.carbs} onChange={(e) => setDiet({ ...diet, macros: { ...diet.macros, carbs: +e.target.value } })} /></Field>
                <Field label="Gra (g)"><input type="number" className={inputCls} style={inputStyle} value={diet.macros.fat} onChange={(e) => setDiet({ ...diet, macros: { ...diet.macros, fat: +e.target.value } })} /></Field>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className={labelCls} style={{ color: "var(--text-secondary)" }}>Comidas ({diet.meals.length})</span>
                <button onClick={addMeal} className="inline-flex items-center gap-1 text-[12px] px-2.5 py-1 rounded-lg cursor-pointer" style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}><Plus size={13} /> Añadir comida</button>
              </div>
              {diet.meals.map((meal, i) => (
                <div key={i} className="rounded-xl p-3 space-y-2" style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)" }}>
                  <div className="flex items-center gap-2">
                    <input className={inputCls} style={inputStyle} placeholder="Nombre (Desayuno)" value={meal.name} onChange={(e) => updateMeal(i, { name: e.target.value })} />
                    <input className="px-3 py-2 rounded-lg text-[13px] outline-none border w-24" style={inputStyle} placeholder="Hora" value={meal.time} onChange={(e) => updateMeal(i, { time: e.target.value })} />
                    <button onClick={() => removeMeal(i)} className="p-2 rounded-lg cursor-pointer shrink-0" style={{ color: "var(--color-danger)" }}><Trash2 size={15} /></button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <input type="number" className={inputCls} style={inputStyle} placeholder="kcal" value={meal.calories} onChange={(e) => updateMeal(i, { calories: +e.target.value })} />
                    <input type="number" className={inputCls} style={inputStyle} placeholder="P" value={meal.protein} onChange={(e) => updateMeal(i, { protein: +e.target.value })} />
                    <input type="number" className={inputCls} style={inputStyle} placeholder="C" value={meal.carbs} onChange={(e) => updateMeal(i, { carbs: +e.target.value })} />
                    <input type="number" className={inputCls} style={inputStyle} placeholder="G" value={meal.fat} onChange={(e) => updateMeal(i, { fat: +e.target.value })} />
                  </div>
                  <textarea className="px-3 py-2 rounded-lg text-[13px] outline-none border w-full resize-y min-h-[60px]" style={inputStyle} placeholder="Un alimento por línea" value={meal.items.join("\n")} onChange={(e) => updateMeal(i, { items: e.target.value.split("\n") })} />
                </div>
              ))}
            </>
          ) : (
            <>
              <Field label="Nombre de la rutina"><input className={inputCls} style={inputStyle} value={routine.name} onChange={(e) => setRoutine({ ...routine, name: e.target.value })} placeholder="Ej. PPL 5 días" /></Field>
              <div className="flex items-center justify-between pt-1">
                <span className={labelCls} style={{ color: "var(--text-secondary)" }}>Días ({routine.days.length})</span>
                <button onClick={addDay} className="inline-flex items-center gap-1 text-[12px] px-2.5 py-1 rounded-lg cursor-pointer" style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}><Plus size={13} /> Añadir día</button>
              </div>
              {routine.days.map((day, di) => (
                <div key={di} className="rounded-xl p-3 space-y-2" style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)" }}>
                  <div className="flex items-center gap-2">
                    <select className="px-3 py-2 rounded-lg text-[13px] outline-none border w-32" style={inputStyle} value={day.day} onChange={(e) => updateDay(di, { day: e.target.value })}>{DAYS.map((d) => <option key={d} value={d}>{d}</option>)}</select>
                    <input className={inputCls} style={inputStyle} placeholder="Etiqueta (Push)" value={day.label} onChange={(e) => updateDay(di, { label: e.target.value })} />
                    <button onClick={() => removeDay(di)} className="p-2 rounded-lg cursor-pointer shrink-0" style={{ color: "var(--color-danger)" }}><Trash2 size={15} /></button>
                  </div>
                  <input className={inputCls} style={inputStyle} placeholder="Grupo muscular (Pecho · Hombro · Tríceps)" value={day.muscleGroup} onChange={(e) => updateDay(di, { muscleGroup: e.target.value })} />
                  {day.exercises.map((ex, ei) => (
                    <div key={ei} className="flex items-center gap-2 rounded-lg px-2.5 py-2" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                      <Dumbbell size={13} style={{ color: "var(--text-tertiary)" }} />
                      <span className="flex-1 text-[13px] truncate" style={{ color: "var(--text-primary)" }}>{ex.name}{ex.bodyweight ? " · pc" : ""}</span>
                      <input type="number" className="px-2 py-1.5 rounded-lg text-[13px] outline-none border w-14" style={inputStyle} placeholder="Sets" value={ex.sets} onChange={(e) => updateExercise(di, ei, { sets: +e.target.value })} />
                      <input className="px-2 py-1.5 rounded-lg text-[13px] outline-none border w-16" style={inputStyle} placeholder="Reps" value={ex.reps} onChange={(e) => updateExercise(di, ei, { reps: e.target.value })} />
                      {!ex.bodyweight && <input className="px-2 py-1.5 rounded-lg text-[13px] outline-none border w-16" style={inputStyle} placeholder="Peso" value={ex.weight ?? ""} onChange={(e) => updateExercise(di, ei, { weight: e.target.value })} />}
                      <button onClick={() => removeExercise(di, ei)} className="p-1 rounded-lg cursor-pointer shrink-0" style={{ color: "var(--color-danger)" }}><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <button onClick={() => setPickerDay(di)} className="inline-flex items-center gap-1 text-[12px] px-2.5 py-1.5 rounded-lg cursor-pointer w-full justify-center border border-dashed" style={{ borderColor: "var(--border-strong)", color: "var(--text-secondary)" }}><Plus size={12} /> Ejercicio (del catálogo)</button>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 shrink-0" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <button onClick={onClose} disabled={saving} className="px-4 py-2.5 rounded-xl text-[12px] font-medium cursor-pointer disabled:opacity-50" style={{ color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving || !canSave} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-medium cursor-pointer hover:opacity-85 disabled:opacity-50" style={{ background: "var(--accent-primary)", color: "var(--text-inverse)" }}>{saving ? <Loader2 size={15} className="animate-spin" /> : saveLabel}</button>
        </div>
      </div>

      {pickerDay !== null && <ExercisePicker catalog={catalog} onClose={() => setPickerDay(null)} onConfirm={(picked) => { addExercises(pickerDay, picked); setPickerDay(null); }} />}
    </div>
  );
}

function ExercisePicker({ catalog, onClose, onConfirm }: { catalog: Ejercicio[]; onClose: () => void; onConfirm: (picked: Ejercicio[]) => void }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("Todos");
  const [sel, setSel] = useState<Set<string>>(new Set());
  const list = catalog.filter((e) => (group === "Todos" || e.muscleGroup === group) && e.name.toLowerCase().includes(query.toLowerCase()));
  const toggle = (id: string) => setSel((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="fixed inset-0 backdrop-blur-sm" style={{ background: "var(--scrim)" }} onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-strong)" }}>
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <h3 className="text-[15px] font-medium" style={{ color: "var(--text-primary)" }}>Elegir ejercicios</h3>
          <button onClick={onClose} className="cursor-pointer"><X size={18} style={{ color: "var(--text-tertiary)" }} /></button>
        </div>
        <div className="px-6 pt-4">
          <div className="flex items-center px-3.5 rounded-xl mb-3" style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)" }}>
            <Search size={15} style={{ color: "var(--text-tertiary)" }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar…" className="flex-1 py-2.5 px-2 text-[14px] bg-transparent outline-none" style={{ color: "var(--text-primary)" }} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-3">{["Todos", ...MUSCLE_GROUPS].map((g) => { const a = group === g; return <button key={g} onClick={() => setGroup(g)} className="px-3.5 py-2 rounded-xl text-[12px] font-medium whitespace-nowrap cursor-pointer" style={{ background: a ? "var(--text-primary)" : "var(--bg-surface-raised)", border: `1px solid ${a ? "var(--text-primary)" : "var(--border-subtle)"}`, color: a ? "var(--text-inverse)" : "var(--text-secondary)" }}>{g}</button>; })}</div>
        </div>
        <div className="px-6 pb-4 space-y-2 overflow-y-auto">
          {catalog.length === 0 ? <div className="flex flex-col items-center py-10"><Dumbbell size={28} style={{ color: "var(--text-tertiary)" }} /><p className="text-[13px] mt-3 text-center" style={{ color: "var(--text-tertiary)" }}>Tu catálogo está vacío. Créalo en Plantillas → Catálogo.</p></div> : list.length === 0 ? <p className="text-[13px] text-center py-8" style={{ color: "var(--text-tertiary)" }}>Sin resultados</p> : list.map((e) => {
            const on = sel.has(e.id);
            return (
              <button key={e.id} onClick={() => toggle(e.id)} className="w-full flex items-center p-3.5 rounded-2xl text-left cursor-pointer" style={{ background: on ? "rgba(52,211,153,0.06)" : "var(--bg-surface-raised)", border: `1px solid ${on ? "rgba(52,211,153,0.35)" : "var(--border-subtle)"}` }}>
                <div className="flex-1"><p className="text-[14px] font-medium" style={{ color: "var(--text-primary)" }}>{e.name}</p><div className="flex items-center gap-2 mt-1 text-[12px]" style={{ color: "var(--text-tertiary)" }}><span>{e.muscleGroup}</span>{e.equipment && <span>· {e.equipment}</span>}{e.bodyweight && <span style={{ color: "var(--color-info)" }}>· peso corporal</span>}</div></div>
                <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: on ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.05)", border: `1.5px solid ${on ? "rgba(52,211,153,0.5)" : "rgba(255,255,255,0.1)"}` }}>{on && <CheckCircle2 size={12} style={{ color: "var(--color-success)" }} />}</span>
              </button>
            );
          })}
        </div>
        <div className="px-6 py-4 shrink-0" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <button onClick={() => onConfirm(catalog.filter((e) => sel.has(e.id)))} disabled={sel.size === 0} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-medium cursor-pointer disabled:opacity-50" style={{ background: "var(--accent-primary)", color: "var(--text-inverse)" }}><Plus size={15} /> Agregar {sel.size > 0 ? `(${sel.size})` : ""}</button>
        </div>
      </div>
    </div>
  );
}
