import { createFileRoute, Link } from "@tanstack/react-router";
import { useGame, levelInfo, rankFor, accuracy, SUBJECTS } from "@/lib/game";
import { useT } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { Bar, Card } from "@/components/ui-game";
import { Avatar } from "@/components/Avatar";

export const Route = createFileRoute("/")({ head: () => seo("Dashboard", "Your STEMQuest adventure."), component: Dashboard });

function Dashboard() {
  const s = useGame();
  const { t } = useT();
  const lv = levelInfo(s.xp);
  const all = Object.values(s.subjects);
  const answered = all.reduce((a, x) => a + x.answered, 0);
  const correct = all.reduce((a, x) => a + x.correct, 0);
  const studied = all.filter((x) => x.answered > 0).length;
  const stats = [["❓", answered, "Questions"], ["✅", correct, "Correct"], ["🎯", `${answered ? Math.round((correct / answered) * 100) : 0}%`, "Accuracy"], ["🔥", s.streak, "Day streak"], ["📚", `${studied}/4`, "Subjects"]];
  const actions = [["▶️", "Continue Learning", "/subjects", "bg-primary"], ["🗺️", "Visit World Map", "/world-map", "bg-success"], ["🎁", "View Rewards", "/rewards", "bg-accent text-accent-foreground"], ["📈", "View Progress", "/progress", "bg-xp"]];
  const badges = [["👣", "First Steps", answered >= 1], ["⚡", "Quick Learner", answered >= 10], ["🎓", "Scholar", lv.level >= 5], ["🔥", "On Fire", s.streak >= 3]] as const;
  return (
    <div className="space-y-6">
      <section className="bg-hero relative overflow-hidden rounded-3xl p-8 text-primary-foreground shadow-game">
        <p className="text-xl font-semibold">{t("welcome")}</p>
        <h1 className="text-5xl font-bold md:text-6xl">Explorer</h1>
        <div className="mt-4 flex flex-wrap gap-2 font-display">
          {[`⭐ ${t("level")} ${lv.level}`, `🎖️ ${rankFor(lv.level)}`, `🪙 ${s.coins}`, "🌲 Forest Realm"].map((x) => <span key={x} className="rounded-full bg-background/20 px-4 py-1.5">{x}</span>)}
        </div>
        <div className="mt-6 flex justify-between text-sm"><span>{t("xp")}</span><span>{lv.into} / {lv.need}</span></div>
        <div className="h-4 overflow-hidden rounded-full bg-background/30"><div className="bar-grow h-full bg-coin-grad" style={{ width: `${lv.pct}%` }} /></div>
        <div className="animate-float absolute end-10 top-4 hidden md:block"><Avatar /></div>
      </section>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map(([i, v, l]) => (
          <Card key={l as string} className="animate-pop text-center"><div className="text-3xl">{i}</div><div className="font-display text-3xl font-bold">{v}</div><div className="text-sm text-muted-foreground">{l}</div></Card>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {actions.map(([i, l, to, c]) => (
          <Link key={to} to={to} className={`${c} shadow-pop rounded-2xl p-5 text-center font-display text-lg font-bold text-primary-foreground transition-transform hover:-translate-y-1`}>
            <div className="text-3xl">{i}</div>{l}
          </Link>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2"><h2 className="mb-4 text-2xl font-bold">{t("subjects")}</h2>
          <div className="space-y-4">{SUBJECTS.map((x) => (
            <div key={x.id}><div className="mb-1 flex justify-between font-semibold"><span>{x.emoji} {t(x.id)}</span><span>{accuracy(s.subjects[x.id])}%</span></div><Bar value={accuracy(s.subjects[x.id])} tone={x.color} /></div>
          ))}</div></Card>
        <Card><h2 className="mb-4 text-2xl font-bold">Badges</h2>
          <div className="grid grid-cols-4 gap-3">{badges.map(([e, n, on]) => <div key={n} title={n} className={`grid h-14 w-14 place-items-center rounded-full text-2xl ${on ? "bg-accent/30" : "bg-muted opacity-40 grayscale"}`}>{e}</div>)}</div>
          <p className="mt-4 text-muted-foreground">{badges.filter((b) => b[2]).length}/{badges.length} earned</p></Card>
      </div>
    </div>
  );
}
