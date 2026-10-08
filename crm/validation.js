/* Shared input validation. No remote identity verification is claimed. */
var SpectraCRM = (function () {
  const clientTypes=['Empresa','Persona natural','Entidad gubernamental / institución del Estado'];
  const services=['Pantallas LED','Sonido','Iluminación','Solución audiovisual integral','Publicidad LED','Otro'];
  const institutions=['Ministerio','Municipalidad distrital','Municipalidad provincial','Gobierno regional','Organismo público','Entidad autónoma','Empresa del Estado','Universidad pública','Poder del Estado','Otra entidad pública'];
  const events=['Evento corporativo','Conferencia','Congreso','Convención','Feria','Activación de marca','Lanzamiento','Evento institucional','Evento gubernamental','Evento educativo','Evento social','Concierto / espectáculo','Otro'];
  const roles=['Gerente General','Gerente de Marketing','Jefe de Marketing','Coordinador de Eventos','Administración','Compras','Recursos Humanos','Producción','Otro'];
  const companyAreas=['Gerencia General','Marketing','Comunicaciones','Eventos','Compras','Administración','Recursos Humanos','Operaciones','Producción','Otra'];
  const governmentAreas=['Comunicaciones','Imagen institucional','Logística','Administración','Abastecimiento','Protocolo','Eventos','Secretaría General','Gerencia Municipal','Otra'];
  function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
  function validate(input,date=today()) {
    const v={},errors={};
    const text=(k,min=1,max=160)=>{const x=typeof input[k]==='string'?input[k].trim():'';v[k]=x;if(x.length<min||x.length>max||/[\u0000-\u0008\u000B\u000C\u000E-\u001F<>]/.test(x))errors[k]='Completa este campo con información válida.';return x;};
    const choice=(k,choices)=>{const x=text(k);if(!choices.includes(x))errors[k]='Selecciona una opción.';return x;};
    choice('clientType',clientTypes);text('fullName',3,140);if(!/\p{L}.*\s+.*\p{L}/u.test(v.fullName))errors.fullName='Escribe tu nombre y apellido.';
    if(v.clientType==='Empresa'||v.clientType===clientTypes[2]){
      text('organization',2,200);
      if(v.clientType==='Empresa'){
        text('ruc',11,11);
        if(!/^(10|20)\d{9}$/.test(v.ruc)||input.ruc!==v.ruc)errors.ruc='Ingresa 11 números, sin espacios, comenzando por 10 o 20.';
        choice('role',roles);if(v.role==='Otro')text('roleOther',2,120);
      }else{
        v.ruc='';
        text('role',2,120);
      }
      choice('area',v.clientType==='Empresa'?companyAreas:governmentAreas);if(v.area==='Otra')text('areaOther',2,120);
      if(v.clientType===clientTypes[2]){choice('institutionType',institutions);if(v.institutionType==='Otra entidad pública')text('institutionOther',2,120);}
    }else if(v.clientType==='Persona natural'){
      choice('documentType',['DNI','C.E.']);text('documentNumber',1,20);
      if(v.documentType==='DNI'&&!/^\d{8}$/.test(v.documentNumber))errors.documentNumber='El DNI debe contener exactamente 8 números.';
      // CE: capture as printed, without claiming an unverified fixed length or official validation.
      if(v.documentType==='C.E.'&&!/^[A-Za-z0-9-]{1,20}$/.test(v.documentNumber))errors.documentNumber='Copia el número de tu C.E., sin espacios ni símbolos adicionales.';
      if(input.documentNumber!==v.documentNumber)errors.documentNumber='Ingresa el documento sin espacios.';
    }
    text('phone',7,25);v.phone=v.phone.replace(/[\s()-]/g,'');if(/^9\d{8}$/.test(v.phone))v.phone='+51'+v.phone;
    if(!/^\+[1-9]\d{7,14}$/.test(v.phone))errors.phone='Usa +código de país y número, o un celular peruano de 9 dígitos.';
    text('email',5,254);v.email=v.email.toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))errors.email='Ingresa un correo electrónico válido.';
    choice('service',services);if(v.service==='Otro')text('serviceOther',2,120);
    choice('eventType',events);if(v.eventType==='Otro')text('eventOther',2,120);
    text('eventDate',10,10);const parsed=new Date(v.eventDate+'T12:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(v.eventDate)||!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==v.eventDate||v.eventDate<date)errors.eventDate='Selecciona una fecha de hoy en adelante.';
    choice('dateStatus',['Confirmada','Tentativa']);text('city',2,120);choice('venueStatus',['Definido','Por confirmar']);
    if(v.venueStatus==='Definido')text('address',3,250);else v.address='Por confirmar';
    const count=String(input.attendees??'');if(!/^[1-9]\d*$/.test(count)||!Number.isSafeInteger(Number(count)))errors.attendees='Ingresa una cantidad entera mayor que cero.';v.attendees=Number(count);
    text('description',10,3000);if(input.consent!==true)errors.consent='Debes aceptar el tratamiento de datos para enviar la solicitud.';v.consent=input.consent===true;
    if(input.website)errors.website='No se pudo procesar la solicitud.';
    if(!/^[a-f0-9-]{36}$/i.test(input.requestKey||''))errors.requestKey='Recarga el formulario e inténtalo de nuevo.';v.requestKey=input.requestKey;
    const a=input.attribution||{};v.attribution={};
    for(const k of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'])v.attribution[k]=String(a[k]||'').replace(/[\u0000-\u001F<>]/g,'').slice(0,200);
    for(const k of ['entryUrl','sourcePage','referrer']){
      // URL is not available in the Apps Script V8 runtime. Store origin/path only.
      const clean=String(a[k]||'').split(/[?#]/)[0];
      v.attribution[k]=/^https?:\/\/[^\s/@]+(?:\/[^\s]*)?$/.test(clean)?clean.slice(0,500):'';
    }
    return {ok:Object.keys(errors).length===0,errors,value:v};
  }
  function whatsapp(v,reference){return 'https://wa.me/51920384374?text='+encodeURIComponent(`Hola, equipo de Spectra Rental. Soy ${v.fullName} y acabo de registrar una solicitud.\n\nReferencia: ${reference}\nServicio: ${v.service==='Otro'?v.serviceOther:v.service}\nTipo de evento: ${v.eventType==='Otro'?v.eventOther:v.eventType}\nFecha: ${v.eventDate}\n\nQuisiera continuar la coordinación por aquí.`);}
  return {validate,today,whatsapp,clientTypes,services,institutions,events,roles,companyAreas,governmentAreas};
})();
