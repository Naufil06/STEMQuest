import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useGame } from "@/lib/game";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useStudents } from "@/lib/api";
import { seo } from "@/lib/seo";
import { meKid, type Kid } from "@/lib/sample";
import { Card, PageHeader } from "@/components/ui-game";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leaderboards")({ head: () => seo("Leaderboards", "See how you rank."), component: Leaderboards });

const TABS = [
  { id: "xp", label: "XP", val: (k: Kid) => k.xp, show: (k: Kid) => `${k.xp} XP` },
  { id: "lv", label: "Levels", val: (k: Kid) => k.level * 1e6 + k.xp, show: (k: Kid) => `Level ${k.level}` },
  { id: "wk", label: "Weekly Progress", val: (k: Kid) => k.weekly, show: (k: Kid) => `+${k.weekly} XP` },
  { id: "st", label: "Learning Streaks", val: (k: Kid) => k.streak, show: (k: Kid) => `🔥 ${k.streak} days` },
];

function Leaderboards() {
  const s = useGame();
  const { t } = useT();
  const { user } = useAuth();
  const students = useStudents();
  const [tab, setTab] = useState("xp");
  const cur = TABS.find((x) => x.id === tab)!;
  const rows = (students ?? []).map((k) => (k.username === user?.username ? { ...meKid(s), username: k.username, name: k.username as string } : k)).sort((a, b) => cur.val(b) - cur.val(a));
  return (
    <>
      <PageHeader icon="🏆" title={t("leaderboards")} subtitle="Real students on STEMQuest. Keep learning to climb!" />
      <div className="mb-4 flex flex-wrap gap-2" role="tablist">
        {TABS.map((x) => <button key={x.id} role="tab" aria-selected={tab === x.id} onClick={() => setTab(x.id)} className={cn("rounded-full px-4 py-2 font-display font-semibold", tab === x.id ? "bg-primary text-primary-foreground" : "bg-secondary")}>{x.label}</button>)}
      </div>
      <Card className="space-y-2">
        {students === null && <p className="text-muted-foreground">Loading…</p>}
        {students?.length === 0 && <p className="text-muted-foreground">No students yet. Be the first!</p>}
        {rows.map((k, i) => (
          <div key={k.username} className={cn("flex items-center gap-4 rounded-xl p-3", k.username === user?.username ? "bg-primary/15 ring-2 ring-primary" : "bg-secondary/50")}>
            <span className="w-10 text-center font-display text-2xl font-bold">{["🥇", "🥈", "🥉"][i] ?? i + 1}</span>
            <span className="flex-1 font-semibold">{k.name}{k.username === user?.username && " (you)"}</span>
            <span className="hidden text-sm text-muted-foreground sm:inline">{k.world}</span>
            <span className="w-28 text-end font-display font-bold">{cur.show(k)}</span>
          </div>
        ))}
      </Card>
    </>
  );
}
