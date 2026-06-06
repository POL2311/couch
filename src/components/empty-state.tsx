import type { ComponentType, CSSProperties, ReactNode } from "react";

/* ═══════════════════════════════════════════
   EmptyState — Estado vacío unificado
   Icono lucide 24px terciario · una línea útil · CTA opcional
   ═══════════════════════════════════════════ */

type IconType = ComponentType<{
  size?: number | string;
  strokeWidth?: number;
  style?: CSSProperties;
  className?: string;
}>;

export function EmptyState({
  icon: Icon,
  message,
  hint,
  cta,
  className = "",
}: {
  icon: IconType;
  message: string;
  hint?: string;
  cta?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center gap-2 py-10 ${className}`}>
      <Icon size={24} strokeWidth={1.5} style={{ color: "var(--text-tertiary)" }} />
      <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
        {message}
      </p>
      {hint && (
        <p className="text-[11px] max-w-[280px]" style={{ color: "var(--text-tertiary)" }}>
          {hint}
        </p>
      )}
      {cta && <div className="mt-1">{cta}</div>}
    </div>
  );
}
