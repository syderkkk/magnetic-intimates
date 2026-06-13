"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Retardo en ms para escalonar (stagger) varios elementos. */
  delayMs?: number;
}

/**
 * Revela su contenido cuando entra en el viewport (fade-up + desenfoque sutil),
 * una sola vez. Usa IntersectionObserver (no el evento scroll) para no provocar
 * reflows continuos y mantener buen rendimiento. Respeta el movimiento reducido.
 *
 * El contenido siempre está en el DOM (solo cambia opacidad/transform): no
 * afecta al SEO ni a la carga diferida (lazy) de las imágenes de su interior.
 */
export function Reveal({ children, className, delayMs = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Si el navegador no soporta IntersectionObserver, mostrar en el siguiente
    // frame (de forma asíncrona, no síncrona dentro del efecto).
    if (typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      // Se activa un poco antes de llegar al borde inferior, para una entrada fluida.
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
      className={cn(
        "transition-[opacity,transform,filter] duration-800 ease-out will-change-transform motion-reduce:transition-none",
        visible
          ? "translate-y-0 opacity-100 blur-0"
          : "translate-y-6 opacity-0 blur-[3px] motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:blur-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
