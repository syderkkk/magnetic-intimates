"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/product";

interface ProductCardMediaProps {
  images: ProductImage[];
  /** Carga prioritaria (solo en las primeras tarjetas visibles, LCP). */
  priority?: boolean;
}

/**
 * Foto(s) de la tarjeta de producto. Si el producto tiene más de una imagen,
 * aparecen flechas para recorrerlas sin entrar a la ficha — mismo lenguaje
 * visual que el carrusel de la ficha de detalle (sin fondo circular, solo el
 * trazo). Reveladas al pasar el cursor en escritorio; siempre visibles en
 * táctil (no hay hover real). Aislado en su propio componente cliente para
 * que el resto de la tarjeta (precio, link) siga siendo Server Component.
 */
export function ProductCardMedia({ images, priority = false }: ProductCardMediaProps) {
  const [index, setIndex] = useState(0);
  const hasMany = images.length > 1;

  if (images.length === 0) return null;

  function go(event: React.MouseEvent, delta: number) {
    // Evita que el clic dispare el link de toda la tarjeta (stretched link).
    event.preventDefault();
    event.stopPropagation();
    setIndex((current) => (current + delta + images.length) % images.length);
  }

  return (
    <>
      {/* Las N fotos van TODAS montadas desde el inicio (opacidad, no
          desmontaje) — si solo se montaba la foto activa, la próxima foto
          recién empezaba a pedirse al navegador al hacer clic en la flecha,
          y se veía un parpadeo en blanco mientras cargaba. Montadas todas
          de una, el navegador las precarga apenas la tarjeta entra en
          pantalla (lazy load normal), y cambiar de foto es instantáneo. */}
      {images.map((img, i) => (
        <Image
          key={img.url}
          src={img.url}
          alt={img.alt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority && i === 0}
          className={cn(
            "object-cover transition-[opacity,transform] duration-300 ease-out group-hover/card:scale-[1.04]",
            i === index ? "opacity-100" : "opacity-0",
          )}
        />
      ))}

      {hasMany ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between px-1 opacity-0 transition-opacity duration-200 [@media(hover:hover)]:group-hover/card:opacity-100 [@media(hover:none)]:opacity-100">
          <button
            type="button"
            onClick={(event) => go(event, -1)}
            aria-label="Ver foto anterior"
            className="pointer-events-auto flex size-7 items-center justify-center text-foreground/75 transition-all duration-200 ease-out hover:scale-110 hover:text-foreground"
          >
            <ChevronLeft
              className="size-5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            onClick={(event) => go(event, 1)}
            aria-label="Ver foto siguiente"
            className="pointer-events-auto flex size-7 items-center justify-center text-foreground/75 transition-all duration-200 ease-out hover:scale-110 hover:text-foreground"
          >
            <ChevronRight
              className="size-5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </button>
        </div>
      ) : null}
    </>
  );
}
