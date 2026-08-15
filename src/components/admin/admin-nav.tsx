"use client";

import {
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  /** Solo visible para "admin" (gestión de cuentas). */
  adminOnly?: boolean;
}

interface NavGroup {
  label: string | null;
  links: NavLink[];
}

/**
 * Nav agrupado por función: mezclar todo en una lista plana confunde a
 * quien administra la tienda. Un grupo por área del negocio, no por
 * cuándo se agregó la sección.
 */
const GROUPS: NavGroup[] = [
  { label: null, links: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }] },
  {
    label: "Catálogo",
    links: [
      { href: "/admin/productos", label: "Productos", icon: Package },
      { href: "/admin/categorias", label: "Categorías", icon: Tag },
    ],
  },
  {
    label: "Ventas",
    links: [{ href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag }],
  },
  {
    label: "Contenido",
    links: [{ href: "/admin/apariencia", label: "Apariencia", icon: ImageIcon }],
  },
  {
    label: "Soporte",
    links: [{ href: "/admin/reclamos", label: "Reclamos", icon: FileText }],
  },
  {
    label: "Cuenta",
    links: [{ href: "/admin/usuarios", label: "Usuarios", icon: Users, adminOnly: true }],
  },
];

interface AdminNavProps {
  role: string;
}

/** Navegación lateral del panel, agrupada por área y con resaltado activo. */
export function AdminNav({ role }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-4">
      {GROUPS.map((group, i) => {
        const links = group.links.filter((link) => !link.adminOnly || role === "admin");
        if (links.length === 0) return null;
        return (
          <div key={group.label ?? `top-${i}`} className="flex flex-col gap-1">
            {group.label ? (
              <p className="px-3 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {group.label}
              </p>
            ) : null}
            {links.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
