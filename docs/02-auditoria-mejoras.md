# Auditoría de mejoras — seguridad, fiabilidad, código y accesibilidad

> Hallazgos concretos revisando el código real, ordenados por prioridad.
> Cada punto indica el archivo afectado y la mejora propuesta.
> SEO → `docs/03`. Rendimiento → `docs/04`. Pagos → `docs/05`.

Leyenda de prioridad:
- 🔴 **Crítica** — arreglar antes de vender (dinero, datos o legal en riesgo).
- 🟠 **Alta** — arreglar antes de salir a producción.
- 🟡 **Media** — mejora clara, planificable.
- 🟢 **Baja** — pulido.

---

## 1. Seguridad

### 🔴 1.1 El checkout no valida nada en el servidor (aún no existe el flujo)
`src/components/shop/checkout-form.tsx` recoge datos pero **no hay Server Action que
cree el pedido**. El carrito vive solo en Zustand/localStorage con precios que el
cliente puede manipular. Al implementar `createOrder` (ver `docs/05`), cumplir el
patrón obligatorio:

1. Recibir del cliente SOLO `{ variantId, quantity }[]` + datos del comprador.
2. Releer precios y stock de la BD **dentro de `db.$transaction`**.
3. Recalcular totales con `computeOrderSummary` en el servidor.
4. Ignorar cualquier precio/total enviado por el cliente.

### 🟠 1.2 Falta Content-Security-Policy
`next.config.ts` ya envía HSTS, X-Frame-Options, nosniff, Referrer-Policy y
Permissions-Policy, pero **no hay CSP** (el comentario del archivo lo reconoce).
Al integrar Izipay definir una CSP con nonce que permita solo:
`script-src 'self' 'nonce-…' https://static.micuentaweb.pe` (dominio del SDK de
Izipay/Lyra), `frame-src https://secure.micuentaweb.pe`, `img-src 'self' data:
https://<proyecto>.supabase.co`, `connect-src 'self' https://api.micuentaweb.pe`.
Verificar dominios exactos en la doc oficial de Izipay al integrar. Sin pasarela
aún, se puede lanzar ya una CSP base con `script-src 'self'` + nonce (en Next se
implementa vía `middleware.ts` para generar el nonce por request).

### 🟠 1.3 Enumeración de usuarios por timing en el login
En `src/lib/auth.ts` (función `authorize`): si el email no existe se responde sin
ejecutar argon2 (~1 ms); si existe, se verifica el hash (~100 ms). Un atacante mide
el tiempo y deduce qué correos están registrados. Arreglo: cuando el usuario no
existe, verificar contra un **hash dummy** precomputado para igualar tiempos:

```ts
const DUMMY_HASH = "$argon2id$v=19$m=65536,t=3,p=4$…"; // hash de una cadena aleatoria
if (!user?.passwordHash || !user.isActive) {
  await verify(DUMMY_HASH, parsed.data.password).catch(() => false);
  recordFailure(email);
  return null;
}
```

### 🟠 1.4 Rate limiting en memoria no sirve en serverless
El `Map` de intentos en `src/lib/auth.ts:25` vive en la memoria del proceso. En
Vercel cada invocación puede caer en una instancia distinta y el contador se
reinicia — el bloqueo tras 5 intentos **no está garantizado**. Opciones sin agregar
Redis (respetando la regla anti-sobre-ingeniería):
- **Persistir intentos en Postgres** (tabla `login_attempts` con índice por email,
  limpieza por ventana). Simple, correcto, suficiente a esta escala. ← recomendado
- Rate limit del proveedor (Vercel Firewall / Supabase) como refuerzo.
Además: hoy solo se limita **por email**; añadir límite **por IP** para frenar
ataques distribuidos sobre muchos correos.

### 🟠 1.5 `x-forwarded-for` es falsificable
`src/lib/admin-auth.ts:19` toma la IP del primer valor de `x-forwarded-for`, que el
cliente puede inyectar. En Vercel usar el header `x-real-ip` o el ÚLTIMO valor
añadido por el proxy de confianza. Afecta a `audit_logs` (trazabilidad) y al futuro
rate limit por IP.

### 🟡 1.6 Defensa en profundidad para /admin
La protección vive en `src/app/(admin)/admin/layout.tsx` (correcto), pero un layout
NO se re-ejecuta en toda circunstancia de navegación parcial y las páginas quedan
con una sola línea de defensa cuando se accede a datos vía actions. Ya se valida
`getAdminSession()` en cada action (bien). Refuerzo barato: añadir `middleware.ts`
que corte `/admin/*` sin cookie de sesión válida — no reemplaza la validación en
servidor, la complementa y evita renders innecesarios.

### 🟡 1.7 Falta recuperación de contraseña
Requisito de CLAUDE.md §7.6 (token de un solo uso, 15 min). No existe. Necesita:
tabla `password_reset_tokens` (hash del token, expiración, usado), action
`requestPasswordReset` (respuesta idéntica exista o no el email), email vía Resend,
y página `/restablecer`. Prioridad sube cuando existan cuentas de cliente.

