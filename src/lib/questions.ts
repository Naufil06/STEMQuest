import type { SubjectId } from "./game";

export interface Question { id: string; q: string; a: string; options?: string[]; topic: string; d: number }

const r = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = <T,>(x: T[]) => [...x].sort(() => Math.random() - 0.5);

// [subject, topic, difficulty 0-3, question, answer, options | null]
type Row = [SubjectId, string, number, string, string, string[] | null];
const BANK: Row[] = [
  ["science", "Biology", 0, "What do plants take in from the air to make food?", "Carbon dioxide", ["Oxygen", "Carbon dioxide", "Nitrogen", "Helium"]],
  ["science", "Chemistry", 1, "What is the chemical symbol for water?", "H2O", null],
  ["science", "Physics", 1, "What force pulls objects toward Earth?", "Gravity", ["Gravity", "Magnetism", "Friction", "Sound"]],
  ["science", "Earth Science", 0, "Which layer of Earth do we live on?", "Crust", ["Crust", "Mantle", "Core", "Ocean"]],
  ["science", "Physics", 2, "What is the SI unit of force?", "Newton", null],
  ["science", "Biology", 3, "Which organelle produces most of a cell's energy?", "Mitochondria", null],
  ["english", "Grammar", 0, "Which word is a noun?", "Dog", ["Run", "Dog", "Quickly", "Blue"]],
  ["english", "Vocabulary", 1, "What is a synonym of 'happy'?", "Joyful", ["Joyful", "Angry", "Tired", "Slow"]],
  ["english", "Grammar", 2, "Choose the correct word: 'They ___ going to school.'", "are", ["is", "am", "are", "be"]],
  ["english", "Reading", 1, "In a story, who is the protagonist?", "The main character", ["The main character", "The author", "The setting", "The title"]],
  ["english", "Vocabulary", 3, "What does 'ubiquitous' mean?", "Found everywhere", ["Very rare", "Found everywhere", "Easily broken", "Secretly planned"]],
  ["english", "Writing", 0, "Which punctuation mark ends a question?", "?", [".", "?", "!", ","]],
  ["technology", "Coding Basics", 0, "What is a set of step-by-step instructions for a computer called?", "Algorithm", ["Algorithm", "Browser", "Pixel", "Cable"]],
  ["technology", "Logic", 1, "What is the result of TRUE AND FALSE?", "False", ["True", "False"]],
  ["technology", "Digital Literacy", 0, "Which is the strongest password?", "T7!kq9#Lm2", ["password", "12345678", "T7!kq9#Lm2", "myname"]],
  ["technology", "Coding Basics", 2, "Which loop repeats code a set number of times?", "for loop", ["for loop", "if statement", "comment", "variable"]],
  ["technology", "Logic", 3, "How many bits are in one byte?", "8", null],
  ["technology", "Coding Basics", 1, "Which symbol starts a comment in Python?", "#", null],
];

function mathQ(topic: string | undefined, d: number): Question {
  const t = topic ?? ["Arithmetic", "Fractions", "Algebra", "Geometry"][r(0, 3)];
  const m = [10, 20, 60, 200][d];
  let q = "", a = 0;
  if (t === "Fractions") { const n = r(2, 4 + d * 2), k = r(2, 6 + d * 4); q = `What is 1/${n} of ${n * k}?`; a = k; }
  else if (t === "Algebra") { const x = r(1, m), c = r(2, 3 + d * 3), b = r(1, m); q = `Solve for x: ${c}x + ${b} = ${c * x + b}`; a = x; }
  else if (t === "Geometry") { const w = r(2, m), h = r(2, m); q = `A rectangle is ${w} by ${h}. What is its area?`; a = w * h; }
  else {
    const x = r(1, m), y = r(1, m), op = r(0, d === 0 ? 1 : 2);
    if (op === 0) { q = `${x} + ${y} = ?`; a = x + y; }
    else if (op === 1) { q = `${x + y} − ${y} = ?`; a = x; }
    else { const p = r(2, 5 + d * 3); q = `${p} × ${y} = ?`; a = p * y; }
  }
  const options = Math.random() < 0.5 ? shuffle([...new Set([a, a + 1, a - 1, a + r(2, 9)])].map(String)) : undefined;
  return { id: `m-${q}`, q, a: String(a), options, topic: t, d };
}

export function pickQuestion(sid: SubjectId, d: number, _lang: string, seen: Set<string>, topic?: string): Question {
  if (sid === "math") {
    for (let i = 0; i < 20; i++) { const x = mathQ(topic, d); if (!seen.has(x.id)) return x; }
    return mathQ(topic, d);
  }
  let pool = BANK.filter((b) => b[0] === sid && (!topic || b[1] === topic));
  if (!pool.length) pool = BANK.filter((b) => b[0] === sid);
  const fresh = pool.filter((b) => !seen.has(`${sid}-${b[3]}`));
  const from = fresh.length ? fresh : pool;
  const best = Math.min(...from.map((b) => Math.abs(b[2] - d)));
  const row = shuffle(from.filter((b) => Math.abs(b[2] - d) === best))[0];
  return { id: `${sid}-${row[3]}`, q: row[3], a: row[4], options: row[5] ? shuffle(row[5]) : undefined, topic: row[1], d: row[2] };
}

export const isCorrect = (q: Question, v: string) => v.trim().toLowerCase() === q.a.toLowerCase();
