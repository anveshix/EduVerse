// T04 Early Humans lab specs (L3–L5).
import * as H from '../../engines/domain/history.js';
import { Chart } from '../../engines/chart.js';
import { worldMapSvg } from '../../engines/viz.js';
import { fmt, esc } from '../../core/dom.js';
import { pair as P } from '../../core/i18n.js';
import { HARAPPAN_STOPS, stopFor, stopVisible } from './harappan-tour.js';

const b = (en, hi) => ({ en, hi });
const opt = (id, en, hi, why) => ({ id, en, hi, ...(why ? { why } : {}) });

// ================================================================ T04.L3 Settlement sim
export const settlementLab = {
  id: 'T04.L3',
  objective: b('Compare a toy foraging and farming scenario and discuss the limits of its assumptions.', 'संग्रह और खेती के एक काल्पनिक मॉडल की तुलना करें और उसकी धारणाओं की सीमाएँ समझें।'),
  note: { kind: 'fictional', en: 'Fifteen-year toy scenario: starting populations, food units, weather cycles and growth penalties are invented, not reconstructed historical data. Real communities varied and could combine farming, foraging and storage.', hi: 'पंद्रह वर्ष का काल्पनिक मॉडल: प्रारंभिक जनसंख्या, भोजन इकाइयाँ, मौसम चक्र और वृद्धि पर असर बनाए गए हैं, ऐतिहासिक आँकड़े नहीं। वास्तविक समुदाय अलग थे और खेती, संग्रह व भंडारण साथ कर सकते थे।' },
  init: () => ({ mode: 'farmer', rainVar: 0.35, storage: 0.6 }),
  controls: [
    { id: 'mode', type: 'chips', label: b('Toy subsistence scenario', 'काल्पनिक निर्वाह मॉडल'), options: [opt('forager', 'Mobile foraging', 'गतिशील संग्रह'), opt('farmer', 'Settled farming', 'स्थायी खेती')] },
    { id: 'rainVar', type: 'slider', label: b('Model weather variability', 'मॉडल में मौसम का उतार-चढ़ाव'), min: 0.1, max: 0.8, step: 0.1, fmt: (v) => `${Math.round(v * 100)}%` },
    { id: 'storage', type: 'slider', label: b('Model storage setting', 'मॉडल में भंडारण स्तर'), min: 0.1, max: 1.0, step: 0.1, fmt: (v) => `${Math.round(v * 100)}%` },
  ],
  view(S) {
    const r = H.settlementSim({ mode: S.mode, rainfallVar: S.rainVar, storage: S.storage });
    const yMax = Math.max(180, Math.ceil(Math.max(...r.series.map((p) => Math.max(p.pop, p.foodStore))) / 20) * 20);
    const ch = new Chart({ xMax: 15, yMax, xLabel: P('Years', 'वर्ष'), yLabel: P('Population / food units', 'जनसंख्या / भोजन इकाइयाँ'), xTicks: 5, yTicks: 5 });
    ch.axes();
    ch.line(r.series.map((p) => [p.y, p.pop]), 'curve g');
    ch.line(r.series.map((p) => [p.y, p.foodStore]), 'curve s');
    ch.text(1, yMax * 0.93, P('Green: people · Blue: food (toy)', 'हरा: लोग · नीला: भोजन (मॉडल)'), 'lbl', 'start');
    return {
      plate: {
        src: 'assets/images/plates/t04-tools.jpg',
        en: 'Illustration of stone tools and grains; choose a pin to explore a fictional food scenario.',
        hi: 'पत्थर के औज़ारों और अनाज का चित्र; काल्पनिक भोजन मॉडल देखने के लिए पिन चुनें।',
        spots: [
          { x: 24, y: 42, en: 'Mobile foraging scenario', hi: 'गतिशील संग्रह मॉडल', detail: b('The toy starts this group smaller and assumes movement can change food access. These are not measurements.', 'मॉडल इस समूह को छोटा मानता है और मानता है कि स्थान बदलने से भोजन की उपलब्धता बदल सकती है। ये माप नहीं हैं।'), set: { mode: 'forager', rainVar: 0.4, storage: 0.2 } },
          { x: 52, y: 66, en: 'Farming with more storage', hi: 'अधिक भंडारण वाली खेती', detail: b('In this toy model, stored food can cover a shortfall. The storage setting is not a historical percentage.', 'इस काल्पनिक मॉडल में संचित भोजन कमी पूरी कर सकता है। भंडारण का स्तर कोई ऐतिहासिक प्रतिशत नहीं है।'), set: { mode: 'farmer', rainVar: 0.3, storage: 0.9 } },
          { x: 78, y: 60, en: 'Variable weather and less storage', hi: 'बदलता मौसम और कम भंडारण', detail: b('Try a larger simulated weather swing and a smaller reserve. Compare the curves; this is not a famine forecast.', 'मॉडल में मौसम का अधिक उतार-चढ़ाव और कम भंडार चुनें। वक्रों की तुलना करें; यह अकाल का पूर्वानुमान नहीं है।'), set: { mode: 'farmer', rainVar: 0.7, storage: 0.1 } },
        ],
      },
      svg: ch.html({ label: P('Toy food and population scenario over 15 years', '15 वर्ष का काल्पनिक भोजन और जनसंख्या मॉडल') }),
      aria: P(`Fictional ${S.mode} scenario: model population ${r.finalPop}; stored food ${r.finalStore} toy units`, `काल्पनिक मॉडल: जनसंख्या ${r.finalPop}; संचित भोजन ${r.finalStore} काल्पनिक इकाई`),
      lines: [
        b(`Toy result after 15 years: population ${r.finalPop}, stored food ${r.finalStore} invented units.`, `15 वर्षों बाद काल्पनिक परिणाम: जनसंख्या ${r.finalPop}, संचित भोजन ${r.finalStore} बनाई गई इकाइयाँ।`),
        b('In this toy, a fully covered food shortfall pauses growth; an uncovered shortfall causes a decline. Storage has a maximum capacity. The rates and rules are invented, not predictions for a real community.', 'इस काल्पनिक मॉडल में पूरी की गई भोजन-कमी से वृद्धि रुकती है; न पूरी हुई कमी से जनसंख्या घटती है। भंडारण की सीमा है। दरें और नियम बनाए गए हैं, किसी वास्तविक समुदाय का पूर्वानुमान नहीं।'),
        b('The two modes start with different assumed populations and use invented rates; neither curve is evidence of an actual community or a universal history.', 'दोनों विकल्प अलग अनुमानित जनसंख्या और काल्पनिक दरों से शुरू होते हैं; कोई वक्र किसी वास्तविक समुदाय या सभी के इतिहास का प्रमाण नहीं है।'),
      ],
    };
  },
  discover: [b('In this toy scenario, compare a low and a high storage setting during variable weather. What happens to the curves? What would you need to know about a real community?', 'इस काल्पनिक मॉडल में बदलते मौसम के साथ कम और अधिक भंडारण की तुलना करें। वक्रों में क्या बदलता है? वास्तविक समुदाय के बारे में आपको क्या जानना होगा?')],
  predictions: [
    {
      id: 'p1', revision: 't04-step4',
      stem: b('How might storing part of a seasonal grain harvest help some farming households?', 'मौसमी अनाज की उपज का एक भाग रखना कुछ कृषक परिवारों की कैसे मदद कर सकता है?'),
      options: [opt('harvest', 'It can provide food between harvests, if it remains available and usable', 'यदि संचित अनाज उपलब्ध और उपयोगी रहे तो वह कटाई के बीच भोजन दे सकता है'), opt('walk', 'It guarantees crops never fail', 'यह गारंटी देता है कि फ़सल कभी नष्ट नहीं होगी')],
      run: (S) => { S.mode = 'farmer'; S.storage = 0.8; return 'harvest'; },
      explain: () => b('Storage can bridge lean periods, but spoilage, access and harvests matter. Foraging communities may also store food; the model is not a historical record.', 'भंडारण कमी के समय सहायक हो सकता है, पर खराब होना, पहुँच और उपज भी महत्त्वपूर्ण हैं। संग्रह करने वाले समुदाय भी भोजन संचित कर सकते हैं; मॉडल ऐतिहासिक विवरण नहीं है।'),
    },
  ],
  exit: [
    {
      id: 'e1',
      stem: b('Which is a possible trade-off of settled farming, not a guarantee for every community?', 'स्थायी खेती का कौन-सा संभावित लाभ और जोखिम है, हर समुदाय के लिए गारंटी नहीं?'),
      correct: 'trade',
      options: [
        { id: 'trade', ...b('Food surpluses and larger settlements could develop, but local crop failures could also matter.', 'अन्न अधिशेष और बड़ी बस्तियाँ बन सकती थीं, पर स्थानीय फ़सल विफलता भी महत्त्वपूर्ण हो सकती थी।') },
        { id: 'none', ...b('Farming ended all droughts forever.', 'खेती ने सूखे हमेशा के लिए खत्म कर दिए।'), why: b('Farming did not eliminate drought, crop losses or differences among communities.', 'खेती ने सूखा, फ़सल का नुकसान या समुदायों के अंतर समाप्त नहीं किए।') },
      ],
      explain: b('Food production, storage, mobility and risk varied by place and time; a simple model cannot establish the experience of every group.', 'खाद्य उत्पादन, भंडारण, गतिशीलता और जोखिम स्थान व समय के अनुसार अलग थे; सरल मॉडल हर समूह का अनुभव तय नहीं कर सकता।'),
      hint: b('Compare the two scenarios, then question their assumptions.', 'दोनों मॉडलों की तुलना करें, फिर उनकी धारणाओं पर प्रश्न करें।'),
    },
  ],
  reflect: b('Which assumption in this toy would you want to check against evidence from a real settlement?', 'इस काल्पनिक मॉडल की कौन-सी धारणा आप किसी वास्तविक बस्ती के प्रमाणों से जाँचना चाहेंगे?'),
};

