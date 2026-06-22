import { ImageResponse } from "next/og";

/**
 * Favicon de marca (ícono de la pestaña). Se genera por código: una "N" blanca
 * sobre fondo negro (identidad NUE INTIME). El wordmark completo sería ilegible
 * a 16–32px, así que se usa la inicial como lettermark — legible y nítido en
 * temas claro y oscuro del navegador. Reemplaza al favicon por defecto de Next.
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
          background: "#0a0a0a",
          color: "#ffffff",
          fontSize: 46,
          fontWeight: 700,
          letterSpacing: "0.02em",
        }}
      >
        N
      </div>
    ),
    { ...size },
  );
}
