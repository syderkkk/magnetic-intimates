"use client";

import { CircleAlert, ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { NoImage } from "@/components/shop/no-image";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/types/action";

// Límites espejo de la validación del servidor (CLAUDE.md §11.4), para dar
// feedback inmediato en el cliente antes de enviar.
const MAX_UPLOAD_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ImageUploaderProps {
  currentUrl: string | null;
  alt?: string;
  /** Campos extra que se añaden al FormData (ej. categoryId, key). */
  fields?: Record<string, string>;
  uploadAction: (formData: FormData) => Promise<ActionResult>;
  removeAction?: (formData: FormData) => Promise<ActionResult>;
  /** Proporción del preview (ej. "aspect-video", "aspect-3/4"). */
  aspectClass?: string;
}

/**
 * Subidor de UNA imagen con preview (reemplazar/quitar). Reutilizable para la
 * portada del inicio, las categorías, etc. Las acciones de servidor llegan por
 * props; los campos extra (id/clave) se adjuntan al FormData.
 */
export function ImageUploader({
  currentUrl,
  alt = "",
  fields,
  uploadAction,
  removeAction,
  aspectClass = "aspect-video",
}: ImageUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function buildFormData(file?: File) {
    const formData = new FormData();
    if (file) formData.append("file", file);
    if (fields) {
      for (const [key, value] of Object.entries(fields)) {
        formData.append(key, value);
      }
    }
    return formData;
  }

  function run(action: (fd: FormData) => Promise<ActionResult>, file?: File) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await action(buildFormData(file));
        if (!result.success) setError(result.error);
        else router.refresh();
      } catch {
        // Cualquier rechazo del servidor (límite de tamaño 413, corte de red,
        // error inesperado) se muestra aquí sin tumbar la página.
        setError(
          "No se pudo subir la imagen. Verifica que pese menos de 5 MB y vuelve a intentarlo.",
        );
      }
    });
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "relative w-full max-w-sm overflow-hidden rounded-xl border bg-muted",
          aspectClass,
        )}
      >
        {currentUrl ? (
          <Image
            src={currentUrl}
            alt={alt}
            fill
            sizes="384px"
            className="object-cover"
          />
        ) : (
          <NoImage className="absolute inset-0 size-full" />
        )}
        {pending ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <LoaderCircle className="size-6 animate-spin" aria-hidden="true" />
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:border-foreground hover:bg-muted active:scale-[0.98] disabled:opacity-50"
        >
          <ImagePlus className="size-4" aria-hidden="true" />
          {currentUrl ? "Reemplazar" : "Subir imagen"}
        </button>
        {currentUrl && removeAction ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(removeAction)}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive hover:text-destructive active:scale-[0.98] disabled:opacity-50"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Quitar
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          if (!ACCEPTED_TYPES.includes(file.type)) {
            setError("Formato no permitido. Usa JPG, PNG o WebP.");
            return;
          }
          if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
            setError(`La imagen supera el máximo de ${MAX_UPLOAD_MB} MB.`);
            return;
          }
          run(uploadAction, file);
        }}
        className="hidden"
      />

      {error ? (
        <p
          role="alert"
          className="flex items-center gap-2 text-sm text-destructive"
        >
          <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        JPG, PNG o WebP, hasta 5 MB. Se optimiza automáticamente (WebP).
      </p>
    </div>
  );
}
