// T06 Democracy lab specs (L1–L4).
import * as I from '../../engines/domain/institutions.js';
import * as S_ from '../../engines/domain/society.js';
import { worldMapSvg, forceGraphSvg } from '../../engines/viz.js';
import { esc } from '../../core/dom.js';
import { pair as P } from '../../core/i18n.js';

const b = (en, hi) => ({ en, hi });
const opt = (id, en, hi, why) => ({ id, en, hi, ...(why ? { why } : {}) });

// ------------------------------------------------------------------ T06.L1 Democracy concept map & case assessor
const DEMO_CASES = [
  { id: 'custom', en: 'Custom test case', hi: 'कस्टम परीक्षण केस' },
  { id: 'full', en: 'Case A: Fair elections + Free press', hi: 'केस A: निष्पक्ष चुनाव + स्वतंत्र मीडिया', freeVote: true, multipleParties: true, freeMedia: true, equalLaw: true },
  { id: 'oneparty', en: 'Case B: Single-party rule', hi: 'केस B: एक-दलीय शासन', freeVote: true, multipleParties: false, freeMedia: false, equalLaw: false },
  { id: 'pressban', en: 'Case C: Elections held, press silenced', hi: 'केस C: चुनाव पर मीडिया पर रोक', freeVote: true, multipleParties: true, freeMedia: false, equalLaw: true },
];
const DEMOCRACY_FIELDS = ['freeVote', 'multipleParties', 'freeMedia', 'equalLaw'];
function presetPatch(id) {
  const preset = DEMO_CASES.find((item) => item.id === id && id !== 'custom');
  if (!preset) return { preset: 'custom' };
  return { preset: id, ...Object.fromEntries(DEMOCRACY_FIELDS.map((key) => [key, preset[key]])) };
}
const choosePreset = (state, id) => Object.assign(state, presetPatch(id));
const customiseCase = (state) => { state.preset = 'custom'; };
export const democracyMap = {
  id: 'T06.L1',
  objective: b('Test whether a fictional polity meets all four core criteria of democracy: free elections, multi-party choice, free media, and equal rule of law.', 'परखें कि कोई काल्पनिक राज्यतंत्र लोकतंत्र के चारों मुख्य मानदंड पूरे करता है या नहीं: स्वतंत्र चुनाव, बहु-दलीय विकल्प, स्वतंत्र मीडिया और कानून के समक्ष समानता।'),
  note: { kind: 'fictional', en: 'Four simplified checks in invented cases; a score is not a complete test or measurement of any real democracy.', hi: 'काल्पनिक मामलों में चार सरल जाँच; अंक किसी वास्तविक लोकतंत्र का पूरा परीक्षण या माप नहीं है।' },
  init: () => ({ preset: 'full', freeVote: true, multipleParties: true, freeMedia: true, equalLaw: true }),
  prepareState(S) { if (S.preset !== 'custom') choosePreset(S, S.preset); },
  controls: [
    { id: 'preset', type: 'chips', label: b('Load case', 'केस चुनें'), options: DEMO_CASES.map((c) => opt(c.id, c.en, c.hi)), afterChange: choosePreset },
    { id: 'freeVote', type: 'toggle', label: b('Universal vote with equal weight', 'सार्वभौमिक मत और समान मूल्य'), afterChange: customiseCase },
    { id: 'multipleParties', type: 'toggle', label: b('Free election with real opposition choice', 'स्वतंत्र चुनाव व विपक्ष का वास्तविक विकल्प'), afterChange: customiseCase },
    { id: 'freeMedia', type: 'toggle', label: b('Independent courts & free media', 'स्वतंत्र न्यायालय व मुक्त मीडिया'), afterChange: customiseCase },
    { id: 'equalLaw', type: 'toggle', label: b('Equal rule of law for rulers too', 'शासकों पर भी समान कानून'), afterChange: customiseCase },
  ],
  view(S) {
    const st = S;
    const res = S_.assessDemocracyCase(st);
    const nodes = [
      { id: 'dem', fx: 320, fy: 130, rw: 120, fill: res.score === 4 ? '#dcfce7' : res.score >= 2 ? '#fef3c7' : '#fee2e2', stroke: res.score === 4 ? '#15803d' : res.score >= 2 ? '#b45309' : '#b91c1c', label: P(`Score ${res.score}/4`, `अंक ${res.score}/4`) },
      { id: 'v', fx: 130, fy: 60, rw: 128, fill: st.freeVote ? '#dbeafe' : '#f1f5f9', stroke: st.freeVote ? '#0369a1' : '#94a3b8', label: P('Equal Vote', 'समान मत') },
      { id: 'm', fx: 510, fy: 60, rw: 128, fill: st.multipleParties ? '#dbeafe' : '#f1f5f9', stroke: st.multipleParties ? '#0369a1' : '#94a3b8', label: P('Multi-Party', 'बहु-दल') },
      { id: 'p', fx: 130, fy: 200, rw: 128, fill: st.freeMedia ? '#dbeafe' : '#f1f5f9', stroke: st.freeMedia ? '#0369a1' : '#94a3b8', label: P('Free Media', 'मुक्त मीडिया') },
      { id: 'l', fx: 510, fy: 200, rw: 128, fill: st.equalLaw ? '#dbeafe' : '#f1f5f9', stroke: st.equalLaw ? '#0369a1' : '#94a3b8', label: P('Rule of Law', 'विधि-शासन') },
    ];
    const links = [
      { source: 'v', target: 'dem', label: st.freeVote ? 'OK' : 'X' },
      { source: 'm', target: 'dem', label: st.multipleParties ? 'OK' : 'X' },
      { source: 'p', target: 'dem', label: st.freeMedia ? 'OK' : 'X' },
      { source: 'l', target: 'dem', label: st.equalLaw ? 'OK' : 'X' },
    ];
    const svg = forceGraphSvg({ w: 640, h: 260, nodes, links, activeId: 'dem', aria: P('Democracy pillars concept graph', 'लोकतंत्र के स्तंभ अवधारणा ग्राफ़') });
    const cls = res.verdict === 'democratic' ? 'balanced' : res.verdict === 'flawed' ? 'warn' : 'warn';
    return {
      plate: {
        src: 'assets/images/plates/t06-pillars.jpg',
        en: 'Constitutional democracy in action — tap polling queue, court scales of justice or free press desk to stress-test all 4 pillars.',
        hi: 'संवैधानिक लोकतंत्र के स्तंभ — मतदान कतार, न्याय तराजू व स्वतंत्र प्रेस मेज़ पर टैप कर चारों मानदंड परखें।',
        spots: [
          { x: 18, y: 60, en: 'All four checks in this example', hi: 'इस उदाहरण में चारों जाँच', detail: b('This imagined case includes all four checks, but they do not measure every aspect of democracy.', 'इस काल्पनिक केस में चारों जाँच हैं, पर वे लोकतंत्र के हर पहलू को नहीं मापतीं।'), set: presetPatch('full') },
          { x: 50, y: 64, en: 'One-party example', hi: 'एक-दलीय उदाहरण', detail: b('The case assumes voting but no genuine party choice, independent media or equal law.', 'इस केस में मतदान माना गया है, पर वास्तविक दलीय विकल्प, मुक्त मीडिया और समान कानून नहीं।'), set: presetPatch('oneparty') },
          { x: 84, y: 68, en: 'Media censorship example', hi: 'मीडिया सेंसरशिप उदाहरण', detail: b('Silencing journalists limits scrutiny between elections even with rival parties.', 'पत्रकारों को चुप कराने से चुनावों के बीच जाँच-परख सीमित होती है, भले ही प्रतिद्वंद्वी दल हों।'), set: presetPatch('pressban') },
        ],
      },
      svg,
      aria: P(`Fictional case: ${res.score} of four checks`, `काल्पनिक केस: चार में से ${res.score} जाँच`),
      lines: [
        { en: `Checks present in this invented case: ${res.score} of 4. These checks alone cannot fully judge a real democracy.`, hi: `इस काल्पनिक केस में 4 में से ${res.score} जाँच पूरी हैं। ये जाँच अकेले किसी वास्तविक लोकतंत्र का पूरा निर्णय नहीं कर सकतीं।`, cls },
        { en: 'Even if voting takes place, silencing journalists or banning opposition parties breaks democratic accountability.', hi: 'भले ही मतदान हो, पर पत्रकारों को चुप कराना या विपक्षी दलों पर रोक लगाना लोकतांत्रिक जवाबदेही तोड़ देता है।', cls: 'note' },
      ],
    };
  },
  discover: [
    b('Keep Free Vote ON and turn Free Media OFF. Why is voting alone not enough for a full democracy?', 'स्वतंत्र मत चालू रखें और मुक्त मीडिया बंद करें। पूर्ण लोकतंत्र के लिए केवल मतदान ही क्यों पर्याप्त नहीं?'),
    b('Compare Case B and Case C to see how missing one pillar alters accountability.', 'एक स्तंभ कम होने से जवाबदेही कैसे बदलती है, यह देखने के लिए केस B और C की तुलना करें।'),
  ],
  predictions: [{
    id: 'p1', revision: 't06-step6',
    stem: b('In this invented case, assume universal voting with equal weight but no real opposition party choice, no free media or independent courts, and leaders above the law. How many checks are met?', 'इस काल्पनिक केस में समान मूल्य वाला सार्वभौमिक मतदान मानें, पर वास्तविक विपक्षी दल विकल्प, मुक्त मीडिया या स्वतंत्र न्यायालय नहीं हैं और नेता कानून से ऊपर हैं। कितनी जाँच पूरी होंगी?'),
    options: [opt('four', 'All 4 — elections alone are enough', 'सभी 4 — केवल चुनाव काफी हैं'), opt('one', 'Only 1 — flawed / non-democratic', 'केवल 1 — त्रुटिपूर्ण / अलोकतांत्रिक')],
    run: (S) => { S.preset = 'custom'; S.freeVote = true; S.multipleParties = false; S.freeMedia = false; S.equalLaw = false; return S_.assessDemocracyCase(S).score === 1 ? 'one' : 'four'; },
    explain: () => b('Only 1 of 4 criteria holds: without opposition choice, free press, and equal rule of law, voters cannot hold rulers accountable.', '4 में से केवल 1 मानदंड पूरा है: विपक्ष, स्वतंत्र मीडिया और समान कानून के बिना मतदाता शासकों को जवाबदेह नहीं ठहरा सकते।'),
  }],
  exit: [{
    id: 'e1',
    stem: b('Which feature ensures elected leaders cannot ignore citizens between elections?', 'कौन-सी विशेषता सुनिश्चित करती है कि चुने हुए नेता चुनावों के बीच नागरिकों की अनदेखी न कर सकें?'),
    correct: 'law',
    options: [
      opt('law', 'Independent courts, free media, and rule of law', 'स्वतंत्र न्यायालय, मुक्त मीडिया और विधि का शासन'),
      opt('onlyvote', 'Voting once every decade without free press', 'स्वतंत्र मीडिया के बिना हर दशक में एक बार मतदान', b('Voting without information or legal checks leaves citizens powerless between elections.', 'सूचना और कानूनी नियंत्रण के बिना नागरिक चुनावों के बीच शक्तिहीन रहते हैं।')),
    ],
    explain: b('Rule of law and free media protect citizen rights every day, not just on polling day.', 'विधि का शासन और स्वतंत्र मीडिया केवल मतदान के दिन नहीं बल्कि हर दिन नागरिकों के अधिकारों की रक्षा करते हैं।'),
    hint: b('Look at the bottom two nodes in the pillar graph.', 'स्तंभ ग्राफ़ के निचले दो नोड देखें।'),
  }],
  reflect: b('Which of the four democratic pillars feels most vital in a school student council? Explain why.', 'विद्यालय की छात्र-परिषद में लोकतंत्र के चारों स्तंभों में से कौन-सा सबसे आवश्यक लगता है? कारण बताएँ।'),
};

