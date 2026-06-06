"use client";

import { Plus } from "lucide-react";
import { InfoHint } from "@/components/info-hint";

/* ═══════════════════════════════════════════
   Header de página canónico (las 5 vistas):
   identidad (título + conteo + InfoHint) + acción (CTA).
   Altura fija (--page-header-h), hairline al mismo offset en todas.
   ═══════════════════════════════════════════ */

export function PageHeader({
  title,
  count,
  hint,
  cta,
}: {
  title: string;
  count?: number;
  hint?: string;
  cta?: React.ReactNode;
}) {
  return (
    <header
      className="shrink-0 flex items-center justify-between gap-3 px-4 md:px-8"
      style={{ height: "var(--page-header-h)", borderBottom: "1px solid var(--border-subtle)" }}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <h1 className="text-[22px] font-semibold tracking-tight truncate" style={{ color: "var(--text-primary)" }}>
          {title}
          {typeof count === "number" && (
            <span className="text-[13px] font-normal ml-1.5" style={{ color: "var(--text-secondary)" }}>· {count}</span>
          )}
        </h1>
        {hint && <InfoHint text={hint} />}
      </div>
      {cta && <div className="shrink-0">{cta}</div>}
    </header>
  );
}

/* CTA "+" canónico: círculo blanco 40px en móvil, pill blanca con texto en desktop. */
export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="shrink-0 inline-flex items-center justify-center gap-2 cursor-pointer transition-opacity hover:opacity-85 rounded-full md:rounded-xl w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2 outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--ring-on-dark)]"
      style={{ background: "var(--accent-primary)", color: "var(--text-inverse)" }}
    >
      <Plus size={20} strokeWidth={2} className="shrink-0" />
      <span className="hidden md:inline text-[13px] font-medium">{label}</span>
    </button>
  );
}
