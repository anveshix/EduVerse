// T04 — Early Humans and Beginning of Civilisation:
// L1 Deep-time clock, L2 Evidence vs inference, L3 Settlement sim, L4 3D Harappan City Planner, L5 Comparative Civilisation Atlas.
import { h, esc, fmt } from '../../core/dom.js';
import * as i18n from '../../core/i18n.js';
import { t } from '../../core/i18n.js';
import * as store from '../../core/store.js';
import { chips, tabs, bi, relabelBi, predict, mcq, biHtml } from '../../components/widgets.js';
import { createLab, createInteractivePlate, createThreeLab } from '../../components/lab-kit.js';
import { createHarappan3d } from './harappan-3d.js';
import { createDetectiveKit } from './detective-kit.js';
import { createHarappanTour, HARAPPAN_STOPS } from './harappan-tour.js';
import { loadGeoAll } from '../../engines/viz.js';
import * as M from './models.js';
import { settlementLab, harappanCity, civAtlas } from './t04-specs.js';
import { UI_T04 } from '../../i18n/modules/t04.js';

i18n.register(UI_T04);

const b = (en, hi) => ({ en, hi });
const o = (id, en, hi, why) => ({ id, en, hi, ...(why ? { why } : {}) });
const COL = { palaeo: '#b5651d', meso: '#8a9a3a', neo: '#2e8b57', harappa: '#7b3fa0', later: '#555' };
const ITEMS = [
  { id: 'i1', kind: 'evidence', en: 'Stone blades were found in one layer of a cave floor.', hi: 'गुफ़ा के फ़र्श की एक परत में पत्थर के फलक मिले।', why: { en: 'This is directly observed: the blades exist and we know the layer they came from.', hi: 'यह सीधे देखा गया है: फलक मौजूद हैं और हमें उनकी परत पता है।' } },
  { id: 'i2', kind: 'inference', en: 'The people who made the blades hunted animals.', hi: 'फलक बनाने वाले लोग जानवरों का शिकार करते थे।', why: { en: 'Blades alone do not prove hunting. Analysed marks on animal bones may suggest processing, but do not by themselves prove a hunt.', hi: 'केवल फलकों से शिकार सिद्ध नहीं होता। हड्डियों पर जाँचे निशान प्रसंस्करण का संकेत दे सकते हैं, पर अकेले शिकार सिद्ध नहीं करते।' } },
  { id: 'i3', kind: 'evidence', en: 'Animal bones with grooves were found near the blades.', hi: 'फलकों के पास खरोंच वाली जानवरों की हड्डियाँ मिलीं।', why: { en: 'Bones, grooves and their recorded location are observations; what caused the grooves needs investigation.', hi: 'हड्डियाँ, खरोंच और उनका दर्ज स्थान प्रेक्षण हैं; खरोंचों का कारण जाँचना होगा।' } },
  { id: 'i4', kind: 'inference', en: 'These people lived in groups and shared food.', hi: 'ये लोग समूहों में रहते और भोजन बाँटते थे।', why: { en: 'We cannot see this directly; it is an interpretation of how the site was used.', hi: 'इसे हम सीधे नहीं देख सकते; यह स्थल के उपयोग की व्याख्या है।' } },
  { id: 'i5', kind: 'evidence', en: 'Grinding stones and burnt wheat grains were found inside a house.', hi: 'एक घर के भीतर चक्की के पत्थर और जले हुए गेहूँ के दाने मिले।', why: { en: 'Both objects were found and recorded at the site.', hi: 'दोनों वस्तुएँ स्थल पर मिलीं और दर्ज की गईं।' } },
  { id: 'i6', kind: 'inference', en: 'The villagers had begun farming.', hi: 'गाँव के लोगों ने खेती शुरू कर दी थी।', why: { en: 'A reasonable conclusion from the grains and tools, but it is still an interpretation; wild grains can also be gathered.', hi: 'दानों और औज़ारों से निकला उचित निष्कर्ष, पर यह फिर भी व्याख्या है; जंगली दाने भी इकट्ठा किए जा सकते हैं।' } },
];
const EXIT = [
  { id: 'h1', stem: { en: 'Which is an inference, not direct evidence?', hi: 'कौन-सा निष्कर्ष है, सीधा प्रमाण नहीं?' }, correct: 'b',
    options: [o('a', 'A stone tool was found in a cave.', 'गुफ़ा में पत्थर का औज़ार मिला।', { en: 'That is something found and recorded: evidence.', hi: 'यह मिली और दर्ज की गई वस्तु है: प्रमाण।' }), o('b', 'The cave people hunted together.', 'गुफ़ा के लोग मिलकर शिकार करते थे।'), o('c', 'A bone has grooves on it.', 'एक हड्डी पर खरोंचें हैं।', { en: 'The marks can be seen on the bone: evidence.', hi: 'निशान हड्डी पर देखे जा सकते हैं: प्रमाण।' })],
    explain: { en: 'Hunting together is a conclusion we draw from the evidence; we did not observe it.', hi: 'मिलकर शिकार करना हमारा निकाला निष्कर्ष है; हमने इसे देखा नहीं।' }, hint: { en: 'Ask: could I hold it, photograph it or measure it?', hi: 'पूछें: क्या मैं इसे पकड़, खींच या माप सकता हूँ?' } },
  { id: 'h2', stem: { en: 'Why do we call a time of 12,000 years ago “recent” in the story of humans?', hi: '12,000 वर्ष पहले के समय को मानव-कथा में “हाल का” क्यों कहते हैं?' }, correct: 'sm',
    options: [o('sm', 'It is a tiny fraction of the 2-million-year window shown on the clock.', 'यह घड़ी पर दिखाए गए 20 लाख वर्ष के अंतराल का बहुत छोटा अंश है।'), o('lg', 'It is about half of human history.', 'यह मानव-इतिहास का लगभग आधा है।', { en: '12,000 is only 0.6% of 2,000,000 years.', hi: '12,000, 20,00,000 वर्षों का केवल 0.6% है।' })],
    explain: { en: '12,000 ÷ 2,000,000 = 0.6%, or about the last 9 minutes on this clock. The earliest known stone tools are older than the window shown.', hi: '12,000 ÷ 20,00,000 = 0.6%, यानी इस घड़ी के लगभग अंतिम 9 मिनट। सबसे प्राचीन ज्ञात पत्थर औज़ार दिखाए अंतराल से पुराने हैं।' }, hint: { en: 'Divide 12,000 by 2,000,000.', hi: '12,000 को 20,00,000 से भाग दें।' } },
];
const REFLECT = { en: 'Pick one observation, suggest an interpretation and a different possibility, and name evidence you would check next.', hi: 'एक प्रेक्षण चुनें, एक व्याख्या और दूसरी संभावना सुझाएँ, फिर लिखें कि अगला कौन-सा प्रमाण जाँचेंगे।' };
const clockExplanation = () => b(`8,000 ÷ 2,000,000 × 24 hours = ${fmt(M.minutesBeforeMidnight(8000), 1)} minutes. This is one example date, not the beginning of farming everywhere; the oldest known stone tools are older than this clock’s window.`, `8,000 ÷ 20,00,000 × 24 घंटे = ${fmt(M.minutesBeforeMidnight(8000), 1)} मिनट। यह एक उदाहरण तिथि है, हर जगह खेती की शुरुआत नहीं; सबसे पुराने ज्ञात पत्थर औज़ार इस घड़ी के अंतराल से पुराने हैं।`);

