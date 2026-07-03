# Pagos con Izipay y flujo de venta seguro

> Diseño completo del flujo carrito → pedido → pago → confirmación, con las medidas
> de seguridad necesarias para que **nunca se registre una compra que no debió
> ocurrir** ni se venda algo sin stock. Este documento es la especificación a seguir
> cuando se implemente (fase v0.3–v0.4).

---

## 1. Qué ofrece Izipay (resumen orientativo)

Izipay (Perú, respaldada por la plataforma Lyra/micuentaweb) ofrece para e-commerce:

- **SDK Web / formulario incrustado (embedded form)**: los campos de tarjeta los
  renderiza Izipay en el navegador; los datos de tarjeta viajan **directo a sus
  servidores**. Tu servidor nunca ve un PAN — esto te deja en el alcance PCI-DSS
  mínimo (SAQ A). Es la opción confirmada para este proyecto.
- **Creación de sesión de pago (formToken)** desde el servidor con la clave API.
- **Respuesta al navegador firmada** (campo `kr-hash` calculado con HMAC-SHA256).
- **IPN / webhook servidor-a-servidor** con la misma firma HMAC — la fuente de
  verdad del resultado del pago.
- Credenciales separadas test/producción: identificador de tienda, clave API
  (servidor), clave pública (navegador), clave HMAC (validación).
- Métodos locales: tarjetas, Yape/Plin (según contrato), cuotas.

> ⚠️ Verificar nombres exactos de endpoints/campos en el back office de Izipay al
> contratar; la mecánica (formToken + firma HMAC + IPN) es la descrita.

Variables de entorno ya previstas en `.env.example`: `IZIPAY_MERCHANT_ID`,
`IZIPAY_API_KEY_TEST`, `IZIPAY_API_KEY_PROD`, `IZIPAY_PUBLIC_KEY`,
`IZIPAY_HMAC_KEY`, `IZIPAY_ENV`. Añadirlas a `src/lib/env.ts` al implementar.

---

## 2. Flujo completo (máquina de estados + stock)

```
[Carrito cliente]                                  (Zustand, solo UI)
       │  { variantId, quantity }[]  + datos comprador
       ▼
(1) Server Action createOrder ────────────────────  TODO EN db.$transaction:
       ├─ Releer precio de cada variante en BD      (ignorar precios del cliente)
       ├─ Validar stock: updateMany stock >= qty    (decremento condicional)
       ├─ nextval(order_number_seq)                 (correlativo sin carrera)
       ├─ Crear Order estado "pendiente" + items    (snapshot nombre/precio/sku)
       └─ Crear Payment estado "pendiente"
       ▼
(2) Servidor pide formToken a Izipay (clave API, monto en céntimos, orderId)
       ▼
(3) Navegador muestra el formulario de Izipay (SDK Web, clave pública)
       ▼
(4a) IPN/webhook de Izipay → /api/webhooks/izipay   ★ fuente de verdad
(4b) Retorno del navegador (kr-answer + kr-hash)    solo para UX
       ▼
(5) Validar firma HMAC + monto + moneda + orderId  → dentro de $transaction:
       ├─ pago APROBADO → Order "pagado", Payment "aprobado" (respuesta JSON completa)
       ├─ pago RECHAZADO → Payment "rechazado"; Order sigue "pendiente"
       └─ revalidar caché de catálogo (stock cambió) + emails + audit_log
       ▼
(6) Cron de limpieza: pedidos "pendiente" > 24h → "cancelado" + REPONER stock
```

### Decisión clave: cuándo se descuenta el stock

CLAUDE.md dice "descontar al confirmar el pago", pero eso permite que dos personas
paguen la última unidad a la vez (el pago ocurre fuera de tu transacción). El diseño
robusto y estándar es **reservar al crear el pedido**:

- **Al crear el pedido (paso 1): descontar stock.** La reserva dura lo que dure el
  pedido `pendiente`.
- **Si el pago falla, expira o se cancela (paso 6): reponer stock.**

Así es imposible la sobreventa, y la regla de negocio #10 (reposición) cubre los
abandonos. El cron de limpieza deja de ser opcional: **es parte del sistema de
stock** (sin él, un carrito abandonado retiene stock 24 h — aceptable — o para
siempre — no aceptable).

### Todo lo que se actualiza cuando hay una venta (que no se escape nada)

Dentro de la MISMA transacción o inmediatamente después de confirmar el pago:

| Qué | Dónde | Cuándo |
|---|---|---|
| Stock de cada variante | `product_variants.stock` | Al crear pedido (reserva) |
| Pedido y snapshot de líneas | `orders`, `order_items` | Al crear pedido |
| Uso del cupón (`usedCount + 1`) | `coupons` | Al confirmar pago (o reservar y liberar) |
| Estado del pedido → `pagado` | `orders.status` | Webhook validado |
| Registro del pago (JSON completo) | `payments` | Webhook (aprobado o rechazado) |
| Auditoría | `audit_logs` | Ambos pasos |
| **Caché del catálogo** | `revalidatePath("/producto/[slug]")`, `/tienda`, `/` o `revalidateTag("products")` | Tras cambiar stock (¡en la compra también, no solo desde el admin — hoy solo las actions de admin revalidan!) |
| Emails (comprador + admin) | Resend | Tras confirmar pago, FUERA de la transacción |
| Contador del carrito del cliente | `cart-store.clear()` | En el cliente, tras redirigir a confirmación |

⚠️ Con ISR de 60 s, sin la revalidación tras la venta una ficha puede mostrar
"disponible" hasta 60 s después de agotarse. Es tolerable como ventana máxima
(el checkout revalida siempre en servidor), pero revalidar al vender la reduce a ~0.

