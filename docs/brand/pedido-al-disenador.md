# Pedido de archivos al diseñador (rebrand MAGNÉTIC → web)

Mensaje enviado/por enviar al diseñador. Estado de lo recibido se marca aquí.

- [ ] Monograma M en SVG
- [ ] Logotipo (wordmark + tagline) en SVG
- [ ] (Solo si no hay SVG) PNG transparentes de ambos
- [ ] Confirmación de licencia webfont de Mazzard M
- [ ] Elementos gráficos lineales en SVG (opcional)
- [ ] Patrón tissue repetible (opcional)

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
