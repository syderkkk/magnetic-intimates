import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { ProductCreateForm } from "@/components/admin/product-create-form";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Nuevo producto" };

export default async function NewProductPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <Link
        href="/admin/productos"
        className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4 transition-transform duration-200 ease-out group-hover:-translate-x-0.5" />
        Productos
      </Link>
      <h1 className="mt-3 mb-6 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Nuevo producto
      </h1>

      {categories.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
          Primero crea una categoría en{" "}
          <Link href="/admin/categorias" className="underline">
            Categorías
          </Link>
          .
        </p>
      ) : (
        <section className="max-w-xl rounded-2xl border bg-background p-5 sm:p-6">
          <ProductCreateForm categories={categories} />
        </section>
      )}
    </div>
  );
}
