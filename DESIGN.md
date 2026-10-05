# DESIGN.md — Sistema visual de la landing

Reglas para que todas las secciones se sientan parte del mismo sistema. Los valores
viven como tokens en `src/styles/global.css` (`@theme`); aquí se dice cuál usar y cuándo.
Si una sección necesita algo que no está aquí, primero se añade la regla y después se usa.

## 1. Componentes obligatorios

| Componente | Uso |
|---|---|
| `Section.astro` | Envoltorio de toda sección: fondo, padding vertical, contenedor y salto por ancla (`.section-anchor`). |
| `SectionHeader.astro` | Antetítulo + título + bajada. No se escriben `<h2>` de sección a mano. |
| `Button.astro` | Todo enlace con forma de botón. No se usan las clases `.btn-*` directamente. |
| `Icon.astro` | Todo ícono de línea. Los trazos nuevos se añaden a su mapa `paths`. |

```astro
<Section id="precios" tone="card" aria-labelledby="precios-titulo">
	<SectionHeader eyebrow="Precios" title="…" lead="…" titleId="precios-titulo" />
	<div class="mt-10">…</div>
	<div data-reveal class="mt-10 flex flex-col items-start gap-3 md:items-center">
		<Button href={whatsappUrl('…')} whatsapp class="w-full sm:w-auto">…</Button>
	</div>
</Section>
```

## 2. Sección: padding, contenedor y ritmo interno

- **Padding vertical:** `py-section` (4rem) y `lg:py-section-lg` (5rem). Lo pone `Section`;
  no se añade padding vertical extra a la sección.
- **Salto por ancla:** `--navbar-h` (global.css) es el alto real del navbar fijo: 4rem + 1px
  de borde, 5rem + 1px desde `lg`. `.section-anchor` (lo pone `Section`) lo usa como
  `scroll-margin-top`: tras el salto, el borde superior de la sección queda pegado al navbar.
  Si cambia el alto del navbar, se actualiza `--navbar-h`.
- **Sección a pantalla completa:** desde `lg` y con al menos 640px de alto, cada sección mide
  como mínimo `100svh - var(--navbar-h)` y centra su contenido en vertical (flex en columna),
  para que tras el salto no asome la sección siguiente. En móvil y tablet las secciones
  miden lo que su contenido. El contenido de Cómo funciona, Requisitos y Precios debe caber,
  con su CTA, en 1440×900.
- **Contenedor:** `container-page` (70rem; gutter 1.25rem, 2rem desde `md`). Es el de todas
  las secciones y del footer. El ancho `wide` (100rem; gutter 4rem desde 1440px)
  es solo del navbar y del hero, que arma su propia columna con ese ancho.
- **Ritmo interno:** cabecera → contenido → CTA separados por `mt-10`.
  Dentro de un bloque: `gap-8` entre columnas o ítems, `gap-3` entre un botón y su nota.
- **Alineación:** en móvil todo a la izquierda. Desde `md`, cabecera, CTA de cierre y
  footer van centrados. Única excepción: en «Cómo funciona», desde `lg`, el CTA cierra la
  columna de los pasos (alineado a la izquierda), y ese bloque se alinea arriba con el
  mockup. Como el contenedor de las secciones es más angosto que el del
  navbar, una cabecera alineada a la izquierda en escritorio se ve desfasada del logo.
- **Ancho de lectura:** párrafos sueltos con `max-w-2xl` como máximo; texto dentro de
  columnas con `max-w-xs`.
- `flush` (sin padding ni contenedor) es solo para el hero.
- **Página de texto** (`/privacidad`): una sola `Section` `background` dentro de un envoltorio
  con `pt-(--navbar-h)`, que deja libre el navbar fijo (en la portada lo resuelve el hero).
  El contenido va en un `<article>` `max-w-2xl` centrado, con todo el texto a la izquierda
  también en escritorio. Cabecera con `SectionHeader as="h1" align="left"`; debajo, la fecha
  de actualización como nota (`small`, `muted-foreground`, con `<time>`). Cada apartado es
  un `<section data-reveal>` separado con `mt-10`: subtítulo `<h2>` en la escala de H3,
  párrafos y listas con `mt-3`, viñetas nativas como en el acordeón (§6). Texto en
  `foreground`; `<strong>` en `primary` 600. Un solo CTA, dentro del apartado al que sirve.

## 3. Ritmo de fondos

Las secciones alternan `background` y `card`. El hero y el CTA final son las únicas
superficies oscuras: el hero es un video sobre `primary-deep` y el CTA final usa la clase
`.showroom` (marino con luz cenital).

