# Test report

Run: 2026-11-13, branch `arena/0edcc242-eduverse`. Environment: Node `v22.22.3`, `jsdom`, and Playwright `1.65.0` driving headless Chromium `153.0.8010.0` (ANGLE + SwiftShader WebGL2 via `tests/launch-browser.cjs`).

## Summary

| Suite | Command | Result |
|---|---|---|
| Architecture & guardrail suite (`tests/architecture.test.mjs` + `tools/verify-architecture.mjs`) | `npm run verify` | **Pass** (`0` cycles, pure `engines/domain/`, `79.0 KB` raw static Home boot across `16` modules, `16/16` isolated themes, `13` preloads, `sw.js` & catalog synced) |
| Engine unit tests (`tests/engines.test.mjs`) | `npm test` | **18 / 18 pass** |
| Lab-spec validation (`tests/labs.test.mjs`) | `npm test` | **7 / 7 pass** |
| Runtime DOM, lazy routing, glossary & HTTP verify (`tests/modules-dom.test.mjs`) | `npm test` | **7 / 7 pass** |
| **Live Chromium Desktop Smoke (`1100 px`, SwiftShader WebGL2)** | `npm run smoke` | **16 / 16 themes (`T01`–`T16`) pass** — `NO ERRORS`, `problems: []`, `hOverflowPx: 0` across all tabs (`6`–`12` tabs per theme), controls, and `hi`/`en`/`both` switches |
| **Live Chromium Mobile Touch Smoke (`360 px`, `hasTouch: true`)** | `npm run smoke:mobile` | **16 / 16 themes (`T01`–`T16`) pass** — `NO ERRORS`, `problems: []`, `hOverflowPx: 0` (`184.4 s` end-to-end) |
| **Live Chromium Accessibility & Touch Targets (`390 px`)** | `npm run a11y` | **16 / 16 themes (`T01`–`T16`) pass** (`19.3 s`) — `tabKeyboard: true`, `unlabelledSvg: 0`, `unlabelledRanges: 0`, `smallTargets: 0` (`>= 44 px`), `liveRegions >= 3`, `reducedMotionHonoured: true` |
| **Live Chromium Home / Bridge / Portfolio Routes (`1100 px` & `360 px`)** | custom Playwright check | **Pass** — Hero 3D WebGL canvas, `#/bridge` India SVG map, `#/portfolio` CG bars all render cleanly with `0` console/page errors and `0 px` horizontal overflow |
| **Payload & Network Audit** | `npm run perf:size` | **Pass** — Home (`39` reqs), `T02`–`T16`, and `T02+3D tab` measured (see `docs/PERFORMANCE_AUDIT.md`) |
| **CDP Slow-Network + 6× CPU Throttle + Offline SW** | `npm run perf:throttle` | **Pass** — `home` usable in `4.4 s`; `T09` `8.9 s` (`14.9 ms` input); `T16` `8.7 s` (`10.8 ms`); `T11` `9.9 s` (`29.0 ms`); offline SW caches `117` entries (`homeLoads: true`, `labLoads: true`, `labInteractive: true`) |
| Catalogue & Service Worker manifests | `npm run catalog && npm run sw` | **78 / 78** LOs implemented & QA-passed, **79** simulations, **116** precached runtime files (`117` entries in `sw.js`) |

## Bug Caught & Fixed by Live Chromium Smoke

- **`T08.L1` (`src/modules/economics/t08-specs.js`)**: Live Chromium `lab-smoke.cjs` flagged `CONSOLE Error: <rect> attribute width: A negative value is not valid` when the user overspent above `₹100` in the stacked budget bar SVG. Fixed by clamping remaining bar width with `Math.max(0, 592 - (x - 24))`; verified `0` console errors afterward across both `1100 px` and `360 px` runs.
- **Browser Test Infrastructure (`tests/launch-browser.cjs`, `tests/*.cjs`)**: Added `playwright` + `@sparticuz/chromium` to `devDependencies` with automatic binary fallback (explicit env → native Playwright binary → system browser → `@sparticuz/chromium` + `al2023` libs), Node 22 `content-type` fallback on inline static servers, and visible-tab walking in `tests/lab-smoke.cjs` so nested lab/dock tabs are exercised cleanly after lazy module mounting.

## Remaining Non-Sandbox Checks

- Subject-teacher review of Hindi translations (`draft-needs-teacher-review`) and domain expert sign-off on illustrative datasets.
- Telemetry on physical low-end Android hardware, real mobile cellular networks, and physical WebXR headsets.
- Note: `@sparticuz/chromium` ships Liberation/OpenSans fonts without Noto Devanagari glyphs, so while all Devanagari Hindi strings are verified present in the DOM (`en`/`hi`/`both`), visual glyph shaping in Chromium screenshots requires system Devanagari fonts installed on the host OS.

## Reproducing

```bash
npm ci
npm run verify
npm run a11y
npm run smoke
npm run smoke:mobile
npm run perf:size
npm run perf:throttle
```
