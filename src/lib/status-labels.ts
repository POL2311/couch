import { type PaymentStatus } from "./mock-data";

/* ═══════════════════════════════════════════
   Diccionario ÚNICO de etiquetas de estado de pago hacia la UI.
   Capa de presentación: el enum (grace_period, etc.) NO cambia en datos.
   ═══════════════════════════════════════════ */

export type StatusTone = "success" | "warning" | "danger";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, { label: string; short: string; tone: StatusTone }> = {
  active: { label: "Al día", short: "Al día", tone: "success" },
  grace_period: { label: "Pago pendiente", short: "Pendiente", tone: "warning" },
  inactive: { label: "Suspendido", short: "Suspendido", tone: "danger" },
};

export const TONE_COLOR: Record<StatusTone, { color: string; bg: string }> = {
  success: { color: "var(--color-success)", bg: "var(--color-success-subtle)" },
  warning: { color: "var(--color-warning)", bg: "var(--color-warning-subtle)" },
  danger: { color: "var(--color-danger)", bg: "var(--color-danger-subtle)" },
};

/* Color de tono para un estado (atajo). */
export function statusTone(status: PaymentStatus) {
  return TONE_COLOR[PAYMENT_STATUS_LABELS[status].tone];
}

/* Etiquetas de sección de la vista de Pagos. */
export const PAYMENT_SECTION_LABELS = {
  action: "Requieren acción",
  active: "Al día",
  disabled: "Suspendidos",
} as const;
