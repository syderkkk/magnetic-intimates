"use server";

import { signOut } from "@/lib/auth";

/** Cierra la sesión del administrador y vuelve al login. */
export async function logout() {
  await signOut({ redirectTo: "/login" });
}
