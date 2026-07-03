# Guía de UX/UI — conceptos y reglas para desarrollar la página

> Manual de criterio para diseñar y evaluar CUALQUIER pantalla del proyecto
> (tienda y panel admin). Sirve para dos cosas: (a) construir bien a la primera,
> y (b) tener vocabulario y checklist para pedir cambios cuando algo "no
> convence" — en vez de "no me gusta", poder decir QUÉ regla se rompió.
>
> Complementa `docs/06-identidad-magnetic.md` (colores/tipografías). Aquí va la
> estructura, jerarquía y comportamiento.

---

## 1. Principios universales (aplican a toda pantalla)

Son las 10 heurísticas clásicas de usabilidad (Nielsen), aterrizadas a esta tienda:

| # | Principio | Qué significa AQUÍ |
|---|---|---|
| 1 | **Visibilidad del estado** | El usuario siempre sabe qué pasa: spinner en botones al procesar, toast al guardar, contador del carrito actualizado al instante, "guardando…/guardado" en el admin |
| 2 | **Lenguaje del usuario** | "Talla", "Agregar al carrito", "Finalizar compra" — nunca jerga técnica ("SKU inválido", "error 500", "payload") de cara al cliente |
| 3 | **Control y libertad** | Toda acción tiene salida: cerrar el sheet con Esc/click fuera, quitar filtros con un clic, editar el carrito desde el checkout, deshacer donde sea barato |
| 4 | **Consistencia** | Un mismo problema se resuelve SIEMPRE con el mismo patrón (ver §4 y §5). Si el admin edita productos con tabs, las categorías no se editan con otro invento |
| 5 | **Prevenir errores** | Deshabilitar "Pagar" hasta que el formulario valide; pedir talla antes de permitir "Agregar"; confirmación SOLO para acciones destructivas |
| 6 | **Reconocer > recordar** | Filtros activos visibles como chips; resumen del pedido visible durante todo el checkout; en el admin, el nombre del producto que estás editando siempre en pantalla |
| 7 | **Eficiencia** | Lo frecuente a un clic (buscar, carrito); lo raro puede estar a dos. En admin: acciones por fila en tablas, no entrar al detalle para todo |
| 8 | **Minimalismo real** | Cada elemento debe ganarse su lugar. Si quitarlo no rompe nada, sobra. El estilo MAGNÉTIC es editorial: pocas cosas, bien puestas, con aire |
| 9 | **Errores con salida** | Mensaje humano + qué hacer: "No queda stock en talla M. Elige otra talla o te avisamos cuando vuelva." Nunca el error crudo |
| 10 | **Ayuda contextual** | Guía de tallas junto al selector de tallas (ya existe ✅), hint de formato junto al campo, no en un manual aparte |

**Regla de oro transversal:** cada pantalla tiene UNA tarea principal. Todo lo
demás se subordina visualmente a ella. Si no puedes decir en una frase cuál es la
tarea principal de la pantalla, la pantalla está mal planteada.

---

## 2. Sistema visual: jerarquía, espaciado, ritmo

La causa #1 de "no me convence cómo está organizado" casi siempre es jerarquía o
espaciado inconsistente. Reglas concretas:

### Jerarquía (el ojo debe saber por dónde entrar)
- **Un solo nivel dominante por pantalla**: un `h1`/título de página, claramente
  mayor que todo lo demás. Después h2 de sección, después cuerpo. Nunca dos
  elementos compitiendo por ser "lo más importante".
- Jerarquía se logra con **tamaño + peso + color + espacio**, en ese orden de
  preferencia. Antes de poner algo en negrita+grande+color, prueba solo con espacio.
- Texto secundario SIEMPRE con el token `muted-foreground`, nunca inventando grises.

### Espaciado (escala fija, sin valores arbitrarios)
- Usar solo la escala Tailwind: 1, 2, 3, 4, 6, 8, 10, 12, 16, 20… Nada de `mt-[13px]`.
- **La proximidad agrupa**: elementos relacionados van más juntos entre sí que con
  el resto. Un label pegado a su input (gap-1.5/2), separado del siguiente campo
  (gap-5/6). Si todo tiene el mismo gap, nada está agrupado.
- Espaciado entre secciones de página: generoso y constante (`py-20/28` en tienda,
  `space-y-8/10` en admin). El aire ES el estilo de la marca.
