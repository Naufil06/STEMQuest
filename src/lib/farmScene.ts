import { THEMES, shade, mix, poly, emoji, drawProp, drawFx, drawCloud, hash, type Ctx, type Theme } from "./art";
import { WORLDS } from "./rewards";
import { itemById } from "./farm";

// Isometric farm/city drawn on a canvas. Tile (c,r) -> screen via the diamond grid below.
export const HW = 48, HH = 24, M = 2;
export interface Tile { k: "c" | "b"; id: string; at: number }
export interface FarmIn { w: number; city: boolean; cols: number; rows: number; tiles: Record<string, Tile>; now: number; t: number; hover: string | null; ghost: string | null }
export const layout = (cols: number, rows: number) => ({ W: (cols + rows + 2 * M) * HW, H: (cols + rows + 2 * M) * HH + 360, ox: (rows + M) * HW, oy: 190 + (M + 1) * HH });
type L = ReturnType<typeof layout>;
const sx = (l: L, c: number, r: number) => l.ox + (c - r) * HW, sy = (l: L, c: number, r: number) => l.oy + (c + r) * HH;
export const isField = (c: number, r: number) => c >= 1 && c <= 4 && r >= 1 && r <= 4;   // the starting farmland

interface Pal { wall: string; roof: string; accent: string }
const palFor = (w: number, th: Theme, id: string): Pal => {
  const W = WORLDS[w], j = +id.split("_")[1] || 0, city = id[0] === "y";
  return { wall: mix("#f4e8d0", th.grass, city ? 0.35 : 0.15), roof: [W.c2, W.c1, shade(W.c2, 0.2)][j % 3], accent: [W.c1, W.c2, "#f59e0b"][j % 3] };
};
function box(g: Ctx, cx: number, cy: number, s: number, h: number, wall: string, roofH = 0, roof = "#c0392b", ox = 0, oy = 0) {
  const hw = HW * s, hh = HH * s, x = cx + ox, y = cy + oy, Lp = [x - hw, y], B = [x, y + hh], R = [x + hw, y], Tp = [x, y - hh], up = (p: number[]) => [p[0], p[1] - h];
  poly(g, [Lp, B, up(B), up(Lp)], shade(wall, -0.06), "rgba(0,0,0,.2)"); poly(g, [B, R, up(R), up(B)], shade(wall, -0.26), "rgba(0,0,0,.2)");
  if (roofH > 0) { const ap = [x, y - h - roofH]; poly(g, [up(Lp), up(B), ap], shade(roof, -0.04), "rgba(0,0,0,.22)"); poly(g, [up(B), up(R), ap], shade(roof, -0.3), "rgba(0,0,0,.22)"); }
  else poly(g, [up(Lp), up(Tp), up(R), up(B)], shade(wall, 0.2), "rgba(0,0,0,.2)");
  return { L: Lp, B, R, h };
}
const face = (g: Ctx, A: number[], B: number[], h: number, u0: number, u1: number, v0: number, v1: number, fill: string) => {
  const P = (u: number, v: number) => [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u - v * h];
  poly(g, [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)], fill, "rgba(0,0,0,.28)");
};
const flag = (g: Ctx, x: number, y: number, col: string, t: number) => { g.strokeStyle = "#5b3a1a"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 24); g.stroke(); poly(g, [[x, y - 24], [x + 15 + Math.sin(t * 5) * 2, y - 19], [x, y - 13]], col); };
export const BH: Record<string, number> = { house: 72, barn: 68, stall: 38, tent: 68, tower: 132, castle: 140, dome: 74, pyramid: 86, factory: 96, fountain: 46, wheel: 116, pen: 44, dock: 30, tree: 84, flowers: 22, pond: 18, windmill: 120 };

