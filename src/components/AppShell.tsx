import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { useGame, levelInfo } from "@/lib/game";
import { useT, LANGS, type TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const NAV: { to: string; key: TKey; icon: string }[] = [
  { to: "/", key: "dashboard", icon: "🏠" },
  { to: "/subjects", key: "subjects", icon: "📖" },
  { to: "/world-map", key: "worldMap", icon: "🗺️" },
  { to: "/rewards", key: "rewards", icon: "🎁" },
  { to: "/leaderboards", key: "leaderboards", icon: "🏆" },
  { to: "/friends", key: "friends", icon: "🤝" },
  { to: "/progress", key: "progress", icon: "📈" },
  { to: "/teacher", key: "teacher", icon: "🧑‍🏫" },
  { to: "/parent", key: "parent", icon: "👪" },
  { to: "/settings", key: "settings", icon: "⚙️" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const s = useGame();
  const { t, lang } = useT();
  const lv = levelInfo(s.xp);
  const [open, setOpen] = useState(false);
  const rtl = LANGS.find((l) => l.id === lang)?.rtl;

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      className={cn("min-h-screen", s.settings.largeText && "large-text", s.settings.highContrast && "high-contrast", s.settings.dyslexia && "dyslexia")}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded focus:bg-card focus:p-2">Skip to content</a>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b bg-sidebar px-4 py-3 text-sidebar-foreground lg:hidden">
        <button aria-label="Open menu" onClick={() => setOpen(true)}><Menu /></button>
        <span className="font-display text-xl font-bold">STEM<span className="text-sidebar-primary">Quest</span></span>
        <span className="font-display text-sm">⭐ {lv.level} · 🪙 {s.coins}</span>
      </header>
      {open && <div className="fixed inset-0 z-40 bg-foreground/40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside
        className={cn(
          "fixed inset-y-0 z-50 flex w-64 flex-col bg-sidebar p-4 text-sidebar-foreground transition-transform lg:translate-x-0 start-0",
          open ? "translate-x-0" : rtl ? "translate-x-full" : "-translate-x-full",
        )}
      >
        <div className="mb-6 flex items-center justify-between px-2">
          <Link to="/" className="font-display text-2xl font-bold">STEM<span className="text-sidebar-primary">Quest</span></Link>
          <button className="lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)}><X /></button>
        </div>
        <div className="mb-5 rounded-2xl bg-sidebar-accent p-3">
          <div className="flex justify-between font-display text-sm"><span>{t("level")} {lv.level}</span><span>🪙 {s.coins}</span></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-sidebar"><div className="bar-grow h-full bg-xp-bar" style={{ width: `${lv.pct}%` }} /></div>
          <div className="mt-1 text-xs opacity-70">{lv.into}/{lv.need} {t("xp")}</div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: n.to === "/" }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold transition-colors hover:bg-sidebar-accent data-[status=active]:bg-sidebar-primary data-[status=active]:text-sidebar-primary-foreground"
            >
              <span className="text-lg">{n.icon}</span>{t(n.key)}
            </Link>
          ))}
        </nav>
      </aside>
      <main id="main" className="px-4 py-6 lg:ps-72 lg:pe-8 lg:py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
