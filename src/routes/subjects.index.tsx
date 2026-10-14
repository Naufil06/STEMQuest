import { createFileRoute, Link } from "@tanstack/react-router";
import { useGame, SUBJECTS, accuracy, DIFFICULTIES } from "@/lib/game";
import { useT } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { Bar, PageHeader } from "@/components/ui-game";

export const Route = createFileRoute("/subjects/")({
  head: () => seo("Subjects", "Choose Mathematics, Science, English or Technology and start an adaptive quest."),
  component: Subjects,
});

function Subjects() {
  const s = useGame();
  const { t } = useT();
  return (
    <>
      <PageHeader icon="📖" title={t("subjects")} subtitle="Pick a subject or jump straight into a topic." />
      <div className="grid gap-5 md:grid-cols-2">
        {SUBJECTS.map((x) => {
          const grouped = Object.values(x.groups ?? {}).flat();
          const pill = (tp: string) =>
            x.id === "math" && tp === "Algebra" && s.difficulty.math < 3 ? (
              <span key={tp} title="Reach the Expert level to unlock" className="rounded-full bg-muted px-3 py-1.5 text-sm font-semibold text-muted-foreground">🔒 {tp} · Expert</span>
            ) : (
              <Link key={tp} to="/subjects/$subject" params={{ subject: x.id }} search={{ topic: tp }} className="rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold hover:bg-primary hover:text-primary-foreground">
                {tp} {s.topics[tp] ? `· ${accuracy(s.topics[tp])}%` : ""}
              </Link>
            );
          return (
            <div key={x.id} className="game-card overflow-hidden animate-pop">
              <div className={`${x.color} flex items-center justify-between p-5 text-primary-foreground`}>
                <div>
                  <h2 className="text-2xl font-bold">{x.emoji} {t(x.id)}</h2>
                  <p className="text-sm opacity-90">{t("difficulty")}: {DIFFICULTIES[s.difficulty[x.id]]}</p>
                </div>
                <Link to="/subjects/$subject" params={{ subject: x.id }} className="rounded-xl bg-background px-4 py-2 font-display font-semibold text-foreground hover:scale-105 transition-transform">
                  {t("start")} →
                </Link>
              </div>
              <div className="p-5">
                <div className="mb-3"><Bar value={accuracy(s.subjects[x.id])} tone={x.color} /></div>
                {x.id === "math" && <p className="mb-3 text-xs text-muted-foreground">Beginner = Grades K–2 · Intermediate = Grades 3–4 · Advanced = Grades 5–6 · Expert = Grades 7–9</p>}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(x.groups ?? {}).map(([g, list]) => (
                    <details key={g} className="w-full rounded-2xl border-2 bg-secondary/40 p-3 open:bg-secondary/70">
                      <summary className="cursor-pointer font-display font-semibold">➕ {g} <span className="text-sm font-normal text-muted-foreground">(tap to choose)</span></summary>
                      <div className="mt-3 flex flex-wrap gap-2">{list.map(pill)}</div>
                    </details>
                  ))}
                  {x.topics.filter((tp) => !grouped.includes(tp)).map(pill)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
