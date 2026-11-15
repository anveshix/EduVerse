// T08 Building Blocks in Economics lab specs (L1–L5).
import { Chart } from '../../engines/chart.js';
import * as M from '../../engines/domain/market.js';
import { forceGraphSvg } from '../../engines/viz.js';
import { esc, fmt } from '../../core/dom.js';
import { pair as P } from '../../core/i18n.js';

const b = (en, hi) => ({ en, hi });
const opt = (id, en, hi, why) => ({ id, en, hi, ...(why ? { why } : {}) });
const rs = (v) => `₹${fmt(v, 0)}`;

// ------------------------------------------------------------------ T08.L2 PPF
const AMAX = 10, BMAX = 10;
export const ppf = {
  id: 'T08.L2',
  objective: b('Use a production possibility frontier to show scarcity, choice and opportunity cost: producing more of one good means giving up some of another.', 'उत्पादन संभावना वक्र से दुर्लभता, चयन और अवसर-लागत दिखाएँ: एक वस्तु अधिक बनाने का अर्थ दूसरी का कुछ त्यागना है।'),
  note: { kind: 'fictional', en: 'An invented curved frontier for a farm growing wheat or vegetables. Technology is assumed to raise both maxima by 30%; this is not a prediction for a real farm.', hi: 'गेहूँ या सब्ज़ी उगाने वाले खेत के लिए काल्पनिक मुड़ा वक्र। तकनीक से दोनों अधिकतम 30% बढ़ने की मान्यता है; यह वास्तविक खेत का अनुमान नहीं है।' },
  init: () => ({ a: 4, b: 5, tech: false }),
  controls: [
    { id: 'a', type: 'slider', label: b('Wheat grown (tonnes)', 'उगाया गया गेहूँ (टन)'), min: 0, max: 13, step: 0.5 },
    { id: 'b', type: 'slider', label: b('Vegetables grown (tonnes)', 'उगाई गई सब्ज़ियाँ (टन)'), min: 0, max: 13, step: 0.5 },
    { id: 'tech', type: 'toggle', label: b('Better seeds and tools (+30% capacity)', 'बेहतर बीज और औज़ार (+30% क्षमता)') },
  ],
  view(S) {
    const k = S.tech ? 1.3 : 1, am = AMAX * k, bm = BMAX * k, pt = M.ppfPoint(S.a, S.b, am, bm);
    const ch = new Chart({ xMax: 14, yMax: 14, xLabel: P('Wheat (tonnes)', 'गेहूँ (टन)'), yLabel: P('Vegetables (tonnes)', 'सब्ज़ियाँ (टन)'), xTicks: 7, yTicks: 7 });
    ch.axes();
    const pts = []; for (let a = 0; a <= am + 1e-9; a += am / 40) pts.push([a, M.ppfB(a, am, bm)]);
    ch.poly([...pts, [0, 0]], 'fillG'); ch.line(pts, 'curve g');
    if (S.tech) { const old = []; for (let a = 0; a <= AMAX + 1e-9; a += AMAX / 40) old.push([a, M.ppfB(a, AMAX, BMAX)]); ch.line(old, 'ghost', { dash: true }); }
    ch.dot(S.a, S.b, pt.status === 'efficient' ? 'optdot' : pt.status === 'inefficient' ? 'eqdot' : 'bmdot', 9);
    const lines = [{ en: `Point (${S.a} t wheat, ${S.b} t vegetables): ${pt.status === 'efficient' ? 'ON the model frontier: maximum feasible output for this mix.' : pt.status === 'inefficient' ? 'INSIDE the model frontier: at least one output could rise without reducing the other.' : 'OUTSIDE the model frontier: not feasible with these assumed resources and technology.'}`, hi: `बिंदु (${S.a} टन गेहूँ, ${S.b} टन सब्ज़ी): ${pt.status === 'efficient' ? 'मॉडल सीमा पर: इस मिश्रण का अधिकतम संभव उत्पादन।' : pt.status === 'inefficient' ? 'मॉडल सीमा के भीतर: दूसरे को घटाए बिना कम-से-कम एक उत्पादन बढ़ सकता है।' : 'मॉडल सीमा के बाहर: माने गए संसाधन और तकनीक से संभव नहीं।'}`, cls: pt.status === 'efficient' ? 'balanced' : pt.status === 'inefficient' ? 'note' : 'warn' }];
    if (S.a >= am) {
      lines.push({ en: S.a === am ? `At ${am} t wheat the model is at its maximum wheat output; there is no next 0.5 t move along this frontier.` : `The selected ${S.a} t wheat exceeds the model maximum of ${am} t; no next move on this frontier exists.`, hi: S.a === am ? `${am} टन गेहूँ मॉडल का अधिकतम है; इस सीमा पर अगला 0.5 टन बढ़ाना संभव नहीं।` : `चुना ${S.a} टन गेहूँ मॉडल के अधिकतम ${am} टन से अधिक है; इस सीमा पर अगला चरण नहीं है।`, cls: 'note' });
    } else {
      const delta = Math.min(0.5, am - S.a), startVeg = M.ppfB(S.a, am, bm), endVeg = M.ppfB(S.a + delta, am, bm), lost = startVeg - endVeg;
      lines.push({ en: `Frontier reference (not necessarily the selected point): at ${S.a} t wheat, about ${fmt(startVeg, 2)} t vegetables are possible; at ${S.a + delta} t wheat, about ${fmt(endVeg, 2)} t. The extra ${delta} t wheat costs about ${fmt(lost, 2)} t vegetables in this model.`, hi: `सीमा पर संदर्भ (चुना बिंदु ज़रूरी नहीं): ${S.a} टन गेहूँ पर लगभग ${fmt(startVeg, 2)} टन सब्ज़ी संभव है; ${S.a + delta} टन गेहूँ पर लगभग ${fmt(endVeg, 2)} टन। इस मॉडल में अतिरिक्त ${delta} टन गेहूँ की लागत लगभग ${fmt(lost, 2)} टन सब्ज़ी है।` });
    }
    lines.push({ en: 'This invented curved frontier assumes increasing trade-offs. Other technologies and real farms may have different frontiers; an interior point need not describe anyone’s actual choices.', hi: 'यह काल्पनिक मुड़ा वक्र बढ़ती अदला-बदली मानता है। अन्य तकनीकों और असली खेतों की सीमाएँ अलग हो सकती हैं; भीतर का बिंदु किसी वास्तविक व्यक्ति का चुनाव नहीं बताता।', cls: 'note' });
    return {
      plate: {
        src: 'assets/images/plates/t08-ppf.jpg',
        en: 'Dividing one finite farm between golden wheat & fresh vegetables — tap pins to jump inside, onto, or beyond the frontier.',
        hi: 'सीमित खेत को गेहूँ व सब्ज़ियों में बाँटना — वक्र के भीतर, ऊपर या बाहर जाने हेतु पिन पर टैप करें।',
        spots: [
          { x: 26, y: 56, en: 'On Frontier (Full Efficiency)', hi: 'वक्र पर (पूर्ण दक्षता)', detail: b('6 t wheat + 8 t vegetables uses every acre — getting more wheat means sacrificing vegetables.', '6 टन गेहूँ + 8 टन सब्ज़ी पूरी क्षमता से उत्पादन है; एक बढ़ाने पर दूसरा घटेगा।'), set: { a: 6, b: 8, tech: false } },
          { x: 54, y: 48, en: 'Inside Frontier (Idle Land)', hi: 'वक्र के भीतर (बेकार संसाधन)', detail: b('At (3, 4) farmland sits idle — we could grow more of BOTH without trade-off!', '(3, 4) पर भूमि बेकार है — बिना त्याग के दोनों फ़सलें बढ़ाई जा सकती हैं!'), set: { a: 3, b: 4, tech: false } },
          { x: 80, y: 46, en: 'Hybrid Seeds & Drip Tech (+30%)', hi: 'नई तकनीक व सिंचाई (+30% विस्तार)', detail: b('Better seeds shift the entire boundary outward so (8, 8) becomes achievable!', 'उन्नत बीज व तकनीक पूरी उत्पादन संभावना सीमा को बाहर खिसका देते हैं!'), set: { a: 8, b: 8, tech: true } },
        ],
      },
      svg: ch.html({ label: P('Production possibility frontier', 'उत्पादन संभावना वक्र') }), aria: P(`Wheat ${S.a}, vegetables ${S.b}: ${pt.status}.`, `गेहूँ ${S.a}, सब्ज़ी ${S.b}: ${pt.status === 'efficient' ? 'सीमा पर' : pt.status === 'inefficient' ? 'सीमा के भीतर' : 'सीमा के बाहर'}।`), lines,
    };
  },
  discover: [b('Compare the frontier-reference readout at 1 t and 8 t of wheat. Which 0.5 t move gives up more vegetables?', '1 और 8 टन गेहूँ पर सीमा-संदर्भ पढ़ें। 0.5 टन बढ़ाने पर किसमें अधिक सब्ज़ी छोड़नी पड़ती है?'), b('Move the point outside the curve, then switch on “better seeds and tools”. What changed?', 'बिंदु को वक्र के बाहर ले जाएँ, फिर “बेहतर बीज और औज़ार” चालू करें। क्या बदला?')],
  predictions: [{ id: 'p1', stem: b('Moving along the frontier, the opportunity cost of one more tonne of wheat is…', 'वक्र पर चलते हुए एक और टन गेहूँ की अवसर-लागत…'), options: [opt('rises', 'Higher the more wheat you already grow', 'जितना अधिक गेहूँ पहले से उगे, उतनी अधिक'), opt('same', 'The same everywhere', 'हर जगह समान'), opt('falls', 'Lower the more wheat you already grow', 'जितना अधिक गेहूँ पहले से उगे, उतनी कम')],
    run: (S) => { S.a = 8; S.b = Math.round(M.ppfB(8, AMAX, BMAX) * 2) / 2; S.tech = false; const lo = M.opportunityCost(1, 1, AMAX, BMAX), hi = M.opportunityCost(8, 1, AMAX, BMAX); return hi > lo * 1.05 ? 'rises' : hi < lo * 0.95 ? 'falls' : 'same'; },
    explain: () => ({ en: `Between 1 and 2 t of wheat you give up ${fmt(M.opportunityCost(1, 1, AMAX, BMAX), 2)} t of vegetables per tonne; between 8 and 9 t you give up ${fmt(M.opportunityCost(8, 1, AMAX, BMAX), 2)} t. Resources are not equally good at both jobs.`, hi: `1 से 2 टन गेहूँ के बीच प्रति टन ${fmt(M.opportunityCost(1, 1, AMAX, BMAX), 2)} टन सब्ज़ी छोड़नी पड़ती है; 8 से 9 टन के बीच ${fmt(M.opportunityCost(8, 1, AMAX, BMAX), 2)} टन। संसाधन दोनों कामों में समान उपयुक्त नहीं होते।` }) }],
  exit: [{ id: 'e1', stem: b('A point INSIDE the frontier means…', 'वक्र के भीतर का बिंदु दर्शाता है…'), correct: 'idle', options: [
    { id: 'idle', ...b('Resources are unemployed or wasted; more of both goods could be produced.', 'संसाधन बेकार या अपव्ययी हैं; दोनों वस्तुएँ अधिक बनाई जा सकती थीं।') }, { id: 'best', ...b('The best possible use of resources.', 'संसाधनों का सर्वोत्तम उपयोग।'), why: b('The best use is ON the frontier, not inside it.', 'सर्वोत्तम उपयोग वक्र पर होता है, भीतर नहीं।') }],
    explain: b('Inside the frontier the economy could gain more of one good without giving up any of the other.', 'वक्र के भीतर अर्थव्यवस्था दूसरी वस्तु छोड़े बिना एक वस्तु अधिक पा सकती है।'), hint: b('Move the point inside the curve and read the message.', 'बिंदु को वक्र के भीतर ले जाकर संदेश पढ़ें।') }],
  reflect: b('Describe a choice in your own life where choosing one thing meant giving up another. What was the opportunity cost?', 'अपने जीवन का ऐसा चयन बताएँ जहाँ एक चीज़ चुनने का मतलब दूसरी छोड़ना था। अवसर-लागत क्या थी?'),
};

