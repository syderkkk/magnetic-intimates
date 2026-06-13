import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

/**
 * Imagen Open Graph generada dinámicamente (1200×630).
 * Es la vista previa que se muestra al compartir el enlace en redes y chats.
 * Reproduce la marca en negro sobre blanco.
 * NOTA: usa la tipografía por defecto de la generación; se puede afinar luego
 * cargando la tipografía de marca si se desea mayor fidelidad.
 */
export const alt = `${siteConfig.name} — Lencería y prendas íntimas`;
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
          background: "#ffffff",
          color: "#0a0a0a",
        }}
      >
        <div
          style={{
            fontSize: 190,
            fontWeight: 700,
            letterSpacing: "0.04em",
            lineHeight: 1,
          }}
        >
          NUE
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 300,
            letterSpacing: "0.5em",
            paddingLeft: "0.5em",
            marginTop: 18,
          }}
        >
          INTIME
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#737373",
            marginTop: 56,
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
