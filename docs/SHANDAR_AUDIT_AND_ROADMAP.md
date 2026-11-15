# EduVerse Shandaar — Audit & Stepwise Roadmap

**Overall objective (from `src/curriculum/curriculum.json`):** CBSE Class IX Social Science (087) 2026-27 — 16 themes, 78 LOs, 125 hours, bilingual EN/HI, NEP 2020 + NCF-SE 2023, static ES modules, no backend, offline-first, privacy-first (localStorage only). Every LO must be *observable → questionable → simulatable → explainable → applicable*.

**Baseline:** 78/78 LOs implemented and 79 sims; the prior audit ran 33 tests, desktop/mobile Chromium smoke across 16 themes, accessibility checks, and throttled/offline checks. This roadmap improves the existing foundation chapter by chapter.

---

## Baseline Shortcomings Found (before Steps 0–2)

### A. Learning journey — no path, no memory
1. Home is a flat grid of 16 cards. No "Continue where you left off", no sequential path T01→T16, no per-card LO progress (only global ★ count).
2. Theme page shows LO chips as *curriculum status* (implemented/planned), not *student mastery* (exit solved?). No "Chapter Complete 🏆" signal.
3. No onboarding: first-time student lands on grid with no "How to learn in 4 steps".
4. No search: finding "monsoon" or "election" requires browsing all cards.
5. Reflection textarea saves to `progress.reflect` but is never shown back as "My reflections" — invisible learning.

### B. Pedagogy — labs are strong, chapters are thin in places
6. **T01 (3 LOs)** is the foundation but thinnest: no Patna/Bihar example, no Inquiry Cycle (Question→Source→Evidence→Conclusion), sorter has only 4 questions.
7. **T06 Democracy (4 LOs)** — abstract pillars/parliament, no Panchayati Raj / classroom democracy activity.
8. **T07 Elections** — 9 concepts/10 outcomes crammed into 4 LOs; delimitation + coalition + anti-defection need chunking.
9. **T05 State & Society** — 516-line spec, highest cognitive load; needs timeline chunking.
10. Misconceptions live only in hidden `teacher-meta.js` (teacher mode). Students never see "Common mistake" callouts in labs.
11. No audio narration: Hindi-first learners, low-vision, and early readers get no read-aloud (Web Speech API is free, offline-capable, no backend).
12. Hindi is `draft-needs-teacher-review` on all 174 rows — biggest content risk; needs teacher sign-off workflow, not more auto-translation.

### C. Visual & performance — shandaar look, heavy first visit
13. Home payload **2,816 KB raw / 2,093 KB gz** (39 reqs) — 16 card JPEGs (~1.7 MB) + Hero 3D. On 2G/3G in Bihar this is slow. No WebP, no blur-up, no `fetchpriority`.
14. CSS is one 197-line minified file — no design tokens per discipline, no progress-bar / continue-section styles.
15. No PWA manifest / install prompt / share — offline works via SW but not *installable*.
16. Hero 3D globe is decorative; tapping a pin jumps to theme but doesn't teach.

### D. Engagement — stars exist, story doesn't
17. No narrative thread across 16 themes. Each theme is an island.
18. Gamification = ★ count only. No levels, badges per chapter, streaks, or "next challenge" nudge.
19. No printable worksheet / homework generator for teachers (print CSS hides topbar but no worksheet layout).

---

## Stepwise Plan (one chapter at a time — never all at once)

