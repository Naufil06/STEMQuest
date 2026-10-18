// Tiny chiptune loops made with the Web Audio API (no audio files). One track per world, same order as WORLDS.
type Raw = { bpm: number; wave: OscillatorType; root: number; scale: number[]; melody: string; bass: string };
const MAJ = [0, 2, 4, 5, 7, 9, 11], PENT = [0, 2, 4, 7, 9], MIN = [0, 2, 3, 5, 7, 8, 10], LYD = [0, 2, 4, 6, 7, 9, 11], PHR = [0, 1, 4, 5, 7, 8, 10], MPENT = [0, 3, 5, 7, 10];
// melody = scale degrees, one per eighth note ("-" = rest); it repeats, rising 2 degrees every second time. bass = one degree per half bar.
const RAW: Raw[] = [
  { bpm: 112, wave: "triangle", root: 60, scale: PENT, melody: "0 2 4 - 7 4 2 - 4 7 9 7 4 2 0 -", bass: "0 2 3 2" },
  { bpm: 84, wave: "sine", root: 62, scale: MAJ, melody: "0 2 4 2 5 4 2 0 1 3 5 3 4 2 1 -", bass: "0 3 4 3" },
  { bpm: 104, wave: "square", root: 57, scale: PHR, melody: "0 1 2 1 0 - 4 3 2 1 2 3 4 - 2 -", bass: "0 0 4 3" },
  { bpm: 124, wave: "triangle", root: 67, scale: MAJ, melody: "4 2 4 5 7 5 4 2 0 2 4 7 9 7 4 -", bass: "0 4 3 4" },
  { bpm: 76, wave: "sine", root: 55, scale: LYD, melody: "0 - 4 - 6 - 4 - 2 - 4 - 7 - 4 -", bass: "0 2 3 2" },
  { bpm: 132, wave: "square", root: 52, scale: MIN, melody: "0 0 2 0 3 0 5 3 0 0 2 0 7 5 3 2", bass: "0 0 3 2" },
  { bpm: 100, wave: "triangle", root: 72, scale: PENT, melody: "0 4 2 4 7 4 2 4 0 4 2 4 9 7 4 2", bass: "0 2 1 2" },
  { bpm: 68, wave: "sine", root: 60, scale: MAJ, melody: "4 - 2 - 0 - 2 - 4 - 7 - 5 - 4 -", bass: "0 4 3 4" },
  { bpm: 140, wave: "sawtooth", root: 57, scale: MPENT, melody: "0 2 3 2 0 2 4 2 3 2 0 2 4 3 2 1", bass: "0 0 2 1" },
  { bpm: 118, wave: "triangle", root: 62, scale: PENT, melody: "0 4 2 4 7 9 7 4 2 4 0 - 2 4 7 -", bass: "0 2 1 2" },
  { bpm: 126, wave: "triangle", root: 72, scale: MAJ, melody: "0 2 4 5 4 2 0 - 4 5 7 5 4 2 4 -", bass: "0 3 4 3" },
  { bpm: 96, wave: "square", root: 53, scale: PHR, melody: "0 0 1 0 4 3 1 0 0 0 1 0 4 5 4 -", bass: "0 0 3 4" },
  { bpm: 108, wave: "square", root: 55, scale: MPENT, melody: "0 2 0 3 0 4 3 2 0 2 0 3 4 3 2 -", bass: "0 0 2 3" },
  { bpm: 120, wave: "triangle", root: 69, scale: MAJ, melody: "0 2 4 7 5 4 2 - 4 7 9 7 5 4 2 0", bass: "0 4 5 3" },
];
const TR = RAW.map((t) => ({ ...t, m: t.melody.split(" "), b: t.bass.split(" ") }));
let ctx: AudioContext | null = null, master: GainNode, timer = 0, cur = -1;
const hz = (m: number) => 440 * 2 ** ((m - 69) / 12);
const deg = (T: (typeof TR)[number], d: number) => { const n = T.scale.length; return T.root + T.scale[((d % n) + n) % n] + 12 * Math.floor(d / n); };
export const resumeMusic = () => { ctx?.resume(); };

function note(f: number, t: number, len: number, type: OscillatorType, vol: number) {
  const o = ctx!.createOscillator(), g = ctx!.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + len);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + len + 0.05);
}
function play(T: (typeof TR)[number], i: number, t: number, dur: number) {
  const tok = T.m[i % T.m.length], loop = Math.floor(i / T.m.length), vol = T.wave === "sine" || T.wave === "triangle" ? 0.5 : 0.2;
  if (tok !== "-") note(hz(deg(T, +tok + (loop % 2 ? 2 : 0))), t, dur * 1.7, T.wave, vol);
  if (i % 4 === 0) note(hz(deg(T, +T.b[(i / 4) % T.b.length]) - 12), t, dur * 3.6, "triangle", 0.55);
}
export function setMusic(on: boolean, world: number) {
  if (!on) { clearInterval(timer); timer = 0; cur = -1; return; }
  if (timer && cur === world) return;
  clearInterval(timer); cur = world;
  if (!ctx) { ctx = new AudioContext(); master = ctx.createGain(); master.gain.value = 0.15; master.connect(ctx.destination); }
  ctx.resume();
  const T = TR[world] ?? TR[0], dur = 60 / T.bpm / 2;
  let step = 0, next = ctx.currentTime + 0.15;
  timer = window.setInterval(() => { while (next < ctx!.currentTime + 0.35) { play(T, step, next, dur); next += dur; step++; } }, 80);
}
