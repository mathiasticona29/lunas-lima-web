# Rediseño UX/UI: antes y después

Compara la etiqueta `v1-antes-rediseno` (commit `5d7e3bc`) con la rama `rediseno-agentes`.
Fecha: 2026-10-04.

- Capturas por sección: `antes/<seccion>-<ancho>.png` y `despues/<seccion>-<ancho>.png`
  (hero, por-que, como-funciona, requisitos, precios, faq, contacto y footer, en 375, 768 y
  1440 px).
- Medidas completas: `antes/medidas.json` y `despues/medidas.json`.
- Script: `capturar.js` (se ejecuta con el MCP de Playwright; la constante `FASE` elige la
  carpeta de salida).

## Qué miden estos números

Miden la interfaz: largo de la página, dónde aparece cada dato, cobertura de botones,
contraste, peso. **No miden conversión.** Sin tráfico real no se puede afirmar que la página
convierta más; eso solo lo dirán los mensajes que lleguen por WhatsApp, que ahora se pueden
distinguir por su texto prellenado (ver «Cómo medir la conversión real»).

## Resultado en cifras

| Métrica | Ancho | Antes | Después |
|---|---|---|---|
| Scroll hasta ver el precio (S/ 30) | 375 | ≈ 7,2 pantallas | 1,1 pantallas |
| | 768 | ≈ 4,8 pantallas | 0,9 pantallas |
| | 1440 | ≈ 4,3 pantallas | 0,8 pantallas |
| Plazo, solo Lima y no reprogramación visibles sin abrir la FAQ | todos | No | Sí, bajo la tarjeta de Precios |
| Alto del hero | 375 | 1246 px | 952 px (−24 %) |
| | 768 | 1232 px | 975 px (−21 %) |
| | 1440 | 900 px | 900 px |
| Alto total de la página | 375 | 9077 px (11,2 pantallas) | 8904 px (11,0) |
| | 768 | 7113 px (6,9) | 6953 px (6,8) |
| | 1440 | 6560 px (7,3) | 6602 px (7,3) |
| Pantallas de scroll sin botón de sección (sin contar navbar ni flotante) | 375 | 6 | 4 |
| | 768 | 2 | 2 |
| | 1440 | 2 | 1 |
| Enlaces a WhatsApp | todos | 7 | 8 |
| Etiquetas distintas para la misma acción | todos | 6 | 4 |
| Enlaces con mensaje prellenado genérico | todos | 3 (navbar, hero, flotante) | 1 (navbar) |
| Textos bajo contraste AA | todos | 0 | 0 |
| Desborde horizontal | todos | No | No |
| Lighthouse móvil: rendimiento / accesibilidad / buenas prácticas / SEO | — | 99 / 100 / 100 / 100 | 98 / 100 / 100 / 100 |
| LCP / CLS | — | 1,7 s / 0 | 1,7 s / 0 |
| JS inicial (gzip) | — | 19 117 B | 19 117 B |
| CSS (gzip) | — | 8 176 B | 8 234 B |

Cómo leerlo:

- **Lo que más cambió es dónde aparece la información**, no el largo de la página. El precio
  pasó de la quinta sección al hero, y las tres condiciones que más frenan (cita a 2 o 3
  meses, solo Lima y presencial, no se reprograma) ya no están solo dentro de la FAQ cerrada.
- **La página casi no se acortó** (−2 % en móvil; +42 px en escritorio). El hero perdió casi
  300 px en móvil, pero la Comparativa ganó 76 px por su botón y Precios 46 px por el botón al
  pie y la nota. Acortarla de verdad exigiría recortar contenido, y eso no se aprobó.
- **Lighthouse ya estaba en el techo.** El punto de rendimiento que baja (99 → 98) viene de
  una medida de bloqueo de 120 ms en una sola pasada; el JavaScript es idéntico byte a byte,
  así que es variación entre ejecuciones, no una regresión.
- Las posiciones «antes» del precio están estimadas a partir de las capturas de la línea
  base; las «después» están medidas.

## Qué cambió y por qué

| N.º | Mejora | Por qué (hallazgo) | Commit |
|---|---|---|---|
| 1 | Hero: la línea de aviso da el precio — «Nuestra gestión: S/ 30. Tasa oficial: S/ 71.40, aparte y la pagas tú. No somos la PNP.» | El precio, el argumento más fuerte, no aparecía hasta unas 7 pantallas de scroll en móvil (conversión, crítico; UX, importante). | `9fb0847` |
| 2 | Hero: la tarjeta «Llega preparado al trámite» solo desde `lg`; en móvil y tablet el hero mide lo que su contenido. | Alargaba el hero a pantalla y media y repetía lo que explican las secciones siguientes (UX, importante). | `3f94fc8` |
| 4 | Botón flotante: nace oculto y no aparece mientras el hero está en pantalla. | Pisaba la tarjeta del hero en 1440 y parpadeaba al cargar (ambos, menor). | `4bc76c8` |
| 6 | Precios: en móvil el botón va al final de la tarjeta, tras «Incluye» y «No incluye». | Se pedía escribir antes de ver el alcance: tasa aparte, sin garantía de aprobación (conversión, importante). | `945ae2a` |
| 7 | Precios: nota «Ten en cuenta» con plazo, solo Lima y presencial, y sin reprogramación. | Esas condiciones solo estaban en la FAQ cerrada; quien se entera después de escribir puede abandonar (conversión, importante). | `c55bbac` |
| 9 | Comparativa: cierra con el botón «Pide tu cita con nosotros» y mensaje prellenado propio. | Era el tramo más largo de móvil sin salida a WhatsApp (conversión, importante). | `198cb66` |
| — | Botón flotante: oculto mientras la sección Precios está en pantalla. | Efecto de la mejora 6: en móvil quedaba sobre el borde de la tarjeta. | `aeca998` |
| 8 | FAQ: dinero, plazo y condiciones primero; «¿Quién no puede obtener el permiso?» al final y en viñetas, con el mismo contenido del art. 14. | Las preguntas decisivas estaban al fondo y esa respuesta era un bloque de más de 100 palabras (UX, importante). | `cf9cd27` |
| 10 | Etiquetas unificadas en «Pide tu cita» (navbar: «Pide cita») y mensaje prellenado propio para el hero y el flotante. | Seis nombres para la misma acción; «Agenda» sugería reserva inmediata cuando la cita sale a 2 o 3 meses; tres accesos compartían el mensaje genérico (ambos, importante). | `7743241` |

