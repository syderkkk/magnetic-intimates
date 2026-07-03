"use client";

import { Check, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { getVariants } from "@/lib/product-variants";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import type { Product } from "@/types/product";

interface AddToCartButtonProps {
  product: Product;
  className?: string;
}

/**
 * Botón de "agregar rápido" (sin elegir variante) — solo se usa cuando el
 * producto no tiene tallas ni colores, así que existe una única variante.
 * Muestra confirmación breve ("Agregado") tras la acción.
 * NOTA: el precio aquí es referencial; el cobro se recalcula en el servidor.
 */
export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const variant = getVariants(product)[0];

  useEffect(() => {
    // Limpia el temporizador si el componente se desmonta.
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleClick() {
    if (!variant) return;
    const primary = product.images[0];

    addItem({
      key: variant.id,
      variantId: variant.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      unitPriceCents: product.priceCents,
      image: primary?.url ?? "/placeholder.svg",
      imageAlt: primary?.alt ?? product.name,
    });

    setAdded(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={!variant}
      aria-label={`Agregar ${product.name} al carrito`}
      className={cn("h-10 w-full rounded-full text-xs font-medium", className)}
    >
      {added ? (
        <>
          <Check className="size-4" aria-hidden="true" />
          Agregado
        </>
      ) : (
        <>
          <Plus className="size-4" aria-hidden="true" />
          Agregar
        </>
      )}
    </Button>
  );
}
