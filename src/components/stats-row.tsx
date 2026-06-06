"use client";

/* ═══════════════════════════════════════════
   Stats Row — Monochrome, typographic
   ═══════════════════════════════════════════ */

interface StatsRowProps {
  totalStudents: number;
  activeStudents: number;
  alertStudents: number;
  scheduledChanges: number;
}

export default function StatsRow({
  totalStudents,
  activeStudents,
  alertStudents,
  scheduledChanges,
}: StatsRowProps) {
  const items = [
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
    },
    {
      value: scheduledChanges,
      label: "Programados",
    },
  ];

  return (
    <div id="stats-row" className="grid grid-cols-2 lg:grid-cols-4 gap-px mx-4 lg:mx-8 my-6 rounded-xl overflow-hidden"
      style={{ background: "var(--border-subtle)" }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-center py-5 lg:py-6"
          style={{ background: "var(--bg-surface)" }}
        >
          <span
            className="text-2xl lg:text-3xl font-light tabular-nums tracking-tight"
            style={{ color: item.accent || "var(--text-primary)" }}
          >
            {item.value}
          </span>
          <span
            className="text-[11px] mt-1 uppercase tracking-[0.1em]"
            style={{ color: "var(--text-tertiary)" }}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
