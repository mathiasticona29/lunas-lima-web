# archive/

Código y recursos que ya no se montan en ninguna página. Se conservan por si se retoman;
nada de aquí se publica (queda fuera de `src/` y de `public/`) ni lo revisa `astro check`.

## Hero con auto 3D

- `src/components/Hero3D.astro` y `src/scripts/car-viewer.ts`: hero con visor Three.js
  (oscurecido de lunas al cargar y slider Claras ↔ Oscuras).
- `public/auto.glb` (Draco), `public/draco/` (decoders) y `public/auto-fallback.webp` (póster).

Lo reemplazó el hero con video (`src/components/Hero.astro`).

## Variante del hero con video en panel

- `src/components/HeroVideoPanel.astro`: versión previa del hero con el video dentro de un
  panel. Nunca llegó a montarse junto al hero actual.

Para restaurarlo: devolver cada archivo a su ruta original (la misma, sin `archive/`) y
montar `Hero3D` en `src/pages/index.astro`. Hay que reinstalar las dependencias, que se
quitaron de `package.json`: `npm install three` y `npm install -D @types/three`.

**Licencia:** el modelo es «Generic Sedan Car» de Márcio Meireles (Sketchfab), CC BY 4.0
(https://sketchfab.com/3d-models/generic-sedan-car-58c33766470d46e7b2aed542650494e5).
Si vuelve a publicarse, el crédito debe volver al footer.
