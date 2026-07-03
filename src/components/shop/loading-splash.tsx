"use client";

import { useEffect, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { Monogram } from "./monogram";

/**
 * Piso MÍNIMO visible (ms) — no es una espera de carga, es ritmo de marca:
 * evita que el splash "parpadee" en clientes muy rápidos donde todo (fuentes,
 * imágenes) ya está listo casi al instante. En clientes lentos NO acorta nada:
 * el splash igual se queda hasta que `finish()` se dispare de verdad (ver
 * abajo), este número solo pone un piso, nunca un techo. Para ajustarlo "a tu
 * antojo": cambia SOLO este número (700 = casi imperceptible; 1800 ≈ 1.8 s).
 */
const MIN_VISIBLE_MS = 1800;
/** Duración del desvanecido (ms). */
const FADE_MS = 500;
/**
 * Tope de seguridad (ms): si `document.fonts.ready` tarda más que esto
 * (conexión muy lenta), se deja de esperar igual — nunca deja el splash
 * pegado para siempre.
 */
const FONTS_TIMEOUT_MS = 6000;
/** Clave de sesión para mostrarlo solo una vez por sesión. */
const SESSION_KEY = "magnetic-splash-shown";

/**
 * Pantalla de carga de marca.
 * Cubre el contenido hasta que las tipografías de marca están listas (evita
 * el parpadeo de fuente) y se desvanece de forma suave — se adapta sola: en
 * un cliente lento se queda más tiempo (hasta `FONTS_TIMEOUT_MS` como tope),
 * en uno rápido respeta igual el piso `MIN_VISIBLE_MS` para no parpadear. Se
 * muestra una sola vez por sesión y respeta la preferencia de movimiento
 * reducido. El contenido real ya está en el DOM debajo (no afecta SEO).
 */
export function LoadingSplash() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Si ya se mostró en esta sesión, se cierra de inmediato (sin espera).
    const alreadyShown = sessionStorage.getItem(SESSION_KEY) !== null;
    const start = performance.now();
    let cancelled = false;
    let fadeTimer: ReturnType<typeof setTimeout>;
    let removeTimer: ReturnType<typeof setTimeout>;

    const beginFade = () => {
      if (cancelled) return;
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
      if (cancelled) return;
      const minWait = alreadyShown ? 0 : MIN_VISIBLE_MS;
      const remaining = Math.max(0, minWait - (performance.now() - start));
      fadeTimer = setTimeout(beginFade, remaining);
    };

    if (alreadyShown) {
      finish();
    } else {
      // Listo de verdad = las tipografías de marca ya están aplicadas
      // (evita el parpadeo de fuente del sistema → Mazzard/Rubik, el
      // desperfecto real que puede causar un splash mal cronometrado). A
      // propósito NO se espera el evento `load` del navegador: ese evento
      // exige que TODAS las imágenes de la página terminen de descargar,
      // incluidas las que están fuera de la pantalla (grillas de abajo) — en
      // una conexión lenta eso puede tardar mucho y dejaría el splash
      // colgado sin necesidad (las imágenes fuera de vista ya cargan solas,
      // progresivamente, con su propio placeholder — eso no es un defecto).
      // `FONTS_TIMEOUT_MS` es un tope de seguridad por si `fonts.ready`
      // tardara demasiado (conexión muy lenta o algún caso raro del
      // navegador): nunca deja el splash pegado para siempre.
      const fontsReady = document.fonts?.ready ?? Promise.resolve();
      const safetyTimeout = new Promise<void>((resolve) =>
        setTimeout(resolve, FONTS_TIMEOUT_MS),
      );

      Promise.race([fontsReady, safetyTimeout]).then(finish);
    }

    return () => {
      cancelled = true;
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [prefersReducedMotion]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed inset-0 z-100 flex items-center justify-center bg-background text-foreground transition-opacity ease-out",
        fading ? "pointer-events-none opacity-0" : "opacity-100",
      )}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      {/* Resplandor radial nude que calienta el fondo sand. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 42%, rgba(209,190,173,0.35), transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-6">
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-700">
          <Monogram className="size-14 sm:size-16" />
        </div>

        <div className="text-2xl sm:text-3xl motion-safe:animate-in motion-safe:fade-in motion-safe:delay-300 motion-safe:duration-700">
          <Logo />
        </div>

        {/* Línea de carga: barre suavemente (en reposo, una línea fina). */}
        <div className="relative h-px w-24 overflow-hidden rounded-full bg-foreground/10 motion-safe:animate-in motion-safe:fade-in motion-safe:delay-500 motion-safe:duration-700">
          <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-ring motion-safe:animate-[splash-sweep_1.15s_ease-in-out_infinite] motion-reduce:hidden" />
        </div>
      </div>
    </div>
  );
}
