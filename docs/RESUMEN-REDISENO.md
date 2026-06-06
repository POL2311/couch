# Resumen del rediseño — rama `new_design`

Dos fases sobre el MVP de MyCoach:
1. **Rediseño visual** a estética "SF Dark Pro" (App de Apple), guiado por `ROADMAP.md §3`.
2. **Densidad y escalabilidad** para que la app aguante cientos de registros sin
   volverse inusable (filas compactas, paginación, divulgación progresiva, techos).

QA de cierre: `tsc --noEmit` EXIT=0 y `npm run build` compila correctamente.

## Historial (git log --oneline)

**Fase 2 — Densidad y escalabilidad**
```
cd62b8d densidad: techos y paginación de secciones
6104a74 densidad: tabla de alumnos
5a6c449 densidad: plantillas resumen + detalle
8e86290 densidad: fundación
e6be7a0 rediseño iOS: cobros y alumnos
```

**Fase 1 — Rediseño visual + QA**
```
59d1c50 fix: estado activo de navegación
b45e149 fixes responsive: bottom bar 344px + tabla pagos + dev indicator
c436b26 QA: UX + datos expuestos + responsive
c676c6f QA + resumen
c5a373e rebrand: MyCoach
52b8787 pulido final + auditoría de color
098f059 coherencia de datos
b4098c6 verificación: periodization + payments a tokens de tema (estado vs superficie)
00d9062 paso 5: student-detail
09aca47 paso 4: student-table
17f484a chips a superficie oscura + revert llama
65692ab fix: llama de kcal en rojo
7b48456 skeletons + empty states
cd3b9f0 paso 3: stats-row
f85989d migración emoji → lucide completa
9cc9193 feed lucide + microcopy + migración emojis restantes
```

(Previos en la rama: rebrand de fuente a Hanken Grotesk, tema SF Dark Pro en
`globals.css`, glassmorphism + breakpoint `md` en sidebar, instalación de
`lucide-react`.)

## Qué cambió por vista / componente

| Vista / componente | Cambios |
|---|---|
| **globals.css** | Tema claro → "SF Dark Pro": fondo `#0a0a0b`, superficies grises, bordes `white/7`, textos blanco/plata/gris, botón blanco. Shimmer de skeleton. Tokens nuevos (ver abajo). |
| **layout / fuente** | Fuente base → Hanken Grotesk (`next/font/google`, 400-700, swap). Breakpoint del sidebar `lg`→`md`. |
| **sidebar** | Glassmorphism (`--glass` + backdrop-blur), iconos Lucide, bottom bar móvil con labels, rebrand "MYCOACH". |
| **Dashboard (coach)** | KPIs reescritos (etiqueta 11px/0.08em, valor 30px/600, nunca "—", cero en terciario). Gráfica y timeline con `ChartSkeleton`/`RowSkeleton` + `EmptyState`. Feed migrado a iconos Lucide y **derivado de la fuente real** (`students`). Badge AutoCron monocromo. Restos zinc → tokens. |
| **Alumnos (student-table)** | Respiración de filas (`py-6`, bordes `px-6`), tokens `--ring-on-dark`/`--underline-on-dark`, empty state `SearchX`, skeleton de carga. Cero paleta fija. |
| **Detalle (student-detail)** | Radios orgánicos (`rounded-2xl`/`xl`), cabecera glass (beige→`--glass`), foto/scrim/botones a tokens, iconos Lucide (Flame/Ruler/Droplet/Calendar/ArrowLeft), skeleton de carga + `EmptyState` de error, nav móvil con blur. |
| **Plantillas** | Chips kcal/días a superficie del tema, iconos Lucide (Flame/Clock/Zap), bullets y restos zinc → tokens. |
| **Periodización** | Estado→token (warning/danger), superficies→token, ring del punto = color de superficie, skeleton/empty cableados, KPIs sin "—". |
| **Pagos** | `getStatusStyle` ya tokenizado; KPIs con jerarquía paso 3 + skeleton + sin "—"; tabla con skeleton; Stripe/botones/dots a tokens. |
| **Modales** | Backdrops → `--scrim`, accents de radio → `--accent-primary`, hex/red → tokens. |
| **header / bulk-action-bar** | Cristal unificado (`--glass` / `--glass-strong`) con backdrop-blur. |

## Tokens nuevos creados (globals.css)

| Token | Valor | Uso |
|---|---|---|
| `--ring-on-dark` | `rgba(255,255,255,0.20)` | Anillos de foco sobre fondo oscuro |
| `--underline-on-dark` | `rgba(255,255,255,0.20)` | Subrayado decorativo en hover |
| `--scrim` | `rgba(0,0,0,0.6)` | Overlay único: modales + scrim de imágenes |
| `--glass` | `rgba(8,8,10,0.72)` | Cristal de chrome (sidebar, header, bottom-bar) |
| `--glass-strong` | `rgba(5,5,5,0.95)` | Cristal del bulk-action-bar flotante |
| `--row-h-compact` | `56px` | Altura de fila de tablas/listas de trabajo (Fase 2) |
| `--row-h-comfortable` | `72px` | Altura de fila cómoda alternativa (Fase 2) |

`--bg-sidebar` ahora referencia `--glass`. Los `*-subtle` (success/warning/danger
/info al 10%) ya existían y se reutilizan para los fondos de estado. Animaciones CSS
nuevas: `sheet-up` (bottom sheet), `scrim-in`, `panel-in` (panel lateral).

