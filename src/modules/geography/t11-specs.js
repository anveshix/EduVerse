// T11 Life on Earth lab specs (L1–L5).
import * as Eco from '../../engines/domain/ecosystem.js';
import { Chart } from '../../engines/chart.js';
import { d3, indiaMapSvg, worldMapSvg } from '../../engines/viz.js';
import { fmt, esc } from '../../core/dom.js';
import { pair as P } from '../../core/i18n.js';

const b = (en, hi) => ({ en, hi });
const opt = (id, en, hi, why) => ({ id, en, hi, ...(why ? { why } : {}) });

// ---------------------------------------------------------------- T11.L3 forest harvest and food web
export const harvest = {
  id: 'T11.L3',
  objective: b('Compare harvest and regrowth in an invented forest-stock model, and discuss why real forest management requires more evidence.', 'काल्पनिक वन-भंडार मॉडल में कटाई और पुनर्वृद्धि की तुलना करें और चर्चा करें कि वास्तविक प्रबंधन में अधिक साक्ष्य क्यों चाहिए।'),
  note: { kind: 'schematic', en: 'A 50-year logistic-growth teaching model with arbitrary units, not a real forest or harvest recommendation. Biodiversity, land rights, species and climate are not modelled.', hi: 'काल्पनिक इकाइयों का 50-वर्षीय वृद्धि शिक्षण मॉडल, वास्तविक वन या कटाई सलाह नहीं। जैव-विविधता, भूमि अधिकार, प्रजातियाँ और जलवायु मॉडल में नहीं हैं।' },
  init: () => ({ harvest: 80, stock0: 800 }),
  controls: [
    { id: 'harvest', type: 'slider', label: b('Harvest per year', 'प्रति वर्ष कटाई'), min: 0, max: 160, step: 5 },
    { id: 'stock0', type: 'slider', label: b('Starting forest stock', 'आरंभिक वन भंडार'), min: 100, max: 1000, step: 50 },
  ],
  view(S) {
    const r = Eco.harvestRun({ harvest: S.harvest, stock0: S.stock0, years: 50 }), msy = Eco.maxSustainableYield();
    const ch = new Chart({ xMax: 50, yMax: 1100, xLabel: P('Years', 'वर्ष'), yLabel: P('Forest stock', 'वन भंडार'), xTicks: 5, yTicks: 5 });
    ch.axes(); ch.hline(Eco.forest.K, 'guide', 0, 50); ch.text(49, Eco.forest.K, P('capacity', 'क्षमता'), 'lbl', 'end', 0, -6);
    ch.line(r.stock.map((v, y) => [y, v]), r.collapsedAt ? 'curve d' : 'curve g');
    const lines = [
      { en: `In this model, peak annual regrowth is ${fmt(msy, 0)} units at half the assumed capacity. A harvest below that peak can still deplete a low starting stock.`, hi: `इस मॉडल में अनुमानित क्षमता के आधे पर अधिकतम वार्षिक पुनर्वृद्धि ${fmt(msy, 0)} इकाई है। इससे कम कटाई भी कम शुरुआती भंडार को समाप्त कर सकती है।` },
      r.collapsedAt ? { en: `With ${S.harvest} units requested per year and starting stock ${S.stock0}, the model stock is depleted in year ${r.collapsedAt}.`, hi: `प्रति वर्ष ${S.harvest} इकाई और शुरुआती भंडार ${S.stock0} पर मॉडल भंडार वर्ष ${r.collapsedAt} में समाप्त होता है।`, cls: 'warn' }
        : { en: `With ${S.harvest} units requested per year and starting stock ${S.stock0}, model stock after 50 years is ${fmt(r.final, 0)}. This does not guarantee future or real-world sustainability.`, hi: `प्रति वर्ष ${S.harvest} इकाई और शुरुआती भंडार ${S.stock0} पर 50 वर्ष बाद मॉडल भंडार ${fmt(r.final, 0)} है। इससे भविष्य या वास्तविक टिकाऊपन की गारंटी नहीं मिलती।`, cls: 'balanced' },
      { en: `Total model harvest in 50 years: ${fmt(r.total, 0)} invented units.`, hi: `50 वर्षों में कुल मॉडल कटाई: ${fmt(r.total, 0)} काल्पनिक इकाई।`, cls: 'note' },
    ];
    return {
      plate: {
        src: 'assets/images/plates/t11-grove.jpg',
        en: 'Forest stewardship: tap pins to compare three invented harvests in the model.',
        hi: 'वन प्रबंधन: मॉडल में तीन काल्पनिक कटाई विकल्पों की तुलना हेतु पिन चुनें।',
        spots: [
          { x: 26, y: 42, en: '60 units per year', hi: 'प्रति वर्ष 60 इकाई', detail: b('Try 60 units from a starting stock of 800; change the starting stock to test a different result.', '800 शुरुआती भंडार से 60 इकाई आज़माएँ; दूसरा परिणाम देखने के लिए शुरुआती भंडार बदलें।'), set: { harvest: 60, stock0: 800 } },
          { x: 56, y: 58, en: '95 units per year', hi: 'प्रति वर्ष 95 इकाई', detail: b('In this model peak regrowth is 100; try 95, then change the starting stock.', 'मॉडल की अधिकतम पुनर्वृद्धि 100 है; 95 आज़माकर शुरुआती भंडार बदलें।'), set: { harvest: 95, stock0: 800 } },
          { x: 80, y: 48, en: '135 units per year', hi: 'प्रति वर्ष 135 इकाई', detail: b('Compare the model outcome when the requested harvest exceeds its peak growth.', 'जब माँगी कटाई मॉडल की अधिकतम वृद्धि से अधिक हो तो परिणाम तुलना करें।'), set: { harvest: 135, stock0: 800 } },
        ],
      },
      svg: ch.html({ label: P('Forest stock over 50 years', '50 वर्षों में वन भंडार') }), aria: `Forest stock after 50 years: ${fmt(r.final, 0)}.`, lines,
    };
  },
  discover: [b('Try harvest 80 with starting stock 800, then 100. Does the same harvest have the same 50-year outcome?', '800 शुरुआती भंडार पर कटाई 80 आज़माएँ, फिर 100 शुरुआती भंडार पर। क्या 50-वर्षीय परिणाम समान है?'), b('Compare total model harvest at 120 and 90. Why is a 50-year index not enough to decide real forest policy?', '120 और 90 पर कुल मॉडल कटाई तुलना करें। वास्तविक वन नीति तय करने के लिए 50-वर्षीय सूचक पर्याप्त क्यों नहीं?')],
  predictions: [{ id: 'p1', revision: 't11-step11', stem: b('In this model, peak regrowth is 100 units/year and starting stock is 800. Request 130 units/year. What happens within 50 years?', 'इस मॉडल में अधिकतम पुनर्वृद्धि 100 इकाई/वर्ष और शुरुआती भंडार 800 है। प्रति वर्ष 130 इकाई माँगने पर 50 वर्ष में क्या होता है?'), options: [opt('collapse', 'The model stock is depleted', 'मॉडल भंडार समाप्त होता है'), opt('stable', 'The model stock remains above zero', 'मॉडल भंडार शून्य से ऊपर रहता है')],
    run: (S) => { S.harvest = 130; S.stock0 = 800; return Eco.harvestRun({ harvest: 130, stock0: 800 }).collapsedAt != null ? 'collapse' : 'stable'; },
    explain: () => ({ en: `With these assumptions, model regrowth peaks at ${fmt(Eco.maxSustainableYield(), 0)} and the model stock is depleted in year ${Eco.harvestRun({ harvest: 130, stock0: 800 }).collapsedAt}. This is not a real-forest prediction.`, hi: `इन मान्यताओं में मॉडल की अधिकतम पुनर्वृद्धि ${fmt(Eco.maxSustainableYield(), 0)} है और मॉडल भंडार वर्ष ${Eco.harvestRun({ harvest: 130, stock0: 800 }).collapsedAt} में समाप्त होता है। यह वास्तविक वन का पूर्वानुमान नहीं है।` }) }],
  exit: [{ id: 'e1', stem: b('What does “sustainable” harvesting mean?', '“धारणीय” कटाई का क्या अर्थ है?'), correct: 'a', options: [
    { id: 'a', ...b('Use within regeneration while also protecting biodiversity and people’s rights.', 'पुनर्वृद्धि के भीतर उपयोग तथा जैव-विविधता और लोगों के अधिकारों की रक्षा।') }, { id: 'b', ...b('Taking as much as possible as quickly as possible.', 'जितना संभव हो उतना जल्दी लेना।'), why: b('Over-harvesting can deplete a resource; real ecosystems require more than a stock calculation.', 'अति-कटाई संसाधन घटा सकती है; वास्तविक पारिस्थितिकी को भंडार गणना से अधिक की आवश्यकता है।') }],
    explain: b('Regrowth matters, but biodiversity, local livelihoods and rights also matter; this toy model cannot certify sustainability.', 'पुनर्वृद्धि महत्त्वपूर्ण है, पर जैव-विविधता, स्थानीय आजीविका और अधिकार भी हैं; यह मॉडल टिकाऊपन सिद्ध नहीं कर सकता।'), hint: b('Compare the model stock and consider what the model leaves out.', 'मॉडल भंडार की तुलना करें और सोचें कि क्या इसमें शामिल नहीं है।') }],
  reflect: b('Suggest one rule a village could make so forest produce is not over-harvested.', 'एक नियम सुझाएँ जो कोई गाँव बना सकता है ताकि वन-उपज की अति-कटाई न हो।'),
};
export const foodweb = {
  id: 'T11.L3w',
  objective: b('Compare a two-population predator–prey model and discuss possible wider food-web effects that it does not calculate.', 'दो-जनसंख्या शिकारी–शिकार मॉडल तुलना करें और खाद्य-जाल पर उन संभावित प्रभावों की चर्चा करें जिनकी गणना यह नहीं करता।'),
  note: { kind: 'schematic', en: 'Lotka–Volterra teaching model with invented numbers. It models predators and prey only—not plant biomass, grazing, food shortage or a real forest.', hi: 'काल्पनिक संख्याओं का लोटका–वोल्टेरा शिक्षण मॉडल। यह केवल शिकारी व शिकार दिखाता है—पौधों का भंडार, चराई, भोजन की कमी या वास्तविक वन नहीं।' },
  init: () => ({ cull: 0, cullYear: 10 }),
  controls: [
    { id: 'cull', type: 'slider', label: b('Share of predators removed', 'हटाए गए शिकारियों का अनुपात'), min: 0, max: 0.9, step: 0.1, fmt: (v) => `${Math.round(v * 100)}%` },
    { id: 'cullYear', type: 'slider', label: b('Year of removal', 'हटाने का वर्ष'), min: 2, max: 30, step: 1 },
  ],
  view(S) {
    const base = Eco.webRun(), tr = Eco.webRun({ cullYear: S.cull > 0 ? S.cullYear : null, cullFrac: S.cull });
    const ymax = Math.ceil(Math.max(...tr.map((p) => Math.max(p.prey, p.pred)), 60) / 20) * 20;
    const ch = new Chart({ xMax: 40, yMax: ymax, xLabel: P('Years', 'वर्ष'), yLabel: P('Population', 'जनसंख्या'), xTicks: 8, yTicks: 5 });
    ch.axes(); ch.line(tr.map((p) => [p.t, p.prey]), 'curve g'); ch.line(tr.map((p) => [p.t, p.pred]), 'curve d');
    if (S.cull > 0) ch.vline(S.cullYear, 'guide');
    ch.text(1, ymax * 0.95, P('Green: herbivores (prey)', 'हरा: शाकाहारी (शिकार)'), 'lbl', 'start'); ch.text(1, ymax * 0.88, P('Red: predators', 'लाल: शिकारी'), 'lbl', 'start');
    const pk = (a) => Math.max(...a.map((p) => p.prey)), lines = [
      { en: S.cull > 0 ? `In this model, removing ${Math.round(S.cull * 100)}% of predators in year ${S.cullYear} gives a 40-year prey peak of ${fmt(pk(tr), 0)} (without removal: ${fmt(pk(base), 0)}).` : 'In this model, predator and prey populations cycle together; the numbers and timing are invented.', hi: S.cull > 0 ? `इस मॉडल में वर्ष ${S.cullYear} में ${Math.round(S.cull * 100)}% शिकारी हटाने पर 40-वर्षीय शिकार शिखर ${fmt(pk(tr), 0)} है (बिना हटाए: ${fmt(pk(base), 0)})।` : 'इस मॉडल में शिकारी और शिकार चक्रों में बदलते हैं; संख्याएँ और समय काल्पनिक हैं।' },
      { en: 'More herbivores could increase grazing pressure, but plants and food shortage are not represented here. Real food webs have multiple interacting species.', hi: 'अधिक शाकाहारी चराई का दबाव बढ़ा सकते हैं, पर पौधे और भोजन की कमी यहाँ नहीं दिखाए गए हैं। वास्तविक खाद्य-जाल में अनेक परस्पर जुड़ी प्रजातियाँ होती हैं।', cls: 'note' },
    ];
    return {
      plate: {
        src: 'assets/images/plates/t11-reserves.jpg',
        en: 'Deer grazing beside forest stream & patrol edge — tap pins to simulate intact food webs vs predator removal.',
        hi: 'नदी किनारे हिरण व वन्य खाद्य-जाल — प्राकृतिक शिकारी संतुलन बनाम शिकारी हटाने का प्रभाव पिन से परखें।',
        spots: [
          { x: 20, y: 56, en: 'No predator removal', hi: 'शिकारी नहीं हटाए', detail: b('Observe the model’s two linked populations without a removal event.', 'शिकारी हटाए बिना मॉडल की दो जुड़ी जनसंख्याएँ देखें।'), set: { cull: 0, cullYear: 10 } },
          { x: 50, y: 66, en: 'Remove 80% of model predators', hi: '80% मॉडल शिकारी हटाएँ', detail: b('Compare the model prey curve after year 10. Plants are not shown in this model.', 'वर्ष 10 के बाद मॉडल की शिकार रेखा तुलना करें। इस मॉडल में पौधे नहीं दिखाए गए हैं।'), set: { cull: 0.8, cullYear: 10 } },
          { x: 80, y: 58, en: 'Year-4 disturbance', hi: 'वर्ष 4 का हस्तक्षेप', detail: b('Compare an earlier removal in this two-species model.', 'दो-प्रजाति मॉडल में पहले हटाने की तुलना करें।'), set: { cull: 0.7, cullYear: 4 } },
        ],
      },
      svg: ch.html({ label: P('Predator and prey populations', 'शिकारी और शिकार की जनसंख्या') }), aria: 'Predator and prey populations over 40 years.', lines,
    };
  },
  discover: [b('With no removal, notice that the red line peaks AFTER the green line. Why is there a delay?', 'बिना हटाए देखें कि लाल रेखा हरी रेखा के बाद शिखर पर पहुँचती है। यह देरी क्यों है?'), b('Remove 90% of predators in year 10. What happens to the herbivores?', 'वर्ष 10 में 90% शिकारी हटाएँ। शाकाहारियों का क्या होता है?')],
  predictions: [{ id: 'p1', revision: 't11-step11', stem: b('In this model, remove 90% of predators in year 10. How does the highest prey count over 40 years compare with no removal?', 'इस मॉडल में वर्ष 10 में 90% शिकारी हटाएँ। 40 वर्षों का अधिकतम शिकार स्तर बिना हटाए शिखर से कैसा है?'), options: [opt('up', 'Higher', 'अधिक'), opt('down', 'Lower', 'कम')],
    run: (S) => { S.cull = 0.9; S.cullYear = 10; const m = (a) => Math.max(...a.map((p) => p.prey)); return m(Eco.webRun({ cullYear: 10, cullFrac: 0.9 })) > m(Eco.webRun()) ? 'up' : 'down'; },
    explain: () => ({ en: 'For these assumptions the peak prey count is higher. This model does not calculate plant abundance or predict a particular real forest.', hi: 'इन मान्यताओं में शिकार का शिखर अधिक है। मॉडल पौधों की मात्रा नहीं गिनता या किसी वास्तविक वन का पूर्वानुमान नहीं देता।' }) }],
  exit: [{ id: 'e1', stem: b('Why might removing a top predator harm the plants of a forest?', 'किसी शीर्ष शिकारी को हटाने से वन के पौधों को हानि क्यों हो सकती है?'), correct: 'a', options: [
    { id: 'a', ...b('More herbivores survive and eat more plants.', 'अधिक शाकाहारी बचते हैं और अधिक पौधे खाते हैं।') }, { id: 'b', ...b('Plants need predators for sunlight.', 'पौधों को धूप के लिए शिकारियों की आवश्यकता होती है।'), why: b('Plants get energy from the Sun; the link is through the herbivores.', 'पौधे ऊर्जा सूर्य से पाते हैं; संबंध शाकाहारियों के माध्यम से है।') }],
    explain: b('A possible chain is fewer predators → more herbivores → more grazing. Actual effects vary; plants are not calculated by this model.', 'एक संभावित क्रम है कम शिकारी → अधिक शाकाहारी → अधिक चराई। वास्तविक प्रभाव अलग हो सकते हैं; मॉडल पौधों की गणना नहीं करता।'), hint: b('Follow the prey line and consider what might happen to plants outside the model.', 'शिकार रेखा देखें और मॉडल के बाहर पौधों पर संभावित प्रभाव सोचें।') }],
  reflect: b('Draw a three-link food chain from your region and say what would happen if the middle link vanished.', 'अपने क्षेत्र की तीन कड़ियों वाली खाद्य-शृंखला बनाएँ और बताएँ कि बीच की कड़ी लुप्त होने पर क्या होगा।'),
};


