import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { ProductCard } from "./product-card";
import { Reveal } from "./reveal";

interface ProductGridProps {
  products: Product[];
  /** Cuántas tarjetas iniciales cargan su imagen con prioridad (LCP). El resto va lazy. */
  priorityCount?: number;
  className?: string;
}

/** Grilla responsive de productos: 2 columnas en móvil, 3 en tablet, 4 en escritorio. */
export function ProductGrid({
  products,
  priorityCount = 0,
  className,
}: ProductGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6",
        className,
      )}
    >
      {products.map((product, index) => (
        // Cada tarjeta se revela al entrar al viewport, con un ligero escalonado por columna.
        <Reveal key={product.id} delayMs={(index % 4) * 90}>
          <ProductCard product={product} priority={index < priorityCount} />
        </Reveal>
      ))}
    </div>
  );
}
