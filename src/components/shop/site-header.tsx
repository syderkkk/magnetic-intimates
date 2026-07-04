"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { CartSheet } from "./cart-sheet";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { SearchDialog } from "./search-dialog";

interface NavCategory {
  name: string;
  slug: string;
}

interface SiteHeaderProps {
  /** Categorías activas, para el desplegable de "Tienda" (navegación rápida). */
  categories: NavCategory[];
}

/** Retardo (ms) antes de cerrar el desplegable al salir con el mouse. */
const CLOSE_DELAY_MS = 150;

/**
 * Cabecera del sitio (barra de navegación).
 * - Pegajosa (sticky) con efecto de vidrio (blur) tipo iOS al hacer scroll.
 * - Logo centrado; navegación a la izquierda; buscador y carrito a la derecha.
 * - "Tienda" abre al pasar el mouse (o enfocar con teclado) un panel con las
 *   categorías, del mismo ancho y fondo que la cabecera — una extensión de la
 *   barra, no una tarjeta flotante aparte. Implementado a mano (sin el
 *   primitivo NavigationMenu de Radix): ese componente asume que su propio
 *   Viewport define el ancho/alto vía animación entre ítems, y pelea contra
 *   un panel de ancho completo fijo — más simple y predecible construirlo
 *   directo con posicionamiento absoluto contra la propia cabecera.
 * - En móvil, la navegación se colapsa en un menú hamburguesa (mismo listado
 *   de categorías, ver `mobile-nav.tsx`).
 */
export function SiteHeader({ categories }: SiteHeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasCategories = categories.length > 0;

  // Cierra el panel si la ruta cambia (navegación). Ajustar estado durante el
  // render (en vez de en un efecto) evita el re-render en cascada que marca
  // la regla `react-hooks/set-state-in-effect` — es el patrón recomendado de
  // React para "resetear estado cuando cambia una prop".
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setCategoriesOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Limpia el timer de cierre pendiente al desmontar.
  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  function openCategories() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setCategoriesOpen(true);
  }

  function scheduleCloseCategories() {
    closeTimer.current = setTimeout(() => setCategoriesOpen(false), CLOSE_DELAY_MS);
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-[background-color,border-color,box-shadow] duration-300 ease-out",
        // bg-background/70 (vidrio muy transparente) dejaba leerse el texto
        // del contenido que pasaba por debajo (precios, nombres de producto
        // en /tienda) superpuesto sobre la barra — confuso en páginas con
        // contenido denso, aunque se veía bien sobre la foto del inicio.
        // /95 conserva el toque de vidrio (blur) pero ya no deja pasar texto.
        scrolled
          ? "border-border/60 bg-background/95 shadow-sm supports-backdrop-filter:backdrop-blur-xl"
          : "bg-background border-transparent",
      )}
      onKeyDown={(event) => {
        if (event.key === "Escape") setCategoriesOpen(false);
      }}
    >
      <div className="mx-auto grid h-14 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 sm:px-6 lg:px-8">
        {/* Izquierda: navegación (escritorio) / hamburguesa (móvil). */}
        <div className="flex items-center justify-start gap-1">
          <MobileNav categories={categories} />
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Navegación principal"
          >
            {siteConfig.nav.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              const isTienda = link.href === "/tienda" && hasCategories;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  aria-expanded={isTienda ? categoriesOpen : undefined}
                  onMouseEnter={isTienda ? openCategories : undefined}
                  onMouseLeave={isTienda ? scheduleCloseCategories : undefined}
                  onFocus={isTienda ? openCategories : undefined}
                  className={cn(
                    "group relative rounded-full px-3 py-2 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.label}
                  {/* Subrayado animado (estética iOS) */}
                  <span
                    className={cn(
                      "bg-foreground absolute inset-x-3 -bottom-px h-px origin-left transition-transform duration-300 ease-out",
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

      {/* Panel de categorías: mismo ancho y fondo que la cabecera (hijo
          directo del <header>, así "top-full"/"inset-x-0" se miden contra
          ella y no contra el <nav> angosto). */}
      {hasCategories ? (
        <div
          onMouseEnter={openCategories}
          onMouseLeave={scheduleCloseCategories}
          className={cn(
            "border-border/60 bg-background absolute inset-x-0 top-full hidden border-b transition-[opacity,transform] duration-200 ease-out md:block",
            categoriesOpen
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-1 opacity-0",
          )}
        >
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-5 sm:px-6 lg:px-8">
            <p className="text-muted-foreground w-full text-[10px] font-medium tracking-[0.2em] uppercase">
              Categorías
            </p>
            <ul className="divide-border/70 flex flex-wrap items-center divide-x">
              {categories.map((category) => (
                <li key={category.slug} className="px-4 first:pl-0">
                  <Link
                    href={`/tienda?cat=${category.slug}`}
                    className="text-foreground/75 hover:text-foreground text-sm transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/tienda"
              className="group text-foreground ml-auto inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
            >
              Ver todo
              <ArrowRight className="size-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
