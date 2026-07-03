import Link from "next/link";

import { siteConfig } from "@/config/site";
import { Logo } from "./logo";
import { Monogram } from "./monogram";

/** Glifo de Instagram (lucide v1 ya no incluye íconos de marca). */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Los enlaces de información/legal (Nosotros, Contacto, Libro de Reclamaciones,
// Términos) se mostrarán cuando existan esas páginas (fase legal). Por ahora se
// omiten para no enlazar a 404.

/**
 * Pie de página del sitio: negro de marca con texto sand — cierra la página
 * con la dualidad claro/oscuro de MAGNÉTIC (docs/06-identidad-magnetic.md §5.9).
 * El monograma grande a la derecha es una marca de agua decorativa, no un logo
 * clicable (por eso `aria-hidden`).
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-foreground text-background">
      <Monogram className="pointer-events-none absolute -top-10 -right-10 size-56 text-background/10 sm:size-72" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-3">
          {/* Marca */}
          <div className="col-span-2 md:col-span-2">
            <Link
              href="/"
              aria-label={`${siteConfig.name} — Inicio`}
              className="inline-block text-2xl transition-opacity hover:opacity-70"
            >
              <Logo />
            </Link>
            <p className="mt-4 max-w-xs text-sm text-background/70">
              Lencería y prendas íntimas que combinan calidad, comodidad y
              elegancia.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Link
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex size-9 items-center justify-center rounded-full border border-background/20 text-background/70 transition-colors hover:bg-background/10 hover:text-background"
              >
                <InstagramIcon className="size-4" />
              </Link>
            </div>
          </div>

          {/* Navegación */}
          <nav aria-label="Navegación del pie">
            <h2 className="text-xs font-medium tracking-wider text-background/50 uppercase">
              Explorar
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {siteConfig.nav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-background/80 transition-colors hover:text-background"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-background/15 pt-6 text-xs text-background/60 sm:flex-row">
          <p>
            © {year} {siteConfig.name}. Todos los derechos reservados.
          </p>
          <p>🇵🇪</p>
        </div>
      </div>
    </footer>
  );
}
