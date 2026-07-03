import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";

/**
 * Definiciones de tipografía centralizadas, expuestas como variables CSS para
 * que todo el sistema tipográfico sea intercambiable desde un solo lugar
 * (ver los tokens `--font-*` en globals.css).
 *
 * - `mazzard`   → tipografía de marca / títulos y logo (Mazzard M Regular)
 * - `rubik`     → texto de cuerpo e interfaz (tagline y UI de la marca)
 * - `geistMono` → contextos numéricos / monoespaciados
 *
 * Para cambiar una tipografía en todo el sitio: reemplaza la definición aquí y
 * el token `--font-*` correspondiente en globals.css. No hace falta tocar nada más.
 */
export const mazzard = localFont({
  src: [
    { path: "../fonts/mazzard-m-regular.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-mazzard",
  display: "swap",
});

export const rubik = localFont({
  src: [
    { path: "../fonts/rubik-variable.woff2", weight: "300 900", style: "normal" },
    {
      path: "../fonts/rubik-italic-variable.woff2",
      weight: "300 900",
      style: "italic",
    },
  ],
  variable: "--font-rubik",
  display: "swap",
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/** Clases de variables de fuente aplicadas en <html>. */
export const fontVariables = `${mazzard.variable} ${rubik.variable} ${geistMono.variable}`;
