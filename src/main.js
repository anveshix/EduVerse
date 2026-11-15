// App shell: top bar, hash router, interactive 3D hero globe, discipline filter, sound/stars HUD, flip-card glossary, lazy module mounting.
import { h, $ } from './core/dom.js';
import * as store from './core/store.js';
import { exitProgress } from './core/progress.js';
import * as i18n from './core/i18n.js';
import { t, pair } from './core/i18n.js';
import { playTap, playFlip } from './core/sound.js';
import { bi, relabelBi } from './components/widgets.js';
import { UI_CORE } from './i18n/core.js';
import { OPENINGS } from './modules/openings.js';
import { MODULES, loadTeacherMeta } from './modules/registry.js';
import { HERO_MEDIA, THEME_MEDIA, themeBannerEl } from './core/media.js';
import { iconEl } from './engines/icons.js';
import { webglAvailable } from './engines/webgl.js';
import { createScene } from './engines/three-scene.js';
import { createHeroGlobe3d } from './components/diorama/hero-globe.js';

i18n.register(UI_CORE);
const root = $('#main'), bar = $('#topbar'), foot = $('#foot');
let cur = null; // { id, mod } mounted module
let heroCleanup = null; // Home 3D Earth cleanup handle
let heroSetMotion = null, heroRelabel = null, refreshHome = null;
let pendingHomeSection = null;
let CUR = null; // curriculum manifest
let activeFilter = 'all';
const DISC = { geography: 'disc.geography', history: 'disc.history', 'political-science': 'disc.political', economics: 'disc.economics', integrated: 'disc.integrated' };

