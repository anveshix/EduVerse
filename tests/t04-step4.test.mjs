import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import * as THREE from '../vendor/three/three.module.min.js';
import { CASE_FILES } from '../src/modules/history/detective-kit.js';
import { HARAPPAN_STOPS, stopFor, stopVisible, patchForStop } from '../src/modules/history/harappan-tour.js';
import { createHarappan3d } from '../src/modules/history/harappan-3d.js';
import { settlementLab, harappanCity, civAtlas } from '../src/modules/history/t04-specs.js';
import { settlementSim, harappanPlan } from '../src/engines/domain/history.js';
import * as M from '../src/modules/history/models.js';
import * as store from '../src/core/store.js';

const bilingual = (pair) => assert.ok(pair?.en && /[\u0900-\u097f]/.test(pair?.hi), `missing bilingual text: ${JSON.stringify(pair)}`);
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} should equal ${b}`);

test('T04 detective cases separate recorded observations, interpretations and testable alternatives', () => {
  assert.deepEqual(CASE_FILES.map((f) => f.id), ['bone', 'grain', 'platform']);
  for (const file of CASE_FILES) {
    [file.title, file.setting, ...file.observations].forEach(bilingual);
    for (const options of [file.claims, file.tests]) {
      assert.equal(new Set(options.map((o) => o.id)).size, options.length);
      assert.equal(options.filter((o) => o.useful).length, 1, `${file.id}: one most defensible option per question`);
      for (const option of options) { bilingual(option.label); bilingual(option.feedback); }
    }
    assert.ok(file.claims.length >= 3 && file.tests.length >= 2);
  }
  assert.match(CASE_FILES[0].claims.find((o) => o.useful).label.en, /might[\s\S]*trampling/i);
  assert.match(CASE_FILES[1].claims.find((o) => o.useful).label.en, /uncertain/i);
  assert.match(CASE_FILES[2].claims.find((o) => o.useful).label.en, /possibility[\s\S]*not yet known/i);
});

test('T04 six bilingual tour stops reconcile model visibility, archaeological uncertainty and camera targets', () => {
  assert.deepEqual(HARAPPAN_STOPS.map((s) => s.id), ['raised', 'bath', 'streets', 'drains', 'wells', 'platform']);
  for (const stop of HARAPPAN_STOPS) {
    [stop.label, stop.site, stop.evidence, stop.inference, stop.unknown, stop.next].forEach(bilingual);
    assert.ok(stop.sources.length);
    for (const n of [stop.view.az, stop.view.pol, stop.view.r, ...Object.values(stop.view.target)]) assert.ok(Number.isFinite(n));
    const state = { ...harappanCity.init(), ...(stop.patch ? Object.fromEntries(Object.keys(stop.patch).map((k) => [k, false])) : {}), ...(stop.id === 'wells' ? { wells: 0 } : {}), tourStop: stop.id };
    if (stop.patch || stop.id === 'wells') assert.equal(stopVisible(stop, harappanPlan(state)), false);
    Object.assign(state, patchForStop(stop, state));
    assert.equal(stopVisible(stop, harappanPlan(state)), true);
    const v = harappanCity.view(state);
    assert.match(v.svg, new RegExp(`data-harappa-selected="${stop.id}"`));
    assert.match(v.svg, new RegExp(`data-harappa-highlight="${stop.id}"`));
    assert.match(v.lines[1].en, /not an excavation map/i);
  }
  assert.equal(stopFor('broken-saved-id').id, 'raised');
  assert.equal(harappanPlan({ wells: 99 }).wells, 3);
  assert.equal(harappanPlan({ wells: -1 }).wells, 0);
  assert.equal(harappanPlan({ wells: 'bad' }).wells, 0);
  assert.equal('sanitation' in harappanPlan({}), false);
  assert.equal('floodSafety' in harappanPlan({}), false);
  assert.match(stopFor('platform').unknown.en, /disputed[\s\S]*not[\s\S]*prove/i);
  assert.match(stopFor('bath').inference.en, /suggest/i);
});

test('T04 settlement toy keeps food reserves consistent and covers a shortfall before decline', () => {
  const run = (storage) => settlementSim({ mode: 'farmer', rainfallVar: 0.7, storage });
  const low = run(0.1), high = run(0.9);
  for (const [r, storage] of [[low, 0.1], [high, 0.9]]) {
    assert.equal(r.series.length, 16);
    assert.deepEqual([r.series[0].y, r.series[0].pop, r.series[15].y], [0, 65, 15]);
    for (let i = 1; i < r.series.length; i++) {
      const before = r.series[i - 1], after = r.series[i];
      assert.ok(after.foodStore >= 0 && after.foodStore <= 180 * storage + 20);
      near(after.withdrawal, Math.min(before.foodStore, after.shortfall));
      near(after.unmet, after.shortfall - after.withdrawal);
      near(after.foodStore, Math.min(180 * storage + 20, before.foodStore - after.withdrawal + Math.max(0, after.surplus)));
      if (after.shortfall > 0 && after.unmet === 0) assert.equal(after.pop, before.pop, 'covered shortfall pauses population growth');
      if (after.unmet > 0) assert.ok(after.pop < before.pop, 'uncovered shortfall causes a decline in this example');
    }
  }
  assert.ok(low.series.some((p) => p.unmet > 0));
  assert.ok(high.series.some((p) => p.shortfall > 0 && p.unmet === 0));
  assert.ok(high.finalPop > low.finalPop, 'in this invented weather cycle more storage can change the outcome');
  assert.equal(settlementLab.note.kind, 'fictional');
  assert.match(settlementLab.view(settlementLab.init()).lines[1].en, /rules are invented/i);
});

test('T04 clock and atlas disclose scale limits and approximate comparisons', () => {
  assert.equal(M.SPAN, 2_000_000);
  near(M.minutesBeforeMidnight(8000), 5.76);
  near(M.minutesBeforeMidnight(12000), 8.64);
  assert.equal(M.logPos(0), M.logPos(100));
  assert.match(civAtlas.discover[0].en, /do not overlap/i);
  assert.match(civAtlas.note.en, /schematic[\s\S]*approximate/i);
  store.set({ lang: 'hi' });
  assert.match(civAtlas.view({ civ: 'china' }).svg, /कांस्य-युगीन सभ्यताएँ/);
  store.set({ lang: 'en' });
});

test('T04 3D builder marks each feature, highlights selections and disposes its scene', () => {
  const dom = new JSDOM('<!doctype html><body><div id="labels"></div></body>');
  const prior = globalThis.document;
  Object.defineProperty(globalThis, 'document', { configurable: true, writable: true, value: dom.window.document });
  try {
    const scene = new THREE.Scene(), host = document.querySelector('#labels');
    let pickables = [], invalidations = 0;
    const api = { THREE, scene,
      markPickable(mesh, info) { pickables.push(info.tour); },
      clearPickables() { pickables = []; },
      invalidate() { invalidations++; },
      project() { return { x: 5, y: 6, visible: true }; },
    };
    const view = createHarappan3d(api, host);
    view.update({ ...harappanCity.init(), tourStop: 'bath' });
    assert.deepEqual([...new Set(pickables)].sort(), ['bath', 'drains', 'platform', 'raised', 'streets', 'wells']);
    assert.match(host.querySelector('[data-harappa-label=bath]').textContent, /^▶ /);
    assert.equal(scene.children[0].children.filter((o) => o.isLineSegments).length, 1);
    view.place(true);
    assert.equal(host.querySelector('[data-harappa-label=bath]').hidden, false);
    view.update({ ...harappanCity.init(), greatBath: false, tourStop: 'bath' });
    assert.ok(!pickables.includes('bath'));
    assert.equal(host.querySelector('[data-harappa-label=bath]'), null);
    assert.equal(scene.children[0].children.filter((o) => o.isLineSegments).length, 0, 'a hidden feature has no highlight');
    store.set({ lang: 'hi' }); view.relabel();
    assert.match(host.querySelector('[data-harappa-label=platform]').textContent, /चबूतरा/);
    view.dispose();
    assert.equal(scene.children.length, 0);
    assert.equal(host.childElementCount, 0);
    assert.ok(invalidations >= 2);
  } finally {
    store.set({ lang: 'en' });
    Object.defineProperty(globalThis, 'document', { configurable: true, writable: true, value: prior });
    dom.window.close();
  }
});