---

## 3. Seguridad del webhook (donde se cuelan las "compras que no deberían")

El webhook `/api/webhooks/izipay` (Route Handler) es la superficie de ataque
principal. Reglas NO negociables:

1. **Validar la firma HMAC-SHA256 con `IZIPAY_HMAC_KEY` antes de leer nada.**
   Comparación en tiempo constante (`crypto.timingSafeEqual`). Sin firma válida →
   `400` y log técnico. Esto impide que cualquiera fabrique un POST "pago aprobado".
2. **Validar el CONTENIDO, no solo la firma:**
   - `orderId` existe y está `pendiente` (transición válida de la máquina de estados).
   - `amount` == `order.totalCents` y moneda == PEN. Un pago aprobado por un monto
     distinto NO marca el pedido como pagado (ataque clásico: pagar S/1 por un
     pedido de S/200 re-enviando la respuesta modificada... la firma lo impide,
     pero la doble validación es defensa en profundidad).
3. **Idempotencia:** Izipay puede reenviar el IPN. Si el pedido ya está `pagado`
   con ese `transactionId`, responder `200 OK` sin repetir efectos (ni stock, ni
   emails, ni cupón). Clave única sugerida: `@@unique([orderId, transactionId])`
   en `payments` o verificación explícita en la transacción.
4. **El retorno del navegador (kr-answer) NUNCA confirma un pedido por sí solo.**
   Aunque también viene firmado, el usuario puede cerrar la ventana y el IPN llegar
   igual, o al revés. El navegador solo muestra "estamos confirmando tu pago" y la
   página de gracias consulta el estado real del pedido.
5. **Responder rápido** (<10 s): registrar, actualizar, responder; los emails se
   despachan después (fire-and-forget con log de errores).
6. **Registrar TODO intento** en `payments` con `gatewayResponse` completo
   (aprobados y rechazados) — reconciliación y soporte.
7. El endpoint queda excluido de la CSP/csrf normal pero **rate-limited** y solo
   acepta `POST` con `content-type` esperado.

### Doble envío del formulario / doble clic
Idempotencia en `createOrder`: si el cliente reintenta, no crear dos pedidos.
Técnica simple: token de idempotencia generado al montar el checkout (uuid en un
campo oculto); `@@unique` en BD sobre ese token; segundo intento devuelve el
pedido ya creado.

---

## 4. Esquema del Server Action `createOrder` (contrato)

```ts
// schemas/order.ts
const createOrderSchema = z.object({
  idempotencyKey: z.uuid(),
  items: z.array(z.object({
    variantId: z.string().min(1),
    quantity: z.number().int().min(1).max(10),
  })).min(1).max(30),
  customer: z.object({
    email: z.email(),
    name: z.string().trim().min(2).max(120),
    phone: z.string().trim().min(6).max(20),
  }),
  shipping: z.object({ /* según decisión #4/#5 */ }).optional(),
  couponCode: z.string().trim().max(40).optional(),
  // ⚠️ SIN precios, SIN totales: eso solo sale de la BD.
});
```

Pasos dentro de `db.$transaction` (isolation `Serializable` no es necesario; el
decremento condicional de stock basta):

1. Resolver variantes activas (`product.isActive`, variante existente).
2. `updateMany({ where: { id, stock: { gte: qty } }, data: { stock: { decrement: qty } } })`
   por línea; si `count === 0` → abortar con error claro ("Sin stock de X").
3. Validar cupón (vigencia, usos, monto mínimo) y calcular descuento.
4. `computeOrderSummary()` para envío/IGV/total (céntimos).
5. `nextval('order_number_seq')` → correlativo.
6. Crear `Order` (+ snapshot en `OrderItem`: `productName`, `variantLabel`, `sku`,
   `unitPriceCents` leídos de BD) + `Payment` pendiente.
7. Fuera de la transacción: pedir formToken a Izipay y devolverlo al cliente.
   Si Izipay falla → cancelar el pedido y reponer stock de inmediato.

Errores siempre como `ActionResult` con mensajes humanos en español; el detalle
técnico va al logger, nunca al cliente.

---

## 5. Pruebas obligatorias antes de producción (sandbox Izipay)

- [ ] Pago aprobado → pedido `pagado`, stock descontado una sola vez, email enviado.
- [ ] Pago rechazado → pedido sigue `pendiente`, `payments` registra el rechazo.
- [ ] IPN duplicado (reenviar manualmente) → sin doble efecto.
- [ ] IPN con firma inválida → 400, pedido intacto.
- [ ] IPN con monto alterado → rechazado y alertado.
- [ ] Usuario cierra la ventana a mitad de pago → pedido `pendiente`; cron lo
      cancela y repone stock.
- [ ] Dos compras simultáneas de la última unidad → solo una pasa (test con
      `Promise.all` sobre `createOrder`).
- [ ] Doble clic en "Pagar" → un solo pedido (idempotencyKey).
- [ ] Cupón agotado/vencido dentro de la transacción → rechazado.
- [ ] TLS 1.2+ en producción (Vercel lo da por defecto).

---

## 6. Cron de limpieza (parte del sistema de stock)

Tarea programada (Vercel Cron / Supabase cron llamando a un Route Handler
protegido por secret):

- Pedidos `pendiente` con `createdAt < ahora - 24h` → `cancelado` + reponer stock
  de cada `order_item` + audit log. (Ventana configurable; 2–24 h típico.)
- Carritos de invitado en BD inactivos > 30 días → borrar (cuando exista carrito
  servidor).
- Registrar resultado en el log técnico.
