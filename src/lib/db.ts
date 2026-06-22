import "server-only";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";

/**
 * Cliente Prisma como singleton (CLAUDE.md §11.11): evita abrir múltiples
 * conexiones por el hot-reload de Next en desarrollo. En Prisma 7 el cliente se
 * conecta mediante un driver adapter (aquí, SQLite con better-sqlite3); la CLI
 * usa la URL de `prisma.config.ts`.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: env.DATABASE_URL }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
