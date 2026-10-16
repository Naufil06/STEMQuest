import type { Question } from "./questions";

// Difficulty = grade band: 0 Beginner K-2 · 1 Intermediate 3-4 · 2 Advanced 5-6 · 3 Expert 7-9 (algebra lives here only).
// Each topic function returns a G: question, answer, and optionally multiple-choice options, solution steps, an exact-match flag,
// and `easy` (what the Simplify button turns the question into). Add new question types by adding a branch below.
const r = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const pick = <T,>(x: T[]) => x[r(0, x.length - 1)];
const shuffle = <T,>(x: T[]) => [...x].sort(() => Math.random() - 0.5);
const n2 = (x: number) => String(+x.toFixed(2));
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const NAMES = ["Mia", "Leo", "Ava", "Sam", "Zoe", "Omar", "Priya", "Kai"];
const THINGS = ["apples", "stickers", "marbles", "books", "cookies", "pencils"];
const M = "−", SUP = "⁰¹²³⁴";
const half = () => Math.random() < 0.5;
interface G { q: string; a: string; opts?: string[]; steps?: string[]; easy?: () => G; exact?: boolean }
const g = (q: string, a: string, x: Partial<G> = {}): G => ({ q, a, ...x });
const fr = (n: number, d: number) => `${n}/${d}`;
const F = (n: number, d: number) => { const k = gcd(Math.abs(n), d) || 1; return d / k === 1 ? `${n / k}` : fr(n / k, d / k); };   // reduced fraction
const lead = (n: number) => Math.max(2, +String(n)[0]);                                           // 25 -> 2
const trunc = (n: number) => (n >= 1000 ? Math.floor(n / 100) : n >= 100 ? Math.floor(n / 10) : n >= 20 ? Math.floor(n / 10) * 10 : n);   // 10781 -> 107
const halve = (x: number) => Math.round(x * 2) / 2;                                              // 4.87 -> 5

