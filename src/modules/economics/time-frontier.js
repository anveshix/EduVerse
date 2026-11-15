// T08.L2: a deliberately simple everyday opportunity-cost comparison.
import { h } from '../../core/dom.js';
import * as store from '../../core/store.js';
import { bi, relabelBi } from '../../components/widgets.js';

const b = (en, hi) => ({ en, hi });
export const TIME_SLOTS = 4; // four half-hour slots, all allocated to one of two fictional uses
const C = {
  kicker: b('FROM A FARM TO YOUR DAY', 'खेत से रोज़मर्रा तक'),
  title: b('Two hours, two possible uses', 'दो घंटे, दो संभावित उपयोग'),
  intro: b('Imagine two free hours divided between a project and play or rest. Move one 30-minute slot at a time. This is a simple comparison, not a timetable to follow.', 'दो खाली घंटों को एक परियोजना और खेल या आराम के बीच बाँटने की कल्पना करें। एक बार में 30 मिनट बदलें। यह सरल तुलना है, पालन करने की समय-सारणी नहीं।'),
  more: b('Move 30 minutes to project', '30 मिनट परियोजना को दें'),
  less: b('Move 30 minutes to play or rest', '30 मिनट खेल या आराम को दें'),
  limit: b('In this two-choice example, every extra half-hour on the project gives up half an hour of play or rest. It is a straight-line time trade-off, unlike the curved farm example below. Real choices may include other activities; rest matters too.', 'इस दो-विकल्प उदाहरण में परियोजना का हर अतिरिक्त आधा घंटा खेल या आराम का आधा घंटा छोड़ता है। यह सीधी समय-अदला-बदली है, नीचे के मुड़े कृषि वक्र से अलग। वास्तविक चुनावों में अन्य काम भी हो सकते हैं; आराम भी महत्त्वपूर्ण है।'),
  reset: b('Reset time example', 'समय उदाहरण रीसेट करें'),
  saved: b('The example choice stays in this browser until its data is cleared.', 'उदाहरण का चुनाव इसी ब्राउज़र में डेटा मिटने तक रहता है।'),
  blocked: b('Browser storage is blocked; this example will be lost on reload.', 'ब्राउज़र संग्रह बंद है; फिर लोड करने पर यह उदाहरण मिट जाएगा।'),
};
export function timeAllocation(slots) {
  if (!Number.isInteger(slots) || slots < 0 || slots > TIME_SLOTS) return { valid: false };
  return { valid: true, projectMinutes: slots * 30, restMinutes: (TIME_SLOTS - slots) * 30 };
}
export function createTimeFrontier() {
  let S = store.simState('T08.timeFrontier', { slots: 2 });
  if (!S || typeof S !== 'object' || Array.isArray(S)) { store.resetSim('T08.timeFrontier'); S = store.simState('T08.timeFrontier', { slots: 2 }); }
  if (!timeAllocation(S.slots).valid) S.slots = 2;
  const status = h('div', { class: 'civic-vote-result', 'data-t08-time-result': '', role: 'status', 'aria-live': 'polite' });
  const bar = h('div', { class: 'time-slots', 'aria-hidden': 'true' });
  const storage = h('p', { class: 'civic-storage note', 'data-t08-time-storage': '' });
  const more = h('button', { type: 'button', class: 'btn', 'data-t08-time-more': '', onclick: () => { if (S.slots < TIME_SLOTS) { S.slots++; save(); render(); } } }, bi(C.more, { tag: 'span' }));
  const less = h('button', { type: 'button', class: 'btn', 'data-t08-time-less': '', onclick: () => { if (S.slots > 0) { S.slots--; save(); render(); } } }, bi(C.less, { tag: 'span' }));
  const el = h('section', { class: 'civic-card time-frontier', 'aria-labelledby': 't08-time-title' },
    bi(C.kicker, { tag: 'p', cls: 'civic-kicker' }), bi(C.title, { tag: 'h3', cls: 'civic-title' }), bi(C.intro, { tag: 'p' }), bar, status,
    h('div', { class: 'civic-choices' }, more, less, h('button', { type: 'button', class: 'btn', 'data-t08-time-reset': '', onclick: () => { S.slots = 2; save(); render(); } }, bi(C.reset, { tag: 'span' }))),
    bi(C.limit, { tag: 'p', cls: 'civic-limit' }), storage);
  el.querySelector('.civic-title').id = 't08-time-title';
  function renderStorage() { const blocked = store.storageBlocked(); storage.classList.toggle('civic-warning', blocked); storage.replaceChildren(bi(blocked ? C.blocked : C.saved, { tag: 'span' })); }
  function save() { store.saveSim(); renderStorage(); }
  function render() {
    const result = timeAllocation(S.slots);
    more.disabled = S.slots === TIME_SLOTS; less.disabled = S.slots === 0;
    bar.replaceChildren(...Array.from({ length: TIME_SLOTS }, (_, i) => h('div', { class: `time-slot ${i < S.slots ? 'project' : 'rest'}` }, bi(i < S.slots ? b('Project', 'परियोजना') : b('Play / rest', 'खेल / आराम'), { tag: 'span' }))));
    status.replaceChildren(bi(b(`Project: ${result.projectMinutes} minutes. Play or rest: ${result.restMinutes} minutes. Total: 120 minutes.`, `परियोजना: ${result.projectMinutes} मिनट। खेल या आराम: ${result.restMinutes} मिनट। कुल: 120 मिनट।`), { tag: 'p', cls: 'civic-outcome' }));
  }
  render(); renderStorage();
  return { el, relabel() { relabelBi(el); render(); renderStorage(); }, destroy() {} };
}
