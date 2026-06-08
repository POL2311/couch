---
name: project-overview
description: MyCouch — app de coaching fitness con Next.js, Prisma+SQLite, 3 roles (coach/alumno/admin), rumbo hacia SaaS multi-tenant
metadata:
  type: project
---

MyCouch es una plataforma de coaching fitness. Stack actual: Next.js (ver. con breaking changes, leer docs en node_modules/next/dist/docs/), Prisma ORM + SQLite, autenticación con 3 roles.

**Roles:** Coach (gestiona alumnos, rutinas, dietas), Alumno (vista B2C, checklist diario), Admin.

**Roadmap próximo:**
- Auth multi-tenant estricta
- Migración SQLite → PostgreSQL (Supabase/Neon)
- Stripe Connect + webhooks de impago
- Módulo Gym Squads (salas privadas, gamificación XP, ligas)

**Why:** El producto busca ser una app de retención/comunidad, no solo un gestor de datos.
**How to apply:** Cada decisión de arquitectura debe anticipar multi-tenancy y la separación coach/alumno. Prisma schema debe escalar hacia PostgreSQL sin fricciones.
