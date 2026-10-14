import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Bar({ value, tone = "bg-xp-bar", className }: { value: number; tone?: string; className?: string }) {
  return (
    <div className={cn("h-3 overflow-hidden rounded-full bg-secondary", className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("bar-grow h-full rounded-full", tone)} style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
    </div>
  );
}
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("game-card p-5", className)}>{children}</div>;
}
export function PageHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold md:text-4xl">{icon} {title}</h1>
      {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
const V = { primary: "bg-primary", success: "bg-success", accent: "bg-accent text-accent-foreground" };
export function GameButton({ variant = "primary", className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof V }) {
  return (
    <button {...p} className={cn("rounded-xl px-5 py-3 font-display font-semibold text-primary-foreground shadow-pop transition-transform hover:-translate-y-0.5 active:translate-y-1 active:shadow-none disabled:opacity-50", V[variant], className)} />
  );
}
