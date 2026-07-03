import "server-only";

import type { OrderStatus } from "@/generated/prisma/client";

/** Transiciones válidas del pedido (CLAUDE.md §11.2). */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pendiente: ["pagado", "cancelado"],
  pagado: ["enviado", "reembolsado"],
  enviado: ["entregado", "reembolsado"],
  entregado: ["reembolsado"],
  cancelado: [],
  reembolsado: [],
};

/** ¿Se puede pasar del estado `from` al estado `to`? */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

/** Estados que devuelven stock al cancelarse/reembolsarse desde ellos. */
export const RESTOCK_ON_CANCEL: OrderStatus[] = ["pendiente", "pagado"];
