"use client";

import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

const CATEGORIES = [
  { label: "Todos", value: "" },
  { label: "Conjuntos", value: "conjuntos" },
  { label: "Bodies", value: "bodies" },
  { label: "Pijamas", value: "pijamas" },
  { label: "Lencería", value: "lencería" },
  { label: "Accesorios", value: "accesorios" },
];

const SORT_OPTIONS = [
  { label: "Relevancia", value: "" },
  { label: "Precio: menor a mayor", value: "price-asc" },
  { label: "Precio: mayor a menor", value: "price-desc" },
];

interface FilterBarProps {
  currentCat: string;
  currentSort: string;
}

export function FilterBar({ currentCat, currentSort }: FilterBarProps) {
  const router = useRouter();

  function navigate(cat: string, sort: string) {
    const params = new URLSearchParams();
    if (cat) params.set("cat", cat);
    if (sort) params.set("sort", sort);
    const qs = params.toString();
    router.push(qs ? `/tienda?${qs}` : "/tienda", { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b mb-8">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
        {CATEGORIES.map(({ label, value }) => (
          <button
            key={label}
            type="button"
            onClick={() => navigate(value, currentSort)}
            aria-pressed={currentCat === value}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
              currentCat === value
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 shrink-0">
        <label htmlFor="sort-select" className="text-sm text-muted-foreground whitespace-nowrap">
          Ordenar:
        </label>
        <select
          id="sort-select"
          value={currentSort}
          onChange={(e) => navigate(currentCat, e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {SORT_OPTIONS.map(({ label, value }) => (
            <option key={label} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