async function boot() {
  const [cur_, gl] = await Promise.all([fetch('src/curriculum/curriculum.json').then((r) => r.json()), fetch('data/glossary.json').then((r) => r.json())]);
  CUR = cur_; i18n.setGlossary(gl.terms); window.__glossary = gl.terms;
  renderBar(); renderFoot(); applyPrefs(); updateStarPill(); i18n.apply(document);
  const skip = document.querySelector('.skip');
  skip.addEventListener('click', (event) => { event.preventDefault(); root.focus(); root.scrollIntoView?.({ block: 'start' }); });
  addEventListener('hashchange', route);
  store.subscribe((s, keys) => {
    if (keys.includes('lang')) onLang();
    if (keys.some((k) => ['sound', 'lowGraphics', 'reducedMotion', 'projector', 'teacher'].includes(k))) applyPrefs();
    if (keys.some((k) => ['stars', 'progress', 'lang'].includes(k))) updateStarPill();
    if (keys.includes('progress')) updateChapterComplete();
    if (keys.includes('reducedMotion')) heroSetMotion?.(s.reducedMotion);
    if (keys.includes('lowGraphics')) {
      const heroArt = root.querySelector('.hero-art');
      if (heroArt) { clearHomeGlobe(); if (!s.lowGraphics) mountHomeGlobe(heroArt); }
    }
  });
  route();
}
function applyPrefs() {
  const s = store.get(), c = document.documentElement.classList;
  c.toggle('low-g', !!s.lowGraphics); c.toggle('reduce-motion', !!s.reducedMotion); c.toggle('projector', !!s.projector); c.toggle('teacher', !!s.teacher);
  bar.querySelectorAll('[data-pref]').forEach((b) => b.setAttribute('aria-pressed', s[b.dataset.pref] ? 'true' : 'false'));
}
function updateStarPill() {
  const pill = bar.querySelector('.star-pill-val');
  if (pill) pill.textContent = String(store.summaryStats().starCount);
  const hudStars = root.querySelector('.hud-stars-n');
  if (hudStars) hudStars.textContent = String(store.summaryStats().starCount);
}
function revealHomeSection(target) {
  if (target.tagName === 'DETAILS') target.open = true;
  target.scrollIntoView?.({ behavior: store.get().reducedMotion ? 'auto' : 'smooth', block: 'start' });
  const focus = target.querySelector('summary, h2');
  if (focus) { if (focus.tagName !== 'SUMMARY') focus.tabIndex = -1; focus.focus({ preventScroll: true }); }
}
function goHomeSection(id) {
  const target = document.getElementById(id);
  if (target) { revealHomeSection(target); return; }
  pendingHomeSection = id;
  location.hash = '#/';
}
function goHomeTop(event) {
  if (location.hash === '#/' || !location.hash) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: store.get().reducedMotion ? 'auto' : 'smooth' });
    root.focus({ preventScroll: true });
  }
}
function renderBar() {
  const languages = [['en', 'lang.en'], ['hi', 'lang.hi'], ['both', 'lang.both']];
  const prefs = [['sound', 'bar.sound'], ['lowGraphics', 'bar.low'], ['reducedMotion', 'bar.motion'], ['projector', 'bar.proj'], ['teacher', 'bar.teacher']];
  const navLinks = () => [
    h('a', { href: '#/', 'data-k': 'nav.home', onclick: goHomeTop }, t('nav.home')),
    h('button', { type: 'button', 'data-k': 'nav.discover', onclick: () => goHomeSection('catalog') }, t('nav.discover')),
    h('button', { type: 'button', 'data-k': 'nav.how', onclick: () => goHomeSection('how-to-learn') }, t('nav.how')),
    h('a', { href: '#/bridge', 'data-k': 'nav.bridge' }, t('nav.bridge')),
    h('a', { href: '#/portfolio', 'data-k': 'nav.portfolio' }, t('nav.portfolio')),
  ];
  const settings = h('details', { class: 'settings-menu' },
    h('summary', { class: 'header-control', 'data-k-title': 'nav.settings', title: t('nav.settings') }, iconEl('SlidersHorizontal', { size: 17 }), h('span', { 'data-k': 'nav.settings' }, t('nav.settings')), iconEl('ChevronDown', { size: 14 })),
    h('div', { class: 'header-popover settings-panel' },
      h('strong', { 'data-k': 'nav.settings.desc' }, t('nav.settings.desc')),
      ...prefs.map(([pref, key]) => h('button', { type: 'button', class: 'tool', 'data-pref': pref, 'aria-pressed': store.get()[pref] ? 'true' : 'false', 'data-k': key, onclick: () => { store.set({ [pref]: !store.get()[pref] }); if (store.get().sound) playTap(); } }, t(key)))));
  const mobileNav = h('details', { class: 'mobile-menu' },
    h('summary', { class: 'header-control', 'data-k-title': 'nav.menu', title: t('nav.menu') }, h('i', { class: 'menu-icon', 'aria-hidden': 'true' }), h('span', { 'data-k': 'nav.menu' }, t('nav.menu'))),
    h('nav', { class: 'header-popover mobile-nav-links', 'data-k-aria': 'nav.main', 'aria-label': t('nav.main') }, ...navLinks()));
  mobileNav.querySelectorAll('a, button').forEach((el) => el.addEventListener('click', () => { mobileNav.open = false; }));
  [settings, mobileNav].forEach((menu) => menu.addEventListener('toggle', () => { if (menu.open) [settings, mobileNav].filter((other) => other !== menu).forEach((other) => { other.open = false; }); }));
  bar.replaceChildren(h('div', { class: 'header-inner' },
    h('a', { class: 'brand', href: '#/', 'aria-label': 'EduVerse', onclick: goHomeTop },
      h('span', { class: 'brand-mark' }, iconEl('GraduationCap', { size: 22 })),
      h('span', { class: 'brand-wordmark' }, h('strong', {}, 'EduVerse'), h('small', { 'data-k': 'brand.subtitle' }, t('brand.subtitle')))),
    h('nav', { class: 'site-nav', 'data-k-aria': 'nav.main', 'aria-label': t('nav.main') }, ...navLinks()),
    h('div', { class: 'tools' },
      h('span', { class: 'star-pill', 'data-k-title': 'bar.stars', title: t('bar.stars') }, iconEl('Sparkles', { size: 14 }), h('span', { class: 'sr-only', 'data-k': 'bar.stars' }, t('bar.stars')), h('span', { class: 'star-pill-val' }, String(store.summaryStats().starCount))),
      h('div', { class: 'seg', role: 'group', 'data-k-aria': 'bar.lang', 'aria-label': t('bar.lang') }, ...languages.map(([id, key]) => h('button', { type: 'button', class: 'seg-b', 'data-lang': id, 'aria-pressed': store.get().lang === id ? 'true' : 'false', 'data-k': key, onclick: () => { playTap(); store.set({ lang: id }); } }, t(key)))),
      settings, mobileNav)));
  bar.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const open = bar.querySelector('details[open]');
    if (open) { open.open = false; open.querySelector('summary')?.focus(); }
  });
  document.addEventListener('click', (event) => { if (!bar.contains(event.target)) [settings, mobileNav].forEach((menu) => { menu.open = false; }); });
}
function renderFoot() {
  foot.replaceChildren(
    h('div', { class: 'footer-top' },
      h('div', { class: 'footer-brand' }, h('strong', {}, 'EduVerse'), h('p', { 'data-k': 'home.footer.tagline' }, t('home.footer.tagline'))),
      h('div', { class: 'footer-links' }, h('button', { type: 'button', 'data-k': 'nav.discover', onclick: () => goHomeSection('catalog') }, t('nav.discover')), h('a', { href: '#/bridge', 'data-k': 'nav.bridge' }, t('nav.bridge')), h('a', { href: '#/portfolio', 'data-k': 'nav.portfolio' }, t('nav.portfolio')))),
    h('div', { class: 'footer-notes' }, h('p', { 'data-k': 'foot.note' }, t('foot.note')), h('p', { 'data-k': 'foot.priv' }, t('foot.priv'))));
}