Hero (`Hero.astro`, `flush`): el video del auto va a sangre bajo el navbar, con su primer
cuadro como póster (`<picture>`; es lo único que se ve con movimiento reducido, sin JS o si
el video falla). El texto va en un panel `primary-deep` al 72 % para leerse sobre cualquier
cuadro; dentro de él el foco es `on-primary` y la acción de apoyo usa el botón `dark`.
En móvil y tablet el video ocupa el ancho en 3:2, se funde con el marino y el texto sigue
debajo; el hero mide lo que su contenido. Desde `lg` el video llena el hero, que ocupa toda
la primera pantalla (`min-height: max(40rem, 100svh)`), con el texto a la izquierda,
alineado con el logo, y la tarjeta flotante abajo a la derecha (§6).

| Sección | `tone` | Contenido |
|---|---|---|
| Hero | video sobre `primary-deep` | Video del auto, panel de texto y tarjeta flotante desde `lg` |
| Por tu cuenta o con nosotros | `card` | Filas comparativas separadas con líneas |
| Cómo funciona | `background` | Pasos + mockup de conversación |
| Requisitos | `card` | Dos listas separadas con una línea |
| Precios | `background` | Tarjeta destacada única |
| FAQ | `card` | Acordeón con líneas |
| CTA final | `primary` + `.showroom` | Cabecera `onDark` y botón ámbar |
| Footer | `muted` (no usa `Section`) | |

- El orden está pensado para que todo lo que es tarjeta o mockup caiga sobre `background`
  y las secciones `card` se resuelvan con líneas (ver §6). Si se añade o se mueve una
  sección, hay que conservar esa correspondencia.

- El tono `card` trae su `border-y` de 1px (`border`); así cada frontera entre dos tonos
  claros tiene exactamente una línea. Los demás tonos no llevan borde.
- Sobre `primary` el texto va en `on-primary` (`SectionHeader` con `onDark`; bajada y
  notas en `on-primary/80`) y el botón sigue siendo ámbar. Sin tarjetas.
- `muted` como fondo de sección está reservado al footer; dentro de las secciones se usa
  para superficies pequeñas (marcadores de ícono, hover del botón secundario).

## 4. Escala de títulos

| Pieza | Móvil | Escritorio | Estilo |
|---|---|---|---|
| Antetítulo (`.eyebrow`) | `small` 0.875rem | igual | Source Sans 600, mayúsculas, tracking 0.025em, `primary-soft` |
| H1 (solo hero) | `h1` 2.125rem | `h1-lg` 3.25rem desde `xl`; `h1-xl` 3.75rem desde `2xl` (`h2-lg` si la pantalla es baja) | Lexend 700, `text-balance` |
| H2 de sección | `h2` 1.625rem | `h2-lg` 2.25rem desde `lg` | Lexend 700, `text-balance` |
| H1 de página de texto | igual que el H2 de sección | igual | `SectionHeader as="h1"`: cambia la etiqueta, no la escala |
| Subtítulo de página de texto (`<h2>`) | `h3` 1.25rem | `h3-lg` 1.375rem desde `lg` | Lexend 600 |
| H3 (ítem, tarjeta, paso) | `h3` 1.25rem | `h3-lg` 1.375rem desde `lg` | Lexend 600 |
| Bajada | `body` 1.0625rem | `body-lg` 1.125rem desde `lg` | `muted-foreground`, `max-w-2xl` |
| Bajada del hero | `body` | `body-lg`; `lead` 1.25rem desde `2xl` | `muted-foreground`, `max-w-lg` (`max-w-xl` desde `2xl`) |
| Nota o aviso | `small` | igual | `muted-foreground` |
| Precio (tarjeta de precios) | `h1` | igual | Lexend 700, `whitespace-nowrap` |
| Rótulo de lista dentro de un bloque (`<h4>`) | `.eyebrow` | igual | «Incluye» en `primary-soft`; «No incluye» en `muted-foreground` |
| Pregunta del acordeón (texto del `<summary>`, sin encabezado) | `body` | `h3` desde `lg` | Lexend 600 |

- Separaciones: antetítulo → título `mt-3`; H2 → bajada `mt-3` (H1 → bajada `mt-4`);
  H3 → texto `mt-1`.
- Un solo H1 por página. Cada sección tiene un H2 y lo enlaza con `aria-labelledby`.
- El antetítulo nombra la sección en 1 a 3 palabras; el H2 dice el beneficio.

## 5. Botones

Siempre con `Button.astro`.

| Variante | Aspecto | Uso |
|---|---|---|
| `primary` | Fondo `accent`, texto `on-accent`; hover `accent-hover` | La acción principal. Una por bloque visible. |
| `secondary` | Borde 1px `primary`, texto `primary`; hover fondo `muted` | Acción de apoyo junto a un primario (anclas internas). |
| `dark` | Borde 1px `on-primary`, fondo `card`, texto `primary`; hover fondo `muted` | La acción de apoyo cuando va sobre un fondo oscuro (video del hero). |

