# Identidad de marca MAGNÉTIC — guía de implementación del rebrand

> La tienda deja de llamarse **NUE INTIME** y pasa a ser **MAGNÉTIC**
> ("Intimacy with attitude"). Dominio previsto: **magneticintimates.com**
> (pendiente de compra — confirmar antes de tocar URLs; ver plan de migración en
> `docs/03-seo-indexacion.md §3`). Este documento traduce el manual de marca
> recibido a decisiones concretas de código y propone mejoras de UI alineadas.

---

## 1. Identidad (del manual recibido)

### Logotipo y monograma
- **Logotipo**: "MAGNÉTIC" en Mazzard M Regular, tracking muy amplio, con el
  tagline "Intimacy with attitude" en Rubik debajo.
- **Monograma**: una **M geométrica de trazo lineal** (dos triángulos enfrentados)
  que representa la dualidad femenino/masculino — equilibrio, atracción e
  intimidad. Existe en negro, blanco y taupe/nude, sobre fondos sand, blanco,
  negro y nude.
- **Elementos gráficos**: trazos lineales "femeninos" (curvas, siluetas) y
  "masculinos" (triángulo, rombo, cheurones) para patrones y detalles.

### Paleta de color

| Nombre | Hex | RGB | Uso previsto |
|---|---|---|---|
| Arena / Sand | `#f7f4ef` | 247 244 239 | **Fondo principal** del sitio |
| White | `#ffffff` | 255 255 255 | Tarjetas, superficies elevadas |
| Black | `#0e0e0d` | 14 14 13 | Texto, botones primarios, header/footer |
| Taupe | `#937c69` | 147 124 105 | Acentos, hover, detalles gráficos |
| Nude | `#d1bead` | 209 190 173 | Fondos suaves, badges, secciones alternas |

### ⚠️ Contraste (obligatorio validar — WCAG 4.5:1)

| Combinación | Ratio aprox. | Veredicto |
|---|---|---|
| Black `#0e0e0d` sobre Sand `#f7f4ef` | ~17.6:1 | ✅ texto principal |
| Black sobre Nude `#d1bead` | ~10.5:1 | ✅ |
| White sobre Taupe `#937c69` | ~4.0:1 | ⚠️ solo texto grande (≥18.7px bold / 24px) |
| Taupe sobre Sand | ~3.2:1 | ❌ NO para texto normal; solo decorativo/bordes |
| Taupe sobre White | ~3.5:1 | ❌ ídem |

Regla práctica: **taupe y nude nunca llevan texto de cuerpo encima ni se usan como
color de texto**, salvo titulares grandes o elementos decorativos. Para texto
secundario sobre sand, usar un taupe oscurecido (ej. `#6b5847`, ~5.5:1) como token
`--muted-foreground`.

---

## 2. Tipografías

| Rol | Marca | En el código |
|---|---|---|
| Display / logo / titulares | **Mazzard M Regular** | `next/font/local` — **verificar licencia web** antes de usar (Mazzard es de fundición comercial; necesita licencia webfont). Autohospedar los `.woff2` en `src/fonts/` |
| Tagline / cuerpo | **Rubik** | Google Fonts → `next/font/google` directo |

El sistema ya está preparado para el cambio: `src/lib/fonts.ts` centraliza las
fuentes y `globals.css` las expone como tokens (`--font-display`, `--font-sans`).

**Plan A (con licencia Mazzard):**

```ts
// src/lib/fonts.ts
import localFont from "next/font/local";
import { Rubik } from "next/font/google";

export const mazzard = localFont({
  src: [{ path: "../fonts/MazzardM-Regular.woff2", weight: "400" }],
  variable: "--font-mazzard",
  display: "swap",
});
export const rubik = Rubik({ variable: "--font-rubik", subsets: ["latin"], display: "swap" });
```

**Plan B (sin licencia todavía):** mantener **Jost** como display — ya está en el
proyecto y es una geométrica muy cercana a Mazzard (la diferencia es sutil en
tamaños de UI) — y cambiar el cuerpo Geist → Rubik. Cero bloqueo, se cambia después
tocando solo `fonts.ts` + un token.

En ambos casos, replicar el gesto del logo en los titulares: **mayúsculas +
`letter-spacing` amplio** (ya existe el patrón `tracking-[0.2em] uppercase` en
eyebrows de la home — conservarlo, es exactamente el lenguaje de la marca).

---

## 3. Dónde van los archivos de marca

| Qué | Carpeta | Notas |
|---|---|---|
| Manual de marca, capturas, material fuente (lo que te entregaron) | `docs/brand/` | Material de referencia, versionado junto a la documentación. Nombrar en kebab-case: `manual-marca.png`, `monograma-negro.png`… |
| Assets de producción (SVG del logo y monograma, pattern) | `public/brand/` | Solo lo que el sitio sirve. **Pedir los SVG vectoriales** al diseñador; los PNG de 4500px no se usan en producción |
| Webfonts (Mazzard con licencia) | `src/fonts/` | `.woff2`, cargados con `next/font/local` |
| Favicon / iconos | `src/app/icon.tsx` (existente) | Regenerar con el monograma M (hoy dibuja una "N" de NUE) |

> Pon las imágenes que te dieron en `docs/brand/` y avísame; de ahí derivamos los
> SVG/tokens definitivos.

---

