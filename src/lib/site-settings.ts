import "server-only";

import { siteConfig, type AnnouncementConfig } from "@/config/site";
import { db } from "@/lib/db";
import { announcementSchema } from "@/schemas/announcement";

/** Clave del ajuste donde se guarda la cinta de anuncios (JSON). */
export const ANNOUNCEMENT_KEY = "announcement";

/**
 * Lee la configuración de la cinta de anuncios desde la BD. Parseo defensivo:
 * ante JSON ausente o inválido, devuelve el valor por defecto del sitio (la
 * cinta nunca rompe la página).
 */
export async function getAnnouncement(): Promise<AnnouncementConfig> {
  const row = await db.siteSetting.findUnique({
    where: { key: ANNOUNCEMENT_KEY },
  });
  if (row?.value) {
    try {
      const parsed = announcementSchema.safeParse(JSON.parse(row.value));
      if (parsed.success) return parsed.data;
    } catch {
      // JSON corrupto: usar el valor por defecto.
    }
  }
  return siteConfig.announcement;
}

/**
 * Configuración del sitio (tabla `site_settings`, pares clave/valor). Centraliza
 * la lectura para que las páginas públicas y el admin consuman lo mismo. A
 * futuro un caché podría memorizar esto; por ahora es una consulta directa.
 */
export type SiteSettings = Record<string, string>;

export async function getSiteSettings(): Promise<SiteSettings> {
  const rows = await db.siteSetting.findMany();
  const settings: SiteSettings = {};
  for (const row of rows) {
    settings[row.key] = row.value ?? "";
  }
  return settings;
}

/** Claves conocidas de configuración (evita strings sueltos repartidos). */
export const SETTING_KEYS = {
  heroImage: "hero_image_url",
  heroTitle: "hero_title",
  heroSubtitle: "hero_subtitle",
} as const;
