import type { Question } from "./questions";

// Difficulty = grade band:  0 Beginner = K-2 · 1 Intermediate = 3-4 · 2 Advanced = 5-6 · 3 Expert = 7-9 (algebra lives here only)
// To add a question type: add a branch to the topic function below. Each returns [question, answer, optionalMultipleChoiceOptions].
const r = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const pick = <T,>(x: T[]) => x[r(0, x.length - 1)];
const shuffle = <T,>(x: T[]) => [...x].sort(() => Math.random() - 0.5);
const n2 = (x: number) => String(+x.toFixed(2));
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const NAMES = ["Mia", "Leo", "Ava", "Sam", "Zoe", "Omar", "Priya", "Kai"];
const THINGS = ["apples", "stickers", "marbles", "books", "cookies", "pencils"];
const M = "−", SUP = "⁰¹²³⁴";
type G = [string, string, string[]?];
const half = () => Math.random() < 0.5;

const add = (d: number): G => {
  if (d === 0) { const a = r(2, 12), b = r(2, 9); return half() ? [`${a} + ${b} = ?`, `${a + b}`] : [`${pick(NAMES)} has ${a} ${pick(THINGS)} and gets ${b} more. How many now?`, `${a + b}`]; }
  if (d === 1) { const a = r(120, 800), b = r(100, 990 - a); return half() ? [`${a} + ${b} = ?`, `${a + b}`] : [`A school has ${a} boys and ${b} girls. How many students in all?`, `${a + b}`]; }
  if (d === 2) { if (half()) { const a = r(1000, 9999), b = r(1000, 9999); return [`${a} + ${b} = ?`, `${a + b}`]; } const a = r(101, 999) / 100, b = r(101, 999) / 100; return [`${a.toFixed(2)} + ${b.toFixed(2)} = ?`, n2(a + b)]; }
  const a = r(-30, 30), b = r(-30, -1); return [`${a} + (${b}) = ?`, `${a + b}`];
};
const sub = (d: number): G => {
  if (d === 0) { const a = r(6, 20), b = r(1, a - 1); return half() ? [`${a} ${M} ${b} = ?`, `${a - b}`] : [`${pick(NAMES)} had ${a} ${pick(THINGS)} and gave away ${b}. How many are left?`, `${a - b}`]; }
  if (d === 1) { const a = r(300, 999), b = r(100, a - 50); return half() ? [`${a} ${M} ${b} = ?`, `${a - b}`] : [`A library had ${a} books and lent out ${b}. How many are left?`, `${a - b}`]; }
  if (d === 2) { if (half()) { const a = r(5000, 19999), b = r(1000, a - 500); return [`${a} ${M} ${b} = ?`, `${a - b}`]; } const ai = r(500, 999), a = ai / 100, b = r(100, ai - 50) / 100; return [`${a.toFixed(2)} ${M} ${b.toFixed(2)} = ?`, n2(a - b)]; }
  const a = r(-20, 20), b = r(-20, -1); return [`${a} ${M} (${b}) = ?`, `${a - b}`];
};
const mul = (d: number): G => {
  if (d === 0) { const a = pick([2, 5, 10]), b = r(1, 10); return half() ? [`${a} × ${b} = ?`, `${a * b}`] : [`There are ${b} bags with ${a} ${pick(THINGS)} in each. How many in all?`, `${a * b}`]; }
  if (d === 1) { if (Math.random() < 0.6) { const a = r(2, 10), b = r(2, 10); return [`${a} × ${b} = ?`, `${a * b}`]; } const a = r(11, 60), b = r(2, 9); return [`${a} × ${b} = ?`, `${a * b}`]; }
  if (d === 2) { if (Math.random() < 0.6) { const a = r(12, 35), b = r(11, 25); return [`${a} × ${b} = ?`, `${a * b}`]; } const a = r(11, 99) / 10; return [`${a} × 10 = ?`, n2(a * 10)]; }
  if (half()) { const b = r(2, 5), e = r(2, 4); return [`${b}${SUP[e]} = ?`, `${b ** e}`]; }
  const a = r(2, 12), b = r(2, 12); return [`(-${a}) × ${b} = ?`, `${-a * b}`];
};
const div = (d: number): G => {
  if (d === 0) { const b = pick([2, 5, 10]), a = r(1, 10); return half() ? [`${a * b} ÷ ${b} = ?`, `${a}`] : [`${pick(NAMES)} shares ${a * b} ${pick(THINGS)} equally among ${b} friends. How many does each get?`, `${a}`]; }
  if (d === 1) { const a = r(2, 10), b = r(2, 10); return half() ? [`${a * b} ÷ ${b} = ?`, `${a}`] : [`${a * b} ${pick(THINGS)} are packed ${b} to a box. How many boxes?`, `${a}`]; }
  if (d === 2) { const b = r(3, 9); if (half()) { const a = r(12, 120); return [`${a * b} ÷ ${b} = ?`, `${a}`]; } const n = r(20, 99); return [`What is the remainder when ${n} is divided by ${b}?`, `${n % b}`]; }
  if (half()) { const b = r(12, 25), a = r(12, 60); return [`${a * b} ÷ ${b} = ?`, `${a}`]; }
  const b = r(2, 12), a = r(2, 12); return [`${-a * b} ÷ ${b} = ?`, `${-a}`];
};
const PAIRS = [[1, 2], [1, 3], [2, 3], [3, 4], [2, 5], [3, 5], [1, 4], [5, 6]];
const frac = (d: number): G => {
  if (d === 0) { const k = r(1, 10); return half() ? [`What is half of ${2 * k}?`, `${k}`] : [`What is a quarter of ${4 * k}?`, `${k}`]; }
  if (d === 1) {
    const t = r(0, 2);
    if (t === 0) { const n = r(2, 10), k = r(2, 9); return [`What is 1/${n} of ${n * k}?`, `${k}`]; }
    if (t === 1) { const a = r(2, 6), b = a + r(1, 4); return [`Which fraction is bigger: 1/${a} or 1/${b}?`, `1/${a}`, [`1/${a}`, `1/${b}`]]; }
    const m = r(2, 6); return [`1/2 = ?/${2 * m}`, `${m}`];
  }
  if (d === 2) {
    if (half()) { const n = pick([5, 7, 11, 13]), a = r(1, n - 3), b = r(1, n - 1 - a); return [`${a}/${n} + ${b}/${n} = ?`, `${a + b}/${n}`, [`${a + b}/${n}`, `${a + b}/${2 * n}`, `${a + b + 1}/${n}`, `${Math.abs(a - b)}/${n}`]]; }
    const [k, m] = pick(PAIRS), f = pick([2, 3, 4]); return [`Simplify ${k * f}/${m * f}`, `${k}/${m}`, [`${k}/${m}`, `${m}/${k}`, `${k + 1}/${m}`, `${k}/${m + 1}`]];
  }
  if (half()) { const p = pick([10, 20, 25, 50, 75]), base = pick([40, 60, 80, 120, 200]); return [`What is ${p}% of ${base}?`, n2((p * base) / 100)]; }
  const a = r(1, 4), b = r(a + 1, 6), c = r(1, 4), e = r(c + 1, 6), g = gcd(a * c, b * e), ans = `${(a * c) / g}/${(b * e) / g}`;
  return [`${a}/${b} × ${c}/${e} = ?`, ans, [ans, `${a + c}/${b + e}`, `${a * c}/${b + e}`, `${b * e}/${a * c}`]];
};
const geo = (d: number): G => {
  if (d === 0) return pick<G>([["How many sides does a triangle have?", "3"], ["How many sides does a square have?", "4"], ["How many sides does a pentagon have?", "5"], ["How many sides does a hexagon have?", "6"], ["How many corners does a rectangle have?", "4"]]);
  if (d === 1) { const w = r(2, 12), h = r(2, 9); return half() ? [`A rectangle is ${w} cm long and ${h} cm wide. What is its perimeter in cm?`, `${2 * (w + h)}`] : [`A rectangle is ${w} cm long and ${h} cm wide. What is its area in cm²?`, `${w * h}`]; }
  if (d === 2) { if (half()) { const b = 2 * r(3, 10), h = r(3, 12); return [`A triangle has base ${b} cm and height ${h} cm. What is its area in cm²?`, `${(b * h) / 2}`]; } const x = r(30, 80), y = r(30, 80); return [`Two angles of a triangle are ${x}° and ${y}°. What is the third angle in degrees?`, `${180 - x - y}`]; }
  if (half()) { const [a, b, c] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]]); return [`A right triangle has legs ${a} and ${b}. How long is the hypotenuse?`, `${c}`]; }
  const rad = r(2, 10); return [`A circle has radius ${rad}. What is its area? (use π ≈ 3.14)`, n2(3.14 * rad * rad)];
};
const alg = (): G => {  // Expert only (grades 7-9)
  const t = r(0, 3);
  if (t === 0) { const x = r(2, 15), c = r(2, 9), b = r(1, 20); return [`Solve for x: ${c}x + ${b} = ${c * x + b}`, `${x}`]; }
  if (t === 1) { const v = r(2, 12), k = r(2, 9); return [`Solve for x: x ÷ ${k} = ${v}`, `${v * k}`]; }
  if (t === 2) { const x = r(3, 12), c = r(2, 5), a = r(1, x - 1); return [`Solve for x: ${c}(x ${M} ${a}) = ${c * (x - a)}`, `${x}`]; }
  const x = r(2, 12), q = r(1, 4), p = q + r(1, 4), b = r(1, 20); return [`Solve for x: ${p}x + ${b} = ${q}x + ${(p - q) * x + b}`, `${x}`];
};

