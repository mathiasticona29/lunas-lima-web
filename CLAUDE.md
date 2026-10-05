# Proyecto: Landing de gestión de citas para permiso de lunas polarizadas (Lima)

## Negocio
- Servicio PRIVADO de gestión: creamos el usuario y la cita en el sistema de la PNP,
  y orientamos al cliente para el día del trámite.
- La cita es gratuita; cobramos por la gestión. Tasa oficial separada del precio del servicio.
- Toda conversión va a WhatsApp. NO publicar el paso a paso del sistema.

## Contenido
- Español de Perú, tuteo, tono cercano pero serio.
- No inventar cifras legales (porcentajes de oscurecimiento, multas, plazos):
  si hacen falta, usar un marcador [VERIFICAR] y avisarme.
- Nunca prometer que la PNP aprobará el permiso.
- Formularios: casilla de consentimiento de datos personales (Ley 29733).

## Diseño
- Estilo confiable tipo aseguradora: fondo claro, azul marino, acento ámbar en botones.
- Tokens en src/styles/global.css (@theme). Usar siempre los tokens, no colores sueltos.
- DESIGN.md (raíz) es la referencia visual: padding y contenedor de secciones, escala de
  títulos, botones, tarjetas, íconos, radios, sombras, ritmo de fondos y animación al
  hacer scroll. Toda sección nueva debe seguirlo y construirse con Section.astro,
  SectionHeader.astro, Button.astro e Icon.astro; nada de `<h2>` de sección, botones,
  SVG de íconos ni scripts de aparición hechos a mano.
- Tipografías: Lexend (titulares) + Source Sans 3 (cuerpo), autoalojadas.
- Mobile-first. Animaciones sutiles con Motion; respetar prefers-reduced-motion.
- Sin logos, escudos ni colores de la PNP. El verde de WhatsApp (token `--color-whatsapp`,
  hoy `#128c7e`) solo en el botón flotante.

## Secciones
Navbar → Hero con video del auto (texto sobre panel marino semitransparente)
→ Por tu cuenta o con nosotros (comparativa) → Cómo funciona (3 pasos + mockup de
conversación de ejemplo) → Requisitos → Precios → FAQ → CTA final (banda showroom).
Footer (centrado desde md) con aviso "No somos la PNP" y enlace a /privacidad.

## Stack y archivos clave
- Astro + Tailwind + Motion (vanilla JS). Sitio estático.
- src/config.ts: número de WhatsApp y mensaje predeterminado. Todos los CTA lo usan.
- src/components/Navbar.astro: header fijo (logo de texto «Lunas Lima», enlaces a
  #como-funciona, #requisitos, #precios y #faq, botón de WhatsApp y menú móvil).
  Se monta en Layout.astro. Navbar y hero usan `.container-wide` (100rem, gutter de 4rem
  desde 1440px); la columna de texto del hero se alinea con el logo y deja 3rem antes del panel.
- src/components/Hero.astro: hero con video del auto (`[data-car-video]`, archivos en
  public/hero/, póster .webp) y texto sobre un panel marino semitransparente. Por debajo
  de lg mide lo que su contenido (sin alto mínimo) y termina en la línea de precio y aviso;
  la tarjeta «Llega preparado al trámite» solo existe desde lg, flotando abajo a la derecha.
- archive/: el hero anterior con auto 3D (Hero3D.astro, car-viewer.ts, auto.glb, draco/ y
  auto-fallback.webp) y la variante HeroVideoPanel.astro. No se publica ni lo revisa
  `astro check`; `three` ya no está en package.json. Ver archive/README.md (cómo
  restaurarlo y el crédito CC BY que exige el modelo si vuelve a publicarse).
- Componentes compartidos (ver DESIGN.md): Section.astro (fondo `tone`, padding,
  contenedor; `flush` solo para el hero), SectionHeader.astro (antetítulo + título +
  bajada), Button.astro (`variant`, `size`, `whatsapp`) e Icon.astro (íconos de línea;
  los trazos nuevos se añaden a su mapa `paths`).
- src/scripts/reveal.ts (cargado en Layout.astro): aparición al hacer scroll de todo
  `[data-reveal]`; los que entran a la vez se escalonan solos. El texto del hero entra al
  cargar con `data-reveal-load` (CSS puro, para no retrasar el LCP). Layout.astro pone la clase
  `js` en `<html>` antes de pintar; sin JS o con movimiento reducido todo queda visible.
- src/components/Comparativa.astro: sección #por-que (fondo card), pares «Por tu cuenta» /
  «Con nosotros» en filas con líneas, y cierre con CTA de WhatsApp y la nota de la PNP
  debajo. No está en el navbar.
- src/components/ComoFunciona.astro: sección #como-funciona (fondo background, 3 pasos en
  `<ol>` con línea conectora vertical, alineados arriba, y a su lado desde lg el mockup de conversación de
  ejemplo que termina en la «captura» de la cita con barras esqueleto; ver DESIGN.md §6).
  El mockup no lleva datos, nombres ni verde, y siempre va rotulado como ejemplo.
