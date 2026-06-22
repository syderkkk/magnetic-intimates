import type { Metadata } from "next";
import { Pencil, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Productos" };

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    include: {
      category: true,
      images: { where: { isPrimary: true }, take: 1 },
      variants: { select: { stock: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <AdminPageHeader
        title="Productos"
        description={`${products.length} ${products.length === 1 ? "producto" : "productos"}`}
      >
        <Button asChild className="h-10 rounded-full px-5 text-sm">
          <Link href="/admin/productos/nuevo">
            <Plus className="size-4" aria-hidden="true" />
            Nuevo producto
          </Link>
        </Button>
      </AdminPageHeader>

      <div className="overflow-hidden rounded-2xl border bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">
                Categoría
              </th>
              <th className="px-4 py-3 text-right font-medium">Precio</th>
              <th className="hidden px-4 py-3 text-right font-medium md:table-cell">
                Stock
              </th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => {
              const image = product.images[0];
              const stock = product.variants.reduce((s, v) => s + v.stock, 0);
              return (
                <tr key={product.id} className="transition-colors hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative aspect-square size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                        {image ? (
                          <Image
                            src={image.url}
                            alt={image.alt}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{product.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          /{product.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {product.category.name}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatPrice(product.priceCents)}
                  </td>
                  <td
                    className={cn(
                      "hidden px-4 py-3 text-right tabular-nums md:table-cell",
                      stock === 0 && "text-destructive",
                    )}
                  >
                    {stock}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-medium",
                          product.isActive
                            ? "bg-emerald-500/15 text-emerald-700"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {product.isActive ? "Activo" : "Inactivo"}
                      </span>
                      {product.isFeatured ? (
                        <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[11px] font-medium">
                          Destacado
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/productos/${product.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:border-foreground hover:bg-muted"
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                      Editar
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
