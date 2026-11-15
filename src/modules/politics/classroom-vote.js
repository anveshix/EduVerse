// T06.L1: explore a fictional tally, not a secure voting system.
import { h } from '../../core/dom.js';
import * as i18n from '../../core/i18n.js';
import * as store from '../../core/store.js';
import { bi, relabelBi } from '../../components/widgets.js';
import { classroomVoteTally } from '../../engines/domain/society.js';

const b = (en, hi) => ({ en, hi });
export const CLASSROOM_SIZE = 12;
export const CLASSROOM_PROPOSALS = [
  { id: 'books', title: b('Reading corner', 'पठन कोना') },
  { id: 'garden', title: b('Plant corner', 'पौधों का कोना') },
  { id: 'games', title: b('Games box', 'खेल सामग्री') },
];
const C = {
  kicker: b('PRACTISE A DECISION', 'निर्णय का अभ्यास'),
  title: b('A classroom vote, imagined', 'कक्षा में मतदान का काल्पनिक अभ्यास'),
  intro: b('Imagine 12 eligible students choose one of three class projects. Add or remove example votes to explore what the count can—and cannot—tell you.', 'मानें कि 12 पात्र विद्यार्थी तीन कक्षा योजनाओं में से एक चुनते हैं। उदाहरण मत जोड़ें या घटाएँ और देखें कि गिनती क्या बता सकती है और क्या नहीं।'),
  safe: b('This is a toy tally, not a ballot box: it cannot check who voted, ensure secrecy or prevent repeat votes. Do not enter real names or use it to run an actual election.', 'यह केवल काल्पनिक गिनती है, मतपेटी नहीं: यह नहीं जाँच सकती कि किसने मत दिया, गोपनीयता सुनिश्चित नहीं करती और बार-बार मत रोक नहीं सकती। असली नाम न डालें और वास्तविक चुनाव के लिए इसका उपयोग न करें।'),
  discussion: b('Before a real class decision, discuss choices fairly, agree on a rule for ties, allow abstention, protect private choices and hear different voices. A majority cannot take away anyone’s rights.', 'कक्षा के असली निर्णय से पहले विकल्पों पर निष्पक्ष चर्चा, बराबरी की स्थिति का नियम, मत न देने की स्वतंत्रता, गोपनीय चुनाव और अलग आवाज़ों को सुनना तय करें। बहुमत किसी के अधिकार नहीं छीन सकता।'),
  add: b('Add one example vote for', 'एक उदाहरण मत जोड़ें:'), remove: b('Remove one example vote for', 'एक उदाहरण मत घटाएँ:'),
  reset: b('Reset this tally', 'केवल यह गिनती रीसेट करें'),
  storage: b('Only the example totals are stored in this browser until its data is cleared.', 'केवल उदाहरण की कुल संख्याएँ इसी ब्राउज़र में डेटा मिटने तक रहती हैं।'),
  temporary: b('Browser storage is blocked; example totals will be lost on reload.', 'ब्राउज़र संग्रह बंद है; फिर लोड करने पर उदाहरण संख्याएँ हट जाएँगी।'),
};
const text = (o) => i18n.pair(o.en, o.hi);

