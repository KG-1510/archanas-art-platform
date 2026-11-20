// Types for the Annnimate Rotating Words (the component ships as JSX).
import type { ForwardRefExoticComponent, RefAttributes } from "react";

export type RotatingWordsProps = {
  className?: string;
  words?: string[];
  scrub?: boolean;
  spin?: number;
  settle?: number;
  step?: number;
  hold?: number;
  snap?: boolean;
  snapDelay?: number;
  start?: string;
  once?: boolean;
  nav?: boolean;
  blur?: number;
  disable?: string;
  trackRef?: React.RefObject<HTMLElement | null>;
};

declare const RotatingWords: ForwardRefExoticComponent<
  RotatingWordsProps & RefAttributes<unknown>
>;
export default RotatingWords;
