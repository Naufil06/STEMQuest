import { makeLevel, VH, type Level } from "./levels";

// Pure game physics (no drawing) so it can be tested and reused. The pet is the player.
export interface Keys { l: boolean; r: boolean; j: boolean; jp: boolean }
export interface Run {
  L: Level; x: number; y: number; w: number; h: number; vx: number; vy: number; on: boolean; dir: number; coyote: number; buf: number; inv: number; squash: number; t: number; time: number;
  hp: number; max: number; check: { x: number; y: number }; coins: number; crops: number[]; seeds: number[]; status: "play" | "won" | "lost"; ev: string[];
}
export interface Loot { coins: number; crops: number[]; seeds: number[] }
const G = 2200, JV = 800, MAXV = 270;
const hit = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export function newRun(world: number, hearts: number): Run {
  const L = makeLevel(world), h = 38;
  return { L, x: L.start.x, y: L.start.y - h, w: 34, h, vx: 0, vy: 0, on: true, dir: 1, coyote: 0, buf: 0, inv: 0, squash: 0, t: 0, time: 0, hp: hearts, max: hearts, check: { ...L.start }, coins: 0, crops: [0, 0, 0], seeds: [0, 0, 0], status: "play", ev: [] };
}
function hurt(R: Run, pit: boolean) {
  if (R.inv > 0 && !pit) return;
  R.hp--; R.ev.push("hurt"); R.inv = 1.6;
  if (R.hp <= 0) { R.status = "lost"; return; }
  if (pit) { R.x = R.check.x; R.y = R.check.y - R.h - 2; R.vx = R.vy = 0; } else { R.vy = -420; R.vx = -R.dir * 220; }
}
export const foeY = (f: Foe2, time: number) => (f.fly ? f.y + Math.sin(time * 2 + f.ph) * 34 : f.y - 18);
type Foe2 = Level["foes"][number];

export function step(R: Run, k: Keys, dt: number) {
  if (R.status !== "play") return;
  R.time += dt; R.ev.length = 0;
  const d = (k.r ? 1 : 0) - (k.l ? 1 : 0);
  if (d) { R.vx += d * 2600 * dt; R.dir = d; } else R.vx -= Math.sign(R.vx) * Math.min(Math.abs(R.vx), 3000 * dt);
  R.vx = Math.max(-MAXV, Math.min(MAXV, R.vx));
  R.vy = Math.min(1100, R.vy + G * dt);
  R.coyote = R.on ? 0.12 : R.coyote - dt;                 // forgiving jumps: a little grace after leaving a ledge...
  R.buf = k.jp ? 0.12 : R.buf - dt; k.jp = false;         // ...and when pressing jump slightly early
  if (R.buf > 0 && R.coyote > 0) { R.vy = -JV; R.on = false; R.coyote = 0; R.buf = 0; R.ev.push("jump"); }
  if (!k.j && R.vy < -300) R.vy = -300;                   // hold jump = higher jump
  if (R.inv > 0) R.inv -= dt;
  if (R.squash > 0) R.squash = Math.max(0, R.squash - dt * 5);
  if (R.on) R.t += dt * (Math.abs(R.vx) / MAXV);
  const wasOn = R.on, prevY = R.y;
  R.x += R.vx * dt; if (R.x < 0) { R.x = 0; R.vx = 0; }
  for (const p of R.L.plats) if (!p.one && hit(R, p) && R.y + R.h > p.y + 6 && R.y < p.y + p.h - 4) { R.x = R.vx > 0 ? p.x - R.w : p.x + p.w; R.vx = 0; }
  R.y += R.vy * dt; R.on = false;
  for (const p of R.L.plats) if (hit(R, p)) {
    if (R.vy >= 0 && prevY + R.h <= p.y + 8) { R.y = p.y - R.h; R.vy = 0; R.on = true; }
    else if (!p.one && R.vy < 0 && prevY >= p.y + p.h - 8) { R.y = p.y + p.h; R.vy = 0; }
  }
  if (!wasOn && R.on) { R.squash = 1; R.ev.push("land"); }
  if (R.y > VH + 120) { hurt(R, true); return; }
  const cx = R.x + R.w / 2, cy = R.y + R.h / 2;
  for (const it of R.L.items) if (!it.got && Math.abs(it.x - cx) < 30 && Math.abs(it.y - cy) < 34) { it.got = true; if (it.t === "heart") R.hp = Math.min(R.max, R.hp + 1); else if (it.t === "coin") R.coins++; else if (it.t === "crop") R.crops[it.j!]++; else R.seeds[it.j!]++; R.ev.push(it.t); }
  for (const f of R.L.foes) {
    if (f.dead) continue;
    f.x += f.dir * (f.fly ? 70 : 55) * dt; if (f.x > f.x1) f.dir = -1; else if (f.x < f.x0) f.dir = 1;
    const fy = foeY(f, R.time), box = { x: f.x - 17, y: fy - 17, w: 34, h: 34 };
    if (hit({ x: R.x + 4, y: R.y + 4, w: R.w - 8, h: R.h - 6 }, box)) {
      if (R.vy > 60 && R.y + R.h - box.y < 28) { f.dead = true; R.vy = -520; R.ev.push("stomp"); R.coins += 2; } else hurt(R, false);
    }
  }
  for (const s of R.L.spikes) if (hit({ x: R.x + 6, y: R.y + 8, w: R.w - 12, h: R.h - 8 }, s)) hurt(R, false);
  for (const c of R.L.checks) if (R.x > c.x && c.x > R.check.x) { R.check = { ...c }; R.ev.push("check"); }
  if (R.x > R.L.goal.x) R.status = "won";
}
