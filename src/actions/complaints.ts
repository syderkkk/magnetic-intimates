"use server";

import { z } from "zod";

import { clientIp, getAdminSession } from "@/lib/admin-auth";
import { recordAudit } from "@/lib/audit";
import { ComplaintNotificationEmail } from "@/emails/complaint-notification";
import { ComplaintResponseEmail } from "@/emails/complaint-response";
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
        documentType: data.documentId?.length ? data.documentType : null,
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
        documentType: data.documentId?.length ? data.documentType : undefined,
        documentId: data.documentId || undefined,
        detail: data.detail,
      }),
    });
  }

  return { success: true, data: { code } };
}

const respondComplaintSchema = z.object({
  complaintId: z.string().min(1),
  response: z.string().trim().min(1, "Escribe una respuesta"),
});

/**
 * Registra la respuesta del negocio a un reclamo/queja y lo marca resuelto
 * (CLAUDE.md §8 regla 9: debe poder responderse dentro de 30 días). Avisa al
 * cliente por correo con el texto de la respuesta.
 */
export async function respondToComplaint(input: unknown): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const parsed = respondComplaintSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  const complaint = await db.complaint.update({
    where: { id: parsed.data.complaintId },
    data: { response: parsed.data.response, status: "resuelto" },
  });

  await recordAudit({
    userId: session.user.id,
    action: "updated",
    entityType: "complaint",
    entityId: complaint.id,
    changes: { status: "resuelto" },
    ipAddress: await clientIp(),
  });

  await sendMail({
    to: complaint.email,
    subject: `Respuesta a tu reclamo #${complaint.code}`,
    react: ComplaintResponseEmail({
      code: complaint.code,
      customerName: complaint.customerName,
      response: parsed.data.response,
    }),
  });

  return { success: true };
}
