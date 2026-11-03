const data = await fetch('/assets/site.json').then((response) => {
  if (!response.ok) throw new Error('Could not load site data.');
  return response.json();
});

const app = document.querySelector('#app');
const currentPath = window.location.pathname.replace(/index\.html$/, '') || '/';
const page = currentPath.startsWith('/work')
  ? 'work'
  : currentPath.startsWith('/services')
    ? 'services'
    : currentPath.startsWith('/about')
      ? 'about'
      : currentPath.startsWith('/contact')
        ? 'contact'
        : 'home';

const arrow = '<span class="button__arrow" aria-hidden="true">↗</span>';

function button(label, href = '/contact/', style = 'primary') {
  return `<a class="button button--${style}" href="${href}"><span>${label}</span>${arrow}</a>`;
}

function header() {
  const links = data.navigation.map((item, index) => {
    const target = item.href === '/' ? 'home' : item.href.split('/')[1];
    return `<a class="nav-link ${target === page ? 'is-active' : ''}" href="${item.href}" style="--nav-order:${index}" ${target === page ? 'aria-current="page"' : ''}><span class="nav-link__index">0${index + 1}</span><span>${item.label}</span></a>`;
  }).join('');
  return `
    <header class="site-header" data-header>
      <a class="brand" href="/" aria-label="KKE Cleaning Services home">
        <img src="/assets/images/kke-logo.png" alt="KKE Cleaning Services" />
      </a>
      <nav class="desktop-nav" aria-label="Primary navigation">${links}</nav>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu">
        <span>MENU</span><span class="menu-symbol">+</span>
      </button>
    </header>
    <div class="mobile-menu" id="mobile-menu" aria-hidden="true">
      <div class="mobile-menu__top">
        <img src="/assets/images/kke-logo.png" alt="" />
        <button class="menu-close" type="button" aria-label="Close menu">×</button>
      </div>
      <nav aria-label="Mobile navigation">${links}</nav>
      <div class="mobile-menu__contact">
        <a href="tel:${data.company.phoneHref}">${data.company.phone}</a>
        <a href="mailto:${data.company.email}">${data.company.email}</a>
      </div>
    </div>`;
}

function logoItem(client) {
  if (client.image) {
    return `<div class="logo-item"><img src="${client.image}" alt="${client.name}" loading="lazy" /></div>`;
  }
  if (client.kind === 'mke') {
    return `<div class="logo-item logo-item--text"><b class="mke-mark">M</b><strong>MKE METAL</strong></div>`;
  }
  return `<div class="logo-item logo-item--text logo-item--multi"><b>MR</b><strong>MULTI-REALTY</strong></div>`;
}

function logoLoop() {
  const sequence = data.clients.map(logoItem).join('');
  return `
    <section class="logo-loop section" aria-label="Selected KKE clients">
      <p class="eyebrow logo-loop__label">TRUSTED ACROSS WORKING ENVIRONMENTS</p>
      <div class="logo-loop__viewport">
        <div class="logo-loop__track">${sequence}${sequence}</div>
      </div>
    </section>`;
}

function footer() {
  const links = data.navigation.map((item) => `<a href="${item.href}">${item.label}</a>`).join('');
  return `
    <footer class="site-footer">
      <div class="footer-accent"></div>
      <div class="footer-grid container">
        <div class="footer-intro">
          <h2>Ready when your site is.</h2>
          <p>Cleaning support for offices, factories, renovation sites and homes.</p>
          ${button('Request a quote', '/contact/', 'outline-light')}
        </div>
        <nav class="footer-links" aria-label="Footer navigation">${links}</nav>
        <div class="footer-links">
          <a href="https://wa.me/${data.company.phoneHref.replace('+', '')}" target="_blank" rel="noreferrer">WhatsApp</a>
          <a href="mailto:${data.company.email}">Email</a>
          <a href="tel:${data.company.phoneHref}">Call</a>
        </div>
      </div>
      <div class="footer-meta container">
        <p>SEREMBAN — NEGERI SEMBILAN<br />MALAYSIA</p>
        <p><a href="mailto:${data.company.email}">${data.company.email}</a><br /><a href="tel:${data.company.phoneHref}">${data.company.phone}</a></p>
        <p>©2026 KKE<br />${data.company.registration}</p>
      </div>
      <div class="footer-wordmark" aria-hidden="true">KKE CLEANING SERVICES</div>
    </footer>`;
}

