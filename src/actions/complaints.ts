"use server";

import { ComplaintNotificationEmail } from "@/emails/complaint-notification";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sendMail } from "@/lib/mail";
import { complaintSchema } from "@/schemas/complaint";
import type { ActionResult } from "@/types/action";

export interface ComplaintResult {
  /** Correlativo del reclamo, ej. "RL-2026-0001" (CLAUDE.md §8 regla 9). */
  code: string;
}

/** Correlativo por secuencia de Postgres: sin condición de carrera. */
async function nextComplaintCode(): Promise<string> {
  const rows = await db.$queryRaw<
    { nextval: bigint }[]
  >`SELECT nextval('complaint_code_seq')`;
  const nextval = rows[0]?.nextval;
  if (nextval == null) {
    throw new Error("No se pudo generar el correlativo del reclamo.");
  }
  const year = new Date().getFullYear();
  return `RL-${year}-${String(nextval).padStart(4, "0")}`;
}

/**
 * Registra un reclamo o queja en el Libro de Reclamaciones virtual
 * (obligatorio INDECOPI, CLAUDE.md §10) y avisa al negocio por correo — el
 * plazo de respuesta de 30 días corre desde ese aviso.
 */
export async function createComplaint(
  input: unknown,
): Promise<ActionResult<ComplaintResult>> {
  const parsed = complaintSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }
  const data = parsed.data;

  let code: string;
  try {
    code = await nextComplaintCode();
    await db.complaint.create({
      data: {
        code,
        type: data.type,
        customerName: data.customerName,
        email: data.email.toLowerCase(),
        phone: data.phone?.length ? data.phone : null,
        documentId: data.documentId?.length ? data.documentId : null,
        detail: data.detail,
        status: "pendiente",
      },
    });
  } catch (error) {
    console.error("[createComplaint]", error);
    return {
      success: false,
      error: "No pudimos registrar tu reclamo. Intenta nuevamente.",
    };
  }

  if (env.ADMIN_NOTIFICATION_EMAIL) {
    await sendMail({
      to: env.ADMIN_NOTIFICATION_EMAIL,
      subject: `Nuevo ${data.type} #${code} — Libro de Reclamaciones`,
      react: ComplaintNotificationEmail({
        code,
        type: data.type,
        customerName: data.customerName,
        email: data.email,
        phone: data.phone || undefined,
        documentId: data.documentId || undefined,
        detail: data.detail,
      }),
    });
  }

  return { success: true, data: { code } };
}
