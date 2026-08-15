"use client";

import { CircleAlert, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createUser } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const selectClasses =
  "h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

/** Crea una cuenta de staff (admin/editor) con contraseña inicial. */
export function UserCreateForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await createUser({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
        role: String(form.get("role") ?? "editor"),
      });
      if (!result.success) setError(result.error);
      else router.push("/admin/usuarios");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-sm font-medium">
          Nombre
        </label>
        <Input id="name" name="name" required className="h-11" />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium">
          Correo electrónico
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="off"
          required
          className="h-11"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium">
          Contraseña inicial
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
        <p className="text-xs text-muted-foreground">
          Mínimo 8 caracteres. La persona puede cambiarla luego desde
          &quot;¿Olvidaste tu contraseña?&quot; en el login.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="role" className="block text-sm font-medium">
          Rol
        </label>
        <select id="role" name="role" defaultValue="editor" className={selectClasses}>
          <option value="editor">Editor — catálogo, pedidos, contenido</option>
          <option value="admin">Administrador — todo, incluida gestión de usuarios</option>
        </select>
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

      <Button type="submit" disabled={pending} className="h-11 w-full rounded-full text-sm">
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            Creando…
          </>
        ) : (
          "Crear usuario"
        )}
      </Button>
    </form>
  );
}
