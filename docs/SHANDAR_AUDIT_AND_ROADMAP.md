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
| **Step 4 — T04** Early Humans | Evidence vs Inference "Detective Kit", Harappa 3D guided tour | Think like an archaeologist | Done |
| **Step 5 — T05 State & Society** | Timeline chunking (Mauryas→Guptas→Cholas), Saptanga builder | One timeline, not 516 lines | Done |
| **Step 6 — T06 Democracy** | Panchayati Raj + classroom vote simulation | Democracy you practise daily | Done |
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

## Step 4 — T04: Early Humans

### Audit and improvements
- **Evidence detective kit (L2):** three explicitly fictional field records—a marked bone, charred grain and a brick platform—ask students to separate recorded observations from competing interpretations and choose a useful next check. Feedback explains uncertainty and is revisable; optional notes and answers remain in this browser, with a clear warning if storage is blocked. The original six-card sorter remains, now allows revisions and has a separate reset that does not erase field notes. No notes are sent to a server.
- **Harappan guided tour (L4):** six bilingual stops cover a raised sector, the Great Bath, streets and houses, covered drains, wells and a disputed large platform. Each distinguishes evidence, a possible inference, what is unknown and a next investigation, with linked sources. Selecting a stop focuses the 3D camera and highlights the matching 2D plan; controls, model reset, the prediction, illustration pins and 3D feature selection also update the tour. A hidden feature is reported and can be restored by selecting its stop. The same text and 2D interaction work with low graphics, no WebGL, a failed Three.js load or on a first offline chapter visit. The small-screen plan scrolls within its own region rather than shrinking the whole page.
- **Historical limits:** the town is a schematic composite mainly inspired by Mohenjo-daro, **not a measured site reconstruction**. Its locations, sizes and repeated well counts are invented; Dholavira's distinct layout and reservoirs are not the Great Bath. The purpose of the so-called “granary” foundations remains debated. The former invented sanitation, flood-safety and overall percentages were removed; model controls show features, not ancient health outcomes. The Lothal case now presents a dock and a reservoir as competing basin interpretations. The comparative atlas labels its points and route schematic and makes clear that the Mature Harappan and Shang spans shown are not contemporary.
- **Timeline and settlement:** two million years is a chosen clock window, not the beginning of stone toolmaking; the 8,000-year farming date is an example, not a universal starting date. The log axis stops at 100 years ago. The L3 settlement model is clearly fictional: initial populations, rates, weather and food units are invented, and real communities could combine practices. Its reserve arithmetic now covers a shortfall before a simulated decline; a covered shortfall pauses growth and an unmet one causes decline in this toy. A low/high-storage comparison is not a historical forecast.
- **Compatibility and access:** existing city control keys, sorter choices, reflections and LO exit IDs are retained. An old clock prediction gets the corrected explanation without rerunning it. For substantially reworded L3–L5 predictions, an older answer stays in local state but the updated question can be attempted again, instead of falsely displaying the old choice as a response to new wording. Shared lab dock IDs are now unique, and asynchronous 3D construction is guarded against stale tab, graphics and motion changes. T04's opening question and teacher guidance now emphasize evidence and alternative explanations.
- These are companions to the existing five LOs, not additional simulations: the catalog remains **78/78 LOs and 79 simulations**. Notes disappear with browser data; images and Three.js are cached on first use, so they can be absent on the first offline visit. New Hindi remains **draft pending subject-teacher review**. Automated checks do not replace a screen-reader review.

