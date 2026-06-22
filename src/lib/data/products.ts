import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import type { Product, ProductBadge, ProductVariant } from "@/types/product";

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  CAPA DE DATOS DE PRODUCTOS (Prisma)
 *  Reemplaza el catálogo mock por consultas reales. Devuelve el MISMO tipo de
 *  presentación `Product` que ya consumen los componentes, así que la UI no
 *  cambia. Las tallas/colores y las variantes se derivan de `product_variants`.
 * ─────────────────────────────────────────────────────────────────────────
 */

/** Relaciones necesarias para construir un `Product` de presentación. */
const PRODUCT_INCLUDE = {
  category: true,
  images: { orderBy: { position: "asc" } },
  variants: {
    include: { size: true, color: true },
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.ProductInclude;

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof PRODUCT_INCLUDE;
}>;

/** Ordena por `position` (asc) y devuelve valores únicos preservando ese orden. */
function uniqueByPosition(
  pairs: Array<readonly [string, number]>,
): string[] {
  return [...new Map(pairs)]
    .sort((a, b) => a[1] - b[1])
    .map(([value]) => value);
}

/** Convierte un producto de Prisma al tipo de presentación `Product`. */
function toProduct(p: ProductWithRelations): Product {
  const variants: ProductVariant[] = p.variants.map((v) => ({
    sku: v.sku,
    size: v.size?.name,
    color: v.color?.hex,
    stock: v.stock,
    priceCents: v.priceCents ?? undefined,
  }));

  const sizes = uniqueByPosition(
    p.variants
      .filter((v) => v.size)
      .map((v) => [v.size!.name, v.size!.position] as const),
  );
  const colors = uniqueByPosition(
    p.variants
      .filter((v) => v.color)
      .map((v) => [v.color!.hex, v.color!.position] as const),
  );

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category.name,
    priceCents: p.priceCents,
    compareAtPriceCents: p.compareAtPriceCents ?? undefined,
    images: p.images.map((img) => ({ url: img.url, alt: img.alt })),
    badge: (p.badge as ProductBadge | null) ?? undefined,
    colors,
    sizes,
    variants,
    description: p.description ?? undefined,
    composition: p.composition ?? undefined,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
  };
}

/** Devuelve todos los productos activos (orden de creación). */
export async function getAllProducts(): Promise<Product[]> {
  const products = await db.product.findMany({
    where: { isActive: true },
    include: PRODUCT_INCLUDE,
    orderBy: { createdAt: "asc" },
  });
  return products.map(toProduct);
}

/** Devuelve los productos destacados para la página de inicio. */
export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await db.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: PRODUCT_INCLUDE,
    orderBy: { createdAt: "asc" },
  });
  return products.map(toProduct);
}

/** Devuelve los productos más recientes (por fecha de creación). */
export async function getLatestProducts(limit = 8): Promise<Product[]> {
  const products = await db.product.findMany({
    where: { isActive: true },
    include: PRODUCT_INCLUDE,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return products.map(toProduct);
}

/** Busca un producto por su slug (o `null` si no existe / está inactivo). */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await db.product.findFirst({
    where: { slug, isActive: true },
    include: PRODUCT_INCLUDE,
  });
  return product ? toProduct(product) : null;
}
