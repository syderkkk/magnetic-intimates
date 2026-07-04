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
  // Protege /api/cron/cleanup (docs/08 paso 7): sin esta clave, el endpoint
  // rechaza toda petición en vez de arrancar sin protección.
  CRON_SECRET: z.string().min(1, "Falta CRON_SECRET en el entorno"),
  // Opcionales a propósito: sin cliente de Resend/correo definitivo todavía
  // (TODO: confirmar con cliente). `lib/mail.ts` degrada solo a "no enviar +
  // log" si faltan, en vez de romper el arranque de toda la app.
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1).optional(),
  // Bandeja del negocio para avisos de contacto y Libro de Reclamaciones.
  // TODO: confirmar con cliente — correo definitivo de atención.
  ADMIN_NOTIFICATION_EMAIL: z.email().optional(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  CRON_SECRET: process.env.CRON_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL,
});
