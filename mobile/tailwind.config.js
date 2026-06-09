/** @type {import('tailwindcss').Config} */
// ═══════════════════════════════════════════
// MyCoach Mobile — Sistema de diseño "SF Dark Pro"
// Réplica 1:1 de los tokens de la web (src/app/globals.css)
// para mantener idéntica la estética entre web y app.
// ═══════════════════════════════════════════
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ── Superficies (negro puro + grises flotantes) ──
        root: "#0a0a0b",
        surface: "#121214",
        "surface-raised": "#1c1c1e",
        "surface-overlay": "#1c1c1e",

        // ── Texto (blanco / plata / gris apagado) ──
        primary: "#ffffff",
        secondary: "#e5e5ea",
        tertiary: "#8e8e93",
        inverse: "#000000",

        // ── Acento (botón de acción Apple — blanco) ──
        accent: "#ffffff",

        // ── Bordes (opacidad blanca, casi imperceptibles) ──
        hairline: "rgba(255,255,255,0.07)",
        "hairline-strong": "rgba(255,255,255,0.12)",

        // ── Semánticos (brillantes sobre negro) ──
        success: "#34d399",
        warning: "#fbbf24",
        danger: "#f87171",
        info: "#60a5fa",

        // ── Etapas ──
        "stage-volumen": "#a78bfa",
        "stage-definicion": "#2dd4bf",
        "stage-mantenimiento": "#facc15",
        "stage-recomposicion": "#f472b6",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
    },
  },
  plugins: [],
};
