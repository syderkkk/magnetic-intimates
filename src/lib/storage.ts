import "server-only";

import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  ALMACENAMIENTO DE ARCHIVOS — Supabase Storage (adaptador intercambiable)
 *  Las imágenes subidas desde el admin se guardan en un bucket PÚBLICO de
 *  Supabase y se sirven por su URL pública (next/image las optimiza; ver el
 *  `remotePattern` en next.config). La validación/normalización con sharp NO
 *  depende de esto: solo se cumple la interfaz `saveFile`/`deleteFileByUrl`,
 *  así que cambiar de proveedor (R2/S3) es reimplementar solo este archivo.
 * ─────────────────────────────────────────────────────────────────────────
 */

const BUCKET = env.SUPABASE_STORAGE_BUCKET;
const PUBLIC_MARKER = `/storage/v1/object/public/${BUCKET}/`;

export interface StoredFile {
  /** URL pública para usar en <Image> y guardar en la BD. */
  url: string;
}

/** Cliente de Supabase con la service role key (solo servidor, nunca al cliente). */
function storageClient() {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

/** Guarda los bytes bajo la clave dada y devuelve su URL pública. */
export async function saveFile(key: string, data: Buffer): Promise<StoredFile> {
  const supabase = storageClient();
  const { error } = await supabase.storage.from(BUCKET).upload(key, data, {
    contentType: "image/webp",
    upsert: true,
  });
  if (error) {
    throw new Error(`No se pudo subir la imagen: ${error.message}`);
  }
  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return { url: pub.publicUrl };
}

/** Elimina el archivo de una URL pública (si pertenece a nuestro bucket). */
export async function deleteFileByUrl(url: string): Promise<void> {
  const idx = url.indexOf(PUBLIC_MARKER);
  if (idx === -1) return; // no es un archivo de nuestro bucket
  const key = url.slice(idx + PUBLIC_MARKER.length);
  const supabase = storageClient();
  await supabase.storage.from(BUCKET).remove([key]);
}
