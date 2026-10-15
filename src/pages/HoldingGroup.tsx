import React from 'react';
import { useCms } from '../context/CmsContext';
import { SectionHead, icons } from '../components/SharedSections';

export default function HoldingGroup() {
  const { data } = useCms();
  const pageCopy = data.pages.find((p) => p.page_slug === 'holding-group' && p.section_key === 'hero');

  const title = pageCopy?.title || 'Companies built for';
  const subtitle = pageCopy?.subtitle || 'distinct worlds.';
  const intro =
    pageCopy?.content ||
    'GhreatnessLabs owns and supports ventures where thoughtful technology, culture, and community can create enduring value.';

  const sortedHolding = [...data.holding].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <section className="section page-intro">
      <SectionHead
        label="Holding group"
        title={title}
        accent={subtitle}
        copy={intro}
      />
      <div className="holding-grid">
        {sortedHolding.map((company, index) => {
          const Icon = icons[company.icon_name] || icons['building-2'];
          return (
            <article className={index % 2 ? 'holding-dark' : ''} key={company.id || company.company_name}>
              <span className="icon-badge">
                <Icon />
              </span>
              <span className="cap-index">{String(index + 1).padStart(2, '0')}</span>
              <h3>{company.company_name}</h3>
              <p>{company.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
