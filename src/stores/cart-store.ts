import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Cents } from "@/lib/money";

/**
 * Estado del carrito (solo UI/cliente).
 * Los precios se guardan en céntimos (enteros) para sumar sin errores de
 * punto flotante. En el checkout, el precio y el total SIEMPRE se recalculan
 * en el servidor (CLAUDE.md §7.1): este estado es únicamente para la interfaz.
 */
export interface CartItem {
  /** Clave única de la línea (producto + variante a futuro). */
  key: string;
  productId: string;
  slug: string;
  name: string;
  /** Etiqueta de variante (talla/color), para mostrar. Opcional por ahora. */
  variantLabel?: string;
  /** Precio unitario en céntimos. */
  unitPriceCents: Cents;
  image: string;
  imageAlt: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((line) => line.key === item.key);
          if (existing) {
            return {
              items: state.items.map((line) =>
                line.key === item.key
                  ? { ...line, quantity: line.quantity + quantity }
                  : line,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        }),

      removeItem: (key) =>
        set((state) => ({
          items: state.items.filter((line) => line.key !== key),
        })),

      updateQuantity: (key, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((line) => line.key !== key)
              : state.items.map((line) =>
                  line.key === key ? { ...line, quantity } : line,
                ),
        })),

      clear: () => set({ items: [] }),
    }),
    { name: "nue-cart" },
  ),
);

/** Cantidad total de unidades en el carrito. */
export function useCartCount(): number {
  return useCartStore((state) =>
    state.items.reduce((total, line) => total + line.quantity, 0),
  );
}

/** Subtotal en céntimos (suma exacta de precio × cantidad de cada línea). */
export function useCartSubtotal(): Cents {
  return useCartStore((state) =>
    state.items.reduce(
      (sum, line) => sum + line.unitPriceCents * line.quantity,
      0,
    ),
  );
}
