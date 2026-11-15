// T05.L3: match the seven constituents in an attributed statecraft theory.
// This is a terminology exercise, not a reconstruction or score for a historical state.
import { h } from '../../core/dom.js';
import * as i18n from '../../core/i18n.js';
import * as store from '../../core/store.js';
import { bi, relabelBi } from '../../components/widgets.js';

const b = (en, hi) => ({ en, hi });
export const SAPTANGA_PARTS = [
  { id: 'svamin', name: b('Svāmin', 'स्वामी'), role: b('The ruler or king', 'शासक या राजा') },
  { id: 'amatya', name: b('Amātya', 'अमात्य'), role: b('Ministers, councillors and high officials', 'मंत्री, सलाहकार और उच्च अधिकारी') },
  { id: 'janapada', name: b('Janapada', 'जनपद'), role: b('Territory and the people living in it', 'क्षेत्र और उसमें रहने वाले लोग') },
  { id: 'durga', name: b('Durga', 'दुर्ग'), role: b('Fortified towns or strongholds', 'किलेबंद नगर या दुर्ग') },
  { id: 'kosha', name: b('Kosha', 'कोश'), role: b('The treasury or wealth', 'राजकोष या धन') },
  { id: 'danda', name: b('Danda', 'दंड'), role: b('Forces of defence and law and order', 'रक्षा और कानून-व्यवस्था की शक्ति') },
  { id: 'mitra', name: b('Mitra', 'मित्र'), role: b('Allies', 'सहयोगी राज्य या मित्र') },
];
const ORDER = ['mitra', 'janapada', 'danda', 'svamin', 'kosha', 'amatya', 'durga'];
const C = {
  kicker: b('BUILD THE CONCEPT', 'अवधारणा बनाएँ'),
  title: b('Build the seven-part state', 'सात अंगों वाला राज्य बनाएँ'),
  intro: b('Match each role to a Sanskrit term, then check your build. Change any choice and check again; this is not a score for an actual kingdom.', 'हर भूमिका से एक संस्कृत शब्द मिलाएँ, फिर अपनी रचना जाँचें। उत्तर बदलकर फिर जाँच सकते हैं; यह किसी असली राज्य का अंक नहीं है।'),
  limit: b('The Arthashastra, attributed to Kautilya, presents a theory of statecraft. It does not prove that every dynasty followed one blueprint. Janapada includes land and people; mitra means an ally, not a revolt score.', 'कौटिल्य से जुड़ा अर्थशास्त्र राज्य-कौशल का एक सिद्धांत देता है। इससे सिद्ध नहीं होता कि हर राजवंश ने एक ही ढाँचा अपनाया। जनपद में भूमि और लोग हैं; मित्र सहयोगी है, विद्रोह का अंक नहीं।'),
  choose: b('Choose a term', 'शब्द चुनें'),
  check: b('Check my build', 'रचना जाँचें'), reset: b('Reset builder only', 'केवल रचना रीसेट करें'),
  correct: b('Matched.', 'मिलान सही है।'), retry: b('Try another term.', 'दूसरा शब्द आज़माएँ।'), missing: b('Choose a term for this role.', 'इस भूमिका के लिए एक शब्द चुनें।'),
  ready: b('Choose the seven terms and check when ready.', 'सात शब्द चुनें और तैयार होने पर जाँचें।'),
  storage: b('Your choices stay in this browser until its data is cleared.', 'आपके चुनाव इसी ब्राउज़र में डेटा मिटने तक रहते हैं।'),
  temporary: b('Browser storage is blocked; choices are temporary and will be lost on reload.', 'ब्राउज़र संग्रह बंद है; चुनाव अस्थायी हैं और फिर लोड करने पर हट जाएँगे।'),
  source: b('NCERT: Saptanga and administration (internet needed)', 'NCERT: सप्तांग और प्रशासन (इंटरनेट आवश्यक)'),
};
const text = (o) => i18n.pair(o.en, o.hi);

