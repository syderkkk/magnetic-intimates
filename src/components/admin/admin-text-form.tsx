"use client";

import { Check, CircleAlert, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionResult } from "@/types/action";

interface AdminTextFormProps {
  label: string;
  defaultValue: string;
  /** Server Action que recibe el objeto `{ ...extraFields, [valueKey]: value }`. */
  action: (input: unknown) => Promise<ActionResult>;
  /** Clave bajo la que va el valor (ej. "name", "value"). */
  valueKey: string;
  /** Campos fijos extra (ej. id de categoría, clave del ajuste). */
  extraFields?: Record<string, string>;
  multiline?: boolean;
  placeholder?: string;
  hint?: string;
  saveLabel?: string;
}

/** Formulario genérico de un campo de texto + guardar (reutilizable). */
export function AdminTextForm({
  label,
  defaultValue,
  action,
  valueKey,
  extraFields,
  multiline = false,
  placeholder,
  hint,
  saveLabel = "Guardar",
}: AdminTextFormProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    startTransition(async () => {
      const res = await action({ ...(extraFields ?? {}), [valueKey]: value });
      setResult(res);
      if (res.success) router.refresh();
    });
  }

  const inputClasses =
    "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-2">
      <label htmlFor={`f-${valueKey}-${label}`} className="block text-sm font-medium">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={`f-${valueKey}-${label}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={2}
          placeholder={placeholder}
          className={inputClasses}
        />
      ) : (
        <Input
          id={`f-${valueKey}-${label}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="h-11"
        />
      )}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}

      <div className="flex items-center gap-3 pt-1">
        <Button
          type="submit"
          disabled={pending}
          variant="outline"
          className="h-9 rounded-full px-4 text-sm"
        >
          {pending ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              Guardando…
            </>
          ) : (
            saveLabel
          )}
        </Button>
        {result?.success ? (
          <span className="flex items-center gap-1 text-xs text-emerald-700">
            <Check className="size-3.5" aria-hidden="true" /> Guardado
          </span>
        ) : null}
        {result && !result.success ? (
          <span className="flex items-center gap-1 text-xs text-destructive">
            <CircleAlert className="size-3.5" aria-hidden="true" /> {result.error}
          </span>
        ) : null}
      </div>
    </form>
  );
}
