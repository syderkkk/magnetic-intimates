import { ArrowRight, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ProductGrid } from "@/components/shop/product-grid";
import { Button } from "@/components/ui/button";
import { getFeaturedProducts } from "@/lib/data/products";

/** Propuestas de valor mostradas bajo los destacados. */
const VALUE_PROPS = [
  {
    icon: Truck,
    title: "Envíos a todo el Perú",
    description: "Recibe tu pedido donde estés, de forma rápida y segura.",
  },
  {
    icon: ShieldCheck,
    title: "Compra protegida",
    description: "Pago seguro y tus datos siempre protegidos.",
  },
  {
    icon: RefreshCw,
    title: "Cambios fáciles",
    description: "Cambios sencillos si la talla no es la indicada.",
  },
];

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative h-[80svh] min-h-136 w-full overflow-hidden bg-neutral-900">
        <Image
          src="https://picsum.photos/seed/nue-hero/1600/1066"
          alt="Modelo con prendas de la nueva colección de NUE INTIME"
          fill
          priority
          quality={70}
          sizes="100vw"
          className="object-cover"
        />
        {/* Degradado para legibilidad del texto. */}
        <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/25 to-black/40" />

        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl text-white">
              <span className="inline-flex rounded-full border border-white/30 px-3 py-1 text-[11px] font-medium tracking-[0.2em] uppercase backdrop-blur-sm">
                Nueva colección
              </span>
              <h1 className="mt-5 font-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Esenciales que se sienten como tú
              </h1>
              <p className="mt-5 max-w-md text-base text-white/80 sm:text-lg">
                Lencería y prendas íntimas con diseño minimalista. Comodidad y
                elegancia, todos los días.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-8 h-12 gap-3 rounded-full pr-2 pl-6 text-sm"
              >
                <Link href="/tienda">
                  Ver la colección
                  <span className="flex size-8 items-center justify-center rounded-full bg-background/20 transition-transform duration-300 ease-out group-hover/button:translate-x-0.5">
                    <ArrowRight className="size-4" />
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Destacados ── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
              Selección
            </span>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Destacados
            </h2>
          </div>
          <Link
            href="/tienda"
            className="group inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap transition-opacity hover:opacity-60"
          >
            Ver todo
            <ArrowRight className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
          </Link>
        </div>

        <ProductGrid products={featured} className="mt-10" />
      </section>

      {/* ── Propuestas de valor ── */}
      <section className="border-t">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
          {VALUE_PROPS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full border">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-medium">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
