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
  isActive: boolean;
  isFeatured: boolean;
}
