// T02.L5 companion atlas. Markers are representative locations, not region boundaries.
// The region descriptions and Hindi translations are draft classroom syntheses.
import { h, esc } from '../../core/dom.js';
import * as i18n from '../../core/i18n.js';
import * as store from '../../core/store.js';
import { bi, relabelBi } from '../../components/widgets.js';
import { GEO, indiaMapSvg, indiaProjection } from '../../engines/viz.js';

const b = (en, hi) => ({ en, hi });
export const INDIA_LANDFORMS = [
  {
    id: 'himalaya', name: b('Himalaya', 'हिमालय'), points: [[79, 30.5]], agent: 'glacier',
    description: b('The India–Eurasia collision raised these mountains. Glaciers later carved U-shaped valleys and left moraines.', 'भारत–यूरेशिया की टक्कर से ये पर्वत उठे। बाद में हिमनदों ने U-आकार की घाटियाँ काटीं और हिमोढ़ छोड़े।'),
    comparison: b('The gallery switches to a glacier cross-section, not a model of the collision.', 'दीर्घा में हिमनद का काट-चित्र खुलेगा, टक्कर का मॉडल नहीं।'),
  },
  {
    id: 'plains', name: b('Ganga plain · Patna', 'गंगा मैदान · पटना'), points: [[85.14, 25.61]], agent: 'river',
    description: b('Rivers including the Ganga, Gandak, Kosi and Son have deposited alluvium. Khadar is newer floodplain alluvium; Bhangar is older, generally higher alluvium.', 'गंगा, गंडक, कोसी और सोन जैसी नदियों ने जलोढ़ जमा की है। खादर बाढ़-मैदान की नई जलोढ़ है; भांगर पुरानी और प्रायः ऊँची जलोढ़ है।'),
    comparison: b('The gallery shows a river-cut upper valley. Compare it with deposition on the plain; it is not a map of Patna.', 'दीर्घा नदी की काटी ऊपरी घाटी दिखाती है। इसकी तुलना मैदान में निक्षेपण से करें; यह पटना का मानचित्र नहीं है।'),
  },
  {
    id: 'deccan', name: b('Deccan plateau', 'दक्कन का पठार'), points: [[77.4, 18.1]], agent: 'river',
    description: b('Much of the western Deccan has layers of basalt from ancient lava flows. Other parts contain older crystalline rocks, and rivers have since cut valleys across the plateau.', 'पश्चिमी दक्कन के बड़े भाग में प्राचीन लावा-प्रवाहों से बनी बेसाल्ट की परतें हैं। अन्य भागों में पुरानी क्रिस्टलीय चट्टानें हैं और बाद में नदियों ने पठार पर घाटियाँ काटीं।'),
    comparison: b('The river gallery illustrates later erosion, not the volcanic formation of the plateau.', 'नदी दीर्घा बाद के अपरदन को दिखाती है, पठार की ज्वालामुखीय उत्पत्ति को नहीं।'),
  },
  {
    id: 'thar', name: b('Thar desert', 'थार मरुस्थल'), points: [[71.1, 26.9]], agent: 'wind',
    description: b('In dry, sparsely vegetated areas, wind transports sand and deposits dunes, including crescent-shaped barchans.', 'शुष्क, कम वनस्पति वाले क्षेत्रों में पवन रेत ढोकर टिब्बे जमा करती है, जिनमें अर्धचंद्राकार बरखान भी हैं।'),
    comparison: b('The wind gallery shows a schematic dune and its slopes.', 'पवन दीर्घा में टिब्बे और उसकी ढालों का योजनाबद्ध चित्र दिखता है।'),
  },
  {
    id: 'coast', name: b('Coastal plains · Konkan', 'तटीय मैदान · कोंकण'), points: [[73.4, 16.6]], agent: 'waves',
    description: b('Along coasts, waves can erode rocky cliffs and transport sand to beaches. Coastal plains and shores vary from place to place.', 'तटों पर तरंगें चट्टानी भृगुओं को काट सकती हैं और रेत ढोकर पुलिन बना सकती हैं। तटीय मैदान और किनारे अलग-अलग स्थानों पर भिन्न हैं।'),
    comparison: b('The waves gallery compares cliff erosion and beach deposition.', 'तरंग दीर्घा भृगु के अपरदन और पुलिन के निक्षेपण की तुलना करती है।'),
  },
  {
    id: 'islands', name: b('Islands · two origins', 'द्वीप · दो उत्पत्तियाँ'), points: [[72.2, 10.8], [92.8, 12.0]], agent: 'waves',
    description: b('Lakshadweep includes coral islands in the Arabian Sea. The Andaman and Nicobar island chain is associated with a tectonic subduction zone in the Bay of Bengal.', 'अरब सागर में लक्षद्वीप के द्वीप प्रवाल से बने हैं। बंगाल की खाड़ी में अंडमान और निकोबार द्वीप-शृंखला विवर्तनिक धँसाव क्षेत्र से जुड़ी है।'),
    comparison: b('The waves gallery shows coastal reshaping, not coral growth or the origin of either island group.', 'तरंग दीर्घा तट का बदलना दिखाती है, प्रवाल-वृद्धि या किसी द्वीप-समूह की उत्पत्ति नहीं।'),
  },
  {
    id: 'meghalaya', name: b('Meghalaya caves', 'मेघालय की गुफाएँ'), points: [[91.73, 25.3]], agent: 'groundwater',
    description: b('Slightly acidic water can dissolve limestone to form caves; dissolved minerals may later deposit as stalactites and stalagmites.', 'हल्का अम्लीय जल चूना-पत्थर घोलकर गुफाएँ बना सकता है; घुले खनिज बाद में स्टैलेक्टाइट और स्टैलेग्माइट के रूप में जमा हो सकते हैं।'),
    comparison: b('The underground-water gallery shows a schematic limestone cave.', 'भूमिगत जल दीर्घा में चूना-पत्थर की गुफा का योजनाबद्ध चित्र दिखता है।'),
  },
];

