(() => {
  const form = document.querySelector('#ad-form');
  if (!form) return;
  const steps = [...form.querySelectorAll('[data-ad-step]')];
  const review = form.querySelector('#ad-review');
  const fields = [...form.querySelectorAll('[name]')];
  let current = 0;
  const show = index => {
    current = index;
    review.hidden = true;
    steps.forEach((step, i) => { step.hidden = i !== index; });
    document.querySelector('#ad-progress').textContent = `Paso ${index + 1} de 2 · ${index ? 'Contacto y empresa' : 'Tu campaña'}`;
    document.querySelector('#ad-progress-bar').value = index + 1;
    steps[index].querySelector('input,select,textarea').focus();
  };
  const validate = index => {
    const invalid = [...steps[index].querySelectorAll('[name]')].find(field => {
      field.setCustomValidity(field.value.trim() ? '' : 'Completa este campo.');
      return !field.checkValidity();
    });
    if (invalid) { show(index); invalid.reportValidity(); return false; }
    return true;
  };
  fields.forEach(field => field.addEventListener('input', () => field.setCustomValidity('')));
  form.querySelector('[data-ad-next]').addEventListener('click', () => { if (validate(0)) show(1); });
  form.querySelector('[data-ad-back]').addEventListener('click', () => show(0));
  form.querySelector('[data-ad-edit]').addEventListener('click', () => show(1));
  document.querySelectorAll('[data-campaign],[data-calendar]').forEach(link => link.addEventListener('click', () => {
    show(0);
    const target = form.elements[link.hasAttribute('data-calendar') ? 'ad-date' : 'ad-brief'];
    if (!target.value.trim()) target.value = link.hasAttribute('data-calendar') ? 'Solicito el calendario comercial actualizado' : `Modalidad de interés: ${link.dataset.campaign}. `;
    target.setCustomValidity('');
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (current === 0) { if (validate(0)) show(1); return; }
    if (!validate(0) || !validate(1)) return;
    const message = ['Hola, deseo consultar publicidad LED en el Estadio Monumental.', '', 'Spectra Rental, unidad de negocios de Mentora International S.A.C., identificada con RUC N.° 20614487268.', '', ...fields.map(field => `${field.dataset.label}: ${field.value.trim()}`)].join('\n');
    document.querySelector('#ad-summary').textContent = message;
    document.querySelector('#ad-send').href = `https://wa.me/51920384374?text=${encodeURIComponent(message)}`;
    steps.forEach(step => { step.hidden = true; });
    review.hidden = false;
    document.querySelector('#ad-progress').textContent = 'Solicitud lista para revisar';
    document.querySelector('#ad-review-title').focus();
  });
})();
