import Link from "next/link";

import { siteConfig } from "@/config/site";
import { Logo } from "./logo";
import { Monogram } from "./monogram";

/** Glifos de redes (lucide v1 ya no incluye íconos de marca); mismo trazo
 *  fino y contenedor redondeado para que las tres se vean como un set. */
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

function FacebookIcon({ className }: { className?: string }) {
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
      <path d="M14.5 8.75h-1.25a1.5 1.5 0 0 0-1.5 1.5V12M9.5 12h5M11.75 12v7.25" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
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
      <circle cx="10.5" cy="15.5" r="2.5" />
      <path d="M13 15.5V7.5c.45 1.7 1.8 2.9 3.5 3.05" />
    </svg>
  );
}

/** Enlaces de empresa (páginas de confianza: quiénes somos, cómo contactarnos). */
const COMPANY_LINKS = [
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
  { label: "Libro de Reclamaciones", href: "/libro-reclamaciones" },
];

/** Enlaces legales (CLAUDE.md §10). */
const LEGAL_LINKS = [
  { label: "Política de privacidad", href: "/politica-privacidad" },
  { label: "Términos y condiciones", href: "/terminos-y-condiciones" },
  { label: "Política de envíos", href: "/politica-envios" },
  { label: "Cambios y devoluciones", href: "/politica-devoluciones" },
];

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
      <Monogram className="pointer-events-none absolute top-1/2 right-6 size-40 -translate-y-1/2 text-background/10 sm:right-12 sm:size-56" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Marca */}
          <div className="col-span-2 lg:col-span-1">
            <Link
              href="/"
              aria-label={`${siteConfig.name} — Inicio`}
              className="inline-block text-2xl transition-opacity hover:opacity-70"
            >
              <Logo />
            </Link>
            <p className="mt-4 max-w-xs text-sm text-background/70">
              Intimacy with attitude: calidad, comodidad y una actitud que se
              nota, todos los días.
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
              <Link
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex size-9 items-center justify-center rounded-full border border-background/20 text-background/70 transition-colors hover:bg-background/10 hover:text-background"
              >
                <FacebookIcon className="size-4" />
              </Link>
              <Link
                href={siteConfig.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex size-9 items-center justify-center rounded-full border border-background/20 text-background/70 transition-colors hover:bg-background/10 hover:text-background"
              >
                <TikTokIcon className="size-4" />
              </Link>
            </div>
          </div>

          {/* Navegación */}
          <nav aria-label="Navegación del pie">
            <h2 className="text-xs font-medium tracking-wider text-background/50 uppercase">
              Tienda
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

          <nav aria-label="Empresa">
            <h2 className="text-xs font-medium tracking-wider text-background/50 uppercase">
              Empresa
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {COMPANY_LINKS.map((link) => (
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

          <nav aria-label="Legal">
            <h2 className="text-xs font-medium tracking-wider text-background/50 uppercase">
              Legal
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {LEGAL_LINKS.map((link) => (
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
