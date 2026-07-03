# public/brand — assets de marca que sirve la página

Inventario actual (WebP, optimizados para web). Se sirven en `/brand/<nombre>`.
Nomenclatura: `<pieza>-<color del trazo>-fondo-<color de fondo>.webp`.

| Archivo | Pieza | Trazo | Fondo |
|---|---|---|---|
| `logo-negro-fondo-blanco.webp` | Wordmark + tagline | Negro | Blanco |
| `logo-blanco-fondo-negro.webp` | Wordmark + tagline | Blanco | Negro |
| `logo-taupe-fondo-sand.webp` | Wordmark + tagline | Taupe | Sand |
| `logo-taupe-fondo-blanco.webp` | Wordmark + tagline | Taupe | Blanco |
| `logo-negro-fondo-nude.webp` | Wordmark + tagline | Negro | Nude |
| `logo-blanco-fondo-taupe.webp` | Wordmark + tagline | Blanco | Taupe |
| `monograma-negro-fondo-blanco.webp` | Monograma M | Negro | Blanco |
| `monograma-taupe-fondo-sand.webp` | Monograma M | Taupe | Sand |
| `monograma-taupe-fondo-blanco.webp` | Monograma M | Taupe | Blanco |
| `monograma-negro-fondo-nude.webp` | Monograma M | Negro | Nude |
| `monograma-blanco-fondo-taupe.webp` | Monograma M | Blanco | Taupe |

Además hay dos **provisionales** con transparencia hecha con herramienta
automática (bordes imperfectos; serán reemplazados por los SVG del diseñador —
ver `docs/brand/pedido-al-disenador.md`):

- `monograma-negro-fondo-transparente.webp`
- `monograma-taupe-fondo-transparente.webp`

## ⚠️ Limitación importante: los demás traen fondo sólido

Ninguna versión tiene fondo transparente. Sirven para: splash de carga, imágenes
OG/redes, secciones con bloque de color, emails. **NO sirven** para el logo del
header ni para superponer sobre fotos — ahí se necesita:

1. **Ideal:** pedir al diseñador los **SVG vectoriales** (escalan sin peso y
   permiten cambiar el color por CSS), o al menos PNG con transparencia.
2. **Mientras tanto:** el header sigue con el wordmark en texto/código
   (`src/components/shop/logo.tsx`), que además es lo más ligero y accesible.
   El monograma del favicon se dibuja en `src/app/icon.tsx`.

## Otras ubicaciones

- Material fuente (JPG del manual) → `docs/brand/`
- Fuentes `.woff2` → `src/fonts/` (vía `next/font/local`)
- Imágenes de productos → se suben desde el admin (Supabase Storage)
