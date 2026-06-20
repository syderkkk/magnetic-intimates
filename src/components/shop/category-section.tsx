import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const SHOP_CATEGORIES = [
  {
    name: "Conjuntos",
    href: "/tienda?cat=conjuntos",
    imgSeed: "nue-cat-conjuntos",
    description: "Sets coordinados",
  },
  {
    name: "Bodies",
    href: "/tienda?cat=bodies",
    imgSeed: "nue-cat-bodies",
    description: "Bodies y maillots",
  },
  {
    name: "Pijamas",
    href: "/tienda?cat=pijamas",
    imgSeed: "nue-cat-pijamas",
    description: "Comodidad nocturna",
  },
  {
    name: "Lencería",
    href: "/tienda?cat=lencer%C3%ADa",
    imgSeed: "nue-cat-lenceria",
    description: "Diseño íntimo",
  },
];

export function CategorySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mb-10">
        <span className="text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Colecciones
        </span>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Explora por categoría
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-5">
        {SHOP_CATEGORIES.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            className="group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-muted"
            aria-label={`Ver categoría ${cat.name}`}
          >
            <Image
              src={`https://picsum.photos/seed/${cat.imgSeed}/600/800`}
              alt={`Categoría ${cat.name} de NUE INTIME`}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            {/* Degradado inferior para legibilidad */}
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent" />

            <div className="absolute bottom-0 left-0 p-5 text-white">
              <p className="font-display text-lg font-semibold leading-tight">
                {cat.name}
              </p>
              <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-white/75 transition-[gap] duration-300 group-hover:gap-2">
                Explorar
                <ArrowRight className="size-3" aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
