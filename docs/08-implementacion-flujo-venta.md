# Guía de implementación — flujo de venta completo (checkout → pedido → pago)

> `docs/05-pagos-izipay.md` es la **especificación** (qué debe cumplir el sistema).
> Este documento es el **plan de desarrollo**: los pasos en orden, archivo por
> archivo, con esqueletos de código alineados al proyecto real. Está pensado para
> ejecutarse con Claude Code u otro modelo, o a mano, sin perder ningún requisito.
>
> Reglas que aplican a TODO lo de aquí: dinero en céntimos enteros; precios/stock
> solo de la BD; transacciones Prisma para stock+pedido+pago; `ActionResult`
> tipado; comentarios en español; UI en español.

---

## Estado de partida (verificado en el código)

- `src/components/shop/checkout-form.tsx` — formulario completo de invitado con
  RHF + Zod, pero `onSubmit` solo simula (setTimeout) y muestra confirmación local.
- `src/schemas/checkout.ts` — schema del comprador listo para reutilizar en servidor.
- `src/stores/cart-store.ts` — carrito Zustand persist. **⚠️ No guarda `variantId`**:
  solo `key` (a veces el SKU), `productId` y `variantLabel` de texto.
- `src/components/shop/add-to-cart-button.tsx` (tarjetas del catálogo) — **⚠️ añade
  el producto SIN variante** (sin talla/color), con `key: product.id`.
- `src/components/shop/product-detail.tsx` — sí exige talla, pero guarda el SKU en
  `key`, no el id de la variante.
- No existen: `actions/orders.ts`, webhook, página de confirmación, cron, emails.

---

## Paso 0 — Prerrequisito: el carrito debe identificar la variante

Sin `variantId` el servidor no puede validar stock ni precio por talla/color.

**0.1 `src/stores/cart-store.ts`** — añadir el campo a `CartItem`:

```ts
export interface CartItem {
  key: string;            // = variantId (única por línea)
  variantId: string;      // ← NUEVO: id real de product_variants
  productId: string;
  // ...resto igual
}
```

**0.2 `src/components/shop/product-detail.tsx`** — al añadir, pasar
`variantId: selectedVariant.id` y usar `key: selectedVariant.id`. Si el producto
no tiene variantes (talla única sin registro), decidir: crear SIEMPRE al menos una
variante por producto en el admin/seed (recomendado: simplifica todo el flujo — el
stock vive únicamente en variantes), y entonces `variantId` nunca es null.

**0.3 `src/components/shop/add-to-cart-button.tsx`** (tarjetas) — un producto con
tallas no puede añadirse a ciegas. Opciones:
- (a) Si el producto tiene >1 variante → el botón navega a la ficha (`/producto/slug`).
- (b) Abrir un mini-selector de talla en un popover. ← mejor UX, más trabajo.
Empezar por (a); (b) es mejora posterior.

**0.4 Migración de carritos viejos**: al cambiar la forma de `CartItem`, subir la
`version` del `persist` de Zustand con `migrate` que descarte líneas sin
`variantId` (los carritos guardados en localStorage de visitantes previos).

✅ Criterio de aceptación: toda línea del carrito tiene `variantId` real de BD.

---

## Paso 1 — Migración de base de datos

Una sola migración (`pnpm db:migrate`) con:

1. **Enums nativos** (endurecen la integridad antes de tocar dinero):
   ```prisma
   enum OrderStatus  { pendiente pagado enviado entregado cancelado reembolsado }
   enum PaymentStatus { pendiente aprobado rechazado }
   ```
   y cambiar `Order.status` / `Payment.status` a estos tipos.
2. **Idempotencia del checkout**: en `Order` añadir
   `idempotencyKey String @unique @map("idempotency_key")`.
3. **Idempotencia del webhook**: en `Payment` añadir
   `@@unique([orderId, transactionId])`.
4. **Correlativo sin carrera**: secuencia de Postgres. En el SQL de la migración
   (editar el archivo generado):
   ```sql
   CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1001;
   ```
   (Arrancar en 1001 para que los números no delaten el volumen de ventas.)
5. `Payment.gatewayResponse` y `AuditLog.changes` → `Json` (opcional pero ideal
   en la misma migración).

---

## Paso 2 — Máquina de estados (`src/lib/order-status.ts`)

