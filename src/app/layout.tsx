import type { Metadata, Viewport } from "next";

import { StructuredData } from "@/components/seo/structured-data";
import { LoadingSplash } from "@/components/shop/loading-splash";
import { siteConfig } from "@/config/site";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

const TITLE = `${siteConfig.name} — Lencería y prendas íntimas`;

export const metadata: Metadata = {
  // Base para resolver URLs absolutas (canonical, Open Graph, etc.).
  metadataBase: new URL(siteConfig.url),
  title: {
    default: TITLE,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "lencería",
    "ropa íntima",
    "pijamas",
    "bodies",
    "conjuntos",
    "Perú",
    "NUE INTIME",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  alternates: { canonical: "/" },
  // Configuración para que el enlace se vea bien al compartirlo (Open Graph).
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: TITLE,
    description: siteConfig.description,
  },
  // Tarjeta enriquecida para X/Twitter (la imagen la aporta twitter-image).
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${fontVariables} h-full`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col antialiased">
        {/* Enlace para saltar al contenido (accesibilidad / navegación por teclado). */}
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-110 focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
        >
          Saltar al contenido
        </a>

        <StructuredData />
        <LoadingSplash />
        {children}
      </body>
    </html>
  );
}
