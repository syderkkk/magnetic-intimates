import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ComplaintResponseForm } from "@/components/admin/complaint-response-form";
import { formatDate } from "@/lib/format";
import { db } from "@/lib/db";
import { DOCUMENT_TYPE_OPTIONS } from "@/schemas/complaint";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

const TYPE_LABEL: Record<string, string> = { reclamo: "Reclamo", queja: "Queja" };
const DOCUMENT_TYPE_LABEL = Object.fromEntries(
  DOCUMENT_TYPE_OPTIONS.map((o) => [o.value, o.label]),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const complaint = await db.complaint.findUnique({ where: { id }, select: { code: true } });
  return { title: complaint ? `Reclamo ${complaint.code}` : "Reclamo" };
}

export default async function AdminComplaintDetailPage({ params }: Props) {
  const { id } = await params;
  const complaint = await db.complaint.findUnique({ where: { id } });
  if (!complaint) notFound();

  const resolved = complaint.status === "resuelto";

  return (
    <div>
      <Link
        href="/admin/reclamos"
        className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4 transition-transform duration-200 ease-out group-hover:-translate-x-0.5" />
        Reclamos
      </Link>

      <div className="mt-3 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          {complaint.code}
        </h1>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium",
            resolved
              ? "bg-emerald-500/15 text-emerald-700"
              : "bg-amber-500/15 text-amber-700",
          )}
        >
          {resolved ? "Resuelto" : "Pendiente"}
        </span>
        <span className="text-sm text-muted-foreground">
          {TYPE_LABEL[complaint.type] ?? complaint.type} ·{" "}
          {formatDate(complaint.createdAt, { dateStyle: "long" })}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <section className="rounded-2xl border bg-background p-5 sm:p-6">
            <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">
              Detalle
            </h2>
            <p className="whitespace-pre-wrap text-sm">{complaint.detail}</p>
          </section>

          <section className="rounded-2xl border bg-background p-5 sm:p-6">
            <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">
              {resolved ? "Respuesta enviada" : "Responder"}
            </h2>
            {resolved ? (
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {complaint.response}
              </p>
            ) : (
              <ComplaintResponseForm complaintId={complaint.id} />
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border bg-background p-5 sm:p-6">
            <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">
              Cliente
            </h2>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{complaint.customerName}</p>
              <p className="text-muted-foreground">{complaint.email}</p>
              {complaint.phone ? (
                <p className="text-muted-foreground">{complaint.phone}</p>
              ) : null}
              {complaint.documentId ? (
                <p className="text-muted-foreground">
                  {complaint.documentType
                    ? (DOCUMENT_TYPE_LABEL[complaint.documentType] ?? complaint.documentType)
                    : null}{" "}
                  {complaint.documentId}
                </p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
