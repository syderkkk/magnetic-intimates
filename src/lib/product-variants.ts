import type { Cents } from "@/lib/money";
import type { Product, ProductVariant } from "@/types/product";

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  VARIANTES Y STOCK
 *  Capa única para resolver la variante (talla×color) seleccionada, su stock y
 *  su precio. Si un producto no trae `variants` explícitas, se SINTETIZAN desde
 *  `sizes`×`colors` con un stock por defecto (compatibilidad con la data mock).
 *
 *  Pensado para crecer: cuando exista la tabla `product_variants` (CLAUDE.md §4),
 *  `getVariants` devolverá esas filas reales y el resto del código no cambia.
 *  El stock REAL siempre se valida en el servidor dentro de una transacción al
 *  comprar (CLAUDE.md §8); aquí es solo para la interfaz.
 * ─────────────────────────────────────────────────────────────────────────
 */

/** Stock por defecto al sintetizar variantes de productos mock sin `variants`. */
const DEFAULT_VARIANT_STOCK = 20;

/** Umbral para avisar "pocas unidades". */
const LOW_STOCK_THRESHOLD = 5;

export type StockTone = "in" | "low" | "out";

export interface StockStatus {
  tone: StockTone;
  label: string;
  available: boolean;
}

/** Devuelve las variantes del producto, sintetizándolas si no existen. */
export function getVariants(product: Product): ProductVariant[] {
  if (product.variants?.length) return product.variants;

  const sizes = product.sizes?.length ? product.sizes : [undefined];
  const colors = product.colors?.length ? product.colors : [undefined];
  const result: ProductVariant[] = [];
  for (const size of sizes) {
    for (const color of colors) {
      result.push({
        sku: `${product.id}-${size ?? "u"}-${color ?? "u"}`,
        size,
        color,
        stock: DEFAULT_VARIANT_STOCK,
      });
    }
  }
  return result;
}

/** Busca la variante exacta para una talla y color (cualquiera puede ser nulo). */
export function findVariant(
  variants: ProductVariant[],
  size: string | null,
  color: string | null,
): ProductVariant | undefined {
  return variants.find(
    (variant) =>
      (variant.size ?? null) === size && (variant.color ?? null) === color,
  );
}

/**
 * ¿Hay stock para una talla dada (considerando el color elegido)? Si no se pasa
 * color, basta con que exista stock en cualquier color para esa talla.
 */
export function isSizeAvailable(
  variants: ProductVariant[],
  size: string,
  selectedColor: string | null,
): boolean {
  return variants.some(
    (variant) =>
      variant.size === size &&
      (selectedColor == null || variant.color === selectedColor) &&
      variant.stock > 0,
  );
}

/** ¿Hay stock para un color dado (considerando la talla elegida)? */
export function isColorAvailable(
  variants: ProductVariant[],
  color: string,
  selectedSize: string | null,
): boolean {
  return variants.some(
    (variant) =>
      variant.color === color &&
      (selectedSize == null || variant.size === selectedSize) &&
      variant.stock > 0,
  );
}

/** Stock total del producto (suma de todas sus variantes). */
export function totalStock(product: Product): number {
  return getVariants(product).reduce((sum, variant) => sum + variant.stock, 0);
}

/** Traduce un número de stock a un estado mostrable (texto + tono). */
export function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) {
    return { tone: "out", label: "Agotado", available: false };
  }
  if (stock <= LOW_STOCK_THRESHOLD) {
    return {
      tone: "low",
      label: `¡Solo quedan ${stock}!`,
      available: true,
    };
  }
  return { tone: "in", label: "En stock", available: true };
}

/** Precio de una variante (su precio propio o, si no tiene, el del producto). */
export function variantPrice(
  product: Product,
  variant: ProductVariant | undefined,
): Cents {
  return variant?.priceCents ?? product.priceCents;
}
