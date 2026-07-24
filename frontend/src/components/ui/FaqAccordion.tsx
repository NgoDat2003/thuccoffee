import { useState } from 'react';
import type { FaqItem } from '../../data/pages';

interface FaqAccordionProps {
  items: FaqItem[];
}

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-gray-200 border-y border-gray-200">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between py-4 text-left font-medium text-gray-800"
            >
              {item.q}
              <span className="ml-4 shrink-0 text-primary">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && <p className="pb-4 text-gray-600">{item.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
