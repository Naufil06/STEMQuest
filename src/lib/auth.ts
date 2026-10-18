import { useSyncExternalStore } from "react";
import { loadState, setSaver, getState } from "./game";
import { meKid } from "./sample";
import { grandfather } from "./rewards";

export interface User { username: string; role: "student" | "teacher" }
type Status = { user: User | null; ready: boolean; error?: string };
let st: Status = { user: null, ready: false };
const subs = new Set<() => void>();
const emit = (p: Partial<Status>) => { st = { ...st, ...p }; subs.forEach((f) => f()); };
export const useAuth = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => st, () => st);

async function call(path: string, method = "GET", body?: unknown) {
  const r = await fetch(path, { method, credentials: "include", headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(d.error || "Can't reach the server"), { status: r.status });
  return d;
}
let timer = 0, beat = 0, booted = false;
function push() {
  if (!st.user) return;
  const { name: _n, ...summary } = meKid(getState());
  void _n;
  fetch("/api/state", { method: "PUT", credentials: "include", keepalive: true, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state: getState(), summary }) }).catch(() => {});
}
function enter(user: User, state: unknown) {
  loadState((state as object) ?? null);
  grandfather();
  setSaver(() => { clearTimeout(timer); timer = window.setTimeout(push, 800); });   // save ~1s after every change
  clearInterval(beat); beat = window.setInterval(push, 60000);                       // heartbeat keeps "online" status fresh
  emit({ user, ready: true, error: undefined });
}
export async function boot() {
  if (booted) return; booted = true;
  window.addEventListener("pagehide", push);
  try { const d = await call("/api/me"); enter(d.user, d.state); }
  catch (e) { emit({ ready: true, error: (e as { status?: number }).status === 401 ? undefined : "Can't reach the STEMQuest server. Start it with npm run dev." }); }
}
export async function login(username: string, password: string) { const d = await call("/api/login", "POST", { username, password }); enter(d.user, d.state); }
export async function register(username: string, password: string, role: string, code: string) {
  const d = await call("/api/register", "POST", { username, password, role, code });
  let old: string | null = null;
  try { old = localStorage.getItem("stemquest-v1"); } catch { /* ignore */ }   // bring over progress from the old single-player version
  enter(d.user, old ? JSON.parse(old) : d.state);
  if (old) { try { localStorage.removeItem("stemquest-v1"); } catch { /* ignore */ } push(); }
}
export async function logout() {
  clearTimeout(timer); clearInterval(beat); push();
  await call("/api/logout", "POST").catch(() => {});
  setSaver(null); loadState(null); emit({ user: null });
}
