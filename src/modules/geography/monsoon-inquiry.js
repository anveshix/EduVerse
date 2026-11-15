// T03.L3: a conceptual causal sequence linked to the existing map, not a weather forecast.
import { h } from '../../core/dom.js';
import * as i18n from '../../core/i18n.js';
import * as store from '../../core/store.js';
import { bi, relabelBi } from '../../components/widgets.js';

const b = (en, hi) => ({ en, hi });
export const MONSOON_STAGES = [
  {
    id: 'heat', season: 'sw', label: b('Heat & pressure', 'तापन और दाब'),
    chain: [b('Land heats faster', 'थल जल्दी गर्म'), b('Relative low pressure', 'अपेक्षाकृत निम्न दाब'), b('Convergence shifts north', 'अभिसरण उत्तर की ओर')],
    body: b('In summer, land generally heats faster than the nearby ocean. Rising air and relatively low surface pressure develop over northern and northwestern India. The inter-tropical convergence zone (ITCZ), where winds meet and air rises, shifts north toward the subcontinent.', 'गर्मी में थल सामान्यतः पास के समुद्र से जल्दी गर्म होता है। उत्तरी और उत्तर-पश्चिमी भारत में हवा ऊपर उठती है और सतह पर अपेक्षाकृत निम्न दाब बनता है। अंतर-उष्णकटिबंधीय अभिसरण क्षेत्र (ITCZ), जहाँ पवनें मिलती हैं और वायु ऊपर उठती है, उपमहाद्वीप की ओर उत्तर खिसकता है।'),
    question: b('Why might air move from the ocean toward a region of lower pressure over land?', 'समुद्र की वायु थल पर निम्न दाब वाले क्षेत्र की ओर क्यों चल सकती है?'),
  },
  {
    id: 'crossing', season: 'sw', label: b('Cross the equator', 'विषुवत रेखा पार'),
    chain: [b('Southeast trades', 'दक्षिण-पूर्व व्यापारिक पवनें'), b('Cross the equator', 'विषुवत रेखा पार'), b('Become southwesterly winds', 'दक्षिण-पश्चिमी पवनें')],
    body: b('Air from the southern Indian Ocean moves toward the low-pressure region and crosses the equator. In the Northern Hemisphere Earth’s rotation deflects moving air to the right (the Coriolis effect), helping produce southwesterly surface winds. The ocean supplies moisture.', 'दक्षिणी हिंद महासागर से वायु निम्न दाब की ओर चलकर विषुवत रेखा पार करती है। उत्तरी गोलार्ध में पृथ्वी का घूर्णन चलती वायु को दाईं ओर मोड़ता है (कोरिऑलिस प्रभाव); इससे दक्षिण-पश्चिमी सतही पवनें बनने में मदद मिलती है। समुद्र से नमी मिलती है।'),
    question: b('Which two ingredients are needed for this part of the story: moving air and what source of moisture?', 'इस भाग में दो चीज़ें आवश्यक हैं: चलती वायु और नमी का कौन-सा स्रोत?'),
  },
  {
    id: 'branches', season: 'sw', label: b('Branches & relief', 'शाखाएँ और उच्चावच'),
    chain: [b('Moist SW winds', 'नम दक्षिण-पश्चिमी पवनें'), b('Arabian Sea + Bay branches', 'अरब सागर + खाड़ी शाखाएँ'), b('Relief changes rain', 'उच्चावच से वर्षा में अंतर')],
    body: b('The Arabian Sea branch rises over the Western Ghats: windward slopes can receive heavy rain, while parts of the leeward Deccan are drier. The Bay of Bengal branch reaches the northeast; the Himalaya helps steer air west along the Ganga plain, including Bihar. Local rainfall varies.', 'अरब सागर की शाखा पश्चिमी घाट पर ऊपर उठती है: पवनमुखी ढाल पर भारी वर्षा हो सकती है, जबकि विमुख दक्कन के कुछ भाग अधिक शुष्क रहते हैं। बंगाल की खाड़ी की शाखा पूर्वोत्तर पहुँचती है; हिमालय वायु को बिहार सहित गंगा के मैदान में पश्चिम की ओर मोड़ने में मदद करता है। स्थानीय वर्षा बदलती रहती है।'),
    question: b('Compare Konkan with the Deccan rain shadow. Why can two places near the same mountains receive different rain?', 'कोंकण और दक्कन की वृष्टि-छाया की तुलना करें। एक ही पर्वत के पास दो स्थानों पर वर्षा अलग क्यों हो सकती है?'),
  },
  {
    id: 'retreat', season: 'ne', label: b('Reversal & regions', 'वापसी और क्षेत्र'),
    chain: [b('Land cools; winds reverse', 'थल ठंडा; पवनें उलटतीं'), b('Winds cross the Bay', 'पवनें खाड़ी पार करतीं'), b('Rain on Tamil Nadu coast', 'तमिलनाडु तट पर वर्षा')],
    body: b('As the southwest monsoon withdraws, winds tend to reverse toward northeast flow. Some cross the Bay of Bengal and carry moisture to Tamil Nadu in October–December. Bihar generally receives much of its annual rain in June–September; Tamil Nadu receives a substantial later share. Neither pattern describes every day or every year.', 'दक्षिण-पश्चिम मानसून की वापसी पर पवनों की दिशा प्रायः बदलकर उत्तर-पूर्वी हो जाती है। कुछ पवनें बंगाल की खाड़ी पार कर अक्टूबर–दिसंबर में तमिलनाडु तक नमी लाती हैं। बिहार में सामान्यतः वार्षिक वर्षा का बड़ा भाग जून–सितंबर में और तमिलनाडु में एक महत्वपूर्ण भाग बाद में मिलता है। यह हर दिन या हर वर्ष का नियम नहीं है।'),
    question: b('Why is a wet week in Bihar not enough to predict the same week on the Tamil Nadu coast?', 'बिहार में एक वर्षा-भरा सप्ताह तमिलनाडु तट पर उसी सप्ताह का पूर्वानुमान लगाने के लिए पर्याप्त क्यों नहीं है?'),
  },
];
const C = {
  kicker: b('FOLLOW CAUSE AND EFFECT', 'कारण और परिणाम समझें'),
  title: b('How does the monsoon work?', 'मानसून कैसे काम करता है?'),
  intro: b('Choose a step. The seasonal map below follows your choice; changing the map’s season also changes this explanation.', 'एक चरण चुनें। नीचे का मौसमी मानचित्र आपके चुनाव के अनुसार बदलेगा; मानचित्र की ऋतु बदलने पर व्याख्या भी बदलेगी।'),
  group: b('Monsoon mechanism steps', 'मानसून प्रक्रिया के चरण'),
  think: b('Think and explain', 'सोचें और समझाएँ'),
  note: b('A simplified seasonal model, not live weather or a forecast. Onset, breaks, withdrawal and rainfall vary by place and year; upper-air circulation and ocean conditions matter too. Map arrows and coloured states are schematic, not measurements.', 'यह एक सरल मौसमी मॉडल है, वास्तविक मौसम या पूर्वानुमान नहीं। आगमन, विराम, वापसी और वर्षा स्थान व वर्ष के अनुसार बदलते हैं; ऊपरी वायु परिसंचरण और समुद्री दशाएँ भी महत्त्वपूर्ण हैं। मानचित्र के तीर और रंगे राज्य योजनाबद्ध हैं, माप नहीं।'),
  ncert: b('NCERT Class IX Climate (2019 edition, reproduced)', 'NCERT कक्षा IX जलवायु (2019 संस्करण, पुनर्प्रकाशित)'),
  imd: b('IMD: normal monsoon dates and their variability', 'IMD: मानसून की सामान्य तिथियाँ और परिवर्तनशीलता'),
};
const text = (o) => i18n.pair(o.en, o.hi);

