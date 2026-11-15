// T05 — State and Society (upto 1000 CE): L1 Historical Map, L2 Source Corroboration, L3 Saptanga Admin, L4 IKS & AI Parallels, L5 Guilds & Sea Trade, L6 AI Audit Studio.
import { mountLabs } from '../../components/lab-kit.js';
import { loadGeoAll } from '../../engines/viz.js';
import { vedicDatedMap, sourceRoom, empireAdmin, knowledgeGallery, guildTrade, aiAuditLab } from './t05-specs.js';
import { createHistoryTimeline } from './timeline-chunks.js';
import { createSaptangaBuilder } from './saptanga-builder.js';

export function mount(root) {
  const res = mountLabs(
    root,
    'T05',
    [vedicDatedMap, sourceRoom, empireAdmin, knowledgeGallery, guildTrade, aiAuditLab],
    [
      { en: 'Historical map (L1)', hi: 'ऐतिहासिक मानचित्र (L1)' },
      { en: 'Source check (L2)', hi: 'स्रोत जाँच (L2)' },
      { en: 'Saptanga admin (L3)', hi: 'सप्तांग प्रशासन (L3)' },
      { en: 'IKS & AI (L4)', hi: 'ज्ञान व एआई (L4)' },
      { en: 'Guilds & sea (L5)', hi: 'श्रेणी व समुद्र (L5)' },
      { en: 'AI Audit (L6)', hi: 'एआई तथ्य-जाँच (L6)' },
    ],
  );
  const map = res.lab('T05.L1');
  const admin = res.lab('T05.L3');
  const timeline = createHistoryTimeline(map.state, { onSelect: (era) => map.setState({ era }) });
  const builder = createSaptangaBuilder();
  const stopTimeline = map.onDraw((state) => timeline.update(state));
  map.el.querySelector('.lab-grid').before(timeline.el);
  admin.el.querySelector('.lab-grid').before(builder.el);
  let alive = true;
  loadGeoAll().then(() => { if (alive) res.relabel(); });
  return {
    ...res,
    relabel() { res.relabel(); timeline.relabel(); builder.relabel(); },
    destroy() { alive = false; stopTimeline(); timeline.destroy(); builder.destroy(); res.destroy?.(); },
  };
}
