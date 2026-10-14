import { createFileRoute } from "@tanstack/react-router";
import { useGame, updateSettings, resetGame } from "@/lib/game";
import { useT, setLang, LANGS } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { Card, GameButton, PageHeader } from "@/components/ui-game";

export const Route = createFileRoute("/settings")({ head: () => seo("Settings", "Language and accessibility."), component: Settings });

function Settings() {
  const s = useGame();
  const { t, lang } = useT();
  const toggles = [["largeText", "Large text"], ["highContrast", "High contrast"], ["dyslexia", "Dyslexia-friendly font"]] as const;
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader icon="⚙️" title={t("settings")} />
      <Card>
        <label className="font-display text-lg font-semibold" htmlFor="lang">🌍 {t("language")}</label>
        <select id="lang" value={lang} onChange={(e) => setLang(e.target.value)} className="mt-2 w-full rounded-xl border-2 bg-background p-3 text-lg">
          {LANGS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
        </select>
      </Card>
      <Card className="space-y-3">
        <h2 className="text-xl font-bold">♿ Accessibility</h2>
        {toggles.map(([k, l]) => (
          <label key={k} className="flex cursor-pointer items-center justify-between rounded-xl bg-secondary p-3 font-semibold">
            {l}<input type="checkbox" className="h-6 w-6" checked={s.settings[k]} onChange={(e) => updateSettings({ [k]: e.target.checked })} />
          </label>
        ))}
      </Card>
      <GameButton variant="accent" onClick={() => confirm("Reset all progress?") && resetGame()}>Reset progress</GameButton>
    </div>
  );
}
