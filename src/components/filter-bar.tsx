"use client";

import { type PaymentStatus, type Stage, type Student } from "@/lib/mock-data";

interface FilterBarProps {
  activePaymentFilter: PaymentStatus | "all";
  activeStageFilter: Stage | "all";
  onPaymentFilterChange: (filter: PaymentStatus | "all") => void;
  onStageFilterChange: (filter: Stage | "all") => void;
  totalStudents: number;
  filteredCount: number;
  students: Student[];
}

const PAYMENT_FILTERS: { label: string; value: PaymentStatus | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "Activo", value: "active" },
  { label: "Suspendido", value: "inactive" },
  { label: "Gracia", value: "grace_period" },
];

const STAGE_FILTERS: { label: string; value: Stage | "all" }[] = [
  { label: "Todas", value: "all" },
  { label: "Volumen", value: "Volumen" },
  { label: "Definición", value: "Definición" },
  { label: "Mantenimiento", value: "Mantenimiento" },
  { label: "Recomposición", value: "Recomposición" },
];

export default function FilterBar({
  activePaymentFilter,
  activeStageFilter,
  onPaymentFilterChange,
  onStageFilterChange,
  totalStudents,
  filteredCount,
  students,
}: FilterBarProps) {
  // Conteos reales por filtro — un número invita a saltar en vez de scrollear.
  const paymentCount = (value: PaymentStatus | "all") =>
    value === "all" ? students.length : students.filter((s) => s.paymentStatus === value).length;
  const stageCount = (value: Stage | "all") =>
    value === "all" ? students.length : students.filter((s) => s.stage === value).length;

  return (
    <div
      id="filter-bar"
      className="flex flex-col md:flex-row md:items-center gap-3 px-5 py-3"
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
    >
      {/* ── Payment Filters — tira con scroll horizontal propio (pills iOS) ── */}
      <div className="flex items-center gap-0.5 overflow-x-auto flex-nowrap min-w-0" style={{ WebkitOverflowScrolling: "touch" }}>
        {PAYMENT_FILTERS.map((filter) => {
          const isActive = activePaymentFilter === filter.value;
          return (
            <button
              key={filter.value}
              id={`filter-payment-${filter.value}`}
              onClick={() => onPaymentFilterChange(filter.value)}
              className="px-3 py-1.5 rounded-md text-[12px] cursor-pointer shrink-0 whitespace-nowrap"
              style={{
                color: isActive ? "var(--text-primary)" : "var(--text-tertiary)",
                background: isActive ? "var(--bg-active)" : "transparent",
                fontWeight: isActive ? 500 : 400,
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = "var(--text-secondary)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = "var(--text-tertiary)";
              }}
            >
              {filter.label}
              <span className="ml-1 tabular-nums" style={{ opacity: 0.55 }}>· {paymentCount(filter.value)}</span>
            </button>
          );
        })}
      </div>

      {/* ── Separator ── */}
      <div className="hidden md:block w-px h-4" style={{ background: "var(--border-default)" }} />

      {/* ── Stage Filters — tira con scroll horizontal propio (pills iOS) ── */}
      <div className="flex items-center gap-0.5 overflow-x-auto flex-nowrap min-w-0" style={{ WebkitOverflowScrolling: "touch" }}>
        {STAGE_FILTERS.map((filter) => {
          const isActive = activeStageFilter === filter.value;
          return (
            <button
              key={filter.value}
              id={`filter-stage-${filter.value}`}
              onClick={() => onStageFilterChange(filter.value)}
              className="px-3 py-1.5 rounded-md text-[12px] whitespace-nowrap cursor-pointer shrink-0"
              style={{
                color: isActive ? "var(--text-primary)" : "var(--text-tertiary)",
                background: isActive ? "var(--bg-active)" : "transparent",
                fontWeight: isActive ? 500 : 400,
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = "var(--text-secondary)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = "var(--text-tertiary)";
              }}
            >
              {filter.label}
              <span className="ml-1 tabular-nums" style={{ opacity: 0.55 }}>· {stageCount(filter.value)}</span>
            </button>
          );
        })}
      </div>

      {/* ── Count ── */}
      <div className="md:ml-auto">
        <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
          {filteredCount}
          <span className="mx-1">/</span>
          {totalStudents}
        </span>
      </div>
    </div>
  );
}
