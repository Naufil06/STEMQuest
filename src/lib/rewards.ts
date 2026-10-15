import { set, levelInfo } from "./game";

export type Slot = "character" | "costume" | "hat" | "glasses" | "pet";
export const SLOTS: { id: Slot; label: string }[] = [
  { id: "character", label: "Hero" }, { id: "costume", label: "Costumes" }, { id: "hat", label: "Hats" },
  { id: "glasses", label: "Glasses" }, { id: "pet", label: "Pets" },
];
export type Lock = { world?: number; level?: number };   // world = 0-based index into WORLDS
export interface Item { id: string; slot: Slot; name: string; emoji: string; price: number; lock?: Lock }
const I = (slot: Slot, rows: [string, string, string, number, Lock?][]): Item[] => rows.map(([id, name, emoji, price, lock]) => ({ id, slot, name, emoji, price, lock }));

// Costume ids = files in public/characters (boy-<id>.png / girl-<id>.png). More complex art costs more; some are locked behind worlds/levels.
export const ITEMS: Item[] = [
  ...I("character", [["boy", "Boy", "", 0], ["girl", "Girl", "", 0]]),
  ...I("costume", [
    ["school", "School Suit", "", 0], ["labcoat", "Scientist Lab Coat", "", 80], ["engineer", "Engineer Gear", "", 100], ["inventor", "Inventor Overalls", "", 100], ["hero", "Hero Suit", "", 130], ["astronaut", "Astronaut Suit", "", 150],
    ["fieldscholar", "Field Scholar", "", 200], ["forestfield", "Forest Field Scholar", "", 250], ["royalfield", "Royal Field Scholar", "", 250],
    ["trench", "Drone Trench Coat", "", 350], ["sprout", "Forest Sprout Suit", "", 400], ["cybervisor", "Cyber Visor Suit", "", 400], ["inferno", "Inferno Cyber Suit", "", 450], ["emerald", "Emerald Cyber Suit", "", 450],
    ["aviator", "Mech-Arm Aviator", "", 450], ["icegoggles", "Frost Goggles Suit", "", 450], ["embergoggles", "Ember Goggles Suit", "", 500], ["junglegoggles", "Jungle Goggles Suit", "", 500],
    ["frostranger", "Frost Ranger", "", 500], ["runescholar", "Rune Scholar", "", 500], ["crimsonrune", "Crimson Rune Scholar", "", 550], ["goldranger", "Gold Ranger", "", 600],
    ["ecoguardian", "Eco Guardian", "", 600, { world: 3 }], ["volcanoranger", "Volcano Ranger", "", 650, { world: 3 }], ["steampunk", "Steampunk Inventor", "", 650, { world: 3 }],
    ["deepspace", "Deep Space Suit", "", 700, { world: 4 }], ["crimsonspace", "Crimson Deep Space", "", 750, { world: 4 }], ["emeraldspace", "Emerald Deep Space", "", 750, { world: 4 }],
    ["wizard", "Arcane Wizard", "", 800, { world: 4 }], ["galaxy", "Galaxy Suit", "", 900, { world: 4 }],
    ["nebula", "Nebula Fire Suit", "", 1000, { world: 5 }], ["plasma", "Plasma Armor", "", 1000, { world: 5 }], ["solarplasma", "Solar Plasma Armor", "", 1100, { world: 5 }],
    ["toxicplasma", "Toxic Plasma Armor", "", 1100, { world: 5 }], ["aurora", "Aurora Suit", "", 1000, { level: 25 }],
  ]),
  ...I("hat", [["cap", "Explorer Cap", "", 40], ["hardhat", "Hard Hat", "", 60], ["grad", "Grad Cap", "", 60], ["tophat", "Top Hat", "", 80], ["wizard", "Wizard Hat", "", 150], ["crown", "Crown", "", 200]]),
  ...I("glasses", [["specs", "Smart Specs", "", 30], ["shades", "Cool Shades", "", 50], ["round", "Retro Round Shades", "", 70], ["goggles", "Lab Goggles", "", 70], ["aviator", "Aviator Shades", "", 90], ["heart", "Heart Shades", "", 100], ["star", "Star Shades", "", 120], ["visor", "Cyber Visor", "", 200, { world: 4 }]]),
  ...I("pet", [
    ["puppy", "Puppy", "🐶", 60], ["kitten", "Kitten", "🐱", 60], ["bee", "Busy Bee", "🐝", 70], ["bunny", "Bunny", "🐰", 80], ["frog", "Frog", "🐸", 80], ["butterfly", "Butterfly", "🦋", 90],
    ["owl", "Owl", "🦉", 100], ["turtle", "Turtle", "🐢", 100], ["fox", "Fox", "🦊", 120], ["parrot", "Parrot", "🦜", 130], ["panda", "Panda", "🐼", 150], ["robotdog", "Robot Dog", "🐕", 150],
    ["penguin", "Penguin", "🐧", 180, { world: 7 }], ["octopus", "Octopus", "🐙", 200, { world: 1 }], ["spacecat", "Space Cat", "🐈", 200, { world: 4 }], ["dolphin", "Dolphin", "🐬", 220, { world: 1 }],
    ["eagle", "Eagle", "🦅", 250, { world: 3 }], ["trex", "T-Rex", "🦖", 300, { world: 2 }], ["unicorn", "Unicorn", "🦄", 300], ["dragon", "Dragon", "🐉", 350, { world: 5 }],
  ]),
];
export const getItem = (id?: string) => ITEMS.find((i) => i.id === id);
export const isOwned = (owned: string[], id: string) => owned.includes(id) || getItem(id)?.price === 0;

