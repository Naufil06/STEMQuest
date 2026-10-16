import { useEffect } from "react";
import { useGame } from "@/lib/game";
import { WORLDS, topWorld, travel, seeWorld, toggleMusic } from "@/lib/rewards";
import { setMusic, resumeMusic } from "@/lib/music";
import { useAuth, logout } from "@/lib/auth";
import { GameButton } from "@/components/ui-game";

/** Applies the current world's theme + music, shows the mute button and the "new world unlocked" pop-up. */
export function WorldFx() {
  const s = useGame();
  const { user } = useAuth();
  const w = Math.min(s.world ?? 0, WORLDS.length - 1), on = s.music !== false, top = topWorld(s.xp);
  useEffect(() => { document.documentElement.dataset.world = WORLDS[w].key; }, [w]);
  useEffect(() => { setMusic(on, w); }, [on, w]);
  useEffect(() => {   // browsers only allow sound after a click/key press
    window.addEventListener("pointerdown", resumeMusic); window.addEventListener("keydown", resumeMusic);
    return () => { window.removeEventListener("pointerdown", resumeMusic); window.removeEventListener("keydown", resumeMusic); };
  }, []);
  return (
    <>
      <div className="fixed bottom-4 end-4 z-40 flex items-center gap-2">
        {user && <><span className="hidden rounded-full bg-card px-3 py-2 text-sm font-semibold text-card-foreground shadow sm:inline">👤 {user.username}</span><button onClick={() => void logout()} className="rounded-full bg-secondary px-3 py-2 text-sm font-semibold shadow">Log out</button></>}
      <button onClick={toggleMusic} aria-label={on ? "Mute music" : "Play music"} title={on ? "Mute music" : "Play music"} className="grid h-12 w-12 place-items-center rounded-full bg-primary text-xl text-primary-foreground shadow-pop">{on ? "🎵" : "🔇"}</button>
      </div>
      {top > (s.seenWorld ?? 0) && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="game-card animate-pop max-w-md p-8 text-center">
            <div className="text-7xl">{WORLDS[top].emoji}</div>
            <h2 className="mt-3 text-3xl font-bold">New world unlocked!</h2>
            <p className="mt-1 text-xl font-semibold">{WORLDS[top].name}</p>
            <p className="mt-2 text-muted-foreground">{WORLDS[top].blurb}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <GameButton autoFocus onClick={() => travel(top)}>🚀 Travel there!</GameButton>
              <button onClick={() => seeWorld(top)} className="rounded-xl bg-secondary px-5 py-3 font-semibold">Later</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
