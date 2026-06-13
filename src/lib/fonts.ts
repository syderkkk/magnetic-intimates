import { Geist, Geist_Mono, Jost } from "next/font/google";

/**
 * Definiciones de tipografía centralizadas, expuestas como variables CSS para
 * que todo el sistema tipográfico sea intercambiable desde un solo lugar
 * (ver los tokens `--font-*` en globals.css).
 *
 * - `jost`      → tipografía de marca / títulos (sans geométrica, acorde al logo NUE)
 * - `geist`     → texto de cuerpo e interfaz
 * - `geistMono` → contextos numéricos / monoespaciados
 *
 * Para cambiar una tipografía en todo el sitio: reemplaza el import aquí y el
 * token `--font-*` correspondiente en globals.css. No hace falta tocar nada más.
 */
export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
});

/** Clases de variables de fuente aplicadas en <html>. */
export const fontVariables = `${geistSans.variable} ${geistMono.variable} ${jost.variable}`;