- Tamaño `md`: alto mínimo 3rem, padding 0.75rem × 1.5rem, Lexend 600. `sm` (2.75rem,
  0.5rem × 1rem) solo en el navbar.
- Radio `rounded-button`. Al presionar, escala 0.98; transición de 180 ms `ease-out-soft`.
- `whatsapp`: añade el ícono, abre en pestaña nueva, avisa a lectores de pantalla y pone
  `data-wa-cta` (oculta el botón flotante mientras el CTA está en pantalla). La URL sale
  siempre de `whatsappUrl()` en `src/config.ts`.
- Botón flotante (`WhatsAppFloat.astro`): nace oculto desde el HTML (`data-hidden`) y el
  script lo muestra solo cuando no hay en pantalla ni el hero (`main [data-hero]`), ni un
  `main [data-wa-cta]`, ni una sección marcada con `data-wa-float-hide`. Hoy la lleva
  Precios: su botón cierra la tarjeta en móvil y, hasta llegar a él, el flotante pisaba el
  borde de la tarjeta. Oculto no recibe foco ni clics (`visibility: hidden`). Sin JS no
  se muestra: el botón de WhatsApp del navbar fijo sigue disponible.
- En móvil el CTA de cierre de sección ocupa todo el ancho (`w-full sm:w-auto`).
- Dos botones juntos: `gap-3`, primario primero. El verde de WhatsApp es solo del botón
  flotante; los CTA de las secciones son ámbar.

## 6. Tarjetas

- Clase `.card`: fondo `card`, borde 1px `border`, `rounded-card`, `shadow-card`,
  padding 1.5rem.
- `.card-featured` (borde `primary`) solo para la tarjeta destacada de precios.
- Las tarjetas van sobre fondo `background` o sobre el panel marino. En una sección
  `card` el contenido no se mete en tarjetas: se separa con espacio o con líneas `border`.
- La tarjeta flotante del hero («Llega preparado al trámite») existe solo desde `lg`,
  sobre el video, abajo a la derecha. En móvil y tablet no se muestra (`hidden lg:block`):
  ahí el hero mide lo que su contenido, sin alto mínimo, y termina tras la línea de aviso.
- Sin tarjetas dentro de tarjetas. Sin hover de elevación en tarjetas que no son clicables.
- Dentro de una tarjeta de dos columnas (precios), las columnas se separan con una línea
  `border` (`border-t` en móvil, `border-l` desde `md`), no con otra tarjeta.
- El CTA de esa tarjeta es un solo botón y va al final en el DOM. En móvil cierra la
  tarjeta, después de «Incluye» y «No incluye» y separado con `border-t` + `pt-6`: primero
  se ve el alcance y después se pide escribir. Desde `md` la rejilla lo sube a la columna
  izquierda, bajo el precio y los medios de pago, sin línea.

### Mockup de conversación (solo en «Cómo funciona»)

Muestra el producto real: una conversación corta que termina en la captura de la cita.

- Marco `.mockup`: fondo `muted`, borde `border`, `rounded-card`, padding 1rem, sin sombra,
  `max-w-md`. Va en un `<figure>`; no es una `.card`.
- Siempre rotulado: arriba «Conversación» y la insignia «Ejemplo ilustrativo»
  (`rounded-full`, fondo `card`, borde, `small` 600 en `foreground`); abajo, la nota «No es
  una conversación real ni un documento oficial…». El texto habla de cita «agendada», nunca
  de un resultado del permiso.
- Burbujas `.bubble`: mensajes de una línea (dos como mucho), padding 0.5rem × 0.875rem,
  `gap-2` entre ellas, ancho máximo 85 %, `rounded-card` con la esquina de la cola en 0.25rem.
  `.bubble-in` (nosotros): fondo `card` con borde, a la izquierda. `.bubble-out` (cliente):
  fondo `primary`, texto `on-primary`, a la derecha. Cada una lleva su emisor en `sr-only`.
- Sin verde, avatares, horas, ticks ni nombres de personas: no debe parecer un testimonio ni
  imitar la interfaz de WhatsApp.
- La captura de la cita es una burbuja más, con etiquetas (`small`) y barras esqueleto
  `bg-muted` en lugar de datos: nada de fechas, sedes ni códigos, ni parecido con el
  sistema oficial.
- No se anima el «tipeo»; las burbujas entran con `data-reveal` como cualquier ítem.

### Listas y acordeón

- Lista de verificación: `<ul role="list">` con `gap-3`; cada ítem `flex gap-3` con ícono
  `check` (`sm`, `primary-soft`, `mt-0.5`). Lo que no aplica o no incluye usa `minus` y
  texto `muted-foreground`; nunca rojo.
- Fila comparativa: par «Por tu cuenta» (`muted-foreground`, `minus`) / «Con nosotros»
  (`primary` 600, `check`), dos columnas desde `md` y apilado en móvil con su rótulo
  `.eyebrow`; filas separadas con `border-t`.
