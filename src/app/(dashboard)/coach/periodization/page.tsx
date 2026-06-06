"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { type Student } from "@/lib/mock-data";
import { RowSkeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";

export default function PeriodizationPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    fetchStudents();
  }, []);

  // Calculate statistics
  const metrics = useMemo(() => {
    const total = students.length;
    const volumen = students.filter(s => s.stage === "Volumen").length;
    const definicion = students.filter(s => s.stage === "Definición").length;
    const mant = students.filter(s => s.stage === "Mantenimiento").length;
    const recomp = students.filter(s => s.stage === "Recomposición").length;

    const scheduled = students.filter((s: any) => s.scheduledChange != null).map((s: any) => ({
      id: s.id,
      name: s.name,
      executionDate: s.scheduledChange.executionDate,
      targetStage: s.scheduledChange.stage,
      targetStageNumber: s.scheduledChange.stageNumber,
    }));

    return { total, volumen, definicion, mant, recomp, scheduled };
  }, [students]);

  const cancelScheduledChange = async (studentId: string) => {
    if (confirm("¿Seguro que deseas cancelar este cambio programado?")) {
      try {
        const response = await fetch(`/api/students/${studentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            detailUpdates: { scheduledChange: null }
          })
        });
        if (response.ok) {
          fetchStudents();
        }
      } catch (err) {
        console.error(err);
      }
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
            Periodización y Ciclos
          </h1>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Supervisa la distribución de tus alumnos por objetivos y los cambios de etapa programados.
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 lg:px-8 py-6 space-y-6 overflow-y-auto pb-24 lg:pb-8">
        
        {/* Stage distribution KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Volumen", count: metrics.volumen, color: "var(--stage-volumen)", bg: "var(--stage-volumen-subtle)" },
            { label: "Definición", count: metrics.definicion, color: "var(--stage-definicion)", bg: "var(--stage-definicion-subtle)" },
            { label: "Mantenimiento", count: metrics.mant, color: "var(--stage-mantenimiento)", bg: "var(--stage-mantenimiento-subtle)" },
            { label: "Recomposición", count: metrics.recomp, color: "var(--stage-recomposicion)", bg: "var(--stage-recomposicion-subtle)" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border animate-fade-in"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: item.color, background: item.bg }}>
                  {isLoading ? "—" : `${item.count} alumnos`}
                </span>
              </div>
              <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-surface-overlay)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: metrics.total > 0 ? `${(item.count / metrics.total) * 100}%` : "0%",
                    background: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Center Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Timeline of Scheduled Changes (Col 1 & 2) */}
          <div
            className="lg:col-span-2 rounded-xl border overflow-hidden flex flex-col"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-surface-raised)]">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--text-secondary)" }}>
                Cronograma de Cambios Programados
              </h3>
              <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Ejecución automática</span>
            </div>

            <div className="p-5 flex-1 space-y-4">
              {isLoading ? (
                <RowSkeleton count={4} />
              ) : metrics.scheduled.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  message="No hay cambios programados"
                  hint="Usa las acciones en lote de la lista de alumnos para automatizar cambios."
                />
              ) : (
                <div className="relative border-l border-[color:var(--border-default)] pl-4 ml-2 space-y-6">
                  {metrics.scheduled.map((change) => (
                    <div key={change.id} className="relative animate-fade-in">
                      {/* Timeline dot — estado "programado" = warning; recorte vía color de la superficie detrás */}
                      <span
                        className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-[color:var(--bg-surface)]"
                        style={{ background: "var(--color-warning)" }}
                      />

                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] hover:border-[color:var(--border-strong)] transition-all">
                        <div>
                          <Link href={`/coach/students/${change.id}`} className="text-[13px] font-semibold hover:underline" style={{ color: "var(--text-primary)" }}>
                            {change.name}
                          </Link>
                          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                            Transición a <strong className="font-medium" style={{ color: "var(--text-primary)" }}>{change.targetStage} (E{change.targetStageNumber})</strong>
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className="text-[11px] font-semibold tabular-nums border border-[var(--border-subtle)] px-2.5 py-1 rounded-md"
                            style={{ background: "var(--bg-surface-raised)", color: "var(--text-secondary)" }}
                          >
                            Fecha: {new Date(change.executionDate + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                          </span>
                          <button
                            onClick={() => cancelScheduledChange(change.id)}
                            className="p-1 rounded-md transition-colors cursor-pointer hover:bg-[color:var(--color-danger-subtle)]"
                            style={{ color: "var(--color-danger)" }}
                            title="Cancelar programación"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 9m-4.72 0-.34-9m9.96-3-3.2 13.62c-.18.77-.84 1.32-1.63 1.32H9.31c-.79 0-1.45-.55-1.63-1.32L4.52 6m12.18 0a8.967 8.967 0 0 1-2.3 5.34m-3.4 3.4A8.967 8.967 0 0 1 9 6h6.82m0 0V4.5A2.25 2.25 0 0 0 13.5 2.25h-3A2.25 2.25 0 0 0 8.25 4.5V6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Current Periodization Strategy (Col 3) */}
          <div
            className="rounded-xl border overflow-hidden flex flex-col"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-raised)]">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--text-secondary)" }}>
                Distribución de Alumnos
              </h3>
            </div>
            
            <div className="p-5 flex-1 space-y-4 text-[12px]">
              <p style={{ color: "var(--text-secondary)" }}>
                La periodización adecuada evita estancamientos. Aconseja a tus alumnos cambiar de ciclo cada 8-12 semanas.
              </p>
              
              <div className="space-y-3 pt-2">
                {[
                  { label: "Volumen (Ganancia)", count: metrics.volumen, percent: metrics.total > 0 ? (metrics.volumen / metrics.total) * 100 : 0, color: "var(--stage-volumen)" },
                  { label: "Definición (Pérdida)", count: metrics.definicion, percent: metrics.total > 0 ? (metrics.definicion / metrics.total) * 100 : 0, color: "var(--stage-definicion)" },
                  { label: "Mantenimiento", count: metrics.mant, percent: metrics.total > 0 ? (metrics.mant / metrics.total) * 100 : 0, color: "var(--stage-mantenimiento)" },
                  { label: "Recomposición", count: metrics.recomp, percent: metrics.total > 0 ? (metrics.recomp / metrics.total) * 100 : 0, color: "var(--stage-recomposicion)" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-medium">
                      <span style={{ color: "var(--text-primary)" }}>{item.label}</span>
                      <span style={{ color: "var(--text-secondary)" }}>{item.count} ({Math.round(item.percent)}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-surface-overlay)" }}>
                      <div className="h-full" style={{ width: `${item.percent}%`, background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}
