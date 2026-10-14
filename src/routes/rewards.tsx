import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useGame } from "@/lib/game";
import { useT } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { ITEMS, SLOTS, buy, equip, isOwned, type Item, type Slot } from "@/lib/rewards";
import { Avatar, Glasses, Hat, OUTFITS } from "@/components/Avatar";
import { Card, PageHeader } from "@/components/ui-game";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rewards")({ head: () => seo("Rewards", "Spend coins on outfits, hats, pets and more."), component: Rewards });

function Rewards() {
  const s = useGame();
  const { t } = useT();
  const [slot, setSlot] = useState<Slot>("character");
  const gender = s.equipped.character === "girl" ? "girl" : "boy";
  const outfit = OUTFITS.includes(s.equipped.costume) ? s.equipped.costume : "school";
  const current = (i: Item) => (i.slot === "costume" ? outfit : i.slot === "character" ? gender : s.equipped[i.slot]);
  const thumb = (i: Item) => {
    if (i.slot === "character") return <img src={`/characters/${i.id}-${outfit}.png`} alt="" className="mx-auto h-40 object-contain" />;
    if (i.slot === "costume") return <img src={`/characters/${gender}-${i.id}.png`} alt="" className="mx-auto h-40 object-contain" />;
    if (i.slot === "hat") return <svg viewBox="-125 -80 250 170" className="mx-auto h-24"><Hat k={i.id} /></svg>;
    if (i.slot === "glasses") return <svg viewBox="-110 -45 220 90" className="mx-auto h-16"><Glasses k={i.id} a={[-45, 0]} b={[45, 0]} /></svg>;
    if (i.slot === "backpack") return <svg viewBox="0 0 100 120" className="mx-auto h-24"><rect x="15" y="10" width="70" height="100" rx="28" fill={i.id === "chute" ? "#a855f7" : "#f97316"} /><rect x="30" y="55" width="40" height="30" rx="8" fill="#0003" /></svg>;
    return <div className="text-6xl">{i.emoji}</div>;
  };
  return (
    <>
      <PageHeader icon="🎁" title={t("rewards")} subtitle="Earn coins by answering questions, then spend them in the store." />
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="text-center">
          <Avatar className="mx-auto w-40" />
          <p className="mt-4 font-display text-2xl font-bold">🪙 {s.coins}</p>
        </Card>
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap gap-2" role="tablist">
            {SLOTS.map((x) => (
              <button key={x.id} role="tab" aria-selected={slot === x.id} onClick={() => setSlot(x.id)}
                className={cn("rounded-full px-4 py-2 font-display font-semibold", slot === x.id ? "bg-primary text-primary-foreground" : "bg-secondary")}>{x.label}</button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ITEMS.filter((i) => i.slot === slot).map((i) => {
              const own = isOwned(s.owned, i.id), on = current(i) === i.id, fixed = i.slot === "character" || i.slot === "costume";
              return (
                <Card key={i.id} className={cn("animate-pop text-center", on && "border-success")}>
                  <div className="grid h-40 place-items-center">{thumb(i)}</div>
                  <p className="mt-2 font-display font-bold">{i.name}</p>
                  {own ? (
                    <button onClick={() => equip(i.slot, on && !fixed ? null : i.id)} className={cn("mt-3 w-full rounded-xl px-3 py-2 font-semibold", on ? "bg-success text-success-foreground" : "bg-secondary hover:bg-primary hover:text-primary-foreground")}>
                      {on ? "Equipped ✓" : "Equip"}
                    </button>
                  ) : (
                    <button disabled={s.coins < i.price} onClick={() => toast(buy(i.id) ? `🎉 You got the ${i.name}!` : "Not enough coins")} className="mt-3 w-full rounded-xl bg-accent px-3 py-2 font-semibold text-accent-foreground disabled:opacity-50">🪙 {i.price}</button>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
