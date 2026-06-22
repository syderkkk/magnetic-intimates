import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { slugify } from "@/lib/data/filters";
import { db } from "@/lib/db";

/**
 * Sección "Explora por categoría" del inicio. Lee las categorías activas de la
 * BD; cada una usa su imagen gestionada desde el panel (Apariencia/Categorías)
 * o un fondo de marca si aún no tiene. El enlace filtra la tienda por categoría.
 */
export async function CategorySection() {
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { position: "asc" },
    take: 4,
  });

  if (categories.length === 0) return null;

  return (
    <section className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mb-10">
        <span className="text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Colecciones
        </span>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Explora por categoría
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-5">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/tienda?cat=${slugify(category.name)}`}
            className="group relative block aspect-3/4 overflow-hidden rounded-2xl bg-muted"
            aria-label={`Ver categoría ${category.name}`}
          >
            {category.imageUrl ? (
              <Image
                src={category.imageUrl}
                alt={`Categoría ${category.name} de NUE INTIME`}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-linear-to-br from-neutral-700 to-neutral-950 transition-transform duration-500 ease-out group-hover:scale-105" />
            )}
            {/* Degradado inferior para legibilidad */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

            <div className="absolute bottom-0 left-0 p-5 text-white">
              <p className="font-display text-lg font-semibold leading-tight">
                {category.name}
              </p>
              <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-white/75 transition-[gap] duration-300 group-hover:gap-2">
                Explorar
                <ArrowRight className="size-3" aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </div>
      </div>
    </section>
  );
}
