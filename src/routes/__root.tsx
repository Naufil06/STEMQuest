import { createRootRoute, Outlet, Link } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AppShell } from "@/components/AppShell";
import { WorldFx } from "@/components/WorldFx";

export const Route = createRootRoute({
  component: () => (<AppShell><Outlet /><Toaster richColors position="top-center" /><WorldFx /></AppShell>),
  notFoundComponent: () => (
    <div className="py-20 text-center"><p className="text-6xl">🧭</p><h1 className="text-3xl font-bold">Lost in the forest!</h1>
      <Link to="/" className="mt-4 inline-block font-semibold text-primary underline">Back to Dashboard</Link></div>
  ),
});