- Acordeón: `<details>` nativo, sin JS ni tarjeta. Filas con `border-t`, `<summary>` de
  alto mínimo 3.5rem con ícono `chevron-down` que gira 180° (180 ms, sin giro animado con
  movimiento reducido). Respuesta en `muted-foreground`, `max-w-2xl`. Ancho `max-w-3xl`.
- Enumeración dentro de una respuesta del acordeón (supuestos o condiciones, no beneficios):
  `<ul>` con viñetas nativas (`list-disc`, `pl-5`, `gap-1`), sin íconos, en el mismo
  `muted-foreground` de la respuesta. Cada lista va tras su frase de entrada (`mt-2`); los
  bloques de la respuesta (lista con su entrada, frase de cierre) se separan con `gap-4`.
  No lleva `role="list"`, tarjeta, rojo ni `check`: no es una lista de verificación.

## 7. Íconos

Siempre con `Icon.astro`: de línea, grilla de 24, sin relleno, puntas y uniones redondas.

| `size` | Medida | Trazo | Uso |
|---|---|---|---|
| `xs` | 16px | 2 | Dentro de texto `small` (pistas, notas) |
| `sm` | 24px | 1.75 | Controles e íconos en línea con texto |
| `md` | 28px | 1.75 | Dentro de un marcador circular |
| `lg` | 32px | 1.75 | Ícono destacado sin marcador (señales de confianza) |

- Color: `text-primary-soft` para íconos de contenido; `currentColor` en controles.
- Marcador: círculo `size-14`, fondo `muted`, ícono `md`. Número de paso: círculo `size-6`
  `primary` con texto `on-primary`, montado arriba a la derecha.
- Los íconos decorativos llevan `aria-hidden` (lo pone el componente). Sin emojis.
- El ícono de WhatsApp (`WhatsAppIcon.astro`) es el único relleno.

## 8. Radios y sombras

| Token | Valor | Uso |
|---|---|---|
| `rounded-button` | 0.75rem | Botones y controles |
| `rounded-card` | 1rem | Tarjetas, marco del mockup y burbujas |
| `rounded-panel` | 1.5rem | Paneles grandes a sangre (hoy sin uso) |
| `rounded-full` | — | Marcadores, insignias, botón flotante |

- Una sola sombra: `shadow-card`. La llevan las tarjetas y el botón flotante; nada más.
  Los botones no tienen sombra. No se añaden sombras nuevas sin crear antes el token.

## 9. Animación al hacer scroll

Un solo patrón, a cargo de `src/scripts/reveal.ts` (cargado en `Layout.astro`).

- Se marca con `data-reveal` cada bloque que entra: las líneas de la cabecera (las marca
  `SectionHeader`), cada ítem de una lista o grilla y el bloque del CTA.
- Movimiento: opacidad 0 → 1 y desplazamiento de 16px hacia arriba, 0,5 s, `ease-out-soft`.
- Se dispara una sola vez, cuando el 30 % del elemento está en pantalla. Los elementos que
  entran a la vez se escalonan 80 ms en orden de documento; no hay que configurar retrasos.
- Sin JS o con `prefers-reduced-motion`, todo queda visible desde el inicio.
- Excepción, solo el hero: entra al cargar con `data-reveal-load` y `--reveal-i` (posición
  en el escalonado), en CSS puro y con el mismo movimiento, para que el H1 pinte sin
  esperar al JS. Lo que está bajo el pliegue usa siempre `data-reveal`.
- No se escribe un script de aparición por sección ni se anima `width`, `height` o
  `margin`. Sin parallax ni animaciones en bucle; la única excepción es el video del hero,
  que no se carga con movimiento reducido.
- Transiciones de estado (hover, foco, presión): 180–200 ms `ease-out-soft`.

## 10. Color y accesibilidad

- Solo tokens de `@theme`; ningún color, tamaño o radio suelto en los componentes.
- Texto normal sobre fondo claro: `foreground` o `muted-foreground`. Títulos en `primary`.
- Ámbar (`accent`) solo en botones primarios y en el subrayado de los enlaces del navbar.
- El foco visible es global (anillo de 3px `ring`); no se quita ni se redefine. Sobre
  `.showroom` el anillo pasa a `on-primary`, porque el marino no contrasta con el fondo.
- Área táctil mínima de 44 × 44px y al menos 8px entre controles.

## 11. Verificación

Capturar en 375, 768 y 1440px. El hero, además, en 1920px: desde `lg` ocupa toda la
primera pantalla, sin tope de alto, y la sección siguiente no debe asomar.
Revisarlo también en 1280×720: con menos de 52rem de alto (variante `tall:`) el hero
usa título y espaciado compactos para que el texto no quede bajo el pliegue.
