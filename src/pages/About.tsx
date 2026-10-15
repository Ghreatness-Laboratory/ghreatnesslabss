import React from 'react';
import { useCms } from '../context/CmsContext';
import { SectionHead, Stats, icons } from '../components/SharedSections';

export default function About() {
  const { data } = useCms();
  const pageCopy = data.pages.find((p) => p.page_slug === 'about' && p.section_key === 'hero');

  const title = pageCopy?.title || 'Built in Lagos for';
  const subtitle = pageCopy?.subtitle || 'important work.';
  const intro =
    pageCopy?.content ||
    'We are an independent digital and IT solutions studio for teams that need clarity, craft, and capable delivery in equal measure.';

  const sortedCards = [...data.aboutCards].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <>
      <section className="section page-intro">
        <SectionHead
          label="About GhreatnessLabs"
          title={title}
          accent={subtitle}
          copy={intro}
        />
        <div className="story-grid">
          {sortedCards.map((card, index) => {
            const Icon = icons[card.icon_name] || icons['building-2'];
            return (
              <article key={card.id || card.title} className={index % 2 === 1 ? 'story-dark' : ''}>
                <span className="icon-badge">
                  <Icon />
                </span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            );
          })}
        </div>
      </section>
      <Stats />
    </>
  );
}
