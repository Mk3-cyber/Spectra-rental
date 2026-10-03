# Actualización audiovisual — 2026-10-01

Inicio presenta la oferta general con una composición editorial propia. Pantallas LED conserva el detalle técnico P2.9/P3.9 y sus imágenes específicas. Sonido, Iluminación y Soluciones audiovisuales tienen páginas, relatos, composiciones e imágenes diferentes. Publicidad LED conserva su página y formulario independientes. Los tres bloques retirados previamente del Home siguen ausentes.

El menú Servicios agrupa las cuatro especialidades. Contacto orienta cada consulta: formularios existentes para LED y Monumental; consultas contextuales por WhatsApp para los nuevos servicios. No se añadió almacenamiento, seguimiento, precios ni correo ficticio. La galería conserva su carácter referencial y la estructura de futuros proyectos autorizados.

## Generación

Desde la raíz del proyecto:

```sh
node scripts/render-led.mjs
node scripts/render-av.mjs
```

render-led genera solamente pantallas-led.html; render-av genera las páginas audiovisuales y actualiza navegación y ajustes de páginas existentes. Esta secuencia sustituye las instrucciones anteriores que regeneraban Inicio desde la plantilla LED.

Las nuevas fotos y sus variantes optimizadas están en dist/assets/audiovisual. sources.txt registra autores, páginas de origen y licencia Pexels. No son proyectos de Spectra Rental. No se usaron fotografías antiguas del usuario.

## Verificación

Comprobados 14 documentos: un H1 por página, IDs únicos, títulos y metadescripciones únicos, recursos locales y enlaces con anclas existentes, imágenes diferentes entre las seis páginas comerciales principales y render-av idempotente. Comparación contra la versión anterior confirma que los dos formularios se conservan sin cambios. JavaScript pasa revisión sintáctica. Los mensajes nuevos de WhatsApp incluyen servicio e identidad corporativa.

La adaptación usa puntos de cambio de 980 y 700 px. No se completó inspección visual real en navegador para 320, 375, 768, 1024 y 1440 px: pendiente de validación en dispositivos o una sesión de preview compatible.

## Pendientes

Confirmar equipos y alcance concreto de sonido e iluminación antes de publicar especificaciones o capacidades; no se declaran marcas, potencia ni stock. Se mantienen los documentos legales preliminares y sus datos pendientes. Dominio definitivo, contacto legal para datos personales y condiciones legales completas siguen pendientes. Mantener acceso privado hasta autorización expresa.
