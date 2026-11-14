# EduVerse Shandaar — Audit & Stepwise Roadmap

**Overall objective (from `src/curriculum/curriculum.json`):** CBSE Class IX Social Science (087) 2026-27 — 16 themes, 78 LOs, 125 hours, bilingual EN/HI, NEP 2020 + NCF-SE 2023, static ES modules, no backend, offline-first, privacy-first (localStorage only). Every LO must be *observable → questionable → simulatable → explainable → applicable*.

**Current state (verified 2026-11-14):** 78/78 LOs implemented, 79 sims, 33/33 tests, 16/16 Chromium smoke desktop+mobile, a11y 16/16, perf throttled + offline SW. Foundation is solid — this roadmap makes it *shandaar* chapter-by-chapter without breaking it.

---

## Shortcomings Found (Audit)

### A. Learning journey — no path, no memory
1. Home is a flat grid of 16 cards. No "Continue where you left off", no sequential path T01→T16, no per-card LO progress (only global ★ count).
2. Theme page shows LO chips as *curriculum status* (implemented/planned), not *student mastery* (exit solved?). No "Chapter Complete 🏆" signal.
3. No onboarding: first-time student lands on grid with no "How to learn in 4 steps".
4. No search: finding "monsoon" or "election" requires browsing all cards.
5. Reflection textarea saves to `progress.reflect` but is never shown back as "My reflections" — invisible learning.

### B. Pedagogy — labs are strong, chapters are thin in places
6. **T01 (3 LOs)** is the foundation but thinnest: no Patna/Bihar local anchor (user is in Patna), no Inquiry Cycle (Question→Source→Evidence→Conclusion), sorter has only 4 questions.
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
| **Step 0 — Foundation** | Home Continue + Path progress + Search + How-to-Learn + per-card LO bars + Chapter Complete + Opening narration (Web Speech) | Student always knows *where am I, what's next, how do I learn* | **This PR** |
| **Step 1 — T01** Understanding Social Science | + Patna place (6th lens place), + Q5/Q6 Patna questions, Inquiry Cycle in L1, Patna discover tasks | Local anchor: "my city, my Social Science" | **This PR** |
| Step 2 — T02 Earth's Surface | India landform atlas (Himalaya/Deccan/Plains/Coast/Islands), Everest fossil story front-and-centre | India-first geography | Next |
| Step 3 — T03 Atmosphere & Climate | Monsoon mechanism deep-dive + 7-day local weather diary activity | Weather you can observe in Patna |
| Step 4 — T04 Early Humans | Evidence vs Inference "Detective Kit", Harappa 3D guided tour | Think like an archaeologist |
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

**Rule for every step:** `npm run verify` + `npm run a11y` (that theme) + `npm run smoke` (that theme) must pass before next step. No step breaks the previous.

---

## Step 0 + Step 1 — What Changed in This PR

### Foundation (all 16 themes benefit)
- **Home → Continue Learning:** picks first theme with `visited=true` but incomplete exits; else first unvisited theme. One-tap resume.
- **Home → Learning Path bar:** `X/16 themes explored · Y/78 LOs mastered · ★ N` with progress fill.
- **Home → Search:** filters cards by English/Hindi title + LO text (e.g. "monsoon", "चुनाव").
- **Home → How to Learn (4 steps):** Observe → Predict → Experiment → Reflect, collapsible, bilingual.
- **Cards → LO progress bar:** per-theme `solved/total` from `store.progress[theme].exit` (real student mastery, not curriculum status).
- **Theme page → Chapter Complete 🏆:** when every LO exit in that theme is solved.
- **Theme page → 🔊 Listen:** Web Speech API reads the Opening question in EN/HI (respects `lang` pref, stops on toggle, graceful fallback if no voice).

### T01 — Understanding Social Science
- **Patna added** as 6th place in 4-lens explorer (Ganga plain, Patliputra, Patna Municipal Corp, local markets) — Bihar anchor for every lens.
- **Q5 + Q6 added** to Question Sorter: Patna floods (Geography lead) + Patliputra capital (History lead) — sorter now 6 questions, all overlapping.
- **Inquiry Cycle** added to L1 discover: Question → Source → Evidence → Conclusion → New Question.
- **Patna discover tasks** in L2: compare Patna vs Varanasi (both Ganga), Patna vs Leh (opposite terrain, both historic routes).

### Verification
- `npm run verify` (architecture + 33 tests), `npm run a11y T01`, `npm run smoke T01` — all must pass.
- Catalog/SW regenerated only if sim count changes (T01 adds no new LO/sim id — enhancements only, so counts stay 78/79).

---

## How to Continue (next session)
1. Say "Step 2 — T02" and the agent will audit T02 labs, then upgrade T02 only.
2. Each step ends with a commit on the same branch + PR update. Never parallel-edit two chapters.
3. Hindi teacher review remains the #1 human task — flag any new Hindi string as `draft` in PR description.
