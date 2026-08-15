import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { formatPrice } from "@/lib/money";
import { ORDER_STATUS_META } from "@/lib/order-status";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Pedidos" };

const PAGE_SIZE = 20;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [orders, total] = await Promise.all([
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { items: true } } },
    }),
    db.order.count(),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Pedidos"
        description={`${total} ${total === 1 ? "pedido" : "pedidos"}`}
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
                const status = ORDER_STATUS_META[order.status];
                return (
                  <tr key={order.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="font-medium tabular-nums hover:underline"
                      >
                        #{order.number}
                      </Link>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {order._count.items}{" "}
                        {order._count.items === 1 ? "ítem" : "ítems"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/pedidos/${order.id}`} className="block">
                        <p className="truncate">{order.customerName}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {order.email}
                        </p>
                      </Link>
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

      <AdminPagination
        basePath="/admin/pedidos"
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
      />
    </div>
  );
}