```ts
import "server-only";

/** Transiciones válidas del pedido (CLAUDE.md §11.2). */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pendiente:   ["pagado", "cancelado"],
  pagado:      ["enviado", "reembolsado"],
  enviado:     ["entregado", "reembolsado"],
  entregado:   ["reembolsado"],
  cancelado:   [],
  reembolsado: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

/** Estados que devuelven stock al cancelarse/reembolsarse desde ellos. */
export const RESTOCK_ON_CANCEL: OrderStatus[] = ["pendiente", "pagado"];
```

Toda action o webhook que cambie estado pasa por `canTransition` + `recordAudit`.
Tests unitarios de la tabla completa (es una función pura, perfecta para Vitest).

---

## Paso 3 — Schema y Server Action `createOrder`

**3.1 `src/schemas/order.ts`** — el input del servidor reutiliza `checkoutSchema`
y añade las líneas. SIN precios ni totales (regla §7.1):

```ts
export const createOrderSchema = z.object({
  idempotencyKey: z.uuid(),
  customer: checkoutSchema,                    // ya existe (reutilizado)
  items: z.array(z.object({
    variantId: z.string().min(1),
    quantity: z.number().int().min(1).max(10),
  })).min(1).max(30),
  // couponCode / shippingMethodId cuando existan (decisiones #4/#5)
});
```

**3.2 `src/actions/orders.ts`** — el corazón del sistema:

```ts
"use server";

export async function createOrder(input: unknown): Promise<
  ActionResult<{ orderId: string; orderNumber: number; formToken: string }>
> {
  // 1. Validar con Zod (nunca tocar la BD antes).
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Datos inválidos." };
  const { idempotencyKey, customer, items } = parsed.data;

  try {
    const order = await db.$transaction(async (tx) => {
      // 2. Idempotencia: si este intento ya creó un pedido, devolverlo.
      const existing = await tx.order.findUnique({ where: { idempotencyKey } });
      if (existing) return existing;

      // 3. Releer variantes ACTIVAS con su producto (precio real de la BD).
      const variants = await tx.productVariant.findMany({
        where: { id: { in: items.map((i) => i.variantId) }, product: { isActive: true } },
        include: { product: true, size: true, color: true },
      });
      if (variants.length !== items.length)
        throw new CheckoutError("Algún producto ya no está disponible.");

      // 4. RESERVA de stock: decremento condicional, atómico por línea.
      for (const item of items) {
        const updated = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0)
          throw new OutOfStockError(labelOf(variants, item.variantId));
      }

      // 5. Totales SIEMPRE del servidor (céntimos).
      const subtotalCents = items.reduce((sum, item) => {
        const v = variants.find((x) => x.id === item.variantId)!;
        return sum + (v.priceCents ?? v.product.priceCents) * item.quantity;
      }, 0);
      const summary = computeOrderSummary(subtotalCents); // envío/IGV centralizados

      // 6. Correlativo por secuencia (sin condición de carrera).
      const [{ nextval }] = await tx.$queryRaw<{ nextval: bigint }[]>
        `SELECT nextval('order_number_seq')`;

      // 7. Pedido + snapshot de líneas + pago pendiente.
      return tx.order.create({
        data: {
          number: Number(nextval),
          idempotencyKey,
          status: "pendiente",
          email: customer.email.toLowerCase(),
          customerName: `${customer.firstName} ${customer.lastName}`.trim(),
          phone: customer.phone,
          subtotalCents,
          shippingCents: summary.shippingCents,
          taxCents: summary.taxCents,
          totalCents: summary.totalCents,
          items: { create: items.map((item) => snapshotLine(variants, item)) },
          payments: { create: { status: "pendiente", amountCents: summary.totalCents } },
        },
      });
    });

    // 8. FUERA de la transacción: sesión de pago con Izipay.
    const formToken = await createPaymentSession(order); // lib/izipay.ts
    return { success: true, data: { orderId: order.id, orderNumber: order.number, formToken } };
  } catch (error) {
    // 9. Si Izipay falló DESPUÉS de reservar stock → cancelar y reponer ya.
    //    (helper cancelOrderAndRestock; también lo usa el cron)
    // 10. Mensajes humanos; detalle al logger, nunca al cliente.
    return { success: false, error: friendlyMessage(error) };
  }
}
```

