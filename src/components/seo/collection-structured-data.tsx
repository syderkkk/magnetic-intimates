import { siteConfig } from "@/config/site";
import type { Product } from "@/types/product";

/**
 * JSON-LD de la tienda (CLAUDE.md §7.9): `ItemList` con los productos visibles
 * y `BreadcrumbList`. Ayuda a que Google entienda el listado.
 */
export function CollectionStructuredData({
  products,
}: {
  products: Product[];
}) {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.slice(0, 24).map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteConfig.url}/producto/${product.slug}`,
      name: product.name,
    })),
  };

  const breadcrumb = {
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
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
}