function onLang() {
  bar.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.lang === store.get().lang ? 'true' : 'false'));
  i18n.apply(document); relabelBi(root); relabelTitles(); cur?.mod?.relabel?.(); heroRelabel?.(); refreshHome?.();
}
function relabelTitles() { root.querySelectorAll('[data-title]').forEach((el) => { const o = JSON.parse(el.dataset.title); el.textContent = i18n.pair(o.en, o.hi); }); }
const titleEl = (tag, o, cls) => h(tag, { class: cls, 'data-title': JSON.stringify({ en: o.en, hi: o.hi }) }, i18n.pair(o.en, o.hi));
const status = (th) => { const n = th.learningObjects.length, k = th.learningObjects.filter((l) => l.status === 'implemented').length; return { n, k, label: k === 0 ? 'planned' : k === n ? 'implemented' : 'partial' }; };
// Progress means at least one correct exit response per LO, not a mastery assessment.
function loSolved(th) { return exitProgress(th, store.get().progress?.[th.id]); }
function updateChapterComplete() {
  const badge = root.querySelector('.chapter-done');
  const id = location.hash.match(/^#\/theme\/(T\d\d)$/)?.[1];
  const theme = CUR?.themes.find((th) => th.id === id);
  if (badge && theme) badge.hidden = !loSolved(theme).done;
}
function nextTheme() {
  // Continue: first visited-but-incomplete, else first unvisited, else T01.
  for (const th of CUR.themes) {
    const p = store.get().progress?.[th.id];
    if (p?.visited && !loSolved(th).done) return { th, mode: 'resume' };
  }
  for (const th of CUR.themes) {
    const p = store.get().progress?.[th.id];
    if (!p?.visited) return { th, mode: 'next' };
  }
  return { th: CUR.themes[0], mode: 'next' };
}
let activeSearch = '';

function clearHomeGlobe() {
  try { heroCleanup?.(); } catch (e) { console.warn(e); }
  heroCleanup = null; heroSetMotion = null; heroRelabel = null;
}
function destroyCur() {
  clearHomeGlobe(); refreshHome = null;
  try { cur?.mod?.destroy?.(); } catch (e) { console.warn(e); }
  cur = null;
}
let routeSequence = 0;
async function route() {
  const sequence = ++routeSequence;
  const hStr = location.hash;
  const isCurrent = () => sequence === routeSequence && location.hash === hStr;
  destroyCur();
  if (hStr && hStr !== '#/') pendingHomeSection = null;
  root.replaceChildren(); window.scrollTo(0, 0);
  if (hStr === '#/bridge') {
    const { renderBridge } = await import('./modules/class-x-bridge.js');
    if (!isCurrent()) return;
    cur = { id: 'bridge', mod: renderBridge(root, CUR) };
    document.title = 'Class X Bridge · EduVerse';
  } else if (hStr === '#/portfolio') {
    const { renderPortfolio } = await import('./modules/class-x-bridge.js');
    if (!isCurrent()) return;
    cur = { id: 'portfolio', mod: renderPortfolio(root, CUR) };
    document.title = 'Portfolio · EduVerse';
  } else {
    const m = hStr.match(/^#\/theme\/(T\d\d)$/);
    if (m && CUR.themes.some((x) => x.id === m[1])) await themePage(m[1], isCurrent); else home();
    if (!isCurrent()) return;
    document.title = (m ? `${m[1]} · ` : '') + 'EduVerse · Class IX Social Science';
  }
  i18n.apply(root); root.focus({ preventScroll: true });
  if (pendingHomeSection) {
    const target = document.getElementById(pendingHomeSection);
    if (target) { pendingHomeSection = null; requestAnimationFrame(() => { if (isCurrent()) revealHomeSection(target); }); }
  }
}
function card(th) {
  const s = status(th), media = THEME_MEDIA[th.id], lp = loSolved(th);
  const pct = lp.n ? Math.round((lp.k / lp.n) * 100) : 0;
  const searchText = `${th.id} ${th.title.en} ${th.title.hi} ${th.learningObjects.map((l) => `${l.en} ${l.hi}`).join(' ')}`.toLowerCase();
  const progressParams = JSON.stringify({ k: lp.k, n: lp.n });
  return h('a', { class: `card disc-${th.discipline} st-${s.label}`, href: `#/theme/${th.id}`, 'data-theme': th.id, 'data-disc': th.discipline, 'data-search': searchText },
    media ? h('div', { class: 'card-media' },
      h('img', { src: media.thumb || media.src, width: '560', height: '293', alt: '', loading: 'lazy', decoding: 'async', onerror: (event) => { event.currentTarget.hidden = true; event.currentTarget.parentElement.classList.add('media-fallback'); } }),
      h('span', { class: 'card-tag', 'data-k': 'home.badge.interactive' }, t('home.badge.interactive')),
      h('span', { class: 'card-ico' }, iconEl(media.icon, { size: 17 }))) : null,
    h('div', { class: 'card-body' },
      h('div', { class: 'card-topline' }, h('span', { class: 'card-category', 'data-k': DISC[th.discipline] }, t(DISC[th.discipline])), h('span', { class: 'card-id' }, th.id)),
      titleEl('h4', th.title, 'card-title'),
      h('p', { class: 'card-preview' }, h('span', { 'data-k': 'home.card.inside' }, t('home.card.inside')), ': ', titleEl('span', th.learningObjects[0])),
      h('div', { class: 'card-meta' }, iconEl('BookOpen', { size: 15 }), h('span', {}, `${th.hours} `), h('span', { 'data-k': 'hours' }, t('hours'))),
      h('div', { class: 'card-bottom' },
        h('span', { class: 'card-progress', role: 'progressbar', 'aria-valuenow': String(pct), 'aria-valuemin': '0', 'aria-valuemax': '100', 'data-k-aria': 'home.card.progress', 'data-p': progressParams, 'aria-label': t('home.card.progress', { k: lp.k, n: lp.n }) }, h('span', { class: 'card-progress-fill', style: `width:${pct}%` })),
        h('div', { class: 'card-bottom-row' }, h('span', { class: 'card-progress-txt', 'data-k': 'home.card.progress', 'data-p': progressParams }, t('home.card.progress', { k: lp.k, n: lp.n })), h('span', { class: 'card-arrow', 'aria-hidden': 'true' }, '↗')),
        h('span', { class: `badge ${s.label}`, 'data-k': `st.${s.label}`, 'data-p': JSON.stringify({ k: s.k, n: s.n }) }, t(`st.${s.label}`, { k: s.k, n: s.n })))));
}

function mountHomeGlobe(heroArt) {
  if (store.get().lowGraphics || !webglAvailable()) return;
  const host = h('div', { class: 'hero-gl' });
  const pinBanner = h('a', { class: 'hero-pin-pill', hidden: true, href: '#/' });
  const fallbackImg = heroArt.querySelector('img'), hint = heroArt.querySelector('.globe-hint');
  heroArt.append(host, pinBanner);
  let alive = true, api = null, globe = null, picked = null, visible = true, observer = null;
  const syncMotion = () => globe?.setReducedMotion(store.get().reducedMotion || !visible || document.hidden);
  const cleanup = () => {
    if (!alive) return;
    alive = false; observer?.disconnect(); document.removeEventListener('visibilitychange', syncMotion);
    try { globe?.dispose?.(); } finally {
      api?.dispose?.(); host.remove(); pinBanner.remove();
      fallbackImg?.classList.remove('gl-under');
      if (hint) hint.hidden = true;
      heroArt.classList.remove('has-globe');
    }
  };
  heroCleanup = cleanup;
  const showPick = () => { if (picked) { pinBanner.href = `#/theme/${picked.theme}`; pinBanner.textContent = `${pair(picked.en, picked.hi)} →`; pinBanner.hidden = false; } };
  (async () => {
    try {
      api = await createScene(host, {
        lowGraphics: false,
        reducedMotion: store.get().reducedMotion,
        view: { az: 0.5, pol: 1.16, r: 14.4 },
        onTick: (now, dt) => globe?.tick?.(now, dt),
        onPick: (info) => { if (info && alive) { playTap(); picked = info; showPick(); } },
      });
      if (!alive) { api.dispose(); return; }
      globe = createHeroGlobe3d(api, { textureUrl: 'assets/images/globe-world.svg', reducedMotion: store.get().reducedMotion });
      api.renderer.domElement.setAttribute('data-k-aria', 'home.globe.aria');
      api.renderer.domElement.setAttribute('aria-label', t('home.globe.aria'));
      if (fallbackImg) fallbackImg.classList.add('gl-under');
      if (hint) hint.hidden = false;
      heroArt.classList.add('has-globe');
      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncMotion(); });
        observer.observe(heroArt);
      }
      document.addEventListener('visibilitychange', syncMotion);
      heroSetMotion = syncMotion; heroRelabel = showPick; syncMotion();
    } catch {
      cleanup(); // Preserve the illustration and links if WebGL or Three.js fails.
    }
  })();
}

