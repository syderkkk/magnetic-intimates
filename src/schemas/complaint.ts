import { z } from "zod";

/**
 * Validación del Libro de Reclamaciones (CLAUDE.md §8 regla 9): tipo
 * reclamo/queja, datos del cliente y detalle. Sin precios ni datos sensibles.
 */
export const DOCUMENT_TYPE_OPTIONS = [
  { value: "dni", label: "DNI" },
  { value: "ce", label: "Carné de Extranjería" },
  { value: "pasaporte", label: "Pasaporte" },
] as const;

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
  // Sin .default(): el valor inicial lo pone el formulario (useForm
  // defaultValues), así el tipo de entrada/salida de Zod queda igual y
  // react-hook-form no choca de tipos con el resolver.
  documentType: z.enum(["dni", "ce", "pasaporte"]),
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
