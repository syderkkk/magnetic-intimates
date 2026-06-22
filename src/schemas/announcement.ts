import { z } from "zod";

/**
 * Validación de la configuración de la cinta de anuncios. Se usa al guardar
 * (Server Action) y al leer de la BD (parseo defensivo: si el JSON guardado es
 * inválido, se cae al valor por defecto del sitio).
 */

/** Íconos admitidos en los mensajes (deben coincidir con el mapa del componente). */
export const ANNOUNCEMENT_ICONS = [
  "none",
  "truck",
  "sparkles",
  "tag",
  "gift",
  "heart",
  "star",
  "package",
] as const;

const HEX = /^#[0-9a-fA-F]{6}$/;

export const announcementItemSchema = z.object({
  id: z.string().min(1),
  text: z.string().trim().min(1, "El mensaje no puede estar vacío").max(120),
  icon: z.enum(ANNOUNCEMENT_ICONS),
});

export const announcementSchema = z.object({
  enabled: z.boolean(),
  mode: z.enum(["static", "marquee"]),
  direction: z.enum(["left", "right"]),
  speedSeconds: z
    .number()
    .min(5, "Mínimo 5 segundos")
    .max(120, "Máximo 120 segundos"),
  pauseOnHover: z.boolean(),
  size: z.enum(["sm", "md", "lg"]),
  background: z.string().regex(HEX, "Color de fondo inválido"),
  foreground: z.string().regex(HEX, "Color de texto inválido"),
  items: z
    .array(announcementItemSchema)
    .max(8, "Máximo 8 mensajes"),
});

export type AnnouncementInput = z.infer<typeof announcementSchema>;
