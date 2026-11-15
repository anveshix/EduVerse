// T02.L4 Weathering, erosion and deposition; T02.L5 Landform gallery (3D+2D); T02.L6 Slope stability & GLOF hazard lab.
import { Chart } from '../../engines/chart.js';
import * as G from '../../engines/domain/terrain.js';
import { fmt, esc } from '../../core/dom.js';
import { pair as P } from '../../core/i18n.js';

const b = (en, hi) => ({ en, hi });
const opt = (id, en, hi) => ({ id, en, hi });
const AG = { river: b('River', 'नदी'), wind: b('Wind', 'पवन'), glacier: b('Glacier', 'हिमनद'), waves: b('Sea waves', 'सागरीय तरंगें') };
const RK = { soft: b('Soft rock', 'मुलायम चट्टान'), medium: b('Medium rock', 'मध्यम चट्टान'), hard: b('Hard rock', 'कठोर चट्टान') };
const pct = (v) => `${Math.round(v * 100)}%`;
const AGENT_NOTE = {
  river: b('A river cuts down where the slope is steep (V-shaped valleys, waterfalls) and drops its load where the slope flattens (floodplains, delta).', 'नदी तीव्र ढाल पर नीचे काटती है (V-आकार की घाटियाँ, जलप्रपात) और ढाल समतल होने पर अवसाद जमा करती है (बाढ़ का मैदान, डेल्टा)।'),
  wind: b('Wind works slowly and mostly in dry, bare places; it lifts fine sand and silt and drops it as dunes and loess.', 'पवन धीमे काम करती है और अधिकतर शुष्क, नंगे स्थानों में; यह महीन रेत और गाद उठाकर बालू-टिब्बों और लोयस के रूप में गिराती है।'),
  glacier: b('A glacier grinds the valley floor and walls as it flows, leaving U-shaped valleys and piles of unsorted debris (moraines).', 'हिमनद बहते हुए घाटी का तल और दीवारें घिसता है, जिससे U-आकार की घाटियाँ और अव्यवस्थित मलबे के ढेर (हिमोढ़) बनते हैं।'),
  waves: b('Waves hammer and undercut coastal rock into cliffs and wave-cut platforms, and carry sand to build beaches elsewhere.', 'तरंगें तटीय चट्टान पर प्रहार कर उसे काटकर भृगु और तरंग-कटे चबूतरे बनाती हैं और रेत को दूसरी जगह ले जाकर पुलिन बनाती हैं।'),
};

function viewGradation(S) {
  const r = G.run({ rain: S.rain, rock: S.rock, agent: S.agent, vegetation: S.veg, relief: 100 }, S.years), p0 = G.initialProfile(100);
  const ch = new Chart({ xMax: G.N - 1, yMax: 110, xLabel: P('Source → mouth (downstream)', 'स्रोत → मुहाना (अनुप्रवाह)'), yLabel: P('Height (units)', 'ऊँचाई (इकाई)'), xTicks: 4, yTicks: 5 });
  ch.axes();
  ch.line(p0.map((y, i) => [i, y]), 'orig');
  const top = r.profile.map((y, i) => [i, y]);
  ch.poly([...top, [G.N - 1, 0], [0, 0]], `rock ${S.rock === 'soft' ? 'soft' : S.rock === 'hard' ? 'hard' : ''}`);
  ch.line(top, 'curve k');
  r.profile.forEach((y, i) => { if (y > p0[i] + 0.4) ch.poly([[i - 0.5, y], [i + 0.5, y], [i + 0.5, p0[i]], [i - 0.5, p0[i]]], 'dep'); });
  ch.text(G.N - 2, 104, P('- - original surface', '- - मूल धरातल'), 'lbl', 'end');
  const lowered = ((p0[0] - r.profile[0]) / p0[0]) * 100, lines = [
    { en: `After ${S.years} years: ${fmt(r.eroded, 0)} units weathered and carried away (erosion), ${fmt(r.deposited, 0)} units laid down on the way (deposition), ${fmt(r.sea, 0)} units reached the sea.`, hi: `${S.years} वर्ष बाद: ${fmt(r.eroded, 0)} इकाई घिसकर बहाई गई (अपरदन), ${fmt(r.deposited, 0)} इकाई रास्ते में जमा हुई (निक्षेपण), ${fmt(r.sea, 0)} इकाई समुद्र तक पहुँची।` },
    { en: `The source has been lowered by ${fmt(lowered, 0)}%. Dashed line = the starting land surface; tan blocks = new deposits.`, hi: `स्रोत ${fmt(lowered, 0)}% नीचे हो गया। बिंदुकित रेखा = शुरुआती धरातल; पीले खंड = नया निक्षेपण।`, cls: 'note' },
    AGENT_NOTE[S.agent],
  ];
  return {
    plate: {
      src: 'assets/images/plates/t02-landforms.jpg',
      en: 'An illustrated mountain and river scene, not a map: tap a pin to compare surface processes with places in India.',
      hi: 'पर्वत और नदी का एक चित्र, मानचित्र नहीं: भारत के स्थानों की प्रक्रियाओं से तुलना करने के लिए बिंदु चुनें।',
      spots: [
        { x: 35, y: 20, en: 'Glacier headwaters · compare the Himalaya', hi: 'हिमनद उद्गम · हिमालय से तुलना', detail: b('Glaciers can carve U-shaped valleys and leave moraines in the high Himalaya.', 'उच्च हिमालय में हिमनद U-आकार की घाटियाँ काट सकते हैं और हिमोढ़ छोड़ते हैं।'), set: { agent: 'glacier', years: 70 } },
        { x: 38, y: 66, en: 'River sediments · compare the Ganga plain', hi: 'नदी अवसाद · गंगा मैदान से तुलना', detail: b('The Ganga, Son, Gandak and Kosi carry and deposit alluvium on the plains; this picture is not Patna.', 'गंगा, सोन, गंडक और कोसी मैदानों में जलोढ़ ढोती और जमा करती हैं; यह चित्र पटना का नहीं है।'), set: { agent: 'river', rain: 0.85, rock: 'soft', veg: 0.3 } },
        { x: 74, y: 74, en: 'Vegetated terraces', hi: 'वनस्पति रक्षित ढाल', detail: b('Tree roots and crops bind topsoil — watch erosion fall when vegetation rises.', 'जड़ें और वनस्पति मिट्टी को थामकर कटाव घटाती हैं।'), set: { veg: 0.85 } },
      ],
    },
    svg: ch.html({ label: P('Land profile', 'भूमि का परिच्छेद') }), aria: `Land profile after ${S.years} years: ${fmt(r.eroded, 0)} eroded, ${fmt(r.deposited, 0)} deposited.`, lines,
  };
}
const run = (S, o) => G.run({ rain: S.rain, rock: S.rock, agent: S.agent, vegetation: S.veg, ...o }, S.years);

