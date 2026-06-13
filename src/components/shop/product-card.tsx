import Image from "next/image";

import { discountPercent, formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { Product, ProductBadge } from "@/types/product";
import { AddToCartButton } from "./add-to-cart-button";

/** Etiquetas legibles para cada badge. */
const BADGE_LABELS: Record<ProductBadge, string> = {
  nuevo: "Nuevo",
  bestseller: "Más vendido",
  oferta: "Oferta",
};

interface ProductCardProps {
  product: Product;
  /** Carga prioritaria de la imagen (usar solo en las primeras tarjetas visibles, LCP). */
  priority?: boolean;
}

/**
 * Tarjeta de producto.
 * Es un Server Component (sin JS en cliente salvo el botón de agregar): al pasar
 * el cursor sobre la imagen, esta se sustituye por la segunda foto del producto
 * (efecto en CSS puro; en táctil se activa al tocar). El botón "Agregar" aparece
 * al hover en escritorio y permanece visible en dispositivos táctiles.
 *
 * TODO: enlazar a /producto/[slug] cuando exista la ficha de producto (fase v0.2).
 */
export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [primary, secondary] = product.images;
  if (!primary) return null;

  const discount = product.compareAtPriceCents
    ? discountPercent(product.compareAtPriceCents, product.priceCents)
    : 0;

  return (
    <article className="group flex flex-col">
      <div className="relative aspect-4/5 w-full overflow-hidden rounded-xl bg-muted">
        {/* Imagen principal */}
        <Image
          src={primary.url}
          alt={primary.alt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          className={cn(
            "object-cover transition-[opacity,transform] duration-500 ease-out",
            "group-hover:scale-[1.03]",
            secondary && "group-hover:opacity-0",
          )}
        />

        {/* Imagen secundaria (se revela al hover/tap) */}
        {secondary ? (
          <Image
            src={secondary.url}
            alt={secondary.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover opacity-0 transition-[opacity,transform] duration-500 ease-out group-hover:scale-[1.03] group-hover:opacity-100"
          />
        ) : null}

        {/* Badges */}
        {product.badge ? (
          <span className="absolute top-3 left-3 rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-medium tracking-wider uppercase backdrop-blur-sm">
            {BADGE_LABELS[product.badge]}
          </span>
        ) : null}
        {discount > 0 ? (
          <span className="absolute top-3 right-3 rounded-full bg-foreground px-2.5 py-1 text-[10px] font-medium text-background tabular-nums">
            -{discount}%
          </span>
        ) : null}

        {/* Botón agregar: oculto hasta el hover en dispositivos con puntero;
            siempre visible en táctil (sin hover). */}
        <div className="absolute inset-x-3 bottom-3 translate-y-0 opacity-100 transition-[opacity,transform] duration-300 ease-out [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100">
          <AddToCartButton
            product={product}
            className="bg-background/90 text-foreground shadow-sm backdrop-blur-sm hover:bg-foreground hover:text-background active:scale-[0.98]"
          />
        </div>
      </div>

      {/* Información */}
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
            {product.category}
          </p>
          <h3 className="mt-0.5 truncate text-sm font-medium">{product.name}</h3>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-medium tabular-nums">
            {formatPrice(product.priceCents)}
          </p>
          {product.compareAtPriceCents ? (
            <p className="text-xs text-muted-foreground line-through tabular-nums">
              {formatPrice(product.compareAtPriceCents)}
            </p>
          ) : null}
        </div>
      </div>

      {/* Resumen de colores disponibles */}
      {product.colors && product.colors.length > 0 ? (
        <div className="mt-2 flex items-center gap-1.5" aria-hidden="true">
          {product.colors.slice(0, 5).map((color) => (
            <span
              key={color}
              className="size-3 rounded-full ring-1 ring-black/10"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}
