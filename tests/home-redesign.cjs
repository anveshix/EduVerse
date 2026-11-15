// Browser regression for the EduVerse shell, subject library and home globe.
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
async function seed(context, data = prefs) {
  await context.addInitScript((state) => {
    if (!sessionStorage.getItem('eduverse-home-test')) {
      sessionStorage.setItem('eduverse-home-test', '1');
      localStorage.setItem('eduverse.ix.ss.v1', JSON.stringify(state));
    }
  }, data);
}
async function visibleThemes(page) {
  return page.locator('.catalog-section .card:visible').evaluateAll((els) => els.map((el) => el.dataset.theme));
}
async function overflow(page) { return page.evaluate(() => document.documentElement.scrollWidth - innerWidth); }

// Project the actual longitude/latitude through the same initial perspective as the scene.
// The assertions still use a real pointer click and Three.js raycasting, not a synthetic pick.
async function projectedPoint(canvas, lat, lon, az = 0.5) {
  return canvas.evaluate(async (c, { lat, lon, az }) => {
    const THREE = await import('/vendor/three/three.module.min.js');
    const { width, height } = c.getBoundingClientRect();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 200);
    const r = 14.4, pol = 1.16;
    camera.position.set(r * Math.sin(pol) * Math.sin(az), r * Math.cos(pol), r * Math.sin(pol) * Math.cos(az));
    camera.lookAt(0, 0, 0); camera.updateMatrixWorld(); camera.updateProjectionMatrix();
    const phi = (lon + 180) * Math.PI / 180, theta = (90 - lat) * Math.PI / 180;
    const point = new THREE.Vector3(-Math.cos(phi) * Math.sin(theta), Math.cos(theta), Math.sin(phi) * Math.sin(theta))
      .multiplyScalar(4.16).applyAxisAngle(new THREE.Vector3(0, 1, 0), -2.4);
    const facing = point.dot(camera.position);
    const p = point.project(camera);
    return { x: width * (p.x + 1) / 2, y: height * (1 - p.y) / 2, facing };
  }, { lat, lon, az });
}

