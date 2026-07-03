# Arquitectura y estado actual del proyecto

> Fotografía del proyecto a julio de 2026. Sirve como punto de partida para las mejoras
> descritas en el resto de la documentación (`docs/02` a `docs/07`).

---

## 1. Enfoque: monolito modular

El proyecto es un **monolito modular con Next.js (App Router)**: frontend y backend
viven en un solo repositorio y un solo despliegue, pero el código está separado en
capas con responsabilidades claras. Esta es la decisión correcta para una tienda
pequeña en crecimiento:

- **Un solo despliegue, una sola base de datos, un solo dominio de fallos.** Menos
  piezas que mantener para una sola persona.
- **Modularidad interna:** cada dominio (catálogo, carrito, ventas, CMS, auth) tiene
  sus propios schemas, actions y componentes. Si el negocio crece, cualquier módulo
  puede extraerse a un servicio aparte sin reescribir el resto — las "costuras" ya
  existen (interfaces de `lib/storage.ts`, `lib/cart-totals.ts`, `config/site.ts`).
- **Escalar a microservicios NO es una meta:** es una salida de emergencia para
  cuando el tráfico o el equipo lo exijan. Documentado en `docs/07-roadmap.md`.

### ¿Es el monolito modular la mejor opción? (alternativas evaluadas)

Sí — para este negocio y este equipo, es la opción correcta. Comparación honesta
con las alternativas reales:

| Enfoque | Qué daría | Por qué NO conviene aquí |
|---|---|---|
| **Monolito modular (actual)** | Un deploy, un servicio, BD directa desde el servidor, costo mínimo | ✅ Elegido. Cumple exactamente el objetivo: "levantar un servicio y que todo funcione" |
| Frontend + API separada (Next + Nest/Express) | Backend reutilizable para una app móvil futura | Duplica despliegues, auth, tipos y CORS **hoy**, por una app móvil que no existe. Las Server Actions ya son la "API" tipada |
| Plataforma SaaS (Shopify/Tiendanube) | Salir a vender en días, checkout resuelto | Pierdes el CMS a medida, la identidad visual al 100 %, pagas comisión mensual + por venta, e Izipay/Yape se integran peor. Válido como plan de contingencia, no como destino |
| Headless commerce (Medusa/Saleor + Next) | Motor de e-commerce "gratis" | Dos servicios que operar y aprender; sobredimensionado para un catálogo pequeño con una persona manteniendo |
| Microservicios | Escala por equipo/dominio | Sin equipo ni tráfico que lo justifique, solo multiplica puntos de fallo. Se extraen de un monolito sano cuando duele, no antes |
| Serverless puro (functions sueltas) | Pago por uso extremo | Next en Vercel YA es serverless por debajo; fragmentarlo a mano no aporta |

La única condición para que el monolito escale bien es la que ya se está
cumpliendo: **disciplina de módulos** (capas separadas, costuras en interfaces,
dominios que no se importan entre sí por atajos). Las señales concretas para
replantear están en `docs/07-roadmap.md` (última sección).

### Diagrama de capas

```
Navegador
   │
   ▼
Next.js App Router
 ├── Server Components ─── lectura de datos (lib/data/*)
 ├── Server Actions ────── mutaciones (src/actions/*) — Zod → permisos → BD → revalidate
 ├── Route Handlers ────── solo auth (/api/auth) y futuros webhooks de pago
 └── Client Components ─── interactividad (carrito Zustand, filtros, formularios RHF)
   │
   ▼
Prisma 7 (adapter pg) ──► PostgreSQL (Supabase, pooler + DIRECT_URL para migrar)
Supabase Storage ───────► imágenes (bucket público, procesadas con sharp)
```

---

## 2. Stack real (verificado en package.json)

| Capa | Tecnología | Versión | Notas |
|---|---|---|---|
| Framework | Next.js | 16.2.9 | App Router + Turbopack |
| UI | React | 19.2.4 | Server Components por defecto |
| Lenguaje | TypeScript | 5.x | `strict: true` |
| ORM | Prisma | 7.8 | `prisma-client` generator → `src/generated/prisma`, adapter `pg` |
| BD | PostgreSQL | Supabase | `DATABASE_URL` (pooler) + `DIRECT_URL` (migraciones) |
| Auth | Auth.js (next-auth) | 5.0 beta | Credenciales + argon2id, sesión JWT en cookie HTTP-only |
| Validación | Zod | 4.x | En todas las Server Actions |
| Estado cliente | Zustand | 5.x | Carrito con `persist` (localStorage) |
| Formularios | React Hook Form | 7.x | + resolver de Zod |
| Estilos | Tailwind CSS | 4.x | Tokens en `globals.css` (`@theme inline`) |
| Componentes | shadcn/ui + Radix | — | Copiados a `src/components/ui` |
| Imágenes | sharp + Supabase Storage | — | Pipeline en `lib/images.ts` / `lib/upload.ts` / `lib/storage.ts` |
| Email | Resend + React Email | instalados | **Aún sin usar** (ver roadmap) |
| Tests | Vitest + Playwright | instalados | **Aún no hay ningún test escrito** |

**Dinero:** todos los montos van en **céntimos enteros** (`Int`, sufijo `Cents`).
Regla firme del proyecto — nunca floats ni decimales para dinero.

**Idioma:** UI en español, código en inglés, **comentarios en español** (regla del
proyecto que anula la convención general de CLAUDE.md).

---

## 3. Estructura de carpetas (real)

