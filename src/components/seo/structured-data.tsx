import { siteConfig } from "@/config/site";

/**
 * Datos estructurados JSON-LD globales (SEO técnico).
 * Declara la Organización y el sitio web (WebSite) para que los buscadores
 * entiendan la marca y habiliten el cuadro de búsqueda en resultados.
 * Los datos de `Product` se añadirán en la ficha de producto (fase v0.2).
 */
export function StructuredData() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/nue_intime_logo.webp`,
    description: siteConfig.description,
    sameAs: [siteConfig.social.instagram].filter(Boolean),
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: "es-PE",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/tienda?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // El contenido es generado por nosotros (no entrada de usuario): seguro.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
