"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Plug, ChevronRight, X, CreditCard } from "lucide-react";
import { Skeleton, RowSkeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";
import { DetailOverlay } from "@/components/detail-overlay";
import { type Student } from "@/lib/mock-data";

/* ── Secciones por estado (iOS grouped list) ── */
const PAYMENT_SECTIONS: { key: string; title: string; statuses: string[] }[] = [
  { key: "action", title: "Requieren acción", statuses: ["grace_period"] },
  { key: "active", title: "Al día", statuses: ["active"] },
  { key: "disabled", title: "Inhabilitadas", statuses: ["inactive"] },
];

function KVRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-3 text-[13px]"
      style={{ borderBottom: last ? "none" : "1px solid var(--border-subtle)" }}
    >
      <span className="shrink-0" style={{ color: "var(--text-tertiary)" }}>{label}</span>
      <span className="tabular-nums text-right truncate" style={{ color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

/* Contenido compartido por el bottom sheet (móvil) y el dialog (escritorio) */
function PaymentDetailBody({
  student,
  status,
  dueDate,
  onClose,
  onRemind,
}: {
  student: Student;
  status: { label: string; color: string; bg: string };
  dueDate: string;
  onClose: () => void;
  onRemind: () => void;
}) {
  const needsAction = student.paymentStatus === "grace_period";
  return (
    <div className="relative">
      <button
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute -top-1 right-0 p-2 rounded-full transition-colors cursor-pointer hover:bg-[color:var(--bg-hover)]"
        style={{ color: "var(--text-tertiary)" }}
      >
        <X size={18} strokeWidth={1.75} />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 pr-10">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[12px] font-medium"
          style={{ background: "var(--bg-surface-overlay)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
        >
          {student.avatarInitials}
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-medium truncate" style={{ color: "var(--text-primary)" }}>{student.name}</p>
          <p className="text-[13px] truncate" style={{ color: "var(--text-secondary)" }}>{student.email}</p>
        </div>
      </div>

      <div className="mt-3">
        <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1.5 whitespace-nowrap" style={{ color: status.color, background: status.bg }}>
          <span className="w-1 h-1 rounded-full" style={{ background: status.color }} />
          {status.label}
        </span>
      </div>

      {/* Pares clave-valor */}
      <div className="mt-5 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
        <KVRow label="Cuota" value="$1,200 MXN" />
        <KVRow label="Estado" value={status.label} />
        <KVRow label="Próximo vencimiento" value={new Date(dueDate + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })} />
        <KVRow label="Correo" value={student.email} last />
      </div>

      {/* Acciones apiladas */}
      <div className="mt-5 space-y-2.5">
        {needsAction && (
          <button
            onClick={onRemind}
            className="w-full py-2.5 rounded-xl text-[13px] font-medium cursor-pointer transition-opacity hover:opacity-85"
            style={{ background: "var(--accent-primary)", color: "var(--text-inverse)" }}
          >
            Recordar pago
          </button>
        )}
        <button
          onClick={() => alert("Redirigiendo a Panel Stripe Express de MyCoach...")}
          className="w-full py-2.5 rounded-xl text-[13px] font-medium cursor-pointer transition-colors hover:bg-[color:var(--bg-hover)]"
          style={{ background: "var(--bg-surface-raised)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
        >
          Ver en Stripe
        </button>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/students");
        if (response.ok) {
          const data = await response.json();
          setStudents(data);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Compute dynamic payment states
  const metrics = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.paymentStatus === "active").length;
    const grace = students.filter((s) => s.paymentStatus === "grace_period").length;
    const inactive = students.filter((s) => s.paymentStatus === "inactive").length;

    // Monthly Fee: $1,200 MXN per student
    const mrr = active * 1200 + grace * 600;
    const atRisk = grace * 1200;

    return { total, active, grace, inactive, mrr, atRisk };
  }, [students]);

  const [selected, setSelected] = useState<Student | null>(null);

  // Agrupación por estado; secciones vacías se descartan.
  const grouped = useMemo(
    () =>
      PAYMENT_SECTIONS.map((sec) => ({
        ...sec,
        items: students.filter((s) => sec.statuses.includes(s.paymentStatus)),
      })).filter((sec) => sec.items.length > 0),
    [students]
  );

  const remind = useCallback((s: Student) => {
    alert(`Recordatorio de pago enviado a ${s.name}`);
  }, []);

  // Techo por sección: "Requieren acción" siempre completa; el resto cap 10
  // y revela de a 50 (paginación incremental dentro de la sección).
  const SECTION_CAP = 10;
  const [shown, setShown] = useState<Record<string, number>>({});
  const visibleCount = (sec: { key: string; items: Student[] }) =>
    sec.key === "action" ? sec.items.length : Math.min(sec.items.length, shown[sec.key] ?? SECTION_CAP);
  const revealMore = (key: string, total: number) =>
    setShown((p) => ({ ...p, [key]: Math.min(total, (p[key] ?? SECTION_CAP) + 50) }));

  const getStatusStyle = (status: string) => {
    const map: Record<string, { label: string; color: string; bg: string }> = {
      active: { label: "Al día", color: "var(--color-success)", bg: "var(--color-success-subtle)" },
      grace_period: { label: "Gracia (Pendiente)", color: "var(--color-warning)", bg: "var(--color-warning-subtle)" },
      inactive: { label: "Suspendido", color: "var(--color-danger)", bg: "var(--color-danger-subtle)" },
    };
    return map[status] || { label: status, color: "var(--text-secondary)", bg: "var(--bg-hover)" };
  };

  const calculateDueDate = (joinedDateStr: string, status: string) => {
    // Generate a fixed day of the month based on the joinedDate
    const joinedDate = new Date(joinedDateStr + "T00:00:00");
    const day = joinedDate.getDate();
    
    // Return formatted next due date
    const today = new Date();
    let month = today.getMonth();
    
    if (status === "grace_period") {
      // Grace period due date is in the past/late
      const lateDate = new Date(today.getFullYear(), month, day - 3);
      return lateDate.toISOString().split("T")[0];
    } else if (status === "inactive") {
      // Inactive has missed payment
      const missedDate = new Date(today.getFullYear(), month - 1, day);
      return missedDate.toISOString().split("T")[0];
    } else {
      // Active has next payment in current or next month
      const dueDate = new Date(today.getFullYear(), month + (today.getDate() > day ? 1 : 0), day);
      return dueDate.toISOString().split("T")[0];
    }
  };

  return (
    <>
      {/* Header */}
      <header
        className="px-4 md:px-8 py-5 flex items-center justify-between shrink-0"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div>
          <h1 className="text-[16px] font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Gestión de Suscripciones
          </h1>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Controla las cuotas mensuales de tus clientes y el estado de la integración de Stripe.
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 md:px-8 py-6 space-y-6 overflow-y-auto pb-24 md:pb-8">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* MRR */}
          <div
            className="p-5 rounded-xl border animate-fade-in"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <span className="text-[11px] uppercase font-medium" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
              Mensualidad Estimada (MRR)
            </span>
            {isLoading ? (
              <Skeleton className="h-[30px] w-32 mt-2" />
            ) : (
              <p className="text-[clamp(1.5rem,5vw,1.875rem)] font-semibold leading-none mt-2 tabular-nums whitespace-nowrap" style={{ color: metrics.mrr === 0 ? "var(--text-tertiary)" : "var(--text-primary)" }}>
                ${metrics.mrr.toLocaleString("es-MX")}
                <span className="text-[14px] font-medium ml-1" style={{ color: "var(--text-secondary)" }}>MXN</span>
              </p>
            )}
            <span className="text-[12px] mt-1 block" style={{ color: "var(--text-secondary)" }}>
              Cuota base: $1,200 MXN / alumno
            </span>
          </div>

          {/* Active Subscriptions */}
          <div
            className="p-5 rounded-xl border animate-fade-in"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <span className="text-[11px] uppercase font-medium" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
              Suscripciones Al Día
            </span>
            {isLoading ? (
              <Skeleton className="h-[30px] w-16 mt-2" />
            ) : (
              <p className="text-[clamp(1.5rem,5vw,1.875rem)] font-semibold leading-none mt-2 tabular-nums" style={{ color: metrics.active === 0 ? "var(--text-tertiary)" : "var(--text-primary)" }}>
                {metrics.active}
              </p>
            )}
            <span className="text-[12px] mt-1 flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
              <span className="inline-block rounded-full shrink-0" style={{ width: 6, height: 6, background: "var(--color-success)" }} />
              Acceso habilitado a la app
            </span>
          </div>

          {/* Revenue at risk */}
          <div
            className="p-5 rounded-xl border animate-fade-in"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <span className="text-[11px] uppercase font-medium" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
              Ingresos en Riesgo
            </span>
            {isLoading ? (
              <Skeleton className="h-[30px] w-32 mt-2" />
            ) : (
              <p className="text-[clamp(1.5rem,5vw,1.875rem)] font-semibold leading-none mt-2 tabular-nums whitespace-nowrap" style={{ color: metrics.atRisk > 0 ? "var(--color-warning)" : "var(--text-tertiary)" }}>
                ${metrics.atRisk.toLocaleString("es-MX")}
                <span className="text-[14px] font-medium ml-1" style={{ color: "var(--text-secondary)" }}>MXN</span>
              </p>
            )}
            <span className="text-[12px] mt-1 block" style={{ color: "var(--text-secondary)" }}>
              {metrics.grace} alumnos en mora
            </span>
          </div>

          {/* Suspended Accounts */}
          <div
            className="p-5 rounded-xl border animate-fade-in"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <span className="text-[11px] uppercase font-medium" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
              Cuentas Inhabilitadas
            </span>
            {isLoading ? (
              <Skeleton className="h-[30px] w-16 mt-2" />
            ) : (
              <p className="text-[clamp(1.5rem,5vw,1.875rem)] font-semibold leading-none mt-2 tabular-nums" style={{ color: metrics.inactive > 0 ? "var(--color-danger)" : "var(--text-tertiary)" }}>
                {metrics.inactive}
              </p>
            )}
            <span className="text-[12px] mt-1 flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
              <span className="inline-block rounded-full shrink-0" style={{ width: 6, height: 6, background: "var(--color-danger)" }} />
              Acceso denegado temporalmente
            </span>
          </div>

        </div>

        {/* Tables & Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Cobros y Alumnos — agrupado por estado (lista iOS en móvil, tabla en desktop) */}
          <div
            className="md:col-span-2 rounded-xl border overflow-hidden flex flex-col"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-surface-raised)]">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--text-secondary)" }}>
                Cobros y Alumnos
              </h3>
              <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Facturación Mensual</span>
            </div>

            {isLoading ? (
              <div className="p-4"><RowSkeleton count={6} /></div>
            ) : students.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                message="Sin alumnos registrados"
                hint="Registra alumnos para gestionar sus cobros mensuales."
                className="py-12"
              />
            ) : (
              <>
                {/* ═══ DESKTOP TABLE (≥768px) ═══ */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
                    <thead>
                      <tr>
                        {["Alumno", "Cuota (MXN)", "Estado"].map((h, i) => (
                          <th
                            key={i}
                            className="sticky top-0 z-10 px-5 py-3 text-left text-[10px] font-normal tracking-[0.06em] uppercase whitespace-nowrap"
                            style={{ color: "var(--text-tertiary)", background: "var(--bg-surface-raised)", borderBottom: "1px solid var(--border-subtle)" }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    {grouped.map((sec) => (
                      <tbody key={sec.key}>
                        <tr>
                          <td colSpan={3} className="px-5 pt-5 pb-2 text-[11px] uppercase font-medium" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
                            {sec.title} · {sec.items.length}
                          </td>
                        </tr>
                        {sec.items.slice(0, visibleCount(sec)).map((student) => {
                          const status = getStatusStyle(student.paymentStatus);
                          const needsAction = student.paymentStatus === "grace_period";
                          return (
                            <tr
                              key={student.id}
                              onClick={() => setSelected(student)}
                              className="cursor-pointer hover:bg-[var(--bg-hover)] transition-colors"
                              style={{ height: "var(--row-h-compact)" }}
                            >
                              <td className="px-5 text-[12px]" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-medium" style={{ background: "var(--bg-surface-raised)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
                                    {student.avatarInitials}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-[12px] truncate max-w-[200px]" style={{ color: "var(--text-primary)" }}>{student.name}</p>
                                    <p className="text-[10px] truncate max-w-[200px]" style={{ color: "var(--text-tertiary)" }}>{student.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 text-[12px] font-medium tabular-nums whitespace-nowrap" style={{ color: "var(--text-primary)", borderBottom: "1px solid var(--border-subtle)" }}>
                                $1,200
                              </td>
                              <td className="px-5 text-[12px]" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap inline-flex items-center gap-1.5" style={{ color: status.color, background: status.bg }}>
                                    <span className="w-1 h-1 rounded-full" style={{ background: status.color }} />
                                    {status.label}
                                  </span>
                                  {needsAction && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); remind(student); }}
                                      className="px-2.5 py-1 text-[10px] rounded-lg whitespace-nowrap transition-colors cursor-pointer hover:bg-[color:var(--bg-hover)]"
                                      style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
                                    >
                                      Recordar
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {visibleCount(sec) < sec.items.length && (
                          <tr>
                            <td colSpan={3} className="px-5 py-2.5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                              <button onClick={() => revealMore(sec.key, sec.items.length)} className="text-[12px] hover:underline cursor-pointer" style={{ color: "var(--text-primary)" }}>
                                {sec.items.length - visibleCount(sec) <= 50 ? `Mostrar los ${sec.items.length}` : "Mostrar 50 más"}
                              </button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    ))}
                  </table>
                </div>

                {/* ═══ MOBILE LIST (<768px) ═══ */}
                <div className="md:hidden">
                  {grouped.map((sec) => (
                    <div key={sec.key}>
                      <div className="px-4 pt-4 pb-2 text-[11px] uppercase font-medium" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
                        {sec.title} · {sec.items.length}
                      </div>
                      {sec.items.slice(0, visibleCount(sec)).map((student, idx, arr) => {
                        const status = getStatusStyle(student.paymentStatus);
                        const isLast = idx === arr.length - 1;
                        return (
                          <button
                            key={student.id}
                            onClick={() => setSelected(student)}
                            className="w-full flex items-center gap-3 pl-4 pr-4 min-h-[60px] text-left transition-colors active:bg-[var(--bg-hover)]"
                          >
                            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[11px] font-medium" style={{ background: "var(--bg-surface-overlay)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
                              {student.avatarInitials}
                            </div>
                            {/* Separador inset: empieza después del avatar */}
                            <div className="flex-1 min-w-0 flex items-center gap-3 py-3" style={{ borderBottom: isLast ? "none" : "1px solid var(--border-subtle)" }}>
                              <div className="min-w-0 flex-1">
                                <p className="text-[15px] font-medium truncate" style={{ color: "var(--text-primary)" }}>{student.name}</p>
                                <p className="text-[13px] truncate" style={{ color: "var(--text-secondary)" }}>{student.email}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className="text-[15px] tabular-nums" style={{ color: "var(--text-primary)" }}>$1,200</span>
                                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap" style={{ color: status.color, background: status.bg }}>{status.label}</span>
                              </div>
                              <ChevronRight size={14} strokeWidth={1.75} className="shrink-0" style={{ color: "var(--text-tertiary)" }} />
                            </div>
                          </button>
                        );
                      })}
                      {visibleCount(sec) < sec.items.length && (
                        <button
                          onClick={() => revealMore(sec.key, sec.items.length)}
                          className="w-full text-left pl-4 pr-4 py-3 text-[12px] cursor-pointer active:bg-[var(--bg-hover)]"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {sec.items.length - visibleCount(sec) <= 50 ? `Mostrar los ${sec.items.length}` : "Mostrar 50 más"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Stripe & SaaS Billing Status (Col 3) */}
          <div className="space-y-5 flex flex-col">
            
            {/* Stripe Integration */}
            <div
              className="rounded-xl border overflow-hidden p-5"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
            >
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em] border-b border-[var(--border-subtle)] pb-3" style={{ color: "var(--text-secondary)" }}>
                Pasarela de Pagos (Stripe)
              </h3>
              
              <div className="mt-4 flex items-center gap-3">
                <Plug size={20} strokeWidth={1.75} style={{ color: "var(--color-success)" }} />
                <div>
                  <p className="text-[12px] font-semibold" style={{ color: "var(--color-success)" }}>
                    Conectado con éxito
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                    Las mensualidades se cobran automáticamente los días de corte del cliente.
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => alert("Redirigiendo a Panel Stripe Express de MyCoach...")}
                className="mt-5 w-full py-2 border rounded-xl text-[11px] font-medium transition-all cursor-pointer hover:bg-[color:var(--bg-hover)]"
                style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
              >
                Ver Dashboard de Stripe
              </button>
            </div>

            {/* SaaS Subscription Info */}
            <div
              className="rounded-xl border overflow-hidden p-5"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
            >
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em] border-b border-[var(--border-subtle)] pb-3" style={{ color: "var(--text-secondary)" }}>
                Tu cuenta SaaS (MyCoach)
              </h3>
              
              <div className="mt-4 space-y-3 text-[12px]">
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-tertiary)" }}>Plan Actual</span>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Coach PRO</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-tertiary)" }}>Costo Mensual</span>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>$49.00 USD</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-tertiary)" }}>Próximo Cargo</span>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>24 de Junio, 2026</span>
                </div>
              </div>

              <div style={{ borderBottom: "1px solid var(--border-subtle)", margin: "15px 0" }} />

              <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--color-success)" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-subtle-pulse" style={{ background: "var(--color-success)" }} />
                <span>Tarjeta de débito activa (termina en 4242)</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ═══ Detalle de cobro — DetailOverlay (sheet móvil / dialog desktop) ═══ */}
      {selected && (() => {
        const status = getStatusStyle(selected.paymentStatus);
        const dueDate = calculateDueDate(selected.joinedDate, selected.paymentStatus);
        const close = () => setSelected(null);
        return (
          <DetailOverlay onClose={close} ariaLabel={`Cobro de ${selected.name}`} desktop="dialog">
            <PaymentDetailBody
              student={selected}
              status={status}
              dueDate={dueDate}
              onClose={close}
              onRemind={() => { remind(selected); close(); }}
            />
          </DetailOverlay>
        );
      })()}
    </>
  );
}
