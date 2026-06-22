/** Resultado tipado y uniforme de una Server Action (CLAUDE.md §11.11). */
export type ActionResult =
  | { success: true }
  | { success: false; error: string };
