// T10.L2 companion: conceptual comparisons and representative surface-current paths.
// Hindi is draft pending subject-teacher review. The paths are schematic, not observations.
import { h } from '../../core/dom.js';
import { pair as P } from '../../core/i18n.js';
import { createInquiryExplorer } from '../../components/inquiry-explorer.js';
import { bi } from '../../components/widgets.js';
import { d3, GEO, loadGeoAll, worldMapSvg } from '../../engines/viz.js';

const b = (en, hi) => ({ en, hi });
const option = (id, en, hi, correct = false) => ({ id, text: b(en, hi), correct });
const waves = 'https://oceanexplorer.noaa.gov/ocean-fact/waves/';
const tides = 'https://oceanservice.noaa.gov/education/tutorial_tides/tides01_intro.html';
const gulf = 'https://oceanservice.noaa.gov/education/tutorial_currents/04currents3.html';
const peru = 'https://psl.noaa.gov/enso/glossary.html';
const india = 'https://services.incois.gov.in/documents/ResearchPapers/RP25.pdf';

export const MOTION_CASES = [
  {
    id: 'waves', label: b('Wind waves', 'पवन तरंगें'),
    evidence: b('Many familiar surface waves form as wind transfers energy to water. In deep water, the wave carries energy onward while water moves mainly in orbits; breaking waves near shore also move water.', 'परिचित सतही तरंगें अक्सर पवन से जल में ऊर्जा जाने पर बनती हैं। गहरे पानी में तरंग ऊर्जा आगे ले जाती है जबकि जल मुख्यतः वृत्ताकार गति करता है; किनारे पर टूटती तरंगें जल भी आगे ले जाती हैं।'),
    question: b('What travels across the open ocean in a wind wave?', 'खुले समुद्र में पवन तरंग के साथ क्या आगे जाता है?'),
    options: [option('energy', 'Wave energy; water mostly moves in orbits.', 'तरंग ऊर्जा; जल मुख्यतः वृत्ताकार चलता है।', true), option('river', 'Every water particle travels all the way to the beach.', 'हर जल कण समुद्र तट तक चला जाता है।')],
    explain: b('An open-ocean surface wave is not simply a river of water travelling to shore. Breaking near shore is different.', 'खुले समुद्र की सतही तरंग किनारे तक बहती जल की नदी जैसी नहीं है। तट पर उसका टूटना अलग है।'), source: waves, sourceLabel: b('NOAA · ocean waves', 'NOAA · समुद्री तरंगें'),
  },
  {
    id: 'tides', label: b('Tides', 'ज्वार-भाटा'),
    evidence: b('Tides are a regular rise and fall of sea level driven mainly by the Moon’s and Sun’s gravity. Water moving with that rise and fall is called a tidal current. Local patterns vary.', 'ज्वार-भाटा समुद्र स्तर का नियमित उठना-गिरना है जो मुख्यतः चंद्रमा और सूर्य के गुरुत्व से होता है। इस बदलाव के साथ बहते जल को ज्वारीय धारा कहते हैं। स्थानीय क्रम अलग होते हैं।'),
    question: b('What does a tide describe?', 'ज्वार-भाटा किसे दर्शाता है?'),
    options: [option('level', 'The periodic rise and fall of sea level.', 'समुद्र स्तर का आवधिक उठना और गिरना।', true), option('wind', 'Only a wind-driven wave breaking on a beach.', 'केवल तट पर टूटती पवन से बनी लहर।')],
    explain: b('Tides and tidal currents are related: one describes sea-level change, the other the accompanying flow.', 'ज्वार और ज्वारीय धारा जुड़े हैं: एक समुद्र स्तर का बदलाव है, दूसरी उसके साथ जल का बहाव।'), source: tides, sourceLabel: b('NOAA · tides', 'NOAA · ज्वार-भाटा'),
  },
  {
    id: 'gulf', label: b('G · Atlantic current', 'G · अटलांटिक धारा'),
    evidence: b('The warm Gulf Stream flows northeastward along eastern North America in the North Atlantic. Ocean circulation transports heat and can influence nearby and wider climates; winds and many other factors matter too.', 'गर्म गल्फ़ स्ट्रीम उत्तरी अटलांटिक में उत्तरी अमेरिका के पूर्वी तट के साथ उत्तर-पूर्व की ओर बहती है। महासागरीय परिसंचरण ऊष्मा ले जाता है और स्थानीय व दूर की जलवायु को प्रभावित कर सकता है; पवन और अन्य कारक भी महत्त्वपूर्ण हैं।'),
    question: b('How can a warm current influence climate?', 'गर्म धारा जलवायु को कैसे प्रभावित कर सकती है?'),
    options: [option('heat', 'It transports heat, alongside other climate factors.', 'वह अन्य कारकों के साथ ऊष्मा का परिवहन करती है।', true), option('only', 'It alone fixes the weather everywhere every day.', 'वह अकेले हर जगह का रोज़ का मौसम तय करती है।')],
    explain: b('Currents redistribute heat, but latitude, winds, land and seasons also influence climate. The arrow is a teaching sketch.', 'धाराएँ ऊष्मा बाँटती हैं, पर अक्षांश, पवन, भूमि और मौसम भी जलवायु पर असर डालते हैं। तीर शिक्षण-चित्र है।'), source: gulf, sourceLabel: b('NOAA · boundary currents', 'NOAA · सीमांत धाराएँ'),
  },
  {
    id: 'peru', label: b('P · Peru current', 'P · पेरू धारा'),
    evidence: b('The cool Peru (Humboldt) Current flows north along Chile and Peru. Coastal upwelling can bring cooler, nutrient-rich water toward the surface and support marine food webs and fisheries.', 'ठंडी पेरू (हम्बोल्ट) धारा चिली और पेरू के तट के साथ उत्तर की ओर बहती है। तटीय अपवेलन ठंडा, पोषक जल सतह के पास ला सकता है और समुद्री खाद्य-जाल तथा मत्स्यन को सहारा दे सकता है।'),
    question: b('Why can upwelling help a marine food web?', 'अपवेलन समुद्री खाद्य-जाल की मदद क्यों कर सकता है?'),
    options: [option('nutrients', 'It can bring nutrients toward sunlit surface water.', 'वह पोषक तत्त्व धूप वाली सतह के पास ला सकता है।', true), option('promise', 'It guarantees the same fish catch every day.', 'वह हर दिन समान मछली पकड़ने की गारंटी देता है।')],
    explain: b('Nutrients can support plankton and the wider food web. Upwelling, weather and catches vary; the map is not a fishing forecast.', 'पोषक तत्त्व प्लवक और व्यापक खाद्य-जाल को सहारा दे सकते हैं। अपवेलन, मौसम और पकड़ बदलते हैं; मानचित्र मत्स्य पूर्वानुमान नहीं है।'), source: peru, sourceLabel: b('NOAA · Peru current and upwelling', 'NOAA · पेरू धारा और अपवेलन'),
  },
  {
    id: 'summer', label: b('I · India summer', 'I · भारत ग्रीष्म'),
    evidence: b('A common seasonal pattern of the West India Coastal Current is southward (toward the equator) during the summer monsoon. Currents vary with place, depth and shorter-term conditions.', 'पश्चिमी भारत तटीय धारा का एक सामान्य मौसमी क्रम ग्रीष्म मानसून में दक्षिण (भूमध्य रेखा) की ओर होता है। धाराएँ स्थान, गहराई और अल्पकालिक परिस्थितियों से बदलती हैं।'),
    question: b('Does this sketch describe an exact current on every summer day?', 'क्या यह चित्र हर ग्रीष्म दिन की सटीक धारा बताता है?'),
    options: [option('pattern', 'No; it shows an approximate seasonal pattern.', 'नहीं; यह अनुमानित मौसमी क्रम दिखाता है।', true), option('always', 'Yes; direction and speed never vary.', 'हाँ; दिशा और गति कभी नहीं बदलतीं।')],
    explain: b('The seasonal pattern is useful for comparison, not navigation or a live measurement. Select India winter to compare direction.', 'मौसमी क्रम तुलना के लिए है, नौवहन या वर्तमान माप के लिए नहीं। दिशा तुलना हेतु भारत शीत चुनें।'), source: india, sourceLabel: b('Indian Journal of Geo-Marine Sciences · coastal currents', 'इंडियन जर्नल ऑफ़ जियो-मरीन साइंसेज़ · तटीय धाराएँ'),
  },
  {
    id: 'winter', label: b('I · India winter', 'I · भारत शीत'),
    evidence: b('A common winter-monsoon pattern of the West India Coastal Current is northward (away from the equator), opposite to the summer pattern. This seasonal sketch does not describe every day or depth.', 'पश्चिमी भारत तटीय धारा का एक सामान्य शीत मानसूनी क्रम उत्तर (भूमध्य रेखा से दूर) की ओर है, जो ग्रीष्म क्रम से उलटा है। यह चित्र हर दिन या गहराई नहीं दिखाता।'),
    question: b('What changed between these two seasonal examples?', 'इन दोनों मौसमी उदाहरणों में क्या बदला?'),
    options: [option('direction', 'The representative coastal-current direction.', 'तटीय धारा की दर्शाई गई दिशा।', true), option('moon', 'The Moon stopped making tides.', 'चंद्रमा ने ज्वार बनाना बंद कर दिया।')],
    explain: b('Indian coastal currents can reverse with the seasonal monsoon cycle, while tides and other influences continue.', 'भारतीय तटीय धाराएँ मानसूनी चक्र के साथ दिशा बदल सकती हैं, जबकि ज्वार और अन्य प्रभाव बने रहते हैं।'), source: india, sourceLabel: b('Indian Journal of Geo-Marine Sciences · coastal currents', 'इंडियन जर्नल ऑफ़ जियो-मरीन साइंसेज़ · तटीय धाराएँ'),
  },
];

