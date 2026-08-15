# public/brand — assets de marca que sirve la página

Inventario actual (WebP, optimizados para web). Se sirven en `/brand/<nombre>`.
Nomenclatura: `<pieza>-<trazo>-fondo-<fondo>.webp`.

**Rediseño 2026-08-15:** el equipo de diseño entregó un logo nuevo (wordmark
"Magnétic" en tipografía serif con floritura, distinta a la anterior; monograma
con proporciones más anchas). Los archivos viejos quedaron en
`docs/brand/archive_old_2026-07/` por si hace falta consultarlos — se sacaron
de `public/` para que no queden accesibles por URL; no se usan en ningún lado
del código.

## Wordmark (sin tagline) — versión base, la que usa el sitio

| Archivo | Trazo | Fondo |
|---|---|---|
| `logo-negro-fondo-blanco.webp` | Negro | Blanco |
| `logo-blanco-fondo-negro.webp` | Blanco | Negro |
| `logo-taupe-fondo-blanco.webp` | Taupe | Blanco |
| `logo-negro-fondo-nude.webp` | Negro | Nude |
| `logo-blanco-fondo-taupe.webp` | Blanco | Taupe |

## Wordmark + tagline ("Intimacy with attitude")

Disponibles para otros canales (redes, impresos) — **el sitio web no las usa**:
el header y la imagen de Open Graph muestran el wordmark solo y agregan el
tagline como texto aparte (`components/shop/logo.tsx`), así no se duplica.

| Archivo | Trazo | Fondo |
|---|---|---|
| `logo-tagline-negro-fondo-blanco.webp` | Negro | Blanco |
| `logo-tagline-blanco-fondo-negro.webp` | Blanco | Negro |
| `logo-tagline-taupe-fondo-blanco.webp` | Taupe | Blanco |
| `logo-tagline-taupe-fondo-sand.webp` | Taupe | Sand |
| `logo-tagline-negro-fondo-nude.webp` | Negro | Nude |
| `logo-tagline-blanco-fondo-taupe.webp` | Blanco | Taupe |

## Monograma M

| Archivo | Trazo | Fondo |
|---|---|---|
| `monograma-negro-fondo-blanco.webp` | Negro | Blanco |
| `monograma-blanco-fondo-negro.webp` | Blanco | Negro |
| `monograma-taupe-fondo-blanco.webp` | Taupe | Blanco |
| `monograma-taupe-fondo-sand.webp` | Taupe | Sand |
| `monograma-blanco-fondo-taupe.webp` | Blanco | Taupe |
| `monograma-negro-fondo-taupe.webp` | Negro | Taupe |

## Vectoriales (SVG, un solo color, textos a curvas)

- `logo-wordmark.svg` — wordmark solo, sin tagline. Fuente de las piezas en
  código: `components/shop/logo.tsx` (header, recortado a su bounding box,
  `fill="currentColor"`) y `app/opengraph-image.tsx` (imagen de compartir).
- `logo-completo.svg` — wordmark + tagline integrado. No se usa en el sitio
  (ver arriba); disponible para otros usos.
- `monograma.svg` — el símbolo solo. Referencia de proporciones para
  `components/shop/monogram.tsx` y `app/icon.tsx` (favicon) — esos dos
  **no** importan este archivo directamente: dibujan una versión simplificada
  y de trazo más grueso a mano, porque el trazo real se pierde a 16-32px
  (tamaño real del favicon en la pestaña del navegador).
- `elementos-graficos.svg` — trazos lineales decorativos (curva, moño, rombo,
  trazo). **Sin cambios** en este rediseño (idéntico al anterior). Fuente de
  `components/shop/brand-motif.tsx`.

## ⚠️ Pendiente

- **Ninguna versión tiene fondo transparente** (ni falta hace: el header y
  cualquier superposición sobre fotos usan el SVG vectorial, no el WebP).
- **Falta el archivo de la fuente del wordmark nuevo** (.woff2/.otf) — por eso
  el header usa el SVG como imagen fija en vez de texto editable. Si el
  diseñador puede pasar la fuente (+ confirmar su licencia web), se podría
  volver a texto real recoloreable. Ver `docs/brand/pedido-al-disenador.md`.
- Falta el combo `logo-taupe-fondo-sand.webp` en la versión **sin tagline**
  (sí existe en la versión con tagline) — no bloquea nada hoy, nadie lo usa,
  pero si hace falta pedírselo al diseñador.

## Otras ubicaciones

- Material fuente (JPG del manual) → `docs/brand/`
- Fuentes `.woff2` → `src/fonts/` (vía `next/font/local`)
- Imágenes de productos → se suben desde el admin (Supabase Storage)