- **Alineación**: todo se alinea a algo. Una sola retícula por pantalla
  (contenedor `max-w-7xl` en tienda, `max-w-*` según densidad en admin); nada
  flotando a medio camino.

### Ritmo y densidad
- Tienda = densidad baja (respirar, editorial). Admin = densidad media (trabajar
  rápido) — pero NUNCA denso al punto de perder los agrupamientos.
- Radio de borde consistente: el proyecto usa `rounded-full` para botones/pills y
  radios suaves para tarjetas — no mezclar esquinas duras y píldoras en el mismo bloque.

---

## 3. Feedback e interacción (lo que hace que se sienta "pro")

- **Todo lo clicable reacciona**: hover (cambio sutil), active (scale 0.96 — ya es
  convención del proyecto), focus visible (anillo). Sin excepción.
- **Toda acción asíncrona tiene 3 estados**: normal → procesando (spinner en el
  botón, deshabilitado) → resultado (éxito o error visible). Prohibido el clic
  que "no hace nada" durante 2 segundos.
- **Optimistic UI en el carrito**: sumar/restar cantidad se refleja al instante
  (ya es así al ser cliente ✅); las operaciones de servidor muestran su estado.
- **Toasts** para confirmaciones que no cambian de página ("Producto guardado",
  "Añadido al carrito") — añadir `sonner` (roadmap). Los toasts NO son para
  errores de formulario: esos van junto al campo.
- **Skeletons, no spinners de página completa**: el layout aparece al instante
  con placeholders de la forma real del contenido (ya hay `Skeleton` ✅,
  faltan `loading.tsx` de tienda/ficha — docs/04).
- Animaciones: 150–300 ms, easing suave, y SIEMPRE respetando
  `prefers-reduced-motion` (convención ya establecida ✅). La animación comunica
  (aparecer, confirmar), no decora porque sí.

---

## 4. Patrones de la TIENDA (cliente)

### Catálogo (/tienda)
- La tarea es **encontrar y comparar**. Todo lo demás (filtros, orden, densidad)
  son herramientas subordinadas.
- Filtros: visibles los aplicados (chips con quitar — ya existe ✅), conteo de
  resultados siempre visible, botón "limpiar todo".
- Tarjeta de producto: imagen manda (ratio fijo → sin saltos), nombre, precio,
  y UNA acción primaria. Si el producto tiene tallas, el botón lleva a la ficha
  (no se puede añadir a ciegas — ver docs/08 paso 0).
- Estado vacío con salida: "No encontramos resultados para X — prueba quitar
  filtros" + botón que los quita.

### Ficha de producto
- Orden de lectura F: galería izquierda, columna de decisión derecha:
  nombre → precio → color → talla → cantidad → CTA → confianza (envío/cambios)
  → detalles expandibles. El CTA visible sin scroll en desktop y móvil.
- Selección de variante obligatoria ANTES del CTA, con error inline y scroll al
  selector si falta (ya implementado ✅ — mantener este patrón).
- Precio tachado (compareAt) junto al vigente; ahorro explícito si aporta.
- Confianza cerca del CTA: mini-iconos de envío/cambio/pago seguro.

### Carrito (sheet) y checkout
- El carrito muestra SIEMPRE: línea con imagen+variante+precio, subtotal, y
  aclaración de lo pendiente ("envío se calcula en el checkout").
- Checkout = **mínima fricción**: una sola página, campos imprescindibles,
  autocompletar habilitado (`autocomplete="email"`, `tel`, `name`…), errores
  inline al perder foco (onTouched ya configurado ✅), resumen del pedido fijo
  y editable.
- Nunca sorpresas de precio al final: si habrá envío/IGV, anunciarlo desde el
  carrito (los flags `shippingPending/taxPending` existen para eso ✅).
- Tras pagar: página de confirmación con número de pedido, resumen y qué sigue
  ("te llegará un correo…").

### Móvil primero (la mayoría del tráfico de moda es móvil)
- Targets táctiles ≥ 44px, CTA de ficha como barra fija inferior si el contenido
  es largo, sheets desde abajo, imágenes swipeables en galería.

---

## 5. Patrones del ADMIN (aquí está el descontento actual — reglas estrictas)

El admin no es "otra página bonita": es una **herramienta de trabajo**. Optimiza
velocidad y certeza, con la sobriedad de la marca. Anatomía obligatoria:

### 5.1 Anatomía de TODA página de admin (sin excepciones)

