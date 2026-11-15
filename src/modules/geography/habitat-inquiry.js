// T11: sourced habitat comparisons and an entirely fictional tourism arithmetic activity.
// Hindi is draft pending subject-teacher review.
import { h } from '../../core/dom.js';
import * as store from '../../core/store.js';
import { pair as P } from '../../core/i18n.js';
import { bi, relabelBi } from '../../components/widgets.js';
import { createInquiryExplorer } from '../../components/inquiry-explorer.js';
import { indiaMapSvg, indiaProjection, GEO } from '../../engines/viz.js';
import { tourismComparison } from '../../engines/domain/ecosystem.js';

const b = (en, hi) => ({ en, hi });
const opt = (id, en, hi, correct = false) => ({ id, text: b(en, hi), correct });
export const HABITAT_CASES = [
  {
    id: 'thar', number: '1', point: [71.2, 26.8], label: b('1 · Thar', '1 · थार'),
    evidence: b('The Thar is not empty: open dry grassland, scrub and farms support people and wildlife. Wildlife Institute of India research describes Great Indian Bustard habitat alongside chinkara and foxes and agro-pastoral livelihoods.', 'थार खाली नहीं है: खुली शुष्क घासभूमि, झाड़ियाँ और खेत लोगों व वन्यजीवों को सहारा देते हैं। भारतीय वन्यजीव संस्थान का अध्ययन गोडावण के आवास के साथ चिंकारा, लोमड़ी और कृषि-पशुपालक आजीविका बताता है।'),
    question: b('Which proposal recognises this open habitat?', 'कौन-सा प्रस्ताव इस खुले आवास को पहचानता है?'),
    options: [opt('grass', 'Protect native grassland and consider local livelihoods.', 'स्थानीय घासभूमि की रक्षा करें और आजीविका का ध्यान रखें।', true), opt('empty', 'Call all grassland empty land that must become dense forest.', 'सारी घासभूमि को खाली भूमि कहकर घना जंगल बना दें।')],
    explain: b('Grasslands and scrub are ecosystems, not automatically degraded forests. Habitat protection and land-use decisions require local evidence and participation.', 'घासभूमि और झाड़ियाँ पारिस्थितिकी तंत्र हैं, अपने आप नष्ट वन नहीं। आवास और भूमि-उपयोग निर्णय के लिए स्थानीय साक्ष्य और सहभागिता चाहिए।'),
    source: 'https://wii.gov.in/uploads/media/pdf/rti/RTI_2018_19_Q2_035_Reply_Aman_Bansal_GIB_Thar_report_2015.pdf', sourceLabel: b('Wildlife Institute of India · Thar study', 'भारतीय वन्यजीव संस्थान · थार अध्ययन'),
  },
  {
    id: 'sundarbans', number: '2', point: [88.9, 21.9], label: b('2 · Sundarbans', '2 · सुंदरबन'),
    evidence: b('The Sundarbans span the India–Bangladesh delta. Tidal channels and salt-tolerant mangroves shelter many species, including tigers and aquatic life. Mangroves may reduce some wave impacts but do not make storms harmless.', 'सुंदरबन भारत–बांग्लादेश के डेल्टा में फैला है। ज्वारीय नालों और लवण-सहिष्णु मैंग्रोव में बाघ व जलीय जीव सहित अनेक प्रजातियाँ रहती हैं। मैंग्रोव कुछ लहर प्रभाव घटा सकते हैं, पर तूफ़ान को हानिरहित नहीं बनाते।'),
    question: b('Which conditions distinguish the mangrove habitat?', 'मैंग्रोव आवास की विशेष परिस्थितियाँ कौन-सी हैं?'),
    options: [opt('tidal', 'Tidal water, muddy shores and salt-tolerant plants.', 'ज्वारीय जल, कीचड़ भरे तट और लवण-सहिष्णु पौधे।', true), opt('dunes', 'Only dry inland dunes with no tidal water.', 'केवल ज्वारीय जल रहित सूखे भीतरी टिब्बे।')],
    explain: b('Mangroves, wetlands and dry grasslands provide different habitats. Protecting a coast also requires warnings and local safety plans.', 'मैंग्रोव, आर्द्रभूमि और शुष्क घासभूमि अलग आवास हैं। तटीय सुरक्षा के लिए चेतावनी और स्थानीय सुरक्षा योजना भी चाहिए।'),
    source: 'https://whc.unesco.org/en/list/452/', sourceLabel: b('UNESCO · Sundarbans National Park', 'यूनेस्को · सुंदरबन राष्ट्रीय उद्यान'),
  },
  {
    id: 'ghats', number: '3', point: [75.8, 11.4], label: b('3 · Western Ghats', '3 · पश्चिमी घाट'),
    evidence: b('The Western Ghats contain diverse habitats, including tropical evergreen forests, with many species found nowhere else. Not every part of the mountain chain has the same rainfall or vegetation.', 'पश्चिमी घाट में उष्णकटिबंधीय सदाबहार वन सहित अनेक आवास हैं और कई प्रजातियाँ अन्यत्र नहीं मिलतीं। पूरी पर्वत-शृंखला में समान वर्षा या वनस्पति नहीं है।'),
    question: b('What does an endemic species mean?', 'स्थानिक (एंडेमिक) प्रजाति का क्या अर्थ है?'),
    options: [opt('endemic', 'A species naturally restricted to a particular region.', 'प्राकृतिक रूप से किसी विशेष क्षेत्र तक सीमित प्रजाति।', true), opt('everywhere', 'A species found naturally everywhere on Earth.', 'पृथ्वी पर हर जगह प्राकृतिक रूप से मिलने वाली प्रजाति।')],
    explain: b('Habitat loss in a limited range can put endemic species at risk. The Ghats contain a mosaic of different ecosystems.', 'सीमित क्षेत्र में आवास नष्ट होने से स्थानिक प्रजातियाँ खतरे में पड़ सकती हैं। घाट अलग-अलग पारिस्थितिकी तंत्रों का समूह हैं।'),
    source: 'https://whc.unesco.org/en/list/1342/', sourceLabel: b('UNESCO · Western Ghats', 'यूनेस्को · पश्चिमी घाट'),
  },
  {
    id: 'kabartal', number: '4', point: [86.14, 25.62], label: b('4 · Bihar wetland', '4 · बिहार आर्द्रभूमि'),
    evidence: b('Kabartal (Kanwar Jheel) in Begusarai, Bihar, was designated a Ramsar wetland in 2020. The Ramsar record describes seasonal flooding, migratory waterbirds and fish; some marsh dries and is farmed. Drainage and water diversion are listed threats.', 'बिहार के बेगूसराय का काबरताल (काँवर झील) 2020 में रामसर आर्द्रभूमि घोषित हुआ। रामसर विवरण मौसमी बाढ़, प्रवासी जलपक्षियों और मछलियों का उल्लेख करता है; कुछ दलदल सूखकर खेती में काम आते हैं। जल निकासी व मोड़ना बताए गए खतरे हैं।'),
    question: b('What should a wetland decision consider?', 'आर्द्रभूमि का निर्णय लेते समय क्या ध्यान दें?'),
    options: [opt('balance', 'Seasonal water, birds, fishers and farmers together.', 'मौसमी जल, पक्षियों, मछुआरों और किसानों को साथ देखें।', true), opt('drain', 'Drain all water; no habitat or livelihood can be affected.', 'सारा जल निकाल दें; किसी आवास या आजीविका पर असर नहीं होगा।')],
    explain: b('Seasonal water connects habitat and livelihoods. A Ramsar designation is not the same as a biosphere reserve, and it does not settle every local trade-off.', 'मौसमी जल आवास और आजीविका को जोड़ता है। रामसर दर्जा जैवमंडल आरक्षित क्षेत्र के समान नहीं है और इससे हर स्थानीय विवाद हल नहीं होता।'),
    source: 'https://rsis.ramsar.org/ris/2436', sourceLabel: b('Ramsar Sites Information Service · Kabartal, 2020', 'रामसर स्थल सूचना सेवा · काबरताल, 2020'),
  },
];

