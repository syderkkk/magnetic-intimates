"use client";

import { CircleAlert, LoaderCircle } from "lucide-react";
import { useState, useTransition } from "react";

import { requestPasswordReset } from "@/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Pide el correo y dispara el envío del enlace de recuperación. */
export function ForgotPasswordForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    setError(null);
    startTransition(async () => {
      const result = await requestPasswordReset({ email });
      if (!result.success) setError(result.error);
      else setSent(true);
    });
  }

  if (sent) {
    return (
      <p className="rounded-lg bg-muted px-3 py-3 text-sm">
        Si ese correo tiene una cuenta, te enviamos un enlace para elegir una
        contraseña nueva. Revisa tu bandeja (y spam).
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium">
          Correo electrónico
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          required
          placeholder="admin@tudominio.com"
          className="h-11"
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-full text-sm"
      >
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            Enviando…
          </>
        ) : (
          "Enviar enlace de recuperación"
        )}
      </Button>
    </form>
  );
}