function floatingWhatsapp() {
  return `<a class="floating-whatsapp" href="https://wa.me/${data.company.phoneHref.replace('+', '')}" target="_blank" rel="noreferrer" aria-label="Chat with KKE on WhatsApp">
    <span class="floating-whatsapp__icon" aria-hidden="true">WA</span>
    <span>WhatsApp</span>
  </a>`;
}

function metrics(custom = data.metrics) {
  return `<div class="metrics">${custom.map((item) => {
    const numericValue = Number.parseInt(item.value, 10);
    const suffix = String(item.value).includes('+') ? '+' : '';
    const valueMarkup = numericValue < 1000
      ? `<strong data-count-target="${numericValue}" data-count-suffix="${suffix}">0${suffix}</strong>`
      : `<strong>${item.value}</strong>`;
    return `<div class="metric reveal">${valueMarkup}<span>${item.label}</span></div>`;
  }).join('')}</div>`;
}

function comparison({ before, after, beforeLabel = 'BEFORE', afterLabel = 'AFTER', className = '' }) {
  return `
    <div class="comparison ${className}" style="--split: 50%">
      <img class="comparison__base" src="${after}" alt="${afterLabel.toLowerCase()} cleaning view" />
      <div class="comparison__after"><img src="${before}" alt="${beforeLabel.toLowerCase()} cleaning view" /></div>
      <span class="comparison__label comparison__label--before">${beforeLabel}</span>
      <span class="comparison__label comparison__label--after">${afterLabel}</span>
      <div class="comparison__line" aria-hidden="true"><span>↔</span></div>
      <input class="comparison__range" type="range" min="0" max="100" value="50" aria-label="Drag to compare before and after" />
    </div>`;
}

function pageIntro(eyebrow, title, copy) {
  return `<section class="page-intro container reveal">
    <div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1></div>
    <p class="page-intro__copy">${copy}</p>
  </section>`;
}

