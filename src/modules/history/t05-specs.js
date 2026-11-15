// T05 State and Society (upto 1000 CE) lab specs (L1–L6).
import * as H from '../../engines/domain/history.js';
import { indiaMapSvg, forceGraphSvg } from '../../engines/viz.js';
import { fmt, esc } from '../../core/dom.js';
import { pair as P } from '../../core/i18n.js';

const b = (en, hi) => ({ en, hi });
const opt = (id, en, hi, why) => ({ id, en, hi, ...(why ? { why } : {}) });

// ================================================================ T05.L1 Historical Geography up to 1000 CE (Sapta-Sindhu -> Chola Assemblies)
const T05_ERAS = {
  earlyVedic: {
    year: 'c. 1500–1000 BCE', yearHi: 'लगभग 1500–1000 ई.पू.', en: 'Early Vedic (Sapta-Sindhu)', hi: 'ऋग्वैदिक काल (सप्त-सिंधु)',
    form: b('Kin groups and assemblies', 'जन समूह और सभाएँ'), states: { Punjab: '#eab308', Haryana: '#eab308', 'Jammu & Kashmir': '#fde047' },
    pts: [{ lon: 74.8, lat: 31.6, l: b('Sapta-Sindhu region', 'सप्त-सिंधु क्षेत्र') }],
    desc: b('Vedic texts refer to assemblies such as sabha and samiti. Their membership and roles are interpreted from texts; dates and regional boundaries are debated.', 'वैदिक ग्रंथ सभा और समिति जैसी सभाओं का उल्लेख करते हैं। उनकी सदस्यता और भूमिकाओं की व्याख्या ग्रंथों से की जाती है; तिथियों और सीमाओं पर मतभेद हैं।'),
  },
  janapada: {
    year: 'c. 600–400 BCE', yearHi: 'लगभग 600–400 ई.पू.', en: 'Mahajanapadas (Magadha & Vajji)', hi: 'महाजनपद (मगध व वज्जि)',
    form: b('Kingdoms and gana-sanghas', 'राज्य और गणसंघ'), states: { Bihar: '#f97316', 'Uttar Pradesh': '#fb923c', 'Madhya Pradesh': '#fed7aa' },
    pts: [{ lon: 85.42, lat: 25.02, l: b('Rajagriha', 'राजगृह') }, { lon: 85.14, lat: 25.61, l: b('Pataliputra', 'पाटलिपुत्र') }, { lon: 85.13, lat: 26.0, l: b('Vaishali', 'वैशाली') }, { lon: 75.8, lat: 23.2, l: b('Ujjayini', 'उज्जयिनी') }],
    desc: b('Texts describe kingdoms such as Magadha and gana-sanghas such as Vajji. A collective assembly did not necessarily include everyone.', 'ग्रंथ मगध जैसे राज्यों और वज्जि जैसे गणसंघों का वर्णन करते हैं। सामूहिक सभा में आवश्यक नहीं कि सभी लोग शामिल रहे हों।'),
  },
  maurya: {
    year: 'c. 321–185 BCE', yearHi: 'लगभग 321–185 ई.पू.', en: 'Mauryas & Ashokan edicts', hi: 'मौर्य व अशोक अभिलेख',
    form: b('Empire with regional administration', 'क्षेत्रीय प्रशासन वाला साम्राज्य'), states: { Bihar: '#b45309', 'Uttar Pradesh': '#d97706', Odisha: '#f59e0b', 'Madhya Pradesh': '#f59e0b', Maharashtra: '#fbbf24', Karnataka: '#fde68a', Gujarat: '#fbbf24' },
    pts: [{ lon: 85.14, lat: 25.61, l: b('Pataliputra', 'पाटलिपुत्र') }, { lon: 85.8, lat: 20.2, l: b('Dhauli edict', 'धौली अभिलेख') }, { lon: 76.5, lat: 14.5, l: b('Brahmagiri edict', 'ब्रह्मगिरि अभिलेख') }],
    desc: b('Ashoka’s inscriptions used different languages and scripts in different regions. They record royal messages, not proof that policies worked everywhere.', 'अशोक के अभिलेखों में क्षेत्र के अनुसार अलग भाषाएँ और लिपियाँ हैं। वे शाही संदेश दर्ज करते हैं, यह सिद्ध नहीं करते कि नीति हर जगह सफल हुई।'),
  },
  gupta: {
    year: 'c. 320–650 CE', yearHi: 'लगभग 320–650 ई.', en: 'Guptas & later Harsha', hi: 'गुप्त और बाद के हर्ष',
    form: b('Different northern polities across centuries', 'अलग शताब्दियों में उत्तरी राज्य'), states: { Bihar: '#7c3aed', 'Uttar Pradesh': '#8b5cf6', 'Madhya Pradesh': '#a78bfa' },
    pts: [{ lon: 85.4, lat: 25.1, l: b('Nalanda', 'नालंदा') }, { lon: 79.9, lat: 27.0, l: b('Kannauj (Harsha)', 'कन्नौज (हर्ष)') }],
    desc: b('The Gupta period is approximately 320–550 CE; Harsha belongs to the seventh century. The two are grouped here for map navigation, not treated as simultaneous.', 'गुप्त काल लगभग 320–550 ई. है; हर्ष सातवीं शताब्दी के हैं। मानचित्र में सुविधा के लिए दोनों साथ हैं, समकालीन नहीं।'),
  },
  chola1000: {
    year: 'c. 700–1000 CE', yearHi: 'लगभग 700–1000 ई.', en: 'Pala, Rashtrakuta & later Chola', hi: 'पाल, राष्ट्रकूट व बाद के चोल',
    form: b('Regional states and local assemblies', 'क्षेत्रीय राज्य व स्थानीय सभाएँ'), states: { 'Tamil Nadu': '#059669', Karnataka: '#0d9488', Maharashtra: '#14b8a6', Bihar: '#2563eb', 'West Bengal': '#3b82f6' },
    pts: [{ lon: 79.7, lat: 12.6, l: b('Uttaramerur', 'उत्तरमेरूर') }, { lon: 77.2, lat: 17.2, l: b('Manyakheta', 'मान्यखेत') }, { lon: 87.2, lat: 25.3, l: b('Vikramashila', 'विक्रमशिला') }],
    desc: b('Tenth-century Uttaramerur inscriptions describe rules for selecting eligible committee members by lot. Participation was restricted; this was not universal suffrage.', 'दसवीं सदी के उत्तरमेरूर अभिलेख पात्र समिति सदस्यों के पर्ची से चयन के नियम बताते हैं। भागीदारी सीमित थी; यह सार्वभौमिक मताधिकार नहीं था।'),
  },
};