(async () => {
  let browser;
  try {
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}/`;
    browser = await launchChromium({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

    // Real 3D rendering, picking, camera controls, motion and library interactions.
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await seed(context, { ...prefs, progress: { T02: { visited: true, predictions: {}, exit: { e5: { ok: true } }, cbq: {}, reflection: '' } }, stars: { example: true } });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const textureResponse = page.waitForResponse((r) => r.url().endsWith('/assets/images/globe-world.svg') && r.ok());
    await page.goto(`${base}#/`); await page.waitForSelector('.hero-gl canvas', { timeout: 20000 });
    await textureResponse; await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(350);
    const canvas = page.locator('.hero-gl canvas');
    assert.equal(await page.locator('.card').count(), 16);
    assert.equal(await page.locator('.hero-stat strong').nth(1).innerText(), '78');
    assert.equal(await page.locator('.continue-btn').getAttribute('href'), '#/theme/T02');
    assert.equal(await page.locator('.hud-stars-n').innerText(), '1');
    assert.match(await page.locator('.card[data-theme=T02] [role=progressbar]').getAttribute('aria-label'), /1\/6/);
    assert.equal(await page.locator('.path-progress').getAttribute('aria-valuenow'), '1');
    assert.ok(await overflow(page) <= 1);
    assert.match(await canvas.getAttribute('aria-label'), /approximate locations/i);

    for (const [lat, lon, theme] of [[28, 84, 'T02'], [5, 82, 'T10'], [43, 66, 'T13']]) {
      const p = await projectedPoint(canvas, lat, lon);
      assert.ok(p.facing > 4.16 ** 2, 'the marker is on the visible hemisphere');
      await canvas.click({ position: { x: p.x, y: p.y } });
      assert.equal(await page.locator('.hero-pin-pill').getAttribute('href'), `#/theme/${theme}`);
      assert.ok(await page.locator('.hero-pin-pill').isVisible());
    }
    await page.click('#topbar [data-lang=hi]');
    assert.match(await page.locator('.hero-pin-pill').innerText(), /व्यापार मार्ग/);
    assert.match(await page.locator('.home-search').getAttribute('placeholder'), /विषय खोजें/);
    assert.match(await page.locator('.card[data-theme=T02] [role=progressbar]').getAttribute('aria-label'), /1\/6/);
    assert.match(await page.locator('.skip').innerText(), /मुख्य सामग्री/);
    await page.click('#topbar [data-lang=en]');

    // Reduced motion stops rotation and the live preference can start and stop it without a remount.
    let before = await canvas.screenshot(); await page.waitForTimeout(450); let after = await canvas.screenshot();
    assert.ok(before.equals(after), 'the reduced-motion globe remains still');
    await page.click('#topbar .settings-menu > summary'); await page.click('#topbar [data-pref=reducedMotion]'); await page.keyboard.press('Escape');
    await page.waitForTimeout(250); before = await canvas.screenshot(); await page.waitForTimeout(650); after = await canvas.screenshot();
    assert.equal(before.equals(after), false, 'enabling motion animates the existing globe');
    await page.click('#topbar .settings-menu > summary'); await page.click('#topbar [data-pref=reducedMotion]'); await page.keyboard.press('Escape');
    await page.waitForTimeout(250); before = await canvas.screenshot(); await page.waitForTimeout(450); after = await canvas.screenshot();
    assert.ok(before.equals(after), 'reducing motion pauses the existing globe');

    // A fresh, still globe: keyboard orbit changes the picture; a marker behind the Earth is not clickable through it.
    await page.reload(); await page.waitForSelector('.hero-gl canvas', { timeout: 20000 }); await page.waitForTimeout(300);
    before = await canvas.screenshot(); await canvas.focus();
    for (let i = 0; i < 26; i++) await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(150); after = await canvas.screenshot();
    assert.equal(before.equals(after), false, 'keyboard arrows rotate the camera');
    const hiddenPoint = await projectedPoint(canvas, 28, 84, 0.5 + 26 * 0.12);
    assert.ok(hiddenPoint.facing < 0, 'the Himalaya marker has rotated to the rear');
    await canvas.click({ position: { x: hiddenPoint.x, y: hiddenPoint.y } });
    assert.ok(await page.locator('.hero-pin-pill').isHidden(), 'the surface occludes markers on the far side');

    const search = page.locator('.home-search'), filters = page.locator('.filter-pills');
    await search.fill('monsoon'); assert.deepEqual(await visibleThemes(page), ['T03']);
    assert.match(await page.locator('.catalog-count').innerText(), /1 theme shown/);
    await filters.locator('[data-disc=history]').click();
    assert.equal((await visibleThemes(page)).length, 0); assert.ok(await page.locator('.catalog-empty').isVisible());
    assert.equal(await page.locator('.catalog-section .part:visible').count(), 0);
    await page.locator('.catalog-empty button').click(); assert.equal(await search.inputValue(), '');
    assert.equal((await visibleThemes(page)).length, 16);
    await filters.locator('[data-disc=all]').focus(); await page.keyboard.press('ArrowDown');
    assert.equal(await filters.locator('[data-disc=geography]').getAttribute('aria-checked'), 'true');
    assert.equal(await filters.locator('[data-disc=geography]').evaluate((e) => e === document.activeElement), true);
    await page.keyboard.press('ArrowLeft'); assert.equal(await filters.locator('[data-disc=all]').getAttribute('aria-checked'), 'true');
    await page.click('#topbar [data-lang=hi]'); await search.fill('चुनाव');
    assert.deepEqual(await visibleThemes(page), ['T07']);
    assert.match(await page.locator('.catalog-count').innerText(), /1 विषय/);
    await page.click('#topbar [data-lang=en]'); await search.fill('');
    await page.locator('.card[data-theme=T08]').click(); await page.waitForSelector('.household-budget', { timeout: 15000 });
    await page.locator('.site-nav [data-k="nav.how"]').click();
    await page.waitForSelector('#how-to-learn[open]');
    assert.equal(await page.evaluate(() => document.activeElement === document.querySelector('#how-to-learn summary')), true);
    assert.match(await page.locator('.path-txt').innerText(), /2\/16/);

    // Changing low graphics on the home page preserves scroll and does not duplicate hosts or steal focus.
    await page.locator('#catalog').scrollIntoViewIfNeeded();
    await page.locator('#topbar .settings-menu > summary').click();
    const originalCard = await page.locator('.card[data-theme=T01]').elementHandle();
    await page.locator('#topbar [data-pref=lowGraphics]').click();
    assert.equal(await page.locator('#topbar [data-pref=lowGraphics]').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('.hero-gl').count(), 0);
    assert.ok(await originalCard.evaluate((el) => el === document.querySelector('.card[data-theme=T01]')), 'graphics preference does not reroute home');
    assert.ok(await page.evaluate(() => scrollY > 0), 'changing graphics does not jump back to the top');
    assert.equal(await page.evaluate(() => document.activeElement === document.querySelector('#topbar [data-pref=lowGraphics]')), true);
    await page.locator('#topbar [data-pref=lowGraphics]').click();
    await page.waitForSelector('.hero-gl canvas', { state: 'attached', timeout: 20000 });
    assert.equal(await page.locator('.hero-gl').count(), 1);
    assert.deepEqual(errors, []);
    await context.close();

    // Narrow bilingual, projector and dark layouts keep controls reachable and do not overflow.
    for (const [width, lang, projector, colorScheme] of [[320, 'both', false, 'light'], [360, 'both', true, 'light'], [720, 'both', true, 'light'], [360, 'hi', false, 'dark']]) {
      const mobile = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: true, isMobile: width <= 360, serviceWorkers: 'block', reducedMotion: 'reduce', colorScheme });
      await seed(mobile, { ...prefs, lang, projector, lowGraphics: true });
      const p = await mobile.newPage(), pageErrors = [];
      p.on('pageerror', (err) => pageErrors.push(err.message));
      await p.goto(`${base}?nowebgl=1#/`); await p.waitForSelector('.card'); await p.evaluate(() => document.fonts.ready);
      assert.ok(await overflow(p) <= 1, `no page overflow at ${width}px`);
      assert.equal(await p.locator('.hero-gl canvas').count(), 0);
      assert.equal(await p.locator('.card[data-theme=T01]').evaluate((el) => getComputedStyle(el).display), 'flex', 'low-graphics mobile cards use their full width');
      if (projector) assert.ok(parseFloat(await p.locator('.hero-lead').evaluate((el) => getComputedStyle(el).fontSize)) >= 19.5, 'projector mode enlarges shell copy');
      const small = await p.evaluate(() => [...document.querySelectorAll('#topbar a, #topbar button, #topbar summary, #main button, #main a, #main summary')]
        .filter((el) => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden')
        .map((el) => ({ text: el.textContent.trim().slice(0, 35), w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height }))
        .filter((box) => box.w < 43.5 || box.h < 43.5));
      assert.deepEqual(small, [], `visible shell controls are touch-sized at ${width}px`);
      const settings = p.locator('.settings-menu');
      await settings.locator('summary').focus(); await p.keyboard.press('Enter');
      assert.ok(await settings.evaluate((el) => el.open));
      const box = await settings.locator('.settings-panel').boundingBox();
      assert.ok(box.x >= 0 && box.x + box.width <= width + 1, 'settings panel fits the viewport');
      await p.keyboard.press('Escape');
      assert.equal(await p.evaluate(() => document.activeElement === document.querySelector('.settings-menu summary')), true);
      await p.locator('.mobile-menu summary').focus(); await p.keyboard.press('Enter');
      assert.ok(await p.locator('.mobile-nav-links [data-k="nav.how"]').isVisible());
      await p.locator('.mobile-nav-links [data-k="nav.how"]').click();
      assert.ok(await p.locator('#how-to-learn').evaluate((el) => el.open));
      await p.locator('.skip').focus(); await p.keyboard.press('Enter');
      assert.equal(await p.evaluate(() => document.activeElement.id), 'main');
      assert.equal(new URL(p.url()).hash, '#/', 'skip link does not trigger the hash router');
      assert.deepEqual(pageErrors, []);
      await mobile.close();
    }

    // Forced WebGL fallback still has honest labels and functioning topic links.
    const fallback = await browser.newContext({ viewport: { width: 360, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await seed(fallback); const fp = await fallback.newPage(), fallbackErrors = [];
    fp.on('pageerror', (err) => fallbackErrors.push(err.message));
    await fp.goto(`${base}?nowebgl=1#/`); await fp.waitForSelector('.card');
    assert.equal(await fp.locator('.hero-gl').count(), 0);
    assert.ok(await fp.locator('.hero-art img').isVisible());
    assert.ok(await fp.locator('.globe-hint').isHidden());
    assert.doesNotMatch(await fp.locator('.card[data-theme=T01]').innerText(), /3D Live/i);
    await fp.locator('.globe-shortcuts a[href="#/theme/T10"]').click();
    await fp.waitForSelector('#module .lab', { timeout: 15000 });
    assert.equal(new URL(fp.url()).hash, '#/theme/T10'); assert.deepEqual(fallbackErrors, []);
    await fallback.close();

    // A rejected Three.js download recovers to the image instead of leaving a blank canvas.
    const broken = await browser.newContext({ viewport: { width: 1000, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await seed(broken); const bp = await broken.newPage(), brokenErrors = []; let aborted = 0;
    bp.on('pageerror', (err) => brokenErrors.push(err.message));
    await bp.route('**/vendor/three/three.module.min.js', (route) => { aborted++; return route.abort(); });
    await bp.route('**/assets/images/thumbs/t01.jpg', (route) => route.abort());
    await bp.goto(`${base}#/`); await bp.waitForSelector('.card');
    await bp.waitForFunction(() => !document.querySelector('.hero-gl') && !!document.querySelector('.hero-art img'), null, { timeout: 20000 });
    assert.equal(aborted, 1); assert.ok(await bp.locator('.hero-art img').isVisible());
    assert.equal(await bp.locator('.hero-art img').evaluate((el) => getComputedStyle(el).opacity), '0.72');
    assert.ok(await bp.locator('.globe-hint').isHidden());
    await bp.locator('.card[data-theme=T01]').scrollIntoViewIfNeeded();
    await bp.waitForSelector('.card[data-theme=T01] .media-fallback');
    assert.ok(await bp.locator('.card[data-theme=T01] img').isHidden());
    assert.ok(await bp.locator('.card[data-theme=T01] .card-ico').isVisible(), 'missing thumbnails show a clean icon fallback');
    assert.deepEqual(brokenErrors, []);
    await broken.close();

    // If navigation wins a race with a slow 3D download, the old scene never attaches to the new route.
    const racing = await browser.newContext({ viewport: { width: 1200, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await seed(racing); const rp = await racing.newPage(), raceErrors = [];
    rp.on('pageerror', (err) => raceErrors.push(err.message));
    let release, seen; const gate = new Promise((resolve) => { release = resolve; });
    const requested = new Promise((resolve) => { seen = resolve; });
    await rp.route('**/vendor/three/three.module.min.js', async (route) => { seen(); await gate; await route.continue(); });
    await rp.goto(`${base}#/`);
    await Promise.race([requested, new Promise((_, reject) => setTimeout(() => reject(new Error('3D request was not observed')), 15000))]);
    await rp.evaluate(() => { location.hash = '#/theme/T08'; }); await rp.waitForSelector('.household-budget', { timeout: 15000 });
    release(); await rp.waitForTimeout(600);
    assert.equal(await rp.locator('.hero-gl, .hero-gl canvas').count(), 0);
    await rp.evaluate(() => { location.hash = '#/'; });
    await rp.waitForSelector('.hero-gl canvas', { timeout: 20000 });
    assert.equal(await rp.locator('.hero-gl canvas').count(), 1); assert.deepEqual(raceErrors, []);
    await racing.close();

    // First online visit then offline: shell, fallback photo, font and an interactive lesson are available.
    const offline = await browser.newContext({ viewport: { width: 360, height: 900 }, reducedMotion: 'reduce' });
    await seed(offline, { ...prefs, lang: 'both' }); const op = await offline.newPage(), offlineErrors = [];
    op.on('pageerror', (err) => offlineErrors.push(err.message));
    await op.goto(`${base}?nowebgl=1#/`); await op.waitForSelector('.card'); await op.evaluate(() => navigator.serviceWorker.ready);
    const cached = await op.evaluate(async () => {
      const cache = await caches.open((await caches.keys()).find((key) => key.startsWith('eduverse-')));
      return Promise.all(['assets/images/hero.jpg', 'assets/images/globe-world.svg', 'assets/css/experience.css', 'assets/fonts/noto-sans-devanagari-400.woff2'].map(async (url) => !!(await cache.match(url))));
    });
    assert.deepEqual(cached, [true, true, true, true]);
    await offline.setOffline(true); await op.reload(); await op.waitForSelector('.card', { timeout: 15000 });
    assert.ok(await op.locator('.hero-art img').evaluate((el) => el.complete && el.naturalWidth > 0), 'fallback photo loads offline after the first visit');
    await op.evaluate(() => { location.hash = '#/theme/T08'; }); await op.waitForSelector('.household-budget', { timeout: 15000 });
    const input = op.locator('.household-budget input[type=range]').first();
    const previous = await input.inputValue(); await input.focus(); await op.keyboard.press('ArrowRight');
    assert.notEqual(await input.inputValue(), previous, 'offline lesson controls remain interactive');
    assert.ok(await overflow(op) <= 1); assert.deepEqual(offlineErrors, []);
    await offline.close();

    console.log(JSON.stringify({ home: 'redesigned', themes: 16, actualWebGLPicks: 3, occludedRearMarkers: true, keyboardAndMotion: true, combinedFilters: true, languages: ['en', 'hi', 'both'], responsiveWidths: [320, 360, 720, 1440], projector: true, lowGraphics: true, noWebGL: true, failedThreeFallback: true, raceCleanup: true, firstVisitOffline: true, errors: [] }));
  } catch (err) {
    console.error(err); process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})();
