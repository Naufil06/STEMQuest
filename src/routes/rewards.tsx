import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useGame } from "@/lib/game";
import { useT } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { ITEMS, SLOTS, buy, equip, isOwned, lockText, type Item, type Slot } from "@/lib/rewards";
import { Avatar, Glasses, Hat, OUTFITS } from "@/components/Avatar";
import { Card, PageHeader } from "@/components/ui-game";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rewards")({ head: () => seo("Rewards", "Spend coins on costumes, hats, glasses and pets."), component: Rewards });

function Rewards() {
  const s = useGame();
  const { t } = useT();
  const [slot, setSlot] = useState<Slot>("costume");
  const gender = s.equipped.character === "girl" ? "girl" : "boy";
  const outfit = OUTFITS.includes(s.equipped.costume) ? s.equipped.costume : "school";
  const current = (i: Item) => (i.slot === "costume" ? outfit : i.slot === "character" ? gender : s.equipped[i.slot]);
  const thumb = (i: Item) => {
    if (i.slot === "character") return <img src={`/characters/${i.id}-${outfit}.png`} alt="" loading="lazy" className="mx-auto h-40 object-contain" />;
    if (i.slot === "costume") return <img src={`/characters/${gender}-${i.id}.png`} alt="" loading="lazy" className="mx-auto h-40 object-contain" />;
    if (i.slot === "hat") return <svg viewBox="-125 -100 250 190" className="mx-auto h-24"><Hat k={i.id} /></svg>;
    if (i.slot === "glasses") return <svg viewBox="-110 -45 220 90" className="mx-auto h-16"><Glasses k={i.id} a={[-45, 0]} b={[45, 0]} /></svg>;
    return <div className="text-6xl">{i.emoji}</div>;
  };
  return (
    <>
      <PageHeader icon="🎁" title={t("rewards")} subtitle="Earn coins by answering questions, then spend them in the store. Fancier costumes cost more, and some unlock in later worlds." />
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="text-center lg:sticky lg:top-4 lg:self-start">
          <Avatar className="mx-auto w-40" />
          <p className="mt-4 font-display text-2xl font-bold">🪙 {s.coins}</p>
        </Card>
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap gap-2" role="tablist">
            {SLOTS.map((x) => (
              <button key={x.id} role="tab" aria-selected={slot === x.id} onClick={() => setSlot(x.id)} className={cn("rounded-full px-4 py-2 font-display font-semibold", slot === x.id ? "bg-primary text-primary-foreground" : "bg-secondary")}>{x.label}</button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ITEMS.filter((i) => i.slot === slot).sort((a, b) => a.price - b.price).map((i) => {
              const own = isOwned(s.owned, i.id), on = current(i) === i.id, fixed = i.slot === "character" || i.slot === "costume", lock = own ? null : lockText(i, s);
              return (
                <Card key={i.id} className={cn("animate-pop text-center", on && "border-success")}>
                  <div className={cn("grid h-40 place-items-center", lock && "opacity-60 grayscale")}>{thumb(i)}</div>
                  <p className="mt-2 font-display font-bold">{i.name}</p>
                  {own ? (
                    <button onClick={() => equip(i.slot, on && !fixed ? null : i.id)} className={cn("mt-3 w-full rounded-xl px-3 py-2 font-semibold", on ? "bg-success text-success-foreground" : "bg-secondary hover:bg-primary hover:text-primary-foreground")}>{on ? "Equipped ✓" : "Equip"}</button>
                  ) : lock ? (
                    <div className="mt-3 rounded-xl bg-muted p-2 text-xs font-semibold text-muted-foreground">🔒 Unlocks at {lock}</div>
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
