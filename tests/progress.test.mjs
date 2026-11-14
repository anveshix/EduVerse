import test from 'node:test';
import assert from 'node:assert/strict';
import { exitProgress } from '../src/core/progress.js';
import { EXIT as T02_EXIT } from '../src/modules/geography/content.js';

const theme = (id, n) => ({ id, learningObjects: Array.from({ length: n }, (_, i) => ({ id: `${id}.L${i + 1}` })) });
const ok = { ok: true }, wrong = { ok: false };

test('exit progress counts distinct learning objects, not correct questions', () => {
  const t = theme('T01', 3);
  assert.deepEqual(exitProgress(t), { k: 0, n: 3, done: false });
  assert.deepEqual(exitProgress(t, { exit: {
    'T01.L1.e1': ok, 'T01.L1.e2': ok, 'T01.L2.e1': wrong,
    'T01.L10.e1': ok, 'T02.L3.e1': ok, unknown: ok,
  } }), { k: 1, n: 3, done: false });
  assert.deepEqual(exitProgress(t, { exit: { 'T01.L1.e1': ok, 'T01.L2.e1': ok, 'T01.L3.e1': ok } }), { k: 3, n: 3, done: true });
  assert.equal(exitProgress(theme('T01', 0)).done, false);
});

test('T02 exit questions map to the learning objects they assess', () => {
  const t = theme('T02', 6);
  const associations = [
    ['e1', /boundary.*Himalayas/i, 'T02.L2'],
    ['e2', /layer.*liquid/i, 'T02.L3'],
    ['e3', /plate moves.*far/i, 'T02.L2'], // distance is the boundary experiment, not plate identification
    ['e4', /Northern Plains.*deposition/i, 'T02.L5'],
    ['e5', /plate map.*India/i, 'T02.L1'],
  ];
  for (const [id, content, lo] of associations) {
    assert.match(T02_EXIT.find((q) => q.id === id)?.stem.en || '', content);
    assert.equal(exitProgress(t, { exit: { [id]: ok, [`${lo}.e-test`]: ok } }).k, 1, `${id} must map to ${lo}`);
  }
  const exit = { e1: ok, e2: ok, e3: ok, e4: ok, 'T02.L5.e1': ok };
  assert.deepEqual(exitProgress(t, { exit }), { k: 3, n: 6, done: false });
  exit.e5 = ok;
  exit['T02.L4.e1'] = ok;
  exit['T02.L6.e1'] = wrong;
  assert.deepEqual(exitProgress(t, { exit }), { k: 5, n: 6, done: false });
  exit['T02.L6.e1'] = ok;
  assert.deepEqual(exitProgress(t, { exit }), { k: 6, n: 6, done: true });
});

test('other bespoke-module question IDs preserve their original LO associations', () => {
  assert.equal(exitProgress(theme('T04', 5), { exit: { h1: ok, h2: ok } }).k, 2);
  assert.equal(exitProgress(theme('T07', 4), { exit: { x1: ok, x2: ok } }).k, 1);
  assert.equal(exitProgress(theme('T09', 6), { exit: { x1: ok, x2: ok, x3: ok } }).k, 2);
});
