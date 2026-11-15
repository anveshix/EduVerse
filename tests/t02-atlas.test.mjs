import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { LANDFORM_AGENTS } from '../src/engines/domain/terrain.js';
import { T02_OPENING, PRED } from '../src/modules/geography/content.js';
import { OPENINGS } from '../src/modules/openings.js';

const INDIA = JSON.parse(fs.readFileSync(new URL('../data/geo/india.simplified.json', import.meta.url), 'utf8'));
const DEVANAGARI = /[\u0900-\u097f]/;

test('Everest opening and prediction stay bilingual and in sync', () => {
  assert.deepEqual(OPENINGS.T02, T02_OPENING);
  assert.match(PRED.everest.hi, DEVANAGARI);
  assert.ok(PRED.everest.opts.some((o) => o.id === 'uplift'));
  for (const option of PRED.everest.opts) assert.match(option.hi, DEVANAGARI);
});

test('Hindi fonts and their license are bundled and fonts are precached', () => {
  const sw = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  for (const weight of [400, 700]) {
    const rel = `assets/fonts/noto-sans-devanagari-${weight}.woff2`;
    assert.ok(fs.existsSync(new URL(`../${rel}`, import.meta.url)));
    assert.ok(sw.includes(rel), `${rel} must be available offline`);
  }
  assert.match(fs.readFileSync(new URL('../assets/fonts/LICENSE-noto-sans-devanagari.txt', import.meta.url), 'utf8'), /SIL OPEN FONT LICENSE/i);
});

test('T02 atlas: bilingual regions, gallery links, map fallback and persistence', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost:4173/' });
  for (const key of ['window', 'document', 'localStorage', 'HTMLElement', 'SVGElement', 'Element', 'Node', 'Event']) {
    Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true, writable: true });
  }
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, json: async () => INDIA });
  try {
    const [{ INDIA_LANDFORMS, createIndiaAtlas }, store, { GEO }] = await Promise.all([
      import('../src/modules/geography/india-atlas.js'), import('../src/core/store.js'), import('../src/engines/viz.js'),
    ]);
    store.set({ lang: 'en' });
    assert.deepEqual(INDIA_LANDFORMS.map((r) => r.id), ['himalaya', 'plains', 'deccan', 'thar', 'coast', 'islands', 'meghalaya']);
    for (const region of INDIA_LANDFORMS) {
      assert.ok(LANDFORM_AGENTS.includes(region.agent), `${region.id} uses an available gallery agent`);
      for (const text of [region.name, region.description, region.comparison]) {
        assert.ok(text.en && DEVANAGARI.test(text.hi), `${region.id} must be bilingual`);
      }
      for (const [lon, lat] of region.points) assert.ok(lon >= 68 && lon <= 98 && lat >= 6 && lat <= 38, `${region.id} marker is in the India map extent`);
    }
    assert.equal(INDIA_LANDFORMS.find((r) => r.id === 'islands').points.length, 2);
    const changes = [];
    const atlas = createIndiaAtlas({ onSelect: (region) => changes.push(region.agent) });
    document.body.append(atlas.el);
    assert.equal(atlas.el.querySelector('[data-atlas-map]').dataset.geodata, 'fallback', 'geodata is lazy until the gallery opens');
    atlas.enable();
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(atlas.el.querySelector('[data-atlas-map]').dataset.geodata, 'loaded');
    assert.equal(atlas.el.querySelectorAll('[data-atlas-marker]').length, 8);
    assert.equal(atlas.el.querySelectorAll('.atlas-choice').length, 7);
    for (const region of INDIA_LANDFORMS) {
      const button = atlas.el.querySelector(`[data-region="${region.id}"]`);
      button.click();
      assert.equal(button.getAttribute('aria-pressed'), 'true');
      assert.equal(atlas.el.querySelectorAll('.atlas-choice[aria-pressed="true"]').length, 1);
      assert.equal(changes.at(-1), region.agent);
      assert.match(atlas.el.querySelector('.atlas-detail').textContent, new RegExp(region.name.en.split(' · ')[0]));
    }
    atlas.el.querySelector('[data-region="islands"]').click();
    assert.match(atlas.el.querySelector('.atlas-detail').textContent, /coral/i);
    assert.match(atlas.el.querySelector('.atlas-detail').textContent, /subduction/i);
    assert.equal(JSON.parse(localStorage.getItem('eduverse.ix.ss.v1')).sim['T02.atlas'].region, 'islands');
    store.set({ lang: 'hi' });
    atlas.relabel();
    assert.match(atlas.el.querySelector('.atlas-detail').textContent, /लक्षद्वीप/);
    assert.match(atlas.el.querySelector('[data-atlas-map] svg').getAttribute('aria-label'), /मानचित्र/);
    store.set({ lang: 'both' });
    atlas.relabel();
    assert.match(atlas.el.querySelector('.atlas-detail').textContent, /Lakshadweep/);
    assert.match(atlas.el.querySelector('.atlas-detail').textContent, /लक्षद्वीप/);
    atlas.destroy();

    // A failed geodata request leaves the accessible region buttons and gallery linkage usable.
    GEO.india = null;
    globalThis.fetch = async () => { throw new Error('offline'); };
    let fallbackAgent = '';
    const offline = createIndiaAtlas({ onSelect: (r) => { fallbackAgent = r.agent; } });
    document.body.append(offline.el);
    offline.enable();
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(offline.el.querySelector('[data-atlas-map]').dataset.geodata, 'fallback');
    assert.equal(offline.el.querySelector('.atlas-fallback').hidden, false);
    assert.equal(offline.el.querySelector('[data-region="islands"]').getAttribute('aria-pressed'), 'true');
    offline.el.querySelector('[data-region="thar"]').click();
    assert.equal(fallbackAgent, 'wind');
    offline.destroy();
  } finally {
    globalThis.fetch = realFetch;
    dom.window.close();
  }
});
