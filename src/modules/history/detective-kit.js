// T04.L2: fictional field records for practising archaeological reasoning, not real excavations.
import { h } from '../../core/dom.js';
import * as i18n from '../../core/i18n.js';
import * as store from '../../core/store.js';
import { bi, relabelBi } from '../../components/widgets.js';

const b = (en, hi) => ({ en, hi });
const choice = (id, label, feedback, useful = false) => ({ id, label, feedback, useful });

export const CASE_FILES = [
  {
    id: 'bone',
    title: b('The marked bone', 'निशान वाली हड्डी'),
    setting: b('Imagined cave floor · one recorded layer', 'काल्पनिक गुफ़ा का फ़र्श · एक दर्ज परत'),
    observations: [
      b('A flaked stone and an animal bone were recorded in the same layer.', 'एक ही परत में तराशा हुआ पत्थर और जानवर की हड्डी दर्ज की गई।'),
      b('There are narrow grooves on the bone. Their cause has not been tested.', 'हड्डी पर पतली खरोंचें हैं। उनका कारण अभी जाँचा नहीं गया है।'),
    ],
    claims: [
      choice('certain', b('People definitely hunted together and cut this bone with this stone.', 'लोगों ने निश्चित रूप से मिलकर शिकार किया और इसी पत्थर से यह हड्डी काटी।'), b('The finds do not identify the maker of the marks, this particular stone, hunting rather than scavenging, or whether people worked together.', 'इन वस्तुओं से निशानों का कारण, यही पत्थर, शिकार बनाम मृत जानवर का उपयोग, या लोगों का साथ काम करना निश्चित नहीं होता।')),
      choice('careful', b('People might have processed an animal; trampling could also have made the grooves.', 'लोगों ने शायद जानवर का मांस निकाला हो; खरोंचें पैरों से दबने पर भी बन सकती हैं।'), b('This is cautious: objects in one layer may be related, but mark shape and context need investigation. Even tool marks alone do not prove a hunt.', 'यह सावधानी भरा निष्कर्ष है: एक परत की वस्तुएँ जुड़ी हो सकती हैं, पर निशानों के आकार और संदर्भ की जाँच चाहिए। औज़ार के निशान भी अपने आप शिकार सिद्ध नहीं करते।'), true),
      choice('impossible', b('The bone proves that no people ever used the cave.', 'यह हड्डी सिद्ध करती है कि गुफ़ा में कभी कोई मनुष्य नहीं आया।'), b('A bone cannot rule out human activity. Look at all the finds and their context before deciding.', 'एक हड्डी से मानव गतिविधि को नकारा नहीं जा सकता। निर्णय से पहले सभी वस्तुओं और उनके संदर्भ को देखें।')),
    ],
    tests: [
      choice('marks', b('Compare magnified marks with experimental tool and trampling marks; check the layer and dating.', 'बढ़ाकर देखे निशानों की औज़ार और दबाव से बने प्रायोगिक निशानों से तुलना करें; परत और तिथि जाँचें।'), b('Mark profiles and the layer’s history can help distinguish explanations, although the result may still be uncertain.', 'निशानों का आकार और परत का इतिहास व्याख्याएँ अलग करने में मदद कर सकते हैं, हालाँकि परिणाम फिर भी अनिश्चित हो सकता है।'), true),
      choice('colour', b('Guess who made the marks from the stone’s colour alone.', 'केवल पत्थर के रंग से अनुमान लगाएँ कि निशान किसने बनाए।'), b('Colour alone does not establish how the grooves formed. A comparison of marks and their context is more informative here.', 'केवल रंग से खरोंचों का कारण नहीं पता चलता। यहाँ निशानों और उनके संदर्भ की तुलना अधिक उपयोगी है।')),
    ],
  },
  {
    id: 'grain',
    title: b('Grain near a hearth', 'चूल्हे के पास दाने'),
    setting: b('Imagined settlement · one recorded layer', 'काल्पनिक बस्ती · एक दर्ज परत'),
    observations: [
      b('Charred cereal grains and a grinding stone were recorded near a hearth.', 'चूल्हे के पास जले अनाज के दाने और पीसने का पत्थर दर्ज किए गए।'),
      b('The record does not say whether the grain was wild, cultivated nearby, or brought from elsewhere.', 'दर्ज विवरण से पता नहीं चलता कि अनाज जंगली था, पास उगाया गया था या कहीं और से लाया गया था।'),
    ],
    claims: [
      choice('certain', b('Everyone in this settlement definitely grew these crops in local fields.', 'इस बस्ती के सभी लोग निश्चित रूप से स्थानीय खेतों में यही फ़सल उगाते थे।'), b('Grain and a stone suggest possible processing, but do not establish who grew it or where. Food can be gathered or exchanged too.', 'अनाज और पत्थर से प्रसंस्करण की संभावना दिखती है, लेकिन किसने और कहाँ उगाया यह तय नहीं होता। भोजन इकट्ठा या विनिमय भी हो सकता है।')),
      choice('careful', b('Cereal may have been processed here; its source is still uncertain.', 'यहाँ अनाज का प्रसंस्करण हुआ हो सकता है; उसका स्रोत अभी अनिश्चित है।'), b('A possible interpretation fits the finds without claiming that farming, local fields or a permanent village have been proved.', 'यह संभावित व्याख्या वस्तुओं से मेल खाती है, पर खेती, स्थानीय खेत या स्थायी गाँव को सिद्ध नहीं मानती।'), true),
      choice('impossible', b('No one could have eaten cereal here.', 'यहाँ कोई अनाज खा ही नहीं सकता था।'), b('Charred cereal is compatible with food use, although it does not establish exactly how it was used.', 'जला अनाज भोजन के उपयोग से मेल खाता है, हालाँकि उसका सही उपयोग तय नहीं करता।')),
    ],
    tests: [
      choice('seeds', b('Identify the grains and compare wild and domesticated forms; look for dated field evidence nearby.', 'दानों की पहचान कर जंगली और पालतू रूपों से तुलना करें; पास में दिनांकित खेत के प्रमाण खोजें।'), b('Seed identification and field context can strengthen a farming interpretation. Domesticated grain alone would not prove it was grown at this site.', 'बीज की पहचान और खेत का संदर्भ खेती की व्याख्या मज़बूत कर सकते हैं। अकेले पालतू अनाज से यह सिद्ध नहीं होता कि वह यहीं उगा था।'), true),
      choice('colour', b('Decide from the colour of a modern cooking pot.', 'आज के एक बर्तन के रंग से निर्णय लें।'), b('A modern pot’s colour does not establish the ancient grains’ origin or their archaeological context.', 'आज के बर्तन का रंग प्राचीन अनाज का स्रोत या उसका पुरातात्त्विक संदर्भ नहीं बताता।')),
    ],
  },
  {
    id: 'platform',
    title: b('The brick platform', 'ईंटों का चबूतरा'),
    setting: b('Imagined town · a large raised foundation', 'काल्पनिक नगर · एक बड़ा ऊँचा आधार'),
    observations: [
      b('Excavators recorded a large brick foundation with passages between walls.', 'उत्खननकर्ताओं ने दीवारों के बीच रास्तों वाला एक बड़ा ईंट-आधार दर्ज किया।'),
      b('No grain or container contents were recorded in this practice case.', 'इस अभ्यास में कोई अनाज या पात्र की सामग्री दर्ज नहीं की गई।'),
    ],
    claims: [
      choice('certain', b('It was definitely a state granary controlled by a king.', 'यह निश्चित रूप से किसी राजा के नियंत्रण वाला राजकीय अन्नागार था।'), b('The foundation alone establishes neither grain storage nor a king. Storage is a hypothesis, not an observed fact.', 'केवल आधार से न अन्न भंडारण सिद्ध होता है, न राजा का नियंत्रण। भंडारण एक परिकल्पना है, देखा हुआ तथ्य नहीं।')),
      choice('careful', b('Storage is one possibility; the building’s use is not yet known.', 'भंडारण एक संभावना है; भवन का उपयोग अभी ज्ञात नहीं है।'), b('Other uses are possible too. No recorded grain is a limit on this case, not proof that the building could never have stored it.', 'अन्य उपयोग भी संभव हैं। दर्ज अनाज का न मिलना इस केस की सीमा है, यह प्रमाण नहीं कि उसमें कभी अनाज नहीं रखा गया।'), true),
      choice('impossible', b('An empty foundation proves no one ever stored anything there.', 'खाली आधार सिद्ध करता है कि वहाँ कभी कुछ भी नहीं रखा गया।'), b('Materials can decay or be removed. Absence in this record does not prove an object was never there.', 'सामग्री नष्ट या हटाई जा सकती है। इस विवरण में उसका अभाव यह सिद्ध नहीं करता कि वह कभी वहाँ थी ही नहीं।')),
    ],
    tests: [
      choice('context', b('Study sealed deposits, residues and objects from the same phase; compare similar structures.', 'उसी काल की बंद परतों, अवशेषों और वस्तुओं को जाँचें; समान संरचनाओं से तुलना करें।'), b('Context and residues may help test a use, but preservation is incomplete and an answer may remain open.', 'संदर्भ और अवशेष उपयोग की जाँच में सहायक हो सकते हैं, पर सब कुछ सुरक्षित नहीं रहता और उत्तर अनिश्चित रह सकता है।'), true),
      choice('colour', b('Name its use from the colour of the bricks.', 'ईंटों के रंग से इसका उपयोग तय कर दें।'), b('Brick colour alone does not reveal the building’s function or its users.', 'ईंटों का रंग अकेले भवन का उपयोग या उपयोगकर्ता नहीं बताता।')),
    ],
  },
];

