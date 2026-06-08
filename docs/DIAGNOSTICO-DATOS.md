# Diagnóstico de coherencia de datos — rama `new_design`

Fecha: 2026-06-06 · Alcance: investigar por qué el sidebar dice "Pro · 47 alumnos",
la card "Alumnos Activos" mostraba "De 0 alumnos registrados" y el feed mostraba
actividad que no cuadra con el resto.

## 1. ¿De dónde sale cada número?

| Dato en pantalla | Origen | ¿Coherente? |
|---|---|---|
| Conteos del dashboard (MRR, activos, alertas, total) | `fetch("/api/students")` → `getStudents()` (`src/lib/db.ts`) → `database.json` | ✅ Sí — fuente real |
| Tabla de alumnos, periodización, pagos | mismo `/api/students` | ✅ Sí |
| Gráfica de adherencia | mismo `students` fetchado | ✅ Sí |
| **Sidebar "Pro · 47 alumnos"** | **Hardcodeado** en `src/components/sidebar.tsx:120` | ❌ No |
| **Sidebar "Coach Alejandro"** | **Hardcodeado** en `sidebar.tsx:117` | ❌ No (no existe entidad coach) |
| **Feed "Actividad reciente"** | **Array estático hardcodeado** en `coach/page.tsx` | ❌ No (corregido, ver §3) |

### Fuente de la verdad
`src/lib/database.json`, sembrada al primer arranque desde `MOCK_STUDENTS`
(`src/lib/mock-data.ts`, 12 alumnos) y mutable vía las API routes
(`/api/students`, `/api/students/[id]`, `/api/students/change-stage`).
**Estado actual: 13 alumnos** (12 mock + 1 alta de prueba `s13` "231").
Todos los conteos/gráficas ya beben de aquí.

### Sobre el "De 0 alumnos registrados"
No es una incoherencia de fuente: es el **estado de carga transitorio**. El
dashboard renderiza con `students = []` antes de que resuelva el `fetch`, por lo
que durante ~1 frame el total es 0. Ya cargado muestra 13. (El reemplazo del
placeholder de carga por skeletons en los KPIs está contemplado en otra tarea.)

## 2. Qué se hizo (corregible sin tocar API/negocio — regla 2)

**Feed del dashboard → derivado de la fuente única.**
`coach/page.tsx` ya tenía `students` fetchado en el componente. Reescribí el feed
para que se construya desde ese mismo array (`feedItems` useMemo), **sin nuevas
llamadas a la API ni cambios de esquema**:
- "Pesaje reportado": los 3 alumnos con `lastWeighIn` más reciente, con su peso y
  delta reales (`currentWeight - previousWeight`) y fecha real.
- "Nuevo alumno": el alumno con `joinedDate` más reciente.
- Estados de carga/vacío integrados (`RowSkeleton` / `EmptyState`).
- El chip de delta usa la dirección real (▼/▲ según signo). El color sigue siendo
  `success` como placeholder, con comentario en el código: debe depender del
  objetivo del alumno (definición vs volumen), dato que aún no existe en el esquema.

Resultado: los mismos alumnos alimentan conteos, gráficas **y** feed.

## 3. Qué NO se hizo (requiere API/negocio — regla 3, pendiente de tu revisión)

### 3.1 Sidebar: conteo y nombre del coach
`sidebar.tsx` es un componente de layout que **no fetchea datos**. Mostrar el
conteo real exigiría **una nueva llamada a la API** o un contexto compartido
(p. ej. un `StudentsProvider` que envuelva el dashboard). Ambas cosas caen en la
regla 3 (añadir llamadas/estado de datos), por eso **no las implementé**.

Propuesta (a tu criterio):
- **Opción A (mínima):** que `(dashboard)/layout.tsx` (server component) haga
  `getStudents()` y pase `count` como prop a `Sidebar`. Cero fetch cliente extra,
  una sola fuente. Requiere convertir el layout para leer datos.
- **Opción B:** `StudentsContext` con un único `fetch` compartido por dashboard +
  sidebar (evita doble fetch). Más trabajo, mejor a futuro.
- **"Coach Alejandro" y "Pro":** no existe entidad coach/plan en el esquema.
  Necesitan un modelo de cuenta/coach (regla 3). Dejar hardcodeado o introducir
  el modelo es decisión de producto.

### 3.2 Semántica de "eventos" del feed
El esquema no tiene un modelo de actividad/eventos (no hay timestamps de
"entrenamiento completado" ni "factura emitida"). El feed actual deriva ítems
honestos de campos existentes (pesajes, altas). Un feed de eventos real requiere
un modelo de eventos + endpoint (regla 3).

## 4. Resumen
- ✅ Fuente de verdad identificada y ya usada por conteos/tablas/gráficas.
- ✅ Feed migrado a esa fuente (sin tocar API/esquema).
- ⏳ Sidebar (conteo + coach/plan) y modelo de eventos del feed: requieren
  wiring de datos / cambios de esquema → propuestos arriba, **sin implementar**.