export function drawBuilding(g: Ctx, kind: string, cx: number, cy: number, pal: Pal, t: number, th: Theme, em = "") {
  const { wall, roof, accent } = pal;
  g.save(); g.fillStyle = "rgba(0,0,0,.16)"; g.beginPath(); g.ellipse(cx, cy + 6, HW * 0.78, HH * 0.8, 0, 0, 7); g.fill(); g.restore();
  switch (kind) {
    case "house": { const b = box(g, cx, cy, 0.72, 34, wall, 30, roof); face(g, b.B, b.R, 34, 0.3, 0.6, 0, 0.62, "#6b3f1d"); face(g, b.L, b.B, 34, 0.2, 0.46, 0.4, 0.8, "#a5dcff"); face(g, b.B, b.R, 34, 0.68, 0.88, 0.4, 0.74, "#a5dcff"); break; }
    case "barn": { const w2 = mix(wall, "#c0443a", 0.8), b = box(g, cx, cy, 0.92, 36, w2, 28, shade(roof, -0.15)); face(g, b.B, b.R, 36, 0.25, 0.75, 0, 0.78, "#f8f4ea"); face(g, b.B, b.R, 36, 0.32, 0.68, 0, 0.7, shade(w2, -0.3)); face(g, b.L, b.B, 36, 0.4, 0.6, 0.55, 0.85, "#f8f4ea"); break; }
    case "stall": { const b = box(g, cx, cy, 0.7, 16, wall, 16, accent); face(g, b.B, b.R, 16, 0.2, 0.8, 0.25, 0.85, shade(roof, 0.1)); face(g, b.L, b.B, 16, 0.25, 0.75, 0.2, 0.7, shade(accent, 0.3)); break; }
    case "tent": poly(g, [[cx - 42, cy + 6], [cx, cy - 56], [cx, cy + 24]], shade(roof, -0.02), "rgba(0,0,0,.2)"); poly(g, [[cx, cy + 24], [cx, cy - 56], [cx + 42, cy + 6]], shade(roof, -0.3), "rgba(0,0,0,.2)"); poly(g, [[cx - 21, cy - 26], [cx, cy - 56], [cx, cy - 22]], "rgba(255,255,255,.45)"); poly(g, [[cx - 9, cy + 15], [cx, cy - 4], [cx, cy + 24]], "#2d1f12"); flag(g, cx, cy - 56, accent, t); break;
    case "tower": { const b = box(g, cx, cy, 0.46, 84, wall, 38, roof); face(g, b.L, b.B, 84, 0.3, 0.6, 0.5, 0.75, "#a5dcff"); face(g, b.B, b.R, 84, 0.3, 0.6, 0.15, 0.4, "#a5dcff"); face(g, b.B, b.R, 84, 0.35, 0.65, 0, 0.1, "#6b3f1d"); flag(g, cx, cy - 122, accent, t); break; }
    case "castle": { box(g, cx, cy, 0.4, 96, wall, 34, roof, 0, -20); const bl = box(g, cx, cy, 0.34, 66, wall, 26, roof, -34, 2); box(g, cx, cy, 0.34, 66, wall, 26, roof, 34, 2); const k = box(g, cx, cy, 0.72, 44, shade(wall, -0.03), 0, roof, 0, 6); face(g, k.B, k.R, 44, 0.35, 0.65, 0, 0.62, "#4b2e1a"); face(g, k.L, k.B, 44, 0.3, 0.55, 0.45, 0.8, "#a5dcff"); face(g, bl.B, bl.R, 66, 0.3, 0.6, 0.55, 0.8, "#a5dcff"); flag(g, cx, cy - 150, accent, t); flag(g, cx - 34, cy - 94, accent, t + 1); flag(g, cx + 34, cy - 94, accent, t + 2); break; }
    case "dome": { const b = box(g, cx, cy, 0.8, 24, wall, 0); face(g, b.B, b.R, 24, 0.35, 0.65, 0, 0.7, "#6b3f1d"); const gr = g.createLinearGradient(cx - 36, cy - 60, cx + 36, cy - 20); gr.addColorStop(0, shade(accent, 0.45)); gr.addColorStop(1, shade(accent, -0.25)); g.fillStyle = gr; g.beginPath(); g.ellipse(cx, cy - 24, 36, 38, 0, Math.PI, 0); g.fill(); g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 1.5; g.stroke(); g.strokeStyle = "rgba(255,255,255,.7)"; g.lineWidth = 3; g.beginPath(); g.arc(cx - 6, cy - 40, 18, Math.PI * 1.15, Math.PI * 1.55); g.stroke(); g.strokeStyle = "#475569"; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy - 62); g.lineTo(cx, cy - 76); g.stroke(); break; }
    case "pyramid": { const a = [cx, cy - 84]; poly(g, [[cx - HW * 0.95, cy], [cx, cy + HH * 0.95], a], mix(wall, "#e8c27a", 0.5), "rgba(0,0,0,.25)"); poly(g, [[cx, cy + HH * 0.95], [cx + HW * 0.95, cy], a], shade(mix(wall, "#e8c27a", 0.5), -0.28), "rgba(0,0,0,.25)"); g.strokeStyle = "rgba(0,0,0,.14)"; g.lineWidth = 1.5; for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(cx - HW * 0.95 * (1 - i / 5), cy - 84 * (i / 5) + HH * 0.95 * (1 - i / 5) * 0.0); g.lineTo(cx, cy + HH * 0.95 - 84 * (i / 5) - 4); g.stroke(); } break; }
    case "factory": { box(g, cx, cy, 0.18, 70, "#6b7280", 0, "#000", 26, -12); const b = box(g, cx, cy, 0.9, 38, wall, 0); face(g, b.L, b.B, 38, 0.15, 0.4, 0.4, 0.75, "#a5dcff"); face(g, b.L, b.B, 38, 0.55, 0.8, 0.4, 0.75, "#a5dcff"); face(g, b.B, b.R, 38, 0.35, 0.65, 0, 0.55, shade(accent, -0.2)); poly(g, [[cx - HW * 0.9, cy - 38], [cx - HW * 0.45, cy - 62], [cx - HW * 0.45, cy - 38 - HH * 0.45]], roof, "rgba(0,0,0,.2)"); for (let i = 0; i < 3; i++) { const k = (t * 0.7 + i / 3) % 1; g.fillStyle = `rgba(230,230,235,${0.7 * (1 - k)})`; g.beginPath(); g.arc(cx + 26 + k * 10, cy - 82 - k * 40, 6 + k * 8, 0, 7); g.fill(); } break; }
    case "fountain": g.fillStyle = "#cbd5e1"; g.beginPath(); g.ellipse(cx, cy + 4, 32, 16, 0, 0, 7); g.fill(); g.fillStyle = "#7dd3fc"; g.beginPath(); g.ellipse(cx, cy + 2, 26, 12, 0, 0, 7); g.fill(); g.fillStyle = "#94a3b8"; g.fillRect(cx - 4, cy - 22, 8, 24); g.strokeStyle = "rgba(255,255,255,.85)"; g.lineWidth = 3; g.lineCap = "round"; for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(cx, cy - 22); g.quadraticCurveTo(cx + i * 14, cy - 40 + Math.sin(t * 5 + i) * 3, cx + i * 22, cy - 4); g.stroke(); } break;
    case "wheel": { box(g, cx, cy, 0.5, 8, "#9ca3af", 0); g.save(); g.translate(cx, cy - 58); g.strokeStyle = "#e5e7eb"; g.lineWidth = 3; g.beginPath(); g.moveTo(-20, 58); g.lineTo(0, 0); g.lineTo(20, 58); g.stroke(); g.rotate(t * 0.4); g.lineWidth = 5; g.strokeStyle = accent; g.beginPath(); g.arc(0, 0, 44, 0, 7); g.stroke(); g.lineWidth = 2; g.strokeStyle = "#e5e7eb"; for (let i = 0; i < 8; i++) { g.rotate(Math.PI / 4); g.beginPath(); g.moveTo(0, 0); g.lineTo(44, 0); g.stroke(); g.fillStyle = ["#ef4444", "#facc15", "#3b82f6", "#22c55e"][i % 4]; g.beginPath(); g.arc(44, 0, 6, 0, 7); g.fill(); } g.restore(); break; }
    case "pen": { poly(g, [[cx, cy - HH * 0.9], [cx + HW * 0.9, cy], [cx, cy + HH * 0.9], [cx - HW * 0.9, cy]], shade(th.grass, -0.1), "rgba(0,0,0,.15)"); const P = [[cx, cy - HH * 0.9], [cx + HW * 0.9, cy], [cx, cy + HH * 0.9], [cx - HW * 0.9, cy]]; g.strokeStyle = "#8b5a2b"; g.lineWidth = 3; for (const hgt of [10, 18]) { g.beginPath(); P.forEach((p, i) => (i ? g.lineTo(p[0], p[1] - hgt) : g.moveTo(p[0], p[1] - hgt))); g.closePath(); g.stroke(); } for (const p of P) g.fillRect(p[0] - 2, p[1] - 22, 4, 22); if (em) emoji(g, em, cx + Math.sin(t * 0.9) * 14, cy - 12, 30); break; }
    case "dock": { poly(g, [[cx, cy - HH * 0.85], [cx + HW * 0.85, cy], [cx, cy + HH * 0.85], [cx - HW * 0.85, cy]], "#b9854a", "rgba(0,0,0,.3)"); g.strokeStyle = "rgba(0,0,0,.2)"; g.lineWidth = 1.5; for (let i = 1; i < 5; i++) { const k = i / 5; g.beginPath(); g.moveTo(cx - HW * 0.85 * (1 - k) - 0, cy - HH * 0.85 * k * 0 + (-HH * 0.85 * k) * 0 + 0); g.lineTo(cx, cy - HH * 0.85 + HH * 1.7 * k); g.stroke(); } g.fillStyle = "#6b4423"; for (const [dx, dy] of [[0, -HH * 0.85], [HW * 0.85, 0], [0, HH * 0.85], [-HW * 0.85, 0]]) g.fillRect(cx + dx - 3, cy + dy - 16, 6, 18); break; }
    case "tree": { g.fillStyle = "#6b4423"; g.fillRect(cx - 6, cy - 34, 12, 38); const c = th.tree; for (const [dx, dy, r, k] of [[0, -62, 26, 0], [-16, -46, 20, -0.1], [16, -46, 20, 0.1]] as number[][]) { g.fillStyle = shade(c, k); g.beginPath(); g.arc(cx + dx + Math.sin(t * 1.5 + dx) * 1.5, cy + dy, r, 0, 7); g.fill(); } g.fillStyle = "rgba(255,255,255,.18)"; g.beginPath(); g.arc(cx - 8, cy - 70, 10, 0, 7); g.fill(); break; }
    case "flowers": for (const [dx, dy, col] of [[-16, -2, "#f472b6"], [4, 6, "#facc15"], [18, -4, "#fb7185"], [-4, -8, "#c084fc"], [-22, 8, "#fde047"], [12, 12, "#f472b6"]] as [number, number, string][]) { g.strokeStyle = "#3f9b3f"; g.lineWidth = 2; g.beginPath(); g.moveTo(cx + dx, cy + dy); g.lineTo(cx + dx, cy + dy - 10 + Math.sin(t * 2 + dx) * 1); g.stroke(); g.fillStyle = col; g.beginPath(); g.arc(cx + dx, cy + dy - 12, 5, 0, 7); g.fill(); g.fillStyle = "#fff7"; g.beginPath(); g.arc(cx + dx, cy + dy - 12, 2, 0, 7); g.fill(); } break;
    case "pond": g.fillStyle = shade(th.water, -0.2); g.beginPath(); g.ellipse(cx, cy, HW * 0.8, HH * 0.8, 0, 0, 7); g.fill(); g.fillStyle = th.water; g.beginPath(); g.ellipse(cx, cy - 1, HW * 0.72, HH * 0.7, 0, 0, 7); g.fill(); g.strokeStyle = "rgba(255,255,255,.5)"; g.lineWidth = 2; g.beginPath(); g.ellipse(cx + 6, cy, 12 + Math.sin(t * 2) * 2, 5, 0, 0, 7); g.stroke(); g.fillStyle = "#4ade80"; g.beginPath(); g.ellipse(cx - 16, cy + 3, 8, 4, 0, 0, 7); g.fill(); break;
    case "windmill": { const b = box(g, cx, cy, 0.5, 70, wall, 22, roof); g.save(); g.translate(cx, cy - 76 + 22); g.rotate(t * 0.8); g.strokeStyle = "#6b4423"; g.lineWidth = 4; for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -40); g.stroke(); poly(g, [[-2, -10], [12, -10], [12, -38], [-2, -38]], "rgba(255,255,255,.85)"); } g.restore(); face(g, b.B, b.R, 70, 0.35, 0.65, 0, 0.3, "#6b3f1d"); break; }
  }
}

