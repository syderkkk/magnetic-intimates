import type { Metadata } from "next";

import { ComplaintForm } from "@/components/shop/complaint-form";

export const metadata: Metadata = {
  title: "Libro de Reclamaciones",
  description:
    "Libro de Reclamaciones virtual de MAGNÉTIC, conforme a lo establecido por INDECOPI.",
  alternates: { canonical: "/libro-reclamaciones" },
};

export default function ComplaintsBookPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <span className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
        Atención al cliente
      </span>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        Libro de Reclamaciones
      </h1>
      <p className="mt-4 text-sm text-muted-foreground sm:text-base">
        Este establecimiento cuenta con un Libro de Reclamaciones a
        disposición del consumidor, conforme a lo establecido en el Código de
        Protección y Defensa del Consumidor. Completa el formulario para
        registrar tu reclamo o queja.
      </p>

      <div className="mt-10">
        <ComplaintForm />
      </div>
    </section>
  );
}
