import { useGame } from "@/lib/game";
import { getItem } from "@/lib/rewards";
import { cn } from "@/lib/utils";

export const OUTFITS = ["school", "labcoat", "engineer", "inventor", "hero", "astronaut"];
// Head anchor points in the 400x965 character canvas (hat position, eye positions).
const HEAD: Record<string, { cx: number; y: number; s: number; a: [number, number]; b: [number, number] }> = {
  boy: { cx: 204, y: 28, s: 1.05, a: [173, 152], b: [247, 152] },
  girl: { cx: 200, y: 58, s: 1.15, a: [158, 178], b: [236, 177] },
};

export function Hat({ k }: { k: string }) {
  if (k === "cap") return <g><path d="M-85 55Q-85-15 0-15Q85-15 85 55Z" fill="#2563eb" /><path d="M-85 52Q10 72 125 54L118 38Q20 46-85 40Z" fill="#1d4ed8" /></g>;
  if (k === "grad") return <g><path d="M-65 25V62Q0 85 65 62V25Z" fill="#1f2937" /><path d="M-120 10L0-28 120 10 0 48Z" fill="#111827" /><path d="M0 10L95 25V62" stroke="#facc15" strokeWidth="5" fill="none" /></g>;
  if (k === "tophat") return <g><ellipse cx="0" cy="52" rx="100" ry="16" fill="#111827" /><rect x="-62" y="-70" width="124" height="122" rx="8" fill="#1f2937" /><rect x="-62" y="28" width="124" height="18" fill="#dc2626" /></g>;
  return <path d="M-80 58L-92-12-42 22 0-28 42 22 92-12 80 58Z" fill="#facc15" stroke="#ca8a04" strokeWidth="5" />;
}
export function Glasses({ k, a, b }: { k: string; a: [number, number]; b: [number, number] }) {
  const dark = k === "shades", gog = k === "goggles";
  return (
    <g stroke={dark ? "#111" : gog ? "#0d9488" : "#374151"} strokeWidth={gog ? 9 : 6} fill={dark ? "#111" : gog ? "#99f6e4" : "none"} fillOpacity={gog ? 0.5 : 0.92}>
      <circle cx={a[0]} cy={a[1]} r={27} /><circle cx={b[0]} cy={b[1]} r={27} />
      <path d={`M${a[0] + 27} ${a[1]}L${b[0] - 27} ${b[1]}`} fill="none" />
    </g>
  );
}

/** Photo-style hero. The costume swaps the whole PNG (same face/hair/hands, new clothes); hats/glasses/backpack are SVG layers. */
export function Avatar({ className }: { className?: string }) {
  const { equipped: e } = useGame();
  const g = e.character === "girl" ? "girl" : "boy";
  const o = OUTFITS.includes(e.costume) ? e.costume : "school";
  const h = HEAD[g];
  const pet = getItem(e.pet);
  return (
    <div className={cn("relative aspect-[400/965] w-36 select-none", className)} aria-hidden>
      <svg viewBox="0 0 400 965" className="absolute inset-0 h-full w-full">
        {e.backpack && <rect x="288" y="330" width="82" height="210" rx="30" fill={e.backpack === "chute" ? "#a855f7" : "#f97316"} />}
      </svg>
      <img src={`/characters/${g}-${o}.png`} alt="" className="absolute inset-0 h-full w-full" draggable={false} />
      <svg viewBox="0 0 400 965" className="absolute inset-0 h-full w-full">
        {e.glasses && <Glasses k={e.glasses} a={h.a} b={h.b} />}
        {e.hat && <g transform={`translate(${h.cx} ${h.y}) scale(${h.s})`}><Hat k={e.hat} /></g>}
      </svg>
      {pet && <span className="absolute -bottom-1 -start-8 text-5xl">{pet.emoji}</span>}
    </div>
  );
}
