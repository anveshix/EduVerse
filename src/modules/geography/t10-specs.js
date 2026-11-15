// T10 Oceans and Life lab specs (L1–L5).
import * as O from '../../engines/domain/ocean.js';
import { Chart } from '../../engines/chart.js';
import { d3, forceGraphSvg } from '../../engines/viz.js';
import { fmt, esc } from '../../core/dom.js';
import { pair as P } from '../../core/i18n.js';

const b = (en, hi) => ({ en, hi });
const opt = (id, en, hi, why) => ({ id, en, hi, ...(why ? { why } : {}) });

// ---------------------------------------------------------------- T10.L2 tides
const PH = { 0: b('New moon', 'अमावस्या'), 90: b('First quarter', 'शुक्ल अष्टमी (पहला चतुर्थांश)'), 180: b('Full moon', 'पूर्णिमा'), 270: b('Last quarter', 'कृष्ण अष्टमी (अंतिम चतुर्थांश)') };
export const tides = {
  id: 'T10.L2',
  objective: b('Explain how the Moon and Sun produce tides and why the tidal range is largest at new and full moon (spring tides) and smallest at the quarters (neap tides).', 'समझाएँ कि चंद्रमा और सूर्य ज्वार कैसे बनाते हैं और अमावस्या-पूर्णिमा पर ज्वारीय परिसर (वृहत् ज्वार) सबसे अधिक तथा अष्टमी पर (निम्न ज्वार) सबसे कम क्यों होता है।'),
  note: { kind: 'schematic', en: 'An idealised two-component model uses approximate lunar (12 h 25 min) and solar (12 h) periods. Its heights are illustrative, not a local tide prediction; real coasts differ with shape, depth and weather.', hi: 'दो घटकों का सरल मॉडल अनुमानित चंद्र (12 घं 25 मि) और सौर (12 घं) अवधि उपयोग करता है। इसकी ऊँचाई उदाहरण है, स्थानीय पूर्वानुमान नहीं; तट के आकार, गहराई और मौसम से वास्तविक ज्वार बदलते हैं।' },
  init: () => ({ phase: '0' }),
  controls: [{ id: 'phase', type: 'chips', label: b('Moon phase', 'चंद्र कला'), options: Object.entries(PH).map(([deg, o]) => ({ id: deg, ...o })) }],
  view(S) {
    const psi = +S.phase, series = O.tideSeries(psi, 72, 0.25), range = O.tidalRange(psi), spring = psi === 0 || psi === 180;
    const ch = new Chart({ xMax: 72, yMax: 2, yMin: -2, xLabel: P('Hours', 'घंटे'), yLabel: P('Water level (m)', 'जलस्तर (मी)'), xTicks: 6, yTicks: 4 });
    ch.axes(); ch.line(series.map((p) => [p.t, p.h]), 'curve s');
    const hi = Math.max(...series.map((p) => p.h)), lo = Math.min(...series.map((p) => p.h));
    ch.hline(hi, 'guide', 0, 72); ch.hline(lo, 'guide', 0, 72);
    const rad = (d) => (d * Math.PI) / 180, ex = 140, ey = 60, mx = ex + 90 * Math.cos(rad(psi + 0)), my = ey - 90 * Math.sin(rad(psi + 0));
    const small = `<svg viewBox="0 0 280 120" class="chart" role="img" xmlns="http://www.w3.org/2000/svg" style="max-height:140px"><circle class="sunmoon" cx="262" cy="60" r="14"/><text class="txt sm" x="262" y="92" text-anchor="middle">${esc(P('Sun', 'सूर्य'))}</text><circle class="earth" cx="${ex}" cy="${ey}" r="14"/><circle class="moon" cx="${mx.toFixed(0)}" cy="${my.toFixed(0)}" r="8"/><text class="txt sm" x="${ex}" y="${ey + 30}" text-anchor="middle">${esc(P('Earth', 'पृथ्वी'))}</text><text class="txt sm" x="${mx.toFixed(0)}" y="${(my - 12).toFixed(0)}" text-anchor="middle">${esc(P('Moon', 'चंद्रमा'))}</text></svg>`;
    return {
      plate: {
        src: 'assets/images/plates/t10-tides.jpg',
        en: 'Indian Ocean high-tide jetty, open sea & low-tide mudflats — tap pins to shift lunar phase between Spring and Neap tides.',
        hi: 'उच्च ज्वार बंदरगाह, खुला सागर व निम्न ज्वार तट — वृहत् व निम्न ज्वार की चंद्र स्थिति बदलने हेतु पिन पर टैप करें।',
        spots: [
          { x: 22, y: 66, en: 'New Moon Spring Tide', hi: 'अमावस्या वृहत् ज्वार', detail: b('Sun and Moon align in this model, producing a larger tidal range than at the quarter phases.', 'इस मॉडल में सूर्य और चंद्रमा एक सीध में हैं, जिससे चतुर्थांश की तुलना में ज्वारीय परिसर बड़ा होता है।'), set: { phase: '0' } },
          { x: 58, y: 46, en: 'First Quarter Neap Tide', hi: 'अष्टमी निम्न ज्वार', detail: b('Sun and Moon are at 90°, giving a smaller tidal range in this model; tides are not the same as wind-driven swells.', 'सूर्य-चंद्रमा 90° पर होने से मॉडल में छोटा ज्वारीय परिसर मिलता है; ज्वार और पवन-लहरें एक नहीं हैं।'), set: { phase: '90' } },
          { x: 88, y: 68, en: 'Full Moon Spring Tide', hi: 'पूर्णिमा वृहत् ज्वार', detail: b('The full-moon setting also has a larger model range; real water levels depend on place and conditions.', 'पूर्णिमा पर भी मॉडल का परिसर बड़ा है; वास्तविक जलस्तर स्थान और परिस्थितियों पर निर्भर है।'), set: { phase: '180' } },
        ],
      },
      svg: small + ch.html({ label: P('Tide height over three days', 'तीन दिन में ज्वार की ऊँचाई') }), aria: `Tide range ${fmt(range, 2)} metres at ${PH[psi].en}.`,
      lines: [
        { en: `${PH[psi].en}: illustrative model range ${fmt(range, 2)} m (high minus low), not a local prediction.`, hi: `${PH[psi].hi}: उदाहरण मॉडल परिसर ${fmt(range, 2)} मी (उच्च घटा निम्न), स्थानीय पूर्वानुमान नहीं।` },
        spring ? { en: 'Sun, Earth and Moon line up: their tide-producing effects reinforce each other, giving a larger SPRING range in this model.', hi: 'सूर्य, पृथ्वी और चंद्रमा एक सीध में हैं: ज्वार उत्पन्न करने वाले प्रभाव जुड़कर इस मॉडल में बड़ा वृहत् ज्वार परिसर बनाते हैं।', cls: 'warn' }
          : { en: 'Sun and Moon are at right angles, so their tide-producing effects partly offset: this model has a smaller NEAP range.', hi: 'सूर्य और चंद्रमा समकोण पर हैं, इसलिए ज्वार-उत्पादक प्रभाव आंशिक रूप से घटते हैं: मॉडल में निम्न ज्वार परिसर छोटा है।', cls: 'balanced' },
        { en: 'Many coasts have roughly two high tides a lunar day; other coasts have different patterns. Use local tide tables.', hi: 'कई तटों पर एक चंद्र दिवस में लगभग दो उच्च ज्वार आते हैं; अन्य तटों पर क्रम अलग है। स्थानीय ज्वार सारणी देखें।', cls: 'note' },
      ],
    };
  },
  discover: [b('Compare the vertical gap between the guide lines for new moon and first quarter.', 'अमावस्या और अष्टमी के लिए निर्देश-रेखाओं के बीच ऊर्ध्वाधर अंतर की तुलना करें।'), b('Count the high tides in 24 hours on the graph. Do they come at the same clock time every day?', 'ग्राफ़ पर 24 घंटे में उच्च ज्वार गिनें। क्या वे हर दिन घड़ी के उसी समय आते हैं?')],
  predictions: [{ id: 'p1', stem: b('At FULL moon the tidal range compared with the first quarter is…', 'पूर्णिमा पर ज्वारीय परिसर, अष्टमी की तुलना में…'), options: [opt('larger', 'Larger', 'अधिक'), opt('smaller', 'Smaller', 'कम'), opt('same', 'The same', 'समान')],
    run: (S) => { S.phase = '180'; const a = O.tidalRange(180), c = O.tidalRange(90); return a > c + 0.01 ? 'larger' : a < c - 0.01 ? 'smaller' : 'same'; },
    explain: () => ({ en: `Spring range ${fmt(O.tidalRange(180), 2)} m vs neap range ${fmt(O.tidalRange(90), 2)} m: at full moon the Sun and Moon pull along the same line.`, hi: `वृहत् ज्वार परिसर ${fmt(O.tidalRange(180), 2)} मी बनाम निम्न ज्वार ${fmt(O.tidalRange(90), 2)} मी: पूर्णिमा पर सूर्य और चंद्रमा एक ही रेखा में खिंचाव डालते हैं।` }) }],
  exit: [{ id: 'e1', stem: b('Fishing communities plan boat launches around tides. Which moon phase brings the lowest low tides?', 'मछुआरे ज्वार के अनुसार नाव उतारने की योजना बनाते हैं। किस चंद्र कला पर सबसे नीचे निम्न जल आता है?'), correct: 'new', options: [
    { id: 'new', ...b('New moon or full moon (spring tides)', 'अमावस्या या पूर्णिमा (वृहत् ज्वार)') }, { id: 'q', ...b('The quarter moons (neap tides)', 'अष्टमी (निम्न ज्वार)'), why: b('Quarter moons give the smallest range: the highs are lower and the lows are higher.', 'अष्टमी पर परिसर सबसे छोटा होता है: उच्च जल कम और निम्न जल ऊँचा रहता है।') }],
    explain: b('At new and full moon the pulls add, giving both the highest highs and the lowest lows.', 'अमावस्या और पूर्णिमा पर खिंचाव जुड़ते हैं, जिससे उच्चतम उच्च जल और निम्नतम निम्न जल मिलता है।'), hint: b('Which phases show the biggest gap between the guide lines?', 'किन कलाओं में निर्देश-रेखाओं के बीच सबसे बड़ा अंतर दिखता है?') }],
  reflect: b('Name one activity near the coast that depends on knowing the tide table.', 'तट के पास की एक ऐसी गतिविधि बताएँ जो ज्वार-सारणी जानने पर निर्भर है।'),
};
// ---------------------------------------------------------------- T10.L4 tsunami
export const tsunami = {
  id: 'T10.L4',
  objective: b('Explore an idealised tsunami wave-speed calculation and distinguish it from a real warning or evacuation decision.', 'सुनामी गति की आदर्श गणना समझें और उसे वास्तविक चेतावनी या निकासी निर्णय से अलग पहचानें।'),
  note: { kind: 'documented', en: 'Speed = √(g × depth) approximates long waves in uniform water. The chosen depth and distance are imaginary; this is not a real arrival time, warning or evacuation clock.', hi: 'एकसमान पानी में लंबी तरंग की अनुमानित गति = √(g × गहराई)। चुनी गहराई और दूरी काल्पनिक हैं; यह वास्तविक आगमन समय, चेतावनी या निकासी घड़ी नहीं है।' },
  init: () => ({ depth: 4000, dist: 1000, siren: 20 }),
  controls: [
    { id: 'depth', type: 'slider', label: b('Ocean depth (m)', 'महासागर की गहराई (मी)'), min: 10, max: 6000, step: 10, fmt: (v) => `${fmt(v, 0)} m` },
    { id: 'dist', type: 'slider', label: b('Distance to the coast (km)', 'तट तक दूरी (किमी)'), min: 50, max: 5000, step: 50, fmt: (v) => `${fmt(v, 0)} km` },
    { id: 'siren', type: 'slider', label: b('Imagined travel time (minutes)', 'काल्पनिक यात्रा समय (मिनट)'), min: 0, max: 180, step: 5, fmt: (v) => `${v} min` },
  ],
  view(S) {
    const kmh = O.tsunamiKmh(S.depth), w = O.warning({ distKm: S.dist, depthM: S.depth }), wave = O.windWaveSpeed(100) * 3.6;
    const items = [[P('Tsunami (this depth)', 'सुनामी (इस गहराई पर)'), kmh, 'bar-bad'], [P('Tsunami near shore (10 m)', 'सुनामी तट के पास (10 मी)'), O.tsunamiKmh(10), 'bar-w'], [P('Wind wave (100 m wavelength)', 'पवन-तरंग (100 मी तरंगदैर्घ्य)'), wave, 'bar-n'], [P('Car on a highway', 'राजमार्ग पर कार'), 100, 'bar-s'], [P('Jet aircraft', 'जेट विमान'), 800, 'bar-s']];
    const max = 900; let g = '', y = 20;
    for (const [lab, v, cls] of items) { const wdt = (Math.min(v, max) / max) * 380; g += `<text class="txt sm" x="10" y="${y + 14}">${esc(lab)}</text><rect class="${cls}" x="230" y="${y}" width="${wdt.toFixed(0)}" height="22"/><text class="txt sm b" x="${236 + wdt}" y="${y + 16}">${fmt(v, 0)} km/h</text>`; y += 34; }
    const lines = [
      { en: `In ${fmt(S.depth, 0)} m of water a tsunami moves at about ${fmt(kmh, 0)} km/h (${fmt(O.tsunamiSpeed(S.depth), 0)} m/s).`, hi: `${fmt(S.depth, 0)} मी गहरे जल में सुनामी लगभग ${fmt(kmh, 0)} किमी/घं (${fmt(O.tsunamiSpeed(S.depth), 0)} मी/से) से चलती है।` },
      { en: `In the imaginary constant-depth model, travelling ${fmt(S.dist, 0)} km takes about ${fmt(w.minutes, 0)} minutes (${fmt(w.hours, 1)} h).`, hi: `काल्पनिक समान-गहराई मॉडल में ${fmt(S.dist, 0)} किमी चलने में लगभग ${fmt(w.minutes, 0)} मिनट (${fmt(w.hours, 1)} घं) लगते हैं।` },
      { en: `Arithmetic only: ${fmt(w.minutes, 0)} model minutes minus ${S.siren} imagined travel minutes is ${fmt(w.minutes - S.siren, 0)} minutes. It assumes departure at once, constant depth and no delays; it cannot tell anyone whether a route is safe.`, hi: `केवल गणना: मॉडल के ${fmt(w.minutes, 0)} मिनट में से काल्पनिक ${S.siren} मिनट की यात्रा घटाने पर ${fmt(w.minutes - S.siren, 0)} मिनट मिलते हैं। इसमें तुरंत निकलना, समान गहराई और कोई देरी न होना माना है; इससे मार्ग की सुरक्षा तय नहीं होती।`, cls: 'warn' },
      { en: 'Never wait for this calculation. At the coast, after strong or long shaking stops, move immediately inland to higher ground; follow local warnings and wait for the official all-clear before returning.', hi: 'इस गणना के लिए कभी न रुकें। तट पर लंबे या तेज़ झटके रुकते ही तुरंत भीतर ऊँचे स्थान जाएँ; स्थानीय चेतावनी मानें और सुरक्षित घोषणा के बाद ही लौटें।', cls: 'warn' },
      { en: 'Near shore waves slow and can grow in height. Several waves and dangerous currents may follow; local shape and depth affect the result.', hi: 'तट के पास लहर धीमी होकर ऊँची हो सकती है। कई लहरें और खतरनाक धाराएँ आ सकती हैं; स्थानीय आकार और गहराई से परिणाम बदलता है।', cls: 'note' },
    ];
    return {
      plate: {
        src: 'assets/images/plates/t10-tsunami.jpg',
        en: 'Offshore tsunami sensor buoy and elevated coastal emergency shelter — tap pins to compare deep-ocean speed vs near-shore shoaling.',
        hi: 'समुद्री सुनामी चेतावनी बोया और ऊँचा आपातकालीन आश्रय — गहरे समुद्र व उथले तट की गति परखने हेतु पिन पर टैप करें।',
        spots: [
          { x: 24, y: 54, en: 'DART Deep-Ocean Sensor (4,000 m)', hi: 'गहरा समुद्री सेंसर (4,000 मी)', detail: b('At a uniform 4,000 m depth this model gives about 713 km/h. Offshore waves can be difficult to notice.', 'एकसमान 4,000 मी गहराई पर मॉडल में लगभग 713 किमी/घं मिलता है। खुले समुद्र में लहरें पहचानना कठिन हो सकता है।'), set: { depth: 4000, dist: 1000, siren: 25 } },
          { x: 56, y: 66, en: 'Shallow Near-Shore Shoaling (20 m)', hi: 'तट के पास उथला जल (20 मी)', detail: b('At 20 m this speed model is slower. Shoaling can increase wave height; this graph does not predict it.', '20 मी पर इस मॉडल की गति कम है। उथला जल लहर ऊँची कर सकता है; यह ग्राफ़ ऊँचाई नहीं बताता।'), set: { depth: 20, dist: 50, siren: 25 } },
          { x: 82, y: 38, en: 'Elevated Coastal Shelter', hi: 'ऊँचा तटीय आश्रय', detail: b('Know local evacuation routes in advance. Time and accessibility vary; follow local authorities and never wait for this model.', 'स्थानीय निकासी मार्ग पहले जानें। समय व पहुँच अलग हैं; स्थानीय निर्देश मानें और इस मॉडल की प्रतीक्षा न करें।'), set: { depth: 4000, dist: 1200, siren: 20 } },
        ],
      },
      svg: `<svg viewBox="0 0 640 ${y + 10}" class="chart" role="img" xmlns="http://www.w3.org/2000/svg">${g}</svg>`,
      aria: P(`Imaginary model speed ${fmt(kmh, 0)} km/h; calculated travel time ${fmt(w.minutes, 0)} minutes, not a warning.`, `काल्पनिक मॉडल गति ${fmt(kmh, 0)} किमी/घं; गणितीय समय ${fmt(w.minutes, 0)} मिनट, चेतावनी नहीं।`),
      lines,
    };
  },
  discover: [b('Drag the depth from 4000 m down to 10 m. What happens to the speed? Why does the wave pile up near the shore?', 'गहराई 4000 मी से घटाकर 10 मी तक लाएँ। गति का क्या होता है? लहर तट के पास क्यों ऊँची हो जाती है?'), b('Set the distance to 300 km. How does the arithmetic change when imagined travel time changes? Why is this not a real evacuation clock?', 'दूरी 300 किमी करें। काल्पनिक यात्रा समय बदलने से गणना कैसे बदलती है? यह वास्तविक निकासी घड़ी क्यों नहीं है?')],
  predictions: [{ id: 'p1', revision: 't10-step10', stem: b('A tsunami crossing the deep ocean (4000 m) travels…', 'गहरे महासागर (4000 मी) को पार करती सुनामी चलती है…'), options: [opt('slow', 'About as fast as a car (100 km/h)', 'लगभग कार जितनी तेज़ (100 किमी/घं)'), opt('jet', 'About as fast as a jet aircraft (700+ km/h)', 'लगभग जेट विमान जितनी तेज़ (700+ किमी/घं)'), opt('light', 'Much faster than any aircraft (3000 km/h)', 'किसी भी विमान से कहीं तेज़ (3000 किमी/घं)')],
    run: (S) => { S.depth = 4000; const v = O.tsunamiKmh(4000); return v < 300 ? 'slow' : v < 1500 ? 'jet' : 'light'; },
    explain: () => ({ en: `√(9.81 × 4000) ≈ ${fmt(O.tsunamiSpeed(4000), 0)} m/s ≈ ${fmt(O.tsunamiKmh(4000), 0)} km/h: comparable to a jet. Offshore wave height varies and can be difficult to notice.`, hi: `√(9.81 × 4000) ≈ ${fmt(O.tsunamiSpeed(4000), 0)} मी/से ≈ ${fmt(O.tsunamiKmh(4000), 0)} किमी/घं: जेट जैसी गति। खुले जल में ऊँचाई बदलती है और लहर पहचानना कठिन हो सकता है।` }) }],
  exit: [{ id: 'e1', stem: b('In the idealised model, a wave travels 1000 km at the speed for a uniform 4000 m depth. Roughly how long does the calculation give?', 'आदर्श मॉडल में लहर 4000 मी एकसमान गहराई की गति से 1000 किमी चलती है। गणना में लगभग कितना समय आता है?'), correct: 'h', options: [
    { id: 'h', ...b('About 1½ hours', 'लगभग डेढ़ घंटे') }, { id: 'm', ...b('About 5 minutes', 'लगभग 5 मिनट'), why: b('That would need a speed of 12,000 km/h. Use speed ≈ 700 km/h.', 'इसके लिए 12,000 किमी/घं की गति चाहिए। गति ≈ 700 किमी/घं लें।') }, { id: 'd', ...b('About 2 days', 'लगभग 2 दिन'), why: b('Too slow: at 700 km/h, 1000 km takes about 1.4 hours.', 'बहुत धीमा: 700 किमी/घं पर 1000 किमी में लगभग 1.4 घंटे लगते हैं।') }],
    explain: b('Model time = distance ÷ speed = 1000 ÷ ~700 ≈ 1.4 hours. This is not a real arrival or available evacuation time; never wait for a calculation.', 'मॉडल समय = दूरी ÷ गति = 1000 ÷ ~700 ≈ 1.4 घंटे। यह वास्तविक आगमन या निकासी के लिए उपलब्ध समय नहीं है; गणना की प्रतीक्षा कभी न करें।'), hint: b('Use the distance and speed in the readout.', 'आँकड़े में दिए दूरी और गति का प्रयोग करें।') }],
  reflect: b('What could a coastal school do in advance to make evacuation routes accessible and practise them? Why must people not rely on a model countdown?', 'तटीय विद्यालय निकासी मार्ग सुलभ बनाने और अभ्यास के लिए पहले क्या कर सकता है? मॉडल की गिनती पर भरोसा क्यों न करें?'),
};