Notas obligatorias:
- `snapshotLine` copia `productName`, `variantLabel` ("Negro / M"), `sku`,
  `unitPriceCents` — el pedido queda inmune a cambios futuros del catálogo.
- Si falla la línea N de stock, la transacción revierte las N-1 anteriores sola.
- `CheckoutError`/`OutOfStockError`: clases propias para mapear a mensajes claros
  ("No queda stock de Body Ivy — Negro / M. Quedan 2 unidades." si se quiere fino).
- El descuento de cupones y el envío entran aquí (pasos 3 y 5) cuando se
  confirmen las decisiones #2/#4/#5 — `computeOrderSummary` ya es la costura.

**3.3 Conectar `checkout-form.tsx`**: en `onSubmit`, mapear el carrito a
`{ variantId, quantity }[]`, generar `idempotencyKey` con `crypto.randomUUID()`
**al montar el formulario** (no por clic — así el doble clic reutiliza la misma),
llamar `createOrder`, y con el `formToken` abrir el formulario de Izipay (paso 4).
Si `success: false`, mostrar el error y NO limpiar el carrito. Si alguna línea
quedó sin stock, refrescar el carrito indicando cuál.

---

## Paso 4 — Integración Izipay (`src/lib/izipay.ts` + cliente)

**4.1 Variables de entorno** — añadir a `src/lib/env.ts` (falla al arranque si
faltan) y a `.env.example`: `IZIPAY_MERCHANT_ID`, `IZIPAY_API_KEY_TEST`,
`IZIPAY_API_KEY_PROD`, `IZIPAY_PUBLIC_KEY`, `IZIPAY_HMAC_KEY`, `IZIPAY_ENV`.

**4.2 `src/lib/izipay.ts`** (server-only):
- `createPaymentSession(order)` → POST al endpoint de creación de pago de Izipay
  (Lyra: `Charge/CreatePayment`) con Basic Auth (merchantId:apiKey), monto en
  céntimos, moneda PEN, `orderId`, email. Devuelve el `formToken`.
- `verifySignature(payload, signature)` → HMAC-SHA256 con `IZIPAY_HMAC_KEY` y
  `crypto.timingSafeEqual`. La usan el webhook Y el retorno del navegador.
- ⚠️ Confirmar endpoints/campos exactos en la documentación del back office al
  recibir las credenciales; la estructura (formToken + kr-hash + IPN) es esa.

**4.3 Cliente**: cargar el script del SDK Web de Izipay (KR) solo en el checkout
(no global), montar el formulario embebido con la clave pública + formToken.
Los datos de tarjeta NUNCA tocan tu servidor. Añadir los dominios de Izipay a la
CSP (docs/02 §1.2) en este mismo paso.

---

## Paso 5 — Webhook (`src/app/api/webhooks/izipay/route.ts`)

La ÚNICA fuente de verdad del resultado (el retorno del navegador es solo UX):

```ts
export async function POST(req: Request) {
  const body = await req.formData();               // Izipay envía form-urlencoded
  // 1. FIRMA primero. Inválida → 400 y fuera.
  if (!verifySignature(rawAnswer(body), krHash(body))) return new Response(null, { status: 400 });

  const answer = parseAnswer(body);                 // orderId, transactionId, monto, estado

  await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: answer.orderId }, include: { payments: true } });
    if (!order) throw new WebhookError("Pedido desconocido");

    // 2. Idempotencia: ese transactionId ya procesado → salir sin efectos.
    if (order.payments.some((p) => p.transactionId === answer.transactionId)) return;

    // 3. Contenido: monto y moneda EXACTOS (defensa en profundidad).
    if (answer.amountCents !== order.totalCents) throw new WebhookError("Monto no coincide");

    if (answer.paid) {
      // 4. Transición validada por la máquina de estados.
      if (!canTransition(order.status, "pagado")) return; // reintento tardío: ignorar
      await tx.order.update({ where: { id: order.id }, data: { status: "pagado" } });
    }
    // 5. Registrar SIEMPRE el intento (aprobado o rechazado) con el JSON completo.
    await tx.payment.create({ data: { orderId: order.id, status: answer.paid ? "aprobado" : "rechazado",
      transactionId: answer.transactionId, amountCents: answer.amountCents, gatewayResponse: answer.raw } });
    await recordAudit({ action: "status_changed", entityType: "order", entityId: order.id, /* … */ });
  });

  // 6. Tras confirmar: revalidar catálogo (el stock ya bajó al reservar, pero
  //    la venta confirma) y disparar emails SIN bloquear la respuesta.
  revalidatePath("/tienda"); revalidatePath("/");   // o revalidateTag("products")
  after(() => sendOrderEmails(answer.orderId));      // next/server `after`
  return new Response(null, { status: 200 });
}
```

