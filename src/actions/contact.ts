"use server";

import { ContactNotificationEmail } from "@/emails/contact-notification";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sendMail } from "@/lib/mail";
import { contactSchema } from "@/schemas/contact";
import type { ActionResult } from "@/types/action";

/**
 * Registra un mensaje de contacto y avisa al negocio por correo (CLAUDE.md
 * §9). El aviso es "best effort": si el correo falla o aún no está
 * configurado, el mensaje queda igual guardado en `contact_submissions`.
 */
export async function createContactSubmission(input: unknown): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }
  const data = parsed.data;

  try {
    await db.contactSubmission.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone?.length ? data.phone : null,
        message: data.message,
      },
    });
  } catch (error) {
    console.error("[createContactSubmission]", error);
    return {
      success: false,
      error: "No pudimos enviar tu mensaje. Intenta nuevamente.",
    };
  }

  if (env.ADMIN_NOTIFICATION_EMAIL) {
    await sendMail({
      to: env.ADMIN_NOTIFICATION_EMAIL,
      subject: `Nuevo mensaje de contacto — ${data.name}`,
      react: ContactNotificationEmail({
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        message: data.message,
      }),
    });
  }

  return { success: true };
}
