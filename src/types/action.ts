/**
 * Resultado tipado y uniforme de una Server Action (CLAUDE.md §11.11).
 * Sin argumento de tipo: `{ success: true } | { success: false; error }`.
 * Con `T`: la rama exitosa además trae `data: T` (p. ej. `createOrder`).
 */
export type ActionResult<T = undefined> =
  | (T extends undefined ? { success: true } : { success: true; data: T })
  | { success: false; error: string };
