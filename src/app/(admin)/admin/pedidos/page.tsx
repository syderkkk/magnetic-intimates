import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Pedidos" };

/** Etiqueta y tono visual por estado de pedido (CLAUDE.md §11.2). */
const STATUS: Record<string, { label: string; className: string }> = {
  pendiente: { label: "Pendiente", className: "bg-amber-500/15 text-amber-700" },
  pagado: { label: "Pagado", className: "bg-emerald-500/15 text-emerald-700" },
  enviado: { label: "Enviado", className: "bg-sky-500/15 text-sky-700" },
  entregado: { label: "Entregado", className: "bg-emerald-500/15 text-emerald-700" },
  cancelado: { label: "Cancelado", className: "bg-muted text-muted-foreground" },
  reembolsado: { label: "Reembolsado", className: "bg-destructive/10 text-destructive" },
};

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { _count: { select: { items: true } } },
  });

  return (
    <div>
      <AdminPageHeader
        title="Pedidos"
        description={`${orders.length} ${orders.length === 1 ? "pedido" : "pedidos"}`}
      />

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border bg-background py-20 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-muted">
            <ShoppingBag
              className="size-6 text-muted-foreground"
              aria-hidden="true"
            />
          </span>
          <p className="font-medium">Aún no hay pedidos</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Los pedidos aparecerán aquí cuando se conecte el checkout a la base
            de datos.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs tracking-wide text-muted-foreground uppercase">
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Fecha</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => {
                const status = STATUS[order.status] ?? {
                  label: order.status,
                  className: "bg-muted text-muted-foreground",
                };
                return (
                  <tr key={order.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <span className="font-medium tabular-nums">
                        #{order.number}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {order._count.items}{" "}
                        {order._count.items === 1 ? "ítem" : "ítems"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="truncate">{order.customerName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {order.email}
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {formatDate(order.createdAt, { dateStyle: "medium" })}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatPrice(order.totalCents)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-medium",
                          status.className,
                        )}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
