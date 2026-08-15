import { ImageResponse } from "next/og";

/**
 * Favicon de marca (ícono de la pestaña). Se genera por código: el monograma
 * MAGNÉTIC — dos triángulos enfrentados de trazo lineal, que se tocan en el
 * centro dibujando una "M" geométrica (dualidad femenino/masculino del manual
 * de marca, docs/06-identidad-magnetic.md §1) — negro sobre nude de marca
 * (combinación ya documentada y validada en la guía, contraste ~10.5:1).
 * Reemplaza al favicon por defecto de Next.
 *
 * El favicon se ve a 16-32px reales en la pestaña: a ese tamaño, cualquier
 * trazo fino (incluido el del archivo del diseñador, pensado para verse
 * grande) se pierde por completo. Por eso NO se usa ese archivo acá — se
 * repiten a mano las mismas proporciones gruesas de `components/shop/
 * monogram.tsx` (mismos puntos, mismo grosor relativo, ajustadas al
 * monograma del rediseño 2026-08-15), que sí se leen bien de chiquito. No se
 * puede importar el componente directo porque `next/og` no soporta
 * componentes React, solo JSX plano.
 */
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#d1bead",
        }}
      >
        <svg width="34" height="34" viewBox="0 0 64 64" fill="none">
          <polygon
            points="6,10 6,54 32,32"
            stroke="#0e0e0d"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <polygon
            points="58,10 58,54 32,32"
            stroke="#0e0e0d"
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