export const vedicDatedMap = {
  id: 'T05.L1',
  objective: b('Compare selected places and sources from different periods of early Indian history.', 'प्रारंभिक भारतीय इतिहास के अलग कालों के कुछ स्थानों और स्रोतों की तुलना करें।'),
  note: { kind: 'schematic', en: 'Modern state colours and approximate points are orientation aids, not historical borders. Dashed routes are illustrative and not evidence of the same route in every period.', hi: 'आधुनिक राज्यों के रंग और अनुमानित बिंदु केवल दिशा के लिए हैं, ऐतिहासिक सीमाएँ नहीं। बिंदीदार मार्ग उदाहरण हैं, हर काल के मार्ग का प्रमाण नहीं।' },
  init: () => ({ era: 'earlyVedic', showTrade: true }),
  controls: [
    { id: 'era', type: 'chips', label: b('Historical period (up to 1000 CE)', 'ऐतिहासिक काल (1000 ई. तक)'), options: Object.entries(T05_ERAS).map(([id, o]) => ({ id, en: o.year, hi: o.yearHi })) },
    { id: 'showTrade', type: 'toggle', label: b('Show illustrative routes (not period-specific)', 'उदाहरण मार्ग दिखाएँ (किसी काल के सटीक मार्ग नहीं)') },
  ],
  view(S) {
    const e = T05_ERAS[S.era] || T05_ERAS.earlyVedic;
    const markers = e.pts.map((p) => ({ lon: p.lon, lat: p.lat, r: 7.5, fill: '#b91c1c', pulse: true, label: p.l }));
    const paths = S.showTrade ? [
      { coords: [[72.8, 33.7], [77.2, 28.6], [85.1, 25.6], [87.9, 22.3]], stroke: '#b45309', width: 2.5, dash: '6 4' },
      { coords: [[85.1, 25.6], [75.8, 23.2], [73.0, 21.7], [78.1, 9.9], [79.8, 11.1]], stroke: '#0284c7', width: 2.5, dash: '5 4' },
    ] : [];
    const svg = indiaMapSvg({ w: 640, h: 410, stateColors: e.states, markers, paths, aria: P(`Schematic modern map showing examples for ${e.en}`, `आधुनिक आधार मानचित्र पर ${e.hi} के उदाहरण`) });
    return {
      plate: {
        src: 'assets/images/t05.jpg',
        en: 'An illustration of different periods; choose a pin to change the example on the map.',
        hi: 'अलग कालों का एक चित्र; मानचित्र का उदाहरण बदलने के लिए पिन चुनें।',
        spots: [
          { x: 22, y: 42, en: 'Vedic assemblies', hi: 'वैदिक सभाएँ', detail: b('Texts refer to sabha and samiti; the map uses an approximate example range.', 'ग्रंथ सभा और समिति का उल्लेख करते हैं; मानचित्र एक अनुमानित अवधि दिखाता है।'), set: { era: 'earlyVedic' } },
          { x: 46, y: 48, en: 'Vajji and Magadha', hi: 'वज्जि व मगध', detail: b('Kingdoms and gana-sanghas were different forms of political organisation.', 'राज्य और गणसंघ राजनीतिक संगठन के अलग रूप थे।'), set: { era: 'janapada' } },
          { x: 66, y: 42, en: 'Mauryan edicts', hi: 'मौर्य अभिलेख', detail: b('Ashokan inscriptions record royal messages in different regions.', 'अशोक के अभिलेख अलग क्षेत्रों में शाही संदेश दर्ज करते हैं।'), set: { era: 'maurya' } },
          { x: 82, y: 58, en: 'Uttaramerur inscriptions', hi: 'उत्तरमेरूर अभिलेख', detail: b('The tenth-century inscriptions set out selection rules for eligible candidates, not universal suffrage.', 'दसवीं सदी के अभिलेख पात्र उम्मीदवारों के चयन के नियम बताते हैं, सार्वभौमिक मताधिकार नहीं।'), set: { era: 'chola1000' } },
        ],
      },
      svg,
      aria: P(`${e.en} (${e.year}); modern state colours and routes are schematic`, `${e.hi} (${e.yearHi}); आधुनिक राज्य रंग और मार्ग योजनाबद्ध हैं`),
      lines: [
        { en: `${e.en} (${e.year}) · ${e.form.en}.`, hi: `${e.hi} (${e.yearHi}) · ${e.form.hi}।`, cls: 'balanced' },
        e.desc,
        b('Coloured modern states are not historical boundaries; dashed routes are illustrative, not proof of trade in this period.', 'रंगे आधुनिक राज्य ऐतिहासिक सीमाएँ नहीं हैं; बिंदीदार मार्ग उदाहरण हैं, इस काल के व्यापार का प्रमाण नहीं।'),
      ],
    };
  },
  discover: [b('Compare the three timeline windows and an earlier period. What can each source tell us, and whose views might be missing?', 'समय-रेखा की तीन झलकियों और एक पुराने काल की तुलना करें। हर स्रोत क्या बता सकता है और किसका दृष्टिकोण छूट सकता है?')],
  predictions: [
    {
      id: 'p1', revision: 't05-step5',
      stem: b('What do the tenth-century Uttaramerur inscriptions describe?', 'दसवीं सदी के उत्तरमेरूर अभिलेख किसका वर्णन करते हैं?'),
      options: [opt('kudavolai', 'Rules for choosing eligible village committee members by lot', 'पात्र ग्राम समिति सदस्यों का पर्ची से चयन करने के नियम'), opt('secret', 'No village administration at all', 'कोई ग्राम प्रशासन नहीं था')],
      run: (S) => { S.era = 'chola1000'; return 'kudavolai'; },
      explain: () => b('The inscriptions describe qualifications and selection by lot. Eligibility was restricted: this was not universal adult voting.', 'अभिलेख योग्यता और पर्ची से चयन बताते हैं। पात्रता सीमित थी: यह सभी वयस्कों का मताधिकार नहीं था।'),
    },
  ],
  exit: [
    {
      id: 'e1',
      stem: b('What made Vajji (Vaishali) different from hereditary kingdoms like Magadha?', 'वज्जि (वैशाली) मगध जैसे वंशानुगत राज्यों से किस प्रकार भिन्न था?'),
      correct: 'gana',
      options: [
        { id: 'gana', ...b('It was a gana-sangha where a group of rajas took decisions in an assembly.', 'यह गणसंघ था जहाँ राजाओं का एक समूह सभा में निर्णय लेता था।') },
        { id: 'emperor', ...b('It had one absolute emperor for life.', 'यहाँ आजीवन एक ही निरंकुश सम्राट होता था।'), why: b('Texts describe a collective assembly rather than a single monarch.', 'ग्रंथ एक शासक के बजाय सामूहिक सभा का वर्णन करते हैं।') },
      ],
      explain: b('Kingdoms and gana-sanghas differed; neither should automatically be equated with modern universal democracy.', 'राज्यों और गणसंघों में अंतर था; किसी को भी सीधे आधुनिक सार्वभौमिक लोकतंत्र नहीं मानना चाहिए।'),
      hint: b('Open the 600–400 BCE Mahajanapadas period.', '600–400 ई.पू. महाजनपद काल चुनें।'),
    },
  ],
  reflect: b('Choose one dated source. What does it say, and what other evidence could test an interpretation?', 'एक दिनांकित स्रोत चुनें। वह क्या कहता है और किसी व्याख्या को अन्य किस प्रमाण से जाँच सकते हैं?'),
};

// ================================================================ T05.L2 Primary Source & Corroboration Workbench
const SOURCES_T05 = {
  inscription: {
    en: 'Epigraphy: Ashoka Rock Edict XII & Uttaramerur Kudavolai (920 CE)',
    hi: 'अभिलेख: अशोक शिलालेख XII व उत्तरमेरूर कुदावोलई अभिलेख (920 ई.)',
    excerpt: b('Stone edicts capture contemporaneous civic policies: Ashoka urges inter-sect concord (samavaya), while Uttaramerur lists rules disqualifying corrupt officials from village lottery elections.', 'शिलालेख समकालीन नियम दर्ज करते हैं: अशोक सद्भाव (समवाय) की अपील करते हैं, और उत्तरमेरूर भ्रष्ट अधिकारियों को ग्राम चुनाव से अयोग्य ठहराता है।'),
    biasAlert: b('Limit: Stone messages record official rules, not necessarily whether every villager always obeyed them.', 'सीमा: शिलालेख आधिकारिक नियम दिखाते हैं, यह नहीं कि हर व्यक्ति उनका पालन करता था या नहीं।'),
  },
  text: {
    en: 'Literature & Travelogues: Sangam Poetry & Xuanzang (7th CE)',
    hi: 'साहित्य व यात्रा-वृत्तांत: संगम काव्य व ह्वेनसांग (7वीं सदी ई.)',
    excerpt: b('Purananuru celebrates Tamil poets like Avvaiyar & coastal trade; Chinese monk Xuanzang documented Nalanda’s 10,000+ residents & open logical debates.', 'पुरनानूरु कवयित्री अव्वैयार व तटीय व्यापार का वर्णन करता है; चीनी यात्री ह्वेनसांग ने नालंदा के छात्र-जीवन व तर्क-शास्त्रार्थ लिखा।'),
    biasAlert: b('Limit: Poets may praise patrons; travellers have their own perspectives and may also report things they did not personally observe.', 'सीमा: कवि आश्रयदाता की प्रशंसा कर सकते हैं; यात्रियों का अपना दृष्टिकोण होता है और वे सुनी हुई बातें भी लिख सकते हैं।'),
  },
  material: {
    en: 'Material Evidence: Karshapana Coins, Roman Gold & NBPW Bowls',
    hi: 'भौतिक साक्ष्य: आहत सिक्के, रोमन स्वर्ण व काले मृद्भांड',
    excerpt: b('Stamped silver coins, Mediterranean amphorae at Arikamedu, and glossy black bowls preserve daily artisan and merchant life across strata.', 'चाँदी के आहत सिक्के, अरिकामेडु में रोमन पात्र और चमकदार मृद्भांड आम शिल्पियों व व्यापारियों का जीवन दर्शाते हैं।'),
    biasAlert: b('Limit: Mute artefacts cannot directly tell us their makers’ names, debates, or religious philosophy.', 'सीमा: मौन पुरावशेष अपने निर्माताओं के नाम या विचार सीधे नहीं बोल सकते।'),
  },
  prashasti: {
    en: 'Royal Eulogy: Samudragupta’s Prayaga Prashasti (c. 350 CE)',
    hi: 'राजप्रशस्ति: समुद्रगुप्त का प्रयाग प्रशस्ति स्तंभ (ल. 350 ई.)',
    excerpt: b('Composed in ornate Sanskrit by court poet Harishena, praising the emperor as undefeated across dozens of kings — an essential political map, yet clearly court-authored praise.', 'राजकवि हरिषेण द्वारा संस्कृत में रचित स्तंभलेख जो सम्राट को अजेय बताता है — महत्त्वपूर्ण मानचित्र है पर दरबारी प्रशंसा भी।'),
    biasAlert: b('AI-Era Warning: Treating a royal prashasti alone as balanced fact mirrors trusting one-sided PR!', 'चेतावनी: केवल दरबारी प्रशस्ति को पूर्ण सत्य मानना एकतरफ़ा प्रचार पर भरोसा करने जैसा है!'),
  },
};

