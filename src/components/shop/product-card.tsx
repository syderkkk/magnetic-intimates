import Image from "next/image";
import Link from "next/link";

import { discountPercent, formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { Product, ProductBadge } from "@/types/product";
import { AddToCartButton } from "./add-to-cart-button";
import { FavoriteButton } from "./favorite-button";

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
 * Tarjeta de producto — estética editorial monocroma de NUE INTIME.
 *
 * Imagen a sangre con esquinas rectas (sin radio) para un look de galería. Al
 * pasar el cursor, la foto principal se sustituye por la segunda (CSS puro; en
 * táctil se revela al tocar) con un leve zoom. El botón "Agregar" aparece al
 * hover en escritorio y permanece visible en táctil; el corazón de favoritos y
 * el badge quedan siempre a la vista.
 */
export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [primary, secondary] = product.images;
  if (!primary) return null;

  const discount = product.compareAtPriceCents
    ? discountPercent(product.compareAtPriceCents, product.priceCents)
    : 0;

  return (
    <article className="group/card relative flex flex-col">
      <div className="relative aspect-4/5 w-full overflow-hidden bg-muted">
        {/* Imagen principal */}
        <Image
          src={primary.url}
          alt={primary.alt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          className={cn(
            "object-cover transition-[opacity,transform] duration-600 ease-out",
            "group-hover/card:scale-[1.04]",
            secondary && "group-hover/card:opacity-0",
          )}
        />

        {/* Imagen secundaria (se revela al hover/tap) */}
        {secondary ? (
          <Image
            src={secondary.url}
            alt={secondary.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover opacity-0 transition-[opacity,transform] duration-600 ease-out group-hover/card:scale-[1.04] group-hover/card:opacity-100"
          />
        ) : null}

        {/* Sombreado inferior sutil al hover: mejora la legibilidad del botón. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/15 to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />

        {/* Badge (campaña / estado). Esquina superior izquierda, siempre visible. */}
        {product.badge ? (
          <span className="absolute top-2.5 left-2.5 rounded-full bg-foreground px-2.5 py-1 text-[10px] font-medium tracking-wider text-background uppercase">
            {BADGE_LABELS[product.badge]}
          </span>
        ) : null}

        {/* Favorito (sobre el overlay del link, por eso z-10). */}
        <div className="absolute top-2 right-2 z-10">
          <FavoriteButton productName={product.name} />
        </div>

        {/* Botón agregar: oculto hasta el hover en dispositivos con puntero;
            siempre visible en táctil (sin hover). z-10 lo ubica sobre el link. */}
        <div className="absolute inset-x-2.5 bottom-2.5 z-10 translate-y-0 opacity-100 transition-[opacity,transform] duration-300 ease-out [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/card:translate-y-0 [@media(hover:hover)]:group-hover/card:opacity-100">
          <AddToCartButton
            product={product}
            className="bg-background/90 text-foreground shadow-sm backdrop-blur-sm hover:bg-foreground hover:text-background active:scale-[0.98]"
          />
        </div>
      </div>

      {/* Información */}
      <div className="mt-3 space-y-1">
        <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
          {product.category}
        </p>
        <h3 className="text-sm leading-snug font-medium">
          {/* Stretched link: el ::after cubre toda la tarjeta (z-[1]); favorito y carrito están en z-10. */}
          <Link
            href={`/producto/${product.slug}`}
            className="underline-offset-4 transition-colors after:absolute after:inset-0 after:z-1 after:content-[''] group-hover/card:underline focus-visible:outline-none"
          >
            {product.name}
          </Link>
        </h3>

        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-sm font-semibold tabular-nums">
            {formatPrice(product.priceCents)}
          </span>
          {product.compareAtPriceCents ? (
            <span className="text-xs text-muted-foreground line-through tabular-nums">
              {formatPrice(product.compareAtPriceCents)}
            </span>
          ) : null}
          {discount > 0 ? (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums">
              -{discount}%
            </span>
          ) : null}
        </div>

        {/* Resumen de colores disponibles */}
        {product.colors && product.colors.length > 0 ? (
          <div className="flex items-center gap-1.5 pt-1" aria-hidden="true">
            {product.colors.slice(0, 5).map((color) => (
              <span
                key={color}
                className="size-3 rounded-full ring-1 ring-black/10 transition-transform duration-200 group-hover/card:scale-110"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