const COPY = {
  title: b('India landform atlas', 'भारत स्थलाकृति एटलस'),
  intro: b('Choose a numbered region to compare its story. Your choice also changes the landform gallery below.', 'किसी अंकित क्षेत्र को चुनकर उसकी कहानी की तुलना करें। आपका चुनाव नीचे की स्थलाकृति दीर्घा भी बदलता है।'),
  map: b('Map of India with numbered example locations for the Himalaya, Ganga plain, Deccan, Thar, Konkan, islands and Meghalaya; use the region buttons to explore.', 'हिमालय, गंगा मैदान, दक्कन, थार, कोंकण, द्वीप और मेघालय के अंकित उदाहरणों वाला भारत का मानचित्र; खोजने के लिए क्षेत्र बटन चुनें।'),
  mapNote: b('Dots are approximate examples, not region or official boundaries. The two 6s mark both island groups.', 'बिंदु अनुमानित उदाहरण हैं, क्षेत्रों या आधिकारिक सीमाओं का चित्र नहीं। दोनों 6 दो द्वीप-समूह दिखाते हैं।'),
  mapFallback: b('Detailed outlines are unavailable. The schematic map and all region buttons still work.', 'विस्तृत रूपरेखा उपलब्ध नहीं है। योजनाबद्ध मानचित्र और सभी क्षेत्र बटन फिर भी काम करते हैं।'),
  group: b('Choose a landform region', 'स्थलाकृति क्षेत्र चुनें'),
  shape: b('What shaped it?', 'इसे किसने आकार दिया?'),
  compare: b('Compare in the gallery', 'दीर्घा में तुलना करें'),
  galleryChanged: b('The gallery now shows a different agent. Choose this region again to return to its comparison.', 'दीर्घा में अब कोई दूसरा कारक दिख रहा है। इसकी तुलना पर लौटने के लिए यह क्षेत्र फिर चुनें।'),
  prompt: b('Start with a region, then compare another. Which processes are the same or different?', 'किसी एक क्षेत्र से शुरू करें, फिर दूसरे से तुलना करें। कौन-सी प्रक्रियाएँ समान या अलग हैं?'),
};

