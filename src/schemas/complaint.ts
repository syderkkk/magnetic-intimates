import { z } from "zod";

/**
 * Validación del Libro de Reclamaciones (CLAUDE.md §8 regla 9): tipo
 * reclamo/queja, datos del cliente y detalle. Sin precios ni datos sensibles.
 */
export const complaintSchema = z.object({
  type: z.enum(["reclamo", "queja"], { error: "Elige el tipo" }),
  customerName: z.string().trim().min(1, "Ingresa tu nombre completo"),
  email: z.email("Ingresa un correo válido"),
  phone: z
    .string()
    .trim()
    .max(20, "Máximo 20 caracteres")
    .optional()
    .or(z.literal("")),
  documentId: z
    .string()
    .trim()
    .max(20, "Máximo 20 caracteres")
    .optional()
    .or(z.literal("")),
  detail: z
    .string()
    .trim()
    .min(20, "Detalla tu reclamo o queja (mínimo 20 caracteres)")
    .max(3000, "Máximo 3000 caracteres"),
});

export type ComplaintValues = z.infer<typeof complaintSchema>;
