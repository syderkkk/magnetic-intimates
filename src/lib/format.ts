/**
 * Formato de fechas para Perú.
 * - Zona horaria: America/Lima (GMT-5).
 * - El formato de moneda (PEN) vive en `@/lib/money` para mantener el manejo
 *   exacto de montos en un solo lugar.
 */

/** Formatea una fecha en hora de Lima (por defecto, formato largo en español). */
export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  const value = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: "America/Lima",
    dateStyle: "long",
    ...options,
  }).format(value);
}
