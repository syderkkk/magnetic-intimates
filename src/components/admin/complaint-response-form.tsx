"use client";

import { CircleAlert, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { respondToComplaint } from "@/actions/complaints";
import { Button } from "@/components/ui/button";

interface ComplaintResponseFormProps {
  complaintId: string;
}

/** Escribir y enviar la respuesta de un reclamo/queja; lo marca resuelto. */
export function ComplaintResponseForm({ complaintId }: ComplaintResponseFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = String(
      new FormData(event.currentTarget).get("response") ?? "",
    );
    setError(null);
    startTransition(async () => {
      const result = await respondToComplaint({ complaintId, response });
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label htmlFor="response" className="block text-sm font-medium">
        Respuesta
      </label>
      <textarea
        id="response"
        name="response"
        required
        rows={5}
        placeholder="Escribe la respuesta que recibirá el cliente por correo…"
        className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      />

      {error ? (
        <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
          <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="h-10 rounded-full px-5 text-sm"
      >
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            Enviando…
          </>
        ) : (
          "Enviar respuesta y marcar resuelto"
        )}
      </Button>
    </form>
  );
}
