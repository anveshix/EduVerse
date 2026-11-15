import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const builder = fileURLToPath(new URL('../tools/build-sw.mjs', import.meta.url));

test('service-worker cache version changes for same-length content edits', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eduverse-sw-'));
  try {
    fs.mkdirSync(path.join(dir, 'assets', 'css'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), 'home');
    const css = path.join(dir, 'assets', 'css', 'app.css');
    fs.writeFileSync(css, 'color:red;');
    const build = () => {
      execFileSync(process.execPath, [builder], { cwd: dir });
      return fs.readFileSync(path.join(dir, 'sw.js'), 'utf8').match(/const CACHE = 'eduverse-([a-f0-9]+)'/)?.[1];
    };
    const first = build();
    assert.ok(first);
    assert.equal(build(), first, 'identical files keep a stable version');
    fs.writeFileSync(css, 'color:tan;'); // same length as color:red;
    assert.notEqual(build(), first, 'same-size changes must create a fresh cache');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
