import test from 'node:test';
import assert from 'node:assert/strict';
import { TIMELINE_CHUNKS } from '../src/modules/history/timeline-chunks.js';
import { SAPTANGA_PARTS } from '../src/modules/history/saptanga-builder.js';
import { vedicDatedMap, empireAdmin, sourceRoom, guildTrade, aiAuditLab } from '../src/modules/history/t05-specs.js';
import { THEME_NEP } from '../src/data/nep-cbq.js';
import { saptangaEmpireSim } from '../src/engines/domain/history.js';

const bilingual = (o) => assert.ok(o?.en && /[\u0900-\u097f]/.test(o?.hi), `Missing translation: ${JSON.stringify(o)}`);

test('T05 timeline has three distinct sourced historical windows with explicit limits', () => {
  assert.deepEqual(TIMELINE_CHUNKS.map((x) => x.id), ['maurya', 'gupta', 'chola1000']);
  for (const chunk of TIMELINE_CHUNKS) {
    [chunk.label, chunk.dates, chunk.evidence, chunk.limit, chunk.question].forEach(bilingual);
    assert.ok(vedicDatedMap.controls[0].options.some((o) => o.id === chunk.id));
    const result = vedicDatedMap.view({ era: chunk.id, showTrade: true });
    assert.match(result.svg, /role="img"/);
    assert.match(result.lines[2].en, /not historical boundaries/);
  }
  assert.match(TIMELINE_CHUNKS[1].dates.en, /320–550/);
  assert.match(TIMELINE_CHUNKS[2].limit.en, /not universal adult suffrage/i);
  assert.match(TIMELINE_CHUNKS[2].limit.en, /continued beyond/i);
  assert.match(vedicDatedMap.view({ era: 'gupta' }).lines[1].en, /seventh century/);
  assert.equal(vedicDatedMap.predictions[0].revision, 't05-step5');
});

test('T05 Saptanga builder teaches seven distinct correctly labelled roles', () => {
  assert.deepEqual(SAPTANGA_PARTS.map((p) => p.id), ['svamin', 'amatya', 'janapada', 'durga', 'kosha', 'danda', 'mitra']);
  assert.equal(new Set(SAPTANGA_PARTS.map((p) => p.id)).size, 7);
  for (const part of SAPTANGA_PARTS) { bilingual(part.name); bilingual(part.role); }
  assert.match(SAPTANGA_PARTS.find((p) => p.id === 'janapada').role.en, /territory and the people/i);
  assert.match(SAPTANGA_PARTS.find((p) => p.id === 'danda').role.en, /defence and law/i);
  assert.match(SAPTANGA_PARTS.find((p) => p.id === 'mitra').role.en, /allies/i);
});

test('T05 numerical governance sandbox is distinct from historical Saptanga', () => {
  assert.equal(empireAdmin.note.kind, 'fictional');
  for (const mode of ['gana', 'maurya', 'samanta', 'chola']) {
    const s = { ...empireAdmin.init(), govMode: mode };
    const answer = empireAdmin.predictions[0].run(s);
    assert.equal(answer, 'collapse');
    assert.deepEqual([s.taxRate, s.roadsInvest, s.irrigationInvest], [38, 10, 10]);
    const model = saptangaEmpireSim({ governanceMode: mode, taxRate: s.taxRate, roadsInvest: s.roadsInvest, irrigationInvest: s.irrigationInvest });
    assert.deepEqual(model.indicators.map((i) => i.id), ['support', 'food', 'treasury', 'works', 'stability']);
    assert.deepEqual(model.limbs.map((i) => i.id), ['svamin', 'janapada', 'kosha', 'durga', 'mitra'], 'legacy consumers retain their IDs');
    assert.deepEqual(model.limbs.map((i) => i.val), model.indicators.map((i) => i.val));
    const view = empireAdmin.view(s);
    assert.match(view.lines[1].en, /not probabilities, historical measurements or the seven Saptanga/i);
    assert.doesNotMatch(view.svg, /Saptanga state health indicators/i);
  }
  assert.equal(empireAdmin.predictions[0].revision, 't05-step5');
});

test('T05 source comparison switch does not claim automatic verification or a confidence percentage', () => {
  for (const src of ['inscription', 'text', 'material', 'prashasti']) for (const corroborate of [true, false]) {
    const view = sourceRoom.view({ src, corroborate });
    assert.doesNotMatch(view.svg, /confidence|\d+%/i);
    if (corroborate) assert.match(view.lines[2].en, /does not check/i);
    else assert.match(view.lines[2].en, /one source can leave gaps/i);
  }
});

test('T05 trade and AI exercises distinguish model output from source evidence', () => {
  assert.equal(guildTrade.note.kind, 'fictional');
  assert.equal(guildTrade.predictions[0].revision, 't05-step5');
  assert.match(guildTrade.view(guildTrade.init()).lines[1].en, /invented, not historical/i);
  assert.equal(aiAuditLab.note.kind, 'fictional');
  for (const claimId of ['ashoka', 'samanta', 'science']) {
    const v = aiAuditLab.view({ claimId, checkEpigraphy: true, checkChronology: true, checkMaterial: true });
    assert.doesNotMatch(v.svg, /\d+%|confidence|checked/i);
    assert.match(v.lines[2].en, /not automatic source checks/i);
  }
  assert.match(aiAuditLab.view({ claimId: 'samanta', checkEpigraphy: true, checkMaterial: true }).lines[1].en, /eligibility was restricted/i);
  assert.match(THEME_NEP.T06.caseQ.passage.en, /eligibility was restricted/i);
  assert.match(THEME_NEP.T06.caseQ.explain.en, /not be equated with modern universal/i);
});
