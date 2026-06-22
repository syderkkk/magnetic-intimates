import type { Metadata } from "next";
import { ChevronDown, ChevronUp, Pencil, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { moveCategory } from "@/actions/categories";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { NoImage } from "@/components/shop/no-image";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Categorías" };

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { products: true } } },
  });

  // Wrapper para usar moveCategory como `action` de <form> (debe devolver void).
  async function reorder(formData: FormData) {
    "use server";
    await moveCategory(formData);
  }

  return (
    <div>
      <AdminPageHeader
        title="Categorías"
        description="Imagen, nombre y orden de las categorías que se ven en el inicio."
      >
        <Button asChild className="h-10 rounded-full px-5 text-sm">
          <Link href="/admin/categorias/nueva">
            <Plus className="size-4" aria-hidden="true" />
            Nueva categoría
          </Link>
        </Button>
      </AdminPageHeader>

      {categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-16 text-center">
          <p className="font-medium">Aún no hay categorías</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea la primera para organizar tus productos.
          </p>
        </div>
      ) : (
        <div className="divide-y overflow-hidden rounded-2xl border bg-background">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="flex items-center gap-3 p-3 transition-colors hover:bg-muted/40"
            >
              {/* Reordenar */}
              <div className="flex flex-col">
                <form action={reorder}>
                  <input type="hidden" name="id" value={category.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button
                    type="submit"
                    disabled={index === 0}
                    aria-label={`Subir ${category.name}`}
                    className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                  >
                    <ChevronUp className="size-4" aria-hidden="true" />
                  </button>
                </form>
                <form action={reorder}>
                  <input type="hidden" name="id" value={category.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button
                    type="submit"
                    disabled={index === categories.length - 1}
                    aria-label={`Bajar ${category.name}`}
                    className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                  >
                    <ChevronDown className="size-4" aria-hidden="true" />
                  </button>
                </form>
              </div>

              {/* Imagen */}
              <div className="relative aspect-square size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <NoImage className="absolute inset-0 size-full" />
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">{category.name}</p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                      category.isActive
                        ? "bg-emerald-500/15 text-emerald-700"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {category.isActive ? "Activa" : "Oculta"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {category._count.products}{" "}
                  {category._count.products === 1 ? "producto" : "productos"}
                </p>
              </div>

              {/* Editar */}
              <Link
                href={`/admin/categorias/${category.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:border-foreground hover:bg-muted"
              >
                <Pencil className="size-3.5" aria-hidden="true" />
                Editar
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
