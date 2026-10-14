import { createFileRoute, Link } from "@tanstack/react-router";
import { useGame, SUBJECTS, accuracy } from "@/lib/game";
import { useT } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { Card, PageHeader } from "@/components/ui-game";

export const Route = createFileRoute("/progress")({ head: () => seo("Progress", "Charts, learning gaps and recommendations."), component: Progress });

const iso = (n: number) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

function Chart({ title, vals, labels, tones, unit = "" }: { title: string; vals: number[]; labels: string[]; tones: string[]; unit?: string }) {
  const max = Math.max(1, ...vals);
  return (
    <Card>
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      <div className="flex h-44 gap-2">
        {vals.map((v, i) => (
          <div key={i} className="flex flex-1 flex-col">
            <div className="flex flex-1 items-end"><div className={`bar-grow w-full rounded-t-lg ${tones[i % tones.length]}`} style={{ height: `${(v / max) * 100}%`, minHeight: 4 }} /></div>
            <span className="mt-1 text-center text-xs font-semibold">{v}{unit}</span>
            <span className="text-center text-xs text-muted-foreground">{labels[i]}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Progress() {
  const s = useGame();
  const { t } = useT();
  const days = [6, 5, 4, 3, 2, 1, 0].map(iso);
  const hist = days.map((d) => s.history?.[d] ?? { n: 0, ok: 0, xp: 0 });
  const dl = days.map((d) => new Date(d + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" }));
  const topics = SUBJECTS.flatMap((x) => x.topics.map((tp) => ({ tp, sub: x, st: s.topics[tp], acc: accuracy(s.topics[tp]) })));
  const weak = topics.filter((x) => x.st?.answered && x.acc < 75).sort((a, b) => a.acc - b.acc).slice(0, 4);
  const fresh = topics.filter((x) => !x.st?.answered).slice(0, 3);
  const weakestSubject = SUBJECTS.filter((x) => s.subjects[x.id].answered > 0).sort((a, b) => accuracy(s.subjects[a.id]) - accuracy(s.subjects[b.id]))[0];
  const rec = (x: (typeof topics)[number], verb: string) => (
    <Link key={x.tp} to="/subjects/$subject" params={{ subject: x.sub.id }} search={{ topic: x.tp }} className="flex items-center justify-between rounded-xl bg-secondary p-3 font-semibold hover:bg-primary hover:text-primary-foreground">
      <span>{verb} {x.tp}</span><span>{x.st?.answered ? `${x.acc}%` : "New"} →</span>
    </Link>
  );
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader icon="📈" title={t("progress")} subtitle="Your last 7 days and where to improve next." />
        <Link to="/skills" className="rounded-xl bg-primary px-5 py-2 font-display font-semibold text-primary-foreground shadow-pop">🌳 Skill Trees</Link>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Chart title="Questions answered" vals={hist.map((h) => h.n)} labels={dl} tones={["bg-primary"]} />
        <Chart title="Accuracy %" vals={hist.map((h) => (h.n ? Math.round((h.ok / h.n) * 100) : 0))} labels={dl} tones={["bg-success"]} unit="%" />
        <Chart title="XP gained" vals={hist.map((h) => h.xp)} labels={dl} tones={["bg-xp"]} />
        <Chart title="Subject performance" vals={SUBJECTS.map((x) => accuracy(s.subjects[x.id]))} labels={SUBJECTS.map((x) => t(x.id).slice(0, 8))} tones={SUBJECTS.map((x) => x.color)} unit="%" />
      </div>
      <Card className="mt-5">
        <h2 className="mb-1 text-xl font-bold">🔍 Learning gaps</h2>
        {weakestSubject && <p className="mb-3 text-muted-foreground">Weakest subject so far: <b className="text-foreground">{t(weakestSubject.id)}</b> ({accuracy(s.subjects[weakestSubject.id])}%)</p>}
        <div className="grid gap-2 md:grid-cols-2">
          {weak.map((x) => rec(x, "Practice"))}
          {fresh.map((x) => rec(x, "Start"))}
          {!weak.length && !fresh.length && <p className="font-semibold">Amazing work! No gaps found. 🎉</p>}
        </div>
      </Card>
    </>
  );
}
