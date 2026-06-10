# 🗄️ Fase 0 — Conectar web + app a Supabase (datos reales sincronizados)

Esta guía completa la **Fase 0**: pasar la base de datos a **Supabase (PostgreSQL)** para
que la **web y la app móvil compartan los mismos datos** y se sincronicen de verdad.

El **código del backend ya está preparado** (ver sección "Qué ya quedó listo"). Solo
faltan los pasos que requieren **tu cuenta** (crear Supabase y, opcional, desplegar).

> Todo esto está en la rama `app_ram` y es **local** (sin push), como acordamos.

---

## ✅ Qué ya quedó listo (código, en `app_ram`)

**En la web** (`src/`):
- **Modelo `Carrera`** en `prisma/schema.prisma` (tabla de carreras del módulo Strava).
- **Login para la app**: `POST /api/mobile/login` → valida correo/contraseña y devuelve
  `{ token, user }` (un JWT firmado con tu `AUTH_SECRET`).
- **Soporte de token Bearer**: `src/lib/session.ts` ahora acepta tanto la cookie de la web
  como el header `Authorization: Bearer <token>` de la app. Así **toda la API existente**
  (`/api/students`, `/api/templates`, `/api/me`…) funciona también para la app, sin cambiar
  cada endpoint.
- **Endpoints de carreras**: `GET/POST /api/carreras` y `GET/DELETE /api/carreras/[id]`
  (con control de acceso: el alumno ve las suyas, el coach las de sus alumnos).

**En la app** (`mobile/`):
- La capa de datos (`lib/data/`) ya sabe llamar a esos endpoints cuando esté en modo `api`.
  Las carreras y el portal del alumno ya están listos para datos reales.

---

## 🧑‍💻 Pasos que tú haces

### 1. Crear el proyecto en Supabase
1. Entra a [supabase.com](https://supabase.com) → **New project** (plan gratis sirve).
2. Elige una contraseña de base de datos y guárdala.
3. Cuando termine, ve a **Project Settings → Database → Connection string → URI**.
4. Copia la cadena. Se ve así (usa el puerto **5432**, conexión directa, o el **pooler 6543**
   para producción):
   ```
   postgresql://postgres:[TU-PASSWORD]@db.[REF].supabase.co:5432/postgres
   ```

### 2. Apuntar la web a Supabase
En la raíz del proyecto, edita `.env`:
```bash
DATABASE_URL="postgresql://postgres:TU-PASSWORD@db.REF.supabase.co:5432/postgres"
AUTH_SECRET="...mismo secreto de siempre..."
```
> El esquema ya está en `provider = "postgresql"`, así que no hay que cambiar nada más.

### 3. Crear las tablas y sembrar datos
```bash
npm run db:push     # crea todas las tablas en Supabase (incluida "Carrera")
npm run db:seed     # crea las cuentas demo y datos de ejemplo
```
(O `npm run db:reset` para recrear desde cero.)

### 4. Probar la web
```bash
npm run dev
```
Entra en `http://localhost:3000` con `coach@mycoach.app` / `coach123`. Si carga, la web
ya está sobre Supabase. 🎉

### 5. Conectar la app a la API real
En `mobile/.env`:
```bash
EXPO_PUBLIC_DATA_SOURCE="api"
EXPO_PUBLIC_API_URL="http://TU-IP-LOCAL:3000"   # ej. http://192.168.100.5:3000
```
> Usa tu **IP local** (no `localhost`), porque el celular es otro dispositivo.
> Mira tu IP con: `ipconfig getifaddr en0`

Reinicia Expo:
```bash
cd mobile
npx expo start --lan --clear
```
Ahora la app hace login real contra la web y comparte datos con ella. Si registras una
carrera en la app, se guarda en Supabase y el coach la verá.

### 6. (Recomendado para demo) Exponer la web local con **ngrok**
Para que el celular alcance la web **desde cualquier red** (incluso datos móviles) sin
desplegar todavía en HostGator. La web corre en tu Mac y ngrok le da una URL pública HTTPS.

1. Instala ngrok: [ngrok.com/download](https://ngrok.com/download) (o `brew install ngrok`).
   Crea una cuenta gratis y corre `ngrok config add-authtoken <TU-TOKEN>` (una vez).
2. Con la web corriendo (`npm run dev`, en `localhost:3000`), en otra terminal:
   ```bash
   ngrok http 3000
   ```
3. Copia la URL `Forwarding` que te da, p.ej. `https://a1b2-c3d4.ngrok-free.app`.
4. Ponla en la web y en la app:
   ```bash
   # .env (raíz, web)
   NEXT_PUBLIC_APP_URL="https://a1b2-c3d4.ngrok-free.app"
   AUTH_TRUST_HOST=true

   # mobile/.env
   EXPO_PUBLIC_DATA_SOURCE="api"
   EXPO_PUBLIC_API_URL="https://a1b2-c3d4.ngrok-free.app"
   ```
5. Reinicia `npm run dev` (web) y `npx expo start --lan --clear` (app).

Ahora la app llega a tu web desde cualquier red. La app ya envía el header
`ngrok-skip-browser-warning`, así que las respuestas de la API llegan como JSON.

> ⚠️ Con ngrok **gratis**, la URL **cambia** cada vez que reinicias ngrok: hay que
> actualizar las dos variables y reiniciar. Con una cuenta de ngrok puedes reservar un
> **dominio estático** gratis (1 por cuenta) y así la URL no cambia.

### 7. (Más adelante) Producción en HostGator → https://toro-max.com
Cuando quieras dejarlo fijo, despliega el Next.js en HostGator (idealmente VPS: Node +
PM2 + proxy a `toro-max.com`) con las mismas variables `DATABASE_URL` y `AUTH_SECRET`, y
en `mobile/.env` pon `EXPO_PUBLIC_API_URL="https://toro-max.com"`. La base (Supabase) ya
no cambia: solo cambia quién sirve la web.

---

## 🔄 Cuándo se "apaga" el modo local de carreras
Mientras `EXPO_PUBLIC_DATA_SOURCE="mock"`, las carreras se guardan solo en el teléfono
(verás el aviso amarillo). En cuanto pongas `"api"` y la web esté sobre Supabase, las
carreras nuevas se guardan en la tabla `Carrera` de Supabase y se sincronizan.

> Las carreras ya guardadas localmente (en modo mock) no se suben solas; son de la fase
> de prueba. A partir del cambio a `api`, todo lo nuevo queda en la nube.

---

## ❓ Si algo falla
- **"AUTH_SECRET no está definido"** al hacer login en la app → falta `AUTH_SECRET` en el
  `.env` de la **web**. Genera uno con `npx auth secret` y vuelve a desplegar/reiniciar.
- **La app no conecta** → revisa que `EXPO_PUBLIC_API_URL` use tu IP local (no `localhost`)
  y que el teléfono esté en la misma WiFi (o usa la URL de Vercel).
- **Error de Prisma "can't reach database"** → revisa la `DATABASE_URL` y que el proyecto
  Supabase esté activo.
