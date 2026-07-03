import { z } from "zod";

import { checkoutSchema } from "@/schemas/checkout";

/**
 * Input del servidor para crear un pedido (docs/08-implementacion-flujo-venta.md,
 * paso 3.1). SIN precios ni totales: el servidor los relee de la BD (CLAUDE.md
 * §7.1) — lo que envía el cliente para cada línea es solo `variantId` + `quantity`.
 */
export const createOrderSchema = z.object({
  /** Generada por el cliente al montar el checkout: evita pedidos duplicados. */
  idempotencyKey: z.uuid(),
  customer: checkoutSchema,
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .min(1, "El carrito está vacío.")
    .max(30),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
