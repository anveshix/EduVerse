// T04.L4: evidence-led tour of a composite teaching model, not an archaeological site survey.
import { h } from '../../core/dom.js';
import * as i18n from '../../core/i18n.js';
import { bi, relabelBi } from '../../components/widgets.js';

const b = (en, hi) => ({ en, hi });
const SOURCES = {
  ncert: { url: 'https://ncert.nic.in/textbook/pdf/lehs101.pdf', label: b('NCERT: Bricks, Beads and Bones', 'NCERT: ईंटें, मनके और अस्थियाँ') },
  unesco: { url: 'https://whc.unesco.org/en/list/138/', label: b('UNESCO: Moenjodaro', 'यूनेस्को: मोहनजोदड़ो') },
  bath: { url: 'https://www.harappa.com/slide/great-bath-mohenjo-daro-0', label: b('Harappa.com: the Great Bath', 'Harappa.com: विशाल स्नानागार') },
  platform: { url: 'https://www.harappa.com/category/slide-subject/granary', label: b('Harappa.com: the disputed “granary”', 'Harappa.com: विवादित “अन्नागार”') },
};

export const HARAPPAN_STOPS = [
  {
    id: 'raised', label: b('Raised sector', 'ऊँचा भाग'), site: b('Mohenjo-daro · present-day Pakistan', 'मोहनजोदड़ो · वर्तमान पाकिस्तान'),
    view: { az: -0.9, pol: 1.0, r: 13, target: { x: -4.8, y: -1.2, z: 0 } },
    evidence: b('At Mohenjo-daro, brick platforms raised a smaller walled sector above the lower town.', 'मोहनजोदड़ो में ईंटों के चबूतरों ने एक छोटे प्राचीरयुक्त भाग को निचले नगर से ऊँचा बनाया।'),
    inference: b('The platforms and layout suggest planning and organised labour. Raising land may also have helped with floods.', 'चबूतरे और विन्यास योजना तथा संगठित श्रम का संकेत देते हैं। भूमि ऊँची करने से बाढ़ में भी मदद मिली हो सकती है।'),
    unknown: b('The platforms alone do not tell us exactly who organised the work or all the reasons for the height.', 'केवल चबूतरे यह नहीं बताते कि काम किसने संगठित किया या ऊँचाई के सभी कारण क्या थे।'),
    next: b('Compare construction phases and river-flood deposits with the levels of the platforms.', 'निर्माण की अलग अवस्थाओं और नदी-बाढ़ की परतों की चबूतरों की ऊँचाई से तुलना करें।'),
    sources: ['ncert', 'unesco'],
  },
  {
    id: 'bath', label: b('Great Bath', 'विशाल स्नानागार'), site: b('Mohenjo-daro · present-day Pakistan', 'मोहनजोदड़ो · वर्तमान पाकिस्तान'),
    view: { az: -0.85, pol: 0.9, r: 9, target: { x: -4.8, y: -0.7, z: -1.8 } }, patch: { greatBath: true },
    evidence: b('A rectangular brick tank, steps and waterproofing including bitumen survive at Mohenjo-daro.', 'मोहनजोदड़ो में आयताकार ईंट का कुंड, सीढ़ियाँ और डामर सहित जलरोधक सामग्री के अवशेष मिले हैं।'),
    inference: b('Its unusual construction and setting have led scholars to suggest a special or ritual bath.', 'इसकी विशिष्ट बनावट और स्थान के आधार पर विद्वानों ने विशेष या अनुष्ठानिक स्नान का अनुमान लगाया है।'),
    unknown: b('We cannot directly see who used it or establish the exact ceremonies or rules from the tank alone.', 'केवल कुंड से हम सीधे नहीं देख सकते कि इसका उपयोग कौन करता था या उसमें कौन-से अनुष्ठान अथवा नियम थे।'),
    next: b('Study adjoining rooms, associated objects and comparable water structures in their dated contexts.', 'पास के कमरों, संबंधित वस्तुओं और समान जल-संरचनाओं को उनके दिनांकित संदर्भ में जाँचें।'),
    sources: ['ncert', 'bath'],
  },
  {
    id: 'streets', label: b('Streets & houses', 'सड़कें और घर'), site: b('Mohenjo-daro · present-day Pakistan', 'मोहनजोदड़ो · वर्तमान पाकिस्तान'),
    view: { az: 0.6, pol: 0.8, r: 13, target: { x: 3.8, y: -1.6, z: 0 } }, patch: { gridStreets: true },
    evidence: b('Excavated streets in the lower town follow an approximate grid; remains of houses lie alongside.', 'निचले नगर में खुदी सड़कें लगभग ग्रिड रूप में मिलती हैं; उनके किनारे घरों के अवशेष हैं।'),
    inference: b('Their alignment suggests that parts of the settlement were planned, rather than arranged purely at random.', 'उनका संरेखण बताता है कि बस्ती के कुछ भागों की योजना बनाई गई होगी, केवल संयोग से नहीं बने होंगे।'),
    unknown: b('The simplified blocks here are not individual excavated houses or a precise street map.', 'यहाँ के सरल खंड किसी एक खुदे घर या सटीक सड़क-मानचित्र को नहीं दिखाते।'),
    next: b('Map house walls and streets from the same occupation phases before comparing their alignments.', 'संरेखण की तुलना से पहले एक ही बसावट-अवस्था की दीवारों और सड़कों का मानचित्र बनाएँ।'),
    sources: ['ncert', 'unesco'],
  },
  {
    id: 'drains', label: b('Covered drains', 'ढकी नालियाँ'), site: b('Mohenjo-daro · present-day Pakistan', 'मोहनजोदड़ो · वर्तमान पाकिस्तान'),
    view: { az: 0.35, pol: 0.48, r: 12, target: { x: 3.8, y: -1.9, z: 0 } }, patch: { coveredDrains: true },
    evidence: b('Brick street drains, covers and sumps were recorded; some connected to household drains.', 'ईंट की सड़क-नालियाँ, ढक्कन और हौज़ दर्ज हुए हैं; कुछ घरों की नालियों से जुड़े थे।'),
    inference: b('Their channels suggest a system for carrying away wastewater and clearing accumulated material.', 'इन मार्गों से अपशिष्ट जल हटाने और जमा सामग्री साफ़ करने की व्यवस्था का संकेत मिलता है।'),
    unknown: b('A surviving drain does not tell us how clean every street was or prove any health or flood-safety percentage.', 'बची हुई नाली से हर सड़क की स्वच्छता या स्वास्थ्य अथवा बाढ़-सुरक्षा का कोई प्रतिशत सिद्ध नहीं होता।'),
    next: b('Trace outlets and study deposits and connections across streets and occupation layers.', 'निकासों का पता लगाएँ और अलग सड़कों व परतों में जमाव तथा जुड़ाव की जाँच करें।'),
    sources: ['ncert'],
  },
  {
    id: 'wells', label: b('Wells', 'कुएँ'), site: b('Mohenjo-daro · present-day Pakistan', 'मोहनजोदड़ो · वर्तमान पाकिस्तान'),
    view: { az: 1.0, pol: 0.9, r: 11, target: { x: 3.8, y: -1.6, z: 0 } },
    evidence: b('Many brick-lined wells have been documented in the city, including in or near houses.', 'नगर में ईंटों से बने अनेक कुएँ दर्ज किए गए हैं, जिनमें कुछ घरों में या पास थे।'),
    inference: b('They suggest that people could draw water near some homes; access may have varied.', 'वे संकेत देते हैं कि कुछ घरों के पास पानी निकाला जा सकता था; सबकी पहुँच समान रही हो यह निश्चित नहीं।'),
    unknown: b('The model’s repeated wells and chosen count are invented; they are not a census of an excavated block.', 'मॉडल में बार-बार बने कुएँ और उनकी चुनी संख्या काल्पनिक हैं; ये किसी खुदे मोहल्ले की गणना नहीं हैं।'),
    next: b('Survey well locations and the dates of nearby houses and entrances.', 'कुओं की स्थिति तथा पास के घरों और प्रवेश-द्वारों की तिथियों का सर्वेक्षण करें।'),
    sources: ['ncert'],
  },
  {
    id: 'platform', label: b('Mystery platform', 'रहस्यमय चबूतरा'), site: b('Harappa and Mohenjo-daro · present-day Pakistan', 'हड़प्पा और मोहनजोदड़ो · वर्तमान पाकिस्तान'),
    view: { az: -0.8, pol: 0.9, r: 9.5, target: { x: -4.8, y: -0.7, z: 2.2 } }, patch: { granary: true },
    evidence: b('Large brick foundations at Harappa and Mohenjo-daro were once labelled “granaries”.', 'हड़प्पा और मोहनजोदड़ो के बड़े ईंट-आधारों को पहले “अन्नागार” कहा गया था।'),
    inference: b('Grain storage was proposed as one interpretation of these structures.', 'इन संरचनाओं के लिए अनाज भंडारण को एक व्याख्या के रूप में प्रस्तावित किया गया था।'),
    unknown: b('Their precise uses remain disputed. The foundations do not by themselves prove grain storage, a state granary or a king.', 'उनके सही उपयोग पर मतभेद है। केवल आधार अनाज भंडारण, राजकीय अन्नागार या राजा को सिद्ध नहीं करते।'),
    next: b('Examine same-phase deposits, preserved residues and the wider building context; absence of remains is not proof of absence.', 'उसी काल की परतें, सुरक्षित अवशेष और भवन का व्यापक संदर्भ जाँचें; अवशेष न मिलना कभी उपयोग न होने का प्रमाण नहीं है।'),
    sources: ['platform', 'ncert'],
  },
];

