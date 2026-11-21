// Types for the Annnimate Accordion (the component ships as JSX).
import type { ReactNode, RefObject } from "react";

export type AccordionRender = {
  toggle: () => void;
  isOpen: boolean;
  contentRef: RefObject<HTMLDivElement | null>;
  iconRef: RefObject<SVGSVGElement | null>;
  verticalBarRef: RefObject<SVGPathElement | null>;
};

export type AccordionProps = {
  className?: string;
  children?: ReactNode;
  allowMultiple?: boolean;
  duration?: number;
  ease?: string;
  iconMode?: "rotate" | "fade" | "both";
  iconRotation?: number;
};

export type AccordionItemProps = {
  children: ReactNode | ((api: AccordionRender) => ReactNode);
  defaultOpen?: boolean;
  duration?: number;
  ease?: string;
  iconMode?: "rotate" | "fade" | "both";
  iconRotation?: number;
  enableStagger?: boolean;
  staggerDuration?: number;
  staggerDelay?: number;
  staggerEase?: string;
  staggerYPercent?: number;
  staggerStartDelay?: number;
  onOpen?: () => void;
  onClose?: () => void;
};

declare const Accordion: ((props: AccordionProps) => React.JSX.Element) & {
  Item: (props: AccordionItemProps) => React.JSX.Element;
};
export default Accordion;