// ------------------------------------------------------------------ T06.L2 Early Indian Democratic Traditions Gallery
const TRADITIONS = [
  { id: 'sabha', year: '~1200–600 BCE', en: 'Vedic Sabha & Samiti', hi: 'वैदिक सभा और समिति', place: 'Indus-Ganga Plains', src: 'Rigveda & Atharvaveda references', descEn: 'Vedic texts refer to sabha and samiti; their membership and roles are interpreted from limited sources.', descHi: 'वैदिक ग्रंथ सभा और समिति का उल्लेख करते हैं; सीमित स्रोतों से उनकी सदस्यता और भूमिकाओं की व्याख्या की जाती है।' },
  { id: 'vajji', year: '~6th Century BCE', en: 'Vajji Sangha / Gana (Vaishali)', hi: 'वज्जि संघ / गण (वैशाली)', place: 'Vaishali (Bihar)', src: 'Buddhist Mahaparinibbana Sutta', descEn: 'Texts describe Vajji as a gana-sangha with collective deliberation by a group of rajas, not universal adult suffrage.', descHi: 'ग्रंथ वज्जि गणसंघ में राजाओं के समूह द्वारा सामूहिक विचार का वर्णन करते हैं; यह सार्वभौमिक वयस्क मताधिकार नहीं था।' },
  { id: 'uttara', year: 'c. 920 CE', en: 'Uttaramerur Kudavolai Inscription', hi: 'उत्तरमेरूर कुडवोलाई शिलालेख', place: 'Kanchipuram (Tamil Nadu)', src: 'Vaikuntha Perumal Temple Stone Inscriptions (Chola period)', descEn: 'Carved rules for choosing village sabha committees via palm-leaf lots drawn from a pot, with age, property, and audit qualifications.', descHi: 'ग्राम-सभा समितियों के चुनाव हेतु घड़े से ताड़पत्र की पर्ची (कुडवोलाई) निकालने, योग्यता और लेखा-परीक्षा के शिलालेखित नियम।' },
];
export const earlyTraditions = {
  id: 'T06.L2',
  objective: b('Examine documented early Indian deliberative and participatory institutions (Sabha-Samiti, Vajji Gana-Sangha, and Uttaramerur village sabha).', 'भारत की प्रारंभिक विमर्शकारी व सहभागी संस्थाओं (सभा-समिति, वज्जि गणसंघ और उत्तरमेरूर ग्राम-सभा) के प्रमाणों का अध्ययन करें।'),
  note: { kind: 'documented', en: 'Based on attested textual and epigraphic records (Vedic texts, Buddhist canon, and the c. 920 CE Chola temple inscription at Uttaramerur).', hi: 'प्रमाणित साहित्यिक व अभिलेखीय स्रोतों (वैदिक ग्रंथ, बौद्ध ग्रंथ और लगभग 920 ई. के चोल उत्तरमेरूर शिलालेख) पर आधारित।' },
  init: () => ({ trad: 'uttara', step: 2 }),
  controls: [
    { id: 'trad', type: 'chips', label: b('Select tradition', 'परंपरा चुनें'), options: TRADITIONS.map((tr) => opt(tr.id, tr.en, tr.hi)) },
    { id: 'step', type: 'slider', label: b('Inspect rule stage (1–3)', 'नियम चरण देखें (1–3)'), min: 1, max: 3, step: 1 },
  ],
  view(S) {
    const tr = TRADITIONS.find((x) => x.id === S.trad) || TRADITIONS[2];
    const boxes = S.trad === 'uttara'
      ? [P('1. Eligibility & Audit Check', '1. योग्यता व हिसाब जांच'), P('2. Kudavolai Pot Draw', '2. कुडवोलाई घड़े से पर्ची'), P('3. 1-Year Rotating Term', '3. 1-वर्षीय क्रमिक कार्यकाल')]
      : S.trad === 'vajji'
      ? [P('1. Gana-sangha', '1. गणसंघ'), P('2. Collective deliberation', '2. सामूहिक विचार'), P('3. Membership was limited', '3. सदस्यता सीमित थी')]
      : [P('1. Samiti in texts', '1. ग्रंथों में समिति'), P('2. Sabha in texts', '2. ग्रंथों में सभा'), P('3. Interpret the evidence', '3. प्रमाण की व्याख्या')];
    const g = boxes.map((txt, i) => {
      const act = i + 1 <= S.step;
      const x = 24 + i * 204;
      return `<rect x="${x}" y="84" width="184" height="86" rx="10" fill="${act ? '#1d4ed8' : '#e2e8f0'}" fill-opacity="${act ? '.14' : '.7'}" stroke="${act ? '#1d4ed8' : '#94a3b8'}" stroke-width="${act ? '2.5' : '1.5'}"/>`
        + `<text class="txt b" x="${x + 92}" y="122" text-anchor="middle">${esc(txt.split(' / ')[0])}</text>`
        + (i < 2 ? `<line x1="${x + 186}" y1="127" x2="${x + 202}" y2="127" stroke="#64748b" stroke-width="2"/>` : '');
    }).join('');
    const svg = `<svg viewBox="0 0 640 210" class="chart" role="img" xmlns="http://www.w3.org/2000/svg">`
      + `<rect x="16" y="14" width="608" height="48" rx="8" fill="#fef3c7" stroke="#b45309"/>`
      + `<text class="txt b" x="30" y="36">${esc(P(tr.en, tr.hi))} · ${esc(tr.year)}</text>`
      + `<text class="txt sm mut" x="30" y="54">${esc(tr.place)} · ${esc(tr.src)}</text>${g}</svg>`;
    return {
      plate: {
        src: 'assets/images/plates/t06-democracy.jpg',
        en: S.trad === 'uttara'
          ? 'Chola stone mandapa inscriptions and Uttaramerur Kudavolai ballot pot — tap pins to inspect Vedic, Vajji and Chola rules.'
          : 'Early Indian deliberative stone mandapa — tap pins to compare Sabha-Samiti, Vajji Sangha and Uttaramerur.',
        hi: S.trad === 'uttara'
          ? 'चोल मंडप शिलालेख व उत्तरमेरूर कुडवोलाई घड़ा — वैदिक, वज्जि व चोल सभाएँ देखने हेतु पिन पर टैप करें।'
          : 'प्राचीन भारतीय सभा-मंडप — सभा-समिति, वज्जि व उत्तरमेरूर की तुलना हेतु पिन पर टैप करें।',
        spots: [
          { x: 22, y: 46, en: 'Vedic Sabha & Samiti', hi: 'वैदिक सभा व समिति', detail: b('Texts mention these assemblies; their precise membership and roles are interpreted from sources.', 'ग्रंथ इन सभाओं का उल्लेख करते हैं; उनकी सटीक सदस्यता और भूमिकाओं की व्याख्या स्रोतों से होती है।'), set: { trad: 'sabha', step: 3 } },
          { x: 52, y: 68, en: 'Uttaramerur Kudavolai (c. 920 CE)', hi: 'उत्तरमेरूर कुडवोलाई (ल. 920 ई.)', detail: b('Palm-leaf lotteries from a pot with public audit disqualifications.', 'घड़े से ताड़पत्र पर्ची व पिछले खातों की सख्त लेखा-परीक्षा के नियम।'), set: { trad: 'uttara', step: 3 } },
          { x: 80, y: 54, en: 'Vajji Santhagara Republic', hi: 'वज्जि संथागार गणसंघ', detail: b('Texts describe collective deliberation among rajas; membership was not universal.', 'ग्रंथ राजाओं के बीच सामूहिक विचार बताते हैं; सदस्यता सबके लिए नहीं थी।'), set: { trad: 'vajji', step: 3 } },
        ],
      },
      svg,
      aria: `${tr.en} (${tr.year}) at ${tr.place}`,
      lines: [
        { en: `${tr.en} (${tr.year}, ${tr.place}): ${tr.descEn}`, hi: `${tr.hi} (${tr.year}): ${tr.descHi}` },
        { en: 'These sources describe different places and centuries. Membership was limited; Uttaramerur’s qualifications included property. Do not equate these institutions with modern universal adult suffrage or assume a direct institutional continuity.', hi: 'ये स्रोत अलग स्थानों और शताब्दियों के हैं। सदस्यता सीमित थी; उत्तरमेरूर की शर्तों में संपत्ति भी थी। इन्हें आधुनिक सार्वभौमिक वयस्क मताधिकार के बराबर न मानें या सीधा संस्थागत उत्तराधिकार न मानें।', cls: 'note' },
      ],
    };
  },
  discover: [
    b('Inspect Uttaramerur and compare its committee selection rules with Vajji’s assembly.', 'उत्तरमेरूर के समिति-चयन नियमों की तुलना वज्जि की सभा से करें।'),
    b('Why did Uttaramerur require outgoing members to clear past accounts before standing again?', 'उत्तरमेरूर में पुनः पात्र होने से पहले पिछले खातों की जांच क्यों अनिवार्य थी?'),
  ],
  predictions: [{
    id: 'p1',
    stem: b('Which ancient Tamil Nadu inscription records detailed rules for electing village committee members by drawing lots from a pot (Kudavolai)?', 'तमिलनाडु का कौन-सा प्राचीन शिलालेख घड़े से पर्चियाँ (कुडवोलाई) निकालकर ग्राम समिति चुनने के नियम दर्ज करता है?'),
    options: [opt('uttara', 'Uttaramerur inscription (~920 CE)', 'उत्तरमेरूर शिलालेख (~920 ई.)'), opt('hathigumpha', 'Hathigumpha inscription', 'हाथीगुम्फा शिलालेख')],
    run: (S) => { S.trad = 'uttara'; S.step = 3; return 'uttara'; },
    explain: () => b('The c. 920 CE Chola-period Uttaramerur inscriptions lay out Kudavolai eligibility, disqualification for unpaid dues, and rotation.', 'लगभग 920 ई. का चोल-कालीन उत्तरमेरूर शिलालेख कुडवोलाई पात्रता, बकाया होने पर अयोग्यता और कार्यकाल-चक्र बताता है।'),
  }],
  exit: [{
    id: 'e1',
    stem: b('How do ancient Indian ganasanghas differ from modern Indian constitutional democracy?', 'प्राचीन भारतीय गणसंघ आधुनिक भारतीय संवैधानिक लोकतंत्र से किस प्रकार भिन्न थे?'),
    correct: 'univ',
    options: [
      opt('univ', 'In India eligible citizens aged 18 or older can register to vote regardless of property, caste or gender; ancient memberships were restricted.', 'भारत में 18 वर्ष या उससे अधिक आयु के पात्र नागरिक संपत्ति, जाति या लिंग से परे मतदाता पंजीकरण करा सकते हैं; प्राचीन सदस्यता सीमित थी।'),
      opt('none', 'Ancient republics had no rules or assemblies at all.', 'प्राचीन गणराज्यों में कोई नियम या सभा नहीं थी।', b('Texts and inscriptions clearly show rules and assemblies in Vaishali and Uttaramerur.', 'ग्रंथों व शिलालेखों में वैशाली व उत्तरमेरूर की सभाओं के स्पष्ट नियम मिलते हैं।')),
    ],
    explain: b('Ancient Indian assemblies pioneered collective deliberation, while universal equal citizenship is a modern constitutional achievement.', 'प्राचीन भारतीय सभाओं ने सामूहिक विमर्श का मार्ग प्रशस्त किया, जबकि सार्वभौमिक समान नागरिकता आधुनिक संवैधानिक उपलब्धि है।'),
    hint: b('Read the comparison note below the stages.', 'चरणों के नीचे तुलना टिप्पणी देखें।'),
  }],
  reflect: b('Why is rotating office-holders and auditing accounts useful even in a school club today?', 'आज किसी विद्यालय क्लब में भी पदाधिकारियों का क्रमिक परिवर्तन और हिसाब-जांच क्यों उपयोगी है?'),
};