// key = theme name used by src/worlds.css (html[data-world="..."]) and the music track index = position in this list
export const WORLDS = [
  { id: 0, key: "forest", name: "Forest Realm", emoji: "🌲", level: 1, xp: 0, c1: "#22c55e", c2: "#15803d", blurb: "Find the lost compass hidden in the Whispering Woods." },
  { id: 1, key: "ocean", name: "Ocean Kingdom", emoji: "🌊", level: 3, xp: 300, c1: "#38bdf8", c2: "#1d4ed8", blurb: "Dive down and collect the pearls of wisdom from the coral palace." },
  { id: 2, key: "desert", name: "Desert Empire", emoji: "🏜️", level: 6, xp: 800, c1: "#fbbf24", c2: "#ea580c", blurb: "Crack the riddles of the Sun Pyramid." },
  { id: 3, key: "sky", name: "Sky City", emoji: "☁️", level: 10, xp: 1800, c1: "#a5b4fc", c2: "#6366f1", blurb: "Climb the cloud towers and fix the weather machine." },
  { id: 4, key: "space", name: "Space Frontier", emoji: "🚀", level: 15, xp: 3500, c1: "#7c3aed", c2: "#1e1b4b", blurb: "Fly to the space station and rescue the stranded robots." },
  { id: 5, key: "volcano", name: "Volcano Core", emoji: "🌋", level: 20, xp: 6000, c1: "#ef4444", c2: "#7f1d1d", blurb: "Cool the volcano by solving the Lava Locks." },
  { id: 6, key: "crystal", name: "Crystal Caves", emoji: "💎", level: 25, xp: 9500, c1: "#e879f9", c2: "#7e22ce", blurb: "Light up the caves with the glowing crystals of logic." },
  { id: 7, key: "arctic", name: "Arctic Tundra", emoji: "❄️", level: 30, xp: 13500, c1: "#67e8f9", c2: "#0e7490", blurb: "Follow the aurora to the Ice Lab at the top of the world." },
  { id: 8, key: "cyber", name: "Cyber City", emoji: "🤖", level: 40, xp: 23000, c1: "#22d3ee", c2: "#c026d3", blurb: "Reboot the city's giant computer. This is the final mission!" },
];
export const worldOpen = (i: number, xp: number) => levelInfo(xp).level >= WORLDS[i].level && xp >= WORLDS[i].xp;
export const topWorld = (xp: number) => WORLDS.reduce((a, _w, i) => (worldOpen(i, xp) ? i : a), 0);
export function lockText(i: Item, xp: number): string | null {
  const L = i.lock;
  if (!L) return null;
  if (L.world !== undefined && !worldOpen(L.world, xp)) return `World ${L.world + 1}: ${WORLDS[L.world].name}`;
  if (L.level && levelInfo(xp).level < L.level) return `Level ${L.level}`;
  return null;
}

export function buy(id: string) {
  const it = getItem(id);
  let ok = false;
  if (!it) return false;
  set((s) => {
    if (isOwned(s.owned, id) || s.coins < it.price || lockText(it, s.xp)) return s;
    ok = true;
    return { ...s, coins: s.coins - it.price, owned: [...s.owned, id], equipped: { ...s.equipped, [it.slot]: id } };
  });
  return ok;
}
export const equip = (slot: Slot, id: string | null) =>
  set((s) => { const eq = { ...s.equipped }; if (id) eq[slot] = id; else delete eq[slot]; return { ...s, equipped: eq }; });
export const travel = (i: number) => set((s) => ({ ...s, world: i, seenWorld: Math.max(s.seenWorld ?? 0, i) }));
export const seeWorld = (i: number) => set((s) => ({ ...s, seenWorld: Math.max(s.seenWorld ?? 0, i) }));
export const toggleMusic = () => set((s) => ({ ...s, music: s.music === false }));
export const claimDaily = () => { const d = new Date().toISOString().slice(0, 10); set((s) => (s.claimed === d ? s : { ...s, coins: s.coins + 50, claimed: d })); };
