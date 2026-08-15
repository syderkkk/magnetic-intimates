import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { UserEditControls } from "@/components/admin/user-edit-controls";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Editar usuario" };

export default async function EditUserPage({ params }: Props) {
  const session = await getAdminSession();
  if (!session || session.user.role !== "admin") redirect("/admin");

  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    include: { role: true },
  });
  if (!user || !["admin", "editor"].includes(user.role.name)) notFound();

  return (
    <div>
      <Link
        href="/admin/usuarios"
        className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4 transition-transform duration-200 ease-out group-hover:-translate-x-0.5" />
        Usuarios
      </Link>

      <div className="mt-3 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          {user.name ?? user.email}
        </h1>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium",
            user.isActive
              ? "bg-emerald-500/15 text-emerald-700"
              : "bg-muted text-muted-foreground",
          )}
        >
          {user.isActive ? "Activo" : "Desactivado"}
        </span>
      </div>

      <div className="max-w-md space-y-6">
        <section className="rounded-2xl border bg-background p-5 sm:p-6">
          <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">
            Datos
          </h2>
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-muted-foreground">
              Cuenta desde {formatDate(user.createdAt, { dateStyle: "long" })}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border bg-background p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">
            Acceso
          </h2>
          <UserEditControls
            userId={user.id}
            email={user.email}
            role={user.role.name as "admin" | "editor"}
            isActive={user.isActive}
            isSelf={user.id === session.user.id}
          />
        </section>
      </div>
    </div>
  );
}
