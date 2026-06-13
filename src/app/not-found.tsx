import Link from "next/link";

import { Logo } from "@/components/shop/logo";

/** Página 404 personalizada con identidad de marca. */
export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 px-4 text-center">
      <Link
        href="/"
        aria-label="NUE INTIME — Inicio"
        className="text-3xl transition-opacity hover:opacity-70"
      >
        <Logo />
      </Link>

      <div className="space-y-3">
        <p className="font-display text-6xl font-semibold tracking-tight">404</p>
        <h1 className="text-lg font-medium">Página no encontrada</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Lo sentimos, la página que buscas no existe o fue movida.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Volver al inicio
        </Link>
        <Link
          href="/tienda"
          className="rounded-full border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
        >
          Ir a la tienda
        </Link>
      </div>
    </div>
  );
}
