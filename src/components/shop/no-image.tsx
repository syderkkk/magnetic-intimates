import { cn } from "@/lib/utils";
import { Monogram } from "./monogram";

/**
 * Marcador visual para cuando un producto aún no tiene imagen (se suben desde
 * el panel). Monograma en línea taupe sobre nude — usa el símbolo de marca en
 * vez de un ícono genérico (docs/06-identidad-magnetic.md §5.4). Llena su
 * contenedor; el tamaño lo define el caller.
 */
export function NoImage({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-accent/35 text-muted-foreground",
        className,
      )}
      aria-hidden="true"
    >
      <Monogram className="size-10" />
    </div>
  );
}
