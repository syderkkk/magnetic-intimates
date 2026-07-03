"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Intervalo de refresco mientras el pedido está "pendiente" (ms). */
const REFRESH_INTERVAL_MS = 4000;

/**
 * Refresca la página de confirmación mientras el pago se termina de
 * confirmar (docs/08 paso 6): el IPN de Izipay puede tardar unos segundos, así
 * que el estado real puede cambiar sin que el cliente recargue a mano.
 */
export function OrderPendingRefresh() {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [router]);

  return null;
}
