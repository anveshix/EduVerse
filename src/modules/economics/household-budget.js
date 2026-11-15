// T08.L1: a fictional ₹1,000 allocation, separate from real household finances.
import { h, fmt } from '../../core/dom.js';
import * as store from '../../core/store.js';
import { bi, relabelBi } from '../../components/widgets.js';
import { householdBudget } from '../../engines/domain/market.js';

const b = (en, hi) => ({ en, hi });
export const BUDGET = 1000;
export const BUDGET_CATEGORIES = [
  { id: 'food', name: b('Food', 'भोजन'), initial: 350 },
  { id: 'travel', name: b('Travel', 'यात्रा'), initial: 150 },
  { id: 'learning', name: b('Learning supplies', 'पढ़ाई की सामग्री'), initial: 200 },
  { id: 'care', name: b('Care and other needs', 'देखभाल और अन्य ज़रूरतें'), initial: 100 },
  { id: 'reserve', name: b('Set aside for later', 'बाद के लिए अलग रखें'), initial: 100 },
];
const initial = () => ({ allocations: Object.fromEntries(BUDGET_CATEGORIES.map((item) => [item.id, item.initial])), surprise: false });
const C = {
  kicker: b('SCALE UP THE CHALLENGE', 'चुनौती का विस्तार'),
  title: b('Plan an imaginary ₹1,000', 'काल्पनिक ₹1,000 की योजना'),
  intro: b('After the ₹100 student example below, imagine ₹1,000 available for a few household expenses over one week. Change the amounts in ₹50 steps, then try an unexpected ₹100 expense.', 'नीचे ₹100 के विद्यार्थी उदाहरण के बाद मानें कि एक सप्ताह के कुछ पारिवारिक खर्चों के लिए ₹1,000 उपलब्ध हैं। राशि ₹50 के चरणों में बदलें, फिर अचानक ₹100 का खर्च आज़माएँ।'),
  limits: b('These amounts are invented, not actual prices, a complete family budget or financial advice. Other costs may already have been paid. Needs and resources differ; some households cannot afford to save. Do not enter your own family’s finances.', 'ये काल्पनिक राशियाँ हैं, वास्तविक मूल्य, परिवार का पूरा बजट या वित्तीय सलाह नहीं। अन्य खर्च पहले चुकाए गए हो सकते हैं। ज़रूरतें और संसाधन अलग होते हैं; कुछ परिवार बचत नहीं कर पाते। अपने परिवार की वित्तीय जानकारी न डालें।'),
  surprise: b('Add an unexpected ₹100 expense', 'अचानक ₹100 का खर्च जोड़ें'),
  tradeoff: b('If the available amount stays fixed and the plan is already fully allocated, increasing one item requires changing another. The opportunity cost is the best alternative the family gives up, not automatically the same choice for everyone.', 'यदि उपलब्ध राशि निश्चित है और योजना पूरी बँट चुकी है, तो एक मद बढ़ाने पर दूसरा बदलना होगा। अवसर-लागत परिवार के लिए छोड़ा गया सबसे अच्छा दूसरा विकल्प है; यह सभी के लिए एक जैसा नहीं होता।'),
  reset: b('Reset this household example', 'यह पारिवारिक उदाहरण रीसेट करें'),
  saved: b('Only the fictional amounts are kept in this browser until its data is cleared.', 'केवल काल्पनिक राशियाँ इसी ब्राउज़र में डेटा मिटने तक रहती हैं।'),
  blocked: b('Browser storage is blocked; this example will be lost on reload.', 'ब्राउज़र संग्रह बंद है; फिर लोड करने पर यह उदाहरण मिट जाएगा।'),
};
const money = (n) => `₹${fmt(n)}`;

