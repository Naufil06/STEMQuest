import { createFileRoute } from "@tanstack/react-router";
import { useGame } from "@/lib/game";
import { seo } from "@/lib/seo";
import { Card, PageHeader } from "@/components/ui-game";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/skills")({ head: () => seo("Skill Trees", "Master skills to unlock the next ones."), component: Skills });

// A skill is mastered after `need` correct answers in its topics; mastering one unlocks the next.
type Node = { label: string; topics: string[]; need: number };
const TREES: { name: string; emoji: string; nodes: Node[] }[] = [
  { name: "Math Tree", emoji: "🔢", nodes: [{ label: "Arithmetic", topics: ["Arithmetic"], need: 8 }, { label: "Fractions", topics: ["Fractions"], need: 8 }, { label: "Algebra", topics: ["Algebra"], need: 8 }, { label: "Advanced Math", topics: ["Algebra", "Geometry"], need: 16 }] },
  { name: "Science Tree", emoji: "🔬", nodes: [{ label: "Biology", topics: ["Biology"], need: 6 }, { label: "Chemistry", topics: ["Chemistry"], need: 6 }, { label: "Physics", topics: ["Physics"], need: 6 }] },
  { name: "English Tree", emoji: "📚", nodes: [{ label: "Grammar", topics: ["Grammar"], need: 6 }, { label: "Reading", topics: ["Reading"], need: 6 }, { label: "Writing", topics: ["Writing"], need: 6 }] },
  { name: "Technology Tree", emoji: "💻", nodes: [{ label: "Coding Basics", topics: ["Coding Basics"], need: 6 }, { label: "Logic", topics: ["Logic"], need: 6 }, { label: "Digital Literacy", topics: ["Digital Literacy"], need: 6 }] },
];

function Skills() {
  const s = useGame();
  const got = (n: Node) => n.topics.reduce((a, x) => a + (s.topics[x]?.correct ?? 0), 0);
  return (
    <>
      <PageHeader icon="🌳" title="Skill Trees" subtitle="Answer questions correctly to master each skill and unlock the next one." />
      <div className="space-y-5">
        {TREES.map((tr) => {
          const done = tr.nodes.map((n) => got(n) >= n.need);
          return (
            <Card key={tr.name}>
              <h2 className="mb-4 text-2xl font-bold">{tr.emoji} {tr.name}</h2>
              <div className="flex flex-wrap items-start gap-y-6">
                {tr.nodes.map((n, i) => {
                  const open = i === 0 || done[i - 1];
                  return (
                    <div key={n.label} className="flex items-start">
                      {i > 0 && <div className={cn("mt-[2.15rem] h-1.5 w-8 rounded md:w-14", done[i - 1] ? "bg-success" : "bg-border")} />}
                      <div className="flex w-28 flex-col items-center text-center">
                        <div className={cn("grid h-20 w-20 place-items-center rounded-full border-4 font-display text-3xl font-bold", done[i] ? "border-success bg-success/20" : open ? "border-primary bg-primary/10" : "border-border bg-muted opacity-60 grayscale")}>
                          {done[i] ? "⭐" : open ? i + 1 : "🔒"}
                        </div>
                        <p className="mt-1 font-display font-semibold">{n.label}</p>
                        <p className="text-xs text-muted-foreground">{Math.min(got(n), n.need)}/{n.need} correct</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
