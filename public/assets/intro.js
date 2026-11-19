// KKE intro + page-transition curtain.
// - First visit in a browser session: a short logo-reveal intro (wipe + shine, progress line, no text).
// - Moving between pages: a curtain slides up, the next page loads, the curtain slides away.
// - Reduced-motion visitors get neither. Everything has a failsafe so the page can never stay covered.
const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const KEY_SEEN = 'kke-intro-seen';
const KEY_NAV = 'kke-nav';
const root = document.documentElement;
const logoUrl = new URL('./images/kke-logo.png', import.meta.url).href;

let mode = 'intro';
try {
  mode = sessionStorage.getItem(KEY_NAV) === '1' ? 'nav' : sessionStorage.getItem(KEY_SEEN) === '1' ? 'none' : 'intro';
  sessionStorage.removeItem(KEY_NAV);
  sessionStorage.setItem(KEY_SEEN, '1');
} catch { /* storage blocked: just show the intro */ }
if (reduce) mode = 'none';

let ready = false;
let onReady = () => {};
document.addEventListener('kke:ready', () => { ready = true; onReady(); }, { once: true });

// ---- Curtain (used for page-to-page transitions) ----
const curtain = document.createElement('div');
curtain.className = 'kke-curtain';
curtain.setAttribute('aria-hidden', 'true');
curtain.innerHTML = '<span>KKE</span>';
document.documentElement.append(curtain);

const reveal = () => {
  curtain.classList.remove('is-cover');
  curtain.classList.add('is-out');
  setTimeout(() => curtain.classList.remove('is-out'), 800);
};

if (mode === 'nav') {
  curtain.classList.add('is-cover');
  const go = () => setTimeout(reveal, 120);
  if (ready) go(); else onReady = go;
  setTimeout(() => { if (curtain.classList.contains('is-cover')) reveal(); }, 5000);
}

window.addEventListener('pageshow', (event) => {
  if (event.persisted) curtain.classList.remove('is-in', 'is-cover', 'is-out');
});

if (!reduce) {
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link || link.target || link.hasAttribute('download')) return;
    let url;
    try { url = new URL(link.href, location.href); } catch { return; }
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search) return;
    event.preventDefault();
    try { sessionStorage.setItem(KEY_NAV, '1'); } catch { /* ignore */ }
    curtain.classList.add('is-in');
    setTimeout(() => location.assign(url.href), 520);
  });
}

// ---- First-visit intro ----
if (mode === 'intro') {
  const intro = document.createElement('div');
  intro.className = 'kke-intro';
  intro.setAttribute('role', 'status');
  intro.setAttribute('aria-label', 'Loading KKE Cleaning Services');
  intro.innerHTML = `
    <div class="kke-intro__top"><span></span><button class="kke-intro__skip" type="button">Skip</button></div>
    <div class="kke-intro__stage"><div class="kke-intro__logo"><img src="${logoUrl}" alt="KKE Cleaning Services" /><span class="kke-intro__shine" aria-hidden="true"></span></div></div>
    <div class="kke-intro__foot" aria-hidden="true"><span class="kke-intro__bar"><i></i></span></div>`;
  document.documentElement.append(intro);
  root.classList.add('kke-lock');

  const barEl = intro.querySelector('.kke-intro__bar i');
  const MIN = 2300;
  const start = performance.now();
  let closed = false;
  let raf = 0;

  const close = () => {
    if (closed) return;
    closed = true;
    cancelAnimationFrame(raf);
    barEl.style.transform = 'scaleX(1)';
    intro.classList.add('is-leaving');
    setTimeout(() => { intro.remove(); root.classList.remove('kke-lock'); }, 950);
  };
  const tryClose = () => { if (ready && performance.now() - start >= MIN) close(); };
  onReady = () => setTimeout(tryClose, Math.max(0, MIN - (performance.now() - start)));

  const tick = (now) => {
    const p = Math.min((now - start) / MIN, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    barEl.style.transform = `scaleX(${eased})`;
    if (p < 1) raf = requestAnimationFrame(tick); else tryClose();
  };
  raf = requestAnimationFrame(tick);

  intro.querySelector('.kke-intro__skip').addEventListener('click', close);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
  setTimeout(close, 7000); // failsafe
}
