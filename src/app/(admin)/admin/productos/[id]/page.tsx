import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductEditForm } from "@/components/admin/product-edit-form";
import { ProductEditTabs } from "@/components/admin/product-edit-tabs";
import { ProductImagesManager } from "@/components/admin/product-images-manager";
import { ProductVariantsManager } from "@/components/admin/product-variants-manager";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    select: { name: true },
  });
  return { title: product ? `Editar — ${product.name}` : "Producto" };
}

export default async function ProductEditPage({ params }: Props) {
  const { id } = await params;
  const [product, categories, sizes, colors] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: {
          include: { size: true, color: true },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.size.findMany({ orderBy: { position: "asc" }, select: { id: true, name: true } }),
    db.color.findMany({
      orderBy: { position: "asc" },
      select: { id: true, name: true, hex: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <Link
        href="/admin/productos"
        className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4 transition-transform duration-200 ease-out group-hover:-translate-x-0.5" />
        Productos
      </Link>

      <div className="mt-3 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          {product.name}
        </h1>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium",
            product.isActive
              ? "bg-emerald-500/15 text-emerald-700"
              : "bg-muted text-muted-foreground",
          )}
        >
          {product.isActive ? "Activo" : "Borrador"}
        </span>
      </div>

      <div className="max-w-3xl">
        <ProductEditTabs
          variantsCount={product.variants.length}
          imagesCount={product.images.length}
          dataPanel={
            <>
              <p className="mb-5 text-sm text-muted-foreground">
                Nombre, precio, categoría y estado. Marca <strong>Activo</strong>{" "}
                cuando el producto esté listo para mostrarse en la tienda.
              </p>
              <ProductEditForm
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  categoryId: product.categoryId,
                  priceCents: product.priceCents,
                  compareAtPriceCents: product.compareAtPriceCents,
                  badge: product.badge,
                  description: product.description,
                  composition: product.composition,
                  isActive: product.isActive,
                  isFeatured: product.isFeatured,
                }}
                categories={categories}
              />
            </>
          }
          variantsPanel={
            <ProductVariantsManager
              productId={product.id}
              variants={product.variants.map((v) => ({
                id: v.id,
                sizeName: v.size?.name ?? "—",
                colorName: v.color?.name ?? "—",
                colorHex: v.color?.hex ?? "#e5e5e5",
                sku: v.sku,
                stock: v.stock,
              }))}
              sizes={sizes}
              colors={colors}
            />
          }
          imagesPanel={
            <ProductImagesManager
              productId={product.id}
              images={product.images.map((img) => ({
                id: img.id,
                url: img.url,
                alt: img.alt,
                isPrimary: img.isPrimary,
              }))}
            />
          }
        />
      </div>
    </div>
  );
}
