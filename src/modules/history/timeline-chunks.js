// T05.L1: three dated examples linked to the existing map, not an exhaustive history.
import { h } from '../../core/dom.js';
import * as i18n from '../../core/i18n.js';
import { bi, relabelBi } from '../../components/widgets.js';

const b = (en, hi) => ({ en, hi });
export const TIMELINE_CHUNKS = [
  {
    id: 'maurya', label: b('Mauryas', 'मौर्य'), dates: b('c. 321–185 BCE', 'लगभग 321–185 ई.पू.'),
    evidence: b('Ashoka’s rock and pillar inscriptions from the third century BCE record messages of dhamma. Pataliputra was a Mauryan centre.', 'तीसरी शताब्दी ई.पू. के अशोक के शिला और स्तंभ अभिलेख धम्म के संदेश दर्ज करते हैं। पाटलिपुत्र मौर्य शासन का एक केंद्र था।'),
    limit: b('An edict tells us what a ruler chose to announce, not whether every person followed it. Different areas were governed in different ways.', 'अभिलेख बताता है कि शासक ने क्या घोषित किया, यह नहीं कि सबने उसका पालन किया। अलग क्षेत्रों में शासन अलग तरह से हुआ।'),
    question: b('What other source might help you investigate how a royal message was received?', 'शाही संदेश लोगों तक कैसे पहुँचा, यह जानने के लिए आप कौन-सा दूसरा स्रोत देखेंगे?'),
  },
  {
    id: 'gupta', label: b('Guptas', 'गुप्त'), dates: b('c. 320–550 CE', 'लगभग 320–550 ई.'),
    evidence: b('The Prayaga Prashasti praises Samudragupta; Gupta-period copper-plate grants provide another kind of record.', 'प्रयाग प्रशस्ति समुद्रगुप्त की प्रशंसा करती है; गुप्तकालीन ताम्रपत्र अनुदान दूसरे प्रकार का अभिलेख देते हैं।'),
    limit: b('A court-composed eulogy is valuable evidence of royal claims, not a neutral account. The map groups later Harsha separately within a wider time window.', 'दरबार की प्रशस्ति शाही दावों का महत्त्वपूर्ण प्रमाण है, निष्पक्ष विवरण नहीं। मानचित्र एक बड़े काल-अंतराल में बाद के हर्ष को अलग भी दिखाता है।'),
    question: b('What would you compare with a royal eulogy before drawing a conclusion about control?', 'नियंत्रण का निष्कर्ष निकालने से पहले शाही प्रशस्ति की तुलना किससे करेंगे?'),
  },
  {
    id: 'chola1000', label: b('Later Cholas', 'बाद के चोल'), dates: b('c. 850–1000 CE shown', 'लगभग 850–1000 ई. तक दिखाया'),
    evidence: b('The tenth-century Uttaramerur inscriptions record rules for selecting some village committee members by lot from eligible candidates.', 'दसवीं शताब्दी के उत्तरमेरूर अभिलेख कुछ ग्राम समितियों के पात्र उम्मीदवारों में से पर्ची द्वारा चयन के नियम दर्ज करते हैं।'),
    limit: b('Eligibility was restricted; this was not universal adult suffrage. The later Chola polity continued beyond the chapter’s 1000 CE cutoff, and earlier Cholas also existed.', 'पात्रता सीमित थी; यह सभी वयस्कों का समान मताधिकार नहीं था। बाद का चोल राज्य अध्याय की 1000 ई. सीमा के बाद भी रहा और उससे पहले भी चोल थे।'),
    question: b('Whose participation might a selection rule include or exclude?', 'चयन का कोई नियम किन लोगों को शामिल या बाहर कर सकता है?'),
  },
];
const C = {
  kicker: b('THREE WINDOWS INTO A LONG HISTORY', 'लंबे इतिहास की तीन झलकियाँ'),
  title: b('Mauryas, Guptas and later Cholas', 'मौर्य, गुप्त और बाद के चोल'),
  intro: b('Choose one window to update the map below. The map controls, picture pins and prediction also update this timeline.', 'नीचे का मानचित्र बदलने के लिए एक झलक चुनें। मानचित्र के नियंत्रण, चित्र के पिन और अनुमान भी समय-रेखा बदलते हैं।'),
  group: b('Historical timeline windows', 'इतिहास की समय-रेखा के कालखंड'),
  other: b('The map currently shows an earlier period. Choose a window above to compare these three examples.', 'मानचित्र अभी पहले का काल दिखा रहा है। इन तीन उदाहरणों की तुलना के लिए ऊपर एक झलक चुनें।'),
  evidence: b('A source to investigate', 'जाँच के लिए एक स्रोत'),
  limit: b('What it cannot tell us alone', 'यह अकेले क्या नहीं बताता'),
  question: b('Ask next', 'अगला प्रश्न'),
  note: b('Dates are approximate; the windows are not evenly spaced. BCE years count backwards. These are examples from different regions, not a single succession of rulers over all India.', 'तिथियाँ अनुमानित हैं; कालखंडों के बीच अंतर बराबर नहीं है। ई.पू. की गिनती उलटी चलती है। ये अलग क्षेत्रों के उदाहरण हैं, पूरे भारत पर शासकों का एक ही उत्तराधिकार नहीं।'),
  source: b('NCERT: State and Society up to 1000 CE (internet needed)', 'NCERT: 1000 ई. तक राज्य और समाज (इंटरनेट आवश्यक)'),
};
const text = (o) => i18n.pair(o.en, o.hi);

