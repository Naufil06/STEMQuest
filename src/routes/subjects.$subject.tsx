import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Volume2 } from "lucide-react";
import { useGame, SUBJECTS, DIFFICULTIES, DIFF_XP, recordAnswer, spendToken, levelInfo, type SubjectId } from "@/lib/game";
import { pickQuestion, isCorrect, type Question } from "@/lib/questions";
import { useT, speak } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { Bar, Card, GameButton } from "@/components/ui-game";
import { MathText } from "@/components/MathText";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/subjects/$subject")({
  validateSearch: (s: Record<string, unknown>): { topic?: string } => (typeof s["topic"] === "string" ? { topic: s["topic"] } : {}),
  beforeLoad: ({ params }) => {
    if (!SUBJECTS.some((x) => x.id === params.subject)) throw notFound();
  },
  head: ({ params }) => seo(`${params.subject[0]?.toUpperCase()}${params.subject.slice(1)} Quest`, "Answer adaptive questions, earn XP and coins, and level up."),
  component: Quiz,
});

const DIFF_TONE = ["bg-success", "bg-math", "bg-tech", "bg-english"];

function Quiz() {
  const { subject } = Route.useParams();
  const { topic } = Route.useSearch();
  const sid = subject as SubjectId;
  const meta = SUBJECTS.find((x) => x.id === sid)!;
  const s = useGame();
  const { t, lang } = useT();
  const diff = s.difficulty[sid];
  const seen = useRef(new Set<string>());
  const [q, setQ] = useState<Question | null>(null);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<null | { ok: boolean; xp: number }>(null);
  const [session, setSession] = useState({ n: 0, ok: 0, xp: 0 });
  const [assisted, setAssisted] = useState(false);   // used Simplify or looked at the solution first -> half XP
  const [sol, setSol] = useState(false);

  const next = () => {
    const nq = pickQuestion(sid, diff, lang, seen.current, topic);
    seen.current.add(nq.id);
    setQ(nq); setInput(""); setResult(null); setAssisted(false); setSol(false);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(next, [sid, topic, lang]);

  const simplify = () => {
    if (!q?.easy || result) return;
    if (!spendToken()) { toast("No simplify tokens left. Keep playing to earn more! 🪄"); return; }
    setQ({ ...q.easy, id: q.id }); setInput(""); setAssisted(true);
    toast("🪄 Made it easier (answers earn half XP)");
  };
  const viewSolution = () => { if (!result) setAssisted(true); setSol((v) => !v); };

  const submit = (value: string) => {
    if (!q || result || !value.trim()) return;
    const ok = isCorrect(q, value);
    setInput(value);
    const r = recordAnswer(sid, q.topic, q.d, ok, assisted);
    setResult({ ok, xp: r.xp });
    setSession((p) => ({ n: p.n + 1, ok: p.ok + (ok ? 1 : 0), xp: p.xp + r.xp }));
    if (r.levelUp) toast.success(`🎉 Level up! You're now level ${levelInfo(s.xp + r.xp).level}`);
    if (r.newDiff > q.d) toast(`⬆️ Difficulty up: ${DIFFICULTIES[r.newDiff]}`);
    if (r.newDiff < q.d) toast(`⬇️ Difficulty adjusted: ${DIFFICULTIES[r.newDiff]}`);
  };

  if (!q) return null;
  const opts = q.options;
  const isMath = sid === "math";

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/subjects" className="font-semibold text-muted-foreground hover:text-foreground">← {t("subjects")}</Link>
        <div className="flex gap-2 font-display text-sm">
          {isMath && <span className="rounded-full bg-secondary px-3 py-1" title="Simplify tokens: earn more by playing">🪄 {s.tokens ?? 0}</span>}
          <span className="rounded-full bg-secondary px-3 py-1">✅ {session.ok}/{session.n}</span>
          <span className="rounded-full bg-xp/20 px-3 py-1">+{session.xp} {t("xp")}</span>
        </div>
      </div>

      <Card className="animate-pop p-0 overflow-hidden">
        <div className={`${meta.color} flex flex-wrap items-center justify-between gap-2 px-6 py-4 text-primary-foreground`}>
          <h1 className="text-2xl font-bold">{meta.emoji} {t(sid)} · <span className="opacity-90">{q.topic}</span></h1>
          <div className="flex gap-2 font-display text-sm">
            <span className={cn("rounded-full px-3 py-1 text-primary-foreground ring-2 ring-background/60", DIFF_TONE[q.d])}>{t("difficulty")}: {DIFFICULTIES[q.d]}</span>
            <span className="rounded-full bg-background/25 px-3 py-1">{t("multiplier")}: {DIFF_XP[q.d]} XP</span>
          </div>
        </div>
        <div className="p-6" key={q.id + q.q}>
          <div className="mb-2"><Bar value={(diff + 1) * 25} tone={DIFF_TONE[diff]} className="h-2" /></div>
          <div className="my-6 flex items-start gap-3">
            <p className="flex-1 font-display text-2xl font-semibold md:text-3xl"><MathText>{q.q}</MathText></p>
            <button aria-label={t("listen")} title={t("listen")} onClick={() => speak(q.q, lang)} className="rounded-xl bg-secondary p-3 hover:bg-primary hover:text-primary-foreground"><Volume2 /></button>
          </div>

          {(isMath && q.easy && !result || q.steps) && (
            <div className="mb-5 flex flex-wrap gap-2">
              {isMath && q.easy && !result && (
                <button onClick={simplify} title="Makes the question easier. Costs 1 token, and the answer earns half XP." className="rounded-xl bg-xp/20 px-4 py-2 font-display font-semibold hover:bg-xp/40">🪄 Simplify ({s.tokens ?? 0} left)</button>
              )}
              {q.steps && (
                <button onClick={viewSolution} title={result ? "See how it's solved" : "Looking before you answer earns half XP"} className="rounded-xl bg-accent/30 px-4 py-2 font-display font-semibold hover:bg-accent/60">💡 {sol ? "Hide" : "View"} solution</button>
              )}
            </div>
          )}

          {opts ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {opts.map((o, i) => {
                const chosen = result && input === o;
                const right = result && isCorrect(q, o);
                return (
                  <button key={o} disabled={!!result} onClick={() => submit(o)}
                    className={cn("rounded-xl border-2 p-4 text-start text-lg font-semibold transition-all hover:-translate-y-0.5 hover:border-primary", right && "border-success bg-success/15", chosen && !right && "border-destructive bg-destructive/10")}>
                    <span className="me-2 inline-grid h-7 w-7 place-items-center rounded-lg bg-secondary font-display text-sm">{String.fromCharCode(65 + i)}</span><MathText>{o}</MathText>
                  </button>
                );
              })}
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); submit(input); }} className="flex gap-3">
              <input autoFocus value={input} disabled={!!result} onChange={(e) => setInput(e.target.value)} placeholder={q.a.includes("/") ? "Type a fraction like 3/4" : t("typeAnswer")} aria-label={t("typeAnswer")}
                className="flex-1 rounded-xl border-2 bg-background px-4 py-3 text-lg outline-none focus:border-primary" />
              {!result && <GameButton type="submit">{t("check")}</GameButton>}
            </form>
          )}

          {sol && q.steps && (
            <div className="animate-pop mt-5 rounded-2xl border-2 border-accent bg-accent/10 p-4">
              <p className="font-display text-lg font-bold">💡 Solution</p>
              <ol className="mt-2 list-decimal space-y-2 ps-6 text-lg">{q.steps.map((st, i) => <li key={i}><MathText>{st}</MathText></li>)}</ol>
              <p className="mt-3 font-display text-xl font-bold">Answer: <MathText>{q.a}</MathText></p>
            </div>
          )}

          {result && (
            <div className={cn("mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 animate-pop", result.ok ? "bg-success/15" : "bg-destructive/10")}>
              <div>
                <p className="font-display text-xl font-bold">{result.ok ? `🎉 ${t("correct")} +${result.xp} XP` : `💡 ${t("incorrect")}`}</p>
                {result.ok && assisted && <p className="text-sm text-muted-foreground">Half XP because you used help.</p>}
                {!result.ok && <p className="text-muted-foreground">{t("answer")}: <b className="text-foreground"><MathText>{q.a}</MathText></b></p>}
              </div>
              <GameButton autoFocus variant={result.ok ? "success" : "primary"} onClick={next}>{t("next")} →</GameButton>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
