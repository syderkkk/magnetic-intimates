"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * Buscador del sitio: un botón en la cabecera que abre un panel superior con
 * un campo de búsqueda. Al enviar, navega a /tienda?q=… donde se filtran los
 * productos. Mantiene la cabecera limpia y funciona en móvil y escritorio.
 */
export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    setOpen(false);
    router.push(term ? `/tienda?q=${encodeURIComponent(term)}` : "/tienda");
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-full"
          aria-label="Buscar"
        >
          <Search className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="top"
        className="border-b px-0 supports-backdrop-filter:bg-background/90 supports-backdrop-filter:backdrop-blur-xl"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Buscar</SheetTitle>
          <SheetDescription>Buscar productos en la tienda</SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-6 sm:px-6"
        >
          <Search
            className="size-5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            autoFocus
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar prendas, categorías…"
            aria-label="Texto de búsqueda"
            className="h-11 flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
          />
          <Button type="submit" className="h-10 rounded-full px-5">
            Buscar
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