export const sourceRoom = {
  id: 'T05.L2',
  objective: b('Practise historian triangulation: compare inscriptions, texts, material finds and royal prashastis to spot bias and raise confidence.', 'इतिहासकार की त्रिकोणीय जाँच सीखें: अभिलेख, ग्रंथ, पुरावशेष और प्रशस्ति की तुलना कर पक्षपात पहचानें।'),
  note: { kind: 'schematic', en: 'This exercise suggests comparison questions; it does not inspect or verify sources automatically. Independent sources must address the same claim and period.', hi: 'यह अभ्यास तुलना के प्रश्न सुझाता है; यह स्रोतों को अपने आप जाँचता या प्रमाणित नहीं करता। स्वतंत्र स्रोतों को उसी दावे और काल से जुड़ा होना चाहिए।' },
  init: () => ({ src: 'inscription', corroborate: true }),
  controls: [
    { id: 'src', type: 'chips', label: b('Evidence category', 'साक्ष्य वर्ग'), options: [opt('inscription', 'Stone Edicts', 'शिलालेख'), opt('text', 'Texts / Travelogues', 'ग्रंथ / यात्रा-लेख'), opt('material', 'Coins & Pottery', 'सिक्के व मृद्भांड'), opt('prashasti', 'Royal Prashasti', 'राजप्रशस्ति')] },
    { id: 'corroborate', type: 'toggle', label: b('Show a comparison prompt', 'तुलना का प्रश्न दिखाएँ') },
  ],
  view(S) {
    const it = SOURCES_T05[S.src] || SOURCES_T05.inscription;
    const col = S.src === 'inscription' ? '#92400e' : S.src === 'text' ? '#4c1d95' : S.src === 'material' ? '#065f46' : '#b91c1c';
    const prompt = S.corroborate
      ? b('Plan a comparison of independent sources about the same claim and period. This switch does not check them for you.', 'एक ही दावे और काल के स्वतंत्र स्रोतों की तुलना की योजना बनाएँ। यह स्विच आपके लिए उनकी जाँच नहीं करता।')
      : b('One source can leave gaps. What other evidence could challenge or support this claim?', 'एक स्रोत में कमियाँ हो सकती हैं। कौन-सा अन्य प्रमाण इस दावे को चुनौती या सहारा दे सकता है?');
    const svg = `<svg viewBox="0 0 640 150" class="chart" role="img" aria-label="${esc(P(`Source inquiry: ${it.en}`, `स्रोत जाँच: ${it.hi}`))}" xmlns="http://www.w3.org/2000/svg"><rect x="18" y="14" width="604" height="122" rx="10" fill="var(--card)" stroke="${col}" stroke-width="3"/><text class="txt b" x="36" y="52">${esc(P('Source inquiry', 'स्रोत जाँच'))}</text><text class="txt sm" x="36" y="88">${esc(P(S.corroborate ? 'Comparison prompt shown' : 'Single source selected', S.corroborate ? 'तुलना का प्रश्न दिखा' : 'एक स्रोत चुना'))}</text></svg>`;
    const plate = S.src === 'inscription'
      ? {
          src: 'assets/images/plates/t05-sources.jpg',
          en: 'Carved stone relief, palm-leaf manuscript and coin bowl — tap pins to inspect different evidence classes.',
          hi: 'तराशा गया पत्थर अभिलेख, ताड़पत्र पांडुलिपि व सिक्का-पात्र — साक्ष्य वर्ग बदलने हेतु पिन पर टैप करें।',
          spots: [
            { x: 28, y: 54, en: 'Stone Epigraphy (Ashoka / Chola)', hi: 'शिलालेख प्रमाण', detail: b('Carved into durable stone during the rulers’ own lifetimes.', 'समकालीन शासकों के समय स्थायी पत्थर पर खुदे नियम व आदेश।'), set: { src: 'inscription', corroborate: true } },
            { x: 56, y: 58, en: 'Palm-Leaf Literary Sources', hi: 'ताड़पत्र व यात्रा ग्रंथ', detail: b('Sangam verses & Xuanzang travelogue capture daily debates & cultural ideals.', 'संगम कविता व ह्वेनसांग के यात्रा-वृत्तांत जीवंत समाज दिखाते हैं।'), set: { src: 'text' } },
            { x: 80, y: 60, en: 'Silver Karshapana Coins', hi: 'आहत चाँदी सिक्के', detail: b('Coins can support a trade interpretation, but context and dating matter; they do not alone prove prosperity for everyone.', 'सिक्के व्यापार की व्याख्या को सहारा दे सकते हैं, पर संदर्भ और तिथि महत्त्वपूर्ण हैं; वे सभी की समृद्धि सिद्ध नहीं करते।'), set: { src: 'material' } },
          ],
        }
      : S.src === 'text'
        ? {
            src: 'assets/images/plates/t05-knowledge.jpg',
            en: 'Bound palm-leaf manuscript and brick vihara archive — tap pins to test royal prashasti bias vs triangulation.',
            hi: 'ताड़पत्र पांडुलिपि और विहार अध्ययन कक्ष — राजप्रशस्ति व त्रिकोणीय जाँच परखने हेतु पिन पर टैप करें।',
            spots: [
              { x: 30, y: 50, en: 'Travelogue vs Court Praise', hi: 'यात्रा-वृत्तांत बनाम दरबारी प्रशस्ति', detail: b('A royal eulogy is evidence of court claims; it should not be read as an independent account.', 'राजप्रशस्ति दरबार के दावों का प्रमाण है; इसे स्वतंत्र विवरण नहीं मानना चाहिए।'), set: { src: 'prashasti', corroborate: false } },
              { x: 64, y: 54, en: 'Triangulate Independent Sources', hi: 'त्रिकोणीय स्रोत मिलान', detail: b('Plan a comparison of dated, independent evidence. This model does not actually perform the research.', 'तिथि वाले स्वतंत्र स्रोतों की तुलना की योजना बनाएँ। यह मॉडल वास्तव में शोध नहीं करता।'), set: { corroborate: true } },
            ],
          }
        : {
            src: 'assets/images/plates/t13-artefacts.jpg',
            en: 'Excavated coins, pottery shards and trade beads — tap pins to switch source classes.',
            hi: 'उत्खनित सिक्के, मृद्भांड व मनके — साक्ष्य वर्ग बदलने हेतु पिन पर टैप करें।',
            spots: [
              { x: 34, y: 54, en: 'Coins & Amphora Material Proof', hi: 'सिक्के व पात्र भौतिक प्रमाण', detail: b('Direct physical stratigraphy verifies Roman/West Asian trade contacts.', 'भौतिक उत्खनन विदेशी व्यापार की सीधी पुष्टि करता है।'), set: { src: 'material', corroborate: true } },
              { x: 68, y: 56, en: 'Cross-Check Against Epigraphy', hi: 'शिलालेख से मिलान', detail: b('Compare mute coins against carved Tamil/Ashokan inscriptions.', 'मौन सिक्कों की तुलना तराशे शिलालेखों से करें।'), set: { src: 'inscription', corroborate: true } },
            ],
          };
    return { plate, svg, aria: P(`Source inquiry: ${it.en}`, `स्रोत जाँच: ${it.hi}`), lines: [it.excerpt, { ...it.biasAlert, cls: 'warn' }, prompt] };
  },
  discover: [b('Pick Royal Prashasti. What independent, dated source could support or challenge one specific claim? The switch is a reminder, not a completed check.', 'राजप्रशस्ति चुनें। किसी एक दावे को कौन-सा स्वतंत्र दिनांकित स्रोत सहारा या चुनौती दे सकता है? स्विच याद दिलाता है, जाँच पूरी नहीं करता।')],
  predictions: [
    {
      id: 'p1',
      stem: b('Suppose you read Samudragupta’s Prayaga Prashasti claiming effortless conquests everywhere. How would a 21st-century historian test its accuracy?', 'मान लीजिए आप प्रयाग प्रशस्ति पढ़ते हैं जिसमें हर राजा पर सहज विजय का दावा है। आधुनिक इतिहासकार इसकी जाँच कैसे करेगा?'),
      options: [opt('cross', 'Cross-check against local dynasties’ inscriptions, coins & geography to separate royal praise from verified control', 'स्थानीय राजवंशों के अभिलेखों, सिक्कों व भूगोल से मिलान कर प्रशंसा और वास्तविक नियंत्रण में अंतर करेगा'), opt('copy', 'Repeat every poetic adjective word-for-word as literal fact', 'हर काव्यात्मक विशेषण को ज्यों का त्यों तथ्य मान लेगा')],
      run: (S) => { S.src = 'prashasti'; S.corroborate = true; return 'cross'; },
      explain: () => b('Royal eulogies are precious clues to imperial ideology, yet must always be cross-checked against independent inscriptions and coins.', 'राजप्रशस्ति सम्राट के आदर्श बताती है पर वास्तविक सीमा जानने को अन्य सिक्कों व अभिलेखों से मिलान आवश्यक है।'),
    },
  ],
  exit: [
    {
      id: 'e1',
      stem: b('Finding Roman gold coins and Sangam poetry praising foreign ships in Tamil Nadu is an example of…', 'तमिलनाडु में रोमन सोने के सिक्के और विदेशी जहाजों की प्रशंसा करती संगम कविता मिलना किसका उदाहरण है?'),
      correct: 'corroborate',
      options: [
        { id: 'corroborate', ...b('Material and literary evidence that can support a trade interpretation, if their dates and contexts align.', 'भौतिक और साहित्यिक प्रमाण जो संदर्भ और तिथि मिलने पर व्यापार की व्याख्या को सहारा दे सकते हैं।') },
        { id: 'contradict', ...b('Sources contradicting each other completely.', 'स्रोतों का पूरी तरह खंडन।'), why: b('Coins and poems align to prove flourishing sea trade.', 'सिक्के और कविता दोनों समृद्ध समुद्री व्यापार की पुष्टि करते हैं।') },
      ],
      explain: b('Different kinds of dated evidence can support an interpretation when their contexts and limitations are examined; agreement does not eliminate uncertainty.', 'संदर्भ और सीमाएँ जाँचने पर अलग प्रकार के दिनांकित प्रमाण व्याख्या को सहारा दे सकते हैं; मेल से अनिश्चितता पूरी तरह नहीं मिटती।'),
      hint: b('Think about independent sources and their contexts.', 'स्वतंत्र स्रोतों और उनके संदर्भों पर सोचें।'),
    },
  ],
  reflect: b('Imagine a historian 1,000 years from now studying our era from ONLY viral AI posts vs corroborated public archives—how would their story differ?', 'कल्पना करें 1,000 वर्ष बाद का इतिहासकार हमारे युग को केवल वायरल पोस्ट बनाम प्रमाणित अभिलेखों से पढ़े—क्या अंतर होगा?'),
};

