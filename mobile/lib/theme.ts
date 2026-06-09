/* ═══════════════════════════════════════════
   Tokens "SF Dark Pro" para usos donde NativeWind
   no aplica (props nativas: color de íconos, gradientes,
   stroke de SVG, etc.). Espejo de tailwind.config.js.
   ═══════════════════════════════════════════ */
export const T = {
  bgRoot: "#0a0a0b",
  surface: "#121214",
  surfaceRaised: "#1c1c1e",

  textPrimary: "#ffffff",
  textSecondary: "#e5e5ea",
  textTertiary: "#8e8e93",
  textInverse: "#000000",

  hairline: "rgba(255,255,255,0.07)",
  hairlineStrong: "rgba(255,255,255,0.12)",

  success: "#34d399",
  warning: "#fbbf24",
  danger: "#f87171",
  info: "#60a5fa",
} as const;

/**
 * Convierte un avatarColor (que en la web puede ser "linear-gradient(...)")
 * a un color sólido válido para React Native: extrae el primer #hex.
 */
export function avatarBg(color?: string): string {
  if (color) {
    const m = color.match(/#[0-9a-fA-F]{3,8}/);
    if (m) return m[0]; // extrae el primer hex (de gradientes "linear-gradient(...#hex...)")
    if (color.startsWith("rgb")) return color;
  }
  return "#3b82f6"; // respaldo sólido (gradientes con var() de la web no son válidos en RN)
}

export const STAGE_COLORS: Record<string, string> = {
  Volumen: "#a78bfa",
  Definición: "#2dd4bf",
  Mantenimiento: "#facc15",
  Recomposición: "#f472b6",
};

// Espejo de src/lib/status-labels.ts de la web.
export const PAYMENT_LABELS: Record<string, { label: string; short: string; color: string; bg: string }> = {
  active: { label: "Al día", short: "Al día", color: "#34d399", bg: "rgba(52,211,153,0.10)" },
  grace_period: { label: "Pago pendiente", short: "Pendiente", color: "#fbbf24", bg: "rgba(251,191,36,0.10)" },
  past_due: { label: "Pago vencido", short: "Vencido", color: "#fbbf24", bg: "rgba(251,191,36,0.10)" },
  inactive: { label: "Suspendido", short: "Suspendido", color: "#f87171", bg: "rgba(248,113,113,0.10)" },
};
