import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { ProductCard } from "./product-card";
import { Reveal } from "./reveal";

/** Densidad visual de la grilla (controlable desde la barra de herramientas). */
export type GridDensity = "compact" | "comfortable";

/** Clases de columnas y separación según la densidad elegida. */
const DENSITY: Record<GridDensity, string> = {
  compact: "grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6",
  comfortable:
    "grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-7",
};

/** Cuántas columnas tiene cada densidad (para escalonar el reveal por fila). */
const STAGGER_COLUMNS: Record<GridDensity, number> = {
  compact: 4,
  comfortable: 3,
};

interface ProductGridProps {
  products: Product[];
  /** Cuántas tarjetas iniciales cargan su imagen con prioridad (LCP). El resto va lazy. */
  priorityCount?: number;
  /** Densidad de la grilla. Por defecto, compacta (más columnas). */
  density?: GridDensity;
  className?: string;
}

/** Grilla responsive de productos; la densidad ajusta el número de columnas. */
export function ProductGrid({
  products,
  priorityCount = 0,
  density = "compact",
  className,
}: ProductGridProps) {
  const columns = STAGGER_COLUMNS[density];

  return (
    <div className={cn("grid", DENSITY[density], className)}>
      {products.map((product, index) => (
        // Cada tarjeta se revela al entrar al viewport, con un ligero escalonado por columna.
        <Reveal key={product.id} delayMs={(index % columns) * 80}>
          <ProductCard product={product} priority={index < priorityCount} />
        </Reveal>
      ))}
    </div>
  );
}
