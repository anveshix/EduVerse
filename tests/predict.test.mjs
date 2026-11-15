import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

test('prediction explanations survive reload without rerunning a model', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost:4173/' });
  for (const key of ['window', 'document', 'localStorage', 'HTMLElement', 'SVGElement', 'Element', 'Node', 'Event']) {
    Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true, writable: true });
  }
  try {
    const [{ predict }, store, i18n, { UI_CORE }] = await Promise.all([
      import('../src/components/widgets.js'), import('../src/core/store.js'), import('../src/core/i18n.js'), import('../src/i18n/core.js'),
    ]);
    i18n.register(UI_CORE);
    store.set({ lang: 'en', sound: false });
    let runs = 0, explanations = 0, value = 45;
    const def = {
      id: 'story', stem: { en: 'What happens?', hi: 'क्या होता है?' },
      options: [{ id: 'yes', en: 'Yes', hi: 'हाँ' }, { id: 'no', en: 'No', hi: 'नहीं' }],
      run: () => { runs++; return 'yes'; },
      explain: () => { explanations++; return { en: `Observed ${value}`, hi: `देखा ${value}` }; },
    };
    const done = {};
    const first = predict(def, { done });
    first.querySelectorAll('.opt')[1].click();
    assert.equal(runs, 1);
    assert.equal(explanations, 1);
    assert.equal(done.story.actual, 'yes');
    assert.equal(done.story.ok, false);
    assert.match(first.querySelector('.feedback').textContent, /Observed 45/);
    value = 21; // e.g. a learner adjusted the simulation after the prediction
    const restored = predict(def, { done });
    assert.equal(runs, 1, 'restoration must not run the experiment');
    assert.equal(explanations, 1, 'restoration uses the saved explanation');
    assert.match(restored.querySelector('.feedback').textContent, /Observed 45/);
    assert.ok(restored.querySelectorAll('.opt')[0].classList.contains('right'));
    assert.ok(restored.querySelectorAll('.opt')[1].classList.contains('wrong'));
    assert.ok([...restored.querySelectorAll('.opt')].every((button) => button.disabled));
    store.set({ lang: 'hi' });
    restored.relabel();
    assert.match(restored.querySelector('.feedback').textContent, /देखा 45/);

    // Legacy saved predictions have no snapshot: allow a safe retry rather than locking away feedback.
    const legacy = predict(def, { done: { story: { choice: 'yes', ok: true } } });
    assert.ok([...legacy.querySelectorAll('.opt')].every((button) => !button.disabled));
    assert.match(legacy.querySelector('.feedback').textContent, /पिछला अनुमान/);
    const stars = Object.keys(store.get().stars).length;
    legacy.querySelectorAll('.opt')[0].click();
    assert.equal(Object.keys(store.get().stars).length, stars, 'retrying an already-correct legacy prediction does not award a second star');

    // If the actual question changed, retain the old record without claiming it answered the new wording.
    store.set({ lang: 'en' });
    const prior = { choice: 'no', actual: 'yes', ok: false, explanation: { en: 'Old wording', hi: 'पुराना प्रश्न' } };
    const revisedDone = { story: prior };
    const revisedDef = { ...def, revision: 'v2' };
    const before = runs;
    const revised = predict(revisedDef, { done: revisedDone });
    assert.equal(runs, before, 'opening a revised question must not rerun a simulation');
    assert.ok([...revised.querySelectorAll('.opt')].every((button) => !button.disabled));
    assert.match(revised.querySelector('.feedback').textContent, /question has changed/i);
    assert.doesNotMatch(revised.querySelector('.feedback').textContent, /Old wording/);
    revised.querySelectorAll('.opt')[0].click();
    assert.equal(revisedDone.story.revision, 'v2');
    assert.deepEqual(revisedDone.story.previous, prior, 'the earlier answer is kept locally');
    const restoredRevision = predict(revisedDef, { done: revisedDone });
    assert.equal(runs, before + 1, 'a revised result restores without rerunning');
    assert.match(restoredRevision.querySelector('.feedback').textContent, /Observed 21/);
    assert.ok([...restoredRevision.querySelectorAll('.opt')].every((button) => button.disabled));
  } finally {
    dom.window.close();
  }
});
