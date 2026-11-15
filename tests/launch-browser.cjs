// Unified headless Chromium launcher for Playwright smoke, a11y, and perf suites.
// Priority:
//   1. CHROMIUM_EXECUTABLE_PATH env override
//   2. Native Playwright Chromium binary (when `npx playwright install chromium` is present)
//   3. @sparticuz/chromium bundled Linux x64 headless binary + al2023 shared libs (container / serverless fallback)
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

function firstExisting(candidates) {
  return candidates.find((p) => p && fs.existsSync(p)) || null;
}

async function launchChromium(extraOpts = {}) {
  const extraArgs = extraOpts.args || [];
  const envExe = process.env.CHROMIUM_EXECUTABLE_PATH;
  if (envExe && fs.existsSync(envExe)) {
    return chromium.launch({ ...extraOpts, executablePath: envExe, args: extraArgs });
  }

  let nativeExe = null;
  try {
    nativeExe = chromium.executablePath();
  } catch {}
  if (nativeExe && fs.existsSync(nativeExe)) {
    return chromium.launch({ ...extraOpts, executablePath: nativeExe, args: extraArgs });
  }

  const sysExe = firstExisting(['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome']);
  if (sysExe) {
    return chromium.launch({ ...extraOpts, executablePath: sysExe, args: extraArgs });
  }

  if (process.platform === 'linux' && process.arch === 'x64') {
    let spPkgPath = null;
    try {
      spPkgPath = require.resolve('@sparticuz/chromium');
    } catch {}
    if (spPkgPath) {
      const spMod = await import('@sparticuz/chromium');
      const sp = spMod.default || spMod;
      const binDir = path.join(path.dirname(spPkgPath), '..', 'bin');
      const alLibDir = path.join(os.tmpdir(), 'al2023', 'lib');
      if (!fs.existsSync(path.join(alLibDir, 'libnspr4.so')) && fs.existsSync(path.join(binDir, 'al2023.tar.br'))) {
        await spMod.inflate(path.join(binDir, 'al2023.tar.br'));
      }
      if (fs.existsSync(alLibDir)) spMod.setupLambdaEnvironment(alLibDir);
      const exe = await sp.executablePath(binDir);
      const baseArgs = process.env.AWS_EXECUTION_ENV
        ? sp.args
        : sp.args.filter((a) => a !== '--single-process' && a !== '--in-process-gpu' && a !== '--no-zygote');
      const mergedArgs = [...new Set([...baseArgs, ...extraArgs])];
      return chromium.launch({
        ...extraOpts,
        executablePath: exe,
        args: mergedArgs,
        headless: true,
      });
    }
  }

  return chromium.launch(extraOpts);
}

module.exports = { launchChromium };