export const gradation = {
  id: 'T02.L4',
  objective: b('Explain how weathering, erosion and deposition reshape land, and how rock type, rainfall, vegetation and the agent of gradation change the result.', 'समझाएँ कि अपक्षय, अपरदन और निक्षेपण भूमि को कैसे बदलते हैं, और चट्टान का प्रकार, वर्षा, वनस्पति तथा अपरदन-कारक परिणाम को कैसे प्रभावित करते हैं।'),
  note: { kind: 'schematic', en: 'Teaching units; real rates vary enormously with climate, rock and time.', hi: 'शिक्षण-इकाइयाँ; वास्तविक दरें जलवायु, चट्टान और समय के अनुसार बहुत भिन्न होती हैं।' },
  init: () => ({ agent: 'river', rock: 'medium', rain: 0.5, veg: 0.2, years: 40 }),
  controls: [
    { id: 'agent', type: 'chips', label: b('Agent of gradation', 'अपरदन का कारक'), options: Object.entries(AG).map(([id, o]) => ({ id, ...o })) },
    { id: 'rock', type: 'chips', label: b('Rock type', 'चट्टान का प्रकार'), options: Object.entries(RK).map(([id, o]) => ({ id, ...o })) },
    { id: 'rain', type: 'slider', label: b('Rainfall', 'वर्षा'), min: 0, max: 1, step: 0.05, fmt: pct },
    { id: 'veg', type: 'slider', label: b('Vegetation cover', 'वनस्पति आवरण'), min: 0, max: 1, step: 0.05, fmt: pct, hint: b('Roots and leaves hold soil in place.', 'जड़ें और पत्ते मिट्टी को थामे रखते हैं।') },
    { id: 'years', type: 'slider', label: b('Time passed (years)', 'बीता समय (वर्ष)'), min: 0, max: 100, step: 1 },
  ],
  view: viewGradation,
  discover: [
    b('Set vegetation to 0% then 100% and watch the eroded total. What do forests do for hillsides?', 'वनस्पति को 0% और फिर 100% करें और अपरदन की कुल मात्रा देखें। वन पहाड़ी ढलानों के लिए क्या करते हैं?'),
    b('Switch between soft and hard rock. Which one keeps its height longer?', 'मुलायम और कठोर चट्टान के बीच बदलें। कौन-सी अपनी ऊँचाई अधिक समय तक बनाए रखती है?'),
    b('Find where the tan deposits build up. Is it near the steep source or the gentle mouth?', 'देखें पीले निक्षेप कहाँ जमा होते हैं। क्या वे तीव्र स्रोत के पास हैं या समतल मुहाने के पास?'),
    b('Compare river deposition on the Ganga plain with wind deposition in the Thar. Which material is moved by each agent? Find both regions in the L5 atlas.', 'गंगा मैदान के नदी निक्षेपण की थार के पवन निक्षेपण से तुलना करें। प्रत्येक कारक क्या ढोता है? L5 एटलस में दोनों क्षेत्र खोजें।'),
    b('Field or photo inquiry: from a safe public viewpoint, or using a photograph, describe soil, slope and vegetation near your home. What evidence might suggest water or wind has moved material? Do not enter floodwater or approach unstable banks.', 'क्षेत्र या चित्र-जाँच: किसी सुरक्षित सार्वजनिक स्थान या चित्र से घर के पास की मिट्टी, ढलान और वनस्पति का वर्णन करें। कौन-सा प्रमाण जल या पवन द्वारा सामग्री ढोने का संकेत दे सकता है? बाढ़ के पानी या अस्थिर किनारों के पास न जाएँ।'),
  ],
  predictions: [
    { id: 'p1', stem: b('In the river model, rainfall rises from 30% to 90% (rock and vegetation stay the same). In 40 years the land will be eroded…', 'नदी मॉडल में वर्षा 30% से 90% हो जाती है (चट्टान व वनस्पति वही रहती हैं)। 40 वर्षों में भूमि का अपरदन होगा…'), options: [{ id: 'more', ...b('More', 'अधिक') }, { id: 'less', ...b('Less', 'कम') }, { id: 'same', ...b('The same', 'समान') }],
      run: (S) => { S.agent = 'river'; S.years = 40; const a = run(S, { rain: 0.3 }).eroded; S.rain = 0.9; const c = run(S, {}).eroded; return c > a * 1.05 ? 'more' : c < a * 0.95 ? 'less' : 'same'; },
      explain: (S) => ({ en: `Rain adds running water to wash loosened material downslope: ${fmt(run(S, {}).eroded, 0)} units moved now compared with ${fmt(run(S, { rain: 0.3 }).eroded, 0)} at 30% rain.`, hi: `वर्षा बहता जल जोड़ती है जो ढीली सामग्री को ढलान से नीचे बहा देता है: अब ${fmt(run(S, {}).eroded, 0)} इकाई खिसकी, जबकि 30% वर्षा पर ${fmt(run(S, { rain: 0.3 }).eroded, 0)} इकाई।` }) },
    { id: 'p2', stem: b('Along a river, where is most material DEPOSITED?', 'नदी के साथ-साथ अधिकतर पदार्थ कहाँ जमा होता है?'), options: [{ id: 'upper', ...b('Steep upper course', 'तीव्र ऊपरी मार्ग') }, { id: 'lower', ...b('Gentle lower course and mouth', 'समतल निचला मार्ग और मुहाना') }],
      run: (S) => { S.agent = 'river'; S.years = 60; const r = run(S, {}), p0 = G.initialProfile(100); let up = 0, lo = 0; r.profile.forEach((y, i) => { const d = Math.max(0, y - p0[i]); if (i < G.N / 2) up += d; else lo += d; }); return lo >= up ? 'lower' : 'upper'; },
      explain: () => ({ en: 'Where the slope flattens the water slows and can no longer carry its load, so sand and silt settle: floodplains and deltas.', hi: 'जहाँ ढाल समतल होती है वहाँ जल धीमा होकर अपना भार नहीं ढो पाता, इसलिए रेत और गाद बैठ जाती है: बाढ़ के मैदान और डेल्टा।' }) },
    { id: 'p3', stem: b('After a Ganga flood near Patna, water leaves fresh silt on a field. Is the silt being eroded or deposited?', 'पटना के पास गंगा की बाढ़ के बाद पानी खेत पर नई गाद छोड़ता है। गाद का अपरदन हो रहा है या निक्षेपण?'), options: [{ id: 'dep', ...b('Deposition — the river leaves sediment on the floodplain', 'निक्षेपण — नदी बाढ़-मैदान पर अवसाद छोड़ती है') }, { id: 'ero', ...b('Erosion — material is being removed from the field', 'अपरदन — खेत से सामग्री हटाई जा रही है') }],
      run: (S) => { S.agent = 'river'; S.rock = 'soft'; S.veg = 0.3; S.rain = 0.9; S.years = 60; return run(S, {}).deposited > 0 ? 'dep' : 'ero'; },
      explain: () => b('Settling silt is deposition and can renew alluvial soil. Floods can also erode land and damage homes or crops. This simplified river model does not forecast a Patna flood.', 'गाद का जमना निक्षेपण है और इससे जलोढ़ मिट्टी नई हो सकती है। बाढ़ भूमि काट भी सकती है और घरों या फसलों को हानि पहुँचा सकती है। यह सरल नदी-मॉडल पटना की बाढ़ का पूर्वानुमान नहीं है।') },
  ],
  exit: [
    { id: 'e1', stem: b('Which statement correctly separates weathering from erosion?', 'कौन-सा कथन अपक्षय और अपरदन को सही अलग करता है?'), correct: 'a', options: [
      { id: 'a', ...b('Weathering breaks rock down in place; erosion carries the pieces away.', 'अपक्षय चट्टान को वहीं तोड़ता है; अपरदन टुकड़ों को दूर ले जाता है।') },
      { id: 'b', ...b('Weathering carries rock away; erosion breaks it down in place.', 'अपक्षय चट्टान को दूर ले जाता है; अपरदन उसे वहीं तोड़ता है।'), why: b('That is reversed: breaking down in place is weathering.', 'यह उलटा है: वहीं टूटना अपक्षय है।') },
      { id: 'c', ...b('They are two names for the same process.', 'ये एक ही प्रक्रिया के दो नाम हैं।'), why: b('They are different: one breaks rock, the other moves it.', 'ये अलग हैं: एक चट्टान तोड़ता है, दूसरा उसे हटाता है।') }],
      explain: b('Weathering = breakdown in place. Erosion = removal and transport. Deposition = laying material down.', 'अपक्षय = वहीं टूटना। अपरदन = हटाना और ढोना। निक्षेपण = सामग्री जमा करना।'), hint: b('Which one needs a moving agent such as water, wind or ice?', 'किसे जल, पवन या हिम जैसे गतिशील कारक की आवश्यकता होती है?') },
    { id: 'e2', stem: b('Why do forests reduce soil erosion on a hillside?', 'वन पहाड़ी ढलान पर मिट्टी का कटाव क्यों घटाते हैं?'), correct: 'roots', options: [
      { id: 'roots', ...b('Roots bind the soil and leaves soften the impact of rain.', 'जड़ें मिट्टी को बाँधती हैं और पत्ते वर्षा की चोट को कम करते हैं।') },
      { id: 'more', ...b('Forests bring more rain, which holds soil down.', 'वन अधिक वर्षा लाते हैं जो मिट्टी को दबाए रखती है।'), why: b('Rain on bare soil causes more erosion, not less. Check the vegetation slider.', 'नंगी मिट्टी पर वर्षा से अपरदन अधिक होता है, कम नहीं। वनस्पति स्लाइडर देखें।') }],
      explain: b('Plant cover protects and holds the surface, so the same rain moves much less soil.', 'वनस्पति आवरण सतह की रक्षा करता और उसे थामे रखता है, इसलिए उसी वर्षा से बहुत कम मिट्टी खिसकती है।'), hint: b('Compare 0% and 100% vegetation on the graph.', 'ग्राफ़ पर 0% और 100% वनस्पति की तुलना करें।') },
  ],
  reflect: b('Name a place near you where soil is being removed or deposited and say which agent is responsible.', 'अपने आसपास का कोई स्थान बताएँ जहाँ मिट्टी हट रही या जमा हो रही है और कौन-सा कारक ज़िम्मेदार है।'),
};

