import type { Cents } from "@/lib/money";

/** Etiqueta destacada del producto (se muestra como badge en la tarjeta). */
export type ProductBadge = "nuevo" | "bestseller" | "oferta";

/** Imagen de producto. Se necesitan al menos 2 para el efecto de cambio al hover. */
export interface ProductImage {
  url: string;
  /** Texto alternativo (obligatorio: accesibilidad + SEO). */
  alt: string;
}

/**
 * Variante de producto (combinación talla + color) con su propio stock.
 * Mapea a la tabla `product_variants` (CLAUDE.md §4): cuando exista Prisma, este
 * tipo se deriva del modelo y la UI no cambia. `size`/`color` son opcionales por
 * si un producto se vende por una sola dimensión (p. ej. talla única).
 */
export interface ProductVariant {
  /** Id real de `product_variants` (Prisma) — lo que viaja al carrito y al pedido. */
  id: string;
  /** Código único de la variante. */
  sku: string;
  /** Talla (p. ej. "M"); ausente si el producto no maneja tallas. */
  size?: string;
  /** Color en hex; ausente si el producto no maneja colores. */
  color?: string;
  /** Unidades disponibles de ESTA variante. */
  stock: number;
  /** Precio propio en céntimos; si falta, se usa el precio base del producto. */
  priceCents?: Cents;
}

/**
 * Producto del catálogo.
 * NOTA: por ahora es un tipo de presentación. Cuando exista la BD, se derivará
 * del modelo Prisma (`products` + `product_images` + `product_variants`).
 */
export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  /** Precio de venta en céntimos (entero) — ver `@/lib/money`. */
  priceCents: Cents;
  /** Precio anterior en céntimos (opcional, para mostrar oferta). */
  compareAtPriceCents?: Cents;
  /** Imágenes del producto (la primera es la principal; la segunda, el hover). */
  images: ProductImage[];
  badge?: ProductBadge;
  /** Colores disponibles (hex), para el resumen visual en la tarjeta. */
  colors?: string[];
  /** Tallas disponibles. */
  sizes?: string[];
  /**
   * Variantes (talla×color) con stock por combinación. Si no se define, se
   * sintetiza desde `sizes`×`colors` (ver `@/lib/product-variants`). Cuando
   * exista la BD, este será el origen real del stock por variante.
   */
  variants?: ProductVariant[];
  description?: string;
  /** Composición y cuidado (opcional); se muestra en el acordeón de la ficha. */
  composition?: string;
  isActive: boolean;
  isFeatured: boolean;
}
