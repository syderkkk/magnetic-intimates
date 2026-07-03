import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

/**
 * Imagen Open Graph generada dinámicamente (1200×630).
 * Es la vista previa que se muestra al compartir el enlace en redes y chats.
 * Reproduce la marca MAGNÉTIC: negro sobre fondo sand (docs/06 §4).
 * NOTA: usa la tipografía por defecto de la generación; se puede afinar luego
 * cargando la tipografía de marca si se desea mayor fidelidad.
 */
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f4ef",
          color: "#0e0e0d",
        }}
      >
        <div
          style={{
            fontSize: 160,
            fontWeight: 500,
            letterSpacing: "0.1em",
            lineHeight: 1,
          }}
        >
          MAGNÉTIC
        </div>
        <div
          style={{
            fontSize: 34,
            fontWeight: 300,
            letterSpacing: "0.3em",
            marginTop: 32,
          }}
        >
          INTIMACY WITH ATTITUDE
        </div>
        <div
          style={{
            fontSize: 26,
            color: "#6b5847",
            marginTop: 48,
            letterSpacing: "0.02em",
          }}
        >
          Lencería y prendas íntimas
        </div>
      </div>
    ),
    size,
  );
}