// ---------------- T02.L5 Landform gallery (3D + 2D) ----------------
const LF_INFO = {
  river: { en: 'Erosion: V-shaped valley, gorge, waterfall nickpoint (e.g. Hundru on Subarnarekha, Dhuandhar on Narmada). Deposition: meander floodplain, oxbow lake, Sundarbans delta.', hi: 'अपरदन: V-आकार घाटी, गॉर्ज, जलप्रपात (जैसे हुंडरू व धुआँधार)। निक्षेपण: विसर्प, गोखुर झील, सुंदरबन डेल्टा।' },
  waves: { en: 'Erosion: sea cliff, sea cave, arch and stack. Deposition: sandy beach, spit and lagoon (e.g. Chilika).', hi: 'अपरदन: समुद्री भृगु, गुफा, मेहराब व स्टैक। निक्षेपण: पुलिन, स्पिट व लैगून (जैसे चिल्का)।' },
  wind: { en: 'Erosion: mushroom rock and deflation hollow. Deposition: crescent barchan dunes (Thar Desert) and loess plains.', hi: 'अपरदन: छत्रक शैल व अपवाहन गर्त। निक्षेपण: अर्धचंद्राकार बरखान टिब्बे (थार) व लोयस।' },
  glacier: { en: 'Erosion: cirque, pyramidal peak and U-shaped valley. Deposition: lateral and terminal moraines in upper Himalaya.', hi: 'अपरदन: सर्क, हिमशृंग व U-आकार घाटी। निक्षेपण: हिमोढ़ (उच्च हिमालय)।' },
  groundwater: { en: 'Erosion: sinkholes and limestone caverns. Deposition: hanging stalactites and rising stalagmites (e.g. Meghalaya caves).', hi: 'अपरदन: घोलरंध्र व चूना-पत्थर कंदराएँ। निक्षेपण: स्टैलेक्टाइट व स्टैलेग्माइट (मेघालय गुफाएँ)।' },
};
const LF_NAMES = { river: b('River', 'नदी'), waves: b('Waves & currents', 'तरंगें व धाराएँ'), wind: b('Wind', 'पवन'), glacier: b('Glacier', 'हिमनद'), groundwater: b('Underground water', 'भूमिगत जल') };

