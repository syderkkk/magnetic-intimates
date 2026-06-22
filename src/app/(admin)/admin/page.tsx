import type { Metadata } from "next";
import {
  Boxes,
  CircleAlert,
  Image as ImageIcon,
  Package,
  Plus,
  ShoppingBag,
  Tag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { NoImage } from "@/components/shop/no-image";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const QUICK_ACTIONS = [
  { label: "Nuevo producto", href: "/admin/productos/nuevo", icon: Plus },
  { label: "Categorías", href: "/admin/categorias", icon: Tag },
  { label: "Apariencia", href: "/admin/apariencia", icon: ImageIcon },
];

export default async function AdminDashboardPage() {
  const session = await auth();
  const firstName = (session?.user?.name ?? "").split(" ")[0] || "admin";

  const [
    productCount,
    orderCount,
    stockAgg,
    lowStockCount,
    lowStock,
    recentProducts,
  ] = await Promise.all([
      db.product.count({ where: { isActive: true } }),
      db.order.count(),
      db.productVariant.aggregate({ _sum: { stock: true } }),
      db.productVariant.count({ where: { stock: { lte: 5 } } }),
      db.productVariant.findMany({
        where: { stock: { lte: 5 } },
        orderBy: { stock: "asc" },
        take: 6,
        include: {
          product: { select: { id: true, name: true } },
          size: true,
          color: true,
        },
      }),
      db.product.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: { select: { name: true } },
        },
      }),
    ]);

  const stats = [
    { label: "Productos activos", value: productCount, icon: Package, href: "/admin/productos" },
    { label: "Pedidos", value: orderCount, icon: ShoppingBag, href: "/admin/pedidos" },
    { label: "Unidades en stock", value: stockAgg._sum.stock ?? 0, icon: Boxes },
    {
      label: "Variantes con poco stock",
      value: lowStockCount,
      icon: CircleAlert,
      warn: lowStockCount > 0,
    },
  ];

  return (
    <div>
      <AdminPageHeader title={`Hola, ${firstName}`} description="Resumen de tu tienda." />

      {/* Tarjetas de estadísticas: entrada escalonada + hover-lift. */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const card = (
            <div
              className="h-full animate-in rounded-2xl border bg-background p-5 transition-[transform,box-shadow,border-color] duration-200 ease-out fade-in-0 slide-in-from-bottom-2 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {stat.label}
                </span>
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    stat.warn
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
              </div>
              <p
                className={cn(
                  "mt-3 font-display text-3xl font-semibold tabular-nums",
                  stat.warn && "text-destructive",
                )}
              >
                {stat.value}
              </p>
            </div>
          );

          return stat.href ? (
            <Link key={stat.label} href={stat.href} className="block">
              {card}
            </Link>
          ) : (
            <div key={stat.label}>{card}</div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        {/* Acciones rápidas */}
        <section
          className="animate-in rounded-2xl border bg-background p-5 duration-500 fade-in-0 slide-in-from-bottom-2"
          style={{ animationDelay: "200ms" }}
        >
          <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">
            Acciones rápidas
          </h2>
          <div className="flex flex-col gap-2">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-[transform,background-color,border-color] duration-150 ease-out hover:border-foreground hover:bg-muted active:scale-[0.98]"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-muted">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  {action.label}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Stock bajo */}
        <section
          className="animate-in rounded-2xl border bg-background p-5 duration-500 fade-in-0 slide-in-from-bottom-2"
          style={{ animationDelay: "250ms" }}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold tracking-wide uppercase">
              Stock bajo
            </h2>
            <span className="text-xs text-muted-foreground">≤ 5 unidades</span>
          </div>

          {lowStock.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Todo en orden: no hay variantes con poco stock.
            </p>
          ) : (
            <ul className="divide-y">
              {lowStock.map((variant) => (
                <li key={variant.id}>
                  <Link
                    href={`/admin/productos/${variant.product.id}`}
                    className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors duration-150 hover:bg-muted"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      {variant.color ? (
                        <span
                          className="size-4 shrink-0 rounded-full ring-1 ring-black/10"
                          style={{ backgroundColor: variant.color.hex }}
                          aria-hidden="true"
                        />
                      ) : null}
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {variant.product.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {[variant.size?.name, variant.color?.name]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
                        variant.stock === 0
                          ? "bg-destructive/10 text-destructive"
                          : "bg-amber-500/15 text-amber-700",
                      )}
                    >
                      {variant.stock}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Productos recientes */}
      <section
        className="mt-6 animate-in rounded-2xl border bg-background p-5 duration-500 fade-in-0 slide-in-from-bottom-2"
        style={{ animationDelay: "300ms" }}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-wide uppercase">
            Productos recientes
          </h2>
          <Link
            href="/admin/productos"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Ver todos
          </Link>
        </div>
        <ul className="divide-y">
          {recentProducts.map((product) => (
            <li key={product.id}>
              <Link
                href={`/admin/productos/${product.id}`}
                className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted"
              >
                <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].alt}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <NoImage className="absolute inset-0 size-full" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {product.category.name}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium tabular-nums">
                  {formatPrice(product.priceCents)}
                </span>
                <span
                  className={cn(
                    "hidden shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline",
                    product.isActive
                      ? "bg-emerald-500/15 text-emerald-700"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {product.isActive ? "Activo" : "Borrador"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
