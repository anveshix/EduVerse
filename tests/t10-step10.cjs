// T10 browser regression: source cases, fisheries, hazard safety and model limits.
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
    await page.goto(`${base}?nowebgl=1#/theme/T10`); await page.waitForSelector('#lab-T10-L1', { timeout: 15000 });
    await page.click('#tab-L3');
    const fish = page.locator('.ocean-fishery'), evidence = fish.locator('[data-inquiry-evidence]'), feedback = fish.locator('[data-inquiry-feedback]');
    await fish.locator('[data-inquiry-case=value]').click(); assert.match(await evidence.innerText(), /Women and men.*interrupt earnings/s);
    await fish.locator('[data-inquiry-answer=guarantee]').focus(); await page.keyboard.press('Enter');
    assert.match(await feedback.innerText(), /Not the best choice.*depend/s); assert.equal(await page.evaluate(() => document.activeElement.dataset.inquiryAnswer), 'guarantee');
    await fish.locator('[data-inquiry-answer=tradeoff]').click(); assert.match(await feedback.innerText(), /supported choice/i);
    await fish.locator('[data-inquiry-case=inland]').click(); assert.match(await evidence.innerText(), /Bihar is inland.*not be labelled marine/s);
    await fish.locator('[data-inquiry-answer=pond]').click();
    await fish.locator('[data-inquiry-action=zero]').click(); assert.equal(await page.locator('#T10-L3-closed').inputValue(), '0');
    const read0 = await page.locator('#lab-T10-L3 .readout').innerText();
    await fish.locator('[data-inquiry-action=two]').click(); assert.equal(await page.locator('#T10-L3-closed').inputValue(), '2');
    const read2 = await page.locator('#lab-T10-L3 .readout').innerText(); assert.notEqual(read0, read2);
    assert.match(read2, /Invented model.*not certify sustainability or predict fishers’ incomes/s);
    await page.click('#tab-L4'); const hazard = page.locator('.ocean-hazards'), detail = hazard.locator('[data-inquiry-evidence]'), response = hazard.locator('[data-inquiry-feedback]');
    assert.match(await detail.innerText(), /27 October 2025.*historical forecast.*not an alert today/s);
    await hazard.locator('[data-inquiry-case=bihar]').click(); assert.match(await detail.innerText(), /29–31 October.*not proof.*not coastal storm surge/s);
    await hazard.locator('[data-inquiry-answer=flood]').click(); assert.match(await response.innerText(), /supported choice.*Floodwater/s);
    await hazard.locator('[data-inquiry-case=tsunami]').click(); assert.match(await detail.innerText(), /not a cyclone.*Do not wait/s);
    await hazard.locator('[data-inquiry-answer=high]').click(); assert.match(await response.innerText(), /before an official warning.*all-clear/s);
    const lab4 = page.locator('#lab-T10-L4');
    await setRange(lab4.locator('#T10-L4-depth'), 6000); await setRange(lab4.locator('#T10-L4-dist'), 50); await setRange(lab4.locator('#T10-L4-siren'), 180);
    assert.match(await lab4.locator('.readout').innerText(), /Arithmetic only.*cannot tell anyone whether a route is safe.*Never wait.*all-clear/s);
    await page.click('#topbar [data-lang=hi]'); assert.match(await detail.innerText(), /चक्रवात नहीं.*प्रतीक्षा न करें/s);
    await page.click('#topbar [data-lang=both]'); assert.match(await detail.innerText(), /not a cyclone.*चक्रवात नहीं/s);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2);
    for (const button of await hazard.locator('button:visible').all()) { const box = await button.boundingBox(); assert.ok(box && box.height >= 43.5 && box.width >= 43.5); }
    await page.click('#topbar [data-lang=en]'); await page.reload(); await page.waitForSelector('.ocean-hazards');
    assert.equal(await hazard.locator('[data-inquiry-case=tsunami]').getAttribute('aria-pressed'), 'true'); assert.match(await response.innerText(), /supported choice/i);
    await hazard.locator('[data-inquiry-reset]').click(); assert.match(await detail.innerText(), /Cyclone Montha/); assert.equal((await response.innerText()).trim(), '');
    async function solve(id, answer) {
      await page.click(`#tab-L${id}`); const lab = page.locator(`#lab-T10-L${id}`);
      await lab.locator('[role=tab]').filter({ hasText: 'Quick Quiz' }).click(); await lab.locator('.mcq .opt').filter({ hasText: answer }).click();
      assert.equal(await lab.locator('.mcq .feedback.ok').isVisible(), true);
    }
    for (const [id, answer] of [[1, 'One tectonic plate bends'], [2, 'New moon or full moon'], [3, 'To help protect breeding fish'], [4, 'About 1½ hours'], [5, 'A tsunami can cross']]) await solve(id, answer);
    assert.equal(await page.locator('.chapter-done').isVisible(), true);
    await page.goto(`${base}?nowebgl=1#/`); await page.waitForSelector('#main .card[data-theme=T10]');
    assert.match(await page.locator('#main .card[data-theme=T10] .card-progress-txt').innerText(), /5\/5 LOs/);
    assert.deepEqual(errors, []); assert.deepEqual(writes, []); await mobile.close();

    const legacy = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
    const old = { choice: 'crash', actual: 'crash', ok: true, explanation: { en: 'Old result', hi: 'पुराना परिणाम' } };
    await legacy.addInitScript(({ prefs, old }) => { if (!sessionStorage.getItem('legacy')) { sessionStorage.setItem('legacy', '1'); localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ ...prefs, sim: { 'T10.ui': { tab: 'L3' }, 'T10.L3': { boats: 45, mesh: 45, closed: 2, mangrove: 60, done: { p1: old } }, 'T10.fisheryConnections': { selected: 'bad', answers: { marine: 'bad' } } }, progress: { T10: { visited: true, exit: { 'T10.L3.e1': { ok: true, attempts: 1 } }, reflect: { 'T10.L3': 'Saved' } } }, stars: { old: true } })); } }, { prefs, old });
    const lp = await legacy.newPage(); await lp.goto(`${base}#/theme/T10`); await lp.waitForSelector('.ocean-fishery');
    assert.equal(await lp.locator('.ocean-fishery [data-inquiry-case=marine]').getAttribute('aria-pressed'), 'true');
    const pred = lp.locator('#lab-T10-L3 .predict'); assert.match(await pred.locator('.feedback').innerText(), /question has changed/i);
    await pred.locator('.opt').filter({ hasText: 'Below the model threshold' }).click();
    const saved = await lp.evaluate(() => JSON.parse(localStorage.getItem('eduverse.ix.ss.v1')));
    assert.deepEqual(saved.sim['T10.L3'].done.p1.previous, old); assert.equal(saved.progress.T10.exit['T10.L3.e1'].ok, true); assert.equal(saved.progress.T10.reflect['T10.L3'], 'Saved'); assert.equal(saved.stars.old, true); await legacy.close();

    const blocked = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
    await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', { configurable: true, value: { getItem: () => JSON.stringify({ lang: 'en', sound: false, lowGraphics: true }), setItem: () => { throw new DOMException('Blocked', 'SecurityError'); } } }));
    const bp = await blocked.newPage(); await bp.goto(`${base}#/theme/T10`); await bp.waitForSelector('#tab-L4'); await bp.click('#tab-L4');
    await bp.locator('.ocean-hazards [data-inquiry-case=bihar]').click(); assert.match(await bp.locator('.ocean-hazards [data-inquiry-storage]').innerText(), /blocked.*lost on reload/s); await blocked.close();

    const offline = await browser.newContext({ viewport: { width: 360, height: 900 }, reducedMotion: 'reduce' });
    await offline.addInitScript(({ prefs }) => { if (!sessionStorage.getItem('offline')) { sessionStorage.setItem('offline', '1'); localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ ...prefs, lang: 'hi' })); } }, { prefs });
    const op = await offline.newPage(), offlineErrors = []; op.on('pageerror', (err) => offlineErrors.push(err.message));
    await op.goto(base); await op.evaluate(() => navigator.serviceWorker.ready); await op.reload(); await offline.setOffline(true);
    await op.goto(`${base}#/theme/T10`); await op.reload(); await op.waitForSelector('#tab-L4', { timeout: 15000 }); await op.click('#tab-L4');
    await op.locator('.ocean-hazards [data-inquiry-case=tsunami]').click(); await op.locator('.ocean-hazards [data-inquiry-answer=high]').click();
    await op.reload(); await op.waitForSelector('.ocean-hazards'); assert.match(await op.locator('.ocean-hazards [data-inquiry-feedback]').innerText(), /उचित विकल्प/);
    await op.click('#tab-L3'); await op.locator('[data-inquiry-action=zero]').click(); assert.equal(await op.locator('#T10-L3-closed').inputValue(), '0');
    assert.deepEqual(offlineErrors, []); await offline.close();
    console.log(JSON.stringify({ theme: 'T10', marineAndInland: true, cycloneAndTsunamiSafety: true, modelNotWarning: true, modelControlsLinked: true, languages: ['en', 'hi', 'both'], keyboard: true, mobileWidth: 360, progress: '5/5', savedAndRepaired: true, deniedStorage: true, firstOpenOffline: true, networkWrites: 0, errors: [] }));
  } finally { await browser?.close(); server.close(); }
})().catch((err) => { console.error(err); process.exitCode = 1; });
