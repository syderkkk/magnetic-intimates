import Link from "next/link";

import { siteConfig } from "@/config/site";
import { Logo } from "./logo";

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

/** Enlaces de información/legal. Las páginas se construyen en la fase legal (v0.6). */
const INFO_LINKS = [
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
  { label: "Libro de Reclamaciones", href: "/libro-reclamaciones" },
  { label: "Políticas y términos", href: "/terminos" },
];

/** Pie de página del sitio. */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {/* Marca */}
          <div className="col-span-2 md:col-span-2">
            <Link
              href="/"
              aria-label={`${siteConfig.name} — Inicio`}
              className="inline-block text-2xl transition-opacity hover:opacity-70"
            >
              <Logo />
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Lencería y prendas íntimas con diseño minimalista. Calidad,
              comodidad y elegancia.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Link
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex size-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <InstagramIcon className="size-4" />
              </Link>
            </div>
          </div>

          {/* Navegación */}
          <nav aria-label="Navegación del pie">
            <h2 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Explorar
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {siteConfig.nav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Información */}
          <nav aria-label="Información">
            <h2 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Información
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {INFO_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {year} {siteConfig.name}. Todos los derechos reservados.
          </p>
          <p>🇵🇪</p>
        </div>
      </div>
    </footer>
  );
}