function home() {
  const stats = store.summaryStats();
  const totalLOs = CUR.themes.reduce((a, th) => a + th.learningObjects.length, 0);
  const solvedLOs = CUR.themes.reduce((a, th) => a + loSolved(th).k, 0);
  const pathPct = totalLOs ? Math.round((solvedLOs / totalLOs) * 100) : 0;
  const nxt = nextTheme();
  const heroArt = h('figure', { class: 'hero-art' },
    h('img', { src: HERO_MEDIA.src, alt: '', loading: 'eager', decoding: 'async', onerror: (event) => { event.currentTarget.hidden = true; } }),
    h('div', { class: 'globe-label', 'aria-hidden': 'true' }, h('span', { class: 'globe-label-dot' }), h('span', { 'data-k': 'home.globe.title' }, t('home.globe.title'))),
    h('figcaption', { class: 'globe-caption' },
      h('span', { class: 'globe-hint', hidden: true, 'data-k': 'home.globe.hint' }, t('home.globe.hint')),
      h('span', { class: 'globe-shortcuts-label', 'data-k': 'home.globe.shortcuts' }, t('home.globe.shortcuts')),
      h('div', { class: 'globe-shortcuts' },
        h('a', { href: '#/theme/T02', 'data-k': 'home.globe.mountains' }, t('home.globe.mountains')),
        h('a', { href: '#/theme/T10', 'data-k': 'home.globe.oceans' }, t('home.globe.oceans')),
        h('a', { href: '#/theme/T13', 'data-k': 'home.globe.trade' }, t('home.globe.trade')))));
  const heroStat = (value, key) => h('div', { class: 'hero-stat' }, h('strong', {}, value), h('span', { 'data-k': key }, t(key)));
  const hero = h('section', { class: 'hero hero-shell' },
    h('div', { class: 'hero-copy' },
      h('p', { class: 'eyebrow hero-eyebrow' }, h('span', { class: 'eyebrow-dot' }), h('span', { 'data-k': 'home.hero.eyebrow' }, t('home.hero.eyebrow'))),
      h('h1', { 'data-k': 'home.h1', 'data-block': '' }, t('home.h1')),
      h('p', { class: 'hero-lead', 'data-k': 'home.lead', 'data-block': '' }, t('home.lead')),
      h('div', { class: 'hero-actions' },
        h('button', { type: 'button', class: 'btn primary hero-primary', onclick: () => goHomeSection('catalog') }, h('span', { 'data-k': 'home.hero.explore' }, t('home.hero.explore')), iconEl('ArrowRight', { size: 18 })),
        h('a', { class: 'hero-secondary', href: `#/theme/${nxt.th.id}` }, h('span', { 'data-k': 'home.continue' }, t('home.continue')), ' ', iconEl('ArrowRight', { size: 17 }))),
      h('div', { class: 'hero-stats' }, heroStat(String(CUR.themes.length).padStart(2, '0'), 'home.hero.stat.themes'), heroStat(String(totalLOs), 'home.hero.stat.goals'), heroStat('02', 'home.hero.stat.lang'))),
    heroArt);

  const continueBar = h('section', { class: 'continue-bar', 'data-k-aria': 'home.continue', 'aria-label': t('home.continue') },
    h('span', { class: 'continue-icon', 'aria-hidden': 'true' }, iconEl('Play', { size: 20 })),
    h('div', { class: 'continue-content' },
      h('div', { class: 'continue-txt' }, h('span', { 'data-k': nxt.mode === 'resume' ? 'home.continue.resume' : 'home.continue.next' }, t(nxt.mode === 'resume' ? 'home.continue.resume' : 'home.continue.next')), titleEl('strong', nxt.th.title)),
      h('div', { class: 'path-progress', role: 'progressbar', 'aria-valuenow': String(pathPct), 'aria-valuemin': '0', 'aria-valuemax': '100', 'data-k-aria': 'home.path', 'aria-label': t('home.path') }, h('span', { class: 'path-progress-fill', style: `width:${pathPct}%` })),
      h('span', { class: 'path-txt' }, `${stats.visitedCount}/${CUR.themes.length} `, h('span', { 'data-k': 'home.path.themes' }, t('home.path.themes')), ` · ${solvedLOs}/${totalLOs} `, h('span', { 'data-k': 'home.path.los' }, t('home.path.los')))),
    h('a', { class: 'continue-btn', href: `#/theme/${nxt.th.id}` }, h('span', { 'data-k': 'home.journey.action' }, t('home.journey.action')), ' ', iconEl('ArrowRight', { size: 16 })));
  const surpriseBtn = h('button', { type: 'button', class: 'journey-link', 'data-k': 'home.surprise', onclick: () => { playTap(); const pick = CUR.themes[Math.floor(Math.random() * CUR.themes.length)]; location.hash = `#/theme/${pick.id}`; } }, t('home.surprise'));
  const journey = h('section', { class: 'journey-section', 'aria-labelledby': 'journey-heading' },
    h('div', { class: 'section-intro journey-intro' }, h('div', {}, h('p', { class: 'eyebrow', 'data-k': 'home.journey.kicker' }, t('home.journey.kicker')), h('h2', { id: 'journey-heading', 'data-k': 'home.journey.title' }, t('home.journey.title')))),
    h('div', { class: 'journey-row' }, continueBar,
      h('div', { class: 'hud-stats' },
        h('div', { class: 'hud-chip' }, h('span', { class: 'hud-stat-icon', 'aria-hidden': 'true' }, '✦'), h('strong', { class: 'hud-stars-n' }, String(stats.starCount)), h('span', { 'data-k': 'home.hud.stars' }, t('home.hud.stars'))),
        h('div', { class: 'hud-chip' }, h('span', { class: 'hud-stat-icon', 'aria-hidden': 'true' }, iconEl('Compass', { size: 18 })), h('strong', {}, `${stats.visitedCount}/${CUR.themes.length}`), h('span', { 'data-k': 'home.hud.explored' }, t('home.hud.explored'))),
        h('div', { class: 'hud-chip' }, h('span', { class: 'hud-stat-icon', 'aria-hidden': 'true' }, iconEl('CheckCircle2', { size: 18 })), h('strong', {}, `${stats.cbqSolved}/32`), h('span', { 'data-k': 'home.hud.cbq' }, t('home.hud.cbq'))))),
    h('div', { class: 'journey-links' }, h('span', { 'data-k': 'home.journey.more' }, t('home.journey.more')), surpriseBtn, h('a', { class: 'journey-link', href: '#/bridge', 'data-k': 'home.bridgeBtn' }, t('home.bridgeBtn')), h('a', { class: 'journey-link', href: '#/portfolio', 'data-k': 'home.portBtn' }, t('home.portBtn'))));

  const filterKeys = [['all', 'home.all'], ['geography', 'disc.geography'], ['history', 'disc.history'], ['political-science', 'disc.political'], ['economics', 'disc.economics'], ['integrated', 'disc.integrated']];
  const filterBar = h('div', { class: 'filter-pills', role: 'radiogroup', 'data-k-aria': 'home.browse.filter', 'aria-label': t('home.browse.filter') },
    ...filterKeys.map(([id, key], index) => h('button', {
      type: 'button', role: 'radio', class: 'chip', 'data-disc': id,
      'aria-checked': activeFilter === id ? 'true' : 'false', 'data-k': key,
      onclick: () => { playTap(); activeFilter = id; updateFilters(); },
      onkeydown: (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
        event.preventDefault();
        const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
        const next = (index + direction + filterKeys.length) % filterKeys.length;
        filterBar.children[next].click(); filterBar.children[next].focus();
      },
    }, t(key))));
  const searchInput = h('input', { type: 'search', class: 'home-search', 'data-k-ph': 'home.search', placeholder: t('home.search'), 'data-k-aria': 'home.search.label', 'aria-label': t('home.search.label'), value: activeSearch, oninput: (event) => { activeSearch = event.target.value; updateFilters(); } });
  const resultCount = h('p', { class: 'catalog-count', role: 'status', 'aria-live': 'polite' });
  const empty = h('div', { class: 'catalog-empty', hidden: true }, h('p', { 'data-k': 'home.empty' }, t('home.empty')), h('button', { type: 'button', class: 'btn', 'data-k': 'home.clear', onclick: () => { activeFilter = 'all'; activeSearch = ''; searchInput.value = ''; updateFilters(); searchInput.focus(); } }, t('home.clear')));
  const part = (n, label) => h('section', { class: 'part', 'aria-labelledby': `part${n}` }, h('h3', { id: `part${n}`, 'data-k': label, 'data-p': JSON.stringify({ h: CUR.themes.filter((x) => x.part === n).reduce((sum, x) => sum + x.hours, 0) }) }, t(label, { h: CUR.themes.filter((x) => x.part === n).reduce((sum, x) => sum + x.hours, 0) })), h('div', { class: 'grid' }, ...CUR.themes.filter((x) => x.part === n).map(card)));
  const catalog = h('section', { class: 'catalog-section', id: 'catalog', 'aria-labelledby': 'catalog-heading' },
    h('div', { class: 'section-intro catalog-intro' }, h('div', {}, h('p', { class: 'eyebrow', 'data-k': 'home.browse.kicker' }, t('home.browse.kicker')), h('h2', { id: 'catalog-heading', 'data-k': 'home.browse.title' }, t('home.browse.title')), h('p', { 'data-k': 'home.browse.desc' }, t('home.browse.desc')))),
    h('div', { class: 'hud-bar catalog-controls' }, h('div', { class: 'search-wrap' }, iconEl('Search', { size: 19 }), searchInput), filterBar),
    resultCount, empty, part(1, 'home.part1'), part(2, 'home.part2'));
  function updateFilters() {
    filterBar.querySelectorAll('.chip').forEach((button) => { button.setAttribute('aria-checked', String(button.dataset.disc === activeFilter)); button.tabIndex = button.dataset.disc === activeFilter ? 0 : -1; });
    const query = activeSearch.trim().toLowerCase();
    let count = 0;
    catalog.querySelectorAll('.part').forEach((section) => {
      let visible = 0;
      section.querySelectorAll('.card[data-disc]').forEach((c) => {
        const show = (activeFilter === 'all' || c.dataset.disc === activeFilter) && (!query || c.dataset.search.includes(query));
        c.hidden = !show; if (show) { visible++; count++; }
      });
      section.hidden = visible === 0;
    });
    resultCount.textContent = t(count === 1 ? 'home.result.one' : 'home.results', { n: count }); empty.hidden = count > 0;
  }
  const howto = h('details', { class: 'howto', id: 'how-to-learn' },
    h('summary', {}, h('span', { class: 'howto-icon', 'aria-hidden': 'true' }, iconEl('Sparkles', { size: 19 })), h('span', { 'data-k': 'home.howto' }, t('home.howto')), iconEl('ChevronDown', { size: 18 })),
    h('ol', { class: 'howto-list' }, ...['home.howto.s1', 'home.howto.s2', 'home.howto.s3', 'home.howto.s4'].map((key) => h('li', { 'data-k': key }, t(key)))));
  root.append(hero, journey, catalog, howto);
  refreshHome = updateFilters; updateFilters(); mountHomeGlobe(heroArt);
}
const lst = (items, fn) => h('ul', { class: 'plain' }, ...items.map((x) => h('li', {}, fn(x))));
async function themePage(id, isCurrent) {
  const th = CUR.themes.find((x) => x.id === id), s = status(th), idx = CUR.themes.indexOf(th);
  const media = THEME_MEDIA[id];
  store.progress(id).visited = true; store.saveProgress();
  const loChip = (l) => h('span', { class: `chip-lo ${l.status}` }, h('b', {}, l.id.split('.')[1]), ' ', bi({ en: l.en, hi: l.hi }, { tag: 'span' }), ' ', h('i', { 'data-k': `lo.${l.status}` }, t(`lo.${l.status}`)));
  const opening = OPENINGS[id];
  const lpNow = loSolved(th);
  const chapterDone = h('p', { class: 'chapter-done', 'data-k': 'th.complete', role: 'status', hidden: !lpNow.done }, t('th.complete'));
  // 🔊 Listen: Web Speech API read-aloud for the Opening question (no backend, graceful fallback).
  let speaking = false;
  const listenBtn = h('button', {
    type: 'button', class: 'btn ghost narrate-btn', 'data-k': 'th.listen', 'aria-pressed': 'false',
    onclick: () => {
      try {
        if (!('speechSynthesis' in window)) return;
        if (speaking) { speechSynthesis.cancel(); speaking = false; listenBtn.textContent = t('th.listen'); listenBtn.setAttribute('aria-pressed', 'false'); return; }
        speechSynthesis.cancel();
        const lang = store.get().lang;
        const text = lang === 'hi' ? opening.hi : lang === 'en' ? opening.en : `${opening.en} ${opening.hi}`;
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
        u.rate = 0.95;
        u.onend = u.onerror = () => { speaking = false; listenBtn.textContent = t('th.listen'); listenBtn.setAttribute('aria-pressed', 'false'); };
        speaking = true; listenBtn.textContent = t('th.stop'); listenBtn.setAttribute('aria-pressed', 'true');
        speechSynthesis.speak(u);
      } catch { speaking = false; }
    },
  }, t('th.listen'));
  const modSlot = h('div', { class: 'module', id: 'module' });
  const [{ createNepBridge }, { TEACHER, LIMITS }] = await Promise.all([
    import('./components/nep-bridge.js'),
    loadTeacherMeta(),
  ]);
  if (!isCurrent()) return;
  const nepBridge = createNepBridge(id, CUR);
  const nav = h('nav', { class: 'pager', 'aria-label': 'Theme navigation' }, idx > 0 ? h('a', { href: `#/theme/${CUR.themes[idx - 1].id}`, rel: 'prev' }, '← ', CUR.themes[idx - 1].id) : h('span'), h('a', { href: '#/', 'data-k': 'nav.all' }, t('nav.all')), idx < 15 ? h('a', { href: `#/theme/${CUR.themes[idx + 1].id}`, rel: 'next' }, CUR.themes[idx + 1].id, ' →') : h('span'));
  const glossary = (window.__glossary || []).filter((g) => (g.themes || []).includes(id));
  const teach = TEACHER[id];

  // Visual interactive flashcard glossary preserving semantic <dl class="gloss"><dt><dd data-term-def>
  const glossBlock = glossary.length
    ? h('details', { class: 'subsec' },
      h('summary', { 'data-k': 'th.gloss' }, t('th.gloss')),
      h('p', { class: 'note', 'data-k': 'gloss.flip' }, t('gloss.flip')),
      h('dl', { class: 'gloss gloss-grid' }, ...glossary.map((g) => {
        const pairBox = h('div', {
          class: 'gloss-card',
          tabindex: '0',
          role: 'button',
          onclick: () => { playFlip(); pairBox.classList.toggle('flipped'); },
          onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playFlip(); pairBox.classList.toggle('flipped'); } },
        },
        h('dt', { 'data-term': g.id }, i18n.term(g.id)),
        h('dd', { 'data-term-def': g.id }, i18n.termDef(g.id)));
        return pairBox;
      })))
    : null;

  root.append(...[
    h('a', { class: 'back', href: '#/' }, iconEl('ArrowLeft', { size: 17 }), h('span', { 'data-k': 'nav.back' }, t('nav.back'))),
    h('header', { class: 'theme-h theme-head-wrap' },
      h('div', { class: 'theme-head-txt' },
        h('span', { class: 'card-id' }, media ? iconEl(media.icon, { size: 15, className: 'th-ico' }) : null, id),
        titleEl('h1', th.title),
        h('p', { class: 'card-meta' }, h('span', { 'data-k': DISC[th.discipline] }, t(DISC[th.discipline])), ` · ${th.hours} `, h('span', { 'data-k': 'hours' }, t('hours')), ' · ', h('span', { class: `badge ${s.label}`, 'data-k': `st.${s.label}`, 'data-p': JSON.stringify({ k: s.k, n: s.n }) }, t(`st.${s.label}`, { k: s.k, n: s.n })))),
      themeBannerEl(id)),
    h('section', { class: 'opening', 'aria-labelledby': 'op-h' },
      h('div', { class: 'opening-head' }, h('h2', { id: 'op-h', 'data-k': 'th.opening' }, t('th.opening')), listenBtn),
      bi(opening, { tag: 'p', cls: 'q' }),
      chapterDone),
    modSlot,
    nepBridge?.el,
    h('section', { class: 'subsec' }, h('h2', { 'data-k': 'th.lo' }, t('th.lo')), lst(th.learningObjects, loChip)),
    h('details', { class: 'subsec', open: th.learningObjects.every((l) => l.status === 'planned') ? '' : null }, h('summary', { 'data-k': 'th.src' }, t('th.src')), h('h3', { 'data-k': 'th.concepts' }, t('th.concepts')), lst(th.concepts, (c) => [bi({ en: c.display || c.text, hi: c.hi }, { tag: 'span' }), ' ', h('small', {}, `p.${c.pdfPage}`)]), h('h3', { 'data-k': 'th.outcomes' }, t('th.outcomes')), lst(th.outcomes, (o) => [bi({ en: o.display || o.text, hi: o.hi }, { tag: 'span' }), ' ', h('small', {}, `p.${o.pdfPage}`)])),
    glossBlock,
    teach ? h('details', { class: 'subsec teacher-only' }, h('summary', { 'data-k': 'th.teacher' }, t('th.teacher')), h('ol', {}, ...teach.flow.map((f) => h('li', {}, bi({ en: (f.m ? `${f.m} min — ` : '') + f.en, hi: (f.m ? `${f.m} मिनट — ` : '') + f.hi }, { tag: 'div' })))), ...(teach.prompts ? [h('h3', { 'data-k': 'th.prompts' }, t('th.prompts')), ...teach.prompts.map((p) => bi(p, { tag: 'p' }))] : []), ...(teach.misconceptions ? [h('h3', { 'data-k': 'th.misc' }, t('th.misc')), ...teach.misconceptions.map((p) => bi(p, { tag: 'p' }))] : [])) : null,
    LIMITS[id] ? h('aside', { class: 'limits' }, h('strong', { 'data-k': 'th.limits' }, t('th.limits')), ' ', bi(LIMITS[id], { tag: 'span' })) : null,
    nav].filter(Boolean));
  if (MODULES[id]) {
    modSlot.append(h('p', { class: 'note', 'data-k': 'th.loading' }, t('th.loading')));
    try {
      const mod = await MODULES[id]();
      if (!isCurrent()) return;
      modSlot.replaceChildren();
      const mounted = mod.mount(modSlot, {});
      cur = {
        id,
        mod: {
          relabel() { mounted?.relabel?.(); nepBridge?.relabel?.(); },
          destroy() { mounted?.destroy?.(); },
        },
      };
    } catch (e) {
      if (!isCurrent()) return;
      console.error(e);
      modSlot.replaceChildren(h('p', { class: 'note err', 'data-k': 'th.err' }, t('th.err')));
    }
  } else {
    modSlot.append(h('div', { class: 'planned-box' }, h('h2', { 'data-k': 'th.planned.h' }, t('th.planned.h')), h('p', { 'data-k': 'th.planned.p' }, t('th.planned.p'))));
    cur = { id, mod: { relabel() { nepBridge?.relabel?.(); }, destroy() {} } };
  }
}
// Offline / slow-network support: cache the app after the first visit (skipped on file:// and when unsupported).
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
boot().catch((e) => { console.error(e); root.textContent = 'Failed to start: ' + e.message; });
