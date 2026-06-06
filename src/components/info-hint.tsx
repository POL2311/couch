"use client";

import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";

/* ═══════════════════════════════════════════
   InfoHint — descripción de sección detrás de un icono.
   Desktop: tooltip en hover/focus. Móvil: popover en tap
   (cierra con tap fuera / Esc / segundo tap). Único y reutilizable.
   ═══════════════════════════════════════════ */

export function InfoHint({ text, label = "Información de la sección" }: { text: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false); // true → el panel se ancla a la derecha del icono
  const wrapRef = useRef<HTMLDivElement>(null);

  // Cerrar con tap/click fuera y con Esc (relevante en móvil/teclado).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Si el panel no cabe a la derecha del viewport, anclarlo a la izquierda del icono.
  const recalc = () => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setAlignRight(rect.left + 280 > window.innerWidth - 8);
  };

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        onClick={() => { recalc(); setOpen((v) => !v); }}
        onMouseEnter={recalc}
        onFocus={recalc}
        className="w-7 h-7 rounded-full inline-flex items-center justify-center cursor-help transition-colors hover:bg-[color:var(--bg-hover)] focus-visible:bg-[color:var(--bg-hover)] outline-none peer"
        style={{ color: "var(--text-tertiary)" }}
        onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
      >
        <Info size={14} strokeWidth={1.75} />
      </button>

      {/* Panel: visible en hover/focus (desktop, ~150ms) o cuando open (tap móvil) */}
      <div
        role="tooltip"
        className={`absolute top-full mt-1.5 z-50 transition-opacity duration-150 ${alignRight ? "right-0" : "left-0"} ${
          open ? "opacity-100 visible" : "opacity-0 invisible peer-hover:opacity-100 peer-hover:visible peer-focus-visible:opacity-100 peer-focus-visible:visible"
        }`}
        style={{
          width: "max-content",
          maxWidth: 280,
          padding: "8px 10px",
          background: "var(--bg-surface-raised)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 8,
          boxShadow: "var(--shadow-md)",
          color: "var(--text-secondary)",
          fontSize: 12,
          lineHeight: 1.4,
        }}
      >
        {text}
      </div>
    </div>
  );
}
