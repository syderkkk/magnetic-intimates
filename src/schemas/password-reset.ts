import { z } from "zod";

export const requestPasswordResetSchema = z.object({
  email: z.email("Ingresa un correo válido"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});
