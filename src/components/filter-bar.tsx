"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, Check, X } from "lucide-react";
import { type PaymentStatus, type Stage, type Student } from "@/lib/mock-data";

export type PaymentFilter = PaymentStatus | "all" | "attention";

interface FilterBarProps {
  activePaymentFilter: PaymentFilter;
  activeStageFilter: Stage | "all";
  onPaymentFilterChange: (filter: PaymentFilter) => void;
  onStageFilterChange: (filter: Stage | "all") => void;
  totalStudents: number;
  filteredCount: number;
  students: Student[];
  onClear: () => void;
}

const STATUS_CHIPS: { label: string; value: PaymentStatus }[] = [
  { label: "Activo", value: "active" },
  { label: "Gracia", value: "grace_period" },
  { label: "Suspendido", value: "inactive" },
];

const STAGES: { label: Stage; color: string; bg: string }[] = [
  { label: "Volumen", color: "var(--stage-volumen)", bg: "var(--stage-volumen-subtle)" },
  { label: "Definición", color: "var(--stage-definicion)", bg: "var(--stage-definicion-subtle)" },
  { label: "Mantenimiento", color: "var(--stage-mantenimiento)", bg: "var(--stage-mantenimiento-subtle)" },
  { label: "Recomposición", color: "var(--stage-recomposicion)", bg: "var(--stage-recomposicion-subtle)" },
];

export default function FilterBar({
  activePaymentFilter,
  activeStageFilter,
  onPaymentFilterChange,
  onStageFilterChange,
  totalStudents,
  filteredCount,
  students,
  onClear,
}: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (stageRef.current && !stageRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const paymentCount = (p: PaymentStatus) => students.filter((s) => s.paymentStatus === p).length;
  const stageCount = (s: Stage) => students.filter((x) => x.stage === s).length;
  const hasFilters = activePaymentFilter !== "all" || activeStageFilter !== "all";
  const activeStageMeta = STAGES.find((s) => s.label === activeStageFilter);

  const togglePopover = () => {
    const el = stageRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      setAlignRight(r.left + 220 > window.innerWidth - 8);
    }
    setOpen((v) => !v);
  };

  return (
    <div className="flex items-center gap-3 px-4 md:px-5 py-3 min-w-0" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
      {/* a. Chips de estado (uso diario) — tira con scroll horizontal propio */}
      <div className="flex items-center gap-0.5 overflow-x-auto flex-nowrap min-w-0" style={{ WebkitOverflowScrolling: "touch" }}>
        {activePaymentFilter === "attention" && (
          <span className="inline-flex items-center gap-1 text-[12px] px-2.5 py-1 rounded-full font-medium shrink-0 whitespace-nowrap mr-1" style={{ color: "var(--color-warning)", background: "var(--color-warning-subtle)" }}>
            Atención
            <button onClick={() => onPaymentFilterChange("all")} aria-label="Quitar filtro Atención" className="cursor-pointer ml-0.5 -mr-1 inline-flex">
              <X size={12} strokeWidth={2} />
            </button>
          </span>
        )}
        {STATUS_CHIPS.map((chip) => {
          const isActive = activePaymentFilter === chip.value;
          return (
            <button
              key={chip.value}
              id={`filter-payment-${chip.value}`}
              onClick={() => onPaymentFilterChange(isActive ? "all" : chip.value)}
              className="px-3 py-1.5 rounded-md text-[12px] cursor-pointer shrink-0 whitespace-nowrap"
              style={{
                color: isActive ? "var(--text-primary)" : "var(--text-tertiary)",
                background: isActive ? "var(--bg-active)" : "transparent",
                fontWeight: isActive ? 500 : 400,
                transition: "all var(--transition-fast)",
              }}
            >
              {chip.label}
              <span className="ml-1 tabular-nums" style={{ opacity: 0.55 }}>· {paymentCount(chip.value)}</span>
            </button>
          );
        })}
      </div>

      {/* b. Separador (solo desktop) */}
      <div className="hidden md:block w-px h-4 shrink-0" style={{ background: "var(--border-default)" }} />

      {/* c. Etapa (uso ocasional, tras disclosure) + chip removible si hay una activa */}
      <div className="flex items-center gap-2 shrink-0">
        {activeStageMeta && (
          <span className="inline-flex items-center gap-1 text-[12px] px-2.5 py-1 rounded-full font-medium whitespace-nowrap" style={{ color: activeStageMeta.color, background: activeStageMeta.bg }}>
            {activeStageMeta.label}
            <button onClick={() => onStageFilterChange("all")} aria-label={`Quitar filtro ${activeStageMeta.label}`} className="cursor-pointer ml-0.5 -mr-1 inline-flex">
              <X size={12} strokeWidth={2} />
            </button>
          </span>
        )}
        <div ref={stageRef} className="relative">
          <button
            onClick={togglePopover}
            aria-expanded={open}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer transition-colors hover:bg-[color:var(--bg-hover)]"
            style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
          >
            <SlidersHorizontal size={14} strokeWidth={1.75} />
            Etapa
          </button>

          {open && (
            <div
              role="menu"
              className={`absolute top-full mt-1.5 z-50 ${alignRight ? "right-0" : "left-0"}`}
              style={{ width: 220, background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: 10, boxShadow: "var(--shadow-md)", padding: 4 }}
            >
              {STAGES.map((s) => {
                const sel = activeStageFilter === s.label;
                return (
                  <button
                    key={s.label}
                    role="menuitemradio"
                    aria-checked={sel}
                    onClick={() => { onStageFilterChange(sel ? "all" : s.label); setOpen(false); }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] cursor-pointer transition-colors hover:bg-[color:var(--bg-hover)]"
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                    <span style={{ color: "var(--text-primary)" }}>{s.label}</span>
                    <span className="tabular-nums" style={{ color: "var(--text-tertiary)" }}>· {stageCount(s.label)}</span>
                    {sel && <Check size={14} strokeWidth={2} className="ml-auto" style={{ color: "var(--text-primary)" }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Contador contextual (solo con filtros activos) */}
      {hasFilters && (
        <div className="ml-auto flex items-center gap-3 shrink-0">
          <span className="text-[11px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>
            {filteredCount} de {totalStudents}
          </span>
          <button onClick={onClear} className="text-[11px] cursor-pointer hover:underline" style={{ color: "var(--text-secondary)" }}>
            Limpiar
          </button>
        </div>
      )}
    </div>
  );
}
