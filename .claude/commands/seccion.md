---
description: Construye o modifica una sección de la landing siguiendo el flujo completo (textos, plan, implementación, verificación, revisión y build)
argument-hint: <sección y qué hacer, p. ej. "Precios: tarjeta única con CTA a WhatsApp">
---

Trabaja en esta sección de la landing: **$ARGUMENTS**

Sigue este flujo en orden. No te saltes pasos ni los reordenes.

## 1. Contexto
Lee `CLAUDE.md` y `DESIGN.md` completos. Lee también `src/styles/global.css` (tokens de
`@theme`), `src/config.ts` (WhatsApp) y los componentes existentes que la
sección toque o con los que deba convivir.

## 2. Textos
Si la sección necesita textos que no te di (titulares, CTA, pasos, FAQ,
microcopy), pídelos al subagente **redactor** indicándole la sección, su
objetivo y qué piezas necesitas. Si ya te di los textos, úsalos tal cual.
Conserva cualquier marcador `[VERIFICAR]` que devuelva; no lo sustituyas por
cifras.

## 3. Plan y aprobación
Presenta un plan breve: archivos a crear o modificar, estructura de la sección,
textos elegidos, tokens que usarás y animaciones. **Detente y espera mi
aprobación** antes de escribir código.

## 4. Implementación
- Sigue `DESIGN.md`: la sección se arma con `Section`, `SectionHeader`, `Button`
  e `Icon`, con el `tone` que le toca en el ritmo de fondos y la aparición con
  `data-reveal` (sin script propio).
- Usa siempre los tokens de `src/styles/global.css`; ningún color, fuente o
  tamaño suelto.
- Mobile-first. Animaciones sutiles con Motion, respetando
  `prefers-reduced-motion`.
- Todos los CTA usan el número y el mensaje de `src/config.ts`.
- Cambios pequeños y enfocados; no toques archivos ajenos a la sección.

## 5. Verificación visual
Asegúrate de que el servidor está activo (`npx astro dev status`; si no,
`npx astro dev --background`). Con Playwright abre http://localhost:4321,
captura en **375px, 768px y 1440px**, revisa y corrige. **Máximo 2 rondas** de
capturas. Si después de la segunda algo sigue mal, detente y explícame el
problema.

## 6. Revisión
Lanza los subagentes **revisor-ui** y **revisor-calidad** **en paralelo** (en
un mismo mensaje), indicándoles qué sección revisar y qué archivos cambiaste.

## 7. Correcciones
Corrige todos los hallazgos **críticos** e **importantes** de ambos revisores.
Los **menores** no los toques: lístalos en el resumen final. Si no estás de
acuerdo con un hallazgo, no lo apliques y explica por qué.

## 8. Comprobaciones finales
Ejecuta `npx astro check` y `npm run build`. No entregues con errores. Si lo
hecho cambia algo descrito en `CLAUDE.md`, actualízalo.

## 9. Cierre
Entrega:
- Resumen de los cambios, con archivos tocados.
- Hallazgos menores pendientes.
- Marcadores `[VERIFICAR]` que quedaron en el contenido.
- Un mensaje de commit propuesto.

**No hagas commit.**
