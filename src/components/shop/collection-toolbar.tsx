"use client";

import { Grid2x2, Grid3x3, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { CollectionFacets } from "@/lib/data/filters";
import { SORT_OPTIONS } from "@/lib/data/filters";
import { cn } from "@/lib/utils";
import type { GridDensity } from "./product-grid";
import { ProductFilters } from "./product-filters";

const BASE_PATH = "/tienda";

interface SelectedFilters {
  categories: string[];
  sizes: string[];
  colors: string[];
}

interface CollectionToolbarProps {
  resultLabel: string;
  facets: CollectionFacets;
  selected: SelectedFilters;
  sort: string;
  density: GridDensity;
  /** Total de filtros activos (para el badge del botón en móvil). */
  activeFilterCount: number;
}

/**
 * Barra de herramientas sobre la grilla: conteo de resultados, orden, densidad
 * de la grilla y acceso a los filtros en móvil (panel lateral). El orden y la
 * densidad viven en la URL para que la vista sea compartible.
 */
export function CollectionToolbar({
  resultLabel,
  facets,
  selected,
  sort,
  density,
  activeFilterCount,
}: CollectionToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  function pushWith(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const qs = params.toString();
    router.push(qs ? `${BASE_PATH}?${qs}` : BASE_PATH, { scroll: false });
  }

  function setSort(value: string) {
    pushWith((params) => {
      if (value) params.set("sort", value);
      else params.delete("sort");
    });
  }

  function setDensity(value: GridDensity) {
    pushWith((params) => {
      // "compact" es el valor por defecto: se omite para mantener la URL limpia.
      if (value === "comfortable") params.set("view", value);
      else params.delete("view");
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b pb-4">
      <div className="flex items-center gap-3">
        {/* Filtros en móvil: abren el panel lateral con el mismo componente. */}
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ease-out hover:border-foreground hover:bg-muted active:scale-[0.98] lg:hidden"
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Filtros
              {activeFilterCount > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[11px] font-medium text-background tabular-nums">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[88%] max-w-sm gap-0 overflow-y-auto"
          >
            <SheetHeader className="border-b px-5 py-4">
              <SheetTitle className="font-display text-base tracking-wide">
                Filtros
              </SheetTitle>
              <SheetDescription className="sr-only">
                Filtra los productos por categoría, talla y color
              </SheetDescription>
            </SheetHeader>
            <div className="px-5 py-4">
              <ProductFilters
                facets={facets}
                selected={selected}
                onNavigate={() => setFiltersOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>

        <p className="hidden text-sm text-muted-foreground sm:block">
          {resultLabel}
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <label
          htmlFor="sort-select"
          className="hidden text-sm whitespace-nowrap text-muted-foreground sm:block"
        >
          Ordenar
        </label>
        <select
          id="sort-select"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          aria-label="Ordenar productos"
          className="cursor-pointer rounded-full border border-border bg-background px-3.5 py-2 text-sm transition-colors hover:border-foreground focus:ring-2 focus:ring-ring focus:outline-none"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Densidad de la grilla (solo escritorio: en móvil siempre es de 1-2 columnas). */}
        <div
          className="hidden items-center rounded-full border p-0.5 lg:flex"
          role="group"
          aria-label="Densidad de la grilla"
        >
          <DensityButton
            active={density === "comfortable"}
            onClick={() => setDensity("comfortable")}
            label="Vista amplia"
          >
            <Grid2x2 className="size-4" aria-hidden="true" />
          </DensityButton>
          <DensityButton
            active={density === "compact"}
            onClick={() => setDensity("compact")}
            label="Vista compacta"
          >
            <Grid3x3 className="size-4" aria-hidden="true" />
          </DensityButton>
        </div>
      </div>
    </div>
  );
}

function DensityButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={cn(
        "flex size-8 items-center justify-center rounded-full transition-colors duration-200",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