## 4. Mapeo a los tokens del proyecto (`src/app/globals.css`)

El sitio ya funciona 100 % con variables (`--background`, `--foreground`,
`--primary`, `--muted`, `--accent`, `--brand-ink`, `--brand-paper`…), así que el
rebrand de color es **un solo archivo**:

| Token | Valor nuevo | Comentario |
|---|---|---|
| `--background` | `#f7f4ef` (sand) | El sitio deja de ser blanco puro |
| `--foreground` | `#0e0e0d` (black) | |
| `--card` / `--popover` | `#ffffff` | Superficies elevadas sobre sand |
| `--primary` | `#0e0e0d` | Botones principales siguen negros |
| `--primary-foreground` | `#f7f4ef` | |
| `--secondary` / `--muted` | `#ece7de` (sand oscurecido ~4%) | Derivado, para fondos sutiles |
| `--muted-foreground` | `#6b5847` (taupe oscurecido) | ⚠️ no usar `#937c69` (contraste) |
| `--accent` | `#d1bead` (nude) | Hovers, selección |
| `--border` / `--input` | `#e2dbd0` | Derivado de sand/nude |
| `--ring` | `#937c69` (taupe) | Focus ring — decorativo, puede ser taupe |
| `--brand-ink` / `--brand-paper` | `#0e0e0d` / `#f7f4ef` | |
| `--announcement-background` | `#0e0e0d` | La cinta negra se mantiene (encaja) |

Cambios de identidad en código (checklist):

- [ ] `src/config/site.ts` — `name: "MAGNÉTIC"`, `shortName: "MAGNÉTIC"` (o "M"),
      `description` nueva, `url` al dominio nuevo, redes reales.
- [ ] `src/app/layout.tsx` — keywords (quitar "NUE INTIME", añadir "Magnétic",
      "Magnetic Intimates"), `themeColor: "#f7f4ef"`.
- [ ] `src/components/shop/logo.tsx` — wordmark MAGNÉTIC (texto con tracking o SVG).
- [ ] `src/app/icon.tsx` — monograma M (hoy genera la "N").
- [ ] `src/app/opengraph-image.tsx` / `twitter-image.tsx` — rediseño con fondo
      sand + wordmark negro (o monograma).
- [ ] `LoadingSplash` — si se conserva (ver docs/04 §2.1), usar el monograma M
      animado: es el uso perfecto para el símbolo.
- [ ] Descripciones SEO en `/tienda` y ficha de producto (mencionan NUE INTIME).
- [ ] `prisma/seed.ts` y `README.md` — referencias de nombre.
- [ ] Emails (cuando existan) — plantillas con la nueva identidad.
- [ ] Buscar restos: `grep -ri "NUE" src/` al terminar.

---

## 5. Propuestas de UI con la nueva identidad

La base actual (editorial, minimal, mucho aire, negro sobre claro) **encaja muy
bien** con MAGNÉTIC; no hay que rehacer el sitio, hay que re-vestirlo:

1. **Fondo global sand** en lugar de blanco: el cambio de mayor impacto y menor
   costo. Tarjetas de producto en blanco puro sobre sand ganan profundidad sin
   sombras fuertes.
2. **Header**: wordmark MAGNÉTIC centrado o a la izquierda con tracking amplio;
   en móvil, solo el monograma M. Cinta de anuncios negra se conserva.
3. **Hero**: mantener la foto a sangre completa, pero con el eyebrow en nude/taupe
   y el CTA negro. Alternativa de arte: hero partido 50/50 foto + panel sand con
   el monograma en marca de agua (línea taupe al 20 %).
4. **Monograma como sistema**: marca de agua sutil en secciones vacías, separador
   de secciones (línea + M + línea), placeholder de imagen (`no-image.tsx` hoy
   genérico → monograma en línea taupe sobre nude), splash de carga, packaging
   de la página "Nosotros".
5. **Elementos gráficos lineales** (los trazos femeninos/masculinos del manual):
   como patrones de fondo al 5–10 % de opacidad en franjas de valor (envíos,
   cambios, pago seguro) y en la página Nosotros — nunca compitiendo con producto.
6. **Fotografía**: fondos sand/nude/taupe en bodegones (como el manual: etiquetas,
   hangtags, cajas). Pedir al cliente que las fotos de producto respeten la paleta.
7. **Badges de producto** ("nuevo", "oferta"): nude de fondo + texto negro,
   mayúsculas con tracking — hoy son genéricos.
8. **Botones**: primario negro píldora (ya existe); secundario "outline" con borde
   taupe y texto negro; hover con fondo nude.
9. **Footer**: negro `#0e0e0d` con texto sand y el monograma grande — cierra la
   página con la dualidad claro/oscuro de la marca.
10. **Microinteracciones existentes** (reveal, scale 0.96, stagger) se conservan:
    ya transmiten la elegancia que pide la marca.

---

## 6. Orden de implementación sugerido

1. Tokens de color en `globals.css` + `--muted-foreground` accesible (1 sesión).
2. Tipografías (Plan B primero: Rubik cuerpo; Mazzard cuando haya licencia).
3. Logo, icon, OG/Twitter images, splash con monograma.
4. Textos de marca y SEO (siteConfig, keywords, descripciones).
5. Detalles de UI (badges, no-image, footer, patrones lineales).
6. Cuando se compre el dominio: migración de docs/03 §3.
