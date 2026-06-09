"use client";

/* ═══════════════════════════════════════════
   Dashboard del coach (WEB) — idéntico a la app:
   KPIs (MRR, Adherencia, Activos, Alertas) + curva de
   adherencia + lista de alumnos.
   ═══════════════════════════════════════════ */
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { type Student } from "@/lib/mock-data";
import { PageHeader } from "@/components/page-header";
import { ChartSkeleton, RowSkeleton } from "@/components/skeleton";

const STAGE_COLORS: Record<string, string> = { Volumen: "#a78bfa", "Definición": "#2dd4bf", Mantenimiento: "#facc15", "Recomposición": "#f472b6" };
const PAYMENT_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Al día", color: "#34d399" }, grace_period: { label: "Pago pendiente", color: "#fbbf24" },
  past_due: { label: "Pago vencido", color: "#fbbf24" }, inactive: { label: "Suspendido", color: "#f87171" },
};
const avatarBg = (c?: string) => { if (c) { const m = c.match(/#[0-9a-fA-F]{3,8}/); if (m) return m[0]; if (c.startsWith("rgb")) return c; } return "#3b82f6"; };

export default function CoachDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/students").then((r) => r.json()).then((d) => setStudents(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.paymentStatus === "active").length;
    const grace = students.filter((s) => s.paymentStatus === "grace_period").length;
    const inactive = students.filter((s) => s.paymentStatus === "inactive").length;
    const mrr = active * 1200 + grace * 600;
    const avgAdherence = total > 0 ? Math.round(students.reduce((a, s) => a + s.completionRate, 0) / total) : 0;
    return { total, active, grace, inactive, mrr, avgAdherence };
  }, [students]);

  return (
    <>
      <PageHeader title="Resumen" hint="Estado de tu negocio: ingresos, adherencia y alertas." />
      <div className="flex-1 px-4 md:px-8 py-6 overflow-y-auto pb-24 md:pb-8 space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Kpi label="MRR" value={`$${stats.mrr.toLocaleString("es-MX")}`} suffix="MXN" loading={loading} />
          <Kpi label="Adherencia" value={`${stats.avgAdherence}%`} accent={stats.avgAdherence >= 80 ? "var(--color-success)" : "var(--color-warning)"} loading={loading} />
          <Kpi label="Activos" value={`${stats.active}`} suffix={`de ${stats.total}`} loading={loading} />
          <Kpi label="Alertas" value={`${stats.grace + stats.inactive}`} accent={stats.grace + stats.inactive > 0 ? "var(--color-danger)" : "var(--text-tertiary)"} loading={loading} />
        </div>

        {/* Curva de adherencia */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}><h3 className="text-[14px] font-medium" style={{ color: "var(--text-primary)" }}>Curva de adherencia</h3></div>
          <div className="p-5">{loading ? <ChartSkeleton /> : <AdherenceChart students={students} />}</div>
        </div>

        {/* Lista de alumnos */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}><h3 className="text-[14px] font-medium" style={{ color: "var(--text-primary)" }}>Alumnos ({students.length})</h3></div>
          {loading ? <div className="p-5"><RowSkeleton count={4} /></div> : students.map((s, i) => <StudentRow key={s.id} student={s} last={i === students.length - 1} />)}
        </div>
      </div>
    </>
  );
}

function Kpi({ label, value, suffix, accent = "var(--text-primary)", loading }: { label: string; value: string; suffix?: string; accent?: string; loading?: boolean }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
      <span className="text-[11px] uppercase font-medium" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>{label}</span>
      <div className="flex items-baseline mt-2">
        <span className="text-[26px] font-semibold tabular-nums leading-none" style={{ color: loading ? "var(--text-tertiary)" : accent }}>{loading ? "—" : value}</span>
        {suffix && <span className="text-[13px] font-medium ml-1" style={{ color: "var(--text-secondary)" }}>{suffix}</span>}
      </div>
    </div>
  );
}

function AdherenceChart({ students }: { students: Student[] }) {
  if (students.length < 2) return <p className="text-[13px] text-center py-6" style={{ color: "var(--text-tertiary)" }}>Aún no hay datos suficientes</p>;
  const W = 400, H = 100;
  const sorted = [...students].sort((a, b) => b.completionRate - a.completionRate);
  const points = sorted.map((s, i) => `${(i / (sorted.length - 1)) * W},${H - (s.completionRate / 100) * (H - 20)}`).join(" ");
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-24 overflow-visible">
        <polyline fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" points={points} />
        {sorted.map((s, i) => <circle key={s.id} cx={(i / (sorted.length - 1)) * W} cy={H - (s.completionRate / 100) * (H - 20)} r="3" fill={s.completionRate >= 80 ? "var(--color-success)" : "var(--color-warning)"} />)}
      </svg>
      <div className="flex justify-between mt-3 pt-2 text-[10px]" style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--text-tertiary)" }}>
        <span>100% Adherencia</span><span>Promedio</span><span>0% Adherencia</span>
      </div>
    </div>
  );
}

function StudentRow({ student, last }: { student: Student; last: boolean }) {
  const pay = PAYMENT_LABELS[student.paymentStatus] ?? PAYMENT_LABELS.inactive;
  const stageColor = STAGE_COLORS[student.stage] ?? "var(--text-tertiary)";
  return (
    <Link href={`/coach/students/${student.id}`} className="flex items-center px-5 py-4 transition-colors hover:bg-[color:var(--bg-hover)]" style={{ borderBottom: last ? "none" : "1px solid var(--border-subtle)" }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[13px] font-semibold text-white" style={{ background: avatarBg(student.avatarColor) }}>{student.avatarInitials}</div>
      <div className="flex-1 ml-3 min-w-0">
        <p className="text-[14px] font-medium truncate" style={{ color: "var(--text-primary)" }}>{student.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium" style={{ background: stageColor + "1a", color: stageColor }}>{student.stage}</span>
          <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>{student.currentWeight} kg</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[13px] font-medium tabular-nums" style={{ color: "var(--text-secondary)" }}>{student.completionRate}%</p>
        <p className="text-[11px] mt-1" style={{ color: pay.color }}>{pay.label}</p>
      </div>
    </Link>
  );
}
