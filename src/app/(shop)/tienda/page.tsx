import type { Metadata } from "next";
import Link from "next/link";

import { CollectionToolbar } from "@/components/shop/collection-toolbar";
import { ProductFilters } from "@/components/shop/product-filters";
import { ProductGrid } from "@/components/shop/product-grid";
import {
  applyQuery,
  filterProducts,
  getFacets,
  parseList,
  type SortValue,
} from "@/lib/data/filters";
import { getAllProducts } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Tienda",
  description:
    "Explora la colección de NUE INTIME: conjuntos, bodies, pijamas y lencería con diseño minimalista.",
  alternates: { canonical: "/tienda" },
};

interface ColeccionPageProps {
  searchParams: Promise<{
    q?: string;
    cat?: string;
    size?: string;
    color?: string;
    sort?: string;
    view?: string;
  }>;
}

export default async function ColeccionPage({
  searchParams,
}: ColeccionPageProps) {
  const sp = await searchParams;
  const query = (sp.q ?? "").trim();

  const selected = {
    categories: parseList(sp.cat),
    sizes: parseList(sp.size),
    colors: parseList(sp.color),
  };
  const sort = (sp.sort ?? "") as SortValue;
  const density = sp.view === "comfortable" ? "comfortable" : "compact";

  const all = getAllProducts();

  // Las facetas se calculan sobre el catálogo acotado solo por la búsqueda de
  // texto (no por las selecciones), para poder marcar/desmarcar con libertad y
  // que los conteos reflejen lo que hay disponible para esa búsqueda.
  const base = applyQuery(all, query);
  const facets = getFacets(base);

  // La búsqueda ya está aplicada en `base`; pasamos query vacía para no repetirla.
  const products = filterProducts(base, { ...selected, query: "", sort });

  const activeFilterCount =
    selected.categories.length + selected.sizes.length + selected.colors.length;

  const resultLabel = query
    ? `${products.length} ${products.length === 1 ? "resultado" : "resultados"} para "${query}"`
    : `${products.length} ${products.length === 1 ? "producto" : "productos"}`;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <header className="mb-8">
        <nav
          aria-label="Ruta de navegación"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Link href="/" className="transition-colors hover:text-foreground">
            Inicio
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-foreground">Tienda</span>
        </nav>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Tienda
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:hidden">
          {resultLabel}
        </p>
      </header>

      <div className="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-10 xl:grid-cols-[16rem_1fr]">
        {/* Sidebar de filtros (escritorio). En móvil se abre desde la barra. */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <ProductFilters facets={facets} selected={selected} />
          </div>
        </aside>

        <div>
          <CollectionToolbar
            resultLabel={resultLabel}
            facets={facets}
            selected={selected}
            sort={sort}
            density={density}
            activeFilterCount={activeFilterCount}
          />

          {products.length > 0 ? (
            <ProductGrid
              products={products}
              priorityCount={4}
              density={density}
              className="mt-8"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <p className="text-lg font-medium">Sin resultados</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                {query
                  ? `No encontramos productos para "${query}".`
                  : "No hay productos que coincidan con estos filtros."}
              </p>
              <Link
                href="/tienda"
                className="mt-2 inline-flex items-center rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-200 ease-out hover:border-foreground hover:bg-muted active:scale-[0.98]"
              >
                Ver toda la tienda
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