export function createMonsoonInquiry({ season = 'sw', onSeason } = {}) {
  let state = store.simState('T03.monsoonInquiry', { stage: season === 'ne' ? 'retreat' : 'heat' });
  if (!state || typeof state !== 'object' || Array.isArray(state)) {
    store.resetSim('T03.monsoonInquiry');
    state = store.simState('T03.monsoonInquiry', { stage: 'heat' });
  }
  if (!MONSOON_STAGES.some((s) => s.id === state.stage)) state.stage = 'heat';
  const detail = h('div', { class: 'monsoon-detail', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true', 'data-monsoon-detail': '' });
  const buttons = MONSOON_STAGES.map((stage, i) => h('button', {
    type: 'button', class: 'btn monsoon-step', 'data-monsoon-step': stage.id, 'aria-pressed': 'false',
    onclick: () => {
      state.stage = stage.id; store.saveSim(); render(); onSeason?.(stage.season);
    },
  }, h('span', { class: 'monsoon-step-number', 'aria-hidden': 'true' }, String(i + 1)), bi(stage.label, { tag: 'span' })));
  const group = h('div', { class: 'monsoon-steps', role: 'group', 'aria-label': text(C.group) }, ...buttons);
  const el = h('section', { class: 'monsoon-inquiry', 'aria-labelledby': 'monsoon-inquiry-title' },
    bi(C.kicker, { tag: 'p', cls: 'weather-kicker' }),
    bi(C.title, { tag: 'h3', cls: 'monsoon-title' }),
    bi(C.intro, { tag: 'p', cls: 'monsoon-intro' }), group, detail,
    bi(C.note, { tag: 'p', cls: 'monsoon-limits' }),
    h('div', { class: 'monsoon-sources' },
      h('a', { href: 'https://cdn1.byjus.com/wp-content/uploads/2019/11/NCERT-Book-for-Class-9-Geography-Chapter-4.pdf', target: '_blank', rel: 'noopener noreferrer' }, bi(C.ncert, { tag: 'span' })),
      h('a', { href: 'https://mausamjournal.imd.gov.in/index.php/MAUSAM/article/view/33', target: '_blank', rel: 'noopener noreferrer' }, bi(C.imd, { tag: 'span' }))));
  el.querySelector('.monsoon-title').id = 'monsoon-inquiry-title';

  function render() {
    const stage = MONSOON_STAGES.find((s) => s.id === state.stage) || MONSOON_STAGES[0];
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.monsoonStep === stage.id)));
    const chain = h('div', { class: 'monsoon-chain' });
    stage.chain.forEach((item, i) => {
      if (i) chain.append(h('span', { class: 'monsoon-chain-arrow', 'aria-hidden': 'true' }, '→'));
      chain.append(bi(item, { tag: 'span', cls: 'monsoon-chain-item' }));
    });
    detail.replaceChildren(bi(stage.label, { tag: 'h4' }), chain, bi(stage.body, { tag: 'p', cls: 'monsoon-explanation' }),
      h('p', { class: 'monsoon-question' }, h('strong', {}, bi(C.think, { tag: 'span' })), ' ', bi(stage.question, { tag: 'span' })));
  }
  function update(model) {
    const newSeason = model?.season === 'ne' ? 'ne' : 'sw';
    const stage = MONSOON_STAGES.find((s) => s.id === state.stage);
    if (!stage || stage.season !== newSeason) {
      state.stage = newSeason === 'ne' ? 'retreat' : 'heat';
      store.saveSim(); render();
    }
  }
  update({ season }); render();
  return {
    el, update,
    relabel() { relabelBi(el); group.setAttribute('aria-label', text(C.group)); render(); },
    destroy() {},
  };
}
