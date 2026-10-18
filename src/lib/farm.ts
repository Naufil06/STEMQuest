import { set, type GameState } from "./game";
import type { Loot } from "./platformer";

// Each world has its own farm (and a mini city after an upgrade). Seeds come from the platformer; the farm turns them into crops and coins.
const P = (s: string): [string, string][] => s.split(",").map((x) => { const t = x.trim(), i = t.indexOf(" "); return [t.slice(0, i), t.slice(i + 1)]; });
// farm name, city name, soil colour, enemy emoji, 3 seeds, 3 farm buildings, 3 city buildings   (same order as WORLDS)
const DATA: [string, string, string, string, string, string, string][] = [
  ["Forest Farm", "Woodland Village", "#8a5a3a", "🐌", "🥕 Carrot,🍄 Mushroom,🍓 Berry", "🌳 Oak Tree,🐝 Beehive,🏡 Barn", "🏠 Treehouse,🛒 Market,⛲ Fountain"],
  ["Coral Farm", "Atlantis Town", "#d9c38a", "🦀", "🌿 Kelp,🪸 Coral,🦪 Oyster", "🐠 Fish Tank,⚓ Dock,🏝️ Sand Island", "🏰 Sea Castle,🗼 Lighthouse,🚢 Harbor"],
  ["Oasis Farm", "Sun Pyramid City", "#e0b45f", "🦂", "🌵 Cactus,🌴 Date Palm,🍉 Melon", "🐪 Camel Pen,⛺ Tent,🏺 Water Jar", "🔺 Pyramid,🏛️ Museum,🛍️ Bazaar"],
  ["Cloud Garden", "Cloud Metropolis", "#c9d6ff", "🦅", "🌸 Sky Blossom,🍇 Sky Grape,☁️ Cotton Cloud", "🎈 Balloon Stand,🪁 Kite Tower,🕊️ Dove Loft", "🏙️ Sky Tower,✈️ Airport,🎡 Ferris Wheel"],
  ["Moon Garden", "Moon Colony", "#9aa0b5", "👾", "🌱 Moon Sprout,🥦 Alien Broccoli,🍈 Star Melon", "🛰️ Satellite,🔭 Telescope,🛸 Landing Pad", "🚀 Rocket Port,🏢 Dome City,🤖 Robot Factory"],
  ["Lava Farm", "Magma City", "#4a2a2a", "🔥", "🌶️ Fire Pepper,🍅 Lava Tomato,🌺 Ember Bloom", "⛏️ Mine,🪨 Rock Garden,🔥 Forge", "🏭 Foundry,🏯 Fire Fort,🛡️ Armory"],
  ["Crystal Garden", "Gem City", "#a58cd6", "🦇", "💎 Gem Bud,🔮 Glow Berry,🌺 Prism Flower", "🕯️ Glow Lamp,🔔 Crystal Bell,🏔️ Cave Hut", "🏰 Gem Palace,🔬 Crystal Lab,🛍️ Gem Shop"],
  ["Ice Farm", "Frost City", "#dbeaf5", "🐺", "🫐 Blueberry,🥬 Ice Lettuce,🍒 Frost Cherry", "⛄ Snowman,🛷 Sled Stop,🛖 Igloo", "🔬 Ice Lab,🚂 Snow Train,🏨 Ice Hotel"],
  ["Data Farm", "Neon City", "#2b3a67", "🤖", "💾 Data Seed,🔌 Wire Sprout,💡 Bulb Bloom", "📡 Antenna,🖥️ Terminal,🔋 Battery", "🏙️ Neon Tower,🛰️ Data Hub,🎮 Arcade"],
  ["Jungle Farm", "Treetop City", "#6b4a2b", "🐍", "🍌 Banana,🥥 Coconut,🍍 Pineapple", "🦜 Parrot Perch,🛖 Hut,🌴 Palm Tree", "🌉 Canopy Bridge,🏨 Lodge,🎪 Jungle Fair"],
  ["Candy Farm", "Sugar Town", "#f3b6d1", "🐛", "🍭 Lollipop,🍬 Gumdrop,🍫 Choco Bean", "🎂 Cake Stand,🍩 Donut Shop,🎠 Carousel", "🏰 Candy Castle,🎡 Sugar Wheel,🏪 Sweet Mart"],
  ["Fern Farm", "Dino City", "#a07b4f", "🦖", "🌿 Fern,🍄 Giant Mushroom,🌴 Cycad", "🦴 Fossil Dig,🦕 Dino Pen,🌋 Mini Volcano", "🏛️ Dino Museum,🏟️ Arena,🛖 Cave Homes"],
  ["Gear Farm", "Steam City", "#8c7a62", "🪲", "⚙️ Gear Seed,🔩 Bolt Bean,🕰️ Clock Flower", "🔧 Workshop,🚂 Steam Train,🔭 Observatory", "🏭 Steam Factory,🕰️ Clock Tower,✈️ Airship Dock"],
  ["Rainbow Garden", "Aurora City", "#f2d6ff", "☁️", "🌈 Rainbow Bean,⭐ Star Fruit,🌻 Sun Bloom", "🦄 Unicorn Stable,🎠 Dream Carousel,🏔️ Summit Hut", "🏰 Rainbow Castle,🎆 Firework Hall,🌟 Star Tower"],
];
export interface FItem { id: string; emoji: string; name: string; cost: number; income: number; grow: number; sell: number }
export function farmOf(w: number) {
  const [farmName, cityName, soil, foe, se, fa, ci] = DATA[w], k = 1 + w * 0.3, kb = 1 + w * 0.25;
  const seeds: FItem[] = P(se).map(([emoji, name], j) => ({ id: `s${w}_${j}`, emoji, name, cost: Math.round([8, 15, 30][j] * k), income: 0, grow: [30, 60, 120][j], sell: Math.round([6, 12, 25][j] * k) }));
  const mk = (list: string, pre: string, base: number, inc: number[]): FItem[] => P(list).map(([emoji, name], j) => ({ id: `${pre}${w}_${j}`, emoji, name, cost: Math.round(base * (j + 1) * kb), income: inc[j], grow: 0, sell: 0 }));
  return { farmName, cityName, soil, foe, seeds, farmItems: mk(fa, "f", 50, [0, 1, 2]), cityItems: mk(ci, "y", 250, [3, 6, 10]), upgrade: 300 * (w + 1) };
}
export const itemById = (id: string): FItem | undefined => { const F = farmOf(+id.slice(1).split("_")[0]); return [...F.seeds, ...F.farmItems, ...F.cityItems].find((x) => x.id === id); };
export const cropSeed = (cropId: string) => itemById("s" + cropId.slice(1))!;   // crop "c3_1" grows from seed "s3_1"

