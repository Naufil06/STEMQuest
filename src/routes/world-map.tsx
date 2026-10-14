import { createFileRoute, Link } from "@tanstack/react-router";
import { useGame, levelInfo } from "@/lib/game";
import { useT } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { WORLDS } from "@/lib/rewards";
import { Bar, PageHeader } from "@/components/ui-game";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/world-map")({ head: () => seo("World Map", "Unlock new worlds with XP and levels."), component: WorldMap });

function WorldMap() {
  const s = useGame();
  const { t } = useT();
  const lv = levelInfo(s.xp).level;
  return (
    <>
      <PageHeader icon="🗺️" title={t("worldMap")} subtitle="Gain XP and levels to unlock the next world." />
      <div className="mx-auto max-w-3xl">
        {WORLDS.map((w, i) => {
          const open = lv >= w.level && s.xp >= w.xp;
          const next = WORLDS[i + 1]?.xp ?? w.xp + 4000;
          const pct = open ? Math.min(100, Math.round(((s.xp - w.xp) / (next - w.xp)) * 100)) : 0;
          return (
            <div key={w.id}>
              {i > 0 && <div className="mx-auto h-8 w-0 border-s-4 border-dashed border-primary/40" />}
              <div className={cn("game-card overflow-hidden animate-pop md:w-4/5", i % 2 && "md:ms-auto", !open && "opacity-90")}>
                <div className={cn("flex items-center gap-4 p-5 text-white", !open && "grayscale")} style={{ background: `linear-gradient(135deg,${w.c1},${w.c2})` }}>
                  <span className="text-5xl">{open ? w.emoji : "🔒"}</span>
                  <div className="flex-1"><h2 className="text-2xl font-bold">World {w.id + 1}: {w.name}</h2><p className="opacity-90">{w.blurb}</p></div>
                </div>
                <div className="space-y-3 p-5">
                  {open ? (
                    <>
                      <div className="flex justify-between text-sm font-semibold"><span>Completion</span><span>{pct}%</span></div>
                      <Bar value={pct} />
                      <Link to="/subjects" className="inline-block rounded-xl bg-primary px-5 py-2 font-display font-semibold text-primary-foreground">Enter world →</Link>
                    </>
                  ) : (
                    <p className="font-semibold text-muted-foreground">🔒 Unlock at Level {w.level} and {w.xp} XP <span className="font-normal">(you have Level {lv}, {s.xp} XP)</span></p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
