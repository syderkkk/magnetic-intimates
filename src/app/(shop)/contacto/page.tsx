import { Mail, MapPin, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "@/components/shop/contact-form";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escríbenos y te respondemos a la brevedad. Estamos para ayudarte con tu pedido, tallas o cualquier duda.",
  alternates: { canonical: "/contacto" },
};

export default function ContactPage() {
  const whatsappUrl = getWhatsAppUrl("Hola, tengo una consulta.");

  return (
    <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="max-w-xl">
        <span className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Contacto
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Hablemos
        </h1>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">
          ¿Dudas sobre una talla, un pedido o algo más? Escríbenos y te
          respondemos a la brevedad.
        </p>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_22rem]">
        <ContactForm />

        <aside className="space-y-6">
          <div className="rounded-2xl border bg-card p-6">
            <h2 className="text-xs font-semibold tracking-[0.12em] text-foreground uppercase">
              Otras formas de contacto
            </h2>
            <ul className="mt-4 space-y-4 text-sm">
              {whatsappUrl ? (
                <li className="flex items-start gap-3">
                  <MessageCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <Link
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      Escríbenos directo
                    </Link>
                  </div>
                </li>
              ) : null}
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="font-medium">Correo</p>
                  <p className="text-muted-foreground">
                    Respondemos el mismo formulario en 1–2 días hábiles.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="font-medium">Envíos</p>
                  <p className="text-muted-foreground">A todo el Perú.</p>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
