import { useEffect, useRef, type MutableRefObject } from "react";
import { VH, VW, T } from "@/lib/levels";
import { newRun, step, foeY, type Keys, type Loot } from "@/lib/platformer";
import { WORLDS } from "@/lib/rewards";
import { farmOf } from "@/lib/farm";

interface Props { world: number; pet: string; hearts: number; keys: MutableRefObject<Keys>; onEnd: (won: boolean, loot: Loot) => void }
type Dust = { x: number; y: number; vx: number; vy: number; l: number };

/** Canvas 2D platformer. The pet emoji is animated procedurally: hop-walk bounce, lean, stretch in the air, squash on landing, dust. */
export function Platformer({ world, pet, hearts, keys, onEnd }: Props) {
  const cv = useRef<HTMLCanvasElement>(null);
  const endRef = useRef(onEnd); endRef.current = onEnd;
  useEffect(() => {
    const c = cv.current!, g = c.getContext("2d")!;
    const R = newRun(world, hearts), W = WORLDS[world], F = farmOf(world), dust: Dust[] = [];
    let raf = 0, last = performance.now(), ended = false;
    const key = (e: KeyboardEvent, v: boolean) => {
      const k = keys.current, code = e.code;
      if (code === "ArrowLeft" || code === "KeyA") k.l = v;
      else if (code === "ArrowRight" || code === "KeyD") k.r = v;
      else if (code === "Space" || code === "ArrowUp" || code === "KeyW") { if (v && !k.j) k.jp = true; k.j = v; }
      else return;
      e.preventDefault();
    };
    const kd = (e: KeyboardEvent) => key(e, true), ku = (e: KeyboardEvent) => key(e, false);
    window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
    const puff = (n: number) => { for (let i = 0; i < n; i++) dust.push({ x: R.x + R.w / 2, y: R.y + R.h, vx: (Math.random() - 0.5) * 120, vy: -Math.random() * 60, l: 0.5 }); };

    const drawPet = () => {
      if (R.inv > 0 && Math.floor(R.time * 14) % 2 === 0) return;               // blink when hurt
      const speed = Math.abs(R.vx) / 270, walk = Math.sin(R.t * 16), cx = R.x + R.w / 2, base = R.y + R.h;
      const bob = R.on ? -Math.abs(walk) * 6 * speed : 0, tilt = (R.on ? walk * 0.16 * speed : Math.max(-0.35, Math.min(0.35, R.vy / 1400))) * R.dir;
      let sx = 1, sy = 1;
      if (!R.on) { sy = 1 + Math.min(0.28, Math.abs(R.vy) / 2400); sx = 1 / sy; }   // stretch while jumping/falling
      if (R.squash > 0) { sy = 1 - 0.28 * R.squash; sx = 1 + 0.28 * R.squash; }       // squash on landing
      if (R.on && speed < 0.05) sy += Math.sin(R.time * 3) * 0.03;                    // idle breathing
      g.fillStyle = "rgba(0,0,0,.22)"; g.beginPath(); g.ellipse(cx, base + 2, 17 * (R.on ? 1 : 0.7), 5, 0, 0, 7); g.fill();
      g.save(); g.translate(cx, base + bob); g.scale(R.dir * sx, sy); g.rotate(tilt); g.font = "46px serif"; g.textAlign = "center"; g.textBaseline = "bottom"; g.fillText(pet, 0, 8); g.restore();
    };
    const draw = () => {
      const cam = Math.max(0, Math.min(R.L.width - VW, R.x - VW * 0.4));
      const sg = g.createLinearGradient(0, 0, 0, VH); sg.addColorStop(0, W.c1); sg.addColorStop(1, W.c2); g.fillStyle = sg; g.fillRect(0, 0, VW, VH);
      for (let l = 0; l < 2; l++) {
        g.fillStyle = `rgba(255,255,255,${0.1 + l * 0.08})`; g.beginPath(); g.moveTo(0, VH);
        for (let x = 0; x <= VW; x += 20) g.lineTo(x, VH - 120 - l * 50 + Math.sin((x + cam * (0.2 + l * 0.2)) / (110 - l * 20)) * (30 + l * 10));
        g.lineTo(VW, VH); g.fill();
      }
      g.globalAlpha = 0.22; g.font = "56px serif"; g.textAlign = "left"; g.textBaseline = "alphabetic";
      for (let i = 0; i < 8; i++) g.fillText(W.emoji, ((((i * 260 - cam * 0.5) % 2080) + 2080) % 2080) - 100, 90 + (i % 3) * 60);
      g.globalAlpha = 1;
      g.save(); g.translate(-cam, 0);
      for (const p of R.L.plats) {
        if (p.x + p.w < cam || p.x > cam + VW) continue;
        if (p.one) { g.fillStyle = F.soil; g.beginPath(); g.roundRect(p.x, p.y, p.w, p.h, 7); g.fill(); g.fillStyle = "rgba(255,255,255,.45)"; g.fillRect(p.x + 4, p.y, p.w - 8, 4); }
        else { g.fillStyle = F.soil; g.fillRect(p.x, p.y, p.w, p.h); g.fillStyle = "rgba(255,255,255,.4)"; g.fillRect(p.x, p.y, p.w, 9); g.fillStyle = "rgba(0,0,0,.14)"; for (let x = p.x + 24; x < p.x + p.w; x += 48) g.fillRect(x, p.y + 26, 12, 8); }
      }
      for (const s of R.L.spikes) { g.fillStyle = "#e5e7eb"; g.strokeStyle = "#475569"; g.lineWidth = 2; for (let x = s.x; x < s.x + s.w - 4; x += 14) { g.beginPath(); g.moveTo(x, s.y + s.h); g.lineTo(x + 7, s.y); g.lineTo(x + 14, s.y + s.h); g.closePath(); g.fill(); g.stroke(); } }
      g.textAlign = "center"; g.textBaseline = "middle";
      for (const ch of R.L.checks) { g.globalAlpha = R.check.x >= ch.x ? 1 : 0.45; g.font = "34px serif"; g.fillText("🚩", ch.x, ch.y - 22); } g.globalAlpha = 1;
      g.font = "64px serif"; g.fillText("🏁", R.L.goal.x, R.L.start.y - 36);
      for (const it of R.L.items) {
        if (it.got || it.x < cam - 40 || it.x > cam + VW + 40) continue;
        const b = Math.sin(R.time * 4 + it.x) * 4;
        if (it.t === "coin") { g.fillStyle = "#facc15"; g.strokeStyle = "#a16207"; g.lineWidth = 3; g.beginPath(); g.ellipse(it.x, it.y + b, 11 * Math.abs(Math.cos(R.time * 3 + it.x)) + 3, 12, 0, 0, 7); g.fill(); g.stroke(); }
        else if (it.t === "heart") { g.font = "30px serif"; g.fillText("❤️", it.x, it.y + b); }
        else if (it.t === "crop") { g.font = "34px serif"; g.fillText(F.seeds[it.j!].emoji, it.x, it.y + b); }
        else { g.fillStyle = "rgba(255,255,255,.85)"; g.beginPath(); g.arc(it.x, it.y + b, 19, 0, 7); g.fill(); g.strokeStyle = W.c1; g.lineWidth = 3; g.stroke(); g.font = "20px serif"; g.fillText(F.seeds[it.j!].emoji, it.x, it.y + b + 1); g.font = "11px sans-serif"; g.fillStyle = "#334155"; g.fillText("seed", it.x, it.y + b + 26); }
      }
      g.font = "36px serif";
      for (const f of R.L.foes) if (!f.dead) { g.save(); g.translate(f.x, foeY(f, R.time)); g.scale(f.dir > 0 ? -1 : 1, 1); g.fillText(F.foe, 0, 0); g.restore(); }
      for (const d of dust) { g.fillStyle = `rgba(255,255,255,${d.l})`; g.beginPath(); g.arc(d.x, d.y, 3 + d.l * 4, 0, 7); g.fill(); }
      drawPet();
      g.restore();
      g.textAlign = "left"; g.textBaseline = "top"; g.font = "28px serif"; g.fillStyle = "#fff";
      for (let i = 0; i < R.max; i++) g.fillText(i < R.hp ? "❤️" : "🖤", 14 + i * 34, 12);
      g.font = "bold 22px sans-serif"; g.shadowColor = "rgba(0,0,0,.5)"; g.shadowBlur = 4;
      g.fillText(`🪙 ${R.coins}   🌱 ${R.seeds.reduce((a, b) => a + b)}   ${F.seeds[0].emoji} ${R.crops.reduce((a, b) => a + b)}`, 14, 52); g.shadowBlur = 0;
      g.fillStyle = "rgba(0,0,0,.3)"; g.fillRect(VW - 214, 16, 200, 12); g.fillStyle = "#fde047"; g.fillRect(VW - 214, 16, 200 * Math.min(1, R.x / R.L.goal.x), 12);
    };
    const frame = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000); last = now;
      step(R, keys.current, dt);
      for (const e of R.ev) if (e === "land" || e === "jump") puff(e === "land" ? 6 : 3);
      if (R.on && Math.abs(R.vx) > 200 && Math.random() < 0.25) puff(1);
      for (const d of dust) { d.x += d.vx * dt; d.y += d.vy * dt; d.l -= dt; }
      while (dust.length && dust[0].l <= 0) dust.shift();
      draw();
      if (R.status !== "play") { if (!ended) { ended = true; endRef.current(R.status === "won", { coins: R.coins, crops: R.crops, seeds: R.seeds }); } return; }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); keys.current.l = keys.current.r = keys.current.j = keys.current.jp = false; };
  }, [world, hearts, keys]);
  return <canvas ref={cv} width={VW} height={VH} className="block w-full touch-none rounded-2xl border-4 bg-black" aria-label="Platformer game" data-t={T} />;
}