export function createSaptangaBuilder() {
  let state = store.simState('T05.saptangaBuilder', { answers: {}, checked: false });
  if (!state || typeof state !== 'object' || Array.isArray(state)) {
    store.resetSim('T05.saptangaBuilder');
    state = store.simState('T05.saptangaBuilder', { answers: {}, checked: false });
  }
  if (!state.answers || typeof state.answers !== 'object' || Array.isArray(state.answers)) state.answers = {};
  for (const part of SAPTANGA_PARTS) if (!SAPTANGA_PARTS.some((item) => item.id === state.answers[part.id])) state.answers[part.id] = '';
  state.checked = state.checked === true;
  const result = h('p', { class: 'saptanga-result', role: 'status', 'aria-live': 'polite', 'data-t05-builder-result': '' });
  const storage = h('p', { class: 'saptanga-storage note', 'data-t05-builder-storage': '' });
  const selects = new Map(), feedbacks = new Map();
  const rows = SAPTANGA_PARTS.map((part, i) => {
    const id = `t05-saptanga-${part.id}`, feedbackId = `${id}-feedback`;
    const select = h('select', { id, 'data-t05-part': part.id, 'aria-describedby': feedbackId });
    select.append(h('option', { value: '' }, text(C.choose)));
    ORDER.forEach((key) => {
      const item = SAPTANGA_PARTS.find((candidate) => candidate.id === key);
      select.append(h('option', { value: key }, text(item.name)));
    });
    select.value = state.answers[part.id];
    select.addEventListener('change', () => { state.answers[part.id] = select.value; save(); renderFeedback(); });
    const feedback = h('p', { id: feedbackId, class: 'saptanga-row-feedback', 'data-t05-part-feedback': part.id });
    selects.set(part.id, select); feedbacks.set(part.id, feedback);
    return h('div', { class: 'saptanga-row' },
      h('label', { for: id }, h('span', { class: 'saptanga-number', 'aria-hidden': 'true' }, String(i + 1)), bi(part.role, { tag: 'span' })),
      select, feedback);
  });
  const el = h('section', { class: 'saptanga-builder', 'aria-labelledby': 't05-builder-title' },
    bi(C.kicker, { tag: 'p', cls: 'history-kicker' }), bi(C.title, { tag: 'h3', cls: 'saptanga-title' }),
    bi(C.intro, { tag: 'p', cls: 'history-intro' }), bi(C.limit, { tag: 'p', cls: 'history-limit' }),
    h('div', { class: 'saptanga-rows' }, ...rows),
    h('div', { class: 'row saptanga-actions' },
      h('button', { type: 'button', class: 'btn primary', 'data-t05-builder-check': '', onclick: () => { state.checked = true; save(); renderFeedback(); } }, bi(C.check, { tag: 'span' })),
      h('button', { type: 'button', class: 'btn', 'data-t05-builder-reset': '', onclick: () => {
        state.answers = {}; state.checked = false;
        SAPTANGA_PARTS.forEach((part) => { state.answers[part.id] = ''; selects.get(part.id).value = ''; });
        save(); renderFeedback();
      } }, bi(C.reset, { tag: 'span' }))),
    result, storage,
    h('a', { class: 'history-source', href: 'https://ncert.nic.in/textbook/pdf/iest105.pdf', target: '_blank', rel: 'noopener noreferrer' }, bi(C.source, { tag: 'span' })));
  el.querySelector('.saptanga-title').id = 't05-builder-title';
  function renderStorage() {
    storage.classList.toggle('saptanga-storage-warning', store.storageBlocked());
    storage.replaceChildren(bi(store.storageBlocked() ? C.temporary : C.storage, { tag: 'span' }));
  }
  function save() { store.saveSim(); renderStorage(); }
  function renderFeedback() {
    let correct = 0;
    for (const part of SAPTANGA_PARTS) {
      const value = state.answers[part.id], matched = value === part.id;
      if (matched) correct++;
      const feedback = feedbacks.get(part.id);
      feedback.classList.toggle('is-correct', state.checked && matched);
      feedback.classList.toggle('is-retry', state.checked && !matched);
      feedback.replaceChildren(...(state.checked ? [bi(!value ? C.missing : matched ? C.correct : C.retry, { tag: 'span' })] : []));
    }
    const summary = state.checked
      ? b(`${correct} of 7 roles matched. You can revise any choice.`, `7 में से ${correct} भूमिकाओं का सही मिलान। आप कोई भी चुनाव बदल सकते हैं।`)
      : C.ready;
    result.replaceChildren(bi(summary, { tag: 'span' }));
  }
  function relabel() {
    relabelBi(el);
    for (const select of selects.values()) {
      select.options[0].textContent = text(C.choose);
      for (const option of [...select.options].slice(1)) option.textContent = text(SAPTANGA_PARTS.find((part) => part.id === option.value).name);
    }
    renderStorage(); renderFeedback();
  }
  renderStorage(); renderFeedback();
  return { el, relabel, destroy() {} };
}
