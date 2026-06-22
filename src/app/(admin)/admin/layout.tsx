import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";

import { logout } from "@/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { Logo } from "@/components/shop/logo";
import { auth } from "@/lib/auth";

/** Roles con acceso al panel. */
const ADMIN_ROLES = ["admin", "editor"];

/**
 * Layout del panel de administración. Protege TODO /admin: valida sesión y rol
 * en el servidor (CLAUDE.md §7.6). El login vive fuera de este layout (/login).
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) {
    redirect("/login");
  }

  return (
    <div className="min-h-svh bg-muted/30">
      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar (escritorio) */}
        <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r bg-background p-4 lg:flex">
          <div className="px-2 py-2 text-xl">
            <Logo />
          </div>
          <p className="px-2 pt-2 pb-3 text-[11px] tracking-wider text-muted-foreground uppercase">
            Administración
          </p>
          <AdminNav />

          <form action={logout} className="mt-auto border-t pt-3">
            <p className="truncate px-2 pb-2 text-xs text-muted-foreground">
              {session.user.email}
            </p>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Cerrar sesión
            </button>
          </form>
        </aside>

        {/* Contenido */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {/* Barra superior (móvil) */}
          <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
            <div className="text-lg">
              <Logo />
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Salir
              </button>
            </form>
          </div>
          <div className="mb-6 lg:hidden">
            <AdminNav />
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
