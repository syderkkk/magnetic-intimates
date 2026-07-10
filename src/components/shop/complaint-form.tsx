"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { createComplaint } from "@/actions/complaints";
import { FormField } from "@/components/shop/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  complaintSchema,
  DOCUMENT_TYPE_OPTIONS,
  type ComplaintValues,
} from "@/schemas/complaint";

const TYPE_OPTIONS = [
  { value: "reclamo", label: "Reclamo", hint: "Disconformidad con el producto o servicio." },
  { value: "queja", label: "Queja", hint: "Disconformidad con la atención al cliente." },
] as const;

/**
 * Formulario del Libro de Reclamaciones virtual (obligatorio INDECOPI,
 * CLAUDE.md §10). Al confirmar, muestra el número de correlativo — es el
 * comprobante que el cliente puede citar si hace seguimiento.
 */
export function ComplaintForm() {
  const [code, setCode] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ComplaintValues>({
    resolver: zodResolver(complaintSchema),
    mode: "onTouched",
    defaultValues: { type: "reclamo", documentType: "dni" },
  });

  async function onSubmit(values: ComplaintValues) {
    setServerError(null);
    const result = await createComplaint(values);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    setCode(result.data.code);
  }

  if (code) {
    return (
      <div className="flex flex-col items-center rounded-2xl border bg-card px-6 py-14 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-foreground text-background">
          <CheckCircle2 className="size-6" strokeWidth={2.5} aria-hidden="true" />
        </span>
        <h2 className="mt-5 font-display text-xl font-semibold tracking-tight">
          Registramos tu solicitud
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Te responderemos dentro de un plazo máximo de 30 días calendario, de
          acuerdo a lo establecido por INDECOPI.
        </p>
        <p className="mt-5 rounded-full bg-accent px-4 py-1.5 text-sm font-medium tracking-wide text-foreground">
          N.º {code}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Guarda este número para hacer seguimiento a tu solicitud.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="space-y-2">
        <p className="text-sm font-medium">Tipo de solicitud</p>
        <div role="radiogroup" aria-label="Tipo de solicitud" className="grid gap-2 sm:grid-cols-2">
          {TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer flex-col gap-0.5 rounded-lg border px-4 py-3 text-sm transition-colors has-checked:border-foreground has-checked:bg-muted has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-1"
            >
              <span className="flex items-center gap-2 font-medium">
                <input
                  type="radio"
                  value={option.value}
                  className="accent-foreground"
                  {...register("type")}
                />
                {option.label}
              </span>
              <span className="pl-5.5 text-xs text-muted-foreground">
                {option.hint}
              </span>
            </label>
          ))}
        </div>
        {errors.type ? (
          <p role="alert" className="text-xs text-destructive">
            {errors.type.message}
          </p>
        ) : null}
      </div>

      <FormField
        label="Nombre completo"
        htmlFor="customerName"
        error={errors.customerName?.message}
      >
        <Input
          id="customerName"
          autoComplete="name"
          aria-invalid={!!errors.customerName}
          className="h-11"
          {...register("customerName")}
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Correo electrónico" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="tucorreo@ejemplo.com"
            aria-invalid={!!errors.email}
            className="h-11"
            {...register("email")}
          />
        </FormField>
        <FormField
          label="Teléfono (opcional)"
          htmlFor="phone"
          error={errors.phone?.message}
        >
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="999 999 999"
            aria-invalid={!!errors.phone}
            className="h-11"
            {...register("phone")}
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-[auto_1fr]">
        <FormField
          label="Tipo de documento"
          htmlFor="documentType"
          error={errors.documentType?.message}
        >
          <select
            id="documentType"
            className="h-11 cursor-pointer rounded-lg border border-input bg-background px-3 text-sm transition-colors hover:border-foreground focus:ring-2 focus:ring-ring focus:outline-none sm:w-44"
            {...register("documentType")}
          >
            {DOCUMENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField
          label="Número de documento (opcional)"
          htmlFor="documentId"
          error={errors.documentId?.message}
        >
          <Input
            id="documentId"
            autoComplete="off"
            aria-invalid={!!errors.documentId}
            className="h-11"
            {...register("documentId")}
          />
        </FormField>
      </div>

      <FormField
        label="Detalle del reclamo o queja"
        htmlFor="detail"
        error={errors.detail?.message}
      >
        <Textarea
          id="detail"
          rows={5}
          placeholder="Describe qué ocurrió, el pedido involucrado (si aplica) y qué esperas como solución…"
          aria-invalid={!!errors.detail}
          {...register("detail")}
        />
      </FormField>

      {serverError ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {serverError}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-full text-sm sm:w-auto sm:px-8"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            Enviando…
          </>
        ) : (
          <>
            <Send className="size-4" aria-hidden="true" />
            Enviar solicitud
          </>
        )}
      </Button>
    </form>
  );
}