- src/components/Requisitos.astro (#requisitos, card), Precios.astro (#precios, background,
  tarjeta destacada única: un solo botón, último en el DOM, que en móvil cierra la tarjeta
  tras «Incluye» y «No incluye» y desde md la rejilla sube bajo el precio; debajo, la nota
  «Ten en cuenta» con plazo, solo Lima y sin reprogramación), Faq.astro (#faq, card,
  acordeón con `<details>`; orden: dinero, plazo y condiciones primero; una respuesta puede
  ser una lista con `lists`/`closing`, como el resumen del art. 14, que no se reformula) y
  CtaFinal.astro (#contacto, banda `.showroom`).
- CTA: el verbo común es «Pide tu cita» (navbar «Pide cita»; Requisitos conserva «Confirma
  tus requisitos»). Cada CTA lleva su propio mensaje prellenado para saber de dónde viene el
  cliente, también el hero y el flotante; solo el navbar usa el genérico de src/config.ts.
  La tabla de mensajes está en docs/comparativa/RESUMEN.md.
- El hero muestra el precio en su línea de aviso (gestión S/ 30; tasa S/ 71.40 aparte).
- Datos confirmados: gestión S/ 30; tasa oficial S/ 71.40 (Banco de la Nación, código 08362,
  la paga el cliente antes de empezar); citas disponibles a unos 2 a 3 meses. La FAQ resume
  el art. 14 del D.S. 004-2019-IN (quién no puede obtener el permiso).
  Pago por Yape, Plin o transferencia bancaria. Cita, trámite y peritaje son solo en Lima,
  presenciales y con el vehículo. No podemos reprogramar citas: el cliente va a informes en
  el local de la PNP. El váucher se recomienda llevarlo el día del trámite (no es requisito).
- Ya no quedan marcadores [VERIFICAR]; si aparece un dato sin confirmar, se vuelve a usar.
- Anclas: `--navbar-h` (global.css) es el alto real del navbar y `.section-anchor` (lo pone
  Section) lo usa como scroll-margin-top. Desde lg (y 640px de alto) cada sección ocupa como
  mínimo la pantalla bajo el navbar, con el contenido centrado, para que tras el salto no
  asome la siguiente. El contenido de Cómo funciona, Requisitos y Precios cabe con su CTA en
  1440×900 (no en 1366×768); al añadir contenido, comprobarlo con clic en el navbar.
  Comparativa y Precios exceden ese mínimo en unos 21px de padding vacío; botón y nota caben.
- src/pages/privacidad.astro: política de privacidad (Ley 29733), página de texto (ver
  DESIGN.md §2). El footer y la FAQ enlazan a `/privacidad/` (con barra final: Astro la
  publica como privacidad/index.html). Datos confirmados que usa: qué se pide (DNI por ambas
  caras, fecha de emisión, tarjeta de propiedad, correo, celular, váucher y código del
  correo), solo para crear el usuario y la cita; se guardan solo en el chat de WhatsApp; se
  comparten solo con el sistema de citas de la PNP; se eliminan 30 días después de la cita;
  derechos ARCO por WhatsApp (no hay correo); la web no usa cookies ni analítica. Si cambia
  algo de esto, actualizar la página y su fecha. No identifica al titular con razón social,
  RUC ni domicilio: faltan esos datos.
- SectionHeader admite `as="h1"` para el título de una página de texto (escala de sección).
- WhatsAppFloat nace oculto (`data-hidden` en el HTML) y solo se muestra cuando no hay en
  pantalla ni el hero (`main [data-hero]`), ni un `main [data-wa-cta]` (`<Button whatsapp>`
  ya pone ese atributo), ni una sección con `data-wa-float-hide` (Precios). Sin JS no se
  muestra: queda el botón del navbar.
- auto-original.glb y videos-originales/ (videos de stock sin optimizar) están en
  .gitignore; nunca subirlos.

## Forma de trabajo
- Las secciones se construyen con el comando `/seccion <sección y qué hacer>`
  (.claude/commands/seccion.md), que usa los subagentes redactor, revisor-ui y
  revisor-calidad (.claude/agents/).
- Para un rediseño: auditor-ux y revisor-conversion auditan (solo lectura, máx. 8 hallazgos
  cada uno), se aprueba un plan y disenador-visual implementa una mejora por encargo, sin
  hacer commit. Todos comparten un único navegador de Playwright: si corren en paralelo se
  pisan el ancho y el scroll.
- docs/comparativa/: capturas por sección y medidas antes/después del rediseño frente a la
  etiqueta v1-antes-rediseno, RESUMEN.md y capturar.js (se ejecuta con el MCP de
  Playwright). Al medir o capturar: quitar la barra de scroll (`scrollbar-width: none`,
  resta 15px de ancho) y usar scroll instantáneo (la página tiene `scroll-behavior: smooth`).
- Antes de cambios grandes, presenta un plan y espera aprobación.
- Después de cada cambio visual, usa Playwright para abrir http://localhost:4321,
  capturar en 375px, 768px y 1440px, revisar y corregir antes de dar la tarea por terminada.
- Ojo con las capturas: los revisores pueden dejar el navegador de Playwright con
  movimiento reducido emulado (el hero queda con el póster, sin video); restablecerlo antes de capturar.
- Verificación visual: máximo 2 rondas de capturas por tarea. Si algo sigue mal,
  detente y explícame el problema.
- Ejecuta `npx astro check` y `npm run build` al terminar; no entregues con errores.
- Cambios pequeños y enfocados; no toques archivos ajenos a la tarea.
- Al terminar una tarea, actualiza este archivo si cambió algo de lo descrito aquí.

## Desarrollo
- Servidor de desarrollo siempre en segundo plano: `npx astro dev --background`
  (queda en http://localhost:4321). Se gestiona con `npx astro dev status`,
  `npx astro dev logs` y `npx astro dev stop`.
- Documentación de Astro: https://docs.astro.build. Consultar la guía que corresponda
  antes de tocar rutas/páginas, componentes, estilos/Tailwind o contenido.
