# EduVerse: Class IX Social Science visualiser (CBSE 087, 2026-27)

Interactive, bilingual (English / हिन्दी / English + हिन्दी) learning labs bound to the CBSE Class IX Social Science syllabus. Static ES modules, no bundler, no backend, no login, no ads, no tracking. Works on GitHub Pages or any static host, and offline after the first visit.

## Run
```
npm run serve        # http://0.0.0.0:4173/ (tools/serve.mjs; any static server works)
npm run verify       # architecture guardrails and Node/DOM tests (Node 20+)
npm run test:home    # Chromium home, navigation, globe and fallback regression
npm run smoke        # Chromium checks of all 16 themes (needs Playwright + Chromium)
npm run a11y         # Chromium accessibility checks T01–T16 (needs Playwright + Chromium)
npm run globe        # rebuild the decorative globe texture from bundled Natural Earth land
npm run catalog      # regenerate docs/CURRICULUM_COVERAGE.json and docs/SIMULATION_CATALOG.json
npm run sw           # regenerate sw.js (offline precache list) after changing files
```

## What is built (honest status)
All **78 of 78 learning objects** across all **16 themes (`T01`–`T16`)** are implemented across **79 interactive simulations**. Exact status per object: `docs/CURRICULUM_COVERAGE.json`; per simulation: `docs/SIMULATION_CATALOG.json`. The coverage manifest records automated browser-smoke QA for all 78 learning objects; that is not a substitute for subject-teacher or human accessibility review.

| Theme | Built Labs |
|---|---|
| T01 Exploring Social Science | L1 Society-Environment-Economy-Governance system map, L2 Indian regional lenses (India map), L3 4-discipline enquiry sorter |
| T02 Shaping of the Earth's Surface | L1 plate map, L2 boundary explorer (3D + SVG), L3 Earth interior, L4 gradation sandbox, L5 3D landform gallery, L6 slope & GLOF hazard lab |
| T03 Atmosphere and Climate | L1 atmosphere layers (ISA 1976), L2 climate grapher (5 Indian stations), L3 Indian monsoon map, L4 coastal breeze, L5 catchment flood balance, L6 carbon footprint |
| T04 Early Humans | L1 deep-time clock, L2 evidence vs inference, L3 forager-to-farmer sim, L4 3D Harappan city planner, L5 river-valley civilisations world map |
| T05 Early Civilisations & Empires | L1 historical geography of India map, L2 Vedic sources room, L3 Sabha/Mahajanapada/Mauryan admin flow, L4 knowledge traditions gallery, L5 trade & guild routes |
| T06 Democracy | L1 democracy audit matrix, L2 Indian democratic roots gallery, L3 parliamentary vs presidential, L4 world constitutional systems map |
| T07 Elections | L1 ECI election process flow, L2 electoral systems, L3 delimitation & voter roll lab, L4 coalition & anti-defection lab |
| T08 Building Blocks in Economics | L1 scarcity budget game, L2 production possibility frontier, L3 circular flow, L4 economic systems matrix, L5 welfare safety net |
| T09 The Price Puzzle | L1 market supply/demand, L2 price ceiling, L3 real-world deviations, L4 externalities, L5 public goods, L6 information asymmetry |
| T10 Oceans and Life | L1 3D ocean-floor relief cutaway, L2 tides (spring/neap), L3 sustainable fisheries, L4 tsunami timing, L5 UNCLOS maritime cooperation |
| T11 Life on Earth | L1 world biomes map, L2 India biosphere reserves map, L3 forest harvest & food web, L4 forest fire mitigation planner, L5 sacred groves & FRA policy |
| T12 Resisting & Adapting (1000–1700 CE) | L1 regional kingdoms India map, L2 3D Indian hill fort defence lab, L3 architecture/literature/crafts gallery, L4 Bhakti force-network, L5 state & economy timeline |
| T13 India and the World-I | L1 time-filtered trade routes map, L2 cultural & scholarly exchange map, L3 Indian Knowledge Systems gallery, L4 maritime/archaeological artefact viewer |
| T14 Roots of Authority | L1 Kautilya & Shukraniti source room, L2 Danda–Nyaya–Bala concept network, L3 evolution of authority timeline, L4 types of authority audit, L5 citizen & RTI civic workflow |
| T15 From Ideas to Startups | L1 business plan & stages builder, L2 unit economics, L3 India startup/MSME ecosystem map, L4 creative destruction, L5 profit, loss & balance sheet |
| T16 Smart Ways to Manage Your Finances | L1 budget, L2 inflation, L3 simple vs compound interest, L4 investment risk-return & insurance pool, L5 income tax concept flow |