export function createHistoryTimeline(model, { onSelect } = {}) {
  let active = model?.era || '', last = null;
  const detail = h('div', { class: 'history-timeline-detail', 'data-t05-timeline-detail': '', 'aria-live': 'polite' });
  const buttons = TIMELINE_CHUNKS.map((chunk, i) => h('button', {
    type: 'button', class: 'btn history-timeline-button', 'data-t05-era': chunk.id, 'aria-pressed': 'false',
    onclick: () => onSelect?.(chunk.id),
  }, h('span', { class: 'history-timeline-number', 'aria-hidden': 'true' }, String(i + 1)),
  h('span', { class: 'history-timeline-label' }, bi(chunk.label, { tag: 'strong' }), bi(chunk.dates, { tag: 'span' }))));
  const group = h('div', { class: 'history-timeline-steps', role: 'group', 'aria-label': text(C.group) }, ...buttons);
  const el = h('section', { class: 'history-timeline', 'aria-labelledby': 't05-timeline-title' },
    bi(C.kicker, { tag: 'p', cls: 'history-kicker' }), bi(C.title, { tag: 'h3', cls: 'history-timeline-title' }),
    bi(C.intro, { tag: 'p', cls: 'history-intro' }), group, detail, bi(C.note, { tag: 'p', cls: 'history-limit' }),
    h('a', { class: 'history-source', href: 'https://ncert.nic.in/textbook/pdf/iest105.pdf', target: '_blank', rel: 'noopener noreferrer' }, bi(C.source, { tag: 'span' })));
  el.querySelector('.history-timeline-title').id = 't05-timeline-title';
  function render(force = false) {
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.t05Era === active)));
    if (!force && last === active) return;
    last = active;
    const chunk = TIMELINE_CHUNKS.find((item) => item.id === active);
    if (!chunk) { detail.replaceChildren(bi(C.other, { tag: 'p' })); return; }
    detail.replaceChildren(bi(chunk.label, { tag: 'h4' }), bi(chunk.dates, { tag: 'p', cls: 'history-date' }),
      ...[['evidence', C.evidence], ['limit', C.limit], ['question', C.question]].map(([key, title]) =>
        h('div', { class: 'history-timeline-item', 'data-t05-field': key }, bi(title, { tag: 'strong' }), bi(chunk[key], { tag: 'p' }))));
  }
  function update(next) { active = next?.era || ''; render(); }
  render();
  return { el, update, relabel() { group.setAttribute('aria-label', text(C.group)); relabelBi(el); render(true); }, destroy() {} };
}