// ================================================================ T10.L1 Ocean-floor cutaway
export const oceanRelief = {
  id: 'T10.L1',
  objective: b('Identify the main zones of the ocean floor—continental shelf, slope, abyssal plain, mid-ocean ridge and trench—and relate depth to plate processes.', 'महासागर तल के प्रमुख भागों—महाद्वीपीय मग्नतट, ढाल, गहन मैदान, मध्य-महासागरीय कटक और गर्त—की पहचान करें और प्लेट विवर्तनिकी से जोड़ें।'),
  note: { kind: 'schematic', en: 'Vertical scale exaggerated relative to horizontal distance; paired with interactive 3D seafloor slab.', hi: 'क्षैतिज दूरी की तुलना में ऊर्ध्वाधर पैमाना बढ़ाकर दिखाया गया; 3D समुद्र-तल मॉडल के साथ।' },
  init: () => ({ shelfKm: 80, trenchDepth: 8500, ridgeHeight: 2500, waterOpaque: true }),
  controls: [
    { id: 'shelfKm', type: 'slider', label: b('Continental shelf width (km)', 'महाद्वीपीय मग्नतट चौड़ाई (किमी)'), min: 20, max: 200, step: 10 },
    { id: 'ridgeHeight', type: 'slider', label: b('Mid-ocean ridge relief (m)', 'मध्य-महासागरीय कटक ऊँचाई (मी)'), min: 1000, max: 3400, step: 200 },
    { id: 'trenchDepth', type: 'slider', label: b('Ocean trench depth (m)', 'महासागरीय गर्त गहराई (मी)'), min: 5500, max: 11000, step: 250 },
    { id: 'waterOpaque', type: 'toggle', label: b('Tint deep ocean water layer', 'गहरे समुद्री जल परत को रंगें') },
  ],
  view(S) {
    const pts = O.oceanProfile({ shelfKm: S.shelfKm, trenchDepthM: S.trenchDepth, ridgeHeightM: S.ridgeHeight });
    const W = 640, H = 260, X = (x) => 35 + (x / 100) * 580, Y = (d) => 36 + (d / 11500) * 200;
    const polyPts = pts.map((p) => `${X(p.x).toFixed(1)},${Y(p.depthM).toFixed(1)}`).join(' ');
    let g = `<rect fill="${S.waterOpaque ? '#bae6fd' : '#e0f2fe'}" x="35" y="36" width="580" height="205"/>`;
    g += `<polygon points="35,242 ${polyPts} 615,242" fill="#7c5e42" stroke="#3f2e1e" stroke-width="2.5"/>`;
    g += `<text class="txt sm b" x="75" y="28">${esc(P('Shelf', 'मग्नतट'))}</text><text class="txt sm b" x="230" y="135">${esc(P('Abyssal plain', 'गहन मैदान'))}</text><text class="txt sm b" x="${X(52).toFixed(0)}" y="${(Y(3900 - S.ridgeHeight) - 8).toFixed(0)}" text-anchor="middle">${esc(P('Ridge (divergent)', 'कटक (अपसारी)'))}</text><text class="txt sm b" x="${X(78).toFixed(0)}" y="${(Y(S.trenchDepth) + 14).toFixed(0)}" text-anchor="middle" fill="#fff">${esc(P('Trench (subduction)', 'गर्त (अधोगमन)'))}</text>`;
    return {
      plate: {
        src: 'assets/images/plates/t10-oceanfloor.jpg',
        en: '3D oceanic trench, mid-ocean ridge volcanic vent and continental shelf — tap any seafloor feature pin to adjust depth.',
        hi: 'समुद्र-तल उच्चावच: किसी भी पिन पर टैप करके मग्नतट, गहन मैदान, कटक व गर्त की गहराई बदलें।',
        spots: [
          { x: 22, y: 42, en: 'Sunlit Continental Shelf', hi: 'महाद्वीपीय मग्नतट (<200 मी)', detail: b('Widen the shallow sunlit shelf to 160 km where plankton & reefs thrive.', 'उथला 160 किमी मग्नतट जहाँ धूप से प्रवाल व मत्स्य जीवन फलता है।'), set: { shelfKm: 160 } },
          { x: 44, y: 66, en: 'Abyssal Plain & ROV', hi: 'गहन समुद्री मैदान', detail: b('Vast flat deep-sea sediment basin miles beneath surface ships.', 'सतह से मीलों नीचे फैला समतल अवसादी महासागरीय मैदान।'), set: { shelfKm: 80, ridgeHeight: 2200, trenchDepth: 8500 } },
          { x: 60, y: 56, en: 'Mid-Ocean Ridge Vent', hi: 'मध्य-महासागरीय कटक', detail: b('Raise volcanic divergent ridge to 3,200 m relief as plates spread.', 'प्लेटों के दूर हटने पर 3,200 मी ऊँचा ज्वालामुखी कटक उभरता है।'), set: { ridgeHeight: 3200 } },
          { x: 82, y: 72, en: 'Deep Subduction Trench', hi: 'गहन अधोगमन गर्त', detail: b('Drop trench depth to 10,750 m where dense oceanic plate bends down.', 'अधोगमन सीमा पर 10,750 मी गहरा महासागरीय गर्त देखें।'), set: { trenchDepth: 10750 } },
        ],
      },
      svg: `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="oc-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7dd3fc"/><stop offset="100%" stop-color="#0369a1"/></linearGradient></defs>${g}</svg>`,
      aria: `Ocean floor profile: shelf ${S.shelfKm} km, trench ${S.trenchDepth} m`,
      lines: [
        { en: `Shallow continental shelf (~0–200 m depth, ${S.shelfKm} km wide) holds sunlit fisheries and oil/gas beds; deepest trench reaches ${fmt(S.trenchDepth, 0)} m where a plate subducts.`, hi: `उथला महाद्वीपीय मग्नतट (~0–200 मी गहराई, ${S.shelfKm} किमी चौड़ा) मत्स्य और खनिजों का केंद्र है; सबसे गहरा गर्त ${fmt(S.trenchDepth, 0)} मी तक जाता है जहाँ प्लेट धँसती है।`, cls: 'balanced' },
      ],
    };
  },
  discover: [b('Increase ridge relief and trench depth. Notice how seafloor relief rivals Mount Everest (~8,849 m)!', 'कटक की ऊँचाई और गर्त की गहराई बढ़ाएँ। देखें कि समुद्र-तल का उच्चावच माउंट एवरेस्ट (~8,849 मी) से भी अधिक है!')],
  predictions: [
    {
      id: 'p1',
      stem: b('Which shallow seafloor zone receives sunlight and yields most of the world’s marine fish catch?', 'समुद्र तल के किस उथले भाग में धूप पहुँचती है और सर्वाधिक समुद्री मछलियाँ मिलती हैं?'),
      options: [opt('shelf', 'Continental shelf (< 200 m)', 'महाद्वीपीय मग्नतट (< 200 मी)'), opt('trench', 'Deep ocean trench (> 7,000 m)', 'गहरा महासागरीय गर्त (> 7,000 मी)')],
      run: (S) => { S.shelfKm = 140; return 'shelf'; },
      explain: () => b('Sunlight penetrates ~200 m on the continental shelf, fueling plankton and rich marine food webs.', 'महाद्वीपीय मग्नतट के उथले जल (~200 मी) में सूर्य-प्रकाश पहुँचने से प्लवक और समृद्ध मत्स्य जीवन पनपता है।'),
    },
  ],
  exit: [
    {
      id: 'e1',
      stem: b('Deep ocean trenches form mainly where…', 'गहरे महासागरीय गर्त मुख्यतः कहाँ बनते हैं?'),
      correct: 'sub',
      options: [
        { id: 'sub', ...b('One tectonic plate bends and sinks beneath another (subduction)', 'जहाँ एक विवर्तनिक प्लेट दूसरी के नीचे धँसती है (अधोगमन)') },
        { id: 'river', ...b('Rivers drop delta mud at beaches', 'नदियाँ तटों पर डेल्टा की मिट्टी जमा करती हैं'), why: b('Deltas build shallow shelves; trenches mark deep subduction zones.', 'डेल्टा उथले तट बनाते हैं; गर्त गहरे अधोगमन क्षेत्रों में बनते हैं।') },
      ],
      explain: b('Trenches mark convergent subduction boundaries; mid-ocean ridges mark divergent spreading centres.', 'गर्त अभिसारी अधोगमन सीमाओं पर तथा मध्य-महासागरीय कटक अपसारी सीमाओं पर बनते हैं।'),
      hint: b('Look at the labels on the trench and ridge.', 'गर्त और कटक के नाम देखें।'),
    },
  ],
  reflect: b('Why is the ocean floor just as mountainous and varied as the continents above sea level?', 'समुद्र का तल महाद्वीपों जितना ही ऊँचा-नीचा और विविध क्यों है?'),
};