export function createHouseholdBudget() {
  let S = store.simState('T08.householdBudget', initial());
  if (!S || typeof S !== 'object' || Array.isArray(S)) { store.resetSim('T08.householdBudget'); S = store.simState('T08.householdBudget', initial()); }
  if (!S.allocations || typeof S.allocations !== 'object' || Array.isArray(S.allocations)) S.allocations = {};
  for (const item of BUDGET_CATEGORIES) {
    const value = S.allocations[item.id];
    if (!Number.isInteger(value) || value < 0 || value > BUDGET || value % 50 !== 0) S.allocations[item.id] = item.initial;
  }
  S.surprise = S.surprise === true;
  const status = h('div', { class: 'civic-vote-result', role: 'status', 'aria-live': 'polite', 'data-t08-budget-result': '' });
  const storage = h('p', { class: 'civic-storage note', 'data-t08-budget-storage': '' });
  const inputs = new Map(), outputs = new Map();
  const rows = BUDGET_CATEGORIES.map((item) => {
    const id = `t08-budget-${item.id}`, labelId = `${id}-label`;
    const input = h('input', { type: 'range', id, 'data-t08-budget': item.id, class: 'range', min: 0, max: BUDGET, step: 50, value: S.allocations[item.id], 'aria-labelledby': labelId });
    const output = h('output', { for: id, class: 'range-val' });
    input.addEventListener('input', () => { S.allocations[item.id] = Number(input.value); save(); render(); });
    inputs.set(item.id, input); outputs.set(item.id, output);
    return h('div', { class: 'budget-row' }, h('div', { class: 'budget-row-heading' }, h('label', { id: labelId, for: id }, bi(item.name, { tag: 'span' })), output), input);
  });
  const surprise = h('input', { type: 'checkbox', id: 't08-budget-surprise', 'data-t08-budget-surprise': '' });
  surprise.checked = S.surprise;
  surprise.addEventListener('change', () => { S.surprise = surprise.checked; save(); render(); });
  const el = h('section', { class: 'civic-card household-budget', 'aria-labelledby': 't08-budget-title' },
    bi(C.kicker, { tag: 'p', cls: 'civic-kicker' }), bi(C.title, { tag: 'h3', cls: 'civic-title' }), bi(C.intro, { tag: 'p' }), bi(C.limits, { tag: 'p', cls: 'civic-limit' }),
    h('div', { class: 'budget-rows' }, ...rows), h('label', { class: 'budget-surprise', for: 't08-budget-surprise' }, surprise, bi(C.surprise, { tag: 'span' })), status,
    h('button', { type: 'button', class: 'btn', 'data-t08-budget-reset': '', onclick: () => { Object.assign(S, initial()); surprise.checked = false; inputs.forEach((input, id) => { input.value = S.allocations[id]; }); save(); render(); } }, bi(C.reset, { tag: 'span' })),
    bi(C.tradeoff, { tag: 'p', cls: 'civic-discussion' }), storage);
  el.querySelector('.civic-title').id = 't08-budget-title';
  function renderStorage() { const blocked = store.storageBlocked(); storage.classList.toggle('civic-warning', blocked); storage.replaceChildren(bi(blocked ? C.blocked : C.saved, { tag: 'span' })); }
  function save() { store.saveSim(); renderStorage(); }
  function render() {
    BUDGET_CATEGORIES.forEach((item) => { outputs.get(item.id).textContent = money(S.allocations[item.id]); });
    const r = householdBudget({ budget: BUDGET, allocations: BUDGET_CATEGORIES.map((item) => S.allocations[item.id]), extra: S.surprise ? 100 : 0 });
    const result = r.shortfall
      ? b(`${money(r.allocated)} allocated + ${money(r.extra)} unexpected = ${money(r.planned)} planned. This is ${money(r.shortfall)} over the ${money(BUDGET)} available; the shortfall is not automatically a loan.`, `${money(r.allocated)} बाँटे + ${money(r.extra)} अचानक = कुल ${money(r.planned)} की योजना। यह उपलब्ध ${money(BUDGET)} से ${money(r.shortfall)} अधिक है; कमी अपने आप ऋण नहीं है।`)
      : b(`${money(r.allocated)} allocated + ${money(r.extra)} unexpected = ${money(r.planned)} planned. ${money(r.unallocated)} remains unallocated from ${money(BUDGET)}.`, `${money(r.allocated)} बाँटे + ${money(r.extra)} अचानक = कुल ${money(r.planned)} की योजना। ${money(BUDGET)} में से ${money(r.unallocated)} अभी नहीं बाँटे गए हैं।`);
    status.classList.toggle('budget-shortfall', r.shortfall > 0);
    status.replaceChildren(bi(result, { tag: 'p', cls: 'civic-outcome' }));
  }
  render(); renderStorage();
  return { el, relabel() { relabelBi(el); render(); renderStorage(); }, destroy() {} };
}
