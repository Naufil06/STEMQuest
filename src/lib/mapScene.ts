import { THEMES, shade, mix, emoji, drawProp, drawCloud, drawBoat, poly, hash, type Ctx } from "./art";
import { WORLDS } from "./rewards";

// Animated illustrated world map: ocean, islands (one per world), clouds, ships, birds, and the hero's boat travelling the route.
export const MW = 1200, MH = 760;
const RAWPOS: [number, number][] = [[130, 650], [330, 590], [530, 665], [730, 600], [940, 655], [1070, 520], [890, 440], [690, 485], [490, 430], [290, 445], [180, 300], [390, 225], [630, 255], [880, 140]];
export const POS: [number, number][] = RAWPOS.map(([x, y]) => [x, 170 + (y - 140) * 0.85]);   // keep islands and labels clear of the cloud rim
export type IslandState = "locked" | "ready" | "open";
export interface MapIn { t: number; states: IslandState[]; sel: number; here: number; hero: HTMLImageElement | null; trip: { from: number; to: number; p: number } | null; trail: number[][] }

const seg = (i: number) => { const a = POS[i], b = POS[i + 1], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1, s = i % 2 ? -1 : 1; return [a, [mx - (dy / n) * 46 * s, my + (dx / n) * 46 * s], b]; };
const qp = (s: number[][], u: number) => { const k = 1 - u; return [k * k * s[0][0] + 2 * k * u * s[1][0] + u * u * s[2][0], k * k * s[0][1] + 2 * k * u * s[1][1] + u * u * s[2][1]]; };
/** Position along the sea route from island `from` to island `to` (p = 0..1). */
export function tripPoint(from: number, to: number, p: number) {
  const n = Math.abs(to - from); if (!n) return [...POS[from], 1];
  const f = Math.min(0.9999, Math.max(0, p)) * n, idx = Math.floor(f), u = f - idx, fw = to > from, i = fw ? from + idx : from - idx - 1, uu = fw ? u : 1 - u;
  const a = qp(seg(i), uu), b = qp(seg(i), Math.min(1, Math.max(0, uu + (fw ? 0.02 : -0.02))));
  return [a[0], a[1], b[0] >= a[0] ? 1 : -1];
}
export function hitIsland(x: number, y: number) { for (let i = POS.length - 1; i >= 0; i--) if (Math.hypot(x - POS[i][0], (y - POS[i][1]) * 1.25) < 66) return i; return -1; }