// Representative sketches only. Each coordinate is [longitude, latitude]; no speed or extent is implied.
export const CURRENT_PATHS = [
  { id: 'gulf', mark: 'G', coords: [[-81, 26], [-78, 32], [-74, 36], [-68, 40], [-59, 42]], label: b('G: Gulf Stream, northeastward', 'G: गल्फ़ स्ट्रीम, उत्तर-पूर्व की ओर') },
  { id: 'peru', mark: 'P', coords: [[-75, -33], [-76, -25], [-79, -16], [-82, -6]], label: b('P: Peru Current, northward', 'P: पेरू धारा, उत्तर की ओर') },
  { id: 'india', mark: 'I', coords: [[71, 22], [72, 18], [73, 14], [75, 10]], label: b('I: West India, summer southward; winter northward', 'I: पश्चिम भारत, ग्रीष्म में दक्षिण; शीत में उत्तर') },
];

function mapVisual(item) {
  const current = item.id === 'summer' || item.id === 'winter' ? 'india' : item.id;
  const proj = d3.geoNaturalEarth1().scale(640 / 5.7).translate([320, 180]);
  const geoPath = d3.geoPath(proj);
  const paths = CURRENT_PATHS.map((entry) => {
    const coords = entry.id === 'india' && item.id === 'winter' ? [...entry.coords].reverse() : entry.coords;
    const selected = entry.id === current;
    const d = geoPath({ type: 'LineString', coordinates: coords }) || '';
    const [x, y] = proj(coords[coords.length - 1]);
    const [px, py] = proj(coords[coords.length - 2]);
    const angle = (Math.atan2(y - py, x - px) * 180) / Math.PI;
    const color = selected ? '#8b1e34' : '#245d76';
    return `<g data-current-path="${entry.id}"${selected ? ' data-current-selected="true"' : ''}><path d="${d}" fill="none" stroke="${color}" stroke-width="${selected ? 4.5 : 2.5}" stroke-linecap="round"/><path d="M0,0 L-10,-5 L-10,5 Z" fill="${color}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)})"/></g>`;
  }).join('');
  const markers = CURRENT_PATHS.map((entry) => {
    const [x, y] = proj(entry.coords[1]);
    const selected = entry.id === current;
    return `<g aria-hidden="true"><circle cx="${x.toFixed(1)}" cy="${(y - 15).toFixed(1)}" r="11" fill="${selected ? '#8b1e34' : '#174760'}" stroke="#fff" stroke-width="1.5"/><text x="${x.toFixed(1)}" y="${(y - 11).toFixed(1)}" fill="#fff" font-size="11" font-weight="700" text-anchor="middle">${entry.mark}</text></g>`;
  }).join('');
  const labels = CURRENT_PATHS.map((entry) => P(entry.label.en, entry.label.hi)).join('; ');
  const aria = P(`Schematic world map. ${labels}. Select a case to highlight a current.`, `योजनाबद्ध विश्व मानचित्र। ${labels}। धारा उभारने के लिए उदाहरण चुनें।`);
  const figure = h('figure', { class: 'ocean-motion-map' },
    h('div', { html: worldMapSvg({ w: 640, h: 340, aria, extraSvg: paths + markers }), 'data-motion-map': '' }),
    bi(b('Arrows show approximate example directions, not live data, precise routes or all currents. The India arrow shows summer unless winter is selected.', 'तीर अनुमानित उदाहरण दिशाएँ हैं, वर्तमान आँकड़े, सटीक मार्ग या सभी धाराएँ नहीं। भारत का तीर शीत चुनने तक ग्रीष्म दिशा दिखाता है।'), { tag: 'figcaption', cls: 'note' }));
  if (!GEO.countries && !GEO.land) figure.append(bi(b('Detailed land outlines are unavailable; use the labelled case buttons and text.', 'विस्तृत भूमि रूपरेखा उपलब्ध नहीं है; नाम वाले बटन और पाठ का उपयोग करें।'), { tag: 'p', cls: 'note' }));
  return figure;
}

