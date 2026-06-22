import "server-only";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";

/** Roles con acceso al panel de administración. */
export const ADMIN_ROLES = ["admin", "editor"];

/** Devuelve la sesión si el usuario puede administrar, o `null`. */
export async function getAdminSession() {
  const session = await auth();
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) return null;
  return session;
}

/** IP del cliente (para la auditoría). */
export async function clientIp(): Promise<string | null> {
  return (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}