Every lab states its learning objective and whether its data is documented, schematic, fictional or a reconstruction; explains changes live in English and Hindi; asks the student to predict before testing; ends with an exit ticket and a reflection; and includes a reset.

## Finding your way
The home library can be searched in English or Hindi and filtered by subject; the learning-journey section resumes a visited theme and shows locally saved progress. The home globe is illustrative: drag or use arrow keys to rotate it, select a marker, or use its topic links. Its positions are approximate, not official boundaries or routes. Use the top-bar **Settings** menu for low graphics, reduced motion, projector and teacher modes. The navigation and settings menus are keyboard operable, and topic links and lessons remain usable without WebGL.

The service worker precaches the shell, fonts, data, globe texture and home fallback photo after the first online visit. Three.js and lesson photos are cached when requested by a controlled page; if they are unavailable offline, the non-WebGL activities remain available. Answers and progress stay in local browser storage.

## Layout
`index.html`, `sw.js` (generated), `assets/css/app.css` and `assets/css/experience.css`, `assets/images/` (hero, theme banners, smaller home `thumbs/`, and `plates/` 2D lab figures), `src/core` (`dom`, `i18n`, `store`, `media`), `src/components` (`widgets`, `lab-kit`, `three-lab`), `src/engines` (`chart`, `viz`, `three-scene`, `webgl`, `xr`, and `domain/`), `src/modules/` (16 themes + `teacher-meta.js` + `openings.js` + `registry.js`), `src/i18n/ui.js`, `src/curriculum/curriculum.json`, `data/` (`glossary.json`, `geo/`, `coverage/`), `vendor/` (`three`, `d3`, `lucide`), `tests/`, `tools/`, `docs/`.

## Accessibility and performance
Keyboard operable, ≥44 px touch targets, projector mode, reduced motion, low-graphics mode (disables WebGL & hides raster banners), no-WebGL fallback (`?nowebgl=1`), single-tab render-on-demand 3D, lazy module loading, offline service worker.

## Attributions
- **Three.js** (MIT, vendored r170, licence in `vendor/three/LICENSE`)
- **D3 & TopoJSON** (`d3-array`, `d3-force`, `d3-geo`, `d3-path`, `d3-scale`, `d3-shape`, `topojson-client`, bundled in `vendor/d3/d3-viz.esm.js`)
- **Lucide Icons** (ISC, bundled in `vendor/lucide/lucide-icons.esm.js`)
- **Fonts**: Plus Jakarta Sans, DM Serif Display and Noto Sans Devanagari (SIL OFL 1.1, licence texts in `assets/fonts/`).
- **Geodata**: Natural Earth / `world-atlas` (`data/geo/countries-110m.json`, `WORLD_ATLAS_LICENSE`), `datta07/INDIAN-SHAPEFILES` simplified (`data/geo/india.simplified.json`, `INDIA_SHAPEFILES_LICENSE`), PB2002 tectonic plates (Bird 2003, ODC-By). The home globe texture is derived from the public-domain Natural Earth land data. See `data/geo/SOURCES.md`.
- Atmosphere values follow the US Standard Atmosphere 1976.

## Design references
The home redesign reviewed [Education-Website](https://github.com/sujitmahapatra/Education-Website) and [E-Learning-Website-HTML-CSS](https://github.com/keerti1924/E-Learning-Website-HTML-CSS) for general ideas about clear navigation and course listings. Neither reviewed repository contained a licence file, so their code and assets were **not installed or copied**; EduVerse's implementation and its existing lessons remain independent.

## Policies
`docs/ACCURACY_AND_SOURCE_POLICY.md`. Hindi text is draft until reviewed by a subject teacher.
