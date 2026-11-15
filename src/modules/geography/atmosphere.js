// T03 — Atmosphere and Climate: L1 Cutaway, L2 Climate Grapher, L3 Monsoon Map, L4 Local Breeze, L5 Catchment, L6 Carbon Footprint.
import { mountLabs } from '../../components/lab-kit.js';
import { loadGeoAll } from '../../engines/viz.js';
import { cutaway, breeze, climateGrapher, monsoonMap, catchment, carbonFootprint } from './t03-specs.js';
import { createWeatherDiary } from './weather-diary.js';
import { createClimateTable } from './climate-table.js';
import { createMonsoonInquiry } from './monsoon-inquiry.js';

export function mount(root) {
  const res = mountLabs(
    root,
    'T03',
    [cutaway, climateGrapher, monsoonMap, breeze, catchment, carbonFootprint],
    [
      { en: 'Atmosphere layers (L1)', hi: 'वायुमंडल परतें (L1)' },
      { en: 'Climate grapher (L2)', hi: 'जलवायु आरेख (L2)' },
      { en: 'Monsoon map (L3)', hi: 'मानसून मानचित्र (L3)' },
      { en: 'Land-sea breeze (L4)', hi: 'समीर मॉडल (L4)' },
      { en: 'Flood catchment (L5)', hi: 'बाढ़ जलग्रहण (L5)' },
      { en: 'Carbon footprint (L6)', hi: 'कार्बन पदचिह्न (L6)' },
    ],
  );
  const climate = res.lab('T03.L2');
  const monsoon = res.lab('T03.L3');
  const diary = createWeatherDiary();
  const climateTable = createClimateTable(climate.state);
  const inquiry = createMonsoonInquiry({ season: monsoon.state.season, onSeason: (season) => monsoon.setState({ season }) });
  const stopClimate = climate.onDraw((state) => climateTable.update(state));
  const stopMonsoon = monsoon.onDraw((state) => inquiry.update(state));
  const climateGrid = climate.el.querySelector('.lab-grid');
  climateGrid.before(diary.el);
  climateGrid.after(climateTable.el);
  monsoon.el.querySelector('.lab-grid').before(inquiry.el);
  let alive = true;
  loadGeoAll().then(() => { if (alive) res.relabel(); });
  return {
    ...res,
    relabel() { res.relabel(); diary.relabel(); climateTable.relabel(); inquiry.relabel(); },
    destroy() { alive = false; stopClimate(); stopMonsoon(); diary.destroy(); climateTable.destroy(); inquiry.destroy(); res.destroy(); },
  };
}
