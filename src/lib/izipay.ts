import "server-only";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import { recordAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { canTransition } from "@/lib/order-status";

/**
 * Integración de pagos con Izipay (CLAUDE.md §11.3, docs/08 pasos 4-5).
 *
 * TODO: confirmar con cliente — Izipay aún no tiene credenciales asignadas
 * (`IZIPAY_MERCHANT_ID` / `IZIPAY_API_KEY_*` sin configurar). Mientras tanto,
 * `createPaymentSession` usa un gateway SIMULADO que aprueba el pago al
 * instante detrás de la MISMA interfaz (`formToken`) que usará la integración
 * real, para que checkout → pedido → pago → confirmación funcione de punta a
 * punta en desarrollo. Cuando lleguen las credenciales: reemplazar el cuerpo
 * de esta función por el POST real a Izipay (Lyra `Charge/CreatePayment`) y
 * mover `approveSimulatedPayment` al webhook real (`/api/webhooks/izipay`,
 * paso 5), que es quien debe aprobar el pago en producción.
 */

const HAS_REAL_CREDENTIALS = Boolean(
  process.env.IZIPAY_MERCHANT_ID &&
    (process.env.IZIPAY_API_KEY_TEST || process.env.IZIPAY_API_KEY_PROD),
);

/** Datos mínimos del pedido que necesita el gateway para iniciar el cobro. */
export interface PaymentSessionOrder {
  id: string;
  number: number;
  totalCents: number;
  email: string;
}

export interface PaymentSessionResult {
  /** Token con el que el cliente monta el formulario embebido del SDK Web de Izipay. */
  formToken: string;
}

/** Crea la sesión de pago para un pedido `pendiente` recién creado. */
export async function createPaymentSession(
  order: PaymentSessionOrder,
): Promise<PaymentSessionResult> {
  if (HAS_REAL_CREDENTIALS) {
    // ⚠️ Confirmar endpoints/campos exactos en el back office de Izipay al
    // recibir las credenciales (docs/08 paso 4.2: Basic Auth merchantId:apiKey,
    // monto en céntimos, moneda PEN, orderId, email → devuelve el formToken).
    throw new Error("Integración real de Izipay pendiente de implementar.");
  }

  const formToken = `sim_${order.id}_${randomUUID()}`;
  await approveSimulatedPayment(order);
  return { formToken };
}

/**
 * Gateway simulado: aprueba el pago de inmediato y registra exactamente lo
 * que hará el webhook real (transición de estado validada + fila en
 * `payments` con la respuesta completa + auditoría), para que el resto del
 * flujo no distinga un pago real de uno simulado.
 */
async function approveSimulatedPayment(order: PaymentSessionOrder): Promise<void> {
  const transactionId = `sim_${randomUUID()}`;
  const approvedAt = new Date().toISOString();

  await db.$transaction(async (tx) => {
    const current = await tx.order.findUniqueOrThrow({ where: { id: order.id } });
    if (canTransition(current.status, "pagado")) {
      await tx.order.update({ where: { id: order.id }, data: { status: "pagado" } });
    }
    await tx.payment.create({
      data: {
        orderId: order.id,
        status: "aprobado",
        transactionId,
        amountCents: order.totalCents,
        gatewayResponse: { simulated: true, transactionId, approvedAt },
      },
    });
  });

  await recordAudit({
    action: "status_changed",
    entityType: "order",
    entityId: order.id,
    changes: { to: "pagado", gateway: "izipay-simulado" },
  });

  revalidatePath("/admin/pedidos");
  revalidatePath(`/pedido/${order.number}`);
}
