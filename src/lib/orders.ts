import "server-only";

import { revalidatePath } from "next/cache";

import { recordAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { canTransition, RESTOCK_ON_CANCEL } from "@/lib/order-status";
import { OrderCancelledEmail } from "@/emails/order-cancelled";
import { OrderShippedEmail } from "@/emails/order-shipped";
import type { OrderStatus } from "@/generated/prisma/client";

interface StatusChangeActor {
  userId: string;
  ipAddress: string | null;
}

interface UpdateOrderStatusOptions {
  /** Motivo del cambio (queda en el detalle de `audit_logs`). */
  reason?: string;
  /** Quién lo hizo. `null` = automático (cron, gateway de pago). */
  actor?: StatusChangeActor | null;
}

export interface UpdateOrderStatusResult {
  success: boolean;
  error?: string;
}

/**
 * Cambia el estado de un pedido validando la transición (CLAUDE.md §11.2):
 * repone stock si corresponde (`RESTOCK_ON_CANCEL`), registra auditoría y
 * notifica al comprador por correo cuando el cambio le interesa. La usan tres
 * caminos: el cron de limpieza de pedidos vencidos, el gateway de pago
 * (simulado/webhook real) al aprobar, y el admin desde el panel.
 *
 * Si la transición no es válida, no revierte nada (no hay nada que
 * revertir): simplemente no aplica el cambio y devuelve el motivo.
 */
export async function updateOrderStatus(
  orderId: string,
  to: OrderStatus,
  options: UpdateOrderStatusOptions = {},
): Promise<UpdateOrderStatusResult> {
  const { reason, actor = null } = options;

  const result = await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return { ok: false as const, error: "Pedido no encontrado." };
    if (!canTransition(order.status, to)) {
      return {
        ok: false as const,
        error: `No se puede pasar de "${order.status}" a "${to}".`,
      };
    }

    if (
      RESTOCK_ON_CANCEL.includes(order.status) &&
      (to === "cancelado" || to === "reembolsado")
    ) {
      for (const item of order.items) {
        if (!item.variantId) continue;
        await tx.productVariant.updateMany({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    const updated = await tx.order.update({
      where: { id: order.id },
      data: { status: to },
    });
    return { ok: true as const, from: order.status, order: updated };
  });

  if (!result.ok) return { success: false, error: result.error };

  await recordAudit({
    userId: actor?.userId ?? null,
    action: "status_changed",
    entityType: "order",
    entityId: orderId,
    changes: { from: result.from, to, reason },
    ipAddress: actor?.ipAddress ?? null,
  });

  revalidatePath("/tienda");
  revalidatePath("/");
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath(`/pedido/${result.order.number}`);

  // El correo es best-effort: nunca revierte el cambio de estado ya aplicado
  // (CLAUDE.md §11.8/docs/08 paso 8 — un email fallido no rompe el negocio).
  await notifyCustomer(result.order, to).catch((error) => {
    console.error("[updateOrderStatus] fallo al enviar el correo:", error);
  });

  return { success: true };
}

async function notifyCustomer(
  order: { email: string; number: number; customerName: string },
  status: OrderStatus,
): Promise<void> {
  if (status === "enviado") {
    await sendMail({
      to: order.email,
      subject: `Tu pedido #${order.number} fue enviado`,
      react: OrderShippedEmail({
        orderNumber: order.number,
        customerName: order.customerName,
      }),
    });
  } else if (status === "cancelado" || status === "reembolsado") {
    await sendMail({
      to: order.email,
      subject: `Tu pedido #${order.number} fue ${status === "cancelado" ? "cancelado" : "reembolsado"}`,
      react: OrderCancelledEmail({
        orderNumber: order.number,
        customerName: order.customerName,
        status,
      }),
    });
  }
}

/**
 * Cancela un pedido y repone el stock que se había reservado (CLAUDE.md §8,
 * regla 10). La usan dos caminos automáticos: `createOrder` cuando falla el
 * pago justo después de reservar stock, y el cron de limpieza de pedidos
 * vencidos (docs/08-implementacion-flujo-venta.md, paso 7).
 */
export async function cancelOrderAndRestock(
  orderId: string,
  reason: string,
): Promise<void> {
  await updateOrderStatus(orderId, "cancelado", { reason });
}
