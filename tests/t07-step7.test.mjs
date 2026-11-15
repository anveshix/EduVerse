import test from 'node:test';
import assert from 'node:assert/strict';
import { delimitationOutcome, TOY_BLOCKS, checkVoterRoll } from '../src/engines/domain/society.js';
import { PARTIES, run, coalitionStatus, minimalWinningCoalitions } from '../src/engines/domain/election.js';
import { VOTER_STAGES, PRACTICE_CHOICES } from '../src/modules/politics/voter-journey.js';
import { COALITION_PARTIES } from '../src/modules/politics/coalition-builder.js';
import { electionTimeline, delimitationLab, coalition } from '../src/modules/politics/t07-specs.js';

const bilingual = (o) => assert.ok(o?.en && /[\u0900-\u097f]/.test(o?.hi), `Missing Hindi: ${JSON.stringify(o)}`);
function connected(blocks) {
  const seen = new Set([blocks[0]]);
  for (let changed = true; changed;) {
    changed = false;
    for (const a of [...seen]) for (const b of blocks) if (!seen.has(b) && Math.abs(Math.floor(a / 3) - Math.floor(b / 3)) + Math.abs(a % 3 - b % 3) === 1) { seen.add(b); changed = true; }
  }
  return seen.size === blocks.length;
}

test('voter journey is bilingual, separate from a real ballot and explicitly explains the VVPAT slip', () => {
  assert.deepEqual(VOTER_STAGES.map((x) => x.id), ['roll', 'compare', 'booth', 'mark', 'count']);
  for (const s of VOTER_STAGES) [s.title, s.body, s.question].forEach(bilingual);
  PRACTICE_CHOICES.forEach((p) => bilingual(p.name));
  assert.match(VOTER_STAGES[0].body.en, /does not automatically add a name/i);
  assert.match(VOTER_STAGES[3].body.en, /not an EVM or an actual ballot/i);
  assert.match(VOTER_STAGES[4].body.en, /sealed box, not into the voter’s hand/i);
  assert.match(VOTER_STAGES[4].question.en, /not a majority[\s\S]*does not change this count/i);
  assert.match(electionTimeline.note.en, /not before every election/i);
  assert.match(electionTimeline.view({ stage: 4, independentEci: true }).lines[1].en, /does not guarantee/i);
});

test('nine-block boundaries are complete, connected and preserve the same votes', () => {
  const seen = [];
  for (const scheme of ['rows', 'cols', 'packedA', 'unequal']) {
    const r = delimitationOutcome(scheme);
    assert.equal(r.totalA, 460); assert.equal(r.totalB, 440);
    assert.equal(r.seatsA + r.seatsB, 3);
    assert.deepEqual(r.districts.flatMap((d) => d.blocks).sort((a, b) => a - b), TOY_BLOCKS.map((x) => x.id));
    for (const d of r.districts) { assert.ok(connected(d.blocks), `${scheme}: disconnected ${d.blocks}`); assert.equal(d.votesA + d.votesB, d.pop); }
    seen.push(r);
  }
  assert.deepEqual(seen[0].districts.map((d) => d.pop), [300, 300, 300]);
  assert.deepEqual(seen[2].districts.map((d) => [d.votesA, d.votesB]), [[205, 95], [145, 155], [110, 190]]);
  assert.equal(seen[2].popSpread, 0); assert.deepEqual([seen[2].seatsA, seen[2].seatsB], [1, 2]);
  assert.equal(seen[3].popSpread, 300);
  assert.match(delimitationLab.predictions[0].explain().en, /205–95/);
  assert.equal(delimitationLab.predictions[0].revision, 't07-step7');
  assert.match(delimitationLab.view(delimitationLab.init()).lines[1].en, /does not by itself prevent partisan/i);
  assert.match(delimitationLab.view(delimitationLab.init()).lines[2].en, /not automatic registration/i);
  assert.equal(checkVoterRoll({ age: 17, citizen: true, resident: true }).eligible, false);
});

test('vote and seat leader ties are represented without a fabricated sole leader', () => {
  const tiedVotes = run('fptp', 6.5);
  assert.deepEqual(tiedVotes.voteLeaders, ['R', 'B']);
  assert.deepEqual(tiedVotes.seatLeaders, ['R']);
  assert.equal(tiedVotes.mismatch, false);
  const tiedSeats = run('proportional', 2);
  assert.deepEqual(tiedSeats.seatLeaders, ['R', 'B']);
  assert.equal(tiedSeats.mismatch, false);
  for (const system of ['fptp', 'runoff', 'proportional']) for (let swing = -10; swing <= 15; swing++) {
    const r = run(system, swing);
    assert.equal(Object.values(r.seats).reduce((a, b) => a + b, 0), 10);
    assert.ok(Math.abs(Object.values(r.voteShare).reduce((a, b) => a + b, 0) - 1) < 1e-9);
    assert.equal(r.mismatch, !r.voteLeaders.some((p) => r.seatLeaders.includes(p)));
  }
  assert.match(coalition.controls.find((c) => c.id === 'swing').label.en, /B votes to R/i);
});

test('coalition builder distinguishes majority, minimal winning and surplus support', () => {
  Object.values(COALITION_PARTIES).forEach(bilingual);
  const seats = { R: 3, B: 5, G: 1, Y: 1 };
  assert.deepEqual(coalitionStatus(seats, []), { valid: true, total: 10, need: 6, support: 0, majority: false, minimal: false, surplus: [] });
  assert.equal(coalitionStatus(seats, ['B']).majority, false);
  assert.equal(coalitionStatus(seats, ['B', 'G']).minimal, true);
  assert.deepEqual(coalitionStatus(seats, ['B', 'G', 'R']).surplus, ['G', 'R']);
  assert.equal(coalitionStatus(seats, ['B', 'B']).valid, false);
  assert.equal(coalitionStatus(seats, ['bad']).valid, false);
  assert.equal(coalitionStatus({ R: -1, B: 11 }, ['R']).valid, false);
  assert.equal(coalitionStatus({ R: 0, B: 10 }, ['R']).valid, false);
  for (const system of ['fptp', 'runoff', 'proportional']) for (let swing = -10; swing <= 15; swing++) {
    const current = run(system, swing).seats;
    for (const item of minimalWinningCoalitions(current).coalitions) {
      const result = coalitionStatus(current, item.parties);
      assert.ok(result.majority && result.minimal);
      assert.equal(result.support, item.seats);
    }
  }
  assert.match(coalition.view(coalition.init()).lines.at(-1).en, /does not guarantee stability/i);
  assert.equal(coalition.predictions[0].revision, 't07-step7');
});
