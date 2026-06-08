"use client";

import { useEffect } from "react";

/* ═══════════════════════════════════════════
   DetailOverlay — shell reutilizable de detalle
   Móvil: bottom sheet (slide-up). Escritorio: dialog
   centrado o panel lateral derecho. Cierra con
   Esc / click en scrim / (X dentro del contenido).
   ═══════════════════════════════════════════ */

export function DetailOverlay({
  onClose,
  ariaLabel,
  desktop = "dialog",
  children,
}: {
  onClose: () => void;
  ariaLabel?: string;
  desktop?: "dialog" | "panel";
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={ariaLabel} className="fixed inset-0 z-[60]">
      {/* Scrim */}
      <div className="absolute inset-0 animate-scrim-in" style={{ background: "var(--scrim)" }} onClick={onClose} />

      {/* Bottom sheet (móvil) */}
      <div
        className="md:hidden absolute bottom-0 left-0 right-0 rounded-t-[20px] animate-sheet-up px-5 pt-3 max-h-[85vh] overflow-y-auto"
        style={{
          background: "var(--bg-surface-raised)",
          borderTop: "1px solid var(--border-subtle)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2rem)",
        }}
      >
        <div className="mx-auto mb-4 rounded-full" style={{ width: 36, height: 4, background: "rgba(255, 255, 255, 0.20)" }} />
        {children}
      </div>

      {/* Escritorio */}
      {desktop === "panel" ? (
        <div
          className="hidden md:block absolute top-0 right-0 bottom-0 w-[480px] max-w-full animate-panel-in overflow-y-auto p-6"
          style={{ background: "var(--bg-surface-raised)", borderLeft: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-lg)" }}
        >
          {children}
        </div>
      ) : (
        <div className="hidden md:flex absolute inset-0 items-center justify-center p-4 pointer-events-none">
          <div
            className="pointer-events-auto w-full max-w-md rounded-2xl animate-float-up p-6 max-h-[85vh] overflow-y-auto"
            style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-lg)" }}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
