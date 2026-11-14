// Targeted real-browser regression for the T02 India atlas, language, gallery and progress.
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
    browser = await launchChromium({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const context = await browser.newContext({ viewport: { width: 360, height: 950 }, hasTouch: true, isMobile: true, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await context.addInitScript(() => {
      if (!sessionStorage.getItem('eduverse-t02-test')) {
        sessionStorage.setItem('eduverse-t02-test', '1');
        localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ lang: 'en', sound: false, lowGraphics: true, reducedMotion: true }));
      }
    });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    const base = `http://127.0.0.1:${server.address().port}/`;
    await page.goto(`${base}#/theme/T02`);
    await page.waitForSelector('#module #tab-L5', { timeout: 15000 });
    await page.click('#module #tab-L5');
    const lab5 = page.locator('#lab-T02-L5'), atlas = lab5.locator('.india-atlas');
    await page.waitForFunction(() => document.querySelector('[data-atlas-map]')?.dataset.geodata === 'loaded');
    assert.equal(await atlas.locator('[data-atlas-marker]').count(), 8);
    assert.equal(await atlas.locator('.atlas-choice').count(), 7);
    assert.ok((await atlas.locator('svg[role=img]').getAttribute('aria-label')).includes('Map of India'));

    await atlas.locator('[data-region=himalaya]').click();
    assert.equal(await atlas.locator('[data-region=himalaya]').getAttribute('aria-pressed'), 'true');
    assert.equal(await lab5.locator('.lab-side [data-id=glacier]').getAttribute('aria-checked'), 'true');
    assert.match(await atlas.locator('.atlas-detail').innerText(), /collision/i);
    await atlas.locator('[data-region=thar]').focus();
    await page.keyboard.press('Space');
    assert.equal(await atlas.locator('[data-region=thar]').getAttribute('aria-pressed'), 'true');
    assert.equal(await lab5.locator('.lab-side [data-id=wind]').getAttribute('aria-checked'), 'true');
    await atlas.locator('[data-region=meghalaya]').click();
    assert.equal(await lab5.locator('.lab-side [data-id=groundwater]').getAttribute('aria-checked'), 'true');
    await atlas.locator('[data-region=islands]').click();
    assert.equal(await atlas.locator('[data-atlas-marker=islands]').count(), 2);
    assert.equal(await lab5.locator('.lab-side [data-id=waves]').getAttribute('aria-checked'), 'true');
    assert.match(await atlas.locator('.atlas-detail').innerText(), /coral/i);
    assert.match(await atlas.locator('.atlas-detail').innerText(), /subduction/i);
    await lab5.locator('.lab-side [data-id=wind]').click();
    assert.match(await atlas.locator('.atlas-gallery-changed').innerText(), /different agent/i);
    await page.reload();
    await page.waitForSelector('#module #tab-L5');
    await page.click('#module #tab-L5');
    assert.equal(await atlas.locator('[data-region=islands]').getAttribute('aria-pressed'), 'true');
    assert.equal(await lab5.locator('.lab-side [data-id=wind]').getAttribute('aria-checked'), 'true');
    assert.match(await atlas.locator('.atlas-gallery-changed').innerText(), /different agent/i, 'a changed gallery is apparent on return');
    await atlas.locator('[data-region=islands]').click();
    assert.equal(await lab5.locator('.lab-side [data-id=waves]').getAttribute('aria-checked'), 'true');
    assert.equal(await atlas.locator('.atlas-gallery-changed').count(), 0, 'choosing the region restores the matching gallery');
    for (const button of await atlas.locator('.atlas-choice').all()) {
      const box = await button.boundingBox();
      assert.ok(box && box.height >= 44 && box.width >= 44, 'atlas regions must be touch-sized');
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 2, 'atlas should fit a narrow screen');

    await page.click('#topbar [data-lang=hi]');
    assert.match(await atlas.locator('.atlas-detail').innerText(), /लक्षद्वीप/);
    assert.match(await atlas.locator('svg[role=img]').getAttribute('aria-label'), /मानचित्र/);
    await page.evaluate(() => document.fonts.ready);
    assert.ok(await page.evaluate(() => [...document.fonts].some((f) => f.family === 'Noto Sans Devanagari' && f.status === 'loaded')), 'bundled Hindi font loads even without system fonts');
    await page.click('#topbar [data-lang=both]');
    const both = await atlas.locator('.atlas-detail').innerText();
    assert.match(both, /Lakshadweep/);
    assert.match(both, /लक्षद्वीप/);
    await page.click('#topbar [data-lang=en]');
    await page.reload();
    await page.waitForSelector('#module #tab-L5');
    await page.click('#module #tab-L5');
    assert.equal(await atlas.locator('[data-region=islands]').getAttribute('aria-pressed'), 'true', 'atlas choice survives reload');
    assert.equal(await lab5.locator('.lab-side [data-id=waves]').getAttribute('aria-checked'), 'true', 'gallery choice survives reload');

    await page.click('#module #tab-boundary');
    const everest = page.locator('#panel-boundary .predict').filter({ hasText: 'Marine fossils occur' });
    await everest.locator('.opt').filter({ hasText: 'Ancient marine sediments became rock' }).click();
    assert.match(await everest.locator('.feedback').innerText(), /fossil-bearing limestone/i);
    assert.match(await everest.locator('.feedback').innerText(), /does not calculate/i);
    assert.equal(await page.locator('#panel-boundary .chips [data-id=conv-cc]').getAttribute('aria-checked'), 'true');
    assert.equal(await page.locator('#pb-time').inputValue(), '45');
    await page.locator('#pb-time').evaluate((el) => { el.value = '21'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.reload();
    await page.waitForSelector('#panel-boundary .predict .feedback.ok');
    assert.match(await everest.locator('.feedback').innerText(), /fossil-bearing limestone/i, 'fossil explanation is available on return');
    assert.equal(await page.locator('#pb-time').inputValue(), '21', 'restoring the prediction does not rerun the model');

    // A selected plate's India-specific readout also follows the language switch.
    await page.click('#module #tab-map');
    const india = page.locator('#panel-map .worldmap [data-code=IN]');
    await india.waitFor();
    await india.focus();
    await page.keyboard.press('Enter');
    assert.match(await page.locator('#panel-map .lab-main .readout').innerText(), /India is part of this plate/);
    await page.click('#topbar [data-lang=hi]');
    assert.match(await page.locator('#panel-map .lab-main .readout').innerText(), /भारत इस प्लेट का भाग है/);
    await page.click('#topbar [data-lang=en]');

    async function solve(stem, answer) {
      const q = page.locator('.mcq').filter({ hasText: stem });
      await q.locator('.opt').filter({ hasText: answer }).first().click();
      assert.ok(await q.locator('.feedback.ok').isVisible(), `correct feedback for ${stem}`);
    }
    await solve('Which boundary type best explains', 'Two continental plates colliding');
    await solve('Which layer of the Earth is liquid', 'Outer core');
    await solve('A plate moves 4 cm per year', '400 km');
    await solve('The fertile Northern Plains of India', 'Rivers — Ganga');
    assert.equal(await page.locator('.chapter-done').isVisible(), false);
    await page.click('#module #tab-L4');
    const l4 = page.locator('#lab-T02-L4');
    await l4.locator('[role=tab]').filter({ hasText: 'Quick Quiz' }).click();
    await solve('Which statement correctly separates', 'Weathering breaks rock down in place');
    assert.equal(await page.locator('.chapter-done').isVisible(), false);
    await page.click('#module #tab-L5');
    await lab5.locator('[role=tab]').filter({ hasText: 'Quick Quiz' }).click();
    await solve('Barchan sand dunes', 'Wind deposition');
    assert.equal(await page.locator('.chapter-done').isVisible(), false, 'two L5 answers must not count as two LOs');
    await page.click('#module #tab-L6');
    const l6 = page.locator('#lab-T02-L6');
    await l6.locator('[role=tab]').filter({ hasText: 'Quick Quiz' }).click();
    await solve('What makes a Glacial Lake Outburst Flood', 'An unstable ice/moraine dam');
    assert.equal(await page.locator('.chapter-done').isVisible(), false, 'plate-distance arithmetic cannot stand in for identifying a plate on the map');
    await solve('On the plate map, which plate carries most of India', 'Indian Plate');
    assert.equal(await page.locator('.chapter-done').isVisible(), true, 'completion updates without a reload');
    await page.reload();
    const restoredPlateQuiz = page.locator('.mcq').filter({ hasText: 'On the plate map, which plate carries most of India' });
    await restoredPlateQuiz.waitFor();
    assert.match(await restoredPlateQuiz.locator('.feedback.ok').innerText(), /Most of India lies on the Indian Plate/);
    assert.equal(await restoredPlateQuiz.locator('.opt.right').getAttribute('aria-checked'), 'true');
    assert.equal(await page.locator('.chapter-done').isVisible(), true, 'completion survives reload');
    await page.locator('#main a.back').click();
    await page.waitForSelector('#main .card[data-theme=T02]');
    assert.match(await page.locator('#main .card[data-theme=T02] .card-progress-txt').innerText(), /6\/6 LOs with a correct exit answer/);
    assert.deepEqual(errors, []);
    await context.close();

    // A first online visit installs the service worker; the atlas and Hindi font then load offline.
    const offline = await browser.newContext({ viewport: { width: 360, height: 950 }, reducedMotion: 'reduce' });
    await offline.addInitScript(() => {
      if (!sessionStorage.getItem('eduverse-offline-test')) {
        sessionStorage.setItem('eduverse-offline-test', '1');
        localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ lang: 'hi', sound: false, lowGraphics: true }));
      }
    });
    const offPage = await offline.newPage();
    await offPage.goto(base);
    await offPage.evaluate(() => navigator.serviceWorker.ready);
    await offPage.reload(); // ensure the installed worker controls this document
    await offline.setOffline(true);
    await offPage.goto(`${base}#/theme/T02`);
    await offPage.reload();
    await offPage.waitForSelector('#module #tab-L5', { timeout: 15000 });
    await offPage.click('#module #tab-L5');
    await offPage.waitForFunction(() => document.querySelector('[data-atlas-map]')?.dataset.geodata === 'loaded');
    await offPage.locator('[data-region=islands]').click();
    assert.match(await offPage.locator('.atlas-detail').innerText(), /लक्षद्वीप/);
    await offPage.evaluate(() => document.fonts.ready);
    assert.ok(await offPage.evaluate(() => [...document.fonts].some((f) => f.family === 'Noto Sans Devanagari' && f.status === 'loaded')), 'Hindi font must load offline');
    await offline.close();

    // Exercise the atlas against the actual WebGL gallery, not just its 2D fallback.
    const graphics = await browser.newContext({ viewport: { width: 1100, height: 1000 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await graphics.addInitScript(() => localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify({ lang: 'en', sound: false, lowGraphics: false, reducedMotion: true })));
    const glPage = await graphics.newPage(), glErrors = [];
    glPage.on('pageerror', (err) => glErrors.push(err.message));
    glPage.on('console', (msg) => { if (msg.type() === 'error') glErrors.push(msg.text()); });
    await glPage.goto(`${base}#/theme/T02`);
    await glPage.waitForSelector('#module #tab-L5', { timeout: 15000 });
    await glPage.click('#module #tab-L5');
    await glPage.waitForSelector('#lab-T02-L5 .view3d canvas', { timeout: 20000 });
    const labels = glPage.locator('#lab-T02-L5 .view3d .gl-labels');
    await glPage.locator('[data-region=himalaya]').click();
    await glPage.waitForFunction(() => document.querySelector('#lab-T02-L5 .view3d .gl-labels')?.textContent.includes('U-shaped glacier valley'));
    assert.match(await labels.textContent(), /U-shaped glacier valley/);
    await glPage.locator('[data-region=thar]').click();
    await glPage.waitForFunction(() => document.querySelector('#lab-T02-L5 .view3d .gl-labels')?.textContent.includes('Barchan sand dune'));
    assert.match(await labels.textContent(), /Barchan sand dune/);
    await glPage.click('#module #tab-L6');
    await glPage.click('#module #tab-L5');
    await glPage.waitForSelector('#lab-T02-L5 .view3d canvas', { timeout: 20000 });
    await glPage.waitForFunction(() => document.querySelector('#lab-T02-L5 .view3d .gl-labels')?.textContent.includes('Barchan sand dune'));
    assert.deepEqual(glErrors, []);
    await graphics.close();
    console.log(JSON.stringify({ theme: 'T02', atlasRegions: 7, islandMarkers: 2, mobileWidth: 360, keyboard: true, languages: ['en', 'hi', 'both'], reload: true, fossilStory: true, progress: '6/6', offlineAtlasAndFont: true, gallery3d: true, errors }));
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
  }
})();
