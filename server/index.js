// STEMQuest server: accounts (hashed passwords + login sessions), per-account saved progress, and the built website.
import express from "express";
import Database from "better-sqlite3";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");   // put this on a persistent disk when hosting!
fs.mkdirSync(DIR, { recursive: true });
const db = new Database(path.join(DIR, "stemquest.db"));
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE COLLATE NOCASE, pw TEXT, role TEXT, created INTEGER);
CREATE TABLE IF NOT EXISTS states (user_id INTEGER PRIMARY KEY, json TEXT, level INTEGER DEFAULT 1, xp INTEGER DEFAULT 0, acc INTEGER DEFAULT 0, streak INTEGER DEFAULT 0, weekly INTEGER DEFAULT 0, world TEXT DEFAULT '', updated INTEGER);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER, expires INTEGER);
`);
const TEACHER_CODE = process.env.TEACHER_CODE || "teacher123";   // CHANGE THIS when you host the site
const DAY = 864e5;

const hash = (pw) => { const salt = crypto.randomBytes(16); return `${salt.toString("hex")}:${crypto.scryptSync(pw, salt, 32).toString("hex")}`; };
const verify = (pw, h) => { const [s, k] = h.split(":"); return crypto.timingSafeEqual(crypto.scryptSync(pw, Buffer.from(s, "hex"), 32), Buffer.from(k, "hex")); };
const cookies = (req) => Object.fromEntries((req.headers.cookie || "").split(";").map((c) => c.trim().split("=")).filter((c) => c[0]));
const who = (req) => { const t = cookies(req).sq_session; return t ? db.prepare("SELECT u.id, u.username, u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires > ?").get(t, Date.now()) : undefined; };
const login = (req, res, user) => {
  const token = crypto.randomBytes(32).toString("hex");
  db.prepare("INSERT INTO sessions VALUES (?, ?, ?)").run(token, user.id, Date.now() + 30 * DAY);
  res.cookie("sq_session", token, { httpOnly: true, sameSite: "lax", secure: req.secure, maxAge: 30 * DAY, path: "/" });
};
const tries = new Map();   // very small brute-force limiter: 20 attempts / 10 min / IP
const limited = (req, res) => {
  const k = req.ip, now = Date.now(), e = tries.get(k);
  if (!e || e.reset < now) tries.set(k, { n: 1, reset: now + 600000 }); else e.n++;
  if (tries.get(k).n > 20) { res.status(429).json({ error: "Too many tries. Please wait a few minutes." }); return true; }
  return false;
};
const stateOf = (id) => { const r = db.prepare("SELECT json FROM states WHERE user_id = ?").get(id); return r ? JSON.parse(r.json) : null; };

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "500kb" }));

app.post("/api/register", (req, res) => {
  if (limited(req, res)) return;
  const { username = "", password = "", role = "student", code = "" } = req.body || {};
  const u = String(username).trim(), pw = String(password);
  if (!/^[A-Za-z0-9_]{3,20}$/.test(u)) return res.status(400).json({ error: "Username must be 3–20 letters, numbers or _" });
  if (pw.length < 4) return res.status(400).json({ error: "Password must be at least 4 characters" });
  if (role === "teacher" && code !== TEACHER_CODE) return res.status(403).json({ error: "That teacher code is not correct" });
  if (db.prepare("SELECT 1 FROM users WHERE username = ?").get(u)) return res.status(409).json({ error: "That username is taken. Try another!" });
  const r = role === "teacher" ? "teacher" : "student";
  const id = db.prepare("INSERT INTO users (username, pw, role, created) VALUES (?, ?, ?, ?)").run(u, hash(pw), r, Date.now()).lastInsertRowid;
  login(req, res, { id });
  res.json({ user: { username: u, role: r }, state: null });
});
app.post("/api/login", (req, res) => {
  if (limited(req, res)) return;
  const u = db.prepare("SELECT * FROM users WHERE username = ?").get(String(req.body?.username || "").trim());
  if (!u || !verify(String(req.body?.password || ""), u.pw)) return res.status(401).json({ error: "Wrong username or password" });
  login(req, res, u);
  res.json({ user: { username: u.username, role: u.role }, state: stateOf(u.id) });
});
app.post("/api/logout", (req, res) => {
  const t = cookies(req).sq_session;
  if (t) db.prepare("DELETE FROM sessions WHERE token = ?").run(t);
  res.clearCookie("sq_session", { path: "/" }).json({ ok: true });
});
app.get("/api/me", (req, res) => {
  const u = who(req);
  if (!u) return res.status(401).json({ error: "Not signed in" });
  res.json({ user: { username: u.username, role: u.role }, state: stateOf(u.id) });
});
app.put("/api/state", (req, res) => {
  const u = who(req);
  if (!u) return res.status(401).json({ error: "Not signed in" });
  const { state, summary = {} } = req.body || {};
  if (!state || typeof state !== "object") return res.status(400).json({ error: "Bad data" });
  const n = (v, max = 1e9) => Math.max(0, Math.min(max, Math.round(Number(v) || 0)));
  db.prepare(`INSERT INTO states (user_id, json, level, xp, acc, streak, weekly, world, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET json = excluded.json, level = excluded.level, xp = excluded.xp, acc = excluded.acc, streak = excluded.streak, weekly = excluded.weekly, world = excluded.world, updated = excluded.updated`)
    .run(u.id, JSON.stringify(state), n(summary.level, 100) || 1, n(summary.xp), n(summary.acc, 100), n(summary.streak, 5000), n(summary.weekly), String(summary.world || "").slice(0, 40), Date.now());
  res.json({ ok: true });
});
// Everyone signed in sees the student leaderboard stats. Only teachers also get accuracy.
app.get("/api/students", (req, res) => {
  const me = who(req);
  if (!me) return res.status(401).json({ error: "Not signed in" });
  const rows = db.prepare("SELECT u.username, s.level, s.xp, s.acc, s.streak, s.weekly, s.world, s.updated FROM users u LEFT JOIN states s ON s.user_id = u.id WHERE u.role = 'student'").all();
  res.json({ students: rows.map((r) => ({ username: r.username, name: r.username, level: r.level ?? 1, xp: r.xp ?? 0, acc: me.role === "teacher" ? r.acc ?? 0 : undefined, streak: r.streak ?? 0, weekly: r.weekly ?? 0, world: r.world || "Forest Realm", online: Date.now() - (r.updated || 0) < 180000 })) });
});
setInterval(() => db.prepare("DELETE FROM sessions WHERE expires < ?").run(Date.now()), 3600000);

// Production: serve the built website from the same address
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
}
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`STEMQuest server on port ${PORT} (data in ${DIR})`));
