"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Scale, UserPlus, ArrowDownRight, ArrowUpRight, CalendarClock, Activity } from "lucide-react";
import { type Student } from "@/lib/mock-data";
import { ChartSkeleton, RowSkeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";

function formatFeedDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

export default function CoachDashboard() {
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

  // Compute dynamic stats
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.paymentStatus === "active").length;
    const grace = students.filter((s) => s.paymentStatus === "grace_period").length;
    const inactive = students.filter((s) => s.paymentStatus === "inactive").length;
    
    // MRR: assuming $1,200 MXN per active student, and $600 for grace_period
    const mrr = (active * 1200) + (grace * 600);
    
    // Average compliance
    const avgAdherence = total > 0 
      ? Math.round(students.reduce((acc, s) => acc + s.completionRate, 0) / total)
      : 0;

    // Upcoming periodizations
    const upcomingChanges = students.filter((s: any) => s.scheduledChange != null).map((s: any) => ({
      id: s.id,
      name: s.name,
      stage: s.scheduledChange.stage,
      stageNumber: s.scheduledChange.stageNumber,
      date: s.scheduledChange.executionDate,
    }));

    return { total, active, grace, inactive, mrr, avgAdherence, upcomingChanges };
  }, [students]);

  // Visual SVG chart representing adherence values
  const adherencePoints = useMemo(() => {
    if (students.length === 0) return "";
    const sorted = [...students].sort((a, b) => b.completionRate - a.completionRate);
    const chartW = 400;
    const chartH = 100;
    return sorted.map((s, i) => {
      const x = (i / (sorted.length - 1 || 1)) * chartW;
      const y = chartH - (s.completionRate / 100) * (chartH - 20);
      return `${x},${y}`;
    }).join(" ");
  }, [students]);

  // Activity feed derived from the SAME source as counts/charts (los alumnos fetchados).
  // Sin nuevas llamadas API: solo deriva ítems de campos reales (pesajes, altas).
  const feedItems = useMemo(() => {
    const items: Array<{ key: string; Icon: typeof Scale; title: string; desc: string; date: string; delta?: number }> = [];

    // Pesajes más recientes
    [...students]
      .sort((a, b) => b.lastWeighIn.localeCompare(a.lastWeighIn))
      .slice(0, 3)
      .forEach((s) => {
        items.push({
          key: `w-${s.id}`,
          Icon: Scale,
          title: "Pesaje reportado",
          desc: `${s.name} reportó ${s.currentWeight} kg.`,
          date: s.lastWeighIn,
          delta: Math.round((s.currentWeight - s.previousWeight) * 10) / 10,
        });
      });

    // Alta más reciente
    const newest = [...students].sort((a, b) => b.joinedDate.localeCompare(a.joinedDate))[0];
    if (newest) {
      items.push({
        key: `j-${newest.id}`,
        Icon: UserPlus,
        title: "Nuevo alumno",
        desc: `${newest.name} se unió en etapa de ${newest.stage}.`,
        date: newest.joinedDate,
      });
    }

    return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [students]);

  return (
    <>
      {/* Header */}
      <header
        className="px-4 lg:px-8 py-5 flex items-center justify-between shrink-0"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div>
          <h1 className="text-[16px] font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Resumen de Control
          </h1>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Bienvenido, Coach Alejandro. Aquí está el estado de tu negocio hoy.
          </p>
        </div>
        
        <Link
          href="/coach/students"
          className="px-3.5 py-2 rounded-lg text-[12px] font-medium transition-all duration-150"
          style={{ background: "var(--accent-primary)", color: "var(--text-inverse)" }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
        >
          Ver Alumnos
        </Link>
      </header>

      {/* Main Grid */}
      <div className="flex-1 px-4 lg:px-8 py-6 space-y-6 overflow-y-auto pb-24 lg:pb-8">
        
        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* MRR Card */}
          <div
            className="p-5 rounded-xl border animate-fade-in flex flex-col"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <span className="text-[11px] uppercase font-medium" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
              Ingresos Recurrentes (MRR)
            </span>
            {/* Valor: nunca "—"; cero real → formateado en terciario */}
            <p className="text-[30px] font-semibold tabular-nums leading-none mt-2" style={{ color: stats.mrr === 0 ? "var(--text-tertiary)" : "var(--text-primary)" }}>
              ${stats.mrr.toLocaleString("es-MX")} MXN
            </p>
            <span className="text-[12px] mt-2 flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
              <span className="inline-block rounded-full shrink-0" style={{ width: 6, height: 6, background: "var(--color-success)" }} />
              Cobros automáticos activos
            </span>
          </div>

          {/* Compliance Card */}
          <div
            className="p-5 rounded-xl border animate-fade-in flex flex-col"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <span className="text-[11px] uppercase font-medium" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
              Adherencia Promedio
            </span>
            <p className="text-[30px] font-semibold tabular-nums leading-none mt-2" style={{ color: stats.avgAdherence === 0 ? "var(--text-tertiary)" : "var(--text-primary)" }}>
              {stats.avgAdherence}%
            </p>
            <span className="text-[12px] mt-2" style={{ color: "var(--text-secondary)" }}>
              Objetivo: mantener &gt;80%
            </span>
          </div>

          {/* Active Students Card */}
          <div
            className="p-5 rounded-xl border animate-fade-in flex flex-col"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <span className="text-[11px] uppercase font-medium" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
              Alumnos Activos
            </span>
            <p className="text-[30px] font-semibold tabular-nums leading-none mt-2" style={{ color: stats.active === 0 ? "var(--text-tertiary)" : "var(--text-primary)" }}>
              {stats.active}
            </p>
            <span className="text-[12px] mt-2" style={{ color: "var(--text-secondary)" }}>
              De {stats.total} alumnos registrados
            </span>
          </div>

          {/* Alerts Card */}
          <div
            className="p-5 rounded-xl border animate-fade-in flex flex-col"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <span className="text-[11px] uppercase font-medium" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
              Alertas de Suspensión
            </span>
            {/* Cero alertas → terciario (estado tranquilo); >0 → danger (señal semántica) */}
            <p className="text-[30px] font-semibold tabular-nums leading-none mt-2" style={{ color: stats.grace + stats.inactive > 0 ? "var(--color-danger)" : "var(--text-tertiary)" }}>
              {stats.grace + stats.inactive}
            </p>
            <span className="text-[12px] mt-2" style={{ color: "var(--text-secondary)" }}>
              {stats.grace} en gracia · {stats.inactive} suspendidos
            </span>
          </div>

        </div>

        {/* Center Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Adherence Graph */}
          <div
            className="rounded-xl border overflow-hidden"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--text-secondary)" }}>
                Curva de Adherencia (Alumnos)
              </h3>
              <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Orden: Mayor a Menor</span>
            </div>
            
            <div className="p-5 flex flex-col justify-end" style={{ height: "180px" }}>
              {isLoading ? (
                <ChartSkeleton className="flex-1" />
              ) : students.length < 2 ? (
                <EmptyState
                  icon={Activity}
                  message="Aún no hay datos de adherencia"
                  hint="Registra alumnos y sus check-ins para ver la curva."
                  cta={
                    stats.total === 0 ? (
                      <Link href="/coach/students" className="text-[12px] hover:underline" style={{ color: "var(--text-primary)" }}>
                        Registrar primer alumno
                      </Link>
                    ) : undefined
                  }
                  className="flex-1 py-0"
                />
              ) : (
                <>
                  <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-24 overflow-visible">
                    <polyline
                      fill="none"
                      stroke="var(--text-secondary)"
                      strokeWidth="1.5"
                      points={adherencePoints}
                    />
                    {students.map((s, idx) => {
                      const sorted = [...students].sort((a, b) => b.completionRate - a.completionRate);
                      const x = (idx / (sorted.length - 1)) * 400;
                      const y = 100 - (s.completionRate / 100) * 80;
                      return (
                        <circle
                          key={s.id}
                          cx={x}
                          cy={y}
                          r="3"
                          fill={s.completionRate >= 80 ? "var(--color-success)" : "var(--color-warning)"}
                        />
                      );
                    })}
                  </svg>
                  <div className="flex justify-between mt-3 border-t border-[var(--border-subtle)] pt-2 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                    <span>100% Adherencia</span>
                    <span>Promedio</span>
                    <span>0% Adherencia</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Periodization Timeline */}
          <div
            className="rounded-xl border overflow-hidden flex flex-col"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--text-secondary)" }}>
                Próximos Cambios Programados
              </h3>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: "rgba(255, 255, 255, 0.08)", color: "var(--text-secondary)" }}>AutoCron</span>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto max-h-[180px] space-y-3">
              {isLoading ? (
                <RowSkeleton count={3} />
              ) : stats.upcomingChanges.length === 0 ? (
                <EmptyState
                  icon={CalendarClock}
                  message="No hay cambios programados"
                  cta={
                    <Link href="/coach/students" className="text-[12px] hover:underline" style={{ color: "var(--text-primary)" }}>
                      Programar cambio de etapa
                    </Link>
                  }
                />
              ) : (
                stats.upcomingChanges.map((change) => (
                  <div key={change.id} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[12px]">
                    <div>
                      <strong className="font-medium" style={{ color: "var(--text-primary)" }}>{change.name}</strong>
                      <span className="mx-2" style={{ color: "var(--text-tertiary)" }}>|</span>
                      <span style={{ color: "var(--text-secondary)" }}>
                        Nueva Etapa: {change.stage} (E{change.stageNumber})
                      </span>
                    </div>
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-medium tabular-nums border border-[var(--border-subtle)] px-2 py-0.5 rounded-md"
                      style={{ background: "var(--bg-surface-raised)", color: "var(--text-secondary)" }}
                    >
                      <CalendarClock size={16} strokeWidth={1.75} style={{ color: "var(--text-secondary)" }} />
                      {change.date.split("-").slice(1).join("/")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Activity Feed */}
        <div
          className="rounded-xl border overflow-hidden"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
        >
          <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
            <h3 className="text-[14px] font-medium" style={{ color: "var(--text-primary)" }}>
              Actividad reciente
            </h3>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {isLoading ? (
              <div className="p-5">
                <RowSkeleton count={3} />
              </div>
            ) : feedItems.length === 0 ? (
              <EmptyState icon={Activity} message="Aún no hay actividad reciente" className="py-10" />
            ) : (
              feedItems.map(({ key, Icon, title, desc, date, delta }) => (
                <div key={key} className="px-5 py-4 flex items-start gap-4">
                  {/* Contenedor de icono — 36x36, radius 10, fondo white/4, hairline */}
                  <div
                    className="shrink-0 flex items-center justify-center"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <Icon size={16} strokeWidth={1.75} style={{ color: "var(--text-secondary)" }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Título 14px/500 (primario) · timestamp 12px (terciario) */}
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-[14px] font-medium" style={{ color: "var(--text-primary)" }}>{title}</strong>
                      <span className="text-[12px] tabular-nums shrink-0" style={{ color: "var(--text-tertiary)" }}>{formatFeedDate(date)}</span>
                    </div>

                    {/* Descripción 13px (secundario) + chip de delta de peso real */}
                    <div className="flex items-center flex-wrap gap-2 mt-1">
                      <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{desc}</p>
                      {typeof delta === "number" && Math.abs(delta) >= 0.1 && (
                        // NOTA: el color del chip NO debe asumir que bajar de peso siempre es positivo.
                        // Debe depender del objetivo del alumno: en definición, perder peso es éxito (success);
                        // en volumen, perder peso es regresión (danger) y ganar peso es éxito. Aquí se usa
                        // success como placeholder hasta tener el objetivo del alumno en los datos.
                        <span
                          className="inline-flex items-center gap-0.5 text-[12px] tabular-nums px-1.5 py-0.5 rounded-md shrink-0"
                          style={{ background: "var(--color-success-subtle)", color: "var(--color-success)" }}
                        >
                          {delta < 0 ? <ArrowDownRight size={12} strokeWidth={1.75} /> : <ArrowUpRight size={12} strokeWidth={1.75} />}
                          {Math.abs(delta)} kg
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </>
  );
}
