import { z } from "zod";

/** Validación del formulario de Contacto (cliente y servidor). */
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Ingresa tu nombre"),
  email: z.email("Ingresa un correo válido"),
  phone: z
    .string()
    .trim()
    .max(20, "Máximo 20 caracteres")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Cuéntanos un poco más (mínimo 10 caracteres)")
    .max(2000, "Máximo 2000 caracteres"),
});

export type ContactValues = z.infer<typeof contactSchema>;
