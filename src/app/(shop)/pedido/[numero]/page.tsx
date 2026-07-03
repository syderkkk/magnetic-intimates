import { CheckCircle2, Clock, PackageX, ShoppingBag, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { OrderPendingRefresh } from "@/components/shop/order-pending-refresh";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { formatPrice } from "@/lib/money";
import { verifyOrderAccessToken } from "@/lib/order-access-token";
import type { OrderStatus } from "@/generated/prisma/client";

interface Props {
  params: Promise<{ numero: string }>;
  searchParams: Promise<{ token?: string }>;
}

export const metadata: Metadata = {
  title: "Tu pedido",
  // Página personal del comprador: nunca debe indexarse.
  robots: { index: false, follow: false },
};

/** Copy y tono por estado del pedido, en lenguaje de cliente (CLAUDE.md, docs/09). */
const STATUS_COPY: Record<
  OrderStatus,
  { title: string; message: string; tone: "pending" | "success" | "muted" }
> = {
  pendiente: {
    title: "Estamos confirmando tu pago",
    message:
      "Esto puede tardar unos segundos. No cierres esta página, se actualiza sola.",
    tone: "pending",
  },
  pagado: {
    title: "¡Gracias por tu compra!",
    message:
      "Tu pago quedó confirmado. Te enviaremos un correo con el resumen y los siguientes pasos.",
    tone: "success",
  },
  enviado: {
    title: "Tu pedido está en camino",
    message: "Te contactaremos para coordinar la entrega.",
    tone: "success",
  },
  entregado: {
    title: "Pedido entregado",
    message: "Esperamos que lo disfrutes. Gracias por comprar en MAGNÉTIC.",
    tone: "success",
  },
  cancelado: {
    title: "Pedido cancelado",
    message: "Este pedido fue cancelado y no se realizó ningún cobro.",
    tone: "muted",
  },
  reembolsado: {
    title: "Pedido reembolsado",
    message: "El monto de este pedido fue reembolsado.",
    tone: "muted",
  },
};

async function getOrder(numero: string, token: string | undefined) {
  const number = Number(numero);
  if (!Number.isInteger(number)) return null;

  const order = await db.order.findUnique({
    where: { number },
    include: { items: true },
  });
  if (!order) return null;
  if (!verifyOrderAccessToken(order.id, token)) return null;

  return order;
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: Props) {
  const { numero } = await params;
  const { token } = await searchParams;
  const order = await getOrder(numero, token);

  if (!order) {
    return (
      <section className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center sm:py-28">
        <PackageX className="size-10 text-muted-foreground" aria-hidden="true" />
        <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">
          No encontramos ese pedido
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Revisa el enlace de tu correo de confirmación, o contáctanos si
          crees que esto es un error.
        </p>
        <Button asChild className="mt-6 h-11 rounded-full px-6">
          <Link href="/tienda">Ver la tienda</Link>
        </Button>
      </section>
    );
  }

  const status = STATUS_COPY[order.status];
  const StatusIcon =
    order.status === "pendiente"
      ? Clock
      : order.status === "cancelado" || order.status === "reembolsado"
        ? PackageX
        : order.status === "enviado"
          ? Truck
          : CheckCircle2;

  return (
    <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      {order.status === "pendiente" ? <OrderPendingRefresh /> : null}

      <div className="flex flex-col items-center text-center">
        <span
          className={
            status.tone === "success"
              ? "flex size-16 items-center justify-center rounded-full bg-foreground text-background"
              : status.tone === "pending"
                ? "flex size-16 items-center justify-center rounded-full bg-muted text-foreground"
                : "flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground"
          }
        >
          <StatusIcon
            className={status.tone === "pending" ? "size-7 animate-pulse" : "size-7"}
            strokeWidth={2}
            aria-hidden="true"
          />
        </span>
        <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          {status.title}
        </h1>
        <p className="mt-3 max-w-sm text-sm text-muted-foreground">
          {status.message}
        </p>
        <p className="mt-4 text-xs tracking-wide text-muted-foreground uppercase">
          Pedido #{order.number} · {formatDate(order.createdAt)}
        </p>
      </div>

      <div className="mt-10 rounded-2xl border bg-card p-5 sm:p-6">
        <h2 className="text-xs font-semibold tracking-[0.12em] text-foreground uppercase">
          Resumen del pedido
        </h2>

        <ul className="mt-4 divide-y">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.productName}</p>
                {item.variantLabel ? (
                  <p className="text-xs text-muted-foreground">
                    {item.variantLabel} · Cant. {item.quantity}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Cant. {item.quantity}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-sm font-medium tabular-nums">
                {formatPrice(item.unitPriceCents * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-2 border-t pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{formatPrice(order.subtotalCents)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Envío</span>
            <span className="tabular-nums">{formatPrice(order.shippingCents)}</span>
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between border-t pt-4">
          <span className="text-sm font-medium">Total</span>
          <span className="font-display text-xl font-semibold tabular-nums">
            {formatPrice(order.totalCents)}
          </span>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="h-11 rounded-full px-6">
          <Link href="/tienda">
            <ShoppingBag className="size-4" aria-hidden="true" />
            Seguir comprando
          </Link>
        </Button>
      </div>
    </section>
  );
}
