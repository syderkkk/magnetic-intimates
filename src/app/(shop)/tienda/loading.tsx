/**
 * Esqueleto de carga de /tienda. La ruta es dinámica (filtros por URL), así que
 * al navegar Next muestra ESTO al instante mientras el servidor renderiza la
 * grilla — feedback inmediato en vez de una pantalla congelada. Next puede
 * precargar este estado, por lo que la transición se siente instantánea.
 *
 * Replica el layout real: breadcrumb y título reales; filtros y grilla en gris.
 */

function Bar({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
  );
}

const FILTER_GROUPS = ["Categoría", "Talla", "Color"];

export default function Loading() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-2 pb-12 sm:px-6 lg:px-8 lg:pt-2 lg:pb-16">
      <header className="mb-8">
        <nav
          aria-hidden="true"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <span>Inicio</span>
          <span>/</span>
          <span className="text-foreground">Tienda</span>
        </nav>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Tienda
        </h1>
      </header>

      <div className="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-10 xl:grid-cols-[16rem_1fr]">
        {/* Filtros (escritorio) */}
        <aside className="hidden lg:block" aria-hidden="true">
          <div className="space-y-8">
            <Bar className="h-5 w-20" />
            {FILTER_GROUPS.map((group) => (
              <div key={group} className="space-y-3 border-t pt-5">
                <Bar className="h-4 w-24" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <Bar key={i} className="h-4 w-full max-w-40" />
                ))}
              </div>
            ))}
          </div>
        </aside>

        <div aria-busy="true" aria-label="Cargando productos">
          {/* Barra de herramientas (resultados + orden) */}
          <div className="flex items-center justify-between gap-4">
            <Bar className="h-5 w-28" />
            <Bar className="h-10 w-44" />
          </div>

          {/* Grilla de productos (misma densidad compacta que la real) */}
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col">
                <Bar className="aspect-4/5 w-full" />
                <div className="mt-3 space-y-2">
                  <Bar className="h-3 w-16" />
                  <Bar className="h-4 w-3/4" />
                  <Bar className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
