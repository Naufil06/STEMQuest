import { set } from "./game";

export type Slot = "character" | "costume" | "hat" | "glasses" | "backpack" | "pet";
export const SLOTS: { id: Slot; label: string }[] = [
  { id: "character", label: "Hero" }, { id: "costume", label: "Costumes" }, { id: "hat", label: "Hats" },
  { id: "glasses", label: "Glasses" }, { id: "backpack", label: "Backpacks" }, { id: "pet", label: "Pets" },
];
export interface Item { id: string; slot: Slot; name: string; emoji: string; price: number }
const I = (slot: Slot, rows: [string, string, string, number][]): Item[] => rows.map(([id, name, emoji, price]) => ({ id, slot, name, emoji, price }));
// Costume ids must match the files in public/characters (boy-<id>.png / girl-<id>.png).
export const ITEMS: Item[] = [
  ...I("character", [["boy", "Boy", "", 0], ["girl", "Girl", "", 0]]),
  ...I("costume", [["school", "School Suit", "", 0], ["labcoat", "Scientist Lab Coat", "", 80], ["engineer", "Engineer Gear", "", 100], ["inventor", "Inventor Overalls", "", 100], ["hero", "Hero Suit", "", 130], ["astronaut", "Astronaut Suit", "", 150]]),
  ...I("hat", [["cap", "Explorer Cap", "", 40], ["grad", "Grad Cap", "", 60], ["tophat", "Top Hat", "", 80], ["crown", "Crown", "", 200]]),
  ...I("glasses", [["specs", "Smart Specs", "", 30], ["shades", "Cool Shades", "", 50], ["goggles", "Lab Goggles", "", 70]]),
  ...I("backpack", [["pack", "Adventure Pack", "", 50], ["chute", "Purple Pack", "", 120]]),
  ...I("pet", [["owl", "Owl", "🦉", 100], ["robotdog", "Robot Dog", "🐕", 150], ["spacecat", "Space Cat", "🐱", 200], ["dragon", "Dragon", "🐉", 350]]),
];
export const getItem = (id?: string) => ITEMS.find((i) => i.id === id);
export const isOwned = (owned: string[], id: string) => owned.includes(id) || getItem(id)?.price === 0;

export function buy(id: string) {
  const it = getItem(id);
  let ok = false;
  if (!it) return false;
  set((s) => {
    if (isOwned(s.owned, id) || s.coins < it.price) return s;
    ok = true;
    return { ...s, coins: s.coins - it.price, owned: [...s.owned, id], equipped: { ...s.equipped, [it.slot]: id } };
  });
  return ok;
}
export const equip = (slot: Slot, id: string | null) =>
  set((s) => {
    const eq = { ...s.equipped };
    if (id) eq[slot] = id; else delete eq[slot];
    return { ...s, equipped: eq };
  });

export const WORLDS = [
  { id: 0, name: "Forest Realm", emoji: "🌲", level: 1, xp: 0, c1: "#22c55e", c2: "#15803d", blurb: "Where every adventure begins." },
  { id: 1, name: "Ocean Kingdom", emoji: "🌊", level: 3, xp: 300, c1: "#38bdf8", c2: "#1d4ed8", blurb: "Dive into coral cities." },
  { id: 2, name: "Desert Empire", emoji: "🏜️", level: 6, xp: 800, c1: "#fbbf24", c2: "#ea580c", blurb: "Solve riddles of the pyramids." },
  { id: 3, name: "Sky City", emoji: "☁️", level: 10, xp: 1800, c1: "#a5b4fc", c2: "#6366f1", blurb: "Float among the clouds." },
  { id: 4, name: "Space Frontier", emoji: "🚀", level: 15, xp: 3500, c1: "#7c3aed", c2: "#1e1b4b", blurb: "Explore distant galaxies." },
  { id: 5, name: "Volcano Core", emoji: "🌋", level: 20, xp: 6000, c1: "#ef4444", c2: "#7f1d1d", blurb: "The ultimate challenge." },
];
