import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface AdminPaginationProps {
  /** Ruta base (sin query), ej. "/admin/productos". */
  basePath: string;
  page: number;
  pageSize: number;
  total: number;
}

/** Controles «anterior/siguiente» para listados largos del admin (CLAUDE.md §11.11). */
export function AdminPagination({
  basePath,
  page,
  pageSize,
  total,
}: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="mt-4 flex items-center justify-between gap-4 text-sm">
      <p className="text-muted-foreground tabular-nums">
        {from}–{to} de {total}
      </p>
      <div className="flex items-center gap-1">
        <Link
          href={`${basePath}?page=${page - 1}`}
          aria-label="Página anterior"
          aria-disabled={page <= 1}
          className={cn(
            "flex size-8 items-center justify-center rounded-full border transition-colors",
            page <= 1
              ? "pointer-events-none border-border text-muted-foreground/40"
              : "hover:border-foreground hover:bg-muted",
          )}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Link>
        <span className="px-2 text-muted-foreground tabular-nums">
          {page} / {totalPages}
        </span>
        <Link
          href={`${basePath}?page=${page + 1}`}
          aria-label="Página siguiente"
          aria-disabled={page >= totalPages}
          className={cn(
            "flex size-8 items-center justify-center rounded-full border transition-colors",
            page >= totalPages
              ? "pointer-events-none border-border text-muted-foreground/40"
              : "hover:border-foreground hover:bg-muted",
          )}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
