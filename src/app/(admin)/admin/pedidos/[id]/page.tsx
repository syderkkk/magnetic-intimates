import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderStatusActions } from "@/components/admin/order-status-actions";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { formatPrice } from "@/lib/money";
import { manualTransitionsFrom, ORDER_STATUS_META } from "@/lib/order-status";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/generated/prisma/client";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, select: { number: true } });
  return { title: order ? `Pedido #${order.number}` : "Pedido" };
}

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
};

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: true,
      payments: { orderBy: { createdAt: "desc" } },
      shippingAddress: true,
      shippingMethod: true,
    },
  });
  if (!order) notFound();

  const status = ORDER_STATUS_META[order.status];
  const nextStatuses = manualTransitionsFrom(order.status as OrderStatus);

  return (
    <div>
      <Link
        href="/admin/pedidos"
        className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4 transition-transform duration-200 ease-out group-hover:-translate-x-0.5" />
        Pedidos
      </Link>

      <div className="mt-3 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Pedido #{order.number}
        </h1>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium",
            status.className,
          )}
        >
          {status.label}
        </span>
        <span className="text-sm text-muted-foreground">
          {formatDate(order.createdAt, { dateStyle: "long", timeStyle: "short" })}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Productos */}
          <section className="rounded-2xl border bg-background p-5 sm:p-6">
            <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">
              Productos
            </h2>
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs tracking-wide text-muted-foreground uppercase">
                    <th className="px-3 py-2.5 font-medium">Producto</th>
                    <th className="px-3 py-2.5 text-right font-medium">Precio</th>
                    <th className="px-3 py-2.5 text-right font-medium">Cant.</th>
                    <th className="px-3 py-2.5 text-right font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2.5">
                        <p className="font-medium">{item.productName}</p>
                        {item.variantLabel ? (
                          <p className="text-xs text-muted-foreground">
                            {item.variantLabel}
                            {item.sku ? ` · ${item.sku}` : ""}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {formatPrice(item.unitPriceCents)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {formatPrice(item.unitPriceCents * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 ml-auto max-w-56 space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPrice(order.subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Envío</span>
                <span className="tabular-nums">{formatPrice(order.shippingCents)}</span>
              </div>
              {order.taxCents > 0 ? (
                <div className="flex justify-between text-muted-foreground">
                  <span>IGV</span>
                  <span className="tabular-nums">{formatPrice(order.taxCents)}</span>
                </div>
              ) : null}
              {order.discountCents > 0 ? (
                <div className="flex justify-between text-muted-foreground">
                  <span>Descuento</span>
                  <span className="tabular-nums">
                    -{formatPrice(order.discountCents)}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between border-t pt-1.5 font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(order.totalCents)}</span>
              </div>
            </div>
          </section>

          {/* Pagos */}
          <section className="rounded-2xl border bg-background p-5 sm:p-6">
            <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">
              Pagos
            </h2>
            {order.payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin intentos de pago registrados todavía.
              </p>
            ) : (
              <div className="space-y-2">
                {order.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {PAYMENT_STATUS_LABEL[payment.status] ?? payment.status} ·{" "}
                        {payment.gateway}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.transactionId ?? "sin ID de transacción"} ·{" "}
                        {formatDate(payment.createdAt, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                    <span className="tabular-nums">
                      {formatPrice(payment.amountCents)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          {/* Cambiar estado */}
          <section className="rounded-2xl border bg-background p-5 sm:p-6">
            <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">
              Cambiar estado
            </h2>
            <OrderStatusActions orderId={order.id} nextStatuses={nextStatuses} />
          </section>

          {/* Cliente */}
          <section className="rounded-2xl border bg-background p-5 sm:p-6">
            <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">
              Cliente
            </h2>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{order.customerName}</p>
              <p className="text-muted-foreground">{order.email}</p>
              <p className="text-muted-foreground">{order.phone}</p>
            </div>
          </section>

          {/* Envío */}
          <section className="rounded-2xl border bg-background p-5 sm:p-6">
            <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">
              Envío
            </h2>
            {order.shippingAddress ? (
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">
                  {order.shippingAddress.fullName}
                </p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.district}, {order.shippingAddress.city}
                </p>
                {order.shippingAddress.reference ? (
                  <p>Ref: {order.shippingAddress.reference}</p>
                ) : null}
                <p>{order.shippingAddress.phone}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sin dirección de envío registrada.
              </p>
            )}
            {order.shippingMethod ? (
              <p className="mt-3 border-t pt-3 text-sm">
                {order.shippingMethod.name}
                {order.shippingMethod.etaDays
                  ? ` · ${order.shippingMethod.etaDays}`
                  : ""}
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
