# CLAUDE.md — Guía de Desarrollo del Proyecto

> Documento de contexto para Claude Code. Define la arquitectura, stack, convenciones y criterios de calidad de este proyecto. Léelo completo antes de generar o modificar código.

---

## 1. Resumen del Proyecto

Tienda online (e-commerce) de **ropa íntima / lencería** para la marca **MAGNÉTIC**
(tagline "Intimacy with attitude"; antes se llamaba NUE INTIME — no debe quedar
ningún resto de "NUE" en código ni textos). Es un negocio **pequeño en crecimiento**.
Dominio previsto: magneticintimates.com (pendiente de compra; no cambiar
`NEXT_PUBLIC_SITE_URL` hasta confirmarse).

**Objetivo de esta primera etapa:** entregar una tienda funcional, segura, rápida y administrable, sin sobre-ingeniería. Se priorizan funcionalidad, fiabilidad, seguridad y rapidez por encima de optimizaciones prematuras.

> **Documentación operativa en `docs/`** (leer `docs/README.md` como índice):
> auditoría con prioridades (02), SEO (03), rendimiento (04), especificación de
> pagos (05), identidad MAGNÉTIC (06), roadmap (07), guía paso a paso del flujo
> de venta (08) y guía UX/UI con checklist de aceptación (09). Ante un tema
> cubierto por esos documentos, ejecutarlos en vez de re-analizar o improvisar.

### Principio rector
No agregar infraestructura ni complejidad que el tamaño actual del negocio no justifique. Redis, S3, microservicios, GraphQL y similares **NO** entran en esta etapa. Se documentan como evolución futura (sección 11).

---

## 1.1 DECISIONES PENDIENTES (confirmar antes de implementar lo afectado)

> Estos puntos NO están confirmados con el cliente. No asumir una opción por defecto: detener y preguntar antes de implementar la parte afectada.

| # | Decisión pendiente | Qué bloquea | Opciones |
|---|---|---|---|
| 1 | **Hosting definitivo** | Dónde vivirá producción | **Provisional (validación del cliente): Vercel + Supabase**, ya funcionando. El definitivo se decidirá con el criterio: **mínimo costo sin perder rendimiento** (candidatos: quedarse en Vercel+Supabase free/pro, Railway, VPS). El código es portable (Prisma + adaptador de storage intercambiable) |
| 2 | **IGV (18%)** | Cálculo del total a cobrar | (a) Precios ya incluyen IGV; (b) IGV se suma aparte; (c) cliente en RUS sin IGV |
| 3 | **Cuentas de cliente** | Módulo de registro/login de compradores | (a) Con cuenta; (b) solo invitado; (c) ambas |
| 4 | **Entrega de productos** | Módulo de envíos vs recojo | (a) Solo envío a domicilio; (b) solo recojo; (c) ambos |
| 5 | **Zonas y costos de envío** | Configuración de `shipping_methods` | Pendiente de tarifas del cliente |

**Regla:** mientras una decisión esté pendiente, dejar la implementación de esa parte preparada pero no cerrada, y marcar con `// TODO: confirmar con cliente` en el código.

---

## 2. Arquitectura

**Monolito con Next.js (App Router).** Frontend y backend en un solo proyecto. No hay API REST separada ni CMS externo: el acceso a datos ocurre en el servidor mediante Server Components y Server Actions.

```
Cliente (navegador)
      │
      ▼
Next.js App Router
 ├── Server Components (lectura de datos, render)
 ├── Server Actions (mutaciones: crear pedido, login, etc.)
 ├── Route Handlers (solo para webhooks de pago)
 └── Client Components (interactividad: carrito, filtros)
      │
      ▼
Prisma ORM
      │
      ▼
PostgreSQL
```

**Por qué monolito:** una sola persona mantiene el proyecto, el negocio es pequeño, y Next.js permite acceso directo a la base de datos desde el servidor sin capa API intermedia. Menos piezas, menos puntos de fallo, más fácil de mantener.

---

## 3. Stack Tecnológico

### Core
| Tecnología | Uso | Notas |
|---|---|---|
| Next.js 16+ (App Router) | Framework principal | Turbopack por defecto. Usar `async` para params/searchParams |
| React 19 | UI | Server Components por defecto |
| TypeScript | Tipado en todo el proyecto | `strict: true` obligatorio |
| Node.js 20 LTS+ | Runtime | |

