import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Muestra el subtítulo "INTIME" bajo "NUE". */
  withSubtitle?: boolean;
}

/**
 * Marca tipográfica NUE INTIME.
 * Se construye con texto (tipografía `font-display`) en lugar de imagen para
 * que sea nítida a cualquier tamaño y recoloreable vía `currentColor`.
 * El tamaño se controla con `font-size` del contenedor (todo es relativo en em).
 */
export function Logo({ className, withSubtitle = true }: LogoProps) {
  return (
    <span
      className={cn(
        "inline-flex flex-col items-center font-display leading-none text-current",
        className,
      )}
      aria-hidden="true"
    >
      <span className="text-[1em] font-semibold tracking-[0.04em]">NUE</span>
      {withSubtitle && (
        <span className="mt-[0.18em] pl-[0.42em] text-[0.32em] font-light tracking-[0.52em]">
          INTIME
        </span>
      )}
    </span>
  );
}
