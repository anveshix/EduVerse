// T12 perspective inquiry: bilingual choices, storage, source limits and legacy progress.
const assert = require('node:assert/strict');
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const { launchChromium } = require('./launch-browser.cjs');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  const file = path.resolve(root, url === '/' ? 'index.html' : url.replace(/^\/+/, ''));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, data) => err ? res.writeHead(404).end() : res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' }).end(data));
});
const prefs = { lang: 'en', sound: false, lowGraphics: true, reducedMotion: true };
(async () => {
  let browser;
  try {
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}/`;
    browser = await launchChromium({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const ctx = await browser.newContext({ viewport: { width: 360, height: 900 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await ctx.addInitScript(({ prefs }) => { if (!sessionStorage.getItem('init')) { sessionStorage.setItem('init', '1'); localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify(prefs)); } }, { prefs });
    const page = await ctx.newPage(), errors = [], writes = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error' || /too many active webgl contexts/i.test(m.text())) errors.push(m.text()); });
    page.on('request', (r) => { if (!['GET', 'HEAD'].includes(r.method())) writes.push(`${r.method()} ${r.url()}`); });
    await page.goto(`${base}?nowebgl=1#/theme/T12`); await page.waitForSelector('.history-perspectives', { timeout: 15000 });
    const panel = page.locator('.history-perspectives'), evidence = panel.locator('[data-inquiry-evidence]'), feedback = panel.locator('[data-inquiry-feedback]');
    assert.match(await panel.innerText(), /people and event are fictional.*not quotations/s);
    await panel.locator('[data-inquiry-answer=complete]').focus(); await page.keyboard.press('Enter');
    assert.match(await feedback.innerText(), /Not the best choice.*not the whole story/s);
    assert.equal(await page.evaluate(() => document.activeElement.dataset.inquiryAnswer), 'complete');
    await panel.locator('[data-inquiry-answer=compare]').click();
    await panel.locator('[data-inquiry-case=farmer]').click(); await panel.locator('[data-inquiry-answer=records]').click();
    assert.match(await feedback.innerText(), /not a historical witness/);
    await panel.locator('[data-inquiry-case=trader]').click(); await panel.locator('[data-inquiry-answer=some]').click();
    assert.match(await evidence.innerText(), /trading centres/);
    await panel.locator('[data-inquiry-case=woman]').click(); await panel.locator('[data-inquiry-answer=limits]').click();
    assert.match(await evidence.innerText(), /farmers, traders or rulers/); assert.match(await feedback.innerText(), /not proof of absence/);
    await page.click('#topbar [data-lang=hi]'); assert.match(await evidence.innerText(), /महिला/);
    await page.click('#topbar [data-lang=both]'); assert.match(await evidence.innerText(), /woman.*महिला/is);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2);
    for (const button of await panel.locator('button:visible').all()) { const box = await button.boundingBox(); assert.ok(box && box.height >= 43.5 && box.width >= 43.5); }
    await page.click('#topbar [data-lang=en]'); await page.reload(); await page.waitForSelector('.history-perspectives');
    assert.equal(await panel.locator('[data-inquiry-case=woman]').getAttribute('aria-pressed'), 'true'); assert.match(await feedback.innerText(), /not proof of absence/);
    await panel.locator('[data-inquiry-reset]').click(); assert.equal(await panel.locator('[data-inquiry-case=ruler]').getAttribute('aria-pressed'), 'true');
    await page.locator('#lab-T12-L1 .chip').filter({ hasText: '1050' }).click();
    assert.match(await page.locator('#lab-T12-L1 .readout').innerText(), /Bhagalpur, Bihar.*not historical borders/s);
    await page.locator('#lab-T12-L1 .chip').filter({ hasText: '1680' }).click(); assert.match(await page.locator('#lab-T12-L1 .readout').innerText(), /1671 battle, not a 1680 event/);
    assert.deepEqual(errors, []); assert.deepEqual(writes, []); await ctx.close();

    const old = { choice: 'river', actual: 'river', ok: true, explanation: { en: 'Old result', hi: 'पुराना परिणाम' } };
    const legacy = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
    await legacy.addInitScript(({ prefs, old }) => { if (!sessionStorage.getItem('legacy')) { sessionStorage.setItem('legacy', '1'); localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ ...prefs, sim: { 'T12.ui': { tab: 'bad' }, 'T12.L1': { year: 'bad', alliance: true, done: { p1: old } }, 'T12.perspectives': { selected: 'bad', answers: { ruler: 'bad' } } }, progress: { T12: { visited: true, exit: { 'T12.L1.e1': { ok: true, attempts: 1 } }, reflect: { 'T12.L1': 'Saved' } } }, stars: { old: true } })); } }, { prefs, old });
    const lp = await legacy.newPage(); await lp.goto(`${base}#/theme/T12`); await lp.waitForSelector('.history-perspectives');
    assert.equal(await lp.locator('[data-inquiry-case=ruler]').getAttribute('aria-pressed'), 'true');
    const pred = lp.locator('#lab-T12-L1 .predict'); assert.match(await pred.locator('.feedback').innerText(), /question has changed/i);
    await pred.locator('.opt').filter({ hasText: 'River warfare' }).click();
    const saved = await lp.evaluate(() => JSON.parse(localStorage.getItem('eduverse.ix.ss.v1')));
    assert.deepEqual(saved.sim['T12.L1'].done.p1.previous, old); assert.equal(saved.progress.T12.exit['T12.L1.e1'].ok, true); assert.equal(saved.progress.T12.reflect['T12.L1'], 'Saved'); assert.equal(saved.stars.old, true); await legacy.close();

    const blocked = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
    await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', { configurable: true, value: { getItem: () => JSON.stringify({ lang: 'en', sound: false, lowGraphics: true }), setItem: () => { throw new DOMException('Blocked', 'SecurityError'); } } }));
    const bp = await blocked.newPage(); await bp.goto(`${base}#/theme/T12`); await bp.waitForSelector('.history-perspectives');
    await bp.locator('.history-perspectives [data-inquiry-case=trader]').click(); assert.match(await bp.locator('.history-perspectives [data-inquiry-storage]').innerText(), /blocked.*lost on reload/s); await blocked.close();

    const offline = await browser.newContext({ viewport: { width: 360, height: 900 }, reducedMotion: 'reduce' });
    await offline.addInitScript(({ prefs }) => { if (!sessionStorage.getItem('offline')) { sessionStorage.setItem('offline', '1'); localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ ...prefs, lang: 'hi' })); } }, { prefs });
    const op = await offline.newPage(), offlineErrors = []; op.on('pageerror', (e) => offlineErrors.push(e.message));
    await op.goto(base); await op.evaluate(() => navigator.serviceWorker.ready); await op.reload(); await offline.setOffline(true);
    await op.goto(`${base}#/theme/T12`); await op.reload(); await op.waitForSelector('.history-perspectives', { timeout: 15000 });
    await op.locator('.history-perspectives [data-inquiry-case=woman]').click(); await op.locator('.history-perspectives [data-inquiry-answer=limits]').click();
    assert.match(await op.locator('.history-perspectives [data-inquiry-evidence]').innerText(), /महिला/);
    await op.reload(); await op.waitForSelector('.history-perspectives'); assert.equal(await op.locator('[data-inquiry-case=woman]').getAttribute('aria-pressed'), 'true');
    assert.deepEqual(offlineErrors, []); await offline.close();
    console.log(JSON.stringify({ theme: 'T12', perspectives: 4, fictionalNotTestimony: true, biharMapRepair: true, languages: ['en', 'hi', 'both'], keyboard: true, mobileWidth: 360, legacyRetained: true, deniedStorage: true, firstOpenOffline: true, networkWrites: 0, errors: [] }));
  } finally { await browser?.close(); server.close(); }
})().catch((err) => { console.error(err); process.exitCode = 1; });
