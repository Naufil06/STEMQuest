import { useEffect, useState } from "react";
import type { Kid } from "./sample";

/** Real student accounts from the server (refreshes every 15 s). null = still loading. */
export function useStudents(): Kid[] | null {
  const [list, setList] = useState<Kid[] | null>(null);
  useEffect(() => {
    let on = true;
    const load = () => fetch("/api/students", { credentials: "include" }).then((r) => r.json()).then((d) => on && setList((d.students ?? []).map((k: Kid) => ({ ...k, acc: k.acc ?? 0 })))).catch(() => on && setList([]));
    load();
    const t = setInterval(load, 15000);
    return () => { on = false; clearInterval(t); };
  }, []);
  return list;
}