```
┌─────────────────────────────────────────────────┐
│ Título (h1) + descripción corta   [Acción ⊕]    │ ← AdminPageHeader (ya existe)
├─────────────────────────────────────────────────┤
│ Barra de herramientas: buscar | filtros | orden  │ ← solo si es listado
├─────────────────────────────────────────────────┤
│ Contenido: tabla O formulario en tarjetas        │
├─────────────────────────────────────────────────┤
│ Paginación / acciones al pie                     │
└─────────────────────────────────────────────────┘
```

- **La acción primaria de la página vive arriba a la derecha** ("Nuevo producto")
  y es la ÚNICA con botón sólido. El resto: outline o ghost.
- Una página = una entidad. Nada de mezclar productos y categorías en una vista.

### 5.2 Listados (tablas)
- Columnas: lo que identifica (imagen mini + nombre) → lo que decide (estado,
  stock, precio) → lo que ordena (fecha) → acciones. Máx 6–7 columnas; el resto
  vive en el detalle.
- Estados como **badges de color con texto** (no solo color: accesibilidad):
  activo/inactivo, pendiente/pagado/enviado con la paleta semántica.
- Números alineados a la derecha, con `tabular-nums` (precio, stock).
- Fila entera clicable → detalle; acciones secundarias en menú "⋯" por fila.
- Estado vacío ≠ tabla vacía: ilustración/ícono + "Aún no hay productos" + CTA
  "Crear el primero".
- Stock bajo/agotado: señal visual en el listado (el admin debe VERLO sin entrar).

### 5.3 Formularios (crear/editar)
- **Agrupar por significado en tarjetas con título**: "Información básica",
  "Precio", "Variantes y stock", "Imágenes", "Visibilidad". Nunca 20 campos en
  una columna plana.
- Una columna de campos (los formularios multi-columna se leen peor); ancho
  máximo de lectura (~640px) aunque la página sea ancha; a la derecha puede ir
  una tarjeta de resumen/estado (patrón editor + sidebar).
- Guardar: botón fijo/visible siempre (sticky abajo o en el header), estado
  procesando, toast al confirmar, y quedarse en la página (no expulsar al listado
  salvo en "crear").
- Cambios sin guardar: avisar antes de salir (confirm) — evita pérdidas.
- Lo destructivo (desactivar, borrar imagen) SIEMPRE con confirmación que nombra
  el objeto: "¿Desactivar 'Body Ivy'?" — y en rojo solo eso.

### 5.4 Navegación del panel
- Sidebar con secciones en orden de frecuencia de uso: Pedidos, Productos,
  Categorías, Apariencia, (futuro: Cupones, Envíos, Reclamos, Usuarios).
- Ítem activo evidente; breadcrumb en páginas de detalle
  (Productos / Body Ivy / Editar).
- El dashboard (/admin) responde en 5 segundos la pregunta "¿cómo va el negocio
  hoy?": pedidos nuevos, por enviar, stock bajo, ventas de la semana. No es
  decoración: es la página más vista.

### 5.5 Tono del admin
- Sobrio, denso-medio, sin animaciones de tienda (nada de reveals editoriales);
  transiciones mínimas de 150 ms. La marca aparece en el logo y ya.
- Todo en español, directo: "Guardar", "Desactivar", "Ver pedido".

---

## 6. Microcopy (los textos son UI)

- Botones = verbo + objeto: "Agregar al carrito", "Guardar cambios", "Crear
  producto". Nunca "OK", "Sí", "Enviar".
- Errores = qué pasó + qué hacer, en humano: "No pudimos procesar el pago.
  Revisa los datos de tu tarjeta o intenta con otra." 
- Vacíos = estado + invitación: "Tu carrito está vacío — descubre la colección".
- Confirmaciones destructivas nombran el objeto y la consecuencia.
- Tono de marca: cercano, seguro, sin diminutivos ni exceso de "!". Coherente
  con "Intimacy with attitude": directo y elegante.
- Formatos Perú: `S/ 1,234.56`, fechas "12 jul 2026", teléfono con espacio.

---

## 7. Checklist de aceptación de UI

Pegar esto (o referirlo: "cumple docs/09 §7") al pedir cualquier pantalla a un
modelo o al revisarla tú. Si algo falla, ese es el feedback concreto:

**Estructura**
- [ ] ¿Cuál es LA tarea de esta pantalla? ¿Es lo más prominente?
- [ ] ¿Un solo h1 y jerarquía clara de tamaños (no dos cosas gritando)?
- [ ] ¿Los grupos se ven como grupos (proximidad) y todo alineado a la retícula?
- [ ] ¿Espaciado solo de la escala (sin píxeles mágicos)?
- [ ] ¿Sigue la anatomía estándar (§5.1 admin / §4 tienda)?

