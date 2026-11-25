// KKE loading intro: K-Bot sweeps a white strip across the screen as the loading bar,
// then the strip and logo pop, shrink away, and the real homepage slides up.
// It only runs when the inline gate in index.html added .intro-on to <html>.
// Any failure removes the overlay so the homepage is shown directly.

const html = document.documentElement;
const SITE = new URL('../', import.meta.url);
const asset = (path) => new URL(path, SITE).href;
const introAsset = (path) => new URL(`./intro/${path}`, import.meta.url).href;

// Sprite sheet made from the K-Bot GIF: 50 frames, 10 columns x 5 rows, already turned to face right.
const COLS = 10;
const ROWS = 5;
const FRAMES = 50;
const CELL_RATIO = 224 / 338; // frame height / frame width
const BROOM_EDGE = 0.89; // where the broom head sits across the frame (0 = back of K-Bot, 1 = tip of broom)
const LANE = 0.31; // strip height as a share of K-Bot's width
const LOGO_RATIO = 900 / 394;
const STEP = 0.028; // distance travelled per sprite frame, as a share of K-Bot's width
const MAX_RATE = 0.7; // fastest pass: 0 to 100% in about 1.4 seconds
const POP_MS = 230;
const SHRINK_MS = 350;
const SLIDE_MS = 780;
const HARD_LIMIT_MS = 25000;

const clamp = (min, value, max) => Math.max(min, Math.min(max, value));
const make = (tag, className) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
};
const withTimeout = (promise, ms) => Promise.race([promise, new Promise((resolve) => setTimeout(resolve, ms))]);

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.decoding = 'async';
    img.src = src;
  });
}

