// Procedural platformer levels: same world number = same level. Later worlds are longer, with wider gaps, more spikes and enemies.
export const T = 48, VH = 540, VW = 960;
export interface Plat { x: number; y: number; w: number; h: number; one?: boolean }
export interface Pickup { x: number; y: number; t: "coin" | "crop" | "seed" | "heart"; j?: number; got?: boolean }
export interface Foe { x: number; y: number; x0: number; x1: number; dir: number; fly: boolean; ph: number; dead?: boolean }
export interface Level { width: number; plats: Plat[]; spikes: Plat[]; foes: Foe[]; items: Pickup[]; checks: { x: number; y: number }[]; goal: { x: number }; start: { x: number; y: number } }

const rng = (a: number) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

export function makeLevel(world: number): Level {
  const r = rng(world * 7919 + 17), ri = (a: number, b: number) => a + Math.floor(r() * (b - a + 1));
  const len = 120 + world * 18, gapMax = world < 3 ? 2 : 3;
  const gapP = 0.12 + Math.min(0.3, world * 0.022), spikeP = 0.1 + world * 0.015, foeP = 0.12 + world * 0.022, flyP = world >= 4 ? 0.05 + (world - 4) * 0.012 : 0;
  const L: Level = { width: 0, plats: [], spikes: [], foes: [], items: [], checks: [], goal: { x: 0 }, start: { x: 2 * T, y: 0 } };
  let row = 8, x = 10, lastCheck = 0;
  const ground = (x0: number, n: number, rw: number) => L.plats.push({ x: x0 * T, y: rw * T, w: n * T, h: VH - rw * T });
  const coins = (x0: number, y: number, n: number) => { for (let i = 0; i < n; i++) L.items.push({ x: (x0 + i + 0.5) * T, y, t: "coin" }); };
  ground(0, 10, row); L.start.y = row * T;
  while (x < len) {
    let gap = 0;
    if (x > 12 && r() < gapP) { gap = ri(1, gapMax); coins(x, row * T - 1.8 * T, gap); x += gap; }
    let dy = r() < 0.35 ? (r() < 0.5 ? -1 : 1) : 0;
    if (gap >= 3 && dy < 0) dy = 0;                      // never a wide gap AND a step up: always jumpable
    row = Math.max(6, Math.min(9, row + dy));
    const n = ri(4, 9);
    ground(x, n, row);
    const roll = r();
    if (n >= 5 && roll < spikeP) { const sw = ri(1, 2), sx = x + ri(2, Math.max(2, n - sw - 2)); L.spikes.push({ x: sx * T + 10, y: row * T - 22, w: sw * T - 20, h: 22 }); }
    else if (n >= 5 && roll < spikeP + foeP) L.foes.push({ x: (x + n / 2) * T, y: row * T, x0: (x + 1) * T, x1: (x + n - 1) * T, dir: 1, fly: false, ph: 0 });
    else if (n >= 6 && roll < spikeP + foeP + flyP) L.foes.push({ x: (x + n / 2) * T, y: row * T - 2.6 * T, x0: (x + 1) * T, x1: (x + n - 1) * T, dir: 1, fly: true, ph: r() * 6 });
    if (n >= 4 && r() < 0.45) {                            // floating platform (jump up through it)
      const px = x + ri(1, n - 3), py = (row - 2) * T, q = r();
      L.plats.push({ x: px * T, y: py, w: 3 * T, h: 14, one: true });
      if (q < 0.2) L.items.push({ x: (px + 1.5) * T, y: py - 26, t: "seed", j: ri(0, 2) });
      else if (q < 0.5) L.items.push({ x: (px + 1.5) * T, y: py - 26, t: "crop", j: ri(0, 2) });
      else coins(px, py - 0.9 * T, 3);
      if (r() < 0.3) { L.plats.push({ x: (px + 0.5) * T, y: (row - 4) * T, w: 2 * T, h: 14, one: true }); L.items.push({ x: (px + 1.5) * T, y: (row - 4) * T - 26, t: r() < 0.5 ? "seed" : "crop", j: ri(0, 2) }); }
    }
    if (r() < 0.6) coins(x + 1, row * T - 0.9 * T, Math.min(n - 2, 4));
    if (x - lastCheck > 35) { L.checks.push({ x: (x + 1) * T, y: row * T }); L.items.push({ x: (x + 3) * T, y: row * T - 30, t: "heart" }); lastCheck = x; }
    x += n;
  }
  ground(x, 12, row);
  L.goal.x = (x + 6) * T; L.width = (x + 12) * T;
  const want = 3 + Math.floor(world / 2), coinIdx = L.items.map((it, i) => (it.t === "coin" ? i : -1)).filter((i) => i >= 0);
  let seeds = L.items.filter((i) => i.t === "seed").length;
  for (let k = 0; seeds < want && k < coinIdx.length; k++) { const it = L.items[coinIdx[ri(0, coinIdx.length - 1)]]; if (it.t === "coin") { it.t = "seed"; it.j = ri(0, 2); seeds++; } }
  return L;
}
