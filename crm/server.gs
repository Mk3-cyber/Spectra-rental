// Runs as the owner. All helpers end in _ and cannot be called by google.script.run.
// submitLead returns only an opaque ID after a successful spreadsheet write/readback.
function doGet(e) {
  const channel=/^[a-f0-9-]{36}$/i.test(e?.parameter?.channel||'')?e.parameter.channel:'';
  return HtmlService.createHtmlOutput(FORM_HTML_.replace('"__SPECTRA_CHANNEL__"',JSON.stringify(channel))).setTitle('Solicitar propuesta | SPECTRA RENTAL')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function submitLead(input) {
  if(!input||JSON.stringify(input).length>16000)return {ok:false,message:'Solicitud inválida.'};
  const checked=SpectraCRM.validate(input,Utilities.formatDate(new Date(),'America/Lima','yyyy-MM-dd'));
  if(!checked.ok)return {ok:false,errors:checked.errors,message:'Revisa los campos indicados.'};
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(20000))return {ok:false,message:'Hay solicitudes en proceso. Intenta nuevamente en un momento.'};
  try {
    const v=checked.value,book=SpreadsheetApp.openById(SPREADSHEET_ID_),sheet=book.getSheetByName('LEADS');
    const actual=sheet.getRange(1,1,1,CRM_HEADERS_.length).getValues()[0];
    if(JSON.stringify(actual)!==JSON.stringify(CRM_HEADERS_))return {ok:false,message:'El registro requiere revisión de configuración. No se confirmó el envío.'};
    const ix=k=>CRM_HEADERS_.indexOf(k),last=sheet.getLastRow();
    const rows=last>1?sheet.getRange(2,1,last-1,CRM_HEADERS_.length).getValues():[];
    const fingerprint=hash_(JSON.stringify(v));
    const existing=rows.find(r=>r[ix('Clave de envío')]===v.requestKey);
    if(existing){
      if(existing[ix('Huella del envío')]!==fingerprint)return {ok:false,message:'Esta solicitud ya fue registrada con otros datos. Abre un formulario nuevo para otro evento.'};
      const existingReference=String(existing[ix('Referencia comercial')]||'');
      return {ok:true,id:existing[0],reference:existingReference};
    }
    const cache=CacheService.getScriptCache(),contactKey='contact:'+hash_(v.phone+'|'+v.email),globalKey='intake:'+Utilities.formatDate(new Date(),'America/Lima','yyyyMMddHH');
    if(Number(cache.get(contactKey)||0)>=3||Number(cache.get(globalKey)||0)>=100)return {ok:false,message:'Se alcanzó el límite de solicitudes. Intenta más tarde.'};
    if(last>=10001)return {ok:false,message:'El registro requiere ampliación. No se confirmó el envío.'};
    const possible=rows.some(r=>(v.ruc&&String(r[ix('RUC')])===v.ruc)||(v.documentNumber&&r[ix('Tipo de documento')]===v.documentType&&String(r[ix('Número de documento')])===v.documentNumber)||String(r[ix('WhatsApp')])===v.phone||String(r[ix('Correo electrónico')]).toLowerCase()===v.email);
    const now=new Date(),day=Utilities.formatDate(now,'America/Lima','yyyyMMdd'),id='SP-'+day+'-'+Utilities.getUuid();
    const sequence=rows.filter(r=>String(r[ix('ID único')]||'').startsWith('SP-'+day+'-')).length+1;
    const reference=commercialRef_(v.fullName,day,sequence);
    const values={},put=(k,x)=>values[k]=x;const a=v.attribution;
    put('ID único',id);put('Fecha',now);put('Hora',Utilities.formatDate(now,'America/Lima','HH:mm:ss'));put('Tipo de cliente',v.clientType);put('Nombre y apellido',v.fullName);put('Tipo de documento',v.documentType||'');put('Número de documento',v.documentNumber||'');put('Empresa / institución',v.organization||'');put('Razón social',v.organization||'');put('RUC',v.ruc||'');put('Cargo',v.roleOther||v.role||'');put('Área',v.areaOther||v.area||'');put('Tipo de institución gubernamental',v.institutionOther||v.institutionType||'');put('WhatsApp',v.phone);put('Teléfono',v.phone);put('Correo electrónico',v.email);put('Servicio solicitado',v.service);put('Tipo de evento',v.eventType==='Otro'?v.eventOther:v.eventType);put('Fecha del evento',new Date(v.eventDate+'T12:00:00-05:00'));put('Ubicación',v.city);put('Dirección',v.address);put('Número aproximado de asistentes',v.attendees);put('Descripción del requerimiento',(v.serviceOther?'Servicio: '+v.serviceOther+'\n':'')+v.description);
    put('Página de origen',a.sourcePage);put('URL de entrada',a.entryUrl);put('Fuente',a.utm_source||a.referrer||'Directo');put('Medio',a.utm_medium||'Sin identificar');put('Campaña',a.utm_campaign||'');for(const k of ['Source','Medium','Campaign','Content','Term'])put('UTM '+k,a['utm_'+k.toLowerCase()]);put('Referrer',a.referrer);
    const owner=String(book.getSheetByName('CONFIGURACIÓN').getRange('B19').getValue());put('ESTADO','NUEVO LEAD');put('RESPONSABLE',owner||'Sin asignar');put('Posible cliente existente',possible?'Sí':'No');put('Creado el',now);put('Consentimiento','Aceptado');put('Fecha del consentimiento',now);put('Versión de consentimiento','SR-CRM-2026-10-01');put('Clave de envío',v.requestKey);put('Huella del envío',fingerprint);put('Fecha tentativa',v.dateStatus==='Tentativa'?'Sí':'No');put('Mes de creación',Utilities.formatDate(now,'America/Lima','yyyy-MM'));put('Referencia comercial',reference);
    const row=CRM_HEADERS_.map(k=>safeCell_(values[k]??'')),n=last+1;
    for(const key of ['Número de documento','RUC','WhatsApp','Teléfono','Clave de envío','Huella del envío'])sheet.getRange(n,ix(key)+1).setNumberFormat('@');
    sheet.getRange(n,1,1,row.length).setValues([row]);
    for(const key of ['Fecha','Fecha del evento'])sheet.getRange(n,ix(key)+1).setNumberFormat('dd/MM/yyyy');
    for(const key of ['Creado el','Fecha del consentimiento'])sheet.getRange(n,ix(key)+1).setNumberFormat('dd/MM/yyyy HH:mm:ss');
    SpreadsheetApp.flush();
    if(sheet.getRange(n,1).getValue()!==id)return {ok:false,message:'No se pudo confirmar el registro. Reintenta sin cerrar el formulario.'};
    cache.put(contactKey,String(Number(cache.get(contactKey)||0)+1),3600);cache.put(globalKey,String(Number(cache.get(globalKey)||0)+1),3600);
    return {ok:true,id:id,reference:reference};
  } catch (_) {return {ok:false,message:'No se pudo confirmar el registro. Conserva el formulario y reintenta; no abras una segunda solicitud.'};}
  finally {lock.releaseLock();}
}
function commercialRef_(fullName,day,sequence){
  const parts=String(fullName||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z ]/g,' ').trim().split(/\s+/).filter(Boolean);
  const first=parts[0]?.charAt(0)||'X',last=parts.length>1?parts[parts.length-1].charAt(0):'X';
  return ('S'+first+last).toUpperCase()+'-'+day+'-'+String(sequence).padStart(3,'0');
}
function safeCell_(v){return typeof v==='string'&&/^[=+@\-\t\r]/.test(v)?"'"+v:v;}
function hash_(s){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,s,Utilities.Charset.UTF_8).map(b=>('0'+(b&255).toString(16)).slice(-2)).join('');}
function setup_(){
  const book=SpreadsheetApp.openById(SPREADSHEET_ID_);book.setSpreadsheetTimeZone('America/Lima');
  const sheet=book.getSheetByName('LEADS');
  if(JSON.stringify(sheet.getRange(1,1,1,CRM_HEADERS_.length).getValues()[0])!==JSON.stringify(CRM_HEADERS_))throw new Error('Las columnas del CRM no coinciden.');
  book.getSheetByName('CONFIGURACIÓN').getRange('B21').setValue('Apps Script autorizado; prueba web pendiente');
}
