// T11 browser regression: Indian habitats, Bihar wetland, tourism and model boundaries.
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
const setRange = (loc, value) => loc.evaluate((el, v) => { el.value = String(v); el.dispatchEvent(new Event('input', { bubbles: true })); }, value);
(async () => {
  let browser;
  try {
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}/`;
    browser = await launchChromium({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const ctx = await browser.newContext({ viewport: { width: 360, height: 900 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await ctx.addInitScript(({ prefs }) => { if (!sessionStorage.getItem('init')) { sessionStorage.setItem('init', '1'); localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify(prefs)); } }, { prefs });
    const page = await ctx.newPage(), errors = [], writes = [];
    page.on('pageerror', (e) => errors.push(e.message)); page.on('console', (m) => { if (m.type() === 'error' || /too many active webgl contexts/i.test(m.text())) errors.push(m.text()); });
    page.on('request', (r) => { if (!['GET', 'HEAD'].includes(r.method())) writes.push(`${r.method()} ${r.url()}`); });
    await page.goto(`${base}?nowebgl=1#/theme/T11`); await page.waitForSelector('.habitat-inquiry', { timeout: 15000 });
    const habitats = page.locator('.habitat-inquiry'), detail = habitats.locator('[data-inquiry-evidence]'), feedback = habitats.locator('[data-inquiry-feedback]');
    assert.match(await detail.innerText(), /Thar is not empty/);
    await habitats.locator('[data-inquiry-answer=empty]').focus(); await page.keyboard.press('Enter'); assert.match(await feedback.innerText(), /Not the best choice/);
    assert.equal(await page.evaluate(() => document.activeElement.dataset.inquiryAnswer), 'empty');
    await habitats.locator('[data-inquiry-answer=grass]').click(); assert.match(await feedback.innerText(), /supported choice/i);
    await habitats.locator('[data-inquiry-case=sundarbans]').click(); assert.match(await detail.innerText(), /do not make storms harmless/);
    assert.equal(await habitats.locator('[data-habitat-marker=sundarbans]').getAttribute('data-habitat-selected'), 'true');
    await habitats.locator('[data-inquiry-case=ghats]').click(); assert.match(await detail.innerText(), /not every part/i);
    await habitats.locator('[data-inquiry-case=kabartal]').click(); assert.match(await detail.innerText(), /Begusarai.*2020.*migratory.*farmed/s);
    await habitats.locator('[data-inquiry-answer=balance]').click(); assert.match(await feedback.innerText(), /not the same as a biosphere reserve/);
    await habitats.locator('[data-inquiry-action=dry]').click(); assert.equal(await page.locator('#T11-L1-temp').inputValue(), '28'); assert.equal(await page.locator('#T11-L1-rain').inputValue(), '160');
    assert.match(await page.locator('#lab-T11-L1 .readout').innerText(), /Hot Desert/);
    await habitats.locator('[data-inquiry-action=wet]').click(); assert.equal(await page.locator('#T11-L1-rain').inputValue(), '2400');
    await page.click('#topbar [data-lang=hi]'); assert.match(await detail.innerText(), /बेगूसराय.*2020/s);
    await page.click('#topbar [data-lang=both]'); assert.match(await detail.innerText(), /Begusarai.*बेगूसराय/s);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2);
    for (const button of await habitats.locator('button:visible').all()) { const box = await button.boundingBox(); assert.ok(box && box.height >= 43.5 && box.width >= 43.5); }
    await page.click('#topbar [data-lang=en]'); await page.reload(); await page.waitForSelector('.habitat-inquiry');
    assert.equal(await habitats.locator('[data-inquiry-case=kabartal]').getAttribute('aria-pressed'), 'true'); assert.match(await feedback.innerText(), /supported choice/i);
    await habitats.locator('[data-inquiry-reset]').click(); assert.match(await detail.innerText(), /Thar is not empty/);
    await page.click('#tab-T11-L2'); assert.equal(await page.locator('#lab-T11-L2 .chip').filter({ hasText: 'Palamau' }).count(), 0);
    assert.equal(await page.locator('#lab-T11-L2 .chip').filter({ hasText: 'Achanakmar' }).count(), 1);
    await page.click('#tab-T11-L3'); const tourism = page.locator('.tourism-planner'), visit = tourism.locator('[data-tourism-visitors]'), visitResult = tourism.locator('[data-tourism-result]');
    assert.match(await visitResult.innerText(), /120 visits: 40 above.*not establish safety/s);
    await setRange(visit, 80); assert.match(await visitResult.innerText(), /exactly.*not establish safety/s);
    await setRange(visit, 0); assert.match(await visitResult.innerText(), /80 below/);
    await setRange(visit, 200); assert.match(await visitResult.innerText(), /120 above/);
    await tourism.locator('[data-tourism-reset]').click(); assert.equal(await visit.inputValue(), '120');
    const lab3 = page.locator('#lab-T11-L3'); await setRange(lab3.locator('#T11-L3-harvest'), 80); await setRange(lab3.locator('#T11-L3-stock0'), 100);
    assert.match(await lab3.locator('.readout').innerText(), /depleted in year 2/);
    await setRange(lab3.locator('#T11-L3-stock0'), 800); assert.match(await lab3.locator('.readout').innerText(), /does not guarantee.*sustainability/s);
    await page.click('#tab-T11-L3w'); assert.match(await page.locator('#lab-T11-L3w .readout').innerText(), /plants and food shortage are not represented/i);
    await page.click('#tab-T11-L4'); const fire = page.locator('#lab-T11-L4');
    assert.match(await fire.locator('.readout').innerText(), /not a fire-spread forecast.*stay away.*local forest or emergency/s);
    await fire.locator('#T11-L4-firebreak').check(); assert.match(await fire.locator('.readout').innerText(), /model assumes a reduction/);
    assert.doesNotMatch(await fire.locator('.readout').innerText(), /m\/min/);
    const fireInquiry = page.locator('.fire-inquiry');
    await fireInquiry.locator('[data-inquiry-answer=burn]').click(); assert.match(await fireInquiry.locator('[data-inquiry-feedback]').innerText(), /Never start a test fire/);
    await fireInquiry.locator('[data-inquiry-answer=ask]').click();
    await fireInquiry.locator('[data-inquiry-case=smoke]').click(); await fireInquiry.locator('[data-inquiry-answer=report]').click();
    assert.match(await fireInquiry.locator('[data-inquiry-feedback]').innerText(), /Do not approach or fight a fire.*local services/s);
    await page.reload(); await page.waitForSelector('.fire-inquiry');
    assert.equal(await fireInquiry.locator('[data-inquiry-case=smoke]').getAttribute('aria-pressed'), 'true');
    assert.match(await fireInquiry.locator('[data-inquiry-feedback]').innerText(), /Do not approach/);
    await page.click('#topbar [data-lang=hi]'); assert.match(await fireInquiry.locator('[data-inquiry-evidence]').innerText(), /धुआँ/);
    await page.click('#topbar [data-lang=en]');
    await page.click('#tab-T11-L5'); const knowledge = page.locator('.forest-knowledge');
    assert.match(await knowledge.locator('[data-inquiry-evidence]').innerText(), /eligible.*legal process/s);
    await knowledge.locator('[data-inquiry-answer=process]').click(); assert.match(await knowledge.locator('[data-inquiry-feedback]').innerText(), /not legal advice/);
    await knowledge.locator('[data-inquiry-case=apatani]').click(); assert.match(await knowledge.locator('[data-inquiry-evidence]').innerText(), /tentative-list.*not a World Heritage inscription/s);
    await knowledge.locator('[data-inquiry-answer=water]').click(); assert.match(await knowledge.locator('[data-inquiry-feedback]').innerText(), /Practices and conditions differ/);
    async function solve(id, answer) {
      await page.click(`#tab-T11-${id}`); const lab = page.locator(`#lab-T11-${id}`);
      await lab.locator('[role=tab]').filter({ hasText: 'Quick Quiz' }).click(); await lab.locator('.mcq .opt').filter({ hasText: answer }).click();
      assert.equal(await lab.locator('.mcq .feedback.ok').isVisible(), true);
    }
    for (const [id, answer] of [['L1', 'Temperature and precipitation'], ['L2', 'To support biodiversity protection'], ['L3', 'Use within regeneration'], ['L4', 'Resin-rich dry pine needles'], ['L5', 'By retaining runoff']]) await solve(id, answer);
    assert.equal(await page.locator('.chapter-done').isVisible(), true);
    await page.goto(`${base}?nowebgl=1#/`); await page.waitForSelector('#main .card[data-theme=T11]');
    assert.match(await page.locator('#main .card[data-theme=T11] .card-progress-txt').innerText(), /5\/5 LOs/);
    assert.deepEqual(errors, []); assert.deepEqual(writes, []); await ctx.close();

    const legacy = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
    const old = { choice: 'desert', actual: 'desert', ok: true, explanation: { en: 'Old result', hi: 'पुराना परिणाम' } };
    await legacy.addInitScript(({ prefs, old }) => { if (!sessionStorage.getItem('legacy')) { sessionStorage.setItem('legacy', '1'); localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ ...prefs, sim: { 'T11.ui': { tab: 'T11-L2' }, 'T11.L1': { temp: 26, rain: 160, done: { p1: old } }, 'T11.L2': { reserve: 'palamau', zone: 'buffer', done: {} }, 'T11.habitats': { selected: 'bad', answers: { thar: 'bad' } }, 'T11.tourism': { visitors: 999 } }, progress: { T11: { visited: true, exit: { 'T11.L1.e1': { ok: true, attempts: 1 } }, reflect: { 'T11.L1': 'Saved' } } }, stars: { old: true } })); } }, { prefs, old });
    const lp = await legacy.newPage(); await lp.goto(`${base}#/theme/T11`); await lp.waitForSelector('#lab-T11-L2');
    let saved = await lp.evaluate(() => JSON.parse(localStorage.getItem('eduverse.ix.ss.v1')));
    assert.equal(saved.sim['T11.L2'].reserve, 'nilgiri'); assert.equal(saved.sim['T11.L2'].previousReserve, 'palamau'); assert.equal(saved.sim['T11.L2'].zone, 'buffer');
    await lp.click('#tab-T11-L1'); assert.equal(await lp.locator('.habitat-inquiry [data-inquiry-case=thar]').getAttribute('aria-pressed'), 'true');
    const pred = lp.locator('#lab-T11-L1 .predict'); assert.match(await pred.locator('.feedback').innerText(), /question has changed/i);
    await pred.locator('.opt').filter({ hasText: 'Desert (like Thar)' }).click();
    await lp.click('#tab-T11-L3'); assert.equal(await lp.locator('[data-tourism-visitors]').inputValue(), '120');
    saved = await lp.evaluate(() => JSON.parse(localStorage.getItem('eduverse.ix.ss.v1')));
    assert.deepEqual(saved.sim['T11.L1'].done.p1.previous, old); assert.equal(saved.progress.T11.exit['T11.L1.e1'].ok, true); assert.equal(saved.progress.T11.reflect['T11.L1'], 'Saved'); assert.equal(saved.stars.old, true); await legacy.close();

    const blocked = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
    await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', { configurable: true, value: { getItem: () => JSON.stringify({ lang: 'en', sound: false, lowGraphics: true }), setItem: () => { throw new DOMException('Blocked', 'SecurityError'); } } }));
    const bp = await blocked.newPage(); await bp.goto(`${base}#/theme/T11`); await bp.waitForSelector('.habitat-inquiry');
    await bp.locator('.habitat-inquiry [data-inquiry-case=kabartal]').click(); assert.match(await bp.locator('[data-inquiry-storage]').first().innerText(), /blocked.*lost on reload/s);
    await bp.click('#tab-T11-L3'); await setRange(bp.locator('[data-tourism-visitors]'), 80); assert.match(await bp.locator('[data-tourism-storage]').innerText(), /blocked.*lost on reload/s); await blocked.close();

    const offline = await browser.newContext({ viewport: { width: 360, height: 900 }, reducedMotion: 'reduce' });
    await offline.addInitScript(({ prefs }) => { if (!sessionStorage.getItem('offline')) { sessionStorage.setItem('offline', '1'); localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ ...prefs, lang: 'hi' })); } }, { prefs });
    const op = await offline.newPage(), offlineErrors = []; op.on('pageerror', (e) => offlineErrors.push(e.message));
    await op.goto(base); await op.evaluate(() => navigator.serviceWorker.ready); await op.reload(); await offline.setOffline(true);
    await op.goto(`${base}#/theme/T11`); await op.reload(); await op.waitForSelector('.habitat-inquiry', { timeout: 15000 });
    await op.locator('.habitat-inquiry [data-inquiry-case=kabartal]').click(); await op.locator('.habitat-inquiry [data-inquiry-answer=balance]').click();
    assert.match(await op.locator('.habitat-inquiry [data-inquiry-evidence]').innerText(), /बेगूसराय/);
    await op.click('#tab-T11-L3'); await setRange(op.locator('[data-tourism-visitors]'), 80); await op.reload(); await op.waitForSelector('.tourism-planner');
    assert.equal(await op.locator('[data-tourism-visitors]').inputValue(), '80'); assert.match(await op.locator('[data-tourism-result]').innerText(), /बराबर/);
    assert.deepEqual(offlineErrors, []); await offline.close();
    console.log(JSON.stringify({ theme: 'T11', habitats: 4, biharWetland: true, mappedReserveRepair: true, tourismArithmetic: true, fireInquiry: true, modelLimits: true, languages: ['en', 'hi', 'both'], keyboard: true, mobileWidth: 360, progress: '5/5', legacyRetained: true, deniedStorage: true, firstOpenOffline: true, networkWrites: 0, errors: [] }));
  } finally { await browser?.close(); server.close(); }
})().catch((err) => { console.error(err); process.exitCode = 1; });
