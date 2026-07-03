import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { cancelOrderAndRestock } from "@/lib/orders";

/** Pedidos "pendiente" más antiguos que esto se cancelan y reponen stock. */
const PENDING_ORDER_TTL_HOURS = 24;

function isAuthorized(header: string | null): boolean {
  if (!header) return false;
  const expected = Buffer.from(`Bearer ${env.CRON_SECRET}`);
  const provided = Buffer.from(header);
  return (
    provided.length === expected.length && timingSafeEqual(provided, expected)
  );
}

/**
 * Cron de limpieza de pedidos abandonados (docs/08-implementacion-flujo-venta.md
 * paso 7) — parte OBLIGATORIA del esquema de stock por reserva (CLAUDE.md §8
 * regla 2): sin esto, un pedido `pendiente` nunca pagado dejaría su stock
 * reservado para siempre. Programado en `vercel.json` (Vercel Cron); protegido
 * con `CRON_SECRET` en el header `Authorization`.
 */
export async function GET(request: Request) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - PENDING_ORDER_TTL_HOURS * 60 * 60 * 1000);
  const expired = await db.order.findMany({
    where: { status: "pendiente", createdAt: { lt: cutoff } },
    select: { id: true, number: true },
  });

  let cancelledCount = 0;
  for (const order of expired) {
    try {
      await cancelOrderAndRestock(
        order.id,
        `Pedido pendiente por más de ${PENDING_ORDER_TTL_HOURS}h`,
      );
      cancelledCount++;
    } catch (error) {
      console.error(
        `[cron/cleanup] no se pudo cancelar el pedido #${order.number}`,
        error,
      );
    }
  }

  console.log(
    `[cron/cleanup] ${cancelledCount}/${expired.length} pedidos pendientes cancelados y repuestos.`,
  );
  return NextResponse.json({ checked: expired.length, cancelled: cancelledCount });
}
