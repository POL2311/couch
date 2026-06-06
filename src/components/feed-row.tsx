import { Scale, UserPlus, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { type FeedItem } from "@/lib/activity";

const ICONS = { weigh: Scale, join: UserPlus } as const;

export function formatFeedDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

/* Una fila del feed de actividad — compartida por el dashboard y /coach/activity */
export function FeedRow({ item }: { item: FeedItem }) {
  const Icon = ICONS[item.type];
  const { title, desc, date, delta } = item;
  return (
    <div className="px-5 py-4 flex items-start gap-4">
      {/* Contenedor de icono — 36x36, radius 10, fondo white/4, hairline */}
      <div
        className="shrink-0 flex items-center justify-center"
        style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--border-subtle)" }}
      >
        <Icon size={16} strokeWidth={1.75} style={{ color: "var(--text-secondary)" }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <strong className="text-[14px] font-medium" style={{ color: "var(--text-primary)" }}>{title}</strong>
          <span className="text-[12px] tabular-nums shrink-0" style={{ color: "var(--text-tertiary)" }}>{formatFeedDate(date)}</span>
        </div>

        <div className="flex items-center flex-wrap gap-2 mt-1">
          <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{desc}</p>
          {typeof delta === "number" && Math.abs(delta) >= 0.1 && (
            // NOTA: el color del chip debe depender del objetivo del alumno (definición vs volumen);
            // success es placeholder hasta tener el objetivo en los datos.
            <span
              className="inline-flex items-center gap-0.5 text-[12px] tabular-nums px-1.5 py-0.5 rounded-md shrink-0"
              style={{ background: "var(--color-success-subtle)", color: "var(--color-success)" }}
            >
              {delta < 0 ? <ArrowDownRight size={12} strokeWidth={1.75} /> : <ArrowUpRight size={12} strokeWidth={1.75} />}
              {Math.abs(delta)} kg
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
