# Roadmap — mejoras futuras y evolución

> Lo que le falta a la tienda más allá del lanzamiento, ordenado por fases.
> Complementa la lista de "no existe todavía" de `docs/01` §5 y respeta el
> principio rector: no agregar infraestructura que el tamaño del negocio no
> justifique.

---

## Fase A — Completar el núcleo de venta (bloqueante para lanzar)

| Ítem | Detalle | Ref |
|---|---|---|
| `createOrder` transaccional | Stock + precios servidor + correlativo por secuencia | docs/05 §4 |
| Integración Izipay | formToken, SDK Web, webhook HMAC idempotente | docs/05 |
| Cron de limpieza | Cancela pendientes >24h y repone stock | docs/05 §6 |
| Emails transaccionales | Resend + React Email (ya instalados): confirmación de compra (comprador + admin), pago fallido | CLAUDE.md §9 |
| Página de confirmación | `/pedido/[numero]` consultable con número + email (sin cuenta) |
| Gestión de pedidos en admin | Cambiar estado con máquina de estados + auditoría; hoy solo hay listado | docs/02 §2.4 |
| Legal mínimo | Términos, privacidad, envíos, devoluciones, **Libro de Reclamaciones** (tabla lista, falta UI), banner de cookies | CLAUDE.md §10 |
| Contacto | Formulario → `contact_submissions` + aviso por email |
| Tests del flujo crítico | money/totals/createOrder + E2E checkout sandbox | docs/02 §3.1 |

## Fase B — Experiencia de compra (primeras semanas post-lanzamiento)

1. **Cuentas de cliente** (decisión #3 pendiente). Recomendación: lanzar solo
   invitado + consulta de pedido por número/email; añadir cuentas cuando haya
   recurrencia real. Si se aprueban: registro/login (Auth.js ya está), "mis
   pedidos", direcciones guardadas, merge del carrito invitado (regla #7),
   recuperación de contraseña (docs/02 §1.7) y derecho de eliminación de cuenta
   (Ley 29733).
2. **Carrito en servidor** (`carts`/`cart_items` ya modelados): necesario para el
   merge y para email de carrito abandonado.
3. **Cupones**: el modelo existe; falta admin CRUD + campo en checkout + validación
   en `createOrder`.
4. **Métodos de envío** (decisiones #4/#5): admin CRUD de `shipping_methods`,
   selector en checkout, costo en `computeOrderSummary`.
5. **Página "Nosotros"** con el CMS (`pages`/`page_sections` ya modelados) — además
   es pieza SEO/GEO (docs/03 §4).
6. **Wishlist persistente** (hoy `favorite-button` es local), notificación de
   "vuelve el stock".
7. **Búsqueda mejorada**: la actual es en memoria; a futuro `pg_trgm` o full-text
   de Postgres (sin servicios externos).

## Fase C — Operación y crecimiento

- **Analítica e-commerce** (docs/03 §5) + panel admin con ventas del mes.
- **Observabilidad**: Sentry (errores) + UptimeRobot en cuanto haya tráfico real.
- **Carrito abandonado por email** (requiere carrito servidor + consentimiento).
- **Reseñas de producto** (activa `aggregateRating` en SEO).
- **Inventario avanzado**: historial de movimientos de stock (entrada manual,
  venta, reposición) — hoy solo hay el número actual.
- **Multi-imagen por variante/color** (hoy las imágenes son por producto).
- **Yape/Plin directo** si el contrato con Izipay no los incluye.

## Dependencias que valdría la pena añadir (cuando toquen)

| Paquete | Para qué | Cuándo |
|---|---|---|
| `@next/bundle-analyzer` | Cazar JS inflado | Antes del lanzamiento (dev-only) |
| `@t3-oss/env-nextjs` | Validación de env tipada (alternativa: extender `lib/env.ts` a mano, suficiente) | Opcional |
| `server-only` | Ya se usa ✅ | — |
| `pino` (o logger propio mínimo) | Log técnico estructurado | Fase A (webhook/cron) |
| `@sentry/nextjs` | Errores en producción | Fase C |
| `sonner` (shadcn toast) | Feedback de acciones (añadido al carrito, errores) | Fase A/B |

**No añadir todavía** (anti-sobre-ingeniería): Redis, colas, S3 propio (Supabase
Storage cubre), GraphQL, CMS externo, microservicios.

## Cuándo replantear la arquitectura (señales, no fechas)

El monolito modular actual aguanta MUY lejos. Solo repensar si:
- El catálogo supera ~200–500 productos → paginación server-side (docs/02 §3.2),
  todavía dentro del monolito.
- Queries repetidas dominan el costo de BD → caché Redis, todavía monolito.
- Varias personas desarrollan a la vez y se pisan → separar módulos en packages
  del monorepo (sigue siendo un deploy).
- Un componente tiene carga radicalmente distinta (ej. un motor de
  recomendaciones) → recién ahí, extraer ESE servicio. Los microservicios se
  extraen de un monolito sano; no se empieza por ellos.
