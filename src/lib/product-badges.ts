import type { ProductBadge } from "@/types/product";

/** Etiqueta legible de cada badge de producto (tarjeta, ficha, admin). */
export const BADGE_LABELS: Record<ProductBadge, string> = {
  nuevo: "Nuevo",
  bestseller: "Más vendido",
  oferta: "Oferta",
};
