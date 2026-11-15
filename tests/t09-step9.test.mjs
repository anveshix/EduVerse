import test from 'node:test';
import assert from 'node:assert/strict';
import { MARKET_CASES } from '../src/modules/economics/mandi-inquiry.js';
import { quintalToKilogramPrice, initialMarket, equilibrium } from '../src/engines/domain/market.js';
import { EXIT } from '../src/modules/economics/content.js';
import { exitProgress } from '../src/core/progress.js';

const bilingual = (v) => assert.ok(v?.en && /[\u0900-\u097f]/.test(v.hi), `Missing translation: ${JSON.stringify(v)}`);
test('T09 evidence has dated, sourced and carefully scoped market examples', () => {
  assert.deepEqual(MARKET_CASES.map((c) => c.id), ['patna', 'tomato', 'onion', 'msp']);
  for (const c of MARKET_CASES) {
    [c.label, c.evidence, c.question, c.explain, c.sourceLabel].forEach(bilingual);
    c.options.forEach((o) => bilingual(o.text));
    assert.equal(c.options.filter((o) => o.correct).length, 1);
    assert.match(c.source, /^https:\/\//);
  }
  assert.match(MARKET_CASES[0].evidence.en, /₹60–70\/kg.*₹100\/kg.*not today/s);
  assert.match(MARKET_CASES[1].evidence.en, /₹80\/kg.*concessional retail.*not a Patna mandi quote/s);
  assert.match(MARKET_CASES[2].evidence.en, /₹25\/kg.*does not establish a Patna mandi price/s);
  assert.match(MARKET_CASES[3].evidence.en, /2024–25.*₹2,300 per quintal.*₹23\/kg.*not a tomato or onion quote/s);
  assert.match(MARKET_CASES[3].explain.en, /access.*not the current MSP/s);
});
test('per-quintal conversion and the fictional supply shock are deterministic and distinct from evidence', () => {
  assert.equal(quintalToKilogramPrice(2300), 23);
  assert.equal(quintalToKilogramPrice(2320), 23.2);
  assert.equal(quintalToKilogramPrice(0), 0);
  for (const v of [NaN, Infinity, -1, 1000001, '2300', null, undefined]) assert.equal(quintalToKilogramPrice(v), null);
  const initial = { ...initialMarket(), scenario: 'perishable' };
  const before = equilibrium(initial), after = equilibrium({ ...initial, sS: -20 });
  assert.ok(after.P > before.P); assert.ok(after.Q < before.Q);
});
test('new and legacy exit IDs cover all T09 learning objects without losing old progress', () => {
  const theme = { id: 'T09', learningObjects: Array.from({ length: 6 }, (_, i) => ({ id: `T09.L${i + 1}` })) };
  const ok = { ok: true };
  const exit = { x1: ok, x3: ok, ...Object.fromEntries(EXIT.filter((x) => x.id.startsWith('T09.')).map((x) => [x.id, ok])) };
  assert.deepEqual(exitProgress(theme, { exit }), { k: 6, n: 6, done: true });
  for (const q of EXIT) {
    bilingual(q.stem); bilingual(q.explain); bilingual(q.hint);
    for (const o of q.options) bilingual(o);
    assert.ok(q.options.some((o) => o.id === q.correct));
  }
});
