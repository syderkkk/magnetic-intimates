import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductDetail } from "@/components/shop/product-detail";
import { ProductGrid } from "@/components/shop/product-grid";
import { Reveal } from "@/components/shop/reveal";
import { getAllProducts, getProductBySlug } from "@/lib/data/products";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.name,
    description:
      product.description ??
      `Compra ${product.name} en NUE INTIME. Diseño minimalista, envíos a todo el Perú.`,
    alternates: { canonical: `/producto/${slug}` },
    openGraph: {
      images: product.images[0]
        ? [{ url: product.images[0].url, alt: product.images[0].alt }]
        : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getAllProducts()
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Breadcrumb */}
      <nav
        aria-label="Ruta de navegación"
        className="mb-8 flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Link href="/" className="hover:text-foreground transition-colors">
          Inicio
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/tienda" className="hover:text-foreground transition-colors">
          Tienda
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-foreground truncate max-w-[160px]">{product.name}</span>
      </nav>

      {/* Detalle principal */}
      <ProductDetail product={product} />

      {/* Productos relacionados */}
      {related.length > 0 && (
        <section className="mt-24">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              También te puede gustar
            </h2>
          </Reveal>
          <ProductGrid products={related} className="mt-8" />
        </section>
      )}
    </div>
  );
}