function homePage() {
  return `
    <main>
      <div class="video-hero-shell">
        <section class="home-hero home-hero--video reveal">
          <img class="video-hero__background video-hero__background--motion" src="/assets/images/home-hero-cleaning-v2.png" alt="" aria-hidden="true" />
          <div class="video-hero__veil" aria-hidden="true"></div>
          <div class="video-hero__content">
            <div class="video-hero__copy">
              <div class="video-hero__badge"><span aria-hidden="true"></span>Professional cleaning in Seremban</div>
              <h1>Professional cleaning.<br />Done properly.</h1>
              <p>Trusted cleaning teams for offices, factories, renovation sites and homes—delivering spotless, hygienic spaces on every visit.</p>
            </div>
            <article class="video-hero__stat">
              <div><strong>18+</strong><span>Years of reliable operations</span></div>
              <a href="https://wa.me/${data.company.phoneHref.replace('+', '')}" target="_blank" rel="noreferrer"><span aria-hidden="true">↗</span>WhatsApp</a>
            </article>
            <a class="video-hero__corner" href="/contact/" aria-label="Request a quotation">
              <span class="video-hero__mask video-hero__mask--top" aria-hidden="true"><svg width="100%" height="100%" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M56 56V0C56 30.9279 30.9279 56 0 56H56Z" fill="currentColor"/></svg></span>
              <span class="video-hero__mask video-hero__mask--left" aria-hidden="true"><svg width="100%" height="100%" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M56 56H0C30.9279 56 56 30.9279 56 0V56Z" fill="currentColor"/></svg></span>
              <span class="video-hero__corner-icon" aria-hidden="true">↗</span>
              <span class="video-hero__corner-copy"><strong>Request a quote</strong><small>Start enquiry <span aria-hidden="true">›</span></small></span>
            </a>
          </div>
        </section>
      </div>
      <section class="container metrics-section">${metrics()}</section>
      <section class="services-preview section container">
        <div class="section-heading reveal">
          <p class="eyebrow">SERVICES / 01—05</p>
          <h2>Cleaning systems for<br />spaces that cannot slow down.</h2>
        </div>
        <div class="service-browser reveal" data-service-browser>
          <div class="service-browser__tabs">
            <p class="eyebrow">SELECT A SERVICE</p>
            ${data.services.map((service, index) => `<button type="button" data-service-index="${index}" class="service-tab ${index === 1 ? 'is-active' : ''}"><span>${service.number}</span>${service.name}</button>`).join('')}
          </div>
          <article class="service-feature">
            <div class="service-feature__copy">
              <p class="eyebrow" data-service-type>${data.services[1].type}</p>
              <span class="service-number" data-service-number>${data.services[1].number}</span>
              <h3 data-service-title>${data.services[1].title}</h3>
              <p data-service-copy>${data.services[1].description}</p>
              ${button('View services', '/services/', 'secondary')}
            </div>
            <img data-service-image src="${data.services[1].image}" alt="Factory cleaning" />
          </article>
          <article class="mini-card"><p class="eyebrow">WORKFORCE</p><h3>Scalable teams for complex sites.</h3><p>Up to 35 personnel with site supervision and operational support.</p></article>
          <article class="mini-card"><p class="eyebrow">QUALITY PROOF</p><h3>Before / after transformation.</h3><div class="mini-proof"><img src="/assets/images/office-before-generated.png" alt="Office before cleaning"><img src="/assets/images/project-office.png" alt="Office after cleaning"></div></article>
        </div>
      </section>
      ${logoLoop()}
      <section class="proof-banner section container reveal">
        ${comparison({ before: '/assets/images/office-before-generated.png', after: '/assets/images/project-office.png', className: 'comparison--banner' })}
        <div class="proof-banner__content"><h2>From occupied to ready.</h2><p>See KKE’s cleaning proof, then request a site-specific quotation.</p>${button('View work', '/work/')}</div>
      </section>
    </main>`;
}

function workPage() {
  const filters = ['All', 'Industrial', 'Office', 'Healthcare', 'Post-reno'];
  return `
    <main>
      ${pageIntro('SELECTED WORK / PROOF', 'Proof that scales<br />with the site.', 'Selected cleaning work across industrial, corporate, healthcare, property and institutional environments.')}
      <section class="container reveal">
        ${comparison({ before: '/assets/images/factory-before-generated.png', after: '/assets/images/proof-after.png', beforeLabel: 'BEFORE / ACTIVE SITE', afterLabel: 'AFTER / SERVICE COMPLETE', className: 'comparison--hero' })}
        <div class="proof-caption"><h3>Industrial facility cleaning</h3><p>Production floor / Negeri Sembilan · Recurring service contract</p></div>
      </section>
      ${logoLoop()}
      <section class="industries section container">
        <div class="section-heading reveal"><p class="eyebrow">INDUSTRIES / 01—07</p><h2>Built for the environments<br />that keep Malaysia moving.</h2></div>
        <div class="industry-grid">${data.industries.map((industry) => `
          <article class="industry-card reveal"><span>${industry.number}</span><h3>${industry.name}</h3><p>${industry.copy}</p></article>`).join('')}</div>
      </section>
      <section class="work-grid section container">
        <div class="section-heading"><p class="eyebrow">PROJECT INDEX</p><h2>Work organized by environment.</h2></div>
        <div class="filters" role="group" aria-label="Filter projects">${filters.map((filter, index) => `<button class="filter ${index === 0 ? 'is-active' : ''}" data-filter="${filter.toLowerCase()}">${filter}</button>`).join('')}</div>
        <div class="project-grid">${data.projects.map((project) => `
          <article class="project-card reveal" data-category="${project.tag.toLowerCase()}">
            <div class="project-card__image"><img src="${project.image}" alt="${project.title}" loading="lazy" /><span>${project.tag}</span></div>
            <div class="project-card__meta"><small>${project.number}</small><a href="/contact/" aria-label="Ask about ${project.title}">${arrow}</a></div>
            <h3>${project.title}</h3><p>${project.description}</p>
          </article>`).join('')}</div>
      </section>
    </main>`;
}

