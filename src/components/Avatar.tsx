import { useGame } from "@/lib/game";
import { getItem, ITEMS } from "@/lib/rewards";
import { cn } from "@/lib/utils";

export const OUTFITS = ITEMS.filter((i) => i.slot === "costume").map((i) => i.id);
// Head anchor points in the 400x965 character canvas (hat position, eye positions).
const HEAD: Record<string, { cx: number; y: number; s: number; a: [number, number]; b: [number, number] }> = {
  boy: { cx: 204, y: 28, s: 1.05, a: [173, 152], b: [247, 152] },
  girl: { cx: 200, y: 58, s: 1.15, a: [158, 178], b: [236, 177] },
};

export function Hat({ k }: { k: string }) {
  if (k === "cap") return <g><path d="M-85 55Q-85-15 0-15Q85-15 85 55Z" fill="#2563eb" /><path d="M-85 52Q10 72 125 54L118 38Q20 46-85 40Z" fill="#1d4ed8" /></g>;
  if (k === "hardhat") return <g><path d="M-80 55Q-80-20 0-20Q80-20 80 55Z" fill="#facc15" /><rect x="-14" y="-20" width="28" height="34" fill="#fde047" /><rect x="-96" y="48" width="192" height="14" rx="7" fill="#eab308" /></g>;
  if (k === "grad") return <g><path d="M-65 25V62Q0 85 65 62V25Z" fill="#1f2937" /><path d="M-120 10L0-28 120 10 0 48Z" fill="#111827" /><path d="M0 10L95 25V62" stroke="#facc15" strokeWidth="5" fill="none" /></g>;
  if (k === "tophat") return <g><ellipse cx="0" cy="52" rx="100" ry="16" fill="#111827" /><rect x="-62" y="-70" width="124" height="122" rx="8" fill="#1f2937" /><rect x="-62" y="28" width="124" height="18" fill="#dc2626" /></g>;
  if (k === "wizard") return <g><ellipse cx="0" cy="52" rx="108" ry="14" fill="#6d28d9" /><path d="M-64 52L-8-92 14-84 64 52Z" fill="#7c3aed" /><circle cx="-14" cy="8" r="8" fill="#facc15" /><circle cx="18" cy="-30" r="6" fill="#facc15" /></g>;
  return <path d="M-80 58L-92-12-42 22 0-28 42 22 92-12 80 58Z" fill="#facc15" stroke="#ca8a04" strokeWidth="5" />;
}

const star = (x: number, y: number, R: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, k = i % 2 ? r : R; return `${(x + k * Math.cos(a)).toFixed(1)},${(y + k * Math.sin(a)).toFixed(1)}`; }).join(" ");

export function Glasses({ k, a, b }: { k: string; a: [number, number]; b: [number, number] }) {
  if (k === "visor") return <g><rect x={a[0] - 38} y={a[1] - 24} width={b[0] - a[0] + 76} height="50" rx="22" fill="#22d3ee" fillOpacity=".6" stroke="#0891b2" strokeWidth="6" /><path d={`M${a[0] - 20} ${a[1] - 10}L${a[0] + 8} ${a[1] - 12}`} stroke="#fff" strokeWidth="5" opacity=".6" strokeLinecap="round" /></g>;
  const frame = k === "goggles" ? "#0d9488" : k === "aviator" ? "#d4a017" : k === "specs" ? "#374151" : "#111";
  const lens = ([x, y]: [number, number], i: number) => {
    const glare = <path d={`M${x - 22} ${y - 9}L${x - 8} ${y - 12}`} stroke="#fff" strokeWidth="4" opacity=".55" strokeLinecap="round" />;
    if (k === "shades") return <g key={i}><path d={`M${x - 36} ${y - 18}Q${x} ${y - 27} ${x + 36} ${y - 18}L${x + 30} ${y + 17}Q${x} ${y + 30} ${x - 30} ${y + 17}Z`} fill="url(#lens)" stroke="#020617" strokeWidth="6" strokeLinejoin="round" />{glare}</g>;
    if (k === "aviator") return <g key={i}><path d={`M${x - 35} ${y - 17}Q${x} ${y - 28} ${x + 35} ${y - 17}Q${x + 38} ${y + 22} ${x} ${y + 32}Q${x - 38} ${y + 22} ${x - 35} ${y - 17}Z`} fill="url(#lensAv)" stroke="#d4a017" strokeWidth="4" strokeLinejoin="round" />{glare}</g>;
    if (k === "round") return <g key={i}><circle cx={x} cy={y} r={30} fill="url(#lens)" stroke="#111" strokeWidth="6" />{glare}</g>;
    if (k === "heart") return <path key={i} d={`M${x} ${y + 26}C${x - 46} ${y - 4} ${x - 24} ${y - 32} ${x} ${y - 10}C${x + 24} ${y - 32} ${x + 46} ${y - 4} ${x} ${y + 26}Z`} fill="#ec4899" fillOpacity=".85" stroke="#be185d" strokeWidth="5" strokeLinejoin="round" />;
    if (k === "star") return <polygon key={i} points={star(x, y, 36, 16)} fill="#facc15" fillOpacity=".85" stroke="#ca8a04" strokeWidth="5" strokeLinejoin="round" />;
    if (k === "goggles") return <circle key={i} cx={x} cy={y} r={28} fill="#99f6e4" fillOpacity=".5" stroke="#0d9488" strokeWidth="9" />;
    return <circle key={i} cx={x} cy={y} r={27} fill="none" stroke="#374151" strokeWidth="6" />;
  };
  return (
    <g>
      <defs>
        <linearGradient id="lens" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4b5563" /><stop offset="1" stopColor="#020617" /></linearGradient>
        <linearGradient id="lensAv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#92400e" /><stop offset="1" stopColor="#1c1917" /></linearGradient>
      </defs>
      <path d={`M${a[0] + 27} ${a[1] - 4}Q${(a[0] + b[0]) / 2} ${a[1] - 14} ${b[0] - 27} ${b[1] - 4}`} stroke={frame} strokeWidth="5" fill="none" />
      {k !== "goggles" && <path d={`M${a[0] - 32} ${a[1] - 8}L${a[0] - 56} ${a[1] - 2}M${b[0] + 32} ${b[1] - 8}L${b[0] + 56} ${b[1] - 2}`} stroke={frame} strokeWidth="5" strokeLinecap="round" />}
      {[a, b].map(lens)}
    </g>
  );
}

/** Photo-style hero. The costume swaps the whole PNG (same face/hair/hands, new clothes); hats/glasses are SVG layers. */
export function Avatar({ className }: { className?: string }) {
  const { equipped: e } = useGame();
  const g = e.character === "girl" ? "girl" : "boy";
  const o = OUTFITS.includes(e.costume) ? e.costume : "school";
  const h = HEAD[g];
  const pet = getItem(e.pet);
  return (
    <div className={cn("relative aspect-[400/965] w-36 select-none", className)} aria-hidden>
      <img src={`/characters/${g}-${o}.png`} alt="" className="absolute inset-0 h-full w-full" draggable={false} />
      <svg viewBox="0 0 400 965" className="absolute inset-0 h-full w-full">
        {e.glasses && <Glasses k={e.glasses} a={h.a} b={h.b} />}
        {e.hat && <g transform={`translate(${h.cx} ${h.y}) scale(${h.s})`}><Hat k={e.hat} /></g>}
      </svg>
      {pet && <span className="absolute -bottom-1 -start-8 text-5xl">{pet.emoji}</span>}
    </div>
  );
}
