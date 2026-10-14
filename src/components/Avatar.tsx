import { useGame } from "@/lib/game";
import { getItem } from "@/lib/rewards";
import { cn } from "@/lib/utils";

/** Layered emoji avatar: character + hat + glasses + costume + backpack + pet. */
export function Avatar({ className }: { className?: string }) {
  const { equipped: e } = useGame();
  const g = (k: string) => getItem(e[k]);
  const c = g("character") ?? getItem("explorer")!;
  const [hat, gl, co, bk, pet] = [g("hat"), g("glasses"), g("costume"), g("backpack"), g("pet")];
  return (
    <div className={cn("relative h-40 w-40 select-none leading-none", className)} aria-hidden>
      {bk && <span className="absolute end-0 top-[4.5rem] text-[2.6rem]">{bk.emoji}</span>}
      <span className="absolute inset-x-0 top-4 text-center text-[5.5rem]">{c.emoji}</span>
      {co && <span className="absolute inset-x-0 bottom-1 text-center text-[2.6rem]">{co.emoji}</span>}
      {gl && <span className="absolute inset-x-0 top-[2.7rem] text-center text-[2rem]">{gl.emoji}</span>}
      {hat && <span className="absolute inset-x-0 -top-1 text-center text-[2.6rem]">{hat.emoji}</span>}
      {pet && <span className="absolute bottom-0 start-0 text-[3rem]">{pet.emoji}</span>}
    </div>
  );
}
