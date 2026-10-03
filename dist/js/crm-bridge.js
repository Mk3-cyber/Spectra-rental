/* Enable only after real Google Sheets writes and the three client cases pass. */
(() => {
  const config=window.SPECTRA_CRM;
  if(!config?.enabled||!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(config.endpoint||''))return;
  const serviceByPage={'pantallas-led':'Pantallas LED',cotizar:'Pantallas LED',sonido:'Sonido',iluminacion:'Iluminación','soluciones-audiovisuales':'Solución audiovisual integral','publicidad-led':'Publicidad LED'};
  const current=location.pathname.split('/').pop().replace(/\.html$/,'');
  const cleanURL=s=>{try{const u=new URL(s);return u.origin+u.pathname;}catch{return '';}};
  let original;
  try{original=JSON.parse(sessionStorage.getItem('spectra-attribution')||'null');}catch{}
  if(!original){original={entryUrl:cleanURL(location.href),referrer:cleanURL(document.referrer)};const params=new URLSearchParams(location.search);for(const k of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'])original[k]=(params.get(k)||'').slice(0,200);try{sessionStorage.setItem('spectra-attribution',JSON.stringify(original));}catch{}}
  const mount=document.querySelector('[data-crm-mount]');
  if(mount){
    const channel=crypto.randomUUID(),frame=document.createElement('iframe');frame.title='Solicitud comercial de SPECTRA RENTAL';frame.src=config.endpoint+'?channel='+encodeURIComponent(channel);frame.style.cssText='width:100%;height:850px;border:0;display:block;background:#000';
    let sourceWindow=null,sourceOrigin='';
    const init=()=>sourceWindow?.postMessage({type:'spectra:init',attribution:{...original,sourcePage:cleanURL(location.href)},service:serviceByPage[new URLSearchParams(location.search).get('servicio')]||serviceByPage[current]||''},sourceOrigin);
    window.addEventListener('message',e=>{
      if(!/^https:\/\/([a-z0-9-]+\.)?script\.googleusercontent\.com$/.test(e.origin)&&e.origin!=='https://script.google.com')return;
      if(e.data?.channel!==channel)return;
      if(e.data.type==='spectra:ready'){sourceWindow=e.source;sourceOrigin=e.origin;init();}
      if(e.source!==sourceWindow)return;
      if(e.data.type==='spectra:height'&&Number.isFinite(e.data.height))frame.style.height=Math.max(600,Math.min(8000,e.data.height+24))+'px';
      if(e.data.type==='spectra:analytics'&&['form_start','client_type_selected','form_submit','form_error','lead_created','whatsapp_click_after_lead'].includes(e.data.detail?.event))document.dispatchEvent(new CustomEvent('spectra:analytics',{detail:{event:e.data.detail.event,clientType:e.data.detail.clientType,step:e.data.detail.step}}));
    });mount.replaceChildren(frame);
  }
})();
