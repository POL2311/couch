"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { type Student } from "@/lib/mock-data";

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
            className="p-5 rounded-xl border animate-fade-in"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <span className="text-[10px] uppercase tracking-[0.06em] font-medium" style={{ color: "var(--text-tertiary)" }}>
              Ingresos Recurrentes (MRR)
            </span>
            <p className="text-[22px] font-light mt-1.5 tabular-nums" style={{ color: "var(--text-primary)" }}>
              {isLoading ? "—" : `$${stats.mrr.toLocaleString("es-MX")} MXN`}
            </p>
            <span className="text-[9px] mt-1 block" style={{ color: "var(--color-success)" }}>
              ● Cobros automáticos activos
            </span>
          </div>

          {/* Compliance Card */}
          <div
            className="p-5 rounded-xl border animate-fade-in"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <span className="text-[10px] uppercase tracking-[0.06em] font-medium" style={{ color: "var(--text-tertiary)" }}>
              Adherencia Promedio
            </span>
            <p className="text-[22px] font-light mt-1.5 tabular-nums" style={{ color: "var(--text-primary)" }}>
              {isLoading ? "—" : `${stats.avgAdherence}%`}
            </p>
            <span className="text-[9px] mt-1 block" style={{ color: "var(--text-secondary)" }}>
              Objetivo: mantener &gt;80%
            </span>
          </div>

          {/* Active Students Card */}
          <div
            className="p-5 rounded-xl border animate-fade-in"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <span className="text-[10px] uppercase tracking-[0.06em] font-medium" style={{ color: "var(--text-tertiary)" }}>
              Alumnos Activos
            </span>
            <p className="text-[22px] font-light mt-1.5 tabular-nums" style={{ color: "var(--text-primary)" }}>
              {isLoading ? "—" : stats.active}
            </p>
            <span className="text-[9px] mt-1 block" style={{ color: "var(--text-secondary)" }}>
              De {stats.total} alumnos registrados
            </span>
          </div>

          {/* Alerts Card */}
          <div
            className="p-5 rounded-xl border animate-fade-in"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <span className="text-[10px] uppercase tracking-[0.06em] font-medium" style={{ color: "var(--text-tertiary)" }}>
              Alertas de Suspensión
            </span>
            <p className="text-[22px] font-light mt-1.5 tabular-nums" style={{ color: stats.grace + stats.inactive > 0 ? "var(--color-danger)" : "var(--text-primary)" }}>
              {isLoading ? "—" : stats.grace + stats.inactive}
            </p>
            <span className="text-[9px] mt-1 block" style={{ color: "var(--text-secondary)" }}>
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
              <span className="text-[10px] text-zinc-400">Orden: Mayor a Menor</span>
            </div>
            
            <div className="p-5 flex flex-col justify-end" style={{ height: "180px" }}>
              {isLoading || students.length < 2 ? (
                <div className="flex-1 flex items-center justify-center text-zinc-300 text-[12px]">
                  Cargando gráfica...
                </div>
              ) : (
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
              )}
              <div className="flex justify-between mt-3 border-t border-[var(--border-subtle)] pt-2 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                <span>100% Adherencia</span>
                <span>Promedio</span>
                <span>0% Adherencia</span>
              </div>
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
              <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">AutoCron</span>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto max-h-[180px] space-y-3">
              {isLoading ? (
                <p className="text-[12px] text-zinc-400 text-center py-6">Buscando planificaciones...</p>
              ) : stats.upcomingChanges.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>Sin cambios programados para este mes</p>
                  <Link href="/coach/students" className="text-[10px] text-zinc-400 hover:underline mt-1 inline-block">
                    Programar cambio de etapa +
                  </Link>
                </div>
              ) : (
                stats.upcomingChanges.map((change) => (
                  <div key={change.id} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[12px]">
                    <div>
                      <strong className="font-medium" style={{ color: "var(--text-primary)" }}>{change.name}</strong>
                      <span className="mx-2 text-zinc-300">|</span>
                      <span style={{ color: "var(--text-secondary)" }}>
                        Nueva Etapa: {change.stage} (E{change.stageNumber})
                      </span>
                    </div>
                    <span className="text-[10px] font-medium tabular-nums text-zinc-400 bg-white border border-[var(--border-subtle)] px-2 py-0.5 rounded-md">
                      📅 {change.date.split("-").slice(1).join("/")}
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
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--text-secondary)" }}>
              Actividad Reciente del Dashboard
            </h3>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {[
              { time: "Hace 10m", title: "Pesaje Reportado", desc: "María López García reportó peso diario: 62.5 kg (-1.5 kg).", icon: "⚖️" },
              { time: "Hace 1h", title: "Entrenamiento Completado", desc: "Carlos Ruiz Hernández marcó como completada la rutina 'Pull'.", icon: "💪" },
              { time: "Hace 3h", title: "Nuevo Alumno Creado", desc: "Has registrado a Camila Herrera Solís en etapa de Definición.", icon: "👤" },
              { time: "Ayer", title: "Factura Emitida", desc: "Se generó cobro automático recurrente de Stripe para Pedro Sánchez Ríos.", icon: "💳" }
            ].map((feed, i) => (
              <div key={i} className="px-5 py-4 flex items-start gap-4 text-[12px]">
                <span className="text-lg shrink-0 mt-0.5">{feed.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <strong className="font-semibold" style={{ color: "var(--text-primary)" }}>{feed.title}</strong>
                    <span className="text-[10px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>{feed.time}</span>
                  </div>
                  <p className="mt-1" style={{ color: "var(--text-secondary)" }}>{feed.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