const GEN: Record<string, (d: number) => G> = { Addition: add, Subtraction: sub, Multiplication: mul, Division: div, Fractions: frac, Geometry: geo, Algebra: () => alg() };
const MIX = ["Addition", "Subtraction", "Multiplication", "Division", "Fractions", "Geometry"];

function choices(g: G): string[] | undefined {
  const a = g[1];
  if (g[2]) return shuffle([...new Set([a, ...g[2]])]).slice(0, 4);
  const x = parseFloat(a);
  const ks = Number.isInteger(x) ? [1, -1, 10, -10, 2, -2] : [1, -1, 0.1, -0.1, 0.01, -0.01, 10, -10];
  const wrong = [...new Set(ks.map((k) => n2(x + k)))].filter((v) => v !== a && (x < 0 || parseFloat(v) >= 0));
  return shuffle([a, ...shuffle(wrong).slice(0, 3)]);
}

export function mathQuestion(topic: string | undefined, d: number, seen: Set<string>): Question {
  const fixed = topic && GEN[topic] && !(topic === "Algebra" && d < 3) ? topic : undefined;
  let tp = "", g: G = ["", ""];
  for (let i = 0; i < 20; i++) {
    tp = fixed ?? pick(d === 3 ? [...MIX, "Algebra", "Algebra"] : MIX);
    g = GEN[tp](d);
    if (!seen.has(`m-${g[0]}`)) break;
  }
  return { id: `m-${g[0]}`, q: g[0], a: g[1], options: Math.random() < (d === 0 ? 0.75 : 0.5) ? choices(g) : undefined, topic: tp, d };
}
