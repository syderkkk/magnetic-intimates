"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

interface NavCategory {
  name: string;
  slug: string;
}

interface MobileNavProps {
  /** Mismas categorías que el desplegable de escritorio (ver `site-header.tsx`). */
  categories: NavCategory[];
}

/** Navegación para móvil: botón hamburguesa que abre un panel lateral. */
export function MobileNav({ categories }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-full md:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-72 gap-0">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="text-2xl">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              aria-label="MAGNÉTIC — Inicio"
              className="inline-block transition-opacity hover:opacity-70"
            >
              <Logo />
            </Link>
            <span className="sr-only">Menú principal</span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Navegación principal del sitio
          </SheetDescription>
        </SheetHeader>

        <nav
          className="flex flex-col gap-1 px-3 py-4"
          aria-label="Navegación principal"
        >
          {siteConfig.nav.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            const showCategories =
              link.href === "/tienda" && categories.length > 0;
            return (
              <div key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block rounded-lg px-3 py-3 text-lg font-medium transition-colors",
                    active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
                {/* Categorías: navegación rápida sin pasar por /tienda a filtrar a mano. */}
                {showCategories ? (
                  <ul className="mt-1 mb-2 ml-3 space-y-0.5 border-l pl-3">
                    {categories.map((category) => (
                      <li key={category.slug}>
                        <Link
                          href={`/tienda?cat=${category.slug}`}
                          onClick={() => setOpen(false)}
                          className="text-muted-foreground hover:bg-muted hover:text-foreground block rounded-lg px-3 py-2 text-sm transition-colors"
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
