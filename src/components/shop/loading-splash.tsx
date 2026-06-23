"use client";

import { useEffect, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

/** Tiempo mínimo visible (ms) para que el splash no parpadee en cargas rápidas. */
const MIN_VISIBLE_MS = 700;
/** Duración del desvanecido (ms). */
const FADE_MS = 500;
/** Clave de sesión para mostrarlo solo una vez por sesión. */
const SESSION_KEY = "nue-splash-shown";

/**
 * Pantalla de carga de marca.
 * Cubre el contenido mientras la página termina de cargar y se desvanece de
 * forma suave. Se muestra una sola vez por sesión y respeta la preferencia de
 * movimiento reducido. El contenido real ya está en el DOM debajo (no afecta SEO).
 */
export function LoadingSplash() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Si ya se mostró en esta sesión, se cierra de inmediato (sin espera).
    const alreadyShown = sessionStorage.getItem(SESSION_KEY) !== null;
    const start = performance.now();
    let fadeTimer: ReturnType<typeof setTimeout>;
    let removeTimer: ReturnType<typeof setTimeout>;

    const beginFade = () => {
      setFading(true);
      removeTimer = setTimeout(
        () => {
          setVisible(false);
          sessionStorage.setItem(SESSION_KEY, "1");
        },
        prefersReducedMotion ? 0 : FADE_MS,
      );
    };

    const finish = () => {
      const minWait = alreadyShown ? 0 : MIN_VISIBLE_MS;
      const remaining = Math.max(0, minWait - (performance.now() - start));
      fadeTimer = setTimeout(beginFade, remaining);
    };

    // Espera a que la página termine de cargar (o procede ya si corresponde).
    if (alreadyShown || document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
    }

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
      window.removeEventListener("load", finish);
    };
  }, [prefersReducedMotion]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed inset-0 z-100 flex items-center justify-center bg-[#f6f1ec] text-neutral-900 transition-opacity ease-out",
        fading ? "pointer-events-none opacity-0" : "opacity-100",
      )}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      {/* Resplandor radial cálido (un toque rosado) que suaviza el marfil. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 42%, rgba(201,167,161,0.20), transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-7">
        <div className="text-5xl motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-700 sm:text-6xl">
          <Logo />
        </div>

        {/* Línea de carga: barre suavemente (en reposo, una línea fina). */}
        <div className="relative h-px w-24 overflow-hidden rounded-full bg-neutral-900/10 motion-safe:animate-in motion-safe:fade-in motion-safe:delay-300 motion-safe:duration-700">
          <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-[#c9a7a1] motion-safe:animate-[splash-sweep_1.15s_ease-in-out_infinite] motion-reduce:hidden" />
        </div>
      </div>
    </div>
  );
}
