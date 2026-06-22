import "server-only";

import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  ALMACENAMIENTO DE ARCHIVOS (adaptador intercambiable)
 *  Etapa actual: filesystem local en `public/uploads`, servido como estático en
 *  `/uploads/...`. La lógica de validación/normalización de imágenes NO depende
 *  de esto. Cuando se decida el hosting (decisión #1), se reemplaza esta
 *  implementación por object storage (Cloudflare R2 / S3) sin tocar el resto:
 *  basta con cumplir la misma interfaz (`saveFile`/`deleteFile`).
 *
 *  NOTA: en hosts con filesystem efímero (Vercel/Railway) esto NO persiste; ahí
 *  es obligatorio el object storage. Sirve para desarrollo local.
 * ─────────────────────────────────────────────────────────────────────────
 */

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const PUBLIC_PREFIX = "/uploads/";

export interface StoredFile {
  /** URL pública para usar en <Image> y guardar en la BD. */
  url: string;
}

/** Convierte una clave (`products/x/y.webp`) a la ruta absoluta en disco. */
function toDiskPath(key: string): string {
  return path.join(UPLOAD_DIR, ...key.split("/"));
}

/** Guarda los bytes bajo la clave dada y devuelve su URL pública. */
export async function saveFile(key: string, data: Buffer): Promise<StoredFile> {
  const filePath = toDiskPath(key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, data);
  return { url: `${PUBLIC_PREFIX}${key}` };
}

/** Elimina el archivo correspondiente a una URL pública (si existe). */
export async function deleteFileByUrl(url: string): Promise<void> {
  if (!url.startsWith(PUBLIC_PREFIX)) return; // no es un archivo nuestro
  const key = url.slice(PUBLIC_PREFIX.length);
  try {
    await unlink(toDiskPath(key));
  } catch {
    // Si el archivo ya no existe, no es un error.
  }
}