| Step | Scope | Shandaar win | Status |
|------|-------|--------------|--------|
| **Step 0 — Foundation** | Home Continue + Path progress + Search + How-to-Learn + per-card LO bars + Chapter Complete + Opening narration (Web Speech) | Student always knows *where am I, what's next, how do I learn* | Done (`ec7b9a0`) |
| **Step 1 — T01** Understanding Social Science | + Patna place (6th lens place), + Q5/Q6 Patna questions, Inquiry Cycle in L1, Patna discover tasks | Local anchor: "my city, my Social Science" | Done (`ec7b9a0`) |
| **Step 2 — T02** Earth's Surface | India landform atlas (Himalaya/Deccan/Plains/Coast/Islands), Everest fossil story front-and-centre | India-first geography | Done |
| **Step 3 — T03** Atmosphere & Climate | Monsoon mechanism deep-dive + 7-day local weather diary activity | Weather in your own locality; Patna is an optional example | Done |
| Step 4 — T04 Early Humans | Evidence vs Inference "Detective Kit", Harappa 3D guided tour | Think like an archaeologist | Next, on request |
| Step 5 — T05 State & Society | Timeline chunking (Mauryas→Guptas→Cholas), Saptanga builder | One timeline, not 516 lines |
| Step 6 — T06 Democracy | Panchayati Raj + classroom vote simulation | Democracy you practise daily |
| Step 7 — T07 Elections | Mock election (voter journey), delimitation visual, coalition builder | Vote, count, form government |
| Step 8 — T08 Economics Basics | Household budget challenge (₹100 → ₹1,000), PPF daily-life | Opportunity cost in your pocket |
| Step 9 — T09 Price Puzzle | Patna mandi prices, MSP, onion-tomato spike case | Market you see every week |
| Step 10 — T10 Oceans | Bay of Bengal cyclones, Indian fisheries, tsunami safety | Ocean that affects Bihar |
| Step 11 — T11 Life on Earth | Thar / Sundarbans / Western Ghats biomes, Bihar wetlands (Kanwar) | Biodiversity around you |
| Step 12 — T12 Resistance | Multiple perspectives (ruler, farmer, trader, woman) | History with many voices |
| Step 13 — T13 India & World-I | Silk Road + maritime map lab, Patliputra trade | India connected to world |
| Step 14 — T14 Authority | School rules → Constitution, grievance timeline | Why rules are fair (or not) |
| Step 15 — T15 Startups | Local entrepreneur stories, balance-sheet builder (fix D9) | Idea → business |
| Step 16 — T16 Finance | UPI safety, savings, insurance, digital fraud shield | Money you can trust |
| Step 17 — Polish | WebP images, PWA manifest, worksheet print, badges/levels, Hindi teacher review workflow | Installable, printable, shandaar |

**Rule for every step:** regenerate the catalog and service worker after source changes, then run `npm run verify`, `node tests/a11y-smoke.cjs Txx` and `node tests/lab-smoke.cjs Txx` (plus mobile smoke). No step should break the previous one.

---

## Step 0 + Step 1 — What Changed

### Foundation (all 16 themes benefit)
- **Home → Continue Learning:** picks first theme with `visited=true` but incomplete exits; else first unvisited theme. One-tap resume.
- **Home → Learning Path bar:** `X/16 themes explored · Y/78 LOs with a correct exit answer` with progress fill.
- **Home → Search:** filters cards by English/Hindi title + LO text (e.g. "monsoon", "चुनाव").
- **Home → How to Learn (4 steps):** Observe → Predict → Experiment → Reflect, collapsible, bilingual.
- **Cards → LO progress bar:** per-theme count of LOs with at least one correct exit answer, distinct from curriculum status. This is an activity signal, not proof of mastery.
- **Theme page → Chapter exit check 🏆:** when each LO has at least one recorded correct exit answer.
- **Theme page → 🔊 Listen:** Web Speech API reads the Opening question in EN/HI (respects `lang` pref, stops on toggle, graceful fallback if no voice).

### T01 — Understanding Social Science
- **Patna added** as 6th place in 4-lens explorer (Ganga plain, Patliputra, Patna Municipal Corp, local markets) — Bihar anchor for every lens.
- **Q5 + Q6 added** to Question Sorter: Patna floods (Geography lead) + Patliputra capital (History lead) — sorter now 6 questions, all overlapping.
- **Inquiry Cycle** added to L1 discover: Question → Source → Evidence → Conclusion → New Question.
- **Patna discover tasks** in L2: compare Patna vs Varanasi (both Ganga), Patna vs Leh (opposite terrain, both historic routes).

### Verification
- Step 0+1 originally passed `npm run verify`, T01 Chromium accessibility and desktop smoke. T01 was rechecked during Step 2, including mobile.
- Keep catalog and service-worker manifests in sync even when the number of simulations is unchanged.

---

## Step 2 — T02: Shaping the Earth's Surface

