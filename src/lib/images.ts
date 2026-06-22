import "server-only";

import sharp from "sharp";

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  PROCESAMIENTO DE IMÁGENES (subidas del administrador)
 *  Acepta cualquier JPG/PNG/WebP en cualquier resolución y lo NORMALIZA:
 *  re-codifica a WebP, redimensiona al lado mayor permitido y quita metadatos.
 *  Así la entrada es flexible pero la salida siempre es consistente
 *  (CLAUDE.md §11.4). La validación es por CONTENIDO (sharp lee los bytes), no
 *  por la extensión o el Content-Type del cliente.
 * ─────────────────────────────────────────────────────────────────────────
 */

/** Peso máximo aceptado al subir (antes de procesar). */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

/** Lado mayor por defecto de la imagen guardada (se reduce si excede). */
const DEFAULT_MAX_DIMENSION = 1600;
/** Calidad WebP por defecto. */
const DEFAULT_QUALITY = 85;

/** Formatos de entrada aceptados (detectados por contenido). */
const ALLOWED_FORMATS = ["jpeg", "png", "webp"];

/** Error de validación de imagen (mensaje apto para mostrar al usuario). */
export class ImageValidationError extends Error {}

export interface ProcessOptions {
  /** Lado mayor permitido en px (no agranda imágenes más pequeñas). */
  maxDimension?: number;
  /** Calidad WebP (1–100). */
  quality?: number;
}

/**
 * Presets por tipo de imagen. Un banner/portada se ve a todo el ancho, así que
 * necesita más resolución y calidad que una miniatura de producto (que se
 * muestra pequeña en grillas). Usar el preset adecuado evita tanto la pérdida
 * de calidad visible como guardar archivos innecesariamente pesados.
 */
export const IMAGE_PRESETS = {
  banner: { maxDimension: 2400, quality: 90 },
  standard: { maxDimension: DEFAULT_MAX_DIMENSION, quality: DEFAULT_QUALITY },
} as const satisfies Record<string, ProcessOptions>;

export interface ProcessedImage {
  data: Buffer;
  width: number;
  height: number;
}

/**
 * Valida y normaliza una imagen subida. Lanza `ImageValidationError` con un
 * mensaje legible si el archivo no es una imagen aceptada.
 */
export async function processUploadedImage(
  input: Buffer,
  options: ProcessOptions = {},
): Promise<ProcessedImage> {
  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const quality = options.quality ?? DEFAULT_QUALITY;

  let pipeline: ReturnType<typeof sharp>;
  let format: string | undefined;
  try {
    pipeline = sharp(input, { failOn: "error" });
    format = (await pipeline.metadata()).format;
  } catch {
    throw new ImageValidationError("El archivo no es una imagen válida.");
  }

  if (!format || !ALLOWED_FORMATS.includes(format)) {
    throw new ImageValidationError(
      "Formato no permitido. Usa JPG, PNG o WebP.",
    );
  }

  const { data, info } = await pipeline
    .rotate() // respeta la orientación EXIF (fotos de celular)
    .resize({
      width: maxDimension,
      height: maxDimension,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality })
    .toBuffer({ resolveWithObject: true });

  return { data, width: info.width, height: info.height };
}