No se tocó `src/config.ts`: el número es el mismo y todos los mensajes pasan por
`whatsappUrl()`, que los codifica con `encodeURIComponent`. Los datos confirmados (S/ 30,
S/ 71.40, plazo, medios de pago, solo Lima, no reprogramación) aparecen con los mismos
valores.

## Lo que se descartó

| N.º | Propuesta | Estado | Motivo |
|---|---|---|---|
| 3 | Quitar peso al botón «Ver requisitos» del hero | Descartada | Ninguna variante existente de `Button` sirve: `secondary` es marino sobre el panel marino (≈ 2,1:1 en el mejor caso; AA pide 4,5:1). Haría falta una variante de contorno claro en `DESIGN.md`. |
| 13 | Área táctil de 44 px en los enlaces del crédito del footer | Descartada: aplicada y revertida (`a98df5c`, `5fb45ce`) | Van dentro de texto corrido: el padding abría huecos de 24 px entre líneas en móvil (hallazgo importante de `revisor-ui`) y un área invisible solaparía los toques de líneas contiguas. El crédito se retiró después del footer, al archivar el modelo 3D. |
| 5 | Mover el encuadre del video en 1440 | Descartada | Riesgo de descuadrar un video ya renderizado; el auto se ve entero en móvil y tablet. |
| 11 | Reducir los avisos «No somos la PNP» | Descartada | Es la protección legal del servicio. |
| 12 | Página `/privacidad` | Fuera de este rediseño | La hará el dueño con sus datos. **Sigue dando 404** desde el footer y la FAQ. |

## Verificación (Fase 4, una ronda)

- `revisor-calidad`: aprobado, sin críticos ni importantes.
- `revisor-ui`: sin críticos; un importante (interlineado del crédito del footer), resuelto
  revirtiendo la mejora 13. No hizo falta segunda ronda: el footer volvió a ser idéntico a
  la línea base.
- `npx astro check` y `npm run build`: sin errores.

Menores que quedan sin tocar:

- En 1440, la línea de precio del hero parte en «…No / somos la PNP.».
- El flotante conserva su fundido de 200 ms con movimiento reducido.
- En móvil, con la última pregunta de la FAQ abierta, el flotante tapa el final de una línea.
- En la tarjeta de Precios, desde `md`, un lector de pantalla lee precio → listas → botón,
  aunque a la vista el botón está bajo el precio. La tabulación no cambia.
- En 1440×900, tras el salto por ancla, Comparativa y Precios sobresalen 21 px de padding
  vacío; botón y nota quedan en pantalla.
- Cuatro botones comparten el nombre «Pide tu cita por WhatsApp» (no incumple AA).

No se verificó: la página sin JavaScript en un navegador real, un lector de pantalla real,
ni el contraste de la línea de precio sobre fotogramas concretos del video (el peor caso
teórico, blanco puro detrás del panel, da 5,26:1).

## Cierre

- El modelo 3D no se usa en ninguna página (el hero es un video de stock). El hero 3D, su
  visor y sus recursos pasaron a `archive/`, dejan de publicarse (`dist/` baja de 9,7 a
  7,2 MB) y el crédito del modelo salió del footer; queda en `archive/README.md`.
- Las capturas `despues/footer-*.png` ya son sin el crédito. Los altos de página de la tabla
  se midieron antes de quitarlo: el footer es ahora unos 60 px más bajo en móvil.
- `CLAUDE.md` describe ya el hero con video y el verde real de WhatsApp (`#128c7e`).
- `HeroVideoPanel.astro` (variante sin montar) también pasó a `archive/`; se desinstalaron
  `three` y `@types/three`; `DESIGN.md` describe solo el hero de video.

## Cómo medir la conversión real

Cada acceso llega ahora con un texto distinto, así que basta contar los mensajes:

| Origen | Mensaje con el que llega el cliente |
|---|---|
| Navbar | Hola, quiero sacar mi cita para el permiso de lunas polarizadas |
| Hero | Hola, quiero pedir mi cita para el permiso de lunas polarizadas. ¿Qué necesito para empezar? |
| Comparativa | Hola, vi su página y quiero que gestionen mi cita para lunas polarizadas. |
| Cómo funciona | Hola, vi cómo funciona el servicio y quiero empezar con mi cita |
| Requisitos | Hola, quiero confirmar qué requisitos necesito para mi permiso de lunas polarizadas |
| Precios | Hola, quiero contratar la gestión de mi cita. ¿Cómo procedemos? |
| CTA final | Hola, quiero agendar mi cita para lunas polarizadas. ¿Me ayudan? |
| Botón flotante | Hola, estaba viendo su página y tengo una consulta sobre el permiso de lunas polarizadas |