function ground(g: Ctx, cx: number, cy: number, kind: "grass" | "soil" | "pave", th: Theme, c: number, r: number, t: number) {
  const P = [[cx, cy - HH], [cx + HW, cy], [cx, cy + HH], [cx - HW, cy]], h = hash(c, r);
  if (kind === "grass") {
    poly(g, P, (c + r) & 1 ? th.grass : shade(th.grass, -0.045));
    g.strokeStyle = shade(th.grass, -0.2); g.lineWidth = 2; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { const bx = cx + ((h >> (i * 5)) % 56) - 28, by = cy + ((h >> (i * 3 + 2)) % 20) - 10, sw = Math.sin(t * 1.5 + bx) * 1.5; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + sw, by - 6); g.moveTo(bx + 3, by); g.lineTo(bx + 4 + sw, by - 5); g.stroke(); }
    if (h % 11 === 0) { g.fillStyle = ["#fff", "#fde047", "#f9a8d4"][h % 3]; g.beginPath(); g.arc(cx + (h % 30) - 15, cy + (h % 12) - 6, 2.4, 0, 7); g.fill(); }
  } else if (kind === "soil") {
    const soil = mix(th.soil, "#7a4b2a", 0.5); poly(g, P, soil, "rgba(0,0,0,.25)");
    g.strokeStyle = shade(soil, -0.3); g.lineWidth = 3;
    for (const k of [0.25, 0.5, 0.75]) { g.beginPath(); g.moveTo(P[3][0] + (P[0][0] - P[3][0]) * k, P[3][1] + (P[0][1] - P[3][1]) * k); g.lineTo(P[2][0] + (P[1][0] - P[2][0]) * k, P[2][1] + (P[1][1] - P[2][1]) * k); g.stroke(); }
    g.strokeStyle = shade(soil, 0.18); g.lineWidth = 1.5; for (const k of [0.25, 0.5, 0.75]) { g.beginPath(); g.moveTo(P[3][0] + (P[0][0] - P[3][0]) * k, P[3][1] + (P[0][1] - P[3][1]) * k + 3); g.lineTo(P[2][0] + (P[1][0] - P[2][0]) * k, P[2][1] + (P[1][1] - P[2][1]) * k + 3); g.stroke(); }
  } else { poly(g, P, "#cfd3da", "rgba(0,0,0,.14)"); poly(g, [[cx, cy - HH * 0.78], [cx + HW * 0.78, cy], [cx, cy + HH * 0.78], [cx - HW * 0.78, cy]], (c + r) & 1 ? "#dde1e7" : "#d5d9e0"); }
}
function crop(g: Ctx, cx: number, cy: number, em: string, p: number, t: number) {
  const sw = Math.sin(t * 2 + cx * 0.05) * 2;
  const leaf = (a: number, len: number, col: string) => { g.save(); g.translate(cx, cy); g.rotate(a + sw * 0.02); g.fillStyle = col; g.beginPath(); g.ellipse(0, -len * 0.5, len * 0.28, len * 0.5, 0, 0, 7); g.fill(); g.restore(); };
  g.fillStyle = "rgba(0,0,0,.18)"; g.beginPath(); g.ellipse(cx, cy + 3, 15, 6, 0, 0, 7); g.fill();
  if (p < 0.5) { const k = 0.5 + p; g.fillStyle = "#5a3a1f"; g.beginPath(); g.ellipse(cx, cy + 1, 11, 5, 0, 0, 7); g.fill(); leaf(-0.5, 16 * k, "#4caf50"); leaf(0.5, 16 * k, "#3d9a44"); }
  else { const k = 0.8 + (p - 0.5) * 0.6; for (const [a, col] of [[-1.1, "#2e8b3d"], [1.1, "#2e8b3d"], [-0.55, "#3fa34d"], [0.55, "#3fa34d"], [0, "#4caf50"]] as [number, string][]) leaf(a, 30 * k, col); }
  if (p >= 1) { for (const [dx, dy] of [[-12, -16], [12, -16], [0, -28]]) emoji(g, em, cx + dx + sw, cy + dy + Math.sin(t * 3 + dx) * 1.5, 22); emoji(g, "✨", cx + 16, cy - 34 + Math.sin(t * 4) * 3, 14, 0.5 + 0.5 * Math.abs(Math.sin(t * 3 + cx))); }
}
const fence = (g: Ctx, a: number[], b: number[]) => { g.strokeStyle = "#8b5a2b"; g.lineWidth = 3; g.lineCap = "round"; for (const hgt of [9, 17]) { g.beginPath(); g.moveTo(a[0], a[1] - hgt); g.lineTo(b[0], b[1] - hgt); g.stroke(); } for (const p of [a, b]) { g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0], p[1] - 22); g.stroke(); } };

