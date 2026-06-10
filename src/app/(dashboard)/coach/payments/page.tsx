"use client";

/* ═══════════════════════════════════════════
   Pagos (WEB) — idéntico a la app: MRR + secciones
   (Requieren acción / Al día / Suspendidos).
   ═══════════════════════════════════════════ */
import { useEffect, useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { type Student } from "@/lib/mock-data";
import { PageHeader } from "@/components/page-header";

const FEE = 1200;
const PAYMENT_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Al día", color: "#34d399" }, grace_period: { label: "Pago pendiente", color: "#fbbf24" },
  past_due: { label: "Pago vencido", color: "#fbbf24" }, inactive: { label: "Suspendido", color: "#f87171" },
};
const avatarBg = (c?: string) => { if (c) { const m = c.match(/#[0-9a-fA-F]{3,8}/); if (m) return m[0]; if (c.startsWith("rgb")) return c; } return "#3b82f6"; };

export default function PaymentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/students").then((r) => r.json()).then((d) => setStudents(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => {
    const action = students.filter((s) => s.paymentStatus === "grace_period" || s.paymentStatus === "past_due");
    const active = students.filter((s) => s.paymentStatus === "active");
    const disabled = students.filter((s) => s.paymentStatus === "inactive");
    const mrr = active.length * FEE + action.length * (FEE / 2);
    return { action, active, disabled, mrr };
  }, [students]);

  return (
    <>
      <PageHeader title="Pagos" hint="Cobros recurrentes mensuales" />
      <div className="flex-1 px-4 md:px-8 py-6 overflow-y-auto pb-24 md:pb-8">
        {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin" style={{ color: "var(--text-primary)" }} /></div> : (
          <div className="max-w-3xl space-y-4">
            {/* MRR */}
            <div className="rounded-2xl p-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span className="text-[11px] uppercase font-medium" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>Ingreso mensual recurrente</span>
              <div className="flex items-baseline mt-2">
                <span className="text-[32px] font-semibold" style={{ color: "var(--text-primary)" }}>${groups.mrr.toLocaleString("es-MX")}</span>
                <span className="text-[14px] font-medium ml-2" style={{ color: "var(--text-secondary)" }}>MXN</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="rounded-full" style={{ width: 6, height: 6, background: "#34d399" }} />
                <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>AutoCobro activo · ${FEE.toLocaleString("es-MX")}/alumno</span>
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
