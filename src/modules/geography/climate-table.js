// Accessible tabular alternative to the T03.L2 illustrative climograph.
import { h } from '../../core/dom.js';
import * as i18n from '../../core/i18n.js';
import { bi, relabelBi } from '../../components/widgets.js';
import { stationSummary } from '../../engines/domain/atmosphere.js';

const b = (en, hi) => ({ en, hi });
export const MONTH_NAMES = [
  b('January', 'जनवरी'), b('February', 'फ़रवरी'), b('March', 'मार्च'), b('April', 'अप्रैल'),
  b('May', 'मई'), b('June', 'जून'), b('July', 'जुलाई'), b('August', 'अगस्त'),
  b('September', 'सितंबर'), b('October', 'अक्टूबर'), b('November', 'नवंबर'), b('December', 'दिसंबर'),
];
const C = {
  title: b('View the 12 monthly values as a table', '12 मासिक मान तालिका में देखें'),
  note: b('These are the same illustrative values as the graph, not official station records or climate normals.', 'ये आरेख के वही उदाहरणात्मक मान हैं, आधिकारिक केंद्र प्रेक्षण या जलवायु औसत नहीं।'),
  region: b('Illustrative monthly climate table; scroll sideways if needed', 'उदाहरणात्मक मासिक जलवायु तालिका; आवश्यकता हो तो बाएँ-दाएँ खिसकाएँ'),
  month: b('Month', 'माह'),
  rain: b('Primary rain (mm)', 'मुख्य वर्षा (मिमी)'),
  primary: b('Primary temp (°C)', 'मुख्य तापमान (°C)'),
  compare: b('Comparison temp (°C)', 'तुलना तापमान (°C)'),
};
const text = (o) => i18n.pair(o.en, o.hi);

export function createClimateTable(initialState) {
  let state = initialState;
  const caption = h('caption', { 'data-climate-caption': '' });
  const body = h('tbody');
  const headers = [C.month, C.rain, C.primary, C.compare].map((copy) => h('th', { scope: 'col' }, bi(copy, { tag: 'span' })));
  const table = h('table', {}, caption, h('thead', {}, h('tr', {}, ...headers)), body);
  const scroll = h('div', { class: 'climate-table-scroll', role: 'region', tabindex: '0', 'aria-label': text(C.region) }, table);
  const el = h('details', { class: 'climate-data' }, bi(C.title, { tag: 'summary' }), bi(C.note, { tag: 'p', cls: 'note' }), scroll);

  function update(next) {
    state = next;
    const primary = stationSummary(state?.station), compare = stationSummary(state?.compare);
    caption.replaceChildren(bi(b(`Illustrative monthly values: ${primary.en} and ${compare.en}`, `उदाहरणात्मक मासिक मान: ${primary.hi} और ${compare.hi}`), { tag: 'span' }));
    body.replaceChildren(...MONTH_NAMES.map((month, i) => h('tr', {},
      h('th', { scope: 'row' }, bi(month, { tag: 'span' })),
      h('td', {}, String(primary.rain[i])), h('td', {}, String(primary.temp[i])), h('td', {}, String(compare.temp[i])))));
  }
  update(initialState);
  return {
    el, update,
    relabel() { relabelBi(el); scroll.setAttribute('aria-label', text(C.region)); update(state); },
    destroy() {},
  };
}
