"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Check, Plus, RefreshCw, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice, discountPercent } from "@/lib/money";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import type { Product, ProductBadge } from "@/types/product";

const BADGE_LABELS: Record<ProductBadge, string> = {
  nuevo: "Nuevo",
  bestseller: "Más vendido",
  oferta: "Oferta",
};

export function ProductDetail({ product }: { product: Product }) {
  const [activeImg, setActiveImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors?.[0] ?? null,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const addItem = useCartStore((s) => s.addItem);
  const discount = product.compareAtPriceCents
    ? discountPercent(product.compareAtPriceCents, product.priceCents)
    : 0;

  const needsSize = (product.sizes?.length ?? 0) > 0;
  const canAdd = !needsSize || !!selectedSize;

  function handleAddToCart() {
    const img = product.images[0];
    if (!img || !canAdd) return;

    const colorIndex = product.colors?.indexOf(selectedColor ?? "") ?? -1;
    const parts = [
      colorIndex >= 0 ? `Color ${colorIndex + 1}` : null,
      selectedSize,
    ].filter(Boolean);

    addItem({
      key: `${product.id}-${selectedColor ?? ""}-${selectedSize ?? ""}`,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      unitPriceCents: product.priceCents,
      image: img.url,
      imageAlt: img.alt,
      variantLabel: parts.join(" / ") || undefined,
    });

    setAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 1600);
  }

  const activeImage = product.images[activeImg] ?? product.images[0];

  return (
    <div className="grid gap-10 lg:grid-cols-[3fr_2fr] lg:gap-16">
      {/* ── Galería ── */}
      <div className="flex flex-col gap-4">
        {/* Imagen principal */}
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted">
          {activeImage && (
            <Image
              key={activeImg}
              src={activeImage.url}
              alt={activeImage.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover transition-opacity duration-300"
            />
          )}

          {product.badge && (
            <span className="absolute top-4 left-4 rounded-full bg-background/85 px-3 py-1 text-xs font-medium tracking-wider uppercase backdrop-blur-sm">
              {BADGE_LABELS[product.badge]}
            </span>
          )}
          {discount > 0 && (
            <span className="absolute top-4 right-4 rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background tabular-nums">
              -{discount}%
            </span>
          )}
        </div>

        {/* Miniaturas */}
        {product.images.length > 1 && (
          <div className="flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImg(i)}
                aria-label={`Ver imagen ${i + 1}`}
                aria-current={activeImg === i}
                className={cn(
                  "relative aspect-[4/5] w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted transition-all duration-200",
                  activeImg === i
                    ? "ring-2 ring-foreground ring-offset-2"
                    : "opacity-55 hover:opacity-90",
                )}
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Info y acciones ── */}
      <div className="flex flex-col lg:py-2">
        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          {product.category}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight lg:text-4xl">
          {product.name}
        </h1>

        {/* Precios */}
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-2xl font-semibold tabular-nums">
            {formatPrice(product.priceCents)}
          </span>
          {product.compareAtPriceCents && (
            <span className="text-base text-muted-foreground line-through tabular-nums">
              {formatPrice(product.compareAtPriceCents)}
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-full bg-foreground/8 px-2 py-0.5 text-xs font-medium text-foreground">
              -{discount}% dto.
            </span>
          )}
        </div>

        <hr className="my-6 border-border" />

        {/* Selector de color */}
        {product.colors && product.colors.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">
              Color
              {selectedColor && (
                <span className="ml-2 font-normal text-muted-foreground">
                  — seleccionado
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2.5" role="group" aria-label="Seleccionar color">
              {product.colors.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setSelectedColor(hex)}
                  style={{ backgroundColor: hex }}
                  aria-label={`Color ${hex}`}
                  aria-pressed={selectedColor === hex}
                  className={cn(
                    "size-9 rounded-full transition-all duration-200",
                    selectedColor === hex
                      ? "ring-2 ring-foreground ring-offset-2 scale-110"
                      : "ring-1 ring-black/10 hover:scale-110",
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* Selector de talla */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium">
              Talla
              {!selectedSize && (
                <span className="ml-2 font-normal text-muted-foreground">
                  — selecciona una opción
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Seleccionar talla">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  aria-pressed={selectedSize === size}
                  className={cn(
                    "min-w-[3rem] rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-150",
                    selectedSize === size
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground",
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Botón agregar */}
        <Button
          type="button"
          onClick={handleAddToCart}
          disabled={!canAdd}
          className="mt-8 h-12 w-full rounded-full text-sm"
        >
          {added ? (
            <>
              <Check className="size-4" aria-hidden="true" />
              Agregado al carrito
            </>
          ) : (
            <>
              <Plus className="size-4" aria-hidden="true" />
              {canAdd ? "Agregar al carrito" : "Selecciona una talla"}
            </>
          )}
        </Button>

        {/* Descripción */}
        {product.description && (
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        )}

        <hr className="my-6 border-border" />

        {/* Propuestas de valor */}
        <div className="space-y-3.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <Truck className="size-4 shrink-0" aria-hidden="true" />
            <span>Envíos a todo el Perú</span>
          </div>
          <div className="flex items-center gap-3">
            <RefreshCw className="size-4 shrink-0" aria-hidden="true" />
            <span>Cambios fáciles si la talla no es la indicada</span>
          </div>
        </div>
      </div>
    </div>
  );
}
