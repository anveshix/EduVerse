// Reusable, bilingual source/decision cards. Activity state is local and bounded by the supplied IDs.
import { h } from '../core/dom.js';
import * as store from '../core/store.js';
import { bi, relabelBi } from './widgets.js';

const b = (en, hi) => ({ en, hi });
const C = {
  source: b('Source (internet required)', 'स्रोत (इंटरनेट आवश्यक)'),
  supported: b('A supported choice.', 'यह उचित विकल्प है।'),
  retry: b('Not the best choice. Try again.', 'यह सबसे उचित विकल्प नहीं है। फिर प्रयास करें।'),
  reset: b('Reset this activity', 'यह गतिविधि रीसेट करें'),
  saved: b('These example choices remain in this browser until its data is cleared.', 'उदाहरण के चुनाव डेटा मिटने तक इसी ब्राउज़र में रहते हैं।'),
  blocked: b('Browser storage is blocked; these choices will be lost on reload.', 'ब्राउज़र संग्रह बंद है; फिर लोड करने पर चुनाव मिट जाएँगे।'),
};

/** Each item: id, label, evidence, question, options [{id,text,correct}], explain, source, sourceLabel. */
export function createInquiryExplorer({ id, storageKey, className = '', kicker, title, intro, limit, items, actions = [] }) {
  const initial = () => ({ selected: items[0].id, answers: {} });
  let S = store.simState(storageKey, initial());
  if (!S || typeof S !== 'object' || Array.isArray(S)) { store.resetSim(storageKey); S = store.simState(storageKey, initial()); }
  if (!items.some((item) => item.id === S.selected)) S.selected = items[0].id;
  if (!S.answers || typeof S.answers !== 'object' || Array.isArray(S.answers)) S.answers = {};
  for (const item of items) if (!item.options.some((option) => option.id === S.answers[item.id])) delete S.answers[item.id];
  const choices = h('div', { class: 'civic-choices', role: 'group', 'aria-labelledby': `${id}-title` });
  const detail = h('div', { class: 'civic-detail', 'data-inquiry-evidence': '' });
  const quiz = h('div', { class: 'civic-quiz', 'data-inquiry-question': '' });
  const feedback = h('div', { class: 'civic-result', role: 'status', 'aria-live': 'polite', 'data-inquiry-feedback': '' });
  const storage = h('p', { class: 'civic-storage note', 'data-inquiry-storage': '' });
  const buttons = items.map((item) => {
    const button = h('button', { type: 'button', class: 'btn civic-choice', 'data-inquiry-case': item.id, 'aria-pressed': 'false', onclick: () => { S.selected = item.id; save(); render(); } }, bi(item.label, { tag: 'span' }));
    choices.append(button); return button;
  });
  const actionButtons = actions.map((action) => h('button', { type: 'button', class: 'btn', 'data-inquiry-action': action.id, onclick: () => action.run() }, bi(action.label, { tag: 'span' })));
  const el = h('section', { class: `civic-card inquiry-explorer ${className}`, 'aria-labelledby': `${id}-title`, 'data-inquiry': id },
    bi(kicker, { tag: 'p', cls: 'civic-kicker' }), bi(title, { tag: 'h3', cls: 'civic-title' }), bi(intro, { tag: 'p' }),
    choices, detail, quiz, feedback, limit ? bi(limit, { tag: 'p', cls: 'civic-limit' }) : null,
    actionButtons.length ? h('div', { class: 'civic-choices' }, ...actionButtons) : null,
    h('p', {}, h('button', { type: 'button', class: 'btn', 'data-inquiry-reset': '', onclick: () => { Object.assign(S, initial()); save(); render(); } }, bi(C.reset, { tag: 'span' }))), storage);
  el.querySelector('.civic-title').id = `${id}-title`;
  function renderStorage() { const blocked = store.storageBlocked(); storage.classList.toggle('civic-warning', blocked); storage.replaceChildren(bi(blocked ? C.blocked : C.saved, { tag: 'span' })); }
  function save() { store.saveSim(); renderStorage(); }
  function render() {
    const item = items.find((entry) => entry.id === S.selected);
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.inquiryCase === item.id)));
    const source = item.source ? h('p', {}, bi(C.source, { tag: 'span' }), ': ', h('a', { href: item.source, target: '_blank', rel: 'noopener noreferrer' }, bi(item.sourceLabel, { tag: 'span' }))) : null;
    detail.replaceChildren(bi(item.evidence, { tag: 'p', cls: 'civic-outcome' }), ...(source ? [source] : []));
    const options = h('div', { class: 'civic-choices', role: 'group', 'aria-labelledby': `${id}-question` });
    item.options.forEach((option) => {
      options.append(h('button', { type: 'button', class: 'btn civic-choice', 'data-inquiry-answer': option.id, 'aria-pressed': String(S.answers[item.id] === option.id), onclick: () => {
        S.answers[item.id] = option.id; save(); render(); quiz.querySelector(`[data-inquiry-answer="${option.id}"]`)?.focus();
      } }, bi(option.text, { tag: 'span' })));
    });
    const question = bi(item.question, { tag: 'p', cls: 'civic-outcome' }); question.id = `${id}-question`;
    quiz.replaceChildren(question, options);
    const answer = item.options.find((option) => option.id === S.answers[item.id]);
    feedback.className = `civic-result ${answer ? (answer.correct ? 'is-correct' : 'is-retry') : ''}`;
    feedback.replaceChildren(...(answer ? [bi(answer.correct ? C.supported : C.retry, { tag: 'p' }), bi(item.explain, { tag: 'p' })] : []));
  }
  render(); renderStorage();
  return { el, relabel() { relabelBi(el); render(); renderStorage(); }, destroy() {} };
}
