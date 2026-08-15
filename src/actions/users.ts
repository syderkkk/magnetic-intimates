"use server";

import { argon2id, hash } from "argon2";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { clientIp, getAdminSession } from "@/lib/admin-auth";
import { recordAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action";

/** Roles que se pueden asignar desde este panel (nunca "customer" aquí). */
const STAFF_ROLES = ["admin", "editor"] as const;

/**
 * La gestión de cuentas (crear, cambiar rol, activar/desactivar) es solo para
 * "admin" — "editor" puede administrar catálogo/pedidos/contenido pero no
 * otras cuentas. Devuelve la sesión si califica, o null.
 */
async function getSuperAdminSession() {
  const session = await getAdminSession();
  if (!session || session.user.role !== "admin") return null;
  return session;
}

function revalidateUsers(id?: string) {
  revalidatePath("/admin/usuarios");
  if (id) revalidatePath(`/admin/usuarios/${id}`);
}

const createUserSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  email: z.email("Ingresa un correo válido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  role: z.enum(STAFF_ROLES),
});

/** Crea una cuenta de staff (admin/editor) con contraseña inicial. */
export async function createUser(input: unknown): Promise<ActionResult> {
  const session = await getSuperAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  const role = await db.role.findUnique({ where: { name: parsed.data.role } });
  if (!role) return { success: false, error: "Rol no encontrado." };

  const passwordHash = await hash(parsed.data.password, { type: argon2id });

  let createdId: string;
  try {
    const created = await db.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        passwordHash,
        roleId: role.id,
      },
    });
    createdId = created.id;
  } catch {
    return { success: false, error: "Ese correo ya tiene una cuenta." };
  }

  await recordAudit({
    userId: session.user.id,
    action: "created",
    entityType: "user",
    entityId: createdId,
    changes: { email: parsed.data.email, role: parsed.data.role },
    ipAddress: await clientIp(),
  });

  revalidateUsers();
  return { success: true };
}

/** ¿Es esta la única cuenta admin activa? Evita quedarse sin ningún admin. */
async function isLastActiveAdmin(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });
  if (user?.role.name !== "admin" || !user.isActive) return false;

  const activeAdmins = await db.user.count({
    where: { isActive: true, role: { name: "admin" } },
  });
  return activeAdmins <= 1;
}

const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(STAFF_ROLES),
});

/** Cambia el rol (admin/editor) de una cuenta de staff. */
export async function updateUserRole(input: unknown): Promise<ActionResult> {
  const session = await getSuperAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const parsed = updateUserRoleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  if (parsed.data.userId === session.user.id) {
    return {
      success: false,
      error: "No puedes cambiar tu propio rol.",
    };
  }
  if (parsed.data.role !== "admin" && (await isLastActiveAdmin(parsed.data.userId))) {
    return {
      success: false,
      error: "No puedes quitarle el rol admin al único administrador activo.",
    };
  }

  const role = await db.role.findUnique({ where: { name: parsed.data.role } });
  if (!role) return { success: false, error: "Rol no encontrado." };

  await db.user.update({
    where: { id: parsed.data.userId },
    data: { roleId: role.id },
  });

  await recordAudit({
    userId: session.user.id,
    action: "updated",
    entityType: "user",
    entityId: parsed.data.userId,
    changes: { role: parsed.data.role },
    ipAddress: await clientIp(),
  });

  revalidateUsers(parsed.data.userId);
  return { success: true };
}

const toggleUserActiveSchema = z.object({
  userId: z.string().min(1),
  isActive: z.boolean(),
});

/** Activa o desactiva una cuenta (soft — nunca se borra un usuario). */
export async function toggleUserActive(input: unknown): Promise<ActionResult> {
  const session = await getSuperAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const parsed = toggleUserActiveSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  if (parsed.data.userId === session.user.id) {
    return {
      success: false,
      error: "No puedes desactivar tu propia cuenta.",
    };
  }
  if (!parsed.data.isActive && (await isLastActiveAdmin(parsed.data.userId))) {
    return {
      success: false,
      error: "No puedes desactivar al único administrador activo.",
    };
  }

  await db.user.update({
    where: { id: parsed.data.userId },
    data: { isActive: parsed.data.isActive },
  });

  await recordAudit({
    userId: session.user.id,
    action: "updated",
    entityType: "user",
    entityId: parsed.data.userId,
    changes: { isActive: parsed.data.isActive },
    ipAddress: await clientIp(),
  });

  revalidateUsers(parsed.data.userId);
  return { success: true };
}
