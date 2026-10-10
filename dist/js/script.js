(() => {
  const body = document.body;
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  const currentPage = body.dataset.page;

  document.querySelectorAll('[data-nav]').forEach((link) => {
    if (link.dataset.nav === currentPage) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  const serviceMenu = document.querySelector('.nav-services');
  document.addEventListener('click', event => {
    if (serviceMenu && !serviceMenu.contains(event.target)) serviceMenu.open = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && serviceMenu?.open) {
      serviceMenu.open = false;
      serviceMenu.querySelector('summary').focus();
    }
  });
  if (menuToggle && nav) {
    const closeMenu = () => {
      if (serviceMenu) serviceMenu.open = false;
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('menu-open');
      menuToggle.setAttribute('aria-label', 'Abrir menú');
    };
    menuToggle.addEventListener('click', () => {
      const open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      body.classList.toggle('menu-open', open);
      menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menuToggle.focus(); } });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => { if (window.innerWidth > 980) closeMenu(); });
  }

  document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });

  const reveal = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    reveal.forEach((node) => observer.observe(node));
  } else {
    reveal.forEach((node) => node.classList.add('visible'));
  }

  const dialog = document.querySelector('#lightbox');
  if (dialog) {
    const dialogImage = dialog.querySelector('img');
    const dialogCaption = dialog.querySelector('[data-lightbox-caption]');
    document.querySelectorAll('[data-lightbox]').forEach((button) => {
      button.addEventListener('click', () => {
        dialogImage.src = button.dataset.src;
        dialogImage.alt = button.dataset.alt || '';
        dialogCaption.textContent = button.dataset.caption || '';
        dialog.showModal();
      });
    });
    dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  }

  const form = document.querySelector('form#quote-form');
  if (form) {
    const steps = [...form.querySelectorAll('.form-step')];
    const progress = form.querySelector('.progress-bar');
    const status = form.querySelector('.status-message');
    let step = 0;

    const showStep = (next) => {
      step = Math.max(0, Math.min(next, steps.length - 1));
      steps.forEach((fieldset, index) => fieldset.classList.toggle('active', index === step));
      progress.style.width = `${((step + 1) / steps.length) * 100}%`;
      status.classList.remove('show');
      steps[step].querySelector('input,select,textarea')?.focus();
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const validateStep = () => {
      const required = [...steps[step].querySelectorAll('[required]')];
      const invalid = required.find((field) => !field.checkValidity() || !field.value.trim());
      if (invalid) {
        if (!invalid.value.trim()) invalid.setCustomValidity('Completa este campo.');
        invalid.reportValidity();
        invalid.addEventListener('input', () => invalid.setCustomValidity(''), { once: true });
        invalid.focus();
        return false;
      }
      return true;
    };

    form.querySelectorAll('[data-next]').forEach((button) => button.addEventListener('click', () => {
      if (validateStep()) showStep(step + 1);
    }));
    form.querySelectorAll('[data-back]').forEach((button) => button.addEventListener('click', () => showStep(step - 1)));

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const invalidStep = steps.findIndex(panel => [...panel.querySelectorAll('[required]')].some(field => !field.checkValidity() || !field.value.trim()));
      if (invalidStep !== -1) { showStep(invalidStep); validateStep(); return; }
      const lines = ['Hola, deseo cotizar pantallas LED P2.9 / P3.9 para un evento.', '', 'Spectra Rental, unidad de negocios de Mentora International S.A.C., identificada con RUC N.° 20614487268.', '', ...[...form.querySelectorAll('[name]')].map(field => `${field.dataset.label}: ${field.value}`), '', 'Condiciones: precios sin IGV; se añade 18%. Pago: 50% de adelanto y 50% antes del evento.'];
      const url = `https://wa.me/51902558540?text=${encodeURIComponent(lines.join('\n'))}`;
      status.classList.add('show');
      status.replaceChildren();
      const title = document.createElement('h3'); title.textContent = 'Revisa tu solicitud'; title.tabIndex = -1;
      const summary = document.createElement('pre'); summary.className = 'quote-summary'; summary.textContent = lines.join('\n');
      const send = document.createElement('a'); send.href = url; send.target = '_blank'; send.rel = 'noopener'; send.className = 'btn btn--primary'; send.textContent = 'Abrir WhatsApp y enviar';
      status.append(title, summary, send); title.focus();
    });

    document.querySelectorAll('#setup, #show, #strike').forEach(field => field.addEventListener('input', () => {
      const setup = form.elements.setup, show = form.elements.show, strike = form.elements.strike;
      show.setCustomValidity(setup.value && show.value && show.value < setup.value ? 'La función debe ser posterior al montaje.' : '');
      strike.setCustomValidity(show.value && strike.value && strike.value < show.value ? 'El desmontaje debe ser posterior al inicio de la función.' : '');
    }));
  }
  const adForm = document.querySelector('#ad-form');
  document.querySelectorAll('[data-match]').forEach(link => link.addEventListener('click', () => {
    const match = document.querySelector('#ad-date');
    if (match) { match.value = link.dataset.match; match.setCustomValidity(''); }
  }));
  if (adForm && !document.querySelector('[data-ad-step]')) adForm.addEventListener('submit', event => {
    event.preventDefault();
    const blank = [...adForm.querySelectorAll('[name]')].find(field => !field.value.trim());
    if (blank) { blank.setCustomValidity('Completa este campo.'); blank.reportValidity(); blank.addEventListener('input', () => blank.setCustomValidity(''), {once:true}); return; }
    const lines = ['Hola, deseo cotizar minutos publicitarios en el Estadio Monumental.', '', 'Spectra Rental, unidad de negocios de Mentora International S.A.C., identificada con RUC N.° 20614487268.', '', ...[...adForm.querySelectorAll('[name]')].map(field => `${field.dataset.label}: ${field.value}`), '', 'Precios sin IGV; se añade 18%. Pago: 50% de adelanto y 50% antes del evento.'];
    const url = `https://wa.me/51902558540?text=${encodeURIComponent(lines.join('\n'))}`;
    const status = adForm.querySelector('.status-message');
    status.classList.add('show');
    status.textContent = 'Tu solicitud está lista. ';
    const link = document.createElement('a'); link.href=url; link.target='_blank'; link.rel='noopener'; link.textContent='Abrir WhatsApp y enviar'; status.append(link);
    window.open(url, '_blank', 'noopener');
  });
})();
