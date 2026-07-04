"use client";

import { Check, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import type { CollectionFacets, FacetOption } from "@/lib/data/filters";
import { cn } from "@/lib/utils";

/** Ruta base de la colección (donde viven los filtros). */
const BASE_PATH = "/tienda";

/** Selección activa por faceta (valores en slug). */
interface SelectedFilters {
  categories: string[];
  sizes: string[];
  colors: string[];
}

interface ProductFiltersProps {
  facets: CollectionFacets;
  selected: SelectedFilters;
  className?: string;
  /** Se invoca tras navegar; útil para cerrar el panel lateral en móvil. */
  onNavigate?: () => void;
}

/**
 * Panel de filtros del catálogo (categoría, talla, color).
 *
 * Las opciones y sus conteos llegan ya derivados del catálogo (`facets`), así
 * que el panel no conoce ninguna lista hardcodeada: al crecer el catálogo,
 * crecen los filtros. El estado vive en la URL (deep-link y compartible); cada
 * cambio navega preservando el resto de parámetros (búsqueda, orden, vista).
 * Se reutiliza tal cual en el sidebar de escritorio y en el panel móvil.
 */
export function ProductFilters({
  facets,
  selected,
  className,
  onNavigate,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCount =
    selected.categories.length + selected.sizes.length + selected.colors.length;

  function navigate(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const qs = params.toString();
    router.push(qs ? `${BASE_PATH}?${qs}` : BASE_PATH, { scroll: false });
    onNavigate?.();
  }

  function toggle(key: "cat" | "size" | "color", value: string) {
    navigate((params) => {
      const set = new Set(
        params.get(key)?.split(",").filter(Boolean) ?? [],
      );
      if (set.has(value)) set.delete(value);
      else set.add(value);
      if (set.size) params.set(key, [...set].join(","));
      else params.delete(key);
    });
  }

  function clearAll() {
    navigate((params) => {
      params.delete("cat");
      params.delete("size");
      params.delete("color");
    });
  }

  return (
    <div className={cn("text-sm", className)}>
      <div className="flex items-center justify-between pb-1">
        <h2 className="font-display text-sm font-semibold tracking-wide uppercase">
          Filtros
        </h2>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Limpiar ({activeCount})
          </button>
        ) : null}
      </div>

      <FilterSection title="Categoría">
        <div className="space-y-0.5">
          {facets.categories.map((option) => (
            <CheckboxRow
              key={option.value}
              option={option}
              checked={selected.categories.includes(option.value)}
              onToggle={() => toggle("cat", option.value)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Talla">
        <div className="flex flex-wrap gap-2">
          {facets.sizes.map((option) => (
            <SizeChip
              key={option.value}
              option={option}
              checked={selected.sizes.includes(option.value)}
              onToggle={() => toggle("size", option.value)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Color">
        <div className="space-y-0.5">
          {facets.colors.map((option) => (
            <ColorRow
              key={option.value}
              option={option}
              checked={selected.colors.includes(option.value)}
              onToggle={() => toggle("color", option.value)}
            />
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

/** Sección colapsable con animación de altura (estética iOS). */
function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t py-4 first:border-t-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="group flex w-full items-center justify-between text-left"
      >
        <span className="text-xs font-semibold tracking-[0.12em] text-foreground uppercase">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-300 ease-out group-hover:text-foreground",
            open ? "rotate-180" : "rotate-0",
          )}
          aria-hidden="true"
        />
      </button>
      {/* El truco grid-rows 1fr/0fr anima la altura sin conocerla de antemano. */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        {/* -mx-2 + px-2 EN ESTE MISMO div (mismo truco que usan las filas de
            abajo): se cancelan entre sí para el contenido, que sigue
            arrancando en el mismo punto de siempre (alineado con el título
            de la sección) — pero "overflow-hidden" recorta según la CAJA CON
            MARGEN (más ancha), no la de adentro, así el límite de recorte
            queda 8px más generoso a cada lado: justo el margen que las filas
            ya usan para su halo/fondo de hover. Un padding positivo solo
            (sin el margen negativo) desplazaría el contenido 8px y lo
            desalinearía del título.
            "overflow-hidden" a secas (no solo -y): si el eje Y queda oculto y
            el X se deja "visible", el navegador lo vuelve "auto" solo y
            aparece una barra de scroll horizontal — hay que ocultar ambos. */}
        <div className="-mx-2 overflow-hidden px-2">
          <div className="pt-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** Fila de filtro con casilla (categoría). */
function CheckboxRow({
  option,
  checked,
  onToggle,
}: {
  option: FacetOption;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="group -mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors select-none hover:bg-muted has-focus-visible:bg-muted">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="sr-only"
      />
      <span
        className={cn(
          "flex size-4.5 shrink-0 items-center justify-center rounded-[5px] border transition-all duration-200",
          checked
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-background group-hover:border-foreground/40",
        )}
      >
        {checked ? <Check className="size-3" strokeWidth={3} /> : null}
      </span>
      <span
        className={cn(
          "flex-1 truncate transition-colors",
          checked
            ? "text-foreground"
            : "text-foreground/80 group-hover:text-foreground",
        )}
      >
        {option.label}
      </span>
      <span className="text-xs text-muted-foreground tabular-nums">
        {option.count}
      </span>
    </label>
  );
}

/** Píldora de talla (selección múltiple). */
function SizeChip({
  option,
  checked,
  onToggle,
}: {
  option: FacetOption;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      title={`${option.count} ${option.count === 1 ? "producto" : "productos"}`}
      className={cn(
        "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 select-none active:scale-95 has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-1",
        checked
          ? "border-foreground bg-foreground text-background"
          : "border-border text-foreground/80 hover:border-foreground hover:text-foreground",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="sr-only"
      />
      {option.label}
    </label>
  );
}

/** Fila de color con swatch (selección múltiple). */
function ColorRow({
  option,
  checked,
  onToggle,
}: {
  option: FacetOption;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="group -mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors select-none hover:bg-muted has-focus-visible:bg-muted">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="sr-only"
      />
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full transition-all duration-200",
          checked
            ? "ring-2 ring-foreground ring-offset-1"
            : "ring-1 ring-black/10 group-hover:ring-black/25",
        )}
        style={{ backgroundColor: option.swatch }}
      >
        {/* mix-blend-difference mantiene el check visible sobre cualquier color. */}
        {checked ? (
          <Check
            className="size-3 text-white mix-blend-difference"
            strokeWidth={3}
          />
        ) : null}
      </span>
      <span
        className={cn(
          "flex-1 truncate transition-colors",
          checked
            ? "text-foreground"
            : "text-foreground/80 group-hover:text-foreground",
        )}
      >
        {option.label}
      </span>
      <span className="text-xs text-muted-foreground tabular-nums">
        {option.count}
      </span>
    </label>
  );
}
