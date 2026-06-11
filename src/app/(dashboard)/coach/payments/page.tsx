"use client";

/* ═══════════════════════════════════════════
   Pagos (WEB) — idéntico a la app: MRR + secciones
   (Requieren acción / Al día / Suspendidos).
   ═══════════════════════════════════════════ */
import { useEffect, useState, useMemo } from "react";
import { Loader2, DollarSign, Check } from "lucide-react";
import { type Student } from "@/lib/mock-data";
import { PageHeader } from "@/components/page-header";

const PAYMENT_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Al día", color: "#34d399" }, grace_period: { label: "Pago pendiente", color: "#fbbf24" },
  past_due: { label: "Pago vencido", color: "#fbbf24" }, inactive: { label: "Suspendido", color: "#f87171" },
};
const avatarBg = (c?: string) => { if (c) { const m = c.match(/#[0-9a-fA-F]{3,8}/); if (m) return m[0]; if (c.startsWith("rgb")) return c; } return "#3b82f6"; };

export default function PaymentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Tarifa mensual dinámica ── */
  const [fee, setFee]           = useState<number>(1200);
  const [feeInput, setFeeInput] = useState<string>("");
  const [feeSaving, setFeeSaving] = useState(false);
  const [feeSaved, setFeeSaved]   = useState(false);

  useEffect(() => {
    fetch("/api/students").then((r) => r.json()).then((d) => setStudents(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoading(false));
    fetch("/api/coach/profile").then((r) => r.json()).then((d) => {
      const p = d.monthlyPrice ?? 1200;
      setFee(p);
      setFeeInput(String(p));
    }).catch(() => {});
  }, []);

  const saveFee = async () => {
    const p = parseFloat(feeInput);
    if (isNaN(p) || p < 0) return;
    setFeeSaving(true);
    try {
      const res = await fetch("/api/coach/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyPrice: p }),
      });
      if (res.ok) { setFee(p); setFeeSaved(true); setTimeout(() => setFeeSaved(false), 2000); }
    } finally { setFeeSaving(false); }
  };

  const groups = useMemo(() => {
    const action = students.filter((s) => s.paymentStatus === "grace_period" || s.paymentStatus === "past_due");
    const active = students.filter((s) => s.paymentStatus === "active");
    const disabled = students.filter((s) => s.paymentStatus === "inactive");
    const mrr = active.length * fee + action.length * (fee / 2);
    return { action, active, disabled, mrr };
  }, [students, fee]);

  return (
    <>
      <PageHeader title="Pagos" hint="Cobros recurrentes mensuales" />
      <div className="flex-1 px-4 md:px-8 py-6 overflow-y-auto pb-24 md:pb-8">
        {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin" style={{ color: "var(--text-primary)" }} /></div> : (
          <div className="max-w-3xl space-y-4">

            {/* ── Tarifa mensual ── */}
            <div className="rounded-2xl p-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={14} style={{ color: "var(--text-tertiary)" }} />
                <span className="text-[11px] uppercase font-medium" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>Tarifa Mensual</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1 px-3.5 py-2.5 rounded-xl"
                  style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)" }}>
                  <span className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>$</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={feeInput}
                    onChange={(e) => { setFeeInput(e.target.value); setFeeSaved(false); }}
                    onKeyDown={(e) => e.key === "Enter" && saveFee()}
                    className="flex-1 bg-transparent outline-none text-[15px] font-semibold tabular-nums"
                    style={{ color: "var(--text-primary)" }}
                  />
                  <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>MXN/mes</span>
                </div>
                <button
                  onClick={saveFee}
                  disabled={feeSaving || feeInput === String(fee)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-semibold cursor-pointer disabled:opacity-40 transition-all shrink-0"
                  style={{
                    background: feeSaved ? "rgba(52,211,153,0.12)" : "var(--bg-surface-raised)",
                    border: `1px solid ${feeSaved ? "rgba(52,211,153,0.3)" : "var(--border-subtle)"}`,
                    color: feeSaved ? "#34d399" : "var(--text-secondary)",
                  }}>
                  {feeSaving ? <Loader2 size={13} className="animate-spin" /> : feeSaved ? <><Check size={13} /> Guardado</> : "Guardar"}
                </button>
              </div>
              <p className="text-[11px] mt-2.5" style={{ color: "var(--text-tertiary)" }}>
                Este precio se mostrará a tus alumnos en la pantalla de suscripción.
              </p>
            </div>

            {/* MRR */}
            <div className="rounded-2xl p-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span className="text-[11px] uppercase font-medium" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>Ingreso mensual recurrente</span>
              <div className="flex items-baseline mt-2">
                <span className="text-[32px] font-semibold" style={{ color: "var(--text-primary)" }}>${groups.mrr.toLocaleString("es-MX")}</span>
                <span className="text-[14px] font-medium ml-2" style={{ color: "var(--text-secondary)" }}>MXN</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="rounded-full" style={{ width: 6, height: 6, background: "#34d399" }} />
                <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>AutoCobro activo · ${fee.toLocaleString("es-MX")}/alumno</span>
              </div>
            </div>

            <Section title="Requieren acción" students={groups.action} empty="Nadie con pagos pendientes 🎉" />
            <Section title="Al día" students={groups.active} empty="Sin alumnos activos" />
            <Section title="Suspendidos" students={groups.disabled} empty="Ningún alumno suspendido" />
          </div>
        )}
      </div>
    </>
  );
}

function Section({ title, students, empty }: { title: string; students: Student[]; empty: string }) {
  return (
    <div className="space-y-2.5">
      <p className="text-[11px] uppercase font-medium px-1" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>{title} ({students.length})</p>
      {students.length === 0 ? <p className="text-[12px] px-1" style={{ color: "var(--text-tertiary)" }}>{empty}</p> : students.map((s) => {
        const pay = PAYMENT_LABELS[s.paymentStatus] ?? PAYMENT_LABELS.inactive;
        return (
          <div key={s.id} className="flex items-center p-3.5 rounded-2xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold text-white" style={{ background: avatarBg(s.avatarColor) }}>{s.avatarInitials}</div>
            <div className="flex-1 ml-3 min-w-0">
              <p className="text-[14px] font-medium truncate" style={{ color: "var(--text-primary)" }}>{s.name}</p>
              <p className="text-[12px] mt-0.5 truncate" style={{ color: "var(--text-tertiary)" }}>{s.email}</p>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium shrink-0" style={{ background: pay.color + "1a", color: pay.color }}>{pay.label}</span>
          </div>
        );
      })}
    </div>
  );
}