export const stopFor = (id) => HARAPPAN_STOPS.find((stop) => stop.id === id) || HARAPPAN_STOPS[0];
export function stopVisible(stop, model) {
  if (stop.id === 'wells') return Number(model.wells) > 0;
  if (stop.patch) return Object.entries(stop.patch).every(([key, value]) => model[key] === value);
  return true;
}
export function patchForStop(stop, model) {
  if (stop.id === 'wells' && !(Number(model.wells) > 0)) return { wells: 1 };
  return { ...(stop.patch || {}) };
}

const C = {
  kicker: b('A GUIDED FIELD TOUR', 'निर्देशित पुरातात्त्विक यात्रा'),
  title: b('Explore a Harappan town', 'हड़प्पा नगर को देखें'),
  intro: b('Choose a stop to focus the 3D view and highlight the matching 2D plan. If a feature is off, choosing its stop turns it on. The same tour works without 3D.', '3D दृश्य को उस ओर घुमाने और 2D योजना में चिह्नित करने के लिए एक पड़ाव चुनें। कोई भाग बंद हो तो उसका पड़ाव चुनने पर वह दिखेगा। 3D के बिना भी यही यात्रा काम करती है।'),
  limit: b('This is a composite teaching model, not an exact map of any excavation. Features are inspired mainly by Mohenjo-daro; the mystery-platform interpretation also refers to Harappa. Positions, sizes and well counts are invented.', 'यह शिक्षण के लिए मिश्रित मॉडल है, किसी एक उत्खनन का सटीक मानचित्र नहीं। अधिकतर भाग मोहनजोदड़ो से प्रेरित हैं; रहस्यमय चबूतरे की व्याख्या हड़प्पा से भी जुड़ी है। स्थान, आकार और कुओं की संख्या काल्पनिक हैं।'),
  group: b('Harappan tour stops', 'हड़प्पा यात्रा के पड़ाव'),
  jump: b('Go to the model', 'मॉडल पर जाएँ'),
  shown: b('Selected feature is shown in the model.', 'चुना भाग मॉडल में दिख रहा है।'),
  hidden: b('Selected feature is hidden by a model control. Choose this stop again to show it.', 'मॉडल के नियंत्रण से चुना भाग छिपा है। उसे दिखाने के लिए यह पड़ाव फिर चुनें।'),
  evidence: b('Evidence', 'प्रमाण'), inference: b('Possible inference', 'संभावित निष्कर्ष'),
  unknown: b('What remains uncertain', 'क्या अनिश्चित है'), next: b('What to check next', 'अगली जाँच'),
  sources: b('Sources for this stop (internet needed)', 'इस पड़ाव के स्रोत (इंटरनेट आवश्यक)'),
  compare: b('Compare a different site: Dholavira has its own layout and stone reservoirs. The Great Bath represented here is at Mohenjo-daro.', 'दूसरे स्थल से तुलना: धोलावीरा का अपना विन्यास और पत्थर के जलाशय हैं। यहाँ दिखाया महास्नानागार मोहनजोदड़ो में है।'),
  dholavira: b('UNESCO: Dholavira', 'यूनेस्को: धोलावीरा'),
};
const label = (o) => i18n.pair(o.en, o.hi);

