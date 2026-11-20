// Types for the Annnimate Text Reveal (the component ships as JSX).
import type { ReactNode } from "react";

export type TextRevealProps = {
  className?: string;
  children?: ReactNode;
  type?: "lines" | "words" | "chars";
  start?: string;
  end?: string;
  scrub?: boolean | number;
  duration?: number;
  stagger?: number;
  ease?: string;
  yPercent?: number;
  markers?: boolean;
  onComplete?: () => void;
};

export default function TextReveal(props: TextRevealProps): React.JSX.Element;
