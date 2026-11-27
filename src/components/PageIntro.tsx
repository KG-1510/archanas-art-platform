import type { ReactNode } from "react";

/** Standard opening block for inner pages: small label, a large title that rises from behind a mask, and a lead. */
export function PageIntro({
  eyebrow,
  title,
  children,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  /** Smaller title and less space, for pages whose content should show in the first screen. */
  compact?: boolean;
}) {
  return (
    <header className={`intro shell ${compact ? "pt-12 pb-10 md:pt-16 md:pb-12" : "pt-16 pb-12 md:pt-24 md:pb-20"}`}>
      <p className="eyebrow rise">{eyebrow}</p>
      <h1 className={`mega max-w-6xl ${compact ? "mt-5 text-[clamp(2.2rem,4.2vw,4rem)]" : "mt-6 text-[clamp(2.44rem,6.72vw,6.72rem)]"}`}>
        <span className="line">
          <span>{title}</span>
        </span>
      </h1>
      {children ? (
        <div className={`rise rise-3 max-w-2xl text-lg text-muted ${compact ? "mt-5" : "mt-8 md:text-xl"}`}>{children}</div>
      ) : null}
    </header>
  );
}
