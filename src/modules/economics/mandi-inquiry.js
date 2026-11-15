// T09.L1–L3: dated evidence and a deliberately separate fictional market model.
// New Hindi is draft and needs subject-teacher review.
import { h } from '../../core/dom.js';
import * as store from '../../core/store.js';
import { bi, relabelBi } from '../../components/widgets.js';
import { quintalToKilogramPrice } from '../../engines/domain/market.js';

const b = (en, hi) => ({ en, hi });
export const MARKET_CASES = [
  {
    id: 'patna', label: b('Patna mandi · 2024', 'पटना मंडी · 2024'),
    evidence: b('On 3 July 2024, a news report described tomato at ₹60–70/kg in Patna’s wholesale mandi and about ₹100/kg at Antaghat’s vegetable market. These are reported historical quotes, not today’s prices.', '3 जुलाई 2024 की एक समाचार रिपोर्ट में पटना की थोक मंडी में टमाटर ₹60–70/किग्रा और अंटाघाट की सब्ज़ी मंडी में लगभग ₹100/किग्रा बताया गया। ये पुराने रिपोर्ट किए गए भाव हैं, आज की कीमतें नहीं।'),
    question: b('What can these two quotes tell us?', 'ये दोनों भाव हमें क्या बता सकते हैं?'),
    options: [
      { id: 'different', text: b('Wholesale and retail quotes can differ; compare place, date and quality.', 'थोक और खुदरा भाव अलग हो सकते हैं; स्थान, तारीख और गुणवत्ता की तुलना करें।'), correct: true },
      { id: 'profit', text: b('The difference is the exact profit of every seller.', 'अंतर हर विक्रेता का ठीक-ठीक मुनाफ़ा है।') },
    ],
    explain: b('Transport, handling, spoilage, quality and other costs may matter. These separate quotes alone do not reveal a seller’s costs or profit.', 'ढुलाई, रख-रखाव, खराबा, गुणवत्ता और अन्य खर्च का असर हो सकता है। केवल इन अलग भावों से विक्रेता का खर्च या लाभ नहीं पता चलता।'),
    source: 'https://www.prabhatkhabar.com/video/patna-vegetable-market-rate-tomato-price-jumped-from-rs-60-to-rs-100-in-two-days',
    sourceLabel: b('Source: Prabhat Khabar, 3 July 2024', 'स्रोत: प्रभात खबर, 3 जुलाई 2024'),
  },
  {
    id: 'tomato', label: b('Tomato spike · 2023', 'टमाटर उछाल · 2023'),
    evidence: b('During a tomato price spike, the government reported sales at ₹80/kg from 16 July 2023 at selected NAFED/NCCF points including Patna. This was a concessional retail price, not a Patna mandi quote or a market-wide price ceiling.', 'टमाटर की कीमत बढ़ने पर सरकार ने 16 जुलाई 2023 से पटना सहित चुने NAFED/NCCF केंद्रों पर ₹80/किग्रा बिक्री बताई। यह रियायती खुदरा मूल्य था, पटना का थोक भाव या पूरे बाज़ार की अधिकतम मूल्य-सीमा नहीं।'),
    question: b('What does this evidence establish?', 'इस साक्ष्य से क्या पता चलता है?'),
    options: [
      { id: 'selected', text: b('Some outlets offered a concessional retail price.', 'कुछ केंद्रों पर रियायती खुदरा मूल्य था।'), correct: true },
      { id: 'all', text: b('Every Patna seller charged ₹80/kg.', 'पटना के हर विक्रेता ने ₹80/किग्रा लिया।') },
    ],
    explain: b('The release names selected outlets, not every transaction. Rain and disrupted arrivals can affect supply; this single price does not prove the size or cause of the spike.', 'विज्ञप्ति चुने केंद्र बताती है, हर सौदा नहीं। बारिश और बाधित आवक पूर्ति को प्रभावित कर सकती है; एक मूल्य उछाल का आकार या कारण सिद्ध नहीं करता।'),
    source: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=1939908',
    sourceLabel: b('Source: PIB, 16 July 2023', 'स्रोत: पीआईबी, 16 जुलाई 2023'),
  },
  {
    id: 'onion', label: b('Onion buffer · 2023', 'प्याज़ भंडार · 2023'),
    evidence: b('On 4 November 2023, the government described subsidised onion sales at ₹25/kg through selected outlets and mobile vans in India. The release does not establish a Patna mandi price.', '4 नवंबर 2023 को सरकार ने भारत में चुनी दुकानों और चलती गाड़ियों से प्याज़ की ₹25/किग्रा रियायती बिक्री बताई। विज्ञप्ति से पटना का मंडी भाव सिद्ध नहीं होता।'),
    question: b('Which comparison is careful?', 'कौन-सी तुलना सावधानीपूर्ण है?'),
    options: [
      { id: 'scope', text: b('Ask where and when the subsidised price was offered.', 'पूछें रियायती भाव कहाँ और कब दिया गया।'), correct: true },
      { id: 'today', text: b('Treat ₹25 as today’s ordinary Patna wholesale price.', '₹25 को पटना का आज का सामान्य थोक भाव मानें।') },
    ],
    explain: b('A targeted buffer sale is different from an ordinary wholesale quote, and prices change over time. A buffer release may increase available supply, but its effects depend on context.', 'चुने स्थान पर भंडार से बिक्री सामान्य थोक भाव से अलग है और कीमतें समय के साथ बदलती हैं। भंडार से आपूर्ति बढ़ सकती है, पर असर परिस्थितियों पर निर्भर है।'),
    source: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=1974673',
    sourceLabel: b('Source: PIB, 4 November 2023', 'स्रोत: पीआईबी, 4 नवंबर 2023'),
  },
  {
    id: 'msp', label: b('Paddy MSP · 2024–25', 'धान MSP · 2024–25'),
    evidence: b('For the 2024–25 Kharif marketing season, the announced MSP for common paddy was ₹2,300 per quintal. A quintal is 100 kg: that is ₹23/kg. It is a support price for eligible procurement, not a tomato or onion quote.', '2024–25 खरीफ विपणन सत्र के लिए सामान्य धान का घोषित MSP ₹2,300 प्रति क्विंटल था। एक क्विंटल 100 किग्रा है: यानी ₹23/किग्रा। यह पात्र खरीद का समर्थन मूल्य है, टमाटर या प्याज़ का भाव नहीं।'),
    question: b('Does an announced MSP guarantee that every farmer sells at that price?', 'क्या घोषित MSP हर किसान की उसी मूल्य पर बिक्री की गारंटी है?'),
    options: [
      { id: 'access', text: b('No. Procurement access, quality and local conditions matter.', 'नहीं। खरीद तक पहुँच, गुणवत्ता और स्थानीय परिस्थितियाँ महत्त्वपूर्ण हैं।'), correct: true },
      { id: 'guarantee', text: b('Yes, every sale automatically happens at MSP.', 'हाँ, हर बिक्री अपने आप MSP पर होती है।') },
    ],
    explain: b('MSP is an announced support price; farmers may sell elsewhere and procurement depends on applicable conditions and access. This historical rate is not the current MSP.', 'MSP घोषित समर्थन मूल्य है; किसान अन्य जगह भी बेच सकते हैं और खरीद लागू शर्तों तथा पहुँच पर निर्भर है। यह पुराना मूल्य मौजूदा MSP नहीं है।'),
    source: 'https://www.pib.gov.in/PressReleseDetailm.aspx?PRID=2081586',
    sourceLabel: b('Source: PIB, 6 December 2024', 'स्रोत: पीआईबी, 6 दिसंबर 2024'),
  },
];
const C = {
  kicker: b('LOCAL EVIDENCE, NOT A LIVE PRICE FEED', 'स्थानीय साक्ष्य, वर्तमान भाव सूची नहीं'),
  title: b('From Patna mandi to a price spike', 'पटना मंडी से कीमत के उछाल तक'),
  intro: b('Choose a dated example, read the source and test what it supports. Wholesale, ordinary retail, subsidised retail and MSP are different things. These prices are historical, not current.', 'तारीख वाला उदाहरण चुनें, स्रोत पढ़ें और जाँचें कि उससे क्या सिद्ध होता है। थोक, सामान्य खुदरा, रियायती खुदरा और MSP अलग हैं। ये पुराने भाव हैं, आज के नहीं।'),
  source: b('Open the original source (requires internet)', 'मूल स्रोत खोलें (इंटरनेट आवश्यक)'),
  apply: b('Try a fictional supply fall in the graph below', 'नीचे के ग्राफ़ में काल्पनिक पूर्ति गिरावट आज़माएँ'),
  model: b('The graph assumes 20 fewer units offered at each price. Its numbers are invented: it is not a reconstruction, current quote or forecast. A real spike may have several causes.', 'ग्राफ़ में हर कीमत पर 20 इकाई कम पूर्ति मानते हैं। इसकी संख्याएँ काल्पनिक हैं: यह वास्तविक पुनर्निर्माण, आज का भाव या पूर्वानुमान नहीं। वास्तविक उछाल के कई कारण हो सकते हैं।'),
  correct: b('Supported by this evidence.', 'इस साक्ष्य से समर्थित।'),
  retry: b('Not established by this evidence. Try again.', 'इस साक्ष्य से सिद्ध नहीं। फिर कोशिश करें।'),
  reset: b('Reset the evidence activity', 'साक्ष्य गतिविधि रीसेट करें'),
  saved: b('Your example choices stay in this browser until its data is cleared.', 'उदाहरण के चुनाव डेटा मिटने तक इसी ब्राउज़र में रहते हैं।'),
  blocked: b('Browser storage is blocked; these choices will be lost on reload.', 'ब्राउज़र संग्रह बंद है; फिर लोड करने पर चुनाव मिट जाएँगे।'),
};

