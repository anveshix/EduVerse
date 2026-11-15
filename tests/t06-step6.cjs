// T06: local-government explorer, fictional vote arithmetic, presets, persistence and offline regression.
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
      if (!sessionStorage.getItem('t06-mobile-init')) { sessionStorage.setItem('t06-mobile-init', '1'); localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify(prefs)); }
    }, { prefs });
    const page = await mobile.newPage(), errors = [], writes = [];
    recordErrors(page, errors);
    page.on('request', (req) => { if (!['GET', 'HEAD'].includes(req.method())) writes.push(`${req.method()} ${req.url()}`); });
    await page.goto(`${base}?nowebgl=1#/theme/T06`); await page.waitForSelector('.civic-vote', { timeout: 15000 });
    const lab1 = page.locator('#lab-T06-L1'), vote = lab1.locator('.civic-vote'), result = vote.locator('[data-t06-vote-result]');
    assert.match(await result.innerText(), /No votes counted yet; no winner/i);
    assert.match(await vote.locator('.civic-limit').innerText(), /not a ballot box[\s\S]*actual election/i);
    await vote.locator('[data-t06-vote-plus=books]').focus(); await page.keyboard.press('Enter');
    await vote.locator('[data-t06-vote-plus=garden]').focus(); await page.keyboard.press('Space');
    assert.match(await result.innerText(), /Tie for the most votes[\s\S]*No winner is declared/i);
    await vote.locator('[data-t06-vote-plus=games]').click();
    await vote.locator('[data-t06-vote-plus=books]').click();
    assert.match(await result.innerText(), /Reading corner has the most: 2 of 4[\s\S]*not more than half of votes counted/i);
    await vote.locator('[data-t06-vote-plus=books]').click();
    assert.match(await result.innerText(), /more than half of votes counted[\s\S]*not more than half of the 12 eligible/i);
    assert.match(await result.innerText(), /absent, abstaining or not yet recorded/i);
    assert.equal(await vote.locator('[data-t06-vote-plus=books]').getAttribute('aria-label'), 'Add one example vote for Reading corner');
    for (let i = 0; i < 7; i++) await vote.locator('[data-t06-vote-plus=books]').click();
    assert.match(await result.innerText(), /12 of 12 example votes counted; 0 not counted/i);
    assert.equal(await vote.locator('[data-t06-vote-plus]:disabled').count(), 3);
    await vote.locator('[data-t06-vote-minus=books]').click();
    assert.equal(await vote.locator('[data-t06-vote-plus]:disabled').count(), 0);
    for (const el of await vote.locator('button').all()) { const box = await el.boundingBox(); assert.ok(box && box.height >= 43.5 && box.width >= 43.5); }
    await page.click('#topbar [data-lang=hi]');
    assert.match(await vote.locator('.civic-title').innerText(), /काल्पनिक अभ्यास/);
    assert.match(await vote.locator('[data-t06-vote-plus=books]').getAttribute('aria-label'), /उदाहरण मत जोड़ें/);
    await page.click('#topbar [data-lang=both]');
    assert.match(await result.innerText(), /Reading corner[\s\S]*पठन कोना/);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2);
    await page.click('#topbar [data-lang=en]');

    // Preset chips and editable switches must describe exactly the same case.
    await lab1.locator('.chips [data-id=oneparty]').click();
    assert.equal(await lab1.locator('#T06-L1-freeVote').isChecked(), true);
    for (const id of ['multipleParties', 'freeMedia', 'equalLaw']) assert.equal(await lab1.locator(`#T06-L1-${id}`).isChecked(), false);
    assert.match(await lab1.locator('.readout').innerText(), /1 of 4/);
    await lab1.locator('label[for=T06-L1-equalLaw]').click();
    assert.equal(await lab1.locator('.chips [data-id=custom]').getAttribute('aria-checked'), 'true');
    assert.match(await lab1.locator('.readout').innerText(), /2 of 4/);
    await lab1.locator('.chips [data-id=pressban]').click();
    assert.equal(await lab1.locator('#T06-L1-multipleParties').isChecked(), true);
    assert.equal(await lab1.locator('#T06-L1-freeMedia').isChecked(), false);
    assert.equal(await lab1.locator('#T06-L1-equalLaw').isChecked(), true);
    assert.match(await lab1.locator('.readout').innerText(), /3 of 4/);
    await lab1.locator('[data-k="btn.reset"]').click();
    assert.equal(await vote.locator('[data-t06-vote-count=books]').innerText(), '9', 'lab reset does not reset the separate tally');
    await page.reload(); await page.waitForSelector('.civic-vote');
    assert.equal(await vote.locator('[data-t06-vote-count=books]').innerText(), '9');
    await vote.locator('[data-t06-vote-reset]').click();
    assert.match(await result.innerText(), /No votes counted yet/);

    await page.click('#tab-T06-L2');
    const lab2 = page.locator('#lab-T06-L2'), roles = lab2.locator('.civic-card');
    assert.equal(await roles.locator('[data-t06-role]').count(), 4);
    for (const id of ['sabha', 'gram', 'block', 'district']) {
      await roles.locator(`[data-t06-role=${id}]`).focus(); await page.keyboard.press('Enter');
      assert.equal(await roles.locator(`[data-t06-role=${id}]`).getAttribute('aria-pressed'), 'true');
      assert.equal(await roles.locator('[data-t06-role-field]').count(), 3);
    }
    await roles.locator('[data-t06-role=block]').click();
    assert.match(await roles.locator('[data-t06-role-field=work]').innerText(), /20 lakh people may omit/i);
    await roles.locator('.civic-inclusion summary').focus(); await page.keyboard.press('Enter');
    assert.match(await roles.locator('.civic-inclusion').innerText(), /one-third[\s\S]*State Election Commission/i);
    await roles.locator('[data-t06-role-answer=gram]').click();
    assert.match(await roles.locator('[data-t06-role-result]').innerText(), /not quite/i);
    await roles.locator('[data-t06-role-answer=sabha]').click();
    assert.match(await roles.locator('[data-t06-role-result]').innerText(), /registered electors/i);
    assert.match(await lab2.locator('.readout').innerText(), /do not equate[\s\S]*universal adult suffrage/i);
    await page.click('#topbar [data-lang=hi]');
    assert.match(await roles.locator('[data-t06-role-result]').innerText(), /पंजीकृत मतदाता/);
    await page.click('#topbar [data-lang=en]');
    await page.reload(); await page.waitForSelector('[data-t06-role=block]');
    assert.equal(await roles.locator('[data-t06-role=block]').getAttribute('aria-pressed'), 'true');
    assert.match(await roles.locator('[data-t06-role-result]').innerText(), /registered electors/i);
    await lab2.locator('.chips [data-id=vajji]').click();
    await roles.locator('[data-t06-role-reset]').click();
    assert.equal(await lab2.locator('.chips [data-id=vajji]').getAttribute('aria-checked'), 'true');
    assert.equal(await roles.locator('[data-t06-role-result]').innerText(), '');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2);

    // Confidence motion in the toy assumes all 100 vote. Fifty fails; fifty-one passes.
    await page.click('#tab-T06-L3');
    const lab3 = page.locator('#lab-T06-L3'), support = lab3.locator('#T06-L3-support');
    await support.evaluate((el) => { el.value = '50'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await lab3.locator('label[for=T06-L3-vote]').click();
    assert.match(await lab3.locator('.readout').innerText(), /50 support[\s\S]*loses the confidence motion/i);
    await support.evaluate((el) => { el.value = '51'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    assert.match(await lab3.locator('.readout').innerText(), /51 of 100 supporters[\s\S]*WINS/i);
    await lab3.locator('.chips [data-id=presidential]').click();
    assert.match(await lab3.locator('.readout').innerText(), /confidence vote does not remove the president/i);
    await page.click('#tab-T06-L4');
    const lab4 = page.locator('#lab-T06-L4');
    await lab4.locator('.chips [data-id=us]').click();
    assert.match(await lab4.locator('.readout').innerText(), /Electoral College/i);
    await page.click('#topbar [data-lang=hi]'); assert.match(await lab4.locator('.readout').innerText(), /निर्वाचक मंडल/);
    await page.click('#topbar [data-lang=en]');

    async function solve(id, answer) {
      await page.click(`#tab-T06-L${id}`);
      const lab = page.locator(`#lab-T06-L${id}`);
      await lab.locator('[role=tab]').filter({ hasText: 'Quick Quiz' }).click();
      await lab.locator('.mcq .opt').filter({ hasText: answer }).click();
      assert.ok(await lab.locator('.mcq .feedback.ok').isVisible());
    }
    for (const [id, answer] of [[1, 'Independent courts, free media'], [2, 'In India eligible citizens aged 18'], [3, 'The president is chosen separately'], [4, 'The Prime Minister and Cabinet']]) await solve(id, answer);
    assert.equal(await page.locator('.chapter-done').isVisible(), true);
    await page.reload(); await page.waitForSelector('#lab-T06-L4');
    assert.equal(await page.locator('.chapter-done').isVisible(), true);
    await page.goto(`${base}?nowebgl=1#/`); await page.waitForSelector('#main .card[data-theme=T06]');
    assert.match(await page.locator('#main .card[data-theme=T06] .card-progress-txt').innerText(), /4\/4 LOs with a correct exit answer/);
    assert.deepEqual(errors, []); assert.deepEqual(writes, []); await mobile.close();

    // Older preset cases are reconciled with their visible score and old predictions remain saved.
    const legacy = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
    const old = { choice: 'one', actual: 'one', ok: true, explanation: { en: 'Old explanation', hi: 'पुराना उत्तर' } };
    await legacy.addInitScript(({ prefs, old }) => {
      if (!sessionStorage.getItem('t06-legacy-init')) {
        sessionStorage.setItem('t06-legacy-init', '1');
        localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ ...prefs,
          sim: { 'T06.L1': { preset: 'oneparty', freeVote: true, multipleParties: true, freeMedia: true, equalLaw: true, done: { p1: old } },
            'T06.panchayat': { level: 'bad', answer: 'bad' }, 'T06.classroomVote': { counts: [100, -1, 0] } },
          progress: { T06: { visited: true, predictions: {}, exit: { 'T06.L1.e1': { ok: true, attempts: 1 } }, cbq: {}, reflection: 'Saved note' } }, stars: { 'old-star': true } }));
      }
    }, { prefs, old });
    const lp = await legacy.newPage(); await lp.goto(`${base}#/theme/T06`); await lp.waitForSelector('.civic-vote');
    assert.equal(await lp.locator('#T06-L1-equalLaw').isChecked(), false);
    assert.match(await lp.locator('#lab-T06-L1 .readout').innerText(), /1 of 4/);
    assert.match(await lp.locator('[data-t06-vote-result]').innerText(), /No votes counted yet/);
    const prediction = lp.locator('#lab-T06-L1 .predict');
    assert.match(await prediction.locator('.feedback').innerText(), /question has changed/i);
    await prediction.locator('.opt').filter({ hasText: 'Only 1' }).click();
    const saved = await lp.evaluate(() => JSON.parse(localStorage.getItem('eduverse.ix.ss.v1')));
    assert.deepEqual(saved.sim['T06.L1'].done.p1.previous, old);
    assert.equal(saved.progress.T06.exit['T06.L1.e1'].ok, true);
    assert.equal(saved.progress.T06.reflection, 'Saved note');
    assert.deepEqual(saved.stars, { 'old-star': true });
    await lp.click('#tab-T06-L2');
    assert.equal(await lp.locator('[data-t06-role=sabha]').getAttribute('aria-pressed'), 'true');
    await legacy.close();

    const blocked = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
    await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', { configurable: true, value: {
      getItem: () => JSON.stringify({ lang: 'en', sound: false, lowGraphics: true }), setItem: () => { throw new DOMException('Blocked', 'SecurityError'); },
    } }));
    const bp = await blocked.newPage(); await bp.goto(`${base}#/theme/T06`); await bp.waitForSelector('.civic-vote');
    await bp.locator('[data-t06-vote-plus=books]').click();
    assert.match(await bp.locator('[data-t06-vote-storage]').innerText(), /blocked[\s\S]*lost on reload/i);
    await bp.click('#tab-T06-L2'); await bp.locator('[data-t06-role=gram]').click();
    assert.match(await bp.locator('[data-t06-role-storage]').innerText(), /blocked[\s\S]*lost on reload/i);
    await blocked.close();

    const offline = await browser.newContext({ viewport: { width: 360, height: 900 }, reducedMotion: 'reduce' });
    await offline.addInitScript(({ prefs }) => { if (!sessionStorage.getItem('t06-offline-init')) { sessionStorage.setItem('t06-offline-init', '1'); localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ ...prefs, lang: 'hi' })); } }, { prefs });
    const op = await offline.newPage(), offlineErrors = []; op.on('pageerror', (err) => offlineErrors.push(err.message));
    await op.goto(base); await op.evaluate(() => navigator.serviceWorker.ready); await op.reload(); await offline.setOffline(true);
    await op.goto(`${base}#/theme/T06`); await op.reload(); await op.waitForSelector('.civic-vote', { timeout: 15000 });
    await op.locator('[data-t06-vote-plus=books]').click();
    assert.match(await op.locator('[data-t06-vote-result]').innerText(), /पठन कोना/);
    await op.click('#tab-T06-L2'); await op.locator('[data-t06-role=sabha]').click();
    assert.match(await op.locator('[data-t06-role-field=who]').innerText(), /मतदाता सूची/);
    await op.reload(); await op.waitForSelector('[data-t06-role=sabha]');
    assert.equal(await op.locator('[data-t06-role=sabha]').getAttribute('aria-pressed'), 'true');
    assert.equal(await op.locator('[data-t06-vote-count=books]').textContent(), '1');
    assert.deepEqual(offlineErrors, []); await offline.close();

    const dark = await browser.newContext({ colorScheme: 'dark', serviceWorkers: 'block', reducedMotion: 'reduce' });
    await dark.addInitScript(() => localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ lang: 'both', sound: false, lowGraphics: true })));
    const dp = await dark.newPage(); await dp.goto(`${base}#/theme/T06`); await dp.waitForSelector('#tab-T06-L2'); await dp.click('#tab-T06-L2');
    await dp.locator('[data-t06-role-answer=sabha]').click();
    const lum = (rgb) => { const [r,g,b] = rgb.match(/\d+/g).slice(0, 3).map((x) => Number(x) / 255).map((x) => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4); return .2126*r + .7152*g + .0722*b; };
    for (const selector of ['[data-t06-role=sabha]', '[data-t06-role-answer=sabha]']) {
      const colors = await dp.locator(selector).evaluate((el) => ({ bg: getComputedStyle(el).backgroundColor, en: getComputedStyle(el.querySelector('[lang=en]')).color, hi: getComputedStyle(el.querySelector('.hi-line')).color }));
      assert.equal(colors.en, colors.hi);
      const [light, shade] = [lum(colors.bg), lum(colors.hi)].sort((a, b) => b - a);
      assert.ok((light + .05) / (shade + .05) >= 4.5);
    }
    await dark.close();

    const graphics = await browser.newContext({ viewport: { width: 1100, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await graphics.addInitScript(() => localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ lang: 'en', sound: false, lowGraphics: false, reducedMotion: true })));
    const gp = await graphics.newPage(), glErrors = []; recordErrors(gp, glErrors);
    await gp.goto(`${base}#/theme/T06`); await gp.waitForSelector('#lab-T06-L1 .view3d canvas', { timeout: 20000 });
    await gp.locator('#lab-T06-L1 .plate-spot').nth(1).click();
    assert.equal(await gp.locator('#lab-T06-L1 .chips [data-id=oneparty]').getAttribute('aria-checked'), 'true');
    assert.equal(await gp.locator('#T06-L1-equalLaw').isChecked(), false);
    await gp.locator('#lab-T06-L1 .demo-btn').click();
    await gp.waitForFunction(() => document.querySelector('#lab-T06-L1 .chips [data-id=pressban]')?.getAttribute('aria-checked') === 'true', null, { timeout: 5000 });
    await gp.locator('#lab-T06-L1 .demo-btn').click();
    assert.equal(await gp.locator('#T06-L1-multipleParties').isChecked(), true);
    assert.equal(await gp.locator('#T06-L1-freeMedia').isChecked(), false);
    await gp.click('#tab-T06-L3'); await gp.waitForSelector('#lab-T06-L3 .view3d canvas', { timeout: 20000 });
    assert.equal(await gp.locator('#module .view3d canvas').count(), 1);
    assert.deepEqual(glErrors, []); await graphics.close();
    console.log(JSON.stringify({ theme: 'T06', localBodies: 4, classroomChoices: 3, tiedAndPlurality: true, languages: ['en', 'hi', 'both'], keyboard: true, mobileWidth: 360, savedAndRepaired: true, deniedStorage: true, firstOpenOffline: true, presetsSynced: true, progress: '4/4', darkContrast: true, webgl: true, networkWrites: 0, errors: [] }));
  } finally { await browser?.close(); server.close(); }
})().catch((err) => { console.error(err); process.exitCode = 1; });
