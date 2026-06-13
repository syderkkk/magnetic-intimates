import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/**
 * sitemap.xml generado dinámicamente.
 * Por ahora incluye las rutas públicas existentes. Cuando existan las fichas
 * de producto y categorías, se agregarán aquí desde la capa de datos.
 * TODO: añadir /producto/[slug] y /categoria/[slug] al crearse (fase v0.2).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: siteConfig.url,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/tienda`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
}
