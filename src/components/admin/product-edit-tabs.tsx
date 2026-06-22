"use client";

import { Tabs } from "radix-ui";

interface ProductEditTabsProps {
  dataPanel: React.ReactNode;
  variantsPanel: React.ReactNode;
  imagesPanel: React.ReactNode;
  variantsCount: number;
  imagesCount: number;
}

const triggerClasses =
  "relative inline-flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-foreground after:opacity-0 after:transition-opacity data-[state=active]:after:opacity-100";

/** Pequeña píldora con el conteo, junto al nombre de la pestaña. */
function Count({ value }: { value: number }) {
  return (
    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground tabular-nums">
      {value}
    </span>
  );
}

/**
 * Edición de producto en pestañas (Datos · Variantes y stock · Imágenes): una
 * tarea clara a la vez, sin scroll largo y responsive (la barra hace scroll
 * horizontal en pantallas chicas). Los paneles se mantienen montados
 * (`forceMount`) para no perder lo que se está editando al cambiar de pestaña.
 */
export function ProductEditTabs({
  dataPanel,
  variantsPanel,
  imagesPanel,
  variantsCount,
  imagesCount,
}: ProductEditTabsProps) {
  return (
    <Tabs.Root defaultValue="datos" className="w-full">
      <Tabs.List
        className="flex gap-1 overflow-x-auto border-b scrollbar-none"
        aria-label="Secciones del producto"
      >
        <Tabs.Trigger value="datos" className={triggerClasses}>
          Datos
        </Tabs.Trigger>
        <Tabs.Trigger value="variantes" className={triggerClasses}>
          Variantes y stock
          <Count value={variantsCount} />
        </Tabs.Trigger>
        <Tabs.Trigger value="imagenes" className={triggerClasses}>
          Imágenes
          <Count value={imagesCount} />
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content
        value="datos"
        forceMount
        className="pt-6 data-[state=inactive]:hidden"
      >
        <div className="rounded-2xl border bg-background p-5 sm:p-6">
          {dataPanel}
        </div>
      </Tabs.Content>

      <Tabs.Content
        value="variantes"
        forceMount
        className="pt-6 data-[state=inactive]:hidden"
      >
        <div className="rounded-2xl border bg-background p-5 sm:p-6">
          {variantsPanel}
        </div>
      </Tabs.Content>

      <Tabs.Content
        value="imagenes"
        forceMount
        className="pt-6 data-[state=inactive]:hidden"
      >
        <div className="rounded-2xl border bg-background p-5 sm:p-6">
          {imagesPanel}
        </div>
      </Tabs.Content>
    </Tabs.Root>
  );
}
