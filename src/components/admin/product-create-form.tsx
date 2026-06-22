"use client";

import { CircleAlert, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { createProduct } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/data/filters";

interface ProductCreateFormProps {
  categories: { id: string; name: string }[];
}

const BADGES = [
  { value: "", label: "Sin etiqueta" },
  { value: "nuevo", label: "Nuevo" },
  { value: "bestseller", label: "Más vendido" },
  { value: "oferta", label: "Oferta" },
];

const selectClasses =
  "h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

/**
 * Crear producto: datos esenciales + opcionales. Nace como borrador (inactivo)
 * y redirige a su edición para añadir variantes/stock e imágenes.
 */
export function ProductCreateForm({ categories }: ProductCreateFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [price, setPrice] = useState("");
  const [compareAt, setCompareAt] = useState("");
  const [badge, setBadge] = useState("");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  function onNameChange(value: string) {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createProduct({
        name,
        slug,
        categoryId,
        priceSoles: Number(price),
        compareAtSoles: compareAt.trim() === "" ? null : Number(compareAt),
        badge: badge === "" ? null : badge,
        description,
        isFeatured,
      });
      // En éxito redirige a la edición; aquí solo manejamos el error.
      if (!result.success) setError(result.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <p className="rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground">
        Se crea como <strong>borrador</strong>. Luego añadirás variantes (tallas,
        colores y stock) e imágenes, y podrás activarlo para la tienda.
      </p>

      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-sm font-medium">
          Nombre
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="h-11"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="slug" className="block text-sm font-medium">
          Slug (URL)
        </label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugEdited(true);
          }}
          className="h-11 font-mono"
          required
        />
        <p className="text-xs text-muted-foreground">
          Se genera del nombre; puedes ajustarlo.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="category" className="block text-sm font-medium">
            Categoría
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={selectClasses}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="badge" className="block text-sm font-medium">
            Etiqueta
          </label>
          <select
            id="badge"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            className={selectClasses}
          >
            {BADGES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="price" className="block text-sm font-medium">
            Precio (S/)
          </label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="h-11 tabular-nums"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="compareAt" className="block text-sm font-medium">
            Precio anterior (S/)
          </label>
          <Input
            id="compareAt"
            type="number"
            step="0.01"
            min="0"
            value={compareAt}
            onChange={(e) => setCompareAt(e.target.value)}
            className="h-11 tabular-nums"
            placeholder="Opcional, para oferta"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="description" className="block text-sm font-medium">
          Descripción (opcional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 select-none">
        <button
          type="button"
          role="switch"
          aria-checked={isFeatured}
          aria-label="Destacado"
          onClick={() => setIsFeatured((v) => !v)}
          className={
            isFeatured
              ? "relative h-6 w-10 rounded-full bg-foreground transition-colors"
              : "relative h-6 w-10 rounded-full bg-border transition-colors"
          }
        >
          <span
            className={
              isFeatured
                ? "absolute top-0.5 left-0.5 size-5 translate-x-4 rounded-full bg-background transition-transform"
                : "absolute top-0.5 left-0.5 size-5 translate-x-0 rounded-full bg-background transition-transform"
            }
          />
        </button>
        <span className="text-sm font-medium">Destacado en el inicio</span>
      </label>

      {error ? (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3 pt-1">
        <Button
          type="submit"
          disabled={pending}
          className="h-11 rounded-full px-6 text-sm"
        >
          {pending ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              Creando…
            </>
          ) : (
            "Crear y continuar"
          )}
        </Button>
        <Link
          href="/admin/productos"
          className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
