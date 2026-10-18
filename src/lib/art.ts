// Shared canvas art: themes for all 14 worlds, scenery props, particles, clouds, boats. Used by the farm, platformer and world map.
export type Ctx = CanvasRenderingContext2D;
export interface Theme { sky: [string, string, string]; far: string; grass: string; soil: string; tree: string; water: string; prop: string; fx: string; crit: string[]; deco: string[] }
const T = (sky: [string, string, string], far: string, grass: string, soil: string, tree: string, water: string, prop: string, fx: string, crit: string, deco: string): Theme => ({ sky, far, grass, soil, tree, water, prop, fx, crit: crit.split(","), deco: deco.split(",") });
export const THEMES: Theme[] = [
  T(["#7ec8ff", "#b8e6ff", "#e8f8c8"], "#6bb36b", "#86d05a", "#8a5a3a", "#2f9e44", "#4aa8d8", "pine", "firefly", "🐑,🐔,🐄", "🌻,🍄,🌷"),
  T(["#38bdf8", "#7dd3fc", "#bae6fd"], "#2aa6c8", "#f1e0a8", "#c9b27a", "#fb7185", "#1d8fd1", "coral", "bubble", "🦀,🐢,🐠", "🐚,⭐,🐟"),
  T(["#fcd34d", "#fde68a", "#fff3c4"], "#e5b45a", "#f0cf85", "#c98f45", "#65a30d", "#38bdf8", "cactus", "sand", "🐪,🦎,🦂", "🌵,🏺,🌴"),
  T(["#6ea8ff", "#a5c8ff", "#e0eeff"], "#c7d9ff", "#f4f8ff", "#b7c6ee", "#a5b4fc", "#93c5fd", "cloud", "sparkle", "🦅,🎈,🐦", "🎈,🌈,🪁"),
  T(["#0b1030", "#1e1b4b", "#4c1d95"], "#3b2f7a", "#8d93b0", "#5b6080", "#a78bfa", "#6d28d9", "crater", "star", "👾,🛸,🐈", "⭐,🪐,🌙"),
  T(["#450a0a", "#9a3412", "#f97316"], "#5b1a12", "#6b3a2e", "#3b1d17", "#f97316", "#ef4444", "vent", "ember", "🦎,🔥,🐲", "🔥,🪨,🌋"),
  T(["#4c1d95", "#7e22ce", "#c084fc"], "#6d28d9", "#b9a1e8", "#7c5cb0", "#e879f9", "#a855f7", "crystal", "spark", "🦇,🦋,🐛", "💎,🔮,✨"),
  T(["#a5f3fc", "#cffafe", "#f0fdff"], "#bae6fd", "#f1f9ff", "#a8c8e0", "#0e7490", "#38bdf8", "snowpine", "snow", "🐧,🦊,🐇", "⛄,🧊,🎿"),
  T(["#020617", "#1e1b4b", "#0e7490"], "#1e3a8a", "#1e3a5f", "#0f172a", "#22d3ee", "#a21caf", "tower", "pixel", "🤖,👾,🛰", "⚡,💾,🔷"),
  T(["#34d399", "#6ee7b7", "#d9f99d"], "#15803d", "#4ade80", "#78350f", "#166534", "#0ea5e9", "palm", "leaf", "🐒,🦜,🐍", "🌴,🍌,🌺"),
  T(["#f9a8d4", "#fbcfe8", "#fef3c7"], "#f472b6", "#fbcfe8", "#d97796", "#f43f5e", "#fb7185", "candy", "sprinkle", "🐰,🧁,🦄", "🍭,🍬,🍩"),
  T(["#bef264", "#d9f99d", "#fef9c3"], "#65a30d", "#a3e635", "#92400e", "#4d7c0f", "#38bdf8", "fern", "pollen", "🦕,🦖,🥚", "🌿,🦴,🥚"),
  T(["#d6a35c", "#e7c38a", "#f7e6c4"], "#a16207", "#d6b27a", "#78350f", "#b45309", "#78716c", "gear", "steam", "🐜,🤖,🪲", "🔧,🔩,⏰"),
  T(["#f0abfc", "#a5b4fc", "#fde68a"], "#c4b5fd", "#fce7f3", "#e9a8d4", "#f472b6", "#818cf8", "rainbow", "sparkle", "🦄,🐇,🦋", "🌈,⭐,🌸"),
];

