import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";

/**
 * Cliente Prisma como singleton (CLAUDE.md §11.11): evita abrir múltiples
 * conexiones por el hot-reload de Next en desarrollo. En Prisma 7 el cliente se
 * conecta mediante un driver adapter (aquí, PostgreSQL/Supabase vía `pg`). Las
 * migraciones de la CLI usan `DIRECT_URL` (ver schema.prisma).
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
