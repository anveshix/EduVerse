// Election and voting engine (T07): pure fictional electoral-system models + coalition arithmetic.
export const PARTIES = ['R', 'B', 'G', 'Y']; // neutral colour names; deliberately not real parties
export const SEATS = 10;
// votes in thousands, 10 constituencies of 100 each
export const BASE = [
  ...Array.from({ length: 7 }, () => ({ R: 40, B: 35, G: 15, Y: 10 })),
  ...Array.from({ length: 3 }, () => ({ R: 15, B: 70, G: 10, Y: 5 })),
];
// Runoff assumption (stated to students): where the voters of an eliminated party go. Fictional.
export const TRANSFER = { G: { B: 0.7, R: 0.3 }, Y: { B: 0.5, R: 0.5 }, R: { B: 0.5, R: 0.5 }, B: { B: 0.5, R: 0.5 } };

const top = (o) => Object.entries(o).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
export const initialElection = () => ({ system: 'fptp', swing: 0 });

// shift `pts` votes (per 100) from B to R in every constituency, never below zero
export function applySwing(consts, pts) {
  const from = pts >= 0 ? 'B' : 'R', to = pts >= 0 ? 'R' : 'B', n = Math.abs(pts);
  return consts.map((c) => { const mv = Math.min(n, c[from]); return { ...c, [from]: c[from] - mv, [to]: c[to] + mv }; });
}
export const totals = (consts) => Object.fromEntries(PARTIES.map((p) => [p, consts.reduce((a, c) => a + c[p], 0)]));
export const voteShare = (consts) => { const t = totals(consts), s = Object.values(t).reduce((a, b) => a + b, 0); return Object.fromEntries(PARTIES.map((p) => [p, t[p] / s])); };

export function fptp(consts) {
  const seats = Object.fromEntries(PARTIES.map((p) => [p, 0])), winners = [];
  consts.forEach((c) => { const w = top(c)[0][0]; seats[w]++; winners.push(w); });
  return { seats, winners };
}
// two-round system: if nobody has >50%, the top two go to a second round and eliminated parties' voters transfer by TRANSFER
export function runoff(consts) {
  const seats = Object.fromEntries(PARTIES.map((p) => [p, 0])), winners = [], rounds = [];
  consts.forEach((c) => {
    const tot = Object.values(c).reduce((a, b) => a + b, 0), r = top(c);
    if (r[0][1] > tot / 2) { seats[r[0][0]]++; winners.push(r[0][0]); rounds.push(1); return; }
    const [a, b] = [r[0][0], r[1][0]], v = { [a]: c[a], [b]: c[b] };
    PARTIES.filter((p) => p !== a && p !== b).forEach((p) => { [a, b].forEach((q) => { v[q] += c[p] * (TRANSFER[p]?.[q] ?? 0.5); }); });
    const w = v[a] >= v[b] ? a : b; seats[w]++; winners.push(w); rounds.push(2);
  });
  return { seats, winners, rounds };
}
// proportional representation, largest-remainder (Hare) method, one national list
export function proportional(consts, n = SEATS) {
  const sh = voteShare(consts), q = Object.fromEntries(PARTIES.map((p) => [p, sh[p] * n]));
  const seats = Object.fromEntries(PARTIES.map((p) => [p, Math.floor(q[p] + 1e-9)]));
  let left = n - Object.values(seats).reduce((a, b) => a + b, 0);
  PARTIES.map((p) => [p, q[p] - seats[p]]).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).forEach(([p]) => { if (left > 0) { seats[p]++; left--; } });
  return { seats };
}
export function run(system, swing) {
  const consts = applySwing(BASE, swing);
  const res = system === 'fptp' ? fptp(consts) : system === 'runoff' ? runoff(consts) : proportional(consts);
  const sh = voteShare(consts), seats = res.seats;
  const maxVotes = Math.max(...Object.values(sh)), maxSeats = Math.max(...Object.values(seats));
  // Preserve ties rather than presenting the alphabetically first party as the sole leader.
  const voteLeaders = PARTIES.filter((p) => Math.abs(sh[p] - maxVotes) < 1e-9);
  const seatLeaders = PARTIES.filter((p) => seats[p] === maxSeats);
  const topVotes = voteLeaders[0], topSeats = seatLeaders[0]; // compatibility for callers needing one representative
  const mismatch = !voteLeaders.some((p) => seatLeaders.includes(p));
  return { consts, system, swing, seats, voteShare: sh, rounds: res.rounds, topVotes, topSeats, voteLeaders, seatLeaders, mismatch };
}

/** Evaluate a proposed set of parties in a fictional seat-count exercise. */
export function coalitionStatus(seats, selection) {
  if (!seats || typeof seats !== 'object' || Array.isArray(seats) || !Array.isArray(selection) ||
      Object.values(seats).some((n) => !Number.isInteger(n) || n < 0) ||
      new Set(selection).size !== selection.length || selection.some((p) => !Object.hasOwn(seats, p) || seats[p] === 0)) return { valid: false };
  const total = Object.values(seats).reduce((sum, n) => sum + n, 0);
  if (!total) return { valid: false };
  const need = Math.floor(total / 2) + 1;
  const support = selection.reduce((sum, p) => sum + seats[p], 0);
  const majority = support >= need;
  const surplus = majority ? selection.filter((p) => support - seats[p] >= need) : [];
  return { valid: true, total, need, support, majority, minimal: majority && surplus.length === 0, surplus };
}

/** Sets exceeding half the house in which removing any member loses that majority (minimal winning coalitions). */
export function minimalWinningCoalitions(seats) {
  const parties = Object.keys(seats).filter((p) => seats[p] > 0), total = Object.values(seats).reduce((a, b) => a + b, 0), need = Math.floor(total / 2) + 1, out = [];
  for (let mask = 1; mask < 1 << parties.length; mask++) {
    const set = parties.filter((_, i) => mask & (1 << i)), sum = set.reduce((s, p) => s + seats[p], 0);
    if (sum >= need && set.every((p) => sum - seats[p] < need)) out.push({ parties: set, seats: sum });
  }
  return { need, total, coalitions: out.sort((a, b) => a.parties.length - b.parties.length || a.seats - b.seats) };
}
export const hasMajority = (seats, party) => seats[party] > Object.values(seats).reduce((a, b) => a + b, 0) / 2;
