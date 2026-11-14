// App shell: top bar, hash router, interactive 3D hero globe, discipline filter, sound/stars HUD, flip-card glossary, lazy module mounting.
import { h, $ } from './core/dom.js';
import * as store from './core/store.js';
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
let CUR = null; // curriculum manifest
let activeFilter = 'all';
const DISC = { geography: 'disc.geography', history: 'disc.history', 'political-science': 'disc.political', economics: 'disc.economics', integrated: 'disc.integrated' };

async function boot() {
  const [cur_, gl] = await Promise.all([fetch('src/curriculum/curriculum.json').then((r) => r.json()), fetch('data/glossary.json').then((r) => r.json())]);
  CUR = cur_; i18n.setGlossary(gl.terms); window.__glossary = gl.terms;
  renderBar(); renderFoot(); applyPrefs(); updateStarPill();
  addEventListener('hashchange', route);
  store.subscribe((s, keys) => {
    if (keys.includes('lang')) onLang();
    if (keys.some((k) => ['sound', 'lowGraphics', 'reducedMotion', 'projector', 'teacher'].includes(k))) applyPrefs();
    if (keys.some((k) => ['stars', 'progress', 'lang'].includes(k))) updateStarPill();
    if (keys.includes('lowGraphics') && !location.hash.match(/^#\/theme\/(T\d\d)$/)) route();
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
  if (pill) pill.textContent = `★ ${store.summaryStats().starCount}`;
  const hudStars = root.querySelector('.hud-stars-n');
  if (hudStars) hudStars.textContent = String(store.summaryStats().starCount);
}
function renderBar() {
  const L = [['en', 'lang.en'], ['hi', 'lang.hi'], ['both', 'lang.both']];
  const prefs = [['sound', 'bar.sound'], ['lowGraphics', 'bar.low'], ['reducedMotion', 'bar.motion'], ['projector', 'bar.proj'], ['teacher', 'bar.teacher']];
  bar.replaceChildren(
    h('a', { class: 'brand', href: '#/' }, iconEl('GraduationCap', { size: 20, className: 'brand-ico' }), h('span', { 'data-k': 'app.title' }, t('app.title'))),
    h('div', { class: 'tools' },
      h('span', { class: 'star-pill', title: t('bar.stars') }, h('span', { class: 'star-pill-val' }, `★ ${store.summaryStats().starCount}`)),
      h('div', { class: 'seg', role: 'group', 'data-k-aria': 'bar.lang', 'aria-label': t('bar.lang') }, ...L.map(([id, k]) => h('button', { type: 'button', class: 'seg-b', 'data-lang': id, 'aria-pressed': store.get().lang === id ? 'true' : 'false', 'data-k': k, onclick: () => { playTap(); store.set({ lang: id }); } }, t(k)))),
      ...prefs.map(([p, k]) => h('button', { type: 'button', class: 'tool', 'data-pref': p, 'aria-pressed': store.get()[p] ? 'true' : 'false', 'data-k': k, onclick: () => { store.set({ [p]: !store.get()[p] }); if (store.get().sound) playTap(); } }, t(k)))));
}
function renderFoot() {
  foot.replaceChildren(h('p', { 'data-k': 'foot.note' }, t('foot.note')), h('p', { 'data-k': 'foot.priv' }, t('foot.priv')));
}
function onLang() {
  bar.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.lang === store.get().lang ? 'true' : 'false'));
  i18n.apply(bar); i18n.apply(foot); i18n.apply(root); relabelBi(root); relabelTitles(); cur?.mod?.relabel?.();
}
function relabelTitles() { root.querySelectorAll('[data-title]').forEach((el) => { const o = JSON.parse(el.dataset.title); el.textContent = i18n.pair(o.en, o.hi); }); }
const titleEl = (tag, o, cls) => h(tag, { class: cls, 'data-title': JSON.stringify({ en: o.en, hi: o.hi }) }, i18n.pair(o.en, o.hi));
const status = (th) => { const n = th.learningObjects.length, k = th.learningObjects.filter((l) => l.status === 'implemented').length; return { n, k, label: k === 0 ? 'planned' : k === n ? 'implemented' : 'partial' }; };
// Student mastery: count LOs whose exit ticket is solved (progress.exit keys are `${loId}.${exitId}`).
function loSolved(th) {
  const prog = store.get().progress?.[th.id] || {};
  const exits = prog.exit || {};
  const solvedLOs = new Set();
  for (const [key, v] of Object.entries(exits)) {
    if (v?.ok) solvedLOs.add(key.split('.')[0]);
  }
  // Fallback: if exit keys don't map cleanly, count distinct solved exits capped at LO count.
  const k = Math.min(th.learningObjects.length, solvedLOs.size || Object.values(exits).filter((v) => v?.ok).length);
  return { k, n: th.learningObjects.length, done: k >= th.learningObjects.length && th.learningObjects.length > 0 };
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

function destroyCur() {
  try { heroCleanup?.(); } catch {}
  heroCleanup = null;
  try { cur?.mod?.destroy?.(); } catch (e) { console.warn(e); }
  cur = null;
}
async function route() {
  destroyCur();
  const hStr = location.hash;
  root.replaceChildren(); window.scrollTo(0, 0);
  if (hStr === '#/bridge') {
    const { renderBridge } = await import('./modules/class-x-bridge.js');
    if (location.hash !== '#/bridge') return;
    cur = { id: 'bridge', mod: renderBridge(root, CUR) };
    document.title = 'Class X Bridge · Class IX Social Science';
  } else if (hStr === '#/portfolio') {
    const { renderPortfolio } = await import('./modules/class-x-bridge.js');
    if (location.hash !== '#/portfolio') return;
    cur = { id: 'portfolio', mod: renderPortfolio(root, CUR) };
    document.title = 'NEP Portfolio · Class IX Social Science';
  } else {
    const m = hStr.match(/^#\/theme\/(T\d\d)$/);
    if (m && CUR.themes.some((x) => x.id === m[1])) await themePage(m[1]); else home();
    document.title = (m ? `${m[1]} · ` : '') + 'Class IX Social Science';
  }
  i18n.apply(root); root.focus({ preventScroll: true });
}
function card(th) {
  const s = status(th);
  const media = THEME_MEDIA[th.id];
  const lp = loSolved(th);
  const pct = lp.n ? Math.round((lp.k / lp.n) * 100) : 0;
  const searchText = `${th.id} ${th.title.en} ${th.title.hi} ${th.learningObjects.map((l) => `${l.en} ${l.hi}`).join(' ')}`.toLowerCase();
  return h('a', { class: `card disc-${th.discipline} st-${s.label}`, href: `#/theme/${th.id}`, 'data-theme': th.id, 'data-disc': th.discipline, 'data-search': searchText },
    media ? h('div', { class: 'card-media' },
      h('img', { src: media.src, alt: '', loading: 'lazy', decoding: 'async' }),
      h('span', { class: 'card-3d-tag', 'data-k': 'home.badge.3d' }, t('home.badge.3d')),
      h('span', { class: 'card-ico' }, iconEl(media.icon, { size: 15 }))) : null,
    h('span', { class: 'card-id' }, th.id),
    titleEl('span', th.title, 'card-title'),
    h('span', { class: 'card-meta' }, h('span', { 'data-k': DISC[th.discipline] }, t(DISC[th.discipline])), h('span', {}, ` · ${th.hours} `), h('span', { 'data-k': 'hours' }, t('hours'))),
    h('span', { class: 'card-progress', role: 'progressbar', 'aria-valuenow': String(pct), 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-label': t('home.card.progress', { k: lp.k, n: lp.n }) },
      h('span', { class: 'card-progress-fill', style: `width:${pct}%` })),
    h('span', { class: 'card-progress-txt', 'data-k': 'home.card.progress', 'data-p': JSON.stringify({ k: lp.k, n: lp.n }) }, t('home.card.progress', { k: lp.k, n: lp.n })),
    h('span', { class: `badge ${s.label}`, 'data-k': `st.${s.label}`, 'data-p': JSON.stringify({ k: s.k, n: s.n }) }, t(`st.${s.label}`, { k: s.k, n: s.n })));
}

function mountHomeGlobe(heroArt) {
  if (store.get().lowGraphics || !webglAvailable()) return;
  const host = h('div', { class: 'hero-gl' });
  const pinBanner = h('a', { class: 'hero-pin-pill', hidden: true, href: '#/' });
  const fallbackImg = heroArt.querySelector('img');
  heroArt.append(host, pinBanner);
  let alive = true, api = null, globe = null;
  (async () => {
    try {
      api = await createScene(host, {
        lowGraphics: store.get().lowGraphics,
        reducedMotion: store.get().reducedMotion,
        onTick: (now) => globe?.tick?.(now),
        onPick: (info) => {
          if (!info || !alive) return;
          playTap();
          pinBanner.href = `#/theme/${info.theme || 'T01'}`;
          pinBanner.textContent = `${pair(info.en, info.hi)} →`;
          pinBanner.hidden = false;
        },
      });
      if (!alive) { api.dispose(); return; }
      globe = createHeroGlobe3d(api);
      api.setAutoRotate?.(!store.get().reducedMotion);
      if (fallbackImg) fallbackImg.classList.add('gl-under');
    } catch {
      host.remove();
      pinBanner.remove();
    }
  })();
  heroCleanup = () => { alive = false; globe?.dispose?.(); api?.dispose?.(); };
}

function home() {
  const stats = store.summaryStats();
  const heroArt = h('figure', { class: 'hero-art' },
    h('img', { src: HERO_MEDIA.src, alt: i18n.pair(HERO_MEDIA.en, HERO_MEDIA.hi), loading: 'eager', decoding: 'async' }));

  const surpriseBtn = h('button', {
    type: 'button',
    class: 'btn primary',
    'data-k': 'home.surprise',
    onclick: () => {
      playTap();
      const pick = CUR.themes[Math.floor(Math.random() * CUR.themes.length)];
      location.hash = `#/theme/${pick.id}`;
    },
  }, t('home.surprise'));

  const filterKeys = [['all', 'home.all'], ['geography', 'disc.geography'], ['history', 'disc.history'], ['political-science', 'disc.political'], ['economics', 'disc.economics'], ['integrated', 'disc.integrated']];
  const applyFilters = () => {
    const q = activeSearch.trim().toLowerCase();
    root.querySelectorAll('.card[data-disc]').forEach((c) => {
      const discOk = activeFilter === 'all' || c.dataset.disc === activeFilter;
      const qOk = !q || (c.dataset.search || '').includes(q);
      c.hidden = !(discOk && qOk);
    });
  };
  const filterBar = h('div', { class: 'filter-pills', role: 'group' },
    ...filterKeys.map(([id, key]) => h('button', {
      type: 'button',
      class: 'chip',
      'data-disc': id,
      'aria-checked': activeFilter === id ? 'true' : 'false',
      'data-k': key,
      onclick: () => {
        playTap();
        activeFilter = id;
        filterBar.querySelectorAll('.chip').forEach((b, idx) => b.setAttribute('aria-checked', filterKeys[idx][0] === id ? 'true' : 'false'));
        applyFilters();
      },
    }, t(key))));
  const searchInput = h('input', {
    type: 'search', class: 'home-search', 'data-k-ph': 'home.search', placeholder: t('home.search'),
    'aria-label': t('home.search.label'), value: activeSearch,
    oninput: (e) => { activeSearch = e.target.value; applyFilters(); },
  });

  const hud = h('section', { class: 'hud-bar' },
    h('div', { class: 'hud-stats' },
      h('span', { class: 'hud-chip' }, '⭐ ', h('strong', { class: 'hud-stars-n' }, String(stats.starCount)), ' ', h('span', { 'data-k': 'home.hud.stars' }, t('home.hud.stars'))),
      h('span', { class: 'hud-chip' }, '🧭 ', h('strong', {}, `${stats.visitedCount}/16`), ' ', h('span', { 'data-k': 'home.hud.explored' }, t('home.hud.explored'))),
      h('span', { class: 'hud-chip' }, '🎯 ', h('strong', {}, `${stats.cbqSolved}/32`), ' ', h('span', { 'data-k': 'home.hud.cbq' }, t('home.hud.cbq'))),
      surpriseBtn,
      h('a', { class: 'btn ghost hud-link', href: '#/bridge', 'data-k': 'home.bridgeBtn' }, t('home.bridgeBtn')),
      h('a', { class: 'btn ghost hud-link', href: '#/portfolio', 'data-k': 'home.portBtn' }, t('home.portBtn'))),
    filterBar,
    searchInput);

  // Continue learning + learning-path progress (Step 0 foundation).
  const totalLOs = CUR.themes.reduce((a, x) => a + x.learningObjects.length, 0);
  const solvedLOs = CUR.themes.reduce((a, x) => a + loSolved(x).k, 0);
  const pathPct = totalLOs ? Math.round((solvedLOs / totalLOs) * 100) : 0;
  const nxt = nextTheme();
  const continueBar = h('section', { class: 'continue-bar', 'aria-label': t('home.continue') },
    h('div', { class: 'continue-txt' },
      h('strong', { 'data-k': 'home.continue' }, t('home.continue')),
      ' · ',
      h('span', { 'data-k': nxt.mode === 'resume' ? 'home.continue.resume' : 'home.continue.next' }, t(nxt.mode === 'resume' ? 'home.continue.resume' : 'home.continue.next')),
      ' ',
      titleEl('span', nxt.th.title)),
    h('a', { class: 'btn primary continue-btn', href: `#/theme/${nxt.th.id}` }, `${nxt.th.id} →`),
    h('div', { class: 'path-progress', role: 'progressbar', 'aria-valuenow': String(pathPct), 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-label': t('home.path') },
      h('span', { class: 'path-progress-fill', style: `width:${pathPct}%` })),
    h('span', { class: 'path-txt' }, `${stats.visitedCount}/16 `, h('span', { 'data-k': 'home.path.themes' }, t('home.path.themes')), ` · ${solvedLOs}/${totalLOs} `, h('span', { 'data-k': 'home.path.los' }, t('home.path.los'))));
  const howto = h('details', { class: 'howto' },
    h('summary', { 'data-k': 'home.howto' }, t('home.howto')),
    h('ol', { class: 'howto-list' },
      h('li', { 'data-k': 'home.howto.s1' }, t('home.howto.s1')),
      h('li', { 'data-k': 'home.howto.s2' }, t('home.howto.s2')),
      h('li', { 'data-k': 'home.howto.s3' }, t('home.howto.s3')),
      h('li', { 'data-k': 'home.howto.s4' }, t('home.howto.s4'))));

  const part = (n, label) => h('section', { class: 'part', 'aria-labelledby': `part${n}` }, h('h2', { id: `part${n}`, 'data-k': label, 'data-p': JSON.stringify({ h: CUR.themes.filter((x) => x.part === n).reduce((a, x) => a + x.hours, 0) }) }, t(label, { h: CUR.themes.filter((x) => x.part === n).reduce((a, x) => a + x.hours, 0) })), h('div', { class: 'grid' }, ...CUR.themes.filter((x) => x.part === n).map(card)));
  root.append(
    h('section', { class: 'hero hero-shell' },
      h('div', { class: 'hero-copy' },
        h('h1', { 'data-k': 'home.h1' }, t('home.h1')),
        h('p', { class: 'lead', 'data-k': 'home.lead' }, t('home.lead')),
        h('p', { class: 'note', 'data-k': 'home.honest' }, t('home.honest'))),
      heroArt),
    continueBar,
    hud,
    howto,
    part(1, 'home.part1'),
    part(2, 'home.part2'));

  applyFilters();
  mountHomeGlobe(heroArt);
}

const lst = (items, fn) => h('ul', { class: 'plain' }, ...items.map((x) => h('li', {}, fn(x))));
async function themePage(id) {
  const th = CUR.themes.find((x) => x.id === id), s = status(th), idx = CUR.themes.indexOf(th);
  const media = THEME_MEDIA[id];
  store.progress(id).visited = true; store.saveProgress();
  const loChip = (l) => h('span', { class: `chip-lo ${l.status}` }, h('b', {}, l.id.split('.')[1]), ' ', bi({ en: l.en, hi: l.hi }, { tag: 'span' }), ' ', h('i', { 'data-k': `lo.${l.status}` }, t(`lo.${l.status}`)));
  const opening = OPENINGS[id];
  const lpNow = loSolved(th);
  const chapterDone = lpNow.done ? h('p', { class: 'chapter-done', 'data-k': 'th.complete' }, t('th.complete')) : null;
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
  if (location.hash !== `#/theme/${id}`) return;
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
    h('a', { class: 'back', href: '#/', 'data-k': 'nav.back' }, t('nav.back')),
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
      if (location.hash !== `#/theme/${id}`) return;
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
