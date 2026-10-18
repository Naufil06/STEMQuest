import { useEffect, useRef } from "react";
import { drawFarm, layout, pickTile, type Tile } from "@/lib/farmScene";

/** The animated isometric farm/city. Hover shows a ghost of what you're about to place; click acts on the tile. */
export function FarmCanvas({ w, city, tiles, ghost, onTile }: { w: number; city: boolean; tiles: Record<string, Tile>; ghost: string | null; onTile: (key: string) => void }) {
  const cols = city ? 8 : 6, rows = cols, L = layout(cols, rows);
  const cv = useRef<HTMLCanvasElement>(null), S = useRef({ w, city, tiles, ghost, hover: null as string | null });
  S.current.w = w; S.current.city = city; S.current.tiles = tiles; S.current.ghost = ghost;
  useEffect(() => {
    const c = cv.current!, dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = L.W * dpr; c.height = L.H * dpr;
    const g = c.getContext("2d")!, t0 = performance.now(); let raf = 0;
    const frame = () => {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFarm(g, { w: S.current.w, city: S.current.city, cols, rows, tiles: S.current.tiles, now: Date.now(), t: (performance.now() - t0) / 1000, hover: S.current.hover, ghost: S.current.ghost });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [cols, rows, L.W, L.H]);
  const at = (e: React.PointerEvent) => { const r = cv.current!.getBoundingClientRect(); return pickTile(L, cols, rows, S.current.tiles, ((e.clientX - r.left) * L.W) / r.width, ((e.clientY - r.top) * L.H) / r.height); };
  return <canvas ref={cv} style={{ aspectRatio: `${L.W}/${L.H}` }} className="block h-auto w-full cursor-pointer touch-manipulation" aria-label="Your farm"
    onPointerMove={(e) => { S.current.hover = at(e); }} onPointerLeave={() => { S.current.hover = null; }} onPointerDown={(e) => { const k = at(e); S.current.hover = k; if (k) onTile(k); }} />;
}
