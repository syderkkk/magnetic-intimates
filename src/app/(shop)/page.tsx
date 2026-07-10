import {
  ArrowRight,
  ChevronDown,
  RefreshCw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { BrandMotif } from "@/components/shop/brand-motif";
import { CategorySection } from "@/components/shop/category-section";
import { ProductGrid } from "@/components/shop/product-grid";
import { Reveal } from "@/components/shop/reveal";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { getFeaturedProducts, getLatestProducts } from "@/lib/data/products";
import { getSiteSettings, SETTING_KEYS } from "@/lib/site-settings";

export const metadata: Metadata = {
  description:
    "Conjuntos, bodies, pijamas y lencería. Comodidad y elegancia, con envíos a todo el Perú.",
  alternates: { canonical: "/" },
};

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

export default async function HomePage() {
  const [featured, latest, settings] = await Promise.all([
    getFeaturedProducts(),
    getLatestProducts(8),
    getSiteSettings(),
  ]);

  // Novedades = lo más reciente que aún no aparece en Destacados (evita duplicar).
  const featuredIds = new Set(featured.map((p) => p.id));
  const novedades = latest.filter((p) => !featuredIds.has(p.id)).slice(0, 4);

  // Portada gestionable desde el panel (Apariencia); con respaldos por defecto.
  const heroImage = settings[SETTING_KEYS.heroImage];
  const heroTitle = settings[SETTING_KEYS.heroTitle] || siteConfig.hero.title;
  const heroSubtitle =
    settings[SETTING_KEYS.heroSubtitle] || siteConfig.hero.subtitle;

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative h-[85svh] min-h-140 w-full overflow-hidden bg-foreground">
        {heroImage ? (
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          // Respaldo sin foto: negro/taupe de marca, no gris genérico de Tailwind.
          <div className="from-foreground via-foreground to-ring/40 absolute inset-0 bg-linear-to-br" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/25 to-black/30" />

        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl text-white">
              <span className="bg-accent text-foreground inline-flex px-3 py-1 text-[11px] font-medium tracking-[0.2em] uppercase">
                Nueva colección
              </span>
              <h1 className="font-display mt-5 text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                {heroTitle}
              </h1>
              <p className="mt-5 max-w-md text-base text-white/80 sm:text-lg">
                {heroSubtitle}
              </p>
              {/* Una sola acción en el hero (docs/09 §10, ley de Hick): antes
                  había un segundo link "Ver conjuntos" al lado que llevaba a
                  una versión filtrada de lo mismo — dos invitaciones a "mirar
                  productos" compitiendo sin necesidad. */}
              <div className="mt-8 flex items-center">
                <Button
                  asChild
                  size="lg"
                  className="h-12 gap-3 rounded-full pr-2 pl-6 text-sm"
                >
                  <Link href="/tienda">
                    Ver la colección
                    <span className="bg-background/20 flex size-8 items-center justify-center rounded-full transition-transform duration-300 ease-out group-hover/button:translate-x-0.5">
                      <ArrowRight className="size-4" />
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Indicador de scroll (respeta movimiento reducido vía globals.css). */}
        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
          <ChevronDown
            className="size-6 animate-bounce text-white/60"
            aria-hidden="true"
          />
        </div>
      </section>

      {/* ── Destacados ── (solo si hay productos destacados) */}
      {featured.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="text-muted-foreground text-[11px] font-medium tracking-[0.2em] uppercase">
                  Selección
                </span>
                <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
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
          </Reveal>

          <ProductGrid products={featured} className="mt-10" />
        </section>
      ) : null}

      {/* ── Categorías ── */}
      <CategorySection />

      {/* ── Novedades ── (recientes que no están en Destacados) */}
      {novedades.length > 0 ? (
        <section className="border-t">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <Reveal>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <span className="text-muted-foreground text-[11px] font-medium tracking-[0.2em] uppercase">
                    Recién llegado
                  </span>
                  <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                    Novedades
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
            </Reveal>

            <ProductGrid products={novedades} className="mt-10" />
          </div>
        </section>
      ) : null}

      {/* ── Propuestas de valor ── */}
      {/* Franja con baño nude sutil: separa esta sección de "servicio" del
          resto sin competir con las fotos de producto (docs/06 §5.5). El
          trazo de marca de fondo (docs/06 §5.5, sugerido y nunca implementado
          hasta tener el SVG real) es solo textura al 6% — los íconos
          funcionales (camión, escudo…) siguen siendo la señal principal. */}
      <section className="relative overflow-hidden border-t bg-accent/20">
        <BrandMotif
          variant="moño"
          className="pointer-events-none absolute top-1/2 right-0 h-[140%] w-auto -translate-y-1/2 translate-x-1/4 text-foreground/6"
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
          {VALUE_PROPS.map(({ icon: Icon, title, description }, i) => (
            <Reveal key={title} delayMs={i * 100}>
              <div className="flex items-start gap-4">
                <span className="bg-background flex size-11 shrink-0 items-center justify-center rounded-full">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-medium">{title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
