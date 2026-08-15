import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { UserCreateForm } from "@/components/admin/user-create-form";
import { getAdminSession } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Nuevo usuario" };

export default async function NewUserPage() {
  const session = await getAdminSession();
  if (!session || session.user.role !== "admin") redirect("/admin");

  return (
    <div>
      <Link
        href="/admin/usuarios"
        className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4 transition-transform duration-200 ease-out group-hover:-translate-x-0.5" />
        Usuarios
      </Link>

      <h1 className="mt-3 mb-6 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Nuevo usuario
      </h1>

      <div className="max-w-md rounded-2xl border bg-background p-5 sm:p-6">
        <UserCreateForm />
      </div>
    </div>
  );
}
