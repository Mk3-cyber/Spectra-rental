(() => {
  const $=id=>document.getElementById(id),form=$('leadForm'),steps=[...document.querySelectorAll('[data-step]')];
  let step=0,started=false,busy=false,attribution={},requestKey=crypto.randomUUID(),snapshot=null,parentOrigin='https://spectrarental.com';
  const channel="__SPECTRA_CHANNEL__";
  const event=(name,extra={})=>{const detail={event:name,...extra};document.dispatchEvent(new CustomEvent('spectra:analytics',{detail}));window.top.postMessage({type:'spectra:analytics',channel,detail},parentOrigin);};
  const resize=()=>window.top.postMessage({type:'spectra:height',channel,height:document.documentElement.scrollHeight},parentOrigin);
  function fill(id,values){$(id).replaceChildren(new Option('Selecciona',''),...values.map(v=>new Option(v,v)));}
  fill('role',SpectraCRM.roles);fill('service',SpectraCRM.services);fill('eventType',SpectraCRM.events);fill('institutionType',SpectraCRM.institutions);
  SpectraCRM.clientTypes.forEach(v=>{const label=document.createElement('label'),input=document.createElement('input');input.type='radio';input.name='clientType';input.value=v;input.required=true;label.append(input,document.createTextNode(v));$('clientTypes').append(label);});
  $('eventDate').min=SpectraCRM.today();
  function data(){return {...Object.fromEntries(new FormData(form)),consent:$('consent').checked,requestKey,attribution};}
  let areaType='';
  function conditional(){const v=data(),person=v.clientType==='Persona natural',gov=v.clientType===SpectraCRM.clientTypes[2];
    const nextArea=gov?'government':'company';if(areaType!==nextArea){fill('area',gov?SpectraCRM.governmentAreas:SpectraCRM.companyAreas);areaType=nextArea;v.area='';}
    const visible={company:v.clientType==='Empresa',roleOther:v.clientType==='Empresa'&&v.role==='Otro',areaOther:!!v.clientType&&!person&&v.area==='Otra',organization:!!v.clientType&&!person,person,government:gov,institutionOther:gov&&v.institutionType==='Otra entidad pública',serviceOther:v.service==='Otro',eventOther:v.eventType==='Otro',address:v.venueStatus==='Definido'};
    document.querySelectorAll('[data-when]').forEach(el=>{el.hidden=!visible[el.dataset.when];el.querySelectorAll('input,select,textarea').forEach(x=>{x.disabled=el.hidden;x.required=!el.hidden;});});
    $('organizationLabel').textContent=gov?'Nombre de la institución':'Nombre o razón social de la empresa';$('areaLabel').textContent=gov?'Área / dependencia':'Área';$('emailLabel').textContent=gov?'Correo institucional':'Correo electrónico';
    $('documentNumber').inputMode=v.documentType==='DNI'?'numeric':'text';$('documentNumber').maxLength=v.documentType==='DNI'?8:20;$('documentHelp').textContent=v.documentType==='DNI'?'Exactamente 8 números.':'Copia el número de tu C.E. tal como aparece. No realizamos una verificación migratoria en línea.';resize();
  }
  const labels={clientType:'Tipo de cliente',fullName:'Nombre y apellido',organization:'Empresa / institución',role:'Cargo',roleOther:'Cargo especificado',area:'Área',areaOther:'Área especificada',institutionType:'Tipo de institución',institutionOther:'Institución especificada',phone:'WhatsApp / teléfono',email:'Correo electrónico',service:'Servicio',serviceOther:'Servicio especificado',eventType:'Tipo de evento',eventOther:'Evento especificado',eventDate:'Fecha',dateStatus:'Estado de la fecha',city:'Distrito / ciudad',address:'Lugar',attendees:'Asistentes',description:'Requerimiento'};
  function review(){const v=SpectraCRM.validate(data()).value;$('review').replaceChildren();Object.entries(labels).forEach(([k,label])=>{if(v[k]){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=v[k];$('review').append(dt,dd);}});}
  function show(n){step=n;steps.forEach((el,i)=>el.hidden=i!==step);$('back').hidden=step===0;$('next').hidden=step===4;$('send').hidden=step!==4;$('next').textContent=step===3?'Revisar solicitud':'Continuar';$('progressText').textContent=`Paso ${step+1} de 5`;$('bar').style.width=`${(step+1)*20}%`;$('status').textContent='';if(step===4)review();steps[step].querySelector('input:not([disabled]),select:not([disabled]),textarea')?.focus();resize();}
  function errors(result,onlyStep=false){document.querySelectorAll('[data-error]').forEach(e=>e.textContent='');form.querySelectorAll('[aria-invalid]').forEach(e=>e.removeAttribute('aria-invalid'));let first;
    Object.entries(result.errors||{}).forEach(([key,message])=>{const node=[...form.querySelectorAll('[name]')].find(el=>el.name===key&&!el.disabled);if(onlyStep&&node&&!steps[step].contains(node))return;const error=document.querySelector(`[data-error="${node?.id==='governmentRole'?'governmentRole':key}"]`);if(error)error.textContent=message;if(node instanceof HTMLElement){node.setAttribute('aria-invalid','true');node.setAttribute('aria-describedby',error?(error.id=`error-${key}`):'status');first=first||node;}});if(first){first.focus();event('form_error',{step:step+1});resize();}return !!first;
  }
  form.addEventListener('input',()=>{if(!started){started=true;event('form_start');}});
  form.addEventListener('change',e=>{conditional();if(e.target.name==='clientType')event('client_type_selected',{clientType:e.target.value});});
  $('next').onclick=()=>{const r=SpectraCRM.validate(data());if(!errors(r,true)){show(step+1);}};$('back').onclick=()=>show(Math.max(0,step-1));
  form.addEventListener('submit',e=>{e.preventDefault();if(busy)return;if(step!==4){$('next').click();return;}const v=data(),r=SpectraCRM.validate(v);if(!r.ok){const first=Object.keys(r.errors)[0],node=[...form.querySelectorAll('[name]')].find(el=>el.name===first&&!el.disabled);const index=steps.findIndex(s=>node&&s.contains(node));if(index>=0)show(index);errors(r);return;}
    if(typeof google==='undefined'||!google.script?.run){$('status').textContent='El registro automático todavía no está conectado. No se ha guardado esta solicitud.';resize();return;}
    busy=true;snapshot=v;$('send').disabled=true;$('back').disabled=true;$('status').textContent='Registrando solicitud…';event('form_submit');
    const unlock=()=>{busy=false;$('send').disabled=false;$('back').disabled=false;};
    google.script.run.withSuccessHandler(response=>{unlock();if(!response?.ok||!/^SP-[0-9]{8}-[a-f0-9-]{36}$/i.test(response.id||'')||!/^S[A-Z]{2}-[0-9]{8}-[0-9]{3}$/.test(response.reference||'')){$('status').textContent=response?.message||'No se pudo confirmar el registro. Intenta de nuevo.';errors(response||{});resize();return;}$('steps').hidden=true;$('received').hidden=false;$('leadId').textContent=response.reference;$('whatsapp').href=SpectraCRM.whatsapp(r.value,response.reference);event('lead_created');$('received').focus();resize();}).withFailureHandler(()=>{unlock();$('status').textContent='No se pudo confirmar el registro. Reintenta con este mismo formulario para evitar duplicados.';event('form_error',{step:5});resize();}).submitLead(snapshot);
  });
  $('whatsapp').onclick=()=>event('whatsapp_click_after_lead');
  window.addEventListener('message',e=>{if(e.origin!==parentOrigin||e.source!==window.top||e.data?.type!=='spectra:init')return;attribution=e.data.attribution||{};if(!started&&SpectraCRM.services.includes(e.data.service))$('service').value=e.data.service;conditional();});
  conditional();window.top.postMessage({type:'spectra:ready',channel},parentOrigin);new ResizeObserver(resize).observe(document.querySelector('main'));
})();
