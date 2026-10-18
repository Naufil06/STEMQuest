import { useEffect, useRef, type MutableRefObject } from "react";
import { VH, VW } from "@/lib/levels";
import { newRun, step, type Keys, type Loot } from "@/lib/platformer";
import { drawLevel, type Dust } from "@/lib/platScene";

interface Props { world: number; pet: string; hearts: number; keys: MutableRefObject<Keys>; onEnd: (won: boolean, loot: Loot) => void }

/** Canvas 2D platformer (physics in lib/platformer.ts, drawing in lib/platScene.ts). The pet is animated procedurally. */
export function Platformer({ world, pet, hearts, keys, onEnd }: Props) {
  const cv = useRef<HTMLCanvasElement>(null);
  const endRef = useRef(onEnd); endRef.current = onEnd;
  useEffect(() => {
    const c = cv.current!, dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = VW * dpr; c.height = VH * dpr;
    const g = c.getContext("2d")!, R = newRun(world, hearts), dust: Dust[] = [];
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
    const frame = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000); last = now;
      step(R, keys.current, dt);
      for (const e of R.ev) if (e === "land" || e === "jump") puff(e === "land" ? 6 : 3);
      if (R.on && Math.abs(R.vx) > 200 && Math.random() < 0.25) puff(1);
      for (const d of dust) { d.x += d.vx * dt; d.y += d.vy * dt; d.l -= dt; }
      while (dust.length && dust[0].l <= 0) dust.shift();
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawLevel(g, R, world, pet, dust);
      if (R.status !== "play") { if (!ended) { ended = true; endRef.current(R.status === "won", { coins: R.coins, crops: R.crops, seeds: R.seeds }); } return; }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); keys.current.l = keys.current.r = keys.current.j = keys.current.jp = false; };
  }, [world, hearts, keys, pet]);
  return <canvas ref={cv} style={{ aspectRatio: `${VW}/${VH}` }} className="block w-full touch-none rounded-2xl border-4 bg-black" aria-label="Platformer game" />;
}
