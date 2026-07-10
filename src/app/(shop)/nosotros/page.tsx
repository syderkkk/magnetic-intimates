import { Heart, Ribbon, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { BrandMotif } from "@/components/shop/brand-motif";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Conoce la historia y los valores detrás de MAGNÉTIC: intimidad con actitud.",
  alternates: { canonical: "/nosotros" },
};

const VALUES = [
  {
    icon: Sparkles,
    title: "Calidad",
    description:
      "Elegimos materiales que se sienten tan bien como se ven, pensados para durar.",
  },
  {
    icon: Heart,
    title: "Comodidad",
    description:
      "La lencería debería sentirse como una segunda piel, no como algo que soportar.",
  },
  {
    icon: Ribbon,
    title: "Actitud",
    description:
      "Intimidad con carácter: prendas que te hacen sentir segura de ti misma.",
  },
];

/**
 * TODO: confirmar con cliente — esta página usa copy PLACEHOLDER (historia,
 * año, propósito) escrito para no dejar la sección vacía mientras se define
 * el texto real de marca. Reemplazar por la historia real + imágenes del
 * cliente en cuanto estén disponibles (docs/06-identidad-magnetic.md).
 */
export default function AboutPage() {
  return (
    <section className="relative overflow-hidden">
      {/* Trazo de marca de fondo (docs/06 §5.5) — textura al 6%, la misma
          curva "femenina" del manual, coherente con el trazo del Inicio. */}
      <BrandMotif
        variant="curva"
        className="text-foreground/6 pointer-events-none absolute -top-10 -right-10 h-64 w-auto sm:h-80"
      />
      <div className="relative mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <span className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
          Nosotros
        </span>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Intimacy with attitude
        </h1>

        <div className="text-muted-foreground mt-6 space-y-5 text-sm leading-relaxed sm:text-base">
          <p>
            MAGNÉTIC nace de una idea simple: la ropa íntima no debería ser un
            compromiso entre verse bien y sentirse bien. Diseñamos cada prenda
            para que ambas cosas sucedan al mismo tiempo — calidad real,
            comodidad de uso diario y una actitud que no pide permiso.
          </p>
          <p>
            Creemos que la intimidad tiene su propio magnetismo: esa seguridad
            silenciosa que se nota sin esfuerzo. Por eso cuidamos cada detalle,
            desde la tela hasta el corte, para acompañarte todos los días, no
            solo en las ocasiones especiales.
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-start gap-3">
              <span className="bg-accent/40 flex size-11 items-center justify-center rounded-full">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="text-sm font-semibold">{title}</h2>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t pt-10 text-center">
          <p className="text-muted-foreground text-sm">
            ¿Lista para encontrar tu próxima prenda favorita?
          </p>
          <Button asChild className="mt-4 h-11 rounded-full px-6">
            <Link href="/tienda">Ver la colección</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