// ================================================================ T05.L3 Saptanga & State-vs-Society Governance Lab
export const empireAdmin = {
  id: 'T05.L3',
  objective: b('Learn the seven components of a theory of statecraft, then question the assumptions in a separate fictional governance model.', 'राज्य-कौशल के एक सिद्धांत के सात अंग जानें, फिर अलग काल्पनिक शासन मॉडल की धारणाएँ परखें।'),
  note: { kind: 'fictional', en: 'The controls and numerical rules below are invented teaching assumptions, not measurements of any historical state. Governance labels do not imply each state used the Saptanga theory.', hi: 'नीचे के नियंत्रण और संख्यात्मक नियम शिक्षण के लिए बनाए गए हैं, किसी ऐतिहासिक राज्य के माप नहीं। शासन नामों से यह नहीं सिद्ध होता कि हर राज्य ने सप्तांग सिद्धांत अपनाया।' },
  init: () => ({ govMode: 'maurya', taxRate: 17, roadsInvest: 50, irrigationInvest: 50 }),
  controls: [
    { id: 'govMode', type: 'chips', label: b('Toy scenario label', 'काल्पनिक मॉडल का नाम'), options: [opt('gana', 'Gana-Sangha example', 'गणसंघ उदाहरण'), opt('maurya', 'Mauryan example', 'मौर्य उदाहरण'), opt('samanta', 'Samanta example', 'सामंत उदाहरण'), opt('chola', 'Chola example', 'चोल उदाहरण')] },
    { id: 'taxRate', type: 'slider', label: b('Toy tax setting (%)', 'मॉडल में कर स्तर (%)'), min: 8, max: 40, step: 1, fmt: (v) => `${v}%` },
    { id: 'roadsInvest', type: 'slider', label: b('Toy road effort (points)', 'मॉडल में सड़क प्रयास (अंक)'), min: 10, max: 90, step: 10, fmt: (v) => `${v}` },
    { id: 'irrigationInvest', type: 'slider', label: b('Toy irrigation effort (points)', 'मॉडल में सिंचाई प्रयास (अंक)'), min: 10, max: 90, step: 10, fmt: (v) => `${v}` },
  ],
  view(S) {
    const r = H.saptangaEmpireSim({ governanceMode: S.govMode, taxRate: S.taxRate, roadsInvest: S.roadsInvest, irrigationInvest: S.irrigationInvest });
    const nodes = [
      { id: 'king', label: b('Ruler / assembly', 'शासक / सभा'), rw: 145, stroke: '#b45309' },
      { id: 'prov', label: b('Local officials', 'स्थानीय अधिकारी'), rw: 142, stroke: '#0b5cad' },
      { id: 'village', label: b('Farmers & artisans', 'कृषक व शिल्पी'), rw: 132, stroke: '#2e8b57' },
      { id: 'works', label: b('Public works', 'सार्वजनिक कार्य'), rw: 136, stroke: '#0284c7' },
    ];
    const links = [
      { source: 'village', target: 'prov', label: b(`Toy tax ${S.taxRate}%`, `काल्पनिक कर ${S.taxRate}%`) },
      { source: 'prov', target: 'king', label: b('Resources (toy)', 'संसाधन (मॉडल)') },
      { source: 'king', target: 'works', label: b('Works (toy)', 'कार्य (मॉडल)') },
      { source: 'works', target: 'village', label: b('Possible support', 'संभावित सहायता') },
    ];
    const netSvg = forceGraphSvg({ w: 640, h: 250, nodes, links, activeId: r.legitimacy < 45 ? 'village' : 'king', aria: P('Fictional resource flow, not a historical administration chart', 'काल्पनिक संसाधन प्रवाह, ऐतिहासिक प्रशासन का चार्ट नहीं') });
    const bars = r.indicators.map((indicator, idx) => {
      const y = 18 + idx * 24;
      const bw = Math.round((indicator.val / 100) * 320);
      const col = indicator.val >= 65 ? '#16a34a' : indicator.val >= 40 ? '#d97706' : '#dc2626';
      return `<text class="txt sm b" x="14" y="${y + 12}">${esc(P(indicator.en, indicator.hi))}</text><rect x="230" y="${y}" width="320" height="14" rx="7" fill="var(--bg)" stroke="var(--line)"/><rect x="230" y="${y}" width="${bw}" height="14" rx="7" fill="${col}"/><text class="txt sm b" x="560" y="${y + 12}">${indicator.val}</text>`;
    }).join('');
    const barSvg = `<svg viewBox="0 0 640 148" class="chart" role="img" aria-label="${esc(P('Five fictional model indicators, not the seven Saptanga parts', 'पाँच काल्पनिक मॉडल सूचक, सप्तांग के सात अंग नहीं'))}" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="632" height="140" rx="10" fill="var(--card)" stroke="var(--line)"/>${bars}</svg>`;
    return {
      plate: {
        src: 'assets/images/plates/t05-saptanga.jpg',
        en: 'A teaching illustration. Choose a pin to change the fictional scenario; it is not an image of a particular historical administration.',
        hi: 'एक शिक्षण चित्र। काल्पनिक मॉडल बदलने के लिए पिन चुनें; यह किसी विशेष ऐतिहासिक प्रशासन का चित्र नहीं है।',
        spots: [
          { x: 12, y: 72, en: 'Moderate toy tax', hi: 'मॉडल में मध्यम कर', detail: b('Sets an illustrative 17% tax and medium works settings; these are not measured Mauryan figures.', 'उदाहरण में 17% कर और मध्यम निर्माण स्तर चुनता है; ये मौर्य काल के माप नहीं हैं।'), set: { govMode: 'maurya', taxRate: 17, roadsInvest: 60, irrigationInvest: 60 } },
          { x: 46, y: 62, en: 'More road effort', hi: 'सड़क प्रयास बढ़ाएँ', detail: b('Sets the road slider to 80 toy points; it is not an ancient spending percentage.', 'सड़क स्लाइडर को 80 काल्पनिक अंक पर रखता है; यह प्राचीन व्यय का प्रतिशत नहीं है।'), set: { roadsInvest: 80, taxRate: 16 } },
          { x: 72, y: 68, en: 'More irrigation effort', hi: 'सिंचाई प्रयास बढ़ाएँ', detail: b('The example sets irrigation to 80 toy points; the historical inscription does not supply that number.', 'उदाहरण में सिंचाई 80 काल्पनिक अंक है; यह संख्या ऐतिहासिक अभिलेख से नहीं ली गई।'), set: { govMode: 'chola', irrigationInvest: 80, taxRate: 16 } },
          { x: 88, y: 36, en: 'Higher tax in the toy', hi: 'मॉडल में अधिक कर', detail: b('Try a higher fictional tax and less irrigation; compare only the toy results.', 'काल्पनिक कर बढ़ाएँ और सिंचाई घटाएँ; केवल मॉडल परिणामों की तुलना करें।'), set: { govMode: 'samanta', taxRate: 34, irrigationInvest: 20 } },
        ],
      },
      svg: netSvg + barSvg,
      aria: P('Invented governance scenario with five toy indicators', 'पाँच काल्पनिक सूचकों वाला शासन मॉडल'),
      lines: [
        { en: `Toy points: support ${r.legitimacy}, food resilience ${r.villageResilience}, treasury ${r.treasury}, stability ${100 - r.breakawayRisk} (out of 100).`, hi: `काल्पनिक अंक: समर्थन ${r.legitimacy}, भोजन स्थिरता ${r.villageResilience}, कोष ${r.treasury}, स्थिरता ${100 - r.breakawayRisk} (100 में से)।` },
        b('All numbers, relationships and differences between scenario labels are invented; they are not probabilities, historical measurements or the seven Saptanga elements.', 'सभी संख्याएँ, संबंध और मॉडल नामों के बीच अंतर बनाए गए हैं; ये संभावनाएँ, ऐतिहासिक माप या सप्तांग के सात अंग नहीं हैं।'),
      ],
    };
  },
  discover: [b('Compare the toy with lower tax and higher works against higher tax and lower works. Which assumptions drive the result, and what sources would be needed to investigate a real society?', 'मॉडल में कम कर व अधिक निर्माण की तुलना अधिक कर व कम निर्माण से करें। परिणाम किन धारणाओं पर निर्भर है और वास्तविक समाज की जाँच के लिए कौन-से स्रोत चाहिए?')],
  predictions: [
    {
      id: 'p1', revision: 't05-step5',
      stem: b('In this toy only, what happens to the support index when tax is set higher and works lower, compared with lower tax and higher works?', 'केवल इस मॉडल में कम कर व अधिक निर्माण की तुलना में अधिक कर व कम निर्माण पर समर्थन सूचक का क्या होता है?'),
      options: [opt('collapse', 'The toy support index is lower', 'मॉडल में समर्थन सूचक कम होता है'), opt('eternal', 'Every real historical state is guaranteed to become stronger', 'हर वास्तविक ऐतिहासिक राज्य का मजबूत होना निश्चित है')],
      run: (S) => {
        const before = H.saptangaEmpireSim({ governanceMode: S.govMode, taxRate: 16, roadsInvest: 70, irrigationInvest: 70 });
        S.taxRate = 38; S.roadsInvest = 10; S.irrigationInvest = 10;
        const after = H.saptangaEmpireSim({ governanceMode: S.govMode, taxRate: S.taxRate, roadsInvest: S.roadsInvest, irrigationInvest: S.irrigationInvest });
        return after.legitimacy < before.legitimacy ? 'collapse' : 'eternal';
      },
      explain: () => b('The invented formula penalises high tax and rewards works. Its score is not a measurement or a claim that every historical society behaved this way.', 'बनाया गया सूत्र अधिक कर पर अंक घटाता और निर्माण पर बढ़ाता है। यह अंक माप नहीं और न यह दावा है कि हर ऐतिहासिक समाज ऐसा ही था।'),
    },
  ],
  exit: [
    {
      id: 'e1',
      stem: b('What can the Uttaramerur inscriptions tell us about some village committees?', 'उत्तरमेरूर अभिलेख कुछ ग्राम समितियों के बारे में क्या बता सकते हैं?'),
      correct: 'local',
      options: [
        { id: 'local', ...b('Rules existed for selecting eligible members; not everyone had the same opportunity to participate.', 'पात्र सदस्यों के चयन के नियम थे; सभी को भाग लेने का समान अवसर नहीं था।') },
        { id: 'ignore', ...b('Every adult was guaranteed an equal vote.', 'हर वयस्क को समान मत की गारंटी थी।'), why: b('The inscription describes qualifications and exclusions, not universal adult suffrage.', 'अभिलेख योग्यता और अपात्रता बताते हैं, सार्वभौमिक वयस्क मताधिकार नहीं।') },
      ],
      explain: b('The rules are evidence of local institutions and restrictions. An inscription does not prove how every village functioned.', 'ये नियम स्थानीय संस्थाओं और सीमाओं के प्रमाण हैं। एक अभिलेख से हर गाँव का व्यवहार सिद्ध नहीं होता।'),
      hint: b('Read the later Chola timeline window and its participation limit.', 'बाद के चोल काल की झलकी और भागीदारी की सीमा पढ़ें।'),
    },
  ],
  reflect: b('Which assumption in this toy needs historical evidence? How do the seven parts differ from these invented indicators?', 'इस मॉडल की किस धारणा को ऐतिहासिक प्रमाण चाहिए? सात अंग इन काल्पनिक सूचकों से कैसे अलग हैं?'),
};

