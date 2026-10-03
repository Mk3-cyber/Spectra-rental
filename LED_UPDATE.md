# Actualización de la experiencia LED · 28 septiembre 2026

Alcance: bloques de soluciones LED de Inicio y página pantallas-led.html. Se conservan URL, logo, navegación, identidad de Mentora, formularios, WhatsApp y Monumental. No se añaden tarifas, seguimiento ni datos comerciales no verificados.

## Componentes

`scripts/render-led.mjs` genera HTML estático compartido: hero, capacidades, soluciones, proceso y cierre comercial. Se ejecuta con `node scripts/render-led.mjs`. Conserva las secciones de galería referencial, Monumental y Nosotros de Inicio y los encabezados y pies existentes. `dist/css/led-experience.css` limita los cambios de presentación a estas páginas. No requiere JavaScript para mostrar los componentes nuevos.

## Criterios editoriales y visuales

- P2.9 / P3.9 como oferta comercial; ninguna fotografía acredita esas especificaciones.
- Fotografías de internet diferentes para indoor, outdoor, módulos, técnico y composición a medida; fuentes y licencias en `dist/assets/reference/sources.txt`.
- Se preserva el contexto de proveedores especializados y no se atribuye a Spectra personal, equipos, clientes o proyectos fotografiados.
- Se sustituyen los CTA de tarjetas por dos puntos principales de conversión hacia el cotizador existente.
- El proceso técnico de cuatro etapas reemplaza el bloque repetitivo de Inicio, conservando el ancla `#como-trabajamos` y las condiciones de reserva mediante contrato, evaluación, cotización y pagos 50/50.
- Base negra #000000; tokens corporativos azul #007BFF y morado #7B2EFF, con tonos claros para texto legible y tono azul oscuro para contraste del botón. Tipografías existentes Montserrat/Poppins.
- Columnas 4/3 en escritorio, 2 en tablet y 1 en móvil; imágenes dimensionadas, WebP con variantes 640/1200, carga diferida salvo hero, foco visible y movimiento reducido.
- Los textos íntegros solicitados pueden ocupar más de tres líneas en tarjetas estrechas: se prioriza lectura a 16px y no se truncan ni ocultan.

## Verificación y limitaciones

Comprobaciones estáticas: archivos e imágenes, enlaces y anclas locales, títulos, un H1, IDs únicos, eliminación de “Conocer solución”, identidad corporativa y conservación de formularios. Las imágenes se inspeccionaron visualmente antes de integrarlas.

No se puede certificar una revisión renderizada en navegador en este entorno: el sitio HTML estático no dispone de un servidor compatible con la vista previa supervisada. Se revisan reglas responsive para 320, 375, 768, 1024 y 1440 px, pero esto no sustituye una comprobación visual de esos tamaños. Queda pendiente esa verificación real en escritorio y teléfono.
