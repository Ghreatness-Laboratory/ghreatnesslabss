import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { SectionHead } from './SharedSections';

export function FaqSection({ limit }: { limit?: number }) {
  const { data } = useCms();

  const faqs = [...(data.faqs || [])].sort((a, b) => a.sort_order - b.sort_order);
  const displayFaqs = limit ? faqs.slice(0, limit) : faqs;
  const [openId, setOpenId] = useState<string | null>(() => displayFaqs[0]?.id ?? 'faq-engagements');

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
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
        {displayFaqs.map((faq) => {
          const isOpen = openId === faq.id;
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
                  <ChevronDown size={15} strokeWidth={2} className={`faq-chevron ${isOpen ? 'faq-chevron-rotated' : ''}`} />
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
