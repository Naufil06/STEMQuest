import { useSyncExternalStore } from "react";

export type SubjectId = "math" | "science" | "english" | "technology";
export const SUBJECTS: { id: SubjectId; emoji: string; color: string; topics: string[]; groups?: Record<string, string[]> }[] = [
  { id: "math", emoji: "🔢", color: "bg-math", topics: ["Addition", "Subtraction", "Multiplication", "Division", "Fractions", "Geometry", "Algebra"], groups: { Arithmetic: ["Addition", "Subtraction", "Multiplication", "Division"] } },
  { id: "science", emoji: "🔬", color: "bg-science", topics: ["Biology", "Chemistry", "Physics", "Earth Science"] },
  { id: "english", emoji: "📚", color: "bg-english", topics: ["Reading", "Grammar", "Vocabulary", "Writing"] },
  { id: "technology", emoji: "💻", color: "bg-tech", topics: ["Coding Basics", "Logic", "Digital Literacy"] },
];
export const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced", "Expert"];
export const DIFF_XP = [15, 25, 45, 75];
// [correct needed, out of last N answers] to move UP. Beginner/Intermediate take longest; XP still flows (higher base XP + streak bonus).
const PROMOTE: [number, number][] = [[10, 12], [10, 12], [6, 8]];
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
  unlockedWorlds: number[]; owned: string[]; equipped: Record<string, string>; history: Record<string, { n: number; ok: number; xp: number }>; friends: string[]; recent: Record<SubjectId, boolean[]>; world: number; seenWorld: number; music: boolean; claimed: string; tokens: number; cleared?: number[]; inv: Record<string, number>; farms: Record<number, Farm>;
}
const initial = (): GameState => ({
  xp: 0, coins: 0, streak: 0, lastDay: "",
  settings: { largeText: false, highContrast: false, dyslexia: false },
  difficulty: bySubject(() => 0), runs: bySubject(() => ({ ok: 0, bad: 0 })),
  subjects: bySubject(stat), topics: {}, unlockedWorlds: [0], owned: [], equipped: {}, history: {}, friends: [], recent: bySubject(() => [] as boolean[]), world: 0, seenWorld: 0, music: true, claimed: "", tokens: 3, inv: {}, farms: {},
});

let state = initial();   // the signed-in account's data (loaded/saved through src/lib/auth.ts)
let saver: (() => void) | null = null;
export const setSaver = (f: (() => void) | null) => { saver = f; };
export const getState = () => state;
export function loadState(o: Partial<GameState> | null) { state = { ...initial(), ...(o ?? {}) }; subs.forEach((f) => f()); }
const subs = new Set<() => void>();
export function set(fn: (s: GameState) => GameState) {
  state = fn(state);
  saver?.();
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
export function recordAnswer(sid: SubjectId, topic: string, d: number, ok: boolean, assisted = false) {
  const before = levelInfo(state.xp).level;
  const xp = ok ? Math.round((DIFF_XP[d] + Math.min(state.runs[sid].ok, 5) * 2) * (assisted ? 0.5 : 1)) : 2;   // help (simplify / solution) = half XP
  let newDiff = state.difficulty[sid];
  set((s) => {
    const r = s.runs[sid];
    let run = { ok: ok ? r.ok + 1 : 0, bad: ok ? 0 : r.bad + 1 };
    let nd = s.difficulty[sid];
    const win = assisted ? (s.recent?.[sid] ?? []) : [...(s.recent?.[sid] ?? []), ok].slice(-12);   // helped answers don't count towards moving up
    const [need, span] = PROMOTE[nd] ?? [99, 99];
    const last = win.slice(-span), end = win.slice(-4);
    let recent = win;
    if (nd < 3 && last.length >= span && last.filter(Boolean).length >= need) { nd++; recent = []; }
    else if (nd > 0 && end.length === 4 && end.filter(Boolean).length <= 1) { nd--; recent = []; }
    if (nd !== s.difficulty[sid]) run = { ok: 0, bad: 0 };
    newDiff = nd;
    const bump = (x: Stat = stat()): Stat => ({ answered: x.answered + 1, correct: x.correct + (ok ? 1 : 0) });
    const today = day(), yest = day(new Date(Date.now() - 864e5));
    const streak = s.lastDay === today ? s.streak : s.lastDay === yest ? s.streak + 1 : 1;
    const h = s.history?.[today] ?? { n: 0, ok: 0, xp: 0 };
    // +1 simplify token every 8 correct answers and on each level-up (max 10)
    const okTotal = Object.values(s.subjects).reduce((a, x) => a + x.correct, 0) + (ok ? 1 : 0);
    const tokens = Math.min(10, (s.tokens ?? 3) + (ok && okTotal % 8 === 0 ? 1 : 0) + (levelInfo(s.xp + xp).level > levelInfo(s.xp).level ? 1 : 0));
    return {
      ...s, tokens, history: { ...s.history, [today]: { n: h.n + 1, ok: h.ok + (ok ? 1 : 0), xp: h.xp + xp } }, xp: s.xp + xp, coins: s.coins + (ok ? Math.round(xp / 2) : 0), streak, lastDay: today,
      difficulty: { ...s.difficulty, [sid]: nd }, runs: { ...s.runs, [sid]: run }, recent: { ...s.recent, [sid]: recent },
      subjects: { ...s.subjects, [sid]: bump(s.subjects[sid]) },
      topics: { ...s.topics, [topic]: bump(s.topics[topic]) },
    };
  });
  return { xp, levelUp: levelInfo(state.xp).level > before, newDiff };
}

export function spendToken() {
  let ok = false;
  set((s) => { if ((s.tokens ?? 0) < 1) return s; ok = true; return { ...s, tokens: s.tokens - 1 }; });
  return ok;
}

export type Tile = { k: "c" | "b"; id: string; at: number };   // c = crop growing (at = planted), b = building (at = last income pick-up)
export interface Farm { city: boolean; tiles: Record<string, Tile> }
