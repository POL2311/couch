---
name: design-system-sf-dark-pro
description: Paleta "SF Dark Pro", tipografía, glassmorphism y reglas HIG obligatorias para MyCouch
metadata:
  type: project
---

Fuente de verdad: sección "3. Directrices de Rediseño: Estilo App de Apple" en ROADMAP.md. NUNCA inventar estilos.

**Paleta SF Dark Pro:**
- Fondo: `#000000` o `#08080A`
- Tarjetas/Contenedores: `#121214` o `#1C1C1E`, bordes `border-zinc-800/30` o `border-white/5`
- Títulos: `#FFFFFF` (zinc-100), lectura: `#E5E5EA`, secundarios/etiquetas: `#8E8E93` (zinc-500)
- Acento: botones principales blanco puro con texto negro. Estados: `bg-emerald-500/10 text-emerald-400`

**Espaciado y anatomía:**
- `rounded-2xl` tarjetas grandes, `rounded-xl` botones/inputs
- Padding generoso: `py-6 px-6`
- Glassmorphism (header, BulkActionBar): `backdrop-blur-md bg-black/40 border-white/5`

**Mobile-First:**
- Bottom bar en móvil (`md:hidden`), iconos Lucide grandes, navegación para pulgar
- Touch targets mínimo 44×44px
- Daily Card Stack: checklist grande para gym con dedos sudados
- Macros dieta: mini-grid `bg-zinc-900/50 text-center rounded-xl p-3`, número grande blanco + tipo en gris

**Why:** Diferenciación premium. El producto compite visualmente con apps nativas de Apple.
**How to apply:** Revisar ROADMAP.md sección 3 antes de proponer cualquier clase Tailwind nueva.