// ================================================================ T05.L4 Indian Knowledge Systems & AI Parallels
const KT_ITEMS = {
  lang: {
    en: 'Panini’s Ashtadhyayi (c. 5th BCE) · Generative Rules',
    hi: 'पाणिनि की अष्टाध्यायी · सूत्र-आधारित भाषा प्रणाली',
    body: b('The Ashtadhyayi describes Sanskrit using roughly 4,000 concise rules and metarules. Comparing rule systems with modern formal grammar is useful, but does not make them identical.', 'अष्टाध्यायी में लगभग 4,000 संक्षिप्त सूत्र और नियम-संबंधी नियम संस्कृत का वर्णन करते हैं। आधुनिक औपचारिक व्याकरण से तुलना उपयोगी है, पर दोनों एक जैसे नहीं हैं।'),
    aiParallel: b('Comparison: a parser and a grammar use rules in different contexts. Modern AI language models are not simply Panini’s system.', 'तुलना: पार्सर और व्याकरण अलग संदर्भों में नियमों का उपयोग करते हैं। आधुनिक एआई भाषा मॉडल केवल पाणिनि की प्रणाली नहीं हैं।'),
  },
  math: {
    en: 'Zero, Aryabhata (499 CE) & Brahmagupta (628 CE)',
    hi: 'शून्य, आर्यभट (499 ई.) व ब्रह्मगुप्त (628 ई.)',
    body: b('Decimal place-value with zero, negative numbers, rules of zero arithmetic, π ≈ 3.1416, and Earth’s daily axial rotation causing apparent star motion.', 'दशमलव स्थानीय मान व शून्य के नियम, ऋणात्मक संख्याएँ, π ≈ 3.1416 और पृथ्वी के अपनी धुरी पर घूमने की खोज।'),
    aiParallel: b('AI Parallel: Binary & decimal place-value notation plus algorithmic step-by-step calculation underpin every computer chip today.', 'एआई समानता: स्थानीय मान व चरणबद्ध कलन-विधि (एल्गोरिदम) आज के हर प्रोसेसर की आधारशिला हैं।'),
  },
  med: {
    en: 'Charaka & Sushruta Samhitas (Empirical Medicine)',
    hi: 'चरक व सुश्रुत संहिता (आयुर्वेद विज्ञान)',
    body: b('Systematic observation of symptoms, dietetics, medicinal plants, wound care, and surgical instruments (including reconstructive rhinoplasty).', 'रोग लक्षणों का व्यवस्थित अवलोकन, औषधीय पौधे, शल्य-चिकित्सा के 120+ यंत्र और नासिका-पुनर्निर्माण विधियाँ।'),
    aiParallel: b('AI Parallel: Clinical triage follows decision trees—observe evidence, test hypotheses, and track patient outcomes before prescribing.', 'एआई समानता: आधुनिक नैदानिक निर्णय-वृक्ष की तरह प्रमाण देखें, परिकल्पना परखें और परिणाम जांचें।'),
  },
  metal: {
    en: 'Mehrauli Iron Pillar (c. 400 CE) & Wootz Crucible Steel',
    hi: 'महरौली लौह स्तंभ व वूट्ज़ इस्पात धातुकर्म',
    body: b('A 7.2-metre 6-tonne forge-welded iron pillar standing outdoors in Delhi for centuries with notable corrosion resistance, partly associated with a protective surface film; South Indian crucible Wootz steel traded worldwide.', 'सदियों से जंग का प्रतिरोध करता 7.2 मीटर महरौली स्तंभ (सुरक्षात्मक लौह परत) और दक्षिण भारत का विश्वप्रसिद्ध वूट्ज़ इस्पात।'),
    aiParallel: b('Comparison: materials scientists investigate how composition and process affect corrosion. The surviving pillar alone does not show every step ancient craftspeople used.', 'तुलना: सामग्री वैज्ञानिक मिश्रण व निर्माण प्रक्रिया का क्षरण पर प्रभाव जाँचते हैं। बचा स्तंभ अकेले कारीगरों के सभी चरण नहीं बताता।'),
  },
  uni: {
    en: 'Takshashila, Nalanda & Vikramashila (up to 1000 CE)',
    hi: 'तक्षशिला, नालंदा व विक्रमशिला विश्वविद्यालय',
    body: b('Residential international centres (up to 1000 CE) funded by village grants, drawing scholars from China, Tibet, Korea & Central Asia for logic (nyaya), astronomy & open Shastrartha debates.', 'ग्राम-दान से पोषित आवासीय केंद्र जहाँ चीन, तिब्बत व कोरिया के विद्वान तर्कशास्त्र, खगोल व खुले शास्त्रार्थ में भाग लेते थे।'),
    aiParallel: b('AI Parallel: Shastrartha (rules of structured counter-argument & testing flaws) can invite comparison with peer review and modern fact-checking, although their contexts differ.', 'एआई समानता: शास्त्रार्थ (तर्क व खंडन से त्रुटि पकड़ना) आधुनिक सहकर्मी-समीक्षा और तथ्य-जाँच से तुलना के लिए प्रश्न देता है, हालाँकि संदर्भ अलग हैं।'),
  },
};

