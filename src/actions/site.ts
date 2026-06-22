"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { clientIp, getAdminSession } from "@/lib/admin-auth";
import { recordAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { IMAGE_PRESETS, ImageValidationError } from "@/lib/images";
import { ANNOUNCEMENT_KEY } from "@/lib/site-settings";
import { deleteFileByUrl } from "@/lib/storage";
import { saveUploadedImage } from "@/lib/upload";
import { announcementSchema } from "@/schemas/announcement";
import type { ActionResult } from "@/types/action";

/** Inserta o actualiza un ajuste del sitio (tabla `site_settings`). */
async function upsertSetting(key: string, value: string, type: string) {
  await db.siteSetting.upsert({
    where: { key },
    update: { value, type },
    create: { key, value, type },
  });
}

function revalidateSite() {
  revalidatePath("/");
  revalidatePath("/admin/apariencia");
}

/** Sube/reemplaza una imagen de configuración del sitio (ej. portada del inicio). */
export async function updateSiteImage(formData: FormData): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const key = String(formData.get("key") ?? "");
  const file = formData.get("file");
  if (!key || !(file instanceof File)) {
    return { success: false, error: "Faltan datos." };
  }

  const existing = await db.siteSetting.findUnique({ where: { key } });

  let url: string;
  try {
    // Las imágenes del sitio (portada del inicio) son banners a todo el ancho:
    // se guardan con más resolución y calidad que una miniatura de producto.
    url = await saveUploadedImage(file, "site", IMAGE_PRESETS.banner);
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof ImageValidationError
          ? error.message
          : "No se pudo procesar la imagen.",
    };
  }

  if (existing?.value) await deleteFileByUrl(existing.value);
  await upsertSetting(key, url, "image");

  await recordAudit({
    userId: session.user.id,
    action: "updated",
    entityType: "site_setting",
    entityId: key,
    changes: { url },
    ipAddress: await clientIp(),
  });

  revalidateSite();
  return { success: true };
}

/** Quita una imagen de configuración del sitio. */
export async function removeSiteImage(formData: FormData): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const key = String(formData.get("key") ?? "");
  if (!key) return { success: false, error: "Faltan datos." };

  const existing = await db.siteSetting.findUnique({ where: { key } });
  if (existing?.value) await deleteFileByUrl(existing.value);
  await upsertSetting(key, "", "image");

  revalidateSite();
  return { success: true };
}

const textSchema = z.object({
  key: z.string().min(1),
  value: z.string().trim().max(300, "Máximo 300 caracteres"),
});

/** Actualiza un texto de configuración del sitio (ej. título de portada). */
export async function updateSiteText(input: unknown): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const parsed = textSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  await upsertSetting(parsed.data.key, parsed.data.value, "string");
  revalidateSite();
  return { success: true };
}

/** Guarda la configuración completa de la cinta de anuncios (JSON). */
export async function updateAnnouncement(input: unknown): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const parsed = announcementSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  await upsertSetting(ANNOUNCEMENT_KEY, JSON.stringify(parsed.data), "json");
  await recordAudit({
    userId: session.user.id,
    action: "updated",
    entityType: "site_setting",
    entityId: ANNOUNCEMENT_KEY,
    changes: {
      enabled: parsed.data.enabled,
      mode: parsed.data.mode,
      items: parsed.data.items.length,
    },
    ipAddress: await clientIp(),
  });

  // La cinta vive en el layout de la tienda: revalidar todo el layout.
  revalidatePath("/", "layout");
  revalidatePath("/admin/apariencia");
  return { success: true };
}