export function createMandiInquiry({ onModel = () => {} } = {}) {
  let S = store.simState('T09.mandiInquiry', { selected: 'patna', answers: {} });
  if (!S || typeof S !== 'object' || Array.isArray(S)) { store.resetSim('T09.mandiInquiry'); S = store.simState('T09.mandiInquiry', { selected: 'patna', answers: {} }); }
  if (!MARKET_CASES.some((item) => item.id === S.selected)) S.selected = 'patna';
  if (!S.answers || typeof S.answers !== 'object' || Array.isArray(S.answers)) S.answers = {};
  for (const item of MARKET_CASES) if (!item.options.some((o) => o.id === S.answers[item.id])) delete S.answers[item.id];
  const choices = h('div', { class: 'civic-choices', role: 'group', 'aria-labelledby': 't09-mandi-title' });
  const detail = h('div', { class: 'civic-detail', 'data-t09-evidence': '' });
  const quiz = h('div', { class: 'civic-quiz', 'data-t09-inquiry': '' });
  const feedback = h('div', { class: 'civic-result', role: 'status', 'aria-live': 'polite', 'data-t09-feedback': '' });
  const storage = h('p', { class: 'civic-storage note', 'data-t09-storage': '' });
  const selectButtons = MARKET_CASES.map((item) => {
    const button = h('button', { type: 'button', class: 'btn civic-choice', 'data-t09-case': item.id, 'aria-pressed': 'false', onclick: () => { S.selected = item.id; save(); render(); } }, bi(item.label, { tag: 'span' }));
    choices.append(button); return button;
  });
  const apply = h('button', { type: 'button', class: 'btn primary', 'data-t09-model': '', onclick: () => onModel() }, bi(C.apply, { tag: 'span' }));
  const el = h('section', { class: 'civic-card mandi-inquiry', 'aria-labelledby': 't09-mandi-title' },
    bi(C.kicker, { tag: 'p', cls: 'civic-kicker' }), bi(C.title, { tag: 'h3', cls: 'civic-title' }), bi(C.intro, { tag: 'p' }),
    choices, detail, quiz, feedback, bi(C.model, { tag: 'p', cls: 'civic-limit' }), apply,
    h('p', {}, h('button', { type: 'button', class: 'btn', 'data-t09-reset': '', onclick: () => { S.selected = 'patna'; S.answers = {}; save(); render(); } }, bi(C.reset, { tag: 'span' }))), storage);
  el.querySelector('.civic-title').id = 't09-mandi-title';
  function renderStorage() { const blocked = store.storageBlocked(); storage.classList.toggle('civic-warning', blocked); storage.replaceChildren(bi(blocked ? C.blocked : C.saved, { tag: 'span' })); }
  function save() { store.saveSim(); renderStorage(); }
  function render() {
    const item = MARKET_CASES.find((entry) => entry.id === S.selected);
    selectButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.t09Case === item.id)));
    const link = h('a', { href: item.source, target: '_blank', rel: 'noopener noreferrer' }, bi(item.sourceLabel, { tag: 'span' }));
    detail.replaceChildren(bi(item.evidence, { tag: 'p', cls: 'civic-outcome' }), h('p', {}, link, ' · ', bi(C.source, { tag: 'span' })));
    if (item.id === 'msp') {
      const converted = quintalToKilogramPrice(2300);
      detail.append(bi(b(`Conversion: ₹2,300 ÷ 100 = ₹${converted}/kg.`, `रूपांतरण: ₹2,300 ÷ 100 = ₹${converted}/किग्रा।`), { tag: 'p' }));
    }
    const options = h('div', { class: 'civic-choices' });
    item.options.forEach((option) => {
      const button = h('button', { type: 'button', class: 'btn civic-choice', 'data-t09-answer': option.id, 'aria-pressed': String(S.answers[item.id] === option.id), onclick: () => { S.answers[item.id] = option.id; save(); render(); quiz.querySelector(`[data-t09-answer="${option.id}"]`)?.focus(); } }, bi(option.text, { tag: 'span' }));
      options.append(button);
    });
    quiz.replaceChildren(bi(item.question, { tag: 'p', cls: 'civic-outcome' }), options);
    const answer = item.options.find((option) => option.id === S.answers[item.id]);
    feedback.className = `civic-result ${answer ? (answer.correct ? 'is-correct' : 'is-retry') : ''}`;
    feedback.replaceChildren(...(answer ? [bi(answer.correct ? C.correct : C.retry, { tag: 'p' }), bi(item.explain, { tag: 'p' })] : []));
  }
  render(); renderStorage();
  return { el, relabel() { relabelBi(el); render(); renderStorage(); }, destroy() {} };
}
