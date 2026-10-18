import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useGame, levelInfo } from "@/lib/game";
import { useT } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { WORLDS, travel, worldOpen, unlocked } from "@/lib/rewards";
import type { IslandState } from "@/lib/mapScene";
import { MapCanvas, type Trip } from "@/components/MapCanvas";
import { Bar, Card, GameButton, PageHeader } from "@/components/ui-game";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/world-map")({ head: () => seo("World Map", "Sail from world to world on your mission."), component: WorldMap });

function WorldMap() {
  const s = useGame();
  const { t } = useT();
  const gender = s.equipped.character === "girl" ? "girl" : "boy";
  const N = WORLDS.length, here = Math.min(s.world ?? 0, N - 1);
  const [sel, setSel] = useState(here), [trip, setTrip] = useState<Trip | null>(null);
  const states: IslandState[] = WORLDS.map((_, i) => (unlocked(i, s) ? "open" : worldOpen(i, s.xp) ? "ready" : "locked"));
  const w = WORLDS[sel], st = states[sel], lv = levelInfo(s.xp).level;
  const next = WORLDS[sel + 1]?.xp ?? w.xp + 6000, pct = st === "open" ? Math.min(100, Math.round(((s.xp - w.xp) / (next - w.xp)) * 100)) : 0;
  const sail = () => { if (sel !== here && st === "open") setTrip({ from: here, to: sel, t0: performance.now() / 1000 }); };
  const arrive = (to: number) => { travel(to); setTrip(null); toast.success(`⛵ Welcome to ${WORLDS[to].name}!`); };
  return (
    <>
      <PageHeader icon="🗺️" title={t("worldMap")} subtitle="Tap an island, then sail there! Reach each world's level and beat its platformer challenge to lift the fog. Arriving changes the whole app's look and music." />
      <div className="mx-auto max-w-5xl space-y-4">
        <MapCanvas states={states} sel={sel} here={here} gender={gender} trip={trip} onSelect={setSel} onArrive={arrive} />
        <Card className="overflow-hidden p-0">
          <div className="flex flex-wrap items-center justify-between gap-2 p-5 text-white" style={{ background: `linear-gradient(135deg,${w.c1},${w.c2})` }}>
            <div><p className="text-sm font-semibold opacity-90">Mission {sel + 1} of {N}</p><h2 className="text-2xl font-bold">{st === "open" ? w.emoji : st === "ready" ? "🎮" : "🔒"} {w.name}</h2><p className="mt-1">{w.blurb}</p></div>
          </div>
          <div className="space-y-3 p-5">
            {st === "open" && <><div className="flex justify-between text-sm font-semibold"><span>Mission progress</span><span>{pct}%</span></div><Bar value={pct} /></>}
            {st === "ready" && <p className="font-semibold">🎮 The fog is lifting! Beat the platformer challenge to enter.</p>}
            {st === "locked" && <p className="font-semibold text-muted-foreground">🔒 Hidden in fog. Unlock at Level {w.level} and {w.xp} XP <span className="font-normal">(you have Level {lv}, {s.xp} XP)</span></p>}
            <div className="flex flex-wrap gap-2">
              {st === "ready" && <Link to="/play/$world" params={{ world: String(sel) }} className="rounded-xl bg-accent px-5 py-3 font-display font-semibold text-accent-foreground shadow-pop">🎮 Play the challenge</Link>}
              {st === "open" && <GameButton disabled={sel === here || !!trip} onClick={sail}>{sel === here ? "📍 You are here" : trip ? "⛵ Sailing…" : "⛵ Sail here"}</GameButton>}
              {st === "open" && <Link to="/play/$world" params={{ world: String(sel) }} className="rounded-xl bg-secondary px-5 py-3 font-semibold">🎮 Play again for seeds</Link>}
              {st === "open" && <Link to="/farm" onClick={() => travel(sel)} className="rounded-xl bg-secondary px-5 py-3 font-semibold">🌾 Visit farm</Link>}
            </div>
          </div>
        </Card>
        <div className="flex flex-wrap gap-2" role="list" aria-label="Worlds">
          {WORLDS.map((x, i) => <button key={x.id} role="listitem" onClick={() => !trip && setSel(i)} aria-label={`${x.name}${states[i] === "locked" ? " (locked)" : ""}`} className={cn("rounded-full px-3 py-1.5 text-sm font-semibold", sel === i ? "bg-primary text-primary-foreground" : "bg-secondary")}>{states[i] === "locked" ? "🔒" : x.emoji} {i + 1}</button>)}
        </div>
      </div>
    </>
  );
}
