"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Logo } from "@/components/shop/logo";
import { Button } from "@/components/ui/button";

/**
 * Página de error (500) personalizada con identidad de marca.
 * Captura errores de renderizado en el cliente y ofrece reintentar.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log técnico para depuración (no visible para el usuario).
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 px-4 text-center">
      <Link
        href="/"
        aria-label="MAGNÉTIC — Inicio"
        className="text-3xl transition-opacity hover:opacity-70"
      >
        <Logo />
      </Link>

      <div className="space-y-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Algo salió mal
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Ocurrió un error inesperado. Puedes reintentar o volver al inicio.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} className="rounded-full px-6">
          Reintentar
        </Button>
        <Button asChild variant="outline" className="rounded-full px-6">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
