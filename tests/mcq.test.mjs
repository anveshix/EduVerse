import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

test('exit feedback and the selected correct answer can be reviewed after reload', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost:4173/' });
  for (const key of ['window', 'document', 'localStorage', 'HTMLElement', 'SVGElement', 'Element', 'Node', 'Event']) {
    Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true, writable: true });
  }
  try {
    const [{ mcq }, store, i18n, { UI_CORE }] = await Promise.all([
      import('../src/components/widgets.js'), import('../src/core/store.js'), import('../src/core/i18n.js'), import('../src/i18n/core.js'),
    ]);
    i18n.register(UI_CORE);
    store.set({ lang: 'en', sound: false });
    const def = {
      id: 'map', stem: { en: 'Which plate?', hi: 'कौन-सी प्लेट?' }, correct: 'indian',
      options: [
        { id: 'pacific', en: 'Pacific', hi: 'प्रशांत', why: { en: 'Look near India.', hi: 'भारत के पास देखें।' } },
        { id: 'indian', en: 'Indian', hi: 'भारतीय' },
      ],
      explain: { en: 'India lies on the Indian Plate.', hi: 'भारत भारतीय प्लेट पर है।' },
      hint: { en: 'Find India.', hi: 'भारत खोजें।' },
    };
    const done = {}; let calls = 0;
    const first = mcq(def, { done, onDone: () => { calls++; } });
    const [wrong, right] = first.querySelectorAll('.opt');
    wrong.click();
    assert.equal(wrong.getAttribute('aria-checked'), 'true');
    assert.equal(right.disabled, false);
    assert.match(first.querySelector('.feedback').textContent, /Look near India/);
    right.click();
    assert.equal(right.getAttribute('aria-checked'), 'true');
    assert.equal(wrong.getAttribute('aria-checked'), 'false');
    assert.ok(right.classList.contains('right'));
    assert.ok([...first.querySelectorAll('.opt')].every((b) => b.disabled));
    assert.match(first.querySelector('.feedback').textContent, /India lies on the Indian Plate/);
    assert.deepEqual(done.map, { attempts: 2, ok: true });
    assert.equal(calls, 2);
    const stars = Object.keys(store.get().stars).length;

    // The existing {attempts, ok} format is enough; rendering does not award or save again.
    const restored = mcq(def, { done: { map: { attempts: 2, ok: true } }, onDone: () => { calls++; } });
    assert.equal(calls, 2);
    assert.equal(Object.keys(store.get().stars).length, stars);
    assert.equal(restored.querySelectorAll('.opt')[1].getAttribute('aria-checked'), 'true');
    assert.ok(restored.querySelectorAll('.opt')[1].classList.contains('right'));
    assert.ok([...restored.querySelectorAll('.opt')].every((b) => b.disabled));
    assert.match(restored.querySelector('.feedback').textContent, /India lies on the Indian Plate/);
    store.set({ lang: 'hi' });
    restored.relabel();
    assert.match(restored.querySelector('.feedback').textContent, /भारत भारतीय प्लेट पर है/);
  } finally {
    dom.window.close();
  }
});
