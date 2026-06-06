"use client";

import Link from "next/link";
import { Flame, Calendar, Ruler, ArrowLeft, Droplet, UserX } from "lucide-react";
import { Skeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";
import { useMemo, useState, useEffect, useCallback } from "react";
import {
  type Student,
  type StudentDetail,
  type RoutineDay,
} from "@/lib/mock-data";
import ChangeStageModal from "@/components/change-stage-modal";

/* ═══════════════════════════════════════════
   Icons
   ═══════════════════════════════════════════ */

function IconBack() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  );
}

function IconDumbbell({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m6.5 6.5 11 11" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-1-1" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 3 1 1" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m18 22 4-4a6 6 0 1 0-8-8l-4 4a6 6 0 1 0-8-8L2 10a6 6 0 1 0 8 8l4-4a6 6 0 1 0 8 8z" />
    </svg>
  );
}

function IconUtensils({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 2v4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15V2v0a5 5 0 0 0-5 5v8c0 1.1.9 2 2 2h3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 17v5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 11v11" />
    </svg>
  );
}

function IconTrendingUp({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="16 7 22 7 22 13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconUsers({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */

function getStageColor(stage: string) {
  const map: Record<string, { color: string; bg: string }> = {
    Volumen: { color: "var(--stage-volumen)", bg: "var(--stage-volumen-subtle)" },
    Definición: { color: "var(--stage-definicion)", bg: "var(--stage-definicion-subtle)" },
    Mantenimiento: { color: "var(--stage-mantenimiento)", bg: "var(--stage-mantenimiento-subtle)" },
    Recomposición: { color: "var(--stage-recomposicion)", bg: "var(--stage-recomposicion-subtle)" },
  };
  return map[stage] || { color: "var(--text-secondary)", bg: "var(--bg-hover)" };
}

function getPaymentInfo(status: string) {
  const map: Record<string, { label: string; color: string }> = {
    active: { label: "Pago al día", color: "var(--color-success)" },
    inactive: { label: "Cuenta suspendida", color: "var(--color-danger)" },
    grace_period: { label: "Período de gracia", color: "var(--color-warning)" },
  };
  return map[status] || { label: status, color: "var(--text-secondary)" };
}

function formatDateLong(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ═══════════════════════════════════════════
   Weight Chart (CSS-only sparkline)
   ═══════════════════════════════════════════ */

function WeightChart({ history }: { history: { date: string; weight: number }[] }) {
  if (history.length < 1) return null;
  if (history.length === 1) {
    return (
      <div className="animate-fade-in text-center py-6">
        <p className="text-3xl font-light tabular-nums" style={{ color: "var(--text-primary)" }}>
          {history[0].weight} <span className="text-[13px] font-normal text-[var(--text-tertiary)]">kg</span>
        </p>
        <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>
          Peso inicial registrado el {formatDateLong(history[0].date)}
        </p>
      </div>
    );
  }

  const weights = history.map((h) => h.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;
  const chartH = 120;
  const chartW = 100; // percentage-based

  const points = history.map((h, i) => {
    const x = (i / (history.length - 1)) * chartW;
    const y = chartH - ((h.weight - min) / range) * (chartH - 16);
    return `${x},${y}`;
  }).join(" ");

  const firstWeight = history[0];
  const lastWeight = history[history.length - 1];
  const diff = lastWeight.weight - firstWeight.weight;

  return (
    <div className="animate-fade-in">
      {/* Summary */}
      <div className="flex items-end gap-3 mb-5">
        <span className="text-3xl font-light tabular-nums" style={{ color: "var(--text-primary)" }}>
          {lastWeight.weight}
        </span>
        <span className="text-[13px] mb-1" style={{ color: "var(--text-tertiary)" }}>kg</span>
        <span
          className="text-[13px] mb-1 tabular-nums ml-1"
          style={{ color: diff <= 0 ? "var(--color-success)" : "var(--color-info)" }}
        >
          {diff > 0 ? "+" : ""}{diff.toFixed(1)} kg
        </span>
        <span className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
          desde {formatDateLong(firstWeight.date).split(" de ").slice(1).join(" de ")}
        </span>
      </div>

      {/* SVG Chart */}
      <div className="relative" style={{ height: `${chartH}px` }}>
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          preserveAspectRatio="none"
          className="w-full h-full"
          style={{ overflow: "visible" }}
        >
          {/* Area fill */}
          <polygon
            points={`0,${chartH} ${points} ${chartW},${chartH}`}
            fill="url(#weightGradient)"
          />
          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="var(--text-secondary)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          {/* End dot */}
          <circle
            cx={chartW}
            cy={chartH - ((lastWeight.weight - min) / range) * (chartH - 16)}
            r="2.5"
            fill="var(--text-primary)"
            vectorEffect="non-scaling-stroke"
          />
          <defs>
            <linearGradient id="weightGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Date labels */}
      <div className="flex justify-between mt-2">
        <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
          {new Date(firstWeight.date + "T00:00:00").toLocaleDateString("es-MX", { month: "short" })}
        </span>
        <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
          {new Date(lastWeight.date + "T00:00:00").toLocaleDateString("es-MX", { month: "short" })}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Section Wrapper
   ═══════════════════════════════════════════ */

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
    >
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <h3 className="text-[13px] font-medium uppercase tracking-[0.06em]" style={{ color: "var(--text-secondary)" }}>
          {title}
        </h3>
        {action}
      </div>
      <div>{children}</div>
    </div>
  );
}

function EditButton({ label }: { label: string }) {
  return (
    <button
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] cursor-pointer"
      style={{
        color: "var(--text-tertiary)",
        border: "1px solid var(--border-default)",
        transition: "all var(--transition-fast)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-strong)";
        e.currentTarget.style.color = "var(--text-secondary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-default)";
        e.currentTarget.style.color = "var(--text-tertiary)";
      }}
    >
      <IconEdit />
      {label}
    </button>
  );
}

/* ═══════════════════════════════════════════
   Diet Section
   ═══════════════════════════════════════════ */

function DietSection({ detail }: { detail: StudentDetail }) {
  const { diet } = detail;

  if (!diet || diet.totalCalories === 0 || diet.meals.length === 0) {
    return (
      <Section title="Dieta asignada" action={<EditButton label="Asignar" />}>
        <div className="px-5 py-8 text-center">
          <svg className="w-8 h-8 mx-auto mb-2 text-[color:var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
          <p className="text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>Sin dieta asignada</p>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>Asigna macros y comidas para comenzar.</p>
        </div>
      </Section>
    );
  }

  return (
    <Section title="Dieta asignada" action={<EditButton label="Cambiar" />}>
      {/* Diet header */}
      <div className="px-5 pt-4 pb-4">
        <p className="text-[14px] font-medium mb-3" style={{ color: "var(--text-primary)" }}>{diet.name}</p>
        
        <div className="grid grid-cols-4 gap-2">
          {/* Calorías */}
          <div
            className="rounded-xl p-2.5 text-center"
            style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)" }}
          >
            <span className="block text-[14px] font-medium tabular-nums" style={{ color: "var(--text-primary)" }}>
              {diet.totalCalories}
            </span>
            <span className="block text-[10px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
              Calorías
            </span>
          </div>

          {/* Proteína */}
          <div
            className="rounded-xl p-2.5 text-center"
            style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)" }}
          >
            <span className="block text-[14px] font-medium tabular-nums" style={{ color: "var(--text-primary)" }}>
              {diet.macros.protein}g
            </span>
            <span className="block text-[10px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
              Proteína
            </span>
          </div>

          {/* Carbos */}
          <div
            className="rounded-xl p-2.5 text-center"
            style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)" }}
          >
            <span className="block text-[14px] font-medium tabular-nums" style={{ color: "var(--text-primary)" }}>
              {diet.macros.carbs}g
            </span>
            <span className="block text-[10px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
              Carbos
            </span>
          </div>

          {/* Grasas */}
          <div
            className="rounded-xl p-2.5 text-center"
            style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)" }}
          >
            <span className="block text-[14px] font-medium tabular-nums" style={{ color: "var(--text-primary)" }}>
              {diet.macros.fat}g
            </span>
            <span className="block text-[10px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
              Grasas
            </span>
          </div>
        </div>
      </div>

      {/* Meals */}
      <div>
        {diet.meals.map((meal, i) => (
          <div
            key={i}
            className="px-5 py-4"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[12px] tabular-nums w-12" style={{ color: "var(--text-tertiary)" }}>{meal.time}</span>
                <span className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>{meal.name}</span>
              </div>
              <span className="text-[11px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>{meal.calories} kcal</span>
            </div>
            <div className="ml-15 mt-2 space-y-1" style={{ marginLeft: "60px" }}>
              {meal.items.map((item, j) => (
                <p key={j} className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                  {item}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   Routine Section
   ═══════════════════════════════════════════ */

function RoutineSection({ detail }: { detail: StudentDetail }) {
  const { routine } = detail;
  const [activeDay, setActiveDay] = useState(0);

  if (!routine || routine.daysPerWeek === 0 || routine.days.length === 0) {
    return (
      <Section title="Rutina asignada" action={<EditButton label="Asignar" />}>
        <div className="px-5 py-8 text-center">
          <svg className="w-8 h-8 mx-auto mb-2 text-[color:var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
          </svg>
          <p className="text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>Sin rutina asignada</p>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>Crea un plan de entrenamiento semanal.</p>
        </div>
      </Section>
    );
  }

  const currentDay: RoutineDay = routine.days[activeDay];

  return (
    <Section title="Rutina asignada" action={<EditButton label="Cambiar" />}>
      {/* Routine header */}
      <div className="px-5 pt-4 pb-1">
        <p className="text-[14px] font-medium" style={{ color: "var(--text-primary)" }}>{routine.name}</p>
        <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>{routine.daysPerWeek} días / semana</p>
      </div>

      {/* Day tabs */}
      <div className="flex gap-1 px-5 py-3 overflow-x-auto no-scrollbar">
        {routine.days.map((day, i) => {
          const isActive = activeDay === i;
          return (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              className="px-3.5 py-1.5 rounded-lg text-[12px] whitespace-nowrap cursor-pointer"
              style={{
                background: isActive ? "var(--accent-primary)" : "var(--bg-surface-raised)",
                color: isActive ? "var(--text-inverse)" : "var(--text-secondary)",
                border: isActive ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                fontWeight: isActive ? 600 : 500,
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "var(--text-primary)";
                  e.currentTarget.style.borderColor = "var(--border-strong)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                }
              }}
            >
              {day.day.slice(0, 3)}
            </button>
          );
        })}
      </div>

      {/* Day content */}
      <div style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="px-5 py-3">
          <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
            {currentDay.label}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            {currentDay.muscleGroup}
          </p>
        </div>

        {/* Exercises */}
        {currentDay.exercises.map((ex, i) => (
          <div
            key={i}
            className="flex items-center px-5 py-3.5"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] mr-3.5"
              style={{ background: "var(--bg-surface-overlay)", color: "var(--text-tertiary)", border: "1px solid var(--border-subtle)" }}
            >
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px]" style={{ color: "var(--text-primary)" }}>{ex.name}</p>
            </div>
            <div className="flex items-center gap-4 ml-4">
              <span className="text-[12px] tabular-nums" style={{ color: "var(--text-secondary)" }}>
                {ex.sets}×{ex.reps}
              </span>
              {ex.weight && (
                <span className="text-[11px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>
                  {ex.weight}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   Measurements Section
   ═══════════════════════════════════════════ */

function MeasurementsSection({ detail }: { detail: any }) {
  if (!detail.measurements || detail.measurements.length === 0) return null;

  const latest = detail.measurements[detail.measurements.length - 1];
  const prev = detail.measurements.length > 1 ? detail.measurements[detail.measurements.length - 2] : null;

  const fields: { label: string; key: string; unit: string }[] = [
    { label: "Pecho", key: "chest", unit: "cm" },
    { label: "Cintura", key: "waist", unit: "cm" },
    { label: "Cadera", key: "hips", unit: "cm" },
    { label: "Brazo Izq", key: "armL", unit: "cm" },
    { label: "Brazo Der", key: "armR", unit: "cm" },
    { label: "Muslo Izq", key: "thighL", unit: "cm" },
    { label: "Muslo Der", key: "thighR", unit: "cm" },
  ];

  return (
    <Section title="Medidas corporales" action={<EditButton label="Actualizar" />}>
      <div className="px-5 py-2">
        <p className="text-[11px] mb-3" style={{ color: "var(--text-tertiary)" }}>
          Última medición: {formatDateLong(latest.date)}
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: "var(--border-subtle)" }}>
        {fields.map((f) => {
          const val = latest[f.key] as number;
          const prevVal = prev ? (prev[f.key] as number) : null;
          const diff = prevVal !== null && prevVal > 0 ? val - prevVal : null;

          return (
            <div key={f.key} className="flex flex-col items-center py-4" style={{ background: "var(--bg-surface)" }}>
              <span className="text-[11px] uppercase tracking-[0.06em]" style={{ color: "var(--text-tertiary)" }}>{f.label}</span>
              <span className="text-[18px] font-light tabular-nums mt-1" style={{ color: "var(--text-primary)" }}>
                {val > 0 ? `${val}` : "—"}
              </span>
              {diff !== null && diff !== 0 && (
                <span
                  className="text-[10px] tabular-nums mt-0.5"
                  style={{ color: f.key === "waist" ? (diff < 0 ? "var(--color-success)" : "var(--color-danger)") : "var(--text-tertiary)" }}
                >
                  {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                </span>
              )}
            </div>
          );
        })}
        {/* Empty cell to fill grid */}
        <div style={{ background: "var(--bg-surface)" }} />
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   Main Detail View
   ═══════════════════════════════════════════ */

export default function StudentDetailClient({ studentId }: { studentId: string }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [detail, setDetail] = useState<(StudentDetail & { height?: number; bodyFat?: number; photoName?: string; scheduledChange?: any }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isChangeStageModalOpen, setIsChangeStageModalOpen] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      const response = await fetch(`/api/students/${studentId}`);
      if (!response.ok) {
        throw new Error("Alumno no encontrado");
      }
      const data = await response.json();
      setStudent(data.student);
      setDetail(data.detail);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al cargar los detalles del alumno");
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    setIsLoading(true);
    fetchDetail();
  }, [fetchDetail]);

  if (isLoading) {
    return (
      <div className="flex-1 p-4 lg:p-8 space-y-5">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (error || !student || !detail) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={UserX}
          message={error || "Alumno no encontrado"}
          cta={
            <Link href="/coach/students" className="text-[13px] inline-flex items-center gap-1 hover:underline" style={{ color: "var(--text-primary)" }}>
              <ArrowLeft size={14} strokeWidth={1.75} />
              Volver a alumnos
            </Link>
          }
          className="animate-fade-in px-4"
        />
      </div>
    );
  }

  const stageStyle = getStageColor(student.stage);
  const paymentInfo = getPaymentInfo(student.paymentStatus);

  return (
    <>
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-30 px-4 lg:px-8 shrink-0"
        style={{
          /* Mismo cristal oscuro que la navegación (sidebar/bottom-bar) */
          background: "var(--bg-sidebar)",
          WebkitBackdropFilter: "blur(20px) saturate(120%)",
          backdropFilter: "blur(20px) saturate(120%)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {/* Top row */}
        <div className="flex items-center gap-4 py-3">
          <Link
            href="/coach/students"
            id="btn-back"
            className="p-2 -ml-2 rounded-xl cursor-pointer"
            style={{ color: "var(--text-tertiary)", transition: "color var(--transition-fast)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)"; }}
          >
            <IconBack />
          </Link>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[12px] font-medium overflow-hidden"
              style={{
                background: "var(--bg-surface-overlay)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-default)",
              }}
            >
              {detail.photoName ? (
                <img src={detail.photoName} alt={student.name} className="w-full h-full object-cover" />
              ) : (
                student.avatarInitials
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-[15px] font-medium truncate" style={{ color: "var(--text-primary)" }}>
                {student.name}
              </h1>
              <p className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>{student.email}</p>
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={() => setIsChangeStageModalOpen(true)}
            className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium cursor-pointer animate-fade-in"
            style={{
              background: "var(--text-primary)",
              color: "var(--text-inverse)",
              transition: "opacity var(--transition-fast)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            Cambiar Etapa
          </button>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 pb-3 overflow-x-auto no-scrollbar">
          <span
            className="text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap"
            style={{ color: stageStyle.color, background: stageStyle.bg }}
          >
            {student.stage} · E{student.stageNumber}
          </span>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span
              className={`w-1.5 h-1.5 rounded-full ${student.paymentStatus === "grace_period" ? "animate-subtle-pulse" : ""}`}
              style={{ background: paymentInfo.color }}
            />
            <span className="text-[11px]" style={{ color: paymentInfo.color }}>{paymentInfo.label}</span>
          </div>
          {detail.nextStageDate && (
            <span className="text-[11px] whitespace-nowrap" style={{ color: "var(--text-tertiary)" }}>
              Próx. etapa: {formatDateLong(detail.nextStageDate)}
            </span>
          )}
          {student.streak > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] whitespace-nowrap" style={{ color: "var(--color-warning)" }}>
              <Flame size={14} strokeWidth={1.75} />
              <span className="tabular-nums">{student.streak}</span> días
            </span>
          )}
          {detail.height && (
            <span className="inline-flex items-center gap-1 text-[11px] whitespace-nowrap" style={{ color: "var(--text-tertiary)" }}>
              <Ruler size={14} strokeWidth={1.75} />
              <span className="tabular-nums">{detail.height}</span> cm
            </span>
          )}
          {detail.bodyFat && (
            <span className="inline-flex items-center gap-1 text-[11px] whitespace-nowrap" style={{ color: "var(--text-tertiary)" }}>
              <Droplet size={14} strokeWidth={1.75} />
              <span className="tabular-nums">{detail.bodyFat}</span>% grasa
            </span>
          )}
        </div>
      </header>

      {/* ── Banner de Cambio Programado ── */}
      {detail.scheduledChange && (
        <div
          className="mx-4 lg:mx-8 mt-5 p-4 rounded-2xl flex items-center justify-between border animate-fade-in"
          style={{
            background: "var(--color-warning-subtle)",
            borderColor: "var(--color-warning)",
          }}
        >
          <div className="flex items-center gap-3">
            <Calendar size={16} strokeWidth={1.75} style={{ color: "var(--text-secondary)" }} />
            <div>
              <p className="text-[13px] font-semibold" style={{ color: "var(--color-warning)" }}>
                Cambio de Etapa Programado
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                Este alumno cambiará a la etapa de <strong className="font-semibold">{detail.scheduledChange.stage} (E{detail.scheduledChange.stageNumber})</strong> el día <strong className="font-semibold">{formatDateLong(detail.scheduledChange.executionDate)}</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={async () => {
              if (confirm("¿Deseas cancelar este cambio programado?")) {
                try {
                  const response = await fetch(`/api/students/${studentId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      detailUpdates: { scheduledChange: null }
                    })
                  });
                  if (response.ok) {
                    fetchDetail();
                  }
                } catch (err) {
                  console.error(err);
                }
              }
            }}
            className="px-3 py-1.5 rounded-xl border text-[11px] font-medium cursor-pointer transition-all duration-150"
            style={{
              borderColor: "var(--color-warning)",
              color: "var(--color-warning)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-warning)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--color-warning)";
            }}
          >
            Cancelar Programación
          </button>
        </div>
      )}

      {/* ── Content ── */}
      <div className="flex-1 px-4 lg:px-8 py-6 pb-24 lg:pb-8 space-y-5">
        {/* Top grid: Weight chart + Measurements */}
        <div id="progreso" className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Weight History */}
          <Section title="Progreso de peso">
            <div className="px-5 py-5">
              <WeightChart history={detail.weightHistory} />
            </div>
          </Section>

          {/* Measurements */}
          <MeasurementsSection detail={detail} />
        </div>

        {/* Middle grid: Diet + Routine */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div id="dieta" className="scroll-mt-24">
            <DietSection detail={detail} />
          </div>
          <div id="rutina" className="scroll-mt-24">
            <RoutineSection detail={detail} />
          </div>
        </div>

        {/* Bottom grid: Notes + Photos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Photos */}
          <Section title="Registro fotográfico">
            <div className="px-5 py-5 flex flex-col items-center justify-center min-h-[160px]">
              {detail.photoName ? (
                <div
                  className="relative group w-full max-w-[240px] rounded-xl overflow-hidden shadow-sm p-1"
                  style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)" }}
                >
                  <img
                    src={detail.photoName}
                    alt={`Foto de progreso de ${student.name}`}
                    className="w-full h-auto max-h-[200px] object-cover rounded-lg"
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    style={{ background: "var(--scrim)" }}
                  >
                    <a
                      href={detail.photoName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl text-[11px] font-medium shadow hover:scale-105 transition-transform"
                      style={{ background: "var(--accent-primary)", color: "var(--text-inverse)" }}
                    >
                      Pantalla completa
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <svg className="w-8 h-8 mx-auto mb-2 text-[color:var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                  </svg>
                  <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>Sin foto de progreso cargada</p>
                </div>
              )}
            </div>
          </Section>

          {/* Notes */}
          <Section title="Notas del coach" action={<EditButton label="Editar" />}>
            <div className="px-5 py-4 min-h-[160px] flex items-start">
              <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {detail.notes || "Sin notas registradas para este alumno."}
              </p>
            </div>
          </Section>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Detail specific) */}
      <div
        className="fixed bottom-0 left-0 right-0 h-16 z-50 lg:hidden flex items-center justify-around px-6 backdrop-blur-xl"
        style={{
          background: "var(--bg-sidebar)",
          WebkitBackdropFilter: "blur(24px)",
          backdropFilter: "blur(24px)",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <Link
          href="/coach/students"
          className="flex flex-col items-center justify-center p-3 transition-colors"
          style={{ color: "var(--text-sidebar-secondary)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-sidebar-primary)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-sidebar-secondary)"; }}
          title="Alumnos"
        >
          <IconUsers className="w-6 h-6" />
        </Link>
        <button
          onClick={() => {
            document.getElementById("progreso")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex flex-col items-center justify-center p-3 cursor-pointer transition-colors"
          style={{ color: "var(--text-sidebar-secondary)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-sidebar-primary)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-sidebar-secondary)"; }}
          title="Progreso"
        >
          <IconTrendingUp className="w-6 h-6" />
        </button>
        <button
          onClick={() => {
            document.getElementById("dieta")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex flex-col items-center justify-center p-3 cursor-pointer transition-colors"
          style={{ color: "var(--text-sidebar-secondary)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-sidebar-primary)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-sidebar-secondary)"; }}
          title="Dieta"
        >
          <IconUtensils className="w-6 h-6" />
        </button>
        <button
          onClick={() => {
            document.getElementById("rutina")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex flex-col items-center justify-center p-3 cursor-pointer transition-colors"
          style={{ color: "var(--text-sidebar-secondary)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-sidebar-primary)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-sidebar-secondary)"; }}
          title="Rutina"
        >
          <IconDumbbell className="w-6 h-6" />
        </button>
      </div>
      {/* ── Change Stage Modal ── */}
      <ChangeStageModal
        isOpen={isChangeStageModalOpen}
        onClose={() => setIsChangeStageModalOpen(false)}
        studentIds={[studentId]}
        onSuccess={fetchDetail}
      />
    </>
  );
}
