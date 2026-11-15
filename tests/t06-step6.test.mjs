import test from 'node:test';
import assert from 'node:assert/strict';
import { classroomVoteTally } from '../src/engines/domain/society.js';
import { PANCHAYAT_ROLES } from '../src/modules/politics/panchayat-explorer.js';
import { CLASSROOM_SIZE, CLASSROOM_PROPOSALS } from '../src/modules/politics/classroom-vote.js';
import { democracyMap, earlyTraditions, institutions, countryCompare } from '../src/modules/politics/t06-specs.js';

const bilingual = (o) => assert.ok(o?.en && /[\u0900-\u097f]/.test(o?.hi), `Missing translation: ${JSON.stringify(o)}`);

test('classroom tally distinguishes no votes, tie, plurality and majority of counted votes', () => {
  assert.equal(CLASSROOM_SIZE, 12);
  assert.equal(CLASSROOM_PROPOSALS.length, 3);
  CLASSROOM_PROPOSALS.forEach((p) => bilingual(p.title));
  assert.deepEqual(classroomVoteTally(12, [0, 0, 0]), { valid: true, eligible: 12, cast: 0, uncounted: 12, outcome: 'none', leaders: [], majorityOfCast: false });
  assert.deepEqual(classroomVoteTally(12, [2, 2, 1]).leaders, [0, 1]);
  assert.equal(classroomVoteTally(12, [2, 2, 1]).outcome, 'tie');
  assert.equal(classroomVoteTally(12, [2, 1, 1]).majorityOfCast, false);
  assert.equal(classroomVoteTally(12, [3, 1, 1]).majorityOfCast, true);
  assert.equal(classroomVoteTally(12, [4, 4, 4]).uncounted, 0);
  for (const [n, votes] of [[12, [13, 0, 0]], [12, [-1, 0, 0]], [12, [1.5, 0, 0]], [0, [0, 0]], [12, []], [12, null]]) assert.equal(classroomVoteTally(n, votes).valid, false);
});

test('local governance roles are bilingual and state limits are explicit', () => {
  assert.deepEqual(PANCHAYAT_ROLES.map((r) => r.id), ['sabha', 'gram', 'block', 'district']);
  for (const role of PANCHAYAT_ROLES) [role.title, role.who, role.work, role.question].forEach(bilingual);
  assert.match(PANCHAYAT_ROLES[0].who.en, /registered on the electoral rolls/i);
  assert.match(PANCHAYAT_ROLES[1].who.en, /elected representatives/i);
  assert.match(PANCHAYAT_ROLES[2].work.en, /20 lakh people may omit/i);
  assert.match(earlyTraditions.view(earlyTraditions.init()).lines[1].en, /do not equate[\s\S]*universal adult suffrage/i);
});

test('preset changes and manual checks share the state used to score the case', () => {
  const s = democracyMap.init(), controls = Object.fromEntries(democracyMap.controls.map((c) => [c.id, c]));
  controls.preset.afterChange(s, 'oneparty');
  assert.deepEqual([s.preset, s.freeVote, s.multipleParties, s.freeMedia, s.equalLaw], ['oneparty', true, false, false, false]);
  assert.match(democracyMap.view(s).lines[0].en, /1 of 4/);
  s.equalLaw = true; controls.equalLaw.afterChange(s, true);
  assert.equal(s.preset, 'custom'); assert.match(democracyMap.view(s).lines[0].en, /2 of 4/);
  const legacy = { preset: 'pressban', freeVote: false, multipleParties: false, freeMedia: true, equalLaw: false };
  democracyMap.prepareState(legacy);
  assert.deepEqual(legacy, { preset: 'pressban', freeVote: true, multipleParties: true, freeMedia: false, equalLaw: true });
  assert.equal(democracyMap.predictions[0].revision, 't06-step6');
});

test('institution model makes its 100-vote assumption and US Electoral College explicit', () => {
  assert.match(institutions.note.en, /all 100 legislators vote/i);
  assert.match(institutions.controls.find((c) => c.id === 'vote').label.en, /vote of confidence/i);
  assert.equal(institutions.predictions[0].revision, 't06-step6');
  const us = countryCompare.view({ country: 'us' });
  assert.match(us.lines[1].en, /Electoral College/);
  assert.match(us.lines[1].hi, /निर्वाचक मंडल/);
});