const add = (d: number): G => {
  if (d === 0) { const a = r(2, 12), b = r(2, 9); return half() ? g(`${a} + ${b} = ?`, `${a + b}`) : g(`${pick(NAMES)} has ${a} ${pick(THINGS)} and gets ${b} more. How many now?`, `${a + b}`); }
  if (d === 1) { const a = r(120, 800), b = r(100, 990 - a), ta = trunc(a), tb = trunc(b), easy = () => g(`${ta} + ${tb} = ?`, `${ta + tb}`); return half() ? g(`${a} + ${b} = ?`, `${a + b}`, { easy }) : g(`A school has ${a} boys and ${b} girls. How many students in all?`, `${a + b}`, { easy }); }
  if (d === 2) {
    if (half()) { const a = r(1000, 9999), b = r(1000, 9999), ta = trunc(a), tb = trunc(b); return g(`${a} + ${b} = ?`, `${a + b}`, { easy: () => g(`${ta} + ${tb} = ?`, `${ta + tb}`) }); }
    const a = r(101, 999) / 100, b = r(101, 999) / 100, ha = halve(a), hb = halve(b);
    return g(`${a.toFixed(2)} + ${b.toFixed(2)} = ?`, n2(a + b), { easy: () => g(`${ha.toFixed(2)} + ${hb.toFixed(2)} = ?`, n2(ha + hb)) });
  }
  const a = r(-30, 30), b = r(-30, -1);
  return g(`${a} + (${b}) = ?`, `${a + b}`, { steps: [`Picture a number line. Start at ${a} and move ${Math.abs(b)} steps to the left.`, `${a} + (${b}) = ${a + b}`] });
};
const sub = (d: number): G => {
  if (d === 0) { const a = r(6, 20), b = r(1, a - 1); return half() ? g(`${a} ${M} ${b} = ?`, `${a - b}`) : g(`${pick(NAMES)} had ${a} ${pick(THINGS)} and gave away ${b}. How many are left?`, `${a - b}`); }
  if (d === 1) { const a = r(300, 999), b = r(100, a - 50), ta = trunc(a), tb = Math.min(trunc(b), ta - 1), easy = () => g(`${ta} ${M} ${tb} = ?`, `${ta - tb}`); return half() ? g(`${a} ${M} ${b} = ?`, `${a - b}`, { easy }) : g(`A library had ${a} books and lent out ${b}. How many are left?`, `${a - b}`, { easy }); }
  if (d === 2) {
    if (half()) { const a = r(5000, 19999), b = r(1000, a - 500), ta = trunc(a), tb = Math.min(trunc(b), ta - 1); return g(`${a} ${M} ${b} = ?`, `${a - b}`, { easy: () => g(`${ta} ${M} ${tb} = ?`, `${ta - tb}`) }); }
    const ai = r(500, 999), a = ai / 100, b = r(100, ai - 50) / 100, ha = halve(a), hb = Math.min(halve(b), ha - 0.5);
    return g(`${a.toFixed(2)} ${M} ${b.toFixed(2)} = ?`, n2(a - b), { easy: () => g(`${ha.toFixed(2)} ${M} ${hb.toFixed(2)} = ?`, n2(ha - hb)) });
  }
  const a = r(-20, 20), b = r(-20, -1);
  return g(`${a} ${M} (${b}) = ?`, `${a - b}`, { steps: ["Subtracting a negative number is the same as adding its opposite.", `${a} ${M} (${b}) = ${a} + ${-b} = ${a - b}`] });
};
const mul = (d: number): G => {
  if (d === 0) { const a = pick([2, 5, 10]), b = r(1, 10); return half() ? g(`${a} × ${b} = ?`, `${a * b}`) : g(`There are ${b} bags with ${a} ${pick(THINGS)} in each. How many in all?`, `${a * b}`); }
  if (d === 1) {
    if (Math.random() < 0.6) { const a = r(2, 10), b = r(2, 10), x = Math.min(a, 5), y = Math.min(b, 5); return g(`${a} × ${b} = ?`, `${a * b}`, a > 5 || b > 5 ? { easy: () => g(`${x} × ${y} = ?`, `${x * y}`) } : {}); }
    const a = r(11, 60), b = r(2, 9), l = lead(a); return g(`${a} × ${b} = ?`, `${a * b}`, { easy: () => g(`${l} × ${b} = ?`, `${l * b}`) });
  }
  if (d === 2) {
    if (Math.random() < 0.6) {
      const a = r(12, 35), b = r(11, 25), t = Math.floor(b / 10) * 10, o = b - t, l = lead(a);
      return g(`${a} × ${b} = ?`, `${a * b}`, { easy: () => g(`${l} × ${b} = ?`, `${l * b}`), steps: [`Break ${b} into ${t} + ${o}.`, `${a} × ${t} = ${a * t}`, ...(o ? [`${a} × ${o} = ${a * o}`] : []), `${a * t} + ${a * o} = ${a * b}`] });
    }
    const a = r(11, 99) / 10, f = Math.floor(a);
    return g(`${a} × 10 = ?`, n2(a * 10), { easy: () => g(`${f} × 10 = ?`, `${f * 10}`), steps: ["Multiplying by 10 moves every digit one place to the left.", `${a} × 10 = ${n2(a * 10)}`] });
  }
  if (half()) { const b = r(2, 5), e = r(2, 4); return g(`${b}${SUP[e]} = ?`, `${b ** e}`, { steps: [`${b}${SUP[e]} means ${b} multiplied by itself ${e} times.`, `${Array(e).fill(b).join(" × ")} = ${b ** e}`] }); }
  const a = r(2, 12), b = r(2, 12);
  return g(`(-${a}) × ${b} = ?`, `${-a * b}`, { steps: ["A negative number times a positive number is negative.", `${a} × ${b} = ${a * b}, so the answer is ${-a * b}.`] });
};
const div = (d: number): G => {
  if (d === 0) { const b = pick([2, 5, 10]), a = r(1, 10); return half() ? g(`${a * b} ÷ ${b} = ?`, `${a}`) : g(`${pick(NAMES)} shares ${a * b} ${pick(THINGS)} equally among ${b} friends. How many does each get?`, `${a}`); }
  if (d === 1) { const a = r(2, 10), b = r(2, 10); return half() ? g(`${a * b} ÷ ${b} = ?`, `${a}`) : g(`${a * b} ${pick(THINGS)} are packed ${b} to a box. How many boxes?`, `${a}`); }
  if (d === 2) {
    const b = r(3, 9);
    if (half()) { const a = r(12, 120), k = r(2, 9); return g(`${a * b} ÷ ${b} = ?`, `${a}`, { easy: () => g(`${k * b} ÷ ${b} = ?`, `${k}`) }); }
    const n = r(20, 99), k = Math.floor(n / b);
    return g(`What is the remainder when ${n} is divided by ${b}?`, `${n % b}`, { steps: [`Find the biggest multiple of ${b} that fits in ${n}: ${b} × ${k} = ${b * k}.`, `Subtract: ${n} ${M} ${b * k} = ${n % b}. The remainder is ${n % b}.`], easy: () => { const b2 = r(2, 5), n2_ = r(8, 24); return g(`What is the remainder when ${n2_} is divided by ${b2}?`, `${n2_ % b2}`); } });
  }
  if (half()) { const b = r(12, 25), a = r(12, 60); return g(`${a * b} ÷ ${b} = ?`, `${a}`, { easy: () => g(`${b * 5} ÷ ${b} = ?`, "5") }); }
  const b = r(2, 12), a = r(2, 12);
  return g(`${-a * b} ÷ ${b} = ?`, `${-a}`, { steps: ["A negative number divided by a positive number is negative.", `${a * b} ÷ ${b} = ${a}, so the answer is ${-a}.`] });
};

