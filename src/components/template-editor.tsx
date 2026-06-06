"use client";

import { useState } from "react";
import { Plus, Trash2, X, Loader2 } from "lucide-react";

/* ═══════════════════════════════════════════
   Editor de plantillas dinámicas (dieta / rutina)
   Reutilizado por /coach/templates (módulo 4) y por la
   ficha del alumno para "Cambiar/Editar" (módulo 1).
   El caller decide la persistencia vía onSave(data).
   ═══════════════════════════════════════════ */

type Macros = { protein: number; carbs: number; fat: number };
type Meal = { name: string; time: string; calories: number; protein: number; carbs: number; fat: number; items: string[] };
type Exercise = { name: string; sets: number; reps: string; weight?: string; rest?: string };
type RoutineDay = { day: string; label: string; muscleGroup: string; exercises: Exercise[] };

export interface DietData { name: string; totalCalories: number; macros: Macros; meals: Meal[] }
export interface RoutineData { name: string; daysPerWeek: number; days: RoutineDay[] }

const inputStyle = {
  background: "var(--bg-surface-raised)",
  borderColor: "var(--border-subtle)",
  color: "var(--text-primary)",
};
const inputCls =
  "px-3 py-2 rounded-lg text-[13px] outline-none border focus:border-[var(--border-strong)] transition-all duration-150 w-full";