**Comportamiento**
- [ ] ¿Estados hover/active/focus/disabled en todo lo interactivo?
- [ ] ¿Loading (skeleton/spinner), éxito (toast/mensaje) y error (inline) cubiertos?
- [ ] ¿Estado vacío diseñado que GUÍA a la siguiente acción (§9.1)?
- [ ] ¿Al completar la tarea, la UI propone qué sigue (§9.2)?
- [ ] ¿El usuario sabe dónde está (título, nav activa, breadcrumb — §9.3)?
- [ ] ¿Funciona con teclado y `prefers-reduced-motion`?
- [ ] ¿Responsive real (320px → desktop) sin scroll horizontal?

**Contenido**
- [ ] ¿Textos en español humano (botones verbo+objeto, errores con salida)?
- [ ] ¿Tokens del tema (nunca hex sueltos) y contraste 4.5:1?
- [ ] ¿Consistente con el patrón ya usado para el mismo problema en otra página?

**Código**
- [ ] ¿Server Component salvo interactividad real? ¿Componente <150 líneas?
- [ ] ¿aria-labels en botones de ícono, labels en inputs, alt en imágenes?

---

## 8. Anti-patrones (si aparece uno, rechazar de plano)

- Dos botones primarios sólidos compitiendo en la misma vista.
- Modal sobre modal; o modal para algo que cabía inline.
- Confirmación para acciones triviales (fatiga → la gente confirma sin leer la
  importante).
- Tabla con 10+ columnas "por si acaso".
- Formulario plano de 20 campos sin agrupar.
- Texto gris claro sobre fondo claro "porque se ve fino" (contraste).
- Spinner de página completa donde iba un skeleton.
- Deshabilitar un botón sin explicar por qué (mejor: habilitado + error claro,
  o tooltip del motivo).
- Animar todo (la animación pierde significado).
- Inventar un layout nuevo para un problema que ya tiene patrón en el proyecto.

---

## 9. Guiamiento del usuario (la interfaz siempre propone el siguiente paso)

Concepto central: **la interfaz nunca deja al usuario en un callejón sin salida
ni frente a una pantalla muda**. En cada estado posible, responde tres preguntas:
¿dónde estoy?, ¿qué puedo hacer aquí?, ¿qué me conviene hacer ahora?

### 9.1 Estados vacíos = oportunidades de guía (no pantallas en blanco)

Todo listado/sección tiene un estado "no hay nada" diseñado con: qué significa +
qué hacer + botón que lo hace. Mapa completo para este proyecto:

| Dónde | Mensaje | Acción guiada |
|---|---|---|
| Admin: productos vacío | "Aún no tienes productos" | **"Crear tu primer producto"** → /admin/productos/nuevo |
| Admin: producto sin variantes | "Este producto no tiene tallas ni stock — no se puede comprar" | "Agregar variante" (dentro del tab) |
| Admin: producto sin imágenes | "Sin fotos no aparece bien en la tienda" | "Subir imágenes" |
| Admin: categorías vacío | "Crea categorías para organizar la tienda" | "Nueva categoría" |
| Admin: pedidos vacío | "Cuando llegue tu primera venta aparecerá aquí" | enlace "Ver la tienda como cliente" |
| Tienda: búsqueda sin resultados | "Nada para «X»" | sugerencias + "quitar filtros" + productos populares |
| Tienda: carrito vacío | "Tu carrito está vacío" | "Descubrir la colección" → /tienda |
| Tienda: categoría sin stock | "Pronto habrá novedades aquí" | link a otras categorías |
| Checkout sin items | redirigir suave al carrito/tienda, nunca formulario vacío | — |

