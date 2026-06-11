"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Search, Plus, X, Loader2, Flame, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Upload, RefreshCw, FileSpreadsheet, FileArchive, CheckCircle2, AlertTriangle, Info, Download } from "lucide-react";
import type { ImportResult, ImportWarning } from "@/app/api/coach/import/route";
import { type Student } from "@/lib/mock-data";
import { PageHeader } from "@/components/page-header";

/* ── Design tokens ── */
const T = {
  bg:      "#000000",
  surface: "#121212",
  raised:  "#1c1c1e",
  border:  "rgba(255,255,255,0.08)",
  divider: "rgba(255,255,255,0.05)",
  p:       "#f4f4f5",
  s:       "#a1a1aa",
  t:       "#52525b",
  success: "#34d399",
  warning: "#fbbf24",
  danger:  "#f87171",
  info:    "#60a5fa",
};

const STAGES = ["Volumen", "Definición", "Mantenimiento", "Recomposición"];

const STAGE_COLORS: Record<string, { text: string; bg: string }> = {
  Volumen:          { text: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  "Definición":     { text: "#2dd4bf", bg: "rgba(45,212,191,0.12)"  },
  Mantenimiento:    { text: "#facc15", bg: "rgba(250,204,21,0.12)"  },
  "Recomposición":  { text: "#f472b6", bg: "rgba(244,114,182,0.12)" },
};

const PAYMENT: Record<string, { label: string; color: string }> = {
  active:       { label: "Al día",     color: "#34d399" },
  grace_period: { label: "Pendiente",  color: "#fbbf24" },
  past_due:     { label: "Vencido",    color: "#fbbf24" },
  inactive:     { label: "Suspendido", color: "#f87171" },
};

const avatarBg = (c?: string) => {
  if (c) { const m = c.match(/#[0-9a-fA-F]{3,8}/); if (m) return m[0]; if (c.startsWith("rgb")) return c; }
  return "#3b82f6";
};

type Filter = "all" | "active" | "attention" | "inactive";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all",       label: "Todos"       },
  { id: "active",    label: "Al día"      },
  { id: "attention", label: "Pendientes"  },
  { id: "inactive",  label: "Suspendidos" },
];
function matchesFilter(s: Student, f: Filter) {
  if (f === "all")       return true;
  // isActive drives the badge, so the filter must match what the badge shows.
  if (f === "inactive")  return s.isActive === false;
  if (f === "active")    return s.isActive !== false && s.paymentStatus === "active";
  if (f === "attention") return s.isActive !== false && (s.paymentStatus === "grace_period" || s.paymentStatus === "past_due");
  return true;
}

type SortKey = "name" | "weight" | "completionRate" | "streak";
type SortDir = "asc" | "desc";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<Filter>("all");
  const [query, setQuery]       = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [syncOpen, setSyncOpen]     = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey]   = useState<SortKey>("name");
  const [sortDir, setSortDir]   = useState<SortDir>("asc");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/students");
      const d = await r.json();
      setStudents(Array.isArray(d) ? d : []);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const list = useMemo(() => {
    const filtered = students.filter(
      (s) => matchesFilter(s, filter) && s.name.toLowerCase().includes(query.toLowerCase())
    );
    return [...filtered].sort((a, b) => {
      let av: string | number = 0, bv: string | number = 0;
      if (sortKey === "name")           { av = a.name;           bv = b.name; }
      if (sortKey === "weight")         { av = a.currentWeight;  bv = b.currentWeight; }
      if (sortKey === "completionRate") { av = a.completionRate; bv = b.completionRate; }
      if (sortKey === "streak")         { av = a.streak;         bv = b.streak; }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ?  1 : -1;
      return 0;
    });
  }, [students, filter, query, sortKey, sortDir]);

  const allChecked  = list.length > 0 && list.every((s) => selected.has(s.id));
  const someChecked = list.some((s) => selected.has(s.id)) && !allChecked;

  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(list.map((s) => s.id)));
  const toggleOne = (id: string) =>
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const cycleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey !== k ? null : sortDir === "asc"
      ? <ChevronUp size={10} className="inline ml-0.5" />
      : <ChevronDown size={10} className="inline ml-0.5" />;

  return (
    <>
      <PageHeader
        title="Alumnos"
        hint={`${students.length} en total`}
        cta={
          <div className="flex items-center gap-2">
            <button onClick={() => setSyncOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-medium cursor-pointer"
              style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.s }}>
              <RefreshCw size={14} /> Sincronizar
            </button>
            <button onClick={() => setWizardOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium cursor-pointer"
              style={{ background: T.info, color: "#000" }}>
              <Plus size={15} /> Nuevo
            </button>
          </div>
        }
      />

      <div className="flex-1 px-4 md:px-8 py-6 overflow-y-auto pb-24 md:pb-8">

        {/* ── Search + filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex items-center flex-1 px-3.5 rounded-xl"
            style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <Search size={14} style={{ color: T.t }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar alumno…"
              className="flex-1 py-2.5 px-2 text-[13px] bg-transparent outline-none"
              style={{ color: T.p }} />
            {query && (
              <button onClick={() => setQuery("")} className="cursor-pointer">
                <X size={13} style={{ color: T.t }} />
              </button>
            )}
          </div>
          <div className="flex gap-1.5 overflow-x-auto shrink-0">
            {FILTERS.map((f) => {
              const a = filter === f.id;
              return (
                <button key={f.id} onClick={() => setFilter(f.id)}
                  className="px-3.5 py-2 rounded-xl text-[12px] font-medium whitespace-nowrap cursor-pointer transition-colors"
                  style={{
                    background: a ? T.p : T.surface,
                    border: `1px solid ${a ? T.p : T.border}`,
                    color: a ? T.bg : T.s,
                  }}>
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin" style={{ color: T.s }} />
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <p className="text-[14px] font-medium" style={{ color: T.s }}>Sin resultados</p>
            <p className="text-[12px]" style={{ color: T.t }}>
              {query ? `No hay alumnos que coincidan con "${query}"` : "No hay alumnos en esta categoría"}
            </p>
          </div>
        ) : (
          <div className="w-full rounded-xl overflow-hidden"
            style={{ border: `1px solid ${T.border}`, boxShadow: "0 2px 16px rgba(0,0,0,0.6)" }}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ background: T.bg }}>
                {/* THEAD */}
                <thead>
                  <tr style={{ background: T.surface, borderBottom: `1px solid ${T.border}` }}>
                    <th className="w-10 pl-4 pr-2 py-3">
                      <input type="checkbox" checked={allChecked}
                        ref={(el) => { if (el) el.indeterminate = someChecked; }}
                        onChange={toggleAll}
                        className="w-3.5 h-3.5 rounded cursor-pointer accent-sky-400" />
                    </th>
                    <th className="text-left px-4 py-3">
                      <button onClick={() => cycleSort("name")}
                        className="text-[10px] font-semibold tracking-widest uppercase cursor-pointer"
                        style={{ color: T.t }}>
                        Nombre <SortIcon k="name" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 min-w-[120px]">
                      <button onClick={() => cycleSort("weight")}
                        className="text-[10px] font-semibold tracking-widest uppercase cursor-pointer"
                        style={{ color: T.t }}>
                        Peso <SortIcon k="weight" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 min-w-[130px]">
                      <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: T.t }}>
                        Etapa
                      </span>
                    </th>
                    <th className="text-left px-4 py-3 min-w-[120px]">
                      <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: T.t }}>
                        Estado
                      </span>
                    </th>
                    <th className="text-left px-4 py-3 min-w-[180px]">
                      <button onClick={() => cycleSort("completionRate")}
                        className="text-[10px] font-semibold tracking-widest uppercase cursor-pointer"
                        style={{ color: T.t }}>
                        Adherencia <SortIcon k="completionRate" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 w-[90px]">
                      <button onClick={() => cycleSort("streak")}
                        className="text-[10px] font-semibold tracking-widest uppercase cursor-pointer"
                        style={{ color: T.t }}>
                        Racha <SortIcon k="streak" />
                      </button>
                    </th>
                  </tr>
                </thead>
                {/* TBODY */}
                <tbody>
                  {list.map((s, idx) => {
                    // isActive is the authoritative access flag; paymentStatus is billing-only.
                    const pay        = s.isActive === false
                      ? { label: "Suspendido", color: "#f87171" }
                      : { label: "Activo",     color: "#34d399" };
                    const stageStyle = STAGE_COLORS[s.stage] ?? { text: T.t, bg: "rgba(255,255,255,0.06)" };
                    const delta      = Math.round((s.currentWeight - s.previousWeight) * 10) / 10;
                    const deltaColor = delta < 0 ? T.success : delta > 0 ? T.danger : T.t;
                    const adherence  = Math.min(Math.max(s.completionRate ?? 0, 0), 100);
                    const isSelected = selected.has(s.id);
                    const isLast     = idx === list.length - 1;
                    return (
                      <tr key={s.id}
                        className="transition-colors duration-100"
                        style={{
                          borderBottom: isLast ? "none" : `1px solid ${T.divider}`,
                          background: isSelected ? "rgba(96,165,250,0.05)" : "transparent",
                        }}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = T.surface; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = isSelected ? "rgba(96,165,250,0.05)" : "transparent"; }}>

                        {/* Checkbox */}
                        <td className="pl-4 pr-2 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={isSelected} onChange={() => toggleOne(s.id)}
                            className="w-3.5 h-3.5 rounded cursor-pointer accent-sky-400" />
                        </td>

                        {/* Nombre */}
                        <td className="px-4 py-3.5">
                          <Link href={`/coach/students/${s.id}`} className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold text-white"
                              style={{ background: avatarBg(s.avatarColor) }}>
                              {s.avatarInitials}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold truncate" style={{ color: T.p }}>{s.name}</p>
                              <p className="text-[11px] truncate mt-0.5" style={{ color: T.t }}>{s.email}</p>
                            </div>
                          </Link>
                        </td>

                        {/* Peso */}
                        <td className="px-4 py-3.5">
                          <Link href={`/coach/students/${s.id}`} className="block">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-[14px] font-bold tabular-nums" style={{ color: T.p }}>{s.currentWeight}</span>
                              <span className="text-[10px]" style={{ color: T.t }}>kg</span>
                              {delta !== 0 && (
                                <span className="text-[11px] font-semibold tabular-nums" style={{ color: deltaColor }}>
                                  {delta > 0 ? "+" : ""}{delta}
                                </span>
                              )}
                            </div>
                            {s.lastWeighIn && <p className="text-[10px] mt-0.5" style={{ color: T.t }}>{s.lastWeighIn}</p>}
                          </Link>
                        </td>

                        {/* Etapa */}
                        <td className="px-4 py-3.5">
                          <Link href={`/coach/students/${s.id}`} className="block">
                            <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap"
                              style={{ background: stageStyle.bg, color: stageStyle.text }}>
                              {s.stage}
                            </span>
                          </Link>
                        </td>

                        {/* Estado */}
                        <td className="px-4 py-3.5">
                          <Link href={`/coach/students/${s.id}`} className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full shrink-0"
                              style={{ background: pay.color, boxShadow: `0 0 5px ${pay.color}70` }} />
                            <span className="text-[12px] font-medium" style={{ color: pay.color }}>{pay.label}</span>
                          </Link>
                        </td>

                        {/* Adherencia */}
                        <td className="px-4 py-3.5">
                          <Link href={`/coach/students/${s.id}`} className="block">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                                style={{ background: "rgba(255,255,255,0.07)", minWidth: 72, maxWidth: 110 }}>
                                <div className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${adherence}%`,
                                    background: adherence >= 80 ? T.success : adherence >= 50 ? T.warning : T.danger,
                                  }} />
                              </div>
                              <span className="text-[11px] font-semibold tabular-nums shrink-0"
                                style={{ color: adherence >= 80 ? T.success : adherence >= 50 ? T.warning : T.danger }}>
                                {adherence}%
                              </span>
                            </div>
                          </Link>
                        </td>

                        {/* Racha */}
                        <td className="px-4 py-3.5">
                          <Link href={`/coach/students/${s.id}`} className="flex items-center gap-1">
                            <Flame size={13} style={{ color: s.streak > 0 ? T.warning : T.t }} />
                            <span className="text-[12px] font-semibold tabular-nums"
                              style={{ color: s.streak > 0 ? T.p : T.t }}>
                              {s.streak}
                            </span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="flex items-center justify-between px-5 py-2.5"
              style={{ borderTop: `1px solid ${T.border}`, background: T.surface }}>
              <p className="text-[11px]" style={{ color: T.t }}>
                {selected.size > 0
                  ? `${selected.size} seleccionado${selected.size > 1 ? "s" : ""}`
                  : `${list.length} alumno${list.length !== 1 ? "s" : ""}`}
              </p>
              {selected.size > 0 && (
                <button onClick={() => setSelected(new Set())}
                  className="text-[11px] cursor-pointer" style={{ color: T.info }}>
                  Limpiar selección
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {wizardOpen && (
        <WizardModal onClose={() => setWizardOpen(false)} onCreated={() => { setWizardOpen(false); load(); }} />
      )}
      {syncOpen && (
        <SyncModal onClose={() => setSyncOpen(false)} onImported={() => { setSyncOpen(false); load(); }} />
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   4-STEP WIZARD MODAL
══════════════════════════════════════════════════════════════ */
interface WizardForm {
  name: string; email: string; stage: string; stageNumber: string;
  startingWeight: string; height: string; bodyFat: string;
  chest: string; waist: string; hips: string;
  photo: File | null;
}

const STEP_LABELS = ["Registro", "Físico", "Medidas", "Fotos"];

function WizardModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [step, setStep]     = useState(1);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState<WizardForm>({
    name: "", email: "", stage: "Volumen", stageNumber: "1",
    startingWeight: "", height: "", bodyFat: "",
    chest: "", waist: "", hips: "",
    photo: null,
  });

  const set = <K extends keyof WizardForm>(k: K, v: WizardForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const canAdvance = step === 1
    ? form.name.trim() !== "" && form.email.trim() !== ""
    : true;

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim()) { alert("Nombre y correo son obligatorios."); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name",           form.name.trim());
      fd.append("email",          form.email.trim());
      fd.append("stage",          form.stage);
      fd.append("stageNumber",    form.stageNumber || "1");
      fd.append("startingWeight", form.startingWeight || "0");
      fd.append("height",         form.height || "0");
      if (form.bodyFat)  fd.append("bodyFat",  form.bodyFat);
      if (form.chest)    fd.append("chest",    form.chest);
      if (form.waist)    fd.append("waist",    form.waist);
      if (form.hips)     fd.append("hips",     form.hips);
      if (form.photo)    fd.append("photo",    form.photo);
      await fetch("/api/students", { method: "POST", body: fd });
      onCreated();
    } finally { setSaving(false); }
  };

  const iS = { background: T.raised, border: `1px solid ${T.border}`, color: T.p } as const;
  const iC = "w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none";
  const lC = "text-[10px] uppercase tracking-wider font-medium block mb-1.5";
  const lS = { color: T.s } as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.78)" }} />
      <div className="relative w-full max-w-md rounded-2xl z-10 flex flex-col"
        style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: "0 24px 64px rgba(0,0,0,0.85)", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}>

        {/* ── Header with step progress ── */}
        <div className="px-6 pt-5 pb-4" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[16px] font-semibold" style={{ color: T.p }}>Nuevo alumno</h3>
              <p className="text-[11px] mt-0.5" style={{ color: T.t }}>Paso {step} de 4 · {STEP_LABELS[step - 1]}</p>
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer"
              style={{ background: T.raised }}>
              <X size={14} style={{ color: T.s }} />
            </button>
          </div>
          {/* Progress track */}
          <div className="flex gap-1.5">
            {STEP_LABELS.map((_, i) => {
              const n = i + 1;
              return (
                <div key={n} className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: T.raised }}>
                  <div className="h-full rounded-full transition-all duration-400"
                    style={{
                      width: n < step ? "100%" : n === step ? "60%" : "0%",
                      background: n < step ? T.success : T.info,
                    }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Step body ── */}
        <div className="px-6 py-5 space-y-3.5 overflow-y-auto flex-1 min-h-0">

          {/* STEP 1 — Registro */}
          {step === 1 && (
            <>
              <div>
                <label className={lC} style={lS}>Nombre completo *</label>
                <input value={form.name} onChange={(e) => set("name", e.target.value)}
                  placeholder="Ej. Ana García" className={iC} style={iS} autoFocus />
              </div>
              <div>
                <label className={lC} style={lS}>Correo electrónico *</label>
                <input value={form.email} onChange={(e) => set("email", e.target.value)}
                  type="email" placeholder="ana@correo.com" className={iC} style={iS} />
              </div>
              <div>
                <label className={lC} style={lS}>Etapa de entrenamiento</label>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map((st) => {
                    const c = STAGE_COLORS[st];
                    const a = form.stage === st;
                    return (
                      <button key={st}
                        onClick={() => { set("stage", st); set("stageNumber", String(STAGES.indexOf(st) + 1)); }}
                        className="flex-1 px-3 py-2 rounded-xl text-[12px] font-medium cursor-pointer transition-colors"
                        style={{
                          background: a ? c.bg : T.raised,
                          border: `1px solid ${a ? c.text + "60" : T.border}`,
                          color: a ? c.text : T.s,
                        }}>
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className={lC} style={lS}>Semana de etapa (número)</label>
                <input value={form.stageNumber} onChange={(e) => set("stageNumber", e.target.value)}
                  type="number" min="1" max="52" placeholder="1" className={iC} style={iS} />
              </div>
            </>
          )}

          {/* STEP 2 — Físico */}
          {step === 2 && (
            <>
              <div className="rounded-xl px-4 py-3" style={{ background: T.raised }}>
                <p className="text-[12px]" style={{ color: T.s }}>Datos físicos iniciales. Formarán la línea base de progreso del alumno.</p>
              </div>
              <div>
                <label className={lC} style={lS}>Peso inicial (kg)</label>
                <input value={form.startingWeight} onChange={(e) => set("startingWeight", e.target.value)}
                  type="number" step="0.1" placeholder="80.0" className={iC} style={iS} autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lC} style={lS}>Altura (cm)</label>
                  <input value={form.height} onChange={(e) => set("height", e.target.value)}
                    type="number" step="0.5" placeholder="175" className={iC} style={iS} />
                </div>
                <div>
                  <label className={lC} style={lS}>% Grasa corporal</label>
                  <input value={form.bodyFat} onChange={(e) => set("bodyFat", e.target.value)}
                    type="number" step="0.1" min="3" max="50" placeholder="18.0" className={iC} style={iS} />
                </div>
              </div>
            </>
          )}

          {/* STEP 3 — Medidas */}
          {step === 3 && (
            <>
              <div className="rounded-xl px-4 py-3" style={{ background: T.raised }}>
                <p className="text-[12px]" style={{ color: T.s }}>Medidas perimetrales iniciales en cm. Son opcionales pero mejoran el análisis de composición.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {([["chest", "Pecho"], ["waist", "Cintura"], ["hips", "Cadera"]] as [keyof WizardForm, string][]).map(([k, label]) => (
                  <div key={k}>
                    <label className={lC} style={lS}>{label} (cm)</label>
                    <input value={form[k] as string} onChange={(e) => set(k, e.target.value)}
                      type="number" step="0.5" placeholder="—" className={iC} style={iS} />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* STEP 4 — Fotos */}
          {step === 4 && (
            <>
              <div className="rounded-xl px-4 py-3" style={{ background: T.raised }}>
                <p className="text-[12px]" style={{ color: T.s }}>Opcional: foto inicial (frontal) o informe InBody. Se usará como comparativa visual de progreso.</p>
              </div>
              <label className="block cursor-pointer"
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) set("photo", f); }}>
                <div className="flex flex-col items-center gap-3 py-8 rounded-xl transition-all"
                  style={{
                    background: dragOver ? "rgba(96,165,250,0.08)" : T.raised,
                    border: `1.5px dashed ${dragOver ? T.info : T.border}`,
                  }}>
                  {form.photo ? (
                    <>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(52,211,153,0.12)" }}>
                        <Upload size={18} style={{ color: T.success }} />
                      </div>
                      <p className="text-[13px] font-medium" style={{ color: T.p }}>{form.photo.name}</p>
                      <p className="text-[11px]" style={{ color: T.t }}>{(form.photo.size / 1024).toFixed(0)} KB</p>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        <Upload size={18} style={{ color: T.t }} />
                      </div>
                      <div className="text-center">
                        <p className="text-[13px] font-medium" style={{ color: T.s }}>Arrastra o toca para subir</p>
                        <p className="text-[11px] mt-0.5" style={{ color: T.t }}>JPG, PNG o PDF · máx. 10 MB</p>
                      </div>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*,.pdf" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) set("photo", f); }} />
              </label>
              {form.photo && (
                <button onClick={() => set("photo", null)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium cursor-pointer px-2.5 py-1 rounded-lg transition-opacity hover:opacity-70"
                  style={{ color: T.danger, background: `${T.danger}12`, border: `1px solid ${T.danger}25` }}>
                  Quitar archivo
                </button>
              )}
            </>
          )}
        </div>

        {/* ── Footer nav ── */}
        <div className="px-6 pb-5 pt-4 flex items-center justify-between gap-3 shrink-0"
          style={{ borderTop: "1px solid #27272a", background: "#18181b" }}>
          {step > 1 ? (
            <button onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer"
              style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.s }}>
              <ChevronLeft size={14} /> Atrás
            </button>
          ) : <div />}

          {step < 4 ? (
            <button onClick={() => { if (canAdvance) setStep((s) => s + 1); }}
              disabled={!canAdvance}
              className="flex items-center justify-center gap-1.5 px-5 rounded-xl text-[13px] font-semibold cursor-pointer disabled:opacity-40 transition-opacity"
              style={{ background: T.info, color: "#000", height: 42, minWidth: 110 }}>
              Siguiente <ChevronRight size={14} />
            </button>
          ) : (
            <button onClick={submit} disabled={saving}
              className="flex items-center justify-center gap-1.5 px-5 rounded-xl text-[13px] font-semibold cursor-pointer disabled:opacity-50 transition-opacity"
              style={{ background: T.info, color: "#000", height: 42, minWidth: 130 }}>
              {saving
                ? <Loader2 size={15} className="animate-spin" style={{ color: "#000" }} />
                : "Crear alumno"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SYNC MODAL — Dual-dropzone bulk import
══════════════════════════════════════════════════════════════ */
type SyncStatus = "idle" | "processing" | "done" | "error";

function SyncModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [zipFile,   setZipFile]   = useState<File | null>(null);
  const [status,    setStatus]    = useState<SyncStatus>("idle");
  const [result,    setResult]    = useState<ImportResult | null>(null);
  const [excelDrag, setExcelDrag] = useState(false);
  const [zipDrag,   setZipDrag]   = useState(false);

  const process = async () => {
    if (!excelFile) return;
    setStatus("processing");
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("excel", excelFile);
      if (zipFile) fd.append("zip", zipFile);
      const res  = await fetch("/api/coach/import", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setStatus("error"); setResult({ total: 0, created: 0, skipped: 0, warnings: [{ row: 0, name: "", type: "error", message: data.error ?? "Error desconocido" }] }); return; }
      setResult(data as ImportResult);
      setStatus("done");
      if ((data as ImportResult).created > 0) setTimeout(onImported, 2000);
    } catch (e: any) {
      setStatus("error");
      setResult({ total: 0, created: 0, skipped: 0, warnings: [{ row: 0, name: "", type: "error", message: e?.message ?? "Error de red" }] });
    }
  };

  const DropZone = ({
    label, accept, icon: Icon, color, file, setFile, dragging, setDragging,
  }: {
    label: string; accept: string; icon: any; color: string;
    file: File | null; setFile: (f: File | null) => void;
    dragging: boolean; setDragging: (v: boolean) => void;
  }) => (
    <label className="flex flex-col cursor-pointer"
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}>
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl py-7 px-4 text-center transition-all"
        style={{
          background: dragging ? `${color}0d` : file ? `${color}0a` : T.raised,
          border: `1.5px dashed ${dragging ? color : file ? `${color}60` : T.border}`,
          minHeight: 160,
        }}>
        {file ? (
          <>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-[12px] font-semibold" style={{ color: T.p }}>{file.name}</p>
              <p className="text-[10px] mt-0.5" style={{ color: T.t }}>{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <button type="button" onClick={(e) => { e.preventDefault(); setFile(null); }}
              className="text-[10px] cursor-pointer" style={{ color: T.t }}>
              Quitar
            </button>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <Icon size={18} style={{ color: T.t }} />
            </div>
            <div>
              <p className="text-[12px] font-semibold" style={{ color: T.s }}>{label}</p>
              <p className="text-[10px] mt-0.5" style={{ color: T.t }}>{accept}</p>
            </div>
          </>
        )}
      </div>
      <input type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
    </label>
  );

  const warnIcons: Record<ImportWarning["type"], any> = {
    info:    <Info size={12} style={{ color: T.info }} />,
    warning: <AlertTriangle size={12} style={{ color: T.warning }} />,
    error:   <AlertTriangle size={12} style={{ color: T.danger }} />,
  };
  const warnBg: Record<ImportWarning["type"], string> = {
    info:    `${T.info}10`,
    warning: `${T.warning}10`,
    error:   `${T.danger}10`,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.80)" }} />
      <div className="relative w-full max-w-2xl rounded-2xl z-10 overflow-hidden"
        style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: "0 24px 72px rgba(0,0,0,0.85)" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div>
            <h3 className="text-[16px] font-semibold" style={{ color: T.p }}>Sincronizar registro de alumnos</h3>
            <p className="text-[11px] mt-0.5" style={{ color: T.t }}>Importación masiva desde Excel + ZIP de fotos</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/api/coach/import" download="plantilla_registro_alumnos.xlsx"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer"
              style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.s }}>
              <Download size={12} /> Plantilla Excel
            </a>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer"
              style={{ background: T.raised }}>
              <X size={14} style={{ color: T.s }} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

          {/* Column legend */}
          <div className="rounded-xl px-4 py-3" style={{ background: T.raised, border: `1px solid ${T.border}` }}>
            <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: T.t }}>
              Columnas requeridas en el Excel
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Nombre Completo","Correo Electrónico","Edad","Etapa Objetivo",
                "Número de Mes/Etapa","Peso Actual (kg)","Estatura (cm)","% Grasa (Opcional)",
                "Pecho (cm)","Cintura (cm)","Cadera (cm)",
                "Foto Mes 1 - Frente","Foto Mes 1 - Perfil","Foto Mes 2 - Frente","Foto Mes 2 - Perfil",
              ].map((col) => (
                <span key={col} className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                  style={{
                    background: col.startsWith("Foto") ? `${T.success}12` : "rgba(255,255,255,0.06)",
                    color: col.startsWith("Foto") ? T.success : T.s,
                  }}>
                  {col}
                </span>
              ))}
            </div>
            <p className="text-[10px] mt-2" style={{ color: T.t }}>
              Los nombres de foto deben coincidir exactamente con los archivos dentro del ZIP.
            </p>
          </div>

          {/* Dual dropzone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <DropZone
              label="Archivo Excel (.xlsx)" accept=".xlsx,.xls"
              icon={FileSpreadsheet} color={T.success}
              file={excelFile} setFile={setExcelFile}
              dragging={excelDrag} setDragging={setExcelDrag} />
            <DropZone
              label="Carpeta de fotos (.zip)" accept=".zip"
              icon={FileArchive} color={T.warning}
              file={zipFile} setFile={setZipFile}
              dragging={zipDrag} setDragging={setZipDrag} />
          </div>

          {/* Results */}
          {result && status !== "processing" && (
            <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
              {/* Summary bar */}
              <div className="flex items-center gap-4 px-4 py-3" style={{ background: T.raised }}>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} style={{ color: T.success }} />
                  <span className="text-[13px] font-semibold" style={{ color: T.success }}>{result.created} creados</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertTriangle size={14} style={{ color: T.warning }} />
                  <span className="text-[13px] font-semibold" style={{ color: T.warning }}>{result.skipped} omitidos</span>
                </div>
                <span className="text-[11px] ml-auto" style={{ color: T.t }}>{result.total} filas procesadas</span>
              </div>

              {/* Warning list */}
              {result.warnings.length > 0 && (
                <div className="divide-y" style={{ borderColor: T.border }}>
                  {result.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-2.5"
                      style={{ background: warnBg[w.type] }}>
                      <span className="mt-0.5 shrink-0">{warnIcons[w.type]}</span>
                      <div className="min-w-0">
                        {w.row > 0 && (
                          <span className="text-[10px] font-medium mr-2" style={{ color: T.t }}>Fila {w.row}</span>
                        )}
                        {w.name && (
                          <span className="text-[11px] font-semibold mr-2" style={{ color: T.s }}>{w.name}</span>
                        )}
                        <span className="text-[11px]" style={{ color: T.s }}>{w.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* All-good state */}
              {result.warnings.length === 0 && result.created > 0 && (
                <div className="flex items-center gap-2 px-4 py-3">
                  <CheckCircle2 size={14} style={{ color: T.success }} />
                  <span className="text-[12px]" style={{ color: T.success }}>Importación completada sin errores.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-4 flex items-center justify-end gap-3"
          style={{ borderTop: `1px solid ${T.border}` }}>
          {status === "done" ? (
            <button onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer"
              style={{ background: T.success, color: "#000" }}>
              Cerrar
            </button>
          ) : (
            <button onClick={process}
              disabled={!excelFile || status === "processing"}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer disabled:opacity-40 transition-opacity"
              style={{ background: T.info, color: "#000" }}>
              {status === "processing"
                ? <><Loader2 size={15} className="animate-spin" /> Procesando…</>
                : <><RefreshCw size={14} /> Importar alumnos</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
