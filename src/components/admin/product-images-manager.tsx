"use client";

import { CircleAlert, ImagePlus, LoaderCircle, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  deleteProductImage,
  setPrimaryImage,
  updateImageAlt,
  uploadProductImage,
} from "@/actions/product-images";
import { cn } from "@/lib/utils";

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

interface ProductImagesManagerProps {
  productId: string;
  images: ProductImage[];
}

const MAX_IMAGES = 6;

/**
 * Gestor de imágenes del producto en el panel: subir (con validación y
 * normalización en el servidor), marcar principal, editar alt y eliminar.
 */
export function ProductImagesManager({
  productId,
  images,
}: ProductImagesManagerProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const full = images.length >= MAX_IMAGES;

  function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // permite volver a elegir el mismo archivo
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setError(null);
    startTransition(async () => {
      const result = await uploadProductImage(productId, formData);
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  function runAction(action: () => Promise<{ success: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) setError(result.error ?? "Ocurrió un error.");
      else router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-wide uppercase">
          Imágenes
          <span className="ml-2 text-xs font-normal text-muted-foreground tabular-nums">
            {images.length}/{MAX_IMAGES}
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image) => (
          <div
            key={image.id}
            className="group/img relative overflow-hidden rounded-xl border bg-muted"
          >
            <div className="relative aspect-square">
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 50vw, 200px"
                className="object-cover"
              />
              {image.isPrimary ? (
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background">
                  <Star className="size-3 fill-background" aria-hidden="true" />
                  Principal
                </span>
              ) : null}

              {/* Acciones */}
              <div className="absolute top-2 right-2 flex gap-1.5">
                {!image.isPrimary ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => runAction(() => setPrimaryImage(image.id))}
                    aria-label="Marcar como principal"
                    title="Marcar como principal"
                    className="flex size-7 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background disabled:opacity-50"
                  >
                    <Star className="size-3.5" aria-hidden="true" />
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => runAction(() => deleteProductImage(image.id))}
                  aria-label="Eliminar imagen"
                  title="Eliminar"
                  className="flex size-7 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-destructive hover:text-white disabled:opacity-50"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Texto alternativo (accesibilidad + SEO) */}
            <div className="p-2">
              <label htmlFor={`alt-${image.id}`} className="sr-only">
                Texto alternativo de la imagen
              </label>
              <input
                id={`alt-${image.id}`}
                defaultValue={image.alt}
                placeholder="Texto alternativo…"
                disabled={pending}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (value && value !== image.alt) {
                    runAction(() => updateImageAlt({ imageId: image.id, alt: value }));
                  }
                }}
                className="w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
              />
            </div>
          </div>
        ))}

        {/* Botón de subida */}
        {!full ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm text-muted-foreground transition-colors hover:border-foreground hover:bg-muted hover:text-foreground disabled:opacity-50",
            )}
          >
            {pending ? (
              <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <ImagePlus className="size-5" aria-hidden="true" />
            )}
            <span className="text-xs font-medium">
              {pending ? "Procesando…" : "Subir imagen"}
            </span>
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onPick}
        className="hidden"
      />

      {error ? (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}

      <p className="text-xs text-muted-foreground">
        JPG, PNG o WebP, hasta 5 MB. Se optimizan automáticamente (WebP, máx.
        1500px). La primera o la marcada con ★ es la principal.
      </p>
    </div>
  );
}