// ================================================================ T04.L4 Harappan city planner
export const harappanCity = {
  id: 'T04.L4',
  objective: b('Explore a schematic Harappan town and distinguish excavated features from interpretations of their use.', 'एक योजनाबद्ध हड़प्पा नगर देखें और खुदी संरचनाओं को उनके उपयोग की व्याख्याओं से अलग करें।'),
  note: { kind: 'reconstruction', en: 'A composite, not a site map: the Great Bath and many street features are inspired by Mohenjo-daro; the purpose of large foundations at Mohenjo-daro and Harappa remains debated. Locations, sizes and well counts in the model are invented.', hi: 'यह मिश्रित मॉडल है, किसी स्थल का नक्शा नहीं: विशाल स्नानागार और कई सड़क विशेषताएँ मोहनजोदड़ो से प्रेरित हैं; मोहनजोदड़ो और हड़प्पा के बड़े आधारों का उपयोग विवादित है। मॉडल की स्थिति, आकार और कुओं की संख्या काल्पनिक हैं।' },
  // Keep the old granary control key so existing saved plans remain intact; its use is uncertain.
  init: () => ({ gridStreets: true, coveredDrains: true, granary: true, greatBath: true, wells: 2, tourStop: 'raised' }),
  controls: [
    { id: 'gridStreets', type: 'toggle', label: b('Aligned model blocks / grid streets', 'संरेखित मॉडल खंड / ग्रिड सड़कें') },
    { id: 'coveredDrains', type: 'toggle', label: b('Show covered street drains', 'ढकी सड़क नालियाँ दिखाएँ') },
    { id: 'granary', type: 'toggle', label: b('Show large brick platform (use uncertain)', 'बड़ा ईंट-चबूतरा दिखाएँ (उपयोग अनिश्चित)') },
    { id: 'greatBath', type: 'toggle', label: b('Show Great Bath', 'विशाल स्नानागार दिखाएँ') },
    { id: 'wells', type: 'slider', label: b('Illustrated wells per block', 'प्रति खंड चित्रित कुएँ'), min: 0, max: 3, step: 1 },
  ],
  view(S) {
    const plan = H.harappanPlan(S);
    const selected = stopFor(S.tourStop), visible = stopVisible(selected, plan);
    let g = `<rect x="16" y="16" width="608" height="218" rx="8" fill="#ebd9b4" stroke="#8c5b32" stroke-width="2"/>`;
    g += `<rect x="34" y="32" width="180" height="186" rx="6" fill="#c78254" stroke="#5c351c" stroke-width="2"/>`;
    g += `<text class="txt sm b" x="124" y="50" text-anchor="middle" fill="#fff">${esc(P('Raised sector', 'ऊँचा भाग'))}</text>`;
    if (plan.greatBath) g += `<rect x="56" y="64" width="136" height="58" rx="4" fill="#38bdf8" stroke="#0369a1" stroke-width="2"/><text class="txt sm b" x="124" y="97" text-anchor="middle">${esc(P('Bath', 'स्नान'))}</text>`;
    if (plan.granary) g += `<rect x="56" y="138" width="136" height="60" rx="4" fill="#9a522a" stroke="#451a03" stroke-width="2"/><text class="txt sm b light-label" x="124" y="165" text-anchor="middle" fill="#fff">${esc(P('Platform', 'चबूतरा'))}</text><text class="txt sm light-label" x="124" y="183" text-anchor="middle" fill="#fff">${esc(P('use uncertain', 'उपयोग अनिश्चित'))}</text>`;
    g += `<rect x="242" y="32" width="364" height="186" rx="6" fill="#d8b88a" stroke="#7c5332"/>`;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const jx = plan.gridStreets ? 0 : ((r + c) % 2 ? 12 : -10);
        const jy = plan.gridStreets ? 0 : (c % 2 ? -8 : 8);
        const bx = 264 + c * 112 + jx, by = 50 + r * 86 + jy;
        g += `<rect x="${bx}" y="${by}" width="84" height="62" rx="3" fill="#b46039" stroke="#5c2d16"/>`;
        for (let w = 0; w < plan.wells; w++) g += `<circle cx="${bx + 16 + w * 22}" cy="${by + 30}" r="5" fill="#0284c7" stroke="#fff"/>`;
      }
    }
    if (plan.coveredDrains) g += `<line x1="250" y1="124" x2="598" y2="124" stroke="#334155" stroke-width="6" stroke-dasharray="10 4"/><text class="txt sm b" x="424" y="140" text-anchor="middle">${esc(P('Covered drain', 'ढकी नाली'))}</text>`;
    const frames = {
      raised: [31, 29, 186, 192], bath: [52, 60, 144, 66], platform: [52, 134, 144, 68],
      streets: [238, 28, 372, 194], drains: [246, 114, 356, 20], wells: [258, 44, 96, 74],
    };
    if (visible) {
      const [x, y, w, h] = frames[selected.id], number = HARAPPAN_STOPS.findIndex((item) => item.id === selected.id) + 1;
      g += `<g data-harappa-highlight="${selected.id}" aria-hidden="true"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="none" stroke="#facc15" stroke-width="5"/><circle cx="${x + 5}" cy="${y + 5}" r="12" fill="#713f12" stroke="#fff" stroke-width="2"/><text x="${x + 5}" y="${y + 9}" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">${number}</text></g>`;
    }
    const onOff = (v, yes, no) => v ? yes : no;
    return {
      plate: {
        src: 'assets/images/plates/t04-harappa.jpg',
        en: 'Illustration of an imagined Harappan town, not an excavation photograph. Select a pin to compare with the model.',
        hi: 'एक कल्पित हड़प्पा नगर का चित्र, उत्खनन का फ़ोटो नहीं। मॉडल से तुलना के लिए पिन चुनें।',
        spots: [
          { x: 24, y: 38, en: 'Large brick platform', hi: 'बड़ा ईंट चबूतरा', tour: 'platform', detail: b('Large foundations were once called granaries; their exact use is disputed.', 'बड़े आधारों को पहले अन्नागार कहा गया; उनका सही उपयोग विवादित है।'), set: { granary: true } },
          { x: 52, y: 52, en: 'Streets and covered drains', hi: 'सड़कें और ढकी नालियाँ', tour: 'drains', detail: b('Excavated drains support an inference about wastewater; the illustration is not a survey.', 'खुदी नालियाँ अपशिष्ट जल के बारे में अनुमान को सहारा देती हैं; यह चित्र सर्वेक्षण नहीं है।'), set: { gridStreets: true, coveredDrains: true } },
          { x: 80, y: 62, en: 'Great Bath', hi: 'विशाल स्नानागार', tour: 'bath', detail: b('The stepped, waterproofed tank is real evidence at Mohenjo-daro; its exact use remains an interpretation.', 'मोहनजोदड़ो का सीढ़ीदार जलरोधी कुंड वास्तविक प्रमाण है; उसका सही उपयोग एक व्याख्या है।'), set: { greatBath: true } },
        ],
      },
      svg: `<p class="harappa-plan-hint">${esc(P('Scroll the plan sideways to see its labels.', 'लेबल देखने के लिए योजना को आड़ा सरकाएँ।'))}</p><div class="harappa-plan-scroll" role="region" tabindex="0" aria-label="${esc(P('Scrollable schematic town plan', 'सरकने योग्य योजनाबद्ध नगर योजना'))}"><svg viewBox="0 0 640 250" class="chart harappa-plan" role="img" data-harappa-selected="${selected.id}" xmlns="http://www.w3.org/2000/svg">${g}</svg></div>`,
      aria: P(`Schematic town plan. Tour stop: ${selected.label.en}; ${visible ? 'highlighted' : 'feature hidden'}.`, `योजनाबद्ध नगर नक्शा। यात्रा पड़ाव: ${selected.label.hi}; ${visible ? 'चिह्नित' : 'भाग छिपा है'}।`),
      lines: [
        b(`In this model: ${onOff(plan.gridStreets, 'aligned', 'staggered')} blocks; drains ${onOff(plan.coveredDrains, 'shown', 'hidden')}; Bath ${onOff(plan.greatBath, 'shown', 'hidden')}; mystery platform ${onOff(plan.granary, 'shown', 'hidden')}; ${plan.wells} illustrated wells per block.`, `इस मॉडल में: ${onOff(plan.gridStreets, 'संरेखित', 'अव्यवस्थित')} खंड; नालियाँ ${onOff(plan.coveredDrains, 'दिखीं', 'छिपीं')}; स्नानागार ${onOff(plan.greatBath, 'दिखा', 'छिपा')}; रहस्यमय चबूतरा ${onOff(plan.granary, 'दिखा', 'छिपा')}; हर खंड में ${plan.wells} चित्रित कुएँ।`),
        b('The diagram is a teaching sketch, not an excavation map or a calculation of sanitation, disease or flood safety.', 'यह शिक्षण चित्र है, उत्खनन का नक्शा या स्वच्छता, बीमारी अथवा बाढ़-सुरक्षा की गणना नहीं।'),
      ],
    };
  },
  discover: [b('Choose a tour stop, then hide and show its feature. What changed in the model, and what archaeological evidence would remain in reality?', 'यात्रा का एक पड़ाव चुनें, फिर उसका भाग छिपाएँ और दिखाएँ। मॉडल में क्या बदला और वास्तविकता में कौन-सा पुरातात्त्विक प्रमाण बचा रहेगा?')],
  predictions: [
    {
      id: 'p1', revision: 't04-step4',
      stem: b('What is a careful inference from excavated covered drains?', 'खुदी हुई ढकी नालियों से कौन-सा सावधानी भरा निष्कर्ष निकलता है?'),
      options: [opt('hygiene', 'They could carry wastewater; their exact health effects are not known from the drains alone', 'वे अपशिष्ट जल ले जा सकती थीं; केवल नालियों से स्वास्थ्य पर सटीक असर ज्ञात नहीं होता'), opt('secret', 'They prove that nobody in the city ever became ill', 'वे सिद्ध करती हैं कि नगर में कभी कोई बीमार नहीं हुआ')],
      run: (S) => { S.coveredDrains = true; S.tourStop = 'drains'; return 'hygiene'; },
      explain: () => b('Covered drains and connections are evidence for wastewater management. A model toggle or surviving drain does not measure ancient health or flood safety.', 'ढकी नालियाँ और उनके जुड़ाव अपशिष्ट जल-प्रबंधन का प्रमाण हैं। मॉडल का बटन या बची नाली प्राचीन स्वास्थ्य या बाढ़-सुरक्षा नहीं मापती।'),
    },
  ],
  exit: [
    {
      id: 'e1',
      stem: b('What can similar brick proportions and aligned streets at Harappan sites suggest?', 'हड़प्पा स्थलों पर समान ईंट अनुपात और संरेखित सड़कें क्या संकेत देती हैं?'),
      correct: 'coord',
      options: [
        { id: 'coord', ...b('Some shared building practices and planning, without proving who ruled.', 'कुछ साझा निर्माण पद्धतियाँ और योजना, बिना यह सिद्ध किए कि शासन किसका था।') },
        { id: 'accident', ...b('That nobody measured or planned anything.', 'कि किसी ने कभी माप या योजना नहीं बनाई।'), why: b('Repeated proportions and aligned streets are evidence consistent with shared practices and planning.', 'बार-बार दिखते अनुपात और संरेखित सड़कें साझा पद्धति और योजना से मेल खाते प्रमाण हैं।') },
      ],
      explain: b('Patterns in bricks and layouts support an inference of shared practices. They do not alone identify a single ruler or the form of government.', 'ईंटों और विन्यास के प्रतिरूप साझा पद्धति के निष्कर्ष को सहारा देते हैं। वे अकेले एक शासक या शासन का रूप नहीं बताते।'),
      hint: b('Separate the measured pattern from claims about political power.', 'मापे हुए प्रतिरूप को राजनीतिक सत्ता के दावे से अलग करें।'),
    },
  ],
  reflect: b('Choose one tour stop. What was found, what might it mean, and what remains uncertain?', 'यात्रा का एक पड़ाव चुनें। क्या मिला, उसका क्या अर्थ हो सकता है और क्या अनिश्चित है?'),
};

