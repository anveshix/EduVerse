// T06 — Democracy: L1 Concept map & assessor, L2 Early Indian traditions, L3 Parliamentary vs presidential, L4 Country comparison.
import { mountLabs } from '../../components/lab-kit.js';
import { loadGeoAll } from '../../engines/viz.js';
import { democracyMap, earlyTraditions, institutions, countryCompare } from './t06-specs.js';
import { createClassroomVote } from './classroom-vote.js';
import { createPanchayatExplorer } from './panchayat-explorer.js';

export function mount(root) {
  const res = mountLabs(
    root,
    'T06',
    [democracyMap, earlyTraditions, institutions, countryCompare],
    [
      { en: 'Democracy check (L1)', hi: 'लोकतंत्र जांच (L1)' },
      { en: 'Indian traditions (L2)', hi: 'भारतीय परंपराएँ (L2)' },
      { en: 'Parliamentary vs presidential (L3)', hi: 'संसदीय बनाम अध्यक्षीय (L3)' },
      { en: 'World systems (L4)', hi: 'विश्व प्रणालियाँ (L4)' },
    ],
  );
  const vote = createClassroomVote();
  const panchayat = createPanchayatExplorer();
  res.lab('T06.L1').el.querySelector('.lab-grid').before(vote.el);
  res.lab('T06.L2').el.querySelector('.lab-grid').before(panchayat.el);
  let alive = true;
  loadGeoAll().then(() => { if (alive) res.relabel(); });
  return {
    ...res,
    relabel() { res.relabel(); vote.relabel(); panchayat.relabel(); },
    destroy() { alive = false; vote.destroy(); panchayat.destroy(); res.destroy?.(); },
  };
}
