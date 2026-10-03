import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

// Shared, build-time components: static HTML remains usable without JavaScript.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const media = {
  hero: ['led-festival.webp', 'Escenario de concierto con grandes pantallas LED, iluminación y público', 1600, 1067],
  indoor: ['led-indoor.webp', 'Escenario interior con pantalla central, columnas LED y cabina de DJ', 1200, 800],
  outdoor: ['led-outdoor.webp', 'Escenario al aire libre con pantalla LED, estructura y público', 1200, 897],
  modular: ['led-modular.webp', 'Vista posterior de módulos LED ensamblados con conexiones de señal y energía', 1200, 900],
  operation: ['led-operation.webp', 'Técnico trabajando con cableado frente a una pantalla LED durante el montaje', 1200, 800],
  custom: ['led-custom.webp', 'Composición de pantallas en forma de arcos integrada en un escenario de concierto', 1200, 1800],
};
const heroCopy = 'Implementamos soluciones profesionales en pantallas LED P2.9 y P3.9 para eventos indoor y outdoor. Diseñamos cada configuración según las dimensiones del espacio, la distancia de visualización y las necesidades de producción, integrando montaje, pruebas, operación técnica y desmontaje en un solo servicio.';
const image = (key, hero = false) => {
  const [file, alt, width, height] = media[key];
  const responsive = hero ? '' : `srcset="assets/reference/${file.replace('.webp', '-640.webp')} 640w, assets/reference/${file} 1200w" sizes="(max-width: 680px) calc(100vw - 32px), (max-width: 1100px) calc((100vw - 64px) / 2), 390px"`;
  return `<img src="assets/reference/${file}" ${responsive} alt="${alt} — imagen referencial" width="${width}" height="${height}" ${hero ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}>`;
};
const figure = key => `<figure class="led-photo">${image(key)}<figcaption>Imagen referencial</figcaption></figure>`;
const hero = `<section class="led-hero" aria-labelledby="led-title">
  <div class="led-hero-photo">${image('hero', true)}</div>
  <div class="container led-hero-inner">
    <p class="eyebrow">Alquiler de pantallas LED · Lima Metropolitana</p>
    <h1 id="led-title">Tu evento merece<br><span class="gradient-text">verse a gran escala.</span></h1>
    <p class="led-hero-copy">${heroCopy}</p>
    <div class="hero-actions"><a class="btn btn--primary" href="cotizar.html">Cotizar pantalla LED <span aria-hidden="true">→</span></a><a class="btn btn--ghost" href="proyectos.html">Ver galería</a></div>
    <div class="led-hero-meta"><span>P2.9 / P3.9</span><span>Indoor / Outdoor</span><span>Atención previa coordinación</span></div>
  </div><span class="led-hero-caption">Imagen referencial</span>
</section>`;
const capabilitiesData = [
  ['indoor', 'Indoor', 'Pantallas LED de alta definición para conferencias, lanzamientos, congresos, ceremonias y producciones corporativas en espacios interiores.'],
  ['outdoor', 'Outdoor', 'Soluciones LED para exteriores diseñadas para producciones de alto impacto, con configuraciones definidas según estructura, energía disponible y condiciones del entorno.'],
  ['modular', 'Modular', 'Configuraciones escalables que permiten adaptar dimensiones, proporciones y formatos de pantalla a las características de cada escenario y producción.'],
  ['operation', 'Operación técnica', 'Coordinamos con proveedores especializados el montaje, las pruebas, la operación durante el evento y el desmontaje final.'],
];
const capabilities = `<section class="led-capabilities led-section" aria-labelledby="capabilities-title"><div class="container">
  <div class="led-heading led-heading--compact"><p class="eyebrow">La configuración correcta. La ejecución coordinada.</p><h2 id="capabilities-title">Un servicio que se adapta<br>a tu producción.</h2></div>
  <div class="led-capabilities-grid">${capabilitiesData.map(([key, title, copy]) => `<article class="led-card">${figure(key)}<div class="led-card-content"><h3>${title}</h3><p>${copy}</p></div></article>`).join('\n')}</div>
</div></section>`;
const solutionsData = [
  ['indoor', 'indoor', 'LED Indoor', 'Soluciones LED de alta definición para conferencias, convenciones, lanzamientos, ceremonias y eventos desarrollados en espacios interiores.'],
  ['outdoor', 'outdoor', 'LED Outdoor', 'Pantallas LED para escenarios y producciones al aire libre, configuradas según las dimensiones del montaje, estructura disponible y condiciones del entorno.'],
  ['custom', 'modulares', 'Configuración a medida', 'Diseñamos composiciones modulares adaptadas al espacio, al formato del contenido y al concepto visual de cada producción.'],
];
const solutions = `<section class="led-solutions led-section" aria-labelledby="solutions-title"><div class="container">
  <div class="led-heading"><p class="eyebrow">Soluciones LED</p><h2 id="solutions-title">Pantallas P2.9 y P3.9<br>para cada <span class="gradient-text">escenario.</span></h2><p>Seleccionamos la configuración LED según el tipo de evento, las dimensiones del montaje y la distancia de visualización. Cada propuesta se diseña para obtener una imagen definida, una integración limpia con el escenario y una experiencia visual acorde a la producción.</p></div>
  <div class="led-solutions-grid">${solutionsData.map(([key, id, title, copy]) => `<article class="led-card led-solution" id="${id}">${figure(key)}<div class="led-card-content"><h3>${title}</h3><p>${copy}</p></div></article>`).join('\n')}</div>
  <p class="led-reference-note">Imágenes referenciales: no representan proyectos ejecutados por Spectra Rental ni acreditan el pixel pitch de los equipos mostrados. La configuración P2.9 o P3.9 se define en cada propuesta.</p>
</div></section>`;
const steps = [
  ['Evaluación', 'Revisamos el espacio, dimensiones, ubicación y requerimientos técnicos del evento.'],
  ['Configuración', 'Definimos formato, cantidad de módulos, estructura y distribución de señal.'],
  ['Montaje y pruebas', 'Instalamos, configuramos y verificamos funcionamiento antes de iniciar la producción.'],
  ['Operación y desmontaje', 'Brindamos soporte técnico durante el evento y retiramos el sistema al finalizar.'],
];
const process = `<section class="led-process led-section" id="como-trabajamos" aria-labelledby="process-title"><div class="container">
  <div class="led-heading"><p class="eyebrow">Cómo trabajamos</p><h2 id="process-title">Del montaje al último<br>minuto del evento.</h2><p>Cada proyecto sigue un proceso técnico definido para asegurar una instalación estable, una correcta visualización y acompañamiento durante la producción.</p></div>
  <ol class="led-process-grid">${steps.map(([title, copy], i) => `<li><span class="led-step-number" aria-hidden="true">0${i + 1}</span><h3>${title}</h3><p>${copy}</p></li>`).join('\n')}</ol>
  <div class="led-service-note"><p><strong>Gestión comercial y coordinación técnica.</strong> Spectra Rental planifica el servicio y coordina su ejecución mediante proveedores especializados.</p><p>El servicio estándar incluye transporte en Lima Metropolitana, estructura según evaluación, montaje, pruebas, operador técnico y desmontaje.</p><p>Tras la evaluación y cotización, la reserva se confirma mediante contrato y 50 % de adelanto. El 50 % restante se abona antes de la ejecución del evento.</p></div>
</div></section>`;
const finalCTA = `<section class="led-final-cta led-section" aria-labelledby="led-cta-title"><div class="container"><div class="led-cta-panel">
  <p class="eyebrow">Tu próximo evento empieza aquí</p><h2 id="led-cta-title">Cuéntanos qué tienes en mente.<br><span class="gradient-text">Nosotros definimos la solución LED.</span></h2>
  <p>Indícanos el tipo de evento, ubicación, fecha y dimensiones aproximadas del montaje. Nuestro equipo preparará una propuesta acorde a tus necesidades técnicas y visuales.</p>
  <div class="hero-actions"><a class="btn btn--primary" href="cotizar.html">Solicitar cotización</a><a class="btn btn--ghost" href="https://wa.me/51920384374?text=Hola%2C%20quisiera%20asesor%C3%ADa%20para%20una%20soluci%C3%B3n%20LED%20para%20mi%20evento." target="_blank" rel="noopener">Hablar con un asesor</a></div>
</div></div></section>`;