// ------------------------------------------------------------------ T06.L4 Country Comparison
const COUNTRIES = [
  { id: 'in', en: 'India', hi: 'भारत', iso: '356', lon: 79, lat: 22, sys: 'Parliamentary Republic', sysHi: 'संसदीय गणतंत्र', hos: 'President (indirect election)', hosHi: 'राष्ट्रपति (अप्रत्यक्ष चुनाव)', hog: 'Prime Minister (Lok Sabha confidence)', hogHi: 'प्रधानमंत्री (लोकसभा का विश्वास)', fed: 'Federal: Union and States', fedHi: 'संघीय: संघ और राज्य' },
  { id: 'us', en: 'USA', hi: 'अमेरिका', iso: '840', lon: -98, lat: 39, sys: 'Presidential Republic', sysHi: 'अध्यक्षीय गणतंत्र', hos: 'President (Electoral College)', hosHi: 'राष्ट्रपति (निर्वाचक मंडल)', hog: 'President (fixed four-year term, subject to exceptions)', hogHi: 'राष्ट्रपति (चार वर्ष, अपवाद संभव)', fed: 'Federal: states', fedHi: 'संघीय: राज्य' },
  { id: 'fr', en: 'France', hi: 'फ़्रांस', iso: '250', lon: 2, lat: 47, sys: 'Semi-Presidential Republic', sysHi: 'अर्ध-अध्यक्षीय गणतंत्र', hos: 'President (direct election)', hosHi: 'राष्ट्रपति (प्रत्यक्ष चुनाव)', hog: 'Prime Minister (government accountable to National Assembly)', hogHi: 'प्रधानमंत्री (सरकार राष्ट्रीय सभा के प्रति उत्तरदायी)', fed: 'Unitary with regions', fedHi: 'क्षेत्रों वाला एकात्मक राज्य' },
  { id: 'ca', en: 'Canada', hi: 'कनाडा', iso: '124', lon: -106, lat: 56, sys: 'Parliamentary Constitutional Monarchy', sysHi: 'संसदीय संवैधानिक राजतंत्र', hos: 'Monarch, represented federally by Governor General', hosHi: 'सम्राट, संघ में गवर्नर जनरल प्रतिनिधि', hog: 'Prime Minister (House of Commons confidence)', hogHi: 'प्रधानमंत्री (हाउस ऑफ कॉमन्स का विश्वास)', fed: 'Federal: provinces and territories', fedHi: 'संघीय: प्रांत और क्षेत्र' },
  { id: 'ru', en: 'Russia', hi: 'रूस', iso: '643', lon: 95, lat: 60, sys: 'Semi-Presidential (concentrated executive)', sysHi: 'अर्ध-अध्यक्षीय (केंद्रित कार्यपालिका)', hos: 'President (dominant executive role)', hosHi: 'राष्ट्रपति (प्रमुख कार्यकारी भूमिका)', hog: 'Prime Minister (appointed with Duma approval)', hogHi: 'प्रधानमंत्री (ड्यूमा की स्वीकृति से नियुक्त)', fed: 'Federal: constituent regions', fedHi: 'संघीय: घटक क्षेत्र' },
];
export const countryCompare = {
  id: 'T06.L4',
  objective: b('Locate India, USA, France, Canada, and Russia on the world map and compare how their executives, legislatures, and heads of state are structured.', 'विश्व मानचित्र पर भारत, अमेरिका, फ़्रांस, कनाडा और रूस को पहचानें और उनकी कार्यपालिका, विधायिका तथा राष्ट्राध्यक्ष संरचना की तुलना करें।'),
  note: { kind: 'documented', en: 'Constitutional structures as documented (2026 textbook framing). Actual democratic practice depends on rights, courts, and free elections.', hi: 'संवैधानिक संरचनाओं का दस्तावेज़ी तुलना-चित्र। वास्तविक लोकतांत्रिक अभ्यास अधिकारों, न्यायालयों और स्वतंत्र चुनावों पर निर्भर करता है।' },
  init: () => ({ country: 'in' }),
  controls: [
    { id: 'country', type: 'chips', label: b('Country', 'देश'), options: COUNTRIES.map((c) => opt(c.id, c.en, c.hi)) },
  ],
  view(S) {
    const c = COUNTRIES.find((x) => x.id === S.country) || COUNTRIES[0];
    const markers = COUNTRIES.map((x) => ({
      lon: x.lon, lat: x.lat, label: P(x.en, x.hi),
      r: x.id === c.id ? 7 : 4, fill: x.id === c.id ? '#dc2626' : '#0369a1',
    }));
    const svg = worldMapSvg({
      markers, countryFills: { [c.iso]: '#fca5a5' },
      aria: P('World map locating five comparative constitutional systems', 'पाँच संवैधानिक प्रणालियों वाला विश्व मानचित्र'),
    });
    return {
      plate: {
        src: 'assets/images/t06.jpg',
        en: 'Global constitutional systems: tap pins to compare India, USA, France and Canada on the world map.',
        hi: 'विश्व की संवैधानिक प्रणालियाँ: भारत, अमेरिका, फ़्रांस व कनाडा की तुलना हेतु पिन पर टैप करें।',
        spots: [
          { x: 24, y: 52, en: 'India: Parliamentary Republic', hi: 'भारत: संसदीय गणतंत्र', detail: b('Union + States federal structure; indirect President & PM accountable to Lok Sabha.', 'संघीय ढाँचा; अप्रत्यक्ष राष्ट्रपति व लोकसभा के प्रति उत्तरदायी प्रधानमंत्री।'), set: { country: 'in' } },
          { x: 50, y: 46, en: 'USA: Presidential Republic', hi: 'अमेरिका: अध्यक्षीय गणतंत्र', detail: b('Same person is Head of State & Government with a fixed 4-year term.', 'एक ही राष्ट्रपति राष्ट्राध्यक्ष व शासनाध्यक्ष होता है (निश्चित 4-वर्षीय कार्यकाल)।'), set: { country: 'us' } },
          { x: 76, y: 52, en: 'France & Canada Contrasts', hi: 'फ़्रांस (अर्ध-अध्यक्षीय) व कनाडा', detail: b('France blends direct President + PM; switch chips to inspect Canada & Russia too.', 'फ़्रांस में प्रत्यक्ष राष्ट्रपति व प्रधानमंत्री दोनों; कनाडा संवैधानिक राजतंत्र है।'), set: { country: 'fr' } },
        ],
      },
      svg,
      aria: P(`${c.en}: ${c.sys}. Head of state: ${c.hos}; Head of government: ${c.hog}`, `${c.hi}: ${c.sysHi}। राष्ट्राध्यक्ष: ${c.hosHi}; शासनाध्यक्ष: ${c.hogHi}`),
      lines: [
        { en: `${c.en} — ${c.sys} (${c.fed}).`, hi: `${c.hi} — ${c.sysHi} (${c.fedHi})।`, cls: 'balanced' },
        { en: `Head of State: ${c.hos} | Head of Government: ${c.hog}.`, hi: `राष्ट्राध्यक्ष: ${c.hosHi} | शासनाध्यक्ष: ${c.hogHi}।`, cls: 'note' },
      ],
    };
  },
  discover: [
    b('Compare India and Canada: both are parliamentary democracies, yet one is a republic and one is a constitutional monarchy.', 'भारत और कनाडा की तुलना करें: दोनों संसदीय हैं, पर एक गणतंत्र है और एक संवैधानिक राजतंत्र।'),
    b('Compare USA and France: in France, a Prime Minister shares executive roles with an elected President.', 'अमेरिका और फ़्रांस की तुलना करें: फ़्रांस में निर्वाचित राष्ट्रपति के साथ एक प्रधानमंत्री भी होता है।'),
  ],
  predictions: [{
    id: 'p1',
    stem: b('In which of these countries are the Head of State and Head of Government the SAME person serving a fixed 4-year term?', 'इनमें से किस देश में राष्ट्राध्यक्ष और शासनाध्यक्ष एक ही व्यक्ति होता है जिसका 4-वर्षीय निश्चित कार्यकाल होता है?'),
    options: [opt('us', 'USA', 'अमेरिका'), opt('in', 'India', 'भारत')],
    run: (S) => { S.country = 'us'; return 'us'; },
    explain: () => b('In the USA’s presidential system, the President is both Head of State and Head of Government; in India the President and Prime Minister hold separate offices.', 'अमेरिका की अध्यक्षीय प्रणाली में राष्ट्रपति ही राष्ट्राध्यक्ष और शासनाध्यक्ष दोनों होता है; भारत में राष्ट्रपति और प्रधानमंत्री अलग पद हैं।'),
  }],
  exit: [{
    id: 'e1',
    stem: b('India and Canada share a parliamentary system because…', 'भारत और कनाडा दोनों में संसदीय प्रणाली है क्योंकि…'),
    correct: 'leg',
    options: [
      opt('leg', 'The Prime Minister and Cabinet must keep the confidence of the lower house of Parliament.', 'प्रधानमंत्री और मंत्रिमंडल को संसद के निचले सदन का विश्वास बनाए रखना होता है।'),
      opt('fixed', 'No election can be held early for any reason.', 'किसी भी कारण से समय-पूर्व चुनाव नहीं हो सकता।', b('Parliamentary houses can be dissolved early if no majority exists.', 'बहुमत न रहने पर संसदीय सदन समय से पहले भंग हो सकता है।')),
    ],
    explain: b('Executive accountability to an elected Parliament is the defining hallmark of parliamentary governance.', 'निर्वाचित संसद के प्रति कार्यपालिका की जवाबदेही संसदीय शासन की मुख्य पहचान है।'),
    hint: b('Look at Head of Government across India and Canada.', 'भारत और कनाडा के शासनाध्यक्ष देखें।'),
  }],
  reflect: b('Why did India choose a parliamentary republic with an indirectly elected President rather than a hereditary monarch?', 'भारत ने वंशानुगत सम्राट के बजाय अप्रत्यक्ष रूप से निर्वाचित राष्ट्रपति वाला संसदीय गणतंत्र क्यों चुना?'),
};