/** Add/subtract fractions with any denominators, with a worked solution. */
function unlike(a: number, p: number, b: number, q: number, add: boolean): G {
  if (!add && a * q < b * p) [a, p, b, q] = [b, q, a, p];          // keep subtraction answers positive
  const l = (p * q) / gcd(p, q), A = (a * l) / p, B = (b * l) / q, R = add ? A + B : A - B, op = add ? "+" : M, steps: string[] = [];
  if (p === q) steps.push(`The denominators are the same (${p}), so ${add ? "add" : "subtract"} the numerators.`);
  else {
    steps.push(`Find a common denominator. The least common denominator of ${p} and ${q} is ${l}.`);
    if (l !== p) steps.push(`Multiply the top and bottom of ${fr(a, p)} by ${l / p}: ${fr(a, p)} = ${fr(A, l)}`);
    if (l !== q) steps.push(`Multiply the top and bottom of ${fr(b, q)} by ${l / q}: ${fr(b, q)} = ${fr(B, l)}`);
  }
  steps.push(`${fr(A, l)} ${op} ${fr(B, l)} = ${fr(R, l)}`);
  const ans = F(R, l);
  if (ans !== fr(R, l)) steps.push(`Simplify: ${fr(R, l)} = ${ans}`);
  if (R > l && R % l) steps.push(`You can also write this as a mixed number: ${Math.floor(R / l)} ${F(R % l, l)}`);
  return g(`${fr(a, p)} ${op} ${fr(b, q)} = ?`, ans, { steps, easy: p === q ? undefined : () => unlike(add ? 1 : 2, 4, 1, 4, add) });
}
const PAIRS = [[1, 2], [1, 3], [2, 3], [3, 4], [2, 5], [3, 5], [1, 4], [5, 6]];
const frac = (d: number): G => {
  const t = Math.random();
  if (d === 0) {
    if (t < 0.5) { const den = pick([2, 3, 4, 5, 6, 8]), a = r(1, den - 1), b = r(1, den - a); return unlike(a, den, b, den, true); }
    if (t < 0.8) { const den = pick([3, 4, 5, 6, 8]), a = r(2, den), b = r(1, a - 1); return unlike(a, den, b, den, false); }
    const k = r(1, 10); return half() ? g(`What is half of ${2 * k}?`, `${k}`) : g(`What is a quarter of ${4 * k}?`, `${k}`);
  }
  if (d === 1) {
    const den = r(3, 12);
    if (t < 0.35) { const a = r(1, den - 2), b = r(1, den - 1 - a); return unlike(a, den, b, den, true); }
    if (t < 0.65) { const a = r(2, den - 1), b = r(1, a - 1); return unlike(a, den, b, den, false); }
    if (t < 0.8) { const a = r(1, den - 2), b = r(a + 1, den - 1); return g(`Which fraction is greater: ${fr(a, den)} or ${fr(b, den)}?`, fr(b, den), { opts: [fr(a, den), fr(b, den)], exact: true, steps: ["The denominators are the same, so compare the numerators.", `${b} is greater than ${a}, so ${fr(b, den)} is greater.`] }); }
    if (t < 0.92) { const p = pick([2, 3, 4, 5]), m = r(2, 5), a = r(1, p - 1); return g(`${fr(a, p)} = ?/${p * m}`, `${a * m}`, { steps: [`Multiply the top and bottom by ${m}.`, `${fr(a, p)} = ${fr(a * m, p * m)}`] }); }
    const n = r(2, 10), k = r(2, 9); return g(`What is 1/${n} of ${n * k}?`, `${k}`, { steps: [`Split ${n * k} into ${n} equal parts: ${n * k} ÷ ${n} = ${k}.`] });
  }
  if (d === 2) {
    if (t < 0.3) { const p = pick([2, 3, 4, 5]), q = p * pick([2, 3, 4]); return unlike(r(1, p - 1), p, r(1, q - 1), q, true); }
    if (t < 0.5) { const p = pick([2, 3, 4, 5]), k = pick([2, 3, 4]), a = r(1, p - 1); return unlike(a, p, r(1, a * k - 1), p * k, false); }
    if (t < 0.65) { const den = r(5, 12), a = r(2, den - 1); return unlike(a, den, r(den - a + 1, den - 1), den, true); }
    if (t < 0.85) { const [p, q] = pick([[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [2, 7]]); return unlike(r(1, p - 1), p, r(1, q - 1), q, half()); }
    const [k, m] = pick(PAIRS), f = pick([2, 3, 4, 5]);
    return g(`Simplify ${fr(k * f, m * f)}`, fr(k, m), { exact: true, opts: [fr(k, m), fr(m, k), fr(k + 1, m), fr(k, m + 1)], steps: [`The greatest common factor of ${k * f} and ${m * f} is ${f}.`, `Divide the top and bottom by ${f}: ${fr(k * f, m * f)} = ${fr(k, m)}`] });
  }
  if (t < 0.25) { const a = r(1, 4), b = r(a + 1, 6), c = r(1, 4), e = r(c + 1, 6), ans = F(a * c, b * e); return g(`${fr(a, b)} × ${fr(c, e)} = ?`, ans, { steps: [`Multiply the numerators: ${a} × ${c} = ${a * c}`, `Multiply the denominators: ${b} × ${e} = ${b * e}`, `${fr(a * c, b * e)}${ans !== fr(a * c, b * e) ? ` = ${ans} (simplified)` : ""}`] }); }
  if (t < 0.5) { const a = r(1, 4), b = r(a + 1, 6), c = r(1, 4), e = r(c + 1, 6), ans = F(a * e, b * c); return g(`${fr(a, b)} ÷ ${fr(c, e)} = ?`, ans, { steps: [`Dividing by a fraction is the same as multiplying by its reciprocal: ${fr(a, b)} × ${fr(e, c)}`, `${fr(a * e, b * c)}${ans !== fr(a * e, b * c) ? ` = ${ans} (simplified)` : ""}`] }); }
  if (t < 0.8) { const [p, q] = pick([[4, 6], [6, 8], [6, 9], [8, 12], [10, 15]]); return unlike(r(1, p - 1), p, r(1, q - 1), q, half()); }
  const p = pick([10, 20, 25, 50, 75]), base = pick([40, 60, 80, 120, 200]);
  return g(`What is ${p}% of ${base}?`, n2((p * base) / 100), { steps: [`${p}% means ${p} out of 100.`, `${base} × ${p} ÷ 100 = ${n2((p * base) / 100)}`] });
};
const geo = (d: number): G => {
  if (d === 0) return pick<G>([g("How many sides does a triangle have?", "3"), g("How many sides does a square have?", "4"), g("How many sides does a pentagon have?", "5"), g("How many sides does a hexagon have?", "6"), g("How many corners does a rectangle have?", "4")]);
  if (d === 1) { const w = r(2, 12), h = r(2, 9); return half() ? g(`A rectangle is ${w} cm long and ${h} cm wide. What is its perimeter in cm?`, `${2 * (w + h)}`, { steps: ["Perimeter = 2 × (length + width).", `2 × (${w} + ${h}) = 2 × ${w + h} = ${2 * (w + h)}`] }) : g(`A rectangle is ${w} cm long and ${h} cm wide. What is its area in cm²?`, `${w * h}`, { steps: ["Area = length × width.", `${w} × ${h} = ${w * h}`] }); }
  if (d === 2) {
    if (half()) { const b = 2 * r(3, 10), h = r(3, 12); return g(`A triangle has base ${b} cm and height ${h} cm. What is its area in cm²?`, `${(b * h) / 2}`, { steps: ["Area of a triangle = base × height ÷ 2.", `${b} × ${h} ÷ 2 = ${(b * h) / 2}`] }); }
    const x = r(30, 80), y = r(30, 80); return g(`Two angles of a triangle are ${x}° and ${y}°. What is the third angle in degrees?`, `${180 - x - y}`, { steps: ["The angles in a triangle add up to 180°.", `180 ${M} ${x} ${M} ${y} = ${180 - x - y}`] });
  }
  if (half()) { const [a, b, c] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]]); return g(`A right triangle has legs ${a} and ${b}. How long is the hypotenuse?`, `${c}`, { steps: ["Use the Pythagorean theorem: a² + b² = c².", `${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}`, `c = √${c * c} = ${c}`] }); }
  const rad = r(2, 10); return g(`A circle has radius ${rad}. What is its area? (use π ≈ 3.14)`, n2(3.14 * rad * rad), { steps: ["Area of a circle = π × r².", `3.14 × ${rad} × ${rad} = ${n2(3.14 * rad * rad)}`] });
};
const alg = (): G => {   // Expert only (grades 7-9)
  const t = r(0, 3), x0 = r(2, 15), b0 = r(1, 20), easy = () => g(`Solve for x: x + ${b0} = ${x0 + b0}`, `${x0}`, { steps: [`Subtract ${b0} from both sides.`, `x = ${x0 + b0} ${M} ${b0} = ${x0}`] });
  if (t === 0) { const c = r(2, 9); return g(`Solve for x: ${c}x + ${b0} = ${c * x0 + b0}`, `${x0}`, { easy, steps: [`Subtract ${b0} from both sides: ${c}x = ${c * x0}`, `Divide both sides by ${c}: x = ${x0}`] }); }
  if (t === 1) { const k = r(2, 9), v = r(2, 12); return g(`Solve for x: x ÷ ${k} = ${v}`, `${v * k}`, { easy, steps: [`Multiply both sides by ${k}: x = ${v} × ${k} = ${v * k}`] }); }
  if (t === 2) { const x = r(3, 12), c = r(2, 5), a = r(1, x - 1); return g(`Solve for x: ${c}(x ${M} ${a}) = ${c * (x - a)}`, `${x}`, { easy, steps: [`Divide both sides by ${c}: x ${M} ${a} = ${x - a}`, `Add ${a} to both sides: x = ${x}`] }); }
  const q = r(1, 4), p = q + r(1, 4), C = (p - q) * x0 + b0;
  return g(`Solve for x: ${p}x + ${b0} = ${q}x + ${C}`, `${x0}`, { easy, steps: [`Subtract ${q}x from both sides: ${p - q}x + ${b0} = ${C}`, `Subtract ${b0}: ${p - q}x = ${C - b0}`, `Divide by ${p - q}: x = ${x0}`] });
};