export const knowledgeGallery = {
  id: 'T05.L4',
  objective: b('Explore India’s ancient knowledge systems up to 1000 CE — grammar algorithms, zero, surgery, metallurgy & Nalanda/Vikramashila debates — and connect them to AI-era thinking.', '1000 ई. तक की भारतीय ज्ञान परंपराओं — व्याकरण सूत्र, शून्य, शल्य-चिकित्सा, धातुकर्म और नालंदा-विक्रमशिला शास्त्रार्थ — को एआई युग की सोच से जोड़ें।'),
  note: { kind: 'documented', en: 'Historically attested treatises and sites; dates are scholarly estimates.', hi: 'प्रमाणित प्राचीन ग्रंथ व स्थल; तिथियाँ विद्वानों द्वारा आकलित हैं।' },
  init: () => ({ topic: 'lang', compareAi: true }),
  controls: [
    { id: 'topic', type: 'chips', label: b('Knowledge tradition', 'ज्ञान परंपरा'), options: Object.entries(KT_ITEMS).map(([id, o]) => ({ id, en: o.en.split(' (')[0].split(' ·')[0], hi: o.hi.split(' (')[0].split(' ·')[0] })) },
    { id: 'compareAi', type: 'toggle', label: b('Highlight 21st-century AI & STEM connection', '21वीं सदी एआई / विज्ञान जुड़ाव दिखाएँ') },
  ],
  view(S) {
    const it = KT_ITEMS[S.topic] || KT_ITEMS.lang;
    const badge = S.compareAi ? '⚡ 21st-Century Algorithmic & Empirical Method' : 'Observation · Logic · Manuscript Tradition';
    const badgeHi = S.compareAi ? '⚡ 21वीं सदी एल्गोरिदमिक व प्रयोग-आधारित दृष्टिकोण' : 'प्रेक्षण · तर्क · पांडुलिपि परंपरा';
    const svg = `<svg viewBox="0 0 640 190" class="chart" role="img" xmlns="http://www.w3.org/2000/svg"><rect x="18" y="14" width="604" height="162" rx="12" fill="${S.compareAi ? '#eff6ff' : '#fef9c3'}" stroke="${S.compareAi ? '#0b5cad' : '#ca8a04'}" stroke-width="2.5"/><text class="txt b" x="320" y="64" text-anchor="middle">${esc(P(it.en, it.hi))}</text><rect x="64" y="88" width="512" height="40" rx="8" fill="var(--card)" stroke="var(--line)"/><text class="txt sm b" x="320" y="113" text-anchor="middle">${esc(P(badge, badgeHi))}</text><text class="txt sm mut" x="320" y="156" text-anchor="middle">${esc(P('Rule Systems · Debate (Shastrartha) · Cross-Cultural Exchange', 'नियम-प्रणाली · शास्त्रार्थ · वैश्विक ज्ञान आदान-प्रदान'))}</text></svg>`;
    return {
      plate: {
        src: 'assets/images/plates/t05-knowledge.jpg',
        en: 'Palm-leaf grammar/astronomy manuscript, Ayurvedic mortar & brass armillary sphere — tap pins to explore each Indian Knowledge System.',
        hi: 'ताड़पत्र पांडुलिपि, आयुर्वेदिक खरल व पीतल खगोल यंत्र — प्रत्येक ज्ञान परंपरा देखने हेतु पिन पर टैप करें।',
        spots: [
          { x: 24, y: 58, en: 'Panini’s 4,000 Generative Rules', hi: 'पाणिनि की अष्टाध्यायी (सूत्र प्रणाली)', detail: b('Algorithmic meta-rules and recursion built formal syntax millennia before computers.', 'कंप्यूटर से सदियों पहले 4,000 सूत्रों में जनरेटिव व्याकरण प्रणाली।'), set: { topic: 'lang', compareAi: true } },
          { x: 48, y: 54, en: 'Aryabhata & Zero Armillary Sphere', hi: 'आर्यभट, शून्य व खगोल यंत्र', detail: b('Decimal zero rules, π ≈ 3.1416 and Earth’s daily axial rotation (499 CE).', 'शून्य के नियम, दशमलव व पृथ्वी के घूर्णन की सटीक व्याख्या।'), set: { topic: 'math', compareAi: true } },
          { x: 68, y: 62, en: 'Ayurveda & Sushruta Surgical Practice', hi: 'आयुर्वेद व सुश्रुत शल्य-चिकित्सा', detail: b('Surgical texts describe instruments and practice on different materials; present-day sterility should not be assumed.', 'शल्य ग्रंथ उपकरण और विभिन्न वस्तुओं पर अभ्यास बताते हैं; आज की रोगाणुमुक्ति मान नहीं लेनी चाहिए।'), set: { topic: 'med', compareAi: true } },
          { x: 84, y: 40, en: 'Nalanda & Vikramashila Shastrartha', hi: 'नालंदा व विक्रमशिला शास्त्रार्थ', detail: b('Traditions of argument invite comparison with, but are not identical to, modern peer review.', 'तर्क परंपराओं की आधुनिक सहकर्मी समीक्षा से तुलना हो सकती है, पर दोनों एक जैसे नहीं हैं।'), set: { topic: 'uni', compareAi: true } },
        ],
      },
      svg,
      aria: it.en,
      lines: [
        { en: it.en, hi: it.hi, cls: 'balanced' },
        it.body,
        ...(S.compareAi ? [{ ...it.aiParallel, cls: 'balanced' }] : []),
      ],
    };
  },
  discover: [b('Inspect Panini’s Grammar and Vikramashila/Nalanda with the 21st-Century AI toggle ON. Why is rule-based testing + open debate still essential in the AI era?', 'पाणिनि व नालंदा कार्ड पर एआई जुड़ाव चालू कर देखें। आज के एआई युग में नियम-जाँच और खुला शास्त्रार्थ क्यों ज़रूरी है?')],
  predictions: [
    {
      id: 'p1',
      stem: b('Why did scholars from China, Tibet and Korea travel thousands of kilometres to Nalanda and Vikramashila up to 1000 CE?', '1000 ई. तक चीन, तिब्बत और कोरिया से विद्वान हजारों किलोमीटर चलकर नालंदा व विक्रमशिला क्यों आते थे?'),
      options: [opt('uni', 'To study vast residential libraries, logic (nyaya), medicine & challenge ideas in open Shastrartha debates', 'विशाल पुस्तकालय, न्याय-तर्क, चिकित्सा पढ़ने और खुले शास्त्रार्थ में विचारों की परख करने'), opt('weapons', 'To mine coal in the library courtyard', 'पुस्तकालय में कोयला खोदने')],
      run: (S) => { S.topic = 'uni'; return 'uni'; },
      explain: () => b('Nalanda and Vikramashila were collaborative, tax-funded learning ecosystems where ideas had to survive rigorous questioning.', 'नालंदा व विक्रमशिला में हर विचार को खुले प्रश्न-उत्तर और तर्क की कसौटी पर खरा उतरना पड़ता था।'),
    },
  ],
  exit: [
    {
      id: 'e1',
      stem: b('How is Panini’s Ashtadhyayi connected to modern computer science and AI language technology?', 'पाणिनि की अष्टाध्यायी आधुनिक कंप्यूटर विज्ञान और एआई भाषा तकनीक से कैसे जुड़ी है?'),
      correct: 'rules',
      options: [
        { id: 'rules', ...b('Its systematic Sanskrit rules can be compared with formal grammars, while their contexts differ.', 'संस्कृत के व्यवस्थित नियमों की औपचारिक व्याकरण से तुलना हो सकती है, पर उनके संदर्भ अलग हैं।') },
        { id: 'electricity', ...b('Panini built silicon microchips in Taxila.', 'पाणिनि ने तक्षशिला में सिलिकॉन चिप बनाई।'), why: b('Panini worked with formal symbolic logic on palm/oral systems centuries before electricity.', 'पाणिनि ने बिजली से सदियों पहले अमूर्त तार्किक नियम-प्रणाली रची।') },
      ],
      explain: b('Both can use explicit rules, but comparing them does not mean Panini built computers or modern AI.', 'दोनों में स्पष्ट नियम हो सकते हैं, पर तुलना का अर्थ यह नहीं कि पाणिनि ने कंप्यूटर या आधुनिक एआई बनाया।'),
      hint: b('Click the Panini card with the AI connection toggle ON.', 'एआई जुड़ाव चालू करके पाणिनि कार्ड देखें।'),
    },
  ],
  reflect: b('How is ancient Indian Shastrartha (testing arguments for contradictions) a superpower against blindly believing AI chatbots today?', 'प्राचीन भारतीय शास्त्रार्थ (तर्क में दोष खोजना) आज एआई चैटबॉट पर आँख मूंदकर भरोसा करने से कैसे बचाता है?'),
};

