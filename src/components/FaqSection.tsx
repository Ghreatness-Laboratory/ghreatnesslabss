import React, { useState } from 'react';
import { ChevronDown, Plus, Minus, HelpCircle } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { SectionHead } from './SharedSections';

export function FaqSection({ limit }: { limit?: number }) {
  const { data } = useCms();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'faq-engagements': true, // Open the first item by default
  });

  const faqs = [...(data.faqs || [])].sort((a, b) => a.sort_order - b.sort_order);
  const displayFaqs = limit ? faqs.slice(0, limit) : faqs;

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section className="section faq-section" id="faq" aria-labelledby="faq-heading">
      <SectionHead
        label="Clarity & Process"
        title="Frequently asked"
        accent="questions."
        copy="Everything you need to know about partnering with GhreatnessLabs, from scoping and timelines to pricing models and ongoing DevOps."
      />

      <div className="faq-accordion-container" role="region" aria-label="Frequently Asked Questions Accordion">
        {displayFaqs.map((faq, index) => {
          const isOpen = Boolean(openItems[faq.id] ?? (index === 0 && openItems['faq-engagements'] === undefined));
          const contentId = `faq-content-${faq.id}`;
          const triggerId = `faq-trigger-${faq.id}`;

          return (
            <div
              key={faq.id}
              className={`faq-row ${isOpen ? 'faq-row-open' : ''}`}
            >
              <button
                type="button"
                id={triggerId}
                aria-expanded={isOpen}
                aria-controls={contentId}
                className="faq-trigger"
                onClick={() => toggleItem(faq.id)}
              >
                <span className="faq-question-text">{faq.question}</span>
                <span className="faq-icon-wrapper" aria-hidden="true">
                  <ChevronDown className={`faq-chevron ${isOpen ? 'faq-chevron-rotated' : ''}`} />
                </span>
              </button>

              <div
                id={contentId}
                role="region"
                aria-labelledby={triggerId}
                className={`faq-collapsible ${isOpen ? 'faq-collapsible-open' : ''}`}
              >
                <div className="faq-collapsible-inner">
                  <p className="faq-answer-text">{faq.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FaqSection;