const get = (s: GameState, w: number) => s.farms?.[w] ?? { city: false, tiles: {} };
const put = (s: GameState, w: number, f: ReturnType<typeof get>, extra: Partial<GameState> = {}): GameState => ({ ...s, ...extra, farms: { ...s.farms, [w]: f } });
const inv = (s: GameState, id: string, n: number) => ({ ...s.inv, [id]: Math.max(0, (s.inv?.[id] ?? 0) + n) });

export const plant = (w: number, key: string, id: string) => set((s) => { const f = get(s, w); if ((s.inv?.[id] ?? 0) < 1 || f.tiles[key]) return s; return put(s, w, { ...f, tiles: { ...f.tiles, [key]: { k: "c", id, at: Date.now() } } }, { inv: inv(s, id, -1) }); });
export const harvest = (w: number, key: string) => set((s) => {
  const f = get(s, w), t = f.tiles[key];
  if (t?.k !== "c" || Date.now() - t.at < itemById(t.id)!.grow * 1000) return s;
  const rest = { ...f.tiles }; delete rest[key];
  const crop = "c" + t.id.slice(1), bonus = Math.random() < 0.35;      // 35%: the plant drops a seed back
  return put(s, w, { ...f, tiles: rest }, { inv: inv({ ...s, inv: inv(s, crop, 1) }, t.id, bonus ? 1 : 0) });
});
export const build = (w: number, key: string, id: string) => set((s) => {
  const f = get(s, w), it = itemById(id);
  if (!it || f.tiles[key] || s.coins < it.cost || (id[0] === "y" && !f.city)) return s;
  return put(s, w, { ...f, tiles: { ...f.tiles, [key]: { k: "b", id, at: Date.now() } } }, { coins: s.coins - it.cost });
});
export const bulldoze = (w: number, key: string) => set((s) => { const f = get(s, w), rest = { ...f.tiles }; delete rest[key]; return put(s, w, { ...f, tiles: rest }); });
export const upgradeCity = (w: number) => set((s) => { const f = get(s, w), c = farmOf(w).upgrade; return f.city || s.coins < c ? s : put(s, w, { ...f, city: true }, { coins: s.coins - c }); });
export const buySeed = (id: string) => set((s) => { const c = itemById(id)!.cost; return s.coins < c ? s : { ...s, coins: s.coins - c, inv: inv(s, id, 1) }; });
export const sellCrop = (id: string, n: number) => set((s) => { const have = Math.min(n, s.inv?.[id] ?? 0); return have < 1 ? s : { ...s, coins: s.coins + have * cropSeed(id).sell, inv: inv(s, id, -have) }; });
export function pending(s: GameState, w: number, now = Date.now()) {
  return Math.floor(Object.values(get(s, w).tiles).reduce((a, t) => (t.k === "b" ? a + itemById(t.id)!.income * Math.min(30, (now - t.at) / 60000) : a), 0));   // buildings earn for up to 30 min
}
export const collect = (w: number) => set((s) => {
  const f = get(s, w), n = pending(s, w), now = Date.now(), tiles = Object.fromEntries(Object.entries(f.tiles).map(([k, t]) => [k, t.k === "b" ? { ...t, at: now } : t]));
  return n < 1 ? s : put(s, w, { ...f, tiles }, { coins: s.coins + n });
});
/** Called when a platformer level is finished: pays out what the pet collected and unlocks the world. */
export const completeLevel = (w: number, l: Loot) => set((s) => {
  let i = { ...s.inv };
  l.seeds.forEach((n, j) => { i[`s${w}_${j}`] = (i[`s${w}_${j}`] ?? 0) + n; });
  l.crops.forEach((n, j) => { i[`c${w}_${j}`] = (i[`c${w}_${j}`] ?? 0) + n; });
  return { ...s, coins: s.coins + l.coins * 2 + 20 * (w + 1), inv: i, cleared: [...new Set([...(s.cleared ?? [0]), w])] };
});