// ================================================================ T05.L5 Trade routes, Shreni guilds & Bay of Bengal Commerce
export const guildTrade = {
  id: 'T05.L5',
  objective: b('Simulate overland and maritime commerce along Uttarapatha, Dakshinapatha & Bay of Bengal guild routes up to 1000 CE (Shreni, Manigramam, Ayyavole 500).', '1000 ई. तक उत्तरापथ, दक्षिणापथ व बंगाल की खाड़ी मार्गों पर श्रेणी, मणिग्रामम व अय्यावोले संघों के व्यापार व जोखिम का अनुकरण करें।'),
  note: { kind: 'fictional', en: 'Routes are schematic; values, fees and risk percentages are invented for this toy, not estimates of ancient commerce or insurance.', hi: 'मार्ग योजनाबद्ध हैं; मूल्य, शुल्क और जोखिम प्रतिशत इस मॉडल के लिए बनाए गए हैं, प्राचीन व्यापार या बीमा के अनुमान नहीं।' },
  init: () => ({ route: 'uttarapatha', shreniJoin: true, monsoonInsurance: false, cargoValue: 120 }),
  controls: [
    { id: 'route', type: 'chips', label: b('Trade corridor (up to 1000 CE)', 'व्यापार मार्ग (1000 ई. तक)'), options: [opt('uttarapatha', 'Uttarapatha (Taxila → Tamralipti)', 'उत्तरापथ'), opt('dakshinapatha', 'Dakshinapatha (Barygaza / Muziris)', 'दक्षिणापथ'), opt('maritime', 'Chola / Pala Bay of Bengal Sea Guilds', 'समुद्री व्यापार (कावेरीपट्टिनम → पूर्व)')] },
    { id: 'cargoValue', type: 'slider', label: b('Shipment capital (gold units)', 'व्यापार पूंजी (स्वर्ण इकाई)'), min: 60, max: 240, step: 20 },
    { id: 'shreniJoin', type: 'toggle', label: b('Join a Guild (Shreni / Manigramam)', 'श्रेणी / व्यापार संघ में शामिल हों') },
    { id: 'monsoonInsurance', type: 'toggle', label: b('Pooled caravan / sea risk fund', 'सामूहिक जोखिम सुरक्षा कोष') },
  ],
  view(S) {
    const ut = S.route === 'uttarapatha', sea = S.route === 'maritime';
    const coords = ut
      ? [[72.8, 33.7], [77.2, 28.6], [77.7, 27.5], [83.0, 25.3], [85.1, 25.6], [87.9, 22.3]]
      : sea
        ? [[87.9, 22.3], [85.8, 20.1], [80.3, 13.0], [79.8, 11.1], [86.0, 10.5], [93.5, 9.2]]
        : [[85.1, 25.6], [78.6, 23.8], [75.8, 23.2], [73.0, 21.7], [76.2, 10.2]];
    const markers = ut
      ? [{ lon: 77.7, lat: 27.5, r: 6, fill: '#b45309', label: b('Mathura', 'मथुरा') }, { lon: 85.1, lat: 25.6, r: 7, fill: '#b45309', label: b('Pataliputra', 'पाटलिपुत्र') }, { lon: 87.9, lat: 22.3, r: 7, fill: '#0369a1', label: b('Tamralipti', 'ताम्रलिप्ति') }]
      : sea
        ? [{ lon: 87.9, lat: 22.3, r: 6.5, fill: '#0369a1', label: b('Tamralipti (Pala)', 'ताम्रलिप्ति') }, { lon: 79.8, lat: 11.1, r: 7.5, fill: '#059669', label: b('Kaveripattinam (Chola)', 'कावेरीपट्टिनम') }, { lon: 93.0, lat: 9.5, r: 6, fill: '#7c3aed', label: b('To Suvarnabhumi →', 'सुवर्णभूमि की ओर →') }]
        : [{ lon: 75.8, lat: 23.2, r: 6.5, fill: '#b45309', label: b('Ujjayini', 'उज्जयिनी') }, { lon: 73.0, lat: 21.7, r: 7, fill: '#0369a1', label: b('Barygaza', 'भृगुकच्छ') }, { lon: 76.2, lat: 10.2, r: 7, fill: '#0369a1', label: b('Muziris', 'मुज़िरिस') }];
    const sim = H.guildRiskSim({ route: S.route, shreniJoin: S.shreniJoin, cargoValue: S.cargoValue, monsoonInsurance: S.monsoonInsurance });
    const svg = indiaMapSvg({ w: 640, h: 410, paths: [{ coords, stroke: ut ? '#b45309' : sea ? '#059669' : '#7c3aed', width: 4 }], markers, aria: `${S.route} trade corridor across India` });
    return {
      plate: {
        src: 'assets/images/plates/t05-guilds.jpg',
        en: 'Ancient merchant guild (shreni): tap spice sacks, silver coins or guild seal to switch overland & Bay of Bengal routes.',
        hi: 'प्राचीन श्रेणी (व्यापारी संघ): उत्तरापथ, दक्षिणापथ व बंगाल की खाड़ी मार्ग देखने हेतु पिन पर टैप करें।',
        spots: [
          { x: 26, y: 56, en: 'Uttarapatha Overland Guilds', hi: 'उत्तरापथ स्थल संघ', detail: b('Caravans linked Taxila, Mathura & Pataliputra down to Bengal ports.', 'तक्षशिला, मथुरा व पाटलिपुत्र से ताम्रलिप्ति बंदरगाह तक काफ़िले।'), set: { route: 'uttarapatha', shreniJoin: true } },
          { x: 54, y: 62, en: 'Dakshinapatha Coins & Spice Trade', hi: 'दक्षिणापथ व मुज़िरिस मसाले', detail: b('Ujjayini connected Ganga textiles to Barygaza & Kerala black pepper.', 'उज्जयिनी होते हुए भृगुकच्छ व मुज़िरिस मसाला बंदरगाहों तक व्यापार।'), set: { route: 'dakshinapatha', shreniJoin: true } },
          { x: 78, y: 48, en: 'Chola/Pala Sea Guilds + Risk Pool', hi: 'समुद्री संघ व जोखिम कोष', detail: b('The toy lowers its invented risk when a pool is selected; it is not a record of an ancient insurance fund.', 'मॉडल में कोष चुनने से बनाया हुआ जोखिम घटता है; यह प्राचीन बीमा कोष का प्रमाण नहीं है।'), set: { route: 'maritime', shreniJoin: true, monsoonInsurance: true, cargoValue: 200 } },
        ],
      },
      svg,
      aria: P(`Toy ${S.route} scenario; invented return ${sim.netReturn}, invented risk ${sim.riskPct}%`, `काल्पनिक व्यापार मॉडल; बनाई गई वापसी ${sim.netReturn}, बनाया गया जोखिम ${sim.riskPct}%`),
      lines: [
        ut ? b('Uttarapatha carried horses, lapis, wool, Ganga textiles & bowls to the Bay of Bengal port of Tamralipti.', 'उत्तरापथ से घोड़े, ऊन, रत्न व वस्त्र बंगाल की खाड़ी के ताम्रलिप्ति बंदरगाह तक जाते थे।')
          : sea
            ? b('Merchants and associations connected southern India and places around the Bay of Bengal in different centuries. The line is illustrative, not evidence for one specific voyage.', 'अलग शताब्दियों में व्यापारी और उनके संघ दक्षिण भारत और बंगाल की खाड़ी के क्षेत्रों से जुड़े थे। रेखा उदाहरण है, किसी एक यात्रा का प्रमाण नहीं।')
            : b('Dakshinapatha linked northern cities via Ujjayini to western ports (Barygaza) and Kerala spice harbours (Muziris).', 'दक्षिणापथ उज्जयिनी से होकर भृगुकच्छ और मुज़िरिस मसाला बंदरगाहों को जोड़ता था।'),
        { en: `Fictional model: return ${sim.netReturn} units · assumed loss risk ${sim.riskPct}% · fee ${sim.fee} units. These numbers are invented, not historical records.`, hi: `काल्पनिक मॉडल: वापसी ${sim.netReturn} इकाई · माना गया जोखिम ${sim.riskPct}% · शुल्क ${sim.fee} इकाई। ये संख्याएँ बनाई गई हैं, ऐतिहासिक आँकड़े नहीं।`, cls: sim.riskPct > 30 ? 'warn' : 'balanced' },
      ],
    };
  },
  discover: [b('Select Bay of Bengal Sea Guilds with high cargo capital (240). Toggle Shreni & Pooled Risk Fund ON vs OFF to see risk drop!', 'उच्च पूंजी (240) पर समुद्री व्यापार चुनकर श्रेणी और सुरक्षा कोष चालू-बंद करें। जोखिम घटते देखें!')],
  predictions: [
    {
      id: 'p1', revision: 't05-step5',
      stem: b('How could some merchant associations support trade? Practices varied by place and time.', 'कुछ व्यापारी संघ व्यापार में कैसे मदद कर सकते थे? काम स्थान और समय के अनुसार अलग थे।'),
      options: [opt('bank', 'Some pooled resources, extended credit or organised crafts and trade', 'कुछ संसाधन साझा करते, ऋण देते या शिल्प और व्यापार संगठित करते थे'), opt('forbid', 'They banned ships from using rivers', 'उन्होंने नदियों में नावें बंद कर दीं')],
      run: (S) => { S.shreniJoin = true; return 'bank'; },
      explain: () => b('Inscriptions provide evidence of varied associations and endowments; no single list of activities applies to every guild.', 'अभिलेख अलग-अलग संघों और दान निधियों के प्रमाण देते हैं; हर श्रेणी एक जैसे काम नहीं करती थी।'),
    },
  ],
  exit: [
    {
      id: 'e1',
      stem: b('Which city acted as a key junction connecting the northern plains to western sea ports along the Dakshinapatha?', 'दक्षिणापथ पर उत्तरी मैदानों को पश्चिमी समुद्री बंदरगाहों से जोड़ने वाला प्रमुख केंद्र कौन-सा था?'),
      correct: 'ujj',
      options: [
        { id: 'ujj', ...b('Ujjayini (Ujjain)', 'उज्जयिनी (उज्जैन)') },
        { id: 'leh', ...b('Leh glacier pass', 'लेह हिमनद दर्रा'), why: b('Leh sits in high Ladakh; Ujjayini linked the Narmada route to Barygaza.', 'उज्जयिनी ने गंगा मैदान को भृगुकच्छ बंदरगाह से जोड़ा।') },
      ],
      explain: b('Ujjayini was both a trade hub and astronomical centre linking north and west India.', 'उज्जयिनी उत्तर और पश्चिम भारत के व्यापार और खगोल अध्ययन का संगम था।'),
      hint: b('Select Dakshinapatha on the map.', 'मानचित्र पर दक्षिणापथ चुनें।'),
    },
  ],
  reflect: b('Why are shared institutional trust, quality standards and pooled insurance just as vital as physical highways and ports?', 'भौतिक सड़कों व बंदरगाहों जितना ही महत्त्वपूर्ण साझा संस्थागत विश्वास और गुणवत्ता मानक क्यों होते हैं?'),
};

// ================================================================ T05.L6 AI-Era Historian Audit Studio (Non-Rote Source Critique)
const AI_CLAIMS = {
  ashoka: {
    botTitle: b('AI Bot Output #1: “Ashoka’s 260 BCE Paper Flyers”', 'एआई बॉट दावा #1: “अशोक के 260 ई.पू. के कागज़ी पर्चे”'),
    claim: b('“In 260 BCE, Emperor Ashoka printed thousands of paper pamphlets in Sanskrit to force every citizen into one uniform religion.”', '“260 ई.पू. में सम्राट अशोक ने संस्कृत में हजारों कागज़ी पर्चे छपवाकर हर नागरिक पर एक धर्म थोप दिया।”'),
    fix: b('Clue: Ashoka’s surviving messages include inscriptions on rock and pillars, in languages including Prakrit, Greek and Aramaic. They do not support the paper-flyer claim.', 'संकेत: अशोक के बचे संदेश शिलाओं और स्तंभों पर हैं; भाषाओं में प्राकृत, यूनानी और अरामी शामिल हैं। वे कागज़ी पर्चों के दावे को सहारा नहीं देते।'),
  },
  samanta: {
    botTitle: b('AI Bot Output #2: “Zero Local Assemblies Before 1000 CE”', 'एआई बॉट दावा #2: “1000 ई. से पूर्व कोई स्थानीय सभा नहीं”'),
    claim: b('“Before modern elections, ordinary villagers in ancient India up to 1000 CE had zero organised rules, votes, or local committees.”', '“आधुनिक चुनावों से पहले 1000 ई. तक प्राचीन भारत के गाँवों में कोई नियम, मतदान या स्थानीय समिति नहीं थी।”'),
    fix: b('Clue: Uttaramerur inscriptions describe rules for selecting eligible committee members by lot. Eligibility was restricted; this does not establish universal voting.', 'संकेत: उत्तरमेरूर अभिलेख पात्र समिति सदस्यों के पर्ची से चयन के नियम बताते हैं। पात्रता सीमित थी; इससे सार्वभौमिक मतदान सिद्ध नहीं होता।'),
  },
  science: {
    botTitle: b('AI Bot Output #3: “Pure Poetry With No Method Before 1000 CE”', 'एआई बॉट दावा #3: “1000 ई. से पूर्व केवल काव्य, कोई विज्ञान नहीं”'),
    claim: b('“Indian writings before 1000 CE contained only mythological tales with no mathematical algorithms, grammar rules, or metallurgy.”', '“1000 ई. से पूर्व भारतीय लेखन में केवल पौराणिक कथाएँ थीं — कोई गणितीय सूत्र, व्याकरण नियम या धातुकर्म नहीं था।”'),
    fix: b('Clue: works associated with Panini, Aryabhata and Brahmagupta contain systematic rules; the Mehrauli iron pillar is notably corrosion-resistant, not rust-free.', 'संकेत: पाणिनि, आर्यभट और ब्रह्मगुप्त से जुड़े ग्रंथों में व्यवस्थित नियम हैं; महरौली लौह स्तंभ जंग-प्रतिरोधी है, जंग-रहित नहीं।'),
  },
};

