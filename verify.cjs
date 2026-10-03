const fs=require('fs'),path=require('path'),assert=require('assert'),{JSDOM}=require('jsdom');
const pages=fs.readdirSync('dist').filter(n=>n.endsWith('.html'));
for(const file of pages){
 const doc=new JSDOM(fs.readFileSync('dist/'+file,'utf8')).window.document;
 assert(doc.querySelector('header a[href="nosotros.html"]'),file+' nav');
 assert(doc.querySelector('footer a[href="contacto.html"]'),file+' contact');
 assert(doc.querySelector('.site-footer').textContent.includes('20614487268'),file);
 assert.equal(doc.querySelectorAll('h1').length,1,file);
 for(const el of doc.querySelectorAll('[href],[src]')){
  const value=el.getAttribute('href')||el.getAttribute('src');if(!value||/^(https?:|tel:|data:)/.test(value))continue;
  const [target,hash]=value.split('#');const dest=target||file;
  assert(fs.existsSync(path.join('dist',dest)),file+' missing '+value);
  if(hash&&dest.endsWith('.html'))assert(new JSDOM(fs.readFileSync('dist/'+dest,'utf8')).window.document.getElementById(hash),file+' missing anchor '+value);
 }
 assert(!doc.querySelector('[href^="mailto:"]'));
 assert(!/\b(?:S\/|US\$)\s*\d/.test(doc.body.textContent),file+' public price');
}
function load(file){
 const d=new JSDOM(fs.readFileSync('dist/'+file,'utf8'),{runScripts:'outside-only',url:'https://example.test/'+file});
 d.window.matchMedia=()=>({matches:true});d.window.HTMLElement.prototype.scrollIntoView=()=>{};
 d.window.eval(fs.readFileSync('dist/js/script.js','utf8'));return d.window;
}
function fill(w,form){for(const e of form.querySelectorAll('[name]')){
 let v=e.tagName==='SELECT'?e.options[1].value:e.type==='date'?'2026-12-12':e.type==='datetime-local'?'2026-12-12T12:00':e.type==='email'?'qa@example.test':e.type==='tel'?'999999999':e.type==='number'?'10':/ruc/.test(e.name)?'20614487268':'Prueba interna';
 e.value=v;e.dispatchEvent(new w.Event('input',{bubbles:true}));
}}
const w=load('cotizar.html'),form=w.document.querySelector('#quote-form');
form.querySelector('[data-next]').click();assert.equal(form.querySelector('.form-step.active legend').textContent,'Datos del evento');
fill(w,form);form.querySelector('[data-next]').click();assert.equal(form.querySelector('.form-step.active legend').textContent,'Operación y presupuesto');
form.querySelectorAll('[data-next]')[1].click();assert.equal(form.querySelector('.form-step.active legend').textContent,'Datos de contacto');
form.dispatchEvent(new w.Event('submit',{cancelable:true}));const link=form.querySelector('.status-message a');
assert(link);assert(decodeURIComponent(link.href).includes('20614487268'));
assert(form.querySelector('.quote-summary').textContent.includes('Prueba interna'));
form.querySelectorAll('[data-back]')[1].click();assert(!form.querySelector('.status-message').classList.contains('show'));
const a=load('publicidad-led.html');a.eval(fs.readFileSync('dist/js/monumental.js','utf8'));
const ad=a.document.querySelector('#ad-form');fill(a,ad);ad.querySelector('[data-ad-next]').click();ad.dispatchEvent(new a.Event('submit',{cancelable:true}));
assert(!ad.querySelector('#ad-review').hidden);assert(decodeURIComponent(ad.querySelector('#ad-send').href).includes('20614487268'));
console.log('PASS: '+pages.length+' páginas, enlaces/anchors, RUC, formularios LED y Monumental, validación vacía, revisión y vuelta. Sin mensajes enviados.');
