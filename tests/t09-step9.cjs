// T09 browser regression: historical evidence, model separation, accessibility and progress.
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
  fs.readFile(file, (err, data) => err ? res.writeHead(404).end() : res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' }).end(data));
});
const prefs = { lang: 'en', sound: false, lowGraphics: true, reducedMotion: true };
const setRange = (locator, value) => locator.evaluate((el, v) => { el.value = String(v); el.dispatchEvent(new Event('input', { bubbles: true })); }, value);
const track = (page, errors) => {
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
    await mobile.addInitScript(({ prefs }) => { if (!sessionStorage.getItem('init')) { sessionStorage.setItem('init', '1'); localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify(prefs)); } }, { prefs });
    const page = await mobile.newPage(), errors = [], writes = []; track(page, errors);
    page.on('request', (req) => { if (!['GET', 'HEAD'].includes(req.method())) writes.push(`${req.method()} ${req.url()}`); });
    await page.goto(`${base}?nowebgl=1#/theme/T09`); await page.waitForSelector('.mandi-inquiry', { timeout: 15000 });
    const card = page.locator('.mandi-inquiry'), evidence = card.locator('[data-t09-evidence]'), fb = card.locator('[data-t09-feedback]');
    assert.match(await evidence.innerText(), /₹60–70\/kg.*₹100\/kg.*not today/s);
    assert.equal(await card.locator('[data-t09-case=patna]').getAttribute('aria-pressed'), 'true');
    await card.locator('[data-t09-answer=profit]').focus(); await page.keyboard.press('Enter');
    assert.match(await fb.innerText(), /Not established.*do not reveal.*profit/s);
    assert.equal(await page.evaluate(() => document.activeElement.dataset.t09Answer), 'profit');
    await card.locator('[data-t09-answer=different]').click(); assert.match(await fb.innerText(), /Supported/);
    await card.locator('[data-t09-case=tomato]').click(); assert.match(await evidence.innerText(), /₹80\/kg.*concessional retail.*not a Patna mandi quote/s);
    await card.locator('[data-t09-answer=selected]').click();
    await card.locator('[data-t09-model]').click();
    assert.equal(await page.locator('#mk-ss').inputValue(), '-20'); assert.equal(await page.locator('#mk-price').inputValue(), '67');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'mk-ss');
    assert.match(await card.innerText(), /numbers are invented.*not a reconstruction/s);
    await card.locator('[data-t09-case=onion]').click(); assert.match(await evidence.innerText(), /₹25\/kg.*does not establish a Patna mandi price/s);
    await card.locator('[data-t09-case=msp]').click(); assert.match(await evidence.innerText(), /₹2,300 ÷ 100 = ₹23\/kg/);
    await card.locator('[data-t09-answer=guarantee]').click(); assert.match(await fb.innerText(), /Not established.*access.*not the current MSP/s);
    await page.click('#topbar [data-lang=hi]'); assert.match(await evidence.innerText(), /₹2,300.*₹23\/किग्रा/s);
    await page.click('#topbar [data-lang=both]'); assert.match(await evidence.innerText(), /per quintal.*क्विंटल/s);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2);
    for (const button of await card.locator('button:visible').all()) { const box = await button.boundingBox(); assert.ok(box && box.height >= 43.5 && box.width >= 43.5); }
    await page.click('#topbar [data-lang=en]'); await page.reload(); await page.waitForSelector('.mandi-inquiry');
    assert.equal(await card.locator('[data-t09-case=msp]').getAttribute('aria-pressed'), 'true'); assert.match(await fb.innerText(), /Not established/);
    await card.locator('[data-t09-reset]').click(); assert.match(await evidence.innerText(), /₹60–70\/kg/); assert.equal((await fb.innerText()).trim(), '');

    // A prediction describes its own experiment even after moving controls to extremes.
    const preds = page.locator('#panel-market .predict');
    await setRange(page.locator('#mk-sd'), 25); await setRange(page.locator('#mk-ss'), -25);
    await preds.nth(0).locator('.opt').filter({ hasText: 'A surplus' }).click(); assert.match(await preds.nth(0).locator('.feedback').innerText(), /₹75.*35 units.*85/s);
    await setRange(page.locator('#mk-sd'), 40); await preds.nth(1).locator('.opt').filter({ hasText: 'Price up, quantity up' }).click();
    assert.match(await preds.nth(1).locator('.feedback').innerText(), /₹60.*70 units/s);
    await setRange(page.locator('#mk-ss'), -40); await preds.nth(2).locator('.opt').filter({ hasText: 'Price up, quantity down' }).click();
    assert.match(await preds.nth(2).locator('.feedback').innerText(), /₹60.*50/s);
    const questions = page.locator('#module .exit-q');
    for (const [i, answer] of [[0, 'A surplus; the price tends to fall'], [2, 'Because non-payers cannot'], [3, 'A shortage, because'], [4, 'They can spoil'], [5, 'A negative externality'], [6, 'It can give buyers more information']]) {
      await questions.nth(i).locator('.opt').filter({ hasText: answer }).click();
      assert.equal(await questions.nth(i).locator('.feedback.ok').isVisible(), true);
    }
    assert.equal(await page.locator('.chapter-done').isVisible(), true);
    await page.goto(`${base}?nowebgl=1#/`); await page.waitForSelector('#main .card[data-theme=T09]');
    assert.match(await page.locator('#main .card[data-theme=T09] .card-progress-txt').innerText(), /6\/6 LOs/);
    assert.deepEqual(errors, []); assert.deepEqual(writes, []); await mobile.close();

    const legacy = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
    const old = { choice: 'surplus', actual: 'surplus', ok: true, explanation: { en: 'Earlier result', hi: 'पुराना परिणाम' } };
    const market = { scenario: 'base', price: 50, sD: 0, sS: 0, ceilingOn: false, ceiling: 35 };
    await legacy.addInitScript(({ prefs, old, market }) => { if (!sessionStorage.getItem('legacy')) { sessionStorage.setItem('legacy', '1'); localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ ...prefs, sim: { T09: { market, ext: { kind: 'negative', x: 18 }, pg: { k: 3, tax: false, items: {} }, info: { g: 0.6, inspect: false }, done: { p1: old } }, 'T09.mandiInquiry': { selected: 'bad', answers: { patna: 'invalid' } } }, progress: { T09: { visited: true, exit: { x1: { ok: true, attempts: 1 } }, reflection: 'Saved note' } }, stars: { old: true } })); } }, { prefs, old, market });
    const lp = await legacy.newPage(); await lp.goto(`${base}#/theme/T09`); await lp.waitForSelector('.mandi-inquiry');
    assert.equal(await lp.locator('[data-t09-case=patna]').getAttribute('aria-pressed'), 'true');
    const pred = lp.locator('#panel-market .predict').first(); assert.match(await pred.locator('.feedback').innerText(), /question has changed/i);
    await pred.locator('.opt').filter({ hasText: 'A surplus' }).click();
    const saved = await lp.evaluate(() => JSON.parse(localStorage.getItem('eduverse.ix.ss.v1')));
    assert.deepEqual(saved.sim.T09.done.p1.previous, old); assert.equal(saved.progress.T09.exit.x1.ok, true); assert.equal(saved.progress.T09.reflection, 'Saved note'); assert.equal(saved.stars.old, true);
    await legacy.close();

    const blocked = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
    await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', { configurable: true, value: { getItem: () => JSON.stringify({ lang: 'en', sound: false, lowGraphics: true }), setItem: () => { throw new DOMException('Blocked', 'SecurityError'); } } }));
    const bp = await blocked.newPage(); await bp.goto(`${base}#/theme/T09`); await bp.waitForSelector('.mandi-inquiry');
    await bp.locator('[data-t09-case=onion]').click(); assert.match(await bp.locator('[data-t09-storage]').innerText(), /blocked.*lost on reload/s); await blocked.close();

    const offline = await browser.newContext({ viewport: { width: 360, height: 900 }, reducedMotion: 'reduce' });
    await offline.addInitScript(({ prefs }) => { if (!sessionStorage.getItem('offline')) { sessionStorage.setItem('offline', '1'); localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ ...prefs, lang: 'hi' })); } }, { prefs });
    const op = await offline.newPage(), offlineErrors = []; op.on('pageerror', (err) => offlineErrors.push(err.message));
    await op.goto(base); await op.evaluate(() => navigator.serviceWorker.ready); await op.reload(); await offline.setOffline(true);
    await op.goto(`${base}#/theme/T09`); await op.reload(); await op.waitForSelector('.mandi-inquiry', { timeout: 15000 });
    await op.locator('[data-t09-case=msp]').click(); assert.match(await op.locator('[data-t09-evidence]').innerText(), /₹2,300.*₹23\/किग्रा/s);
    await op.locator('[data-t09-answer=access]').click(); await op.reload(); await op.waitForSelector('.mandi-inquiry');
    assert.match(await op.locator('[data-t09-feedback]').innerText(), /समर्थित/); assert.deepEqual(offlineErrors, []); await offline.close();
    console.log(JSON.stringify({ theme: 'T09', historicalCases: 4, sourceVsModel: true, mspConversion: true, deterministicPredictions: true, languages: ['en', 'hi', 'both'], keyboard: true, mobileWidth: 360, progress: '6/6', savedAndRepaired: true, deniedStorage: true, firstOpenOffline: true, networkWrites: 0, errors: [] }));
  } finally { await browser?.close(); server.close(); }
})().catch((err) => { console.error(err); process.exitCode = 1; });
