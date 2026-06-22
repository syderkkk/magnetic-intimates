import "server-only";

import { randomUUID } from "node:crypto";

import {
  ImageValidationError,
  MAX_UPLOAD_BYTES,
  processUploadedImage,
  type ProcessOptions,
} from "@/lib/images";
import { saveFile } from "@/lib/storage";

/**
 * Valida (peso + contenido), normaliza con sharp y guarda una imagen subida.
 * Devuelve la URL pública. Lanza `ImageValidationError` con un mensaje legible
 * si el archivo no es válido. Reutilizable por productos, categorías y el sitio.
 *
 * @param file    archivo recibido del formulario.
 * @param prefix  carpeta lógica donde guardarlo (ej. "products/<id>", "categories").
 * @param options preset de procesado (resolución/calidad). Ver `IMAGE_PRESETS`.
 */
export async function saveUploadedImage(
  file: File,
  prefix: string,
  options?: ProcessOptions,
): Promise<string> {
  if (!(file instanceof File) || file.size === 0) {
    throw new ImageValidationError("No se recibió ningún archivo.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ImageValidationError("La imagen supera el máximo de 5 MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const processed = await processUploadedImage(buffer, options);
  const key = `${prefix}/${randomUUID()}.webp`;
  const { url } = await saveFile(key, processed.data);
  return url;
}
