// T07.L1: a walk through a fictitious voter's journey, not a real voting system.
import { h } from '../../core/dom.js';
import * as i18n from '../../core/i18n.js';
import * as store from '../../core/store.js';
import { bi, relabelBi } from '../../components/widgets.js';

const b = (en, hi) => ({ en, hi });
export const VOTER_STAGES = [
  { id: 'roll', title: b('1 · Check the roll', '१ · मतदाता सूची जाँचें'), body: b('Imagine an eligible adult has applied to register. Before polling, they check that their name appears in the correct electoral roll. Turning 18 or holding an ID card alone does not automatically add a name.', 'कल्पना करें कि एक पात्र वयस्क ने पंजीकरण के लिए आवेदन किया। मतदान से पहले वे सही मतदाता सूची में अपना नाम जाँचते हैं। केवल 18 वर्ष का होना या पहचान पत्र रखना अपने आप नाम नहीं जोड़ता।'), question: b('What might someone do if their name is missing? Consult the election office and current registration guidance.', 'यदि नाम गायब हो तो क्या करें? निर्वाचन कार्यालय और वर्तमान पंजीकरण निर्देश देखें।') },
  { id: 'compare', title: b('2 · Compare choices', '२ · विकल्प समझें'), body: b('Read about candidates and their required disclosures, consider different sources and make a choice free from pressure. NOTA is also an option in Indian EVM elections.', 'उम्मीदवारों और उनकी आवश्यक घोषणाओं को पढ़ें, अलग-अलग स्रोत देखें और बिना दबाव चुनाव करें। भारतीय ईवीएम चुनाव में NOTA भी एक विकल्प है।'), question: b('What would you want to check before believing a campaign claim?', 'चुनावी दावे पर विश्वास करने से पहले क्या जाँचेंगे?') },
  { id: 'booth', title: b('3 · At the booth', '३ · मतदान केंद्र पर'), body: b('At the polling station, officials check the roll and accepted identification before the voter enters the voting compartment. Procedures and assistance depend on current rules.', 'मतदान केंद्र पर अधिकारी सूची और स्वीकृत पहचान की जाँच करते हैं, फिर मतदाता मतदान कक्ष में जाता है। प्रक्रिया और सहायता वर्तमान नियमों पर निर्भर हैं।'), question: b('Why does a private voting compartment matter?', 'गोपनीय मतदान कक्ष क्यों महत्त्वपूर्ण है?') },
  { id: 'mark', title: b('4 · Make a practice choice', '४ · अभ्यास के लिए चुनाव'), body: b('Select one imaginary colour below. This is a classroom demonstration, not an EVM or an actual ballot; no real votes are collected. You can change or clear the choice.', 'नीचे एक काल्पनिक रंग चुनें। यह कक्षा का प्रदर्शन है, ईवीएम या असली मतपत्र नहीं; वास्तविक मत एकत्र नहीं होते। चुनाव बदला या मिटाया जा सकता है।'), question: b('A real choice should be private. Do not enter or use a real voting preference here.', 'असली चुनाव गोपनीय होना चाहिए। यहाँ अपनी वास्तविक मतदान पसंद दर्ज न करें।') },
  { id: 'count', title: b('5 · Verify & count', '५ · पर्ची देखें व गिनें'), body: b('On an Indian EVM with VVPAT, the voter sees the printed slip briefly through a window; it then falls into a sealed box, not into the voter’s hand. Prescribed samples are checked during counting.', 'भारतीय ईवीएम के वीवीपैट में मतदाता पर्ची को कुछ क्षण खिड़की से देखता है; पर्ची उसके हाथ में नहीं, सीलबंद बॉक्स में गिरती है। मतगणना में निर्धारित नमूने जाँचे जाते हैं।'), question: b('Separate fixed example: Red 8, Blue 7, Green 5 of 20 candidate votes. Red has the most (8/20), not a majority. Your practice choice does not change this count; ties are not illustrated.', 'अलग निश्चित उदाहरण: 20 उम्मीदवार मतों में लाल 8, नीला 7, हरा 5। लाल के सबसे अधिक (8/20) मत हैं, बहुमत नहीं। आपका अभ्यास चुनाव यह गिनती नहीं बदलता; बराबरी यहाँ नहीं दिखाई गई।') },
];
export const PRACTICE_CHOICES = [
  { id: 'red', name: b('Imaginary Red', 'काल्पनिक लाल') },
  { id: 'blue', name: b('Imaginary Blue', 'काल्पनिक नीला') },
  { id: 'green', name: b('Imaginary Green', 'काल्पनिक हरा') },
];
const C = {
  kicker: b('LEARN THE JOURNEY', 'मतदान की यात्रा जानें'),
  title: b('A mock election: from roll to result', 'काल्पनिक चुनाव: सूची से परिणाम तक'),
  intro: b('Follow five steps for a fictional voter, then compare a fixed example count. Choose any step to revisit it.', 'काल्पनिक मतदाता के पाँच चरण देखें, फिर एक निश्चित उदाहरण गिनती की तुलना करें। किसी भी चरण पर लौट सकते हैं।'),
  group: b('Voter journey steps', 'मतदान यात्रा के चरण'),
  choiceGroup: b('Practice choices', 'अभ्यास के विकल्प'),
  noChoice: b('No practice choice selected.', 'अभ्यास का कोई विकल्प नहीं चुना।'),
  selected: (c) => b(`Practice choice: ${c.name.en}. This does not cast a real vote.`, `अभ्यास चुनाव: ${c.name.hi}। इससे असली मत नहीं पड़ता।`),
  reset: b('Reset this journey', 'यह यात्रा रीसेट करें'),
  saved: b('The step and imaginary choice stay in this browser until its data is cleared; this is not secret or secure.', 'चरण और काल्पनिक चुनाव इसी ब्राउज़र में डेटा मिटने तक रहते हैं; यह गोपनीय या सुरक्षित नहीं है।'),
  blocked: b('Browser storage is blocked; the practice choice will be lost on reload.', 'ब्राउज़र संग्रह बंद है; फिर लोड करने पर अभ्यास चुनाव मिट जाएगा।'),
  source: b('Election Commission voter information (internet required)', 'निर्वाचन आयोग की मतदाता जानकारी (इंटरनेट आवश्यक)'),
};
const text = (o) => i18n.pair(o.en, o.hi);

