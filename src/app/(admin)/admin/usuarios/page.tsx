import type { Metadata } from "next";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Usuarios" };

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  editor: "Editor",
  customer: "Cliente",
};

export default async function AdminUsersPage() {
  const session = await getAdminSession();
  if (!session || session.user.role !== "admin") redirect("/admin");

  const users = await db.user.findMany({
    where: { role: { name: { in: ["admin", "editor"] } } },
    include: { role: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <AdminPageHeader
        title="Usuarios"
        description={`${users.length} ${users.length === 1 ? "cuenta" : "cuentas"} de staff (admin/editor)`}
      >
        <Button asChild className="h-10 rounded-full px-5 text-sm">
          <Link href="/admin/usuarios/nuevo">
            <Plus className="size-4" aria-hidden="true" />
            Nuevo usuario
          </Link>
        </Button>
      </AdminPageHeader>

      <div className="overflow-hidden rounded-2xl border bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Desde</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-muted/40">
                <td className="px-4 py-3 font-medium">
                  {user.name ?? "—"}
                  {user.id === session.user.id ? (
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                      (tú)
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3">{ROLE_LABEL[user.role.name] ?? user.role.name}</td>
                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                  {formatDate(user.createdAt, { dateStyle: "medium" })}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-medium",
                      user.isActive
                        ? "bg-emerald-500/15 text-emerald-700"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {user.isActive ? "Activo" : "Desactivado"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/usuarios/${user.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:border-foreground hover:bg-muted"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