function habitatMap(item) {
  const projection = indiaProjection(640, 420, 20);
  const markers = HABITAT_CASES.map((entry) => {
    const [x, y] = projection(entry.point), selected = entry.id === item.id;
    return `<g data-habitat-marker="${entry.id}"${selected ? ' data-habitat-selected="true"' : ''} aria-hidden="true"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${selected ? 15 : 12}" fill="${selected ? '#8b1e34' : '#174760'}" stroke="#fff" stroke-width="2"/><text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" fill="#fff" font-size="12" font-weight="700" text-anchor="middle">${entry.number}</text></g>`;
  }).join('');
  const aria = P(`Map of four approximate example locations. Selected: ${item.label.en}. Use the numbered case buttons.`, `चार अनुमानित उदाहरण स्थलों का मानचित्र। चयन: ${item.label.hi}। अंकित उदाहरण बटन उपयोग करें।`);
  const figure = h('figure', { class: 'habitat-map' }, h('div', { 'data-habitat-map': '', html: indiaMapSvg({ w: 640, h: 420, aria, extraSvg: markers }) }),
    bi(b('Points show approximate examples, not habitat, state or reserve boundaries. Each region contains more than one ecosystem.', 'बिंदु अनुमानित उदाहरण हैं, आवास, राज्य या आरक्षित क्षेत्र की सीमाएँ नहीं। हर क्षेत्र में एक से अधिक पारिस्थितिकी तंत्र हैं।'), { tag: 'figcaption', cls: 'note' }));
  if (!GEO.india?.features) figure.append(bi(b('Detailed state outlines are unavailable; the numbered buttons and descriptions still work.', 'विस्तृत राज्य रूपरेखा उपलब्ध नहीं है; अंकित बटन और विवरण फिर भी काम करते हैं।'), { tag: 'p', cls: 'note' }));
  return figure;
}

