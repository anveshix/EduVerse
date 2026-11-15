// Real-browser T05 regression: linked chronology, seven-part builder, saved work, 2D/3D and first-open offline.
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { launchChromium } = require('./launch-browser.cjs');

const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  const file = path.resolve(root, url === '/' ? 'index.html' : url.replace(/^\/+/, ''));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) res.writeHead(404).end();
    else res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' }).end(data);
  });
});
const prefs = { lang: 'en', sound: false, lowGraphics: true, reducedMotion: true };
const keys = ['svamin', 'amatya', 'janapada', 'durga', 'kosha', 'danda', 'mitra'];
const recordErrors = (page, errors) => {
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => { if (msg.type() === 'error' || /too many active webgl contexts/i.test(msg.text())) errors.push(msg.text()); });
};
(async () => {
  let browser;
  try {
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}/`;
    browser = await launchChromium({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

    const mobile = await browser.newContext({ viewport: { width: 360, height: 900 }, hasTouch: true, isMobile: true, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await mobile.addInitScript(({ prefs }) => {
      if (!sessionStorage.getItem('t05-mobile-init')) {
        sessionStorage.setItem('t05-mobile-init', '1');
        localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify(prefs));
      }
    }, { prefs });
    const page = await mobile.newPage(), errors = [], writes = [];
    recordErrors(page, errors);
    page.on('request', (req) => { if (!['GET', 'HEAD'].includes(req.method())) writes.push(`${req.method()} ${req.url()}`); });
    await page.goto(`${base}?nowebgl=1#/theme/T05`);
    await page.waitForSelector('.history-timeline', { timeout: 15000 });
    const map = page.locator('#lab-T05-L1'), timeline = map.locator('.history-timeline');
    assert.equal(await page.locator('#module > .tabs > .tabbar > [role=tab]').count(), 6, 'all six existing tabs remain');
    assert.equal(await timeline.locator('[data-t05-era]').count(), 3);
    assert.match(await timeline.locator('[data-t05-timeline-detail]').innerText(), /earlier period/i);
    for (const id of ['maurya', 'gupta', 'chola1000']) {
      await timeline.locator(`[data-t05-era=${id}]`).focus(); await page.keyboard.press('Enter');
      assert.equal(await timeline.locator(`[data-t05-era=${id}]`).getAttribute('aria-pressed'), 'true');
      assert.equal(await map.locator(`.chips [data-id=${id}]`).getAttribute('aria-checked'), 'true');
      assert.equal(await timeline.locator('[data-t05-field]').count(), 3);
    }
    assert.match(await timeline.locator('[data-t05-field=limit]').innerText(), /not universal adult suffrage/i);
    await map.locator('.chips [data-id=janapada]').click();
    assert.equal(await timeline.locator('[aria-pressed=true]').count(), 0);
    assert.match(await timeline.locator('[data-t05-timeline-detail]').innerText(), /earlier period/i);
    await map.locator('.chips [data-id=gupta]').click();
    assert.equal(await timeline.locator('[data-t05-era=gupta]').getAttribute('aria-pressed'), 'true');
    assert.match(await map.locator('.readout').innerText(), /not historical boundaries/i);
    await map.locator('.predict .opt').filter({ hasText: 'eligible village committee members' }).click();
    assert.equal(await timeline.locator('[data-t05-era=chola1000]').getAttribute('aria-pressed'), 'true');
    await map.locator('[data-k="btn.reset"]').click();
    assert.equal(await timeline.locator('[aria-pressed=true]').count(), 0);

    await page.click('#tab-T05-L3');
    const admin = page.locator('#lab-T05-L3'), builder = admin.locator('.saptanga-builder');
    assert.equal(await builder.locator('select').count(), 7);
    assert.equal(await builder.locator('select').evaluateAll((items) => items.filter((el) => el.labels.length !== 1 || !document.getElementById(el.getAttribute('aria-describedby'))).length), 0);
    assert.match(await builder.locator('.history-limit').innerText(), /not a revolt score/i);
    await builder.locator('[data-t05-part=svamin]').selectOption('mitra');
    await builder.locator('[data-t05-builder-check]').click();
    assert.match(await builder.locator('[data-t05-part-feedback=svamin]').innerText(), /try another/i);
    for (const id of keys) await builder.locator(`[data-t05-part=${id}]`).selectOption(id);
    assert.match(await builder.locator('[data-t05-builder-result]').innerText(), /7 of 7 roles matched/i);
    assert.equal(await builder.locator('.saptanga-row-feedback.is-correct').count(), 7);
    assert.match(await admin.locator('.readout').innerText(), /not probabilities, historical measurements or the seven Saptanga/i);
    await page.click('#topbar [data-lang=hi]');
    assert.match(await builder.locator('.saptanga-title').innerText(), /सात अंगों/);
    assert.equal(await builder.locator('[data-t05-part=danda]').inputValue(), 'danda');
    await page.click('#topbar [data-lang=both]');
    assert.match(await builder.locator('[data-t05-builder-result]').innerText(), /7 of 7[\s\S]*7 में से 7/);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2, 'mobile page must not overflow');
    for (const control of await builder.locator('button, select').all()) {
      const box = await control.boundingBox();
      assert.ok(box && box.height >= 43.5, 'builder controls must be touch-sized');
    }
    await page.click('#topbar [data-lang=en]');
    await page.reload(); await page.waitForSelector('.saptanga-builder');
    assert.equal(await page.locator('#tab-T05-L3').getAttribute('aria-selected'), 'true');
    assert.equal(await builder.locator('[data-t05-part=mitra]').inputValue(), 'mitra');
    assert.match(await builder.locator('[data-t05-builder-result]').innerText(), /7 of 7/i);
    await admin.locator('#T05-L3-taxRate').evaluate((el) => { el.value = '25'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await builder.locator('[data-t05-builder-reset]').click();
    assert.equal(await builder.locator('[data-t05-part=svamin]').inputValue(), '');
    assert.equal(await admin.locator('#T05-L3-taxRate').inputValue(), '25', 'builder reset does not reset the existing sandbox');
    await page.click('#tab-T05-L2');
    const source = page.locator('#lab-T05-L2');
    assert.match(await source.locator('.readout').innerText(), /does not check them for you/i);
    assert.doesNotMatch(await source.innerText(), /historical confidence|86–95%|35%/i);

    // The extra AI-audit lab must not count as one of the five curriculum LOs.
    async function solve(id, answer) {
      await page.click(`#tab-T05-L${id}`);
      const lab = page.locator(`#lab-T05-L${id}`);
      await lab.locator('[role=tab]').filter({ hasText: 'Quick Quiz' }).click();
      await lab.locator('.mcq .opt').filter({ hasText: answer }).click();
      assert.ok(await lab.locator('.mcq .feedback.ok').isVisible());
    }
    await solve(6, 'Because AI generates fast summaries');
    assert.equal(await page.locator('.chapter-done').isVisible(), false);
    assert.match(await page.locator('#lab-T05-L6 .readout').innerText(), /scripted practice clues/i);
    for (const [id, answer] of [[1, 'It was a gana-sangha'], [2, 'Material and literary evidence'], [3, 'Rules existed for selecting eligible'], [4, 'Its systematic Sanskrit rules'], [5, 'Ujjayini (Ujjain)']]) await solve(id, answer);
    assert.equal(await page.locator('.chapter-done').isVisible(), true);
    await page.reload(); await page.waitForSelector('#lab-T05-L5');
    assert.equal(await page.locator('.chapter-done').isVisible(), true);
    await page.goto(`${base}?nowebgl=1#/`); await page.waitForSelector('#main .card[data-theme=T05]');
    assert.match(await page.locator('#main .card[data-theme=T05] .card-progress-txt').innerText(), /5\/5 LOs with a correct exit answer/);
    assert.deepEqual(errors, []);
    assert.deepEqual(writes, []);
    await mobile.close();

    // Legacy revised prediction is not shown as a response to new wording, and old progress survives.
    const legacy = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
    const old = { choice: 'collapse', actual: 'collapse', ok: true, explanation: { en: 'Old claim', hi: 'पुराना दावा' } };
    await legacy.addInitScript(({ prefs, old }) => {
      if (!sessionStorage.getItem('t05-legacy-init')) {
        sessionStorage.setItem('t05-legacy-init', '1');
        localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ ...prefs,
          sim: { 'T05.ui': { tab: 'T05-L3' }, 'T05.L3': { govMode: 'maurya', taxRate: 20, roadsInvest: 50, irrigationInvest: 50, done: { p1: old } } },
          progress: { T05: { visited: true, predictions: {}, exit: { 'T05.L3.e1': { ok: true, attempts: 1 } }, cbq: {}, reflection: 'Earlier note' } },
          stars: { 'old-star': true },
        }));
      }
    }, { prefs, old });
    const lp = await legacy.newPage(); await lp.goto(`${base}#/theme/T05`); await lp.waitForSelector('.saptanga-builder');
    const prediction = lp.locator('#lab-T05-L3 .predict');
    assert.match(await prediction.locator('.feedback').innerText(), /question has changed/i);
    assert.equal(await lp.locator('#T05-L3-taxRate').inputValue(), '20', 'old prediction is not rerun');
    await prediction.locator('.opt').filter({ hasText: 'toy support index is lower' }).click();
    const saved = await lp.evaluate(() => JSON.parse(localStorage.getItem('eduverse.ix.ss.v1')));
    assert.deepEqual(saved.sim['T05.L3'].done.p1.previous, old);
    assert.equal(saved.sim['T05.L3'].done.p1.revision, 't05-step5');
    assert.equal(saved.progress.T05.exit['T05.L3.e1'].ok, true);
    assert.equal(saved.progress.T05.reflection, 'Earlier note');
    assert.deepEqual(saved.stars, { 'old-star': true }, 'a previously correct prediction does not grant a second star');
    await legacy.close();

    // The shell is warmed online, but the T05 chapter is opened for the first time offline.
    const offline = await browser.newContext({ viewport: { width: 360, height: 900 }, reducedMotion: 'reduce' });
    await offline.addInitScript(({ prefs }) => {
      if (!sessionStorage.getItem('t05-offline-init')) {
        sessionStorage.setItem('t05-offline-init', '1');
        localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ ...prefs, lang: 'hi' }));
      }
    }, { prefs });
    const op = await offline.newPage(), offlineErrors = [];
    op.on('pageerror', (err) => offlineErrors.push(err.message));
    await op.goto(base); await op.evaluate(() => navigator.serviceWorker.ready); await op.reload();
    await offline.setOffline(true);
    await op.goto(`${base}#/theme/T05`); await op.reload(); await op.waitForSelector('.history-timeline', { timeout: 15000 });
    await op.locator('[data-t05-era=maurya]').click();
    assert.match(await op.locator('[data-t05-field=evidence]').innerText(), /अशोक/);
    await op.click('#tab-T05-L3');
    await op.locator('[data-t05-part=danda]').selectOption('danda');
    await op.locator('[data-t05-builder-check]').click();
    assert.match(await op.locator('[data-t05-part-feedback=danda]').innerText(), /सही/);
    await op.reload(); await op.waitForSelector('.saptanga-builder');
    assert.equal(await op.locator('[data-t05-part=danda]').inputValue(), 'danda');
    assert.deepEqual(offlineErrors, []);
    await offline.close();

    const blocked = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
    await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', { configurable: true, value: {
      getItem: () => JSON.stringify({ lang: 'en', sound: false, lowGraphics: true }),
      setItem: () => { throw new DOMException('Blocked', 'SecurityError'); },
    } }));
    const bp = await blocked.newPage(); await bp.goto(`${base}#/theme/T05`); await bp.waitForSelector('#tab-T05-L3'); await bp.click('#tab-T05-L3');
    await bp.locator('[data-t05-part=mitra]').selectOption('mitra');
    assert.match(await bp.locator('[data-t05-builder-storage]').innerText(), /temporary[\s\S]*lost on reload/i);
    await blocked.close();

    // Selected bilingual labels remain readable against their selected background in dark mode.
    const dark = await browser.newContext({ colorScheme: 'dark', serviceWorkers: 'block', reducedMotion: 'reduce' });
    await dark.addInitScript(() => localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ lang: 'both', sound: false, lowGraphics: true })));
    const dp = await dark.newPage(); await dp.goto(`${base}#/theme/T05`); await dp.waitForSelector('.history-timeline');
    await dp.locator('[data-t05-era=maurya]').click();
    const colors = await dp.locator('[data-t05-era=maurya]').evaluate((el) => ({ bg: getComputedStyle(el).backgroundColor, en: getComputedStyle(el.querySelector('[lang=en]')).color, hi: getComputedStyle(el.querySelector('.hi-line')).color }));
    const lum = (rgb) => { const [r,g,b] = rgb.match(/\d+/g).slice(0, 3).map((x) => Number(x) / 255).map((x) => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4); return .2126*r + .7152*g + .0722*b; };
    assert.equal(colors.en, colors.hi);
    const [light, shade] = [lum(colors.bg), lum(colors.hi)].sort((a, b) => b - a);
    assert.ok((light + .05) / (shade + .05) >= 4.5);
    await dp.click('#tab-T05-L3');
    const actionColors = await dp.locator('[data-t05-builder-check]').evaluate((el) => ({ en: getComputedStyle(el.querySelector('[lang=en]')).color, hi: getComputedStyle(el.querySelector('.hi-line')).color }));
    assert.equal(actionColors.en, actionColors.hi);
    await dark.close();

    const graphics = await browser.newContext({ viewport: { width: 1100, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await graphics.addInitScript(() => localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ lang: 'en', sound: false, lowGraphics: false, reducedMotion: true })));
    const gp = await graphics.newPage(), glErrors = [];
    recordErrors(gp, glErrors);
    await gp.goto(`${base}#/theme/T05`); await gp.waitForSelector('#lab-T05-L1 .view3d canvas', { timeout: 20000 });
    await gp.locator('[data-t05-era=gupta]').click();
    assert.equal(await gp.locator('#lab-T05-L1 .chips [data-id=gupta]').getAttribute('aria-checked'), 'true');
    await gp.click('#tab-T05-L3'); await gp.waitForSelector('#lab-T05-L3 .view3d canvas', { timeout: 20000 });
    assert.equal(await gp.locator('#module .view3d canvas').count(), 1, 'only the visible 3D scene remains');
    assert.deepEqual(glErrors, []);
    await graphics.close();

    console.log(JSON.stringify({ theme: 'T05', timelineWindows: 3, saptangaParts: 7, languages: ['en', 'hi', 'both'], keyboard: true, mobileWidth: 360, persisted: true, legacyPrediction: true, deniedStorage: true, firstOpenOffline: true, webgl: true, networkWrites: 0, errors: [] }));
  } finally { await browser?.close(); server.close(); }
})().catch((err) => { console.error(err); process.exitCode = 1; });
