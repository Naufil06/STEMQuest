import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useGame } from "@/lib/game";
import { seo } from "@/lib/seo";
import { WORLDS, unlocked } from "@/lib/rewards";
import { farmOf, itemById, plant, harvest, build, bulldoze, upgradeCity, buySeed, sellCrop, pending, collect } from "@/lib/farm";
import { Bar, Card, GameButton } from "@/components/ui-game";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/farm")({ head: () => seo("Farm", "Grow crops and build your farm into a city."), component: FarmPage });
type Tool = { k: "seed" | "build" | "bull"; id?: string } | null;

function FarmPage() {
  const s = useGame();
  const [w, setW] = useState(Math.min(s.world ?? 0, WORLDS.length - 1)), [tool, setTool] = useState<Tool>(null), [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const W = WORLDS[w], F = farmOf(w), farm = s.farms?.[w] ?? { city: false, tiles: {} };
  const cols = farm.city ? 7 : 5, rows = farm.city ? 5 : 4, inv = (id: string) => s.inv?.[id] ?? 0;
  const owned = WORLDS.map((_, i) => i).filter((i) => unlocked(i, s));
  const income = pending(s, w, now);
  const click = (key: string) => {
    const t = farm.tiles[key];
    if (t?.k === "c") { const it = itemById(t.id)!; if (now - t.at >= it.grow * 1000) { harvest(w, key); toast(`${it.emoji} Harvested ${it.name}!`); } else toast(`Still growing… ${Math.ceil(it.grow - (now - t.at) / 1000)}s`); return; }
    if (t?.k === "b") { if (tool?.k === "bull") bulldoze(w, key); else toast(`${itemById(t.id)!.emoji} ${itemById(t.id)!.name}`); return; }
    if (tool?.k === "seed" && tool.id) { if (inv(tool.id) < 1) toast("Out of seeds! Buy some or play the challenge."); else plant(w, key, tool.id); }
    else if (tool?.k === "build" && tool.id) { const it = itemById(tool.id)!; if (s.coins < it.cost) toast("Not enough coins 🪙"); else build(w, key, tool.id); }
  };
  const chip = (on: boolean) => cn("rounded-xl border-2 px-3 py-2 text-start text-sm font-semibold", on ? "border-primary bg-primary/15" : "bg-secondary/50");
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold md:text-4xl">🌾 My {farm.city ? "Cities" : "Farms"}</h1>
        <span className="rounded-full bg-card px-4 py-2 font-display text-xl font-bold shadow">🪙 {s.coins}</span>
      </div>
      <div className="flex flex-wrap gap-2" role="tablist">
        {owned.map((i) => <button key={i} role="tab" aria-selected={w === i} onClick={() => { setW(i); setTool(null); }} className={cn("rounded-full px-4 py-2 font-display font-semibold", w === i ? "bg-primary text-primary-foreground" : "bg-secondary")}>{WORLDS[i].emoji} {WORLDS[i].name}</button>)}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="overflow-hidden p-0 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2 p-4 text-white" style={{ background: `linear-gradient(135deg,${W.c1},${W.c2})` }}>
            <h2 className="text-2xl font-bold">{W.emoji} {farm.city ? F.cityName : F.farmName}</h2>
            <div className="flex gap-2">
              {income > 0 && <GameButton variant="accent" className="px-4 py-2" onClick={() => { collect(w); toast(`💰 +${income} coins!`); }}>💰 Collect {income}</GameButton>}
              <Link to="/play/$world" params={{ world: String(w) }} className="rounded-xl bg-white/25 px-4 py-2 font-semibold hover:bg-white/40">🎮 Get seeds</Link>
            </div>
          </div>
          <div className="p-4" style={{ background: `linear-gradient(135deg,${W.c1}33,${W.c2}33)` }}>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
              {Array.from({ length: cols * rows }, (_, n) => {
                const key = `${n % cols},${Math.floor(n / cols)}`, t = farm.tiles[key], it = t ? itemById(t.id) : undefined;
                const p = t?.k === "c" && it ? Math.min(1, (now - t.at) / (it.grow * 1000)) : 0;
                return (
                  <button key={key} onClick={() => click(key)} aria-label={it ? it.name : "empty plot"} style={{ background: F.soil }}
                    className="relative grid aspect-square place-items-center rounded-xl border-2 border-black/10 text-3xl shadow-inner transition-transform hover:scale-105 sm:text-4xl">
                    {t?.k === "c" ? (p >= 1 ? <span className="animate-pop">{it!.emoji}</span> : <span>{p < 0.5 ? "🌱" : "🌿"}</span>) : t?.k === "b" ? it!.emoji : <span className="text-base opacity-30">+</span>}
                    {t?.k === "c" && p < 1 && <span className="absolute inset-x-1 bottom-1 h-1.5 overflow-hidden rounded bg-black/20"><span className="block h-full bg-success" style={{ width: `${p * 100}%` }} /></span>}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Pick a seed or building on the right, then tap an empty plot. Tap a fully grown crop to harvest it.</p>
          </div>
        </Card>
        <div className="space-y-5">
          <Card className="space-y-2">
            <h2 className="text-xl font-bold">🌱 Seeds</h2>
            {F.seeds.map((it) => (
              <div key={it.id} className="flex items-center gap-2">
                <button className={cn(chip(tool?.id === it.id), "flex-1")} onClick={() => setTool({ k: "seed", id: it.id })}>{it.emoji} {it.name} <span className="text-muted-foreground">×{inv(it.id)} · {it.grow}s</span></button>
                <button disabled={s.coins < it.cost} onClick={() => buySeed(it.id)} className="rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-50" title="Buy one seed">+🪙{it.cost}</button>
              </div>
            ))}
          </Card>
          <Card className="space-y-2">
            <h2 className="text-xl font-bold">🏗️ Build</h2>
            {[...F.farmItems, ...(farm.city ? F.cityItems : [])].map((it) => (
              <button key={it.id} className={cn(chip(tool?.id === it.id), "w-full")} onClick={() => setTool({ k: "build", id: it.id })}>{it.emoji} {it.name} <span className="text-muted-foreground">🪙{it.cost}{it.income ? ` · +${it.income}/min` : ""}</span></button>
            ))}
            <button className={cn(chip(tool?.k === "bull"), "w-full")} onClick={() => setTool({ k: "bull" })}>🧹 Clear a building</button>
            {!farm.city && (
              <div className="rounded-xl bg-xp/15 p-3">
                <p className="font-display font-bold">🏙️ Upgrade to {F.cityName}</p>
                <p className="text-sm text-muted-foreground">Bigger land and city buildings that earn coins while you learn.</p>
                <GameButton className="mt-2 w-full px-3 py-2" disabled={s.coins < F.upgrade} onClick={() => { upgradeCity(w); toast(`🎉 Welcome to ${F.cityName}!`); }}>Upgrade 🪙 {F.upgrade}</GameButton>
              </div>
            )}
          </Card>
          <Card className="space-y-2">
            <h2 className="text-xl font-bold">🧺 Barn</h2>
            {F.seeds.every((it) => !inv("c" + it.id.slice(1))) && <p className="text-sm text-muted-foreground">Harvest crops or collect them in the challenge, then sell them here.</p>}
            {F.seeds.map((it) => { const id = "c" + it.id.slice(1), n = inv(id); return n > 0 && (
              <div key={id} className="flex items-center justify-between gap-2 text-sm font-semibold"><span>{it.emoji} {it.name} ×{n}</span>
                <span className="flex gap-1"><button onClick={() => sellCrop(id, 1)} className="rounded-lg bg-secondary px-2 py-1">Sell 🪙{it.sell}</button><button onClick={() => sellCrop(id, n)} className="rounded-lg bg-accent px-2 py-1 text-accent-foreground">All</button></span></div>); })}
          </Card>
        </div>
      </div>
      <Bar value={Math.min(100, Object.keys(farm.tiles).length / (cols * rows) * 100)} className="h-2" />
    </div>
  );
}
