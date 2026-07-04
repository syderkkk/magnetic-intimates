"use client";

import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Dialog } from "radix-ui";

import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/product";
import { FavoriteButton } from "./favorite-button";
import { NoImage } from "./no-image";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

/**
 * Galería de la ficha de producto: carrusel de a 2 fotos (como referencia de
 * mercado) con riel de miniaturas verticales a la izquierda en escritorio.
 * Se muestran siempre exactamente 2 fotos en el área principal (ventana
 * deslizante circular) — nunca queda una foto "huérfana" sola en su propia
 * fila cuando el producto tiene un número impar de imágenes o más de 2.
 * La etiqueta de oferta NO se repite acá: ya está en el precio (redundante
 * en la foto). El favorito va una sola vez sobre el área principal.
 */
export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeImg, setActiveImg] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [magnified, setMagnified] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  const active = images[activeImg] ?? images[0];
  const hasMany = images.length > 1;
  const showArrows = images.length > 2;
  const secondIndex = hasMany ? (activeImg + 1) % images.length : activeImg;
  const pairIndexes = hasMany ? [activeImg, secondIndex] : [activeImg];

  function go(delta: number) {
    setMagnified(false);
    setActiveImg((index) => (index + delta + images.length) % images.length);
  }

  /** Posición del cursor (en %) dentro de un elemento, para el punto de zoom. */
  function pointerPercent(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    };
  }

  // Producto sin imágenes todavía (se suben desde el panel).
  if (!active) {
    return (
      <div className="lg:sticky lg:top-24">
        <div className="relative aspect-4/5 w-full overflow-hidden bg-muted">
          <NoImage className="absolute inset-0 size-full" />
          <FavoriteButton
            productName={productName}
            className="absolute top-2.5 right-2.5 z-10"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="lg:sticky lg:top-24">
      {/* Móvil/tablet: una imagen activa + miniaturas debajo (carrusel simple). */}
      <div className="flex flex-col gap-4 lg:hidden">
        <div className="relative aspect-4/5 w-full overflow-hidden bg-muted">
          <Image
            key={activeImg}
            src={active.url}
            alt={active.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover transition-opacity duration-300"
          />

          <button
            type="button"
            onClick={() => setZoomed(true)}
            aria-label="Ampliar imagen"
            className="group absolute inset-0 cursor-zoom-in"
          >
            <span className="absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-sm backdrop-blur-sm transition-all duration-300 ease-out group-hover:opacity-100 [@media(hover:none)]:opacity-100">
              <ZoomIn className="size-4" aria-hidden="true" />
            </span>
          </button>

          <FavoriteButton
            productName={productName}
            className="absolute top-2.5 right-2.5 z-10"
          />
        </div>

        {hasMany ? (
          <div
            className="flex flex-wrap gap-3"
            role="group"
            aria-label="Miniaturas del producto"
          >
            {images.map((img, i) => (
              <button
                key={img.url}
                type="button"
                onClick={() => setActiveImg(i)}
                aria-label={`Ver imagen ${i + 1} de ${images.length}`}
                aria-pressed={activeImg === i}
                className={cn(
                  "relative aspect-4/5 w-20 shrink-0 overflow-hidden bg-muted transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
                  activeImg === i
                    ? "ring-2 ring-foreground ring-offset-2"
                    : "opacity-60 hover:opacity-100",
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
        ) : null}
      </div>

      {/* Escritorio: carrusel de a 2 fotos + riel de miniaturas verticales
          a la izquierda (como iHeartRaves) — nunca una foto huérfana sola. */}
      <div className="hidden gap-3 lg:flex">
        {hasMany ? (
          <div
            className="flex max-h-150 w-20 shrink-0 flex-col gap-3 overflow-y-auto"
            role="group"
            aria-label="Miniaturas del producto"
          >
            {images.map((img, i) => {
              const isActive = pairIndexes.includes(i);
              return (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  aria-label={`Ver imagen ${i + 1} de ${images.length}`}
                  aria-pressed={isActive}
                  className={cn(
                    "relative aspect-4/5 w-full shrink-0 overflow-hidden bg-muted transition-opacity duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
                    isActive ? "opacity-100" : "opacity-50 hover:opacity-80",
                  )}
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                  {/* Indicador de foto activa: línea fina, no un recuadro pesado. */}
                  {isActive ? (
                    <span
                      className="bg-foreground absolute inset-x-0 bottom-0 h-0.5"
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="relative grid flex-1 grid-cols-2 gap-3">
          {pairIndexes.map((imgIndex, slot) => {
            const img = images[imgIndex];
            if (!img) return null;
            return (
              <div
                key={`${img.url}-${slot}`}
                className="group relative aspect-4/5 overflow-hidden bg-muted"
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  priority={slot === 0}
                  sizes="(min-width: 1024px) 22vw, 50vw"
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                />

                <button
                  type="button"
                  onClick={() => {
                    setActiveImg(imgIndex);
                    setZoomed(true);
                  }}
                  aria-label={`Ampliar imagen ${imgIndex + 1} de ${images.length}`}
                  className="absolute inset-0 cursor-zoom-in"
                >
                  <span className="absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-sm backdrop-blur-sm transition-all duration-300 ease-out group-hover:opacity-100">
                    <ZoomIn className="size-4" aria-hidden="true" />
                  </span>
                </button>
              </div>
            );
          })}

          <FavoriteButton
            productName={productName}
            className="absolute top-2.5 right-2.5 z-10"
          />

          {/* Flechas sin fondo circular: solo el trazo, con una sombra suave
              para que se lean sobre cualquier foto — más acorde al estilo
              sobrio de la marca que un botón tipo "app" con relleno. */}
          {showArrows ? (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Ver fotos anteriores"
                className="absolute top-1/2 left-2 z-10 flex size-9 -translate-y-1/2 items-center justify-center text-foreground/75 transition-all duration-200 ease-out hover:scale-110 hover:text-foreground"
              >
                <ChevronLeft
                  className="size-6 drop-shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
                  aria-hidden="true"
                  strokeWidth={1.75}
                />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Ver fotos siguientes"
                className="absolute top-1/2 right-2 z-10 flex size-9 -translate-y-1/2 items-center justify-center text-foreground/75 transition-all duration-200 ease-out hover:scale-110 hover:text-foreground"
              >
                <ChevronRight
                  className="size-6 drop-shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
                  aria-hidden="true"
                  strokeWidth={1.75}
                />
              </button>
            </>
          ) : null}
        </div>
      </div>

      {/* Lightbox */}
      <Dialog.Root
        open={zoomed}
        onOpenChange={(open) => {
          setZoomed(open);
          if (!open) setMagnified(false);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 duration-300 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <Dialog.Content className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 duration-300 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 focus:outline-none sm:p-8">
            <Dialog.Title className="sr-only">{productName}</Dialog.Title>
            <Dialog.Description className="sr-only">
              Vista ampliada de las imágenes del producto
            </Dialog.Description>

            <div
              onClick={(event) => {
                setOrigin(pointerPercent(event));
                setMagnified((value) => !value);
              }}
              onMouseMove={(event) => {
                if (magnified) setOrigin(pointerPercent(event));
              }}
              className={cn(
                "relative flex h-full max-h-[85vh] w-full max-w-3xl items-center justify-center overflow-hidden",
                magnified ? "cursor-zoom-out" : "cursor-zoom-in",
              )}
            >
              <Image
                key={`zoom-${activeImg}`}
                src={active.url}
                alt={active.alt}
                fill
                sizes="(max-width: 768px) 100vw, 1024px"
                className="object-contain transition-transform duration-200 ease-out"
                style={{
                  transform: magnified ? "scale(2.2)" : "scale(1)",
                  transformOrigin: `${origin.x}% ${origin.y}%`,
                }}
              />
            </div>
            {/* Pista de uso del zoom */}
            <span className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
              {magnified ? "Clic para alejar" : "Clic en la imagen para acercar"}
            </span>

            {hasMany ? (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Imagen anterior"
                  className="absolute top-1/2 left-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
                >
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Imagen siguiente"
                  className="absolute top-1/2 right-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
                >
                  <ChevronRight className="size-5" aria-hidden="true" />
                </button>
                <span className="absolute bottom-5 rounded-full bg-white/10 px-3 py-1 text-xs text-white tabular-nums">
                  {activeImg + 1} / {images.length}
                </span>
              </>
            ) : null}

            <Dialog.Close
              aria-label="Cerrar"
              className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
