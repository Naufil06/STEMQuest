import { VH, VW } from "./levels";
import { foeY, type Run } from "./platformer";
import { THEMES, shade, mix, poly, emoji, drawProp, drawFx, drawCloud, hash, type Ctx } from "./art";
import { WORLDS } from "./rewards";
import { farmOf } from "./farm";

export type Dust = { x: number; y: number; vx: number; vy: number; l: number };
const NIGHT = new Set([4, 5, 6, 8]);   // worlds drawn with a night sky

/** Draws one frame of the platformer: layered parallax scenery, themed ground, collectibles, enemies, the animated pet and the HUD. */
export function drawLevel(g: Ctx, R: Run, w: number, pet: string, dust: Dust[]) {
  const th = THEMES[w], W = WORLDS[w], F = farmOf(w), t = R.time, cam = Math.max(0, Math.min(R.L.width - VW, R.x - VW * 0.4));
  const sg = g.createLinearGradient(0, 0, 0, VH); sg.addColorStop(0, th.sky[0]); sg.addColorStop(0.55, th.sky[1]); sg.addColorStop(1, th.sky[2]); g.fillStyle = sg; g.fillRect(0, 0, VW, VH);
  if (NIGHT.has(w)) { for (let i = 0; i < 50; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + 0.5 * Math.abs(Math.sin(t + i))})`; g.fillRect((i * 83 - cam * 0.05) % VW + (i * 83 - cam * 0.05 < 0 ? VW : 0), (i * 47) % 300, 2, 2); } g.fillStyle = "#f1f5f9"; g.beginPath(); g.arc(VW - 150, 90, 34, 0, 7); g.fill(); g.fillStyle = th.sky[0]; g.beginPath(); g.arc(VW - 136, 82, 30, 0, 7); g.fill(); }
  else { const sn = g.createRadialGradient(VW - 140, 90, 6, VW - 140, 90, 120); sn.addColorStop(0, "rgba(255,255,230,1)"); sn.addColorStop(0.25, "rgba(255,240,150,.95)"); sn.addColorStop(1, "rgba(255,240,150,0)"); g.fillStyle = sn; g.fillRect(VW - 270, 0, 270, 220); for (let i = 0; i < 5; i++) drawProp(g, "cloud", ((((i * 380 - cam * 0.1 - t * 9) % 1900) + 1900) % 1900) - 200, 60 + (i % 3) * 52, 1.1 + (i % 2) * 0.4, t, th); }
  for (let l = 0; l < 2; l++) { g.fillStyle = shade(th.far, l ? -0.18 : 0.05); g.beginPath(); g.moveTo(0, VH); for (let x = 0; x <= VW; x += 16) g.lineTo(x, VH - 190 + l * 40 + Math.sin((x + cam * (0.12 + l * 0.14)) / (150 - l * 40)) * (46 - l * 8) + Math.sin((x + cam * 0.2) / 47) * 6); g.lineTo(VW, VH); g.fill(); }
  const layer = (gap: number, par: number, sc: number, base: number, a: number) => { const k0 = Math.floor((cam * par) / gap) - 1; g.save(); g.globalAlpha = a; for (let k = k0; k < k0 + VW / gap + 3; k++) { const h = hash(k, w + 5 * gap); drawProp(g, th.prop, k * gap + (h % 90) - cam * par, base + (h % 20), sc * (0.8 + (h % 5) * 0.08), t, th); } g.restore(); };
  layer(170, 0.35, 1.0, 396, 0.6); layer(250, 0.65, 1.35, 410, 0.85);
  drawFx(g, th.fx, VW, VH, t, cam);
  g.save(); g.translate(-cam, 0);
  g.fillStyle = th.water; g.beginPath(); g.moveTo(cam, VH); for (let x = cam; x <= cam + VW + 20; x += 20) g.lineTo(x, VH - 30 + Math.sin(x * 0.04 + t * 3) * 5); g.lineTo(cam + VW + 20, VH); g.fill(); g.fillStyle = "rgba(255,255,255,.25)"; for (let x = cam; x < cam + VW; x += 60) g.fillRect(x + ((t * 20) % 60), VH - 28, 22, 3);
  for (const p of R.L.plats) {
    if (p.x + p.w < cam - 20 || p.x > cam + VW + 20) continue;
    if (p.one) { const lg = g.createLinearGradient(0, p.y, 0, p.y + p.h); lg.addColorStop(0, shade(th.soil, 0.2)); lg.addColorStop(1, shade(th.soil, -0.2)); g.fillStyle = lg; g.beginPath(); g.roundRect(p.x, p.y, p.w, p.h, 7); g.fill(); g.fillStyle = th.grass; g.beginPath(); g.roundRect(p.x - 3, p.y - 4, p.w + 6, 9, 5); g.fill(); g.fillStyle = "rgba(0,0,0,.18)"; for (let x = p.x + 14; x < p.x + p.w - 8; x += 24) g.fillRect(x, p.y + 8, 3, 4); continue; }
    const lg = g.createLinearGradient(0, p.y, 0, p.y + 230); lg.addColorStop(0, shade(th.soil, 0.15)); lg.addColorStop(1, shade(th.soil, -0.4)); g.fillStyle = lg; g.fillRect(p.x, p.y, p.w, p.h);
    g.fillStyle = "rgba(0,0,0,.13)"; for (let x = p.x; x < p.x + p.w; x += 48) for (let y = p.y + 30; y < p.y + 200; y += 46) { const h = hash(x, y); g.beginPath(); g.ellipse(x + 10 + (h % 24), y + (h % 12), 9, 6, 0, 0, 7); g.fill(); }
    g.fillStyle = th.grass; g.fillRect(p.x, p.y, p.w, 9); for (let x = p.x; x < p.x + p.w; x += 14) { g.beginPath(); g.arc(x + 7, p.y + 9, 7.5, 0, Math.PI); g.fill(); } g.fillStyle = "rgba(255,255,255,.3)"; g.fillRect(p.x, p.y, p.w, 3);
    const h = hash(p.x, w), nearHaz = (x: number) => R.L.spikes.some((s) => Math.abs(s.x - x) < 90) || R.L.foes.some((f) => Math.abs(f.x - x) < 120);
    if (p.w >= 5 * 48 && h % 3 !== 0) { const px = p.x + 24 + (h % (p.w - 48)); if (!nearHaz(px)) { if (h % 2) drawProp(g, th.prop, px, p.y + 4, 0.55, t, th); else emoji(g, th.deco[h % th.deco.length], px, p.y - 12, 24); } }
  }
  for (const s of R.L.spikes) { g.strokeStyle = "#475569"; g.lineWidth = 2; for (let x = s.x; x < s.x + s.w - 4; x += 14) { poly(g, [[x, s.y + s.h], [x + 7, s.y], [x + 14, s.y + s.h]], "#e5e7eb", "#475569"); g.strokeStyle = "rgba(255,255,255,.8)"; g.beginPath(); g.moveTo(x + 6, s.y + 6); g.lineTo(x + 7, s.y + 2); g.stroke(); } }
  for (const ch of R.L.checks) { const on = R.check.x >= ch.x; g.strokeStyle = "#5b3a1a"; g.lineWidth = 4; g.beginPath(); g.moveTo(ch.x, ch.y); g.lineTo(ch.x, ch.y - 56); g.stroke(); poly(g, [[ch.x, ch.y - 56], [ch.x + 30 + Math.sin(t * 5) * 3, ch.y - 48], [ch.x, ch.y - 38]], on ? "#22c55e" : "#ef4444", "rgba(0,0,0,.25)"); if (on) emoji(g, "✨", ch.x + 6, ch.y - 66 + Math.sin(t * 4) * 3, 16); }
  const gx = R.L.goal.x, gy = R.L.start.y; g.fillStyle = "#e2e8f0"; g.fillRect(gx - 48, gy - 150, 22, 150); g.fillRect(gx + 26, gy - 150, 22, 150); g.fillStyle = "#cbd5e1"; g.fillRect(gx - 56, gy - 168, 112, 24); poly(g, [[gx - 26, gy - 144], [gx + 26, gy - 144], [gx, gy - 108]], W.c1); g.strokeStyle = "#5b3a1a"; g.lineWidth = 4; g.beginPath(); g.moveTo(gx, gy - 168); g.lineTo(gx, gy - 220); g.stroke(); poly(g, [[gx, gy - 220], [gx + 44 + Math.sin(t * 5) * 4, gy - 206], [gx, gy - 192]], "#facc15", "rgba(0,0,0,.2)"); emoji(g, "🏁", gx, gy - 70, 48); for (let i = 0; i < 6; i++) emoji(g, "⭐", gx - 50 + i * 20, gy - 190 - Math.abs(Math.sin(t * 3 + i)) * 24, 16, 0.8);
  for (const it of R.L.items) {
    if (it.got || it.x < cam - 40 || it.x > cam + VW + 40) continue;
    const b = Math.sin(t * 4 + it.x) * 4, y = it.y + b;
    if (it.t === "coin") { const sq = Math.abs(Math.cos(t * 3 + it.x)); g.fillStyle = "#facc15"; g.strokeStyle = "#a16207"; g.lineWidth = 3; g.beginPath(); g.ellipse(it.x, y, 11 * sq + 3, 12, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = "rgba(255,255,255,.7)"; g.fillRect(it.x - 2, y - 7, 3, 9 * sq + 1); }
    else if (it.t === "heart") { emoji(g, "❤️", it.x, y, 32); }
    else if (it.t === "crop") { const gl = g.createRadialGradient(it.x, y, 4, it.x, y, 30); gl.addColorStop(0, "rgba(255,255,200,.55)"); gl.addColorStop(1, "rgba(255,255,200,0)"); g.fillStyle = gl; g.fillRect(it.x - 30, y - 30, 60, 60); emoji(g, F.seeds[it.j!].emoji, it.x, y, 34); }
    else { g.fillStyle = "rgba(255,255,255,.9)"; g.beginPath(); g.arc(it.x, y, 20 + Math.sin(t * 5) * 1.5, 0, 7); g.fill(); g.strokeStyle = W.c1; g.lineWidth = 3; g.stroke(); emoji(g, F.seeds[it.j!].emoji, it.x, y + 1, 21); g.fillStyle = "#334155"; g.font = "bold 11px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("SEED", it.x, y + 30); }
  }
  for (const f of R.L.foes) if (!f.dead) { const y = foeY(f, t); g.fillStyle = "rgba(0,0,0,.2)"; g.beginPath(); g.ellipse(f.x, f.fly ? f.y + 40 : f.y + 1, 15, 4, 0, 0, 7); g.fill(); g.save(); g.translate(f.x, y); g.scale(f.dir > 0 ? -1 : 1, 1); emoji(g, F.foe, 0, 0, 38); g.restore(); }
  for (const d of dust) { g.fillStyle = `rgba(255,255,255,${Math.max(0, d.l)})`; g.beginPath(); g.arc(d.x, d.y, 3 + d.l * 4, 0, 7); g.fill(); }
  // ---- the pet: hop-walk bounce, lean, stretch, squash, shadow. Emoji go through emoji() so nothing can fade it.
  if (!(R.inv > 0 && Math.floor(R.time * 14) % 2 === 0)) {
    const speed = Math.abs(R.vx) / 270, walk = Math.sin(R.t * 16), cx = R.x + R.w / 2, base = R.y + R.h;
    const bob = R.on ? -Math.abs(walk) * 6 * speed : 0, tilt = (R.on ? walk * 0.16 * speed : Math.max(-0.35, Math.min(0.35, R.vy / 1400))) * R.dir;
    let sx = 1, sy = 1; if (!R.on) { sy = 1 + Math.min(0.28, Math.abs(R.vy) / 2400); sx = 1 / sy; } if (R.squash > 0) { sy = 1 - 0.28 * R.squash; sx = 1 + 0.28 * R.squash; } if (R.on && speed < 0.05) sy += Math.sin(R.time * 3) * 0.03;
    g.fillStyle = "rgba(0,0,0,.25)"; g.beginPath(); g.ellipse(cx, base + 2, 17 * (R.on ? 1 : 0.7), 5, 0, 0, 7); g.fill();
    g.save(); g.translate(cx, base + bob); g.scale(R.dir * sx, sy); g.rotate(tilt); emoji(g, pet, 0, -22, 50); g.restore();
  }
  g.restore();
  g.fillStyle = "rgba(15,23,42,.45)"; g.beginPath(); g.roundRect(8, 8, 62 + R.max * 30, 76, 14); g.fill();
  g.textAlign = "left"; for (let i = 0; i < R.max; i++) emoji(g, i < R.hp ? "❤️" : "🖤", 28 + i * 30, 28, 24);
  g.font = "bold 20px sans-serif"; g.fillStyle = "#fff"; g.textBaseline = "middle"; g.textAlign = "left";
  [["🪙", R.coins], ["🌱", R.seeds.reduce((a, b) => a + b)], [F.seeds[0].emoji, R.crops.reduce((a, b) => a + b)]].forEach(([em, n], i) => { emoji(g, em as string, 30 + i * 70, 62, 20); g.fillStyle = "#fff"; g.fillText(String(n), 46 + i * 70, 63); });
  g.fillStyle = "rgba(15,23,42,.45)"; g.beginPath(); g.roundRect(VW - 234, 12, 222, 24, 12); g.fill(); g.fillStyle = "#fde047"; g.beginPath(); g.roundRect(VW - 228, 18, 210 * Math.min(1, R.x / R.L.goal.x), 12, 6); g.fill(); emoji(g, "🏁", VW - 24, 24, 18);
  void mix; void drawCloud;
}