Regla: si el vacío es por PRIMERA vez (onboarding), el tono invita ("crea tu
primer…"); si es por filtros/búsqueda, el tono orienta a ajustar.

### 9.2 Siguiente mejor acción (next best action)

Al completar una tarea, proponer la que naturalmente sigue:

- Admin crea producto → al guardar, llevar al tab de **variantes** ("ahora define
  tallas y stock"), luego sugerir **imágenes**. Un producto sin variante+foto está
  incompleto y la UI debe decirlo (badge "incompleto" en el listado).
- Admin marca pedido "pagado" → sugerir "marcar enviado" cuando corresponda.
- Cliente añade al carrito → toast con "Ver carrito" (sin sacarlo de la página).
- Cliente paga → confirmación con "qué sigue" (correo, plazo de entrega) y
  "seguir comprando".
- Dashboard del admin como guía permanente: tarjetas de PENDIENTES accionables
  ("3 pedidos por enviar →", "2 productos sin stock →"), no solo números.

### 9.3 Orientación (wayfinding): dónde estoy y de dónde vengo

- Título de página siempre (h1) + ítem activo del menú resaltado + breadcrumb en
  detalles (Productos / Body Ivy). El usuario nunca deduce dónde está por el
  contenido.
- Botón "volver" explícito en flujos profundos (editar → volver al listado
  conservando filtros/página del listado, no reseteándolo).
- El logo siempre lleva al inicio (tienda) o al dashboard (admin).

### 9.4 Divulgación progresiva (progressive disclosure)

Mostrar lo esencial; lo avanzado existe pero no estorba:

- Formulario de producto: campos clave visibles; "composición", "badge",
  "compareAt" pueden ir en grupo colapsable "Más detalles".
- Ficha de producto: descripción/composición/cuidados en acordeones (patrón ya
  usado ✅).
- Filtros de tienda: los importantes abiertos, el resto colapsado.
- Nunca esconder la acción PRIMARIA detrás de un disclosure.

### 9.5 Defaults inteligentes y formatos tolerantes

- Todo campo que pueda tener un valor por defecto razonable, lo tiene: producto
  nuevo `activo=sí`, posición al final, cantidad=1, método de envío más común
  preseleccionado.
- Inputs tolerantes: aceptar teléfono con o sin espacios/guiones (el schema ya
  lo hace ✅), email con mayúsculas (normalizar en servidor), cupones con
  espacios alrededor. La máquina se adapta al humano, no al revés.
- Recordar elecciones: densidad de vista del catálogo, filtros en la URL (ya es
  así ✅ — patrón a conservar: **el estado de la UI vive en la URL** cuando sea
  compartible/volvible).

### 9.6 Progreso visible en tareas largas

- Si un flujo tiene pasos, mostrar dónde está el usuario (checkout de un paso no
  lo necesita; si crece a 2–3 pasos, stepper obligatorio).
- Subidas de imágenes: progreso por archivo, no congelar el botón.
- Onboarding del admin (primera vez): checklist en el dashboard — "1. Crea una
  categoría ✓ 2. Crea un producto 3. Sube tu portada 4. Configura la cinta" —
  se oculta al completarse. (Efecto Zeigarnik: lo incompleto motiva a terminar.)

---

## 10. Leyes de UX de bolsillo (para decidir con criterio, no por gusto)

| Ley | Qué dice | Aplicación concreta aquí |
|---|---|---|
| **Hick** | Más opciones = decisión más lenta | Menos botones por vista; UNA acción primaria; el header de la tienda minimal (ya es la línea de la marca ✅) |
| **Fitts** | Lo importante: grande y cerca | CTA de ficha grande y a mano del pulgar en móvil; acciones de fila cerca de la fila; targets ≥44px |
| **Jakob** | La gente espera lo que ya conoce | Carrito arriba a la derecha, buscador visible, checkout como todos los checkouts. Innovar en la estética, NO en la mecánica de compra |
| **Miller / chunking** | La memoria maneja pocos grupos | Formularios en grupos de 3–5 campos; specs del producto en bloques |
| **Von Restorff** | Lo distinto destaca | Por eso solo UN botón sólido por vista — si todo destaca, nada destaca |
| **Posición serial** | Se recuerda lo primero y lo último | Lo importante al inicio y al final de listas/menús; lo secundario al medio |
| **Peak-end** | Se recuerda el pico y el final | La página de confirmación de compra y el email son EL recuerdo de la tienda: cuidarlos tanto como la home |
| **Zeigarnik** | Lo incompleto genera tensión útil | Checklists de onboarding, badge "producto incompleto", barra "te faltan S/ 30 para envío gratis" (futuro) |
| **Estética-usabilidad** | Lo bello se percibe más usable | El pulido visual (docs/06) no es vanidad: compra confianza — crítico al pedir datos de pago |
| **Tesler** | La complejidad no desaparece, se reubica | La complejidad (variantes, stock, IGV) la absorbe el sistema/admin, JAMÁS el cliente en el checkout |