// ================================================================ T10.L3 Marine resources & fisheries
export const fisheries = {
  id: 'T10.L3',
  objective: b('Balance fishing fleet size, net mesh rules, closed spawning seasons and mangrove nurseries to sustain coastal livelihoods.', 'तटीय आजीविका टिकाए रखने के लिए नावों की संख्या, जाल के आकार, प्रजनन-काल बंद और मैंग्रोव संरक्षण का संतुलन समझें।'),
  note: { kind: 'fictional', en: 'Invented 25-year stock and catch indices with assumed growth, mesh and mangrove effects. Not measured stocks, income, policy evaluation or a forecast.', hi: 'मान ली गई वृद्धि, जाल और मैंग्रोव प्रभाव वाले काल्पनिक 25-वर्षीय भंडार व पकड़ सूचक। ये माप, आय, नीति मूल्यांकन या पूर्वानुमान नहीं हैं।' },
  init: () => ({ boats: 45, mesh: 45, closed: 2, mangrove: 60 }),
  controls: [
    { id: 'boats', type: 'slider', label: b('Fishing boats', 'मछली पकड़ने की नावें'), min: 15, max: 120, step: 5 },
    { id: 'mesh', type: 'slider', label: b('Net mesh size (mm)', 'जाल का छेद (मिमी)'), min: 20, max: 70, step: 5, hint: b('Small mesh catches juvenile fish before they breed.', 'छोटे छेद युवा मछलियाँ भी पकड़ लेते हैं।') },
    { id: 'closed', type: 'slider', label: b('Imagined closed months', 'काल्पनिक बंद अवधि (महीने)'), min: 0, max: 4, step: 1 },
    { id: 'mangrove', type: 'slider', label: b('Coastal mangrove cover', 'तटीय मैंग्रोव आवरण'), min: 10, max: 100, step: 10, fmt: (v) => `${v}%` },
  ],
  view(S) {
    const r = O.fisheryRun({ boats: S.boats, meshMm: S.mesh, closedMonths: S.closed, mangrovePct: S.mangrove, years: 25 });
    const ch = new Chart({ xMax: 25, yMax: 1100, xLabel: P('Years', 'वर्ष'), yLabel: P('Invented stock index', 'काल्पनिक भंडार सूचक'), xTicks: 5, yTicks: 5 });
    ch.axes();
    ch.hline(r.K * 0.3, 'guide', 0, 25);
    ch.line(r.series.map((v, y) => [y, v]), r.sustainable ? 'curve g' : 'curve d');
    return {
      plate: {
        src: 'assets/images/plates/t10-fisheries.jpg',
        en: 'Illustrated coastal fishing boats and mangroves — use the pins for fictional model settings, not local observations.',
        hi: 'तटीय नावों और मैंग्रोव का चित्र — पिन काल्पनिक मॉडल सेटिंग हैं, स्थानीय प्रेक्षण नहीं।',
        spots: [
          { x: 24, y: 44, en: 'Mangrove Fish Nursery (90%)', hi: 'मैंग्रोव मत्स्य नर्सरी (90%)', detail: b('Mangroves can provide nursery habitat; the 90% setting is invented, not a measurement.', 'मैंग्रोव मछलियों को शिशु-आवास दे सकते हैं; 90% सेटिंग काल्पनिक है, माप नहीं।'), set: { mangrove: 90, closed: 3 } },
          { x: 54, y: 66, en: 'Selective 55 mm Nets', hi: 'बड़े 55 मिमी जाल', detail: b('The model assumes larger mesh reduces juvenile catch. It does not predict steady income or prescribe a real mesh size.', 'मॉडल में बड़े छेद से छोटी मछलियों की पकड़ कम मानी है। यह आय या वास्तविक जाल आकार नहीं बताता।'), set: { boats: 45, mesh: 55, closed: 2 } },
          { x: 80, y: 58, en: 'Overfishing + Fine Mesh Crisis', hi: 'अति-मत्स्यन संकट', detail: b('These invented settings produce a low model stock index, not a measured local collapse.', 'इन काल्पनिक सेटिंग से मॉडल सूचक कम होता है; यह स्थानीय भंडार का मापा पतन नहीं है।'), set: { boats: 110, mesh: 20, closed: 0, mangrove: 20 } },
        ],
      },
      svg: ch.html({ label: P('25-year coastal fish stock', '25 वर्षों में तटीय मत्स्य भंडार') }),
      aria: P(`Invented final stock index ${fmt(r.finalStock, 0)}, cumulative catch index ${fmt(r.totalCatch, 0)}`, `काल्पनिक अंतिम भंडार सूचक ${fmt(r.finalStock, 0)}, कुल पकड़ सूचक ${fmt(r.totalCatch, 0)}`),
      lines: [
        { en: `Invented model after 25 years: stock index ${fmt(r.finalStock, 0)}; cumulative catch index ${fmt(r.totalCatch, 0)}. Stock is ${r.sustainable ? 'at or above' : 'below'} the model’s arbitrary ${fmt(r.K * 0.3, 0)} threshold.`, hi: `25 वर्ष बाद काल्पनिक मॉडल: भंडार सूचक ${fmt(r.finalStock, 0)}; कुल पकड़ सूचक ${fmt(r.totalCatch, 0)}। भंडार मॉडल की मान ली गई ${fmt(r.K * 0.3, 0)} सीमा से ${r.sustainable ? 'बराबर या ऊपर' : 'नीचे'} है।`, cls: r.sustainable ? 'balanced' : 'warn' },
        { en: 'The indices and threshold are teaching assumptions. They do not certify sustainability or predict fishers’ incomes.', hi: 'सूचक और सीमा शिक्षण की मान्यताएँ हैं। ये टिकाऊपन प्रमाणित या मछुआरों की आय का अनुमान नहीं करते।', cls: 'note' },
      ],
    };
  },
  discover: [b('Compare 20 mm and 55 mm nets at 80 boats in this model. Why might communities and authorities discuss mesh rules, and whose livelihoods would be affected?', 'इस मॉडल में 80 नावों पर 20 और 55 मिमी जाल की तुलना करें। समुदाय और अधिकारी जाल नियमों पर चर्चा क्यों कर सकते हैं और किसकी आजीविका प्रभावित होगी?')],
  predictions: [
    {
      id: 'p1', revision: 't10-step10',
      stem: b('In this invented model, set mangroves to 10%, 100 boats, 20 mm nets and zero closed months. After 25 years the stock index is…', 'इस काल्पनिक मॉडल में मैंग्रोव 10%, 100 नावें, 20 मिमी जाल और शून्य बंद महीने रखें। 25 वर्षों बाद भंडार सूचक…'),
      options: [opt('crash', 'Below the model threshold', 'मॉडल की सीमा से नीचे'), opt('boom', 'At or above the model threshold', 'मॉडल की सीमा पर या ऊपर')],
      run: (S) => { S.mangrove = 10; S.boats = 100; S.mesh = 20; S.closed = 0; return O.fisheryRun({ boats: 100, meshMm: 20, closedMonths: 0, mangrovePct: 10 }).sustainable ? 'boom' : 'crash'; },
      explain: () => b('Under these assumptions the index falls below the chosen threshold. Real fish stocks, species and livelihoods require evidence and local assessment.', 'इन मान्यताओं में सूचक चुनी सीमा से नीचे गिरता है। वास्तविक भंडार, प्रजाति और आजीविका समझने के लिए साक्ष्य व स्थानीय मूल्यांकन चाहिए।'),
    },
  ],
  exit: [
    {
      id: 'e1',
      stem: b('Why do coastal states enforce a seasonal fishing ban during monsoon breeding months?', 'तटीय राज्य मानसून प्रजनन महीनों में मछली पकड़ने पर अस्थायी रोक क्यों लगाते हैं?'),
      correct: 'breed',
      options: [
        { id: 'breed', ...b('To help protect breeding fish and allow populations to recover, depending on local rules.', 'स्थानीय नियमों के अनुसार प्रजनन मछलियों और आबादी की पुनर्बहाली में मदद के लिए।') },
        { id: 'salt', ...b('Because seawater loses its salt in monsoon.', 'क्योंकि मानसून में समुद्र का नमक गायब हो जाता है।'), why: b('Closed seasons protect spawning stock and rough-weather safety.', 'बंद ऋतु प्रजनन भंडार और नाविक सुरक्षा के लिए होती है।') },
      ],
      explain: b('Closures can protect breeding stocks, but impacts on fishers and results vary; no steady catch or income is guaranteed.', 'रोक प्रजनन भंडार बचा सकती है, पर मछुआरों पर प्रभाव व परिणाम अलग होते हैं; स्थिर पकड़ या आय की गारंटी नहीं।'),
      hint: b('Compare the imagined closed-month settings, remembering that real rules vary.', 'काल्पनिक बंद महीने की सेटिंग तुलना करें और याद रखें कि वास्तविक नियम अलग हैं।'),
    },
  ],
  reflect: b('Give one reason why restoring mangroves helps coastal fishing villages both ecologically and economically.', 'मैंग्रोव पुनर्बहाली तटीय मछुआरा गाँवों की पारिस्थितिक और आर्थिक दोनों तरह से मदद कैसे करती है?'),
};