function servicesPage() {
  return `
    <main>
      ${pageIntro('SERVICE SYSTEMS / 01—05', 'The right cleaning system<br />for every environment.', 'From daily maintenance to specialist handovers, every scope is shaped around the way your site operates.')}
      <section class="service-index container">
        <div class="service-index__nav reveal">
          <p class="eyebrow">SERVICE INDEX</p>
          ${data.services.map((service, index) => `<a href="#service-${service.id}" class="${index === 0 ? 'is-active' : ''}" data-service-anchor="${service.id}">${service.short}</a>`).join('')}
          <p>Select a service to see its scope and environment.</p>
        </div>
        <div class="service-stack" data-scroll-stack>${data.services.map((service, index) => `
          <article class="service-card reveal" id="service-${service.id}" style="--stack-index:${index};--stack-offset:${index * 10}px">
            <div class="service-card__top"><span>${service.number}</span><p class="eyebrow">${service.type}</p></div>
            <div class="service-card__copy"><h2>${service.name}</h2><p>${service.description}</p><ul class="service-scope">${service.scope.map((item) => `<li>${item}</li>`).join('')}</ul>${button('Request scope', '/contact/', 'secondary')}</div>
            <img src="${service.image}" alt="${service.name}" loading="lazy" />
          </article>`).join('')}</div>
      </section>
      <section class="service-proof section container">
        <div class="section-heading"><p class="eyebrow">HANDOVER PROOF</p><h2>Drag to compare the finish.</h2></div>
        ${comparison({ before: '/assets/images/reno-before-generated.png', after: '/assets/images/project-renovation.png', beforeLabel: 'BEFORE / RENOVATION RESIDUE', afterLabel: 'AFTER / READY FOR HANDOVER', className: 'comparison--wide' })}
      </section>
      <section class="process section container">
        <p class="eyebrow">HOW IT WORKS</p>
        <div class="process-grid">${data.process.map((step, index) => `<div class="process-step reveal"><span>0${index + 1}</span><h3>${step}</h3></div>`).join('')}</div>
        <div class="process-cta reveal"><div><p class="eyebrow">NEED HELP CHOOSING?</p><h2>Not sure which service fits?</h2><p>Send the site details and KKE will guide the scope.</p></div>${button('Start a quote')}</div>
      </section>
      ${logoLoop()}
    </main>`;
}

function aboutPage() {
  const aboutMetrics = [
    { value: '2007', label: 'Founded' }, { value: '18+', label: 'Years experience' },
    { value: '35', label: 'Cleaning personnel' }, { value: '5', label: 'Operational drivers' }
  ];
  return `
    <main>
      <section class="about-hero container">
        <div class="about-hero__copy reveal"><p class="eyebrow">ABOUT KKE / SEREMBAN</p><h1>Built in Seremban.<br />Trusted since 2007.</h1><p>From Vision Cleaning Services to KKE: a professional operation built on reliability, quality workmanship and long-term client relationships.</p>${button('Meet the operation', '#operation')}</div>
        <img class="reveal" src="/assets/images/about-team.png" alt="KKE cleaning team at work" />
      </section>
      <section class="container metrics-section">${metrics(aboutMetrics)}</section>
      <section class="timeline-section section container" id="operation">
        <div class="section-heading"><p class="eyebrow">OUR JOURNEY</p><h2>Growth without losing<br />the detail.</h2></div>
        <div class="timeline">${data.timeline.map((item) => `<article class="timeline-item reveal"><span>${item.period}</span><div><h3>${item.title}</h3><p>${item.copy}</p></div></article>`).join('')}</div>
      </section>
      <section class="director section container reveal">
        <div class="director__portrait"><img src="/assets/images/director.svg" alt="Portrait illustration of Mr. Kenny Loh" /></div>
        <div class="director__copy"><p class="eyebrow">OPERATIONS LEADERSHIP</p><h2>Mr. Kenny Loh</h2><h3>Operations Director</h3><p>Operational planning, workforce coordination, quality assurance and client relationship management.</p></div>
        <div class="director__stat"><span>ORGANIZATION</span><strong>A scalable team for projects of varying size.</strong><p>35 personnel / 5 drivers / supervisors / admin support</p></div>
      </section>
      <section class="values section container">${data.values.map((value) => `<article class="value-card reveal"><p class="eyebrow">${value.label}</p><h3>${value.copy}</h3></article>`).join('')}</section>
      ${logoLoop()}
    </main>`;
}