export function pickTile(l: L, cols: number, rows: number, tiles: Record<string, Tile>, x: number, y: number): string | null {
  for (let r = rows - 1; r >= 0; r--) for (let c = cols - 1; c >= 0; c--) {   // front-most first so tall buildings can be clicked
    const k = `${c},${r}`, t = tiles[k]; if (!t) continue;
    const it = itemById(t.id), cx = sx(l, c, r), cy = sy(l, c, r), h = t.k === "b" ? BH[it?.kind ?? "house"] ?? 60 : 36;
    if (Math.abs(x - cx) < HW * 0.7 && y > cy - h && y < cy + HH * 0.6) return k;
  }
  const dx = (x - l.ox) / HW, dy = (y - l.oy) / HH, c = Math.round((dx + dy) / 2), r = Math.round((dy - dx) / 2);
  return c >= 0 && c < cols && r >= 0 && r < rows ? `${c},${r}` : null;
}

export function drawFarm(g: Ctx, o: FarmIn) {
  const th = THEMES[o.w], { cols, rows, t } = o, l = layout(cols, rows), W = l.W, H = l.H;
  const sg = g.createLinearGradient(0, 0, 0, H); sg.addColorStop(0, th.sky[0]); sg.addColorStop(0.5, th.sky[1]); sg.addColorStop(1, th.sky[2]); g.fillStyle = sg; g.fillRect(0, 0, W, H);
  g.fillStyle = shade(th.far, 0.1); g.beginPath(); g.moveTo(0, 230); for (let x = 0; x <= W; x += 24) g.lineTo(x, 190 + Math.sin(x / 90) * 26 + Math.sin(x / 33) * 8); g.lineTo(W, 340); g.lineTo(0, 340); g.fill();
  for (let i = 0; i < 4; i++) drawCloud(g, ((i * 330 + t * 10) % (W + 300)) - 150, 70 + (i % 2) * 55, 34 + (i % 3) * 8, 0.9);
  drawFx(g, th.fx, W, H, t, 0, 16);
  const P = (c: number, r: number) => [sx(l, c, r), sy(l, c, r)], c0 = -M - 0.5, c1 = cols + M - 0.5, r0 = -M - 0.5, r1 = rows + M - 0.5;
  const top = P(c0, r0), right = P(c1, r0), bottom = P(c1, r1), left = P(c0, r1), D = 26;
  for (let i = 0; i < 3; i++) drawCloud(g, ((i * 420 + t * 8) % (W + 300)) - 120, bottom[1] + 70 + i * 16, 50, 0.85);
  const rock = th.soil, dn = (p: number[], d: number) => [p[0], p[1] + d], apex = [bottom[0], bottom[1] + D + 96];
  poly(g, [dn(left, D), dn(bottom, D), apex], shade(rock, -0.45)); poly(g, [dn(bottom, D), dn(right, D), apex], shade(rock, -0.6));
  poly(g, [left, bottom, dn(bottom, D), dn(left, D)], shade(rock, -0.1), "rgba(0,0,0,.25)"); poly(g, [bottom, right, dn(right, D), dn(bottom, D)], shade(rock, -0.32), "rgba(0,0,0,.25)");
  g.fillStyle = "rgba(255,255,255,.1)"; for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(left[0] + (bottom[0] - left[0]) * (i / 9) + 8, left[1] + (bottom[1] - left[1]) * (i / 9) + 14, 5, 3, 0, 0, 7); g.fill(); }
  poly(g, [top, right, bottom, left], shade(th.grass, -0.08));
  const field = (c: number, r: number) => isField(c, r) && c < cols && r < rows;
  for (let sum = -2 * M; sum <= cols + rows + 2 * M - 2; sum++) for (let c = -M; c < cols + M; c++) {   // ground, back to front
    const r = sum - c; if (r < -M || r >= rows + M) continue;
    const inG = c >= 0 && c < cols && r >= 0 && r < rows, k = `${c},${r}`, tile = o.tiles[k];
    const kind = !inG ? "grass" : field(c, r) && tile?.k !== "b" ? "soil" : o.city ? "pave" : "grass";
    ground(g, sx(l, c, r), sy(l, c, r), kind, th, c, r, t);
    if (o.hover === k && inG) { const x = sx(l, c, r), y = sy(l, c, r); poly(g, [[x, y - HH], [x + HW, y], [x, y + HH], [x - HW, y]], "rgba(255,255,255,.22)", "rgba(255,255,255,.95)"); }
  }
  const objs: [number, () => void][] = [];
  const add = (c: number, r: number, f: () => void) => objs.push([c + r, f]);
  for (let c = -M; c < cols + M; c++) for (let r = -M; r < rows + M; r++) {
    const inG = c >= 0 && c < cols && r >= 0 && r < rows, x = sx(l, c, r), y = sy(l, c, r);
    if (inG) {
      const tile = o.tiles[`${c},${r}`];
      if (tile) { const it = itemById(tile.id); if (it) add(c, r, () => { if (tile.k === "c") crop(g, x, y, it.emoji, Math.min(1, (o.now - tile.at) / (it.grow * 1000)), t); else { drawBuilding(g, it.kind, x, y, palFor(o.w, th, tile.id), t, th, it.emoji); if (it.kind !== "flowers" && it.kind !== "pond" && it.kind !== "tree") { const by = y - (BH[it.kind] ?? 60) - 18 + Math.sin(t * 2 + c) * 2; g.fillStyle = "rgba(255,255,255,.92)"; g.beginPath(); g.arc(x, by, 14, 0, 7); g.fill(); g.strokeStyle = "rgba(0,0,0,.2)"; g.lineWidth = 2; g.stroke(); emoji(g, it.emoji, x, by + 1, 17); } } }); }
      if (!o.city) { if (r === rows - 1) add(c, r, () => fence(g, [x - HW, y], [x, y + HH])); if (c === cols - 1) add(c, r, () => fence(g, [x, y + HH], [x + HW, y])); }
      continue;
    }
    const h = hash(c, r);
    if (c === -1 && r === -1) add(c, r, () => drawBuilding(g, "house", x, y, { wall: "#f4e8d0", roof: "#b8463a", accent: "#f59e0b" }, t, th));
    else if (c === -1 && r === 2) add(c, r, () => drawBuilding(g, "windmill", x, y, { wall: "#f1e4c8", roof: "#8b4a2b", accent: "#f59e0b" }, t, th));
    else if (h % 100 < 36) add(c, r, () => drawProp(g, th.prop, x + (h % 18) - 9, y + 8, 0.5 + (h % 7) * 0.05, t, th));
    else if (h % 100 < 52) add(c, r, () => emoji(g, th.deco[h % th.deco.length], x, y - 6, 24));
  }
  th.crit.forEach((em, i) => {   // critters stroll around the island
    const s = ((t * 0.035 + i / th.crit.length) % 1) * 4, side = Math.floor(s), u = s - side, a = -1.3, bb = cols + 0.3, b2 = rows + 0.3;
    const [c, r] = side === 0 ? [a + (bb - a) * u, a] : side === 1 ? [bb, a + (b2 - a) * u] : side === 2 ? [bb - (bb - a) * u, b2] : [a, b2 - (b2 - a) * u];
    add(c, r, () => { g.fillStyle = "rgba(0,0,0,.18)"; g.beginPath(); g.ellipse(sx(l, c, r), sy(l, c, r) + 4, 11, 4, 0, 0, 7); g.fill(); emoji(g, em, sx(l, c, r), sy(l, c, r) - 8 - Math.abs(Math.sin(t * 6 + i * 2)) * 4, 30); });
  });
  if (o.ghost && o.hover) { const [c, r] = o.hover.split(",").map(Number), it = itemById(o.ghost); if (it && !o.tiles[o.hover]) add(c, r, () => { g.save(); g.globalAlpha = 0.6; if (it.kind === "crop") crop(g, sx(l, c, r), sy(l, c, r), it.emoji, 1, t); else drawBuilding(g, it.kind, sx(l, c, r), sy(l, c, r), palFor(o.w, th, it.id), t, th, it.emoji); g.restore(); }); }
  objs.sort((a, b) => a[0] - b[0]).forEach(([, f]) => f());
  drawFx(g, th.fx, W, H, t, 40, 10);
  if (o.hover) { const t2 = o.tiles[o.hover], it = t2 ? itemById(t2.id) : undefined, [c, r] = o.hover.split(",").map(Number); if (it) { const txt = t2!.k === "c" ? (o.now - t2!.at >= it.grow * 1000 ? `${it.name}: ready! tap to harvest` : `${it.name}: growing…`) : it.name; g.font = "bold 15px sans-serif"; const w2 = g.measureText(txt).width + 20, x = sx(l, c, r), y = sy(l, c, r) - (t2!.k === "b" ? BH[it.kind] ?? 60 : 40) - 34; g.fillStyle = "rgba(20,25,40,.85)"; g.beginPath(); g.roundRect(x - w2 / 2, y - 14, w2, 28, 10); g.fill(); g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, x, y); } }
}