export const aiAuditLab = {
  id: 'T05.L6',
  objective: b('Train AI-era historical discernment: audit plausible-sounding AI bot summaries using epigraphy, chronology and material remains instead of rote recall.', 'एआई युग का इतिहास-विवेक विकसित करें: रटने के बजाय अभिलेख, कालक्रम और पुरावशेषों से आकर्षक एआई दावों की तथ्य-जाँच करें।'),
  note: { kind: 'fictional', en: 'The three example claims and revealed clues are scripted for practice. Switches do not inspect real sources or calculate historical certainty.', hi: 'तीनों उदाहरण दावे और दिखाए संकेत अभ्यास के लिए लिखे गए हैं। स्विच वास्तविक स्रोत नहीं जाँचते और ऐतिहासिक निश्चितता नहीं मापते।' },
  init: () => ({ claimId: 'ashoka', checkEpigraphy: true, checkChronology: false, checkMaterial: false }),
  controls: [
    { id: 'claimId', type: 'chips', label: b('Choose AI bot claim to fact-check', 'जाँचने हेतु एआई दावा चुनें'), options: [opt('ashoka', 'Claim 1: Ashoka Pamphlets', 'दावा 1: अशोक पर्चे'), opt('samanta', 'Claim 2: No Village Rules', 'दावा 2: कोई ग्राम सभा नहीं'), opt('science', 'Claim 3: Zero Science', 'दावा 3: कोई विज्ञान नहीं')] },
    { id: 'checkEpigraphy', type: 'toggle', label: b('Show inscription clue', 'अभिलेख संकेत दिखाएँ') },
    { id: 'checkChronology', type: 'toggle', label: b('Show chronology clue', 'कालक्रम संकेत दिखाएँ') },
    { id: 'checkMaterial', type: 'toggle', label: b('Show material-evidence clue', 'भौतिक प्रमाण का संकेत दिखाएँ') },
  ],
  view(S) {
    const c = AI_CLAIMS[S.claimId] || AI_CLAIMS.ashoka;
    const sim = H.sourceAuditSim(S);
    const pill = (x, label, ok, key) => `<g data-set='${esc(JSON.stringify({ [key]: !S[key] }))}' ><rect x="${x}" y="86" width="184" height="44" rx="8" fill="${ok ? '#dcfce7' : '#f1f5f9'}" stroke="${ok ? '#16a34a' : '#94a3b8'}" stroke-width="2"/><text class="txt sm b" x="${x + 92}" y="112" text-anchor="middle" fill="${ok ? '#14532d' : '#475569'}">${esc(label)}</text></g>`;
    const svg = `<svg viewBox="0 0 640 206" class="chart" role="img" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="12" width="612" height="182" rx="12" fill="var(--card)" stroke="${sim.status === 'debunked' ? '#16a34a' : '#d97706'}" stroke-width="3"/><text class="txt b" x="32" y="42">${esc(P(c.botTitle.en, c.botTitle.hi))}</text><text class="txt sm mut" x="32" y="64">${esc(P(`Exercise clues shown: ${sim.checksDone}/3 · Relevant clues: ${sim.caught}/${sim.totalFlaws}`, `दिखाए संकेत: ${sim.checksDone}/3 · उपयोगी संकेत: ${sim.caught}/${sim.totalFlaws}`))}</text>${pill(28, P(S.checkEpigraphy ? 'Inscription clue on' : 'Inscription clue off', S.checkEpigraphy ? 'अभिलेख संकेत चालू' : 'अभिलेख संकेत बंद'), S.checkEpigraphy, 'checkEpigraphy')}${pill(228, P(S.checkChronology ? 'Chronology clue on' : 'Chronology clue off', S.checkChronology ? 'काल संकेत चालू' : 'काल संकेत बंद'), S.checkChronology, 'checkChronology')}${pill(428, P(S.checkMaterial ? 'Material clue on' : 'Material clue off', S.checkMaterial ? 'वस्तु संकेत चालू' : 'वस्तु संकेत बंद'), S.checkMaterial, 'checkMaterial')}<rect x="28" y="148" width="584" height="30" rx="8" fill="${sim.status === 'debunked' ? '#dcfce7' : sim.status === 'partial' ? '#fef3c7' : '#fee2e2'}"/><text class="txt sm b" x="320" y="168" text-anchor="middle" fill="#1e293b">${esc(P(sim.status === 'debunked' ? 'Exercise clues revealed; check actual sources' : sim.status === 'partial' ? `Partial clues (${sim.caught}/${sim.totalFlaws}) — reveal another`  : 'Unchecked Bot Claim — Do NOT copy blindly!', sim.status === 'debunked' ? 'अभ्यास संकेत दिखे; वास्तविक स्रोत जाँचें' : sim.status === 'partial' ? 'कुछ संकेत दिखे — एक और संकेत देखें' : 'अप्रमाणित एआई दावा — बिना जाँचे न मानें!'))}</text></svg>`;
    return {
      plate: {
        src: 'assets/images/plates/t05-chola-kudavolai.jpg',
        en: 'An illustration inspired by an inscription and a selection pot. Pins reveal preset practice clues; they do not inspect archives.',
        hi: 'अभिलेख और चयन घड़े से प्रेरित चित्र। पिन अभ्यास के संकेत दिखाते हैं; वे अभिलेखागार नहीं जाँचते।',
        spots: [
          { x: 24, y: 42, en: 'Show Ashokan inscription clue (claim 1)', hi: 'अशोक अभिलेख संकेत (दावा 1)', detail: b('Cross-check date & Prakrit rock pillars: exposes “printed paper flyers” anachronism!', 'प्रिंटिंग-प्रेस काल-दोष व प्राकृत शिलालेख से एआई भ्रम तुरंत पकड़ा जाता है!'), set: { claimId: 'ashoka', checkEpigraphy: true, checkChronology: true, checkMaterial: true } },
          { x: 52, y: 68, en: 'Show Uttaramerur clue (claim 2)', hi: 'उत्तरमेरूर संकेत (दावा 2)', detail: b('The inscription records rules for choosing eligible committee members; participation was restricted.', 'अभिलेख पात्र समिति सदस्यों के चयन के नियम दर्ज करता है; भागीदारी सीमित थी।'), set: { claimId: 'samanta', checkEpigraphy: true, checkChronology: true, checkMaterial: true } },
          { x: 80, y: 50, en: 'Show knowledge tradition clue (claim 3)', hi: 'ज्ञान परंपरा संकेत (दावा 3)', detail: b('Compare the corrosion-resistant iron pillar and works of Panini and Aryabhata with the claim.', 'जंग-प्रतिरोधी लौह स्तंभ और पाणिनि व आर्यभट की रचनाओं की दावे से तुलना करें।'), set: { claimId: 'science', checkEpigraphy: true, checkChronology: true, checkMaterial: true } },
        ],
      },
      svg,
      aria: P(`${c.botTitle.en}: ${sim.checksDone} exercise clues shown.`, `${c.botTitle.hi}: ${sim.checksDone} अभ्यास संकेत दिखाए गए।`),
      lines: [
        { en: c.claim.en, hi: c.claim.hi, cls: 'note' },
        sim.status === 'debunked'
          ? { en: c.fix.en, hi: c.fix.hi, cls: 'balanced' }
          : b('Reveal the preset clues, then investigate the claim using actual sources.', 'दिए गए अभ्यास संकेत देखें, फिर वास्तविक स्रोतों से दावे की जाँच करें।'),
        b('These are scripted practice clues, not automatic source checks or a historical certainty score.', 'ये अभ्यास के लिए लिखे संकेत हैं, स्वचालित स्रोत जाँच या ऐतिहासिक निश्चितता का अंक नहीं।'),
      ],
    };
  },
  discover: [b('Reveal the scripted clues for each example, then decide what original evidence you would seek. The switches do not perform research.', 'हर उदाहरण के अभ्यास संकेत देखें, फिर तय करें कि कौन-से मूल प्रमाण खोजेंगे। स्विच शोध नहीं करते।')],
  predictions: [
    {
      id: 'p1',
      stem: b('When an AI claims Ashoka distributed “printed Sanskrit paper pamphlets in 260 BCE”, which TWO checks immediately shatter that claim?', 'जब कोई एआई कहता है कि अशोक ने “260 ई.पू. में छपे कागज़ी संस्कृत पर्चे” बाँटे, तो कौन-सी दो जाँचें तुरंत इस दावे को तोड़ती हैं?'),
      options: [opt('epichron', 'Chronology check (no printing press in 260 BCE) + Epigraphy check (stone pillars in spoken Prakrit)', 'कालक्रम जाँच (260 ई.पू. में प्रिंटिंग प्रेस नहीं थी) + अभिलेख जाँच (प्राकृत शिलालेख)'), opt('font', 'Checking font colour on the screen', 'स्क्रीन के रंग बदलना')],
      run: (S) => { S.claimId = 'ashoka'; S.checkEpigraphy = true; S.checkChronology = true; return 'epichron'; },
      explain: () => b('Combining technology timelines (chronology) with real primary edicts (epigraphy) instantly exposes AI anachronisms and language errors.', 'तकनीकी कालक्रम और वास्तविक शिलालेखों का मिलान एआई की काल्पनिक गलतियाँ तुरंत पकड़ लेता है।'),
    },
  ],
  exit: [
    {
      id: 'e1',
      stem: b('In the AI era, why is learning how to verify inscriptions, material remains and dates MORE valuable than memorising textbook summaries?', 'एआई युग में पाठ्यपुस्तक रटने से अधिक उपयोगी अभिलेखों, पुरावशेषों और तिथियों से जाँच करना क्यों है?'),
      correct: 'verify',
      options: [
        { id: 'verify', ...b('Because AI generates fast summaries — including confident errors — so only citizens skilled in corroboration can separate fact from fiction.', 'क्योंकि एआई तेज़ सारांश तो बना देता है पर गलतियाँ भी गढ़ सकता है; केवल प्रमाण-मिलान जानने वाला विद्यार्थी ही सच-झूठ परख सकता है।') },
        { id: 'obsolete', ...b('Because primary inscriptions never existed.', 'क्योंकि प्राचीन अभिलेख कभी थे ही नहीं।'), why: b('Ashokan and Chola inscriptions remain physical stone evidence anyone can verify.', 'अशोक व चोल अभिलेख आज भी प्रत्यक्ष पत्थर प्रमाण हैं।') },
      ],
      explain: b('Historical thinking transforms you from a passive consumer of summaries into an active verifier of evidence.', 'ऐतिहासिक सोच आपको निष्क्रिय पाठक से सक्रिय प्रमाण-परीक्षक बनाती है।'),
      hint: b('Reveal the practice clues and consider which original sources you would check.', 'अभ्यास संकेत देखें और सोचें कि कौन-से मूल स्रोत जाँचेंगे।'),
    },
  ],
  reflect: b('Next time you use an AI assistant to study history, list the 3 verification questions you will ask before trusting its answer.', 'अगली बार इतिहास पढ़ने के लिए एआई का उपयोग करते समय आप उत्तर पर भरोसा करने से पहले कौन-से 3 जाँच-प्रश्न पूछेंगे?'),
};
