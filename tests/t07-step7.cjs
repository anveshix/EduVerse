// T07 browser regression: voter journey, connected boundary examples, live coalition builder and lifecycle.
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
      if (!sessionStorage.getItem('t07-init')) { sessionStorage.setItem('t07-init', '1'); localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify(prefs)); }
    }, { prefs });
    const page = await mobile.newPage(), errors = [], writes = [];
    recordErrors(page, errors);
    page.on('request', (req) => { if (!['GET', 'HEAD'].includes(req.method())) writes.push(`${req.method()} ${req.url()}`); });
    await page.goto(`${base}?nowebgl=1#/theme/T07`); await page.waitForSelector('.election-journey', { timeout: 15000 });
    const journey = page.locator('.election-journey');
    assert.equal(await journey.locator('[data-t07-stage]').count(), 5);
    assert.match(await journey.locator('[data-t07-journey-detail]').innerText(), /does not automatically add a name/i);
    for (const id of ['compare', 'booth', 'mark']) { await journey.locator(`[data-t07-stage=${id}]`).focus(); await page.keyboard.press('Enter'); assert.equal(await journey.locator(`[data-t07-stage=${id}]`).getAttribute('aria-pressed'), 'true'); }
    assert.match(await journey.locator('[data-t07-journey-detail]').innerText(), /not an EVM or an actual ballot/i);
    await journey.locator('[data-t07-practice=blue]').focus(); await page.keyboard.press('Space');
    assert.equal(await journey.locator('[data-t07-practice=blue]').getAttribute('aria-pressed'), 'true');
    assert.match(await journey.locator('[data-t07-practice-result]').innerText(), /does not cast a real vote/i);
    assert.match(await journey.locator('[data-t07-journey-storage]').innerText(), /not secret or secure/i);
    await journey.locator('[data-t07-stage=count]').click();
    assert.match(await journey.locator('[data-t07-journey-detail]').innerText(), /sealed box[\s\S]*not into the voter’s hand/i);
    assert.match(await journey.locator('[data-t07-journey-detail]').innerText(), /8\/20[\s\S]*not a majority[\s\S]*does not change this count/i);
    await page.click('#topbar [data-lang=hi]'); assert.match(await journey.locator('[data-t07-journey-detail]').innerText(), /बहुमत नहीं/);
    await page.click('#topbar [data-lang=both]'); assert.match(await journey.locator('[data-t07-journey-detail]').innerText(), /not a majority[\s\S]*बहुमत नहीं/);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2);
    for (const button of await journey.locator('button:visible').all()) { const box = await button.boundingBox(); assert.ok(box && box.height >= 43.5 && box.width >= 43.5); }
    await page.click('#topbar [data-lang=en]');
    await page.reload(); await page.waitForSelector('.election-journey');
    assert.equal(await journey.locator('[data-t07-stage=count]').getAttribute('aria-pressed'), 'true');
    await journey.locator('[data-t07-stage=mark]').click();
    assert.equal(await journey.locator('[data-t07-practice=blue]').getAttribute('aria-pressed'), 'true');
    await journey.locator('[data-t07-journey-reset]').click();
    assert.equal(await journey.locator('[data-t07-stage=roll]').getAttribute('aria-pressed'), 'true');

    // Equal votes and equal seats must display ties, not a single invented leader.
    await page.click('#tab-L2');
    const l2 = page.locator('#panel-L2');
    await l2.locator('#el-swing').evaluate((el) => { el.value = '6.5'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    assert.match(await l2.locator('.readout').innerText(), /Most votes \(tie\): Red party, Blue party/i);
    await l2.locator('.chips [data-id=pr]').click();
    await l2.locator('#el-swing').evaluate((el) => { el.value = '2'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    assert.match(await l2.locator('.readout').innerText(), /Most seats \(tie\): Red party, Blue party/i);
    assert.match(await l2.locator('[data-k="el.fictional"]').innerText(), /Lok Sabha[\s\S]*not their actual rules/i);

    await page.click('#tab-L3');
    const l3 = page.locator('#lab-T07-L3');
    await l3.locator('.chips [data-id=packedA]').click();
    assert.match(await l3.locator('.readout').innerText(), /Party A \(51.1% votes\) wins 1 seat[\s\S]*Party B \(48.9%\) wins 2 seats[\s\S]*gap across constituencies: 0/i);
    const map = l3.locator('.t07-boundary-scroll');
    assert.equal(await map.getAttribute('tabindex'), '0');
    assert.ok(await map.evaluate((el) => el.scrollWidth > el.clientWidth), 'the mobile map scrolls inside its own region');
    await map.focus(); await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => document.querySelector('.t07-boundary-scroll').scrollLeft > 0, null, { timeout: 3000 });
    assert.match(await l3.locator('.readout').innerText(), /D1: A 205, B 95[\s\S]*D2: A 145, B 155[\s\S]*D3: A 110, B 190/i);
    assert.match(await l3.locator('.readout').innerText(), /does not by itself prevent partisan/i);
    await l3.locator('#T07-L3-voterAge').evaluate((el) => { el.value = '17'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    assert.match(await l3.locator('.readout').innerText(), /does not pass these checks/i);
    await l3.locator('.chips [data-id=unequal]').click(); assert.match(await l3.locator('.readout').innerText(), /gap across constituencies: 300/i);

    await page.click('#tab-L4');
    const l4 = page.locator('#lab-T07-L4'), builder = l4.locator('.election-coalition'), status = builder.locator('[data-t07-coalition-result]');
    assert.match(await status.innerText(), /0 of 10 seats[\s\S]*6 needed/i);
    await builder.locator('[data-t07-party=B]').focus(); await page.keyboard.press('Enter');
    assert.match(await status.innerText(), /5 of 10 seats[\s\S]*1 more/i);
    await builder.locator('[data-t07-party=G]').click(); assert.match(await status.innerText(), /6 of 10 seats: a minimal winning set/i);
    await builder.locator('[data-t07-party=R]').click(); assert.match(await status.innerText(), /9 of 10 seats: a majority[\s\S]*not minimal/i);
    await l4.locator('.chips [data-id=fptp]').click();
    assert.equal(await builder.locator('[data-t07-party=G]').isDisabled(), true);
    assert.equal(await builder.locator('[data-t07-party=G]').getAttribute('aria-pressed'), 'false');
    assert.match(await builder.locator('[data-t07-party=R]').innerText(), /7 seats/i);
    assert.match(await status.innerText(), /10 of 10 seats: a majority[\s\S]*not minimal/i);
    await l4.locator('.chips [data-id=proportional]').click();
    assert.match(await status.innerText(), /8 of 10 seats: a minimal winning set/i);
    await page.reload(); await page.waitForSelector('.election-coalition');
    assert.equal(await builder.locator('[data-t07-party=B]').getAttribute('aria-pressed'), 'true');
    assert.equal(await builder.locator('[data-t07-party=R]').getAttribute('aria-pressed'), 'true');
    await builder.locator('[data-t07-coalition-reset]').click();
    assert.match(await status.innerText(), /0 of 10 seats/i);
    assert.equal(await l4.locator('.chips [data-id=proportional]').getAttribute('aria-checked'), 'true');
    await page.click('#topbar [data-lang=hi]'); assert.match(await status.innerText(), /10 में से 0 सीटें/);
    await page.click('#topbar [data-lang=both]'); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2);
    for (const button of await builder.locator('button:visible').all()) { const box = await button.boundingBox(); assert.ok(box && box.height >= 43.5); }
    await page.click('#topbar [data-lang=en]');

    async function solve(id, answer) {
      await page.click(`#tab-L${id}`);
      const lab = page.locator(`#lab-T07-L${id}`);
      await lab.locator('[role=tab]').filter({ hasText: 'Quick Quiz' }).click();
      await lab.locator('.mcq .opt').filter({ hasText: answer }).click();
      assert.ok(await lab.locator('.mcq .feedback.ok').isVisible());
    }
    await solve(1, 'Article 326');
    await page.click('#tab-L2'); await l2.locator('.mcq').nth(1).locator('.opt').filter({ hasText: 'getting more votes than' }).click();
    assert.ok(await l2.locator('.mcq').nth(1).locator('.feedback.ok').isVisible());
    await solve(3, 'Ensure each constituency');
    await solve(4, 'If one partner leaves');
    assert.equal(await page.locator('.chapter-done').isVisible(), true);
    await page.reload(); await page.waitForSelector('.election-coalition'); assert.equal(await page.locator('.chapter-done').isVisible(), true);
    await page.goto(`${base}?nowebgl=1#/`); await page.waitForSelector('#main .card[data-theme=T07]');
    assert.match(await page.locator('#main .card[data-theme=T07] .card-progress-txt').innerText(), /4\/4 LOs/);
    assert.deepEqual(errors, []); assert.deepEqual(writes, []); await mobile.close();

    // Earlier predictions are retained without treating their old explanation as current.
    const legacy = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
    const old = { choice: 'B', actual: 'B', ok: true, explanation: { en: 'Old boundary explanation', hi: 'पुराना स्पष्टीकरण' } };
    await legacy.addInitScript(({ prefs, old }) => {
      if (!sessionStorage.getItem('legacy')) { sessionStorage.setItem('legacy', '1'); localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ ...prefs,
        sim: { 'T07.ui': { tab: 'L3' }, 'T07.L3': { scheme: 'rows', voterAge: 19, resident: true, done: { p1: old } }, 'T07.journey': { stage: 'bad', choice: 'private' }, 'T07.coalitionBuilder': { selected: ['bad', 'B', 'B'] } },
        progress: { T07: { visited: true, exit: { 'T07.L3.e1': { ok: true, attempts: 1 } }, reflection: 'Saved note' } }, stars: { 'old-star': true } })); }
    }, { prefs, old });
    const lp = await legacy.newPage(); await lp.goto(`${base}#/theme/T07`); await lp.waitForSelector('#lab-T07-L3');
    const pred = lp.locator('#lab-T07-L3 .predict'); assert.match(await pred.locator('.feedback').innerText(), /question has changed/i);
    await pred.locator('.opt').filter({ hasText: 'Party B wins' }).click();
    const saved = await lp.evaluate(() => JSON.parse(localStorage.getItem('eduverse.ix.ss.v1')));
    assert.deepEqual(saved.sim['T07.L3'].done.p1.previous, old);
    assert.equal(saved.sim['T07.L3'].done.p1.revision, 't07-step7');
    assert.equal(saved.progress.T07.exit['T07.L3.e1'].ok, true); assert.equal(saved.progress.T07.reflection, 'Saved note');
    assert.deepEqual(saved.stars, { 'old-star': true });
    await lp.click('#tab-L1'); assert.equal(await lp.locator('[data-t07-stage=roll]').getAttribute('aria-pressed'), 'true');
    await lp.click('#tab-L4'); assert.equal(await lp.locator('[data-t07-party=B]').getAttribute('aria-pressed'), 'true');
    await legacy.close();

    const blocked = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
    await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', { configurable: true, value: { getItem: () => JSON.stringify({ lang: 'en', sound: false, lowGraphics: true }), setItem: () => { throw new DOMException('Blocked', 'SecurityError'); } } }));
    const bp = await blocked.newPage(); await bp.goto(`${base}#/theme/T07`); await bp.waitForSelector('.election-journey');
    await bp.locator('[data-t07-stage=mark]').click(); await bp.locator('[data-t07-practice=red]').click();
    assert.match(await bp.locator('[data-t07-journey-storage]').innerText(), /blocked[\s\S]*lost on reload/i);
    await bp.click('#tab-L4'); await bp.locator('[data-t07-party=B]').click();
    assert.match(await bp.locator('[data-t07-coalition-storage]').innerText(), /blocked[\s\S]*lost on reload/i); await blocked.close();

    const offline = await browser.newContext({ viewport: { width: 360, height: 900 }, reducedMotion: 'reduce' });
    await offline.addInitScript(({ prefs }) => { if (!sessionStorage.getItem('offline')) { sessionStorage.setItem('offline', '1'); localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ ...prefs, lang: 'hi' })); } }, { prefs });
    const op = await offline.newPage(), offlineErrors = []; op.on('pageerror', (err) => offlineErrors.push(err.message));
    await op.goto(base); await op.evaluate(() => navigator.serviceWorker.ready); await op.reload(); await offline.setOffline(true);
    await op.goto(`${base}#/theme/T07`); await op.reload(); await op.waitForSelector('.election-journey', { timeout: 15000 });
    await op.locator('[data-t07-stage=mark]').click(); await op.locator('[data-t07-practice=red]').click();
    assert.match(await op.locator('[data-t07-practice-result]').innerText(), /असली मत नहीं/);
    await op.click('#tab-L4'); await op.locator('[data-t07-party=B]').click(); await op.locator('[data-t07-party=G]').click();
    assert.match(await op.locator('[data-t07-coalition-result]').innerText(), /न्यूनतम विजयी समूह/);
    await op.reload(); await op.waitForSelector('.election-coalition'); assert.equal(await op.locator('[data-t07-party=G]').getAttribute('aria-pressed'), 'true');
    assert.deepEqual(offlineErrors, []); await offline.close();

    const dark = await browser.newContext({ colorScheme: 'dark', serviceWorkers: 'block', reducedMotion: 'reduce' });
    await dark.addInitScript(() => localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ lang: 'both', sound: false, lowGraphics: true })));
    const dp = await dark.newPage(); await dp.goto(`${base}#/theme/T07`); await dp.waitForSelector('.election-journey'); await dp.locator('[data-t07-stage=mark]').click();
    const lum = (rgb) => { const [r,g,b] = rgb.match(/\d+/g).slice(0, 3).map((x) => Number(x) / 255).map((x) => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4); return .2126*r + .7152*g + .0722*b; };
    async function contrast(selector) {
      const colors = await dp.locator(selector).evaluate((el) => ({ bg: getComputedStyle(el).backgroundColor, en: getComputedStyle(el.querySelector('[lang=en]')).color, hi: getComputedStyle(el.querySelector('.hi-line')).color }));
      assert.equal(colors.en, colors.hi); const [light, shade] = [lum(colors.bg), lum(colors.hi)].sort((a, b) => b - a); assert.ok((light + .05) / (shade + .05) >= 4.5);
    }
    await contrast('[data-t07-stage=mark]'); await dp.click('#tab-L4'); await dp.locator('[data-t07-party=B]').click(); await contrast('[data-t07-party=B]');
    await dp.click('#tab-L3'); assert.equal(await dp.locator('.t07-boundaries .txt').first().evaluate((el) => getComputedStyle(el).fill), 'rgb(23, 33, 43)'); await dark.close();

    const graphics = await browser.newContext({ viewport: { width: 1100, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await graphics.addInitScript(() => localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ lang: 'en', sound: false, lowGraphics: false, reducedMotion: true })));
    const gp = await graphics.newPage(), glErrors = []; recordErrors(gp, glErrors);
    await gp.goto(`${base}#/theme/T07`); await gp.waitForSelector('#lab-T07-L1 .view3d canvas', { timeout: 20000 });
    const initialStage = await gp.locator('#T07-L1-stage').inputValue();
    await gp.locator('#lab-T07-L1 .demo-btn').click();
    await gp.waitForFunction((previous) => document.querySelector('#T07-L1-stage').value !== previous, initialStage, { timeout: 4000 });
    await gp.locator('#lab-T07-L1 .demo-btn').click();
    await gp.click('#tab-L3'); await gp.waitForSelector('#lab-T07-L3 .view3d canvas', { timeout: 20000 });
    assert.equal(await gp.locator('#module .view3d canvas').count(), 1);
    await gp.click('#tab-L4'); await gp.waitForSelector('#lab-T07-L4 .view3d canvas', { timeout: 20000 });
    assert.equal(await gp.locator('#module .view3d canvas').count(), 1);
    await gp.click('#tab-L2'); assert.equal(await gp.locator('#module .view3d canvas').count(), 0);
    await gp.goto(`${base}#/`); assert.deepEqual(glErrors, []); await graphics.close();
    console.log(JSON.stringify({ theme: 'T07', journeySteps: 5, boundarySchemes: 4, coalitionBuilder: true, leaderTies: true, languages: ['en', 'hi', 'both'], keyboard: true, mobileWidth: 360, savedAndRepaired: true, deniedStorage: true, firstOpenOffline: true, progress: '4/4', darkContrast: true, webglLifecycle: true, networkWrites: 0, errors: [] }));
  } finally { await browser?.close(); server.close(); }
})().catch((err) => { console.error(err); process.exitCode = 1; });