export function createHabitatInquiry(lab) {
  return createInquiryExplorer({ id: 't11-habitat', storageKey: 'T11.habitats', className: 'habitat-inquiry',
    kicker: b('INDIA AND BIHAR', 'भारत और बिहार'), title: b('Four habitats, four stories', 'चार आवास, चार कहानियाँ'),
    intro: b('Select a location to compare biodiversity and people’s connections with the land and water.', 'जैव-विविधता और लोगों के भूमि व जल से संबंध की तुलना के लिए स्थान चुनें।'),
    limit: b('The two presets below are invented warm/dry and warm/wet examples for the simplified climate model. They are not measured climate normals for these places; rainfall and temperature alone cannot identify a tidal mangrove or a seasonal wetland.', 'नीचे के दोनों विकल्प सरल जलवायु मॉडल के काल्पनिक गर्म/शुष्क व गर्म/नम उदाहरण हैं। ये इन स्थानों के मापे गए जलवायु औसत नहीं हैं; केवल वर्षा व ताप से ज्वारीय मैंग्रोव या मौसमी आर्द्रभूमि नहीं पहचानी जा सकती।'),
    items: HABITAT_CASES, visual: habitatMap,
    actions: [
      { id: 'dry', label: b('Try a warm, dry model example', 'गर्म, शुष्क मॉडल उदाहरण आज़माएँ'), run: () => lab.setState({ temp: 28, rain: 160 }) },
      { id: 'wet', label: b('Try a warm, wet model example', 'गर्म, नम मॉडल उदाहरण आज़माएँ'), run: () => lab.setState({ temp: 26, rain: 2400 }) },
    ],
  });
}

