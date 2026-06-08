"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Flame, Zap, Clock, Search, X, SearchX, Trash2, Loader2 } from "lucide-react";
import { type DietTemplate, type RoutineTemplate } from "@/lib/templates";
import { DetailOverlay } from "@/components/detail-overlay";
import { EmptyState } from "@/components/empty-state";
import { PageHeader, AddButton } from "@/components/page-header";
import TemplateEditorModal from "@/components/template-editor";

/* ── Helpers ── */
const STAGE_WORDS = ["Volumen", "Definición", "Mantenimiento", "Recomposición"];
function dietGoal(name: string) {
  return STAGE_WORDS.find((w) => name.includes(w)) ?? null;
}
function totalExercises(routine: RoutineTemplate) {
  return routine.days.reduce((acc, d) => acc + d.exercises.length, 0);
}

function KcalChip({ kcal }: { kcal: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold tabular-nums border border-[var(--border-subtle)] px-2.5 py-0.5 rounded-full shrink-0" style={{ background: "var(--bg-surface-raised)", color: "var(--text-secondary)" }}>
      <Flame size={14} strokeWidth={1.75} style={{ color: "var(--text-secondary)" }} />
      {kcal} kcal
    </span>
  );
}

function DaysChip({ days }: { days: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold tabular-nums border border-[var(--border-subtle)] px-2.5 py-0.5 rounded-full shrink-0" style={{ background: "var(--bg-surface-raised)", color: "var(--text-secondary)" }}>
      <Zap size={14} strokeWidth={1.75} style={{ color: "var(--text-secondary)" }} />
      {days} días
    </span>
  );
}

function MacrosBar({ macros, totalCalories }: { macros: { protein: number; carbs: number; fat: number }; totalCalories: number }) {
  const total = totalCalories || 1;
  return (
    <div>
      <div className="flex justify-between text-[11px] font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
        <span>P: {macros.protein}g</span>
        <span>C: {macros.carbs}g</span>
        <span>G: {macros.fat}g</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden flex" style={{ background: "var(--bg-surface-overlay)" }}>
        <div style={{ width: `${(macros.protein * 4 / total) * 100}%`, background: "var(--color-success)" }} title="Proteína" />
        <div style={{ width: `${(macros.carbs * 4 / total) * 100}%`, background: "var(--color-info)" }} title="Carbos" />
        <div style={{ width: `${(macros.fat * 9 / total) * 100}%`, background: "var(--color-warning)" }} title="Grasa" />
      </div>
    </div>
  );
}

function DetailClose({ onClose }: { onClose: () => void }) {
  return (
    <button onClick={onClose} aria-label="Cerrar" className="absolute -top-1 right-0 p-2 rounded-full transition-colors cursor-pointer hover:bg-[color:var(--bg-hover)]" style={{ color: "var(--text-tertiary)" }}>
      <X size={18} strokeWidth={1.75} />
    </button>
  );
}

function DetailActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="mt-5 flex gap-2">
      <button
        onClick={onEdit}
        className="flex-1 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer transition-opacity hover:opacity-85"
        style={{ background: "var(--accent-primary)", color: "var(--text-inverse)" }}
      >
        Editar plantilla
      </button>
      <button
        onClick={onDelete}
        aria-label="Eliminar plantilla"
        className="px-3 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer transition-colors hover:bg-[color:var(--color-danger-subtle)]"
        style={{ border: "1px solid var(--border-subtle)", color: "var(--color-danger)" }}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

