/**
 * ─────────────────────────────────────────────────────────────────────────
 *  CONFIGURACIÓN DEL SITIO — MAGNÉTIC
 *  Fuente única de verdad para marca, navegación, redes y la barra de anuncios.
 *
 *  Está pensado como "costura" para el futuro panel de administración: hoy son
 *  valores estáticos tipados; más adelante un `getSiteSettings()` leerá estos
 *  mismos campos desde la tabla `site_settings` y los componentes no cambiarán.
 * ─────────────────────────────────────────────────────────────────────────
 */

/** Nombres de íconos admitidos en la barra de anuncios (se resuelven en el componente). */
export type AnnouncementIcon =
  | "truck"
  | "sparkles"
  | "tag"
  | "gift"
  | "heart"
  | "star"
  | "package"
  | "none";

/** Un mensaje individual dentro de la barra de anuncios. */
export interface AnnouncementItem {
  id: string;
  text: string;
  /** Ícono opcional que precede al texto. */
  icon?: AnnouncementIcon;
}

/** Grosor visual de la cinta (alto + tamaño de texto). */
export type AnnouncementSize = "sm" | "md" | "lg";

/** Configuración completa de la barra de anuncios (administrable desde el panel). */
export interface AnnouncementConfig {
  /** Si está desactivada, la barra no se renderiza. */
  enabled: boolean;
  /** "static" = mensajes centrados fijos; "marquee" = desplazamiento continuo. */
  mode: "static" | "marquee";
  /** Dirección del desplazamiento en modo marquesina. */
  direction: "left" | "right";
  /** Duración en segundos de un ciclo completo de la marquesina (menor = más rápido). */
  speedSeconds: number;
  /** Pausa el desplazamiento al pasar el cursor. */
  pauseOnHover: boolean;
  /** Grosor de la cinta. */
  size: AnnouncementSize;
  /** Color de fondo (hex). */
  background: string;
  /** Color del texto (hex). */
  foreground: string;
  /** Mensajes a mostrar. */
  items: AnnouncementItem[];
}

/** Enlace de navegación principal. */
export interface NavLink {
  label: string;
  href: string;
}

export const siteConfig = {
  name: "MAGNÉTIC",
  /** Variante corta para contextos compactos. */
  shortName: "MAGNÉTIC",
  /** Tagline de marca ("Intimacy with attitude"). */
  tagline: "Intimacy with attitude",
  /** Descripción usada en SEO y al compartir enlaces. */
  description:
    "MAGNÉTIC — Intimacy with attitude. Lencería y prendas íntimas con actitud. Calidad, comodidad y elegancia. Envíos a todo el Perú.",
  /** URL pública del sitio (se usa como base para SEO y enlaces absolutos). */
  // TODO: confirmar con cliente — dominio magneticintimates.com pendiente de compra (CLAUDE.md §1.1).
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Locale para metadatos Open Graph. */
  locale: "es_PE",

  /**
   * Portada del inicio (nivel 2: default de código). El admin puede
   * sobrescribir título/subtítulo/imagen desde Apariencia (nivel 3,
   * `site_settings`) — CLAUDE.md §11.13. Única fuente de este texto: úsalo
   * tanto en la página como en el placeholder del formulario de admin para
   * que no queden dos copias del mismo texto pudiendo desincronizarse.
   */
  hero: {
    title: "Encuentra tu magnetismo",
    subtitle:
      "Lencería con actitud: calidad y comodidad que se sienten todos los días, no solo en ocasiones especiales.",
  },

  /**
   * Navegación principal. "Tienda" es el catálogo completo, en /tienda (etiqueta
   * y URL coinciden). Las colecciones/campañas concretas vivirán bajo
   * /coleccion/[slug] cuando existan, reutilizando la misma página de catálogo.
   */
  nav: [
    { label: "Inicio", href: "/" },
    { label: "Tienda", href: "/tienda" },
  ] satisfies NavLink[],

  /** Redes y contacto (editable desde admin a futuro). */
  social: {
    instagram: "https://instagram.com",
    tiktok: "https://tiktok.com",
    facebook: "https://facebook.com",
    // TODO: confirmar con cliente — número real de WhatsApp del negocio.
    // Placeholder SOLO para previsualizar el botón flotante; reemplazar los
    // dígitos por el número real (con código de país) antes de publicar.
    whatsapp: "51999999999",
  },

  /**
   * Barra de anuncios. Negra con texto sand — funciona bien como remate junto
   * al footer (decisión confirmada con el cliente 2026-07-04, tras probar la
   * variante nude). Todo aquí es ajustable: contenido, modo, velocidad,
   * dirección, íconos y color.
   */
  announcement: {
    enabled: true,
    mode: "marquee",
    direction: "left",
    speedSeconds: 30,
    pauseOnHover: true,
    size: "sm",
    background: "#0e0e0d",
    foreground: "#f7f4ef",
    items: [
      { id: "envios", text: "Envíos a todo el Perú", icon: "truck" },
      {
        id: "lanzamiento",
        text: "Nueva colección disponible",
        icon: "sparkles",
      },
      {
        id: "atencion",
        text: "Atención por WhatsApp de lunes a sábado",
        icon: "heart",
      },
    ],
  } satisfies AnnouncementConfig,
} as const;

export type SiteConfig = typeof siteConfig;
