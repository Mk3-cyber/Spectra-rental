# SPECTRA RENTAL — línea base v11

Fecha: 2026-10-04. Rama: `chore/baseline-v11`.
Base de la importación: `0380f5bc9af2b67e3c73eecccb788b092b417122`, coincidente
con `origin/main` después de `git fetch origin`.

## Reconciliación

`EXPORT-MANIFEST.json` permanece intacto: 77 entradas originales, todas presentes.
Se restauraron `.gitignore` y `.openai/hosting.json`, con coincidencia exacta de
sus SHA-256 originales, incluido el project_id y el directorio `dist`.

Resultado: **76 archivos idénticos por SHA-256 y un cambio autorizado,
`verify.cjs`**. No hay archivos originales faltantes. Este documento es adicional
al manifiesto. El README original se comprueba mediante su `export_path`,
`README.original.md`.

No se modificaron HTML, CSS, copy, recursos, dependencias ni código del CRM.
No hubo despliegue, merge, envío de formularios ni escritura en Google.

## Verificación y resultados

- `node crm/test.mjs`: PASS. Tres tipos de cliente, campos condicionales,
  14 casos inválidos, privacidad, atribución, duplicados, reintentos idempotentes,
  fallo de escritura e inyección de fórmulas. Google Sheets, caché y locks simulados.
- `node verify.cjs`: PASS. 14 páginas; navegación, RUC, referencias locales,
  archivos, anchors, srcset y recursos CSS. Usa `URL` para separar pathname,
  query y hash; incluye casos negativos de archivo y anchor inexistentes.
- Iframe CRM en jsdom: PASS. Siete escenarios de selección de servicio,
  atribución sin datos privados de query, handshake, origen/canal/emisor,
  altura acotada, eventos permitidos y configuración deshabilitada/inválida.
  Se ejecutan los scripts locales de las 14 páginas y se comprueba el menú.
- Cliente CRM real ejecutado en jsdom: PASS. Acepta el padre de producción,
  rechaza localhost y otros emisores, y conserva el targetOrigin exacto.
  No se invoca submit ni se cargan recursos remotos.
- Sintaxis: PASS. 13 archivos JavaScript/Apps Script mediante `node --check`,
  seis JSON mediante `JSON.parse`, cinco hojas CSS mediante PostCSS y scripts/
  estilos inline del HTML y plantilla CRM. PostCSS procede del lock de Vite;
  el parseo CSS no certifica compatibilidad visual ni validez de cada propiedad.
- `npm run dev -- --host 127.0.0.1`: PASS. Vite inició; peticiones GET locales a
  los 54 archivos de `dist` y a `cotizar.html?servicio=sonido` devolvieron HTTP 200
  y contenido. No se abrió el iframe remoto.
- `crm/build-install.mjs`: PASS, ejecutado sobre una copia en un directorio
  temporal. `Code.gs` pasó `node --check` por stdin; el JSON generado es válido
  y la plantilla resuelve los marcadores. No se instalaron ni publicaron salidas.
- `git diff --check`: PASS.

El único script npm declarado es `dev`; no existen scripts npm de build, lint o
test. Los generadores `scripts/render-*.mjs` reescriben páginas, por lo que solo
se comprobó su sintaxis. No se regeneró el sitio.

Para repetir las pruebas principales, instalar con `npm ci` y ejecutar
`node crm/test.mjs` y `node verify.cjs` desde la raíz. El verificador también usa
`__dirname` para resolver archivos y necesita permitir subprocesos locales de
Node para la revisión de sintaxis. La comprobación de hashes fija esta línea
base v11: cambios futuros intencionales deberán reconciliarse explícitamente,
sin regenerar silenciosamente el manifiesto histórico.

## Limitaciones conservadas

`crm/client.js` fija el padre autorizado en
`https://spectra-rental.laguna-marioa.chatgpt.site`. Un padre en localhost o
127.0.0.1 no recibe sus mensajes dirigidos a producción y sus mensajes
`spectra:init` son rechazados. Por ello, una vista local no reproduce el
handshake, la precarga, la atribución, la altura y la analítica completos del
iframe real. Se conserva esta restricción y nunca se sustituye por `*`.

Las pruebas usan jsdom, postMessage simulado y almacenamiento en memoria.
No certifican autorización/disponibilidad del despliegue Google, persistencia
real en Sheets ni un envío de extremo a extremo. Tampoco constituyen una
revisión visual en navegador de escritorio, tablet o móvil; esta tarea no
cambia diseño ni layout. No se probaron destinos externos por red.
