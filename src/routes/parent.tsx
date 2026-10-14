import { createFileRoute } from "@tanstack/react-router";
import { useGame, SUBJECTS, accuracy, levelInfo } from "@/lib/game";
import { useT } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { meKid, weekXp } from "@/lib/sample";
import { Bar, Card, PageHeader } from "@/components/ui-game";

export const Route = createFileRoute("/parent")({ head: () => seo("Parent View", "Your child's progress at a glance."), component: Parent });

function Parent() {
  const s = useGame();
  const { t } = useT();
  const me = meKid(s), lv = levelInfo(s.xp);
  const thisW = weekXp(s), lastW = weekXp(s, 7);
  const change = lastW ? Math.round(((thisW - lastW) / lastW) * 100) : thisW ? 100 : 0;
  const ranked = SUBJECTS.filter((x) => s.subjects[x.id].answered > 0).map((x) => ({ x, acc: accuracy(s.subjects[x.id]) })).sort((a, b) => b.acc - a.acc);
  const strong = ranked.filter((r) => r.acc >= 75), weak = ranked.filter((r) => r.acc < 75);
  const topics = SUBJECTS.flatMap((x) => x.topics).filter((tp) => s.topics[tp]?.answered).map((tp) => ({ tp, acc: accuracy(s.topics[tp]) })).sort((a, b) => a.acc - b.acc);
  const answered = Object.values(s.subjects).reduce((a, x) => a + x.answered, 0);
  const recs = [
    ...topics.filter((x) => x.acc < 75).slice(0, 2).map((x) => `Your child should spend more time on ${x.tp}.`),
    ...(!answered ? ["Encourage your child to start a quest in any subject."] : []),
    ...(s.streak < 3 && answered ? ["Short daily sessions build a learning streak. Try 10 minutes a day."] : []),
    ...strong.slice(0, 1).map((r) => `Great work in ${t(r.x.id)}! A harder level will keep it exciting.`),
  ];
  const wins = [[answered >= 1, "👣 Answered their first question"], [answered >= 25, "⚡ Answered 25 questions"], [lv.level >= 3, `⭐ Reached level ${lv.level}`], [s.streak >= 3, `🔥 ${s.streak}-day learning streak`], [s.owned.length > 0, "🎁 Bought a reward"]].filter((w) => w[0]);
  const cards: [string, string | number][] = [["Current level", me.level], ["Weekly improvement", `${change >= 0 ? "+" : ""}${change}%`], ["Accuracy", `${me.acc}%`], ["Learning streak", `${s.streak} days`]];
  return (
    <>
      <PageHeader icon="👪" title={t("parent")} subtitle="A simple report on how your child is doing." />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map(([l, v]) => <Card key={l} className="text-center"><p className="font-display text-3xl font-bold">{v}</p><p className="text-sm text-muted-foreground">{l}</p></Card>)}
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-xl font-bold">Subject report</h2>
          {SUBJECTS.map((x) => <div key={x.id}><div className="mb-1 flex justify-between text-sm font-semibold"><span>{x.emoji} {t(x.id)}</span><span>{accuracy(s.subjects[x.id])}%</span></div><Bar value={accuracy(s.subjects[x.id])} tone={x.color} /></div>)}
          <p className="text-sm"><b>Strong:</b> {strong.map((r) => t(r.x.id)).join(", ") || "Not enough data yet"}</p>
          <p className="text-sm"><b>Needs practice:</b> {weak.map((r) => t(r.x.id)).join(", ") || "None right now 🎉"}</p>
        </Card>
        <div className="space-y-5">
          <Card><h2 className="mb-2 text-xl font-bold">💡 Recommendations</h2>{recs.map((r) => <p key={r} className="mb-1">• {r}</p>)}</Card>
          <Card><h2 className="mb-2 text-xl font-bold">🏅 Recent achievements</h2>{wins.length ? wins.map((w) => <p key={w[1] as string} className="mb-1">{w[1] as string}</p>) : <p className="text-muted-foreground">Achievements will appear as your child learns.</p>}</Card>
        </div>
      </div>
    </>
  );
}
