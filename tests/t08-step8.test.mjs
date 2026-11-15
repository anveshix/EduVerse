import test from 'node:test';
import assert from 'node:assert/strict';
import { householdBudget, householdShock, ppfPoint, opportunityCost } from '../src/engines/domain/market.js';
import { BUDGET, BUDGET_CATEGORIES } from '../src/modules/economics/household-budget.js';
import { TIME_SLOTS, timeAllocation } from '../src/modules/economics/time-frontier.js';
import { ppf, scarcityGame, econFlow, econSystems, safetyNet } from '../src/modules/economics/t08-specs.js';
import { THEME_NEP } from '../src/data/nep-cbq.js';

const bilingual = (v) => assert.ok(v?.en && /[\u0900-\u097f]/.test(v.hi), `Missing translation: ${JSON.stringify(v)}`);
test('fictional household budget handles under, exact and over allocation and unexpected cost', () => {
  assert.equal(BUDGET, 1000);
  assert.equal(BUDGET_CATEGORIES.length, 5);
  BUDGET_CATEGORIES.forEach((c) => { bilingual(c.name); assert.equal(c.initial % 50, 0); });
  const initial = BUDGET_CATEGORIES.map((c) => c.initial);
  assert.deepEqual(householdBudget({ budget: BUDGET, allocations: initial }), { valid: true, budget: 1000, allocated: 900, extra: 0, planned: 900, balance: 100, shortfall: 0, unallocated: 100 });
  assert.deepEqual(householdBudget({ budget: 1000, allocations: initial, extra: 100 }), { valid: true, budget: 1000, allocated: 900, extra: 100, planned: 1000, balance: 0, shortfall: 0, unallocated: 0 });
  assert.deepEqual(householdBudget({ budget: 1000, allocations: [1000, 1000], extra: 100 }), { valid: true, budget: 1000, allocated: 2000, extra: 100, planned: 2100, balance: -1100, shortfall: 1100, unallocated: 0 });
  for (const v of [NaN, Infinity, -1, 1.5, '20', 1001]) assert.equal(householdBudget({ budget: 1000, allocations: [v] }).valid, false);
  for (const patch of [{ budget: -1 }, { budget: 2.5 }, { allocations: [] }, { allocations: null }, { extra: -1 }, { extra: NaN }]) assert.equal(householdBudget({ budget: 1000, allocations: [1], ...patch }).valid, false);
});
test('the time frontier has four 30 minute slots and rejects invalid states', () => {
  assert.equal(TIME_SLOTS, 4);
  for (let slots = 0; slots <= TIME_SLOTS; slots++) {
    const r = timeAllocation(slots);
    assert.deepEqual(r, { valid: true, projectMinutes: slots * 30, restMinutes: 120 - slots * 30 });
  }
  for (const slots of [-1, 5, 2.5, NaN, Infinity, '2', null]) assert.equal(timeAllocation(slots).valid, false);
});
test('PPF distinguishes an interior point, frontier reference and maximum endpoint', () => {
  assert.equal(ppfPoint(3, 4, 10, 10).status, 'inefficient');
  assert.equal(ppfPoint(6, 8, 10, 10).status, 'efficient');
  assert.equal(ppfPoint(10, 0, 10, 10).status, 'efficient');
  assert.equal(ppfPoint(11, 0, 10, 10).status, 'unattainable');
  assert.ok(opportunityCost(8, 1, 10, 10) > opportunityCost(1, 1, 10, 10));
  const inside = ppf.view({ a: 3, b: 4, tech: false }).lines.map((l) => l.en).join(' ');
  assert.match(inside, /INSIDE/); assert.match(inside, /Frontier reference \(not necessarily the selected point\)/);
  assert.match(ppf.view({ a: 10, b: 0, tech: false }).lines[1].en, /no next 0.5 t move/i);
  assert.match(ppf.view({ a: 13, b: 0, tech: false }).lines[1].en, /exceeds the model maximum/i);
  assert.match(ppf.view({ a: 13, b: 0, tech: true }).lines[1].en, /no next 0.5 t move/i);
});
test('T08 teaching claims keep fictional assumptions and limits visible', () => {
  assert.match(scarcityGame.view(scarcityGame.init()).lines[1].en, /best alternative given up/);
  assert.doesNotMatch(scarcityGame.view(scarcityGame.init()).lines.map((l) => l.en).join(' '), /well.?being index/i);
  assert.match(econFlow.note.en, /not evidence.*forecasts/i);
  assert.match(econFlow.view(econFlow.init()).lines[0].en, /Invented model indicators/i);
  for (const sys of ['market', 'planned', 'mixed']) {
    const view = econSystems.view({ sys });
    assert.match(view.lines[1].en, /Possible strength/); assert.match(view.lines[2].en, /Possible risk/);
    assert.match(view.lines[3].en, /not guaranteed outcomes or scores/i);
    assert.doesNotMatch(view.svg, /\/100/);
  }
  const shock = householdShock({ savings: 6000, shockCost: 15000, safetyNetCoverPct: 0 });
  assert.equal(shock.gap, 9000);
  const view = safetyNet.view({ shockCost: 15000, safetyNetCoverPct: 0 });
  assert.match(view.svg, /not a loan prediction/i);
  assert.match(view.lines[1].en, /not automatically a loan/i);
  assert.equal(safetyNet.predictions[0].revision, 't08-step8');
  assert.equal(econFlow.predictions[0].revision, 't08-step8');
  const cbq = THEME_NEP.T08.caseQ;
  assert.match(cbq.passage.en, /Fictional.*hypothetical/i);
  assert.match(cbq.explain.en, /₹4,500.*cannot predict debt/i);
  assert.equal(cbq.correct, 'debt');
});