const labelCls = "text-[10px] uppercase tracking-wider font-medium";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={labelCls} style={{ color: "var(--text-secondary)" }}>{label}</label>
      {children}
    </div>
  );
}

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function TemplateEditorModal({
  type,
  initial,
  title,
  saveLabel = "Guardar",
  onClose,
  onSave,
}: {
  type: "diet" | "routine";
  initial?: any;
  title: string;
  saveLabel?: string;
  onClose: () => void;
  onSave: (data: DietData | RoutineData) => Promise<void> | void;
}) {
  const [saving, setSaving] = useState(false);

  // ── Estado dieta ──
  const [diet, setDiet] = useState<DietData>(() =>
    type === "diet"
      ? {
          name: initial?.name ?? "",
          totalCalories: initial?.totalCalories ?? 0,
          macros: initial?.macros ?? { protein: 0, carbs: 0, fat: 0 },
          meals: initial?.meals ?? [],
        }
      : { name: "", totalCalories: 0, macros: { protein: 0, carbs: 0, fat: 0 }, meals: [] }
  );

  // ── Estado rutina ──
  const [routine, setRoutine] = useState<RoutineData>(() =>
    type === "routine"
      ? { name: initial?.name ?? "", daysPerWeek: initial?.daysPerWeek ?? 0, days: initial?.days ?? [] }
      : { name: "", daysPerWeek: 0, days: [] }
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      if (type === "diet") {
        await onSave({ ...diet, meals: diet.meals.map((m) => ({ ...m, items: m.items.filter((i) => i.trim()) })) });
      } else {
        await onSave({ ...routine, daysPerWeek: routine.days.length });
      }
    } finally {
      setSaving(false);
    }
  };

  /* ── Helpers dieta ── */
  const addMeal = () =>
    setDiet((d) => ({ ...d, meals: [...d.meals, { name: "", time: "08:00", calories: 0, protein: 0, carbs: 0, fat: 0, items: [""] }] }));
  const updateMeal = (i: number, patch: Partial<Meal>) =>
    setDiet((d) => ({ ...d, meals: d.meals.map((m, j) => (j === i ? { ...m, ...patch } : m)) }));
  const removeMeal = (i: number) => setDiet((d) => ({ ...d, meals: d.meals.filter((_, j) => j !== i) }));

  /* ── Helpers rutina ── */
  const addDay = () =>
    setRoutine((r) => ({
      ...r,
      days: [...r.days, { day: DAYS[r.days.length % 7], label: "", muscleGroup: "", exercises: [] }],
    }));
  const updateDay = (i: number, patch: Partial<RoutineDay>) =>
    setRoutine((r) => ({ ...r, days: r.days.map((d, j) => (j === i ? { ...d, ...patch } : d)) }));
  const removeDay = (i: number) => setRoutine((r) => ({ ...r, days: r.days.filter((_, j) => j !== i) }));
  const addExercise = (di: number) =>
    updateDay(di, { exercises: [...routine.days[di].exercises, { name: "", sets: 3, reps: "12", weight: "", rest: "60s" }] });
  const updateExercise = (di: number, ei: number, patch: Partial<Exercise>) =>
    updateDay(di, { exercises: routine.days[di].exercises.map((e, j) => (j === ei ? { ...e, ...patch } : e)) });
  const removeExercise = (di: number, ei: number) =>
    updateDay(di, { exercises: routine.days[di].exercises.filter((_, j) => j !== ei) });

  const canSave = type === "diet" ? diet.name.trim().length > 0 : routine.name.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="fixed inset-0 backdrop-blur-sm" style={{ background: "var(--scrim)" }} onClick={onClose} />

      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl z-10 animate-fade-in flex flex-col max-h-[90vh]"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-strong)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <h3 className="text-[15px] font-medium" style={{ color: "var(--text-primary)" }}>{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg cursor-pointer" style={{ color: "var(--text-tertiary)" }} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          {type === "diet" ? (
            <>
              <Field label="Nombre de la dieta">
                <input className={inputCls} style={inputStyle} value={diet.name} onChange={(e) => setDiet({ ...diet, name: e.target.value })} placeholder="Ej. Déficit Calórico (Definición)" />
              </Field>

              <div className="grid grid-cols-4 gap-2">
                <Field label="Kcal"><input type="number" className={inputCls} style={inputStyle} value={diet.totalCalories} onChange={(e) => setDiet({ ...diet, totalCalories: +e.target.value })} /></Field>
                <Field label="Prot (g)"><input type="number" className={inputCls} style={inputStyle} value={diet.macros.protein} onChange={(e) => setDiet({ ...diet, macros: { ...diet.macros, protein: +e.target.value } })} /></Field>
                <Field label="Carb (g)"><input type="number" className={inputCls} style={inputStyle} value={diet.macros.carbs} onChange={(e) => setDiet({ ...diet, macros: { ...diet.macros, carbs: +e.target.value } })} /></Field>
                <Field label="Gra (g)"><input type="number" className={inputCls} style={inputStyle} value={diet.macros.fat} onChange={(e) => setDiet({ ...diet, macros: { ...diet.macros, fat: +e.target.value } })} /></Field>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className={labelCls} style={{ color: "var(--text-secondary)" }}>Comidas ({diet.meals.length})</span>
                <button onClick={addMeal} className="inline-flex items-center gap-1 text-[12px] px-2.5 py-1 rounded-lg cursor-pointer" style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}>
                  <Plus size={13} /> Añadir comida
                </button>
              </div>

              {diet.meals.map((meal, i) => (
                <div key={i} className="rounded-xl p-3 space-y-2" style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)" }}>
                  <div className="flex items-center gap-2">
                    <input className={inputCls} style={inputStyle} placeholder="Nombre (Desayuno)" value={meal.name} onChange={(e) => updateMeal(i, { name: e.target.value })} />
                    <input className="px-3 py-2 rounded-lg text-[13px] outline-none border focus:border-[var(--border-strong)] w-24" style={inputStyle} placeholder="Hora" value={meal.time} onChange={(e) => updateMeal(i, { time: e.target.value })} />
                    <button onClick={() => removeMeal(i)} className="p-2 rounded-lg cursor-pointer shrink-0" style={{ color: "var(--color-danger)" }} aria-label="Eliminar comida"><Trash2 size={15} /></button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <input type="number" className={inputCls} style={inputStyle} placeholder="kcal" value={meal.calories} onChange={(e) => updateMeal(i, { calories: +e.target.value })} />
                    <input type="number" className={inputCls} style={inputStyle} placeholder="P" value={meal.protein} onChange={(e) => updateMeal(i, { protein: +e.target.value })} />
                    <input type="number" className={inputCls} style={inputStyle} placeholder="C" value={meal.carbs} onChange={(e) => updateMeal(i, { carbs: +e.target.value })} />
                    <input type="number" className={inputCls} style={inputStyle} placeholder="G" value={meal.fat} onChange={(e) => updateMeal(i, { fat: +e.target.value })} />
                  </div>
                  <textarea
                    className="px-3 py-2 rounded-lg text-[13px] outline-none border focus:border-[var(--border-strong)] w-full resize-y min-h-[60px]"
                    style={inputStyle}
                    placeholder="Un alimento por línea&#10;Ej: 150g pechuga de pollo"
                    value={meal.items.join("\n")}
                    onChange={(e) => updateMeal(i, { items: e.target.value.split("\n") })}
                  />
                </div>
              ))}
            </>
          ) : (
            <>
              <Field label="Nombre de la rutina">
                <input className={inputCls} style={inputStyle} value={routine.name} onChange={(e) => setRoutine({ ...routine, name: e.target.value })} placeholder="Ej. PPL 5 días" />
              </Field>

              <div className="flex items-center justify-between pt-1">
                <span className={labelCls} style={{ color: "var(--text-secondary)" }}>Días ({routine.days.length})</span>
                <button onClick={addDay} className="inline-flex items-center gap-1 text-[12px] px-2.5 py-1 rounded-lg cursor-pointer" style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}>
                  <Plus size={13} /> Añadir día
                </button>
              </div>

              {routine.days.map((day, di) => (
                <div key={di} className="rounded-xl p-3 space-y-2" style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)" }}>
                  <div className="flex items-center gap-2">
                    <select className="px-3 py-2 rounded-lg text-[13px] outline-none border w-32" style={inputStyle} value={day.day} onChange={(e) => updateDay(di, { day: e.target.value })}>
                      {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input className={inputCls} style={inputStyle} placeholder="Etiqueta (Push)" value={day.label} onChange={(e) => updateDay(di, { label: e.target.value })} />
                    <button onClick={() => removeDay(di)} className="p-2 rounded-lg cursor-pointer shrink-0" style={{ color: "var(--color-danger)" }} aria-label="Eliminar día"><Trash2 size={15} /></button>
                  </div>
                  <input className={inputCls} style={inputStyle} placeholder="Grupo muscular (Pecho · Hombro · Tríceps)" value={day.muscleGroup} onChange={(e) => updateDay(di, { muscleGroup: e.target.value })} />

                  {day.exercises.map((ex, ei) => (
                    <div key={ei} className="flex items-center gap-2">
                      <input className={inputCls} style={inputStyle} placeholder="Ejercicio" value={ex.name} onChange={(e) => updateExercise(di, ei, { name: e.target.value })} />
                      <input type="number" className="px-2 py-2 rounded-lg text-[13px] outline-none border w-14" style={inputStyle} placeholder="Sets" value={ex.sets} onChange={(e) => updateExercise(di, ei, { sets: +e.target.value })} />
                      <input className="px-2 py-2 rounded-lg text-[13px] outline-none border w-16" style={inputStyle} placeholder="Reps" value={ex.reps} onChange={(e) => updateExercise(di, ei, { reps: e.target.value })} />
                      <input className="px-2 py-2 rounded-lg text-[13px] outline-none border w-16" style={inputStyle} placeholder="Peso" value={ex.weight ?? ""} onChange={(e) => updateExercise(di, ei, { weight: e.target.value })} />
                      <button onClick={() => removeExercise(di, ei)} className="p-1.5 rounded-lg cursor-pointer shrink-0" style={{ color: "var(--color-danger)" }} aria-label="Eliminar ejercicio"><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <button onClick={() => addExercise(di)} className="inline-flex items-center gap-1 text-[12px] px-2.5 py-1 rounded-lg cursor-pointer" style={{ border: "1px solid var(--border-default)", color: "var(--text-tertiary)" }}>
                    <Plus size={12} /> Ejercicio
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 shrink-0" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <button onClick={onClose} disabled={saving} className="px-4 py-2.5 rounded-xl text-[12px] font-medium cursor-pointer disabled:opacity-50" style={{ color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving || !canSave} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-medium cursor-pointer transition-opacity hover:opacity-85 disabled:opacity-50" style={{ background: "var(--accent-primary)", color: "var(--text-inverse)" }}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
