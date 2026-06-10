"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Search, Plus, X, Loader2, Flame, ChevronUp, ChevronDown } from "lucide-react";
import { type Student } from "@/lib/mock-data";
import { PageHeader } from "@/components/page-header";

/* ── Design tokens (hardcoded dark) ── */
const T = {
  bg:      "#000000",
  surface: "#121212",
  raised:  "#1c1c1e",
  border:  "rgba(255,255,255,0.08)",
  divider: "rgba(255,255,255,0.06)",
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
  Volumen:        { text: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  "Definición":   { text: "#2dd4bf", bg: "rgba(45,212,191,0.12)" },
  Mantenimiento:  { text: "#facc15", bg: "rgba(250,204,21,0.12)"  },
  "Recomposición":{ text: "#f472b6", bg: "rgba(244,114,182,0.12)" },
};

const PAYMENT: Record<string, { label: string; color: string }> = {
  active:       { label: "Al día",       color: "#34d399" },
  grace_period: { label: "Pendiente",    color: "#fbbf24" },
  past_due:     { label: "Vencido",      color: "#fbbf24" },
  inactive:     { label: "Suspendido",   color: "#f87171" },
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
  if (f === "active")    return s.paymentStatus === "active";
  if (f === "attention") return s.paymentStatus === "grace_period" || s.paymentStatus === "past_due";
  if (f === "inactive")  return s.paymentStatus === "inactive";
  return true;
}

type SortKey = "name" | "weight" | "completionRate" | "streak";
type SortDir = "asc" | "desc";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<Filter>("all");
  const [query, setQuery]       = useState("");
  const [modalOpen, setModalOpen] = useState(false);
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

  const toggleAll = () =>
    setSelected(allChecked ? new Set() : new Set(list.map((s) => s.id)));
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
          <button onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium cursor-pointer"
            style={{ background: T.info, color: "#000" }}>
            <Plus size={15} /> Nuevo
          </button>
        }
      />

      <div className="flex-1 px-4 md:px-8 py-6 overflow-y-auto pb-24 md:pb-8">

        {/* ── Search + filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 max-w-6xl">
          <div className="flex items-center flex-1 px-3.5 rounded-xl"
            style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <Search size={14} style={{ color: T.t }} />
            <input
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar alumno…"
              className="flex-1 py-2.5 px-2 text-[13px] bg-transparent outline-none"
              style={{ color: T.p }} />
            {query && (
              <button onClick={() => setQuery("")} className="cursor-pointer">
                <X size={13} style={{ color: T.t }} />
              </button>
            )}
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
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
          <div className="max-w-6xl rounded-xl overflow-hidden"
            style={{ border: `1px solid ${T.border}`, boxShadow: "0 2px 16px rgba(0,0,0,0.6)" }}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ background: T.bg }}>

                {/* ── THEAD ── */}
                <thead>
                  <tr style={{ background: T.surface, borderBottom: `1px solid ${T.border}` }}>
                    {/* Checkbox */}
                    <th className="w-10 pl-4 pr-2 py-3">
                      <input type="checkbox" checked={allChecked} ref={(el) => { if (el) el.indeterminate = someChecked; }}
                        onChange={toggleAll}
                        className="w-3.5 h-3.5 rounded cursor-pointer accent-sky-400" />
                    </th>
                    {/* Nombre */}
                    <th className="text-left px-4 py-3 min-w-[200px]">
                      <button onClick={() => cycleSort("name")}
                        className="text-[10px] font-semibold tracking-widest uppercase cursor-pointer"
                        style={{ color: T.t }}>
                        Nombre <SortIcon k="name" />
                      </button>
                    </th>
                    {/* Peso */}
                    <th className="text-left px-4 py-3 min-w-[110px]">
                      <button onClick={() => cycleSort("weight")}
                        className="text-[10px] font-semibold tracking-widest uppercase cursor-pointer"
                        style={{ color: T.t }}>
                        Peso <SortIcon k="weight" />
                      </button>
                    </th>
                    {/* Etapa */}
                    <th className="text-left px-4 py-3 min-w-[120px]">
                      <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: T.t }}>
                        Etapa
                      </span>
                    </th>
                    {/* Estado */}
                    <th className="text-left px-4 py-3 min-w-[110px]">
                      <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: T.t }}>
                        Estado
                      </span>
                    </th>
                    {/* Adherencia */}
                    <th className="text-left px-4 py-3 min-w-[160px]">
                      <button onClick={() => cycleSort("completionRate")}
                        className="text-[10px] font-semibold tracking-widest uppercase cursor-pointer"
                        style={{ color: T.t }}>
                        Adherencia <SortIcon k="completionRate" />
                      </button>
                    </th>
                    {/* Racha */}
                    <th className="text-left px-4 py-3 w-20">
                      <button onClick={() => cycleSort("streak")}
                        className="text-[10px] font-semibold tracking-widest uppercase cursor-pointer"
                        style={{ color: T.t }}>
                        Racha <SortIcon k="streak" />
                      </button>
                    </th>
                  </tr>
                </thead>

                {/* ── TBODY ── */}
                <tbody>
                  {list.map((s, idx) => {
                    const pay         = PAYMENT[s.paymentStatus] ?? PAYMENT.inactive;
                    const stageStyle  = STAGE_COLORS[s.stage] ?? { text: T.t, bg: "rgba(255,255,255,0.06)" };
                    const delta       = Math.round((s.currentWeight - s.previousWeight) * 10) / 10;
                    const deltaColor  = delta < 0 ? T.success : delta > 0 ? T.danger : T.t;
                    const adherence   = Math.min(Math.max(s.completionRate ?? 0, 0), 100);
                    const isSelected  = selected.has(s.id);
                    const isLast      = idx === list.length - 1;

                    return (
                      <tr key={s.id}
                        className="group transition-colors duration-150"
                        style={{
                          borderBottom: isLast ? "none" : `1px solid ${T.divider}`,
                          background: isSelected ? "rgba(96,165,250,0.05)" : "transparent",
                        }}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = T.surface; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = isSelected ? "rgba(96,165,250,0.05)" : "transparent"; }}>

                        {/* ─ Checkbox ─ */}
                        <td className="pl-4 pr-2 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={isSelected} onChange={() => toggleOne(s.id)}
                            className="w-3.5 h-3.5 rounded cursor-pointer accent-sky-400" />
                        </td>

                        {/* ─ Nombre ─ */}
                        <td className="px-4 py-3.5">
                          <Link href={`/coach/students/${s.id}`}
                            className="flex items-center gap-3 min-w-0">
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

                        {/* ─ Peso ─ */}
                        <td className="px-4 py-3.5">
                          <Link href={`/coach/students/${s.id}`} className="block">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-[14px] font-bold tabular-nums" style={{ color: T.p }}>
                                {s.currentWeight}
                              </span>
                              <span className="text-[10px]" style={{ color: T.t }}>kg</span>
                              {delta !== 0 && (
                                <span className="text-[11px] font-semibold tabular-nums" style={{ color: deltaColor }}>
                                  {delta > 0 ? "+" : ""}{delta}
                                </span>
                              )}
                            </div>
                            {s.lastWeighIn && (
                              <p className="text-[10px] mt-0.5" style={{ color: T.t }}>{s.lastWeighIn}</p>
                            )}
                          </Link>
                        </td>

                        {/* ─ Etapa ─ */}
                        <td className="px-4 py-3.5">
                          <Link href={`/coach/students/${s.id}`} className="block">
                            <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap"
                              style={{ background: stageStyle.bg, color: stageStyle.text }}>
                              {s.stage}
                            </span>
                          </Link>
                        </td>

                        {/* ─ Estado ─ */}
                        <td className="px-4 py-3.5">
                          <Link href={`/coach/students/${s.id}`} className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full shrink-0"
                              style={{ background: pay.color, boxShadow: `0 0 5px ${pay.color}70` }} />
                            <span className="text-[12px] font-medium" style={{ color: pay.color }}>
                              {pay.label}
                            </span>
                          </Link>
                        </td>

                        {/* ─ Adherencia ─ */}
                        <td className="px-4 py-3.5">
                          <Link href={`/coach/students/${s.id}`} className="block">
                            <div className="flex items-center gap-2">
                              {/* Progress bar */}
                              <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                                style={{ background: "rgba(255,255,255,0.08)", minWidth: 64, maxWidth: 96 }}>
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

                        {/* ─ Racha ─ */}
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

            {/* ── Table footer ── */}
            <div className="flex items-center justify-between px-5 py-2.5"
              style={{ borderTop: `1px solid ${T.border}`, background: T.surface }}>
              <p className="text-[11px]" style={{ color: T.t }}>
                {selected.size > 0
                  ? `${selected.size} seleccionado${selected.size > 1 ? "s" : ""}`
                  : `${list.length} alumno${list.length !== 1 ? "s" : ""}`}
              </p>
              {selected.size > 0 && (
                <button onClick={() => setSelected(new Set())}
                  className="text-[11px] cursor-pointer"
                  style={{ color: T.info }}>
                  Limpiar selección
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <NewStudentModal onClose={() => setModalOpen(false)} onCreated={() => { setModalOpen(false); load(); }} />
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   NEW STUDENT MODAL
══════════════════════════════════════════════════════════════ */
function NewStudentModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState("Volumen");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim() || !email.trim()) { alert("Nombre y correo son obligatorios."); return; }
    setSaving(true);
    await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(), email: email.trim(), stage,
        stageNumber: STAGES.indexOf(stage) + 1,
        startingWeight: parseFloat(weight) || 0,
        height: parseFloat(height) || undefined,
      }),
    });
    onCreated();
  };

  const inputCls   = "w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none";
  const inputStyle = { background: T.raised, border: `1px solid ${T.border}`, color: T.p } as const;
  const labelCls   = "text-[10px] uppercase tracking-wider font-medium block mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.72)" }} />
      <div className="relative w-full max-w-md rounded-2xl p-6 z-10 space-y-3 max-h-[85vh] overflow-y-auto"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[16px] font-semibold" style={{ color: T.p }}>Nuevo alumno</h3>
          <button onClick={onClose} className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-lg"
            style={{ background: T.raised }}>
            <X size={14} style={{ color: T.s }} />
          </button>
        </div>

        <div>
          <label className={labelCls} style={{ color: T.s }}>Nombre completo</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan Pérez" className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className={labelCls} style={{ color: T.s }}>Correo</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="juan@correo.com" className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className={labelCls} style={{ color: T.s }}>Etapa</label>
          <div className="flex flex-wrap gap-2">
            {STAGES.map((st) => {
              const c = STAGE_COLORS[st];
              const a = stage === st;
              return (
                <button key={st} onClick={() => setStage(st)}
                  className="px-3 py-2 rounded-xl text-[12px] font-medium cursor-pointer transition-colors"
                  style={{
                    background: a ? c.bg : T.raised,
                    border: `1px solid ${a ? c.text + "50" : T.border}`,
                    color: a ? c.text : T.s,
                  }}>
                  {st}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={labelCls} style={{ color: T.s }}>Peso inicial (kg)</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="80" className={inputCls} style={inputStyle} />
          </div>
          <div className="flex-1">
            <label className={labelCls} style={{ color: T.s }}>Altura (m)</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="1.75" className={inputCls} style={inputStyle} />
          </div>
        </div>
        <button onClick={save} disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold cursor-pointer mt-2 disabled:opacity-50 transition-opacity"
          style={{ background: T.info, color: "#000" }}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : "Crear alumno"}
        </button>
      </div>
    </div>
  );
}
