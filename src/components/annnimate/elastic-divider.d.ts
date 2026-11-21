// Types for the Annnimate Elastic Divider (the component ships as JSX).
import type { ForwardRefExoticComponent, RefAttributes } from "react";

export type ElasticDividerProps = {
  className?: string;
  color?: string;
  weight?: number;
  frequency?: number;
  damping?: number;
  sensitivity?: number;
  maxAmplitude?: number;
  disable?: string;
};

declare const ElasticDivider: ForwardRefExoticComponent<ElasticDividerProps & RefAttributes<unknown>>;
export default ElasticDivider;
