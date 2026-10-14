import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useGame } from "@/lib/game";
import { useT } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { SAMPLE, addFriend, kidByName } from "@/lib/sample";
import { Bar, Card, GameButton, PageHeader } from "@/components/ui-game";

export const Route = createFileRoute("/friends")({ head: () => seo("Friends", "Study together and join team challenges."), component: Friends });

function Friends() {
  const s = useGame();
  const { t } = useT();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const names = s.friends ?? [];
  const friends = names.map(kidByName);
  const answered = Object.values(s.subjects).reduce((a, x) => a + x.answered, 0);
  const challenges: [string, number, number][] = [
    ["Answer 200 questions together", 200, friends.reduce((a, k) => a + Math.round(k.weekly / 10), 0) + answered],
    ["Earn 3000 team XP", 3000, friends.reduce((a, k) => a + k.weekly, 0) + s.xp],
    ["Keep a 7-day team streak", 7, Math.min(7, s.streak)],
  ];
  const add = (n: string) => { if (n.trim()) { addFriend(n.trim()); toast(`🤝 ${n.trim()} added!`); setName(""); } };
  return (
    <>
      <PageHeader icon="🤝" title={t("friends")} subtitle="Friends and stats are sample data for this demo." />
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="space-y-3 lg:col-span-2">
          <h2 className="text-xl font-bold">Your friends ({friends.length})</h2>
          {friends.map((k) => (
            <div key={k.name} className="flex flex-wrap items-center gap-3 rounded-xl bg-secondary/50 p-3">
              <span className={`h-3.5 w-3.5 rounded-full ${k.online ? "bg-success" : "bg-muted-foreground/40"}`} title={k.online ? "Online" : "Offline"} />
              <div className="flex-1"><p className="font-semibold">{k.name}</p><p className="text-xs text-muted-foreground">Level {k.level} · {k.world} · {k.online ? "Online" : "Offline"}</p></div>
              <button onClick={() => { toast(`📚 Study Together started with ${k.name}`); nav({ to: "/subjects" }); }} className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">Study together</button>
            </div>
          ))}
        </Card>
        <div className="space-y-5">
          <Card className="space-y-3">
            <h2 className="text-xl font-bold">Add friend</h2>
            <div className="flex gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add(name)} placeholder="Friend's name" className="min-w-0 flex-1 rounded-xl border-2 bg-background px-3 py-2" />
              <GameButton onClick={() => add(name)} className="px-4 py-2">Add</GameButton>
            </div>
            {SAMPLE.filter((k) => !names.includes(k.name)).slice(0, 3).map((k) => (
              <div key={k.name} className="flex items-center justify-between text-sm"><span>{k.name} · Lv {k.level}</span><button onClick={() => add(k.name)} className="font-semibold text-primary">+ Add</button></div>
            ))}
          </Card>
          <Card className="space-y-3">
            <h2 className="text-xl font-bold">Team challenges</h2>
            {challenges.map(([l, goal, v]) => (
              <div key={l}><p className="mb-1 text-sm font-semibold">{l}</p><Bar value={Math.round((Math.min(v, goal) / goal) * 100)} /><p className="mt-1 text-xs text-muted-foreground">{Math.min(v, goal)} / {goal}</p></div>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}
