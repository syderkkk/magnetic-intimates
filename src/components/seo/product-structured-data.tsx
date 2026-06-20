import { siteConfig } from "@/config/site";
import { slugify } from "@/lib/data/filters";
import { centsToSoles } from "@/lib/money";
import { totalStock } from "@/lib/product-variants";
import type { Product } from "@/types/product";

/**
 * Datos estructurados JSON-LD de la ficha de producto (CLAUDE.md §7.9):
 * `Product` (precio, disponibilidad, imágenes, marca) y `BreadcrumbList`.
 * Habilitan resultados enriquecidos en Google (precio y stock en el buscador).
 */
export function ProductStructuredData({ product }: { product: Product }) {
  const url = `${siteConfig.url}/producto/${product.slug}`;
  const inStock = totalStock(product) > 0;

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? siteConfig.description,
    image: product.images.map((image) => image.url),
    category: product.category,
    brand: { "@type": "Brand", name: siteConfig.name },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "PEN",
      price: centsToSoles(product.priceCents).toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tienda",
        item: `${siteConfig.url}/tienda`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.category,
        item: `${siteConfig.url}/tienda?cat=${slugify(product.category)}`,
      },
      { "@type": "ListItem", position: 4, name: product.name, item: url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Contenido generado por nosotros (no entrada de usuario): seguro.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
    </>
  );
}
