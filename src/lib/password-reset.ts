import "server-only";

import { createHash, randomBytes } from "node:crypto";

/** Vigencia del token de recuperación (CLAUDE.md §7.6). */
export const PASSWORD_RESET_TTL_MINUTES = 15;

/** Genera un token aleatorio crudo (va en el enlace del correo, nunca en la BD). */
export function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}

/** Hash del token para guardar en `password_reset_tokens.token_hash`. */
export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
