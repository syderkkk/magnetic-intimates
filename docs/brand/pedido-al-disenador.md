# Pedido de archivos al diseñador (rebrand MAGNÉTIC → web)

Mensaje enviado/por enviar al diseñador. Estado de lo recibido se marca aquí.

## Ronda 2026-08-15 — rediseño del logo

El equipo de diseño entregó un logo nuevo (wordmark "Magnétic" en tipografía
serif con floritura, ya no la sans-serif geométrica de la ronda anterior;
monograma con proporciones distintas). Implementado en el sitio
(`public/brand/README.md` tiene el inventario completo).

- [x] Wordmark nuevo en SVG (sin tagline y con tagline), textos a curvas
- [x] Monograma nuevo en SVG
- [x] WebP con fondo sólido en varias combinaciones de color, con y sin tagline
- [ ] **Archivo de la fuente del wordmark nuevo (.woff2/.otf) + licencia web** —
      no llegó. Mientras tanto el header usa el SVG como imagen fija (recortado
      a su bounding box, recoloreable vía `currentColor`) en vez de texto
      editable. Si llega la fuente, se puede volver a texto real.
- [ ] Combo `logo-taupe-fondo-sand.webp` en la versión **sin tagline** — solo
      existe en la versión con tagline; no bloquea nada hoy.

## Ronda 2026-07-07 — primera entrega (identidad Mazzard, ya reemplazada)

- [x] Monograma M en SVG — `docs/brand/monograma.svg` (2026-07-07)
- [x] Logotipo (wordmark + tagline) en SVG, textos a curvas — `docs/brand/logo-completo.svg`; además llegó el bonus solo-wordmark sin tagline en `logo-wordmark.svg`
- [ ] (Solo si no hay SVG) PNG transparentes de ambos — no hizo falta, llegó el SVG
- [x] ~~Confirmación de licencia webfont de Mazzard M~~ — ya no aplica: el rediseño de 2026-08-15 reemplazó este wordmark
- [x] Elementos gráficos lineales en SVG (opcional) — `docs/brand/elementos-graficos.svg` (8 trazos); revisar con el diseñador: una figura tiene relleno taupe fijo y parece duplicada dentro del mismo archivo
- [ ] Patrón tissue repetible (opcional) — no llegó

---

## Mensaje (copiar/pegar)

Hola [nombre], ya estamos implementando la nueva identidad de MAGNÉTIC en la
tienda online y necesito algunos archivos en formato para web. Lo que me pasaste
(JPG/PNG con fondo) me sirve para redes y algunas secciones, pero para la página
necesito las piezas en vectorial:

**1. Monograma "M" en SVG** (prioridad)
- Solo el símbolo, sin fondo.
- En un solo color (negro), como trazo/curvas — en la web nosotros le cambiamos
  el color según el fondo (negro, blanco, taupe), así que con un archivo basta.

**2. Logotipo completo en SVG** (prioridad)
- El wordmark "MAGNÉTIC" con el tagline "Intimacy with attitude", sin fondo,
  en un solo color (negro).
- Con los textos convertidos a curvas/contornos (para que no dependa de tener
  la fuente instalada).
- Si puedes, también una versión solo "MAGNÉTIC" sin tagline (para espacios
  pequeños como la cabecera móvil).

**3. Si el SVG no es posible**, la alternativa: PNG con fondo transparente,
mínimo 2000 px de ancho, del monograma y del logotipo, en negro y en blanco
(4 archivos). Exportados directo del original — no recortados con herramienta,
para que los bordes queden limpios.

**4. Fuente Mazzard M**
- ¿La licencia que tenemos cubre uso en web (webfont)? Si sí, ¿me pasas los
  archivos de los pesos disponibles (Regular y los que haya)?
- Si no la cubre, dime de dónde se licenció para cotizar la licencia web.

**5. Opcionales (si los tienes a mano, suman para la web):**
- Los elementos gráficos lineales del manual (los trazos femeninos/masculinos)
  en SVG, para usarlos como detalles y separadores.
- El patrón del papel tissue (las M repetidas) como mosaico repetible en SVG.

Con eso quedo completo. ¡Gracias!

---

## Por qué se pide así (contexto interno)

- **SVG un solo color**: pesa 1–2 KB, escala infinito y se recolorea por CSS —
  un archivo reemplaza a las 5 combinaciones de color en imagen.
- **Textos a curvas**: evita depender de Mazzard instalada al abrir el SVG.
- **PNG 2000px como plan B**: suficiente para header/retina; los recortes con
  herramientas automáticas dejan halos en trazos finos (ya lo comprobamos).
- **Licencia Mazzard**: requisito antes de producción (docs/06 §2); mientras
  tanto la web usa Jost como sustituto.
