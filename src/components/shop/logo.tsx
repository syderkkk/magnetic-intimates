import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Muestra el tagline "Intimacy with attitude" bajo "MAGNÉTIC". */
  withSubtitle?: boolean;
}

/**
 * Marca tipográfica MAGNÉTIC.
 * Se construye con texto (wordmark en `font-display`/Mazzard, tagline en
 * `font-sans`/Rubik) en lugar de imagen para que sea nítida a cualquier
 * tamaño y recoloreable vía `currentColor`. El tamaño se controla con
 * `font-size` del contenedor (todo es relativo en em).
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
      <span className="text-[1em] font-normal tracking-[0.22em]">
        MAGNÉTIC
      </span>
      {withSubtitle && (
        <span className="mt-[0.32em] font-sans text-[0.19em] font-light tracking-[0.28em] text-current/70">
          Intimacy with attitude
        </span>
      )}
    </span>
  );
}