const GEN: Record<string, (d: number) => G> = { Addition: add, Subtraction: sub, Multiplication: mul, Division: div, Fractions: frac, Geometry: geo, Algebra: () => alg() };
const MIX = ["Addition", "Subtraction", "Multiplication", "Division", "Fractions", "Fractions", "Geometry"];

function choices(x: G): string[] | undefined {
  const a = x.a;
  if (x.opts) return shuffle([...new Set([a, ...x.opts])]).slice(0, 4);
  const m = a.match(/^(\d+)\/(\d+)$/);
  if (m) { const n = +m[1], q = +m[2]; return shuffle([a, ...shuffle([...new Set([F(n + 1, q), F(n, q + 1), F(Math.max(1, n - 1), q), fr(n * 2, q + 1), F(q, n)])].filter((v) => v !== a)).slice(0, 3)]); }
  const v = parseFloat(a);
  if (isNaN(v)) return undefined;
  const ks = Number.isInteger(v) ? [1, -1, 10, -10, 2, -2] : [1, -1, 0.1, -0.1, 0.01, -0.01, 10, -10];
  const wrong = [...new Set(ks.map((k) => n2(v + k)))].filter((w) => w !== a && (v < 0 || parseFloat(w) >= 0));
  return shuffle([a, ...shuffle(wrong).slice(0, 3)]);
}
const toQ = (tp: string, x: G, d: number, id = `m-${x.q}`): Question => ({ id, q: x.q, a: x.a, options: Math.random() < (d === 0 ? 0.75 : 0.5) ? choices(x) : undefined, topic: tp, d, steps: x.steps, exact: x.exact });

export function mathQuestion(topic: string | undefined, d: number, seen: Set<string>): Question {
  const fixed = topic && GEN[topic] && !(topic === "Algebra" && d < 3) ? topic : undefined;
  let tp = "", x: G = g("", "");
  for (let i = 0; i < 20; i++) {
    tp = fixed ?? pick(d === 3 ? [...MIX, "Algebra", "Algebra"] : MIX);
    x = GEN[tp](d);
    if (!seen.has(`m-${x.q}`)) break;
  }
  const q = toQ(tp, x, d);
  const e = x.easy ? x.easy() : d > 0 && tp !== "Algebra" ? GEN[tp](d - 1) : undefined;   // Simplify = scaled-down version, or one grade band easier
  if (e) q.easy = toQ(tp, e, d, q.id);
  return q;
}
