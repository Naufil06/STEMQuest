import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useGame } from "@/lib/game";
import { useT } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { ITEMS, SLOTS, buy, equip, isOwned, type Slot } from "@/lib/rewards";
import { Avatar } from "@/components/Avatar";
import { Card, PageHeader } from "@/components/ui-game";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rewards")({ head: () => seo("Rewards", "Spend coins on characters, pets and outfits."), component: Rewards });

function Rewards() {
  const s = useGame();
  const { t } = useT();
  const [slot, setSlot] = useState<Slot>("character");
  return (
    <>
      <PageHeader icon="🎁" title={t("rewards")} subtitle="Earn coins by answering questions, then spend them in the store." />
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="text-center">
          <Avatar className="mx-auto scale-110" />
          <p className="mt-4 font-display text-2xl font-bold">🪙 {s.coins}</p>
          <p className="text-sm text-muted-foreground">Your hero</p>
        </Card>
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap gap-2" role="tablist">
            {SLOTS.map((x) => (
              <button key={x.id} role="tab" aria-selected={slot === x.id} onClick={() => setSlot(x.id)}
                className={cn("rounded-full px-4 py-2 font-display font-semibold", slot === x.id ? "bg-primary text-primary-foreground" : "bg-secondary")}>
                {x.emoji} {x.label}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ITEMS.filter((i) => i.slot === slot).map((i) => {
              const own = isOwned(s.owned, i.id), on = s.equipped[i.slot] === i.id;
              return (
                <Card key={i.id} className={cn("animate-pop text-center", on && "border-success")}>
                  <div className="text-5xl">{i.emoji}</div>
                  <p className="mt-2 font-display font-bold">{i.name}</p>
                  {own ? (
                    <button onClick={() => equip(i.slot, on && i.slot !== "character" ? null : i.id)} className={cn("mt-3 w-full rounded-xl px-3 py-2 font-semibold", on ? "bg-success text-success-foreground" : "bg-secondary hover:bg-primary hover:text-primary-foreground")}>
                      {on ? "Equipped ✓" : "Equip"}
                    </button>
                  ) : (
                    <button disabled={s.coins < i.price} onClick={() => toast(buy(i.id) ? `🎉 You got the ${i.name}!` : "Not enough coins")}
                      className="mt-3 w-full rounded-xl bg-accent px-3 py-2 font-semibold text-accent-foreground disabled:opacity-50">
                      🪙 {i.price}
                    </button>
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
