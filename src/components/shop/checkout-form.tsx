"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Check,
  CreditCard,
  LoaderCircle,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { computeOrderSummary } from "@/lib/cart-totals";
import { formatPrice } from "@/lib/money";
import { checkoutSchema, type CheckoutValues } from "@/schemas/checkout";
import {
  useCartCount,
  useCartStore,
  useCartSubtotal,
} from "@/stores/cart-store";

const FORM_ID = "checkout-form";

/**
 * Checkout (compra como invitado): formulario de datos del comprador + resumen
 * del pedido en vivo, leído del carrito (cliente). Valida con Zod en el cliente
 * para una buena UX; el cobro real y el descuento de stock ocurrirán en el
 * servidor en una fase posterior.
 *
 * TODO: fase v0.4 — al enviar, una Server Action debe recalcular precios y stock
 * en el servidor dentro de `prisma.$transaction`, crear el pedido `pendiente` y
 * abrir el pago con Izipay (CLAUDE.md §11.3). Por ahora solo se validan y
 * confirman los datos; no se genera ningún cobro.
 */
export function CheckoutForm() {
  const mounted = useHasMounted();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const count = useCartCount();
  const subtotal = useCartSubtotal();
  const summary = computeOrderSummary(subtotal);
  const [confirmation, setConfirmation] = useState<CheckoutValues | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    mode: "onTouched",
  });

  async function onSubmit(values: CheckoutValues) {
    // Simula el trabajo de servidor para que el spinner se perciba (UX).
    await new Promise((resolve) => setTimeout(resolve, 600));
    setConfirmation(values);
  }

  // Evita el parpadeo de "carrito vacío" mientras se hidrata el estado (el
  // carrito vive en localStorage y no existe en el render del servidor).
  if (!mounted) {
    return <CheckoutSkeleton />;
  }

  if (confirmation) {
    return <CheckoutConfirmation firstName={confirmation.firstName} />;
  }

  if (items.length === 0) {
    return <EmptyCheckout />;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <Link
        href="/tienda"
        className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4 transition-transform duration-200 ease-out group-hover:-translate-x-0.5" />
        Seguir comprando
      </Link>

      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        Finalizar compra
      </h1>

      <div className="mt-8 lg:grid lg:grid-cols-[1fr_22rem] lg:gap-12 xl:grid-cols-[1fr_24rem]">
        {/* ── Formulario ── */}
        <form
          id={FORM_ID}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-10"
        >
          {/* Contacto */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold tracking-[0.12em] text-foreground uppercase">
              Contacto
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Correo electrónico"
                htmlFor="email"
                error={errors.email?.message}
              >
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
              </Field>
              <Field
                label="Teléfono"
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
              </Field>
            </div>
          </fieldset>

          {/* Entrega */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold tracking-[0.12em] text-foreground uppercase">
              Datos de entrega
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Nombre"
                htmlFor="firstName"
                error={errors.firstName?.message}
              >
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  aria-invalid={!!errors.firstName}
                  className="h-11"
                  {...register("firstName")}
                />
              </Field>
              <Field
                label="Apellidos"
                htmlFor="lastName"
                error={errors.lastName?.message}
              >
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  aria-invalid={!!errors.lastName}
                  className="h-11"
                  {...register("lastName")}
                />
              </Field>
            </div>

            <Field
              label="Dirección"
              htmlFor="address"
              error={errors.address?.message}
            >
              <Input
                id="address"
                autoComplete="street-address"
                placeholder="Av. / Calle, número, dpto."
                aria-invalid={!!errors.address}
                className="h-11"
                {...register("address")}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Distrito"
                htmlFor="district"
                error={errors.district?.message}
              >
                <Input
                  id="district"
                  autoComplete="address-level3"
                  aria-invalid={!!errors.district}
                  className="h-11"
                  {...register("district")}
                />
              </Field>
              <Field
                label="Ciudad / Departamento"
                htmlFor="city"
                error={errors.city?.message}
              >
                <Input
                  id="city"
                  autoComplete="address-level1"
                  aria-invalid={!!errors.city}
                  className="h-11"
                  {...register("city")}
                />
              </Field>
            </div>

            <Field
              label="Referencia (opcional)"
              htmlFor="reference"
              error={errors.reference?.message}
            >
              <Input
                id="reference"
                placeholder="Cerca de…, color de fachada, etc."
                aria-invalid={!!errors.reference}
                className="h-11"
                {...register("reference")}
              />
            </Field>

            {/* TODO: confirmar con cliente — método de entrega (envío a domicilio
                vs. recojo, decisión #4) y zonas/costos (decisión #5). Aquí irá el
                selector de método y el cálculo de envío. */}
            <p className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2.5 text-xs text-muted-foreground">
              <Truck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              El método y el costo de envío se coordinan según tu zona. Te
              contactaremos para confirmarlo.
            </p>
          </fieldset>
        </form>

        {/* ── Resumen del pedido ── */}
        <aside className="mt-10 lg:mt-0">
          <div className="lg:sticky lg:top-24">
            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-xs font-semibold tracking-[0.12em] text-foreground uppercase">
                  Resumen del pedido
                </h2>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {count} {count === 1 ? "artículo" : "artículos"}
                </span>
              </div>

              {/* Lista con scroll propio: soporta muchos productos sin empujar los
                  totales ni el botón fuera de la vista. */}
              <ul className="-mr-2 max-h-88 space-y-1 overflow-y-auto pr-2">
                {items.map((line) => {
                  const atMin = line.quantity <= 1;
                  return (
                    <li
                      key={line.key}
                      className="flex gap-3 rounded-xl p-1.5 transition-colors hover:bg-muted/50"
                    >
                      <div className="relative aspect-4/5 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={line.image}
                          alt={line.imageAlt}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {line.name}
                            </p>
                            {line.variantLabel ? (
                              <p className="truncate text-xs text-muted-foreground">
                                {line.variantLabel}
                              </p>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(line.key)}
                            aria-label={`Quitar ${line.name} del pedido`}
                            className="-m-1 shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex items-center rounded-full border">
                            <button
                              type="button"
                              disabled={atMin}
                              onClick={() =>
                                updateQuantity(line.key, line.quantity - 1)
                              }
                              aria-label="Reducir cantidad"
                              className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                            >
                              <Minus className="size-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm tabular-nums">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(line.key, line.quantity + 1)
                              }
                              aria-label="Aumentar cantidad"
                              className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                          <span className="text-sm font-medium tabular-nums">
                            {formatPrice(line.unitPriceCents * line.quantity)}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 space-y-2 border-t pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium tabular-nums">
                    {formatPrice(summary.subtotalCents)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="text-muted-foreground">
                    {summary.shippingPending ? "Por calcular" : formatPrice(summary.shippingCents)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between border-t pt-4">
                <span className="text-sm font-medium">Total</span>
                <span className="font-display text-xl font-semibold tabular-nums">
                  {formatPrice(summary.totalCents)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Impuestos y envío se confirman al coordinar el pago.
              </p>

              <Button
                type="submit"
                form={FORM_ID}
                disabled={isSubmitting}
                className="mt-5 h-12 w-full rounded-full text-sm"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                    Procesando…
                  </>
                ) : (
                  <>
                    <CreditCard className="size-4" aria-hidden="true" />
                    Continuar al pago
                  </>
                )}
              </Button>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="size-3.5" aria-hidden="true" />
                Pago seguro y datos protegidos
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

/** Etiqueta + campo + mensaje de error accesible. */
function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="text-xs text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Confirmación tras validar los datos (sin cobro real todavía). */
function CheckoutConfirmation({ firstName }: { firstName: string }) {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center sm:py-28">
      <span className="flex size-16 items-center justify-center rounded-full bg-foreground text-background">
        <Check className="size-7" strokeWidth={2.5} aria-hidden="true" />
      </span>
      <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        ¡Gracias, {firstName}!
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Recibimos tus datos correctamente. En breve te contactaremos para
        coordinar el pago y la entrega de tu pedido.
      </p>
      {/* TODO: fase v0.4 — reemplazar por el flujo de pago real con Izipay y la
          confirmación del pedido pagado (CLAUDE.md §11.3). */}
      <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5" aria-hidden="true" />
        Aún no se ha realizado ningún cobro.
      </p>
      <Button asChild className="mt-8 h-11 rounded-full px-6">
        <Link href="/tienda">Volver a la tienda</Link>
      </Button>
    </section>
  );
}

/** Estado de carrito vacío en el checkout. */
function EmptyCheckout() {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center sm:py-28">
      <ShoppingBag
        className="size-10 text-muted-foreground"
        aria-hidden="true"
      />
      <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">
        Tu carrito está vacío
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Agrega algunas prendas antes de finalizar la compra.
      </p>
      <Button asChild className="mt-6 h-11 rounded-full px-6">
        <Link href="/tienda">Ver la tienda</Link>
      </Button>
    </section>
  );
}

/** Esqueleto mientras se hidrata el carrito (evita saltos de layout). */
function CheckoutSkeleton() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 h-9 w-64" />
      <div className="mt-8 lg:grid lg:grid-cols-[1fr_22rem] lg:gap-12 xl:grid-cols-[1fr_24rem]">
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="mt-10 h-80 w-full rounded-2xl lg:mt-0" />
      </div>
    </section>
  );
}
