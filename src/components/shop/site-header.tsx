"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { CartSheet } from "./cart-sheet";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { SearchDialog } from "./search-dialog";

/**
 * Cabecera del sitio (barra de navegación).
 * - Pegajosa (sticky) con efecto de vidrio (blur) tipo iOS al hacer scroll.
 * - Logo centrado; navegación a la izquierda; buscador y carrito a la derecha.
 * - En móvil, la navegación se colapsa en un menú hamburguesa.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-[background-color,border-color] duration-300 ease-out",
        scrolled
          ? "border-border/60 bg-background/70 supports-backdrop-filter:backdrop-blur-xl"
          : "border-transparent bg-background",
      )}
    >
      <div className="mx-auto grid h-14 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 sm:px-6 lg:px-8">
        {/* Izquierda: navegación (escritorio) / hamburguesa (móvil). */}
        <div className="flex items-center justify-start gap-1">
          <MobileNav />
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Navegación principal"
          >
            {siteConfig.nav.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative rounded-full px-3 py-2 text-sm transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.label}
                  {/* Subrayado animado (estética iOS) */}
                  <span
                    className={cn(
                      "absolute inset-x-3 -bottom-px h-px origin-left bg-foreground transition-transform duration-300 ease-out",
                      active
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Centro: marca */}
        <Link
          href="/"
          aria-label={`${siteConfig.name} — Inicio`}
          className="justify-self-center text-2xl transition-opacity hover:opacity-70"
        >
          <Logo />
        </Link>

        {/* Derecha: buscador y carrito */}
        <div className="flex items-center justify-end gap-0.5">
          <SearchDialog />
          <CartSheet />
        </div>
      </div>
    </header>
  );
}