/** A keyboard/touch-accessible map legend linked to the existing landform simulation. */
export function createIndiaAtlas({ onSelect } = {}) {
  const state = store.simState('T02.atlas', { region: '' });
  if (!INDIA_LANDFORMS.some((region) => region.id === state.region)) state.region = '';
  let alive = true, loading = false, galleryAgent = null;
  const map = h('div', { class: 'atlas-map', 'data-atlas-map': '' });
  const fallback = bi(COPY.mapFallback, { tag: 'p', cls: 'note atlas-fallback' });
  const info = h('div', { class: 'atlas-detail', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' });
  const buttons = INDIA_LANDFORMS.map((region, index) => h('button', {
    type: 'button', class: 'btn atlas-choice', 'data-region': region.id, 'aria-pressed': 'false',
    onclick: () => select(region.id),
  }, h('span', { class: 'atlas-number', 'aria-hidden': 'true' }, String(index + 1)), bi(region.name, { tag: 'span', cls: 'atlas-choice-name' })));
  const choices = h('div', { class: 'atlas-choices', role: 'group', 'aria-label': i18n.pair(COPY.group.en, COPY.group.hi) }, ...buttons);
  const el = h('section', { class: 'india-atlas', 'aria-labelledby': 'india-atlas-heading' },
    bi(COPY.title, { tag: 'h3', cls: 'atlas-heading' }),
    bi(COPY.intro, { tag: 'p', cls: 'atlas-intro' }),
    h('div', { class: 'atlas-layout' },
      h('div', { class: 'atlas-map-column' }, map, bi(COPY.mapNote, { tag: 'p', cls: 'note atlas-map-note' }), fallback),
      h('div', { class: 'atlas-content' }, choices, info)));
  el.querySelector('.atlas-heading').id = 'india-atlas-heading';

  function drawMap() {
    const proj = indiaProjection(640, 440, 20);
    const extraSvg = INDIA_LANDFORMS.flatMap((region, index) => region.points.map((point) => {
      const [x, y] = proj(point);
      const selected = region.id === state.region;
      return `<g data-atlas-marker="${esc(region.id)}" aria-hidden="true"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${selected ? 15 : 12}" fill="${selected ? '#12613c' : '#164b78'}" stroke="white" stroke-width="2.5"/><text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="12" font-weight="700">${index + 1}</text></g>`;
    })).join('');
    map.innerHTML = indiaMapSvg({ w: 640, h: 440, aria: i18n.pair(COPY.map.en, COPY.map.hi), extraSvg });
    map.dataset.geodata = GEO.india?.features ? 'loaded' : loading ? 'loading' : 'fallback';
    fallback.hidden = loading || !!GEO.india?.features;
  }
  function drawInfo() {
    const region = INDIA_LANDFORMS.find((r) => r.id === state.region);
    buttons.forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.region === state.region)));
    if (!region) {
      info.replaceChildren(bi(COPY.prompt, { tag: 'p' }));
      return;
    }
    info.replaceChildren(
      bi(region.name, { tag: 'h4' }),
      h('p', {}, h('strong', {}, bi(COPY.shape, { tag: 'span' })), ' ', bi(region.description, { tag: 'span' })),
      h('p', {}, h('strong', {}, bi(COPY.compare, { tag: 'span' })), ' ', bi(region.comparison, { tag: 'span' })),
      ...(galleryAgent && galleryAgent !== region.agent ? [bi(COPY.galleryChanged, { tag: 'p', cls: 'note atlas-gallery-changed' })] : []));
  }
  // Gallery controls, image pins, prediction and reset can all change the agent independently.
  function setGalleryAgent(agent) {
    const region = INDIA_LANDFORMS.find((r) => r.id === state.region);
    const wasDifferent = !!region && !!galleryAgent && galleryAgent !== region.agent;
    galleryAgent = agent;
    const isDifferent = !!region && !!galleryAgent && galleryAgent !== region.agent;
    if (wasDifferent !== isDifferent) drawInfo();
  }
  function select(id) {
    const region = INDIA_LANDFORMS.find((r) => r.id === id);
    if (!region) return;
    state.region = id;
    store.saveSim();
    drawMap();
    onSelect?.(region);
    drawInfo();
  }
  function relabel() {
    relabelBi(el);
    choices.setAttribute('aria-label', i18n.pair(COPY.group.en, COPY.group.hi));
    drawMap();
    drawInfo();
  }
  drawMap();
  drawInfo();

  // Fetch only India data, and only when the L5 tab is opened. The fallback remains usable on error.
  function enable() {
    if (!alive || loading) return;
    if (GEO.india?.features) { drawMap(); return; }
    loading = true;
    drawMap();
    const url = new URL('../../../data/geo/india.simplified.json', import.meta.url);
    fetch(url).then((response) => {
      if (!response.ok) throw new Error('India map unavailable');
      return response.json();
    }).then((geo) => {
      if (!alive || !Array.isArray(geo?.features)) return;
      GEO.india = geo;
      drawMap();
    }).catch(() => {}).finally(() => { loading = false; if (alive) drawMap(); });
  }
  return { el, enable, relabel, setGalleryAgent, destroy() { alive = false; } };
}