### Audit and improvements
- **India landform atlas (L5):** seven numbered, accessible region choices show representative points for the Himalaya, Ganga plain/Patna, Deccan, Thar, Konkan, two island groups and Meghalaya. Choosing one updates the existing 2D/3D landform gallery; if the gallery is then changed independently, a note explains how to return to the comparison. The descriptions distinguish an area's *origin* from the later process illustrated by the gallery (especially basalt, coral and tectonic islands). India geodata is loaded on opening L5; an offline/error fallback retains the choices and explanations. Points are examples, not authoritative region boundaries.
- **Everest fossil mystery (L2):** the opening question leads to a predict-first activity using the continent–continent model and a fossil-bearing limestone explanation. The model illustrates uplift, not an actual reconstruction or Everest-height calculation. Prediction feedback is now saved and restored without rerunning the simulation; older saved predictions can be retried. Solved exit tickets also restore their answer and explanation on return.
- **Gradation and Bihar (L4–L6):** compare the Ganga plain's alluvium with other agents, distinguish older Bhangar from newer Khadar without imposing a false geographic sequence, and compare flood, heat and earthquake preparation. The slope index is not a failure probability or flood forecast; the GLOF scenario is separate and no invented surge-arrival time is displayed. The field inquiry permits photographs or safe public viewpoints and explicitly warns against floodwater and unstable banks.
- **Bilingual accessibility:** self-hosted Noto Sans Devanagari regular/bold (Fontsource 5.3.0, SIL OFL 1.1; license in `assets/fonts/`) fixes unreadable Hindi when a device lacks a Devanagari font. The font files are precached for offline use. New Hindi remains **draft — subject-teacher review required**.
- **Progress repair:** count distinct LOs, not individual questions or the `T02` prefix, and translate known legacy question IDs without discarding existing answers. T02's plate-distance question belongs to the boundary LO, so a new plate-identification question covers the map LO. The chapter exit badge updates as answers are saved. One correct exit answer is a progress signal, **not mastery**. Some older bespoke LOs in other chapters lack a corresponding tracked exit question and may remain undercounted until their chapter is upgraded; Continue Learning can therefore revisit such a chapter.
- No new LO or separate simulation was added: coverage remains 78/78 implemented and 79 simulations. Illustration images are cached on first use, as before; the atlas geodata, code and fonts are included in the offline precache. The service-worker version now hashes file contents, so a same-length edit also refreshes the offline cache.

