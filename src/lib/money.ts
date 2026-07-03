/**
 * ─────────────────────────────────────────────────────────────────────────
 *  MANEJO DE DINERO EXACTO
 *  Trabajamos los montos en CÉNTIMOS (enteros) para evitar errores de punto
 *  flotante (p. ej. 0.1 + 0.2 !== 0.3). Solo se convierte a decimal al mostrar.
 *
 *  En la base de datos los montos se guardan como `Int` (columnas `*Cents`);
 *  nunca `Decimal` ni `Float` (CLAUDE.md §11.6, regla firme del proyecto).
 * ─────────────────────────────────────────────────────────────────────────
 */

/** Monto en céntimos de sol (entero). Ej.: S/ 1.00 = 100 céntimos. */
export type Cents = number;

const PEN_FORMATTER = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Convierte soles (decimal) a céntimos enteros, redondeando correctamente. */
export function solesToCents(soles: number): Cents {
  return Math.round(soles * 100);
}

/** Convierte céntimos enteros a soles (decimal). */
export function centsToSoles(cents: Cents): number {
  return cents / 100;
}

/** Formatea un monto en céntimos como precio en soles: 8990 → "S/ 89.90". */
export function formatPrice(cents: Cents): string {
  return PEN_FORMATTER.format(cents / 100);
}

/** Total de una línea (precio unitario × cantidad). Se mantiene en enteros: exacto. */
export function lineTotal(unitCents: Cents, quantity: number): Cents {
  return unitCents * Math.max(0, Math.trunc(quantity));
}

/** Suma una lista de montos en céntimos. Al ser enteros, la suma es exacta. */
export function sumCents(values: Cents[]): Cents {
  return values.reduce((total, value) => total + value, 0);
}

/** Porcentaje de descuento entre precio original y precio actual (entero, 0–100). */
export function discountPercent(
  compareAtCents: Cents,
  priceCents: Cents,
): number {
  if (compareAtCents <= 0 || priceCents >= compareAtCents) return 0;
  return Math.round(((compareAtCents - priceCents) / compareAtCents) * 100);
}
