"use client";

import {
  Gift,
  Heart,
  Package,
  Sparkles,
  Star,
  Tag,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { Fragment } from "react";

import {
  siteConfig,
  type AnnouncementConfig,
  type AnnouncementIcon,
} from "@/config/site";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

/** Mapa de nombre de ícono → componente (el admin guardará solo el nombre). */
const ICONS: Record<Exclude<AnnouncementIcon, "none">, LucideIcon> = {
  truck: Truck,
  sparkles: Sparkles,
  tag: Tag,
  gift: Gift,
  heart: Heart,
  star: Star,
  package: Package,
};

interface AnnouncementBarProps {
  /** Configuración de la barra. Por defecto, la del sitio (editable a futuro desde admin). */
  config?: AnnouncementConfig;
}

/** Renderiza un mensaje individual con su ícono opcional. */
function AnnouncementMessage({
  text,
  icon,
}: {
  text: string;
  icon?: AnnouncementIcon;
}) {
  const Icon = icon && icon !== "none" ? ICONS[icon] : null;
  return (
    <span className="flex items-center gap-2">
      {Icon ? <Icon className="size-3.5 shrink-0" aria-hidden="true" /> : null}
      <span>{text}</span>
    </span>
  );
}

/** Separador entre mensajes (un punto medio). */
function Separator() {
  return (
    <span aria-hidden="true" className="px-6 opacity-40">
      •
    </span>
  );
}

/**
 * Barra de anuncios sobre la barra de navegación.
 * - Modo "static": mensajes centrados, sin movimiento.
 * - Modo "marquee": desplazamiento continuo (izquierda/derecha), con velocidad,
 *   color y pausa al pasar el cursor configurables.
 * Si el usuario prefiere movimiento reducido, se muestra en modo estático.
 */
export function AnnouncementBar({
  config = siteConfig.announcement,
}: AnnouncementBarProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (!config.enabled || config.items.length === 0) return null;

  const isMarquee = config.mode === "marquee" && !prefersReducedMotion;

  // Colores configurables, aplicados por estilo en línea (editable desde admin).
  const colorStyle = {
    background: config.background,
    color: config.foreground,
  } as const;

  if (!isMarquee) {
    return (
      <aside
        aria-label="Anuncios"
        style={colorStyle}
        className="flex w-full items-center justify-center overflow-hidden px-4 py-2 text-center text-xs tracking-wide"
      >
        <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1">
          {config.items.map((item, index) => (
            <Fragment key={item.id}>
              {index > 0 ? <Separator /> : null}
              <AnnouncementMessage text={item.text} icon={item.icon} />
            </Fragment>
          ))}
        </div>
      </aside>
    );
  }

  // Modo marquesina: se duplica el grupo de mensajes para un bucle sin cortes.
  // La animación translada el track un 50% (un grupo completo) → bucle perfecto.
  const animationName =
    config.direction === "right" ? "marquee-right" : "marquee-left";

  const renderGroup = (ariaHidden: boolean) => (
    <div
      aria-hidden={ariaHidden}
      className="flex shrink-0 items-center whitespace-nowrap"
    >
      {config.items.map((item) => (
        <Fragment key={item.id}>
          <span className="px-6">
            <AnnouncementMessage text={item.text} icon={item.icon} />
          </span>
          <Separator />
        </Fragment>
      ))}
    </div>
  );

  return (
    <aside
      aria-label="Anuncios"
      style={colorStyle}
      className="group/marquee w-full overflow-hidden py-2 text-xs tracking-wide"
    >
      <div
        className={cn(
          "flex w-max",
          config.pauseOnHover && "group-hover/marquee:paused",
        )}
        style={{
          animationName,
          animationDuration: `${config.speedSeconds}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
        }}
      >
        {renderGroup(false)}
        {renderGroup(true)}
      </div>
    </aside>
  );
}