Recordatorios: responder <10 s; solo POST; log técnico de todo webhook recibido;
el endpoint ya está excluido de indexación por `robots.ts` (`/api`).

---

## Paso 6 — Página de confirmación (`/pedido/[numero]`)

- El checkout redirige a `/pedido/[numero]?token=…` tras el retorno del navegador.
- La página consulta el estado REAL en BD: `pagado` → "¡Gracias!"; `pendiente` →
  "Estamos confirmando tu pago" con auto-refresh suave (el IPN puede tardar
  segundos); `cancelado/rechazado` → mensaje con reintento.
- Acceso sin cuenta: número de pedido + email (o un token firmado en la URL para
  no exponer datos con solo el número — recomendado: HMAC corto del orderId).
- `robots: noindex`. Limpiar el carrito (`clear()`) SOLO cuando el estado sea
  `pagado` o al salir del checkout con pedido creado.

---

## Paso 7 — Cron de limpieza (parte del sistema de stock)

`src/app/api/cron/cleanup/route.ts` protegido con `CRON_SECRET` (header):

- Pedidos `pendiente` con `createdAt < now() - 24h` → por cada uno, en
  transacción: estado `cancelado` (validando transición) + `increment` del stock
  de cada `order_item` con `variantId` + audit log. Después `revalidateTag`.
- Programación en `vercel.json`: `{ "crons": [{ "path": "/api/cron/cleanup", "schedule": "0 * * * *" }] }`.
- Registrar resultado en el logger (cuántos cancelados/repuestos).

## Paso 8 — Emails (Resend + React Email, ya instalados)

- `src/emails/order-confirmation.tsx` (comprador) y `new-order-admin.tsx` (admin):
  resumen del pedido con snapshot (nombre, variante, precios formateados con
  `formatPrice`), identidad MAGNÉTIC (docs/06).
- `src/lib/mail.ts`: wrapper de Resend con try/catch + logger (un email fallido
  NUNCA revierte un pago).
- `EMAIL_FROM` y `RESEND_API_KEY` a `env.ts` + `.env.example`.

## Paso 9 — Admin de pedidos

- `/admin/pedidos/[id]`: detalle con líneas snapshot, pagos y auditoría.
- Cambio de estado (pagado→enviado→entregado) con select validado por
  `canTransition` + audit. Cancelar desde `pendiente`/`pagado` repone stock
  (mismo helper del cron).

## Paso 10 — Pruebas (bloqueante para producción)

Ejecutar TODA la checklist de `docs/05-pagos-izipay.md §5` en sandbox. Además:
- Vitest: `order-status.ts` (tabla completa), `createOrder` (stock insuficiente,
  concurrencia con `Promise.all`, idempotencia, precio ignorado del cliente).
- Playwright: catálogo → ficha → talla → carrito → checkout → pago sandbox →
  página de confirmación.

---

## Orden y dependencias (resumen ejecutable)

| # | Entregable | Depende de | Estimación relativa |
|---|---|---|---|
| 0 | Carrito con `variantId` + botón de tarjetas | — | S |
| 1 | Migración (enums, secuencia, idempotencia) | — | S |
| 2 | `order-status.ts` + tests | 1 | S |
| 3 | `createOrder` + conexión del formulario | 0,1,2 | **L (el núcleo)** |
| 4 | `lib/izipay.ts` + SDK en checkout + CSP | credenciales Izipay | M |
| 5 | Webhook | 3,4 | M |
| 6 | Página `/pedido/[numero]` | 3 | S |
| 7 | Cron de limpieza | 3 | S |
| 8 | Emails | 5 | M |
| 9 | Admin de pedidos con estados | 2 | M |
| 10 | Checklist sandbox completa | todo | M |

Los pasos 0–3 y 6–7 se pueden desarrollar **sin tener aún las credenciales de
Izipay** (con un `createPaymentSession` falso detrás de la interfaz de
`lib/izipay.ts`); 4–5 se cierran cuando el cliente contrate la pasarela.
