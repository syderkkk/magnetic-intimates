import { z } from "zod";

/**
 * Validación de los datos del comprador en el checkout (compra como invitado).
 *
 * Este mismo schema se reutilizará en el servidor cuando exista la Server Action
 * de creación de pedido (CLAUDE.md §13.2: validar TODO input con Zod antes de
 * tocar la BD), evitando duplicar reglas entre cliente y servidor.
 *
 * TODO: confirmar con cliente — el método de entrega (envío/recojo, decisión #4)
 * y si habrá cuenta de cliente (decisión #3) pueden añadir o condicionar campos.
 */
export const checkoutSchema = z.object({
  email: z.email("Ingresa un correo válido"),
  phone: z
    .string()
    .min(1, "Ingresa tu teléfono")
    .regex(/^[0-9+\s-]{6,15}$/, "Teléfono no válido"),
  firstName: z.string().min(1, "Ingresa tu nombre"),
  lastName: z.string().min(1, "Ingresa tus apellidos"),
  address: z.string().min(1, "Ingresa tu dirección"),
  district: z.string().min(1, "Ingresa tu distrito"),
  city: z.string().min(1, "Ingresa tu ciudad o departamento"),
  reference: z.string().max(200, "Máximo 200 caracteres").optional(),
  notes: z.string().max(300, "Máximo 300 caracteres").optional(),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;