### 🟡 1.8 Higiene del repositorio
En la raíz hay archivos que no deben estar versionados ni presentes:
- `dev.db` (SQLite huérfano de la etapa anterior — el proyecto ya es Postgres).
- `192.168.1.55_….report.html` y `nue-ec.vercel.app_….report.html` (reportes
  Lighthouse) — mover a una carpeta ignorada o borrar.
- `migrate_diff_err.txt` — borrar.
- `.env` está bien ignorado (verificado en `.gitignore`), mantenerlo así.

### 🟢 1.9 Varios
- `bodySizeLimit: "8mb"` aplica a TODAS las Server Actions, no solo a la subida de
  imágenes. Aceptable, pero al crear el checkout tener en cuenta que un body grande
  también llega a actions que no lo necesitan (mitigable validando tamaño temprano).
- La subida de imágenes ya es sólida: límite de 5 MB, re-proceso con sharp (elimina
  metadatos/EXIF y payloads), salida siempre WebP, bucket con service role solo en
  servidor. Mantener este pipeline como referencia.
- `SUPABASE_SERVICE_ROLE_KEY` y `SUPABASE_URL` no están en `src/lib/env.ts`:
  añadirlas al schema para fallar al arranque si faltan (hoy solo fallan al subir).

---

## 2. Fiabilidad y datos

### 🔴 2.1 Correlativo de pedido con condición de carrera
`Order.number` es `Int @unique` asignado por la app. Dos checkouts simultáneos que
calculen `max(number) + 1` colisionan (uno falla por unique). Opciones:
- **Secuencia de Postgres** (`CREATE SEQUENCE order_number_seq`) y leerla en la
  transacción con `SELECT nextval(...)`. Robusto y sin reintentos. ← recomendado
- O capturar el error de unique y reintentar (más frágil).
Nota: la regla "sin programación en BD" prohíbe lógica (triggers/SP); una secuencia
es un generador de números, no lógica de negocio — documentarlo como excepción.

### 🔴 2.2 Stock: validar y descontar dentro de la transacción
Al implementar el checkout, el descuento de stock debe ser atómico y a prueba de
concurrencia. Patrón recomendado con Prisma (evita el check-then-update ingenuo):

```ts
// Dentro de db.$transaction — decremento condicional: solo si hay stock suficiente.
const updated = await tx.productVariant.updateMany({
  where: { id: variantId, stock: { gte: quantity } },
  data: { stock: { decrement: quantity } },
});
if (updated.count === 0) throw new OutOfStockError(variantId);
```

