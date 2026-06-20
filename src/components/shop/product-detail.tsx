"use client";

import { Check, ChevronDown, Minus, Plus, RefreshCw, Truck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { getColorName } from "@/lib/data/filters";
import { discountPercent, formatPrice } from "@/lib/money";
import {
  findVariant,
  getStockStatus,
  getVariants,
  isColorAvailable,
  isSizeAvailable,
  totalStock,
  variantPrice,
} from "@/lib/product-variants";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import type { Product } from "@/types/product";
import { ProductGallery } from "./product-gallery";
import { SizeGuideSheet } from "./size-guide-sheet";

const DEFAULT_CARE =
  "Lavar a mano con agua fría. No usar lejía. Secar a la sombra. Planchar a baja temperatura.";
const SHIPPING_INFO =
  "Envíos a todo el Perú; coordinamos el método y costo según tu zona. Cambios fáciles dentro de los plazos vigentes si la talla no es la indicada.";

export function ProductDetail({ product }: { product: Product }) {
  const variants = useMemo(() => getVariants(product), [product]);
  const productStock = useMemo(() => totalStock(product), [product]);

  const needsSize = (product.sizes?.length ?? 0) > 0;
  const needsColor = (product.colors?.length ?? 0) > 0;

  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors?.[0] ?? null,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sizeGroupRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const selectionComplete =
    (!needsSize || !!selectedSize) && (!needsColor || !!selectedColor);
  const selectedVariant = selectionComplete
    ? findVariant(variants, selectedSize, selectedColor)
    : undefined;
  const selectedStock = selectedVariant?.stock ?? null;
  const maxQty = selectedStock ?? 10;

  const currentPriceCents = variantPrice(product, selectedVariant);
  const discount = product.compareAtPriceCents
    ? discountPercent(product.compareAtPriceCents, currentPriceCents)
    : 0;

  const soldOut = productStock <= 0;
  const comboSoldOut = selectionComplete && (selectedStock ?? 0) <= 0;
  const hardDisabled = soldOut || comboSoldOut;

  // El estado de stock que se muestra: por combinación si está completa.
  const stockStatus = selectionComplete
    ? getStockStatus(selectedStock ?? 0)
    : soldOut
      ? getStockStatus(0)
      : null;

  function selectColor(hex: string) {
    setSelectedColor(hex);
    setQuantity(1);
  }
  function selectSize(size: string) {
    setSelectedSize(size);
    setSizeError(false);
    setQuantity(1);
  }

  function handleAddToCart() {
    // Falta elegir talla: en vez de un botón muerto, avisamos y llevamos foco.
    if (needsSize && !selectedSize) {
      setSizeError(true);
      sizeGroupRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    if (hardDisabled) return;

    const img = product.images[0];
    if (!img) return;

    const variantLabel =
      [selectedColor ? getColorName(selectedColor) : null, selectedSize]
        .filter(Boolean)
        .join(" / ") || undefined;

    addItem(
      {
        key:
          selectedVariant?.sku ??
          `${product.id}-${selectedColor ?? ""}-${selectedSize ?? ""}`,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        unitPriceCents: currentPriceCents,
        image: img.url,
        imageAlt: img.alt,
        variantLabel,
      },
      quantity,
    );

    setAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,32rem)_1fr] lg:items-start lg:gap-16">
      {/* ── Galería ── */}
      <ProductGallery
        images={product.images}
        productName={product.name}
        badge={product.badge}
      />

      {/* ── Info y acciones ── */}
      <div className="flex flex-col lg:max-w-xl lg:py-2">
        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          {product.category}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight lg:text-4xl">
          {product.name}
        </h1>

        {/* Precios */}
        <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-2xl font-semibold tabular-nums">
            {formatPrice(currentPriceCents)}
          </span>
          {product.compareAtPriceCents ? (
            <span className="text-base text-muted-foreground line-through tabular-nums">
              {formatPrice(product.compareAtPriceCents)}
            </span>
          ) : null}
          {discount > 0 ? (
            <span className="rounded-full bg-foreground/8 px-2 py-0.5 text-xs font-medium text-foreground">
              -{discount}% dto.
            </span>
          ) : null}
        </div>

        {/* Estado de stock */}
        {stockStatus ? (
          <p
            className={cn(
              "mt-3 flex items-center gap-1.5 text-sm font-medium",
              stockStatus.tone === "out" && "text-destructive",
              stockStatus.tone === "low" && "text-foreground",
              stockStatus.tone === "in" && "text-muted-foreground",
            )}
            aria-live="polite"
          >
            <span
              className={cn(
                "size-2 rounded-full",
                stockStatus.tone === "out" && "bg-destructive",
                stockStatus.tone === "low" && "bg-foreground",
                stockStatus.tone === "in" && "bg-emerald-500",
              )}
              aria-hidden="true"
            />
            {stockStatus.label}
          </p>
        ) : null}

        <hr className="my-6 border-border" />

        {/* Selector de color */}
        {needsColor ? (
          <div className="space-y-3">
            <p id="color-label" className="text-sm font-medium">
              Color
              {selectedColor ? (
                <span className="ml-2 font-normal text-muted-foreground">
                  — {getColorName(selectedColor)}
                </span>
              ) : null}
            </p>
            <div
              role="radiogroup"
              aria-labelledby="color-label"
              className="flex flex-wrap gap-2.5"
            >
              {product.colors?.map((hex) => {
                const available = isColorAvailable(variants, hex, selectedSize);
                const checked = selectedColor === hex;
                return (
                  <label
                    key={hex}
                    title={getColorName(hex)}
                    className={cn(
                      available ? "cursor-pointer" : "cursor-not-allowed",
                    )}
                  >
                    <input
                      type="radio"
                      name="color"
                      className="peer sr-only"
                      checked={checked}
                      disabled={!available}
                      onChange={() => selectColor(hex)}
                    />
                    <span
                      className={cn(
                        "relative block size-9 rounded-full ring-offset-2 transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
                        checked
                          ? "ring-2 ring-foreground"
                          : "ring-1 ring-black/15",
                        available
                          ? "hover:scale-105"
                          : "opacity-40",
                      )}
                      style={{ backgroundColor: hex }}
                    >
                      {!available ? (
                        <span
                          className="absolute top-1/2 left-1/2 h-px w-[140%] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-foreground/60"
                          aria-hidden="true"
                        />
                      ) : null}
                    </span>
                    <span className="sr-only">
                      {getColorName(hex)}
                      {!available ? " (agotado)" : ""}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Selector de talla */}
        {needsSize ? (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p id="size-label" className="text-sm font-medium">
                Talla
                {!selectedSize ? (
                  <span className="ml-2 font-normal text-muted-foreground">
                    — selecciona una opción
                  </span>
                ) : null}
              </p>
              <SizeGuideSheet />
            </div>
            <div
              ref={sizeGroupRef}
              role="radiogroup"
              aria-labelledby="size-label"
              className="flex flex-wrap gap-2"
            >
              {product.sizes?.map((size) => {
                const available = isSizeAvailable(variants, size, selectedColor);
                const checked = selectedSize === size;
                return (
                  <label
                    key={size}
                    title={available ? undefined : "Agotado"}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-150 has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-1",
                      checked
                        ? "border-foreground bg-foreground text-background"
                        : "border-border",
                      available
                        ? "cursor-pointer hover:border-foreground"
                        : "cursor-not-allowed text-muted-foreground line-through opacity-50",
                    )}
                  >
                    <input
                      type="radio"
                      name="size"
                      className="sr-only"
                      checked={checked}
                      disabled={!available}
                      onChange={() => selectSize(size)}
                    />
                    {size}
                  </label>
                );
              })}
            </div>
            {sizeError ? (
              <p role="alert" className="text-xs text-destructive">
                Selecciona una talla para continuar.
              </p>
            ) : null}
          </div>
        ) : null}

        {/* Cantidad + agregar */}
        <div className="mt-8 flex items-stretch gap-3">
          <div className="flex items-center rounded-full border">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Reducir cantidad"
              className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              <Minus className="size-4" />
            </button>
            <span
              className="w-8 text-center text-sm font-medium tabular-nums"
              aria-live="polite"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              disabled={quantity >= maxQty || hardDisabled}
              aria-label="Aumentar cantidad"
              className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              <Plus className="size-4" />
            </button>
          </div>

          <Button
            type="button"
            onClick={handleAddToCart}
            disabled={hardDisabled}
            className="h-11 flex-1 rounded-full text-sm"
          >
            {added ? (
              <>
                <Check className="size-4" aria-hidden="true" />
                Agregado al carrito
              </>
            ) : soldOut ? (
              "Agotado"
            ) : comboSoldOut ? (
              "Sin stock en esta combinación"
            ) : (
              <>
                <Plus className="size-4" aria-hidden="true" />
                Agregar al carrito
              </>
            )}
          </Button>
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {added ? "Producto agregado al carrito" : ""}
        </p>

        {/* Detalle (acordeón) */}
        <div className="mt-8 divide-y border-y">
          {product.description ? (
            <AccordionItem title="Descripción" defaultOpen>
              {product.description}
            </AccordionItem>
          ) : null}
          <AccordionItem title="Composición y cuidado">
            {product.composition ?? DEFAULT_CARE}
          </AccordionItem>
          <AccordionItem title="Envíos y devoluciones">{SHIPPING_INFO}</AccordionItem>
        </div>

        {/* Propuestas de valor */}
        <div className="mt-6 space-y-3.5 text-sm text-muted-foreground">
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

/** Sección colapsable accesible basada en <details> (sin JS). */
function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="group" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown
          className="size-4 text-muted-foreground transition-transform duration-300 ease-out group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="pb-4 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </details>
  );
}
