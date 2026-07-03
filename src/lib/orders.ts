import "server-only";

import { revalidatePath } from "next/cache";

import { recordAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { canTransition, RESTOCK_ON_CANCEL } from "@/lib/order-status";

/**
 * Cancela un pedido y repone el stock que se había reservado (CLAUDE.md §8,
 * regla 10). La usan dos caminos: `createOrder` cuando falla el pago justo
 * después de reservar stock, y el cron de limpieza de pedidos vencidos
 * (docs/08-implementacion-flujo-venta.md, paso 7).
 */
export async function cancelOrderAndRestock(
  orderId: string,
  reason: string,
): Promise<void> {
  const cancelled = await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return false;
    if (!RESTOCK_ON_CANCEL.includes(order.status)) return false;
    if (!canTransition(order.status, "cancelado")) return false;

    for (const item of order.items) {
      if (!item.variantId) continue;
      await tx.productVariant.updateMany({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      });
    }

    await tx.order.update({
      where: { id: order.id },
      data: { status: "cancelado" },
    });
    return true;
  });

  if (!cancelled) return;

  await recordAudit({
    action: "status_changed",
    entityType: "order",
    entityId: orderId,
    changes: { to: "cancelado", reason },
  });

  revalidatePath("/tienda");
  revalidatePath("/");
  revalidatePath("/admin/pedidos");
}
