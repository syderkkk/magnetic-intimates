import { cn } from "@/lib/utils";
import { BADGE_LABELS } from "@/lib/product-badges";
import type { ProductBadge } from "@/types/product";

interface ProductBadgeChipProps {
  badge: ProductBadge;
  className?: string;
}

/**
 * Chip de estado del producto ("Nuevo", "Oferta", "Más vendido"): nude de
 * fondo + texto negro (docs/06-identidad-magnetic.md §5.7 — antes era negro
 * sobre blanco, igual que cualquier badge genérico y sin color de marca).
 */
export function ProductBadgeChip({ badge, className }: ProductBadgeChipProps) {
  return (
    <span
      className={cn(
        "rounded-full bg-accent px-2.5 py-1 text-[10px] font-medium tracking-wider text-foreground uppercase",
        className,
      )}
    >
      {BADGE_LABELS[badge]}
    </span>
  );
}
