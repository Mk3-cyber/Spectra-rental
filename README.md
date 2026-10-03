# SPECTRA RENTAL — exportación fiel del proyecto actual

Exportación del código original de la versión 11 de Sites, confirmada el 3 de octubre de 2026.
Commit de origen: `99900b00156f99589e0e0c42ee26e55141238dfc`.
Sitio actual: https://spectra-rental.laguna-marioa.chatgpt.site

No se ha reconstruido, optimizado ni publicado el sitio. Los 77 archivos originales se incluyen sin cambios; el README anterior se conserva íntegro como `README.original.md`. Este README y el manifiesto de hashes son documentación de exportación.

## 1. Tecnología y estructura

Sitio estático multipágina: HTML, CSS y JavaScript nativo. No utiliza React, Next.js ni componentes de esos frameworks. `dist/` contiene el código editable y los recursos que se sirven en producción, no un bundle que requiera recuperar fuentes.

- `dist/*.html`: 14 páginas, contenido y metadatos SEO.
- `dist/css/`, `dist/js/`: estilos, navegación, formularios y puente del CRM.
- `dist/assets/`: imágenes, logo, favicon, recursos y referencias de licencias.
- `crm/`: fuentes Google Apps Script, formulario, validación, esquema de columnas, instalador y pruebas.
- `scripts/`: generadores históricos de secciones; NO ejecutarlos para reproducir la versión actual porque pueden sobrescribir páginas con contenido anterior.
- `package.json`, `package-lock.json`, `vite.config.mjs`: herramientas de desarrollo originales.
- `.openai/hosting.json`: identificación del sitio y directorio estático en Sites, sin credenciales.
- Otros Markdown y captura QA: documentación original, que puede describir estados anteriores. El código actual es la referencia operativa.

## 2. Instalar dependencias

Instala Node.js 22.12 o posterior compatible con Vite 7 y npm. En la raíz:

```sh
npm ci
```

Se conserva el lockfile original. No se incluyen `node_modules`; npm los reproduce. `vite` sirve el proyecto y `jsdom` se utiliza en las comprobaciones locales.

## 3. Ejecutar localmente

```sh
npm run dev -- --host 127.0.0.1
```

Abre la dirección localhost que muestra Vite (normalmente http://localhost:5173). No abras el HTML mediante `file://`: el formulario usa APIs que necesitan un contexto seguro, disponible en localhost o HTTPS.

Alternativa sin Node, para páginas con extensión explícita:

```sh
python -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Abre http://localhost:8000/index.html. Este servidor básico no resuelve automáticamente URLs sin `.html`.

## 4. Producción y rutas

La versión de producción YA ES `dist/`. No hay script `build` en el proyecto original ni es necesario compilar. Publica el contenido íntegro de `dist/` en un alojamiento estático HTTPS. No ejecutes `vite build` como sustituto: no existe una configuración de compilación multipágina preparada para esa operación.

Conserva todos los archivos y configura el alojamiento para resolver `/nombre` hacia `/nombre.html`, además de `/` hacia `/index.html`, sin reescribir todas las rutas a Inicio. Las páginas son: inicio, pantallas-led, eventos, proyectos, cotizar, publicidad-led, nosotros, contacto, sonido, iluminacion, soluciones-audiovisuales, politica-privacidad, terminos-condiciones y aviso-legal.

Para GitHub: descomprime y sube toda esta carpeta a un repositorio. GitHub almacena el código; GitHub Pages u otro proveedor es una decisión posterior. Esta exportación no crea repositorios ni despliegues. Un sitio Pages bajo un subdirectorio y los enlaces absolutos requieren revisión antes de migrar; no se han modificado aquí.

## 5. Variables de entorno y configuración

No se han identificado variables de entorno requeridas por el código actual ni archivos `.env` versionados. La configuración existente se conserva en los archivos:

- `dist/js/crm-config.js`: URL pública de la implementación Apps Script, no una clave secreta.
- `crm/build-install.mjs`: ID de la hoja existente, no una credencial. El acceso real requiere autorización Google.
- `crm/client.js`: origen permitido para comunicación del iframe y enlaces existentes.
- `.openai/hosting.json`: metadatos de Sites.

## 6. Formularios y dependencias externas

El flujo actual registra un lead en Google Sheets mediante Google Apps Script y devuelve un ID antes de mostrar WhatsApp. El formulario funciona en infraestructura Google, no como backend Node. Se conserva el endpoint real existente: probar envíos puede escribir en el CRM real.

Las fuentes de Apps Script están completas en `crm/`. Para generar su archivo instalable cuando se decida migrar esa implementación:

```sh
node crm/build-install.mjs
```

Genera `crm/Code.gs` y una vista de revisión. `Code.gs` se instala en Google Apps Script con el manifiesto `crm/appsscript.json`, se autoriza con la cuenta que tiene acceso a la hoja y se despliega como aplicación web. No hace falta ejecutarlo ni volver a desplegar para abrir esta copia del sitio. La vista de revisión no guarda datos y su aviso de autorización pendiente es propio de esa vista.

El CRM existente tiene pestañas `LEADS`, `CONFIGURACIÓN`, `PIPELINE` y `DASHBOARD`. El backend espera exactamente los encabezados de `crm/schema.json` y lee el responsable de `CONFIGURACIÓN!B19`. La hoja remota, sus fórmulas y permisos no son archivos del repositorio y no se incluyen en este ZIP.

IMPORTANTE para otro dominio: `crm/client.js` restringe `postMessage` al origen actual de Spectra en ChatGPT. En localhost u otro dominio, la atribución, preselección de servicio y ajuste automático de altura NO están garantizados con la configuración intacta. La migración requerirá actualizar ese origen y volver a desplegar Apps Script; también revisar enlaces absolutos al sitio actual. Se documenta sin modificar el comportamiento original solicitado.

Se mantienen las referencias externas de Google Fonts (Montserrat/Poppins), Google Apps Script y WhatsApp. Requieren conexión y disponibilidad del proveedor. Las fotos y gráficos locales sí están incluidos. Los créditos disponibles permanecen en los archivos `sources.txt`; no se han sustituido imágenes ni descargado versiones diferentes.

## 7. Infraestructura no exportable y exclusiones

- El dominio `chatgpt.site`, el alojamiento de Sites y la barrera de acceso privado pertenecen a ChatGPT. Copiar el código NO copia esa protección; se deberá configurar acceso privado en el nuevo alojamiento antes de publicar si se desea conservarlo.
- Las autorizaciones OAuth, la sesión de Google, los permisos de la hoja y la implementación remota de Apps Script permanecen en las cuentas originales. Se incluyen sus fuentes disponibles, no credenciales ni una exportación de la cuenta.
- Los datos comerciales del CRM, paneles remotos y el historial de envíos no forman parte del código web y no se exportan.
- No se incluye `.git`, historial del repositorio, tokens, credenciales temporales, cachés ni dependencias instaladas. Se incluyen todos los archivos versionados del commit indicado.
- Los binarios de las fuentes servidas externamente no se incluyen: se conservan sus referencias originales.

La exportación no cambia el acceso, la URL ni la publicación actual. La verificación funcional previa comprobó tres tipos de envío en Apps Script; la revisión visual del formulario incrustado en todos los dispositivos seguía pendiente. Este ZIP no corrige ni oculta esa limitación.

## Integridad

`EXPORT-MANIFEST.json` contiene SHA-256 de todos los archivos originales y su ruta dentro del ZIP. Únicamente el README original cambia de nombre; sus bytes se conservan. El manifiesto permite verificar que HTML, CSS, JavaScript, recursos y configuración coinciden con la fuente original.
