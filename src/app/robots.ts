import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/** robots.txt generado dinámicamente. Bloquea el panel admin y las APIs internas. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/checkout", "/pedido"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
