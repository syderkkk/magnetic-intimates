import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fija la raíz del proyecto para Turbopack. Evita el aviso por múltiples
  // lockfiles cuando existe otro pnpm-lock.yaml en carpetas superiores.
  turbopack: {
    root: import.meta.dirname,
  },

  images: {
    // Formatos modernos servidos automáticamente por next/image.
    formats: ["image/avif", "image/webp"],
    // Dominios remotos permitidos para imágenes.
    // NOTA: picsum.photos son marcadores de posición de demostración; se
    // reemplazarán por el almacenamiento real cuando se defina el hosting.
    // TODO: confirmar con cliente (hosting / almacenamiento de imágenes).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
    ],
  },

  // Cabeceras de seguridad base (CLAUDE.md §7.6). La Content-Security-Policy
  // se afinará al cerrar el dominio y la pasarela de pago.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
