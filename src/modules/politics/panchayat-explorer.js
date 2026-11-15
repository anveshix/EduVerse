// T06.L2: a modern Panchayati Raj introduction, separate from the historical gallery.
import { h } from '../../core/dom.js';
import * as i18n from '../../core/i18n.js';
import * as store from '../../core/store.js';
import { bi, relabelBi } from '../../components/widgets.js';

const b = (en, hi) => ({ en, hi });
export const PANCHAYAT_ROLES = [
  {
    id: 'sabha', title: b('Gram Sabha', 'ग्राम सभा'),
    who: b('A body of people registered on the electoral rolls for a village in a village-level panchayat area; it is not just the elected council.', 'ग्राम-स्तरीय पंचायत क्षेत्र के गाँव की मतदाता सूची में दर्ज लोगों का निकाय; यह केवल चुनी हुई परिषद नहीं है।'),
    work: b('State law determines its powers and functions; people may use meetings to discuss local concerns where provided.', 'इसके अधिकार और कार्य राज्य के कानून पर निर्भर हैं; जहाँ व्यवस्था हो, लोग बैठकों में स्थानीय मुद्दे उठा सकते हैं।'),
    question: b('Whose voices might be absent from a meeting even when they are eligible to attend?', 'पात्र होने पर भी बैठक से किन लोगों की आवाज़ गायब हो सकती है?'),
  },
  {
    id: 'gram', title: b('Gram Panchayat', 'ग्राम पंचायत'),
    who: b('The village-level institution of rural local self-government, with elected representatives.', 'ग्राम स्तर पर ग्रामीण स्थानीय स्वशासन की संस्था, जिसमें निर्वाचित प्रतिनिधि होते हैं।'),
    work: b('A state may give it planning or service responsibilities; the actual tasks, funds and staff vary by state.', 'राज्य इसे योजना या सेवाओं की जिम्मेदारी दे सकता है; वास्तविक कार्य, धन और कर्मचारी राज्य के अनुसार बदलते हैं।'),
    question: b('How can residents ask for a plan, spending information or a follow-up?', 'निवासी योजना, खर्च की जानकारी या आगे की कार्रवाई कैसे माँग सकते हैं?'),
  },
  {
    id: 'block', title: b('Intermediate / block Panchayat', 'मध्यवर्ती / प्रखंड पंचायत'),
    who: b('An intermediate-level rural panchayat between village and district, often called a Panchayat Samiti.', 'ग्राम और जिले के बीच मध्यवर्ती स्तर की ग्रामीण पंचायत, जिसे अक्सर पंचायत समिति कहते हैं।'),
    work: b('It may coordinate work across a wider area as provided by state law. A state with at most 20 lakh people may omit this tier.', 'राज्य के कानून के अनुसार यह बड़े क्षेत्र में कार्यों का समन्वय कर सकती है। 20 लाख तक आबादी वाला राज्य यह स्तर छोड़ सकता है।'),
    question: b('Which local problem might involve more than one village?', 'कौन-सी स्थानीय समस्या एक से अधिक गाँवों को प्रभावित कर सकती है?'),
  },
  {
    id: 'district', title: b('District Panchayat', 'जिला पंचायत'),
    who: b('The district-level rural panchayat, often called Zila Parishad.', 'जिला स्तर की ग्रामीण पंचायत, जिसे अक्सर जिला परिषद कहते हैं।'),
    work: b('Its responsibilities depend on the state’s law, available resources and other authorities.', 'इसकी जिम्मेदारियाँ राज्य के कानून, उपलब्ध संसाधनों और अन्य प्राधिकारों पर निर्भर करती हैं।'),
    question: b('How can a district-level plan include different villages’ needs?', 'जिले की योजना में अलग-अलग गाँवों की जरूरतें कैसे शामिल हों?'),
  },
];
const C = {
  kicker: b('LOCAL DEMOCRACY TODAY', 'आज का स्थानीय लोकतंत्र'),
  title: b('Explore Panchayati Raj', 'पंचायती राज जानें'),
  intro: b('Explore a constitutional framework for rural local self-government. The modern Gram Sabha is not the same institution as the historical assemblies below.', 'ग्रामीण स्थानीय स्वशासन का संवैधानिक ढाँचा जानें। आधुनिक ग्राम सभा नीचे दी गई ऐतिहासिक सभाओं के समान संस्था नहीं है।'),
  group: b('Explore local bodies', 'स्थानीय निकाय जानें'),
  who: b('Who belongs?', 'कौन शामिल है?'), work: b('What can it do?', 'यह क्या कर सकती है?'), question: b('Discuss', 'चर्चा करें'),
  limit: b('Part IX was added by the 73rd Constitutional Amendment. Powers, finances, names and meetings vary under state law; exceptions and special laws apply in some areas. Urban municipalities have a separate framework. This is not a map of offices or a service guarantee.', '73वें संविधान संशोधन ने भाग IX जोड़ा। अधिकार, वित्त, नाम और बैठकें राज्य के कानून से बदलती हैं; कुछ क्षेत्रों में अपवाद और विशेष कानून लागू हैं। शहरी नगरपालिकाओं का ढाँचा अलग है। यह कार्यालयों का नक्शा या सेवा की गारंटी नहीं है।'),
  inclusionTitle: b('Elections and representation', 'चुनाव और प्रतिनिधित्व'),
  inclusion: b('Part IX provides for seats reserved for Scheduled Castes and Scheduled Tribes in proportion to population, and at least one-third of directly elected seats for women, including women in those reserved seats. A State Election Commission supervises Panchayat elections. State laws can provide further details, and exceptions apply.', 'भाग IX अनुसूचित जातियों और जनजातियों के लिए जनसंख्या अनुपात में सीटें और सीधे चुनाव वाली कम से कम एक-तिहाई सीटें महिलाओं के लिए आरक्षित करता है; इनमें उन आरक्षित वर्गों की महिलाएँ भी शामिल हैं। राज्य निर्वाचन आयोग पंचायत चुनाव की देखरेख करता है। राज्य कानून आगे विवरण दे सकते हैं और अपवाद लागू हैं।'),
  quiz: b('Quick check: which body consists of registered village electors?', 'छोटी जाँच: किस निकाय में गाँव के पंजीकृत मतदाता होते हैं?'),
  correct: b('Yes. The Gram Sabha consists of registered electors; the Gram Panchayat is the elected institution.', 'हाँ। ग्राम सभा में पंजीकृत मतदाता होते हैं; ग्राम पंचायत निर्वाचित संस्था है।'),
  retry: b('Not quite. Compare the Gram Sabha with the elected Gram Panchayat and district-level body, then try again.', 'फिर सोचें। ग्राम सभा की निर्वाचित ग्राम पंचायत और जिला निकाय से तुलना कर दोबारा चुनें।'),
  reset: b('Reset this check', 'केवल यह जाँच रीसेट करें'),
  storage: b('Your selection stays in this browser until its data is cleared.', 'आपका चुनाव इसी ब्राउज़र में डेटा मिटने तक रहता है।'),
  temporary: b('Browser storage is blocked; this selection will be lost on reload.', 'ब्राउज़र संग्रह बंद है; फिर लोड करने पर चुनाव हट जाएगा।'),
  source: b('Constitution of India, Part IX (internet needed)', 'भारत का संविधान, भाग IX (इंटरनेट आवश्यक)'),
};
const text = (o) => i18n.pair(o.en, o.hi);

