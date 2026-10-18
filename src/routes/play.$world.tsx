import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useGame } from "@/lib/game";
import { seo } from "@/lib/seo";
import { WORLDS, worldOpen, clearedOf, getItem, travel } from "@/lib/rewards";
import { farmOf, completeLevel } from "@/lib/farm";
import type { Keys, Loot } from "@/lib/platformer";
import { Platformer } from "@/components/Platformer";
import { Card, GameButton } from "@/components/ui-game";

export const Route = createFileRoute("/play/$world")({
  beforeLoad: ({ params }) => { const i = Number(params.world); if (!Number.isInteger(i) || i < 0 || i >= WORLDS.length) throw notFound(); },
  head: () => seo("Challenge", "Run, jump and collect seeds to unlock the next world."),
  component: Play,
});

function Play() {
  const w = Number(Route.useParams().world), s = useGame(), nav = useNavigate();
  const W = WORLDS[w], F = farmOf(w);
  const keys = useRef<Keys>({ l: false, r: false, j: false, jp: false });
  const [phase, setPhase] = useState<"intro" | "play" | "won" | "lost">("intro");
  const [run, setRun] = useState(0), [relaxed, setRelaxed] = useState(false), [loot, setLoot] = useState<Loot | null>(null);
  const first = useRef(false);
  if (!worldOpen(w, s.xp)) return <Card className="mx-auto max-w-xl text-center"><p className="text-5xl">🔒</p><p className="mt-2 text-lg font-semibold">Reach Level {W.level} and {W.xp} XP to unlock this challenge.</p><Link to="/world-map" className="mt-3 inline-block font-semibold text-primary underline">Back to the map</Link></Card>;
  const pet = getItem(s.equipped.pet)?.emoji ?? "🐶";
  const start = () => { first.current = !clearedOf(s).includes(w); setRun((r) => r + 1); setPhase("play"); };
  const end = (won: boolean, l: Loot) => { if (won) { completeLevel(w, l); setLoot(l); setPhase("won"); } else setPhase("lost"); };
  const hold = (k: "l" | "r" | "j") => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); if (k === "j") keys.current.jp = true; keys.current[k] = true; },
    onPointerUp: () => { keys.current[k] = false; }, onPointerLeave: () => { keys.current[k] = false; }, onPointerCancel: () => { keys.current[k] = false; },
  });
  const btn = "select-none rounded-2xl bg-primary px-8 py-4 font-display text-3xl font-bold text-primary-foreground shadow-pop active:translate-y-1";
  const overlay = "absolute inset-0 grid place-items-center rounded-2xl bg-black/65 p-4";
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link to="/world-map" className="font-semibold text-muted-foreground hover:text-foreground">← World map</Link>
        <h1 className="text-2xl font-bold">{W.emoji} {W.name} challenge</h1>
      </div>
      <div className="relative">
        {phase !== "intro" && <Platformer key={run} world={w} pet={pet} hearts={relaxed ? 8 : 5} keys={keys} onEnd={end} />}
        {phase === "intro" && (
          <div className="rounded-2xl p-8 text-center text-white" style={{ background: `linear-gradient(135deg,${W.c1},${W.c2})` }}>
            <div className="text-7xl">{pet}</div>
            <h2 className="mt-2 text-3xl font-bold">{first.current || !clearedOf(s).includes(w) ? `Reach the flag to enter ${W.name}!` : `${W.name}: collect more seeds!`}</h2>
            <p className="mt-3 text-lg">⬅️ ➡️ or A / D to run · Space, ⬆️ or W to jump (hold for a higher jump)<br />Stomp enemies from above, avoid spikes and pits, grab ❤️ to heal, and collect 🪙 coins, crops and <b>seeds</b> for your {F.farmName}.</p>
            {!getItem(s.equipped.pet) && <p className="mt-2 text-sm opacity-90">Tip: equip a pet in Rewards to play as it!</p>}
            <label className="mt-4 flex items-center justify-center gap-2 font-semibold"><input type="checkbox" className="h-5 w-5" checked={relaxed} onChange={(e) => setRelaxed(e.target.checked)} />Relaxed mode (8 hearts)</label>
            <GameButton autoFocus variant="accent" onClick={start} className="mt-5 px-10 py-4 text-xl">Start 🚀</GameButton>
          </div>
        )}
        {phase === "won" && loot && (
          <div className={overlay}><div className="game-card animate-pop max-w-md p-8 text-center">
            <div className="text-6xl">🎉</div><h2 className="text-3xl font-bold">Level complete!</h2>
            {first.current && <p className="mt-1 text-xl font-semibold">{W.emoji} {W.name} unlocked!</p>}
            <p className="mt-3 text-lg">🪙 {loot.coins * 2 + 20 * (w + 1)} coins · 🌱 {loot.seeds.reduce((a, b) => a + b)} seeds · {F.seeds[0].emoji} {loot.crops.reduce((a, b) => a + b)} crops</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <GameButton onClick={() => { travel(w); nav({ to: "/farm" }); }}>🌾 Travel &amp; visit farm</GameButton>
              <GameButton variant="success" onClick={() => { travel(w); nav({ to: "/world-map" }); }}>🗺️ Travel to {W.name}</GameButton>
              <button onClick={start} className="rounded-xl bg-secondary px-5 py-3 font-semibold">Play again</button>
            </div></div></div>
        )}
        {phase === "lost" && (
          <div className={overlay}><div className="game-card animate-pop max-w-sm p-8 text-center">
            <div className="text-6xl">💫</div><h2 className="text-3xl font-bold">Oh no!</h2><p className="mt-1 text-muted-foreground">You ran out of hearts. Everyone needs a few tries!</p>
            <div className="mt-5 flex justify-center gap-2"><GameButton autoFocus onClick={start}>Try again</GameButton><Link to="/world-map" className="rounded-xl bg-secondary px-5 py-3 font-semibold">Map</Link></div></div></div>
        )}
      </div>
      {phase === "play" && (
        <div className="flex items-center justify-between gap-3 md:hidden" aria-label="Touch controls">
          <div className="flex gap-3"><button className={btn} {...hold("l")}>◀</button><button className={btn} {...hold("r")}>▶</button></div>
          <button className={btn + " px-10"} {...hold("j")}>⤒</button>
        </div>
      )}
    </div>
  );
}
