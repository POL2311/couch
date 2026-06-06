"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Plug } from "lucide-react";
import { Skeleton } from "@/components/skeleton";
import { type Student } from "@/lib/mock-data";

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
        className="px-4 lg:px-8 py-5 flex items-center justify-between shrink-0"
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
      <div className="flex-1 px-4 lg:px-8 py-6 space-y-6 overflow-y-auto pb-24 lg:pb-8">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Subscriptions Table (Col 1 & 2) */}
          <div
            className="lg:col-span-2 rounded-xl border overflow-hidden flex flex-col"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-surface-raised)]">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--text-secondary)" }}>
                Cobros y Alumnos
              </h3>
              <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Facturación Mensual</span>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
                <thead>
                  <tr className="border-b border-[var(--border-subtle)]">
                    {["Alumno", "Cuota (MXN)", "Estado", "Próximo Vencimiento", ""].map((h, i) => (
                      <th
                        key={i}
                        className="px-5 py-3 text-left text-[10px] font-normal tracking-[0.06em] uppercase whitespace-nowrap"
                        style={{ color: "var(--text-tertiary)", background: "var(--bg-surface-raised)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={5} className="px-5 py-3">
                          <Skeleton className="h-9 w-full" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    students.map((student) => {
                      const status = getStatusStyle(student.paymentStatus);
                      const dueDate = calculateDueDate(student.joinedDate, student.paymentStatus);

                      return (
                        <tr key={student.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                          {/* Student */}
                          <td className="px-5 py-4 text-[12px]">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-medium"
                                style={{
                                  background: "var(--bg-surface-raised)",
                                  color: "var(--text-secondary)",
                                  border: "1px solid var(--border-default)",
                                }}
                              >
                                {student.avatarInitials}
                              </div>
                              <div>
                                <Link href={`/coach/students/${student.id}`} className="font-medium hover:underline text-[12px]" style={{ color: "var(--text-primary)" }}>
                                  {student.name}
                                </Link>
                                <span className="block text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{student.email}</span>
                              </div>
                            </div>
                          </td>

                          {/* Fee — moneda en el header de columna; celda solo el monto */}
                          <td className="px-5 py-4 text-[12px] font-medium tabular-nums whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
                            $1,200
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4 text-[12px]">
                            <span
                              className="text-[10px] px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap inline-flex items-center gap-1.5"
                              style={{ color: status.color, background: status.bg }}
                            >
                              <span className="w-1 h-1 rounded-full" style={{ background: status.color }} />
                              {status.label}
                            </span>
                          </td>

                          {/* Due Date */}
                          <td className="px-5 py-4 text-[12px] tabular-nums" style={{ color: "var(--text-secondary)" }}>
                            {new Date(dueDate + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                          </td>

                          {/* Action */}
                          <td className="px-5 py-4 text-[12px] text-right">
                            {student.paymentStatus !== "active" && (
                              <button
                                onClick={() => alert(`Recordatorio de pago enviado a ${student.name}`)}
                                className="px-2.5 py-1 text-[10px] rounded-lg border border-[var(--border-default)] transition-colors cursor-pointer hover:bg-[color:var(--bg-hover)]"
                                style={{ background: "var(--bg-surface-raised)", color: "var(--text-secondary)" }}
                              >
                                Recordar
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
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
    </>
  );
}
