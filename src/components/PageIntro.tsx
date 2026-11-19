import type { ReactNode } from "react";

/** Standard opening block for inner pages. */
export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <header className="shell pt-16 pb-12 md:pt-24 md:pb-16">
      <p className="eyebrow rise">{eyebrow}</p>
      <h1 className="rise rise-2 mt-5 max-w-4xl text-5xl md:text-7xl">{title}</h1>
      {children ? <div className="rise rise-3 mt-7 max-w-2xl text-lg text-muted">{children}</div> : null}
    </header>
  );
}
