# Rendimiento y Lighthouse 100

> Objetivo: las cuatro categorías de Lighthouse (Performance, Accessibility,
> Best Practices, SEO) en verde ~100 en móvil. Este doc lista lo que ya está bien,
> lo que resta puntos hoy y el orden de trabajo. Medir SIEMPRE en producción
> (build + despliegue), nunca en `next dev`.

---

## 1. Base ya correcta (mantener)

- **Imágenes**: `next/image` en todo el sitio, AVIF/WebP (`next.config.ts`),
  `priority` + `sizes="100vw"` en el hero, calidades declaradas (75/90), subida
  re-procesada con sharp a WebP con presets por uso (miniatura vs banner).
- **Fuentes**: `next/font` con `display: swap` y variables CSS (cero layout shift
  por fuentes, sin requests a Google en runtime).
- **Datos**: catálogo cacheado 60 s (`unstable_cache`), lecturas en Server
  Components, `select` de campos concretos.
- **CSS/JS**: Tailwind 4 (purga automática), Server Components por defecto,
  Zustand (ligero) para el carrito.
- **ISR/SSG**: ficha de producto con `generateStaticParams`; home y tienda
  server-rendered con datos cacheados.

---

## 2. Lo que probablemente resta puntos HOY

### 🔴 2.1 El splash de carga (`LoadingSplash`)
`src/app/layout.tsx` monta `<LoadingSplash />` global (commit reciente "loading
screen"). Un splash que cubre la página **retrasa el LCP** (Largest Contentful
Paint): mientras el overlay esté visible, Lighthouse cuenta como LCP el splash o
espera al contenido real tras la animación. Recomendaciones, en orden:
1. **Ideal para Lighthouse**: eliminarlo en la carga inicial y reservarlo solo
   para transiciones internas (si aporta a la marca).
2. Si se mantiene: que NO bloquee el primer render — overlay con `position:fixed`
   que se desvanece en <500 ms, contenido real renderizado debajo desde el
   primer frame, y ocultarlo con CSS puro (animación con `animation-delay`), no
   esperando a JS/hidratación.
3. Nunca condicionarlo a `useEffect` + estado (eso garantiza que el usuario vea
   flash de splash en cada visita con caché caliente).

### 🟠 2.2 LCP del hero
El hero es una imagen a pantalla completa con `quality={90}` (banner 2400px).
- Verificar el peso real servido en móvil: con `sizes="100vw"` y AVIF debería
  quedar <150 KB para el breakpoint móvil. Si no, bajar el preset o la calidad
  a 80–85 (diferencia invisible sobre foto).
- `fetchPriority="high"` viene implícito con `priority` ✅.
- El overlay de gradiente y el texto encima no afectan; el LCP será la imagen.
- Objetivo: LCP < 2.5 s en móvil 4G (medir con PageSpeed Insights).

### 🟠 2.3 Transiciones y animaciones (`template.tsx` + `Reveal`)
- `(shop)/template.tsx` re-monta la página en CADA navegación para animar la
  entrada — coste de hidratación repetido y percepción de lentitud si la
  animación pasa de ~300 ms. Mantenerlo sutil (opacity/translate cortos) o
  migrarlo a la View Transitions API (Next 16 la soporta) que es gratis en main
  thread.
- `Reveal` (IntersectionObserver) está bien; asegurar que el contenido sea
  visible sin JS (progressive enhancement: animar desde `opacity` con CSS y
  clase inicial visible si no hay JS) para no penalizar SEO ni no-JS.

### 🟡 2.4 Skeletons y streaming
- Existe `loading.tsx` solo en `/admin`. Añadir `loading.tsx` con skeletons
  (el componente `ui/skeleton.tsx` ya existe) para `(shop)/tienda` y
  `(shop)/producto/[slug]` — mejora el rendimiento percibido y evita pantallas
  en blanco en navegación con datos fríos.
- Envolver las secciones no críticas de la home (Novedades, Categorías) en
  `<Suspense>` para que el hero haga stream primero.

### 🟡 2.5 JS del cliente
- Cargar con `dynamic()` los componentes pesados que no se ven al inicio:
  `SearchDialog`, `CartSheet`, `SizeGuideSheet` (Radix Sheet/Dialog + contenido)
  solo se necesitan al interactuar.
- Revisar `lucide-react`: importar íconos individuales (ya se hace ✅).
- Ejecutar `ANALYZE=true` con `@next/bundle-analyzer` una vez antes del
  lanzamiento para cazar dependencias infladas.

### 🟡 2.6 CLS (estabilidad visual)
- Toda imagen con `fill` está dentro de contenedores con aspecto fijo — verificar
  las tarjetas de producto (`product-card.tsx`) y la galería.
- La cinta de anuncios: si `enabled` viene de BD, el header salta cuando carga.
  Como se lee en el layout del servidor (✅ ya es SSR), no hay salto — mantenerlo
  así, nunca moverla a cliente.
- Reservar altura para el contenido administrable del hero (título/subvia BD).

---

## 3. Best Practices y HTTPS

- Sin `console.log` en producción (regla del proyecto; hacer barrido antes del
  lanzamiento).
- Todos los headers de seguridad ya presentes suman en Best Practices; la **CSP**
  pendiente (docs/02 §1.2) también puntúa aquí.
- Imágenes de Supabase por HTTPS con `remotePatterns` restringido al bucket ✅.
- Evitar librerías con vulnerabilidades conocidas: `pnpm audit` en CI.

---

## 4. Accesibilidad (categoría Lighthouse)

Los puntos de docs/02 §4 (breadcrumbs `<ol>`, aria-live del carrito, pausa de la
marquesina, contraste del taupe) son exactamente lo que Lighthouse audita:
`color-contrast`, `heading-order`, `aria-*` válidos, nombres accesibles en
botones de ícono. Con eso corregido, Accessibility 100 es alcanzable.

---

## 5. Protocolo de medición

1. `pnpm build && pnpm start` local o, mejor, el despliegue de Vercel.
2. PageSpeed Insights (móvil) para datos de laboratorio + campo.
3. Lighthouse en Chrome DevTools en incógnito (extensiones apagadas).
4. Repetir 3 veces y quedarse con la mediana (varianza normal de ±5 puntos).
5. Tras el lanzamiento: vigilar **Core Web Vitals reales** en Search Console
   (LCP < 2.5 s, INP < 200 ms, CLS < 0.1) — Google usa los datos de campo, no
   los de laboratorio.

## 6. Checklist Lighthouse 100

- [ ] Splash rediseñado o eliminado de la carga inicial (LCP).
- [ ] Hero móvil < 150 KB (AVIF) y LCP < 2.5 s.
- [ ] `loading.tsx` + skeletons en tienda y ficha.
- [ ] `dynamic()` en SearchDialog / CartSheet / SizeGuide.
- [ ] Bundle analizado una vez; sin dependencias sorpresa.
- [ ] CSP activa (sube Best Practices).
- [ ] Accesibilidad de docs/02 §4 corregida.
- [ ] Barrido de `console.log`.
- [ ] Medición en producción documentada (3 corridas, mediana).