// ================================================================ T10.L5 Maritime cooperation concept map
const MAR_NODES = [
  { id: 'ocean', label: b('Shared Ocean Commons', 'साझा महासागर'), rw: 145, stroke: '#0b5cad' },
  { id: 'trade', label: b('Sea Lanes & Ports', 'समुद्री मार्ग व बंदरगाह'), rw: 130, stroke: '#146c2e' },
  { id: 'rescue', label: b('Cyclone & Tsunami Alerts', 'चक्रवात-सुनामी चेतावनी'), rw: 152, stroke: '#c0392b' },
  { id: 'law', label: b('UNCLOS Maritime Law', 'समुद्री कानून (UNCLOS)'), rw: 145, stroke: '#7b3fa0' },
  { id: 'blue', label: b('Blue Economy & Reefs', 'नीली अर्थव्यवस्था व प्रवाल'), rw: 148, stroke: '#0284c7' },
];
const MAR_LINKS = [
  { source: 'ocean', target: 'law', label: b('sets zones (EEZ)', 'सीमा तय') },
  { source: 'law', target: 'trade', label: b('safe passage', 'सुरक्षित मार्ग') },
  { source: 'ocean', target: 'rescue', label: b('shared buoys', 'साझा सेंसर') },
  { source: 'blue', target: 'ocean', label: b('clean reefs', 'स्वच्छ रीफ') },
  { source: 'trade', target: 'blue', label: b('green shipping', 'हरित पोत') },
];