// ================================================================ T04.L5 Comparative civilisation atlas
export const civAtlas = {
  id: 'T04.L5',
  objective: b('Compare the four Bronze Age river-valley civilisations—Harappan, Mesopotamia, Egypt and Shang China—on a world atlas.', 'विश्व मानचित्र पर चार कांस्य-युगीन नदी-घाटी सभ्यताओं—हड़प्पा, मेसोपोटामिया, मिस्र और शांग चीन—की तुलना करें।'),
  note: { kind: 'documented', en: 'Natural Earth 110m map (world-atlas): markers are representative points, the dashed route is schematic and dates are approximate. The four spans are not all contemporary.', hi: 'Natural Earth मानचित्र में बिंदु उदाहरण हैं, बिंदीदार मार्ग योजनाबद्ध है और तिथियाँ अनुमानित हैं। चारों अवधियाँ पूरी तरह समकालीन नहीं हैं।' },
  init: () => ({ civ: 'harappan' }),
  controls: [{ id: 'civ', type: 'chips', label: b('Select river civilisation', 'नदी सभ्यता चुनें'), options: H.RIVER_CIVS.map((c) => ({ id: c.id, en: c.en.split(' (')[0], hi: c.hi })) }],
  view(S) {
    const cur = H.RIVER_CIVS.find((c) => c.id === S.civ) || H.RIVER_CIVS[0];
    const markers = H.RIVER_CIVS.map((c) => ({
      lon: c.lon, lat: c.lat, r: c.id === S.civ ? 10 : 6,
      fill: c.id === S.civ ? '#b5651d' : '#64748b',
      label: { en: c.en.split(' (')[0], hi: c.hi },
    }));
    const svg = worldMapSvg({ w: 640, h: 310, markers, arcs: [{ coords: [[68.1, 27.3], [56, 25], [48, 29], [44.4, 32.5]], stroke: '#0284c7', dash: '6 4', width: 2.5 }], aria: P(`Bronze Age civilisations, highlighting ${cur.en}`, `कांस्य-युगीन सभ्यताएँ, ${cur.hi} चिह्नित`) });
    return {
      plate: {
        src: 'assets/images/plates/t04-rivercivs.jpg',
        en: 'An illustration inspired by four Bronze Age river civilisations, not a photograph of relics. Choose a pin to compare a location on the map.',
        hi: 'चार कांस्य-युगीन नदी सभ्यताओं से प्रेरित चित्र, अवशेषों का फ़ोटो नहीं। मानचित्र पर स्थान की तुलना के लिए पिन चुनें।',
        spots: [
          { x: 20, y: 62, en: 'Indus Seals & Brick Drain', hi: 'हड़प्पा मुहर व ईंट नाली', detail: b('Harappan (c. 2600–1900 BCE): planned brick towns & undeciphered seal script.', 'हड़प्पा: नियोजित ईंट नगर, मानकीकृत बाट व चित्रलिपि मुहरें।'), set: { civ: 'harappan' } },
          { x: 42, y: 56, en: 'Mesopotamian Cuneiform Tablet', hi: 'मेसोपोटामिया कीलाक्षर पट्टिका', detail: b('Clay tablets from Mesopotamia record many kinds of information, including transactions and references to Meluhha.', 'मेसोपोटामिया की मिट्टी की पट्टिकाओं में लेन-देन और मेलुहा के उल्लेख सहित कई प्रकार की जानकारियाँ दर्ज हैं।'), set: { civ: 'mesopotamia' } },
          { x: 60, y: 62, en: 'Egyptian Nile Reed Boat', hi: 'मिस्र की नील नदी नौका', detail: b('The Nile supported agriculture and transport; flood levels and their effects varied.', 'नील नदी ने खेती और परिवहन में मदद की; बाढ़ का स्तर और प्रभाव बदलते थे।'), set: { civ: 'egypt' } },
          { x: 82, y: 56, en: 'Shang Bronze Ritual Vessel', hi: 'शांग कांस्य पात्र', detail: b('Yellow River cities famed for piece-mould bronze casting & oracle bones.', 'पीली नदी घाटी में उत्कृष्ट कांस्य ढलाई व अस्थि-लेख।'), set: { civ: 'china' } },
        ],
      },
      svg,
      aria: `${cur.en} (${cur.span}) on ${cur.river.en}`,
      lines: [
        { en: `${cur.en} (${cur.span}) · River: ${cur.river.en}.`, hi: `${cur.hi} (${cur.span}) · नदी: ${cur.river.hi}।`, cls: 'balanced' },
        { en: `Writing: ${cur.writing.en}. Hallmark: ${cur.trait.en}.`, hi: `लिपि: ${cur.writing.hi}। विशेषता: ${cur.trait.hi}।`, cls: 'note' },
      ],
    };
  },
  discover: [b('Compare the representative locations and approximate dates. The Mature Harappan and Shang spans shown do not overlap; a marker is not a boundary or an entire civilisation.', 'उदाहरण स्थानों और अनुमानित तिथियों की तुलना करें। दिखाई गई परिपक्व हड़प्पा और शांग अवधि साथ नहीं पड़तीं; एक बिंदु पूरी सभ्यता या उसकी सीमा नहीं है।')],
  predictions: [
    {
      id: 'p1', revision: 't04-step4',
      stem: b('Which pair has evidence of exchange connections, including Gulf sea routes, around 2200 BCE?', 'लगभग 2200 ई.पू. किन दो सभ्यताओं के बीच खाड़ी के समुद्री मार्गों सहित विनिमय संबंधों के प्रमाण हैं?'),
      options: [opt('hm', 'Harappan & Mesopotamia', 'हड़प्पा और मेसोपोटामिया'), opt('ec', 'Egypt & China directly by Atlantic', 'मिस्र और चीन अटलांटिक से')],
      run: (S) => { S.civ = 'harappan'; return 'hm'; },
      explain: () => b('Mesopotamian tablets mention Meluhha, often associated with the Indus region, and Harappan seals have been found in Mesopotamia. The dashed route is schematic.', 'मेसोपोटामिया के लेखों में मेलुहा का उल्लेख है, जिसे प्रायः सिंधु क्षेत्र से जोड़ा जाता है, और वहाँ हड़प्पा मुहरें मिली हैं। बिंदीदार मार्ग योजनाबद्ध है।'),
    },
  ],
  exit: [
    {
      id: 'e1',
      stem: b('How could a river help an early settlement?', 'एक नदी किसी आरंभिक बस्ती की कैसे मदद कर सकती थी?'),
      correct: 'silt',
      options: [
        { id: 'silt', ...b('Water, fertile land and routes could support farming and transport, alongside other factors.', 'जल, उपजाऊ भूमि और मार्ग अन्य कारणों के साथ खेती व परिवहन में सहायक हो सकते थे।') },
        { id: 'ice', ...b('Because frozen glaciers kept crops fresh.', 'क्योंकि हिमनद फसल को जमा देते थे।'), why: b('Warm fertile river floodplains supported multiple harvests.', 'गर्म उपजाऊ नदी मैदानों ने भरपूर उपज दी।') },
      ],
      explain: b('Rivers could offer resources and routes, but their flow and people’s access varied. No single environmental factor explains every city.', 'नदियाँ संसाधन और मार्ग दे सकती थीं, पर उनका प्रवाह और लोगों की पहुँच अलग थी। कोई एक पर्यावरणीय कारण हर नगर को नहीं समझाता।'),
      hint: b('Look at the dashed Gulf line and river labels.', 'मानचित्र की खाड़ी रेखा और नदियों के नाम देखें।'),
    },
  ],
  reflect: b('How is the Harappan script different from Mesopotamian cuneiform or Egyptian hieroglyphs for historians today?', 'आज के इतिहासकारों के लिए हड़प्पा लिपि मेसोपोटामिया की कीलाक्षर या मिस्र की चित्रलिपि से किस तरह अलग चुनौती है?'),
};
