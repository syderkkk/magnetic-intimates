import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { env } from "@/lib/env";

/**
 * Token corto (HMAC del id) para ver `/pedido/[numero]` sin cuenta de
 * cliente: evita que alguien vea el pedido de otra persona con solo probar
 * números consecutivos en la URL (docs/08 paso 6). Reutiliza `AUTH_SECRET`
 * (ya validado en `lib/env.ts`) — no requiere una clave HMAC adicional hasta
 * que exista la de Izipay.
 */
export function signOrderAccessToken(orderId: string): string {
  return createHmac("sha256", env.AUTH_SECRET)
    .update(orderId)
    .digest("hex")
    .slice(0, 16);
}

/** Compara en tiempo constante contra el token esperado para ese pedido. */
export function verifyOrderAccessToken(
  orderId: string,
  token: string | undefined | null,
): boolean {
  if (!token) return false;
  const expected = signOrderAccessToken(orderId);
  const provided = Buffer.from(token);
  const expectedBuffer = Buffer.from(expected);
  return (
    provided.length === expectedBuffer.length &&
    timingSafeEqual(provided, expectedBuffer)
  );
}
