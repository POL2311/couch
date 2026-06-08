# QA: UX + datos expuestos + responsive — rama `new_design`

Auditoría de código (sin navegador) de las 6 vistas + modales, header, sidebar y
bulk-action-bar. `tsc --noEmit` EXIT=0 y `npm run build` compila.

---

## A. Fuga de información técnica al usuario

### ✅ Correcto (sin cambios necesarios)
- **Enums siempre traducidos** vía mapas de etiquetas: `getPaymentLabel`
  (`student-table.tsx:22`), `getStatusStyle` (`payments/page.tsx:44`),
  `getPaymentInfo`/`getStageColor` (`student-detail.tsx:90+`). No se renderiza
  `grace_period`/`active`/`inactive` crudo en ningún sitio.
- **`student.stage`** se pinta directo (`student-table.tsx:180,326`,
  `student-detail.tsx:685`) pero sus valores ya son texto humano en español
  ("Definición", "Volumen"…), no enums técnicos.
- **Fechas formateadas** a es-MX en todos los puntos visibles
  (`formatDateLong`, `formatFeedDate`, `toLocaleDateString`). El único
  `{executionDate}` crudo (`change-stage-modal.tsx:252`) es el `value` de un
  `<input type="date">`, correcto.
- **null/undefined**: `detail.height`/`bodyFat` están bajo guarda
  (`{detail.height && …}`), los `toFixed` operan sobre números no nulos.
- **IDs internos**: solo se usan en URLs/keys de React, nunca como texto visible.
- **Errores**: los `catch` muestran mensaje humano ("Alumno no encontrado",
  "Hubo un error al registrar al alumno.") y loguean lo técnico con
  `console.error`. No se filtra stack ni mensaje de API a pantalla.

### ⚠️ Requiere decisión humana
- **`student-detail.tsx:525`** — la grid de medidas corporales muestra `"—"`
  cuando no hay dato (`{val > 0 ? val : "—"}`). No es un KPI; "0 cm" sería
  incorrecto. Opciones: dejar el guion, "Sin dato", o vaciar la celda.
- **`lib/db.ts:99`** — `console.log` de AutoCron incluye `id` y `name` del alumno.
  Es log de servidor (no UI), aceptable; si el log va a producción, considerar
  redactarlo.

---

## B. Flujos naturales e intuitivos

### ✅ Correcto / Corregido
- **Cambiar etapa** (`change-stage-modal.tsx`): tiene `isSubmitting` →
  botón `disabled` + texto "Guardando…" (líneas 269/289/302). ✓
- **Registrar alumno** (`add-student-modal.tsx`): al enviar, el modal se
  desmonta (`onClose()` en `handleFormSubmit:112`) → **no hay doble-submit
  posible** y el feedback es implícito (modal desaparece + lista se refresca).
- **Acciones destructivas**: cancelar cambio programado pide `confirm()` en
  ambos sitios (`periodization/page.tsx:52`, `student-detail.tsx:742`). ✓
- **Navegación**: el detalle vuelve a la lista sin perder contexto
  (`student-detail.tsx` back link + nav inferior móvil). Empty states con CTA
  apuntan a destinos válidos (`/coach/students`).

### ⚠️ Requiere decisión humana
- **Feedback vía `alert()`** (crudo, bloquea): "Recordar" pago
  (`payments/page.tsx:277`), error de alta (`students/page.tsx:165`), error de
  cambio (`change-stage-modal.tsx:71`). Propuesta: sistema de toasts no bloqueante.
- **Alta sin estado "guardando…"**: como el modal cierra al instante no hay
  riesgo de doble-click, pero no hay confirmación de éxito explícita (toast).
- **Placeholders sin backend**: "Crear plantilla" (`templates/page.tsx:28`),
  "Ver Dashboard de Stripe" (`payments/page.tsx:319`) son `alert()`. Esperado en
  MVP; requieren lógica de negocio (fuera de alcance).

---

## C. Responsive y consistencia mobile

### ✅ Corregido
- **C4 — KPIs escalables**: valores de 30px → `clamp(1.5rem, 5vw, 1.875rem)`
  (24px en 360px → 30px en desktop) en dashboard, pagos y `stats-row`. Evita
  desbordes/saltos feos con cifras largas ("$120,000 MXN") en cards de 2 columnas.
- **C2 — touch target**: botón eliminar de periodización `p-1` → `p-2.5`
  (`periodization/page.tsx`), pasa de ~24px a ~36px de área táctil.

### ⚠️ Requiere decisión humana
- **C3 — breakpoints mixtos**: la navegación y el margen del contenido usan
  `md` (768px), pero TODO el contenido (grids `lg:grid-cols-4`, padding
  `lg:px-8`, paneles `lg:grid-cols-2/3`, tabla `hidden lg:block`/`lg:hidden`,
  `lg:pb-8`) sigue en `lg` (1024px). Unificar a `md` haría que a 768px se muestren
  4 KPIs + tabla de 6 columnas junto a un sidebar de 240px → contenido ~480px,
  muy apretado. **Propuesta:** o se mantiene el contenido en `lg` (decisión
  deliberada: el contenido necesita más ancho que la nav), o se migra a `md`
  reduciendo el ancho del sidebar y/o el número de columnas. No lo cambié por ser
  decisión de diseño con riesgo de cramping. Archivos: las 6 vistas + `stats-row`,
  `filter-bar`, `header`, `student-table`, `student-detail`.
- **Tabla de pagos sin vista card móvil**: `payments/page.tsx:183` solo tiene
  `overflow-x-auto` (scroll horizontal en <768px), mientras `student-table` sí
  tiene vista card (`lg:hidden`). Propuesta: replicar el patrón card para pagos.
  No rompe (scrollea), pero es inconsistente.
- **Touch targets menores**: chips de `filter-bar` (`px-3 py-1.5`) y botón
  "Recordar" (`payments/page.tsx:277`, `px-2.5 py-1`) quedan <44px de alto.
  Propuesta: subir padding vertical en móvil.
- **Anchos fijos**: los `*-[NNpx]` encontrados son todos pequeños y acotados
  (avatares, barras de 3px, `max-w-[180px]` con `truncate`, `max-w-[240px]` de
  foto) — ninguno causa overflow horizontal. Sin acción.
- **Padding inferior vs bottom bar (72px)**: las vistas usan `pb-24` (96px) en
  móvil, suficiente. ✓ Sin acción.
