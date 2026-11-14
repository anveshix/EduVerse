// Network payload per page (raw and gzip bytes) for the home page and each theme, plus the cost of opening the 3D tab in T02.
// usage: node tests/perf-size.cjs   → prints JSON. The built-in server does not compress, so gzip is computed locally (what GitHub Pages sends).
const { launchChromium } = require('./launch-browser.cjs'); const http = require('http'), fs = require('fs'), path = require('path'), zlib = require('zlib');
const root = path.resolve(__dirname, '..'), T = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const srv = http.createServer((q, s) => { let u = q.url.split('?')[0]; if (u.endsWith('/')) u += 'index.html'; fs.readFile(path.join(root, u), (e, d) => { if (e) { s.writeHead(404); s.end(); } else { s.writeHead(200, { 'content-type': T[path.extname(u)] || 'application/octet-stream' }); s.end(d); } }); }).listen(0);
(async () => {
  const port = srv.address().port, b = await launchChromium({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }), res = {};
  const measure = async (label, act) => {
    // Measure on-demand page requests, separate from background service-worker precaching.
    const ctx = await b.newContext({ serviceWorkers: 'block' }), p = await ctx.newPage(), seen = new Map(), pending = new Set();
    p.on('response', (r) => {
      const work = (async () => { try { const u = new URL(r.url()); if (u.port != port) return; const body = await r.body(); seen.set(u.pathname, { raw: body.length, gz: zlib.gzipSync(body, { level: 9 }).length }); } catch {} })();
      pending.add(work); work.finally(() => pending.delete(work));
    });
    await act(p);
    await p.waitForLoadState('networkidle', { timeout: 20000 });
    await p.evaluate(() => document.fonts.ready);
    await Promise.all([...pending]);
    const all = [...seen.values()], sum = (k) => all.reduce((a, x) => a + x[k], 0);
    res[label] = { requests: seen.size, rawKB: +(sum('raw') / 1024).toFixed(1), gzipKB: +(sum('gz') / 1024).toFixed(1), largest: [...seen.entries()].sort((a, c) => c[1].gz - a[1].gz).slice(0, 3).map(([k, v]) => `${k} ${(v.gz / 1024).toFixed(1)}KB gz`) };
    await ctx.close();
  };
  await measure('home', async (p) => { await p.goto(`http://localhost:${port}/`); await p.waitForSelector('.card'); });
  for (const id of ['T02', 'T03', 'T04', 'T06', 'T07', 'T08', 'T09', 'T10', 'T11', 'T13', 'T15', 'T16']) await measure(id, async (p) => { await p.goto(`http://localhost:${port}/#/theme/${id}`); await p.waitForSelector('#module .lab', { timeout: 15000 }); });
  await measure('T02+3D tab', async (p) => { await p.goto(`http://localhost:${port}/#/theme/T02`); await p.waitForSelector('#module #tab-boundary'); await p.click('#module #tab-boundary'); await p.waitForSelector('#panel-boundary .view3d canvas', { timeout: 20000 }); });
  await measure('T02+atlas+3D gallery', async (p) => {
    await p.goto(`http://localhost:${port}/#/theme/T02`);
    await p.waitForSelector('#module #tab-L5');
    await p.click('#module #tab-L5');
    await p.waitForFunction(() => document.querySelector('[data-atlas-map]')?.dataset.geodata === 'loaded');
    await p.waitForSelector('#lab-T02-L5 .view3d canvas', { timeout: 20000 });
  });
  console.log(JSON.stringify(res, null, 1)); await b.close(); srv.close();
})();
