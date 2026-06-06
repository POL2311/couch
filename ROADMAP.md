# 🖤 Estado Actual, Tecnologías y Hoja de Ruta (Roadmap) — MyCouch

Este documento contiene el análisis exhaustivo del estado actual del MVP de **MyCouch**, las tecnologías utilizadas, el rumbo estratégico del producto y las directrices de rediseño visual bajo la estética de una **App de Apple (Premium iOS/macOS Minimalist UI)**.

---

## 🛠️ 1. Stack Tecnológico (Tecnologías Usadas)

El proyecto está construido sobre un stack moderno, escalable, type-safe y optimizado para rendimiento móvil y web:

- **Framework Core:** Next.js 14/15 (App Router) utilizando Server Components para la carga eficiente de datos y Client Components para la interactividad interactiva[cite: 1].
- **Estilos y Diseño:** Tailwind CSS para maquetación rápida y responsiva.
- **Componentes de UI:** Inspirados en Radix UI / shadcn/ui (reutilizables, accesibles y modulares)[cite: 1].
- **Iconografía:** Lucide React (líneas finas, minimalistas).
- **Base de Datos Local (MVP actual):** Archivo `database.json` local con un ORM simulado en `db.ts` para persistencia de desarrollo rápido y siembra automatizada[cite: 1].

---

## 2. Análisis de Módulos: Lo que tenemos hoy

El MVP cuenta con una capa funcional en el backend local y flujos de pantallas completos para el Coach[cite: 1].

### ── CAPA DEL BACKEND Y DATOS (INFRAESTRUCTURA MOCK)
- **Persistencia en Servidor Local** (`db.ts` & `database.json`): Base de datos en archivo JSON con 12 alumnos iniciales de prueba con historial completo[cite: 1].
- **Next.js API Routes:** endpoints para `/api/students` (lista y registro con `FormData`), `/api/students/[id]` (detalle y cancelación de eventos), y `/api/students/change-stage` (cambios de etapa)[cite: 1].
- **Carga Física de Fotos:** Almacenamiento asíncrono en `public/uploads/`[cite: 1].
- **Simulador de Cron Integrado (AutoCron):** Gatillo que ejecuta los cambios de etapa guardados cuando la fecha se cumple[cite: 1].

### ── PANELES DE NAVEGACIÓN ACTUALES (VISTA COACH)
- **Dashboard Principal:** Tarjetas de KPIs (MRR, adherencia, activos)[cite: 1], gráfica SVG de curvas, y timeline de eventos futuros[cite: 1].
- **Listado de Alumnos:** Tabla con filtros rápidos por estado de cuenta y etapa[cite: 1]. Barra flotante de acciones en lote (`BulkActionBar`) para programar el cambio de etapa masivo[cite: 1].
- **Modal de Registro Asistente (Wizard):** Formulario por pasos que bloquea envíos accidentales[cite: 1].
- **Ficha Técnica (Detalle):** Gráfica SVG de peso[cite: 1], grid de medidas corporales[cite: 1], visualizador de dietas/rutinas[cite: 1], visor de fotos con zoom[cite: 1] y banner para cancelar etapas programadas[cite: 1].
- **Catálogo de Plantillas:** Biblioteca estática de dietas desglosadas por macros/horarios y rutinas (PPL, Full Body)[cite: 1].
- **Gestión de Pagos:** Monitor de cobros recurrentes mensuales ($1,200 MXN por alumno) y estados de corte[cite: 1].

---

## 🎨 3. Directrices de Rediseño: Estilo "App de Apple"

Queremos alejarnos del diseño web oscuro genérico (bordes grises duros, exceso de colores e interfaces apretadas). El objetivo es que la plataforma se sienta como una aplicación nativa de Apple (iOS/macOS). Claude debe aplicar las siguientes reglas estéticas:

### A. Paleta de Colores "SF Dark Pro"
- **Fondo de la App:** Negro puro (`#000000`) o un carbón extremadamente profundo (`#08080A`).
- **Tarjetas y Contenedores:** Gris sutil (`#121214` o `#1C1C1E`) que flote sobre el fondo negro, usando bordes casi imperceptibles (`border-zinc-800/30` o `border-white/5`).
- **Textos:** Títulos en Blanco Puro (`#FFFFFF`), texto de lectura en Plata Brillante (`#E5E5EA`) y textos secundarios o etiquetas en Gris Apagado (`#8E8E93`).
- **Colores de Acento (Uso Quirúrgico):** Cero arcoíris de colores chillones[cite: 1]. Los botones principales deben ser de alto contraste (Blanco puro con texto negro, estilo botón de acción de Apple). Los estados usaran transparencias sutiles (ej: Activo = `bg-emerald-500/10 text-emerald-400`).