export const landformGallery = {
  id: 'T02.L5',
  objective: b('Compare the erosional and depositional landforms shaped by rivers, sea waves, wind, glaciers and underground water.', 'नदी, समुद्री तरंगों, पवन, हिमनद और भूमिगत जल द्वारा निर्मित अपरदनात्मक और निक्षेपात्मक स्थलाकृतियों की तुलना करें।'),
  note: { kind: 'schematic', en: '3D terrain models + labelled 2D cross-section twin across the 5 NCERT gradation agents.', hi: 'सभी 5 एनसीईआरटी समतलीकरण कारकों के 3D मॉडल व नामांकित 2D काट-चित्र।' },
  init: () => ({ agent: 'river', stage: 0.6 }),
  controls: [
    { id: 'agent', type: 'chips', label: b('Agent', 'कारक'), options: G.LANDFORM_AGENTS.map((id) => ({ id, ...LF_NAMES[id] })) },
    { id: 'stage', type: 'slider', label: b('Maturity / relief stage', 'परिपक्वता / विकास अवस्था'), min: 0.1, max: 1.0, step: 0.05, fmt: pct },
  ],
  view(S) {
    const s = S.stage;
    let g = `<rect class="sea-fill" x="0" y="0" width="640" height="230" rx="8"/>`;
    if (S.agent === 'river') {
      const cut = 55 + s * 65;
      g += `<polygon class="rock" points="0,60 220,60 320,${cut} 420,60 640,60 640,230 0,230"/>`;
      g += `<rect class="pl-water" x="285" y="${cut - 10}" width="70" height="${230 - cut + 10}"/>`;
      g += `<text class="txt b" x="320" y="34" text-anchor="middle">${esc(P('V-shaped valley cross-section', 'V-आकार की नदी घाटी'))}</text>`;
    } else if (S.agent === 'waves') {
      const notch = s * 45;
      g += `<rect class="rock" x="40" y="40" width="${210 - notch}" height="170"/><rect class="rock" x="${300 + notch * 0.4}" y="75" width="42" height="135"/>`;
      g += `<rect class="pl-water" x="180" y="135" width="430" height="75"/><polygon class="dep" points="450,195 610,175 610,210 450,210"/>`;
      g += `<text class="txt b" x="320" y="30" text-anchor="middle">${esc(P('Sea cliff, stack & beach deposit', 'समुद्री भृगु, स्टैक व पुलिन'))}</text>`;
    } else if (S.agent === 'wind') {
      const h = 45 + s * 65;
      g += `<rect class="dep" x="0" y="185" width="640" height="45"/><path class="rock soft" d="M120,185 Q240,${185 - h} 310,${185 - h * 0.85} L360,185 Z"/><path class="rock soft" d="M370,185 Q460,${185 - h * 0.8} 510,${185 - h * 0.7} L550,185 Z"/>`;
      g += `<text class="txt b" x="320" y="30" text-anchor="middle">${esc(P('Windward gentle slope & leeward slip face (Barchan)', 'पवनमुखी ढाल व पवनविमुखी खड़ी ढाल (बरखान)'))}</text>`;
    } else if (S.agent === 'glacier') {
      g += `<path class="rock hard" d="M0,45 L150,45 Q210,190 320,190 Q430,190 490,45 L640,45 L640,230 L0,230 Z"/>`;
      g += `<path fill="#e3f6ff" stroke="#7eb8d6" stroke-width="2" d="M190,${105 + s * 40} Q320,${190} 450,${105 + s * 40} Q320,190 190,${105 + s * 40}"/>`;
      g += `<text class="txt b" x="320" y="30" text-anchor="middle">${esc(P('Broad flat-floored U-shaped glacial valley', 'सपाट तल वाली U-आकार हिमनद घाटी'))}</text>`;
    } else {
      g += `<rect class="rock" x="30" y="45" width="580" height="165" rx="6"/><ellipse cx="320" cy="145" rx="${90 + s * 70}" ry="48" fill="#1e293b"/>`;
      for (let i = -2; i <= 2; i++) g += `<polygon fill="#e2dcc8" points="${312 + i * 34},98 ${320 + i * 34},${118 + s * 16} ${328 + i * 34},98"/>`;
      g += `<text class="txt b" x="320" y="30" text-anchor="middle">${esc(P('Limestone cavern & stalactites (Karst)', 'चूना-पत्थर कंदरा व स्टैलेक्टाइट'))}</text>`;
    }
    return {
      plate: {
        src: 'assets/images/plates/t02-landforms.jpg',
        en: 'An illustrated mountain and river scene, not a map. The pins let you compare processes, including wind and waves elsewhere.',
        hi: 'पर्वत और नदी का एक चित्र, मानचित्र नहीं। बिंदुओं से अन्य जगहों की पवन और तरंग सहित प्रक्रियाओं की तुलना करें।',
        spots: [
          { x: 36, y: 20, en: 'Compare glacier landforms', hi: 'हिमनद स्थलाकृतियों से तुलना', detail: b('Switch to a glacier U-valley and moraines.', 'हिमनद की U-घाटी व हिमोढ़ देखें।'), set: { agent: 'glacier', stage: 0.75 } },
          { x: 38, y: 66, en: 'Compare river landforms', hi: 'नदी स्थलाकृतियों से तुलना', detail: b('Switch to river V-valley erosion and read about deposits downstream.', 'नदी की V-घाटी देखें और नीचे की ओर निक्षेपण के बारे में पढ़ें।'), set: { agent: 'river', stage: 0.65 } },
          { x: 14, y: 46, en: 'Compare wind landforms', hi: 'पवन स्थलाकृतियों से तुलना', detail: b('Switch to wind-shaped barchan dunes.', 'पवन से बने बरखान टिब्बे देखें।'), set: { agent: 'wind', stage: 0.7 } },
          { x: 64, y: 74, en: 'Compare coastal landforms', hi: 'तटीय स्थलाकृतियों से तुलना', detail: b('Switch to a sea cliff and beach; this image is not a coast.', 'समुद्री भृगु और पुलिन देखें; यह चित्र तट का नहीं है।'), set: { agent: 'waves', stage: 0.7 } },
        ],
      },
      svg: `<svg viewBox="0 0 640 230" class="chart" role="img" xmlns="http://www.w3.org/2000/svg">${g}</svg>`,
      aria: `${LF_NAMES[S.agent].en} landform cross-section`,
      lines: [
        { en: `${LF_NAMES[S.agent].en} (stage ${pct(S.stage)}):`, hi: `${LF_NAMES[S.agent].hi} (अवस्था ${pct(S.stage)}):`, cls: 'balanced' },
        LF_INFO[S.agent],
      ],
    };
  },
  discover: [
    b('Compare the River V-shaped valley with the Glacier U-shaped valley. Why does ice carve wider walls than water?', 'नदी की V-आकार घाटी की हिमनद की U-आकार घाटी से तुलना करें। हिम जल की अपेक्षा चौड़ी दीवारें क्यों काटता है?'),
    b('Switch to Underground water and raise maturity. Where do stalactites grow from?', 'भूमिगत जल चुनें और परिपक्वता बढ़ाएँ। स्टैलेक्टाइट कहाँ से नीचे लटकते हैं?'),
    b('In the atlas, compare the Himalaya, Ganga plain, Deccan, Thar, coast, two island groups and Meghalaya. Which process shaped each? Which are NOT formed by the agent shown in the gallery?', 'एटलस में हिमालय, गंगा मैदान, दक्कन, थार, तट, दोनों द्वीप-समूहों और मेघालय की तुलना करें। प्रत्येक को किस प्रक्रिया ने आकार दिया? किसकी उत्पत्ति दीर्घा में दिखाए कारक से नहीं हुई?'),
    b('Using a map, textbook or safe photograph of the Ganga plain, compare older Bhangar with newer Khadar alluvium. What more evidence would you need to identify a particular site?', 'गंगा मैदान के मानचित्र, पाठ्यपुस्तक या सुरक्षित चित्र से पुरानी भांगर और नई खादर जलोढ़ की तुलना करें। किसी विशेष स्थान की पहचान के लिए और कौन-सा प्रमाण चाहिए?'),
  ],
  predictions: [
    {
      id: 'p1',
      stem: b('Which gradation agent carves a broad U-shaped valley and leaves terminal moraines?', 'कौन-सा कारक चौड़ी U-आकार की घाटी बनाता और अंतिम हिमोढ़ छोड़ता है?'),
      options: [opt('glacier', 'Glacier', 'हिमनद'), opt('wind', 'Wind', 'पवन')],
      run: (S) => { S.agent = 'glacier'; S.stage = 0.7; return 'glacier'; },
      explain: () => b('Moving glacier ice grinds both valley walls and the floor into a U shape and dumps unsorted debris called moraines.', 'बहता हिमनद घाटी की दीवारों और तल दोनों को घिसकर U आकार देता है और हिमोढ़ छोड़ता है।'),
    },
  ],
  exit: [
    {
      id: 'e1',
      stem: b('Barchan sand dunes in the Thar Desert are formed by the action of…', 'थार मरुस्थल के बरखान बालू-टिब्बे किसकी क्रिया से बनते हैं?'),
      correct: 'wind',
      options: [
        { id: 'wind', ...b('Wind deposition', 'पवन निक्षेपण') },
        { id: 'gw', ...b('Underground karst caves', 'भूमिगत कार्स्ट कंदराएँ'), why: b('Karst caves form by limestone dissolution, not desert wind.', 'कार्स्ट कंदराएँ चूना-पत्थर के घुलने से बनती हैं, मरुस्थलीय पवन से नहीं।') },
      ],
      explain: b('Wind lifts loose desert sand and deposits crescent-shaped barchan dunes.', 'पवन ढीली मरुस्थलीय रेत को उड़ाकर अर्धचंद्राकार बरखान टिब्बों के रूप में जमा करती है।'),
      hint: b('Select Wind in the agent chips.', 'कारक विकल्पों में पवन चुनें।'),
    },
    {
      id: 'e2',
      stem: b('What mainly built the alluvial Northern Plains, including much of Bihar?', 'बिहार के बड़े भाग सहित जलोढ़ उत्तरी मैदान मुख्यतः किससे बने हैं?'),
      correct: 'river',
      options: [
        { id: 'river', ...b('River deposition of sediment', 'नदियों द्वारा अवसाद का निक्षेपण') },
        { id: 'wind', ...b('Wind deposition from the desert', 'मरुस्थलीय पवन से निक्षेपण'), why: b('Wind builds Thar dunes; the Northern Plains are largely river alluvium.', 'पवन थार में टिब्बे बनाती है; उत्तरी मैदान मुख्यतः नदी जलोढ़ हैं।') },
      ],
      explain: b('Rivers deposit alluvium. Near the foothills, Bhabar is pebbly and Terai is often marshy; farther out, older Bhangar and newer floodplain Khadar are types of alluvial plain, not a fixed north-to-south sequence.', 'नदियाँ जलोढ़ जमा करती हैं। तलहटी के पास भाबर कंकड़ीला और तराई प्रायः दलदली है; आगे पुरानी भांगर और बाढ़-मैदान की नई खादर जलोढ़ मैदान के प्रकार हैं, कोई तय उत्तर-दक्षिण क्रम नहीं।'),
      hint: b('In the atlas, read what the Ganga and its tributaries carry onto the plain.', 'एटलस में पढ़ें कि गंगा और उसकी सहायक नदियाँ मैदान में क्या लाती हैं।'),
    },
  ],
  reflect: b('Choose a landform near you or in the atlas. Explain one process that helped shape it and what evidence you would look for.', 'अपने पास या एटलस की एक स्थलाकृति चुनें। उसे आकार देने वाली एक प्रक्रिया और उसके लिए खोजे जाने वाले प्रमाण बताएँ।'),
};