### Teaching references
- NCERT physiography: Bhabar/Terai, older/newer alluvium, relief and island groups [1](https://ncert.nic.in/textbook/pdf/kegy102.pdf).
- Geological Society on Everest's marine limestone and uplift [1](https://www.geolsoc.org.uk/ks3/gsl/education/resources/rockcycle/page3468.html); USGS on the India–Eurasia collision and approximate timing [1](https://pubs.usgs.gov/gip/dynamic/himalaya.html).
- USGS on the Sumatra–Andaman subduction zone [2](https://www.usgs.gov/centers/pcmsc/science/tsunami-generation-2004-m91-sumatra-andaman-earthquake); National Institute of Disaster Management preparedness guidance [2](https://nidm.gov.in/PDF/IEC/Dosnewnidm.pdf).
- India state/UT outlines and their MIT attribution are recorded in `data/geo/SOURCES.md` and `data/geo/INDIA_SHAPEFILES_LICENSE`. Atlas coordinates and descriptions are teaching approximations.

### Verification
- `npm run catalog` and `npm run sw` regenerated the catalog (78 LOs, 79 simulations) and 120-file offline precache. `npm run verify` passed the architecture guardrails and **43/43 tests** across all themes.
- `npm run test:t02` passed the atlas-to-gallery link in both 2D and WebGL 3D, keyboard/touch, all three language modes, persistence, Everest feedback, LO progress and offline atlas/font loading in Chromium.
- `npm run a11y`, `npm run smoke` and `npm run smoke:mobile` passed across all 16 themes, with no reported errors or horizontal overflow. Automated accessibility checks are not a substitute for a screen-reader review.
- `npm run perf:size` reported approximately 810 KB estimated compressed on-demand transfer for the T02 entry view and 1,003 KB after opening the atlas and its 3D gallery, excluding the background service-worker precache. The two Hindi font weights account for roughly 101 KB combined; image payload remains a target for later optimization. The throttled test also passed its existing home/T09/T11/T16 and offline checks; it is an emulation, not a real-device benchmark.

---

## Step 3 — T03: Atmosphere and Climate

### Audit and improvements
- **Seven-day local weather diary (L2):** students choose any general locality (Patna is an optional example) and record dates, observation times, sky, rain, estimated wind, optional measured temperature and a reflection. Seven independently editable day entries survive navigation, language changes and reloads in local browser storage; deletion requires confirmation, while the model's Reset does not erase the diary. No geolocation or weather API is used, and students are asked not to enter personal details. If storage is blocked the page explicitly warns that the diary is temporary.
- **Evidence, not invented numbers:** an empty rain entry means *not recorded*, while “rain not seen” applies only at observation time and does **not** assert zero rainfall for a full day. An empty temperature is not 0 °C; invalid readings are excluded from the summary. Calendar checks catch nonconsecutive or duplicate dates, including leap-day boundaries; dates alone do not count as observations. A week describes weather, not a climate normal or forecast. Safety instructions tell learners to stay indoors away from windows during thunderstorms and skip unsafe observations.
- **Climograph honesty and access (L2):** existing monthly arrays were not sourced as official station normals; the graph, readout, prediction and model note now identify them as illustrative teaching values. The rainfall axis has numeric ticks, the legend explains both axes and lines, and a bilingual 12-row table exposes the same monthly data to keyboard/screen-reader users. The table tracks both station controls and stays open on model or language changes. An incorrect “Mumbai wet year-round” claim was removed. Bihar is not given invented station values.
- **Monsoon mechanism (L3):** four linked, keyboard-operable steps trace land–sea heating and pressure, the shifting ITCZ, cross-equatorial flow and Coriolis deflection, Arabian Sea/Bay branches, relief and rain shadow, and the seasonal reversal. They compare typical Bihar and Tamil Nadu rainfall seasons without claiming a fixed daily pattern. Selecting a step changes the existing map; map controls, pins, Reset and predictions update the explanation. Map paths now have directional arrowheads and one highlight colour per season, not a fabricated rainfall scale. Onset, breaks and withdrawal vary; this simplified diagram is neither a warning nor a forecast.
- **Teaching and scope:** the opening question, teacher flow, model limitations and a new comparison prediction reinforce the weather–climate distinction. The diary and inquiry are companions to existing LOs, not new simulations: the catalog remains **78/78 LOs and 79 simulations**. Hindi translations remain draft pending a subject-teacher review. The diary is learner-entered and unverified; clearing browser data removes it. First-use offline tests cover the new code and Hindi font, but uncached illustration images may be absent offline.

### Teaching references
- NCERT Class IX *Climate* (2019 edition, reproduced): seasonal reversal, convergence, branches, relief, breaks and the Tamil Nadu coast [1](https://cdn1.byjus.com/wp-content/uploads/2019/11/NCERT-Book-for-Class-9-Geography-Chapter-4.pdf).
- IMD/MAUSAM study of normal monsoon onset, progress and withdrawal: normal Kerala onset is around 1 June; observed timing varies [1](https://mausamjournal.imd.gov.in/index.php/MAUSAM/article/view/33).
- WMO: standard climate normals use 30-year reference periods [1](https://wmo.int/media/news/wmo-publishes-global-update-of-climate-datasets). IMD thunderstorm and lightning safety guidance [1](https://mausam.imd.gov.in/Forecast/mcmarq/mcmarq_data/dos-donts-ts2025.pdf).

### Verification
- `npm run catalog` and `npm run sw` regenerated the 78-LO/79-simulation catalog and **124-file** content-hashed precache. `npm run verify` passed architecture checks and **47/47 tests**.
- `npm run test:t03` passed all seven diary entries, missing-vs-not-seen rain, date and temperature validation, edits/reload/deletion, storage denial, EN/HI/both, keyboard/touch, the monthly table, dark-mode selected-text contrast, map synchronisation and first-open offline interaction. No network writes or JavaScript errors were reported. `npm run test:t02` also passed its previous mobile, offline, progress and WebGL regressions.
- `npm run a11y` passed automated checks across all 16 themes. A 16-theme desktop smoke passed before the final T03 table/safety refinements; T03 desktop and 360 px mobile smoke were rerun afterward with no errors or horizontal page overflow. One concurrent smoke attempt timed out; its sequential rerun passed. Automated checks do not replace a real screen-reader or subject-teacher review.
- `npm run perf:size` measured T03 entry at approximately **1,185.2 KB estimated gzip / 55 requests**, excluding background service-worker precaching. Images and Three.js remain large; this is an emulated transfer estimate, not a physical-device benchmark.

---

## How to Continue
1. On the user's request, audit and upgrade **Step 4 — T04** only.
2. End each step with verification and a commit on the current branch. Do not parallel-edit two chapters.
3. New Hindi content is draft until reviewed by a subject teacher; record that limitation in the handoff.