export function createPanchayatExplorer() {
  let state = store.simState('T06.panchayat', { level: 'sabha', answer: '' });
  if (!state || typeof state !== 'object' || Array.isArray(state)) {
    store.resetSim('T06.panchayat'); state = store.simState('T06.panchayat', { level: 'sabha', answer: '' });
  }
  if (!PANCHAYAT_ROLES.some((role) => role.id === state.level)) state.level = 'sabha';
  if (!['', 'sabha', 'gram', 'district'].includes(state.answer)) state.answer = '';
  const details = h('div', { class: 'civic-detail', 'data-t06-role-detail': '', 'aria-live': 'polite' });
  const result = h('p', { class: 'civic-result', 'data-t06-role-result': '', role: 'status' });
  const storage = h('p', { class: 'civic-storage note', 'data-t06-role-storage': '' });
  const buttons = PANCHAYAT_ROLES.map((role) => h('button', {
    type: 'button', class: 'btn civic-role', 'data-t06-role': role.id, 'aria-pressed': 'false',
    onclick: () => { state.level = role.id; save(); render(); },
  }, bi(role.title, { tag: 'span' })));
  const group = h('div', { class: 'civic-roles', role: 'group', 'aria-label': text(C.group) }, ...buttons);
  const quizButtons = ['sabha', 'gram', 'district'].map((id) => {
    const role = PANCHAYAT_ROLES.find((r) => r.id === id);
    return h('button', { type: 'button', class: 'btn civic-choice', 'data-t06-role-answer': id, 'aria-pressed': 'false',
      onclick: () => { state.answer = id; save(); render(); } }, bi(role.title, { tag: 'span' }));
  });
  const el = h('section', { class: 'civic-card', 'aria-labelledby': 't06-panchayat-title' },
    bi(C.kicker, { tag: 'p', cls: 'civic-kicker' }), bi(C.title, { tag: 'h3', cls: 'civic-title' }),
    bi(C.intro, { tag: 'p' }), group, details, bi(C.limit, { tag: 'p', cls: 'civic-limit' }),
    h('details', { class: 'civic-inclusion' }, h('summary', {}, bi(C.inclusionTitle, { tag: 'span' })), bi(C.inclusion, { tag: 'p' })),
    h('div', { class: 'civic-quiz' }, bi(C.quiz, { tag: 'h4' }), h('div', { class: 'civic-choices' }, ...quizButtons), result,
      h('button', { type: 'button', class: 'btn', 'data-t06-role-reset': '', onclick: () => { state.answer = ''; save(); render(); } }, bi(C.reset, { tag: 'span' }))),
    storage, h('a', { href: 'https://www.legislative.gov.in/static/uploads/2025/07/ca7ce5c746fa7480804bbdeb6cb704f0.pdf', target: '_blank', rel: 'noopener noreferrer' }, bi(C.source, { tag: 'span' })));
  el.querySelector('.civic-title').id = 't06-panchayat-title';
  function renderStorage() {
    const blocked = store.storageBlocked();
    storage.classList.toggle('civic-warning', blocked);
    storage.replaceChildren(bi(blocked ? C.temporary : C.storage, { tag: 'span' }));
  }
  function save() { store.saveSim(); renderStorage(); }
  function render() {
    const role = PANCHAYAT_ROLES.find((r) => r.id === state.level);
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.t06Role === role.id)));
    details.replaceChildren(bi(role.title, { tag: 'h4' }), ...[['who', C.who], ['work', C.work], ['question', C.question]].map(([key, label]) =>
      h('div', { class: 'civic-detail-item', 'data-t06-role-field': key }, bi(label, { tag: 'strong' }), bi(role[key], { tag: 'p' }))));
    quizButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.t06RoleAnswer === state.answer)));
    result.classList.toggle('is-correct', state.answer === 'sabha');
    result.classList.toggle('is-retry', !!state.answer && state.answer !== 'sabha');
    result.replaceChildren(...(state.answer ? [bi(state.answer === 'sabha' ? C.correct : C.retry, { tag: 'span' })] : []));
  }
  render(); renderStorage();
  return { el, relabel() { group.setAttribute('aria-label', text(C.group)); relabelBi(el); render(); renderStorage(); }, destroy() {} };
}
