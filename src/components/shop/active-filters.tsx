"use client";

import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import type { CollectionFacets, FacetOption } from "@/lib/data/filters";

const BASE_PATH = "/tienda";

interface Selected {
  categories: string[];
  sizes: string[];
  colors: string[];
}

interface ActiveFiltersProps {
  facets: CollectionFacets;
  selected: Selected;
  query: string;
}

/**
 * Resumen de filtros activos como chips removibles (categoría, talla, color) +
 * la búsqueda actual. Cada chip quita su valor de la URL; "Limpiar todo" quita
 * filtros y búsqueda (conserva orden y vista).
 */
export function ActiveFilters({ facets, selected, query }: ActiveFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const qs = params.toString();
    router.push(qs ? `${BASE_PATH}?${qs}` : BASE_PATH, { scroll: false });
  }

  function removeValue(key: string, value: string) {
    navigate((params) => {
      const set = new Set(params.get(key)?.split(",").filter(Boolean) ?? []);
      set.delete(value);
      if (set.size) params.set(key, [...set].join(","));
      else params.delete(key);
    });
  }

  const labelOf = (options: FacetOption[], value: string) =>
    options.find((o) => o.value === value)?.label ?? value;

  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  if (query) {
    chips.push({
      key: "q",
      label: `“${query}”`,
      onRemove: () => navigate((p) => p.delete("q")),
    });
  }
  for (const value of selected.categories) {
    chips.push({
      key: `cat-${value}`,
      label: labelOf(facets.categories, value),
      onRemove: () => removeValue("cat", value),
    });
  }
  for (const value of selected.sizes) {
    chips.push({
      key: `size-${value}`,
      label: `Talla ${labelOf(facets.sizes, value)}`,
      onRemove: () => removeValue("size", value),
    });
  }
  for (const value of selected.colors) {
    chips.push({
      key: `color-${value}`,
      label: labelOf(facets.colors, value),
      onRemove: () => removeValue("color", value),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          aria-label={`Quitar filtro ${chip.label}`}
          className="group inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium transition-colors hover:border-foreground active:scale-[0.97]"
        >
          {chip.label}
          <X
            className="size-3 text-muted-foreground transition-colors group-hover:text-foreground"
            aria-hidden="true"
          />
        </button>
      ))}
      {chips.length > 1 ? (
        <button
          type="button"
          onClick={() =>
            navigate((p) => {
              p.delete("q");
              p.delete("cat");
              p.delete("size");
              p.delete("color");
            })
          }
          className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Limpiar todo
        </button>
      ) : null}
    </div>
  );
}
