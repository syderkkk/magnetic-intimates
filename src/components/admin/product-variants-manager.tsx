"use client";

import { CircleAlert, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  addProductVariant,
  deleteProductVariant,
  updateVariantStock,
} from "@/actions/variants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionResult } from "@/types/action";

interface Variant {
  id: string;
  sizeName: string;
  colorName: string;
  colorHex: string;
  sku: string;
  stock: number;
}

interface ProductVariantsManagerProps {
  productId: string;
  variants: Variant[];
  sizes: { id: string; name: string }[];
  colors: { id: string; name: string; hex: string }[];
}

const selectClasses =
  "h-10 rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

/**
 * Gestor de variantes (talla × color) con su stock. Agregar, editar stock
 * (al salir del campo) y eliminar; el SKU se genera solo. Las tallas/colores
 * salen del catálogo. Es lo que define qué ve el cliente en la ficha.
 */
export function ProductVariantsManager({
  productId,
  variants,
  sizes,
  colors,
}: ProductVariantsManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [sizeId, setSizeId] = useState(sizes[0]?.id ?? "");
  const [colorId, setColorId] = useState(colors[0]?.id ?? "");
  const [stock, setStock] = useState("0");

  function run(action: () => Promise<ActionResult>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  function onAdd() {
    const formData = new FormData();
    formData.append("productId", productId);
    formData.append("sizeId", sizeId);
    formData.append("colorId", colorId);
    formData.append("stock", String(Number(stock) || 0));
    run(() => addProductVariant(formData));
  }

  function onDelete(variantId: string) {
    const formData = new FormData();
    formData.append("variantId", variantId);
    run(() => deleteProductVariant(formData));
  }

  function onStockBlur(variant: Variant, raw: string) {
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0 || value === variant.stock) return;
    run(() => updateVariantStock({ variantId: variant.id, stock: value }));
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold tracking-wide uppercase">
        Variantes y stock
        <span className="ml-2 text-xs font-normal text-muted-foreground tabular-nums">
          {variants.length}
        </span>
      </h2>

      {/* Agregar variante */}
      <div className="flex flex-wrap items-end gap-2 rounded-xl border bg-muted/30 p-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Talla
          <select
            value={sizeId}
            onChange={(e) => setSizeId(e.target.value)}
            className={selectClasses}
          >
            {sizes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Color
          <select
            value={colorId}
            onChange={(e) => setColorId(e.target.value)}
            className={selectClasses}
          >
            {colors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Stock
          <Input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="h-10 w-20 tabular-nums"
          />
        </label>
        <Button
          type="button"
          variant="outline"
          disabled={pending || !sizeId || !colorId}
          onClick={onAdd}
          className="h-10 rounded-full px-4 text-sm"
        >
          <Plus className="size-4" aria-hidden="true" />
          Agregar
        </Button>
      </div>

      {error ? (
        <p
          role="alert"
          className="flex items-center gap-2 text-sm text-destructive"
        >
          <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}

      {/* Lista de variantes */}
      {variants.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          Aún no hay variantes. Agrega combinaciones de talla y color con su
          stock para que el producto se pueda comprar.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs tracking-wide text-muted-foreground uppercase">
                <th className="px-3 py-2.5 font-medium">Talla</th>
                <th className="px-3 py-2.5 font-medium">Color</th>
                <th className="hidden px-3 py-2.5 font-medium sm:table-cell">
                  SKU
                </th>
                <th className="px-3 py-2.5 font-medium">Stock</th>
                <th className="px-3 py-2.5">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {variants.map((variant) => (
                <tr key={variant.id}>
                  <td className="px-3 py-2.5 font-medium">{variant.sizeName}</td>
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-2">
                      <span
                        className="size-4 shrink-0 rounded-full ring-1 ring-black/10"
                        style={{ backgroundColor: variant.colorHex }}
                        aria-hidden="true"
                      />
                      {variant.colorName}
                    </span>
                  </td>
                  <td className="hidden px-3 py-2.5 font-mono text-xs text-muted-foreground sm:table-cell">
                    {variant.sku}
                  </td>
                  <td className="px-3 py-2.5">
                    <Input
                      type="number"
                      min="0"
                      defaultValue={variant.stock}
                      disabled={pending}
                      onBlur={(e) => onStockBlur(variant, e.target.value)}
                      className="h-9 w-20 tabular-nums"
                      aria-label={`Stock de ${variant.sizeName} / ${variant.colorName}`}
                    />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => onDelete(variant.id)}
                      aria-label="Eliminar variante"
                      className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pending ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
          Guardando…
        </p>
      ) : null}
    </div>
  );
}