/* ── Detalle: dieta ── */
function DietDetailBody({ diet, onClose, onEdit, onDelete }: { diet: DietTemplate; onClose: () => void; onEdit: () => void; onDelete: () => void }) {
  const goal = dietGoal(diet.name);
  return (
    <div className="relative">
      <DetailClose onClose={onClose} />
      <h3 className="text-[15px] font-semibold pr-10" style={{ color: "var(--text-primary)" }}>{diet.name}</h3>
      <div className="flex items-center gap-2 mt-2">
        <KcalChip kcal={diet.totalCalories} />
        {goal && <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{goal}</span>}
      </div>

      <div className="mt-4">
        <MacrosBar macros={diet.macros} totalCalories={diet.totalCalories} />
      </div>

      <p className="text-[10px] uppercase tracking-[0.08em] font-semibold mt-5 mb-2" style={{ color: "var(--text-tertiary)" }}>
        Comidas ({diet.meals.length})
      </p>
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
        {diet.meals.map((meal, i) => (
          <div key={i} className="px-4 py-3" style={{ borderBottom: i === diet.meals.length - 1 ? "none" : "1px solid var(--border-subtle)" }}>
            <div className="flex items-center justify-between gap-2">
              <strong className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>{meal.name}</strong>
              <span className="inline-flex items-center gap-1 text-[11px] tabular-nums shrink-0" style={{ color: "var(--text-tertiary)" }}>
                <Clock size={12} strokeWidth={1.75} />{meal.time} · {meal.calories} kcal
              </span>
            </div>
            <ul className="mt-1.5 space-y-0.5">
              {meal.items.map((it, j) => (
                <li key={j} className="flex items-start gap-1.5 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                  <span className="inline-block rounded-full shrink-0 mt-1.5" style={{ width: 3, height: 3, background: "currentColor" }} />
                  {it}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <DetailActions onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

/* ── Detalle: rutina ── */
function RoutineDetailBody({ routine, onClose, onEdit, onDelete }: { routine: RoutineTemplate; onClose: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="relative">
      <DetailClose onClose={onClose} />
      <h3 className="text-[15px] font-semibold pr-10" style={{ color: "var(--text-primary)" }}>{routine.name}</h3>
      <div className="flex items-center gap-2 mt-2">
        <DaysChip days={routine.daysPerWeek} />
        <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{totalExercises(routine)} ejercicios</span>
      </div>

      <p className="text-[10px] uppercase tracking-[0.08em] font-semibold mt-5 mb-2" style={{ color: "var(--text-tertiary)" }}>Estructura semanal</p>
      <div className="space-y-3">
        {routine.days.map((day, i) => (
          <div key={i} className="p-3 rounded-xl text-[12px]" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
            <div className="flex justify-between font-semibold" style={{ color: "var(--text-primary)" }}>
              <span>{day.day} · {day.label}</span>
              <span className="text-[10px] font-normal" style={{ color: "var(--text-tertiary)" }}>{day.exercises.length} ejercicios</span>
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
              Grupo muscular: <span className="font-medium">{day.muscleGroup}</span>
            </p>
            <ul className="mt-2 space-y-0.5">
              {day.exercises.map((ex, j) => (
                <li key={j} className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  <span className="inline-block rounded-full shrink-0" style={{ width: 3, height: 3, background: "currentColor" }} />
                  {ex.name} ({ex.sets}x{ex.reps})
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <DetailActions onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState<"diets" | "routines">("diets");
  const [search, setSearch] = useState("");
  const [diets, setDiets] = useState<DietTemplate[]>([]);
  const [routines, setRoutines] = useState<RoutineTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDiet, setSelectedDiet] = useState<DietTemplate | null>(null);
  const [selectedRoutine, setSelectedRoutine] = useState<RoutineTemplate | null>(null);

  // Editor: { mode: "create"|"edit", type, initial? }
  const [editor, setEditor] = useState<{ type: "diet" | "routine"; initial?: any; id?: string } | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      const [d, r] = await Promise.all([
        fetch("/api/templates?type=diet").then((res) => res.json()),
        fetch("/api/templates?type=routine").then((res) => res.json()),
      ]);
      setDiets(Array.isArray(d) ? d : []);
      setRoutines(Array.isArray(r) ? r : []);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const q = search.trim().toLowerCase();
  const filteredDiets = useMemo(() => diets.filter((d) => d.name.toLowerCase().includes(q)), [q, diets]);
  const filteredRoutines = useMemo(() => routines.filter((r) => r.name.toLowerCase().includes(q)), [q, routines]);

  /* ── Tab activo en la URL ── */
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tipo");
    if (t === "entrenamiento") setActiveTab("routines");
    else if (t === "alimentacion") setActiveTab("diets");
  }, []);

  const firstWrite = useRef(true);
  useEffect(() => {
    if (firstWrite.current) { firstWrite.current = false; return; }
    const sp = new URLSearchParams(window.location.search);
    if (activeTab === "routines") sp.set("tipo", "entrenamiento");
    else sp.delete("tipo");
    const qs = sp.toString();
    window.history.replaceState(null, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, [activeTab]);

  /* ── Persistencia ── */
  const saveTemplate = async (data: any) => {
    if (!editor) return;
    if (editor.id) {
      await fetch(`/api/templates/${editor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data }),
      });
    } else {
      await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: editor.type, ...data }),
      });
    }
    setEditor(null);
    setSelectedDiet(null);
    setSelectedRoutine(null);
    await fetchTemplates();
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("¿Eliminar esta plantilla? Esta acción no se puede deshacer.")) return;
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    setSelectedDiet(null);
    setSelectedRoutine(null);
    await fetchTemplates();
  };

  return (
    <>
      <PageHeader
        title="Plantillas"
        hint="Crea y edita los planes globales de nutrición y entrenamiento para tus alumnos."
        cta={<AddButton label="Nueva plantilla" onClick={() => setEditor({ type: activeTab === "diets" ? "diet" : "routine" })} />}
      />

      <div className="flex-1 px-4 md:px-8 py-6 overflow-y-auto pb-24 md:pb-8">
        {/* Controles */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 min-w-0 mb-6">
          <div className="grid grid-cols-2 md:inline-flex w-full md:w-auto rounded-xl shrink-0" style={{ background: "rgba(255, 255, 255, 0.05)", height: 36, padding: 2 }}>
            {([["diets", "Alimentación"], ["routines", "Entrenamiento"]] as const).map(([key, label]) => {
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  aria-pressed={active}
                  className="px-4 text-[13px] font-medium rounded-[10px] cursor-pointer whitespace-nowrap flex items-center justify-center transition-all duration-200 md:min-w-[120px]"
                  style={{ background: active ? "rgba(255, 255, 255, 0.10)" : "transparent", color: active ? "var(--text-primary)" : "var(--text-secondary)", boxShadow: active ? "0 1px 2px rgba(0, 0, 0, 0.3)" : "none" }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="relative md:ml-auto w-full md:w-auto">
            <Search size={14} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-tertiary)" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar plantilla..."
              className="pl-9 pr-3 py-2 rounded-xl text-[13px] w-full md:w-[280px] outline-none"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20" style={{ color: "var(--text-tertiary)" }}>
            <Loader2 size={20} className="animate-spin" />
          </div>
        ) : activeTab === "diets" ? (
          filteredDiets.length === 0 ? (
            <EmptyState icon={SearchX} message="Sin plantillas de dieta" hint="Crea una nueva plantilla con el botón superior." className="py-16" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
              {filteredDiets.map((diet) => {
                const goal = dietGoal(diet.name);
                return (
                  <button key={diet.id} onClick={() => setSelectedDiet(diet)} className="text-left rounded-xl border p-4 flex flex-col gap-3 cursor-pointer transition-colors hover:border-[color:var(--border-strong)]" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[13px] font-semibold leading-snug flex-1 min-w-0" style={{ color: "var(--text-primary)" }}>{diet.name}</h3>
                      <KcalChip kcal={diet.totalCalories} />
                    </div>
                    <MacrosBar macros={diet.macros} totalCalories={diet.totalCalories} />
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{diet.meals.length} comidas{goal ? ` · ${goal}` : ""}</p>
                  </button>
                );
              })}
            </div>
          )
        ) : filteredRoutines.length === 0 ? (
          <EmptyState icon={SearchX} message="Sin plantillas de rutina" hint="Crea una nueva plantilla con el botón superior." className="py-16" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {filteredRoutines.map((routine) => (
              <button key={routine.id} onClick={() => setSelectedRoutine(routine)} className="text-left rounded-xl border p-4 flex flex-col gap-3 cursor-pointer transition-colors hover:border-[color:var(--border-strong)]" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[13px] font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>{routine.name}</h3>
                  <DaysChip days={routine.daysPerWeek} />
                </div>
                <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{routine.daysPerWeek} días · {totalExercises(routine)} ejercicios</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detalle */}
      {selectedDiet && (
        <DetailOverlay onClose={() => setSelectedDiet(null)} desktop="panel" ariaLabel={`Plantilla ${selectedDiet.name}`}>
          <DietDetailBody
            diet={selectedDiet}
            onClose={() => setSelectedDiet(null)}
            onEdit={() => setEditor({ type: "diet", initial: selectedDiet, id: selectedDiet.id })}
            onDelete={() => deleteTemplate(selectedDiet.id)}
          />
        </DetailOverlay>
      )}
      {selectedRoutine && (
        <DetailOverlay onClose={() => setSelectedRoutine(null)} desktop="panel" ariaLabel={`Plantilla ${selectedRoutine.name}`}>
          <RoutineDetailBody
            routine={selectedRoutine}
            onClose={() => setSelectedRoutine(null)}
            onEdit={() => setEditor({ type: "routine", initial: selectedRoutine, id: selectedRoutine.id })}
            onDelete={() => deleteTemplate(selectedRoutine.id)}
          />
        </DetailOverlay>
      )}

      {/* Editor */}
      {editor && (
        <TemplateEditorModal
          type={editor.type}
          initial={editor.initial}
          title={editor.id ? "Editar plantilla" : editor.type === "diet" ? "Nueva plantilla de dieta" : "Nueva plantilla de rutina"}
          saveLabel={editor.id ? "Guardar cambios" : "Crear plantilla"}
          onClose={() => setEditor(null)}
          onSave={saveTemplate}
        />
      )}
    </>
  );
}