### B. Espaciado y Anatomía Visual
- **Esquinas Redondeadas:** Uso de radios suaves y orgánicos estilo Apple (`rounded-2xl` para tarjetas grandes, `rounded-xl` para botones y inputs).
- **Respiración Visual (Padding):** Duplicar el aire visual. Las filas de las tablas y las tarjetas de dieta deben tener paddings generosos (`py-6`, `px-6`) para que la información se sienta limpia, lujosa y premium[cite: 1].
- **Efecto Cristal (Glassmorphism):** La barra flotante de acciones en lote (`BulkActionBar`)[cite: 1] y el Header superior deben usar desenfoque de fondo premium (`backdrop-blur-md bg-black/40 border-white/5`).

### C. Experiencia Móvil Ultra-Intuitiva (Mobile-First)
- **Navegación Inferior (Bottom Bar):** En pantallas móviles (`md:hidden`), ocultar barras laterales y mostrar una barra fija inferior con íconos grandes de Lucide (Hoy, Progreso, Salas, Perfil), perfectamente diseñada para el pulgar.
- **Pila de Tarjetas Diarias (Daily Card Stack):** Para el alumno, la pantalla del día debe ser un checklist intuitivo y grande, fácil de marcar mientras entrena con dedos sudados.
- **Macros en la Dieta:** Eliminar textos pequeños laterales[cite: 1]. Diseñar un mini-grid horizontal con bloques limpios (`bg-zinc-900/50 text-center rounded-xl p-3`) donde se lea el número grande en blanco (ej: **140g**) y abajo el tipo en gris (Proteína).

---

## 🚀 4. Rumbo Estratégico y Futuro del Producto

El rumbo de MyCouch va más allá de un gestor de datos; busca convertirse en una plataforma de retención y comunidad a través de la gamificación. El desarrollo futuro se divide en:

### A. Fase Inmediata (SaaS Core)
1. **Autenticación Multi-Inquilino (Multi-tenant Auth):** Separación estricta entre portales para que el Coach solo vea a sus alumnos, y los Alumnos tengan su propia interfaz B2C[cite: 1].
2. **Base de Datos PostgreSQL (Supabase/Neon):** Migración del archivo JSON a un esquema relacional sólido con Prisma ORM[cite: 1].
3. **Pasarela de Pagos Stripe Connect & Paywall:** Automatización de cobros del coach a alumnos. Integración de webhooks para inhabilitar y bloquear la cuenta del alumno instantáneamente en la base de datos si ocurre un evento de impago (`invoice.payment_failed`)[cite: 1].

### B. El Futuro: Módulo de Salas Privadas y Gamificación (Gym Squads)
Para potenciar la viralidad y retención orgánica de la app, se construirá un ecosistema social:
1. **Gym Squads (Salas Privadas):** Espacios donde usuarios comunes o alumnos pueden crear un grupo con amigos, invitándolos por código QR o enlace, para compartir y clonar rutinas cotidianas entre ellos de forma privada.
2. **Corte Semanal Competitivo:** Un dashboard interno dentro de la sala que se congela de manera automatizada todos los sábados a las 23:59, mostrando un podio (1º, 2º y 3º lugar) basado en puntos de experiencia (XP) acumulados, reiniciándose a ceros el domingo.
3. **Sistema de Ligas (Anti-Frustración):** Para evitar que los novatos se frustren frente a los avanzados, el algoritmo distribuirá automáticamente a los usuarios en Ligas (Bronce, Plata, Oro) de acuerdo con su porcentaje de constancia de las últimas 4 semanas.
4. **Misiones Temáticas de XP:**
   - *Diarias:* Completar la rutina del coach (+20 XP), registrar comidas (+15 XP).
   - *Semanales:* Racha perfecta de días entrenados (+50 XP), superar un récord personal/PR (+40 XP).
   - *Cooperativas/Grupales:* "El equipo entero debe sumar 500 XP esta semana". Si se cumple, todos ganan un bono, incentivando el apoyo mutuo y eliminando la toxicidad competitiva.

---

## 🎯 Instrucción para Claude Code:
"Lee este archivo `ROADMAP.md` por completo. Tu objetivo actual es tomar el código del frontend existente en `src/app` y `src/components`, y aplicar un **rediseño visual exhaustivo** guiado bajo la sección **3. Directrices de Rediseño: Estilo 'App de Apple'**, asegurando que el layout web y la experiencia móvil nativa queden impecables, ultra-limpios y listos para los siguientes módulos dinámicos."