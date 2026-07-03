"use server";

import { revalidatePath } from "next/cache";

import { computeOrderSummary } from "@/lib/cart-totals";
import { db } from "@/lib/db";
import { createPaymentSession } from "@/lib/izipay";
import { signOrderAccessToken } from "@/lib/order-access-token";
import { cancelOrderAndRestock } from "@/lib/orders";
import { createOrderSchema } from "@/schemas/order";
import type { Prisma } from "@/generated/prisma/client";
import type { ActionResult } from "@/types/action";

/** El producto o la variante ya no está disponible (desactivado, etc.). */
class CheckoutError extends Error {}

/** No hay stock suficiente de una variante específica. */
class OutOfStockError extends Error {
  constructor(public readonly label: string) {
    super(`Sin stock: ${label}`);
  }
}

const VARIANT_INCLUDE = {
  product: true,
  size: true,
  color: true,
} satisfies Prisma.ProductVariantInclude;

type VariantWithRelations = Prisma.ProductVariantGetPayload<{
  include: typeof VARIANT_INCLUDE;
}>;

function findVariantsForCheckout(
  tx: Prisma.TransactionClient,
  variantIds: string[],
) {
  return tx.productVariant.findMany({
    where: { id: { in: variantIds }, product: { isActive: true } },
    include: VARIANT_INCLUDE,
  });
}

/** Etiqueta legible "Color / Talla" de una variante (igual que en la ficha). */
function labelOf(variant: VariantWithRelations): string | undefined {
  return (
    [variant.color?.name, variant.size?.name].filter(Boolean).join(" / ") ||
    undefined
  );
}

/** Mensaje humano para el cliente; el detalle técnico solo va al logger. */
function friendlyMessage(error: unknown): string {
  if (error instanceof OutOfStockError) {
    return `No queda stock suficiente de ${error.label}. Ajusta la cantidad o elige otra opción.`;
  }
  if (error instanceof CheckoutError) return error.message;
  console.error("[createOrder]", error);
  return "No pudimos procesar tu pedido. Intenta nuevamente.";
}

export interface CreateOrderData {
  orderId: string;
  orderNumber: number;
  /** Token del SDK Web de Izipay (vacío si el pedido ya estaba resuelto). */
  formToken: string;
  /** Firma para ver `/pedido/[numero]` sin cuenta (`lib/order-access-token.ts`). */
  accessToken: string;
}

/**
 * Crea un pedido a partir del carrito (checkout de invitado) — el corazón del
 * flujo de venta (CLAUDE.md §11.3, docs/08-implementacion-flujo-venta.md paso 3).
 *
 * Patrón: Zod → transacción (releer precios/stock de la BD, reservar stock por
 * decremento condicional, correlativo por secuencia, snapshot de líneas) →
 * revalidar caché → iniciar el pago (fuera de la transacción).
 */
export async function createOrder(
  input: unknown,
): Promise<ActionResult<CreateOrderData>> {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }
  const { idempotencyKey, customer, items } = parsed.data;

  let order: Awaited<ReturnType<typeof runCreateOrderTransaction>>;
  try {
    order = await runCreateOrderTransaction(idempotencyKey, customer, items);
  } catch (error) {
    return { success: false, error: friendlyMessage(error) };
  }

  revalidatePath("/tienda");
  revalidatePath("/");
  revalidatePath("/admin/pedidos");

  const accessToken = signOrderAccessToken(order.id);

  // Idempotencia: si el pedido ya tenía un pago resuelto (reintento tras un
  // primer envío exitoso), no se abre una sesión de pago nueva.
  if (order.status !== "pendiente") {
    return {
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.number,
        formToken: "",
        accessToken,
      },
    };
  }

  try {
    const { formToken } = await createPaymentSession({
      id: order.id,
      number: order.number,
      totalCents: order.totalCents,
      email: order.email,
    });
    return {
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.number,
        formToken,
        accessToken,
      },
    };
  } catch (error) {
    // El stock ya se reservó: si Izipay falla al iniciar el pago, cancelar y
    // reponer de inmediato en vez de dejar el pedido "pendiente" colgado.
    console.error("[createOrder] fallo al iniciar el pago", error);
    await cancelOrderAndRestock(order.id, "Fallo al iniciar el pago");
    return {
      success: false,
      error: "No pudimos iniciar el pago. Intenta nuevamente.",
    };
  }
}

function runCreateOrderTransaction(
  idempotencyKey: string,
  customer: { email: string; firstName: string; lastName: string; phone: string },
  items: { variantId: string; quantity: number }[],
) {
  return db.$transaction(async (tx) => {
    // Idempotencia del checkout: un reintento con la misma clave devuelve el
    // pedido ya creado en vez de duplicarlo (doble clic, reintento de red).
    const existing = await tx.order.findUnique({ where: { idempotencyKey } });
    if (existing) return existing;

    // Releer variantes ACTIVAS con su producto: el precio SIEMPRE sale de
    // aquí, nunca de lo que mandó el cliente (CLAUDE.md §7.1).
    const variants = await findVariantsForCheckout(
      tx,
      items.map((i) => i.variantId),
    );
    if (variants.length !== items.length) {
      throw new CheckoutError("Algún producto ya no está disponible.");
    }

    // Reserva de stock: decremento condicional y atómico por línea. Si la
    // línea N se queda sin stock, la transacción revierte las N-1 anteriores.
    for (const item of items) {
      const updated = await tx.productVariant.updateMany({
        where: { id: item.variantId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        const variant = variants.find((v) => v.id === item.variantId);
        throw new OutOfStockError(
          variant ? (labelOf(variant) ?? variant.product.name) : item.variantId,
        );
      }
    }

    const subtotalCents = items.reduce((sum, item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      return (
        sum + (variant.priceCents ?? variant.product.priceCents) * item.quantity
      );
    }, 0);
    const summary = computeOrderSummary(subtotalCents);

    // Correlativo por secuencia de Postgres: sin condición de carrera aunque
    // dos pedidos se creen al mismo tiempo (docs/08 paso 1.4).
    const sequenceRows = await tx.$queryRaw<
      { nextval: bigint }[]
    >`SELECT nextval('order_number_seq')`;
    const nextval = sequenceRows[0]?.nextval;
    if (nextval == null) {
      throw new CheckoutError("No se pudo generar el número de pedido.");
    }

    return tx.order.create({
      data: {
        number: Number(nextval),
        idempotencyKey,
        status: "pendiente",
        email: customer.email.toLowerCase(),
        customerName: `${customer.firstName} ${customer.lastName}`.trim(),
        phone: customer.phone,
        subtotalCents,
        shippingCents: summary.shippingCents,
        taxCents: summary.taxCents,
        totalCents: summary.totalCents,
        items: {
          create: items.map((item) => {
            const variant = variants.find((v) => v.id === item.variantId)!;
            return {
              variantId: variant.id,
              productName: variant.product.name,
              variantLabel: labelOf(variant),
              sku: variant.sku,
              unitPriceCents: variant.priceCents ?? variant.product.priceCents,
              quantity: item.quantity,
            };
          }),
        },
        payments: {
          create: { status: "pendiente", amountCents: summary.totalCents },
        },
      },
    });
  });
}
