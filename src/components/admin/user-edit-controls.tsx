"use client";

import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { requestPasswordReset } from "@/actions/password-reset";
import { toggleUserActive, updateUserRole } from "@/actions/users";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/types/action";

interface UserEditControlsProps {
  userId: string;
  email: string;
  role: "admin" | "editor";
  isActive: boolean;
  isSelf: boolean;
}

const selectClasses =
  "h-10 rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

/** Cambiar rol, activar/desactivar y disparar el enlace de recuperación. */
export function UserEditControls({
  userId,
  email,
  role,
  isActive,
  isSelf,
}: UserEditControlsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [roleValue, setRoleValue] = useState(role);

  function run(action: () => Promise<ActionResult>, onOk?: () => void) {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) setError(result.error);
      else {
        onOk?.();
        router.refresh();
      }
    });
  }

  if (isSelf) {
    return (
      <p className="text-sm text-muted-foreground">
        No puedes editar el rol ni el estado de tu propia cuenta desde aquí.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="role" className="block text-sm font-medium">
          Rol
        </label>
        <select
          id="role"
          value={roleValue}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.value as "admin" | "editor";
            setRoleValue(next);
            run(() => updateUserRole({ userId, role: next }));
          }}
          className={selectClasses}
        >
          <option value="editor">Editor</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={isActive ? "destructive" : "outline"}
          disabled={pending}
          onClick={() => run(() => toggleUserActive({ userId, isActive: !isActive }))}
          className="h-9 rounded-full px-4 text-sm"
        >
          {isActive ? "Desactivar cuenta" : "Reactivar cuenta"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() =>
            run(
              () => requestPasswordReset({ email }),
              () => setNotice("Enlace de recuperación enviado."),
            )
          }
          className="h-9 rounded-full px-4 text-sm"
        >
          Enviar enlace de recuperación
        </Button>
      </div>

      {pending ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
          Guardando…
        </p>
      ) : null}

      {notice ? (
        <p className="flex items-center gap-2 text-sm text-emerald-700">
          <CircleCheck className="size-4 shrink-0" aria-hidden="true" />
          {notice}
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
          <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
