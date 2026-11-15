// T11 — Life on Earth: L1 World Biomes, L2 India Biosphere Reserves, L3 Forest Harvest & Food Web, L4 Fire Planner, L5 Traditional Conservation.
import { mountLabs } from '../../components/lab-kit.js';
import { loadGeoAll } from '../../engines/viz.js';
import { harvest, foodweb, biomeMap, reserveMap, firePlanner, traditionalConservation } from './t11-specs.js';
import { createHabitatInquiry, createTourismPlanner, createFireInquiry, createForestKnowledge } from './habitat-inquiry.js';
import { h } from '../../core/dom.js';
import { bi } from '../../components/widgets.js';

export function mount(root) {
  const res = mountLabs(
    root,
    'T11',
    [biomeMap, reserveMap, harvest, foodweb, firePlanner, traditionalConservation],
    [
      { en: 'World biomes (L1)', hi: 'विश्व बायोम (L1)' },
      { en: 'Biosphere reserves (L2)', hi: 'जैवमंडल क्षेत्र (L2)' },
      { en: 'Forest harvest (L3)', hi: 'वन कटाई (L3)' },
      { en: 'Food web (L3)', hi: 'खाद्य-जाल (L3)' },
      { en: 'Fire prevention (L4)', hi: 'वनाग्नि सुरक्षा (L4)' },
      { en: 'Sacred groves (L5)', hi: 'पारंपरिक संरक्षण (L5)' },
    ],
  );
  const habitat = createHabitatInquiry(res.lab('T11.L1'));
  const tourism = createTourismPlanner();
  const fireInquiry = createFireInquiry();
  const knowledge = createForestKnowledge();
  res.lab('T11.L1').el.querySelector('.lab-grid').before(habitat.el);
  res.lab('T11.L3').el.querySelector('.lab-grid').before(tourism.el);
  res.lab('T11.L4').el.querySelector('.lab-grid').before(fireInquiry.el);
  res.lab('T11.L5').el.querySelector('.lab-grid').before(knowledge.el);
  const reserveNote = h('p', { class: 'note' }, bi({ en: 'Selected examples only; dots are approximate and state shading is not the reserve boundary. ', hi: 'केवल कुछ उदाहरण; बिंदु अनुमानित हैं और राज्य का रंग आरक्षित क्षेत्र की सीमा नहीं है। ' }, { tag: 'span' }),
    h('a', { href: 'https://moef.gov.in/uploads/pdf/Approved%20copy%20of%20Website%20note%20of%20BR.pdf', target: '_blank', rel: 'noopener noreferrer' }, bi({ en: 'MoEFCC reserve list (internet required)', hi: 'MoEFCC आरक्षित क्षेत्र सूची (इंटरनेट आवश्यक)' }, { tag: 'span' })));
  res.lab('T11.L2').el.querySelector('.lab-grid').before(reserveNote);
  let alive = true;
  function relabel() { res.relabel(); habitat.relabel(); tourism.relabel(); fireInquiry.relabel(); knowledge.relabel(); }
  loadGeoAll().then(() => { if (alive) relabel(); });
  return { ...res, relabel, destroy() { alive = false; habitat.destroy(); tourism.destroy(); fireInquiry.destroy(); knowledge.destroy(); res.destroy?.(); } };
}