function field(label, placeholder, type = 'text', full = false, name = '', required = true) {
  const fieldName = name || label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const requiredAttribute = required ? 'required' : '';
  if (type === 'textarea') return `<label class="field ${full ? 'field--full' : ''}"><span>${label}</span><textarea name="${fieldName}" placeholder="${placeholder}" rows="4" ${requiredAttribute}></textarea></label>`;
  if (type === 'select') return `<label class="field ${full ? 'field--full' : ''}"><span>${label}</span><select name="${fieldName}" ${requiredAttribute}><option value="">${placeholder}</option>${data.services.map((service) => `<option value="${service.id}">${service.name}</option>`).join('')}</select></label>`;
  return `<label class="field ${full ? 'field--full' : ''}"><span>${label}</span><input name="${fieldName}" type="${type}" placeholder="${placeholder}" ${requiredAttribute} /></label>`;
}

function contactPage() {
  return `
    <main>
      ${pageIntro('REQUEST A QUOTATION', 'Tell us about the site.<br />We will shape the scope.', 'A guided quotation flow for corporate sites, factories, renovation handovers and homes.')}
      <section class="contact-layout container">
        <form class="quote-form reveal" data-quote-form>
          <div class="form-heading"><p class="eyebrow">START HERE</p><h2>Request a site quotation</h2><p>Complete the three steps. KKE will review the details and contact you directly.</p></div>
          <ol class="form-steps"><li class="is-active" data-form-indicator="0"><b>1</b><span>Site</span></li><li data-form-indicator="1"><b>2</b><span>Schedule</span></li><li data-form-indicator="2"><b>3</b><span>Contact</span></li></ol>
          <div class="form-progress" aria-hidden="true"><span data-form-progress></span></div>
          <section class="form-panel" data-form-step="0">
            <div class="form-grid">
              ${field('Service category', 'Select a service', 'select', false, 'service')}
              ${field('Property / site type', 'Office, facility, warehouse, clinic, house…', 'text', false, 'site-type')}
              ${field('Site size / rooms', 'Approximate area, floors, rooms or zones', 'text', false, 'site-size', false)}
              ${field('Location / area', 'Seremban or surrounding area', 'text', false, 'location')}
            </div>
            <div class="form-actions form-actions--end"><button class="button button--primary" type="button" data-form-next><span>Continue</span>${arrow}</button></div>
          </section>
          <section class="form-panel" data-form-step="1" hidden>
            <div class="form-grid">
              ${field('Preferred schedule', 'One-off, daily, weekly or monthly', 'text', false, 'schedule')}
              ${field('Target start date', 'Preferred timing', 'date', false, 'start-date', false)}
              ${field('Site notes / access / special requirements', 'Add details that will help KKE prepare the scope…', 'textarea', true, 'notes', false)}
            </div>
            <div class="form-actions"><button class="button button--secondary" type="button" data-form-back><span>Back</span></button><button class="button button--primary" type="button" data-form-next><span>Continue</span>${arrow}</button></div>
          </section>
          <section class="form-panel" data-form-step="2" hidden>
            <div class="form-grid">
              ${field('Name / company', 'Contact person and organization', 'text', false, 'name')}
              ${field('Phone / email', 'Best contact channel', 'text', false, 'contact')}
            </div>
            <label class="consent"><input name="consent" type="checkbox" required /><span>I agree to be contacted about this quotation request.</span></label>
            <div class="form-actions"><button class="button button--secondary" type="button" data-form-back><span>Back</span></button><button class="button button--primary form-submit" type="submit"><span>Send quotation request</span>${arrow}</button></div>
            <p class="form-note">No payment or account required.</p>
          </section>
          <div class="form-success" role="status" hidden><strong>Thank you — your request is ready.</strong><p>This demo keeps the details in your browser. Connect the form to your preferred email or CRM before publishing.</p></div>
        </form>
        <aside class="contact-aside">
          <article class="contact-card contact-card--dark reveal"><p class="eyebrow">DIRECT CONTACT</p><h2>Prefer a quick conversation?</h2><a href="tel:${data.company.phoneHref}">${data.company.phone}</a><a href="mailto:${data.company.email}">${data.company.email}</a></article>
          <article class="map-card reveal"><iframe class="map-embed" title="Map showing KKE Cleaning Services in Seremban" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${encodeURIComponent(data.company.address.join(', '))}&output=embed"></iframe><p class="eyebrow">KKE OFFICE</p><h3>${data.company.address[0]}</h3><p>${data.company.address.slice(1).join('<br />')}</p><a href="https://maps.google.com/?q=${encodeURIComponent(data.company.address.join(', '))}" target="_blank" rel="noreferrer">Open in Google Maps ${arrow}</a></article>
          <article class="coverage-card reveal"><p class="eyebrow">SERVICE COVERAGE</p><h2>Negeri Sembilan +<br />surrounding areas.</h2><p>Corporate contracts, recurring maintenance and project cleaning.</p></article>
        </aside>
      </section>
      <section class="faq section container">
        <div class="section-heading"><p class="eyebrow">QUOTATION FAQ</p><h2>Common quotation questions.</h2></div>
        <div class="faq-list">${data.faqs.map((item) => `<details class="reveal"><summary>${item.q}<span>+</span></summary><p>${item.a}</p></details>`).join('')}</div>
      </section>
      ${logoLoop()}
    </main>`;
}

