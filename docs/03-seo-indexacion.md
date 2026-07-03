# SEO, indexación y descubrimiento (SEO / GEO / SEM)

> Estado real del SEO del proyecto, huecos detectados y estrategia completa para
> indexar bien en buscadores clásicos (Google/Bing) y en motores generativos
> (ChatGPT, Perplexity, AI Overviews — "GEO"). Incluye el plan de migración de
> dominio por el rebrand NUE → MAGNÉTIC.

---

## 1. Lo que ya está bien (no tocar, solo actualizar textos al rebrand)

| Pieza | Dónde | Estado |
|---|---|---|
| `metadataBase` + títulos con template | `src/app/layout.tsx` | ✅ |
| Open Graph + Twitter Card con imágenes generadas | `opengraph-image.tsx`, `twitter-image.tsx` | ✅ |
| `robots.ts` (bloquea `/admin` y `/api`) | `src/app/robots.ts` | ✅ |
| `robots` meta con `max-image-preview: large` | layout raíz | ✅ |
| Canonicals (`/`, `/tienda`, `/producto/[slug]`) | por página | ✅ |
| JSON-LD: Organization/WebSite, Product, colección | `components/seo/*` | ✅ |
| `generateMetadata` por producto con OG image | `producto/[slug]/page.tsx` | ✅ |
| Checkout con `noindex` | `checkout/page.tsx` | ✅ |
| URLs limpias con slugs | todo el sitio | ✅ |
| `lang="es"`, locale `es_PE` | layout / config | ✅ |

---

## 2. Huecos a corregir (por prioridad)

### 🟠 2.1 El sitemap no incluye productos ni categorías
`src/app/sitemap.ts` solo lista `/` y `/tienda` (el propio archivo tiene el TODO).
Los productos SÍ existen ya. Corregir:

```ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts(); // ya cacheado 60s
  return [
    { url: siteConfig.url, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/tienda`, changeFrequency: "daily", priority: 0.9 },
    ...products.map((p) => ({
      url: `${siteConfig.url}/producto/${p.slug}`,
      lastModified: p.updatedAt,          // usar la fecha real, no new Date()
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
```
`lastModified` con `new Date()` en cada build (como está hoy) es contraproducente:
le dice a Google que TODO cambió siempre. Usar `updatedAt` real.

### 🟠 2.2 URLs con filtros: controlar el crawl de facetas
`/tienda?cat=…&size=…&color=…&sort=…` genera combinaciones infinitas. El canonical
fijo a `/tienda` ya mitiga la duplicación (bien), pero conviene además:
- Meta `robots: { index: false, follow: true }` cuando haya `searchParams` activos
  (se decide en `generateMetadata` leyendo los params).
- Si a futuro se quiere indexar categorías, crear rutas propias
  `/coleccion/[slug]` (ya previsto en `config/site.ts`) con metadata única — las
  rutas con path indexan; las query strings no.

### 🟠 2.3 Datos estructurados de producto: completar Offer
Validar `ProductStructuredData` con la prueba de resultados enriquecidos de Google.
Un `Product` competitivo para e-commerce debe incluir:
- `offers` con `price` (decimal, no céntimos), `priceCurrency: "PEN"`,
  `availability` (`InStock`/`OutOfStock` según stock real de variantes),
  `priceValidUntil`, `url`, `itemCondition`.
- `image` (array), `sku`, `brand: { "@type": "Brand", "name": "MAGNÉTIC" }`.
- Cuando existan reseñas: `aggregateRating` (nunca inventarlo antes).
- `BreadcrumbList` como JSON-LD aparte en ficha y `/tienda` (hoy hay breadcrumbs
  visuales pero verificar que exista el JSON-LD correspondiente y coincida).

### 🟡 2.4 Página 404 con contenido útil
`not-found.tsx` existe (bien). Asegurar que devuelva status 404 real (App Router lo
hace) y que ofrezca búsqueda + enlaces a categorías (recupera al usuario y reparte
link equity interno).

### 🟡 2.5 Interlinking interno
- Productos relacionados en ficha ya existen (misma categoría) ✅.
- Añadir: enlaces de categoría en el footer, breadcrumbs enlazando a
  `/coleccion/[slug]` cuando exista, y sección editorial (ver GEO §4).

---

## 3. Migración de dominio (rebrand NUE → MAGNÉTIC)

El plan si se adquiere `magneticintimates.com` (o el dominio final que se compre):

1. **Antes del cambio**: dar de alta el dominio nuevo en Google Search Console y
   Bing Webmaster Tools; verificar ambos dominios.
2. **Actualizar el código en un solo lugar**: `NEXT_PUBLIC_SITE_URL` (env) alimenta
   `siteConfig.url` → metadata, canonicals, sitemap y robots se actualizan solos.
   Revisar textos con "NUE INTIME" hardcodeados: `config/site.ts` (name, shortName,
   description), `layout.tsx` (keywords), descripciones de `/tienda` y ficha de
   producto, `opengraph-image.tsx`/`twitter-image.tsx`/`icon.tsx` (monograma M).
3. **Redirecciones 301 permanentes** del dominio viejo al nuevo, ruta a ruta
   (en Vercel: el dominio viejo como redirect del proyecto). Mantenerlas mínimo
   1 año — es lo que transfiere la autoridad acumulada.
4. **Search Console → "Cambio de dirección"** desde la propiedad vieja a la nueva.
5. Reenviar el sitemap nuevo; vigilar cobertura e indexación 4–8 semanas.
6. Actualizar perfiles sociales, WhatsApp Business y cualquier enlace externo.

Si el sitio aún no tiene tráfico real, el momento ideal del cambio es **ahora**,
antes de acumular autoridad en el dominio equivocado.

---

## 4. GEO — optimización para motores generativos

Los asistentes de IA (y los AI Overviews de Google) citan sitios con **entidad de
marca clara y contenido factual estructurado**. Acciones concretas:

1. **Página "Nosotros" real** con la historia de la marca, datos verificables
   (Perú, rubro, contacto) — es la fuente de la entidad "MAGNÉTIC".
2. **JSON-LD `Organization` completo**: `name`, `alternateName` ("Magnétic
   Intimates"), `logo`, `sameAs` (Instagram, TikTok reales — hoy en
   `config/site.ts` apuntan a los dominios genéricos `instagram.com`, corregir),
   `contactPoint`.
3. **FAQ de compra** (tallas, cambios, envíos, pagos) con JSON-LD `FAQPage` —
   es el formato que más citan los motores generativos.
4. **Fichas con texto descriptivo real** (composición, calce, cuidado): las
   descripciones ricas ya tienen campo en BD (`description`, `composition`) —
   llenarlas es trabajo de contenido, no de código.
5. **`llms.txt` opcional** en la raíz pública describiendo el sitio — estándar
   emergente, costo cero.

---

## 5. SEM y medición (cuando haya presupuesto)

- **Antes de invertir un sol en anuncios**: instalar analítica. Opción ligera y
  sin banner de cookies obligatorio: **Vercel Analytics** o **Plausible**; si el
  negocio pide remarketing → GA4 + Google Tag Manager con **Consent Mode v2**
  (requiere el banner de consentimiento, que además exige la Ley 29733).
- Google Merchant Center: con el JSON-LD `Product` completo (§2.3) se puede
  generar un feed de Shopping — los anuncios de Shopping son el canal natural
  para moda íntima.
- Conversiones a medir desde el día 1: añadir al carrito, iniciar checkout,
  compra (con valor). Definirlas en un solo módulo (`lib/analytics.ts`) para no
  regar llamadas por los componentes.

---

## 6. Checklist de lanzamiento SEO

- [ ] Sitemap con productos y `lastModified` real.
- [ ] `noindex,follow` en `/tienda` con filtros activos.
- [ ] JSON-LD Product validado en Rich Results Test (Offer completo, PEN).
- [ ] JSON-LD BreadcrumbList alineado con los breadcrumbs visibles.
- [ ] Organization con `sameAs` reales y logo del rebrand.
- [ ] Textos y keywords actualizados a MAGNÉTIC (sin restos de "NUE").
- [ ] Dominio nuevo verificado en Search Console + Bing; 301 desde el viejo.
- [ ] Página Nosotros + FAQ con schema.
- [ ] Analítica con eventos de e-commerce.
- [ ] `favicon`/OG images regenerados con el monograma M.
