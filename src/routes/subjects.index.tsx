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
        {SUBJECTS.map((x) => (
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
              <div className="flex flex-wrap gap-2">
                {x.topics.map((tp) => (
                  <Link key={tp} to="/subjects/$subject" params={{ subject: x.id }} search={{ topic: tp }} className="rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold hover:bg-primary hover:text-primary-foreground">
                    {tp} {s.topics[tp] ? `· ${accuracy(s.topics[tp])}%` : ""}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
