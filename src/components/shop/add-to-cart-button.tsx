"use client";

import { Check, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import type { Product } from "@/types/product";

interface AddToCartButtonProps {
  product: Product;
  className?: string;
}

/**
 * Botón para agregar un producto al carrito.
 * Muestra confirmación breve ("Agregado") tras la acción.
 * NOTA: el precio aquí es referencial; el cobro se recalcula en el servidor.
 */
export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Limpia el temporizador si el componente se desmonta.
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleClick() {
    const primary = product.images[0];
    if (!primary) return;

    addItem({
      key: product.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      unitPriceCents: product.priceCents,
      image: primary.url,
      imageAlt: primary.alt,
    });

    setAdded(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
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
