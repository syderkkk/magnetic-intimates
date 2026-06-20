import { discountPercent } from "@/lib/money";
import type { Product } from "@/types/product";

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  FACETAS Y FILTRADO DEL CATÁLOGO
 *  Toda la lógica de filtros, conteos y orden vive aquí (capa de datos), no en
 *  los componentes. Las facetas se DERIVAN del catálogo: al agregar productos,
 *  categorías, tallas o colores nuevos, los filtros se actualizan solos.
 *
 *  Pensado para crecer: cuando exista Prisma, estas funciones se reimplementan
 *  como consultas (p. ej. `groupBy` para los conteos) manteniendo las mismas
 *  firmas, y la UI no cambia. Igual de listo para colecciones y campañas:
 *  basta con añadir un campo al `Product` (p. ej. `collection`) y una faceta
 *  más aquí; el panel de filtros la mostrará sin tocar otra cosa.
 * ─────────────────────────────────────────────────────────────────────────
 */

/** Una opción de filtro con su conteo de productos. */
export interface FacetOption {
  /** Valor estable para la URL (slug, sin acentos ni espacios). */
  value: string;
  /** Etiqueta visible. */
  label: string;
  /** Cuántos productos del catálogo base coinciden. */
  count: number;
  /** Color (hex) para el swatch; solo presente en la faceta de color. */
  swatch?: string;
}

/** Conjunto de facetas disponibles para el panel de filtros. */
export interface CollectionFacets {
  categories: FacetOption[];
  sizes: FacetOption[];
  colors: FacetOption[];
}

/** Selección activa de filtros (derivada de la URL). */
export interface CollectionCriteria {
  categories: string[];
  sizes: string[];
  colors: string[];
  query: string;
  sort: SortValue;
}

export type SortValue = "" | "price-asc" | "price-desc" | "discount";

export interface SortOption {
  value: SortValue;
  label: string;
}

/** Opciones de orden ofrecidas en la barra de herramientas. */
export const SORT_OPTIONS: SortOption[] = [
  { value: "", label: "Relevancia" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "discount", label: "Mayor descuento" },
];

/** Orden canónico de tallas; las desconocidas se ordenan al final (alfabético). */
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "Único"];

/**
 * Nombres legibles para los colores de marca (hex → nombre). Extensible: al
 * añadir un color nuevo, basta con registrarlo aquí. Cuando exista la tabla
 * `colors` (CLAUDE.md §4), este mapa se sustituye por esos datos.
 */
const COLOR_NAMES: Record<string, string> = {
  "#0A0A0A": "Negro",
  "#1B1B1B": "Negro",
  "#13131A": "Negro noche",
  "#E7DCD3": "Nude",
  "#EDE7E0": "Perla",
  "#D8C7B5": "Arena",
  "#C9A7A1": "Rosa palo",
  "#7A2E3A": "Vino",
  "#5B5B66": "Gris",
  "#8A8A8A": "Gris",
};

/** Convierte un texto a un slug estable para URLs (sin acentos ni espacios). */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // elimina los diacríticos (acentos)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Devuelve el nombre legible de un color a partir de su hex (o el hex si no hay nombre). */
export function getColorName(hex: string): string {
  return COLOR_NAMES[hex.toUpperCase()] ?? hex;
}

/** Separa un parámetro de URL con valores separados por coma en una lista limpia. */
export function parseList(value?: string): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Categorías presentes en el catálogo base, con su conteo. */
function getCategoryFacets(products: Product[]): FacetOption[] {
  const counts = new Map<string, { label: string; count: number }>();
  for (const product of products) {
    const value = slugify(product.category);
    const entry = counts.get(value);
    if (entry) entry.count += 1;
    else counts.set(value, { label: product.category, count: 1 });
  }
  return [...counts.entries()]
    .map(([value, { label, count }]) => ({ value, label, count }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));
}

/** Tallas presentes en el catálogo base, en orden canónico, con su conteo. */
function getSizeFacets(products: Product[]): FacetOption[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    for (const size of product.sizes ?? []) {
      counts.set(size, (counts.get(size) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ value: slugify(label), label, count }))
    .sort((a, b) => {
      const ia = SIZE_ORDER.indexOf(a.label);
      const ib = SIZE_ORDER.indexOf(b.label);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.label.localeCompare(b.label, "es");
    });
}

/** Colores presentes en el catálogo base, agrupados por nombre, con su conteo. */
function getColorFacets(products: Product[]): FacetOption[] {
  const map = new Map<string, { label: string; swatch: string; count: number }>();
  for (const product of products) {
    // Evita contar el mismo color dos veces para un producto con varios hex iguales.
    const seen = new Set<string>();
    for (const hex of product.colors ?? []) {
      const label = getColorName(hex);
      const value = slugify(label);
      if (seen.has(value)) continue;
      seen.add(value);
      const entry = map.get(value);
      if (entry) entry.count += 1;
      else map.set(value, { label, swatch: hex, count: 1 });
    }
  }
  return [...map.entries()]
    .map(([value, { label, swatch, count }]) => ({ value, label, swatch, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "es"));
}

/** Construye todas las facetas a partir de un conjunto de productos. */
export function getFacets(products: Product[]): CollectionFacets {
  return {
    categories: getCategoryFacets(products),
    sizes: getSizeFacets(products),
    colors: getColorFacets(products),
  };
}

/** Descuento (0–100) de un producto, o 0 si no está en oferta. */
function discountOf(product: Product): number {
  return product.compareAtPriceCents
    ? discountPercent(product.compareAtPriceCents, product.priceCents)
    : 0;
}

/** Aplica solo la búsqueda de texto (nombre o categoría). */
export function applyQuery(products: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q),
  );
}

/** Ordena (sin mutar) según el criterio elegido. */
function sortProducts(products: Product[], sort: SortValue): Product[] {
  switch (sort) {
    case "price-asc":
      return [...products].sort((a, b) => a.priceCents - b.priceCents);
    case "price-desc":
      return [...products].sort((a, b) => b.priceCents - a.priceCents);
    case "discount":
      return [...products].sort((a, b) => discountOf(b) - discountOf(a));
    default:
      return products;
  }
}

/**
 * Filtra y ordena el catálogo según los criterios activos. Las categorías,
 * tallas y colores se combinan con lógica OR dentro de cada faceta y AND entre
 * facetas (comportamiento estándar de e-commerce).
 */
export function filterProducts(
  products: Product[],
  criteria: CollectionCriteria,
): Product[] {
  let result = applyQuery(products, criteria.query);

  if (criteria.categories.length) {
    result = result.filter((product) =>
      criteria.categories.includes(slugify(product.category)),
    );
  }
  if (criteria.sizes.length) {
    result = result.filter((product) =>
      (product.sizes ?? []).some((size) =>
        criteria.sizes.includes(slugify(size)),
      ),
    );
  }
  if (criteria.colors.length) {
    result = result.filter((product) =>
      (product.colors ?? []).some((hex) =>
        criteria.colors.includes(slugify(getColorName(hex))),
      ),
    );
  }

  return sortProducts(result, criteria.sort);
}