// ================================================================ T11.L1 World biome map & matcher
export const biomeMap = {
  id: 'T11.L1',
  objective: b('Match temperature and rainfall belts to Earth’s major biomes on a world map.', 'विश्व मानचित्र पर तापमान और वर्षा पट्टियों का पृथ्वी के प्रमुख बायोम से मिलान करें।'),
  note: { kind: 'schematic', en: 'The climate envelopes and map markers are illustrative examples, not measured boundaries or a complete classification. Overlapping envelopes use the first match; otherwise the model shows its closest category.', hi: 'जलवायु सीमाएँ और मानचित्र बिंदु शिक्षण उदाहरण हैं, मापी सीमाएँ या संपूर्ण वर्गीकरण नहीं। जहाँ सीमाएँ मिलती हैं वहाँ पहला मिलान है; अन्यथा मॉडल निकटतम वर्ग दिखाता है।' },
  init: () => ({ temp: 26, rain: 2400 }),
  controls: [
    { id: 'temp', type: 'slider', label: b('Mean annual temperature (°C)', 'औसत वार्षिक तापमान (°C)'), min: -12, max: 32, step: 2, fmt: (v) => `${v}°C` },
    { id: 'rain', type: 'slider', label: b('Annual precipitation (mm)', 'वार्षिक वर्षा (मिमी)'), min: 80, max: 3200, step: 80, fmt: (v) => `${v} mm` },
  ],
  view(S) {
    const within = Eco.BIOMES.find((bm) => S.temp >= bm.temp[0] && S.temp <= bm.temp[1] && S.rain >= bm.rain[0] && S.rain <= bm.rain[1]);
    const match = within || Eco.BIOMES.slice().sort((a, c) => (Math.abs((a.temp[0] + a.temp[1]) / 2 - S.temp) * 80 + Math.abs((a.rain[0] + a.rain[1]) / 2 - S.rain)) - (Math.abs((c.temp[0] + c.temp[1]) / 2 - S.temp) * 80 + Math.abs((c.rain[0] + c.rain[1]) / 2 - S.rain)))[0];
    const markers = Eco.BIOMES.map((bm) => ({
      lon: bm.lon, lat: bm.lat, r: bm.id === match.id ? 10 : 5.5, fill: bm.color,
      label: bm.id === match.id ? { en: bm.en, hi: bm.hi } : null,
    }));
    const svg = worldMapSvg({ w: 640, h: 320, markers, aria: `World biome map highlighting ${match.en}` });
    return {
      plate: {
        src: 'assets/images/plates/t11-biomes.jpg',
        en: 'Earth’s contrasting biome belts — tap any ecosystem pin on the diorama to set matching temperature & rain.',
        hi: 'पृथ्वी के प्रमुख बायोम क्षेत्र — तापमान व वर्षा मिलाने हेतु किसी भी पारिस्थितिकी पिन पर टैप करें।',
        spots: [
          { x: 20, y: 42, en: 'Tropical Rainforest', hi: 'उष्णकटिबंधीय वर्षावन', detail: b('Warm (26°C) + very wet (2,400 mm): towering evergreen biodiversity.', 'गर्म (26°C) + भारी वर्षा (2,400 मिमी): घना सदाबहार वन।'), set: { temp: 26, rain: 2400 } },
          { x: 48, y: 45, en: 'Tropical Savanna', hi: 'उष्णकटिबंधीय सवाना', detail: b('Warm (24°C) + seasonal rain (960 mm): scattered acacia trees and grasslands.', 'गर्म (24°C) + मौसमी वर्षा (960 मिमी): घास मैदान व छितरे वृक्ष।'), set: { temp: 24, rain: 960 } },
          { x: 66, y: 60, en: 'Hot Arid Desert', hi: 'गर्म मरुस्थल', detail: b('Invented warm-dry values (28°C, 160 mm): compare with the Thar’s dunes, native grasses and thorn scrub.', 'काल्पनिक गर्म-शुष्क मान (28°C, 160 मिमी): थार के टिब्बों, स्थानीय घास और कँटीली झाड़ियों से तुलना करें।'), set: { temp: 28, rain: 160 } },
          { x: 78, y: 22, en: 'Cold Alpine Tundra', hi: 'शीत पर्वतीय टुंड्रा', detail: b('Freezing (-6°C) + low precipitation (240 mm): high-Himalayan snow & lichens.', 'अति-शीत (-6°C) + कम वर्षण (240 मिमी): उच्च हिमालयी हिम व काई।'), set: { temp: -6, rain: 240 } },
        ],
      },
      svg,
      aria: `Closest biome for ${S.temp}C and ${S.rain} mm: ${match.en}`,
      lines: [
        { en: `${within ? 'Model category' : 'Closest model category (no envelope match)'}: ${match.en} · Indian comparison: ${match.indiaEx.en}.`, hi: `${within ? 'मॉडल वर्ग' : 'निकटतम मॉडल वर्ग (सीमा का मिलान नहीं)'}: ${match.hi} · भारतीय तुलना: ${match.indiaEx.hi}।`, cls: 'balanced' },
        { en: `Illustrative envelope: ${match.temp[0]}°C to ${match.temp[1]}°C, ${match.rain[0]}–${match.rain[1]} mm/year. Local habitats also depend on soils, water, seasons and human use.`, hi: `उदाहरण सीमा: ${match.temp[0]}°C से ${match.temp[1]}°C, ${match.rain[0]}–${match.rain[1]} मिमी/वर्ष। स्थानीय आवास मिट्टी, जल, ऋतु और मानव उपयोग पर भी निर्भर हैं।`, cls: 'note' },
      ],
    };
  },
  discover: [b('Keep temperature at 26°C and slide rainfall from 3,000 mm down to 160 mm. Watch Rainforest → Savanna → Desert.', 'तापमान 26°C रखकर वर्षा को 3,000 से 160 मिमी तक लाएँ। वर्षावन → सवाना → मरुस्थल क्रम देखें।')],
  predictions: [
    {
      id: 'p1', revision: 't11-step11',
      stem: b('In this model, a warm example (26°C) gets 160 mm rain/year. Which category is selected?', 'इस मॉडल में गर्म उदाहरण (26°C) में वर्षा 160 मिमी/वर्ष है। कौन-सा वर्ग चुना जाता है?'),
      options: [opt('desert', 'Desert (like Thar)', 'मरुस्थल (जैसे थार)'), opt('rainforest', 'Tropical Rainforest', 'उष्णकटिबंधीय वर्षावन')],
      run: (S) => { S.temp = 26; S.rain = 160; return 'desert'; },
      explain: () => b('The invented warm, dry setting falls inside this model’s hot-desert envelope. Actual ecosystems depend on more than annual temperature and rainfall.', 'काल्पनिक गर्म, शुष्क मान मॉडल की गर्म-मरुस्थल सीमा में है। वास्तविक पारितंत्र वार्षिक ताप व वर्षा से अधिक बातों पर निर्भर हैं।'),
    },
  ],
  exit: [
    {
      id: 'e1',
      stem: b('Which two climate factors mainly determine which biome grows naturally in a region?', 'किसी क्षेत्र में प्राकृतिक रूप से कौन-सा बायोम उगेगा, यह मुख्यतः किन दो कारकों से तय होता है?'),
      correct: 'tr',
      options: [
        { id: 'tr', ...b('Temperature and precipitation (rainfall/snow)', 'तापमान और वर्षण (वर्षा/हिम)') },
        { id: 'pop', ...b('Only postal code borders', 'केवल डाक क्षेत्र सीमाएँ'), why: b('Biomes follow climate belts, not postal lines.', 'बायोम जलवायु पट्टियों का अनुसरण करते हैं।') },
      ],
      explain: b('Temperature + water availability shape plant forms from tundra mosses to rainforest canopies.', 'तापमान व जल की उपलब्धता टुंड्रा से वर्षावन तक वनस्पति तय करते हैं।'),
      hint: b('Look at the two sliders controlling the world map.', 'विश्व मानचित्र के दोनों स्लाइडर देखें।'),
    },
  ],
  reflect: b('Which biome type sits closest to where you live, and name two native trees or crops suited to it.', 'आपके क्षेत्र के सबसे निकट कौन-सा बायोम है, और इसके अनुकूल दो स्थानीय वृक्ष या फसलें लिखें।'),
};