### Teaching references
- NCERT *Bricks, Beads and Bones*: [Harappan material remains, context, town planning and interpretations](https://ncert.nic.in/textbook/pdf/lehs101.pdf); NCERT's [discussion of early cities and Dholavira](https://ncert.nic.in/textbook/pdf/fees106.pdf).
- UNESCO: [Mohenjo-daro](https://whc.unesco.org/en/list/138/) and [Dholavira](https://whc.unesco.org/en/list/1645/); Harappa.com: [Great Bath](https://www.harappa.com/slide/great-bath-mohenjo-daro-0) and the [debated “granary” label](https://www.harappa.com/category/slide-subject/granary).
- Lothal basin interpretations: [Harappa.com](https://www.harappa.com/lothal/1.html) and [recent palaeochannel research reported by Archaeology Magazine](https://archaeologymag.com/2024/09/ancient-harappan-dockyard-at-lothal-india/); the latter supports a dock interpretation but does not eliminate the debate.
- Smithsonian Human Origins: [early stone tool kit](https://humanorigins.si.edu/education/fun-facts/early-human-tool-kit), [alternative interpretations of marked bones](https://humanorigins.si.edu/research/whats-hot-human-origins/oldest-use-stone-tools) and [the varied beginnings of agriculture](https://humanorigins.si.edu/human-characteristics/humans-change-world).

### Verification
- `npm run catalog` and `npm run sw` generated the **78-LO/79-simulation catalog** and **126-file** content-hashed precache. `npm run verify` passed architecture checks and **52/52 tests**.
- `npm run test:t04` passed the three revisable cases, keyboard/touch, 360 px layout, EN/HI/both, local persistence, earlier prediction migration, denied storage, first-open offline 2D, failed Three.js fallback, actual WebGL picking and synchronization, rapid tab/preference changes, reduced motion, dark-mode selected-text contrast and all five LO exit checks. It reported no network writes or JavaScript errors. `npm run test:t02` and `npm run test:t03` passed their prior regressions.
- `npm run a11y`, `npm run smoke` and `npm run smoke:mobile` passed across all 16 themes; the desktop and 360 px smoke runs reported no errors or horizontal page overflow. Human accessibility and Hindi subject review remain outstanding.
- `npm run perf:size` estimated **841.0 KB gzip / 52 requests** for the T04 entry and **1,008.6 KB / 53 requests** after opening its guided 3D, excluding background service-worker precaching. The broader `perf:throttle` emulation passed its existing home/T09/T11/T16 and offline checks; it does not measure T04 on a physical device.

---

## Step 5 — T05: State and Society

### Audit and improvements
- **Timeline (L1):** three bilingual windows compare Mauryan, Gupta and later Chola examples with an evidence item, a limit and a further question. Selecting a window updates the existing map; the map controls, picture pins, reset and prediction update the timeline. Dates are approximate, the windows are not equally spaced, and they do not imply one unbroken all-India succession. The map's modern state colours and dashed routes are orientation aids, not historical boundaries or period-specific routes. Its wider 320–650 CE map window separates seventh-century Harsha from the approximately 320–550 CE Gupta period. The 1000 CE cutoff does not imply the later Cholas ended then.
- **Seven-part builder (L3):** students match ruler, officials, people and territory, fort, treasury, defence/law-and-order forces and allies to the seven Sanskrit terms. Answers can be checked, revised, reloaded or reset independently of the existing sandbox. This teaches an attributed textual theory, not a claim that every dynasty followed it. The separate five numerical tax-and-works indicators are explicitly invented and are no longer labelled as the historical seven parts. Legacy engine array IDs remain available for compatibility.
- **Evidence and limits:** the source-comparison switch now asks students to plan corroboration instead of showing invented confidence percentages. The trade sandbox and AI audit identify their figures and clues as fictional or scripted, not real historical risk, automatic fact-checking or certainty. Knowledge-system comparisons and corrosion-resistance language were qualified. Uttaramerur's eligibility restrictions are explicit in T05 and the linked T06 case: its rules are not universal adult suffrage. The opening, teacher notes and 3D labels were adjusted accordingly.
- Existing tab, control, exit and saved-progress identifiers are preserved; substantially revised L1, L3 and L5 predictions use a revision marker so earlier answers are retained without being presented as responses to different wording. The sixth AI lab remains supplementary to the five curriculum LOs. Local choices disappear with browser data; blocked storage gives a warning. Illustrations and Three.js can be absent on a first offline visit. New Hindi remains **draft pending subject-teacher review**; automated accessibility does not replace a human screen-reader review.

### Teaching reference
- [NCERT Class IX, State and Society up to 1000 CE](https://ncert.nic.in/textbook/pdf/iest105.pdf): Saptanga, evidence, chronology and the tenth-century Uttaramerur selection rules. Interpretations and restrictions require discussion rather than assuming an inscription is a complete record of practice.

### Verification
- `npm run catalog` and `npm run sw`: **78/78 LOs, 79 simulations and 128 precached files**. `npm run verify`: architecture checks and **57/57 tests** passed.
- `npm run test:t05`: timeline synchronization, all seven builder roles, keyboard and 360 px touch controls, EN/HI/both, local persistence, denied storage, old prediction migration, first-open offline, 3D, dark-mode selected-label contrast, all five LO exits and supplementary-lab exclusion passed without network writes or JavaScript errors. The earlier `test:t02`, `test:t03` and `test:t04` browser regressions also passed.
- Targeted T05 automated accessibility and desktop/360 px smoke passed with no horizontal page overflow or reported errors. They are not a manual accessibility audit.

---

## Step 6 — T06: Democracy

### Audit and improvements
- **Classroom decision (L1):** a bilingual, revisable tally models three project choices for 12 imagined eligible students. It handles zero votes, ties without inventing a winner, a plurality that is not necessarily a majority, a majority of votes counted versus of all eligible students, and counts not recorded without assuming why. It invites discussion of equal participation, abstention, confidentiality and rights. The tally stores only invented totals, not names; it cannot verify voters, stop repeat votes or guarantee secrecy and must not be used as an actual ballot.
- **Panchayati Raj (L2):** an explorer distinguishes the registered electors of a Gram Sabha from elected village, intermediate/block and district Panchayats. It describes state-dependent powers, funds and procedures, the optional intermediate tier in qualifying small states, constitutional exceptions and a separate urban framework. An expandable explanation introduces reserved seats and State Election Commissions; a revisable check tests the Sabha/Panchayat distinction. Ancient assemblies are not equated with modern universal franchise or assumed to be a continuous institution.
- **Existing lab repairs:** changing a case preset now updates its switches, and a manual switch changes the case to custom; image pins, autoplay, reset and older saved presets agree with the displayed score. Four checks are labelled as an incomplete fictional model, not proof that a real country is democratic. The parliamentary example is an explicitly simplified **confidence motion** in which all 100 vote, avoiding the former 50–50 no-confidence error; the US president is described as chosen by the Electoral College, and country descriptions now have Hindi translations. Changed L1 and L3 predictions use revision markers while retaining earlier answers and progress. The shared lab kit gained optional state-repair and coupled-control callbacks; unrelated controls retain their existing behavior.
- The two companions do not add new LOs or catalog simulations. Local data can be cleared or may be temporary if storage is blocked. Illustrations and Three.js may be missing on the first offline visit. New Hindi remains **draft pending subject-teacher review**; automated checks do not replace human accessibility review.

### Teaching reference
- [Constitution of India, Part IX](https://mahasec.maharashtra.gov.in/Upload/PDF/Constitutional%20Provisions%20IX%20-%20Panchayats%20(Rural).pdf): Articles 243, 243A–D, 243G, 243K and 243M (definitions, tiers, representation, state powers, elections and exceptions). The app links to the [Legislative Department's Constitution](https://www.legislative.gov.in/static/uploads/2025/07/ca7ce5c746fa7480804bbdeb6cb704f0.pdf); state laws and applicable exceptions need checking for local practice.

### Verification
- `npm run catalog` and `npm run sw` regenerated **78/78 LOs, 79 simulations and 130 precached files**. `npm run verify` passed architecture checks and **61/61 tests**.
- `npm run test:t06` passed vote arithmetic and tie behavior, four roles, keyboard and 360 px touch controls, EN/HI/both, local persistence and malformed-state repair, denied storage, first-open offline, case preset/switch/pin/autoplay synchronization, older prediction migration, confidence thresholds, 4/4 LO progress, dark contrast and WebGL lifecycle, with no network writes or JavaScript errors. Previous `test:t02`–`test:t05` regressions passed after the shared-control change.
- Targeted T06 automated accessibility and desktop/360 px smoke passed without reported errors or page overflow.

---

## How to Continue
1. Continue with **Step 7 — T07**, then follow the roadmap in order, one chapter at a time.
2. End each step with verification and a commit on the current branch. Do not parallel-edit two chapters.
3. New Hindi content is draft until reviewed by a subject teacher; record that limitation in the handoff.
