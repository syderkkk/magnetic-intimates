"use client";

import { Check, CircleAlert, LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteCategory, updateCategory } from "@/actions/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionResult } from "@/types/action";

interface CategoryEditFormProps {
  category: {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
  };
}

export function CategoryEditForm({ category }: CategoryEditFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description ?? "");
  const [isActive, setIsActive] = useState(category.isActive);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    startTransition(async () => {
      const res = await updateCategory({
        id: category.id,
        name,
        description,
        isActive,
      });
      setResult(res);
      if (res.success) router.refresh();
    });
  }

  function onDelete() {
    setResult(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", category.id);
      const res = await deleteCategory(formData);
      // En éxito redirige a la lista; aquí solo manejamos el error.
      if (!res.success) {
        setResult(res);
        setConfirmDelete(false);
      }
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="cat-name" className="block text-sm font-medium">
            Nombre
          </label>
          <Input
            id="cat-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11"
            required
          />
          <p className="text-xs text-muted-foreground">
            Cambiarlo también actualiza su enlace en la tienda.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="cat-desc" className="block text-sm font-medium">
            Descripción (opcional)
          </label>
          <textarea
            id="cat-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 select-none">
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            aria-label="Categoría activa"
            onClick={() => setIsActive((v) => !v)}
            className={
              isActive
                ? "relative h-6 w-10 rounded-full bg-foreground transition-colors"
                : "relative h-6 w-10 rounded-full bg-border transition-colors"
            }
          >
            <span
              className={
                isActive
                  ? "absolute top-0.5 left-0.5 size-5 translate-x-4 rounded-full bg-background transition-transform"
                  : "absolute top-0.5 left-0.5 size-5 translate-x-0 rounded-full bg-background transition-transform"
              }
            />
          </button>
          <span className="text-sm font-medium">
            Activa{" "}
            <span className="font-normal text-muted-foreground">
              (visible en la tienda)
            </span>
          </span>
        </label>

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
                <Check className="size-4 shrink-0" aria-hidden="true" /> Guardado.
              </>
            ) : (
              <>
                <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
                {result.error}
              </>
            )}
          </p>
        ) : null}

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
      </form>

      {/* Eliminar (con confirmación en dos pasos) */}
      <div className="border-t pt-5">
        {confirmDelete ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm">¿Eliminar esta categoría?</span>
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={onDelete}
              className="h-9 rounded-full px-4 text-sm"
            >
              Sí, eliminar
            </Button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Eliminar categoría
          </button>
        )}
      </div>
    </div>
  );
}