```
src/
├── app/
│   ├── (shop)/               # Tienda pública
│   │   ├── page.tsx          # Inicio (hero administrable, destacados, novedades)
│   │   ├── tienda/           # Catálogo con filtros por URL (cat/size/color/sort/q)
│   │   ├── producto/[slug]/  # Ficha con variantes, galería, JSON-LD, relacionados
│   │   ├── checkout/         # Formulario de invitado (aún NO crea pedidos)
│   │   └── template.tsx      # Transición de entrada entre páginas
│   ├── (admin)/admin/        # Panel protegido por rol en el layout (admin|editor)
│   │   ├── productos/        # CRUD + variantes + imágenes
│   │   ├── categorias/
│   │   ├── pedidos/          # Solo listado (aún no hay flujo que cree pedidos)
│   │   └── apariencia/       # Hero, textos y cinta de anuncios (site_settings)
│   ├── api/auth/[...nextauth]/
│   ├── login/
│   ├── sitemap.ts / robots.ts / icon.tsx / opengraph-image.tsx / twitter-image.tsx
│   ├── error.tsx / global-error.tsx / not-found.tsx
│   └── layout.tsx            # Metadata global, skip-link, splash de carga
├── actions/                  # auth, products, variants, categories, product-images, site
├── components/  (ui / shop / admin / seo)
├── lib/                      # db, auth, admin-auth, env, images, upload, storage,
│                             # money, format, cart-totals, product-variants, audit,
│                             # site-settings, data/ (products, filters)
├── schemas/                  # Zod: checkout, announcement
├── stores/                   # cart-store (Zustand persist)
├── config/site.ts            # Marca, navegación, redes, cinta de anuncios
└── types/                    # action (ActionResult), product, next-auth.d.ts
```

### Patrones ya establecidos (mantener)

1. **Server Action uniforme:** validar con Zod → `getAdminSession()` → operar
   (transacción si toca varias tablas) → `recordAudit()` → `revalidatePath()` →
   retornar `ActionResult` (`{ success: true } | { success: false, error }`).
2. **Adaptador de storage intercambiable:** `lib/storage.ts` cumple `saveFile` /
   `deleteFileByUrl`; migrar a R2/S3 = reescribir solo ese archivo.
3. **Totales centralizados:** `lib/cart-totals.ts` es el ÚNICO lugar donde se arma
   subtotal/envío/IGV/total. IGV y envío marcados `TODO: confirmar con cliente`.
4. **Datos con caché:** `lib/data/products.ts` usa `unstable_cache` con
   `revalidate: 60`; las actions invalidan con `revalidatePath`.
5. **Config administrable con respaldo:** `config/site.ts` define los valores por
   defecto; `site_settings` (BD) los sobreescribe desde el panel.

---

## 4. Modelo de datos

`prisma/schema.prisma` implementa las 24 tablas planificadas: roles/users/sessions,
categorías/productos/variantes/imágenes, tallas/colores, media, carritos, pedidos
(con snapshot en `order_items`), pagos, direcciones, métodos de envío, cupones,
páginas/secciones/ajustes (CMS), contacto, reclamos (INDECOPI) y `audit_logs`.

Detalles importantes:

- Estados y JSON van como `String` (herencia de la etapa SQLite). Migrar a
  `enum`/`Json` nativos de Postgres está pendiente (ver auditoría §BD).
- `Order.number` es un correlativo **asignado por la aplicación** — hay riesgo de
  colisión bajo concurrencia (ver auditoría).
- Soft delete con `isActive`; los pedidos nunca se borran.

---

## 5. Qué está hecho y qué falta

### Funciona hoy
- Catálogo completo (categorías, productos, variantes con stock, imágenes).
- Filtros data-driven por URL en `/tienda` + búsqueda + JSON-LD de colección.
- Ficha de producto rica (variantes, guía de tallas, galería, JSON-LD Product).
- Carrito cliente (Zustand persist) y formulario de checkout de invitado.
- Panel admin protegido (productos, categorías, apariencia, listado de pedidos).
- Auth con credenciales + argon2id + rate limiting básico + auditoría.
- Subida de imágenes con validación, sharp y Supabase Storage.
- Base SEO: metadata, OG/Twitter images, robots, sitemap (incompleto), JSON-LD.

### No existe todavía (crítico para vender)
| Falta | Impacto |
|---|---|
| **Creación de pedidos en el servidor** | El checkout no persiste nada; sin esto no hay tienda |
| **Integración Izipay** | Sin cobro no hay venta (ver `docs/05-pagos-izipay.md`) |
| Validación de stock al comprar | Riesgo de sobreventa |
| Emails transaccionales | Resend instalado pero sin usar |
| Cuentas de cliente | Decisión pendiente #3 (solo hay invitado) |
| Páginas legales, contacto, Libro de Reclamaciones (UI) | Obligación legal INDECOPI |
| Cron de limpieza (pedidos pendientes / carritos) | Stock retenido para siempre |
| Tests (unitario y E2E) | Dependencias instaladas, cero tests |

### Decisiones de negocio aún pendientes
1. Hosting definitivo (hoy: Vercel + Supabase de facto).
2. IGV 18%: ¿incluido, aparte o RUS?
3. Cuentas de cliente: ¿con cuenta, invitado o ambas?
4. Entrega: ¿envío, recojo o ambos?
5. Zonas y tarifas de envío.

**Regla vigente:** mientras una decisión esté pendiente, dejar la costura preparada
(`cart-totals.ts` ya lo hace) y marcar `// TODO: confirmar con cliente`.
