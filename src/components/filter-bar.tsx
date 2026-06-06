"use client";

import { type PaymentStatus, type Stage } from "@/lib/mock-data";

interface FilterBarProps {
  activePaymentFilter: PaymentStatus | "all";
  activeStageFilter: Stage | "all";
  onPaymentFilterChange: (filter: PaymentStatus | "all") => void;
  onStageFilterChange: (filter: Stage | "all") => void;
  totalStudents: number;
  filteredCount: number;
}

const PAYMENT_FILTERS: { label: string; value: PaymentStatus | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "Activo", value: "active" },
  { label: "Inactivo", value: "inactive" },
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
}: FilterBarProps) {
  return (
    <div
      id="filter-bar"
      className="flex flex-col lg:flex-row lg:items-center gap-3 px-5 py-3"
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
    >
      {/* ── Payment Filters ── */}
      <div className="flex items-center gap-0.5">
        {PAYMENT_FILTERS.map((filter) => {
          const isActive = activePaymentFilter === filter.value;
          return (
            <button
              key={filter.value}
              id={`filter-payment-${filter.value}`}
              onClick={() => onPaymentFilterChange(filter.value)}
              className="px-3 py-1.5 rounded-md text-[12px] cursor-pointer"
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
            </button>
          );
        })}
      </div>

      {/* ── Separator ── */}
      <div className="hidden lg:block w-px h-4" style={{ background: "var(--border-default)" }} />

      {/* ── Stage Filters ── */}
      <div className="flex items-center gap-0.5 overflow-x-auto">
        {STAGE_FILTERS.map((filter) => {
          const isActive = activeStageFilter === filter.value;
          return (
            <button
              key={filter.value}
              id={`filter-stage-${filter.value}`}
              onClick={() => onStageFilterChange(filter.value)}
              className="px-3 py-1.5 rounded-md text-[12px] whitespace-nowrap cursor-pointer"
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
            </button>
          );
        })}
      </div>

      {/* ── Count ── */}
      <div className="lg:ml-auto">
        <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
          {filteredCount}
          <span className="mx-1">/</span>
          {totalStudents}
        </span>
      </div>
    </div>
  );
}
