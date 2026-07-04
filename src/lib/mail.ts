import "server-only";

import type { ReactElement } from "react";
import { Resend } from "resend";

import { env } from "@/lib/env";

interface SendMailInput {
  to: string | string[];
  subject: string;
  react: ReactElement;
}

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

/**
 * Envío de emails transaccionales (Resend + React Email).
 *
 * TODO: confirmar con cliente — sin `RESEND_API_KEY`/`EMAIL_FROM` todavía. Sin
 * esas claves, esta función NO falla: solo registra en el logger técnico y
 * sigue. Un email fallido NUNCA revierte una operación de negocio (contacto,
 * reclamo, pedido) — CLAUDE.md §11.8/docs/08 paso 8.
 */
export async function sendMail({ to, subject, react }: SendMailInput): Promise<void> {
  if (!resend || !env.EMAIL_FROM) {
    console.warn(
      `[mail] Resend no configurado todavía — email "${subject}" no enviado (destinatario: ${to}).`,
    );
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      react,
    });
    if (error) console.error("[mail] Resend devolvió un error:", error);
  } catch (error) {
    console.error("[mail] fallo al enviar email:", error);
  }
}
