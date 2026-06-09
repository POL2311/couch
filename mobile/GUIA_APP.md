# 📱 Guía de la App Móvil MyCoach (para principiantes)

Esta guía explica **qué se creó**, **cómo está organizado**, **qué tocar si cambiamos
de base de datos** y **cómo probar la app en tus propios celulares** durante esta fase
de demo. Está escrita en español y paso a paso.

> ⚠️ Estamos en **fase de DEMO**: la app **no** se sube a App Store ni Play Store.
> Solo la instalamos en nuestros propios teléfonos para probarla.

---

## 1. ¿Qué se creó y qué afecta cada parte?

Toda la app móvil vive **dentro de la carpeta `/mobile`**, completamente separada de la web.
La página web (Next.js, en `src/`) **no se tocó** para construir la app — salvo dos
exclusiones defensivas para que el build de la web no intente compilar el código móvil
(ver más abajo).

```
mobile/
├── app/                      # Pantallas (Expo Router: cada archivo = una ruta)
│   ├── _layout.tsx           # Layout raíz (sesión, tema, navegación)
│   ├── index.tsx             # Punto de entrada: redirige según login/rol
│   ├── login.tsx             # Pantalla de inicio de sesión
│   ├── (coach)/              # 🟦 Área del COACH (pestañas inferiores)
│   │   ├── _layout.tsx       #   Barra de pestañas: Resumen, Alumnos, Plantillas, Pagos, Actividad
│   │   ├── index.tsx         #   Resumen (KPIs, curva de adherencia)
│   │   ├── students.tsx      #   Lista de alumnos con búsqueda y filtros
│   │   ├── templates.tsx     #   Plantillas de dietas y rutinas
│   │   ├── payments.tsx      #   Pagos (MRR y estados)
│   │   ├── activity.tsx      #   Feed de actividad
│   │   └── student/[id].tsx  #   Ficha del alumno (detalle)
│   └── (portal)/             # 🟩 Área del ALUMNO (pestañas inferiores)
│       ├── _layout.tsx       #   Pestañas: Hoy, Correr, Progreso, Perfil
│       ├── index.tsx         #   Hoy (dieta con anillo de calorías, rutina)
│       ├── run.tsx           #   🏃 Lista de carreras (módulo Strava)
│       ├── run-record.tsx    #   🏃 Grabar carrera con GPS
│       ├── run-detail.tsx    #   🏃 Detalle + exportar foto para compartir
│       ├── progress.tsx      #   Progreso (peso, medidas)
│       └── profile.tsx       #   Perfil y cerrar sesión
│
├── lib/
│   ├── data/                 # ⭐ CAPA DE DATOS CENTRALIZADA (ver sección 2)
│   │   ├── index.ts          #   Único punto de acceso a datos (login, alumnos, etc.)
│   │   ├── config.ts         #   Modo de datos (mock / api) y URL de la API
│   │   ├── client.ts         #   Cliente HTTP + token de sesión
│   │   ├── mock.ts           #   Datos de ejemplo (modo demo sin backend)
│   │   ├── carreras.ts       #   🏃 Carreras (guardado local hoy; Supabase en Fase 0)
│   │   └── types.ts          #   Tipos de datos (copiados de la web)
│   ├── theme.ts              # Colores "SF Dark Pro" (espejo de la web)
│   ├── session.tsx           # Estado de sesión (usuario logueado) y ruteo por rol
│   ├── use-me.ts             # Datos del alumno autenticado (portal)
│   ├── geo.ts                # 🏃 Distancia GPS, formatos y proyección de la silueta
│   └── run-tracker.ts        # 🏃 Hook de grabación de carrera con GPS
│
├── components/
│   ├── ui.tsx                # Componentes visuales compartidos (tarjetas, etiquetas…)
│   └── route-silhouette.tsx  # 🏃 Dibuja la SILUETA del recorrido (SVG, sin mapa)
│
├── tailwind.config.js        # Paleta "SF Dark Pro" para NativeWind
├── app.json                  # Configuración de la app y permisos (GPS, cámara…)
├── babel.config.js           # Babel (NativeWind + Expo)
└── package.json              # Dependencias propias de la app (aisladas de la web)
```

### ¿Qué se tocó de la web? (mínimo e inofensivo)
Solo dos archivos, y solo para **excluir** `/mobile` de su compilación (así el build de la
web nunca intenta compilar código de React Native):
- `tsconfig.json` → se agregó `"mobile"` a `exclude`.
- `eslint.config.mjs` → se agregó `"mobile/**"` a los ignorados.

Nada más de la web fue modificado. `database.json`, `public/uploads` y el código de
Next.js quedaron intactos.

---

## 2. ¿Qué cambiar si cambiamos de base de datos?

**Solo se toca la carpeta `mobile/lib/data/`.** Las pantallas NUNCA llaman a la base de
datos directamente: siempre usan funciones de esa capa. Esa es la idea de tenerla
centralizada.

Hoy la app funciona en **modo `mock`** (datos de ejemplo dentro del teléfono, sin
backend). El modo se controla con una variable en el archivo `mobile/.env`:

```bash
# mobile/.env
EXPO_PUBLIC_DATA_SOURCE="mock"           # "mock" = datos de ejemplo | "api" = backend real
EXPO_PUBLIC_API_URL="http://192.168.x.x:3000"   # URL de tu API de Next.js
```

