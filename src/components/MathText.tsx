// Shows "3/4" as a stacked textbook fraction anywhere inside a line of text.
export function MathText({ children }: { children: string }) {
  return <>{children.split(/(\d+\/\d+|\?\/\d+)/).map((p, i) => {
    if (!/^(\d+|\?)\/\d+$/.test(p)) return p;
    const [n, d] = p.split("/");
    return <span key={i} className="mx-0.5 inline-flex flex-col items-center align-middle text-[0.8em] leading-tight"><span className="border-b-2 border-current px-1">{n}</span><span className="px-1">{d}</span></span>;
  })}</>;
}