export const maritimeCoop = {
  id: 'T10.L5',
  objective: b('Map why nations cooperate on maritime trade, cyclone/tsunami warning, coral conservation and ocean law.', 'समझें कि समुद्री व्यापार, आपदा चेतावनी, प्रवाल संरक्षण और समुद्री कानून पर अंतर्राष्ट्रीय सहयोग क्यों आवश्यक है।'),
  note: { kind: 'documented', en: 'Force-directed network (d3-force) of maritime commons governance under UNCLOS principles.', hi: 'UNCLOS सिद्धांतों पर आधारित समुद्री साझा संसाधन तंत्र (d3-force)।' },
  init: () => ({ focus: 'law' }),
  controls: [{ id: 'focus', type: 'chips', label: b('Focus pillar', 'स्तंभ चुनें'), options: MAR_NODES.map((n) => ({ id: n.id, ...n.label })) }],
  view(S) {
    const svg = forceGraphSvg({ w: 640, h: 320, nodes: MAR_NODES, links: MAR_LINKS, activeId: S.focus, aria: 'Maritime cooperation concept network' });
    const desc = {
      ocean: b('No single country owns the high seas; fish stocks, plastic waste, and currents cross every border.', 'खुले महासागर का स्वामी कोई एक देश नहीं; मछलियाँ, धाराएँ और प्रदूषण सभी सीमाएँ पार करते हैं।'),
      trade: b('Over 80% of global goods by volume travel by ship through shared straits like Malacca, Hormuz, and Indian Ocean lanes.', 'विश्व का 80% से अधिक माल साझा समुद्री जलडमरूमध्यों से जहाजों द्वारा जाता है।'),
      rescue: b('Seismic stations and sea-level instruments help warning centres assess events and share alerts. Local warnings and evacuation still take time and may not precede a nearby tsunami.', 'भूकंपीय केंद्र और समुद्र-स्तर उपकरण चेतावनी केंद्रों को घटना समझने व सूचना साझा करने में मदद करते हैं। स्थानीय चेतावनी और निकासी में समय लगता है और पास की सुनामी पहले आ सकती है।'),
      law: b('UNCLOS defines 12-nautical-mile Territorial Sea, 200-nm Exclusive Economic Zone (EEZ), and freedom of high-seas navigation.', 'UNCLOS 12 नॉटिकल मील प्रादेशिक सागर और 200 नॉटिकल मील अनन्य आर्थिक क्षेत्र (EEZ) तय करता है।'),
      blue: b('Sustainable fisheries, coral restoration, and marine protected areas guard ocean food security.', 'टिकाऊ मत्स्यन और समुद्री संरक्षित क्षेत्र महासागरीय खाद्य सुरक्षा बचाते हैं।'),
    };
    return {
      plate: {
        src: 'assets/images/plates/t10-tides.jpg',
        en: 'Indian Ocean harbour, open sea lanes & coastal mangrove radar — tap pins to explore UNCLOS, tsunami alerts & blue economy.',
        hi: 'हिंद महासागर बंदरगाह, समुद्री मार्ग व तटीय मैंग्रोव राडार — समुद्री कानून, सुनामी चेतावनी व नीली अर्थव्यवस्था देखें।',
        spots: [
          { x: 58, y: 46, en: 'UNCLOS 200-nm Sea Lanes', hi: 'UNCLOS 200 नॉटिकल मील मार्ग', detail: b('Defines peaceful coastal resource rights alongside open high-seas navigation.', 'तटीय संसाधन अधिकार व खुले समुद्र की शांतिपूर्ण नौवहन स्वतंत्रता तय करता है।'), set: { focus: 'law' } },
          { x: 92, y: 38, en: 'Coastal Cyclone & Tsunami Radar', hi: 'चक्रवात व सुनामी चेतावनी केंद्र', detail: b('Warning centres combine earthquake and sea-level observations and share advisories; a nearby wave can arrive before an alert.', 'चेतावनी केंद्र भूकंप और समुद्र-स्तर आँकड़े मिलाकर सूचना साझा करते हैं; पास की लहर चेतावनी से पहले आ सकती है।'), set: { focus: 'rescue' } },
          { x: 24, y: 66, en: 'Fisher Harbour & Blue Economy', hi: 'मछुआरा बंदरगाह व नीली अर्थव्यवस्था', detail: b('Sustainable coastal ports and mangrove nurseries keep fisheries thriving.', 'टिकाऊ बंदरगाह व मैंग्रोव नर्सरी मत्स्य जीवन की रक्षा करते हैं।'), set: { focus: 'blue' } },
        ],
      },
      svg, aria: `Maritime cooperation node ${S.focus}`, lines: [desc[S.focus]],
    };
  },
  discover: [b('Select UNCLOS Maritime Law, then Cyclone Alerts. Why can neither work without cross-border sharing?', 'समुद्री कानून और फिर आपदा चेतावनी चुनें। दोनों सीमा-पार सहयोग के बिना क्यों अधूरे हैं?')],
  predictions: [
    {
      id: 'p1',
      stem: b('Under UNCLOS, a coastal nation’s Exclusive Economic Zone (EEZ) for fisheries and seabed resources extends up to…', 'UNCLOS के तहत मछली व समुद्री संसाधनों के लिए अनन्य आर्थिक क्षेत्र (EEZ) तट से कितनी दूर तक होता है?'),
      options: [opt('200', '200 nautical miles', '200 नॉटिकल मील'), opt('2', '2 nautical miles', '2 नॉटिकल मील')],
      run: (S) => { S.focus = 'law'; return '200'; },
      explain: () => b('UNCLOS sets a 12-nm territorial sea and a 200-nm EEZ while keeping the open high seas shared by all.', 'UNCLOS 12 नॉटिकल मील प्रादेशिक समुद्र व 200 नॉटिकल मील EEZ तय करता है और खुले समुद्र को साझा रखता है।'),
    },
  ],
  exit: [
    {
      id: 'e1',
      stem: b('Why must tsunami warning networks in the Indian Ocean be international rather than single-country?', 'हिंद महासागर में सुनामी चेतावनी नेटवर्क किसी एक देश के बजाय अंतर्राष्ट्रीय क्यों होना चाहिए?'),
      correct: 'cross',
      options: [
        { id: 'cross', ...b('A tsunami can cross national boundaries and threaten more than one coast.', 'सुनामी राष्ट्रीय सीमाएँ पार कर कई तटों को खतरे में डाल सकती है।') },
        { id: 'stop', ...b('Tsunamis stop at maritime borders.', 'सुनामी समुद्री सीमाओं पर रुक जाती हैं।'), why: b('Ocean waves ignore political borders.', 'महासागरीय लहरें राजनीतिक सीमाएँ नहीं मानतीं।') },
      ],
      explain: b('Sharing earthquake and sea-level observations can help warning centres alert other coasts. A nearby tsunami can arrive before an official alert.', 'भूकंप और समुद्र-स्तर आँकड़े साझा करने से केंद्र अन्य तटों को चेतावनी दे सकते हैं। पास की सुनामी आधिकारिक चेतावनी से पहले आ सकती है।'),
      hint: b('Click Cyclone & Tsunami Alerts on the network.', 'नेटवर्क पर चक्रवात-सुनामी चेतावनी चुनें।'),
    },
  ],
  reflect: b('Give one example of how the Indian Ocean connects India with neighbouring island and coastal nations.', 'एक उदाहरण दें कि हिंद महासागर भारत को पड़ोसी द्वीपीय व तटीय देशों से कैसे जोड़ता है।'),
};
