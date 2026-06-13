"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/** Se suscribe a los cambios de la preferencia de movimiento del sistema. */
function subscribe(callback: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

/**
 * Indica si el usuario prefiere movimiento reducido en su sistema.
 * Se usa para desactivar animaciones de desplazamiento (marquesina, splash).
 * Resuelto con `useSyncExternalStore` (sin `setState` dentro de un efecto).
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches, // cliente
    () => false, // servidor
  );
}