const renderers = { home: homePage, work: workPage, services: servicesPage, about: aboutPage, contact: contactPage };
app.innerHTML = `${header()}${renderers[page]()}${footer()}${floatingWhatsapp()}`;
document.body.dataset.page = page;

const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.mobile-menu');
const closeButton = document.querySelector('.menu-close');
function setMenu(open) {
  menu.classList.toggle('is-open', open);
  menu.setAttribute('aria-hidden', String(!open));
  menuButton.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
}
menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
closeButton?.addEventListener('click', () => setMenu(false));
menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu?.classList.contains('is-open')) setMenu(false);
});

document.querySelectorAll('.comparison').forEach((component) => {
  const range = component.querySelector('input');
  let dragging = false;
  const updateFromPointer = (event) => {
    const bounds = component.getBoundingClientRect();
    const value = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100));
    range.value = String(Math.round(value));
    component.style.setProperty('--split', `${value}%`);
  };
  range.addEventListener('input', (event) => component.style.setProperty('--split', `${event.target.value}%`));
  component.addEventListener('pointerdown', (event) => {
    dragging = true;
    component.setPointerCapture?.(event.pointerId);
    updateFromPointer(event);
  });
  component.addEventListener('pointermove', (event) => {
    if (dragging) updateFromPointer(event);
  });
  component.addEventListener('pointerup', (event) => {
    dragging = false;
    component.releasePointerCapture?.(event.pointerId);
  });
  component.addEventListener('pointercancel', () => { dragging = false; });
});

