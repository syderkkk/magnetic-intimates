import "server-only";

import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

interface AuditEntry {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  /** Detalle (antes/después u otros datos); se guarda tal cual en la columna Json. */
  changes?: Prisma.InputJsonValue | null;
  ipAddress?: string | null;
}

/** ¿El error es una violación de clave foránea? (Prisma `P2003`). */
function isForeignKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2003"
  );
}

/**
 * Registra un evento en `audit_logs` (CLAUDE.md §11.8). La auditoría es
 * SECUNDARIA: NUNCA rompe la operación principal.
 *
 * Si el `userId` proviene de una sesión obsoleta que ya no existe en `users`
 * (p. ej. tras re-seed en desarrollo), la inserción falla por FK. En ese caso
 * reintentamos sin usuario para no perder el evento, en vez de descartarlo y
 * llenar la consola de errores. El arreglo de fondo es cerrar e iniciar sesión.
 */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  const data = {
    userId: entry.userId ?? null,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId ?? null,
    changes: entry.changes ?? undefined,
    ipAddress: entry.ipAddress ?? null,
  };

  try {
    await db.auditLog.create({ data });
  } catch (error) {
    if (data.userId && isForeignKeyError(error)) {
      try {
        await db.auditLog.create({ data: { ...data, userId: null } });
        return;
      } catch {
        // Si el reintento también falla, cae al aviso de abajo.
      }
    }
    console.warn(
      "[audit] evento no registrado:",
      error instanceof Error ? error.message : error,
    );
  }
}
