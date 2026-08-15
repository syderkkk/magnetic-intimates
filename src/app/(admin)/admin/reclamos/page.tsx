import type { Metadata } from "next";
import { FileText } from "lucide-react";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Reclamos" };

const TYPE_LABEL: Record<string, string> = { reclamo: "Reclamo", queja: "Queja" };
const RESPONSE_DEADLINE_DAYS = 30;

export default async function AdminComplaintsPage() {
  const complaints = await db.complaint.findMany({
    orderBy: { createdAt: "desc" },
  });
  const pendingCount = complaints.filter((c) => c.status === "pendiente").length;

  return (
    <div>
      <AdminPageHeader
        title="Reclamos"
        description={`${complaints.length} ${complaints.length === 1 ? "registro" : "registros"} · ${pendingCount} pendiente${pendingCount === 1 ? "" : "s"} de respuesta`}
      />

      {complaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border bg-background py-20 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-muted">
            <FileText className="size-6 text-muted-foreground" aria-hidden="true" />
          </span>
          <p className="font-medium">Aún no hay reclamos ni quejas</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Los registros del Libro de Reclamaciones aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs tracking-wide text-muted-foreground uppercase">
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Tipo</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Fecha</th>
                <th className="px-4 py-3 font-medium">Vence</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {complaints.map((complaint) => {
                const deadline = new Date(
                  complaint.createdAt.getTime() +
                    RESPONSE_DEADLINE_DAYS * 24 * 60 * 60 * 1000,
                );
                const overdue =
                  complaint.status === "pendiente" && deadline < new Date();
                return (
                  <tr key={complaint.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/reclamos/${complaint.id}`}
                        className="font-medium hover:underline"
                      >
                        {complaint.code}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="truncate">{complaint.customerName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {complaint.email}
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {TYPE_LABEL[complaint.type] ?? complaint.type}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {formatDate(complaint.createdAt, { dateStyle: "medium" })}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 tabular-nums",
                        overdue ? "font-medium text-destructive" : "text-muted-foreground",
                      )}
                    >
                      {formatDate(deadline, { dateStyle: "medium" })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-medium",
                          complaint.status === "resuelto"
                            ? "bg-emerald-500/15 text-emerald-700"
                            : overdue
                              ? "bg-destructive/10 text-destructive"
                              : "bg-amber-500/15 text-amber-700",
                        )}
                      >
                        {complaint.status === "resuelto" ? "Resuelto" : "Pendiente"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