// ================================================================ T11.L2 India Biosphere Reserves
export const reserveMap = {
  id: 'T11.L2',
  objective: b('Locate India’s biosphere reserves on a map and understand how Core, Buffer and Transition zones protect biodiversity alongside local communities.', 'मानचित्र पर भारत के जैवमंडल आरक्षित क्षेत्र खोजें और जानें कि कोर, बफ़र व संक्रमण क्षेत्र स्थानीय लोगों संग जैव-विविधता कैसे बचाते हैं।'),
  note: { kind: 'documented', en: 'Selected national biosphere reserves from the MoEFCC list as of December 2023. Dots are approximate; one shaded state is not a reserve boundary, and some reserves cross states.', hi: 'दिसंबर 2023 की MoEFCC सूची के कुछ राष्ट्रीय जैवमंडल आरक्षित क्षेत्र। बिंदु अनुमानित हैं; रंगा राज्य आरक्षित सीमा नहीं है और कुछ क्षेत्र कई राज्यों में हैं।' },
  init: () => ({ reserve: 'nilgiri', zone: 'core' }),
  prepareState(S) {
    // Palamau is a tiger reserve, not in the national biosphere-reserve list.
    if (S.reserve === 'palamau') { S.previousReserve = S.reserve; S.reserve = 'nilgiri'; }
    else if (!Eco.INDIA_RESERVES.some((r) => r.id === S.reserve)) S.reserve = 'nilgiri';
    if (!['core', 'buffer', 'trans'].includes(S.zone)) S.zone = 'core';
  },
  controls: [
    { id: 'reserve', type: 'chips', label: b('Select biosphere reserve', 'जैवमंडल क्षेत्र चुनें'), options: Eco.INDIA_RESERVES.map((r) => ({ id: r.id, en: r.en.split(' (')[0], hi: r.hi.split(' (')[0] })) },
    { id: 'zone', type: 'chips', label: b('Biosphere zone', 'क्षेत्र परत'), options: [opt('core', 'Core zone (strict)', 'कोर क्षेत्र (सख्त)'), opt('buffer', 'Buffer zone (research)', 'बफ़र क्षेत्र (शोध)'), opt('trans', 'Transition zone (sustainable villages)', 'संक्रमण क्षेत्र (धारणीय गाँव)')] },
  ],
  view(S) {
    const res = Eco.INDIA_RESERVES.find((r) => r.id === S.reserve) || Eco.INDIA_RESERVES[0];
    const markers = Eco.INDIA_RESERVES.map((r) => ({
      lon: r.lon, lat: r.lat, r: r.id === S.reserve ? 9 : 5.5,
      fill: r.id === S.reserve ? '#146c2e' : '#5f7a61',
      pulse: r.id === S.reserve,
      label: r.id === S.reserve ? { en: r.en.split(' (')[0], hi: r.hi.split(' (')[0] } : null,
    }));
    const svg = indiaMapSvg({ w: 640, h: 420, stateColors: { [res.state]: '#bbf7d0' }, selectedState: res.state, markers, aria: `India biosphere reserves map highlighting ${res.en}` });
    const zInfo = S.zone === 'core'
      ? b('Core zone: protected habitat prioritised for biodiversity. Applicable laws, existing rights and site rules determine activities.', 'कोर क्षेत्र: जैव-विविधता को प्राथमिकता देने वाला संरक्षित आवास। गतिविधियाँ लागू कानून, मौजूदा अधिकार और स्थानीय नियम तय करते हैं।')
      : S.zone === 'buffer'
        ? b('Buffer zone: generally surrounds or adjoins the core; research, education and regulated activities may be supported under local rules.', 'बफ़र क्षेत्र: सामान्यतः कोर के पास; स्थानीय नियमों के अनुसार शोध, शिक्षा और नियंत्रित गतिविधियाँ संभव हो सकती हैं।')
        : b('Transition zone: an area for cooperation on livelihoods and conservation. Practices and participation differ between places.', 'संक्रमण क्षेत्र: आजीविका और संरक्षण के सहयोग का क्षेत्र। व्यवहार व भागीदारी अलग-अलग स्थानों पर भिन्न हैं।');
    return {
      plate: {
        src: 'assets/images/plates/t11-reserves.jpg',
        en: 'Indian biosphere reserve landscape: tap dense river Core forest, ranger Buffer station or terraced Transition village.',
        hi: 'भारतीय जैवमंडल क्षेत्र: नदी तटीय कोर वन, बफ़र रेंजर चौकी और संक्रमण क्षेत्र के गाँव पर टैप करें।',
        spots: [
          { x: 20, y: 56, en: 'Core Zone (Wildlife Habitat)', hi: 'कोर क्षेत्र (वन्यजीव आवास)', detail: b('A core prioritises biodiversity protection; activities and rights are governed by applicable rules.', 'कोर में जैव-विविधता को प्राथमिकता है; गतिविधियाँ व अधिकार लागू नियमों से संचालित हैं।'), set: { zone: 'core', reserve: 'nilgiri' } },
          { x: 50, y: 66, en: 'Buffer Zone (Ranger Watchtower)', hi: 'बफ़र क्षेत्र (रेंजर निगरानी चौकी)', detail: b('A buffer may adjoin the core and support research or regulated activities under local rules.', 'बफ़र कोर के पास हो सकता है और स्थानीय नियमों के तहत शोध या नियंत्रित गतिविधियों का समर्थन कर सकता है।'), set: { zone: 'buffer', reserve: 'nanda' } },
          { x: 80, y: 58, en: 'Transition Zone (Community)', hi: 'संक्रमण क्षेत्र (समुदाय साझेदारी)', detail: b('Transition zones can support cooperation on livelihoods and biodiversity; local practices and rights vary.', 'संक्रमण क्षेत्र आजीविका व जैव-विविधता में सहयोग का अवसर दे सकते हैं; स्थानीय प्रथाएँ और अधिकार अलग हैं।'), set: { zone: 'trans', reserve: 'sundarbans' } },
        ],
      },
      svg, aria: `${res.en} — ${res.species.en}`, lines: [{ en: `${res.en} · Key species: ${res.species.en}.`, hi: `${res.hi} · प्रमुख प्रजातियाँ: ${res.species.hi}।`, cls: 'balanced' }, zInfo],
    };
  },
  discover: [b('Compare Nanda Devi (Himalaya) with Sundarbans (Delta) and Gulf of Mannar (Marine). Notice how reserves span mountains, coasts and islands.', 'नंदा देवी (हिमालय), सुंदरबन (डेल्टा) व मन्नार की खाड़ी (समुद्री) की तुलना करें।')],
  predictions: [
    {
      id: 'p1',
      stem: b('Which biosphere reserve zone is designed for sustainable farming and shared livelihoods by local residents?', 'जैवमंडल क्षेत्र की कौन-सी पट्टी स्थानीय निवासियों की टिकाऊ खेती और साझा आजीविका के लिए बनाई गई है?'),
      options: [opt('trans', 'Transition zone', 'संक्रमण क्षेत्र'), opt('core', 'Strict Core zone', 'कठोर कोर क्षेत्र')],
      run: (S) => { S.zone = 'trans'; return 'trans'; },
      explain: () => b('Biosphere reserves balance strict Core protection with a cooperative Transition zone for human livelihoods.', 'जैवमंडल क्षेत्र सख्त कोर सुरक्षा के साथ मानव आजीविका के लिए सहभागी संक्रमण क्षेत्र का संतुलन बनाते हैं।'),
    },
  ],
  exit: [
    {
      id: 'e1',
      stem: b('Why do biosphere reserves use Core, Buffer and Transition zones?', 'जैवमंडल आरक्षित क्षेत्र कोर, बफ़र व संक्रमण क्षेत्र क्यों उपयोग करते हैं?'),
      correct: 'coexist',
      options: [
        { id: 'coexist', ...b('To support biodiversity protection alongside cooperation on local livelihoods.', 'जैव-विविधता संरक्षण के साथ स्थानीय आजीविका पर सहयोग का समर्थन करने के लिए।') },
        { id: 'cut', ...b('So the Core forest can be cleared first.', 'ताकि पहले कोर जंगल काटा जा सके।'), why: b('The Core is the most strictly protected area.', 'कोर सबसे कड़ाई से संरक्षित भाग होता है।') },
      ],
      explain: b('Zones have different conservation and cooperation roles. Local rights, participation and outcomes depend on actual rules and practice.', 'क्षेत्रों की संरक्षण व सहयोग में अलग भूमिकाएँ हैं। स्थानीय अधिकार, भागीदारी व परिणाम वास्तविक नियमों और व्यवहार पर निर्भर हैं।'),
      hint: b('Click through Core, Buffer and Transition chips.', 'कोर, बफ़र और संक्रमण विकल्प पढ़ें।'),
    },
  ],
  reflect: b('Pick one Indian biosphere reserve from the map and explain why its habitat cannot easily be replaced elsewhere.', 'मानचित्र से एक भारतीय जैवमंडल क्षेत्र चुनें और लिखें कि उसका आवास कहीं और आसानी से क्यों नहीं बन सकता।'),
};

