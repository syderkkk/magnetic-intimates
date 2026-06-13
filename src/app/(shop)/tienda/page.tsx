import type { Metadata } from "next";
import Link from "next/link";

import { ProductGrid } from "@/components/shop/product-grid";
import { getAllProducts } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Tienda",
  description:
    "Explora la colección de NUE INTIME: conjuntos, bodies, pijamas y lencería con diseño minimalista.",
  alternates: { canonical: "/tienda" },
};

interface TiendaPageProps {
  // En Next 16 los searchParams son asíncronos.
  searchParams: Promise<{ q?: string }>;
}

export default async function TiendaPage({ searchParams }: TiendaPageProps) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const normalized = query.toLowerCase();

  const all = getAllProducts();
  const products = normalized
    ? all.filter(
        (product) =>
          product.name.toLowerCase().includes(normalized) ||
          product.category.toLowerCase().includes(normalized),
      )
    : all;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Tienda
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {query
            ? `${products.length} ${products.length === 1 ? "resultado" : "resultados"} para “${query}”`
            : `${products.length} productos`}
        </p>
      </header>

      {products.length > 0 ? (
        <ProductGrid products={products} priorityCount={4} />
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <p className="text-lg font-medium">Sin resultados</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            No encontramos productos para “{query}”. Prueba con otra búsqueda.
          </p>
          <Link
            href="/tienda"
            className="mt-2 inline-flex items-center rounded-full border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Ver toda la tienda
          </Link>
        </div>
      )}
    </section>
  );
}