export const FIRE_INQUIRY_CASES = [
  {
    id: 'prepare', label: b('Prepare locally', 'स्थानीय तैयारी'),
    evidence: b('Imagine a school near forest. Before the dry season, students discuss prevention with residents and the local forest office. Forest-fire conditions and official plans differ by place and year.', 'वन के पास एक काल्पनिक विद्यालय है। शुष्क मौसम से पहले विद्यार्थी निवासियों व स्थानीय वन कार्यालय के साथ रोकथाम पर चर्चा करते हैं। वनाग्नि की परिस्थितियाँ व सरकारी योजनाएँ स्थान और वर्ष के अनुसार अलग होती हैं।'),
    question: b('Which inquiry is safer and more useful?', 'कौन-सी पड़ताल अधिक सुरक्षित और उपयोगी है?'),
    options: [opt('ask', 'Ask about local warnings, reporting contacts and the school safety plan from a safe place.', 'सुरक्षित स्थान से स्थानीय चेतावनी, सूचना देने के संपर्क व विद्यालय सुरक्षा योजना पूछें।', true), opt('burn', 'Start a test fire in dry leaves to see how fast it spreads.', 'सूखी पत्तियों में आग लगाकर उसके फैलने की परीक्षा करें।')],
    explain: b('Never start a test fire. Discuss local prevention and emergency arrangements with adults and authorities; follow current instructions.', 'परीक्षण के लिए कभी आग न लगाएँ। बड़ों और प्रशासन से स्थानीय रोकथाम व आपात तैयारी पर चर्चा करें; वर्तमान निर्देश मानें।'),
    source: 'https://forest.uk.gov.in/forest-fire-info', sourceLabel: b('Uttarakhand Forest Department · forest fire information', 'उत्तराखंड वन विभाग · वनाग्नि जानकारी'),
  },
  {
    id: 'smoke', label: b('Smoke nearby', 'पास में धुआँ'),
    evidence: b('In an invented example, someone notices smoke near a forest edge. The model below is not an alert and cannot tell whether a route or place is safe.', 'काल्पनिक उदाहरण में वन के किनारे किसी को धुआँ दिखता है। नीचे का मॉडल चेतावनी नहीं है और नहीं बता सकता कि रास्ता या स्थान सुरक्षित है।'),
    question: b('What should the learner do?', 'विद्यार्थी को क्या करना चाहिए?'),
    options: [opt('report', 'Stay away, alert an adult and local forest or emergency services, and follow their instructions.', 'दूर रहें, किसी बड़े व स्थानीय वन या आपात सेवा को सूचित करें और उनके निर्देश मानें।', true), opt('approach', 'Go closer alone and try to put it out.', 'अकेले पास जाकर आग बुझाने का प्रयास करें।')],
    explain: b('Do not approach or fight a fire. Alert adults and local services from a safe place and follow current local directions. A model is never a substitute for an official warning.', 'आग के पास न जाएँ और उसे बुझाने का प्रयास न करें। सुरक्षित जगह से बड़ों व स्थानीय सेवाओं को सूचित करें और वर्तमान स्थानीय निर्देश मानें। मॉडल सरकारी चेतावनी का विकल्प नहीं है।'),
    source: 'https://sachet.ndma.gov.in/cap_public_website/FetchXMLFile?identifier=1743501749456010', sourceLabel: b('FSI / NDMA · example dated forest fire alert (2025)', 'FSI / NDMA · वनाग्नि चेतावनी का दिनांकित उदाहरण (2025)'),
  },
];
export function createFireInquiry() {
  return createInquiryExplorer({ id: 't11-fire', storageKey: 'T11.fireInquiry', className: 'fire-inquiry',
    kicker: b('SAFETY AND COMMUNITY', 'सुरक्षा और समुदाय'), title: b('A local fire-prevention inquiry', 'स्थानीय वनाग्नि रोकथाम पड़ताल'),
    intro: b('Use these fictional situations to discuss preparation and reporting. Do not investigate a real fire yourself.', 'तैयारी और सूचना देने की चर्चा के लिए ये काल्पनिक स्थितियाँ लें। वास्तविक आग की खुद पड़ताल न करें।'),
    limit: b('These are classroom examples, not live alerts or operational advice. Use current local forest and emergency guidance in a real situation.', 'ये कक्षा उदाहरण हैं, वर्तमान चेतावनी या कार्य-सलाह नहीं। वास्तविक स्थिति में वर्तमान स्थानीय वन और आपात निर्देश मानें।'), items: FIRE_INQUIRY_CASES,
  });
}

