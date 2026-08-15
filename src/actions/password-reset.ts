"use server";

import { argon2id, hash } from "argon2";

import { recordAudit } from "@/lib/audit";
import { siteConfig } from "@/config/site";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import {
  generateResetToken,
  hashResetToken,
  PASSWORD_RESET_TTL_MINUTES,
} from "@/lib/password-reset";
import { PasswordResetEmail } from "@/emails/password-reset";
import {
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "@/schemas/password-reset";
import type { ActionResult } from "@/types/action";

/**
 * Solicita el restablecimiento de contraseña (CLAUDE.md §7.6/§9): genera un
 * token de un solo uso (15 min) y lo envía por correo. Responde éxito exista
 * o no la cuenta, para no confirmar qué correos tienen acceso al admin.
 */
export async function requestPasswordReset(
  input: unknown,
): Promise<ActionResult> {
  const parsed = requestPasswordResetSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  const email = parsed.data.email.toLowerCase();
  const user = await db.user.findUnique({ where: { email } });

  if (user?.isActive) {
    const token = generateResetToken();
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashResetToken(token),
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000),
      },
    });

    const resetUrl = `${siteConfig.url}/restablecer-password?token=${token}`;
    await sendMail({
      to: user.email,
      subject: "Restablece tu contraseña",
      react: PasswordResetEmail({ resetUrl }),
    });
  }

  return { success: true };
}

/** Aplica la nueva contraseña si el token es válido, vigente y no usado. */
export async function resetPassword(input: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  const tokenHash = hashResetToken(parsed.data.token);
  const record = await db.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return {
      success: false,
      error: "El enlace no es válido o ya venció. Solicita uno nuevo.",
    };
  }

  const passwordHash = await hash(parsed.data.password, { type: argon2id });

  await db.$transaction([
    db.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    db.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  await recordAudit({
    userId: record.userId,
    action: "updated",
    entityType: "user_password",
    entityId: record.userId,
    changes: { via: "password_reset" },
  });

  return { success: true };
}
