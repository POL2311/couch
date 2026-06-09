"use client";

/* ═══════════════════════════════════════════
   Alumnos (WEB) — idéntico a la app: búsqueda +
   filtros + tarjetas + alta de alumno.
   ═══════════════════════════════════════════ */
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Search, Plus, X, Loader2 } from "lucide-react";
import { type Student } from "@/lib/mock-data";
import { PageHeader } from "@/components/page-header";

const STAGES = ["Volumen", "Definición", "Mantenimiento", "Recomposición"];
const STAGE_COLORS: Record<string, string> = { Volumen: "#a78bfa", "Definición": "#2dd4bf", Mantenimiento: "#facc15", "Recomposición": "#f472b6" };
const PAYMENT_LABELS: Record<string, { short: string; color: string }> = {
  active: { short: "Al día", color: "#34d399" }, grace_period: { short: "Pendiente", color: "#fbbf24" },
  past_due: { short: "Vencido", color: "#fbbf24" }, inactive: { short: "Suspendido", color: "#f87171" },
};
const avatarBg = (c?: string) => { if (c) { const m = c.match(/#[0-9a-fA-F]{3,8}/); if (m) return m[0]; if (c.startsWith("rgb")) return c; } return "#3b82f6"; };

type Filter = "all" | "active" | "attention" | "inactive";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todos" }, { id: "active", label: "Al día" }, { id: "attention", label: "Pendientes" }, { id: "inactive", label: "Suspendidos" },
];
function matchesFilter(s: Student, f: Filter) {
  if (f === "all") return true;
  if (f === "active") return s.paymentStatus === "active";
  if (f === "attention") return s.paymentStatus === "grace_period" || s.paymentStatus === "past_due";
  if (f === "inactive") return s.paymentStatus === "inactive";
  return true;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch("/api/students"); const d = await r.json(); setStudents(Array.isArray(d) ? d : []); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const list = useMemo(() => students.filter((s) => matchesFilter(s, filter) && s.name.toLowerCase().includes(query.toLowerCase())), [students, filter, query]);

  return (
    <>
      <PageHeader title="Alumnos" hint={`${students.length} en total`}
        cta={<button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium cursor-pointer" style={{ background: "var(--accent-primary)", color: "var(--text-inverse)" }}><Plus size={16} /> Nuevo</button>}
      />
      <div className="flex-1 px-4 md:px-8 py-6 overflow-y-auto pb-24 md:pb-8">
        <div className="max-w-3xl">
          {/* Búsqueda */}
          <div className="flex items-center px-3.5 rounded-xl mb-3" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
            <Search size={15} style={{ color: "var(--text-tertiary)" }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar alumno…" className="flex-1 py-2.5 px-2 text-[14px] bg-transparent outline-none" style={{ color: "var(--text-primary)" }} />
          </div>
          {/* Filtros */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-1">
            {FILTERS.map((f) => { const a = filter === f.id; return <button key={f.id} onClick={() => setFilter(f.id)} className="px-3.5 py-2 rounded-xl text-[12px] font-medium whitespace-nowrap cursor-pointer" style={{ background: a ? "var(--text-primary)" : "var(--bg-surface)", border: `1px solid ${a ? "var(--text-primary)" : "var(--border-subtle)"}`, color: a ? "var(--text-inverse)" : "var(--text-secondary)" }}>{f.label}</button>; })}
          </div>

          {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin" style={{ color: "var(--text-primary)" }} /></div> : (
            <div className="space-y-2.5">
              {list.length === 0 ? <p className="text-[13px] text-center py-10" style={{ color: "var(--text-tertiary)" }}>Sin resultados</p> : list.map((s) => {
                const pay = PAYMENT_LABELS[s.paymentStatus] ?? PAYMENT_LABELS.inactive;
                const stageColor = STAGE_COLORS[s.stage] ?? "var(--text-tertiary)";
                const delta = Math.round((s.currentWeight - s.previousWeight) * 10) / 10;
                return (
                  <Link key={s.id} href={`/coach/students/${s.id}`} className="flex items-center p-4 rounded-2xl transition-colors hover:bg-[color:var(--bg-hover)]" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[13px] font-semibold text-white" style={{ background: avatarBg(s.avatarColor) }}>{s.avatarInitials}</div>
                    <div className="flex-1 ml-3 min-w-0">
                      <p className="text-[15px] font-medium truncate" style={{ color: "var(--text-primary)" }}>{s.name}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium" style={{ background: stageColor + "1a", color: stageColor }}>{s.stage}</span>
                        <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>{s.currentWeight} kg</span>
                        {delta !== 0 && <span className="text-[12px]" style={{ color: delta < 0 ? "#34d399" : "var(--text-tertiary)" }}>{delta > 0 ? "+" : ""}{delta}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>{s.completionRate}%</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium" style={{ background: pay.color + "1a", color: pay.color }}>{pay.short}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {modalOpen && <NewStudentModal onClose={() => setModalOpen(false)} onCreated={() => { setModalOpen(false); load(); }} />}
    </>
  );
}

function NewStudentModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [stage, setStage] = useState("Volumen"); const [weight, setWeight] = useState(""); const [height, setHeight] = useState("");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!name.trim() || !email.trim()) { alert("Nombre y correo son obligatorios."); return; }
    setSaving(true);
    await fetch("/api/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), email: email.trim(), stage, stageNumber: STAGES.indexOf(stage) + 1, startingWeight: parseFloat(weight) || 0, height: parseFloat(height) || undefined }) });
    onCreated();
  };
  const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-[14px] outline-none";
  const inputStyle = { background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" } as const;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 backdrop-blur-sm" style={{ background: "var(--scrim)" }} />
      <div className="relative w-full max-w-md rounded-2xl p-6 z-10 space-y-3 max-h-[85vh] overflow-y-auto" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-strong)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2"><h3 className="text-[16px] font-medium" style={{ color: "var(--text-primary)" }}>Nuevo alumno</h3><button onClick={onClose} className="cursor-pointer"><X size={18} style={{ color: "var(--text-tertiary)" }} /></button></div>
        <div><label className="text-[10px] uppercase tracking-wider font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>Nombre completo</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan Pérez" className={inputCls} style={inputStyle} /></div>
        <div><label className="text-[10px] uppercase tracking-wider font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>Correo</label><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="juan@correo.com" className={inputCls} style={inputStyle} /></div>
        <div><label className="text-[10px] uppercase tracking-wider font-medium block mb-2" style={{ color: "var(--text-secondary)" }}>Etapa</label><div className="flex flex-wrap gap-2">{STAGES.map((st) => { const c = STAGE_COLORS[st]; const a = stage === st; return <button key={st} onClick={() => setStage(st)} className="px-3 py-2 rounded-xl text-[12px] font-medium cursor-pointer" style={{ background: a ? c + "1a" : "var(--bg-surface-raised)", border: `1px solid ${a ? c : "var(--border-subtle)"}`, color: a ? c : "var(--text-secondary)" }}>{st}</button>; })}</div></div>
        <div className="flex gap-3">
          <div className="flex-1"><label className="text-[10px] uppercase tracking-wider font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>Peso inicial (kg)</label><input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="80" className={inputCls} style={inputStyle} /></div>
          <div className="flex-1"><label className="text-[10px] uppercase tracking-wider font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>Altura (m)</label><input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="1.75" className={inputCls} style={inputStyle} /></div>
        </div>
        <button onClick={save} disabled={saving} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-medium cursor-pointer mt-2" style={{ background: "var(--accent-primary)", color: "var(--text-inverse)" }}>{saving ? <Loader2 size={16} className="animate-spin" /> : "Crear alumno"}</button>
      </div>
    </div>
  );
}