### Para conectar a datos reales (Supabase, Fase 0):
1. Cambia `EXPO_PUBLIC_DATA_SOURCE` a `"api"`.
2. Pon en `EXPO_PUBLIC_API_URL` la URL de tu web desplegada (ej. `https://tu-app.vercel.app`).
3. **Eso es todo en la app.** La lógica de qué endpoint llamar ya está escrita en
   `mobile/lib/data/` (archivos `index.ts` y `carreras.ts`, en el bloque `api`).

Si algún día cambiamos de proveedor de base de datos otra vez, **solo se editan esos
archivos de `lib/data/`**; las pantallas no se tocan.

---

## 3. Cómo PROBAR la app en tus propios celulares (fase demo)

Hay dos formas. Empieza por la primera (la más rápida).

### A) Lo más rápido para ver la UI: **Expo Go** (escanear QR)

1. En la Mac, dentro de `mobile/`, arranca el servidor:
   ```bash
   cd mobile
   npm install        # solo la primera vez
   npx expo start --lan
   ```
2. Instala **Expo Go** en tu teléfono (App Store / Play Store).
3. Conecta el teléfono a la **misma red WiFi** que la Mac.
4. Abre la URL que aparece (ej. `exp://192.168.x.x:8081`):
   - **Android:** abre Expo Go → "Enter URL manually" → pega la URL.
   - **iPhone:** abre la app *Cámara*, apunta al QR de la terminal, y toca la notificación.

> **Importante (versión del SDK):** Expo Go de la tienda solo soporta el **último SDK**.
> Este proyecto está en **Expo SDK 54**. Si tu Expo Go es más nuevo, actualiza el proyecto;
> si te marca incompatibilidad, ese es el motivo.

**Qué funciona en Expo Go:**
- ✅ Todas las pantallas de coach y alumno.
- ✅ Registrar carrera con **GPS** (en primer plano, con la app abierta).
- ✅ Elegir **foto** de la cámara o galería.
- ⚠️ **Exportar/compartir la imagen** de la carrera **NO** funciona en Expo Go
  (usa `react-native-view-shot`, que no viene incluido). Necesita un *development build* (abajo).
- ⚠️ El **GPS en segundo plano** (pantalla apagada) **NO** funciona en Expo Go. Necesita
  *development build*.

### B) Para funciones nativas completas: **Development Build**

Un *development build* es una versión de la app instalada de verdad en el teléfono, con
**todos** los módulos nativos incluidos (GPS en segundo plano, captura de imagen, etc.).
Se crea con **EAS Build** (servicio en la nube de Expo, gratis para empezar).

Preparación (una vez):
```bash
cd mobile
npm install -g eas-cli      # o usar: npx eas-cli@latest
eas login                   # crea una cuenta gratis de Expo si no tienes
eas build:configure
```

#### 📗 Android: sacar un APK e instalarlo directo (lo más fácil)
```bash
eas build --platform android --profile preview
```
- Genera un **APK** descargable (link al terminar, ~10-20 min).
- Descárgalo en el teléfono Android y ábrelo para instalar.
  (Activa "Instalar apps de orígenes desconocidos" si lo pide.)
- Listo: lo abres como cualquier app, sin tiendas.

> Para que `--profile preview` genere APK, en `eas.json` el perfil `preview` debe tener
> `"android": { "buildType": "apk" }`. EAS lo configura al correr `build:configure`; si no,
> se agrega a mano.

#### 🍎 iPhone (iOS): por qué NO es tan libre como Android
Apple **no** permite instalar apps libremente fuera de la App Store. Para meter un
*development build* en un iPhone necesitas **una de estas**:
- **Cuenta de Apple Developer de pago** (99 USD/año) para generar un build instalable
  por aire con EAS, **registrando el UDID** de cada iPhone de prueba; **o**
- **Una Mac con Xcode**, conectando el iPhone por cable y compilando localmente
  (`npx expo run:ios --device`), válido con una cuenta de Apple gratuita pero con
  caducidad de 7 días y límites.

En resumen: **Android se instala directo con un APK**; **iOS requiere pagar la cuenta de
Apple o usar una Mac con Xcode**. Por eso, para la demo, lo más práctico es Android.

> **Recordatorio:** en esta fase **NO subimos nada a las tiendas**. Todo es instalación
> directa en nuestros propios teléfonos.

---

## 4. Cuentas de demostración (modo mock)

| Rol     | Correo                | Contraseña   |
| ------- | --------------------- | ------------ |
| Coach   | `coach@mycoach.app`   | `coach123`   |
| Admin   | `admin@mycoach.app`   | `admin123`   |
| Cliente | `cliente@mycoach.app` | `cliente123` |

(En modo `api`, el login usará las cuentas reales de la base de datos.)

---

## 5. Notas del módulo de carreras (Strava)

- La **silueta** del recorrido se dibuja con `react-native-svg` a partir de los puntos
  GPS (`components/route-silhouette.tsx`). **No usa Google Maps** ni llave de API.
- Hoy las carreras se guardan **solo en el teléfono** (AsyncStorage). Verás un aviso
  amarillo recordándolo. Se sincronizarán cuando activemos **Supabase (Fase 0)**: en ese
  momento se crea la tabla `carreras` y solo se cambia el bloque `api` de
  `mobile/lib/data/carreras.ts`.
- Permisos declarados en `app.json`: ubicación (primer plano y segundo plano), cámara y
  galería.