const C = {
  kicker: b('FIELDWORK · THINK LIKE AN ARCHAEOLOGIST', 'मैदानी जाँच · पुरातत्वविद् की तरह सोचें'),
  title: b('Evidence detective kit', 'प्रमाण जासूस किट'),
  intro: b('Open a case file. Separate what was recorded from what people might infer, then choose the most useful next check. You can revise every answer.', 'एक केस फ़ाइल खोलें। जो दर्ज हुआ उसे संभावित निष्कर्ष से अलग करें, फिर अगली सबसे उपयोगी जाँच चुनें। आप हर उत्तर बदल सकते हैं।'),
  fictional: b('All three field records are imagined for practice, not reports of actual excavations. The sources below explain real archaeological methods.', 'ये तीनों मैदानी विवरण अभ्यास के लिए काल्पनिक हैं, वास्तविक उत्खनन रिपोर्ट नहीं। नीचे के स्रोत वास्तविक पुरातात्त्विक विधियाँ समझाते हैं।'),
  cases: b('Choose a case file', 'केस फ़ाइल चुनें'),
  observations: b('1 · What was recorded? Evidence', '1 · क्या दर्ज हुआ? प्रमाण'),
  claim: b('2 · Which claim is best supported by these observations?', '2 · इन प्रेक्षणों से किस दावे को सबसे अधिक सहारा मिलता है?'),
  next: b('3 · Which next check is most useful among these?', '3 · इनमें अगली सबसे उपयोगी जाँच कौन-सी है?'),
  goodClaim: b('Careful inference', 'सावधानी भरा निष्कर्ष'),
  tryClaim: b('Look again', 'फिर सोचें'),
  goodTest: b('Useful next check', 'उपयोगी अगली जाँच'),
  tryTest: b('Compare another check', 'दूसरी जाँच से तुलना करें'),
  noteLabel: b('Your field note (optional)', 'आपका मैदानी नोट (वैकल्पिक)'),
  noteHelp: b('Write one observation, one possible inference and what you would look for next. Do not include personal details.', 'एक प्रेक्षण, एक संभावित निष्कर्ष और अगली जाँच लिखें। निजी जानकारी न लिखें।'),
  storage: b('Answers and notes stay in this browser; clearing browser data removes them.', 'उत्तर और नोट इसी ब्राउज़र में रहते हैं; ब्राउज़र डेटा मिटाने पर हट जाएँगे।'),
  temporary: b('Browser storage is blocked. Answers and notes are temporary and will be lost on reload.', 'ब्राउज़र स्टोरेज बंद है। उत्तर और नोट अस्थायी हैं और पेज फिर खोलने पर मिट जाएँगे।'),
  sources: b('Read the real sources (internet needed)', 'वास्तविक स्रोत पढ़ें (इंटरनेट आवश्यक)'),
  ncert: b('NCERT: context, layers and interpreting finds', 'NCERT: संदर्भ, परतें और वस्तुओं की व्याख्या'),
  smithsonian: b('Smithsonian: possible marks and alternative explanations', 'स्मिथसोनियन: संभावित निशान और वैकल्पिक व्याख्याएँ'),
};
const label = (o) => i18n.pair(o.en, o.hi);

