import type { CSSProperties } from "react";

/* ═══════════════════════════════════════════
   Skeleton — Carga con shimmer reutilizable
   Base rgba(255,255,255,0.05) + gradiente animado
   (estilos en globals.css → .skeleton-shimmer)
   ═══════════════════════════════════════════ */

export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return <div className={`skeleton-shimmer ${className}`} style={style} aria-hidden="true" />;
}

/* ── Skeleton con forma de barras para gráficas ── */
export function ChartSkeleton({ className = "" }: { className?: string }) {
  // Alturas variadas para insinuar una distribución de datos, no un bloque plano.
  const heights = [42, 68, 55, 84, 60, 74, 48, 64, 78, 52, 70, 58];

  return (
    <div className={`flex items-end justify-between gap-1.5 w-full h-full ${className}`} aria-hidden="true">
      {heights.map((h, i) => (
        <Skeleton key={i} className="flex-1 rounded-md" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

/* ── Filas tipo lista (timeline, tabla) ── */
export function RowSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-lg"
          style={{ border: "1px solid var(--border-subtle)" }}
        >
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-2.5 w-1/3" />
          </div>
          <Skeleton className="h-5 w-14 rounded-md shrink-0" />
        </div>
      ))}
    </div>
  );
}