export function mount(root) {
  const S = store.simState('T04', { tab: 'time', mark: 'farming', ev: {}, done: {} }); S.ev ??= {}; S.done ??= {};
  const prog = store.progress('T04'); const persist = () => store.saveSim();
  // The clock's answer choices are unchanged, so repair its old explanation without rerunning it.
  // The other updated questions carry a revision: older answers remain local but can be retried.
  if (S.done.t1?.choice && S.done.t1?.actual && S.done.t1?.explanation) S.done.t1.explanation = clockExplanation();
  persist();
  const aname = (id) => t(`tl.age.${id}`);
  let alive = true;

  i18n.register({
    'T04.tab.settle': { en: 'Settlement sim (L3)', hi: 'बस्ती प्रयोग (L3)' },
    'T04.tab.city': { en: 'Harappan town tour (L4)', hi: 'हड़प्पा नगर यात्रा (L4)' },
    'T04.tab.atlas': { en: 'Civilisation atlas (L5)', hi: 'सभ्यता मानचित्र (L5)' },
  });

  // ---- L1 clock
  const tl = (() => {
    const box = h('div', { class: 'chart-box' }), read = h('div', { class: 'readout', role: 'status', 'aria-live': 'polite' });
    const ch = chips({ name: 'ms', value: S.mark, options: M.MILESTONES.filter((m) => m.id !== 'now').map((m) => ({ id: m.id, key: `tl.ms.${m.id}` })), onSelect: (id) => { S.mark = id; draw(); } });
    function bar(pos, y, label, mark) {
      const x0 = 30, w = 580; let s = `<text class="lbl" x="${x0}" y="${y - 8}">${esc(label)}</text>`;
      M.AGES.forEach((a) => { const l = Math.min(pos(a.from), pos(a.to)), r = Math.max(pos(a.from), pos(a.to)); s += `<rect x="${x0 + l * w}" y="${y}" width="${Math.max(1.5, (r - l) * w)}" height="26" fill="${COL[a.id]}"/>`; });
      const mx = x0 + pos(mark) * w; return s + `<line x1="${mx}" x2="${mx}" y1="${y - 4}" y2="${y + 34}" stroke="currentColor" stroke-width="3"/><circle cx="${mx}" cy="${y + 13}" r="6" fill="#fff" stroke="currentColor" stroke-width="3"/>`;
    }
    function draw() {
      persist();
      const ms = M.MILESTONES.find((m) => m.id === S.mark) || M.MILESTONES[0];
      const ya = ms.ya, c = M.clockLabel(ya);
      const minLeft = M.minutesBeforeMidnight(ya);
      const angDeg = Math.min(359, Math.max(0.5, (minLeft / 60) * 30)); // wedge on 12-hour analog clock near midnight
      const rad = ((90 + angDeg) * Math.PI) / 180;
      const wx = (555 + 42 * Math.cos(rad)).toFixed(1), wy = (95 - 42 * Math.sin(rad)).toFixed(1);
      const dial = `<circle cx="555" cy="95" r="52" fill="#f8fafc" stroke="var(--ink)" stroke-width="2.5"/><path d="M555,95 L555,53 A42,42 0 ${angDeg > 180 ? 1 : 0},0 ${wx},${wy} Z" fill="${COL[M.ageOf(ya) ?? 'later']}" opacity=".38"/><line x1="555" y1="95" x2="555" y2="54" stroke="var(--ink)" stroke-width="2.5"/><line x1="555" y1="95" x2="${wx}" y2="${wy}" stroke="var(--d)" stroke-width="2.5"/><text class="txt sm b" x="555" y="164" text-anchor="middle">${esc(c.text)}</text>`;
      const barNarrow = (pos, y, label, mark) => {
        const x0 = 26, w = 440; let s = `<text class="lbl" x="${x0}" y="${y - 8}">${esc(label)}</text>`;
        M.AGES.forEach((a) => { const l = Math.min(pos(a.from), pos(a.to)), r = Math.max(pos(a.from), pos(a.to)); s += `<rect x="${x0 + l * w}" y="${y}" width="${Math.max(1.5, (r - l) * w)}" height="24" rx="3" fill="${COL[a.id]}"/>`; });
        const mx = x0 + pos(mark) * w; return s + `<line x1="${mx}" x2="${mx}" y1="${y - 4}" y2="${y + 32}" stroke="currentColor" stroke-width="3"/><circle cx="${mx}" cy="${y + 12}" r="6" fill="#fff" stroke="currentColor" stroke-width="3"/>`;
      };
      box.innerHTML = `<svg viewBox="0 0 640 190" class="chart" role="img" aria-label="${esc(t('tl.aria'))}" xmlns="http://www.w3.org/2000/svg" style="color:var(--ink)">${barNarrow(M.linearPos, 40, t('tl.lin'), ya)}${barNarrow(M.logPos, 120, t('tl.log'), ya)}${dial}<text class="tick" x="26" y="180">${esc(t('tl.left'))}</text><text class="tick" x="466" y="180" text-anchor="end">${esc(t('tl.right'))}</text></svg>` + `<div class="legend">${M.AGES.map((a) => `<span class="lg"><i style="background:${COL[a.id]}"></i><b>${esc(aname(a.id))}</b></span>`).join('')}</div>`;
      read.innerHTML = `<div class="ro-line">${esc(t('tl.ro.ya', { ya: fmt(ya, 0), age: aname(M.ageOf(ya) ?? 'later') }))}</div><div class="ro-line"><strong>${esc(t('tl.ro.clock', { time: c.text, min: fmt(c.minutes, 1) }))}</strong></div><div class="ro-line note">${esc(t('tl.note'))}</div>`;
    }
    const tlPlate = createInteractivePlate(() => ({
      src: 'assets/images/plates/t04-timeline.jpg',
      en: 'An illustrated two-million-year window on a 24-hour dial — choose a pin to jump to an example date.',
      hi: '20 लाख वर्ष का एक चित्रित अंतराल 24 घंटे की घड़ी पर — उदाहरण तिथि चुनने हेतु पिन पर टैप करें।',
      spots: [
        { x: 24, y: 58, en: 'Stone tools (~2 million years ago)', hi: 'पत्थर के औज़ार (~20 लाख वर्ष पहले)', detail: b('This is the beginning of the clock’s window, not the first stone tools. Some known tools are about 3.3 million years old.', 'यह घड़ी के अंतराल की शुरुआत है, पहले पत्थर के औज़ार नहीं। कुछ ज्ञात औज़ार लगभग 33 लाख वर्ष पुराने हैं।'), set: { mark: 'tools' } },
        { x: 64, y: 60, en: 'Farming communities (~8,000 years ago)', hi: 'कृषक समुदाय (~8,000 वर्ष पहले)', detail: b('This example date is about 5.8 minutes before midnight. Farming began at different times in different regions.', 'यह उदाहरण तिथि मध्यरात्रि से लगभग 5.8 मिनट पहले है। खेती अलग क्षेत्रों में अलग समय पर शुरू हुई।'), set: { mark: 'farming' } },
        { x: 84, y: 42, en: 'Harappan Cities & Writing (~4,600 ya)', hi: 'हड़प्पा नगर व लेखन (~4,600 वर्ष पूर्व)', detail: b('The illustrative Mature Harappan date is about 3.3 minutes before midnight; other cities had different dates.', 'परिपक्व हड़प्पा की उदाहरण तिथि मध्यरात्रि से लगभग 3.3 मिनट पहले है; अन्य नगरों की तिथियाँ अलग थीं।'), set: { mark: 'cities' } },
      ],
    }), (patch) => { if (patch.mark) { S.mark = patch.mark; ch.select(S.mark); draw(); } });
    const pr = predict({ id: 't1', stem: { en: 'Squeeze the last 2 million years into ONE day (midnight = today). Some farming communities lived about 8,000 years ago. How long before midnight is that?', hi: 'पिछले 20 लाख वर्षों को एक दिन में समेट दें (मध्यरात्रि = आज)। कुछ कृषक समुदाय लगभग 8,000 वर्ष पहले रहते थे। यह मध्यरात्रि से कितना पहले है?' }, options: [o('min', 'A few minutes', 'कुछ मिनट'), o('hour', 'About an hour', 'लगभग एक घंटा'), o('hours', 'Several hours', 'कई घंटे')],
      run: () => { S.mark = 'farming'; ch.select('farming'); draw(); const m = M.minutesBeforeMidnight(8000); return m < 30 ? 'min' : m < 180 ? 'hour' : 'hours'; },
      explain: clockExplanation }, { done: S.done, onDone: persist });
    draw();
    const el = h('div', { class: 'lab' }, h('p', { class: 'lead' }, bi({ en: 'Pick a moment and see where it falls on a straight timeline and on a stretched (log) timeline.', hi: 'कोई क्षण चुनें और देखें कि वह सीधी समय-रेखा और खिंची हुई (लघुगणकीय) समय-रेखा पर कहाँ आता है।' })), h('div', { class: 'lab-grid' }, h('div', { class: 'lab-main' }, tlPlate.el, box, read), h('div', { class: 'lab-side' }, h('h3', { 'data-k': 'tl.h' }, t('tl.h')), ch.root)), h('p', { class: 'note' }, h('a', { href: 'https://humanorigins.si.edu/education/fun-facts/early-human-tool-kit', target: '_blank', rel: 'noopener noreferrer' }, bi(b('Smithsonian: early stone tools (internet needed)', 'स्मिथसोनियन: आरंभिक पत्थर औज़ार (इंटरनेट आवश्यक)'), { tag: 'span' }))), h('section', { class: 'subsec' }, h('h3', { 'data-k': 'predict.h' }, t('predict.h')), pr));
    return { el, relabel() { tlPlate.relabel(); pr.relabel(); relabelBi(el); i18n.apply(el); draw(); } };
  })();

  // ---- L2 evidence vs inference: a case-based kit plus the original retryable sorter.
  const ev = (() => {
    const kit = createDetectiveKit();
    const list = h('div', { class: 'ev-list' });
    const cards = ITEMS.map((it) => {
      const card = h('div', { class: 'card ev', 'data-evidence-item': it.id });
      const statement = bi({ en: it.en, hi: it.hi }, { tag: 'p', cls: 'ev-t' });
      statement.id = `evidence-statement-${it.id}`;
      const fb = h('div', { class: 'feedback', 'aria-live': 'polite' });
      const row = h('div', { class: 'row', role: 'group', 'aria-labelledby': statement.id });
      ['evidence', 'inference'].forEach((kind) => row.append(h('button', {
        type: 'button', class: 'btn', 'data-evidence-choice': kind, 'aria-pressed': 'false', 'data-k': `ev.${kind}`,
        onclick: () => { S.ev[it.id] = kind; persist(); renderCard(it, card); },
      }, t(`ev.${kind}`))));
      card.append(statement, row, fb); list.append(card); return card;
    });
    function renderCard(it, card) {
      const answer = S.ev[it.id], valid = answer === 'evidence' || answer === 'inference';
      card.querySelectorAll('[data-evidence-choice]').forEach((button) => {
        const selected = valid && button.dataset.evidenceChoice === answer;
        button.classList.toggle('picked', selected); button.setAttribute('aria-pressed', String(selected));
      });
      const fb = card.querySelector('.feedback');
      fb.className = 'feedback'; fb.replaceChildren();
      if (valid) {
        const ok = answer === it.kind; fb.classList.add(ok ? 'ok' : 'try');
        fb.innerHTML = `<strong data-k="${ok ? 'fb.right' : 'fb.notquite'}">${esc(t(ok ? 'fb.right' : 'fb.notquite'))}</strong> <span data-k="ev.is.${it.kind}">${esc(t('ev.is.' + it.kind))}</span> ` + biHtml(it.why, { block: true });
      }
    }
    function render() { ITEMS.forEach((it, i) => renderCard(it, cards[i])); }
    render();
    const plate = createInteractivePlate(() => ({
      src: 'assets/images/plates/t04-tools.jpg',
      en: 'Illustration of rock art, stone tools and grain. The picture is not an excavation photograph.',
      hi: 'शैलचित्र, पत्थर के औज़ार और अनाज का चित्र। यह उत्खनन का फ़ोटो नहीं है।',
      spots: [
        { x: 22, y: 42, en: 'Rock art', hi: 'शैलचित्र', detail: b('Paint on a rock surface can be recorded as evidence. A story or ritual associated with it is an interpretation to test, not something directly observed.', 'शैल सतह पर रंग को प्रमाण के रूप में दर्ज किया जा सकता है। उससे जुड़ी कथा या अनुष्ठान जाँचने योग्य व्याख्या है, सीधे देखा तथ्य नहीं।') },
        { x: 46, y: 66, en: 'Flaked stone', hi: 'तराशा पत्थर', detail: b('Shape and flake scars can be observed. Cutting or scraping is a possible use; edge wear and context can help test it.', 'आकार और तराशने के निशान देखे जा सकते हैं। काटना या खुरचना संभावित उपयोग हैं; धार की घिसावट और संदर्भ से जाँच की जा सकती है।') },
        { x: 76, y: 60, en: 'Grain and grinding stone', hi: 'अनाज और पीसने का पत्थर', detail: b('Charred grain and a grinding stone may suggest food processing. They alone do not prove local farming or a permanent village.', 'जला अनाज और पीसने का पत्थर भोजन प्रसंस्करण का संकेत दे सकते हैं। वे अकेले स्थानीय खेती या स्थायी गाँव सिद्ध नहीं करते।') },
      ],
    }));
    const sorter = h('section', { class: 'evidence-sorter' }, bi(b('Sort the statements', 'कथनों को वर्गीकृत करें'), { tag: 'h3' }),
      bi(b('Is each statement a recorded observation or an inference? You can change an answer after reading the feedback.', 'क्या हर कथन दर्ज प्रेक्षण है या निष्कर्ष? प्रतिक्रिया पढ़ने के बाद उत्तर बदल सकते हैं।'), { tag: 'p', cls: 'note' }),
      plate.el, list, h('p', { class: 'note', 'data-k': 'ev.fictional' }, t('ev.fictional')),
      h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn', onclick: () => { S.ev = {}; persist(); render(); } }, bi(b('Reset sorter only', 'केवल वर्गीकरण रीसेट करें'), { tag: 'span' }))));
    const el = h('div', { class: 'lab' }, kit.el, sorter);
    return { el, relabel() { kit.relabel(); plate.relabel(); render(); relabelBi(el); i18n.apply(el); }, destroy() { kit.destroy(); } };
  })();

  // ---- L3, L4 (3D+2D), L5
  const lab3 = createLab(settlementLab, 'T04');
  let tour;
  const lab4 = createThreeLab(harappanCity, 'T04', createHarappan3d, {
    ariaKey: 'T04.city.aria', mode2dKey: 'T04.city.2d', mode3dKey: 'T04.city.3d',
    tourStops: [], // The accessible six-stop companion replaces the generic camera-only tour here.
    onSpot: (spot, _index, state) => { if (HARAPPAN_STOPS.some((stop) => stop.id === spot?.tour)) state.tourStop = spot.tour; },
    onInspect: (info) => { if (info?.tour) tour?.select(info.tour); },
  });
  const modelMain = lab4.el.querySelector('.lab-main');
  modelMain.tabIndex = -1; modelMain.setAttribute('role', 'region');
  modelMain.dataset.kAria = 'T04.city.model.aria'; modelMain.setAttribute('aria-label', t('T04.city.model.aria'));
  tour = createHarappanTour(lab4.state, {
    onSelect: (stop, patch) => { lab4.state.tourStop = stop.id; lab4.setState(patch); },
    onFocus: (stop) => lab4.focus(stop.view, stop.id),
    onShowModel: () => { modelMain.scrollIntoView({ block: 'start' }); modelMain.focus({ preventScroll: true }); },
  });
  const stopTour = lab4.onDraw((state) => tour.update(state));
  const cityGrid = lab4.el.querySelector('.lab-grid');
  const cityLayout = h('div', { class: 'harappa-layout' }, tour.el, cityGrid);
  lab4.el.querySelector('.goal-pill').after(cityLayout);
  lab4.draw();
  const lab5 = createLab(civAtlas, 'T04');

  loadGeoAll().then(() => { if (alive) lab5.draw(); });

  const exitBox = h('div', { class: 'exit' });
  const mcqs = EXIT.map((q) => { const e = mcq(q, { done: S.done, onDone: (id, v) => { prog.exit[id] = v; store.saveProgress(); persist(); } }); exitBox.append(h('div', { class: 'exit-q' }, e)); return e; });
  const ta = h('textarea', { class: 'reflect', rows: 3, 'data-k-aria': 'reflect.aria', placeholder: t('reflect.ph') }); ta.value = prog.reflection || ''; ta.addEventListener('input', () => { prog.reflection = ta.value; store.saveProgress(); });

  const onTab = (id) => {
    S.tab = id; persist();
    if (id === 'city') lab4.enable(); else lab4.disable();
  };
  const tb = tabs({
    active: S.tab || 'time',
    onChange: onTab,
    tabs: [
      { id: 'time', key: 'T04.tab.time', el: tl.el },
      { id: 'evid', key: 'T04.tab.evid', el: ev.el },
      { id: 'settle', key: 'T04.tab.settle', el: lab3.el },
      { id: 'city', key: 'T04.tab.city', el: lab4.el },
      { id: 'atlas', key: 'T04.tab.atlas', el: lab5.el },
    ],
  });
  root.append(tb.root, h('section', { class: 'subsec' }, h('h3', { 'data-k': 'exit.h' }, t('exit.h')), exitBox, h('h3', { 'data-k': 'reflect.h' }, t('reflect.h')), bi(REFLECT, { tag: 'p', cls: 'note' }), ta, h('p', { class: 'note', 'data-k': 'reflect.local' }, t('reflect.local'))));
  i18n.apply(root);
  if (S.tab === 'city') lab4.enable();

  return {
    relabel() { tl.relabel(); ev.relabel(); lab3.relabel(); lab4.relabel(); tour.relabel(); lab5.relabel(); mcqs.forEach((q) => q.relabel()); relabelBi(root); i18n.apply(root); ta.placeholder = t('reflect.ph'); },
    destroy() { alive = false; stopTour(); tour.destroy(); ev.destroy(); lab3.destroy(); lab4.destroy(); lab5.destroy(); },
    debug: () => ({ S, settle: lab3.debug(), city: lab4.debug(), atlas: lab5.debug() }),
  };
}
