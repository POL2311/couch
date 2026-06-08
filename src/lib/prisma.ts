import { PrismaClient } from "@prisma/client";

// Singleton para evitar múltiples instancias en desarrollo (hot-reload).
// datasourceUrl se pasa explícitamente: evita que Prisma use su propio
// mecanismo de lectura de env, que puede evaluarse antes de que Next.js
// termine de cargar .env y daría como resultado la URL default localhost:5432.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
