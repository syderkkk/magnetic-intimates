"use client";

import { Ruler } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/** Filas de la guía de tallas (medidas en cm, referenciales). */
const SIZE_ROWS = [
  { size: "XS", bust: "78–82", waist: "60–64", hip: "84–88" },
  { size: "S", bust: "82–86", waist: "64–68", hip: "88–92" },
  { size: "M", bust: "86–90", waist: "68–72", hip: "92–96" },
  { size: "L", bust: "90–95", waist: "72–77", hip: "96–101" },
  { size: "XL", bust: "95–100", waist: "77–82", hip: "101–106" },
];

/**
 * Guía de tallas en un panel lateral. Trae su propio botón disparador, pensado
 * para colocarse junto al selector de talla. La tabla es referencial.
 * TODO: cuando haya tablas por categoría/producto, alimentarlas desde datos.
 */
export function SizeGuideSheet() {
  return (
    <Sheet>
      <SheetTrigger className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline">
        <Ruler className="size-3.5" aria-hidden="true" />
        Guía de tallas
      </SheetTrigger>

      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4 pr-12">
          <SheetTitle className="font-display text-base tracking-wide">
            Guía de tallas
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Medidas referenciales en centímetros. Si estás entre dos tallas, te
            recomendamos elegir la mayor.
          </SheetDescription>
        </SheetHeader>

        <div className="overflow-y-auto px-5 py-5">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b text-left text-xs tracking-wide text-muted-foreground uppercase">
                <th scope="col" className="py-2.5 pr-2 font-medium">
                  Talla
                </th>
                <th scope="col" className="py-2.5 px-2 font-medium">
                  Busto
                </th>
                <th scope="col" className="py-2.5 px-2 font-medium">
                  Cintura
                </th>
                <th scope="col" className="py-2.5 pl-2 font-medium">
                  Cadera
                </th>
              </tr>
            </thead>
            <tbody>
              {SIZE_ROWS.map((row) => (
                <tr key={row.size} className="border-b last:border-0">
                  <th
                    scope="row"
                    className="py-3 pr-2 text-left font-semibold"
                  >
                    {row.size}
                  </th>
                  <td className="py-3 px-2 tabular-nums">{row.bust}</td>
                  <td className="py-3 px-2 tabular-nums">{row.waist}</td>
                  <td className="py-3 pl-2 tabular-nums">{row.hip}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
            ¿Dudas con tu talla? Escríbenos por WhatsApp y te ayudamos a elegir.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