export function createClassroomVote() {
  let state = store.simState('T06.classroomVote', { counts: [0, 0, 0] });
  if (!state || typeof state !== 'object' || Array.isArray(state)) {
    store.resetSim('T06.classroomVote'); state = store.simState('T06.classroomVote', { counts: [0, 0, 0] });
  }
  if (!Array.isArray(state.counts) || state.counts.length !== CLASSROOM_PROPOSALS.length || !classroomVoteTally(CLASSROOM_SIZE, state.counts).valid) state.counts = [0, 0, 0];
  const status = h('div', { class: 'civic-vote-result', role: 'status', 'aria-live': 'polite', 'data-t06-vote-result': '' });
  const storage = h('p', { class: 'civic-storage note', 'data-t06-vote-storage': '' });
  const controls = [];
  const rows = CLASSROOM_PROPOSALS.map((proposal, index) => {
    const name = bi(proposal.title, { tag: 'strong' });
    const count = h('output', { class: 'civic-vote-count', 'data-t06-vote-count': proposal.id });
    const minus = h('button', { type: 'button', class: 'btn civic-vote-step', 'data-t06-vote-minus': proposal.id,
      onclick: () => { if (state.counts[index] > 0) { state.counts[index]--; save(); render(); } } }, '−');
    const plus = h('button', { type: 'button', class: 'btn civic-vote-step', 'data-t06-vote-plus': proposal.id,
      onclick: () => { if (classroomVoteTally(CLASSROOM_SIZE, state.counts).uncounted > 0) { state.counts[index]++; save(); render(); } } }, '+');
    controls.push({ proposal, index, minus, plus, count });
    return h('div', { class: 'civic-vote-row' }, name, h('div', { class: 'civic-vote-controls' }, minus, count, plus));
  });
  const el = h('section', { class: 'civic-card civic-vote', 'aria-labelledby': 't06-vote-title' },
    bi(C.kicker, { tag: 'p', cls: 'civic-kicker' }), bi(C.title, { tag: 'h3', cls: 'civic-title' }),
    bi(C.intro, { tag: 'p' }), bi(C.safe, { tag: 'p', cls: 'civic-limit' }),
    h('div', { class: 'civic-vote-rows' }, ...rows), status,
    h('button', { type: 'button', class: 'btn', 'data-t06-vote-reset': '', onclick: () => { state.counts = [0, 0, 0]; save(); render(); } }, bi(C.reset, { tag: 'span' })),
    bi(C.discussion, { tag: 'p', cls: 'civic-discussion' }), storage);
  el.querySelector('.civic-title').id = 't06-vote-title';
  function renderStorage() {
    const blocked = store.storageBlocked();
    storage.classList.toggle('civic-warning', blocked);
    storage.replaceChildren(bi(blocked ? C.temporary : C.storage, { tag: 'span' }));
  }
  function save() { store.saveSim(); renderStorage(); }
  function render() {
    const tally = classroomVoteTally(CLASSROOM_SIZE, state.counts);
    controls.forEach(({ proposal, index, plus, minus, count }) => {
      count.textContent = String(state.counts[index]);
      count.setAttribute('aria-label', text(b(`${proposal.title.en}: ${state.counts[index]} example votes`, `${proposal.title.hi}: ${state.counts[index]} उदाहरण मत`)));
      minus.setAttribute('aria-label', `${text(C.remove)} ${text(proposal.title)}`);
      plus.setAttribute('aria-label', `${text(C.add)} ${text(proposal.title)}`);
      minus.disabled = state.counts[index] === 0; plus.disabled = tally.uncounted === 0;
    });
    let outcome;
    if (tally.outcome === 'none') outcome = b('No votes counted yet; no winner.', 'अभी कोई मत नहीं गिना गया; कोई विजेता नहीं।');
    else if (tally.outcome === 'tie') {
      const en = tally.leaders.map((i) => CLASSROOM_PROPOSALS[i].title.en).join(', '), hi = tally.leaders.map((i) => CLASSROOM_PROPOSALS[i].title.hi).join(', ');
      outcome = b(`Tie for the most votes: ${en}. No winner is declared; discuss a tie rule.`, `सबसे अधिक मत बराबर: ${hi}। कोई विजेता घोषित नहीं; बराबरी के नियम पर चर्चा करें।`);
    } else {
      const winner = CLASSROOM_PROPOSALS[tally.leaders[0]], n = state.counts[tally.leaders[0]];
      outcome = b(`${winner.title.en} has the most: ${n} of ${tally.cast} counted votes. ${tally.majorityOfCast ? 'That is more than half of votes counted.' : 'That is not more than half of votes counted.'} ${n * 2 > CLASSROOM_SIZE ? 'It is also more than half of the 12 eligible students.' : 'It is not more than half of the 12 eligible students.'}`,
        `${winner.title.hi} को सबसे अधिक: गिने गए ${tally.cast} में से ${n} मत। ${tally.majorityOfCast ? 'यह गिने गए मतों के आधे से अधिक है।' : 'यह गिने गए मतों के आधे से अधिक नहीं है।'} ${n * 2 > CLASSROOM_SIZE ? 'यह 12 पात्र विद्यार्थियों के भी आधे से अधिक है।' : 'यह 12 पात्र विद्यार्थियों के आधे से अधिक नहीं है।'}`);
    }
    const participation = b(`${tally.cast} of ${CLASSROOM_SIZE} example votes counted; ${tally.uncounted} not counted. This could mean absent, abstaining or not yet recorded.`, `${CLASSROOM_SIZE} में से ${tally.cast} उदाहरण मत गिने; ${tally.uncounted} नहीं गिने। वे अनुपस्थित, मत से विरत या अभी दर्ज न हुए हो सकते हैं।`);
    status.replaceChildren(bi(outcome, { tag: 'p', cls: 'civic-outcome' }), bi(participation, { tag: 'p', cls: 'civic-participation' }));
  }
  render(); renderStorage();
  return { el, relabel() { relabelBi(el); render(); renderStorage(); }, destroy() {} };
}