const serviceBrowser = document.querySelector('[data-service-browser]');
serviceBrowser?.querySelectorAll('[data-service-index]').forEach((tab) => {
  tab.addEventListener('click', () => {
    const service = data.services[Number(tab.dataset.serviceIndex)];
    const feature = serviceBrowser.querySelector('.service-feature');
    serviceBrowser.querySelectorAll('.service-tab').forEach((item) => item.classList.remove('is-active'));
    tab.classList.add('is-active');
    feature.classList.add('is-changing');
    window.setTimeout(() => {
      serviceBrowser.querySelector('[data-service-type]').textContent = service.type;
      serviceBrowser.querySelector('[data-service-number]').textContent = service.number;
      serviceBrowser.querySelector('[data-service-title]').textContent = service.title;
      serviceBrowser.querySelector('[data-service-copy]').textContent = service.description;
      const image = serviceBrowser.querySelector('[data-service-image]');
      image.src = service.image;
      image.alt = service.name;
      feature.classList.remove('is-changing');
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 150);
  });
});

const serviceAnchors = document.querySelectorAll('[data-service-anchor]');
const serviceCards = document.querySelectorAll('.service-card[id]');
if (serviceAnchors.length && serviceCards.length) {
  const serviceObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const id = visible.target.id.replace('service-', '');
    serviceAnchors.forEach((anchor) => anchor.classList.toggle('is-active', anchor.dataset.serviceAnchor === id));
  }, { rootMargin: '-22% 0px -58% 0px', threshold: [0.1, 0.35, 0.7] });
  serviceCards.forEach((card) => serviceObserver.observe(card));
}

document.querySelectorAll('[data-filter]').forEach((filter) => {
  filter.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach((item) => item.classList.remove('is-active'));
    filter.classList.add('is-active');
    document.querySelectorAll('.project-card').forEach((card) => {
      const selected = filter.dataset.filter;
      card.hidden = selected !== 'all' && card.dataset.category !== selected;
    });
  });
});

document.querySelectorAll('details').forEach((detail) => detail.addEventListener('toggle', () => {
  detail.querySelector('summary span').textContent = detail.open ? '−' : '+';
}));

const quoteForm = document.querySelector('[data-quote-form]');
if (quoteForm) {
  const panels = [...quoteForm.querySelectorAll('[data-form-step]')];
  const indicators = [...quoteForm.querySelectorAll('[data-form-indicator]')];
  const progress = quoteForm.querySelector('[data-form-progress]');
  let currentStep = 0;

  const showStep = (nextStep) => {
    currentStep = Math.max(0, Math.min(nextStep, panels.length - 1));
    panels.forEach((panel, index) => { panel.hidden = index !== currentStep; });
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('is-active', index === currentStep);
      indicator.classList.toggle('is-complete', index < currentStep);
    });
    progress.style.width = `${((currentStep + 1) / panels.length) * 100}%`;
  };

  const stepIsValid = () => {
    const fields = [...panels[currentStep].querySelectorAll('input, select, textarea')];
    const invalidField = fields.find((field) => !field.checkValidity());
    if (invalidField) {
      invalidField.reportValidity();
      invalidField.focus();
      return false;
    }
    return true;
  };

  quoteForm.querySelectorAll('[data-form-next]').forEach((control) => control.addEventListener('click', () => {
    if (stepIsValid()) showStep(currentStep + 1);
  }));
  quoteForm.querySelectorAll('[data-form-back]').forEach((control) => control.addEventListener('click', () => showStep(currentStep - 1)));
  quoteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!stepIsValid()) return;
    panels.forEach((panel) => { panel.hidden = true; });
    quoteForm.querySelector('.form-steps').hidden = true;
    quoteForm.querySelector('.form-progress').hidden = true;
    const success = quoteForm.querySelector('.form-success');
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  showStep(0);
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    const target = Number(element.dataset.countTarget || 0);
    const suffix = element.dataset.countSuffix || '';
    const duration = 1100;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countObserver.unobserve(element);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count-target]').forEach((element) => countObserver.observe(element));

window.addEventListener('scroll', () => {
  const headerElement = document.querySelector('[data-header]');
  const currentY = window.scrollY;
  headerElement.classList.toggle('is-condensed', currentY > 16);
}, { passive: true });
