"use client";

import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { formatPrice } from "@/lib/money";
import {
  cartImageSrc,
  useCartCount,
  useCartStore,
  useCartSubtotal,
} from "@/stores/cart-store";

/**
 * Carrito de compras en un panel lateral (Sheet).
 * Incluye su propio botón disparador con el contador de unidades en vivo.
 * El total se muestra solo como referencia: en el checkout se recalcula en el
 * servidor (CLAUDE.md §7.1).
 */
export function CartSheet() {
  const [open, setOpen] = useState(false);
  const mounted = useHasMounted();
  const count = useCartCount();
  const subtotal = useCartSubtotal();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9 rounded-full"
          aria-label={`Abrir carrito${mounted && count > 0 ? `, ${count} artículos` : ""}`}
        >
          <ShoppingBag className="size-5" />
          {/* El contador solo se renderiza tras montar para evitar desajuste de hidratación. */}
          {mounted && count > 0 ? (
            <span
              className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground tabular-nums"
              aria-hidden="true"
            >
              {count > 99 ? "99+" : count}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4 pr-12">
          <SheetTitle className="font-display text-base tracking-wide">
            Tu carrito
            {mounted && count > 0 ? (
              <span className="ml-1.5 font-sans text-sm font-normal text-muted-foreground tabular-nums">
                · {count}
              </span>
            ) : null}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Productos agregados a tu carrito de compras
          </SheetDescription>
        </SheetHeader>

        {!mounted ? null : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-muted">
              <ShoppingBag
                className="size-7 text-muted-foreground"
                aria-hidden="true"
              />
            </span>
            <div className="space-y-1">
              <p className="font-medium">Tu carrito está vacío</p>
              <p className="text-sm text-muted-foreground">
                Explora la colección y encuentra tu próxima prenda favorita.
              </p>
            </div>
            <Button
              asChild
              className="mt-2 rounded-full px-6"
              onClick={() => setOpen(false)}
            >
              <Link href="/tienda">Ver la tienda</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y overflow-y-auto">
              {items.map((line) => {
                const atMin = line.quantity <= 1;
                return (
                  <li
                    key={line.key}
                    className="flex gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
                  >
                    <Link
                      href={`/producto/${line.slug}`}
                      onClick={() => setOpen(false)}
                      className="relative aspect-4/5 w-20 shrink-0 overflow-hidden rounded-md bg-muted"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      <Image
                        src={cartImageSrc(line.image)}
                        alt={line.imageAlt}
                        fill
                        sizes="80px"
                        className="object-cover transition-transform duration-300 ease-out hover:scale-105"
                      />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            <Link
                              href={`/producto/${line.slug}`}
                              onClick={() => setOpen(false)}
                              className="underline-offset-4 transition-colors hover:underline"
                            >
                              {line.name}
                            </Link>
                          </p>
                          {line.variantLabel ? (
                            <p className="text-xs text-muted-foreground">
                              {line.variantLabel}
                            </p>
                          ) : null}
                          <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                            {formatPrice(line.unitPriceCents)} c/u
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(line.key)}
                          className="-m-1 rounded-full p-1 text-muted-foreground transition-colors hover:text-destructive"
                          aria-label={`Quitar ${line.name} del carrito`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                        {/* Selector de cantidad */}
                        <div className="flex items-center rounded-full border">
                          <button
                            type="button"
                            disabled={atMin}
                            onClick={() =>
                              updateQuantity(line.key, line.quantity - 1)
                            }
                            className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                            aria-label="Reducir cantidad"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-7 text-center text-sm tabular-nums">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(line.key, line.quantity + 1)
                            }
                            className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>

                        <span className="text-sm font-medium tabular-nums">
                          {formatPrice(line.unitPriceCents * line.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <SheetFooter className="gap-3 border-t px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tabular-nums">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="-mt-1 text-xs text-muted-foreground">
                Envío e impuestos calculados al finalizar la compra.
              </p>

              <Button
                asChild
                className="h-12 w-full rounded-full text-sm"
              >
                <Link href="/checkout" onClick={() => setOpen(false)}>
                  Finalizar compra
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  Seguir comprando
                </button>
                <button
                  type="button"
                  onClick={clear}
                  className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-destructive hover:underline"
                >
                  Vaciar carrito
                </button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
