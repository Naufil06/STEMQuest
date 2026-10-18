import { set, levelInfo, type GameState, type SubjectId } from "./game";
import { WORLDS, unlocked } from "./rewards";

export interface Kid { name: string; username?: string; level: number; xp: number; acc: number; streak: number; weekly: number; world: string; online: boolean }
export const weekXp = (s: GameState, off = 0) =>
  Array.from({ length: 7 }, (_, i) => new Date(Date.now() - (i + off) * 864e5).toISOString().slice(0, 10)).reduce((a, d) => a + (s.history?.[d]?.xp ?? 0), 0);
export function meKid(s: GameState): Kid {
  const all = Object.values(s.subjects), n = all.reduce((a, x) => a + x.answered, 0), c = all.reduce((a, x) => a + x.correct, 0);
  const lv = levelInfo(s.xp).level;
  return { name: "You", level: lv, xp: s.xp, acc: n ? Math.round((c / n) * 100) : 0, streak: s.streak, weekly: weekXp(s), world: WORLDS.filter((_, i) => unlocked(i, s)).pop()!.name, online: true };
}
export const addFriend = (n: string) => set((s) => ({ ...s, friends: [...new Set([...(s.friends ?? []), n])] }));
export const setDifficulty = (sid: SubjectId, d: number) => set((s) => ({ ...s, difficulty: { ...s.difficulty, [sid]: d }, recent: { ...s.recent, [sid]: [] } }));
