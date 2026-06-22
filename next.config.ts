import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fija la raíz del proyecto para Turbopack. Evita el aviso por múltiples
  // lockfiles cuando existe otro pnpm-lock.yaml en carpetas superiores.
  turbopack: {
    root: import.meta.dirname,
  },

  // Prisma y el driver nativo de SQLite no deben empaquetarse: se cargan como
  // módulos externos en el servidor (evita errores de bundling de binarios).
  // NOTA: `sharp` NO se lista aquí; Next ya lo externaliza por defecto y
  // listarlo rompe el generador de imágenes OpenGraph.
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-better-sqlite3",
    "better-sqlite3",
  ],

  experimental: {
    serverActions: {
      // Las imágenes admiten hasta 5 MB (CLAUDE.md §11.4). El tope por defecto
      // de las Server Actions es 1 MB; lo subimos para que la subida no rebote
      // con 413 antes de validarse/optimizarse en el servidor.
      bodySizeLimit: "8mb",
    },
  },

  images: {
    // Formatos modernos servidos automáticamente por next/image.
    formats: ["image/avif", "image/webp"],
    // Calidades permitidas al re-optimizar (Next 16 exige declararlas). 75 es el
    // valor por defecto (miniaturas/productos); 90 lo usa la portada del inicio.
    qualities: [75, 90],
    // Las imágenes se sirven locales desde /uploads (mismo origen), así que el
    // optimizador actúa sin necesidad de remotePatterns.
    // TODO: añadir aquí el dominio del object storage (R2/S3) cuando se defina
    // el hosting (decisión #1).
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
