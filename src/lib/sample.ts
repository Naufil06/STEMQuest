import { set, levelInfo, type GameState, type SubjectId } from "./game";
import { WORLDS } from "./rewards";

export interface Kid { name: string; level: number; xp: number; acc: number; streak: number; weekly: number; world: string; online: boolean }
const xpAt = (l: number) => Math.round(100 * (l - 1) + 12.5 * (l - 1) * (l - 2));
const K = (name: string, level: number, acc: number, streak: number, weekly: number, world: string, online: boolean): Kid => ({ name, level, xp: xpAt(level) + 40, acc, streak, weekly, world, online });
export const SAMPLE: Kid[] = [
  K("Ava Chen", 12, 91, 14, 820, "Sky City", true), K("Leo Martin", 9, 84, 6, 610, "Desert Empire", true),
  K("Mia Singh", 15, 88, 21, 990, "Space Frontier", false), K("Noah Khan", 7, 76, 3, 420, "Desert Empire", true),
  K("Zara Ali", 10, 93, 9, 700, "Sky City", false), K("Omar Hassan", 5, 69, 2, 300, "Ocean Kingdom", true),
  K("Lily Wong", 8, 81, 5, 540, "Desert Empire", false), K("Kai Tremblay", 4, 72, 1, 210, "Ocean Kingdom", true),
  K("Priya Patel", 11, 89, 11, 760, "Sky City", true), K("Ethan Brown", 3, 64, 0, 150, "Ocean Kingdom", false),
];
/** Known sample student, or a made-up (but stable) one for any typed name. */
export function kidByName(n: string): Kid {
  const f = SAMPLE.find((k) => k.name === n);
  if (f) return f;
  const h = [...n].reduce((a, c) => a + c.charCodeAt(0), 0), l = 1 + (h % 10);
  return K(n, l, 60 + (h % 35), h % 9, 100 + (h % 600), SAMPLE[h % 5].world, h % 2 === 0);
}
export const weekXp = (s: GameState, off = 0) =>
  Array.from({ length: 7 }, (_, i) => new Date(Date.now() - (i + off) * 864e5).toISOString().slice(0, 10)).reduce((a, d) => a + (s.history?.[d]?.xp ?? 0), 0);
export function meKid(s: GameState): Kid {
  const all = Object.values(s.subjects), n = all.reduce((a, x) => a + x.answered, 0), c = all.reduce((a, x) => a + x.correct, 0);
  const lv = levelInfo(s.xp).level;
  return { name: "Explorer (You)", level: lv, xp: s.xp, acc: n ? Math.round((c / n) * 100) : 0, streak: s.streak, weekly: weekXp(s), world: WORLDS.filter((w) => lv >= w.level && s.xp >= w.xp).pop()!.name, online: true };
}
export const addFriend = (n: string) => set((s) => ({ ...s, friends: [...new Set([...(s.friends ?? []), n])] }));
export const setDifficulty = (sid: SubjectId, d: number) => set((s) => ({ ...s, difficulty: { ...s.difficulty, [sid]: d }, recent: { ...s.recent, [sid]: [] } }));
