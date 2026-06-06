"use client";

/* ═══════════════════════════════════════════
   Stats Row — Monochrome, typographic
   ═══════════════════════════════════════════ */

interface StatsRowProps {
  totalStudents: number;
  activeStudents: number;
  alertStudents: number;
  scheduledChanges: number;
  onAlertClick?: () => void;
}

export default function StatsRow({
  totalStudents,
  activeStudents,
  alertStudents,
  scheduledChanges,
  onAlertClick,
}: StatsRowProps) {
  const items: { value: number; label: string; accent?: string; onClick?: () => void }[] = [
    {
      value: totalStudents,
      label: "Total",
    },
    {
      value: activeStudents,
      label: "Al día",
      accent: "var(--color-success)",
    },
    {
      value: alertStudents,
      label: "Atención",
      accent: alertStudents > 0 ? "var(--color-warning)" : undefined,
      onClick: onAlertClick,
    },
    {
      value: scheduledChanges,
      label: "Programados",
    },
  ];

  return (
    <div id="stats-row" className="grid grid-cols-2 md:grid-cols-4 gap-px mx-4 md:mx-8 my-6 rounded-xl overflow-hidden"
      style={{ background: "var(--border-subtle)" }}
    >
      {items.map((item, i) => {
        const clickable = !!item.onClick;
        return (
          <button
            key={i}
            type="button"
            onClick={item.onClick}
            disabled={!clickable}
            className={`flex flex-col items-center justify-center py-5 md:py-6 transition-colors ${clickable ? "cursor-pointer hover:bg-[color:var(--bg-hover)]" : "cursor-default"}`}
            style={{ background: "var(--bg-surface)" }}
          >
            <span
              className="text-[clamp(1.5rem,5vw,1.875rem)] font-semibold tabular-nums tracking-tight leading-none"
              style={{ color: item.accent || (item.value === 0 ? "var(--text-tertiary)" : "var(--text-primary)") }}
            >
              {item.value}
            </span>
            <span
              className="text-[11px] mt-2 uppercase"
              style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