## Barridos de regresión (QA)
- **Emojis en `src/`:** cero en UI (solo `→` en comentarios).
- **Paleta fija / hex en `.tsx`:** cero.
- **`rgba()` sueltos:** solo justificados — badge AutoCron `white/8`, contenedor de
  icono del feed `white/4`, fade blanco del chart de peso, sombra/inset del
  bulk-bar, y una mención en comentario de `skeleton.tsx`.
- **`"—"` como valor de KPI:** cero en stat-cards.

## Fase 2 — Densidad y escalabilidad

Principio: **densidad por capas** — los resúmenes (KPIs, dashboard) conservan su
aire; las superficies de trabajo (tablas, listas) se compactan y acotan.

### Fundación
- Tokens de altura de fila `--row-h-compact` (56px) / `--row-h-comfortable` (72px),
  aplicados como altura de fila en las tablas (reemplazan los `py-*` fijos).
- **Headers de columna sticky** (`sticky top-0` + superficie + hairline) en toda tabla.
- **Chips de filtro con contador real** (`filter-bar`): "Activo · 9", "Volumen · 4"…
  calculados desde `students`.

### Componentes reutilizables nuevos
| Componente | Uso |
|---|---|
| `components/detail-overlay.tsx` | Shell de detalle: bottom sheet (móvil) + variante desktop `dialog` (Pagos) o `panel` lateral (Plantillas); cierra con Esc / scrim / X. Reutilizado, sin duplicar. |
| `lib/activity.ts` (`buildFeedItems`) | Deriva el feed de actividad desde `students` (pesajes + altas). |
| `components/feed-row.tsx` (`FeedRow`) | Fila del feed compartida por dashboard y `/coach/activity`. |
| `components/skeleton.tsx` (`RowSkeleton`) | Aplanado a forma de celda iOS (avatar + 2 líneas + trailing, separador inset). |

### Cambios por vista (Fase 2)
| Vista | Cambios |
|---|---|
| **Pagos (Cobros y Alumnos)** | Rediseño iOS: lista agrupada por estado ("Requieren acción" → "Al día" → "Inhabilitadas", con contador; secciones vacías ocultas). Móvil = celdas iOS (separador inset, sin scroll horizontal); desktop = tabla `ALUMNO · CUOTA (MXN) · ESTADO`, fila clickeable → detalle. Detalle en `DetailOverlay` (sheet/dialog) con acciones en contexto ("Recordar pago" solo en gracia, "Ver en Stripe"). **Techo:** "Requieren acción" completa; el resto cap 10 + "Mostrar 50 más" (revelado incremental). |
| **Alumnos (student-table)** | Fila compacta 56px: nombre 15px · email 12px terciario en una línea (truncate + `title`). Fila completa clickeable (checkbox/acciones con `stopPropagation`). **Paginación 50/pág** con estado en `?page` (vía `history.replaceState`); filtros/conteos sobre el total. Card móvil compacta a 64px (una línea por dato). |
| **Plantillas** | Card resumen (nombre, badge kcal, barra de macros, "N comidas · objetivo") + **detalle por divulgación progresiva** en panel lateral (desktop) / bottom sheet (móvil) con la lista completa y "Editar plantilla". **Búsqueda** por nombre que filtra el grid en vivo. Empty state de búsqueda. |
| **Dashboard** | Feed capeado a **6** + "Ver toda la actividad" → nueva ruta. Timeline "Próximos Cambios Programados" capeado a 5 + "Ver todos (N)" → periodización. |
| **`/coach/activity`** (ruta nueva) | Lista completa del feed, **paginada 50/pág** (`?page`), con `FeedRow` + skeleton + empty state. |

### Auditoría de listas sin techo
- Cronograma de periodización: es la vista destino completa → sin cap.
- Comidas/ejercicios de plantillas: acotadas por plantilla y dentro del detalle → no crecen sin límite.
- Sin virtualización (la paginación pone el techo); se virtualizaría solo si una página renderizara >100 filas.

## Pendientes / decisiones abiertas

1. **Datos (ver `docs/DIAGNOSTICO-DATOS.md`):**
   - Sidebar "Pro · 47 alumnos" sigue hardcodeado — mostrar el conteo real exige
     wiring de datos (fetch/contexto) → regla 3, propuesto sin implementar.
   - "Coach Alejandro" / "Pro": no existe entidad coach/plan en el esquema.
   - El feed deriva ítems honestos de campos reales; un feed de *eventos* real
     necesita modelo de eventos (regla 3).
2. **`student-detail.tsx:525`** muestra `"—"` en la grid de medidas corporales
   cuando no hay dato. **No es un KPI**; "0 cm" sería incorrecto. Decisión
   pendiente: dejar el guion, usar "Sin dato", o vaciar la celda.
3. **Periodización:** sus cards superiores son de *distribución* (label + badge +
   barra), no stat-cards de número grande. Se aplicó "nunca —" pero NO se
   reestructuraron a valor 30px (sería rediseño profundo, fuera de alcance).
4. **Rediseño profundo** de periodización/pagos: explícitamente fuera del alcance
   de esta rama (sólo tokenización + consistencia, no reestructura).
5. **`ROADMAP.md`** aún dice "MyCouch" (doc de referencia, no UI) — sin renombrar.
