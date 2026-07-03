import { ImageResponse } from "next/og";

/**
 * Favicon de marca (ícono de la pestaña). Se genera por código: el monograma
 * MAGNÉTIC — dos triángulos enfrentados de trazo lineal, que se tocan en el
 * centro dibujando una "M" geométrica (dualidad femenino/masculino del manual
 * de marca, docs/06-identidad-magnetic.md §1) — blanco sobre negro de marca.
 * Reemplaza al favicon por defecto de Next.
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
          background: "#0e0e0d",
        }}
      >
        <svg width="34" height="34" viewBox="0 0 64 64" fill="none">
          {/* Triángulo izquierdo, apuntando a la derecha. */}
          <polygon
            points="6,6 6,58 32,32"
            stroke="#f7f4ef"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Triángulo derecho, apuntando a la izquierda: se enfrenta al primero. */}
          <polygon
            points="58,6 58,58 32,32"
            stroke="#f7f4ef"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
