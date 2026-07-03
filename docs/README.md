# Documentación del proyecto — MAGNÉTIC (antes NUE INTIME)

Tienda online de ropa íntima. Monolito modular con Next.js 16 + Prisma 7 +
PostgreSQL (Supabase). Esta carpeta contiene la documentación de auditoría,
estrategia y rebrand generada en julio de 2026 revisando el código real.

## Índice

| Doc | Contenido | Úsalo para |
|---|---|---|
| [01-arquitectura.md](./01-arquitectura.md) | Stack real, estructura, patrones establecidos, qué existe y qué falta, por qué monolito modular (y alternativas evaluadas) | Entender el proyecto antes de tocar nada |
| [02-auditoria-mejoras.md](./02-auditoria-mejoras.md) | Hallazgos de seguridad, fiabilidad, código y accesibilidad con archivo y prioridad (🔴🟠🟡🟢) | Plan de trabajo técnico; el resumen final es el orden de ataque |
| [03-seo-indexacion.md](./03-seo-indexacion.md) | SEO técnico, datos estructurados, GEO (motores de IA), SEM, migración de dominio por el rebrand | Indexación y checklist SEO de lanzamiento |
| [04-rendimiento-lighthouse.md](./04-rendimiento-lighthouse.md) | Qué resta puntos hoy (splash, LCP del hero, skeletons) y protocolo de medición | Llegar a Lighthouse ~100 en móvil |
| [05-pagos-izipay.md](./05-pagos-izipay.md) | Especificación del flujo carrito→pedido→pago: transacciones, stock sin sobreventa, webhook HMAC idempotente, pruebas sandbox | Implementar el checkout y la pasarela (v0.3–v0.4) |
| [06-identidad-magnetic.md](./06-identidad-magnetic.md) | Paleta y tipografías del manual, mapeo a tokens de `globals.css`, contraste, dónde van los assets, propuestas de UI | Ejecutar el rebrand |
| [07-roadmap.md](./07-roadmap.md) | Fases A/B/C post-lanzamiento, dependencias futuras, señales para replantear arquitectura | Planificar después del núcleo de venta |
| [08-implementacion-flujo-venta.md](./08-implementacion-flujo-venta.md) | Plan de desarrollo paso a paso del checkout→pedido→pago: carrito con variantId, migración, `createOrder`, webhook, confirmación, cron, emails, con esqueletos de código | Implementar la venta (v0.3–v0.4); ejecutar en orden 0→10 |
| [09-guia-ux-ui.md](./09-guia-ux-ui.md) | Principios de usabilidad aplicados, sistema de jerarquía/espaciado, patrones obligatorios de tienda y admin, microcopy, checklist de aceptación y anti-patrones | Diseñar/evaluar cualquier pantalla; pedir UI a un modelo con criterios ("cumple docs/09 §7") |

## Dónde va el material visual (logos, íconos, fuentes)

| Material | Carpeta | Notas |
|---|---|---|
| Manual de marca y PNG recibidos de diseño | `docs/brand/` | Material fuente, solo referencia (ya tiene README) |
| Logos y monograma finales para la web | `public/brand/` | Solo **SVG** optimizados (ya tiene README con nombres) |
| Fuentes web `.woff2` (Mazzard con licencia) | `src/fonts/` | Cargadas vía `next/font/local` (ya tiene README) |
| Favicon | `src/app/icon.tsx` | Se genera por código; actualizar al monograma M |
| Íconos de UI | — | Siguen siendo `lucide-react`, no se suben archivos |

## Reglas transversales (no negociables)

1. Dinero en **céntimos enteros** siempre.
2. Precios, stock y totales se validan/recalculan **en el servidor**; lo que envía
   el cliente es informativo.
3. Operaciones de stock + pedido + pago en **una transacción Prisma**.
4. Toda Server Action: Zod → permisos → operación → audit → revalidate →
   `ActionResult`.
5. UI en español, código en inglés, comentarios en español.
6. Nada de infraestructura extra (Redis, colas, microservicios) sin señal real.
