import { useEffect, useRef } from "react";
import { drawMap, hitIsland, tripPoint, MW, MH, type IslandState } from "@/lib/mapScene";

export interface Trip { from: number; to: number; t0: number }
/** Animated world map. While a trip is running the hero's boat sails along the route, island by island. */
export function MapCanvas({ states, sel, here, gender, trip, onSelect, onArrive }: { states: IslandState[]; sel: number; here: number; gender: string; trip: Trip | null; onSelect: (i: number) => void; onArrive: (to: number) => void }) {
  const cv = useRef<HTMLCanvasElement>(null), img = useRef<HTMLImageElement | null>(null), trail = useRef<number[][]>([]), arrived = useRef(false);
  const P = useRef({ states, sel, here, trip, onArrive });
  P.current = { states, sel, here, trip, onArrive };
  useEffect(() => { const i = new Image(); i.src = `/characters/${gender}-school.png`; img.current = i; }, [gender]);
  useEffect(() => { arrived.current = false; trail.current = []; }, [trip]);
  useEffect(() => {
    const c = cv.current!, dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = MW * dpr; c.height = MH * dpr;
    const g = c.getContext("2d")!; let raf = 0;
    const frame = () => {
      const t = performance.now() / 1000, p = P.current; let tr: { from: number; to: number; p: number } | null = null;
      if (p.trip) {
        const dur = Math.min(6, Math.abs(p.trip.to - p.trip.from) * 1.1 + 0.8), prog = (t - p.trip.t0) / dur;
        tr = { from: p.trip.from, to: p.trip.to, p: Math.min(1, prog) };
        const pt = tripPoint(tr.from, tr.to, tr.p); trail.current.push([pt[0], pt[1]]); if (trail.current.length > 16) trail.current.shift();
        if (prog >= 1 && !arrived.current) { arrived.current = true; p.onArrive(p.trip.to); }
      } else trail.current = [];
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawMap(g, { t, states: p.states, sel: p.sel, here: p.here, hero: img.current, trip: tr, trail: trail.current });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);
  const at = (e: React.PointerEvent) => { const r = cv.current!.getBoundingClientRect(); return hitIsland(((e.clientX - r.left) * MW) / r.width, ((e.clientY - r.top) * MH) / r.height); };
  return <canvas ref={cv} style={{ aspectRatio: `${MW}/${MH}` }} className="block h-auto w-full cursor-pointer rounded-3xl border-4 shadow-game" aria-label="World map"
    onPointerMove={(e) => { cv.current!.style.cursor = at(e) >= 0 ? "pointer" : "default"; }} onPointerDown={(e) => { const i = at(e); if (i >= 0 && !P.current.trip) onSelect(i); }} />;
}