async function run() {
  try { sessionStorage.setItem('kke-intro', '1'); } catch (error) { /* private mode: it just plays again next visit */ }

  const app = document.querySelector('#app');
  if (!app || !('animate' in app)) throw new Error('Intro not supported');

  // 1. Start measuring what the homepage needs, right away.
  const resources = [];
  const track = async (url, estimate) => {
    const record = { loaded: 0, total: estimate };
    resources.push(record);
    try {
      const response = await fetch(url);
      const length = Number(response.headers.get('content-length'));
      if (length > 0) record.total = length;
      if (!response.body) {
        await response.arrayBuffer();
      } else {
        const reader = response.body.getReader();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          record.loaded += value.length;
        }
      }
    } catch (error) { /* a missing asset must not hold the page hostage */ }
    record.total = record.loaded = Math.max(record.loaded, 1);
  };
  const needed = [
    track(asset('assets/site.json'), 30000),
    track(asset('assets/images/home-hero-cleaning-v2.jpg'), 260000),
    track(asset('assets/images/kke-logo-hd.png'), 150000)
  ];
  const flags = { fonts: false, rendered: false };
  withTimeout(Promise.all([document.fonts.load('600 1em Montserrat'), document.fonts.load('400 1em "Open Sans"')]), 4000)
    .catch(() => {}).then(() => { flags.fonts = true; });
  const watchRender = () => {
    const hero = app.querySelector('.video-hero__background');
    if (!app.querySelector('.site-header') || !hero) return false;
    withTimeout(hero.decode().catch(() => {}), 3000).then(() => { flags.rendered = true; });
    return true;
  };
  if (!watchRender()) {
    const observer = new MutationObserver(() => { if (watchRender()) observer.disconnect(); });
    observer.observe(app, { childList: true, subtree: true });
  }

  // 2. Load the intro's own artwork. If K-Bot or the logo is missing, skip the intro.
  const [sprite, logo] = await withTimeout(Promise.all([loadImage(introAsset('kbot-sprite.webp')), loadImage(introAsset('kke-logo.webp'))]), 8000);
  if (!sprite || !logo) throw new Error('Intro artwork did not load');
  let propList = [];
  try {
    const manifest = await withTimeout(fetch(introAsset('props.json')).then((r) => (r.ok ? r.json() : [])), 3000);
    const loaded = await withTimeout(Promise.all((manifest || []).map((item) => loadImage(introAsset(item.src)).then((img) => ({ ...item, img })).catch(() => null))), 5000);
    propList = (loaded || []).filter(Boolean);
  } catch (error) { propList = []; }

  // 3. Build the scene.
  const overlay = make('div', 'kke-intro');
  const status = make('p', 'kke-intro__status');
  status.setAttribute('role', 'status');
  status.textContent = 'Loading KKE Cleaning Services';
  const propLayer = make('div', 'kke-intro__props');
  const zoom = make('div', 'kke-intro__zoom');
  const reveal = make('div', 'kke-intro__reveal');
  const logoImg = make('img', 'kke-intro__logo');
  logoImg.alt = '';
  logoImg.src = introAsset('kke-logo.webp');
  reveal.append(logoImg);
  zoom.append(reveal);
  const bot = make('div', 'kke-intro__bot');
  bot.setAttribute('aria-hidden', 'true');
  const skip = make('button', 'kke-intro__skip');
  skip.type = 'button';
  skip.textContent = 'Skip intro';
  overlay.append(status, propLayer, zoom, bot, skip);
  document.body.append(overlay);
  app.inert = true;

  const props = propList.map((item) => {
    const node = make('img', 'kke-intro__prop');
    node.alt = '';
    node.src = introAsset(item.src);
    node.draggable = false;
    propLayer.append(node);
    return { node, w: item.w, h: item.h, top: item.top, xShare: item.x, vShare: item.v, x: 0, y: 0, rotate: 0, shown: true };
  });

  // 4. Layout: everything is calculated from the current screen, so it adapts to rotation and resizing.
  let vw = 0, vh = 0, botW = 0, botH = 0, laneH = 0;
  const PROP_TURN = [-18, 14, 20, -12, 16, -20];

  function layout() {
    vw = html.clientWidth;
    vh = window.innerHeight;
    botW = clamp(230, vw * 0.32, 560);
    botW = Math.min(botW, vh * 0.55 / CELL_RATIO); // keep K-Bot well inside short landscape screens
    botH = botW * CELL_RATIO;
    laneH = botW * LANE;
    bot.style.width = `${botW}px`;
    bot.style.height = `${botH}px`;
    bot.style.top = `${(vh - botH) / 2}px`;
    reveal.style.top = `${(vh - laneH) / 2}px`;
    reveal.style.height = `${laneH}px`;
    const logoH = Math.min(laneH * 0.86, (vw * 0.78) / LOGO_RATIO);
    logoImg.style.height = `${logoH}px`;
    logoImg.style.width = `${logoH * LOGO_RATIO}px`;

    // Props sit in the free space above and below K-Bot's path: spread on desktop, closer on tablet, fewer on phones.
    const band = (vh - botH) / 2;
    const phone = vw < 600;
    const squeeze = phone ? 0.8 : vw < 1100 ? 0.72 : 1; // closer together on tablet and phone
    const phoneSet = [0, 3, 4, 5]; // fewer props on narrow phones, still spread across the width
    const artScale = clamp(0.8, vw / 1280, 1.4); // the props art was drawn for a 1280 wide screen
    props.forEach((prop, index) => {
      const top = prop.top;
      prop.shown = (!phone || phoneSet.includes(index)) && band >= 56;
      prop.node.style.display = prop.shown ? '' : 'none';
      if (!prop.shown) return;
      const scale = Math.min(artScale, (band * 0.55) / Math.max(prop.w, prop.h));
      prop.dw = prop.w * scale;
      prop.dh = prop.h * scale;
      prop.node.style.width = `${prop.dw}px`;
      prop.node.style.height = `${prop.dh}px`;
      const xShare = 0.5 + (prop.xShare - 0.5) * squeeze;
      const free = Math.max(0, band - prop.dh - vh * 0.04);
      prop.x = vw * xShare;
      prop.y = top ? vh * 0.02 + prop.dh / 2 + free * prop.vShare : vh - vh * 0.02 - prop.dh / 2 - free * prop.vShare;
      prop.rotate = 0; // the art already has its own angles
      prop.node.style.transform = `translate(${prop.x - prop.dw / 2}px, ${prop.y - prop.dh / 2}px) rotate(${prop.rotate}deg)`;
    });
  }

  // 5. Draw K-Bot, the strip and the logo for a given progress (0 to 1).
  function draw(progress) {
    const travel = progress * (vw + botW);
    const left = -botW + travel; // fully off the left edge at 0, fully off the right edge at 1
    const frame = Math.floor(travel / (botW * STEP)) % FRAMES; // frames follow distance, so steps freeze when the load stalls
    bot.style.transform = `translate3d(${left}px, 0, 0)`;
    bot.style.backgroundPosition = `${(frame % COLS) / (COLS - 1) * 100}% ${Math.floor(frame / COLS) / (ROWS - 1) * 100}%`;
    const edge = left + botW * BROOM_EDGE;
    const hidden = clamp(0, vw - edge, vw);
    reveal.style.clipPath = `inset(0 ${hidden}px 0 0)`;
  }

  layout();
  draw(0);
  props.forEach((prop, index) => {
    if (!prop.shown) return;
    prop.node.animate([{ opacity: 0, scale: '0.6' }, { opacity: 1, scale: '1' }], { duration: 320, delay: 60 + index * 50, easing: 'cubic-bezier(.2,.9,.3,1.2)', fill: 'backwards' });
  });
  window.addEventListener('resize', onResize);
  function onResize() { layout(); draw(shown); }

  // 6. Progress: measured bytes for the assets the homepage needs, plus fonts and first render.
  const measure = () => {
    let loaded = 0, total = 0;
    resources.forEach((r) => { loaded += Math.min(r.loaded, r.total); total += r.total; });
    const bytes = total ? loaded / total : 0;
    return 0.88 * bytes + 0.06 * (flags.fonts ? 1 : 0) + 0.06 * (flags.rendered ? 1 : 0);
  };
  let shown = 0; // what K-Bot has reached so far
  let speed = 0;
  let last = performance.now();
  let frameId = 0;
  let finished = false;
  let settled = false;
  Promise.all(needed).then(() => { settled = true; });

  const tick = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const target = flags.fonts && flags.rendered && settled ? 1 : Math.min(measure(), 0.985);
    const want = clamp(0, (target - shown) / Math.max(dt, 0.001), MAX_RATE);
    speed += (want - speed) * (1 - Math.exp(-dt * 9));
    shown = Math.min(target, shown + speed * dt);
    if (target >= 1 && shown > 0.9995) shown = 1;
    draw(shown);
    status.textContent = `Loading KKE Cleaning Services ${Math.round(shown * 100)} percent`;
    if (shown >= 1) { complete(); return; }
    frameId = requestAnimationFrame(tick);
  };

  // 7. After K-Bot leaves: pop, shrink with the props pulled in, then slide the homepage up.
  function cleanup() {
    window.removeEventListener('resize', onResize);
    overlay.remove();
    app.inert = false;
    html.classList.remove('intro-on');
    window.scrollTo(0, 0);
  }

  function slideUp() {
    app.inert = false;
    const slide = app.animate([{ transform: 'translateY(100vh)' }, { transform: 'translateY(0)' }], { duration: SLIDE_MS, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
    return slide.finished.then(() => { slide.cancel(); cleanup(); }, cleanup);
  }

  async function complete() {
    if (finished) return;
    finished = true;
    skip.remove();
    const pop = zoom.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.16)' }], { duration: POP_MS, easing: 'cubic-bezier(.2,.9,.3,1.1)', fill: 'forwards' });
    await pop.finished;
    // Zero hold: the shrink starts the instant the pop ends, and the props are pulled in at the same moment.
    const cx = vw / 2;
    const cy = vh / 2;
    props.forEach((prop, index) => {
      if (!prop.shown) return;
      const turn = PROP_TURN[index % PROP_TURN.length];
      const at = (x, y, rotate, scale) => `translate(${x - prop.dw / 2}px, ${y - prop.dh / 2}px) rotate(${rotate}deg) scale(${scale})`;
      prop.node.animate([
        { transform: at(prop.x, prop.y, prop.rotate, 1), offset: 0, easing: 'cubic-bezier(.45,0,.75,.7)' },
        { transform: at(prop.x + (cx - prop.x) * 0.35, cy, prop.rotate + turn, 0.3), offset: 0.7 },
        { transform: at(prop.x + (cx - prop.x) * 0.45, cy, prop.rotate + turn * 1.4, 0), offset: 1 }
      ], { duration: SHRINK_MS, fill: 'forwards' });
    });
    const shrink = zoom.animate([{ transform: 'scale(1.16)' }, { transform: 'scale(0)' }], { duration: SHRINK_MS, easing: 'cubic-bezier(.5,0,.85,.55)', fill: 'forwards' });
    await shrink.finished;
    await slideUp();
  }

  function skipNow() {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(frameId);
    propLayer.hidden = true;
    zoom.hidden = true;
    bot.hidden = true;
    skip.remove();
    slideUp();
  }
  skip.addEventListener('click', skipNow);
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', (event) => { if (event.matches) skipNow(); });
  setTimeout(() => { if (!finished) skipNow(); }, HARD_LIMIT_MS);

  frameId = requestAnimationFrame((now) => { last = now; tick(now); });
}

// The inline gate in index.html decides whether the intro plays; without it, do nothing.
(html.classList.contains('intro-on') ? run() : Promise.resolve()).catch(() => {
  // The intro could not start: show the homepage directly.
  document.querySelector('.kke-intro')?.remove();
  const app = document.querySelector('#app');
  if (app) app.inert = false;
  html.classList.remove('intro-on');
});
