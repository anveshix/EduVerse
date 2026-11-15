// T08 — Building Blocks in Economics: L1 Scarcity, L2 PPF, L3 What/How/For Whom, L4 Economic systems, L5 Safety net.
import { mountLabs } from '../../components/lab-kit.js';
import { ppf, scarcityGame, econFlow, econSystems, safetyNet } from './t08-specs.js';
import { createHouseholdBudget } from './household-budget.js';
import { createTimeFrontier } from './time-frontier.js';

export function mount(root) {
  const res = mountLabs(
  root,
  'T08',
  [scarcityGame, ppf, econFlow, econSystems, safetyNet],
  [
    { en: 'Scarcity & choice (L1)', hi: 'दुर्लभता व चयन (L1)' },
    { en: 'Production frontier (L2)', hi: 'उत्पादन संभावना (L2)' },
    { en: 'What / How / For whom (L3)', hi: 'क्या / कैसे / किसके लिए (L3)' },
    { en: 'Economic systems (L4)', hi: 'आर्थिक प्रणालियाँ (L4)' },
    { en: 'Safety net (L5)', hi: 'सामाजिक सुरक्षा-जाल (L5)' },
  ],
  );
  const budget = createHouseholdBudget();
  const time = createTimeFrontier();
  res.lab('T08.L1').el.querySelector('.lab-grid').before(budget.el);
  res.lab('T08.L2').el.querySelector('.lab-grid').before(time.el);
  return {
    ...res,
    relabel() { res.relabel(); budget.relabel(); time.relabel(); },
    destroy() { budget.destroy(); time.destroy(); res.destroy?.(); },
  };
}
