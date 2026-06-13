"use client";

import { useSyncExternalStore } from "react";

// No hay nada externo a lo que suscribirse: el valor solo cambia al montar.
const emptySubscribe = () => () => {};

/**
 * Devuelve `true` solo tras el montaje en el cliente (false en el servidor).
 * Útil para valores que dependen de localStorage (p. ej. el contador del
 * carrito) y así evitar desajustes de hidratación entre servidor y cliente.
 *
 * Usa `useSyncExternalStore` para resolverlo sin `setState` dentro de un efecto.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // valor en el cliente
    () => false, // valor en el servidor
  );
}
