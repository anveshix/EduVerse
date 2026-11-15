// Count learning objects with at least one correct exit answer, never individual questions.
// Bespoke modules store bare question IDs. Associate each with the LO it actually assesses,
// including legacy answers; for example, T02's distance calculation is L2, not the plate map.
const BESPOKE_EXITS = {
  T02: { e1: 'T02.L2', e2: 'T02.L3', e3: 'T02.L2', e4: 'T02.L5', e5: 'T02.L1' },
  T04: { h1: 'T04.L2', h2: 'T04.L1' },
  T07: { x1: 'T07.L2', x2: 'T07.L2' },
  T09: { x1: 'T09.L1', x2: 'T09.L1', x3: 'T09.L5' },
};

export function exitProgress(theme, progress = {}) {
  const ids = (theme.learningObjects || []).map((lo) => lo.id);
  const solved = new Set();
  for (const [key, value] of Object.entries(progress?.exit || {})) {
    if (!value?.ok) continue;
    const id = ids.find((lo) => key === lo || key.startsWith(`${lo}.`)) || BESPOKE_EXITS[theme.id]?.[key];
    if (ids.includes(id)) solved.add(id);
  }
  const n = ids.length, k = solved.size;
  return { k, n, done: n > 0 && k === n };
}
