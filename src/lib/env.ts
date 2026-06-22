import "server-only";

import { z } from "zod";

/**
 * Validación de variables de entorno del SERVIDOR (CLAUDE.md §11.11): falla
 * rápido si falta una clave. No incluir aquí variables `NEXT_PUBLIC_*` que el
 * cliente necesite (este módulo es solo de servidor).
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "Falta DATABASE_URL en el entorno"),
  AUTH_SECRET: z.string().min(1, "Falta AUTH_SECRET en el entorno"),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
});
