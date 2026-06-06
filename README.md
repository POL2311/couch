This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Puesta en marcha

1. Instala dependencias y genera el cliente Prisma (el `postinstall` lo hace automáticamente):

   ```bash
   npm install
   ```

2. Configura el entorno: copia `.env.example` a `.env` (los valores por defecto sirven para desarrollo local con SQLite).

3. Crea la base de datos y siémbrala (migra `database.json` + crea las cuentas demo):

   ```bash
   npm run db:reset
   ```

4. Arranca el servidor de desarrollo:

   ```bash
   npm run dev
   ```

Abre [http://localhost:3000](http://localhost:3000). Serás redirigido a `/login`.

### Cuentas de demostración (3 roles)

| Rol     | Correo                | Contraseña   | Acceso                                   |
| ------- | --------------------- | ------------ | ---------------------------------------- |
| Coach   | `coach@mycoach.app`   | `coach123`   | Dashboard, alumnos, plantillas, pagos    |
| Admin   | `admin@mycoach.app`   | `admin123`   | Panel global del SaaS y alta de coaches  |
| Cliente | `cliente@mycoach.app` | `cliente123` | Portal móvil B2C (dieta, rutina, progreso) |

### Scripts útiles

- `npm run db:push` — sincroniza el esquema Prisma con la base de datos.
- `npm run db:seed` — siembra/migra los datos y cuentas.
- `npm run db:reset` — recrea la base de datos desde cero y la siembra.

## Arquitectura

- **Next.js 16 (App Router)** + **React 19** + **Tailwind CSS 4**.
- **Prisma ORM + SQLite** como base de datos relacional (`prisma/schema.prisma`).
- **NextAuth/Auth.js v5** (Credentials + JWT) con control de acceso por rol en `src/proxy.ts`.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# couch
