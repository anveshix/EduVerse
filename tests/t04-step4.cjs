// Real-browser T04 regression: detective cases, guided 2D/3D tour, saved work and first-open offline.
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
const prefs = { lang: 'en', sound: false, lowGraphics: false, reducedMotion: true };
const recordErrors = (page, errors) => {
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => { if (msg.type() === 'error' || /too many active webgl contexts/i.test(msg.text())) errors.push(msg.text()); });
};
const frame = (page) => page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));

(async () => {
  let browser;
  try {
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    browser = await launchChromium({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const base = `http://127.0.0.1:${server.address().port}/`;

    // A 360px device with WebGL explicitly unavailable still has the entire tour and 2D plan.
    const mobile = await browser.newContext({ viewport: { width: 360, height: 950 }, hasTouch: true, isMobile: true, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await mobile.addInitScript(({ prefs }) => {
      if (!sessionStorage.getItem('eduverse-t04-mobile')) {
        sessionStorage.setItem('eduverse-t04-mobile', '1');
        localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify(prefs));
      }
    }, { prefs });
    const page = await mobile.newPage(), errors = [], writes = [];
    recordErrors(page, errors);
    page.on('request', (req) => { if (!['GET', 'HEAD'].includes(req.method())) writes.push(`${req.method()} ${req.url()}`); });
    await page.goto(`${base}?nowebgl=1#/theme/T04`);
    await page.waitForSelector('#tab-evid', { timeout: 15000 });
    assert.deepEqual(await page.evaluate(() => {
      const nodes = [...document.querySelectorAll('#module [id]')], ids = nodes.map((el) => el.id);
      return ids.filter((id, i) => ids.indexOf(id) !== i);
    }), [], 'all tab and panel IDs must be unique, including hidden labs');
    assert.equal(await page.evaluate(() => [...document.querySelectorAll('#module [role=tab]')].filter((tab) => {
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      return !panel || panel.getAttribute('aria-labelledby') !== tab.id;
    }).length), 0, 'tabs and panels reference the correct unique partners');
    assert.match(await page.locator('#panel-time .readout').innerText(), /3\.3 million[\s\S]*not universal boundaries[\s\S]*100 years ago/i);
    const clock = page.locator('#panel-time .predict');
    await clock.locator('.opt').filter({ hasText: 'A few minutes' }).click();
    assert.match(await clock.locator('.feedback').innerText(), /5\.8 minutes[\s\S]*not the beginning of farming everywhere/i);
    await page.locator('#panel-time .chips [data-id=cities]').click();
    await page.locator('#tab-time').focus(); await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#tab-evid').getAttribute('aria-selected'), 'true');

    const kit = page.locator('.detective-kit');
    const panel = (id) => kit.locator(`[data-detective-panel="${id}"]`);
    const caseButton = (id) => kit.locator(`[data-detective-case="${id}"]`);
    const choice = (id, kind, answer) => panel(id).locator(`[data-detective-kind="${kind}"][data-detective-choice="${answer}"]`);
    const feedback = (id, kind) => panel(id).locator(`[data-detective-feedback="${kind}"]`);
    assert.equal(await kit.locator('[data-detective-case]').count(), 3);
    assert.match(await kit.locator('.detective-fictional').innerText(), /imagined[\s\S]*not reports of actual excavations/i);
    assert.equal(await panel('bone').locator('textarea').evaluate((el) => el.labels.length), 1);
    await choice('bone', 'claim', 'certain').click();
    assert.match(await feedback('bone', 'claim').innerText(), /do not identify[\s\S]*hunting/i);
    await choice('bone', 'claim', 'careful').focus(); await page.keyboard.press('Space');
    assert.equal(await choice('bone', 'claim', 'careful').getAttribute('aria-pressed'), 'true');
    assert.equal(await choice('bone', 'claim', 'certain').getAttribute('aria-pressed'), 'false');
    assert.match(await feedback('bone', 'claim').innerText(), /trampling|cautious/i);
    await choice('bone', 'test', 'colour').click();
    assert.match(await feedback('bone', 'test').innerText(), /colour alone/i);
    await choice('bone', 'test', 'marks').click();
    assert.match(await feedback('bone', 'test').innerText(), /mark profiles/i);
    await panel('bone').locator('textarea').fill('Grooves might have been made by trampling; compare their shapes.');
    await caseButton('grain').focus(); await page.keyboard.press('Enter');
    await choice('grain', 'claim', 'careful').click();
    await panel('grain').locator('textarea').fill('Charred grain is not proof it was grown locally.');
    await caseButton('platform').click();
    await choice('platform', 'claim', 'certain').click();
    assert.match(await feedback('platform', 'claim').innerText(), /neither grain storage nor a king/i);
    await choice('platform', 'claim', 'careful').click();
    await choice('platform', 'test', 'context').click();
    assert.match(await feedback('platform', 'test').innerText(), /preservation is incomplete/i);
    for (const el of await kit.locator('button, textarea, summary').all()) {
      const box = await el.boundingBox();
      if (box && (await el.evaluate((e) => e.tagName !== 'SUMMARY'))) assert.ok(box.width >= 43.5 && box.height >= 43.5, 'visible case controls must be touch-sized');
    }
    const card = page.locator('[data-evidence-item=i3]');
    await card.locator('[data-evidence-choice=inference]').click();
    assert.ok(await card.locator('.feedback.try').isVisible());
    await card.locator('[data-evidence-choice=evidence]').click();
    assert.ok(await card.locator('.feedback.ok').isVisible());
    assert.equal(await card.locator('[data-evidence-choice=evidence]').isDisabled(), false);
    await page.click('#topbar [data-lang=hi]');
    assert.match(await kit.locator('.detective-title').innerText(), /प्रमाण जासूस/);
    assert.match(await feedback('platform', 'claim').innerText(), /अन्य उपयोग/);
    await page.click('#topbar [data-lang=both]');
    assert.match(await kit.locator('.detective-title').innerText(), /Evidence detective kit/);
    assert.match(await kit.locator('.detective-title').innerText(), /प्रमाण जासूस/);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2);
    await page.click('#topbar [data-lang=en]');
    await page.reload();
    await page.waitForSelector('.detective-kit');
    assert.equal(await page.locator('#tab-evid').getAttribute('aria-selected'), 'true');
    assert.equal(await caseButton('platform').getAttribute('aria-pressed'), 'true');
    assert.equal(await choice('platform', 'test', 'context').getAttribute('aria-pressed'), 'true');
    assert.equal(await card.locator('[data-evidence-choice=evidence]').getAttribute('aria-pressed'), 'true');
    await caseButton('bone').click();
    assert.equal(await panel('bone').locator('textarea').inputValue(), 'Grooves might have been made by trampling; compare their shapes.');
    assert.match(await feedback('bone', 'claim').innerText(), /cautious/i);
    await page.locator('.evidence-sorter button').filter({ hasText: 'Reset sorter only' }).click();
    assert.equal(await card.locator('[data-evidence-choice=evidence]').getAttribute('aria-pressed'), 'false');
    assert.notEqual(await panel('bone').locator('textarea').inputValue(), '', 'sorter reset must not erase field notes');

    await page.click('#tab-city');
    const city = page.locator('#lab-T04-L4'), tour = city.locator('.harappa-tour');
    const stop = (id) => tour.locator(`[data-harappa-stop="${id}"]`);
    const plan = city.locator('.harappa-plan');
    assert.equal(await tour.locator('[data-harappa-stop]').count(), 6);
    assert.equal(await city.locator('.view3d canvas').count(), 0);
    assert.match(await city.locator('.gl-mode-note').innerText(), /3D is off or unavailable/i);
    assert.equal(await city.locator('.gl-presets').isVisible(), false);
    assert.match(await tour.locator('.harappa-limit').innerText(), /not an exact map/i);
    for (const id of ['raised', 'bath', 'streets', 'drains', 'wells', 'platform']) {
      await stop(id).click();
      assert.equal(await stop(id).getAttribute('aria-pressed'), 'true');
      assert.equal(await plan.getAttribute('data-harappa-selected'), id);
      assert.equal(await plan.locator(`[data-harappa-highlight="${id}"]`).count(), 1);
      assert.equal(await tour.locator('[data-harappa-field]').count(), 4);
      assert.ok((await tour.locator('[data-harappa-status]').innerText()).length > 20);
    }
    assert.match(await tour.locator('[data-harappa-field=unknown]').innerText(), /disputed[\s\S]*do not[\s\S]*prove/i);
    await stop('drains').click();
    await city.locator('#T04-L4-coveredDrains').uncheck();
    assert.match(await tour.locator('[data-harappa-status]').innerText(), /hidden by a model control/i);
    assert.equal(await plan.locator('[data-harappa-highlight]').count(), 0);
    await stop('drains').click();
    assert.equal(await city.locator('#T04-L4-coveredDrains').isChecked(), true);
    assert.equal(await plan.locator('[data-harappa-highlight=drains]').count(), 1);
    const wellSlider = city.locator('#T04-L4-wells');
    await stop('wells').click();
    await wellSlider.evaluate((el) => { el.value = '0'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    assert.match(await tour.locator('[data-harappa-status]').innerText(), /hidden by a model control/i);
    await stop('wells').click();
    assert.equal(await wellSlider.inputValue(), '1');
    await city.locator('.lab-plate [data-spot="0"]').click();
    assert.equal(await stop('platform').getAttribute('aria-pressed'), 'true', 'illustration pin synchronises the tour');
    assert.equal(await plan.getAttribute('data-harappa-selected'), 'platform');
    await city.locator('.predict .opt').filter({ hasText: 'They could carry wastewater' }).click();
    assert.equal(await stop('drains').getAttribute('aria-pressed'), 'true', 'prediction synchronises the tour');
    await city.locator('.lab-side .btn').filter({ hasText: /^Reset/ }).click();
    assert.equal(await stop('raised').getAttribute('aria-pressed'), 'true', 'model reset synchronises the tour');
    await stop('wells').click();
    await tour.locator('[data-harappa-jump]').click();
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Harappan model views');
    assert.ok(await city.locator('.harappa-plan-scroll').evaluate((el) => el.scrollWidth > el.clientWidth), 'small plan scrolls internally to keep labels legible');
    assert.equal(await page.evaluate(() => innerWidth), 360, 'the plan must not expand the mobile layout viewport');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2);
    await page.reload();
    await page.waitForSelector('.harappa-tour');
    assert.equal(await stop('wells').getAttribute('aria-pressed'), 'true');
    assert.equal(await plan.getAttribute('data-harappa-selected'), 'wells');
    assert.match(await city.locator('.predict .feedback').innerText(), /does not measure ancient health/i);
    await page.click('#tab-time');
    assert.equal(await page.locator('#panel-time .chips [data-id=cities]').getAttribute('aria-checked'), 'true', 'restoring a clock prediction does not rerun it');
    assert.match(await clock.locator('.feedback').innerText(), /5\.8 minutes/i);

    // Complete the five existing LOs; the activity badge counts LOs, not questions.
    async function solve(scope, text, answer) {
      const q = scope.locator('.mcq').filter({ hasText: text });
      await q.locator('.opt').filter({ hasText: answer }).first().click();
      assert.ok(await q.locator('.feedback.ok').isVisible(), `feedback for ${text}`);
    }
    await solve(page, 'Which is an inference, not direct evidence?', 'The cave people hunted together');
    await solve(page, 'Why do we call a time of 12,000 years ago', 'tiny fraction of the 2-million-year window');
    assert.equal(await page.locator('.chapter-done').isVisible(), false);
    await page.click('#tab-settle');
    const settle = page.locator('#lab-T04-L3');
    await settle.locator('[role=tab]').filter({ hasText: 'Quick Quiz' }).click();
    await solve(settle, 'possible trade-off of settled farming', 'Food surpluses');
    await page.click('#tab-city');
    await city.locator('[role=tab]').filter({ hasText: 'Quick Quiz' }).click();
    await solve(city, 'similar brick proportions', 'Some shared building practices');
    await page.click('#tab-atlas');
    const atlas = page.locator('#lab-T04-L5');
    await atlas.locator('[role=tab]').filter({ hasText: 'Quick Quiz' }).click();
    await solve(atlas, 'How could a river help', 'Water, fertile land and routes');
    assert.equal(await page.locator('.chapter-done').isVisible(), true);
    await page.click('#topbar [data-lang=hi]');
    assert.match(await atlas.locator('svg[role=img]').getAttribute('aria-label'), /कांस्य-युगीन सभ्यताएँ/);
    await page.click('#topbar [data-lang=en]');
    await page.reload();
    await page.waitForSelector('#lab-T04-L5');
    assert.equal(await page.locator('.chapter-done').isVisible(), true);
    await page.goto(`${base}?nowebgl=1#/`);
    await page.waitForSelector('#main .card[data-theme=T04]');
    assert.match(await page.locator('#main .card[data-theme=T04] .card-progress-txt').innerText(), /5\/5 LOs with a correct exit answer/);
    await page.goto(`${base}?nowebgl=1#/theme/T04`);
    await page.waitForSelector('#tab-evid'); await page.click('#tab-evid');
    assert.equal(await panel('bone').locator('textarea').inputValue(), 'Grooves might have been made by trampling; compare their shapes.');
    assert.deepEqual(errors, []);
    assert.deepEqual(writes, [], 'answers and notes never make network writes');
    await mobile.close();

    // Old saved predictions have different wording: do not misrepresent the learner's previous selection.
    const legacy = await browser.newContext({ viewport: { width: 1100, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    const oldPrediction = { choice: 'secret', actual: 'hygiene', ok: false, explanation: { en: 'Old explanation', hi: 'पुराना विवरण' } };
    await legacy.addInitScript(({ old }) => {
      if (!sessionStorage.getItem('eduverse-t04-legacy')) {
        sessionStorage.setItem('eduverse-t04-legacy', '1');
        localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({
          lang: 'en', sound: false, lowGraphics: true, reducedMotion: true,
          sim: { 'T04': { tab: 'city', mark: 'cities', ev: { i1: 'evidence' }, done: {} },
            'T04.L4': { gridStreets: false, coveredDrains: false, granary: false, greatBath: false, wells: 0, done: { p1: old } },
            'T04.detectiveKit': { active: 'invalid', cases: { bone: { claim: 'invalid', test: 'marks', note: 'x'.repeat(550) } } } },
          progress: { T04: { visited: true, predictions: {}, exit: { h1: { ok: true, attempts: 1 } }, cbq: {}, reflection: 'Earlier reflection' } },
        }));
      }
    }, { old: oldPrediction });
    const lp = await legacy.newPage(), legacyErrors = [];
    recordErrors(lp, legacyErrors);
    await lp.goto(`${base}#/theme/T04`); await lp.waitForSelector('#lab-T04-L4');
    const legacyCity = lp.locator('#lab-T04-L4'), legacyPrediction = legacyCity.locator('.predict');
    assert.match(await legacyPrediction.locator('.feedback').innerText(), /question has changed[\s\S]*earlier answer is retained/i);
    assert.equal(await legacyPrediction.locator('.opt:disabled').count(), 0);
    assert.equal(await legacyCity.locator('#T04-L4-coveredDrains').isChecked(), false, 'opening an older prediction does not rerun it');
    await legacyPrediction.locator('.opt').filter({ hasText: 'They could carry wastewater' }).click();
    const saved = await lp.evaluate(() => JSON.parse(localStorage.getItem('eduverse.ix.ss.v1')));
    assert.deepEqual(saved.sim['T04.L4'].done.p1.previous, oldPrediction);
    assert.equal(saved.sim['T04.L4'].done.p1.revision, 't04-step4');
    assert.equal(saved.progress.T04.exit.h1.ok, true);
    assert.equal(saved.progress.T04.reflection, 'Earlier reflection');
    await lp.click('#tab-evid');
    assert.equal(await lp.locator('[data-detective-case=bone]').getAttribute('aria-pressed'), 'true');
    assert.equal((await lp.locator('[data-detective-note=bone]').inputValue()).length, 500);
    assert.equal(await lp.locator('[data-detective-panel=bone] [data-detective-kind=claim][aria-pressed=true]').count(), 0);
    assert.equal(await lp.locator('[data-detective-panel=bone] [data-detective-kind=test][aria-pressed=true]').count(), 1);
    await lp.reload(); await lp.waitForSelector('#tab-evid'); await lp.click('#tab-city');
    assert.match(await legacyPrediction.locator('.feedback').innerText(), /does not measure ancient health/i);
    assert.deepEqual(legacyErrors, []);
    await legacy.close();

    // Only the shell is opened online; neither the chapter nor Three.js/images are warmed before offline use.
    const offline = await browser.newContext({ viewport: { width: 360, height: 950 }, reducedMotion: 'reduce' });
    await offline.addInitScript(() => {
      if (!sessionStorage.getItem('eduverse-t04-offline')) {
        sessionStorage.setItem('eduverse-t04-offline', '1');
        localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ lang: 'hi', sound: false, lowGraphics: true, reducedMotion: true }));
      }
    });
    const offPage = await offline.newPage(), offErrors = [];
    offPage.on('pageerror', (err) => offErrors.push(err.message));
    await offPage.goto(base); await offPage.evaluate(() => navigator.serviceWorker.ready); await offPage.reload();
    assert.equal(await offPage.evaluate(async () => !!(await caches.match('vendor/three/three.module.min.js'))), false);
    await offline.setOffline(true);
    await offPage.goto(`${base}#/theme/T04`); await offPage.reload();
    await offPage.waitForSelector('#tab-evid', { timeout: 15000 }); await offPage.click('#tab-evid');
    await offPage.locator('[data-detective-case=grain]').click();
    await offPage.locator('[data-detective-panel=grain] [data-detective-kind=claim][data-detective-choice=careful]').click();
    await offPage.locator('[data-detective-note=grain]').fill('अनाज का स्रोत जाँचें।');
    await offPage.click('#tab-city');
    await offPage.locator('[data-harappa-stop=bath]').click();
    assert.match(await offPage.locator('[data-harappa-field=inference]').innerText(), /अनुष्ठानिक/);
    assert.equal(await offPage.locator('.harappa-plan [data-harappa-highlight=bath]').count(), 1);
    assert.equal(await offPage.locator('#lab-T04-L4 canvas').count(), 0);
    await offPage.reload(); await offPage.waitForSelector('.harappa-tour'); await offPage.click('#tab-evid');
    assert.equal(await offPage.locator('[data-detective-note=grain]').inputValue(), 'अनाज का स्रोत जाँचें।');
    await offPage.evaluate(() => document.fonts.ready);
    assert.ok(await offPage.evaluate(() => [...document.fonts].some((f) => f.family === 'Noto Sans Devanagari' && f.status === 'loaded')));
    assert.deepEqual(offErrors, []);
    await offline.close();

    // Storage denial is explicitly temporary rather than falsely claiming a durable save.
    const blocked = await browser.newContext({ viewport: { width: 1100, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await blocked.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { configurable: true, value: {
        getItem: () => JSON.stringify({ lang: 'en', sound: false, lowGraphics: true }),
        setItem: () => { throw new DOMException('Storage blocked', 'SecurityError'); },
      } });
    });
    const bp = await blocked.newPage();
    await bp.goto(`${base}#/theme/T04`); await bp.waitForSelector('#tab-evid'); await bp.click('#tab-evid');
    await bp.locator('[data-detective-note=bone]').fill('Temporary note');
    assert.match(await bp.locator('[data-detective-storage]').innerText(), /temporary[\s\S]*lost on reload/i);
    await bp.reload(); await bp.waitForSelector('#tab-evid'); await bp.click('#tab-evid');
    assert.equal(await bp.locator('[data-detective-note=bone]').inputValue(), '');
    await blocked.close();

    // Dark-mode bilingual selected labels inherit the same readable foreground as English.
    const dark = await browser.newContext({ viewport: { width: 1100, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce', colorScheme: 'dark' });
    await dark.addInitScript(() => localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ lang: 'both', sound: false, lowGraphics: true })));
    const dp = await dark.newPage(); await dp.goto(`${base}#/theme/T04`); await dp.waitForSelector('#tab-evid');
    const luminance = (rgb) => {
      const channels = rgb.match(/\d+/g).slice(0, 3).map((n) => Number(n) / 255).map((c) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    };
    for (const [tab, selector] of [['#tab-evid', '[data-detective-case=bone]'], ['#tab-city', '[data-harappa-stop=raised]']]) {
      await dp.click(tab);
      const colors = await dp.locator(selector).evaluate((el) => ({ bg: getComputedStyle(el).backgroundColor, hi: getComputedStyle(el.querySelector('.hi-line')).color, en: getComputedStyle(el.querySelector('[lang=en]')).color }));
      assert.equal(colors.hi, colors.en);
      const [light, darkColor] = [luminance(colors.bg), luminance(colors.hi)].sort((a, b) => b - a);
      assert.ok((light + 0.05) / (darkColor + 0.05) >= 4.5);
    }
    await dark.close();

    // Delay the first Three.js load, change tabs and preferences, then ensure only the latest scene is attached.
    const graphics = await browser.newContext({ viewport: { width: 1200, height: 1000 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await graphics.addInitScript(({ prefs }) => localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify(prefs)), { prefs });
    const gp = await graphics.newPage(), glErrors = [];
    recordErrors(gp, glErrors);
    let release, seen;
    const gate = new Promise((resolve) => { release = resolve; });
    const requested = new Promise((resolve) => { seen = resolve; });
    await gp.route('**/vendor/three/three.module.min.js', async (route) => { seen(); await gate; await route.continue(); });
    await gp.goto(`${base}#/theme/T04`); await gp.waitForSelector('#tab-city'); await gp.click('#tab-city');
    await Promise.race([requested, new Promise((_, reject) => setTimeout(() => reject(new Error('3D module request not observed')), 15000))]);
    await gp.click('#tab-time'); await gp.click('#tab-city');
    await gp.click('#topbar .settings-menu > summary');
    await gp.click('#topbar [data-pref=lowGraphics]');
    await gp.locator('[data-harappa-stop=wells]').click();
    await gp.click('#topbar .settings-menu > summary');
    await gp.click('#topbar [data-pref=lowGraphics]');
    release();
    await gp.waitForFunction(() => document.querySelectorAll('#lab-T04-L4 canvas').length === 1 && document.querySelector('#lab-T04-L4 .view3d')?.dataset.tourFocus === 'wells', null, { timeout: 20000 });
    const glCity = gp.locator('#lab-T04-L4'), canvas = glCity.locator('canvas');
    assert.match(await glCity.locator('.gl-mode-note').innerText(), /3D model is on/i);
    assert.match(await glCity.locator('[data-harappa-label=wells]').innerText(), /^▶ Illustrated wells/);
    assert.equal(await glCity.locator('.harappa-plan').getAttribute('data-harappa-selected'), 'wells');
    assert.match(await canvas.getAttribute('aria-label'), /Harappan town model/i);
    await gp.click('#topbar [data-lang=hi]');
    assert.match(await canvas.getAttribute('aria-label'), /हड़प्पा नगर/);
    await gp.click('#topbar [data-lang=en]');
    await glCity.locator('#T04-L4-wells').evaluate((el) => { el.value = '0'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    assert.equal(await glCity.locator('[data-harappa-label=wells]').count(), 0);
    assert.match(await glCity.locator('[data-harappa-status]').innerText(), /hidden/i);
    await gp.locator('[data-harappa-stop=wells]').click();
    assert.equal(await glCity.locator('#T04-L4-wells').inputValue(), '1');
    assert.match(await glCity.locator('[data-harappa-label=wells]').innerText(), /^▶/);
    await glCity.locator('.lab-plate [data-spot="0"]').click();
    assert.equal(await gp.locator('[data-harappa-stop=platform]').getAttribute('aria-pressed'), 'true');
    assert.equal(await glCity.locator('.view3d').getAttribute('data-tour-focus'), 'platform');
    assert.match(await glCity.locator('[data-harappa-label=platform]').innerText(), /^▶/);

    // Actual raycast on a neighbourhood block updates the text tour and 2D plan as well.
    await glCity.locator('.lab-side .btn').filter({ hasText: /^Reset/ }).click();
    await glCity.locator('[data-k="pb.cam.overview"]').click();
    await frame(gp);
    const box = await canvas.boundingBox();
    await canvas.click({ position: { x: box.width * 0.7, y: box.height * 0.5 } });
    assert.equal(await gp.locator('[data-harappa-stop=streets]').getAttribute('aria-pressed'), 'true');
    assert.equal(await glCity.locator('.harappa-plan').getAttribute('data-harappa-selected'), 'streets');
    assert.equal(await glCity.locator('.view3d').getAttribute('data-tour-focus'), 'streets');
    await frame(gp);
    const beforeOrbit = await canvas.screenshot();
    await canvas.focus(); await gp.keyboard.press('ArrowRight'); await frame(gp);
    const afterOrbit = await canvas.screenshot();
    assert.equal(beforeOrbit.equals(afterOrbit), false, 'keyboard arrows visibly rotate the 3D camera');

    const spin = glCity.locator('[data-k="pb.btn.spin"]');
    await spin.click();
    assert.equal(await spin.getAttribute('aria-pressed'), 'false', 'reduced motion forbids auto-rotation');
    await gp.click('#topbar .settings-menu > summary');
    await gp.click('#topbar [data-pref=reducedMotion]');
    await gp.waitForSelector('#lab-T04-L4 canvas', { timeout: 20000 });
    await spin.click();
    assert.equal(await spin.getAttribute('aria-pressed'), 'true', 'motion setting can be changed without leaving the tab');
    await gp.click('#topbar .settings-menu > summary');
    await gp.click('#topbar [data-pref=reducedMotion]');
    await gp.waitForSelector('#lab-T04-L4 canvas', { timeout: 20000 });
    await spin.click();
    assert.equal(await spin.getAttribute('aria-pressed'), 'false');
    await gp.evaluate(() => {
      const time = document.querySelector('#tab-time'), city = document.querySelector('#tab-city'), low = document.querySelector('#topbar [data-pref=lowGraphics]');
      for (let i = 0; i < 12; i++) { time.click(); city.click(); low.click(); low.click(); }
    });
    await gp.waitForFunction(() => document.querySelectorAll('#lab-T04-L4 canvas').length === 1 && !document.querySelector('#lab-T04-L4 .gl-presets').hidden, null, { timeout: 20000 });
    assert.equal(await glCity.locator('[data-harappa-label=streets]').count(), 1);
    await gp.evaluate(() => { document.querySelector('#tab-time').click(); document.querySelector('#tab-city').click(); location.hash = '#/'; });
    await gp.waitForSelector('#main .card[data-theme=T04]');
    assert.equal(await gp.locator('#lab-T04-L4 canvas').count(), 0, 'navigating away destroys an in-flight scene');
    assert.deepEqual(glErrors, []);
    await graphics.close();

    // If Three.js is unavailable on first use, the model must recover to text + 2D rather than hang.
    const failedGl = await browser.newContext({ viewport: { width: 1100, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await failedGl.addInitScript(({ prefs }) => localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify(prefs)), { prefs });
    const fp = await failedGl.newPage(), failedGlErrors = [];
    fp.on('pageerror', (err) => failedGlErrors.push(err.message));
    await fp.route('**/vendor/three/three.module.min.js', (route) => route.abort());
    await fp.goto(`${base}#/theme/T04`); await fp.waitForSelector('#tab-city'); await fp.click('#tab-city');
    await fp.waitForFunction(() => document.querySelector('#lab-T04-L4 .gl-mode-note')?.dataset.k === 'T04.city.2d', null, { timeout: 20000 });
    assert.equal(await fp.locator('#lab-T04-L4 canvas').count(), 0);
    await fp.locator('[data-harappa-stop=platform]').click();
    assert.equal(await fp.locator('.harappa-plan [data-harappa-highlight=platform]').count(), 1);
    assert.match(await fp.locator('[data-harappa-field=unknown]').innerText(), /disputed/i);
    assert.deepEqual(failedGlErrors, []);
    await failedGl.close();
    console.log(JSON.stringify({ theme: 'T04', cases: 3, stops: 6, keyboard: true, mobileWidth: 360, languages: ['en', 'hi', 'both'], localPersistence: true, legacyPredictions: true, deniedStorage: true, firstOpenOffline2d: true, webgl: true, failedThreeFallback: true, raycastSync: true, rapidLifecycle: true, reducedMotion: true, progress: '5/5', darkContrast: true, networkWrites: 0, errors }));
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
  }
})();