function normaliseState() {
  let state = store.simState('T04.detectiveKit', { active: 'bone', cases: {} });
  if (!state || typeof state !== 'object' || Array.isArray(state)) {
    store.resetSim('T04.detectiveKit');
    state = store.simState('T04.detectiveKit', { active: 'bone', cases: {} });
  }
  if (!CASE_FILES.some((item) => item.id === state.active)) state.active = CASE_FILES[0].id;
  if (!state.cases || typeof state.cases !== 'object' || Array.isArray(state.cases)) state.cases = {};
  for (const file of CASE_FILES) {
    const saved = state.cases[file.id];
    const record = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    state.cases[file.id] = {
      claim: file.claims.some((c) => c.id === record.claim) ? record.claim : '',
      test: file.tests.some((c) => c.id === record.test) ? record.test : '',
      note: typeof record.note === 'string' ? record.note.slice(0, 500) : '',
    };
  }
  return state;
}

export function createDetectiveKit() {
  const state = normaliseState();
  const storage = h('p', { class: 'detective-storage note', 'data-detective-storage': '' });
  const panels = [];
  const buttons = CASE_FILES.map((file, i) => h('button', {
    type: 'button', class: 'btn detective-case', 'data-detective-case': file.id,
    'aria-pressed': 'false', onclick: () => { state.active = file.id; save(); showCase(); },
  }, h('span', { class: 'detective-case-number', 'aria-hidden': 'true' }, String(i + 1)), bi(file.title, { tag: 'span' })));
  const nav = h('div', { class: 'detective-cases', role: 'group', 'aria-label': label(C.cases) }, ...buttons);

  function save() { store.saveSim(); renderStorage(); }
  function renderStorage() {
    storage.replaceChildren(bi(store.storageBlocked() ? C.temporary : C.storage, { tag: 'span' }));
    storage.classList.toggle('detective-storage-warning', store.storageBlocked());
  }
  function buildPanel(file, i) {
    const record = state.cases[file.id];
    const card = h('div', { class: 'detective-file', 'data-detective-panel': file.id, hidden: true });
    const resultNodes = {};
    const controlNodes = {};
    const question = (kind, title, choices) => {
      const feedback = h('div', { class: 'detective-feedback', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true', 'data-detective-feedback': kind, hidden: true });
      const controls = choices.map((opt) => h('button', {
        type: 'button', class: 'detective-option', 'data-detective-choice': opt.id, 'data-detective-kind': kind,
        'aria-pressed': 'false', onclick: () => { record[kind] = opt.id; save(); updateFeedback(kind); },
      }, bi(opt.label, { tag: 'span' })));
      resultNodes[kind] = feedback; controlNodes[kind] = controls;
      return h('fieldset', { class: 'detective-question' }, bi(title, { tag: 'legend' }), h('div', { class: 'detective-options' }, ...controls), feedback);
    };
    function updateFeedback(kind) {
      const choices = kind === 'claim' ? file.claims : file.tests;
      const selected = choices.find((item) => item.id === record[kind]);
      controlNodes[kind].forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.detectiveChoice === record[kind])));
      const fb = resultNodes[kind];
      fb.hidden = !selected;
      if (!selected) { fb.replaceChildren(); return; }
      fb.classList.toggle('is-useful', selected.useful);
      fb.classList.toggle('is-reconsider', !selected.useful);
      const heading = kind === 'claim' ? (selected.useful ? C.goodClaim : C.tryClaim) : (selected.useful ? C.goodTest : C.tryTest);
      fb.replaceChildren(bi(heading, { tag: 'strong' }), ' ', bi(selected.feedback, { tag: 'span' }));
    }
    const noteId = `detective-note-${file.id}`;
    const textarea = h('textarea', { id: noteId, rows: 3, maxlength: 500, 'data-detective-note': file.id, 'aria-describedby': `${noteId}-help` });
    textarea.value = record.note;
    textarea.addEventListener('input', () => { record.note = textarea.value; save(); });
    card.append(
      h('div', { class: 'detective-file-head' }, h('span', { class: 'detective-file-index', 'aria-hidden': 'true' }, `0${i + 1}`), h('div', {}, bi(file.setting, { tag: 'p', cls: 'detective-setting' }), bi(file.title, { tag: 'h4' }))),
      h('div', { class: 'detective-observations' }, bi(C.observations, { tag: 'h5' }), h('ul', {}, ...file.observations.map((item) => h('li', {}, bi(item, { tag: 'span' }))))),
      question('claim', C.claim, file.claims), question('test', C.next, file.tests),
      h('div', { class: 'detective-notebook' }, h('label', { for: noteId }, bi(C.noteLabel, { tag: 'span' })), bi(C.noteHelp, { tag: 'p', cls: 'note' }), textarea));
    card.querySelector('.detective-notebook .note').id = `${noteId}-help`;
    updateFeedback('claim'); updateFeedback('test');
    return card;
  }
  CASE_FILES.forEach((file, i) => panels.push(buildPanel(file, i)));
  const el = h('section', { class: 'detective-kit', 'aria-labelledby': 'detective-kit-title' },
    bi(C.kicker, { tag: 'p', cls: 'detective-kicker' }), bi(C.title, { tag: 'h3', cls: 'detective-title' }),
    bi(C.intro, { tag: 'p', cls: 'detective-intro' }),
    bi(C.fictional, { tag: 'p', cls: 'detective-fictional' }), nav,
    ...panels, storage,
    h('details', { class: 'detective-sources' }, h('summary', {}, bi(C.sources, { tag: 'span' })),
      h('ul', {},
        h('li', {}, h('a', { href: 'https://ncert.nic.in/textbook/pdf/lehs101.pdf', target: '_blank', rel: 'noopener noreferrer' }, bi(C.ncert, { tag: 'span' }))),
        h('li', {}, h('a', { href: 'https://humanorigins.si.edu/research/whats-hot-human-origins/oldest-use-stone-tools', target: '_blank', rel: 'noopener noreferrer' }, bi(C.smithsonian, { tag: 'span' }))))));
  el.querySelector('.detective-title').id = 'detective-kit-title';
  function showCase() {
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.detectiveCase === state.active)));
    panels.forEach((panel) => { panel.hidden = panel.dataset.detectivePanel !== state.active; });
  }
  showCase(); renderStorage();
  return {
    el,
    relabel() { relabelBi(el); nav.setAttribute('aria-label', label(C.cases)); renderStorage(); },
    destroy() {},
  };
}