const rnd = (i: number, k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
function blob(g: Ctx, x: number, y: number, r: number, i: number) {
  const n = 12, pts = Array.from({ length: n }, (_, k) => { const a = (k / n) * Math.PI * 2, rr = r * (0.82 + 0.3 * rnd(i, k)); return [x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.72]; });
  g.beginPath(); g.moveTo((pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2);
  for (let k = 0; k < n; k++) { const p = pts[k], q = pts[(k + 1) % n]; g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
  g.closePath();
}
function island(g: Ctx, i: number, st: IslandState, sel: boolean, t: number) {
  const [x, y] = POS[i], th = THEMES[i], W = WORLDS[i], R = 60 + (i % 3) * 4;
  g.save(); g.globalAlpha = 0.4; g.fillStyle = "#ffffff"; blob(g, x, y + 10, R * 1.22 + Math.sin(t * 1.4 + i) * 2.5, i); g.fill(); g.globalAlpha = 0.22; blob(g, x, y + 10, R * 1.38 + Math.sin(t * 1.1 + i) * 3, i); g.fill(); g.restore();
  g.fillStyle = shade(th.soil, -0.15); blob(g, x, y + 16, R, i); g.fill();
  g.fillStyle = mix(th.grass, "#f3dfb0", 0.55); blob(g, x, y + 4, R, i); g.fill();
  g.fillStyle = th.grass; blob(g, x, y, R * 0.88, i); g.fill();
  const items: [number, () => void][] = [];
  for (let k = 0; k < 5; k++) { const a = i * 1.7 + k * 1.26, rad = R * (0.12 + 0.36 * rnd(i, k + 20)), px = x + Math.cos(a) * rad * 1.1, py = y + 8 + Math.sin(a) * rad * 0.6; items.push([py, () => drawProp(g, th.prop, px, py, 0.4 + 0.08 * (k % 3), t, th)]); }
  for (let k = 0; k < 3; k++) { const a = i * 2.3 + k * 2.1, px = x + Math.cos(a) * R * 0.55, py = y + 6 + Math.sin(a) * R * 0.3; items.push([py, () => emoji(g, th.deco[k % th.deco.length], px, py - 6, 17)]); }
  items.sort((a, b) => a[0] - b[0]).forEach(([, f]) => f());
  g.beginPath(); g.fillStyle = "rgba(255,255,255,.95)"; g.arc(x - R * 0.72, y - R * 0.45, 13, 0, 7); g.fill(); g.fillStyle = "#1e293b"; g.font = "bold 14px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(i + 1), x - R * 0.72, y - R * 0.45 + 1);
  if (st === "locked") { for (let k = 0; k < 7; k++) { const a = k * 0.9 + t * 0.15, cx = x + Math.cos(a) * R * 0.55, cy = y + 6 + Math.sin(a * 1.3) * R * 0.28; drawCloud(g, cx, cy, 46 + (k % 3) * 7, 0.97); } emoji(g, "🔒", x, y + 2, 28); }
  if (st === "ready") { g.save(); g.strokeStyle = W.c1; g.globalAlpha = 0.5 + 0.4 * Math.sin(t * 4); g.lineWidth = 6; blob(g, x, y + 4, R * 1.25, i); g.stroke(); g.restore(); emoji(g, "🎮", x, y - R * 0.9 + Math.sin(t * 4) * 5, 30); }
  const label = st === "locked" ? `World ${i + 1}` : W.name, ly = y + R * 0.92 + 12; g.font = "bold 15px 'Fredoka','Nunito',sans-serif"; const w2 = g.measureText(label).width + 22;
  g.fillStyle = st === "open" ? "rgba(255,255,255,.95)" : "rgba(30,41,59,.78)"; g.beginPath(); g.roundRect(x - w2 / 2, ly - 12, w2, 24, 12); g.fill(); g.fillStyle = st === "open" ? "#1e293b" : "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(label, x, ly + 1);
  if (sel) { g.save(); g.strokeStyle = "#fde047"; g.lineWidth = 4; g.setLineDash([12, 9]); g.lineDashOffset = -t * 20; blob(g, x, y + 4, R * 1.5, i); g.stroke(); g.restore(); }
}

export function drawMap(g: Ctx, o: MapIn) {
  const t = o.t, og = g.createRadialGradient(MW / 2, MH / 2, 80, MW / 2, MH / 2, 760); og.addColorStop(0, "#56c7e0"); og.addColorStop(0.6, "#2b93cf"); og.addColorStop(1, "#16609a"); g.fillStyle = og; g.fillRect(0, 0, MW, MH);
  g.lineWidth = 2; g.strokeStyle = "rgba(255,255,255,.17)";
  for (let k = 0; k < 17; k++) { g.beginPath(); for (let x = 0; x <= MW; x += 24) { const y = 30 + k * 46 + Math.sin(x * 0.02 + t * 1.2 + k) * 6; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + 0.3 * Math.sin(t * 2 + i)})`; g.fillRect((i * 173) % MW, (i * 97 + 40) % MH, 3, 3); }
  const rim = (front: boolean) => { for (let i = 0; i < 38; i++) { const s = (i / 38) * 2 * (MW + MH), side = s < MW ? 0 : s < MW + MH ? 1 : s < 2 * MW + MH ? 2 : 3; const u = side === 0 ? s : side === 1 ? s - MW : side === 2 ? s - MW - MH : s - 2 * MW - MH, wob = Math.sin(t * 0.4 + i) * 8; const [x, y] = side === 0 ? [u, 4 + wob] : side === 1 ? [MW - 4 + wob, u] : side === 2 ? [MW - u, MH - 4 + wob] : [4 + wob, MH - u]; if ((i % 2 === 0) === front) drawCloud(g, x, y, 62 + (hash(i, 3) % 40), front ? 0.97 : 0.92); } };
  rim(false);
  g.lineCap = "round"; for (let i = 0; i < POS.length - 1; i++) { const s = seg(i), done = o.states[i + 1] === "open"; g.beginPath(); g.moveTo(s[0][0], s[0][1]); g.quadraticCurveTo(s[1][0], s[1][1], s[2][0], s[2][1]); g.strokeStyle = done ? "rgba(253,224,71,.95)" : "rgba(255,255,255,.6)"; g.lineWidth = done ? 6 : 4; g.setLineDash(done ? [] : [4, 12]); g.lineDashOffset = -t * 12; g.stroke(); }
  g.setLineDash([]);
  [...POS.keys()].sort((a, b) => POS[a][1] - POS[b][1]).forEach((i) => island(g, i, o.states[i], o.sel === i, t));
  for (let k = 0; k < 5; k++) { const dir = k % 2 ? -1 : 1, x = dir > 0 ? ((t * 16 + k * 330) % (MW + 240)) - 120 : MW + 120 - ((t * 16 + k * 330) % (MW + 240)); drawBoat(g, x, 110 + k * 125 + (k % 2) * 30, 0.9, t, dir, ["#7c4a21", "#9a3412", "#1d4ed8", "#0f766e", "#7c3aed"][k]); }
  for (let k = 0; k < 6; k++) { const bx = ((t * 40 + k * 210) % (MW + 200)) - 100, by = 70 + ((k * 61) % 160) + Math.sin(t * 2 + k) * 10, fl = Math.sin(t * 9 + k) * 5; g.strokeStyle = "#1e293b"; g.lineWidth = 2; g.beginPath(); g.moveTo(bx - 9, by - fl); g.quadraticCurveTo(bx - 4, by - 4, bx, by); g.quadraticCurveTo(bx + 4, by - 4, bx + 9, by - fl); g.stroke(); }
  const u = ((t + 3) % 9) / 1.3; if (u < 1) { const dx = 120 + (u * 120); emoji(g, "🐬", dx, 390 - Math.sin(u * Math.PI) * 70, 34); }
  const trip = o.trip, hp = trip ? tripPoint(trip.from, trip.to, trip.p) : [POS[o.here][0], POS[o.here][1] - 4, 1];
  for (let i = 0; i < o.trail.length; i++) { g.fillStyle = `rgba(255,255,255,${(i / o.trail.length) * 0.6})`; g.beginPath(); g.arc(o.trail[i][0], o.trail[i][1] + 10, 3 + i * 0.3, 0, 7); g.fill(); }
  const hx = hp[0], hy = hp[1] - (trip ? 0 : 34) + Math.sin(t * 2.4) * 2.5;
  g.save(); g.translate(hx, hy); if (!trip) g.translate(0, 0); poly(g, [[-20, 12], [20, 12], [13, 24], [-13, 24]], "#8b4513"); g.fillStyle = "#6b3410"; g.fillRect(-1, -28, 3, 40); poly(g, [[3, -26], [3, 8], [22, 8]], "#ffffff", "rgba(0,0,0,.2)");
  g.beginPath(); g.fillStyle = "#fff"; g.arc(0, -4, 19, 0, 7); g.fill(); g.save(); g.beginPath(); g.arc(0, -4, 17, 0, 7); g.clip(); if (o.hero && o.hero.complete && o.hero.width) g.drawImage(o.hero, 0, 0, o.hero.width, o.hero.width, -17, -21, 34, 34); else { g.fillStyle = "#f9c9a0"; g.fillRect(-17, -21, 34, 34); } g.restore(); g.restore();
  rim(true);
}
