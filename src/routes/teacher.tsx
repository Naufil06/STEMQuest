import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useGame, SUBJECTS, DIFFICULTIES, type SubjectId } from "@/lib/game";
import { useT } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { SAMPLE, meKid, setDifficulty } from "@/lib/sample";
import { Card, GameButton, PageHeader } from "@/components/ui-game";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher")({ head: () => seo("Teacher View", "Class overview and controls."), component: Teacher });

function Teacher() {
  const s = useGame();
  const { t } = useT();
  const all = [...SAMPLE, meKid(s)];
  const avg = Math.round(all.reduce((a, k) => a + k.acc, 0) / all.length);
  const done = Math.round(all.reduce((a, k) => a + Math.min(100, k.xp / 30), 0) / all.length);
  const [sub, setSub] = useState<SubjectId>("math");
  const [focus, setFocus] = useState<string[]>([]);
  const [quests, setQuests] = useState<string[]>([]);
  const topics = SUBJECTS.flatMap((x) => x.topics);
  const report = () => {
    const rows = [["Name", "Level", "Accuracy %", "XP", "World"], ...all.map((k) => [k.name, k.level, k.acc, k.xp, k.world])];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" }));
    a.download = "class-report.csv"; a.click(); URL.revokeObjectURL(a.href);
  };
  const stats: [string, string | number][] = [["Students", all.length], ["Average score", `${avg}%`], ["Completion rate", `${done}%`]];
  return (
    <>
      <PageHeader icon="🧑‍🏫" title={t("teacher")} subtitle="Sample class data. Difficulty changes apply to the Explorer profile." />
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(([l, v]) => <Card key={l} className="text-center"><p className="font-display text-4xl font-bold">{v}</p><p className="text-muted-foreground">{l}</p></Card>)}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="overflow-x-auto lg:col-span-2">
          <table className="w-full text-start">
            <thead><tr className="text-start text-sm text-muted-foreground">{["Student", "Level", "Accuracy", "XP", "World"].map((h) => <th key={h} className="p-2 text-start">{h}</th>)}</tr></thead>
            <tbody>{all.map((k) => (
              <tr key={k.name} className={cn("border-t", k.name.includes("You") && "bg-primary/10 font-semibold")}>
                <td className="p-2">{k.name}</td><td className="p-2">{k.level}</td>
                <td className={cn("p-2", k.acc < 70 && "font-bold text-destructive")}>{k.acc}%</td><td className="p-2">{k.xp}</td><td className="p-2">{k.world}</td>
              </tr>))}</tbody>
          </table>
        </Card>
        <Card className="space-y-4">
          <h2 className="text-xl font-bold">Teacher controls</h2>
          <div>
            <p className="mb-1 font-semibold">Adjust difficulty</p>
            <div className="flex flex-wrap gap-2">
              <select value={sub} onChange={(e) => setSub(e.target.value as SubjectId)} className="rounded-xl border-2 bg-background p-2">{SUBJECTS.map((x) => <option key={x.id} value={x.id}>{t(x.id)}</option>)}</select>
              <select value={s.difficulty[sub]} onChange={(e) => { setDifficulty(sub, +e.target.value); toast(`Difficulty set to ${DIFFICULTIES[+e.target.value]}`); }} className="rounded-xl border-2 bg-background p-2">{DIFFICULTIES.map((d, i) => <option key={d} value={i}>{d}</option>)}</select>
            </div>
          </div>
          <div>
            <p className="mb-1 font-semibold">Choose topics &amp; assign quests</p>
            <div className="flex flex-wrap gap-1.5">{topics.map((tp) => <button key={tp} onClick={() => setFocus((f) => (f.includes(tp) ? f.filter((x) => x !== tp) : [...f, tp]))} className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", focus.includes(tp) ? "bg-primary text-primary-foreground" : "bg-secondary")}>{tp}</button>)}</div>
            <GameButton className="mt-2 px-4 py-2" disabled={!focus.length} onClick={() => { setQuests((q) => [...q, ...focus.map((f) => `Quest: Practice ${f}`)]); setFocus([]); toast("Quests assigned!"); }}>Assign quest</GameButton>
            {quests.map((q, i) => <p key={i} className="mt-1 text-sm">✅ {q}</p>)}
          </div>
          <GameButton variant="success" onClick={report}>📄 Generate report (CSV)</GameButton>
        </Card>
      </div>
    </>
  );
}
