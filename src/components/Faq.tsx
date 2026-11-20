"use client";

import Accordion, { type AccordionRender } from "./annnimate/accordion";

export type FaqItem = { q: string; a: string };

/** Questions and answers on the Annnimate Accordion. One open at a time. */
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <Accordion className="aa-faq" allowMultiple={false} duration={0.8} ease="expo.inOut" iconMode="both" iconRotation={-180}>
      {items.map((item, i) => (
        <Accordion.Item
          key={item.q}
          defaultOpen={i === 0}
          duration={0.8}
          ease="expo.inOut"
          iconMode="both"
          iconRotation={-180}
          enableStagger
          staggerDuration={0.6}
          staggerDelay={0.12}
          staggerEase="expo.out"
          staggerYPercent={110}
          staggerStartDelay={200}
        >
          {({ toggle, isOpen, contentRef, iconRef, verticalBarRef }: AccordionRender) => (
            <>
              <h3>
                <button type="button" onClick={toggle} className="accordion_trigger" aria-expanded={isOpen}>
                  <span className="accordion_title">{item.q}</span>
                  <svg ref={iconRef} className="accordion_icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path ref={verticalBarRef} d="M8 1V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M1 8H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </h3>
              <div ref={contentRef} className="accordion_content">
                <p className="accordion_text">{item.a}</p>
              </div>
            </>
          )}
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