// The Home has its own editorial composition in render-av.mjs.
for (const file of ['pantallas-led.html']) {
  const path = resolve(root, 'dist', file);
  let html = readFileSync(path, 'utf8');
  const start = html.indexOf('<main id="contenido">');
  const end = html.indexOf('</main>', start);
  if (start < 0 || end < 0) throw new Error(`Missing main: ${file}`);
  let remainder = '';
  if (file === 'index.html') {
    // Preserve the reference gallery; Monumental and corporate content stay on internal pages.
    const original = html.slice(start, end);
    const marker = '<section class="section section--panel">\n      <div class="container">\n        <div class="section-head section-head--split reveal"><div><p class="eyebrow">Inspiración para tu evento</p>';
    const markerAt = original.indexOf(marker);
    if (markerAt < 0) throw new Error('Home preserved-content marker missing');
    remainder = original.slice(markerAt).replace(/<section class="section">\s*<div class="container cta-panel reveal">[\s\S]*?<\/section>/, '').replace(/<section class="led-final-cta[\s\S]*?<\/section>/g, '');
    remainder = remainder.replace(/<section\b[^>]*>[\s\S]*?<\/section>/g, section =>
      section.includes('<h2>Minutos en el Monumental.</h2>') || /^<section\b[^>]*\bid="nosotros"/.test(section) ? '' : section);
    // Remove misleading generic imagery from the corporate reference feature.
    remainder = remainder.replace('assets/reference/ref-2.webp', 'assets/reference/led-indoor.webp').replace('Salón de eventos con escenario y pantalla — imagen referencial', 'Pantalla LED en un escenario interior — imagen referencial');
    remainder = remainder.replace('Un espacio de referencia para presentaciones, encuentros empresariales y contenido audiovisual.', 'La imagen, el contenido y el escenario deben trabajar juntos. Explora aplicaciones de referencia para orientar la propuesta de tu evento.');
    remainder = remainder.replace('Imagen y escenario en <span class="gradient-text">entorno corporativo.</span>', 'Pantallas integradas al <span class="gradient-text">concepto del evento.</span>').replace('Aplicación corporativa · Referencia', 'Producción en interiores · Referencia');
    // Subsequent runs preserve only these established sections, not earlier generated CTAs.
    remainder = remainder.trim();
  }
  const closingCTA = file === 'index.html' ? '' : finalCTA;
  html = html.slice(0, start) + `<main id="contenido">\n${hero}\n${capabilities}\n${solutions}\n${process}\n${remainder}\n${closingCTA}\n</main>` + html.slice(end + 7);
  if (!html.includes('css/led-experience.css')) html = html.replace('</head>', '  <link rel="stylesheet" href="css/led-experience.css">\n</head>');
  html = html.replace(/<title>.*?<\/title>/, `<title>${file === 'index.html' ? 'Alquiler de pantallas LED P2.9 y P3.9 en Lima' : 'Pantallas LED para eventos indoor y outdoor'} | SPECTRA RENTAL</title>`);
  html = html.replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="Alquiler de pantallas LED P2.9 y P3.9 en Lima. Soluciones indoor, outdoor y a medida con montaje, pruebas, operación técnica y desmontaje. Cotiza tu evento.">');
  writeFileSync(path, html);
}
