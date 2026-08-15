// Sin "server-only": son constantes y funciones puras (sin BD ni secretos),
// y el componente cliente del cambio de estado también las necesita para
// mostrar las etiquetas.
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

/**
 * Transiciones que el admin puede disparar manualmente desde el panel.
 * "pagado" queda excluido a propósito: solo lo debe marcar el gateway de pago
 * (webhook/simulado), nunca un clic manual — evita que alguien marque un
 * pedido como pagado sin que el dinero haya llegado (CLAUDE.md §7.6).
 */
export function manualTransitionsFrom(status: OrderStatus): OrderStatus[] {
  return TRANSITIONS[status].filter((to) => to !== "pagado");
}

/** Etiqueta y tono visual por estado de pedido, para lista y detalle. */
export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pendiente: { label: "Pendiente", className: "bg-amber-500/15 text-amber-700" },
  pagado: { label: "Pagado", className: "bg-emerald-500/15 text-emerald-700" },
  enviado: { label: "Enviado", className: "bg-sky-500/15 text-sky-700" },
  entregado: { label: "Entregado", className: "bg-emerald-500/15 text-emerald-700" },
  cancelado: { label: "Cancelado", className: "bg-muted text-muted-foreground" },
  reembolsado: {
    label: "Reembolsado",
    className: "bg-destructive/10 text-destructive",
  },
};
