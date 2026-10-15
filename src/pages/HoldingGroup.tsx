import React from 'react';
import { site } from '../content';
import { SectionHead, icons } from '../components/SharedSections';

export default function HoldingGroup() {
  return (
    <section className="section page-intro">
      <SectionHead
        label="Holding group"
        title="Companies built for"
        accent="distinct worlds."
        copy="GhreatnessLabs owns and supports ventures where thoughtful technology, culture, and community can create enduring value."
      />
      <div className="holding-grid">
        {site.holding.map(([name, description, icon], index) => {
          const Icon = icons[icon];
          return (
            <article className={index % 2 ? 'holding-dark' : ''} key={name}>
              <span className="icon-badge">
                {Icon && <Icon />}
              </span>
              <span className="cap-index">{String(index + 1).padStart(2, '0')}</span>
              <h3>{name}</h3>
              <p>{description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
