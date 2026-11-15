// Real-browser T03 regression: diary, mechanism/map sync, accessibility, persistence and offline use.
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

(async () => {
  let browser;
  try {
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    browser = await launchChromium();
    const base = `http://127.0.0.1:${server.address().port}/`;
    const context = await browser.newContext({ viewport: { width: 360, height: 950 }, hasTouch: true, isMobile: true, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await context.addInitScript(() => {
      if (!sessionStorage.getItem('eduverse-t03-test')) {
        sessionStorage.setItem('eduverse-t03-test', '1');
        localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ lang: 'en', sound: false, lowGraphics: true, reducedMotion: true }));
      }
    });
    const page = await context.newPage(), errors = [], writes = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('request', (req) => { if (!['GET', 'HEAD'].includes(req.method())) writes.push(`${req.method()} ${req.url()}`); });
    await page.goto(`${base}#/theme/T03`);
    await page.waitForSelector('#tab-T03-L2', { timeout: 15000 });
    await page.click('#tab-T03-L2');
    const diary = page.locator('.weather-diary');
    const field = (name) => diary.locator(`[data-diary-field="${name}"]`);
    const day = (n) => diary.locator(`[data-diary-day="${n}"]`);
    const summary = (name) => diary.locator(`[data-diary-summary="${name}"]`);
    assert.equal(await diary.locator('.weather-day').count(), 7);
    assert.match(await diary.locator('#diary-progress-label').innerText(), /0\/7/);
    assert.match(await summary('rain').innerText(), /Rain seen: 0.*Not seen: 0.*Not recorded: 7/);
    assert.match(await summary('temperature').innerText(), /not recorded/i);
    assert.equal(await diary.locator('input, select, textarea').evaluateAll((els) => els.filter((e) => !e.labels?.length).length), 0, 'all diary fields have labels');
    for (const el of await diary.locator('button, input, select, textarea').all()) {
      const box = await el.boundingBox();
      if (box) assert.ok(box.height >= 43.5 && box.width >= 43.5, 'visible diary controls should be touch-sized');
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2);

    await diary.locator('[data-diary-place]').fill('Patna');
    await field('date').fill('2024-02-28');
    await field('time').fill('08:00');
    await field('sky').selectOption('clear');
    await field('rain').selectOption('not-seen');
    await field('wind').selectOption('breezy');
    await field('temperature').fill('0');
    assert.match(await diary.locator('#diary-progress-label').innerText(), /1\/7/);
    assert.match(await summary('rain').innerText(), /Rain seen: 0.*Not seen: 1.*Not recorded: 6/);
    assert.match(await summary('temperature').innerText(), /0–0 °C/);
    assert.match(await day(1).innerText(), /N/);
    await day(2).focus(); await page.keyboard.press('Enter');
    assert.equal(await day(2).getAttribute('aria-pressed'), 'true');
    await field('date').fill('2024-02-29');
    await field('rain').selectOption('seen');
    await field('temperature').fill('34.5');
    assert.match(await diary.locator('#diary-progress-label').innerText(), /2\/7/);
    assert.match(await summary('rain').innerText(), /Rain seen: 1.*Not seen: 1.*Not recorded: 5/);
    assert.match(await summary('temperature').innerText(), /0–34.5 °C/);
    await day(3).click();
    await field('date').fill('2024-03-02');
    assert.match(await summary('dates').innerText(), /do not match seven consecutive/i);
    assert.match(await diary.locator('#diary-progress-label').innerText(), /2\/7/, 'a date alone is not an observation');
    await field('date').fill('2024-03-01');
    assert.match(await summary('dates').innerText(), /do not conflict/i);
    await day(1).click();
    await field('temperature').fill('70');
    assert.equal(await field('temperature').getAttribute('aria-invalid'), 'true');
    assert.ok(await diary.locator('#diary-temp-error').isVisible());
    assert.match(await summary('temperature').innerText(), /34.5–34.5 °C/, 'out-of-range values are excluded');
    await field('temperature').fill('0');
    assert.equal(await field('temperature').getAttribute('aria-invalid'), 'false');
    await field('rain').selectOption('');
    assert.match(await summary('rain').innerText(), /Not seen: 0.*Not recorded: 6/, 'clearing an observation does not turn it into no rain');
    await field('rain').selectOption('not-seen');
    await diary.locator('[data-diary-reflection]').fill('One week shows weather, not climate.');

    // Language switches re-label live controls without discarding or translating student entries.
    await page.click('#topbar [data-lang=hi]');
    assert.match(await diary.innerText(), /सात दिनों की मौसम डायरी/);
    assert.match(await field('rain').locator('option:checked').innerText(), /वर्षा नहीं दिखी/);
    assert.equal(await field('temperature').inputValue(), '0');
    assert.equal(await diary.locator('[data-diary-place]').inputValue(), 'Patna');
    await page.click('#topbar [data-lang=both]');
    assert.match(await diary.locator('.weather-title').innerText(), /seven-day weather diary/i);
    assert.match(await diary.locator('.weather-title').innerText(), /सात दिनों/);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2);
    await page.click('#topbar [data-lang=en]');
    await page.reload();
    await page.waitForSelector('.weather-diary');
    assert.equal(await page.locator('#tab-T03-L2').getAttribute('aria-selected'), 'true');
    assert.equal(await field('date').inputValue(), '2024-02-28');
    assert.equal(await field('rain').inputValue(), 'not-seen');
    assert.equal(await field('temperature').inputValue(), '0');
    assert.equal(await diary.locator('[data-diary-reflection]').inputValue(), 'One week shows weather, not climate.');
    await page.locator('#lab-T03-L2 .lab-side .btn').filter({ hasText: /^Reset/ }).click();
    assert.equal(await field('rain').inputValue(), 'not-seen', 'model Reset does not delete the diary');
    const climateLab = page.locator('#lab-T03-L2'), table = climateLab.locator('.climate-data');
    await table.locator('summary').click();
    assert.equal(await table.locator('tbody tr').count(), 12);
    assert.match(await table.locator('caption').innerText(), /Mumbai.*Jaipur/);
    assert.deepEqual(await table.locator('tbody tr').first().locator('td').allTextContents(), ['1', '24', '15']);
    await climateLab.locator('.lab-side .chips').nth(0).locator('[data-id=chennai]').click();
    assert.ok(await table.evaluate((el) => el.open), 'the table remains open while the model changes');
    assert.match(await table.locator('caption').innerText(), /Chennai.*Jaipur/);
    assert.deepEqual(await table.locator('tbody tr').first().locator('td').allTextContents(), ['24', '25', '15']);
    await climateLab.locator('.lab-side .chips').nth(1).locator('[data-id=leh]').click();
    assert.deepEqual(await table.locator('tbody tr').first().locator('td').allTextContents(), ['24', '25', '-7']);
    await page.click('#topbar [data-lang=hi]');
    assert.match(await table.locator('caption').innerText(), /चेन्नई.*लेह/);
    assert.ok(await table.evaluate((el) => el.open), 'language changes do not collapse the table');
    await page.click('#topbar [data-lang=both]');
    assert.match(await table.locator('tbody tr').first().innerText(), /January/);
    assert.match(await table.locator('tbody tr').first().innerText(), /जनवरी/);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2, 'the table scrolls internally on a narrow screen');
    await page.click('#topbar [data-lang=en]');

    // Four inquiry stages and all other ways of changing the existing map stay in sync.
    await page.click('#tab-T03-L3');
    const inquiry = page.locator('.monsoon-inquiry'), lab = page.locator('#lab-T03-L3');
    const step = (id) => inquiry.locator(`[data-monsoon-step="${id}"]`);
    const modelSeason = (id) => lab.locator(`.lab-side [data-id="${id}"]`);
    const arrows = lab.locator('.geomap [data-monsoon-arrow]');
    assert.equal(await step('heat').getAttribute('aria-pressed'), 'true');
    assert.equal(await arrows.count(), 2);
    await step('crossing').focus(); await page.keyboard.press('Space');
    assert.match(await inquiry.locator('[data-monsoon-detail]').innerText(), /Coriolis/);
    assert.equal(await modelSeason('sw').getAttribute('aria-checked'), 'true');
    await step('branches').click();
    assert.match(await inquiry.locator('[data-monsoon-detail]').innerText(), /Western Ghats[\s\S]*Bihar/);
    await step('retreat').click();
    assert.equal(await modelSeason('ne').getAttribute('aria-checked'), 'true');
    assert.equal(await arrows.count(), 1);
    assert.match(await inquiry.locator('[data-monsoon-detail]').innerText(), /Tamil Nadu[\s\S]*Bihar/);
    await modelSeason('sw').click();
    assert.equal(await step('heat').getAttribute('aria-pressed'), 'true', 'map control updates inquiry');
    // Low-graphics mode deliberately hides illustration pins; turn it off to exercise the real pin.
    await page.click('#topbar .settings-menu > summary');
    await page.click('#topbar [data-pref=lowGraphics]');
    await lab.locator('.plate-spot').nth(1).click();
    assert.equal(await step('retreat').getAttribute('aria-pressed'), 'true', 'map pin updates inquiry');
    await page.click('#topbar .settings-menu > summary');
    await page.click('#topbar [data-pref=lowGraphics]');
    await lab.locator('.lab-side .btn').filter({ hasText: /^Reset/ }).click();
    assert.equal(await step('heat').getAttribute('aria-pressed'), 'true', 'model Reset updates inquiry');
    const prediction = lab.locator('.predict').filter({ hasText: 'Which comparison of Bihar and Tamil Nadu' });
    await prediction.locator('.opt').filter({ hasText: 'Bihar generally gets much rain' }).click();
    assert.match(await prediction.locator('.feedback').innerText(), /not rainfall data or a forecast/i);
    assert.equal(await step('retreat').getAttribute('aria-pressed'), 'true', 'prediction updates inquiry');
    await page.click('#topbar [data-lang=hi]');
    assert.match(await inquiry.locator('[data-monsoon-detail]').innerText(), /तमिलनाडु/);
    assert.match(await lab.locator('.geomap').getAttribute('aria-label'), /मानचित्र/);
    await page.click('#topbar [data-lang=both]');
    assert.match(await inquiry.locator('[data-monsoon-detail]').innerText(), /Tamil Nadu/);
    assert.match(await inquiry.locator('[data-monsoon-detail]').innerText(), /तमिलनाडु/);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2);
    await page.click('#topbar [data-lang=en]');
    await step('crossing').click(); // Saved prediction must not rerun and change this model on reload.
    await page.reload();
    await page.waitForSelector('.monsoon-inquiry');
    assert.equal(await step('crossing').getAttribute('aria-pressed'), 'true');
    assert.equal(await modelSeason('sw').getAttribute('aria-checked'), 'true');
    assert.match(await prediction.locator('.feedback').innerText(), /not rainfall data or a forecast/i);
    await page.click('#tab-T03-L2');
    assert.equal(await field('rain').inputValue(), 'not-seen');
    await day(2).click();
    assert.equal(await field('rain').inputValue(), 'seen');
    assert.equal(await field('date').inputValue(), '2024-02-29');
    await day(3).click();
    await field('sky').selectOption('partly');
    for (let n = 4; n <= 7; n++) {
      await day(n).click();
      await field('date').fill(`2024-03-0${n - 2}`);
      await field('sky').selectOption('cloudy');
    }
    assert.match(await diary.locator('#diary-progress-label').innerText(), /7\/7/);
    assert.match(await summary('dates').innerText(), /all seven dates are consecutive/i);
    // Route away and return: component teardown must not discard or overwrite the seven days.
    await page.goto(base);
    await page.waitForSelector('#main .card[data-theme=T03]');
    await page.goto(`${base}#/theme/T03`);
    await page.waitForSelector('.weather-diary');
    assert.match(await diary.locator('#diary-progress-label').innerText(), /7\/7/);
    await day(2).click();
    assert.equal(await field('rain').inputValue(), 'seen');
    await diary.locator('[data-diary-clear]').click();
    assert.ok(await diary.locator('[data-diary-confirm-clear]').isVisible());
    await diary.locator('.weather-confirm button').filter({ hasText: 'Cancel' }).click();
    assert.equal(await field('rain').inputValue(), 'seen');
    await diary.locator('[data-diary-clear]').click();
    await diary.locator('[data-diary-confirm-clear]').click();
    assert.equal(await diary.locator('[data-diary-place]').inputValue(), '');
    assert.equal(await field('rain').inputValue(), '');
    assert.match(await summary('rain').innerText(), /Not recorded: 7/);
    await page.reload();
    await page.waitForSelector('.weather-diary');
    assert.equal(await field('rain').inputValue(), '');
    assert.match(await summary('rain').innerText(), /Not recorded: 7/);
    assert.deepEqual(errors, []);
    assert.deepEqual(writes, [], 'diary input stays local and must not submit network writes');
    await context.close();

    // Visit only the shell online; the newly added T03 code is precached and works when first opened offline.
    const offline = await browser.newContext({ viewport: { width: 360, height: 950 }, reducedMotion: 'reduce' });
    await offline.addInitScript(() => {
      if (!sessionStorage.getItem('eduverse-t03-offline')) {
        sessionStorage.setItem('eduverse-t03-offline', '1');
        localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ lang: 'hi', sound: false, lowGraphics: true }));
      }
    });
    const offPage = await offline.newPage(), offErrors = [];
    offPage.on('pageerror', (err) => offErrors.push(err.message));
    await offPage.goto(base);
    await offPage.evaluate(() => navigator.serviceWorker.ready);
    await offPage.reload();
    await offline.setOffline(true);
    await offPage.goto(`${base}#/theme/T03`);
    await offPage.reload();
    await offPage.waitForSelector('#tab-T03-L2', { timeout: 15000 });
    await offPage.click('#tab-T03-L2');
    await offPage.locator('[data-diary-field=rain]').selectOption('seen');
    assert.match(await offPage.locator('[data-diary-summary=rain]').innerText(), /वर्षा दिखी: 1/);
    await offPage.locator('.climate-data summary').click();
    assert.equal(await offPage.locator('.climate-data tbody tr').count(), 12);
    assert.match(await offPage.locator('.climate-data tbody tr').first().innerText(), /जनवरी/);
    await offPage.click('#tab-T03-L3');
    await offPage.locator('[data-monsoon-step=retreat]').click();
    assert.match(await offPage.locator('[data-monsoon-detail]').innerText(), /तमिलनाडु/);
    await offPage.reload();
    await offPage.waitForSelector('.monsoon-inquiry');
    await offPage.click('#tab-T03-L2');
    assert.equal(await offPage.locator('[data-diary-field=rain]').inputValue(), 'seen');
    await offPage.evaluate(() => document.fonts.ready);
    assert.ok(await offPage.evaluate(() => [...document.fonts].some((f) => f.family === 'Noto Sans Devanagari' && f.status === 'loaded')));
    assert.deepEqual(offErrors, []);
    await offline.close();

    // A denied storage write must never be advertised as a durable save.
    const blocked = await browser.newContext({ viewport: { width: 1100, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await blocked.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { configurable: true, value: {
        getItem: () => JSON.stringify({ lang: 'en', sound: false, lowGraphics: true }),
        setItem: () => { throw new DOMException('Storage blocked', 'SecurityError'); },
      } });
    });
    const blockedPage = await blocked.newPage();
    await blockedPage.goto(`${base}#/theme/T03`);
    await blockedPage.waitForSelector('#tab-T03-L2');
    await blockedPage.click('#tab-T03-L2');
    await blockedPage.locator('[data-diary-field=rain]').selectOption('seen');
    assert.match(await blockedPage.locator('[data-diary-storage]').innerText(), /temporary.*lost/i);
    await blockedPage.reload();
    await blockedPage.waitForSelector('#tab-T03-L2');
    await blockedPage.click('#tab-T03-L2');
    assert.equal(await blockedPage.locator('[data-diary-field=rain]').inputValue(), '');
    await blocked.close();

    // Dark-mode bilingual selected text should remain legible, not inherit muted dark text on blue.
    const desktop = await browser.newContext({ viewport: { width: 1100, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce', colorScheme: 'dark' });
    await desktop.addInitScript(() => localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ lang: 'both', sound: false, lowGraphics: true })));
    const desktopPage = await desktop.newPage();
    await desktopPage.goto(`${base}#/theme/T03`);
    await desktopPage.waitForSelector('#tab-T03-L3');
    await desktopPage.click('#tab-T03-L3');
    const colors = await desktopPage.locator('[data-monsoon-step=heat]').evaluate((el) => ({
      bg: getComputedStyle(el).backgroundColor,
      hi: getComputedStyle(el.querySelector('.hi-line')).color,
      en: getComputedStyle(el.querySelector('[lang=en]')).color,
    }));
    assert.equal(colors.hi, colors.en, 'selected Hindi text should inherit selected English text colour');
    const luminance = (rgb) => {
      const channels = rgb.match(/\d+/g).slice(0, 3).map((n) => Number(n) / 255).map((c) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    };
    const [light, dark] = [luminance(colors.bg), luminance(colors.hi)].sort((a, b) => b - a);
    assert.ok((light + 0.05) / (dark + 0.05) >= 4.5, 'selected bilingual text has at least 4.5:1 contrast');
    assert.ok(await desktopPage.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2);
    await desktop.close();
    console.log(JSON.stringify({ theme: 'T03', diarySlots: 7, rainMissingDistinct: true, dateValidation: true, keyboard: true, languages: ['en', 'hi', 'both'], mobileWidth: 360, reloadAndClear: true, climateTable: true, mapSync: ['steps', 'controls', 'pins', 'reset', 'prediction'], firstOpenOffline: true, storageBlocked: true, noNetworkWrites: true, darkMode: true, errors }));
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
  }
})();
