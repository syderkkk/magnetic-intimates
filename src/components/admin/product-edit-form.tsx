"use client";

import { Check, CircleAlert, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateProduct } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionResult } from "@/types/action";

interface ProductEditFormProps {
  product: {
    id: string;
    name: string;
    slug: string;
    categoryId: string;
    priceCents: number;
    compareAtPriceCents: number | null;
    badge: string | null;
    description: string | null;
    composition: string | null;
    isActive: boolean;
    isFeatured: boolean;
  };
  categories: { id: string; name: string }[];
}

const BADGES = [
  { value: "", label: "Sin etiqueta" },
  { value: "nuevo", label: "Nuevo" },
  { value: "bestseller", label: "Más vendido" },
  { value: "oferta", label: "Oferta" },
];

/** Convierte céntimos a un string editable en soles (ej. 12900 → "129.00"). */
function toSoles(cents: number | null): string {
  return cents == null ? "" : (cents / 100).toFixed(2);
}

export function ProductEditForm({ product, categories }: ProductEditFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [priceSoles, setPriceSoles] = useState(toSoles(product.priceCents));
  const [compareAtSoles, setCompareAtSoles] = useState(
    toSoles(product.compareAtPriceCents),
  );
  const [badge, setBadge] = useState(product.badge ?? "");
  const [description, setDescription] = useState(product.description ?? "");
  const [composition, setComposition] = useState(product.composition ?? "");
  const [isActive, setIsActive] = useState(product.isActive);
  const [isFeatured, setIsFeatured] = useState(product.isFeatured);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);

    const input = {
      id: product.id,
      name,
      slug,
      categoryId,
      priceSoles: Number(priceSoles),
      compareAtSoles: compareAtSoles.trim() === "" ? null : Number(compareAtSoles),
      badge: badge === "" ? null : badge,
      description,
      composition,
      isActive,
      isFeatured,
    };

    startTransition(async () => {
      const res = await updateProduct(input);
      setResult(res);
      if (res.success) router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
      <Field label="Nombre" htmlFor="name">
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11"
          required
        />
      </Field>

      <Field label="Slug (URL)" htmlFor="slug" hint="Minúsculas, números y guiones.">
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="h-11 font-mono"
          required
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Categoría" htmlFor="category">
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Etiqueta" htmlFor="badge">
          <select
            id="badge"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {BADGES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Precio (S/)" htmlFor="price">
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={priceSoles}
            onChange={(e) => setPriceSoles(e.target.value)}
            className="h-11 tabular-nums"
            required
          />
        </Field>
        <Field
          label="Precio anterior (S/)"
          htmlFor="compareAt"
          hint="Opcional, para mostrar oferta."
        >
          <Input
            id="compareAt"
            type="number"
            step="0.01"
            min="0"
            value={compareAtSoles}
            onChange={(e) => setCompareAtSoles(e.target.value)}
            className="h-11 tabular-nums"
            placeholder="—"
          />
        </Field>
      </div>

      <Field label="Descripción" htmlFor="description">
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        />
      </Field>

      <Field label="Composición y cuidado" htmlFor="composition">
        <textarea
          id="composition"
          value={composition}
          onChange={(e) => setComposition(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        />
      </Field>

      <div className="flex flex-wrap gap-6 pt-1">
        <Toggle label="Activo" checked={isActive} onChange={setIsActive} />
        <Toggle label="Destacado" checked={isFeatured} onChange={setIsFeatured} />
      </div>

      {result ? (
        <p
          role="alert"
          className={
            result.success
              ? "flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700"
              : "flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          }
        >
          {result.success ? (
            <>
              <Check className="size-4 shrink-0" aria-hidden="true" />
              Cambios guardados.
            </>
          ) : (
            <>
              <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
              {result.error}
            </>
          )}
        </p>
      ) : null}

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={pending}
          className="h-11 rounded-full px-6 text-sm"
        >
          {pending ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              Guardando…
            </>
          ) : (
            "Guardar cambios"
          )}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={
          checked
            ? "relative h-6 w-10 rounded-full bg-foreground transition-colors"
            : "relative h-6 w-10 rounded-full bg-border transition-colors"
        }
      >
        <span
          className={
            checked
              ? "absolute top-0.5 left-0.5 size-5 translate-x-4 rounded-full bg-background transition-transform"
              : "absolute top-0.5 left-0.5 size-5 translate-x-0 rounded-full bg-background transition-transform"
          }
        />
      </button>
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}