Si dos personas compran la última unidad, solo una pasa. Reponer stock si el pago
falla o el pedido se cancela (regla de negocio #10).

### 🟠 2.3 Migrar String → tipos nativos de Postgres
El schema arrastra decisiones de SQLite:
- `Order.status`, `Payment.status`, `Coupon.type`, `Complaint.type` → `enum` de
  Prisma (la BD rechaza estados inválidos; hoy cualquier string entra).
- `Payment.gatewayResponse`, `AuditLog.changes` → `Json`.
Es una migración mecánica que endurece la integridad justo antes de tocar dinero.

### 🟠 2.4 Máquina de estados de pedido sin garante
Las transiciones válidas (`pendiente→pagado→enviado→entregado`…) están documentadas
pero no hay código que las haga cumplir. Crear `lib/order-status.ts` con el mapa de
transiciones y una función `assertTransition(from, to)` usada por TODA action que
cambie estado + registro en `audit_logs`.

### 🟡 2.5 Carrito servidor (tablas ya existen, sin usar)
`carts`/`cart_items` están en el schema pero el carrito es 100 % cliente. Para la
etapa actual (invitado) es aceptable; al introducir cuentas de cliente, sincronizar:
carrito invitado por `session_id` (cookie) → merge al iniciar sesión (regla #7).
Mientras tanto, riesgo asumido: el cliente puede ver precios desactualizados en su
carrito persistido — mitigado porque el checkout recalcula en servidor.

### 🟡 2.6 Logger técnico
No hay logger estructurado; hay `console.*` dispersos. Crear `lib/logger.ts` mínimo
(niveles + JSON en producción) y usarlo en actions, webhook de pago y cron. Sentry
queda para cuando haya tráfico real (roadmap).

---

## 3. Calidad de código y arquitectura

### 🟠 3.1 Escribir los primeros tests (el flujo de dinero primero)
Vitest y Playwright están instalados, **no hay ni un test**. Prioridad mínima viable:
1. Unitario: `lib/money.ts`, `lib/format.ts`, `lib/cart-totals.ts` (céntimos,
   redondeos, resumen de totales) y `lib/product-variants.ts` (stock por variante).
2. Unitario: futura `createOrder` (stock insuficiente, precio manipulado, cupón).
3. E2E Playwright: catálogo → ficha → carrito → checkout (con Izipay en sandbox
   cuando exista).
Añadir scripts `"test"` y `"test:e2e"` al `package.json` (hoy no existen).

### 🟡 3.2 Paginación del catálogo
`getAllProducts()` trae todo el catálogo y filtra en memoria (`/tienda`). Correcto
hoy (catálogo pequeño, cacheado 60 s), pero dejar anotado el umbral: al superar
~200 productos, mover filtros a la query de Prisma con `take/skip` + cursor.

### 🟡 3.3 Duplicación de `ADMIN_ROLES`
Definido en `src/lib/admin-auth.ts:8` y otra vez en
`src/app/(admin)/admin/layout.tsx:10`. Importar siempre del primero (única fuente).

### 🟡 3.4 `unstable_cache` → `"use cache"`
Next 16 estabiliza la directiva `"use cache"` (con `cacheLife`/`cacheTag`).
`lib/data/products.ts` usa `unstable_cache`; funciona, pero planificar la migración
y usar **tags** (`revalidateTag("products")`) en lugar de la lista creciente de
`revalidatePath` repetida en `actions/products.ts`, `variants.ts`,
`product-images.ts` y `categories.ts` — hoy cada action debe recordar todas las
rutas afectadas (frágil, ya son 5-6 rutas por action).

### 🟢 3.5 Consistencia de ActionResult
`src/types/action.ts` define el resultado discriminado — bien. Verificar que TODAS
las actions lo devuelvan (algunas devuelven `{ success: false, error: "Faltan
datos." }` sin validar con Zod primero, ej. `updateSiteImage` lee `formData`
a mano; aceptable con FormData, pero validar `key` contra una lista blanca de
claves permitidas para evitar escribir settings arbitrarios).

---

## 4. Semántica HTML y accesibilidad

Lo bueno ya presente: skip-link en `layout.tsx`, `aria-label` en breadcrumbs,
`aria-hidden` en íconos decorativos, labels en formularios, focus visible,
`prefers-reduced-motion` respetado (hook + CSS), `lang="es"`.

Mejoras:

### 🟡 4.1 Jerarquía de encabezados
Verificar que cada página tenga exactamente un `<h1>`. En la home el `<h1>` es el
título del hero (bien). En `/tienda` confirmar que "Tienda" sea `<h1>` y los grupos
de filtros usen `<h2>/<h3>` o `<fieldset><legend>` (mejor para grupos de checkboxes).

### 🟡 4.2 Breadcrumbs como lista
Los breadcrumbs (`/tienda`, ficha de producto) usan `<nav>` con spans sueltos.
Semántica correcta: `<nav aria-label="…"><ol><li>…</li></ol></nav>` +
`aria-current="page"` en el último elemento. Además alinear con el JSON-LD
`BreadcrumbList` (ver docs/03).

### 🟡 4.3 Anuncios dinámicos del carrito
Al añadir al carrito, anunciar el cambio a lectores de pantalla: un contenedor
`aria-live="polite"` global ("Producto añadido al carrito") y `aria-label` con el
conteo en el ícono del carrito ("Carrito, 3 productos").

### 🟡 4.4 Marquesina de anuncios
El modo `marquee` de la cinta (`announcement-bar.tsx`) es contenido en movimiento:
- Pausar SIEMPRE con `prefers-reduced-motion` (verificar que ya ocurra).
- WCAG 2.2.2: si dura más de 5 s debe poder pausarse — `pauseOnHover` no basta en
  táctil; considerar botón de pausa o modo `static` en móvil.

### 🟢 4.5 Contraste con la nueva paleta
Al aplicar la paleta MAGNÉTIC validar contraste 4.5:1: el **taupe #937c69 sobre
sand #f7f4ef NO alcanza** contraste suficiente para texto normal (~3.2:1) — usarlo
solo para decorativo, texto grande o subir a un tono más oscuro para texto de
apoyo. Negro #0e0e0d sobre sand/nude pasa sobrado. Detalle completo en `docs/06`.

---

## 5. Resumen priorizado (orden de ataque sugerido)

| # | Acción | Prioridad | Doc |
|---|---|---|---|
| 1 | Implementar `createOrder` transaccional (stock + precios servidor) | 🔴 | 05 |
| 2 | Secuencia Postgres para `Order.number` | 🔴 | — |
| 3 | Integración Izipay sandbox + webhook con HMAC | 🔴 | 05 |
| 4 | CSP con nonce vía middleware | 🟠 | — |
| 5 | Rate limit persistente (BD) + por IP + fix timing login | 🟠 | — |
| 6 | Enums/Json nativos en Prisma + máquina de estados | 🟠 | — |
| 7 | Primeros tests (money, totals, createOrder) | 🟠 | — |
| 8 | Sitemap con productos + mejoras SEO | 🟠 | 03 |
| 9 | Emails transaccionales (Resend ya instalado) | 🟠 | 07 |
| 10 | Limpieza de raíz del repo + env.ts completo | 🟡 | — |
| 11 | Rebrand MAGNÉTIC (tokens, tipografías, textos) | 🟡 | 06 |
| 12 | Accesibilidad (breadcrumbs, aria-live, marquesina) | 🟡 | — |