export function createVoterJourney() {
  let S = store.simState('T07.journey', { stage: 'roll', choice: '' });
  if (!S || typeof S !== 'object' || Array.isArray(S)) { store.resetSim('T07.journey'); S = store.simState('T07.journey', { stage: 'roll', choice: '' }); }
  if (!VOTER_STAGES.some((x) => x.id === S.stage)) S.stage = 'roll';
  if (!PRACTICE_CHOICES.some((x) => x.id === S.choice)) S.choice = '';
  const detail = h('div', { class: 'civic-detail', 'data-t07-journey-detail': '', 'aria-live': 'polite' });
  const selection = h('p', { class: 'civic-result', 'data-t07-practice-result': '', role: 'status' });
  const storage = h('p', { class: 'civic-storage note', 'data-t07-journey-storage': '' });
  const steps = VOTER_STAGES.map((stage) => h('button', { type: 'button', class: 'btn civic-role', 'data-t07-stage': stage.id, 'aria-pressed': 'false',
    onclick: () => { S.stage = stage.id; save(); render(); } }, bi(stage.title, { tag: 'span' })));
  const choices = PRACTICE_CHOICES.map((choice) => h('button', { type: 'button', class: 'btn civic-choice', 'data-t07-practice': choice.id, 'aria-pressed': 'false',
    onclick: () => { S.choice = choice.id; save(); render(); } }, bi(choice.name, { tag: 'span' })));
  const group = h('div', { class: 'election-steps', role: 'group', 'aria-label': text(C.group) }, ...steps);
  const ballot = h('div', { class: 'civic-quiz', 'data-t07-ballot': '' }, h('div', { class: 'civic-choices', role: 'group', 'aria-label': text(C.choiceGroup) }, ...choices), selection);
  const el = h('section', { class: 'civic-card election-journey', 'aria-labelledby': 't07-journey-title' },
    bi(C.kicker, { tag: 'p', cls: 'civic-kicker' }), bi(C.title, { tag: 'h3', cls: 'civic-title' }), bi(C.intro, { tag: 'p' }), group, detail, ballot,
    h('button', { type: 'button', class: 'btn', 'data-t07-journey-reset': '', onclick: () => { S.stage = 'roll'; S.choice = ''; save(); render(); } }, bi(C.reset, { tag: 'span' })),
    storage, h('a', { href: 'https://www.eci.gov.in/', target: '_blank', rel: 'noopener noreferrer' }, bi(C.source, { tag: 'span' })));
  el.querySelector('.civic-title').id = 't07-journey-title';
  function save() { store.saveSim(); renderStorage(); }
  function renderStorage() { const blocked = store.storageBlocked(); storage.classList.toggle('civic-warning', blocked); storage.replaceChildren(bi(blocked ? C.blocked : C.saved, { tag: 'span' })); }
  function render() {
    const stage = VOTER_STAGES.find((x) => x.id === S.stage), choice = PRACTICE_CHOICES.find((x) => x.id === S.choice);
    steps.forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.t07Stage === S.stage)));
    choices.forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.t07Practice === S.choice)));
    detail.replaceChildren(bi(stage.title, { tag: 'h4' }), bi(stage.body, { tag: 'p' }), bi(stage.question, { tag: 'p', cls: 'civic-discussion' }));
    ballot.hidden = S.stage !== 'mark';
    selection.replaceChildren(bi(choice ? C.selected(choice) : C.noChoice, { tag: 'span' }));
  }
  render(); renderStorage();
  return { el, relabel() { group.setAttribute('aria-label', text(C.group)); ballot.querySelector('[role=group]').setAttribute('aria-label', text(C.choiceGroup)); relabelBi(el); render(); renderStorage(); }, destroy() {} };
}
