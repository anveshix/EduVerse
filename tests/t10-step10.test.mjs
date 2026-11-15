import test from 'node:test';
import assert from 'node:assert/strict';
import { FISHERY_CASES, HAZARD_CASES } from '../src/modules/geography/ocean-connections.js';
import { fisheries, tsunami, maritimeCoop } from '../src/modules/geography/t10-specs.js';
import { fisheryRun, tsunamiKmh, arrivalHours } from '../src/engines/domain/ocean.js';
import { THEME_NEP } from '../src/data/nep-cbq.js';

const bilingual = (v) => assert.ok(v?.en && /[\u0900-\u097f]/.test(v.hi), `Missing translation: ${JSON.stringify(v)}`);
test('T10 source cases distinguish coastal hazards, historical forecasts and inland fisheries', () => {
  assert.deepEqual(FISHERY_CASES.map((c) => c.id), ['marine', 'value', 'inland']);
  assert.deepEqual(HAZARD_CASES.map((c) => c.id), ['cyclone', 'bihar', 'tsunami']);
  for (const c of [...FISHERY_CASES, ...HAZARD_CASES]) {
    [c.label, c.evidence, c.question, c.explain, c.sourceLabel].forEach(bilingual);
    c.options.forEach((o) => bilingual(o.text));
    assert.equal(c.options.filter((o) => o.correct).length, 1); assert.match(c.source, /^https:\/\//);
  }
  assert.match(FISHERY_CASES[2].evidence.en, /Bihar is inland.*not be labelled marine/);
  assert.match(FISHERY_CASES[1].evidence.en, /interrupt earnings/);
  assert.match(HAZARD_CASES[0].evidence.en, /2025.*historical forecast.*not an alert today/);
  assert.match(HAZARD_CASES[1].evidence.en, /forecast.*not proof.*not coastal storm surge/);
  assert.match(HAZARD_CASES[2].options[0].text.en, /drop, cover and hold on.*immediately inland/);
  assert.match(HAZARD_CASES[2].explain.en, /before an official warning.*all-clear/);
});
test('T10 model labels invented fishery indices and avoids treating them as income forecasts', () => {
  const base = { boats: 45, meshMm: 45, mangrovePct: 60 };
  const a = fisheryRun({ ...base, closedMonths: 0 }), c = fisheryRun({ ...base, closedMonths: 2 });
  assert.ok(c.finalStock > a.finalStock); assert.ok(Number.isFinite(c.totalCatch));
  for (const S of [fisheries.init(), { boats: 120, mesh: 20, closed: 0, mangrove: 10 }, { boats: 15, mesh: 70, closed: 4, mangrove: 100 }]) {
    const text = fisheries.view(S).lines.map((l) => l.en).join(' ');
    assert.match(text, /Invented model.*index.*do not certify sustainability or predict fishers’ incomes/s);
    assert.doesNotMatch(text, /NaN|Infinity|undefined/);
  }
  assert.equal(fisheries.predictions[0].revision, 't10-step10');
  assert.match(THEME_NEP.T10.caseQ.passage.en, /Fictional case/);
  assert.match(THEME_NEP.T10.caseQ.explain.en, /not guaranteed/);
});
test('T10 tsunami arithmetic does not offer a real evacuation margin', () => {
  assert.ok(Math.abs(tsunamiKmh(4000) - 713) < 1);
  assert.ok(Math.abs(arrivalHours(1000, 4000) - 1.4) < 0.02);
  for (const S of [{ depth: 4000, dist: 1000, siren: 20 }, { depth: 6000, dist: 50, siren: 180 }, { depth: 10, dist: 5000, siren: 0 }]) {
    const v = tsunami.view(S), text = v.lines.map((l) => l.en).join(' ');
    assert.match(text, /imaginary constant-depth model.*Arithmetic only.*cannot tell anyone whether a route is safe.*Never wait.*all-clear/s);
    assert.doesNotMatch(text, /margin remain|NaN|Infinity|undefined/);
  }
  assert.match(tsunami.exit[0].stem.en, /idealised model.*uniform 4000 m/);
  assert.equal(tsunami.predictions[0].revision, 't10-step10');
  assert.match(maritimeCoop.view({ focus: 'rescue' }).lines[0].en, /may not precede a nearby tsunami/);
});