// ================================================================ T11.L4 Forest-fire factors & prevention planner
export const firePlanner = {
  id: 'T11.L4',
  objective: b('Compare fire-related conditions in an invented index and discuss prevention and local safety guidance.', 'काल्पनिक सूचक में आग से जुड़ी परिस्थितियों की तुलना करें और रोकथाम व स्थानीय सुरक्षा निर्देशों पर चर्चा करें।'),
  note: { kind: 'fictional', en: 'The 0–100 index and fuel-break effect are invented teaching assumptions, not measured danger, fire-spread forecasts or operational advice. Follow current local authorities.', hi: '0–100 सूचक व ईंधन-विराम का प्रभाव काल्पनिक शिक्षण मान्यताएँ हैं, मापा खतरा, फैलाव पूर्वानुमान या कार्य-सलाह नहीं। वर्तमान स्थानीय प्रशासन के निर्देश मानें।' },
  init: () => ({ temp: 36, humidity: 25, wind: 22, litter: 0.7, firebreak: false }),
  controls: [
    { id: 'temp', type: 'slider', label: b('Air temperature (°C)', 'वायु तापमान (°C)'), min: 15, max: 45, step: 1, fmt: (v) => `${v}°C` },
    { id: 'humidity', type: 'slider', label: b('Relative humidity', 'सापेक्ष आर्द्रता'), min: 10, max: 85, step: 5, fmt: (v) => `${v}%` },
    { id: 'wind', type: 'slider', label: b('Slope wind speed (km/h)', 'पवन गति (किमी/घं)'), min: 0, max: 50, step: 2 },
    { id: 'litter', type: 'slider', label: b('Dry leaf/pine litter load', 'सूखी पत्तियों/पिरुल की मात्रा'), min: 0.1, max: 1.0, step: 0.1, fmt: (v) => `${Math.round(v * 100)}%` },
    { id: 'firebreak', type: 'toggle', label: b('Assume a model fuel break', 'मॉडल में ईंधन-विराम मानें') },
  ],
  view(S) {
    const r = Eco.fireRisk({ tempC: S.temp, humidityPct: S.humidity, windKmh: S.wind, dryLitter: S.litter, firebreak: S.firebreak });
    const col = r.level === 'extreme' ? '#c0392b' : r.level === 'high' ? '#d97706' : '#146c2e';
    let g = `<rect x="20" y="20" width="600" height="175" rx="8" fill="var(--card)" stroke="var(--line)"/>`;
    // Fire triangle
    g += `<polygon points="150,42 75,165 225,165" fill="#fef3c7" stroke="#d97706" stroke-width="3"/>`;
    g += `<text class="txt sm b" x="150" y="36" text-anchor="middle">${esc(P(`Heat (${S.temp}°C)`, `ताप (${S.temp}°C)`))}</text>`;
    g += `<text class="txt sm b" x="72" y="182" text-anchor="middle">${esc(P(`Dry fuel (${Math.round(S.litter * 100)}%)`, `ईंधन (${Math.round(S.litter * 100)}%)`))}</text>`;
    g += `<text class="txt sm b" x="228" y="182" text-anchor="middle">${esc(P(`O₂; wind ${S.wind} km/h`, `O₂; हवा ${S.wind} किमी/घं`))}</text>`;
    // Danger meter
    g += `<text class="txt b" x="445" y="56" text-anchor="middle">${esc(P('Invented index', 'काल्पनिक सूचक'))}</text>`;
    g += `<rect x="335" y="72" width="220" height="26" rx="6" fill="var(--line)"/><rect x="335" y="72" width="${(r.effectiveIndex * 2.2).toFixed(0)}" height="26" rx="6" fill="${col}"/>`;
    g += `<text class="txt b" x="445" y="122" text-anchor="middle" fill="${col}">${r.effectiveIndex}/100</text>`;
    return {
      plate: {
        src: 'assets/images/plates/t11-reserves.jpg',
        en: 'Schematic forest, break and village: tap pins to compare invented model conditions, not real danger or safety.',
        hi: 'योजनाबद्ध वन, विराम और गाँव: वास्तविक खतरे या सुरक्षा के बजाय काल्पनिक मॉडल परिस्थितियों की तुलना हेतु पिन चुनें।',
        spots: [
          { x: 20, y: 56, en: 'Moister model conditions', hi: 'अधिक नम मॉडल परिस्थितियाँ', detail: b('Compare the invented index under moister assumptions. Moisture does not guarantee that fire will stop.', 'अधिक नमी की मान्यता पर काल्पनिक सूचक तुलना करें। नमी आग रुकने की गारंटी नहीं है।'), set: { temp: 24, humidity: 75, wind: 10, litter: 0.3, firebreak: false } },
          { x: 50, y: 66, en: 'Model fuel break', hi: 'मॉडल ईंधन-विराम', detail: b('The model assumes a lower index with a break. Real fires can cross barriers; no village is guaranteed safe.', 'मॉडल विराम के साथ छोटा सूचक मानता है। वास्तविक आग बाधा पार कर सकती है; किसी गाँव की सुरक्षा की गारंटी नहीं।'), set: { temp: 38, humidity: 20, wind: 26, litter: 0.7, firebreak: true } },
          { x: 80, y: 58, en: 'Hot, windy model example', hi: 'गर्म, तेज़ हवा का मॉडल उदाहरण', detail: b('Compare the invented index for heat, dryness and wind without a break.', 'बिना विराम के गर्मी, सूखेपन और पवन पर काल्पनिक सूचक तुलना करें।'), set: { temp: 41, humidity: 15, wind: 38, litter: 0.9, firebreak: false } },
        ],
      },
      svg: `<svg viewBox="0 0 640 205" class="chart" role="img" xmlns="http://www.w3.org/2000/svg">${g}</svg>`,
      aria: P(`Invented fire-condition index ${r.effectiveIndex} of 100; not a forecast.`, `काल्पनिक अग्नि-परिस्थिति सूचक ${r.effectiveIndex} बटा 100; यह पूर्वानुमान नहीं है।`),
      lines: [
        { en: `Invented model index: ${r.effectiveIndex}/100.${S.firebreak ? ' The model assumes a reduction when a fuel break is selected.' : ''} This is not a fire-spread forecast or a measure of safety.`, hi: `काल्पनिक मॉडल सूचक: ${r.effectiveIndex}/100।${S.firebreak ? ' ईंधन-विराम चुनने पर मॉडल में कमी मानी गई है।' : ''} यह आग फैलने का पूर्वानुमान या सुरक्षा का माप नहीं है।`, cls: r.level === 'extreme' ? 'warn' : 'balanced' },
        { en: 'For a real fire, stay away, alert local forest or emergency services and follow their current instructions. Do not use this model for response decisions.', hi: 'वास्तविक आग से दूर रहें, स्थानीय वन या आपात सेवा को सूचित करें और उनके वर्तमान निर्देश मानें। प्रतिक्रिया के निर्णय के लिए मॉडल का उपयोग न करें।', cls: 'note' },
      ],
    };
  },
  discover: [b('Set wind to 44 km/h in the invented dry-hot example, then toggle the assumed fuel break. What does the index leave out?', 'काल्पनिक गर्म-सूखे उदाहरण में पवन 44 किमी/घं करें, फिर ईंधन-विराम चुनें। सूचक क्या नहीं दिखाता?')],
  predictions: [
    {
      id: 'p1', revision: 't11-step11',
      stem: b('Under this invented model’s assumptions, what happens to the index when its fuel break is switched on?', 'इस काल्पनिक मॉडल की मान्यताओं में ईंधन-विराम चुनने से सूचक का क्या होता है?'),
      options: [opt('cuts', 'The model index decreases', 'मॉडल सूचक घटता है'), opt('helps', 'The model index increases', 'मॉडल सूचक बढ़ता है')],
      run: (S) => { S.temp = 38; S.humidity = 20; S.wind = 24; S.litter = 0.8; S.firebreak = true; const r = Eco.fireRisk({ tempC: S.temp, humidityPct: S.humidity, windKmh: S.wind, dryLitter: S.litter, firebreak: true }); return r.effectiveIndex < r.rawIndex ? 'cuts' : 'helps'; },
      explain: () => b('A reduction is built into this model. Actual firebreak effectiveness depends on conditions, and fire can cross a break; follow local authorities.', 'मॉडल में कमी पहले से मानी गई है। वास्तविक फायर-लाइन का प्रभाव परिस्थितियों पर निर्भर है और आग उसे पार कर सकती है; स्थानीय प्रशासन के निर्देश मानें।'),
    },
  ],
  exit: [
    {
      id: 'e1',
      stem: b('Why are early summer pine forests in the western Himalaya especially prone to fires?', 'पश्चिमी हिमालय के चीड़ वन शुरुआती गर्मियों में आग के प्रति अधिक संवेदनशील क्यों होते हैं?'),
      correct: 'dry',
      options: [
        { id: 'dry', ...b('Resin-rich dry pine needles can accumulate while pre-monsoon weather is hot and dry.', 'मानसून-पूर्व गर्म और शुष्क मौसम में राल-युक्त सूखी पिरुल जमा हो सकती है।') },
        { id: 'snow', ...b('Snow acts as liquid petrol.', 'बर्फ़ पेट्रोल की तरह जलती है।'), why: b('Snow cools and wets fuel; pre-monsoon dryness drives risk.', 'बर्फ़ नमी देती है; मानसून-पूर्व सूखापन आग बढ़ाता है।') },
      ],
      explain: b('Dry fuel, heat and wind can increase fire risk. Ignition sources, weather and local conditions also matter.', 'सूखा ईंधन, गर्मी और पवन आग का जोखिम बढ़ा सकते हैं। चिंगारी के स्रोत, मौसम और स्थानीय परिस्थितियाँ भी महत्त्वपूर्ण हैं।'),
      hint: b('Look at the three corners of the fire triangle.', 'अग्नि-त्रिकोण के तीनों कोने देखें।'),
    },
  ],
  reflect: b('What questions could residents and local forest authorities discuss about prevention, livelihoods and safe reporting? Who should be included?', 'रोकथाम, आजीविका और सुरक्षित सूचना देने पर निवासी व स्थानीय वन अधिकारी कौन-से प्रश्न चर्चा कर सकते हैं? किसे शामिल करना चाहिए?'),
};

