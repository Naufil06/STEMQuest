import { useEffect, useState, type ReactNode } from "react";
import { useAuth, boot, login, register } from "@/lib/auth";
import { GameButton } from "@/components/ui-game";
import { cn } from "@/lib/utils";

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, ready, error } = useAuth();
  useEffect(() => { void boot(); }, []);
  if (!ready) return <div className="grid min-h-screen place-items-center font-display text-2xl">Loading STEMQuest…</div>;
  if (user) return <>{children}</>;
  return <LoginPage bootError={error} />;
}

function LoginPage({ bootError }: { bootError?: string }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [u, setU] = useState(""), [p, setP] = useState(""), [role, setRole] = useState("student"), [code, setCode] = useState("");
  const [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  const go = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try { if (mode === "login") await login(u, p); else await register(u, p, role, code); }
    catch (x) { setErr((x as Error).message); setBusy(false); }
  };
  const field = "w-full rounded-xl border-2 bg-background px-4 py-3 text-lg outline-none focus:border-primary";
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <div className="game-card animate-pop w-full max-w-md overflow-hidden">
        <div className="bg-hero p-6 text-center text-primary-foreground">
          <h1 className="text-4xl font-bold">STEM<span className="text-accent">Quest</span></h1>
          <p className="mt-1 font-semibold">Learn → Level up → Unlock worlds!</p>
        </div>
        <div className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-2" role="tablist">
            {(["login", "signup"] as const).map((m) => (
              <button key={m} role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setErr(""); }} className={cn("rounded-xl py-2 font-display font-semibold", mode === m ? "bg-primary text-primary-foreground" : "bg-secondary")}>{m === "login" ? "Log in" : "Create account"}</button>
            ))}
          </div>
          <form onSubmit={go} className="space-y-3">
            <label className="block font-semibold">Username<input className={field} value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" autoFocus required /></label>
            <label className="block font-semibold">Password<input className={field} type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} required /></label>
            {mode === "signup" && (
              <>
                <p className="text-sm text-muted-foreground">Tip: use a made-up username (not your real name) and a password you will remember.</p>
                <div className="flex gap-4 font-semibold">
                  {["student", "teacher"].map((r) => <label key={r} className="flex items-center gap-2 capitalize"><input type="radio" name="role" checked={role === r} onChange={() => setRole(r)} />{r}</label>)}
                </div>
                {role === "teacher" && <label className="block font-semibold">Teacher code<input className={field} value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ask your school for the code" /></label>}
              </>
            )}
            {(err || bootError) && <p role="alert" className="rounded-xl bg-destructive/10 p-3 font-semibold text-destructive">{err || bootError}</p>}
            <GameButton type="submit" disabled={busy} className="w-full">{busy ? "One moment…" : mode === "login" ? "Let's go! 🚀" : "Create my account 🚀"}</GameButton>
          </form>
        </div>
      </div>
    </main>
  );
}