export function shade(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16), f = (v: number) => Math.max(0, Math.min(255, Math.round(a < 0 ? v * (1 + a) : v + (255 - v) * a)));
  return "#" + [n >> 16, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, "0")).join("");
}
export function mix(a: string, b: string, k: number) {
  const p = (h: string) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }, x = p(a), y = p(b);
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, "0")).join("");
}
export function poly(g: Ctx, pts: number[][], fill: string, stroke?: string) {
  g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = fill; g.fill();
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1.5; g.lineJoin = "round"; g.stroke(); }
}
/** ALWAYS draw emoji through this: it resets paint so a leftover translucent fill colour can never fade the emoji. */
export function emoji(g: Ctx, ch: string, x: number, y: number, size: number, alpha = 1) {
  g.save(); g.globalAlpha = alpha; g.fillStyle = "#000"; g.shadowBlur = 0; g.font = `${size}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(ch, x, y); g.restore();
}
export const hash = (a: number, b: number) => { let h = (Math.imul(a + 7919, 73856093) ^ Math.imul(b + 104729, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };

export function drawProp(g: Ctx, kind: string, x: number, y: number, s: number, t: number, th: Theme) {
  g.save(); g.translate(x, y); g.scale(s, s); g.lineCap = "round";
  const c = th.tree;
  switch (kind) {
    case "pine": case "snowpine":
      g.fillStyle = "#6b4423"; g.fillRect(-5, -12, 10, 12);
      for (let i = 0; i < 3; i++) { const w = 34 - i * 8, yy = -10 - i * 24; poly(g, [[-w, yy], [w, yy], [0, yy - 36]], i % 2 ? shade(c, 0.12) : c); if (kind === "snowpine") poly(g, [[-w * 0.5, yy - 18], [w * 0.5, yy - 18], [0, yy - 36]], "#ffffff"); }
      break;
    case "coral":
      for (let i = -1; i <= 1; i++) { const top = -44 - (i === 0 ? 14 : 0); g.strokeStyle = c; g.lineWidth = 8; g.beginPath(); g.moveTo(i * 14, 0); g.quadraticCurveTo(i * 22 + Math.sin(t + i) * 4, -22, i * 14, top); g.stroke(); g.fillStyle = shade(c, 0.25); g.beginPath(); g.arc(i * 14, top, 7, 0, 7); g.fill(); }
      break;
    case "cactus":
      g.fillStyle = c; g.beginPath(); g.roundRect(-10, -64, 20, 64, 10); g.fill(); g.beginPath(); g.roundRect(-30, -44, 14, 26, 7); g.fill(); g.fillRect(-26, -28, 18, 9); g.beginPath(); g.roundRect(16, -52, 14, 28, 7); g.fill(); g.fillRect(8, -34, 18, 9);
      g.fillStyle = shade(c, -0.2); g.fillRect(-2, -60, 4, 56); break;
    case "cloud": g.fillStyle = "rgba(255,255,255,.93)"; for (const [a, b, r] of [[-26, -26, 20], [0, -38, 26], [28, -26, 20], [0, -20, 28]]) { g.beginPath(); g.arc(a, b, r, 0, 7); g.fill(); } break;
    case "crater": g.fillStyle = shade(th.soil, -0.2); g.beginPath(); g.ellipse(0, -8, 38, 14, 0, 0, 7); g.fill(); g.fillStyle = shade(th.soil, -0.4); g.beginPath(); g.ellipse(0, -6, 30, 9, 0, 0, 7); g.fill(); break;
    case "vent": poly(g, [[-26, 0], [26, 0], [10, -40], [-10, -40]], "#3b1d17"); g.fillStyle = `rgba(255,${(120 + Math.sin(t * 5) * 40) | 0},20,.9)`; g.beginPath(); g.ellipse(0, -40, 10, 5, 0, 0, 7); g.fill(); break;
    case "crystal": for (const [a, h, w2] of [[-18, 40, 9], [0, 66, 12], [18, 46, 9]]) poly(g, [[a - w2, 0], [a, -h], [a + w2, 0]], c, "rgba(255,255,255,.6)"); break;
    case "tower": g.fillStyle = "#0f172a"; g.fillRect(-18, -90, 36, 90); g.fillStyle = c; for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) if ((i * 3 + j * 5 + ((t * 0.8) | 0)) % 4 < 3) g.fillRect(-12 + j * 14, -82 + i * 14, 8, 8); break;
    case "palm":
      g.strokeStyle = "#8b5a2b"; g.lineWidth = 8; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(14, -34, 4, -70); g.stroke();
      for (let i = 0; i < 5; i++) { g.save(); g.translate(4, -70); g.rotate(-1.3 + i * 0.65 + Math.sin(t * 2 + i) * 0.05); g.fillStyle = i % 2 ? c : shade(c, 0.15); g.beginPath(); g.ellipse(26, 0, 28, 7, 0, 0, 7); g.fill(); g.restore(); }
      break;
    case "candy": g.fillStyle = "#fff"; g.fillRect(-3, -50, 6, 50); g.fillStyle = c; g.beginPath(); g.arc(0, -64, 22, 0, 7); g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 5; g.beginPath(); for (let a = 0.3; a < 12; a += 0.3) g.lineTo(Math.cos(a) * a * 1.6, -64 + Math.sin(a) * a * 1.6); g.stroke(); break;
    case "fern": g.strokeStyle = c; g.lineWidth = 6; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(i * 16, -44, i * 26 + Math.sin(t * 2 + i) * 3, -34 + Math.abs(i) * 8); g.stroke(); } break;
    case "gear": g.save(); g.translate(0, -30); g.rotate(t * 0.5); g.fillStyle = c; for (let i = 0; i < 8; i++) { g.rotate(Math.PI / 4); g.fillRect(-5, -34, 10, 12); } g.beginPath(); g.arc(0, 0, 26, 0, 7); g.fill(); g.fillStyle = th.soil; g.beginPath(); g.arc(0, 0, 10, 0, 7); g.fill(); g.restore(); break;
    case "rainbow": ["#ef4444", "#f59e0b", "#facc15", "#22c55e", "#3b82f6", "#a855f7"].forEach((col, i) => { g.strokeStyle = col; g.lineWidth = 7; g.beginPath(); g.arc(0, 0, 46 - i * 7, Math.PI, 0); g.stroke(); }); break;
  }
  g.restore();
}

const FX: Record<string, { col: string; r: number; dy: number; dx: number; sq?: boolean }> = {
  firefly: { col: "#fde047", r: 3, dy: 0, dx: 8 }, bubble: { col: "rgba(255,255,255,.65)", r: 5, dy: -22, dx: 6 }, sand: { col: "rgba(214,170,90,.55)", r: 2, dy: 3, dx: 40 },
  sparkle: { col: "#ffffff", r: 3, dy: 4, dx: 6 }, star: { col: "#ffffff", r: 2, dy: 0, dx: 0 }, ember: { col: "#fb923c", r: 3, dy: -30, dx: 10 }, spark: { col: "#f5d0fe", r: 3, dy: -8, dx: 8 },
  snow: { col: "#ffffff", r: 3, dy: 24, dx: 14 }, pixel: { col: "#22d3ee", r: 3, dy: 10, dx: 0, sq: true }, leaf: { col: "#86efac", r: 4, dy: 16, dx: 24 },
  sprinkle: { col: "#fb7185", r: 3, dy: 14, dx: 12, sq: true }, pollen: { col: "#fde68a", r: 3, dy: -4, dx: 12 }, steam: { col: "rgba(255,255,255,.35)", r: 8, dy: -18, dx: 8 },
};
export function drawFx(g: Ctx, kind: string, W: number, H: number, t: number, off = 0, n = 26) {
  const f = FX[kind]; if (!f) return;
  g.save();
  for (let i = 0; i < n; i++) {
    const sd = i * 7.13, sp = f.dy * (0.6 + (i % 4) * 0.2);
    const x = ((((sd * 97.3 + off * (0.2 + (i % 3) * 0.15)) % W) + W) % W) + Math.sin(t * 0.8 + i) * f.dx, y = ((((sd * 53.7 + t * sp) % H) + H) % H);
    g.globalAlpha = kind === "star" || kind === "firefly" || kind === "sparkle" ? 0.35 + 0.65 * Math.abs(Math.sin(t * 1.5 + i)) : 0.85;
    g.fillStyle = i % 3 === 0 && kind === "sprinkle" ? "#60a5fa" : i % 3 === 1 && kind === "sprinkle" ? "#facc15" : f.col;
    g.beginPath(); if (f.sq) g.rect(x, y, f.r * 1.6, f.r * 1.6); else g.arc(x, y, f.r * (0.6 + (i % 3) * 0.3), 0, 7); g.fill();
  }
  g.restore();
}
/** A fluffy cloud; r is roughly its half-width. */
export function drawCloud(g: Ctx, x: number, y: number, r: number, a = 1) {
  g.save(); g.globalAlpha = a;
  for (const [dx, dy, k, col] of [[0, 0.2, 0.5, "#d3e6f6"], [-0.55, 0.14, 0.38, "#dcecfa"], [0.55, 0.14, 0.4, "#dcecfa"], [0, 0, 0.5, "#ffffff"], [-0.45, -0.08, 0.37, "#ffffff"], [0.5, -0.05, 0.39, "#ffffff"], [0.08, -0.28, 0.34, "#ffffff"]] as [number, number, number, string][]) { g.fillStyle = col; g.beginPath(); g.ellipse(x + dx * r, y + dy * r * 0.8, r * k * 1.1, r * k * 0.8, 0, 0, 7); g.fill(); }
  g.restore();
}
export function drawBoat(g: Ctx, x: number, y: number, s: number, t: number, dir = 1, hull = "#7c4a21", sail = "#ffffff") {
  g.save(); g.translate(x, y + Math.sin(t * 2 + x * 0.01) * 2); g.scale(s * dir, s);
  poly(g, [[-24, 0], [24, 0], [15, 11], [-15, 11]], hull); g.fillStyle = "#5b3a1a"; g.fillRect(-1, -36, 3, 36);
  poly(g, [[4, -34], [4, -4], [22, -4]], sail, "rgba(0,0,0,.15)"); poly(g, [[-4, -30], [-4, -4], [-17, -4]], shade(sail, -0.08), "rgba(0,0,0,.15)"); poly(g, [[3, -36], [3, -30], [12, -33]], "#ef4444");
  g.restore();
}