// ---------------- T02.L6 Slope stability, GLOF & disaster mitigation ----------------
export const hazardLab = {
  id: 'T02.L6',
  objective: b('Explore factors affecting slope stability, then discuss glacial lake outburst floods (GLOFs) as a separate hazard.', 'ढलान की स्थिरता को प्रभावित करने वाले कारक परखें, फिर हिमनद झील प्रस्फोट बाढ़ (GLOF) की अलग खतरे के रूप में चर्चा करें।'),
  note: { kind: 'schematic', en: 'The slope index is a teaching comparison, not a probability or site forecast. The lake toggle illustrates a separate hazard; it does not calculate GLOF arrival times or protective measures.', hi: 'ढलान सूचकांक शिक्षण-तुलना है, संभावना या स्थल का पूर्वानुमान नहीं। झील का बटन अलग खतरा दिखाता है; यह GLOF पहुँचने का समय या बचाव के उपाय नहीं निकालता।' },
  init: () => ({ slope: 36, rain: 140, forest: 40, glof: false, wall: false }),
  controls: [
    { id: 'slope', type: 'slider', label: b('Hill slope angle (°)', 'पहाड़ी ढलान कोण (°)'), min: 15, max: 60, step: 1, fmt: (v) => `${v}°` },
    { id: 'rain', type: 'slider', label: b('24h rainfall (mm)', '24 घंटे की वर्षा (मिमी)'), min: 0, max: 300, step: 10, fmt: (v) => `${v} mm` },
    { id: 'forest', type: 'slider', label: b('Slope forest cover', 'ढलान वन आवरण'), min: 0, max: 100, step: 5, fmt: (v) => `${v}%` },
    { id: 'glof', type: 'toggle', label: b('Moraine-dammed glacial lake upstream', 'ऊपर हिमोढ़-बाँध वाली हिमनद झील') },
    { id: 'wall', type: 'toggle', label: b('Retaining wall + drainage (slope model)', 'प्रतिरोधी दीवार + जल निकासी (ढलान मॉडल)') },
  ],
  view(S) {
    // GLOF is a separate qualitative scenario; the slope index is not a flood model.
    const res = G.slopeHazard({ slopeDeg: S.slope, rainMm: S.rain, forestPct: S.forest, checkWall: S.wall });
    const rad = (S.slope * Math.PI) / 180;
    const xTop = 120, yBot = 215, runW = 240, yTop = Math.max(25, yBot - Math.tan(rad) * runW * 0.68);
    const col = res.status === 'critical' ? '#c0392b' : res.status === 'elevated' ? '#d97706' : '#146c2e';
    let g = `<rect class="sea-fill" x="0" y="0" width="640" height="240" rx="8"/>`;
    g += `<polygon class="rock" points="30,${yTop.toFixed(0)} ${xTop},${yTop.toFixed(0)} ${xTop + runW},${yBot} 30,${yBot}"/>`;
    if (S.glof) g += `<rect x="45" y="${(yTop - 16).toFixed(0)}" width="62" height="18" rx="4" fill="#38bdf8" stroke="#0284c7" stroke-width="2"/><text class="txt sm b" x="76" y="${(yTop - 22).toFixed(0)}" text-anchor="middle">${esc(P('Glacial lake', 'हिमनद झील'))}</text>`;
    const trees = Math.round(S.forest / 20);
    for (let i = 0; i < trees; i++) {
      const f = (i + 0.5) / 5, tx = xTop + f * runW, ty = yTop + f * (yBot - yTop);
      g += `<polygon fill="#1b7a43" points="${tx.toFixed(0)},${(ty - 24).toFixed(0)} ${(tx - 9).toFixed(0)},${(ty - 4).toFixed(0)} ${(tx + 9).toFixed(0)},${(ty - 4).toFixed(0)}"/>`;
    }
    if (S.wall) g += `<rect x="${xTop + runW - 10}" y="${yBot - 36}" width="18" height="36" fill="#475569" stroke="#1e293b" stroke-width="2"/>`;
    // The index is illustrative, not a failure probability or a GLOF forecast.
    g += `<text class="txt b" x="480" y="46" text-anchor="middle">${esc(P('Slope model index', 'ढलान मॉडल सूचकांक'))}</text>`;
    g += `<rect x="405" y="64" width="150" height="26" rx="6" fill="var(--line)"/><rect x="405" y="64" width="${(res.riskPct * 1.5).toFixed(0)}" height="26" rx="6" fill="${col}"/>`;
    const label = res.status === 'critical' ? P('higher', 'अधिक') : res.status === 'elevated' ? P('middle', 'मध्यम') : P('lower', 'कम');
    g += `<text class="txt b" x="480" y="114" text-anchor="middle" fill="${col}">${res.riskPct}/100 · ${esc(label)}</text>`;
    if (S.glof) g += `<text class="txt sm" x="480" y="146" text-anchor="middle">${esc(P('GLOF: separate hazard', 'GLOF: अलग खतरा'))}</text>`;
    return {
      plate: {
        src: 'assets/images/plates/t02-hazards.jpg',
        en: 'Illustrated mountain scene, not a map: use the pins to explore the slope model and a separate glacial-lake hazard.',
        hi: 'पर्वतीय दृश्य का चित्र, मानचित्र नहीं: बिंदुओं से ढलान मॉडल और हिमनद झील का अलग खतरा देखें।',
        spots: [
          { x: 22, y: 34, en: 'Conifer Slope Forest', hi: 'कोणधारी वन ढाल', detail: b('Roots can help hold soil in place (set forest cover to 85% in the model).', 'जड़ें मिट्टी को थामने में मदद कर सकती हैं (मॉडल में वन आवरण 85% करें)।'), set: { forest: 85, slope: 32 } },
          { x: 68, y: 40, en: 'Moraine-Dammed Glacial Lake', hi: 'हिमोढ़-बाँध हिमनद झील', detail: b('Explore the separate hazard of a sudden glacial-lake outburst; the slope index does not forecast it.', 'हिमनद झील के अचानक फटने का अलग खतरा देखें; ढलान सूचकांक उसका पूर्वानुमान नहीं करता।'), set: { glof: true } },
          { x: 44, y: 65, en: 'Retaining Wall & Road Cut', hi: 'प्रतिरोधी दीवार व सड़क कटाव', detail: b('Try a retaining wall and drainage in the slope model. Actual design requires site-specific engineering.', 'ढलान मॉडल में प्रतिरोधी दीवार और निकासी आज़माएँ। वास्तविक निर्माण के लिए स्थल की अभियांत्रिकी जाँच चाहिए।'), set: { wall: true } },
        ],
      },
      svg: `<svg viewBox="0 0 640 240" class="chart" role="img" xmlns="http://www.w3.org/2000/svg">${g}</svg>`,
      aria: P(`Slope ${S.slope} degrees, rainfall ${S.rain} mm: teaching index ${res.riskPct} out of 100.`, `ढलान ${S.slope} डिग्री, वर्षा ${S.rain} मिमी: शिक्षण सूचकांक 100 में ${res.riskPct}।`),
      lines: [
        { en: `Model stability ratio ${fmt(res.factorOfSafety, 2)} → slope index ${res.riskPct}/100. This is not a probability.`, hi: `मॉडल स्थिरता अनुपात ${fmt(res.factorOfSafety, 2)} → ढलान सूचकांक ${res.riskPct}/100। यह संभावना नहीं है।`, cls: res.status === 'critical' ? 'warn' : res.status === 'stable' ? 'balanced' : '' },
        S.glof ? { en: 'A glacial-lake dam can fail suddenly and send water and debris down a valley. Arrival times vary; this model cannot predict them. Follow local warnings.', hi: 'हिमनद झील का बाँध अचानक टूटकर घाटी में पानी और मलबा भेज सकता है। पहुँचने का समय बदलता है; यह मॉडल उसका पूर्वानुमान नहीं कर सकता। स्थानीय चेतावनियाँ मानें।', cls: 'warn' } : { en: 'Switch on the glacial lake to discuss GLOF separately from the slope index.', hi: 'ढलान सूचकांक से अलग GLOF की चर्चा करने के लिए हिमनद झील चालू करें।', cls: 'note' },
      ],
    };
  },
  discover: [
    b('Cut forest cover to 0% on a 45° slope during 220 mm rain, then enable retaining wall + drainage. How much does risk fall?', '220 मिमी वर्षा में 45° ढलान पर वन 0% करें, फिर प्रतिरोधी दीवार व जल-निकासी चालू करें। जोखिम कितना घटता है?'),
    b('Bihar comparison: river floods, summer heatwaves (loo is a hot, dry wind) and earthquakes can all cause harm. Name one preparedness step for each. This slope model does not predict any of them.', 'बिहार की तुलना: नदी की बाढ़, गर्मियों की भीषण गर्मी (लू गर्म, शुष्क पवन है) और भूकंप सभी हानि पहुँचा सकते हैं। हर एक के लिए तैयारी का एक कदम बताएँ। यह ढलान मॉडल इनका पूर्वानुमान नहीं करता।'),
    b('From indoors, or using a photograph, imagine wind lifting dust and later dropping it elsewhere. Which part is erosion and which is deposition? Avoid going outside in a dust storm or extreme heat.', 'घर के अंदर से या किसी चित्र की मदद से सोचें कि पवन धूल उठाकर कहीं और गिराती है। कौन-सा भाग अपरदन और कौन-सा निक्षेपण है? आँधी या भीषण गर्मी में बाहर न जाएँ।'),
  ],
  predictions: [
    {
      id: 'p1',
      stem: b('When road cutting steepens a hill slope from 25° to 50° and trees are cleared, landslide risk…', 'जब सड़क काटने से ढलान 25° से 50° हो जाता है और पेड़ कट जाते हैं, तो भूस्खलन जोखिम…'),
      options: [opt('rises', 'Rises sharply because gravity pull increases while root grip drops', 'तेज़ी से बढ़ता है क्योंकि गुरुत्व खिंचाव बढ़ता व जड़-पकड़ घटती है'), opt('falls', 'Falls because less soil remains', 'घटता है')],
      run: (S) => { const a = G.slopeHazard({ slopeDeg: 25, rainMm: 160, forestPct: 60 }).riskPct; S.slope = 50; S.forest = 0; S.rain = 160; S.glof = false; S.wall = false; const b2 = G.slopeHazard({ slopeDeg: S.slope, rainMm: S.rain, forestPct: S.forest }).riskPct; return b2 > a ? 'rises' : 'falls'; },
      explain: () => b('Steeper slope increases downward shear stress; removing roots lets rainwater saturate and slide soil.', 'अधिक ढाल नीचे की ओर खिसकाव बढ़ाती है और जड़ें हटने से वर्षा जल मिट्टी को बहा ले जाता है।'),
    },
    {
      id: 'p2',
      stem: b('In the slope model, set 45° slope, 200 mm rain and 30% forest, with no glacial lake. What happens to the index when a retaining wall and drainage are added?', 'ढलान मॉडल में 45° ढलान, 200 मिमी वर्षा और 30% वन रखें, हिमनद झील नहीं। प्रतिरोधी दीवार और जल-निकासी जोड़ने पर सूचकांक को क्या होता है?'),
      options: [opt('falls', 'It falls in this model', 'इस मॉडल में घटता है'), opt('rises', 'It rises in this model', 'इस मॉडल में बढ़ता है')],
      run: (S) => { S.slope = 45; S.rain = 200; S.forest = 30; S.glof = false; S.wall = false; const before = G.slopeHazard({ slopeDeg: S.slope, rainMm: S.rain, forestPct: S.forest }).riskPct; S.wall = true; const after = G.slopeHazard({ slopeDeg: S.slope, rainMm: S.rain, forestPct: S.forest, checkWall: S.wall }).riskPct; return after < before ? 'falls' : 'rises'; },
      explain: (S) => { const base = { slopeDeg: S.slope, rainMm: S.rain, forestPct: S.forest }; const before = G.slopeHazard(base).riskPct, after = G.slopeHazard({ ...base, checkWall: true }).riskPct; return b(`The teaching index falls from ${before} to ${after} out of 100 when the wall and drainage are enabled. It is not a probability; real slope safety depends on site conditions and engineering.`, `दीवार और जल-निकासी जोड़ने पर शिक्षण सूचकांक 100 में ${before} से ${after} होता है। यह संभावना नहीं है; वास्तविक ढलान की सुरक्षा स्थानीय दशाओं और अभियांत्रिकी पर निर्भर करती है।`); },
    },
  ],
  exit: [
    {
      id: 'e1',
      stem: b('What makes a Glacial Lake Outburst Flood (GLOF) especially dangerous for mountain valleys?', 'हिमनद झील प्रस्फोट बाढ़ (GLOF) पर्वतीय घाटियों के लिए विशेष रूप से खतरनाक क्यों है?'),
      correct: 'sudden',
      options: [
        { id: 'sudden', ...b('An unstable ice/moraine dam can break suddenly, sending water and debris down a valley with potentially little warning.', 'अस्थिर बर्फ़ या हिमोढ़ बाँध अचानक टूट सकता है और कम चेतावनी के साथ घाटी में पानी व मलबा भेज सकता है।') },
        { id: 'slow', ...b('It moves slower than normal river flow over several weeks.', 'यह कई हफ्तों में सामान्य नदी से भी धीमे बहती है।'), why: b('A breach can send a fast surge downstream; travel time varies with the location and conditions.', 'बाँध टूटने पर तेज़ लहर नीचे जा सकती है; समय स्थान और दशाओं के अनुसार बदलता है।') },
      ],
      explain: b('Lake monitoring, appropriate engineering, early warnings and evacuation plans can reduce harm. Follow local authorities; the slope model cannot predict an outburst or its arrival time.', 'झील की निगरानी, उचित अभियांत्रिकी, पूर्व-चेतावनी और निकासी योजनाएँ हानि घटा सकती हैं। स्थानीय प्रशासन की सलाह मानें; ढलान मॉडल प्रस्फोट या उसके पहुँचने का समय नहीं बताता।'),
      hint: b('Switch on the glacial lake and consider what a sudden dam failure could do.', 'हिमनद झील चालू करें और सोचें कि बाँध अचानक टूटने पर क्या हो सकता है।'),
    },
    {
      id: 'e2',
      stem: b('Which set of actions can help a family prepare for flooding, heat and earthquakes in Bihar?', 'बिहार में बाढ़, भीषण गर्मी और भूकंप से बचाव की तैयारी में कौन-से कदम मदद कर सकते हैं?'),
      correct: 'all',
      options: [
        { id: 'all', ...b('Flood: follow official warnings and avoid floodwater; heat: stay cool and drink water; earthquake: practise Drop, Cover and Hold On.', 'बाढ़: आधिकारिक चेतावनी मानें और बाढ़ के पानी से दूर रहें; गर्मी: ठंडे स्थान पर रहें और पानी पिएँ; भूकंप: झुकें, ढकें और पकड़ें का अभ्यास करें।') },
        { id: 'one', ...b('Rely only on an embankment and ignore heat and earthquake preparation.', 'केवल तटबंध पर भरोसा करें और गर्मी व भूकंप की तैयारी न करें।'), why: b('Embankments do not protect against heat or earthquakes; each hazard needs its own preparation.', 'तटबंध गर्मी या भूकंप से नहीं बचाते; प्रत्येक खतरे के लिए अलग तैयारी चाहिए।') },
      ],
      explain: b('Different hazards require different preparations. Follow local authorities during emergencies; the slope simulation does not forecast floods, heat or earthquakes.', 'अलग खतरों के लिए अलग तैयारी चाहिए। आपात स्थिति में स्थानीय प्रशासन की सलाह मानें; ढलान सिमुलेशन बाढ़, गर्मी या भूकंप का पूर्वानुमान नहीं करता।'),
      hint: b('Think about actions for all three hazards, not just one.', 'केवल एक नहीं, तीनों खतरों के लिए कदमों पर सोचें।'),
    },
  ],
  reflect: b('Name one engineering measure and one ecological measure that reduce hillside landslides, plus one flood-safety step for Bihar plains.', 'पहाड़ी भूस्खलन घटाने का एक अभियांत्रिकी और एक पारिस्थितिक उपाय, साथ ही बिहार मैदान के लिए एक बाढ़-सुरक्षा कदम लिखें।'),
};
