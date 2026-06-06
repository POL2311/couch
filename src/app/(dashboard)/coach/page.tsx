"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { CalendarClock, Activity } from "lucide-react";
import { type Student } from "@/lib/mock-data";
import { buildFeedItems } from "@/lib/activity";
import { FeedRow } from "@/components/feed-row";
import { InfoHint } from "@/components/info-hint";
import { ChartSkeleton, RowSkeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";

const FEED_CAP = 6;

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

  // Feed derivado de la misma fuente (alumnos). El dashboard solo muestra los primeros FEED_CAP.
  const feedItems = useMemo(() => buildFeedItems(students), [students]);

  return (
    <>
      {/* Header */}
      <header
        className="px-4 md:px-8 py-5 flex items-center justify-between shrink-0"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <h1 className="text-[16px] font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Resumen de Control
          </h1>
          <InfoHint text="Resumen del estado de tu negocio: ingresos, adherencia y alertas." />
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
      <div className="flex-1 px-4 md:px-8 py-6 space-y-6 overflow-y-auto pb-24 md:pb-8">
        
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* MRR Card */}
          <div
            className="p-5 rounded-xl border animate-fade-in flex flex-col"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <span className="text-[11px] uppercase font-medium truncate" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
              <span className="md:hidden">MRR</span>
              <span className="hidden md:inline">Ingresos recurrentes (MRR)</span>
            </span>
            <p className="text-[clamp(1.5rem,5vw,1.875rem)] font-semibold tabular-nums leading-none mt-2 whitespace-nowrap" style={{ color: stats.mrr === 0 ? "var(--text-tertiary)" : "var(--text-primary)" }}>
              ${stats.mrr.toLocaleString("es-MX")}
              <span className="text-[13px] font-medium ml-1" style={{ color: "var(--text-secondary)" }}>MXN</span>
            </p>
            <span className="text-[12px] mt-2 flex items-center gap-1.5 min-w-0" style={{ color: "var(--text-secondary)" }}>
              <span className="inline-block rounded-full shrink-0" style={{ width: 6, height: 6, background: "var(--color-success)" }} />
              <span className="truncate">AutoCobro activo</span>
            </span>
          </div>

          {/* Compliance Card */}
          <div
            className="p-5 rounded-xl border animate-fade-in flex flex-col"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <span className="text-[11px] uppercase font-medium truncate" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
              <span className="md:hidden">Adherencia</span>
              <span className="hidden md:inline">Adherencia promedio</span>
            </span>
            <p className="text-[clamp(1.5rem,5vw,1.875rem)] font-semibold tabular-nums leading-none mt-2 whitespace-nowrap" style={{ color: stats.avgAdherence === 0 ? "var(--text-tertiary)" : "var(--text-primary)" }}>
              {stats.avgAdherence}%
            </p>
            {/* Objetivo 80% visualizado: barra + tick */}
            <div className="relative mt-3" title="Objetivo: 80%">
              <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "var(--bg-surface-overlay)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(stats.avgAdherence, 100)}%`, background: stats.avgAdherence >= 80 ? "var(--color-success)" : "var(--color-warning)", transition: "width 0.6s ease-out" }}
                />
              </div>
              <div className="absolute top-0 bottom-0" style={{ left: "80%", width: 1, background: "var(--text-tertiary)" }} />
            </div>
          </div>

          {/* Active Students Card */}
          <div
            className="p-5 rounded-xl border animate-fade-in flex flex-col"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <span className="text-[11px] uppercase font-medium truncate" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
              <span className="md:hidden">Activos</span>
              <span className="hidden md:inline">Alumnos activos</span>
            </span>
            <p className="text-[clamp(1.5rem,5vw,1.875rem)] font-semibold tabular-nums leading-none mt-2 whitespace-nowrap" style={{ color: stats.active === 0 ? "var(--text-tertiary)" : "var(--text-primary)" }}>
              {stats.active}
              <span className="text-[13px] font-medium ml-1" style={{ color: "var(--text-secondary)" }}>de {stats.total}</span>
            </p>
          </div>

          {/* Alerts Card — clickable → filtro de atención */}
          <Link
            href="/coach/students?estado=atencion"
            className="p-5 rounded-xl border animate-fade-in flex flex-col cursor-pointer transition-colors hover:bg-[color:var(--bg-hover)]"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <span className="text-[11px] uppercase font-medium truncate" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
              <span className="md:hidden">Alertas</span>
              <span className="hidden md:inline">Alertas de suspensión</span>
            </span>
            {/* Cero alertas → terciario (tranquilo); >0 → danger (señal) */}
            <p className="text-[clamp(1.5rem,5vw,1.875rem)] font-semibold tabular-nums leading-none mt-2 whitespace-nowrap" style={{ color: stats.grace + stats.inactive > 0 ? "var(--color-danger)" : "var(--text-tertiary)" }}>
              {stats.grace + stats.inactive}
            </p>
            <span className="text-[12px] mt-2 truncate" style={{ color: "var(--text-secondary)" }}>
              {stats.grace} gracia · {stats.inactive} suspendidos
            </span>
          </Link>

        </div>

        {/* Center Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Adherence Graph */}
          <div
            className="rounded-xl border overflow-hidden"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <h3 className="text-[14px] font-medium" style={{ color: "var(--text-primary)" }}>
                Curva de adherencia
              </h3>
              <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Orden: mayor a menor</span>
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
              <h3 className="text-[14px] font-medium" style={{ color: "var(--text-primary)" }}>
                Cambios programados
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
                stats.upcomingChanges.slice(0, 5).map((change) => (
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
              {!isLoading && stats.upcomingChanges.length > 5 && (
                <div className="text-center pt-1">
                  <Link href="/coach/periodization" className="text-[12px] hover:underline" style={{ color: "var(--text-primary)" }}>
                    Ver todos ({stats.upcomingChanges.length})
                  </Link>
                </div>
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
              feedItems.slice(0, FEED_CAP).map((item) => <FeedRow key={item.key} item={item} />)
            )}
          </div>
          {!isLoading && feedItems.length > FEED_CAP && (
            <div className="px-5 py-3 border-t border-[var(--border-subtle)] text-center">
              <Link href="/coach/activity" className="text-[12px] hover:underline" style={{ color: "var(--text-primary)" }}>
                Ver toda la actividad
              </Link>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
