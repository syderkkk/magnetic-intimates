"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { createContactSubmission } from "@/actions/contact";
import { FormField } from "@/components/shop/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema, type ContactValues } from "@/schemas/contact";

/**
 * Formulario de contacto: valida con Zod en cliente y servidor, envía por
 * Server Action y muestra un estado de éxito claro (docs/09 §1: visibilidad
 * de estado, mensaje humano, sin jerga técnica).
 */
export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    mode: "onTouched",
  });

  async function onSubmit(values: ContactValues) {
    setServerError(null);
    const result = await createContactSubmission(values);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    reset();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center rounded-2xl border bg-card px-6 py-14 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-foreground text-background">
          <CheckCircle2 className="size-6" strokeWidth={2.5} aria-hidden="true" />
        </span>
        <h2 className="mt-5 font-display text-xl font-semibold tracking-tight">
          ¡Gracias por escribirnos!
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Recibimos tu mensaje y te responderemos a la brevedad, normalmente
          dentro de 1 a 2 días hábiles.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6 rounded-full px-6"
          onClick={() => setSent(false)}
        >
          Enviar otro mensaje
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <FormField label="Nombre" htmlFor="name" error={errors.name?.message}>
        <Input
          id="name"
          autoComplete="name"
          aria-invalid={!!errors.name}
          className="h-11"
          {...register("name")}
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

      <FormField label="Mensaje" htmlFor="message" error={errors.message?.message}>
        <Textarea
          id="message"
          rows={5}
          placeholder="Cuéntanos en qué podemos ayudarte…"
          aria-invalid={!!errors.message}
          {...register("message")}
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
            Enviar mensaje
          </>
        )}
      </Button>
    </form>
  );
}
