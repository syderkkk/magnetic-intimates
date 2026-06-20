"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  /** Nombre del producto (para la etiqueta accesible). */
  productName: string;
  className?: string;
}

/**
 * Botón de "favorito" sobre la tarjeta de producto.
 *
 * Por ahora el estado es local (solo visual): permite la interacción y el hover
 * que pide el diseño, pero NO persiste. La persistencia real (lista de deseos)
 * depende de tener cuentas de cliente.
 * TODO: confirmar con cliente — guardar favoritos requiere el módulo de cuentas
 * (CLAUDE.md §1.1, decisión #3). Conectar entonces a la lista de deseos del usuario.
 */
export function FavoriteButton({ productName, className }: FavoriteButtonProps) {
  const [favorite, setFavorite] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setFavorite((value) => !value)}
      aria-pressed={favorite}
      aria-label={
        favorite
          ? `Quitar ${productName} de favoritos`
          : `Agregar ${productName} a favoritos`
      }
      className={cn(
        "group/fav flex size-9 items-center justify-center rounded-full bg-background/70 text-foreground shadow-sm backdrop-blur-sm transition-all duration-300 ease-out hover:scale-105 hover:bg-background active:scale-95",
        className,
      )}
    >
      <Heart
        className={cn(
          "size-4 transition-all duration-300 ease-out",
          favorite
            ? "scale-110 fill-foreground"
            : "fill-transparent group-hover/fav:scale-110",
        )}
        aria-hidden="true"
      />
    </button>
  );
}
