"use client";

/* ═══════════════════════════════════════════
   Bulk Action Bar — Monochrome luxury
   ═══════════════════════════════════════════ */

function IconX({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onScheduleStageChange: () => void;
}

export default function BulkActionBar({
  selectedCount,
  onClear,
  onScheduleStageChange,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      id="bulk-action-bar"
      className="fixed bottom-20 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-float-up"
      style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div
        className="flex items-center gap-4 px-2 py-2 rounded-2xl"
        style={{
          background: "var(--glass-strong)",
          WebkitBackdropFilter: "blur(24px) saturate(120%)",
          backdropFilter: "blur(24px) saturate(120%)",
          border: "1px solid var(--border-default)",
          boxShadow: "0 16px 64px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.02)",
        }}
      >
        {/* ── Count ── */}
        <div className="flex items-center gap-2.5 pl-3">
          <span
            className="text-[13px] font-medium tabular-nums"
            style={{ color: "var(--text-primary)" }}
          >
            {selectedCount}
          </span>
          <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            {selectedCount === 1 ? "seleccionado" : "seleccionados"}
          </span>
        </div>

        {/* ── CTA — White on dark ── */}
        <button
          id="btn-schedule-stage-change"
          onClick={onScheduleStageChange}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer"
          style={{
            background: "var(--text-primary)",
            color: "var(--text-inverse)",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.85";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          Programar Etapa
        </button>

        {/* ── Close ── */}
        <button
          id="btn-clear-selection"
          onClick={onClear}
          className="p-2 rounded-lg cursor-pointer mr-1"
          style={{
            color: "var(--text-tertiary)",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-tertiary)";
          }}
          aria-label="Limpiar selección"
        >
          <IconX />
        </button>
      </div>
    </div>
  );
}