// ================================================================ T11.L5 Traditional conservation gallery
const TRAD_CASES = {
  sacred: { en: 'Sacred Groves (Devrai / Sarna / Kavu / Oran)', hi: 'पवित्र उपवन (देवराई / सरना / कावु / ओरान)', place: b('Maharashtra, Jharkhand, Kerala, Rajasthan, Meghalaya', 'महाराष्ट्र, झारखंड, केरल, राजस्थान, मेघालय'), desc: b('Some communities protect woodland through cultural practices and limits on cutting. Groves, species and customary rules differ by place and can change over time.', 'कुछ समुदाय सांस्कृतिक प्रथाओं और कटाई की सीमाओं से वन-खंड बचाते हैं। उपवन, प्रजातियाँ व नियम स्थानानुसार भिन्न हैं और समय के साथ बदल सकते हैं।') },
  bishnoi: { en: 'Bishnoi Community Ethic (Khejarli)', hi: 'बिश्नोई समाज संरक्षण परंपरा (खेजड़ली)', place: b('Western Rajasthan (1730 CE Khejarli sacrifice)', 'पश्चिमी राजस्थान (1730 ई. खेजड़ली)'), desc: b('Bishnoi traditions include care for green trees and wildlife; the Khejarli story remembers people who resisted the felling of khejri trees.', 'बिश्नोई परंपराओं में हरे वृक्ष और वन्यजीवों की रक्षा शामिल है; खेजड़ली की कथा खेजड़ी की कटाई का प्रतिरोध करने वाले लोगों को याद करती है।') },
  johad: { en: 'Johad & Apatani Water-Forest Farming', hi: 'जोहड़ व अपातानी जल-वन कृषि', place: b('Alwar (Rajasthan) & Ziro Valley (Arunachal)', 'अलवर (राजस्थान) व ज़ीरो घाटी (अरुणाचल)'), desc: b('Johads can retain runoff and support groundwater recharge. In Ziro Valley, Apatani rice–fish farming is linked to water channels and management of surrounding forests.', 'जोहड़ बहते वर्षाजल को रोककर भूजल भरने में मदद कर सकते हैं। ज़ीरो घाटी की अपातानी धान–मछली खेती जल नहरों और आसपास के वनों के प्रबंधन से जुड़ी है।') },
};

