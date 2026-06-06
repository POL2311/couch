"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Check, Loader2, Users, SlidersHorizontal, CalendarClock, ArrowLeft, ArrowRight } from "lucide-react";
import { type Student, type Stage } from "@/lib/mock-data";

/* ═══════════════════════════════════════════
   Asistente de Programación Masiva (3 pasos)
   1) Seleccionar alumnos
   2) Configurar etapa + dieta + rutina
   3) Programar fecha y confirmar
   ═══════════════════════════════════════════ */

const STAGES: Stage[] = ["Volumen", "Definición", "Mantenimiento", "Recomposición"];

const STEPS = [
  { n: 1, label: "Alumnos", icon: Users },
  { n: 2, label: "Configuración", icon: SlidersHorizontal },
  { n: 3, label: "Programar", icon: CalendarClock },
];

export default function BulkPeriodizationWizard({
  students,
  onClose,
  onSuccess,
}: {
  students: Student[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [stageFilter, setStageFilter] = useState<Stage | "all">("all");

  const [stage, setStage] = useState<Stage>("Volumen");
  const [stageNumber, setStageNumber] = useState(1);
  const [dietTemplateId, setDietTemplateId] = useState("");
  const [routineTemplateId, setRoutineTemplateId] = useState("");

  const [timing, setTiming] = useState<"immediate" | "scheduled">("scheduled");
  const [executionDate, setExecutionDate] = useState("");

  const [diets, setDiets] = useState<any[]>([]);
  const [routines, setRoutines] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    setExecutionDate(d.toISOString().split("T")[0]);
    Promise.all([
      fetch("/api/templates?type=diet").then((r) => r.json()),
      fetch("/api/templates?type=routine").then((r) => r.json()),
    ]).then(([dd, rr]) => {
      setDiets(Array.isArray(dd) ? dd : []);
      setRoutines(Array.isArray(rr) ? rr : []);
    }).catch(() => {});
  }, []);

  const visibleStudents = useMemo(
    () => (stageFilter === "all" ? students : students.filter((s) => s.stage === stageFilter)),
    [students, stageFilter]
  );

  const toggle = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleAll = () =>
    setSelected((prev) => {
      const ids = visibleStudents.map((s) => s.id);
      const allSel = ids.length > 0 && ids.every((id) => prev.has(id));
      const n = new Set(prev);
      if (allSel) ids.forEach((id) => n.delete(id));
      else ids.forEach((id) => n.add(id));
      return n;
    });

  const dietName = diets.find((d) => d.id === dietTemplateId)?.name;
  const routineName = routines.find((r) => r.id === routineTemplateId)?.name;

  const canNext = step === 1 ? selected.size > 0 : true;

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/students/change-stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds: Array.from(selected),
          stage,
          stageNumber,
          dietTemplateId: dietTemplateId || undefined,
          routineTemplateId: routineTemplateId || undefined,
          executionDate: timing === "scheduled" ? executionDate : undefined,
        }),
      });
      if (!res.ok) throw new Error();
      onSuccess();
      onClose();
    } catch {
      alert("Hubo un error al guardar la programación masiva.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="fixed inset-0 backdrop-blur-sm" style={{ background: "var(--scrim)" }} onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl z-10 animate-fade-in flex flex-col max-h-[90vh]" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-strong)" }}>
        {/* Header + stepper */}
        <div className="px-6 pt-5 pb-4 shrink-0" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-medium" style={{ color: "var(--text-primary)" }}>Programación masiva</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg cursor-pointer" style={{ color: "var(--text-tertiary)" }} aria-label="Cerrar"><X size={18} /></button>
          </div>
          <div className="flex items-center gap-2 mt-4">
            {STEPS.map((s, i) => {
              const active = step === s.n;
              const done = step > s.n;
              return (
                <div key={s.n} className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-semibold" style={{ background: active || done ? "var(--accent-primary)" : "var(--bg-surface-raised)", color: active || done ? "var(--text-inverse)" : "var(--text-tertiary)", border: "1px solid var(--border-subtle)" }}>
                      {done ? <Check size={13} /> : s.n}
                    </div>
                    <span className="text-[11px] truncate" style={{ color: active ? "var(--text-primary)" : "var(--text-tertiary)" }}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto">
          {/* Paso 1 */}
          {step === 1 && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {(["all", ...STAGES] as const).map((f) => (
                  <button key={f} onClick={() => setStageFilter(f)} className="px-3 py-1.5 rounded-lg text-[12px] whitespace-nowrap cursor-pointer" style={{ background: stageFilter === f ? "var(--bg-surface-overlay)" : "var(--bg-surface-raised)", color: stageFilter === f ? "var(--text-primary)" : "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
                    {f === "all" ? "Todos" : f}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{selected.size} seleccionado(s)</span>
                <button onClick={toggleAll} className="text-[11px] cursor-pointer" style={{ color: "var(--text-secondary)" }}>Seleccionar visibles</button>
              </div>

              <div className="rounded-xl overflow-hidden max-h-[320px] overflow-y-auto" style={{ border: "1px solid var(--border-subtle)" }}>
                {visibleStudents.map((s) => {
                  const sel = selected.has(s.id);
                  return (
                    <button key={s.id} onClick={() => toggle(s.id)} className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer text-left transition-colors" style={{ borderBottom: "1px solid var(--border-subtle)", background: sel ? "var(--bg-surface-overlay)" : "transparent" }}>
                      <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: sel ? "var(--accent-primary)" : "transparent", border: `1px solid ${sel ? "var(--accent-primary)" : "var(--border-default)"}` }}>
                        {sel && <Check size={13} style={{ color: "var(--text-inverse)" }} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] truncate" style={{ color: "var(--text-primary)" }}>{s.name}</p>
                        <p className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>{s.stage} · E{s.stageNumber}</p>
                      </div>
                    </button>
                  );
                })}
                {visibleStudents.length === 0 && <p className="text-[12px] py-6 text-center" style={{ color: "var(--text-tertiary)" }}>Sin alumnos en este filtro.</p>}
              </div>
            </div>
          )}

          {/* Paso 2 */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nueva etapa">
                  <select value={stage} onChange={(e) => setStage(e.target.value as Stage)} className={selectCls} style={ctrlStyle}>
                    {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Número de etapa">
                  <input type="number" min={1} value={stageNumber} onChange={(e) => setStageNumber(parseInt(e.target.value) || 1)} className={selectCls} style={ctrlStyle} />
                </Field>
              </div>
              <Field label="Plantilla de dieta (opcional)">
                <select value={dietTemplateId} onChange={(e) => setDietTemplateId(e.target.value)} className={selectCls} style={ctrlStyle}>
                  <option value="">Sin cambios</option>
                  {diets.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </Field>
              <Field label="Plantilla de rutina (opcional)">
                <select value={routineTemplateId} onChange={(e) => setRoutineTemplateId(e.target.value)} className={selectCls} style={ctrlStyle}>
                  <option value="">Sin cambios</option>
                  {routines.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </Field>
            </div>
          )}

          {/* Paso 3 */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <Field label="¿Cuándo aplicar?">
                <div className="grid grid-cols-2 gap-2">
                  {(["immediate", "scheduled"] as const).map((t) => (
                    <button key={t} onClick={() => setTiming(t)} className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer text-[12px] font-medium" style={{ background: timing === t ? "var(--bg-surface-overlay)" : "var(--bg-surface-raised)", borderColor: timing === t ? "var(--text-primary)" : "var(--border-subtle)", color: "var(--text-primary)" }}>
                      <span className="w-3.5 h-3.5 rounded-full border flex items-center justify-center" style={{ borderColor: timing === t ? "var(--text-primary)" : "var(--border-default)" }}>
                        {timing === t && <span className="w-2 h-2 rounded-full" style={{ background: "var(--text-primary)" }} />}
                      </span>
                      {t === "immediate" ? "Inmediato" : "Programar"}
                    </button>
                  ))}
                </div>
              </Field>
              {timing === "scheduled" && (
                <Field label="Fecha de ejecución">
                  <input type="date" value={executionDate} onChange={(e) => setExecutionDate(e.target.value)} className={selectCls} style={ctrlStyle} />
                </Field>
              )}

              {/* Resumen */}
              <div className="rounded-xl p-4 space-y-2 text-[12px]" style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)" }}>
                <SummaryRow label="Alumnos" value={`${selected.size}`} />
                <SummaryRow label="Etapa" value={`${stage} · E${stageNumber}`} />
                <SummaryRow label="Dieta" value={dietName || "Sin cambios"} />
                <SummaryRow label="Rutina" value={routineName || "Sin cambios"} />
                <SummaryRow label="Ejecución" value={timing === "immediate" ? "Inmediata" : new Date(executionDate + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <button
            onClick={() => (step === 1 ? onClose() : setStep(step - 1))}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-medium cursor-pointer"
            style={{ color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
          >
            {step === 1 ? "Cancelar" : <><ArrowLeft size={14} /> Atrás</>}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-medium cursor-pointer transition-opacity hover:opacity-85 disabled:opacity-50"
              style={{ background: "var(--accent-primary)", color: "var(--text-inverse)" }}
            >
              Siguiente <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting || selected.size === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-medium cursor-pointer transition-opacity hover:opacity-85 disabled:opacity-50"
              style={{ background: "var(--accent-primary)", color: "var(--text-inverse)" }}
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : timing === "scheduled" ? "Programar para todos" : "Aplicar a todos"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const ctrlStyle = { background: "var(--bg-surface-raised)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" };
const selectCls = "px-3.5 py-2.5 rounded-lg text-[13px] outline-none border focus:border-[var(--border-strong)] cursor-pointer w-full";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--text-secondary)" }}>{label}</label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ color: "var(--text-tertiary)" }}>{label}</span>
      <span className="font-medium text-right" style={{ color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}
