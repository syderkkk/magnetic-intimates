import type { Cents } from "@/lib/money";

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  RESUMEN DE TOTALES DEL PEDIDO
 *  Punto ÚNICO donde se arman los totales (subtotal, envío, IGV, total). Hoy el
 *  envío y el IGV están pendientes de confirmar con el cliente; al cerrarse esas
 *  decisiones se ajustan SOLO aquí y toda la UI (carrito y checkout) se actualiza
 *  sola, sin tocar componentes.
 *
 *  IMPORTANTE: estos totales son REFERENCIALES para la interfaz. El cobro real
 *  siempre se recalcula en el servidor antes de pagar (CLAUDE.md §7.1).
 * ─────────────────────────────────────────────────────────────────────────
 */

export interface OrderSummary {
  subtotalCents: Cents;
  shippingCents: Cents;
  taxCents: Cents;
  totalCents: Cents;
  /** El costo de envío aún no se conoce (depende de decisiones #4 y #5). */
  shippingPending: boolean;
  /** El tratamiento del IGV aún no se confirma (decisión #2). */
  taxPending: boolean;
}

/**
 * Construye el resumen de totales a partir del subtotal (suma de líneas).
 * @param subtotalCents subtotal en céntimos enteros.
 */
export function computeOrderSummary(subtotalCents: Cents): OrderSummary {
  // TODO: confirmar con cliente — costo de envío por zona (decisiones #4 y #5,
  // CLAUDE.md §1.1). Por ahora 0 y marcado como pendiente.
  const shippingCents: Cents = 0;
  const shippingPending = true;

  // TODO: confirmar con cliente — tratamiento del IGV 18% (decisión #2,
  // CLAUDE.md §1.1 y §11.6). Centralizado aquí para ajustarlo en un solo lugar.
  const taxCents: Cents = 0;
  const taxPending = true;

  return {
    subtotalCents,
    shippingCents,
    taxCents,
    totalCents: subtotalCents + shippingCents + taxCents,
    shippingPending,
    taxPending,
  };
}
