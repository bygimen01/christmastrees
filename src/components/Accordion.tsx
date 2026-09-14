import { useState } from "react";
import { ChevronDown } from "lucide-react";

type AccordionProps = {
  items: ReadonlyArray<readonly [string, string]>;
};

export function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="accordion">
      {items.map(([title, text], index) => {
        const open = openIndex === index;

        return (
          <div className="accordion-item" key={title}>
            <h3>
              <button
                className="accordion-trigger"
                type="button"
                aria-expanded={open}
                aria-controls={`accordion-panel-${index}`}
                onClick={() => setOpenIndex(open ? -1 : index)}
              >
                <span>{title}</span>
                <ChevronDown aria-hidden="true" />
              </button>
            </h3>
            <div id={`accordion-panel-${index}`} className="accordion-panel" hidden={!open}>
              <p>{text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
