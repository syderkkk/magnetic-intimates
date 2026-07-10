"use client";

import {
  Check,
  ChevronDown,
  Loader2,
  Minus,
  Plus,
  RefreshCw,
  Truck,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
  const [buying, setBuying] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sizeGroupRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [ctaVisible, setCtaVisible] = useState(true);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  // Barra fija de "Agregar al carrito" en mobile (docs/09 §4): se muestra solo
  // cuando el CTA inline salió de vista, para no duplicarlo innecesariamente.
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setCtaVisible(entry?.isIntersecting ?? true),
      { rootMargin: "-56px 0px 0px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  /** Agrega la selección actual al carrito. Devuelve false si falta talla o no hay stock. */
  function addSelectionToCart() {
    // Falta elegir talla: en vez de un botón muerto, avisamos y llevamos foco.
    if (needsSize && !selectedSize) {
      setSizeError(true);
      sizeGroupRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      return false;
    }
    if (hardDisabled || !selectedVariant) return false;

    const img = product.images[0];

    const variantLabel =
      [selectedColor ? getColorName(selectedColor) : null, selectedSize]
        .filter(Boolean)
        .join(" / ") || undefined;

    addItem(
      {
        key: selectedVariant.id,
        variantId: selectedVariant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        unitPriceCents: currentPriceCents,
        image: img?.url ?? "/placeholder.svg",
        imageAlt: img?.alt ?? product.name,
        variantLabel,
      },
      quantity,
    );
    return true;
  }

  function handleAddToCart() {
    if (!addSelectionToCart()) return;
    setAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 1800);
  }

  // "Comprar ahora": agrega y salta directo al checkout (SSR, recalcula precio
  // y stock frescos ahí — este botón solo ahorra el paso de abrir el carrito).
  function handleBuyNow() {
    if (!addSelectionToCart()) return;
    setBuying(true);
    router.push("/checkout");
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[3fr_2fr] lg:items-start lg:gap-12">
      {/* ── Galería ── */}
      <ProductGallery images={product.images} productName={product.name} />

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
            <span className="bg-accent/70 px-2 py-0.5 text-xs font-medium text-foreground">
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

        {/* Cantidad en su propia línea. Una sola acción dominante ("Comprar
            ahora", ancho completo — la que pidió tener relevancia), y
            "Agregar al carrito" como enlace secundario discreto debajo: no
            compite visualmente, pero sigue siendo un control real (botón,
            no solo texto decorativo) para quien arma un pedido con varios
            productos. */}
        <div ref={ctaRef} className="mt-8 space-y-4">
          <div className="flex w-fit items-center rounded-full border">
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

          <div className="space-y-2.5">
            <Button
              type="button"
              onClick={handleBuyNow}
              disabled={hardDisabled || buying}
              className="h-13 w-full rounded-full text-sm font-semibold"
            >
              {buying ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Redirigiendo…
                </>
              ) : soldOut ? (
                "Agotado"
              ) : comboSoldOut ? (
                "Sin stock en esta combinación"
              ) : (
                "Comprar ahora"
              )}
            </Button>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={hardDisabled}
              className="mx-auto flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline disabled:pointer-events-none disabled:opacity-40"
            >
              {added ? (
                <>
                  <Check className="size-4" aria-hidden="true" />
                  Agregado al carrito
                </>
              ) : soldOut ? (
                "Agotado"
              ) : comboSoldOut ? (
                "Sin stock"
              ) : (
                <>
                  <Plus className="size-3.5" aria-hidden="true" />
                  Agregar al carrito
                </>
              )}
            </button>
          </div>

          {/* Confianza cerca del CTA (docs/09 §4): antes vivía después del
              acordeón, es decir, después de que ya se decidió comprar o no.
              El detalle completo sigue en el acordeón "Envíos y devoluciones"
              — esto es solo la señal rápida en el momento de la duda. */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Truck className="size-3.5 shrink-0" aria-hidden="true" />
              Envíos a todo el Perú
            </span>
            <span className="flex items-center gap-1.5">
              <RefreshCw className="size-3.5 shrink-0" aria-hidden="true" />
              Cambios fáciles
            </span>
          </div>
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {added ? "Producto agregado al carrito" : ""}
        </p>

        {/* Barra fija de compra en mobile: reemplaza al CTA inline cuando se
            pierde de vista, así la ficha larga (fotos + descripción) nunca
            deja al comprador sin el botón a mano (docs/09 §4). Prioriza
            "Comprar ahora" igual que el CTA en línea — antes mostraba solo
            "Agregar", una jerarquía distinta a la de arriba para el mismo
            producto. */}
        {!ctaVisible ? (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur-sm lg:hidden">
            <div className="mx-auto flex max-w-7xl items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{product.name}</p>
                <p className="text-sm font-semibold tabular-nums">
                  {formatPrice(currentPriceCents)}
                </p>
              </div>
              <Button
                type="button"
                onClick={handleBuyNow}
                disabled={hardDisabled || buying}
                className="h-11 shrink-0 rounded-full px-6 text-sm"
              >
                {buying ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Redirigiendo…
                  </>
                ) : soldOut ? (
                  "Agotado"
                ) : comboSoldOut ? (
                  "Sin stock"
                ) : (
                  "Comprar ahora"
                )}
              </Button>
            </div>
          </div>
        ) : null}

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
      </div>
    </div>
  );
}

/** Sección colapsable con animación de altura (mismo truco grid-rows 1fr/0fr
 *  que el panel de filtros de /tienda, para una sola convención de motion). */
function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="group flex w-full items-center justify-between py-4 text-left text-sm font-medium"
      >
        {title}
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-300 ease-out group-hover:text-foreground",
            open ? "rotate-180" : "rotate-0",
          )}
          aria-hidden="true"
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <p className="pb-4 text-sm leading-relaxed text-muted-foreground">
            {children}
          </p>
        </div>
      </div>
    </div>
  );
}
