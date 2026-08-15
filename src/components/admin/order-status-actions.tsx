"use client";

import { CircleAlert, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateOrderStatusAction } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS_META } from "@/lib/order-status";
import type { OrderStatus } from "@/generated/prisma/client";

interface OrderStatusActionsProps {
  orderId: string;
  nextStatuses: OrderStatus[];
}

const DESTRUCTIVE: OrderStatus[] = ["cancelado", "reembolsado"];

/** Botones con las transiciones válidas para el estado actual del pedido. */
export function OrderStatusActions({
  orderId,
  nextStatuses,
}: OrderStatusActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (nextStatuses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Este pedido está en un estado final: no admite más cambios.
      </p>
    );
  }

  function onChange(status: OrderStatus) {
    const destructive = DESTRUCTIVE.includes(status);
    if (
      destructive &&
      !window.confirm(
        `¿Confirmas pasar este pedido a "${ORDER_STATUS_META[status].label}"? ${
          status === "cancelado" || status === "reembolsado"
            ? "El stock reservado se repone automáticamente si corresponde."
            : ""
        }`,
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatusAction({ orderId, status });
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {nextStatuses.map((status) => (
          <Button
            key={status}
            type="button"
            variant={DESTRUCTIVE.includes(status) ? "destructive" : "outline"}
            disabled={pending}
            onClick={() => onChange(status)}
            className="h-9 rounded-full px-4 text-sm"
          >
            Marcar como {ORDER_STATUS_META[status].label.toLowerCase()}
          </Button>
        ))}
      </div>

      {pending ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
          Actualizando…
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
