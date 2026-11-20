import type { ReactNode } from "react";

/** Standard opening block for inner pages: small label, a large title that rises from behind a mask, and a lead. */
export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <header className="intro shell pt-16 pb-12 md:pt-24 md:pb-20">
      <p className="eyebrow rise">{eyebrow}</p>
      <h1 className="mega mt-6 max-w-6xl text-[clamp(2.44rem,6.72vw,6.72rem)]">
        <span className="line">
          <span>{title}</span>
        </span>
      </h1>
      {children ? <div className="rise rise-3 mt-8 max-w-2xl text-lg text-muted md:text-xl">{children}</div> : null}
    </header>
  );
}