export const traditionalConservation = {
  id: 'T11.L5',
  objective: b('Examine how India’s traditional community practices—sacred groves, Bishnoi ethics and indigenous water-forest systems—conserve biodiversity.', 'परखें कि भारत की पारंपरिक सामुदायिक प्रथाएँ—पवित्र उपवन, बिश्नोई परंपरा व देशज जल-वन प्रणालियाँ—जैव-विविधता कैसे बचाती हैं।'),
  note: { kind: 'documented', en: 'Synthesises documented community-conserved traditions across India.', hi: 'भारत भर की प्रलेखित सामुदायिक संरक्षण परंपराओं का संकलन।' },
  init: () => ({ item: 'sacred' }),
  prepareState(S) { if (!Object.hasOwn(TRAD_CASES, S.item)) S.item = 'sacred'; },
  controls: [{ id: 'item', type: 'chips', label: b('Community tradition', 'सामुदायिक परंपरा'), options: Object.entries(TRAD_CASES).map(([id, o]) => ({ id, en: o.en.split(' (')[0], hi: o.hi.split(' (')[0] })) }],
  view(S) {
    const it = TRAD_CASES[S.item];
    const svg = `<svg viewBox="0 0 640 205" class="chart" role="img" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="tr-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#dcfce7"/><stop offset="100%" stop-color="#f0fdf4"/></linearGradient><radialGradient id="tr-leaf"><stop offset="0%" stop-color="#4ade80"/><stop offset="100%" stop-color="#14532d"/></radialGradient></defs><rect x="14" y="14" width="612" height="176" rx="14" fill="url(#tr-bg)" stroke="#15803d" stroke-width="2"/><path d="M14,160 Q160,128 320,148 T626,154 L626,190 L14,190 Z" fill="#86efac" opacity=".55"/><circle cx="92" cy="96" r="46" fill="url(#tr-leaf)"/><circle cx="72" cy="84" r="24" fill="#22c55e" opacity=".75"/><circle cx="114" cy="90" r="22" fill="#166534" opacity=".8"/><rect x="86" y="114" width="12" height="44" rx="4" fill="#6b4423"/><circle cx="566" cy="144" r="14" fill="#0ea5e9" opacity=".35"/><text class="txt b" x="164" y="66">${esc(P(it.en, it.hi))}</text><text class="txt sm" x="164" y="96">${esc(P(it.place.en, it.place.hi))}</text><text class="txt sm mut" x="164" y="128">${esc(P('Stewardship by shared cultural rules & local memory', 'साझा सांस्कृतिक नियमों व स्थानीय स्मृति द्वारा संरक्षण'))}</text></svg>`;
    return {
      plate: {
        src: 'assets/images/plates/t11-grove.jpg',
        en: 'Community-protected sacred grove beside a village johad water tank — tap pins to explore India’s conservation traditions.',
        hi: 'ग्रामीण जोहड़ जल-कुंड व समुदाय-संरक्षित पवित्र उपवन — भारतीय परंपराओं की खोज हेतु पिन पर टैप करें।',
        spots: [
          { x: 26, y: 42, en: 'Sacred Grove Canopy (Devrai / Sarna)', hi: 'पवित्र उपवन (देवराई / सरना)', detail: b('Some shared customs limit cutting in groves. Rules and habitats differ between places.', 'कुछ साझा प्रथाएँ उपवनों में कटाई सीमित करती हैं। नियम और आवास स्थानानुसार अलग हैं।'), set: { item: 'sacred' } },
          { x: 56, y: 66, en: 'Bishnoi Desert Ethic (Khejri & Blackbuck)', hi: 'बिश्नोई समाज संरक्षण (खेजड़ी व हिरण)', detail: b('Bishnoi traditions include care for trees and wildlife; communities and conditions vary.', 'बिश्नोई परंपराओं में वृक्षों व वन्यजीवों की देखभाल है; समुदाय और परिस्थितियाँ भिन्न हैं।'), set: { item: 'bishnoi' } },
          { x: 80, y: 54, en: 'Johad & Apatani Water-Forest', hi: 'जोहड़ व अपातानी जल-वन कृषि', detail: b('Johads can retain runoff and support recharge; the Apatani example has different water and forest practices.', 'जोहड़ बहाव रोककर पुनर्भरण में मदद कर सकते हैं; अपातानी उदाहरण की जल-वन प्रथाएँ अलग हैं।'), set: { item: 'johad' } },
        ],
      },
      svg,
      aria: `${it.en} (${it.place.en})`,
      lines: [{ en: it.en, hi: it.hi, cls: 'balanced' }, it.desc],
    };
  },
  discover: [b('Compare the traditions. How do local knowledge and shared rules contribute, and how might practices vary?', 'परंपराओं की तुलना करें। स्थानीय ज्ञान और साझा नियम कैसे मदद करते हैं, और प्रथाएँ कैसे अलग हो सकती हैं?')],
  predictions: [
    {
      id: 'p1', revision: 't11-step11',
      stem: b('What can help some sacred groves (Devrai / Kavu) be protected?', 'कुछ पवित्र उपवनों (देवराई / कावु) की रक्षा में क्या मदद कर सकता है?'),
      options: [opt('taboo', 'Shared community respect and social prohibition against commercial cutting', 'साझा सामुदायिक आस्था और व्यावसायिक कटाई पर सामाजिक रोक'), opt('road', 'Building highways right through the middle', 'बीच से राजमार्ग निकालना')],
      run: (S) => { S.item = 'sacred'; return 'taboo'; },
      explain: () => b('Shared community norms can help protect groves; customs and outcomes vary, and these examples do not prove protection lasts forever.', 'साझा सामुदायिक नियम उपवनों की रक्षा में मदद कर सकते हैं; प्रथाएँ व परिणाम अलग हैं और ये उदाहरण हमेशा की सुरक्षा सिद्ध नहीं करते।'),
    },
  ],
  exit: [
    {
      id: 'e1',
      stem: b('How do traditional johads in Rajasthan help both soil moisture and village biodiversity?', 'राजस्थान के पारंपरिक जोहड़ मिट्टी की नमी और गाँव की जैव-विविधता दोनों की मदद कैसे करते हैं?'),
      correct: 'recharge',
      options: [
        { id: 'recharge', ...b('By retaining runoff, which can support groundwater recharge and habitat.', 'बहाव रोककर भूजल पुनर्भरण व आवास को सहारा दे सकते हैं।') },
        { id: 'drain', ...b('By draining rivers quickly into the ocean.', 'नदियों को तेज़ी से समुद्र में बहाकर।'), why: b('Johads hold rain where it falls rather than rushing it away.', 'जोहड़ वर्षा जल को वहीं रोकते हैं।') },
      ],
      explain: b('Water harvesting can support vegetation, wildlife and livelihoods; results depend on site and maintenance.', 'जल संचयन वनस्पति, वन्यजीव और आजीविका में मदद कर सकता है; परिणाम स्थान व रखरखाव पर निर्भर हैं।'),
      hint: b('Open the Johad & Apatani card.', 'जोहड़ व अपातानी कार्ड खोलें।'),
    },
  ],
  reflect: b('Share one traditional proverb, festival, or practice in your family that encourages protecting water, seeds, or trees.', 'अपने परिवार की एक कहावत, पर्व या प्रथा लिखें जो जल, बीज या वृक्षों की रक्षा सिखाती हो।'),
};
