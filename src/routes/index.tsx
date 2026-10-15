import { createFileRoute, Link } from "@tanstack/react-router";
import { useGame, levelInfo, rankFor, accuracy, SUBJECTS } from "@/lib/game";
import { useT } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { Bar, Card, GameButton } from "@/components/ui-game";
import { toast } from "sonner";
import { Avatar } from "@/components/Avatar";
import { equip, claimDaily, WORLDS } from "@/lib/rewards";

export const Route = createFileRoute("/")({ head: () => seo("Dashboard", "Your STEMQuest adventure."), component: Dashboard });

function Dashboard() {
  const s = useGame();
  const { t } = useT();
  if (!["boy", "girl"].includes(s.equipped.character)) return <Chooser />;
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
          {[`⭐ ${t("level")} ${lv.level}`, `🎖️ ${rankFor(lv.level)}`, `🪙 ${s.coins}`, `${WORLDS[s.world ?? 0].emoji} ${WORLDS[s.world ?? 0].name}`].map((x) => <span key={x} className="rounded-full bg-background/20 px-4 py-1.5">{x}</span>)}
        </div>
        <div className="mt-6 flex justify-between text-sm"><span>{t("xp")}</span><span>{lv.into} / {lv.need}</span></div>
        <div className="h-4 overflow-hidden rounded-full bg-background/30"><div className="bar-grow h-full bg-coin-grad" style={{ width: `${lv.pct}%` }} /></div>
        <div className="absolute end-10 top-3 hidden md:block"><Avatar className="w-48" /></div>
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
      <Daily />
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

function Chooser() {
  return (
    <div className="mx-auto max-w-2xl py-6 text-center">
      <h1 className="text-4xl font-bold">Choose your hero!</h1>
      <p className="mt-2 text-muted-foreground">You can change this any time in Rewards.</p>
      <div className="mt-8 grid grid-cols-2 gap-5">
        {(["boy", "girl"] as const).map((g) => (
          <button key={g} onClick={() => equip("character", g)} className="game-card animate-pop p-5 transition-transform hover:-translate-y-1">
            <img src={`/characters/${g}-school.png`} alt={g} className="mx-auto h-64 object-contain" />
            <span className="mt-2 block font-display text-xl font-bold capitalize">{g}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Daily() {
  const s = useGame();
  const today = new Date().toISOString().slice(0, 10);
  const n = Math.min(5, s.history?.[today]?.n ?? 0), done = s.claimed === today;
  return (
    <Card className="flex flex-wrap items-center gap-4">
      <span className="text-4xl">📅</span>
      <div className="min-w-48 flex-1"><p className="font-display text-xl font-bold">Daily Quest: answer 5 questions</p><Bar value={(n / 5) * 100} className="mt-2" /></div>
      <span className="font-semibold">{n}/5</span>
      <GameButton variant="accent" disabled={n < 5 || done} onClick={() => { claimDaily(); toast("🪙 +50 coins!"); }}>{done ? "Claimed ✓" : "Claim 🪙 50"}</GameButton>
    </Card>
  );
}