> **HOSTING (provisional, definitivo pendiente — decisión #1):** hoy la app corre en
> **Vercel** y la BD/imágenes en **Supabase** (pooler en `DATABASE_URL`, conexión
> directa en `DIRECT_URL` para migraciones) — es el entorno de validación del
> cliente. La decisión final se tomará por costo/rendimiento; el código está
> preparado para migrar: Prisma abstrae la BD y `lib/storage.ts` el almacenamiento
> de imágenes (cambiar de proveedor = reescribir solo ese archivo).

### Base de datos
| Tecnología | Uso |
|---|---|
| PostgreSQL (Supabase) | Base de datos relacional |
| Prisma 7 (adapter `pg`, generator `prisma-client` → `src/generated/prisma`) | Acceso a datos, migraciones, tipado |

### Autenticación y seguridad
| Tecnología | Uso | Por qué |
|---|---|---|
| Auth.js | Autenticación y sesiones | Integración nativa con App Router |
| **argon2** | Hashing de contraseñas | Ganador del Password Hashing Competition; más resistente a ataques GPU que bcrypt. Usar variante **argon2id** |
| Zod | Validación de schemas | Validar TODO input en servidor antes de tocar la BD |

### Estado y formularios (cliente)
| Tecnología | Uso |
|---|---|
| Zustand | Estado global del carrito (ligero, sin boilerplate) |
| React Hook Form | Manejo de formularios |
| Zod (resolver) | Validación de formularios conectada a RHF |

### UI y estilos
| Tecnología | Uso |
|---|---|
| Tailwind CSS | Estilos utilitarios |
| shadcn/ui | Componentes base (copiados al proyecto, no como dependencia) |
| Radix UI | Primitivas accesibles (viene con shadcn) |
| lucide-react | Iconos |

### Pagos
| Tecnología | Uso |
|---|---|
| Izipay | Pasarela de pago confirmada por el cliente |
| Izipay SDK Web (JavaScript) | Botón/formulario de pago. Los datos de tarjeta se envían directo a los servidores de Izipay, nunca al servidor propio. Requiere TLS 1.2 |

### Imágenes (esta etapa)
| Tecnología | Uso | Notas |
|---|---|---|
| **Supabase Storage** (bucket público) | Imágenes subidas desde el admin | Pipeline ya implementado: validación + re-proceso con **sharp** a WebP (`lib/images.ts` → `lib/upload.ts` → `lib/storage.ts`). El adaptador es intercambiable (R2/S3 = reescribir solo `lib/storage.ts`) |
| `next/image` | Optimización automática (WebP/AVIF, resize, lazy load) | Obligatorio para toda imagen. `remotePatterns` restringido al bucket en `next.config.ts` |
| Assets de marca | `public/brand/` (finales) · `docs/brand/` (material fuente) · `src/fonts/` (webfonts) | Ver `docs/06-identidad-magnetic.md` §3 |

### Emails
| Tecnología | Uso |
|---|---|
| Resend o Nodemailer | Emails transaccionales (confirmación de compra, recuperación de contraseña) |
| React Email | Plantillas de correo con componentes |

### Calidad de código
| Tecnología | Uso |
|---|---|
| ESLint | Linting |
| Prettier | Formato |
| Vitest | Tests unitarios |
| Playwright | Tests E2E (flujo de compra) |

---

## 4. Modelo de Datos

Base de datos relacional normalizada. **24 tablas.** Definir todo en `schema.prisma`.

### Usuarios y acceso
- `users` — administradores y clientes. Campo `role` referenciado a `roles`. Password con argon2id.
- `roles` — admin, editor, customer.
- `sessions` — sesiones gestionadas por Auth.js.

### Catálogo
- `categories` — Conjuntos, Bodies, Pijamas, Lencería… Con slug, imagen, orden.
- `products` — info base: nombre, slug, descripción, precio base, categoría, destacado, activo.
- `product_variants` — combinación talla+color con SKU, precio y **stock propio**.
- `product_images` — múltiples imágenes por producto, con orden y flag de principal.
- `sizes` — catálogo reutilizable de tallas.
- `colors` — catálogo reutilizable de colores (nombre + hex).

### Media
- `media` — todas las imágenes centralizadas (url, alt, dimensiones, tipo).

### Carrito
- `carts` — por usuario o por session_id (invitados).
- `cart_items` — variante + cantidad.

### Ventas
- `orders` — pedido con número correlativo, estado, totales, datos del comprador.
- `order_items` — **snapshot** de nombre, variante y precio al momento de compra (no referencia viva).
- `payments` — registro de cada transacción Izipay (gateway, transaction_id, estado, respuesta JSON).
- `shipping_addresses` — direcciones de envío reutilizables.

### Envíos y promociones
- `shipping_methods` — zonas, costos y tiempos configurables desde el panel.
- `coupons` — códigos de descuento (tipo, valor, vigencia, uso máximo).

### CMS (contenido administrable)
- `pages` — páginas editables (Inicio, Nosotros).
- `page_sections` — cada sección con título, contenido, imagen, **colores (hex)**, orden, visibilidad. Esto permite al cliente editar contenido y colores sin tocar código.
- `site_settings` — config global: logo, color primario, WhatsApp, redes sociales (key/value/tipo).

### Legal y contacto
- `contact_submissions` — mensajes del formulario de contacto.
- `complaints` — Libro de Reclamaciones (obligatorio INDECOPI): correlativo, tipo, datos del cliente, detalle, estado, respuesta.

### Auditoría y trazabilidad
- `audit_logs` — registro de eventos de negocio relevantes para trazabilidad consultable desde el panel: quién hizo qué y cuándo. Campos: `id`, `user_id` (quién), `action` (created/updated/deleted/status_changed), `entity_type` (product, order, price, user...), `entity_id`, `changes` (JSON con antes/después), `ip_address`, `created_at`. Inmutable (solo inserción, nunca update ni delete).

### Reglas de modelado
- **Soft delete:** productos y pedidos nunca se borran físicamente, se marcan `is_active=false` o estado `cancelado`.
- **Snapshots:** `order_items` guarda nombre y precio copiados, no referencias.
- **Índices:** en `slug`, `category_id`, `sku`, y campos de búsqueda frecuente.
- **Constraints:** foreign keys, unique (email, slug, sku), not null donde corresponda. La BD protege la integridad.
- **No programación en BD:** sin stored procedures ni triggers. Toda la lógica de negocio en la capa de aplicación (más fácil de testear y mantener). Views permitidas solo para reportes si hace falta.

---

## 5. Estructura de Carpetas

```
/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (shop)/                  # Rutas públicas de la tienda
│   │   │   ├── page.tsx             # Inicio
│   │   │   ├── tienda/
│   │   │   ├── producto/[slug]/
│   │   │   ├── carrito/
│   │   │   ├── checkout/
│   │   │   ├── nosotros/
│   │   │   ├── contacto/
│   │   │   └── libro-reclamaciones/
│   │   ├── (admin)/                 # Panel de administración
│   │   │   └── admin/
│   │   │       ├── productos/
│   │   │       ├── pedidos/
│   │   │       ├── categorias/
│   │   │       ├── contenido/       # Edición de page_sections
│   │   │       └── usuarios/
│   │   ├── api/
│   │   │   └── webhooks/izipay/      # Route handler para webhook de pago (IPN)
│   │   ├── layout.tsx
│   │   ├── not-found.tsx            # 404 personalizada
│   │   └── error.tsx                # 500 personalizada
│   ├── components/
│   │   ├── ui/                      # shadcn/ui
│   │   ├── shop/                    # Componentes de tienda
│   │   └── admin/                   # Componentes de admin
│   ├── lib/
│   │   ├── db.ts                    # Cliente Prisma singleton (adapter pg)
│   │   ├── auth.ts                  # Config Auth.js
│   │   ├── admin-auth.ts            # getAdminSession / clientIp
│   │   ├── izipay.ts                # Integración pagos (al implementarse)
│   │   ├── images.ts / upload.ts / storage.ts  # Pipeline de imágenes
│   │   ├── money.ts / format.ts / cart-totals.ts
│   │   ├── data/                    # Capa de lectura cacheada (products, filters)
│   │   └── utils.ts
│   ├── actions/                     # Server Actions (products, variants,
│   │                                # categories, product-images, site, auth,
│   │                                # orders al implementarse)
│   ├── schemas/                     # Schemas Zod
│   ├── stores/                      # Zustand stores (cart-store)
│   ├── config/site.ts               # Config central de marca/navegación (ver 11.13)
│   ├── hooks/                       # use-has-mounted, use-prefers-reduced-motion
│   ├── fonts/                       # Webfonts .woff2 (next/font/local)
│   ├── generated/prisma/            # Cliente Prisma generado (no editar)
│   └── types/
├── docs/                            # Documentación operativa (ver §1)
├── public/brand/                    # Assets de marca finales
├── .env.example
├── CLAUDE.md
└── README.md
```

Notas de la estructura real: el carrito es un **sheet** (`components/shop/cart-sheet.tsx`),
no una página `/carrito`; el catálogo vive en `/tienda` con filtros por URL.

---

## 6. Estrategia de Renderizado

Elegir por página según naturaleza del contenido:

| Página | Estrategia | Razón |
|---|---|---|
| Inicio | ISR (revalidate 60s) | Cambia poco, debe cargar rápido |
| Tienda / Categorías | ISR (revalidate 60s) | Igual |
| Ficha de producto | ISR (revalidate 30s) | Stock puede cambiar, no necesita tiempo real |
| Carrito | Client-side | Dinámico por usuario |
| Checkout | SSR (dynamic) | Requiere stock y precios frescos |
| Nosotros | Estático | No cambia |
| Contacto | Estático | Formulario |
| Libro de Reclamaciones | SSR | Formulario con correlativo |
| Panel admin | SSR (dynamic) | Datos siempre frescos, protegido |

---

## 7. Criterios de Calidad (ISO/IEC 25010)

Marco de referencia. Las tres críticas para este e-commerce son **Funcionalidad, Fiabilidad y Seguridad** (un fallo ahí = pérdida de dinero o datos).

### 7.1 Funcionalidad
- Validar precios y stock **siempre en el servidor**. Nunca confiar en valores enviados por el cliente.
- El total del pedido se recalcula en el servidor antes de cobrar.

### 7.2 Rendimiento
- Estrategia de renderizado por página (sección 6).
- `next/image` con lazy loading y blur placeholder en todas las imágenes.
- Índices en BD en campos de búsqueda.
- `React.Suspense` con skeleton loaders para streaming.
- (Redis y CDN: etapa futura, sección 11.)

### 7.3 Compatibilidad
- Responsive real: móvil, tablet, escritorio.
- Probar en Chrome, Safari, Firefox, Edge.

### 7.4 Usabilidad
- Flujo de compra en mínimos pasos.
- **Accesibilidad:** contraste mínimo 4.5:1, navegación por teclado en todo el checkout, alt text en imágenes, labels en formularios, aria-labels en botones de carrito/menú/filtros, focus visible.
- UX percibido: skeleton loaders, feedback en botones (spinner al procesar), optimistic updates en el carrito.
- Mensajes de error claros y humanos, nunca errores técnicos al usuario.
- Páginas 404 y 500 personalizadas con identidad de la marca.

### 7.5 Fiabilidad
- **Transacciones atómicas:** descontar stock + crear pedido + registrar pago en una sola transacción Prisma (`$transaction`). Si falla una parte, falla todo (rollback).
- **Stock concurrente:** si dos personas compran el último ítem, solo una completa. Validar stock dentro de la transacción.
- Soft delete (sección 4).
- Snapshots en pedidos (sección 4).
- Manejo de errores con try/catch en todas las Server Actions, devolviendo estados claros.

### 7.6 Seguridad
- **Contraseñas:** argon2id. Nunca texto plano.
- **Sesiones:** cookies HTTP-only, Secure, SameSite=Lax. Gestionadas por Auth.js.
- **Login:** rate limiting (bloqueo tras 5 intentos fallidos).
- **Recuperación de contraseña:** token de un solo uso con expiración 15 min.
- **Autorización:** validar rol en el servidor en cada acción de admin. Nunca confiar en el cliente.
- **Pagos:** los datos de tarjeta se envían directo a los servidores de Izipay mediante su SDK Web y nunca llegan al servidor propio. Validar la respuesta/firma HMAC de Izipay antes de marcar un pedido como pagado. Usar credenciales separadas de prueba y producción (identificador de tienda, clave API, clave pública de navegador, clave HMAC).
- **Validación:** todo input pasa por Zod en el servidor antes de tocar la BD.
- **SQL Injection:** Prisma lo previene con queries parametrizadas. No usar SQL crudo sin parametrizar.
- **CSRF:** Auth.js incluye protección; usar tokens en formularios sensibles.
- **HTTPS:** obligatorio en todo el sitio.
- **Headers de seguridad** en `next.config.js`: Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.

### 7.7 Mantenibilidad
- Separación en capas: UI (components) / lógica de negocio (actions) / acceso a datos (lib/db + Prisma).
- TypeScript `strict`. Sin `any` salvo justificación.
- Nombres descriptivos. Componentes pequeños y reutilizables.
- Tests del flujo crítico de compra (sección 7.10).
- README con instalación y variables de entorno documentadas.
- Git con commits claros (Conventional Commits recomendado).

### 7.8 Portabilidad
- Toda config sensible en variables de entorno (`.env`), nunca hardcodeada.
- `.env.example` actualizado con todas las claves necesarias.
- Prisma Migrate para versionar el esquema.
- Independencia de hosting: que se pueda mover entre proveedores sin reescribir.

### 7.9 SEO
- Meta tags dinámicos por página con la API `generateMetadata` de Next.js (title, description, og:image, canonical).
- Datos estructurados JSON-LD:
  - `Product` en ficha de producto (precio, stock, imagen).
  - `BreadcrumbList` en navegación.
  - `Organization` y `WebSite` global.
- `sitemap.xml` generado dinámicamente (incluye productos y categorías).
- `robots.txt`.
- URLs limpias con slugs descriptivos.

### 7.10 Testing
Prioridad en el flujo de compra (carrito → checkout → pago → confirmación):
- **Unitario (Vitest):** cálculo de totales, aplicación de descuentos, validación de stock.
- **E2E (Playwright):** checkout completo con pago en sandbox de Izipay.
- No se requiere 100% de cobertura; sí cobertura del flujo crítico.

---

## 8. Reglas de Lógica de Negocio

> El cliente confirmó que **maneja stock real con control de inventario.** El manejo correcto del stock es crítico: vender algo agotado genera reembolsos, reclamos y pérdida de confianza.

1. **Stock confirmado:** la tienda maneja inventario real por variante (talla + color). Cada `product_variant` tiene su propio campo `stock`.
2. **Descuento de stock:** se **RESERVA al crear el pedido** (decremento condicional dentro de la transacción de `createOrder`), no al agregar al carrito ni al confirmar el pago. Si el pago falla, expira o se cancela, se repone (regla 10). Esto hace imposible la sobreventa; el diseño completo está en `docs/05-pagos-izipay.md §2` — el cron de limpieza (11.7) es parte OBLIGATORIA de este esquema.
3. **Validación en compra:** antes de confirmar el pedido, validar dentro de la transacción que hay stock suficiente de cada variante. Si no hay, abortar y notificar al usuario.
4. **Stock concurrente:** si dos personas compran la última unidad al mismo tiempo, solo una completa. Validar y descontar stock dentro de `prisma.$transaction` con bloqueo adecuado.
5. **Pedido:** se crea en estado `pendiente`, pasa a `pagado` solo tras confirmación válida de Izipay.
6. **Precio:** el precio de venta se toma de la BD en el servidor al momento de crear el pedido. El precio enviado por el cliente es solo informativo y se ignora para el cobro.
7. **Carrito de invitado:** se rastrea por `session_id`; al iniciar sesión se fusiona con el carrito del usuario.
8. **Cupones:** validar vigencia, uso máximo y monto mínimo en el servidor antes de aplicar.
9. **Libro de Reclamaciones:** genera correlativo único, registra tipo (reclamo/queja), debe permitir respuesta dentro de 30 días.
10. **Reposición de stock:** si un pago falla o un pedido se cancela tras haber descontado stock, devolver las unidades al inventario.

---

## 9. Emails Transaccionales

| Evento | Destinatario | Contenido |
|---|---|---|
| Compra confirmada | Comprador + admin | Resumen del pedido, monto, productos |
| Pago fallido | Comprador | Aviso con enlace para reintentar |
| Pedido enviado | Comprador | Estado y datos de envío |
| Nuevo reclamo | Admin | Aviso de entrada en Libro de Reclamaciones |
| Recuperar contraseña | Usuario | Token temporal (15 min) |

---

## 10. Cumplimiento Legal (Perú)

- **Libro de Reclamaciones** virtual (obligatorio INDECOPI) — tabla `complaints`.
- **Ley 29733** de Protección de Datos: el cliente (dueño de la tienda) es el responsable del tratamiento. Implementar medidas de seguridad razonables.
- **Banner de consentimiento de cookies.**
- **Derecho de eliminación de cuenta:** el usuario puede solicitar borrado de sus datos.
- Páginas legales: Política de privacidad, Términos y condiciones, Política de envíos, Política de devoluciones.

---

## 11. Fuera de Alcance en Esta Etapa (Evolución Futura)

Documentado para no implementarlo ahora, pero tenerlo en el horizonte:

| Mejora | Cuándo considerarla |
|---|---|
| Redis (caché + sesiones) | Cuando el tráfico crezca y las queries repetidas pesen |
| S3 + CDN para imágenes | Cuando el volumen de imágenes supere lo que el host local maneja bien |
| `seo_metadata` editable desde panel | Cuando el cliente quiera controlar meta tags por producto |
| `email_logs` | Cuando se necesite auditoría de correos enviados (la auditoría de negocio ya está cubierta por `audit_logs`) |
| Roles y permisos granulares (tabla `permissions`) | Si el equipo crece y se necesitan permisos finos |
| Observabilidad avanzada (Sentry, UptimeRobot) | Recomendable apenas haya tráfico real (complementa los logs técnicos de la etapa actual) |
| Tests de carga | Antes de una campaña grande |

---

## 11.1 Variables de Entorno

Mantener un `.env.example` actualizado. Variables mínimas de esta etapa:

```bash
# Base de datos
DATABASE_URL="postgresql://..."

# Auth.js
AUTH_SECRET="..."              # generar con: npx auth secret
AUTH_URL="http://localhost:3000"

# Izipay (obtener del panel de comercio Izipay)
IZIPAY_MERCHANT_ID="..."       # Identificador de tienda
IZIPAY_API_KEY_TEST="..."      # Clave API de prueba
IZIPAY_API_KEY_PROD="..."      # Clave API de producción
IZIPAY_PUBLIC_KEY="..."        # Clave pública para el navegador
IZIPAY_HMAC_KEY="..."          # Clave HMAC para validar transacciones
IZIPAY_ENV="test"              # test | production

# Email
EMAIL_FROM="..."
RESEND_API_KEY="..."           # si se usa Resend

# App
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Nunca commitear `.env`. Toda clave nueva se documenta en `.env.example`.

---

## 11.2 Estados del Pedido (máquina de estados)

```
pendiente ──(pago confirmado)──> pagado ──(despacho)──> enviado ──(recepción)──> entregado
    │                              │
    │                              └──(reembolso)──> reembolsado
    └──(timeout / cancelación)──> cancelado
```

Transiciones válidas:
- `pendiente` → `pagado` | `cancelado`
- `pagado` → `enviado` | `reembolsado`
- `enviado` → `entregado` | `reembolsado`
- `entregado` → `reembolsado` (caso excepcional)
- estados finales: `entregado`, `cancelado`, `reembolsado`

Validar transiciones en el servidor; no permitir saltos inválidos (ej. `pendiente` → `entregado`).

---

## 11.3 Flujo de Pago con Izipay

> La especificación completa y vinculante está en `docs/05-pagos-izipay.md`; el
> plan de implementación paso a paso en `docs/08-implementacion-flujo-venta.md`.

1. Usuario llega al checkout con su carrito (cliente); envía SOLO `{ variantId, quantity }[]` + datos del comprador.
2. `createOrder` (Server Action), TODO dentro de `prisma.$transaction`: relee precios de BD, **valida y RESERVA stock** (decremento condicional), correlativo por secuencia, crea pedido `pendiente` con snapshot + pago `pendiente`. Luego genera el token/sesión de pago con la API de Izipay (clave API del servidor).
3. El cliente (navegador) abre el formulario de Izipay con el SDK Web. Los datos de tarjeta van directo a Izipay, nunca al servidor propio.
4. Izipay notifica por **IPN/webhook** (fuente de verdad; el retorno del navegador es solo UX). El servidor **valida la firma HMAC** (tiempo constante) + monto + moneda + transición de estado, con **idempotencia** por `transactionId`.
5. Si el pago es válido: marcar pedido `pagado` + registrar en `payments` (JSON completo) + audit log + revalidar caché del catálogo + enviar emails (fuera de la transacción).
6. Si el pago falla, expira o el usuario abandona: el pedido queda `pendiente`; el cron (11.7) lo cancela tras el plazo y **repone el stock reservado**.

**Casos a manejar:** usuario cierra la ventana a mitad del pago, doble envío del formulario (clave de idempotencia generada al montar el checkout), IPN duplicado o tardío, monto alterado (rechazar aunque la firma valide).

---

## 11.4 Política de Imágenes

| Regla | Valor sugerido |
|---|---|
| Formatos aceptados al subir | JPG, PNG, WebP |
| Peso máximo por imagen | 5 MB al subir (se optimiza después) |
| Dimensiones recomendadas | Lado mayor 1500px, se redimensiona automático |
| Fotos por producto | 1 a 6 |
| Salida optimizada | WebP/AVIF vía `next/image` |
| Alt text | Obligatorio (accesibilidad + SEO) |

---

## 11.5 Datos de Prueba (seed.ts)

El seed debe crear para desarrollo:
- 1 usuario admin inicial (con password argon2id).
- Categorías de ejemplo acordes al rubro (Conjuntos, Bodies, Pijamas).
- ~10 productos de prueba con variantes (tallas/colores) y stock.
- Tallas y colores base.
- Configuración inicial de `site_settings`.

---

## 11.6 Moneda, Impuestos y Formato (Perú)

- **Moneda:** Soles peruanos (S/), código `PEN`.
- **Formato de precio:** `S/ 1,234.56`.
- **Zona horaria:** America/Lima (GMT-5).
- **IGV (18%):** **PENDIENTE de confirmar (ver 1.1, decisión #2).** El cálculo de impuestos y envío YA está centralizado en `src/lib/cart-totals.ts` (`computeOrderSummary`) — ajustar SOLO ahí cuando se confirme.
- **Dinero: SIEMPRE en céntimos enteros** (`Int` en Prisma, sufijo `Cents` en los campos: `priceCents`, `totalCents`…). Se formatea a `S/ 1,234.56` solo en la presentación (`lib/money.ts` / `lib/format.ts`). **NUNCA usar `Decimal`, `Float` ni montos con punto decimal en BD o lógica** — regla firme del proyecto; así está implementado todo el schema y el código.

---

## 11.7 Limpieza de Pedidos y Carritos Abandonados

- **Pedidos `pendiente`** que no se pagan en un plazo (ej. 24h): marcar como `cancelado` y reponer stock si se reservó.
- **Carritos de invitado** inactivos por más de X días (ej. 30): eliminar.
- Implementar como tarea programada (cron). En Railway es nativo; en Vercel requiere Vercel Cron.

---

## 11.8 Trazabilidad y Observabilidad

Se usan **dos mecanismos con propósitos distintos** (no es redundancia):

### Auditoría de negocio → tabla `audit_logs` (BD)
Para eventos que el admin necesita consultar desde el panel. Registrar SIEMPRE:
- Creación, edición y eliminación (soft) de productos y variantes.
- Cambios de precio (guardar valor anterior y nuevo en `changes`).
- Cambios de stock manuales (no los automáticos por venta).
- Cambios de estado de pedidos (quién y cuándo).
- Creación, edición y desactivación de usuarios y cambios de rol.
- Aplicación o anulación de cupones.
- Edición de contenido del sitio (`page_sections`, `site_settings`).

Reglas: inmutable (solo inserción), incluye `user_id`, `ip_address` y timestamp. No registrar datos sensibles (contraseñas, datos de tarjeta).

### Logs técnicos → servidor / consola
Para errores y debugging del desarrollador, no consultables por el admin:
- Errores de servidor (con stack trace).
- Fallos en la comunicación con Izipay.
- Resultado de tareas cron (limpieza de pedidos/carritos).
- Webhooks recibidos y su validación.

### Registro específico de pagos
Todo intento de pago (exitoso y fallido) se registra en la tabla `payments` con la respuesta completa de Izipay en JSON, para reconciliación y soporte.

### Zona horaria y timestamps
- Toda la aplicación opera en **America/Lima (GMT-5)**.
- Guardar timestamps en BD en **UTC** (estándar) y convertir a hora de Lima solo en la presentación.
- Todos los registros (audit_logs, orders, payments) llevan `created_at` y, donde aplique, `updated_at`.

---

## 11.9 Convenciones de Idioma

- **Interfaz de usuario (UI):** español (tienda y panel admin). Textos visibles, mensajes de error al usuario, emails: en español.
- **Código:** inglés. Nombres de variables, funciones, tablas, columnas y commits en inglés.
- **Comentarios: en ESPAÑOL** (decisión del propietario del proyecto; así está escrito todo el código existente — mantener la consistencia).
- Razón: el código en inglés es estándar de la industria; los comentarios y la UI en español sirven a quien mantiene y usa el proyecto.

---

## 11.10 Control de Versiones por Fases

Desarrollo incremental con hitos versionados. Sugerencia de fases:

| Versión | Hito |
|---|---|
| v0.1 | Setup: Next.js, Prisma, schema completo, auth básica |
| v0.2 | Catálogo: categorías, productos, variantes, panel admin de productos |
| v0.3 | Carrito y checkout (sin pago real) |
| v0.4 | Integración Izipay en sandbox |
| v0.5 | CMS: contenido y colores editables, páginas (Inicio, Nosotros) |
| v0.6 | Legal: políticas, Libro de Reclamaciones, contacto |
| v0.7 | SEO, optimización, accesibilidad, audit_logs |
| v0.8 | Testing del flujo de compra, ajustes |
| v1.0 | Entrega: producción, capacitación |

### Convención de commits: Conventional Commits
Formato: `<tipo>(<alcance opcional>): <descripción en inglés>`

Tipos: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`, `perf`.

Ejemplos:
```
feat(products): add product variant stock management
fix(checkout): correct total calculation with shipping
refactor(auth): extract password hashing to util
chore(deps): update prisma to latest
```

Una rama por fase/feature; merge a main cuando la fase esté estable y testeada.

---

## 11.11 Buenas Prácticas de Código

Objetivo: código **escalable, legible, optimizado y rápido**. Aplicar principios con criterio, no dogmáticamente — esto es un proyecto mantenido por una persona, evitar sobre-arquitectura.

### Principios generales
- **DRY** (Don't Repeat Yourself): extraer lógica repetida a funciones/utils reutilizables. Pero no abstraer prematuramente: si algo se usa una sola vez, no necesita abstracción.
- **KISS** (Keep It Simple): la solución más simple que funcione y sea clara. Evitar cleverness innecesario.
- **YAGNI** (You Aren't Gonna Need It): no construir para casos hipotéticos futuros. Construir para lo que el alcance pide hoy (ver sección 11 para lo que queda fuera).
- **Single Responsibility:** cada función, componente y módulo hace una sola cosa bien. Funciones cortas y enfocadas.
- **Separation of Concerns:** respetar las capas — UI (`components`), lógica de negocio (`actions`), acceso a datos (`lib/db` + Prisma). La UI no consulta la BD directo; pasa por actions.

### TypeScript
- `strict: true`. Prohibido `any` sin justificación escrita en comentario.
- Tipar entradas y salidas de funciones. Inferir tipos de Prisma y Zod (`z.infer`) en vez de duplicarlos.
- Usar tipos discriminados para estados (ej. resultado de Server Actions: `{ success: true, data } | { success: false, error }`).

### Componentes (React / Next.js)
- Server Components por defecto. `"use client"` solo cuando hay interactividad real (estado, eventos, hooks de navegador).
- Componentes pequeños y composables. Si un componente pasa de ~150 líneas, evaluar dividirlo.
- Props tipadas con interface. Evitar prop drilling profundo; usar composición o Zustand para estado global del carrito.
- Un componente por archivo, nombre en PascalCase.

### Server Actions
- Toda mutación pasa por una Server Action, nunca lógica de negocio en el cliente.
- Patrón uniforme: validar input con Zod → verificar permisos → ejecutar (en transacción si toca stock/pedido/pago) → revalidar caché → retornar resultado tipado.
- Manejo de errores con try/catch, retornando estado claro, nunca lanzando errores crudos al cliente.

### Base de datos / Prisma
- Cliente Prisma como singleton (`lib/db.ts`) para evitar múltiples conexiones.
- Seleccionar solo los campos necesarios (`select`), no traer todo por defecto.
- Evitar el problema N+1: usar `include`/`select` con relaciones en una sola query.
- Operaciones que afectan varias tablas (stock + pedido + pago) van en `prisma.$transaction`.
- Índices en campos de búsqueda y filtrado frecuente.

### Nomenclatura (en inglés, ver 11.9)
- Variables y funciones: `camelCase`, descriptivas (`calculateOrderTotal`, no `calc`).
- Componentes y tipos: `PascalCase`.
- Constantes: `UPPER_SNAKE_CASE`.
- Tablas y columnas: `snake_case`.
- Booleanos con prefijo: `is`, `has`, `can` (`isActive`, `hasStock`).

### Rendimiento (código)
- `next/image` siempre, nunca `<img>`.
- Lazy load de componentes pesados con `dynamic()`.
- Memoización (`useMemo`, `useCallback`) solo cuando hay un costo real medido, no por defecto.
- Paginación en listados largos (productos, pedidos), nunca traer todo.
- `Suspense` con skeletons para streaming de contenido.

### Limpieza
- Sin código muerto, sin `console.log` en producción (usar el logger técnico).
- Sin valores mágicos: extraer a constantes nombradas.
- Variables de entorno validadas al arranque (con Zod) para fallar rápido si falta una clave.

---

## 11.12 Uso de Skills en Claude Code

Este proyecto usará skills de la comunidad instaladas en Claude Code. Reglas de uso:

- **Antes de generar código de un dominio cubierto por una skill, consultar primero la skill correspondiente.** Las skills encapsulan buenas prácticas específicas; ignorarlas y tirar de memoria produce código inferior.
- Si varias skills aplican a una misma tarea, revisar todas las relevantes antes de empezar.
- Las skills complementan este `CLAUDE.md`, no lo reemplazan. Si una skill contradice una regla crítica de este documento (seguridad de pagos, validación en servidor, manejo de stock), **prevalece este documento** y se señala el conflicto.
- Verificar que las prácticas de la skill correspondan a las versiones del stack (sección 3); descartar consejos obsoletos.
- No instalar dependencias nuevas sugeridas por una skill sin confirmar que encajan con el principio anti-sobre-ingeniería (sección 1 y 11).

> Nota: al instalar skills de la comunidad, revisar que provengan de fuentes confiables antes de darles contexto del proyecto.

---

## 11.13 Configuración Centralizada (nada de valores generales hardcodeados)

**Regla:** todo valor "general" del sitio (marca, textos de portada, redes,
contacto, costos, flags de features, mensajes de la cinta…) vive en **UN solo
lugar** y los componentes lo consumen de ahí. Nunca escribir el mismo dato suelto
en varios componentes.

Tres niveles, según quién debe poder cambiarlo:

| Nivel | Dónde vive | Quién lo cambia | Ejemplos |
|---|---|---|---|
| 1. Secretos y entorno | `.env` (validado en `src/lib/env.ts`) | Desarrollador | claves de BD/Izipay/Resend, `NEXT_PUBLIC_SITE_URL` |
| 2. Config de código con defaults | `src/config/site.ts` (tipado, única fuente) | Desarrollador | nombre de marca, navegación, defaults de la cinta, redes |
| 3. Administrable en runtime | tabla `site_settings` (leída vía `lib/site-settings.ts`), con los valores de nivel 2 como respaldo | **Admin desde el panel** | portada (imagen/título/subtítulo), cinta de anuncios, WhatsApp |

**Patrón establecido (seguirlo):** el componente lee `getSiteSettings()` /
`getAnnouncement()`; si no hay valor en BD, cae al default de `config/site.ts`.
Así ya funcionan la portada y la cinta — cualquier valor nuevo sigue el mismo
camino.

**Al detectar un valor general hardcodeado en un componente** (un teléfono, un
texto de marca, un costo, un límite): moverlo a su nivel correspondiente. Y al
crear features nuevas, preguntarse siempre: ¿el cliente querrá cambiar esto sin
programador? → nivel 3 (site_settings + campo en `/admin/apariencia` o donde
corresponda).

Constantes técnicas (tamaños de imagen, límites de validación) siguen la regla
de "sin valores mágicos" (11.11): constante nombrada en el módulo que la usa o
en `lib/` si se comparte.

---

## 12. Comandos Clave

El gestor de paquetes es **pnpm**.

```bash
# Desarrollo
pnpm dev

# Prisma (scripts reales del package.json)
pnpm db:migrate        # prisma migrate dev
pnpm db:generate       # prisma generate
pnpm db:studio         # ver BD en UI
pnpm db:seed           # datos de prueba (tsx prisma/seed.ts)
pnpm db:reset          # reset + seed

# Calidad
pnpm lint
pnpm test              # Vitest (añadir script al crear los primeros tests)
pnpm test:e2e          # Playwright (ídem)

# Build
pnpm build
pnpm start             # no dejar servers colgados ocupando el puerto 3000
```

---

## 13. Convenciones para Claude Code

1. **Antes de codear:** revisar este documento, **`docs/README.md` y el doc de `docs/` que cubra la tarea** (auditoría 02, SEO 03, rendimiento 04, pagos 05/08, identidad 06, UX/UI 09), el `schema.prisma`, las buenas prácticas (11.11) y las skills relevantes instaladas (11.12).
2. **Validación:** toda Server Action valida su input con Zod antes de tocar la BD.
3. **Seguridad primero:** nunca exponer lógica de precio/stock al cliente; siempre validar en servidor.
4. **No sobre-ingeniería:** no agregar dependencias ni infraestructura de la sección 11 sin que se solicite explícitamente. Aplicar SOLID/patrones con criterio, no por dogma (11.11).
5. **Tipado:** TypeScript strict, sin `any` injustificado.
6. **Errores:** toda Server Action maneja errores y devuelve un estado claro al cliente.
7. **Componentes:** Server Components por defecto; Client Components solo cuando se necesita interactividad (marcar con `"use client"`).
8. **Imágenes:** siempre `next/image`, nunca `<img>` crudo.
9. **Accesibilidad:** no entregar un componente sin labels/aria correspondientes.
10. **Transacciones:** operaciones que afectan stock + pedido + pago van en `prisma.$transaction`.
11. **Trazabilidad:** registrar en `audit_logs` los eventos de negocio relevantes (11.8).
12. **Decisiones pendientes:** ante un punto de la sección 1.1 sin confirmar, detenerse y preguntar; marcar `// TODO: confirmar con cliente`.
13. **Idioma:** código en inglés, comentarios y UI en español (11.9).
14. **Commits:** Conventional Commits en inglés (11.10).
15. **Skills:** consultar la skill del dominio antes de generar su código; si contradice una regla crítica de seguridad/negocio de este documento, prevalece este documento (11.12).
16. **Dinero:** céntimos enteros siempre; nunca `Decimal`/`Float` (11.6).
17. **Config centralizada:** ningún valor general hardcodeado en componentes; usar `.env` / `config/site.ts` / `site_settings` según el nivel (11.13). Al crear features, evaluar si el valor debe ser administrable por el cliente.
18. **UI con criterio:** toda pantalla nueva cumple el checklist de `docs/09-guia-ux-ui.md §7` (estados vacíos que guían, loading/éxito/error, una sola acción primaria, accesibilidad).
