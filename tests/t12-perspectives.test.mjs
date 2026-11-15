import test from 'node:test';
import assert from 'node:assert/strict';
import { PERSPECTIVES } from '../src/modules/history/perspectives.js';
import { regionalPolitiesMap } from '../src/modules/history/t12-specs.js';

const bilingual = (o) => assert.ok(o?.en && /[\u0900-\u097f]/.test(o.hi), `Missing translation: ${JSON.stringify(o)}`);
test('T12 compares four explicitly imagined, overlapping perspectives with background sources', () => {
  assert.deepEqual(PERSPECTIVES.map((p) => p.id), ['ruler', 'farmer', 'trader', 'woman']);
  for (const p of PERSPECTIVES) {
    [p.label, p.evidence, p.question, p.explain, p.sourceLabel].forEach(bilingual);
    p.options.forEach((o) => bilingual(o.text));
    assert.equal(p.options.filter((o) => o.correct).length, 1);
    assert.match(p.evidence.en, /Imagined perspective/);
    assert.match(p.source, /^https:\/\//);
  }
  assert.match(PERSPECTIVES[0].explain.en, /not the whole story/);
  assert.match(PERSPECTIVES[1].explain.en, /not a historical witness/);
  assert.match(PERSPECTIVES[2].explain.en, /not complete records/);
  assert.match(PERSPECTIVES[3].evidence.en, /farmers, traders or rulers/);
  assert.match(PERSPECTIVES[3].explain.en, /not proof of absence/);
});
test('T12 map labels are bounded and revised predictions keep old-answer identity', () => {
  for (const year of ['1050', '1350', '1680']) for (const alliance of [true, false]) {
    const v = regionalPolitiesMap.view({ year, alliance });
    assert.match(v.lines.map((l) => l.en).join(' '), /Modern state outlines are not historical borders/);
    assert.doesNotMatch(JSON.stringify(v), /NaN|Infinity|undefined/);
  }
  assert.match(regionalPolitiesMap.view({ year: '1050', alliance: true }).lines[1].en, /Bhagalpur, Bihar/);
  assert.match(regionalPolitiesMap.view({ year: '1680', alliance: true }).lines[1].en, /1671 battle, not a 1680 event/);
  assert.equal(regionalPolitiesMap.predictions[0].revision, 't12-step12');
  const state = { year: 'missing', alliance: true }; regionalPolitiesMap.prepareState(state);
  assert.equal(state.year, '1350'); assert.equal(regionalPolitiesMap.predictions[0].run(state), 'river'); assert.equal(state.year, '1680');
});
