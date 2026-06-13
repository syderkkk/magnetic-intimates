"use client";

import { useEffect } from "react";

import "./globals.css";

/**
 * Error global: se usa solo si falla el propio layout raíz.
 * Debe definir su propio <html> y <body>. Se mantiene minimalista y autónomo.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center text-foreground antialiased">
        <h1 className="text-2xl font-semibold tracking-tight">
          Algo salió mal
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Ocurrió un error inesperado. Por favor, intenta de nuevo.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background"
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}