export function createOceanMotion() {
  const view = createInquiryExplorer({ id: 't10-motion', storageKey: 'T10.oceanMotion', className: 'ocean-motion',
    kicker: b('COMPARE AND MAP', 'तुलना और मानचित्र'),
    title: b('Waves, tides and currents', 'तरंगें, ज्वार-भाटा और धाराएँ'),
    intro: b('Choose a motion or a current; read the evidence, answer, then compare another. Explore the tide model below.', 'किसी गति या धारा को चुनें; साक्ष्य पढ़कर उत्तर दें और दूसरे से तुलना करें। नीचे ज्वार मॉडल देखें।'),
    limit: b('Surface currents are influenced by winds, Earth’s rotation and coastlines; deeper circulation also involves density. The map and tide model are teaching tools, not local forecasts.', 'सतही धाराओं पर पवन, पृथ्वी के घूर्णन और तटों का प्रभाव है; गहरे परिसंचरण में घनत्व भी शामिल है। मानचित्र और ज्वार मॉडल शिक्षण साधन हैं, स्थानीय पूर्वानुमान नहीं।'),
    items: MOTION_CASES, visual: mapVisual,
  });
  let alive = true, requested = false;
  return { ...view,
    enable() { if (requested || !alive) return; requested = true; loadGeoAll().then(() => { if (alive) view.relabel(); }); },
    destroy() { alive = false; view.destroy(); },
  };
}
