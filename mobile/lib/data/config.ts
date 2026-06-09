/* ═══════════════════════════════════════════
   Configuración de la capa de datos
   Lee variables EXPO_PUBLIC_* (visibles en el cliente).
   ═══════════════════════════════════════════ */

export type DataSource = "mock" | "api";

export const DATA_SOURCE: DataSource =
  (process.env.EXPO_PUBLIC_DATA_SOURCE as DataSource) || "mock";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export const IS_MOCK = DATA_SOURCE === "mock";