export function createHarappanTour(model, { onSelect, onFocus, onShowModel } = {}) {
  let current = model;
  let active = stopFor(model.tourStop).id, lastRender = '';
  model.tourStop = active;
  const detail = h('div', { class: 'harappa-detail', 'data-harappa-detail': '' });
  const status = h('p', { class: 'harappa-status', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true', 'data-harappa-status': '' });
  const buttons = HARAPPAN_STOPS.map((stop, i) => h('button', {
    type: 'button', class: 'btn harappa-stop', 'data-harappa-stop': stop.id, 'aria-pressed': 'false',
    onclick: () => {
      active = stop.id;
      onSelect?.(stop, patchForStop(stop, current));
      render();
      onFocus?.(stop);
    },
  }, h('span', { class: 'harappa-stop-number', 'aria-hidden': 'true' }, String(i + 1)), bi(stop.label, { tag: 'span' })));
  const nav = h('div', { class: 'harappa-stops', role: 'group', 'aria-label': label(C.group) }, ...buttons);
  const el = h('section', { class: 'harappa-tour', 'aria-labelledby': 'harappa-tour-title' },
    bi(C.kicker, { tag: 'p', cls: 'detective-kicker' }), bi(C.title, { tag: 'h3', cls: 'harappa-tour-title' }),
    bi(C.intro, { tag: 'p', cls: 'harappa-intro' }), bi(C.limit, { tag: 'p', cls: 'harappa-limit' }),
    nav, status, h('button', { type: 'button', class: 'btn harappa-jump', 'data-harappa-jump': '', onclick: () => onShowModel?.() }, bi(C.jump, { tag: 'span' })), detail,
    h('p', { class: 'harappa-compare' }, bi(C.compare, { tag: 'span' }), ' ',
      h('a', { href: 'https://whc.unesco.org/en/list/1645/', target: '_blank', rel: 'noopener noreferrer' }, bi(C.dholavira, { tag: 'span' }))));
  el.querySelector('.harappa-tour-title').id = 'harappa-tour-title';
  function render(force = false) {
    const stop = stopFor(active);
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.harappaStop === stop.id)));
    const present = stopVisible(stop, current), key = `${stop.id}:${present}`;
    if (!force && key === lastRender) return;
    lastRender = key;
    status.classList.toggle('is-hidden-feature', !present);
    status.replaceChildren(bi(stop.label, { tag: 'strong', cls: 'harappa-status-label' }), bi(present ? C.shown : C.hidden, { tag: 'span', cls: 'harappa-status-message' }));
    const fields = [['evidence', C.evidence], ['inference', C.inference], ['unknown', C.unknown], ['next', C.next]];
    const list = h('dl', { class: 'harappa-evidence-grid' }, ...fields.map(([key, title]) => h('div', { class: `harappa-evidence-item ${key}`, 'data-harappa-field': key }, bi(title, { tag: 'dt' }), bi(stop[key], { tag: 'dd' }))));
    const sources = h('div', { class: 'harappa-sources' }, bi(C.sources, { tag: 'span' }), ...stop.sources.map((id) => {
      const source = SOURCES[id];
      return h('a', { href: source.url, target: '_blank', rel: 'noopener noreferrer' }, bi(source.label, { tag: 'span' }));
    }));
    detail.replaceChildren(bi(stop.site, { tag: 'p', cls: 'harappa-site' }), bi(stop.label, { tag: 'h4' }), list, sources);
  }
  function update(nextModel) {
    current = nextModel;
    const nextStop = stopFor(nextModel.tourStop);
    const changed = nextStop.id !== active;
    active = nextStop.id;
    nextModel.tourStop = active;
    render();
    if (changed) onFocus?.(nextStop); // Reset and illustration pins can also change the selected stop.
  }
  render();
  onFocus?.(stopFor(active));
  return {
    el, update,
    select(id) { const button = buttons.find((item) => item.dataset.harappaStop === id); button?.click(); },
    relabel() { nav.setAttribute('aria-label', label(C.group)); relabelBi(el); render(true); },
    destroy() {},
  };
}
