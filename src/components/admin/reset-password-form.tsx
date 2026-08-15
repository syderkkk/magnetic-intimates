"use client";

import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { resetPassword } from "@/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ResetPasswordFormProps {
  token: string;
}

/** Elige la nueva contraseña con el token recibido por correo. */
export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = String(
      new FormData(event.currentTarget).get("password") ?? "",
    );
    setError(null);
    startTransition(async () => {
      const result = await resetPassword({ token, password });
      if (!result.success) setError(result.error);
      else setDone(true);
    });
  }

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <p className="flex items-center justify-center gap-2 rounded-lg bg-muted px-3 py-3 text-sm">
          <CircleCheck className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
          Contraseña actualizada.
        </p>
        <Button asChild className="h-11 w-full rounded-full text-sm">
          <Link href="/login">Ir a iniciar sesión</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium">
          Nueva contraseña
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="h-11"
        />
        <p className="text-xs text-muted-foreground">Mínimo 8 caracteres.</p>
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
            Guardando…
          </>
        ) : (
          "Guardar nueva contraseña"
        )}
      </Button>
    </form>
  );
}
