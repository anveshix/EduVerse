// T07.L4: build a proposed majority from the live fictional seat model.
import { h } from '../../core/dom.js';
import * as i18n from '../../core/i18n.js';
import * as store from '../../core/store.js';
import { bi, relabelBi } from '../../components/widgets.js';
import { PARTIES, run, coalitionStatus } from '../../engines/domain/election.js';

const b = (en, hi) => ({ en, hi });
export const COALITION_PARTIES = {
  R: b('Party R', 'दल R'), B: b('Party B', 'दल B'), G: b('Party G', 'दल G'), Y: b('Party Y', 'दल Y'),
};
const C = {
  kicker: b('NEGOTIATE THE NUMBERS', 'संख्याओं से समझें'),
  title: b('Build a fictional coalition', 'एक काल्पनिक गठबंधन बनाएँ'),
  intro: b('Select parties to combine their seats. The seat totals follow the system and swing controls below; when a party loses all its seats it is removed from the selection.', 'सीटें जोड़ने के लिए दल चुनें। कुल सीटें नीचे प्रणाली और झुकाव नियंत्रण से बदलती हैं; जिस दल की सारी सीटें चली जाएँ उसे चुनाव से हटा दिया जाता है।'),
  group: b('Select parties in the proposed coalition', 'प्रस्तावित गठबंधन के दल चुनें'),
  reset: b('Clear selected parties', 'चुने हुए दल हटाएँ'),
  limitation: b('Only seat arithmetic is modelled: it cannot predict negotiations, actual support, stability or who forms a government. A real parliamentary confidence vote depends on applicable rules and members present and voting.', 'यह केवल सीटों की गणना है: इससे वार्ता, वास्तविक समर्थन, स्थिरता या सरकार कौन बनाएगा इसका अनुमान नहीं लगता। वास्तविक संसदीय विश्वास मत लागू नियमों और उपस्थित व मतदान करने वाले सदस्यों पर निर्भर करता है।'),
  saved: b('Selected parties are stored only in this browser until its data is cleared.', 'चुने हुए दल केवल इसी ब्राउज़र में डेटा मिटने तक रहते हैं।'),
  blocked: b('Browser storage is blocked; this selection will be lost on reload.', 'ब्राउज़र संग्रह बंद है; फिर लोड करने पर चुनाव मिट जाएगा।'),
};
const text = (o) => i18n.pair(o.en, o.hi);

export function createCoalitionBuilder(initialLabState) {
  let S = store.simState('T07.coalitionBuilder', { selected: [] });
  if (!S || typeof S !== 'object' || Array.isArray(S)) { store.resetSim('T07.coalitionBuilder'); S = store.simState('T07.coalitionBuilder', { selected: [] }); }
  if (!Array.isArray(S.selected)) S.selected = [];
  S.selected = [...new Set(S.selected.filter((p) => PARTIES.includes(p)))];
  let labState = initialLabState;
  const status = h('div', { class: 'civic-vote-result', 'data-t07-coalition-result': '', role: 'status', 'aria-live': 'polite' });
  const storage = h('p', { class: 'civic-storage note', 'data-t07-coalition-storage': '' });
  const buttons = PARTIES.map((p) => h('button', { type: 'button', class: 'btn civic-choice', 'data-t07-party': p, 'aria-pressed': 'false',
    onclick: () => { S.selected = S.selected.includes(p) ? S.selected.filter((x) => x !== p) : [...S.selected, p]; save(); render(); } }));
  const group = h('div', { class: 'civic-choices', role: 'group', 'aria-label': text(C.group) }, ...buttons);
  const el = h('section', { class: 'civic-card election-coalition', 'aria-labelledby': 't07-coalition-title' },
    bi(C.kicker, { tag: 'p', cls: 'civic-kicker' }), bi(C.title, { tag: 'h3', cls: 'civic-title' }), bi(C.intro, { tag: 'p' }),
    group, status, h('button', { type: 'button', class: 'btn', 'data-t07-coalition-reset': '', onclick: () => { S.selected = []; save(); render(); } }, bi(C.reset, { tag: 'span' })),
    bi(C.limitation, { tag: 'p', cls: 'civic-limit' }), storage);
  el.querySelector('.civic-title').id = 't07-coalition-title';
  function renderStorage() { const blocked = store.storageBlocked(); storage.classList.toggle('civic-warning', blocked); storage.replaceChildren(bi(blocked ? C.blocked : C.saved, { tag: 'span' })); }
  function save() { store.saveSim(); renderStorage(); }
  function render() {
    const seats = run(labState.system, labState.swing).seats;
    const selected = S.selected.filter((p) => seats[p] > 0);
    if (selected.length !== S.selected.length) { S.selected = selected; save(); }
    buttons.forEach((btn, i) => {
      const p = PARTIES[i], count = seats[p];
      btn.disabled = count === 0;
      btn.setAttribute('aria-pressed', String(S.selected.includes(p)));
      btn.replaceChildren(bi(b(`${COALITION_PARTIES[p].en}: ${count} seat${count === 1 ? '' : 's'}`, `${COALITION_PARTIES[p].hi}: ${count} सीटें`), { tag: 'span' }));
    });
    const r = coalitionStatus(seats, S.selected);
    let verdict;
    if (!r.majority) verdict = b(`${r.support} of ${r.total} seats selected. ${r.need} needed for a majority of the whole house; ${r.need - r.support} more needed.`, `${r.total} में से ${r.support} सीटें चुनीं। पूरे सदन के बहुमत के लिए ${r.need} चाहिए; ${r.need - r.support} और चाहिए।`);
    else if (r.minimal) verdict = b(`${r.support} of ${r.total} seats: a minimal winning set. Removing any selected party would lose this majority.`, `${r.total} में से ${r.support} सीटें: न्यूनतम विजयी समूह। किसी भी चुने दल को हटाने पर यह बहुमत समाप्त होगा।`);
    else {
      const en = r.surplus.map((p) => COALITION_PARTIES[p].en).join(', '), hi = r.surplus.map((p) => COALITION_PARTIES[p].hi).join(', ');
      verdict = b(`${r.support} of ${r.total} seats: a majority. Removing any one of ${en} still leaves a majority; this set is not minimal.`, `${r.total} में से ${r.support} सीटें: बहुमत। ${hi} में से किसी एक को हटाने पर भी बहुमत रहता है; यह समूह न्यूनतम नहीं है।`);
    }
    status.replaceChildren(bi(verdict, { tag: 'p', cls: 'civic-outcome' }));
  }
  render(); renderStorage();
  return { el, update(state) { labState = state; render(); }, relabel() { group.setAttribute('aria-label', text(C.group)); relabelBi(el); render(); renderStorage(); }, destroy() {} };
}
