import { useSyncExternalStore } from "react";

export type SubjectId = "math" | "science" | "english" | "technology";
export const SUBJECTS: { id: SubjectId; emoji: string; color: string; topics: string[] }[] = [
  { id: "math", emoji: "🔢", color: "bg-math", topics: ["Arithmetic", "Fractions", "Algebra", "Geometry"] },
  { id: "science", emoji: "🔬", color: "bg-science", topics: ["Biology", "Chemistry", "Physics", "Earth Science"] },
  { id: "english", emoji: "📚", color: "bg-english", topics: ["Reading", "Grammar", "Vocabulary", "Writing"] },
  { id: "technology", emoji: "💻", color: "bg-tech", topics: ["Coding Basics", "Logic", "Digital Literacy"] },
];
export const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced", "Expert"];
export const DIFF_XP = [10, 20, 40, 75];
export const RANKS = ["Novice", "Apprentice", "Explorer", "Scholar", "Expert", "Master", "Legend"];
export const rankFor = (level: number) => RANKS[Math.min(RANKS.length - 1, Math.floor((level - 1) / 5))];

export type Stat = { answered: number; correct: number };
const stat = (): Stat => ({ answered: 0, correct: 0 });
const bySubject = <T,>(f: () => T) => ({ math: f(), science: f(), english: f(), technology: f() }) as Record<SubjectId, T>;

export interface GameState {
  xp: number; coins: number; streak: number; lastDay: string;
  settings: { largeText: boolean; highContrast: boolean; dyslexia: boolean };
  difficulty: Record<SubjectId, number>;
  runs: Record<SubjectId, { ok: number; bad: number }>;
  subjects: Record<SubjectId, Stat>;
  topics: Record<string, Stat>;
  unlockedWorlds: number[]; owned: string[]; equipped: Record<string, string>; history: Record<string, { n: number; ok: number; xp: number }>;
}
const initial = (): GameState => ({
  xp: 0, coins: 0, streak: 0, lastDay: "",
  settings: { largeText: false, highContrast: false, dyslexia: false },
  difficulty: bySubject(() => 0), runs: bySubject(() => ({ ok: 0, bad: 0 })),
  subjects: bySubject(stat), topics: {}, unlockedWorlds: [0], owned: [], equipped: {}, history: {},
});

const KEY = "stemquest-v1";
function load(): GameState {
  try { const raw = localStorage.getItem(KEY); if (raw) return { ...initial(), ...JSON.parse(raw) }; } catch { /* ignore */ }
  return initial();
}
let state = load();
const subs = new Set<() => void>();
export function set(fn: (s: GameState) => GameState) {
  state = fn(state);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  subs.forEach((f) => f());
}
export const useGame = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => state, () => state);
export const updateSettings = (p: Partial<GameState["settings"]>) => set((s) => ({ ...s, settings: { ...s.settings, ...p } }));
export const resetGame = () => set(() => initial());

export const accuracy = (s?: Stat) => (s && s.answered ? Math.round((s.correct / s.answered) * 100) : 0);

export function levelInfo(xp: number) {
  let level = 1, into = xp, need = 100;
  while (into >= need && level < 100) { into -= need; level++; need = 100 + (level - 1) * 25; }
  return { level, into, need, pct: Math.min(100, Math.round((into / need) * 100)) };
}

const day = (d = new Date()) => d.toISOString().slice(0, 10);

/** Adaptive engine: 3 correct in a row => harder, 2 wrong in a row => easier. */
export function recordAnswer(sid: SubjectId, topic: string, d: number, ok: boolean) {
  const before = levelInfo(state.xp).level;
  const xp = ok ? DIFF_XP[d] : 2;
  let newDiff = state.difficulty[sid];
  set((s) => {
    const r = s.runs[sid];
    let run = { ok: ok ? r.ok + 1 : 0, bad: ok ? 0 : r.bad + 1 };
    let nd = s.difficulty[sid];
    if (run.ok >= 3 && nd < 3) { nd++; run = { ok: 0, bad: 0 }; }
    else if (run.bad >= 2 && nd > 0) { nd--; run = { ok: 0, bad: 0 }; }
    newDiff = nd;
    const bump = (x: Stat = stat()): Stat => ({ answered: x.answered + 1, correct: x.correct + (ok ? 1 : 0) });
    const today = day(), yest = day(new Date(Date.now() - 864e5));
    const streak = s.lastDay === today ? s.streak : s.lastDay === yest ? s.streak + 1 : 1;
    const h = s.history?.[today] ?? { n: 0, ok: 0, xp: 0 };
    return {
      ...s, history: { ...s.history, [today]: { n: h.n + 1, ok: h.ok + (ok ? 1 : 0), xp: h.xp + xp } }, xp: s.xp + xp, coins: s.coins + (ok ? Math.round(xp / 2) : 0), streak, lastDay: today,
      difficulty: { ...s.difficulty, [sid]: nd }, runs: { ...s.runs, [sid]: run },
      subjects: { ...s.subjects, [sid]: bump(s.subjects[sid]) },
      topics: { ...s.topics, [topic]: bump(s.topics[topic]) },
    };
  });
  return { xp, levelUp: levelInfo(state.xp).level > before, newDiff };
}
