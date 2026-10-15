import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useGame, levelInfo } from "@/lib/game";
import { useT } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { WORLDS, travel, worldOpen } from "@/lib/rewards";
import { Bar, Card, GameButton, PageHeader } from "@/components/ui-game";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/world-map")({ head: () => seo("World Map", "Travel from world to world on your mission."), component: WorldMap });

// Journey runs bottom (start) to top (final mission). [x%, y%]
const POS = [[18, 93], [72, 83], [26, 71], [74, 59], [26, 47], [72, 36], [28, 25], [70, 14], [42, 4]];
const seg = (i: number) => { const [x1, y1] = POS[i - 1], [x2, y2] = POS[i], my = (y1 + y2) / 2; return `M${x1} ${y1}C${x1} ${my} ${x2} ${my} ${x2} ${y2}`; };

function WorldMap() {
  const s = useGame();
  const { t } = useT();
  const gender = s.equipped.character === "girl" ? "girl" : "boy";
  const here = Math.min(s.world ?? 0, WORLDS.length - 1);
  const [sel, setSel] = useState(here);
  const w = WORLDS[sel], open = worldOpen(sel, s.xp), lv = levelInfo(s.xp).level;
  const next = WORLDS[sel + 1]?.xp ?? w.xp + 6000;
  const pct = open ? Math.min(100, Math.round(((s.xp - w.xp) / (next - w.xp)) * 100)) : 0;
  return (
    <>
      <PageHeader icon="🗺️" title={t("worldMap")} subtitle="Gain XP and levels to unlock the next stop on your mission. Travel to a world to change the whole app's look and music!" />
      <Card className="mx-auto max-w-xl overflow-hidden p-0">
        <div className="p-5 text-white" style={{ background: `linear-gradient(135deg,${w.c1},${w.c2})` }}>
          <p className="text-sm font-semibold opacity-90">Mission {sel + 1} of {WORLDS.length}</p>
          <h2 className="text-2xl font-bold">{open ? w.emoji : "🔒"} {w.name}</h2>
          <p className="mt-1">{w.blurb}</p>
        </div>
        <div className="space-y-3 p-5">
          {open ? <><div className="flex justify-between text-sm font-semibold"><span>Mission progress</span><span>{pct}%</span></div><Bar value={pct} /></>
            : <p className="font-semibold text-muted-foreground">🔒 Unlock at Level {w.level} and {w.xp} XP <span className="font-normal">(you have Level {lv}, {s.xp} XP)</span></p>}
          <GameButton disabled={!open || sel === here} onClick={() => travel(sel)}>{sel === here ? "📍 You are here" : "🚀 Travel here"}</GameButton>
        </div>
      </Card>
      <div className="game-card relative mx-auto mt-6 h-[54rem] max-w-xl overflow-hidden" style={{ background: "linear-gradient(0deg,color-mix(in oklab,var(--primary) 18%,var(--card)),var(--card))" }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          {WORLDS.slice(1).map((x, k) => <path key={x.id} d={seg(k + 1)} fill="none" stroke={worldOpen(k + 1, s.xp) ? x.c1 : "#94a3b8"} strokeWidth="9" strokeDasharray="14 12" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity=".8" />)}
        </svg>
        <span className="absolute bottom-1 start-3 rounded-full bg-card px-3 py-1 text-xs font-bold shadow">🚩 START</span>
        <span className="absolute end-3 top-1 rounded-full bg-card px-3 py-1 text-xs font-bold shadow">🏁 FINAL MISSION</span>
        {WORLDS.map((x, i) => {
          const o = worldOpen(i, s.xp);
          return (
            <button key={x.id} onClick={() => setSel(i)} aria-label={`${x.name}${o ? "" : " (locked)"}`} style={{ left: `${POS[i][0]}%`, top: `${POS[i][1]}%`, background: o ? `linear-gradient(135deg,${x.c1},${x.c2})` : undefined }}
              className={cn("absolute grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-white text-3xl shadow-lg transition-transform hover:scale-110", !o && "bg-slate-400 grayscale", sel === i && "ring-4 ring-accent")}>
              {o ? x.emoji : "🔒"}
              <span className="absolute top-full mt-1 whitespace-nowrap rounded-full bg-card px-2 py-0.5 text-xs font-bold text-card-foreground shadow">{i + 1}. {x.name}</span>
            </button>
          );
        })}
        <div style={{ left: `${POS[here][0]}%`, top: `${POS[here][1]}%` }} className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[155%]">
          <img src={`/characters/${gender}-school.png`} alt="You are here" className="animate-float h-14 w-14 rounded-full border-4 border-white bg-card object-cover object-top shadow-lg" />
        </div>
      </div>
    </>
  );
}
