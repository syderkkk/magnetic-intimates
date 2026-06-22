import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Marcador visual para cuando un producto aún no tiene imagen (se suben desde
 * el panel). Llena su contenedor; el tamaño lo define el caller.
 */
export function NoImage({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-muted text-muted-foreground/40",
        className,
      )}
      aria-hidden="true"
    >
      <ImageOff className="size-8" />
    </div>
  );
}
