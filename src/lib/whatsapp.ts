import { siteConfig } from "@/config/site";

/** Dígitos únicamente (formato que exige wa.me). */
function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * URL de WhatsApp lista para usar, o `null` si todavía no hay número
 * configurado (`config/site.ts` → `social.whatsapp`).
 * TODO: confirmar con cliente — número de WhatsApp del negocio.
 */
export function getWhatsAppUrl(message?: string): string | null {
  const digits = digitsOnly(siteConfig.social.whatsapp);
  if (!digits) return null;
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
