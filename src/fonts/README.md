# src/fonts — webfonts autohospedadas

Inventario actual:

- `mazzard-m-regular.woff2` — display/marca (⚠️ confirmar que la licencia cubra
  uso webfont antes de salir a producción).
- `rubik-variable.woff2` — cuerpo, fuente variable (todos los pesos en un archivo).
- `rubik-italic-variable.woff2` — itálica variable (cargarla solo si la UI usa
  itálicas; si no, no incluirla para ahorrar bytes).

Se cargan con `next/font/local` desde `src/lib/fonts.ts`. Ejemplo para el rebrand
(ver `docs/06-identidad-magnetic.md §2`):

```ts
import localFont from "next/font/local";

export const mazzard = localFont({
  src: [{ path: "../fonts/mazzard-m-regular.woff2", weight: "400", style: "normal" }],
  variable: "--font-mazzard",
  display: "swap",
});

export const rubik = localFont({
  src: [{ path: "../fonts/rubik-variable.woff2", weight: "300 900", style: "normal" }],
  variable: "--font-rubik",
  display: "swap",
});
```

Después conectar los tokens en `globals.css`:
`--font-display: var(--font-mazzard), …` y `--font-sans: var(--font-rubik), …`.
