// T08 browser regression: fictional household budget, two-hour frontier and model limits.
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
const track = (page, errors) => {
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => { if (msg.type() === 'error' || /too many active webgl contexts/i.test(msg.text())) errors.push(msg.text()); });
};
const setRange = (locator, value) => locator.evaluate((el, v) => { el.value = String(v); el.dispatchEvent(new Event('input', { bubbles: true })); }, value);
(async () => {
  let browser;
  try {
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}/`;
    browser = await launchChromium({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const mobile = await browser.newContext({ viewport: { width: 360, height: 900 }, hasTouch: true, isMobile: true, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await mobile.addInitScript(({ prefs }) => { if (!sessionStorage.getItem('t08-init')) { sessionStorage.setItem('t08-init', '1'); localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify(prefs)); } }, { prefs });
    const page = await mobile.newPage(), errors = [], writes = []; track(page, errors);
    page.on('request', (req) => { if (!['GET', 'HEAD'].includes(req.method())) writes.push(`${req.method()} ${req.url()}`); });
    await page.goto(`${base}?nowebgl=1#/theme/T08`); await page.waitForSelector('.household-budget', { timeout: 15000 });
    const budget = page.locator('.household-budget'), result = budget.locator('[data-t08-budget-result]');
    assert.match(await result.innerText(), /₹900 allocated \+ ₹0 unexpected = ₹900 planned.*₹100 remains unallocated/s);
    assert.match(await budget.innerText(), /not actual prices.*financial advice.*Do not enter your own family/s);
    const food = budget.locator('[data-t08-budget=food]');
    await food.focus(); await page.keyboard.press('ArrowRight'); assert.equal(await food.inputValue(), '400');
    assert.match(await result.innerText(), /₹950 allocated.*₹50 remains unallocated/s);
    await budget.locator('[data-t08-budget-surprise]').check();
    assert.match(await result.innerText(), /₹950 allocated \+ ₹100 unexpected = ₹1,050 planned.*₹50 over.*not automatically a loan/s);
    await setRange(food, 350); assert.match(await result.innerText(), /₹1,000 planned.*₹0 remains unallocated/s);
    await page.click('#topbar [data-lang=hi]'); assert.match(await result.innerText(), /अचानक.*₹1,000.*नहीं बाँटे/s);
    await page.click('#topbar [data-lang=both]'); assert.match(await result.innerText(), /unexpected.*अचानक/s);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2);
    await page.click('#topbar [data-lang=en]'); await page.reload(); await page.waitForSelector('.household-budget');
    assert.equal(await food.inputValue(), '350'); assert.equal(await budget.locator('[data-t08-budget-surprise]').isChecked(), true);
    await budget.locator('[data-t08-budget-reset]').click();
    assert.equal(await budget.locator('[data-t08-budget-surprise]').isChecked(), false);
    assert.match(await result.innerText(), /₹100 remains unallocated/);
    for (const button of await budget.locator('button:visible').all()) { const box = await button.boundingBox(); assert.ok(box && box.height >= 43.5 && box.width >= 43.5); }

    await page.click('#tab-T08-L2'); const time = page.locator('.time-frontier'), timeResult = time.locator('[data-t08-time-result]');
    assert.match(await timeResult.innerText(), /Project: 60 minutes.*rest: 60 minutes.*Total: 120/s);
    await time.locator('[data-t08-time-more]').focus(); await page.keyboard.press('Enter');
    assert.match(await timeResult.innerText(), /Project: 90 minutes.*rest: 30 minutes/s);
    await time.locator('[data-t08-time-more]').click(); assert.equal(await time.locator('[data-t08-time-more]').isDisabled(), true);
    assert.match(await timeResult.innerText(), /Project: 120 minutes.*rest: 0 minutes/s);
    await page.reload(); await page.waitForSelector('.time-frontier'); assert.equal(await time.locator('[data-t08-time-more]').isDisabled(), true);
    await time.locator('[data-t08-time-reset]').click(); assert.match(await timeResult.innerText(), /Project: 60 minutes/);
    await page.click('#topbar [data-lang=hi]'); assert.match(await timeResult.innerText(), /परियोजना: 60 मिनट.*कुल: 120 मिनट/s);
    await page.click('#topbar [data-lang=both]'); assert.match(await timeResult.innerText(), /Project: 60 minutes.*परियोजना: 60 मिनट/s);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2);
    await page.click('#topbar [data-lang=en]');
    const l2 = page.locator('#lab-T08-L2');
    await setRange(l2.locator('#T08-L2-a'), 3); await setRange(l2.locator('#T08-L2-b'), 4);
    assert.match(await l2.locator('.readout').innerText(), /INSIDE.*Frontier reference \(not necessarily the selected point\)/s);
    await setRange(l2.locator('#T08-L2-a'), 10); await setRange(l2.locator('#T08-L2-b'), 0);
    assert.match(await l2.locator('.readout').innerText(), /ON the model frontier.*no next 0.5 t move/s);
    await setRange(l2.locator('#T08-L2-a'), 13); assert.match(await l2.locator('.readout').innerText(), /exceeds the model maximum/);
    await page.click('#tab-T08-L4'); assert.match(await page.locator('#lab-T08-L4 .readout').innerText(), /Possible strength.*Possible risk.*not guaranteed outcomes or scores/s);
    await page.click('#tab-T08-L5'); const l5 = page.locator('#lab-T08-L5');
    await setRange(l5.locator('#T08-L5-shockCost'), 15000); await setRange(l5.locator('#T08-L5-safetyNetCoverPct'), 0);
    assert.match(await l5.locator('.readout').innerText(), /₹15,000.*gap is not automatically a loan.*cannot predict poverty/s);
    assert.match(await l5.locator('.chart[role=img]').getAttribute('aria-label'), /gap after savings ₹9,000.*not a loan prediction/i);
    async function solve(id, answer) {
      await page.click(`#tab-T08-L${id}`);
      const lab = page.locator(`#lab-T08-L${id}`);
      await lab.locator('[role=tab]').filter({ hasText: 'Quick Quiz' }).click();
      await lab.locator('.mcq .opt').filter({ hasText: answer }).click();
      assert.ok(await lab.locator('.mcq .feedback.ok').isVisible());
    }
    for (const [id, answer] of [[1, 'value of the next-best'], [2, 'Resources are unemployed'], [3, 'How goods and incomes'], [4, 'Central planners may struggle'], [5, 'Protect households']]) await solve(id, answer);
    assert.equal(await page.locator('.chapter-done').isVisible(), true);
    await page.goto(`${base}?nowebgl=1#/`); await page.waitForSelector('#main .card[data-theme=T08]');
    assert.match(await page.locator('#main .card[data-theme=T08] .card-progress-txt').innerText(), /5\/5 LOs/);
    assert.deepEqual(errors, []); assert.deepEqual(writes, []); await mobile.close();

    // Malformed companion state is repaired and older prediction history is preserved.
    const legacy = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
    const old = { choice: 'all', actual: 'unemp', ok: false, explanation: { en: 'Old claim', hi: 'पुराना कथन' } };
    await legacy.addInitScript(({ prefs, old }) => { if (!sessionStorage.getItem('legacy')) { sessionStorage.setItem('legacy', '1'); localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ ...prefs, sim: { 'T08.ui': { tab: 'T08-L3' }, 'T08.L3': { consumerShare: 65, labourShare: 60, equityTransfer: 30, done: { p1: old } }, 'T08.householdBudget': { allocations: { food: -5, travel: 155, learning: 200, care: null, reserve: 150 }, surprise: 'yes' }, 'T08.timeFrontier': { slots: 15 } }, progress: { T08: { visited: true, exit: { 'T08.L3.e1': { ok: true, attempts: 1 } }, reflection: 'Saved note' } }, stars: { old: true } })); } }, { prefs, old });
    const lp = await legacy.newPage(); await lp.goto(`${base}#/theme/T08`); await lp.waitForSelector('#lab-T08-L3');
    const pred = lp.locator('#lab-T08-L3 .predict'); assert.match(await pred.locator('.feedback').innerText(), /question has changed/i);
    await pred.locator('.opt').filter({ hasText: 'Short-term worker' }).click();
    const saved = await lp.evaluate(() => JSON.parse(localStorage.getItem('eduverse.ix.ss.v1')));
    assert.deepEqual(saved.sim['T08.L3'].done.p1.previous, old); assert.equal(saved.progress.T08.exit['T08.L3.e1'].ok, true); assert.equal(saved.stars.old, true);
    await lp.click('#tab-T08-L1'); assert.equal(await lp.locator('[data-t08-budget=food]').inputValue(), '350'); assert.equal(await lp.locator('[data-t08-budget=travel]').inputValue(), '150');
    assert.equal(await lp.locator('[data-t08-budget=reserve]').inputValue(), '150'); assert.equal(await lp.locator('[data-t08-budget-surprise]').isChecked(), false);
    await lp.click('#tab-T08-L2'); assert.match(await lp.locator('[data-t08-time-result]').innerText(), /Project: 60 minutes/); await legacy.close();

    const blocked = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
    await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', { configurable: true, value: { getItem: () => JSON.stringify({ lang: 'en', sound: false, lowGraphics: true }), setItem: () => { throw new DOMException('Blocked', 'SecurityError'); } } }));
    const bp = await blocked.newPage(); await bp.goto(`${base}#/theme/T08`); await bp.waitForSelector('.household-budget');
    await setRange(bp.locator('[data-t08-budget=food]'), 400); assert.match(await bp.locator('[data-t08-budget-storage]').innerText(), /blocked.*lost on reload/s);
    await bp.click('#tab-T08-L2'); await bp.locator('[data-t08-time-more]').click(); assert.match(await bp.locator('[data-t08-time-storage]').innerText(), /blocked.*lost on reload/s); await blocked.close();

    const offline = await browser.newContext({ viewport: { width: 360, height: 900 }, reducedMotion: 'reduce' });
    await offline.addInitScript(({ prefs }) => { if (!sessionStorage.getItem('offline')) { sessionStorage.setItem('offline', '1'); localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ ...prefs, lang: 'hi' })); } }, { prefs });
    const op = await offline.newPage(), offlineErrors = []; op.on('pageerror', (err) => offlineErrors.push(err.message));
    await op.goto(base); await op.evaluate(() => navigator.serviceWorker.ready); await op.reload(); await offline.setOffline(true);
    await op.goto(`${base}#/theme/T08`); await op.reload(); await op.waitForSelector('.household-budget', { timeout: 15000 });
    await op.locator('[data-t08-budget-surprise]').check(); assert.match(await op.locator('[data-t08-budget-result]').innerText(), /₹1,000.*नहीं बाँटे/s);
    await op.click('#tab-T08-L2'); await op.locator('[data-t08-time-more]').click(); assert.match(await op.locator('[data-t08-time-result]').innerText(), /परियोजना: 90 मिनट/);
    await op.reload(); await op.waitForSelector('.time-frontier'); assert.match(await op.locator('[data-t08-time-result]').innerText(), /परियोजना: 90 मिनट/);
    assert.deepEqual(offlineErrors, []); await offline.close();
    console.log(JSON.stringify({ theme: 'T08', budgetCategories: 5, underExactOver: true, unexpectedCost: true, timeSlots: 4, ppfInteriorAndEndpoint: true, languages: ['en', 'hi', 'both'], keyboard: true, mobileWidth: 360, savedAndRepaired: true, deniedStorage: true, firstOpenOffline: true, progress: '5/5', networkWrites: 0, errors: [] }));
  } finally { await browser?.close(); server.close(); }
})().catch((err) => { console.error(err); process.exitCode = 1; });
