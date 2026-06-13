import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de Tailwind de forma segura (resuelve utilidades en conflicto).
 * La usa cada componente de UI.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