export const FOREST_KNOWLEDGE_CASES = [
  {
    id: 'rights', label: b('Forest rights', 'वन अधिकार'),
    evidence: b('The Forest Rights Act, 2006 provides for recognition of certain individual and community rights of eligible forest-dwelling Scheduled Tribes and other traditional forest dwellers. Community forest-resource rights can include protection and management. Recognition follows a legal process.', 'वन अधिकार अधिनियम, 2006 पात्र वनवासी अनुसूचित जनजातियों और अन्य परंपरागत वनवासियों के कुछ व्यक्तिगत व सामुदायिक अधिकारों की मान्यता का प्रावधान करता है। सामुदायिक वन संसाधन अधिकारों में संरक्षण व प्रबंधन शामिल हो सकते हैं। मान्यता की कानूनी प्रक्रिया है।'),
    question: b('What is a careful interpretation of this law?', 'इस कानून की सावधान व्याख्या क्या है?'),
    options: [opt('process', 'Rights and procedures depend on the applicable law and recognition process.', 'अधिकार व प्रक्रिया लागू कानून और मान्यता प्रक्रिया पर निर्भर हैं।', true), opt('automatic', 'Every claim is automatically approved by this app.', 'हर दावा इस ऐप से स्वतः स्वीकृत है।')],
    explain: b('The Act, rules and local implementation matter. This summary is not legal advice, an eligibility check or a decision about a claim.', 'अधिनियम, नियम और स्थानीय कार्यान्वयन महत्त्वपूर्ण हैं। यह सार कानूनी सलाह, पात्रता जाँच या दावे का निर्णय नहीं है।'),
    source: 'https://tribal.nic.in/FRA/data/FRATrainingManual.pdf', sourceLabel: b('Ministry of Tribal Affairs · Forest Rights Act training manual', 'जनजातीय कार्य मंत्रालय · वन अधिकार अधिनियम प्रशिक्षण पुस्तिका'),
  },
  {
    id: 'apatani', label: b('Apatani knowledge', 'अपातानी ज्ञान'),
    evidence: b('UNESCO’s 2014 tentative-list description of the Apatani cultural landscape describes rice–fish cultivation in Ziro Valley, water channels and the management of surrounding forests. A tentative-list entry is not a World Heritage inscription.', 'यूनेस्को की 2014 की संभावित सूची में अपातानी सांस्कृतिक भू-दृश्य का विवरण ज़ीरो घाटी की धान–मछली खेती, जल नहरों और आसपास के वन प्रबंधन को बताता है। संभावित सूची प्रविष्टि विश्व धरोहर सूची में अंकन नहीं है।'),
    question: b('What connection does this example illustrate?', 'यह उदाहरण कौन-सा संबंध दिखाता है?'),
    options: [opt('water', 'Water, food production, forests and local knowledge can be linked.', 'जल, खाद्य उत्पादन, वन और स्थानीय ज्ञान जुड़ सकते हैं।', true), opt('same', 'All communities use the same practices everywhere.', 'हर जगह सभी समुदाय समान प्रथाएँ अपनाते हैं।')],
    explain: b('Practices and conditions differ across communities and change over time. Learn from residents rather than assuming a single traditional solution fits every place.', 'समुदायों में प्रथाएँ व परिस्थितियाँ अलग हैं और समय के साथ बदलती हैं। हर जगह एक ही पारंपरिक समाधान मानने के बजाय निवासियों से सीखें।'),
    source: 'https://whc.unesco.org/en/tentativelists/5893/', sourceLabel: b('UNESCO · Apatani cultural landscape, tentative list', 'यूनेस्को · अपातानी सांस्कृतिक भू-दृश्य, संभावित सूची'),
  },
];
export function createForestKnowledge() {
  return createInquiryExplorer({ id: 't11-knowledge', storageKey: 'T11.forestKnowledge', className: 'forest-knowledge',
    kicker: b('PEOPLE AND FORESTS', 'लोग और वन'), title: b('Knowledge, livelihoods and rights', 'ज्ञान, आजीविका और अधिकार'),
    intro: b('Compare a legal framework with a documented local practice. Neither is a one-size-fits-all solution.', 'कानूनी ढाँचे की प्रलेखित स्थानीय प्रथा से तुलना करें। कोई भी हर जगह के लिए एक जैसा समाधान नहीं है।'),
    limit: b('These summaries are for learning; consult current law and local authorities for real claims. Practices and benefits vary.', 'ये सार सीखने के लिए हैं; वास्तविक दावों हेतु वर्तमान कानून और स्थानीय अधिकारियों से जानकारी लें। प्रथाएँ व लाभ अलग होते हैं।'), items: FOREST_KNOWLEDGE_CASES,
  });
}

