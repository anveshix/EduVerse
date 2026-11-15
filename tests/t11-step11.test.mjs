import test from 'node:test';
import assert from 'node:assert/strict';
import { HABITAT_CASES, FIRE_INQUIRY_CASES, FOREST_KNOWLEDGE_CASES } from '../src/modules/geography/habitat-inquiry.js';
import { INDIA_RESERVES, fireRisk, harvestRun, tourismComparison, webRun } from '../src/engines/domain/ecosystem.js';
import { biomeMap, reserveMap, harvest, foodweb, firePlanner, traditionalConservation } from '../src/modules/geography/t11-specs.js';
import { THEME_NEP } from '../src/data/nep-cbq.js';

const bilingual = (v) => assert.ok(v?.en && /[\u0900-\u097f]/.test(v.hi), `Missing translation: ${JSON.stringify(v)}`);
test('T11 source cases distinguish four Indian habitats and the Bihar wetland designation', () => {
  assert.deepEqual(HABITAT_CASES.map((c) => c.id), ['thar', 'sundarbans', 'ghats', 'kabartal']);
  for (const c of HABITAT_CASES) {
    [c.label, c.evidence, c.question, c.explain, c.sourceLabel].forEach(bilingual);
    c.options.forEach((o) => bilingual(o.text));
    assert.equal(c.options.filter((o) => o.correct).length, 1);
    assert.match(c.source, /^https:\/\//);
    assert.equal(c.point.length, 2); assert.ok(c.point[0] >= 68 && c.point[0] <= 98 && c.point[1] >= 6 && c.point[1] <= 37);
  }
  assert.match(HABITAT_CASES[0].explain.en, /not automatically degraded forests/);
  assert.match(HABITAT_CASES[1].evidence.en, /do not make storms harmless/);
  assert.match(HABITAT_CASES[2].evidence.en, /Not every part/);
  assert.match(HABITAT_CASES[3].evidence.en, /Begusarai.*2020.*migratory.*farmed.*Drainage/s);
  assert.match(HABITAT_CASES[3].explain.en, /not the same as a biosphere reserve/);
});
test('T11 fire inquiry is bilingual and directs learners away from real fires', () => {
  assert.deepEqual(FIRE_INQUIRY_CASES.map((c) => c.id), ['prepare', 'smoke']);
  for (const c of FIRE_INQUIRY_CASES) {
    [c.label, c.evidence, c.question, c.explain, c.sourceLabel].forEach(bilingual);
    c.options.forEach((o) => bilingual(o.text));
    assert.equal(c.options.filter((o) => o.correct).length, 1);
    assert.match(c.source, /^https:\/\//);
  }
  assert.match(FIRE_INQUIRY_CASES[0].explain.en, /Never start a test fire/);
  assert.match(FIRE_INQUIRY_CASES[1].explain.en, /Do not approach or fight a fire.*local services/s);
  const chosen = { temp: 36, humidity: 25, wind: 22, litter: 0.7, firebreak: false };
  assert.equal(firePlanner.predictions[0].run(chosen), 'cuts');
  const model = fireRisk({ tempC: chosen.temp, humidityPct: chosen.humidity, windKmh: chosen.wind, dryLitter: chosen.litter, firebreak: chosen.firebreak });
  assert.ok(model.effectiveIndex < model.rawIndex); assert.equal(model.spreadMMin, undefined);
});
test('T11 forest knowledge cases distinguish law and a tentative heritage listing', () => {
  assert.deepEqual(FOREST_KNOWLEDGE_CASES.map((c) => c.id), ['rights', 'apatani']);
  for (const c of FOREST_KNOWLEDGE_CASES) {
    [c.label, c.evidence, c.question, c.explain, c.sourceLabel].forEach(bilingual);
    c.options.forEach((o) => bilingual(o.text));
    assert.equal(c.options.filter((o) => o.correct).length, 1); assert.match(c.source, /^https:\/\//);
  }
  assert.match(FOREST_KNOWLEDGE_CASES[0].evidence.en, /eligible.*legal process/s);
  assert.match(FOREST_KNOWLEDGE_CASES[0].explain.en, /not legal advice/);
  assert.match(FOREST_KNOWLEDGE_CASES[1].evidence.en, /tentative-list.*not a World Heritage inscription/s);
});
test('T11 preserves legacy reserve state but only maps selected real biosphere reserves', () => {
  assert.equal(INDIA_RESERVES.some((r) => r.id === 'palamau'), false);
  assert.ok(INDIA_RESERVES.some((r) => r.id === 'achanakmar'));
  assert.doesNotMatch(INDIA_RESERVES.find((r) => r.id === 'manas').en, /Kaziranga/);
  const old = { reserve: 'palamau', zone: 'buffer', done: { e1: { ok: true } } }; reserveMap.prepareState(old);
  assert.deepEqual(old, { reserve: 'nilgiri', previousReserve: 'palamau', zone: 'buffer', done: { e1: { ok: true } } });
  const malformed = { item: 'missing' }; traditionalConservation.prepareState(malformed); assert.equal(malformed.item, 'sacred');
  assert.match(biomeMap.view({ temp: -12, rain: 3200 }).lines[0].en, /Closest model category \(no envelope match\)/);
});
test('T11 tourism arithmetic is not a capacity or safety decision', () => {
  assert.deepEqual(tourismComparison(0, 80), { over: 0, under: 80 });
  assert.deepEqual(tourismComparison(80, 80), { over: 0, under: 0 });
  assert.deepEqual(tourismComparison(120, 80), { over: 40, under: 0 });
  assert.match(THEME_NEP.T11.caseQ.passage.en, /Fictional case/);
  assert.match(THEME_NEP.T11.caseQ.explain.en, /not guaranteed/);
});
test('T11 harvest responds to low starting stock and keeps modeled claims bounded', () => {
  assert.equal(harvestRun({ harvest: 80, stock0: 100 }).collapsedAt, 2);
  assert.equal(harvestRun({ harvest: 80, stock0: 800 }).collapsedAt, null);
  assert.match(harvest.view({ harvest: 80, stock0: 100 }).lines[1].en, /depleted in year 2/);
  assert.match(harvest.view({ harvest: 80, stock0: 800 }).lines[1].en, /not guarantee.*sustainability/);
  assert.equal(harvest.predictions[0].revision, 't11-step11');
  for (const S of [{ harvest: 0, stock0: 100 }, { harvest: 160, stock0: 1000 }]) assert.doesNotMatch(JSON.stringify(harvest.view(S)), /NaN|undefined|Infinity/);
});
test('T11 food web and fire outputs disclose what the models cannot calculate', () => {
  assert.ok(Math.max(...webRun({ cullYear: 10, cullFrac: 0.9 }).map((p) => p.prey)) > Math.max(...webRun().map((p) => p.prey)));
  assert.match(foodweb.view(foodweb.init()).lines[1].en, /plants and food shortage are not represented/);
  assert.match(foodweb.predictions[0].explain().en, /does not calculate plant abundance/);
  for (const S of [firePlanner.init(), { temp: 45, humidity: 10, wind: 50, litter: 1, firebreak: true }]) {
    const v = firePlanner.view(S); const text = v.lines.map((line) => line.en).join(' ');
    assert.match(text, /Invented model index.*not a fire-spread forecast.*stay away.*local forest or emergency/s);
    assert.doesNotMatch(v.svg + text, /m\/min|NaN|Infinity|undefined/);
  }
  assert.equal(firePlanner.predictions[0].revision, 't11-step11');
});
