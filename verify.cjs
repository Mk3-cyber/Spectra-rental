const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const { JSDOM, VirtualConsole } = require('jsdom');
const postcss = require('postcss'); // Available through the locked Vite dependency.

const root = __dirname;
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const origin = 'https://spectra-rental.laguna-marioa.chatgpt.site';
const pages = fs.readdirSync(path.join(root, 'dist')).filter(n => n.endsWith('.html'));
const documents = new Map();
function documentFor(file) {
  if (!documents.has(file)) documents.set(file, new JSDOM(read('dist/' + file)));
  return documents.get(file).window.document;
}

// Resolve like a browser: only pathname identifies a physical file.
function localReference(value, from) {
  const url = new URL(value, new URL(from, origin + '/'));
  if (url.origin !== origin) return null;
  let file = decodeURIComponent(url.pathname).replace(/^\/+/, '');
  if (!file || file.endsWith('/')) file += 'index.html';
  const absolute = path.resolve(root, 'dist', file);
  assert(absolute.startsWith(path.join(root, 'dist') + path.sep), 'Reference outside dist: ' + value);
  return { file, absolute, query: url.searchParams, hash: decodeURIComponent(url.hash.slice(1)) };
}
function checkReference(value, from) {
  if (!value) return;
  const ref = localReference(value, from);
  if (!ref) return;
  assert(fs.existsSync(ref.absolute) && fs.statSync(ref.absolute).isFile(), from + ' missing ' + value);
  if (ref.hash && ref.file.endsWith('.html')) {
    const doc = documentFor(ref.file);
    assert(doc.getElementById(ref.hash) || [...doc.querySelectorAll('a[name]')].some(a => a.name === ref.hash), from + ' missing anchor ' + value);
  }
}
for (const value of ['cotizar.html?servicio=sonido#quote-form', '?servicio=sonido#quote-form', '/cotizar.html?servicio=sonido#quote%2Dform']) {
  const ref = localReference(value, 'cotizar.html');
  assert.equal(ref.file, 'cotizar.html');
  assert.equal(ref.query.get('servicio'), 'sonido');
  assert.equal(ref.hash, 'quote-form');
  checkReference(value, 'cotizar.html');
}
checkReference('#quote-form', 'cotizar.html');
checkReference('styles.css?v=11', 'css/monumental.css');
assert.equal(localReference('//example.invalid/file', 'index.html'), null);
assert.equal(localReference('tel:+51920384374', 'index.html'), null);
assert.throws(() => checkReference('missing.html?servicio=sonido', 'index.html'), /missing/);
assert.throws(() => checkReference('cotizar.html?servicio=sonido#missing-anchor', 'index.html'), /missing anchor/);