const T = {
  title: b('A fictional forest visit plan', 'काल्पनिक वन-भ्रमण योजना'),
  intro: b('Imagine a forest trail and an invented planning reference of 80 visits per day. Change the planned visits and compare the numbers; then discuss who decides and who benefits.', 'एक काल्पनिक वन-पथ और प्रतिदिन 80 यात्राओं का काल्पनिक योजना संदर्भ मानें। यात्राओं की संख्या बदलकर तुलना करें; फिर चर्चा करें कि निर्णय कौन लेता है और लाभ किसे मिलता है।'),
  label: b('Planned visits per day', 'प्रतिदिन नियोजित यात्राएँ'),
  limit: b('80 is invented for arithmetic, not a measured carrying capacity, legal limit, safe level or recommendation. Noise, seasons, habitat, access, costs and rights matter; a visitor count alone cannot certify sustainability.', '80 केवल गणना के लिए काल्पनिक है, मापी वहन-क्षमता, कानूनी सीमा, सुरक्षित स्तर या सलाह नहीं। शोर, मौसम, आवास, पहुँच, लागत और अधिकार महत्त्वपूर्ण हैं; केवल आगंतुक संख्या से टिकाऊपन सिद्ध नहीं होता।'),
  discussion: b('Ask: which residents, including forest dwellers, share decisions and income? What habitat monitoring and safeguards are needed? Tourism may offer income but also disturb wildlife or restrict access; benefits are not automatic.', 'पूछें: वनवासियों सहित कौन से निवासी निर्णय और आय में भागीदार हैं? आवास की किस निगरानी और सुरक्षा की ज़रूरत है? पर्यटन आय दे सकता है पर वन्यजीवों को परेशान या पहुँच सीमित भी कर सकता है; लाभ अपने आप नहीं मिलते।'),
  reset: b('Reset the visit example', 'भ्रमण उदाहरण रीसेट करें'),
  saved: b('Only this fictional count is kept in this browser until its data is cleared.', 'केवल यह काल्पनिक संख्या डेटा मिटने तक इसी ब्राउज़र में रहती है।'),
  blocked: b('Browser storage is blocked; this example will be lost on reload.', 'ब्राउज़र संग्रह बंद है; फिर लोड करने पर उदाहरण मिट जाएगा।'),
};
export function createTourismPlanner() {
  const initial = () => ({ visitors: 120 });
  let S = store.simState('T11.tourism', initial());
  if (!S || typeof S !== 'object' || Array.isArray(S)) { store.resetSim('T11.tourism'); S = store.simState('T11.tourism', initial()); }
  if (!Number.isInteger(S.visitors) || S.visitors < 0 || S.visitors > 200 || S.visitors % 10 !== 0) S.visitors = 120;
  const id = 't11-tourism-visitors';
  const input = h('input', { type: 'range', id, class: 'range', min: 0, max: 200, step: 10, value: S.visitors, 'aria-labelledby': `${id}-label`, 'data-tourism-visitors': '' });
  const out = h('output', { for: id, class: 'range-val' });
  const result = h('div', { class: 'civic-vote-result', role: 'status', 'aria-live': 'polite', 'data-tourism-result': '' });
  const storage = h('p', { class: 'civic-storage note', 'data-tourism-storage': '' });
  const el = h('section', { class: 'civic-card tourism-planner', 'aria-labelledby': 't11-tourism-title' },
    bi(b('FOREST AND LIVELIHOODS', 'वन और आजीविका'), { tag: 'p', cls: 'civic-kicker' }), bi(T.title, { tag: 'h3', cls: 'civic-title' }), bi(T.intro, { tag: 'p' }), bi(T.limit, { tag: 'p', cls: 'civic-limit' }),
    h('div', { class: 'budget-row' }, h('div', { class: 'budget-row-heading' }, h('label', { id: `${id}-label`, for: id }, bi(T.label, { tag: 'span' })), out), input), result,
    bi(T.discussion, { tag: 'p', cls: 'civic-discussion' }),
    h('p', {}, h('a', { href: 'https://moef.gov.in/uploads/pdf/framework_preparation_elephant_conservation_plan.pdf', target: '_blank', rel: 'noopener noreferrer' }, bi(b('Source: MoEFCC planning framework (internet required)', 'स्रोत: MoEFCC योजना रूपरेखा (इंटरनेट आवश्यक)'), { tag: 'span' }))),
    h('button', { type: 'button', class: 'btn', 'data-tourism-reset': '', onclick: () => { Object.assign(S, initial()); input.value = S.visitors; save(); render(); } }, bi(T.reset, { tag: 'span' })), storage);
  el.querySelector('.civic-title').id = 't11-tourism-title';
  function save() { store.saveSim(); renderStorage(); }
  function renderStorage() { const blocked = store.storageBlocked(); storage.classList.toggle('civic-warning', blocked); storage.replaceChildren(bi(blocked ? T.blocked : T.saved, { tag: 'span' })); }
  function render() {
    const r = tourismComparison(S.visitors, 80); out.textContent = String(S.visitors);
    const text = r.over > 0 ? b(`${S.visitors} visits: ${r.over} above the invented 80-visit reference.`, `${S.visitors} यात्राएँ: काल्पनिक 80 के संदर्भ से ${r.over} अधिक।`)
      : r.under > 0 ? b(`${S.visitors} visits: ${r.under} below the invented 80-visit reference.`, `${S.visitors} यात्राएँ: काल्पनिक 80 के संदर्भ से ${r.under} कम।`)
        : b('80 visits: exactly the invented reference.', '80 यात्राएँ: काल्पनिक संदर्भ के बराबर।');
    result.replaceChildren(bi(text, { tag: 'p', cls: 'civic-outcome' }), bi(b('This comparison alone does not establish safety or sustainability.', 'यह तुलना अकेले सुरक्षा या टिकाऊपन सिद्ध नहीं करती।'), { tag: 'p' }));
  }
  input.addEventListener('input', () => { S.visitors = Number(input.value); save(); render(); });
  render(); renderStorage();
  return { el, relabel() { relabelBi(el); render(); renderStorage(); }, destroy() {} };
}