// ------------------------------------------------------------------ T08.L1 Scarcity allocation board
export const scarcityGame = {
  id: 'T08.L1',
  objective: b('Allocate a fixed ₹100 weekly allowance across books, snacks, and mobile data to feel scarcity, trade-offs, and opportunity cost firsthand.', 'पुस्तकों, नाश्ते और मोबाइल डेटा के बीच सीमित ₹100 के साप्ताहिक बजट का बँटवारा करके दुर्लभता, विकल्प-चयन और अवसर-लागत को समझें।'),
  note: { kind: 'fictional', en: 'Fictional ₹100 weekly student allowance demonstrating that unlimited wants face scarce budgets.', hi: 'काल्पनिक ₹100 का साप्ताहिक छात्र बजट जो दर्शाता है कि असीमित इच्छाओं के सामने संसाधन सीमित होते हैं।' },
  init: () => ({ books: 40, snack: 30, data: 20 }),
  controls: [
    { id: 'books', type: 'slider', label: b('Stationery & books (₹)', 'कॉपी व पुस्तकें (₹)'), min: 0, max: 100, step: 10, fmt: rs },
    { id: 'snack', type: 'slider', label: b('Treats & snacks (₹)', 'नाश्ता व मिठाई (₹)'), min: 0, max: 100, step: 10, fmt: rs },
    { id: 'data', type: 'slider', label: b('Study / media data pack (₹)', 'अध्ययन / मीडिया डेटा (₹)'), min: 0, max: 100, step: 10, fmt: rs },
  ],
  view(S) {
    const r = M.scarcityAllocate({ budget: 100, ...S });
    const items = [
      { lab: P('Books', 'पुस्तकें'), val: S.books, fill: '#15803d' },
      { lab: P('Snacks', 'नाश्ता'), val: S.snack, fill: '#d97706' },
      { lab: P('Data', 'डेटा'), val: S.data, fill: '#0369a1' },
    ];
    let g = `<rect x="24" y="28" width="592" height="30" rx="6" fill="#e2e8f0"/>`;
    let x = 24;
    items.forEach((it) => {
      const w = (Math.min(120, it.val) / 100) * 592;
      const rw = Math.min(Math.max(0, 592 - (x - 24)), w);
      if (rw > 0) g += `<rect x="${x.toFixed(1)}" y="28" width="${rw.toFixed(1)}" height="30" fill="${it.fill}"/>`;
      x += w;
    });
    g += `<line x1="616" y1="18" x2="616" y2="70" stroke="var(--bad)" stroke-width="3"/><text class="txt sm b" x="616" y="84" text-anchor="end">${esc(P('Budget Limit ₹100', 'बजट सीमा ₹100'))}</text>`;
    items.forEach((it, i) => {
      const y = 104 + i * 38;
      g += `<text class="txt sm b" x="24" y="${y + 18}">${esc(it.lab)}</text>`
        + `<rect x="140" y="${y}" width="${(it.val / 100) * 420}" height="24" rx="4" fill="${it.fill}"/>`
        + `<text class="txt sm" x="${148 + (it.val / 100) * 420}" y="${y + 17}">${rs(it.val)}</text>`;
    });
    const svg = `<svg viewBox="0 0 640 225" class="chart" role="img" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
    return {
      plate: {
        src: 'assets/images/plates/t08-choices.jpg',
        en: 'Everyday student scarcity trade-offs — tap pins to compare study-first vs balanced vs overspent ₹100 plans.',
        hi: 'दैनिक छात्र चयन — ₹100 के बजट में अध्ययन, संतुलन व अधिक खर्च की तुलना हेतु पिन पर टैप करें।',
        spots: [
          { x: 24, y: 54, en: 'Books Priority (₹60 + ₹20 + ₹20)', hi: 'पुस्तक प्राथमिकता (₹60+20+20)', detail: b('One possible plan uses all ₹100; another person may rank alternatives differently.', 'एक संभावित योजना में पूरे ₹100 बँटते हैं; कोई दूसरा विकल्प अलग क्रम में रख सकता है।'), set: { books: 60, snack: 20, data: 20 } },
          { x: 54, y: 48, en: '₹10 Savings Buffer (₹40+30+20)', hi: '₹10 बचत बफर (₹40+30+20)', detail: b('Leaves ₹10 unallocated, which could be set aside for an unexpected expense.', '₹10 बिना आवंटन के रहते हैं; इन्हें आकस्मिक खर्च के लिए रखा जा सकता है।'), set: { books: 40, snack: 30, data: 20 } },
          { x: 80, y: 58, en: '₹130 Deficit Trap', hi: '₹130 बजट घाटा जाल', detail: b('Wanting ₹50 books + ₹40 snacks + ₹40 data overshoots ₹100 — scarcity bites!', 'सभी इच्छाएँ एक साथ पूरी करने पर ₹30 का घाटा दिखता है!'), set: { books: 50, snack: 40, data: 40 } },
        ],
      },
      svg,
      aria: P(`Allocated ${r.spent} of 100 rupees; ${r.over ? 'over budget' : `${r.remaining} unallocated`}.`, `₹100 में ${r.spent} आवंटित; ${r.over ? 'बजट से अधिक' : `${r.remaining} अभी नहीं बाँटे`}।`),
      lines: [
        r.over
          ? { en: `Overspent by ${rs(-r.remaining)}! Total is ${rs(r.spent)} against ₹100 budget — scarcity means you must cut one choice to pay for another.`, hi: `${rs(-r.remaining)} अधिक खर्च हो गए! ₹100 के बजट में कुल खर्च ${rs(r.spent)} है — दुर्लभता के कारण एक विकल्प घटाना ही होगा।`, cls: 'warn' }
          : { en: `Allocated ${rs(r.spent)} of ₹100; ${rs(r.remaining)} is still unallocated. Different people can value these choices differently.`, hi: `₹100 में से ${rs(r.spent)} आवंटित; ${rs(r.remaining)} अभी नहीं बाँटे गए हैं। अलग लोग विकल्पों को अलग महत्व दे सकते हैं।`, cls: 'balanced' },
        { en: 'If all ₹100 is already allocated, adding ₹30 to snacks requires changing the plan. Opportunity cost is the value of the best alternative given up, which depends on the chooser.', hi: 'यदि पूरे ₹100 पहले ही बँट चुके हैं, तो नाश्ते पर ₹30 बढ़ाने के लिए योजना बदलनी होगी। अवसर-लागत छोड़े गए सबसे अच्छे विकल्प का मूल्य है, जो चुनने वाले पर निर्भर है।', cls: 'note' },
      ],
    };
  },
  discover: [
    b('Push Snacks to ₹60 while Books are ₹50 and notice the budget deficit warning.', 'नाश्ता ₹60 और पुस्तकें ₹50 करके बजट-घाटे की चेतावनी देखें।'),
    b('If you double Data, adjust the other sliders to keep the total at ₹100. Which option did you give up?', 'डेटा दोगुना करें और कुल ₹100 रखने के लिए अन्य स्लाइडर बदलें। आपने कौन-सा विकल्प छोड़ा?'),
  ],
  predictions: [{
    id: 'p1',
    stem: b('You have ₹100 total and already plan ₹60 for books and ₹20 for data. What is the maximum you can spend on snacks without going into deficit?', 'कुल ₹100 में से ₹60 पुस्तकों और ₹20 डेटा के लिए तय हैं। घाटे के बिना नाश्ते पर अधिकतम कितना खर्च हो सकता है?'),
    options: [opt('20', '₹20', '₹20'), opt('40', '₹40', '₹40')],
    run: (S) => { S.books = 60; S.data = 20; S.snack = 20; return M.scarcityAllocate({ budget: 100, ...S }).remaining === 0 ? '20' : '40'; },
    explain: () => b('₹100 − ₹60 − ₹20 = ₹20. Scarcity forces choices within available resources.', '₹100 − ₹60 − ₹20 = ₹20। सीमित संसाधनों में चयन अनिवार्य है।'),
  }],
  exit: [{
    id: 'e1',
    stem: b('What does "opportunity cost" mean when making a choice?', 'चयन करते समय “अवसर-लागत” का क्या अर्थ है?'),
    correct: 'next',
    options: [
      opt('next', 'The value of the next-best alternative you give up when you choose one option.', 'एक विकल्प चुनने पर छोड़े गए अगले सर्वोत्तम विकल्प का मूल्य।'),
      opt('zero', 'Everything costs ₹0 once you decide.', 'निर्णय लेने के बाद हर चीज़ ₹0 की हो जाती है।', b('Even time and budget spent on one option carry the cost of what else they could have done.', 'किसी एक विकल्प पर खर्च समय या धन दूसरे अवसर के त्याग की लागत रखता है।')),
    ],
    explain: b('Scarcity creates trade-offs; opportunity cost measures the best foregone alternative.', 'दुर्लभता चयन की स्थिति बनाती है; अवसर-लागत त्यागे गए सर्वोत्तम विकल्प को मापती है।'),
    hint: b('Read the second readout line on the budget bar.', 'बजट पट्टी के नीचे दूसरी पंक्ति देखें।'),
  }],
  reflect: b('When you spend 1 extra hour scrolling videos before an exam, what is the opportunity cost of that hour?', 'परीक्षा से पहले 1 अतिरिक्त घंटा वीडियो देखने की अवसर-लागत क्या है?'),
};

// ------------------------------------------------------------------ T08.L3 What / How / For Whom flow
export const econFlow = {
  id: 'T08.L3',
  objective: b('Analyse the three central problems of every economy — What to produce, How to produce (labour vs machines), and For Whom to produce.', 'हर अर्थव्यवस्था की तीन केंद्रीय समस्याओं का विश्लेषण करें — क्या उत्पादन करें, कैसे उत्पादन करें (श्रम बनाम मशीनें), और किसके लिए उत्पादन करें।'),
  note: { kind: 'fictional', en: 'A schematic flow with invented jobs and capacity indices; these numbers are not evidence, measurements or forecasts of employment or growth.', hi: 'काल्पनिक रोज़गार और क्षमता सूचकों वाला योजनाबद्ध प्रवाह; ये संख्याएँ प्रमाण, माप या रोज़गार अथवा वृद्धि का पूर्वानुमान नहीं हैं।' },
  init: () => ({ consumerShare: 65, labourShare: 60, equityTransfer: 30 }),
  controls: [
    { id: 'consumerShare', type: 'slider', label: b('WHAT: Food & daily goods vs Capital machines (%)', 'क्या: दैनिक उपभोग बनाम मशीनें (%)'), min: 20, max: 90, step: 5 },
    { id: 'labourShare', type: 'slider', label: b('HOW: Labour-intensive vs Automated (%)', 'कैसे: श्रम-प्रधान बनाम स्वचालित (%)'), min: 10, max: 90, step: 5 },
    { id: 'equityTransfer', type: 'slider', label: b('FOR WHOM: Broad wage & welfare reach (%)', 'किसके लिए: व्यापक मज़दूरी व कल्याण पहुँच (%)'), min: 10, max: 90, step: 5 },
  ],
  view(S) {
    const jobs = Math.round(40 + S.labourShare * 0.55);
    const futureGrowth = Math.round(100 - S.consumerShare * 0.5 + (100 - S.labourShare) * 0.25);
    const nodes = [
      { id: 'hh', fx: 105, fy: 130, rw: 120, fill: '#dcfce7', stroke: '#15803d', label: P('Households', 'परिवार') },
      { id: 'what', fx: 255, fy: 60, rw: 126, fill: '#dbeafe', stroke: '#0369a1', label: P(`WHAT ${S.consumerShare}%`, `क्या ${S.consumerShare}%`) },
      { id: 'how', fx: 410, fy: 60, rw: 124, fill: '#fef3c7', stroke: '#b45309', label: P(`HOW ${S.labourShare}%`, `कैसे ${S.labourShare}%`) },
      { id: 'prod', fx: 535, fy: 130, rw: 120, fill: '#dbeafe', stroke: '#1d4ed8', label: P('Producers', 'उत्पादक') },
      { id: 'whom', fx: 320, fy: 205, rw: 146, fill: '#f3e8ff', stroke: '#7e22ce', label: P(`FOR WHOM ${S.equityTransfer}%`, `किसके लिए ${S.equityTransfer}%`) },
    ];
    const links = [
      { source: 'hh', target: 'what', label: P('demand', 'माँग') },
      { source: 'what', target: 'how', label: P('mix', 'मिश्रण') },
      { source: 'how', target: 'prod', label: P('tech', 'तकनीक') },
      { source: 'prod', target: 'whom', label: P('output', 'उत्पादन') },
      { source: 'whom', target: 'hh', label: P('wages & goods', 'आय व वस्तुएँ') },
    ];
    const svg = forceGraphSvg({ w: 640, h: 265, nodes, links, activeId: 'prod', aria: P('Three central economic problems flow', 'अर्थव्यवस्था की तीन केंद्रीय समस्याओं का प्रवाह') });
    return {
      plate: {
        src: 'assets/images/plates/t08-economy.jpg',
        en: 'Interconnected local economy: weavers, grain traders & workshops — tap pins to shift What, How & For Whom.',
        hi: 'स्थानीय अर्थव्यवस्था: बुनकर, अनाज व्यापारी व कार्यशालाएँ — क्या, कैसे व किसके लिए बदलने हेतु पिन पर टैप करें।',
        spots: [
          { x: 24, y: 50, en: 'WHAT: Consumer Food vs Machines', hi: 'क्या: दैनिक उपभोग बनाम मशीनें', detail: b('The toy assumes a trade-off between present goods and future capacity; real investment outcomes depend on many factors.', 'यह मॉडल वर्तमान वस्तुओं और भावी क्षमता में अदला-बदली मानता है; वास्तविक निवेश परिणाम अनेक बातों पर निर्भर हैं।'), set: { consumerShare: 80, labourShare: 60 } },
          { x: 52, y: 48, en: 'HOW: Handloom Labour vs Factory', hi: 'कैसे: श्रम-प्रधान बनाम स्वचालित', detail: b('The invented jobs index rises with labour share. It does not forecast real jobs.', 'काल्पनिक रोज़गार सूचक श्रम हिस्से के साथ बढ़ता है। यह वास्तविक रोज़गार का पूर्वानुमान नहीं है।'), set: { labourShare: 85 } },
          { x: 78, y: 56, en: 'FOR WHOM: Broad Wage & Welfare', hi: 'किसके लिए: व्यापक मज़दूरी व समता', detail: b('Stronger wage & welfare reach spreads produced goods to vulnerable homes.', 'मज़दूरी व कल्याण का विस्तार ज़रूरतमंद परिवारों तक पहुँच बढ़ाता है।'), set: { equityTransfer: 80 } },
        ],
      },
      svg,
      aria: P(`Model: ${S.consumerShare}% consumer goods, ${S.labourShare}% labour share, ${S.equityTransfer}% selected reach. Invented indices: jobs ${jobs}, capacity ${futureGrowth}; not forecasts.`, `मॉडल: ${S.consumerShare}% उपभोग वस्तुएँ, ${S.labourShare}% श्रम हिस्सा, ${S.equityTransfer}% चयनित पहुँच। काल्पनिक सूचक: रोज़गार ${jobs}, क्षमता ${futureGrowth}; पूर्वानुमान नहीं।`),
      lines: [
        { en: `Invented model indicators (not measured outcomes): jobs ${jobs} points | capacity ${futureGrowth} points | selected reach ${S.equityTransfer}%.`, hi: `काल्पनिक मॉडल संकेतक (मापे परिणाम नहीं): रोज़गार ${jobs} अंक | क्षमता ${futureGrowth} अंक | चयनित पहुँच ${S.equityTransfer}%।`, cls: 'balanced' },
        { en: 'Economists study how production (using land, labour, capital, enterprise), distribution (who receives income), and consumption balance present needs against future growth.', hi: 'अर्थशास्त्री अध्ययन करते हैं कि उत्पादन, वितरण और उपभोग वर्तमान आवश्यकताओं तथा भविष्य की वृद्धि के बीच संतुलन कैसे बनाते हैं।', cls: 'note' },
      ],
    };
  },
  discover: [
    b('Slide HOW toward labour-intensive (85%) vs automated (15%) and watch the immediate jobs vs capacity indices.', '“कैसे” को श्रम-प्रधान (85%) बनाम स्वचालित (15%) पर ले जाकर रोज़गार और क्षमता के सूचकांक देखें।'),
    b('Why is producing more machines today sometimes necessary to make more consumer goods tomorrow?', 'कल अधिक उपभोग वस्तुएँ बनाने के लिए आज मशीनों का उत्पादन क्यों आवश्यक हो सकता है?'),
  ],
  predictions: [{
    id: 'p1', revision: 't08-step8',
    stem: b('The toy switches from 85% to 15% labour share. What risk might displaced workers face if no other work is available?', 'मॉडल में श्रम हिस्सा 85% से 15% होता है। यदि दूसरा काम न मिले तो विस्थापित श्रमिकों को क्या जोखिम हो सकता है?'),
    options: [opt('unemp', 'Short-term worker unemployment risk if workers are not absorbed elsewhere', 'अल्पकाल में श्रमिक बेरोज़गारी का जोखिम'), opt('all', 'Every unskilled worker gets hired inside the automated line', 'प्रत्येक अकुशल श्रमिक स्वचालित लाइन में भर्ती होता है')],
    run: (S) => { S.labourShare = 15; return 'unemp'; },
    explain: () => b('Automation can displace some tasks, but actual employment also depends on new work, training and other conditions; these toy indices do not predict it.', 'स्वचालन कुछ काम बदल सकता है, पर वास्तविक रोज़गार नए काम, प्रशिक्षण और अन्य परिस्थितियों पर भी निर्भर है; काल्पनिक सूचक इसका पूर्वानुमान नहीं करते।'),
  }],
  exit: [{
    id: 'e1',
    stem: b('Which question asks about "For Whom to Produce"?', '“किसके लिए उत्पादन करें” किस प्रश्न से संबंधित है?'),
    correct: 'dist',
    options: [
      opt('dist', 'How goods and incomes are distributed across rich, middle, and vulnerable households.', 'उत्पादित वस्तुएँ और आय विभिन्न वर्गों व परिवारों में कैसे वितरित होती हैं।'),
      opt('soil', 'Which type of soil grows wheat fastest.', 'किस मिट्टी में गेहूँ सबसे तेज़ उगता है।', b('Soil/technique is "How to produce"; distribution is "For whom".', 'तकनीक “कैसे” है; वितरण “किसके लिए” है।')),
    ],
    explain: b('“For whom to produce” addresses equity, wages, prices, and social safety nets.', '“किसके लिए उत्पादन करें” समता, मज़दूरी और वितरण व्यवस्था से जुड़ा है।'),
    hint: b('Check the bottom purple node in the circular flow.', 'चक्र में नीचे बैंगनी नोड देखें।'),
  }],
  reflect: b('In your town or village, give one example of a labour-intensive job and one capital-intensive job.', 'अपने शहर या गाँव में श्रम-प्रधान और पूंजी-प्रधान कार्य का एक-एक उदाहरण दें।'),
};

// ------------------------------------------------------------------ T08.L4 Economic Systems Comparison
const ESYS = [
  { id: 'market', en: 'Free Market Economy', hi: 'मुक्त बाज़ार अर्थव्यवस्था', owner: 'Private individuals and firms', ownerHi: 'निजी व्यक्ति और कंपनियाँ', price: 'Prices influenced by demand and supply', priceHi: 'माँग और पूर्ति से प्रभावित कीमतें', pro: 'Decentralised choice can encourage innovation', proHi: 'विकेंद्रित चुनाव नवाचार को बढ़ावा दे सकते हैं', risk: 'Inequality and under-provision of public goods', riskHi: 'असमानता और सार्वजनिक वस्तुओं की कमी का जोखिम' },
  { id: 'planned', en: 'Centrally Planned Economy', hi: 'केंद्रीयकृत नियोजित अर्थव्यवस्था', owner: 'State owns or directs key resources', ownerHi: 'राज्य प्रमुख संसाधनों का स्वामी या निर्देशक', price: 'Planners set targets and some prices', priceHi: 'योजनाकार लक्ष्य और कुछ कीमतें तय करते हैं', pro: 'Can coordinate shared priorities', proHi: 'साझी प्राथमिकताओं का समन्वय कर सकती है', risk: 'Planners may lack local information', riskHi: 'योजनाकारों के पास स्थानीय जानकारी कम हो सकती है' },
  { id: 'mixed', en: 'Mixed Economy (e.g., India)', hi: 'मिश्रित अर्थव्यवस्था (जैसे भारत)', owner: 'Private enterprise and public sector', ownerHi: 'निजी उद्यम और सार्वजनिक क्षेत्र', price: 'Market prices with public rules and provision', priceHi: 'सार्वजनिक नियम व सेवाओं के साथ बाज़ार मूल्य', pro: 'Can combine market activity and public provision', proHi: 'बाज़ार गतिविधि और सार्वजनिक सेवाएँ जोड़ सकती है', risk: 'Policy and implementation may be uneven', riskHi: 'नीति और क्रियान्वयन असमान हो सकते हैं' },
];
export const econSystems = {
  id: 'T08.L4',
  objective: b('Compare free-market, centrally planned, and mixed economic systems on ownership, price signals, efficiency, and equity.', 'स्वामित्व, मूल्य तंत्र, दक्षता और समता के आधार पर मुक्त बाज़ार, केंद्रीयकृत नियोजित और मिश्रित आर्थिक प्रणालियों की तुलना करें।'),
  note: { kind: 'schematic', en: 'Qualitative ideal types, not a numerical ranking. Real economies blend features and outcomes vary by time and policy.', hi: 'गुणात्मक आदर्श रूप, संख्यात्मक रैंकिंग नहीं। वास्तविक अर्थव्यवस्थाएँ तत्वों का मिश्रण हैं और परिणाम समय व नीतियों से बदलते हैं।' },
  init: () => ({ sys: 'mixed' }),
  controls: [
    { id: 'sys', type: 'chips', label: b('Economic system', 'आर्थिक प्रणाली'), options: ESYS.map((e) => opt(e.id, e.en, e.hi)) },
  ],
  view(S) {
    const e = ESYS.find((x) => x.id === S.sys) || ESYS[2];
    // Large numbered prompts remain legible on narrow screens; the matching text follows in the readout.
    const g = [1, 2, 3].map((number, i) => `<rect x="${20 + i * 205}" y="25" width="190" height="100" rx="10" fill="#e5effa" stroke="#1d4ed8"/><text class="txt b" x="${115 + i * 205}" y="92" text-anchor="middle">${number}</text>`).join('');
    const svg = `<svg viewBox="0 0 640 155" class="chart t08-systems" role="img" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
    return {
      plate: {
        src: 'assets/images/plates/t08-economy.jpg',
        en: 'Market stalls, public cooperatives & mixed shops — tap pins to compare Free Market, Centrally Planned & Mixed economies.',
        hi: 'बाज़ार दुकानें व सार्वजनिक उपक्रम — मुक्त बाज़ार, नियोजित व मिश्रित अर्थव्यवस्था की तुलना हेतु पिन पर टैप करें।',
        spots: [
          { x: 24, y: 52, en: 'Free Market (Private Price Signals)', hi: 'मुक्त बाज़ार अर्थव्यवस्था', detail: b('Private decisions and prices are central; inequality and public-goods provision remain questions.', 'निजी निर्णय और मूल्य प्रमुख हैं; असमानता और सार्वजनिक वस्तुओं की उपलब्धता पर प्रश्न रहते हैं।'), set: { sys: 'market' } },
          { x: 52, y: 46, en: 'Centrally Planned (State Targets)', hi: 'केंद्रीयकृत नियोजित प्रणाली', detail: b('Planners coordinate production but may lack local information; results vary.', 'योजनाकार उत्पादन का समन्वय करते हैं, पर स्थानीय सूचना की कमी हो सकती है; परिणाम बदलते हैं।'), set: { sys: 'planned' } },
          { x: 78, y: 54, en: 'Mixed Economy (India’s Path)', hi: 'मिश्रित अर्थव्यवस्था (भारत)', detail: b('Pairs private markets & startups with public infrastructure & safety nets.', 'निजी बाज़ार व स्टार्टअप के साथ सार्वजनिक अवसंरचना व सुरक्षा-जाल।'), set: { sys: 'mixed' } },
        ],
      },
      svg,
      aria: P(`${e.en}: three numbered prompts: who decides, potential strength, potential risk. Details follow.`, `${e.hi}: तीन क्रमांकित प्रश्न: कौन तय करता है, संभावित शक्ति और जोखिम। आगे विवरण है।`),
      lines: [
        { en: `1. Who decides? Ownership: ${e.owner}. Prices: ${e.price}.`, hi: `1. कौन तय करता है? स्वामित्व: ${e.ownerHi}। कीमतें: ${e.priceHi}।`, cls: 'note' },
        { en: `2. Possible strength: ${e.pro}.`, hi: `2. संभावित शक्ति: ${e.proHi}।`, cls: 'note' },
        { en: `3. Possible risk: ${e.risk}.`, hi: `3. संभावित जोखिम: ${e.riskHi}।`, cls: 'note' },
        { en: 'India is a mixed economy with private and public roles. These are ideal types, not guaranteed outcomes or scores.', hi: 'भारत मिश्रित अर्थव्यवस्था है जिसमें निजी और सार्वजनिक भूमिकाएँ हैं। ये आदर्श रूप हैं, निश्चित परिणाम या अंक नहीं।', cls: 'note' },
      ],
    };
  },
  discover: [
    b('Compare who decides, and one possible strength and risk across the three systems.', 'तीनों प्रणालियों में कौन निर्णय लेता है तथा संभावित शक्ति और जोखिम की तुलना करें।'),
    b('Why do pure free markets struggle to supply streetlights or clean rural water on their own?', 'शुद्ध मुक्त बाज़ार अकेले स्ट्रीटलाइट या ग्रामीण पेयजल उपलब्ध कराने में क्यों जूझते हैं?'),
  ],
  predictions: [{
    id: 'p1',
    stem: b('In a mixed economy like India, who provides roads, courts, and targeted food support alongside private businesses?', 'भारत जैसी मिश्रित अर्थव्यवस्था में निजी व्यवसायों के साथ-साथ सड़कें, न्यायालय और लक्षित खाद्य सहायता कौन प्रदान करता है?'),
    options: [opt('mix', 'Public institutions (government) alongside regulated private markets', 'नियमित निजी बाज़ारों के साथ सार्वजनिक संस्थाएँ (सरकार)'), opt('none', 'Nobody — private firms build every public court', 'कोई नहीं — हर सार्वजनिक न्यायालय निजी कंपनियाँ बनाती हैं')],
    run: (S) => { S.sys = 'mixed'; return 'mix'; },
    explain: () => b('Mixed economies pair market dynamism with public regulation, infrastructure, and welfare.', 'मिश्रित अर्थव्यवस्था बाज़ार की गतिशीलता को सार्वजनिक ढाँचे, नियमन और कल्याण से जोड़ती है।'),
  }],
  exit: [{
    id: 'e1',
    stem: b('Which challenge can arise in a strictly centrally planned system with no private price signals?', 'निजी मूल्य संकेतों के बिना पूर्णतः केंद्रीयकृत नियोजित प्रणाली में कौन-सी चुनौती आ सकती है?'),
    correct: 'info',
    options: [
      opt('info', 'Central planners may struggle to know local shortages and surpluses in real time; queues or waste can result.', 'केंद्रीय योजनाकारों को स्थानीय कमी व अधिशेष की समय पर जानकारी मिलना कठिन हो सकता है; कतारें या अपव्यय हो सकते हैं।'),
      opt('over', 'Too many private startups compete.', 'बहुत अधिक निजी स्टार्टअप प्रतिस्पर्धा करते हैं।', b('Private firms do not drive a strictly centrally planned system.', 'पूर्णतः नियोजित प्रणाली निजी प्रतिस्पर्धा पर नहीं चलती।')),
    ],
    explain: b('Market prices can convey information about scarcity, but may also be distorted or leave needs unmet. Coordinating many local needs is a challenge for planners.', 'बाज़ार कीमतें दुर्लभता की जानकारी दे सकती हैं, पर विकृत भी हो सकती हैं या ज़रूरतें अधूरी रह सकती हैं। अनेक स्थानीय ज़रूरतों का समन्वय योजनाकारों के लिए चुनौती है।'),
    hint: b('Click Centrally Planned and inspect the Risk line.', 'केंद्रीयकृत नियोजित चुनें और जोखिम पंक्ति पढ़ें।'),
  }],
  reflect: b('Name one service in your city that is best run privately and one best run as a public service.', 'अपने शहर की एक सेवा बताएँ जो निजी क्षेत्र में बेहतर चलती है और एक जो सार्वजनिक सेवा के रूप में।'),
};