// ------------------------------------------------------------------ Existing T06.L3 & T07.L4
const ACT = { voters: b('Voters', 'मतदाता'), legislature: b('Legislature', 'विधायिका'), executive: b('Government', 'सरकार'), headOfState: b('Head of state', 'राष्ट्राध्यक्ष'), judiciary: b('Judiciary', 'न्यायपालिका') };
const REL = { elect: b('elect', 'चुनते हैं'), forms: b('government formed from', 'से सरकार बनती है'), answerable: b('answerable to', 'के प्रति जवाबदेह'), appoints: b('appoints', 'नियुक्त करता है'), checks: b('reviews', 'समीक्षा करती है'), veto: b('can veto laws of', 'के कानूनों पर वीटो कर सकता है'), impeach: b('impeach only for grave offences', 'केवल गंभीर अपराध पर महाभियोग') };
const POS = { parliamentary: { voters: [320, 30], legislature: [110, 150], executive: [530, 150], headOfState: [530, 30], judiciary: [320, 260] }, presidential: { voters: [320, 30], legislature: [110, 150], executive: [530, 150], judiciary: [320, 260] } };
const SYS = { parliamentary: b('Parliamentary (e.g. India’s Union government)', 'संसदीय (जैसे भारत की केंद्र सरकार)'), presidential: b('Presidential (e.g. the USA)', 'अध्यक्षीय (जैसे अमेरिका)') };
export const institutions = {
  id: 'T06.L3',
  objective: b('Compare how the executive and the legislature are related in a parliamentary and a presidential system, and what happens when the government loses the legislature’s support.', 'संसदीय और अध्यक्षीय प्रणालियों में कार्यपालिका और विधायिका के संबंध की तुलना करें, और सरकार के विधायिका का समर्थन खोने पर क्या होता है।'),
  note: { kind: 'fictional', en: 'In this toy confidence vote all 100 legislators vote for or against; 51 votes are needed for confidence. Real procedures, abstentions and constitutions are more complex.', hi: 'इस काल्पनिक विश्वासमत में सभी 100 विधायक पक्ष या विपक्ष में मत देते हैं; विश्वास के लिए 51 मत चाहिए। वास्तविक प्रक्रिया, अनुपस्थिति और संविधान अधिक जटिल हैं।' },
  init: () => ({ system: 'parliamentary', support: 62, vote: false }),
  controls: [
    { id: 'system', type: 'chips', label: b('System', 'प्रणाली'), options: I.SYSTEMS.map((id) => ({ id, ...SYS[id] })) },
    { id: 'support', type: 'slider', label: b('Legislators (out of 100) who support the government', 'सरकार का समर्थन करने वाले विधायक (100 में से)'), min: 0, max: 100, step: 1 },
    { id: 'vote', type: 'toggle', label: b('Hold a vote of confidence in the government', 'सरकार में विश्वास पर मतदान कराएँ') },
  ],
  view(S) {
    const sys = S.system, pos = POS[sys], total = 100, cv = I.confidenceVote(sys, { total, supportExec: S.support }), lp = I.lawPassage(sys, { total, supportExec: S.support });
    const fell = S.vote && cv.lost && sys === 'parliamentary';
    let g = `<defs><marker id="ar" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><path d="M0,0 L10,4 L0,8 z" fill="var(--mut)"/></marker></defs>`;
    const w = 200, hgt = 46, edgePt = (a, bb) => { const [x1, y1] = pos[a], [x2, y2] = pos[bb], dx = x2 - x1, dy = y2 - y1, k = Math.max(Math.abs(dx) / (w / 2 + 4), Math.abs(dy) / (hgt / 2 + 4)); return [x1 + dx / k, y1 + dy / k, x2 - dx / k, y2 - dy / k]; };
    I.RELATIONS[sys].forEach(([a, bb, k], i) => {
      let [x1, y1, x2, y2] = edgePt(a, bb); const horiz = Math.abs(x2 - x1) >= Math.abs(y2 - y1), o = (i % 2 ? 1 : -1) * 11;
      if (horiz) { y1 += o; y2 += o; } else { x1 += o * 1.6; x2 += o * 1.6; }
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + (horiz ? (o < 0 ? -5 : 14) : 0), cut = fell && ((a === 'legislature' && bb === 'executive') || (a === 'executive' && bb === 'legislature' && k === 'answerable'));
      g += `<line class="edge${cut ? ' x' : ''}" x1="${x1.toFixed(0)}" y1="${y1.toFixed(0)}" x2="${x2.toFixed(0)}" y2="${y2.toFixed(0)}" marker-end="url(#ar)"/><text class="txt sm mut" x="${(mx + (horiz ? 0 : (o > 0 && mx < 480 ? 6 : -6))).toFixed(0)}" y="${my.toFixed(0)}" text-anchor="${horiz ? 'middle' : o > 0 && mx < 480 ? 'start' : 'end'}">${esc(P(REL[k].en, REL[k].hi))}</text>`;
    });
    for (const a of I.ACTORS[sys]) { const [x, y] = pos[a]; const bad = fell && a === 'executive'; g += `<rect class="box${bad ? ' bad' : ''}" x="${x - w / 2}" y="${y - hgt / 2}" width="${w}" height="${hgt}" rx="8"/><text class="txt b" x="${x}" y="${y + 4}" text-anchor="middle">${esc(P(ACT[a].en, ACT[a].hi))}</text>`; }
    const bar = `<rect class="bar-s" x="20" y="322" width="${(S.support / 100) * 600}" height="14"/><rect class="bar-bad" x="${20 + (S.support / 100) * 600}" y="322" width="${((100 - S.support) / 100) * 600}" height="14" opacity=".55"/><line x1="320" x2="320" y1="314" y2="344" stroke="var(--ink)" stroke-width="2"/><text class="txt sm" x="20" y="358">${esc(P('Supporters', 'समर्थक'))} ${S.support}</text><text class="txt sm" x="620" y="358" text-anchor="end">${esc(P('Others', 'अन्य'))} ${100 - S.support}</text><text class="txt sm b" x="320" y="312" text-anchor="middle">${esc(P('majority = 51', 'बहुमत = 51'))}</text>`;
    const lines = [];
    if (S.vote) lines.push(sys === 'parliamentary'
      ? (cv.lost ? { en: `In this toy vote all 100 vote: ${S.support} support the government, so it loses the confidence motion. In a parliamentary system it would normally resign; what follows depends on constitutional procedure.`, hi: `इस मॉडल में सभी 100 मत देते हैं: ${S.support} सरकार के पक्ष में हैं, इसलिए विश्वास प्रस्ताव हारता है। संसदीय प्रणाली में सामान्यतः सरकार इस्तीफ़ा देती है; आगे की प्रक्रिया संविधान पर निर्भर है।`, cls: 'warn' }
        : { en: `With ${S.support} of 100 supporters the government WINS the vote and continues.`, hi: `100 में से ${S.support} समर्थकों के साथ सरकार मतदान जीतती है और जारी रहती है।`, cls: 'balanced' })
      : { en: 'In this simplified presidential model a legislative confidence vote does not remove the president. Fixed terms can still end early through constitutional processes, resignation, death or incapacity.', hi: 'इस सरल अध्यक्षीय मॉडल में विधायिका का विश्वासमत राष्ट्रपति को नहीं हटाता। संवैधानिक प्रक्रिया, त्यागपत्र, मृत्यु या अक्षमता से निश्चित कार्यकाल पहले भी समाप्त हो सकता है।', cls: 'balanced' });
    lines.push(sys === 'parliamentary'
      ? (lp.passes ? { en: 'The government commands a majority, so its bills can pass: executive and legislature work together.', hi: 'सरकार के पास बहुमत है, इसलिए उसके विधेयक पारित हो सकते हैं: कार्यपालिका और विधायिका साथ काम करती हैं।' } : { en: 'Without a majority the government cannot be sure of passing laws and can be voted out at any time.', hi: 'बहुमत के बिना सरकार कानून पारित होने का भरोसा नहीं कर सकती और कभी भी हटाई जा सकती है।', cls: 'warn' })
      : (lp.passes ? { en: 'In this toy one-chamber model a majority supports the executive; real lawmaking also depends on other procedures and institutions.', hi: 'इस एक-सदन मॉडल में बहुमत कार्यपालिका का समर्थन करता है; वास्तविक कानून प्रक्रिया अन्य नियमों और संस्थाओं पर भी निर्भर है।' } : { en: 'The legislature is controlled by others (divided government): laws may stall (gridlock), but the president stays in office.', hi: 'विधायिका पर अन्य का नियंत्रण है (विभाजित सरकार): कानून अटक सकते हैं (गतिरोध), पर राष्ट्रपति पद पर बना रहता है।', cls: 'warn' }));
    return {
      plate: {
        src: 'assets/images/plates/t06-parliament.jpg',
        en: 'India’s circular sandstone Parliament colonnade — tap pins to contrast parliamentary confidence vs presidential fixed terms.',
        hi: 'भारत का संसद भवन मंडप — संसदीय विश्वासमत बनाम अध्यक्षीय निश्चित कार्यकाल की तुलना हेतु पिन पर टैप करें।',
        spots: [
          { x: 26, y: 50, en: 'Parliamentary Majority (62/100)', hi: 'संसदीय बहुमत (62/100)', detail: b('In this toy, 62 supporting votes pass the 51-vote threshold; real bills and confidence procedures have further rules.', 'इस मॉडल में 62 समर्थक मत 51 की सीमा पार करते हैं; वास्तविक विधेयकों और विश्वास प्रक्रिया के और नियम हैं।'), set: { system: 'parliamentary', support: 62, vote: false } },
          { x: 54, y: 42, en: 'Lost confidence motion (42/100)', hi: 'विश्वास प्रस्ताव हारा (42/100)', detail: b('In this toy vote the government loses a confidence motion and would normally resign.', 'इस मॉडल में सरकार विश्वास प्रस्ताव हारती है और सामान्यतः इस्तीफ़ा देती है।'), set: { system: 'parliamentary', support: 42, vote: true } },
          { x: 78, y: 56, en: 'Presidential Gridlock (42/100)', hi: 'अध्यक्षीय गतिरोध (42/100)', detail: b('In the toy presidential system an ordinary confidence vote does not remove the president.', 'काल्पनिक अध्यक्षीय प्रणाली में साधारण विश्वासमत से राष्ट्रपति नहीं हटता।'), set: { system: 'presidential', support: 42, vote: true } },
        ],
      },
      svg: `<svg viewBox="0 0 640 368" class="chart" role="img" xmlns="http://www.w3.org/2000/svg">${g}${bar}</svg>`, aria: `${sys} system with ${S.support} of 100 supporters. ${S.vote ? cv.outcome : 'No vote.'}`, lines };
  },
  discover: [b('In the parliamentary model set support to 40 and hold a confidence vote. Then switch to the presidential model with the same numbers.', 'संसदीय मॉडल में समर्थन 40 करें और विश्वासमत कराएँ। फिर वही संख्याएँ रखकर अध्यक्षीय मॉडल चुनें।'), b('Which system can end up with a government that cannot pass its laws but stays in office?', 'किस प्रणाली में ऐसी सरकार हो सकती है जो कानून पारित न करा पाए पर पद पर बनी रहे?')],
  predictions: [{ id: 'p1', revision: 't06-step6', stem: b('In this PARLIAMENTARY model all 100 legislators vote on a confidence motion; 45 support the government. What happens?', 'इस संसदीय मॉडल में सभी 100 विधायक विश्वास प्रस्ताव पर मत देते हैं; 45 सरकार का समर्थन करते हैं। क्या होता है?'), options: [opt('falls', 'The government must resign', 'सरकार को त्यागपत्र देना होगा'), opt('stays', 'The government continues until the next election', 'सरकार अगले चुनाव तक चलती है')],
    run: (S) => { S.system = 'parliamentary'; S.support = 45; S.vote = true; return I.confidenceVote('parliamentary', { total: 100, supportExec: 45 }).lost ? 'falls' : 'stays'; }, explain: () => ({ en: 'In a parliamentary system the government exists only while it has the confidence of a majority of the legislature (51 of 100).', hi: 'संसदीय प्रणाली में सरकार तभी तक रहती है जब तक उसे विधायिका के बहुमत (100 में से 51) का विश्वास प्राप्त है।' }) }],
  exit: [{ id: 'e1', stem: b('Which statement about a presidential system is correct?', 'अध्यक्षीय प्रणाली के बारे में कौन-सा कथन सही है?'), correct: 'fixed', options: [
    { id: 'fixed', ...b('The president is chosen separately and is not removed by an ordinary confidence vote.', 'राष्ट्रपति अलग से चुना जाता है और साधारण विश्वासमत से हटाया नहीं जाता।') },
    { id: 'confidence', ...b('The president must resign whenever the legislature passes a no-confidence motion.', 'विधायिका के अविश्वास प्रस्ताव पारित करते ही राष्ट्रपति को त्यागपत्र देना पड़ता है।'), why: b('That describes a parliamentary system. Try the no-confidence vote in the presidential diagram.', 'यह संसदीय प्रणाली का वर्णन है। अध्यक्षीय आरेख में अविश्वास मत आज़माएँ।') }],
    explain: b('The president and the legislature are elected separately; each has its own source of power.', 'राष्ट्रपति और विधायिका अलग-अलग चुने जाते हैं; दोनों की सत्ता का अपना स्रोत है।'), hint: b('Look at the “elect” arrows into the executive.', 'कार्यपालिका की ओर जाने वाले “चुनते हैं” तीरों को देखें।') }],
  reflect: b('Which system makes the government more answerable to the legislature, and what is one cost of that?', 'कौन-सी प्रणाली सरकार को विधायिका के प्रति अधिक जवाबदेह बनाती है, और उसकी एक कीमत क्या है?'),
};