function checkCSS(css, file) {
  const ast = postcss.parse(css, { from: file });
  ast.walkDecls(decl => {
    for (const match of decl.value.matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g)) checkReference(match[1], file.replace(/^dist\//, ''));
  });
  ast.walkAtRules('import', rule => {
    const match = rule.params.match(/^(?:url\(\s*)?['"]?([^'"\s)]+)/);
    if (match) checkReference(match[1], file.replace(/^dist\//, ''));
  });
}
for (const file of pages) {
  const doc = documentFor(file);
  assert(doc.querySelector('header a[href="nosotros.html"]'), file + ' nav');
  assert(doc.querySelector('footer a[href="contacto.html"]'), file + ' contact');
  assert(doc.querySelector('.site-footer').textContent.includes('20614487268'), file + ' RUC');
  assert.equal(doc.querySelectorAll('h1').length, 1, file);
  for (const el of doc.querySelectorAll('[href],[src],[poster],[data-src],[srcset]')) {
    for (const attr of ['href', 'src', 'poster', 'data-src']) checkReference(el.getAttribute(attr), file);
    // The project's srcsets contain local image paths with width descriptors.
    if (el.hasAttribute('srcset')) for (const item of el.getAttribute('srcset').split(',')) checkReference(item.trim().split(/\s+/)[0], file);
  }
  for (const el of doc.querySelectorAll('style')) checkCSS(el.textContent, 'dist/' + file);
  for (const el of doc.querySelectorAll('[style]')) checkCSS('x{' + el.getAttribute('style') + '}', 'dist/' + file);
  for (const el of doc.querySelectorAll('script:not([src])')) {
    if (el.type === 'application/ld+json') JSON.parse(el.textContent);
    else if (!el.type || /^(text|application)\/javascript$/.test(el.type)) new vm.Script(el.textContent, { filename: file });
  }
  assert(!doc.querySelector('[href^="mailto:"]'), file);
  assert(!/\b(?:S\/|US\$)\s*\d/.test(doc.body.textContent), file + ' public price');
}
console.log(`PASS: ${pages.length} pages; local references, queries, anchors, srcsets, assets, navigation and RUC.`);

function load(file, search = '', configOverride) {
  const errors = [];
  const console = new VirtualConsole();
  console.on('jsdomError', error => errors.push(error));
  // No resources option: jsdom never loads scripts, styles or the remote iframe.
  const dom = new JSDOM(read('dist/' + file), { runScripts: 'outside-only', url: origin + '/' + file + search, virtualConsole: console });
  const w = dom.window;
  w.matchMedia = () => ({ matches: true });
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.fetch = w.open = () => { throw new Error('Network/window opening prohibited in verification'); };
  w.XMLHttpRequest = class { constructor() { throw new Error('XHR prohibited in verification'); } };
  for (const script of w.document.querySelectorAll('script[src]')) {
    const ref = localReference(script.getAttribute('src'), file);
    assert(ref, 'Unexpected remote script');
    w.eval(fs.readFileSync(ref.absolute, 'utf8'));
    if (ref.file === 'js/crm-config.js' && configOverride) Object.assign(w.SPECTRA_CRM, configOverride);
  }
  assert.equal(errors.length, 0, errors.map(e => e.message).join('\n'));
  return { w, dom, errors };
}
const scenarios = [
  ['cotizar.html', '', 'Pantallas LED'],
  ['cotizar.html', '?servicio=sonido&utm_source=baseline&dni=private#quote-form', 'Sonido'],
  ['cotizar.html', '?servicio=iluminacion', 'Iluminación'],
  ['cotizar.html', '?servicio=soluciones-audiovisuales', 'Solución audiovisual integral'],
  ['cotizar.html', '?servicio=publicidad-led', 'Publicidad LED'],
  ['cotizar.html', '?servicio=unknown', 'Pantallas LED'],
  ['publicidad-led.html', '#pauta', 'Publicidad LED']
];
for (const [file, search, service] of scenarios) {
  const { w, dom, errors } = load(file, search);
  assert(!w.document.querySelector('form#quote-form, #ad-form'), 'Legacy form unexpectedly restored');
  const frame = w.document.querySelector('[data-crm-mount] iframe');
  assert(frame, file + ' CRM iframe');
  assert.equal(w.document.querySelectorAll('[data-crm-mount] iframe').length, 1);
  assert(frame.title);
  const url = new URL(frame.src);
  assert.equal(url.origin + url.pathname, w.SPECTRA_CRM.endpoint);
  const channel = url.searchParams.get('channel');
  assert.match(channel, /^[a-f0-9-]{36}$/i);
  const messages = [], analytics = [];
  const source = { postMessage: (data, target) => messages.push({ data, target }) };
  const googleOrigin = 'https://test.script.googleusercontent.com';
  const dispatch = (data, options = {}) => w.dispatchEvent(new w.MessageEvent('message', { data: { channel, ...data }, origin: googleOrigin, source, ...options }));
  w.document.addEventListener('spectra:analytics', e => analytics.push(e.detail));
  dispatch({ type: 'spectra:ready' }, { origin: 'https://example.invalid' });
  dispatch({ type: 'spectra:ready', channel: 'wrong' });
  assert.equal(messages.length, 0, 'Untrusted handshake accepted');
  dispatch({ type: 'spectra:ready' });
  assert.equal(messages.length, 1);
  assert.equal(messages[0].target, googleOrigin, 'postMessage must target the accepted origin');
  assert.equal(messages[0].data.type, 'spectra:init');
  assert.equal(messages[0].data.service, service);
  assert.equal(messages[0].data.attribution.sourcePage, origin + '/' + file);
  assert.equal(messages[0].data.attribution.entryUrl, origin + '/' + file);
  const stored = JSON.parse(w.sessionStorage.getItem('spectra-attribution'));
  assert.equal(stored.entryUrl, origin + '/' + file);
  assert(!JSON.stringify(stored).includes('private'));
  if (search.includes('utm_source')) assert.equal(stored.utm_source, 'baseline');
  dispatch({ type: 'spectra:height', height: 1000 }, { source: {} });
  dispatch({ type: 'spectra:height', height: 1000 }, { origin: 'https://example.invalid' });
  dispatch({ type: 'spectra:height', height: 1000, channel: 'wrong' });
  assert.equal(frame.style.height, '850px');
  for (const [height, expected] of [[1000, '1024px'], [1, '600px'], [99999, '8000px']]) {
    dispatch({ type: 'spectra:height', height });
    assert.equal(frame.style.height, expected);
  }
  dispatch({ type: 'spectra:height', height: '900' });
  assert.equal(frame.style.height, '8000px');
  dispatch({ type: 'spectra:analytics', detail: { event: 'unknown' } });
  assert.equal(analytics.length, 0);
  dispatch({ type: 'spectra:analytics', detail: { event: 'form_start', email: 'private@example.invalid' } });
  assert.equal(analytics.length, 1);
  assert.equal(analytics[0].event, 'form_start');
  assert.equal(analytics[0].email, undefined);
  assert.equal(errors.length, 0, errors.map(e => e.message).join('\n'));
  dom.window.close();
}
for (const override of [{ enabled: false }, { endpoint: 'https://example.invalid/exec' }]) {
  const { w, dom } = load('cotizar.html', '', override);
  assert(!w.document.querySelector('[data-crm-mount] iframe'));
  dom.window.close();
}
for (const file of pages) {
  const { w, dom } = load(file);
  const button = w.document.querySelector('.menu-toggle');
  button.click();
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape' }));
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  dom.window.close();
}
console.log('PASS: CRM iframe, 7 service scenarios, mocked messaging, origin/channel/source filters, resize, attribution, analytics, disabled/invalid config and menu runtime. No network or form submissions.');

// Exercise the actual CRM client without Google, network access or submission.
const clientDOM = new JSDOM(read('crm/form.html'), {
  runScripts: 'outside-only', url: 'https://test.script.googleusercontent.com/'
});
const client = clientDOM.window;
const outgoing = [];
client.postMessage = (data, target) => outgoing.push({ data, target });
client.ResizeObserver = class { observe() {} disconnect() {} };
client.eval(read('crm/validation.js'));
client.eval(read('crm/client.js'));
const initializeClient = (messageOrigin, source = client) => client.dispatchEvent(new client.MessageEvent('message', {
  origin: messageOrigin, source, data: { type: 'spectra:init', service: 'Sonido', attribution: {} }
}));
initializeClient('http://localhost:5173');
assert.equal(client.document.getElementById('service').value, '', 'localhost must remain untrusted');
initializeClient(origin, {});
assert.equal(client.document.getElementById('service').value, '', 'non-parent source must remain untrusted');
initializeClient(origin);
assert.equal(client.document.getElementById('service').value, 'Sonido');
assert(outgoing.some(message => message.data.type === 'spectra:ready'));
assert(outgoing.every(message => message.target === origin), 'CRM must retain its exact production postMessage target');
clientDOM.window.close();
console.log('PASS: actual CRM client accepts the production parent and rejects localhost/foreign sources; no submit invoked.');

const manifest = JSON.parse(read('EXPORT-MANIFEST.json'));
assert.equal(manifest.files.length, 77);
assert.equal(manifest.original_file_count, 77);
assert.equal(new Set(manifest.files.map(f => f.export_path)).size, 77);
let unchanged = 0;
for (const entry of manifest.files) {
  const bytes = fs.readFileSync(path.join(root, entry.export_path));
  const hash = crypto.createHash('sha256').update(bytes).digest('hex');
  // The original export manifest remains immutable; only this verifier is updated.
  if (entry.export_path !== 'verify.cjs') {
    assert.equal(hash, entry.sha256, entry.export_path + ' differs from original v11');
    unchanged++;
  }
}
console.log(`PASS: 77/77 original files present; ${unchanged} original SHA-256 matches; verify.cjs intentionally updated.`);

function walk(dir = '') {
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap(entry => {
    if (['.git', 'node_modules', '.sites-runtime'].includes(entry.name)) return [];
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
const counts = { javascript: 0, json: 0, css: 0 };
for (const file of walk()) {
  if (/\.(?:js|cjs|mjs|gs)$/.test(file)) {
    execFileSync(process.execPath, ['--check', ...(file.endsWith('.gs') ? [] : [path.join(root, file)])], { input: file.endsWith('.gs') ? read(file) : undefined, stdio: ['pipe', 'pipe', 'pipe'] });
    counts.javascript++;
  } else if (file.endsWith('.json')) {
    JSON.parse(read(file));
    counts.json++;
  } else if (file.endsWith('.css')) {
    checkCSS(read(file), file);
    counts.css++;
  }
}
const crmForm = new JSDOM(read('crm/form.html'));
for (const el of crmForm.window.document.querySelectorAll('style')) checkCSS(el.textContent, 'crm/form.html');
for (const el of crmForm.window.document.querySelectorAll('script:not([src])')) new vm.Script(el.textContent, { filename: 'crm/form.html' });
crmForm.window.close();
for (const dom of documents.values()) dom.window.close();
console.log(`PASS: syntax for ${counts.javascript} JavaScript/Apps Script files, ${counts.json} JSON files, ${counts.css} CSS files and inline HTML/CRM styles/scripts (PostCSS parsing; no visual validation).`);