// ------------------------------------------------------------------ T08.L5 Household shock & social safety net
export const safetyNet = {
  id: 'T08.L5',
  objective: b('Explore how an assumed share of support can reduce a fictional household’s out-of-pocket shock; discuss limits of real safety nets.', 'देखें कि सहायता का माना गया हिस्सा काल्पनिक परिवार का खर्च कैसे घटा सकता है और वास्तविक सुरक्षा-जाल की सीमाओं पर चर्चा करें।'),
  note: { kind: 'fictional', en: 'Invented bill and coverage percentages, not benefits of a real programme. The arithmetic assumes ₹6,000 savings available for this bill and ignores other needs, debt terms and eligibility.', hi: 'काल्पनिक बिल और सहायता प्रतिशत, किसी असली योजना के लाभ नहीं। गणना मानती है कि बिल के लिए ₹6,000 बचत उपलब्ध है और अन्य ज़रूरतें, ऋण शर्तें व पात्रता नहीं देखती।' },
  init: () => ({ shockCost: 12000, safetyNetCoverPct: 60 }),
  controls: [
    { id: 'shockCost', type: 'slider', label: b('Sudden medical / crop shock cost (₹)', 'अचानक चिकित्सा / फसल नुकसान लागत (₹)'), min: 2000, max: 20000, step: 1000, fmt: rs },
    { id: 'safetyNetCoverPct', type: 'slider', label: b('Public safety-net coverage (%)', 'सामाजिक सुरक्षा-जाल सहायता (%)'), min: 0, max: 90, step: 10, fmt: (v) => `${v}%` },
  ],
  view(S) {
    const r = M.householdShock({ monthlyIncome: 12000, savings: 6000, ...S });
    const g = `<text class="txt sm" x="24" y="42">${esc(P('Household Buffer (Savings ₹6,000)', 'पारिवारिक बचत (₹6,000)'))}</text>`
      + `<rect x="24" y="54" width="174" height="28" rx="4" fill="#15803d"/>`
      + `<text class="txt sm" x="24" y="114">${esc(P('Out-of-Pocket Shock after Safety Net', 'सुरक्षा-जाल के बाद जेब पर भार'))}</text>`
      + `<rect x="24" y="126" width="${Math.min(580, (r.netShock / 20000) * 580)}" height="28" rx="4" fill="${r.debtRisk ? '#b91c1c' : '#0369a1'}"/>`
      + `<text class="txt sm b" x="604" y="168" text-anchor="end">${rs(r.netShock)}</text>`
      + `<rect x="24" y="172" width="592" height="40" rx="8" fill="${r.debtRisk ? '#fee2e2' : '#dcfce7'}" stroke="${r.debtRisk ? '#b91c1c' : '#15803d'}"/>`
      + `<text class="txt b t08-light-label" x="320" y="197" text-anchor="middle">${esc(r.debtRisk ? P(`Gap after savings: ${rs(r.gap)} (not a loan prediction)`, `बचत के बाद कमी: ${rs(r.gap)} (ऋण अनुमान नहीं)`) : P(`Savings remaining in model: ${rs(r.savingsLeft)}`, `मॉडल में शेष बचत: ${rs(r.savingsLeft)}`))}</text>`;
    return {
      plate: {
        src: 'assets/images/plates/t08-safetynet.jpg',
        en: 'Solar village health clinic, community grain bank & women’s SHG — tap pins to stress-test a household against medical shocks.',
        hi: 'ग्राम स्वास्थ्य केंद्र, सामुदायिक अन्न बैंक व महिला सहायता समूह — संकट सुरक्षा-जाल परखने हेतु पिन पर टैप करें।',
        spots: [
          { x: 42, y: 24, en: 'Public Health Clinic (70% Cover)', hi: 'जन-स्वास्थ्य केंद्र (70% सुरक्षा)', detail: b('If an invented scheme covers 70% of ₹15,000, the remaining bill is ₹4,500; actual cover and eligibility vary.', 'यदि काल्पनिक सहायता ₹15,000 का 70% दे तो शेष बिल ₹4,500 है; वास्तविक सहायता और पात्रता अलग हो सकती है।'), set: { shockCost: 15000, safetyNetCoverPct: 70 } },
          { x: 62, y: 25, en: 'Grain Bank Buffer (₹8,000 Shock)', hi: 'सामुदायिक अन्न बैंक (₹8,000 संकट)', detail: b('This toy assumes 50% of an ₹8,000 cost is covered; it does not represent a specific ration scheme.', 'यह मॉडल ₹8,000 की लागत में 50% सहायता मानता है; यह किसी खास राशन योजना को नहीं दर्शाता।'), set: { shockCost: 8000, safetyNetCoverPct: 50 } },
          { x: 48, y: 72, en: 'Zero assumed cover (0%)', hi: 'मानी गई सहायता शून्य (0%)', detail: b('With no cover, ₹15,000 exceeds the ₹6,000 assumed savings by ₹9,000; how the family responds is not modelled.', 'बिना सहायता ₹15,000 का बिल मानी गई ₹6,000 बचत से ₹9,000 अधिक है; परिवार क्या करेगा यह मॉडल नहीं बताता।'), set: { shockCost: 15000, safetyNetCoverPct: 0 } },
        ],
      },
      svg: `<svg viewBox="0 0 640 225" class="chart" role="img" xmlns="http://www.w3.org/2000/svg">${g}</svg>`,
      aria: P(`Assumed out-of-pocket bill ${rs(r.netShock)}; gap after savings ${rs(r.gap)}; not a loan prediction.`, `माना गया जेब से खर्च ${rs(r.netShock)}; बचत के बाद कमी ${rs(r.gap)}; यह ऋण अनुमान नहीं।`),
      lines: [
        { en: `Raw shock ${rs(S.shockCost)} − ${S.safetyNetCoverPct}% safety net = ${rs(r.netShock)} paid by family (savings ₹6,000).`, hi: `कुल संकट ${rs(S.shockCost)} − ${S.safetyNetCoverPct}% सहायता = परिवार द्वारा देय ${rs(r.netShock)} (बचत ₹6,000)।`, cls: r.debtRisk ? 'warn' : 'balanced' },
        { en: 'Social protection can reduce hardship, but coverage, access, other costs and outcomes vary. A gap is not automatically a loan, and this model cannot predict poverty or recovery time.', hi: 'सामाजिक सुरक्षा कठिनाई घटा सकती है, पर सहायता, पहुँच, अन्य खर्च और परिणाम अलग होते हैं। कमी अपने आप ऋण नहीं है; यह मॉडल गरीबी या उबरने का समय नहीं बताता।', cls: 'note' },
      ],
    };
  },
  discover: [
    b('Set the cost to ₹15,000 and compare the gap after assumed savings at 0% and 60% cover. What other household needs are missing?', '₹15,000 खर्च पर 0% और 60% सहायता के बाद मानी गई बचत से तुलना करें। परिवार की कौन-सी अन्य ज़रूरतें छूटी हैं?'),
    b('Why can support reduce hardship without guaranteeing that every family avoids debt?', 'सहायता कठिनाई कैसे घटा सकती है, भले ही वह हर परिवार के ऋण से बचने की गारंटी न दे?'),
  ],
  predictions: [{
    id: 'p1', revision: 't08-step8',
    stem: b('A family has ₹6,000 saved when a ₹15,000 medical shock hits. With 60% public health coverage, what is their out-of-pocket cost?', 'एक परिवार के पास ₹6,000 बचत है और ₹15,000 का चिकित्सा खर्च आता है। 60% जन-स्वास्थ्य सुरक्षा मिलने पर उन्हें अपनी जेब से कितना देना होगा?'),
    options: [opt('6k', '₹6,000 remains to be paid in this example', 'इस उदाहरण में ₹6,000 देना बाकी'), opt('15k', '₹15,000 remains to be paid', '₹15,000 देना बाकी')],
    run: (S) => { S.shockCost = 15000; S.safetyNetCoverPct = 60; return M.householdShock({ monthlyIncome: 12000, savings: 6000, ...S }).debtRisk ? '15k' : '6k'; },
    explain: () => b('40% of ₹15,000 = ₹6,000. The assumed savings equal that bill; this does not guarantee the household has no other costs or debts.', '₹15,000 का 40% = ₹6,000। मानी गई बचत इस बिल के बराबर है; इससे अन्य खर्च या ऋण न होने की गारंटी नहीं है।'),
  }],
  exit: [{
    id: 'e1',
    stem: b('What is the primary goal of a social safety net in a welfare economy?', 'कल्याणकारी अर्थव्यवस्था में सामाजिक सुरक्षा-जाल का मुख्य लक्ष्य क्या है?'),
    correct: 'floor',
    options: [
      opt('floor', 'Protect households against catastrophic shocks (illness, job loss, crop failure) so families stay above a dignified floor.', 'परिवारों को अचानक आपदा, बीमारी या फसल नुकसान से बचाकर गरिमापूर्ण जीवन स्तर बनाए रखना।'),
      opt('ban', 'Ban private savings accounts.', 'निजी बचत खातों पर रोक लगाना।', b('Safety nets work alongside personal savings.', 'सुरक्षा-जाल निजी बचत के पूरक हैं।')),
    ],
    explain: b('Safety nets aim to cushion shocks, but outcomes depend on access, adequacy and the household’s other circumstances.', 'सुरक्षा-जाल का उद्देश्य संकट का असर घटाना है, पर परिणाम पहुँच, पर्याप्तता और परिवार की अन्य परिस्थितियों पर निर्भर हैं।'),
    hint: b('Check what changed when you raised the coverage slider.', 'कवरेज स्लाइडर बढ़ाने पर जो बदला, उसे देखें।'),
  }],
  reflect: b('Name one social safety-net programme in India (e.g. midday meal, public rations, health insurance) and how it helps families.', 'भारत की किसी एक सामाजिक सुरक्षा योजना (जैसे मध्याह्न भोजन, राशन प्रणाली, स्वास्थ्य बीमा) का नाम लिखें और बताएँ वह कैसे मदद करती है।'),
};
