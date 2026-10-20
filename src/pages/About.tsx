import React from 'react';
import { useCms } from '../context/CmsContext';
import { Stats, icons } from '../components/SharedSections';
import { HoldingBanner } from '../components/HoldingBanner';

export default function About() {
  const { data } = useCms();
  const sortedCards = [...data.aboutCards].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <>
      <section className="section page-intro" aria-label="About GhreatnessLabs">
        <p className="eyebrow-label">— ABOUT</p>
        <h1 className="about-heading-26">
          A studio built on <span className="text-secondary-muted">purpose and precision.</span>
        </h1>
        <p className="about-body-14">
          GhreatnessLabs, also known as Ghreatness Laboratory, is an independent digital and IT solutions studio founded in Lagos in 2024. We partner with ambitious founders, established enterprises, and institutions to engineer high-impact systems, software, and brand infrastructure made to endure.
        </p>

        {/* Holding Group Affiliation Banner */}
        <div className="my-8">
          <HoldingBanner variant="card" />
        </div>

        <div className="story-grid">
          {sortedCards.map((card) => {
            const Icon = icons[card.icon_name] || icons['building-2'];
            const isHowWeStarted = card.title.toLowerCase().includes('started');
            return (
              <article
                key={card.id || card.title}
                className={isHowWeStarted ? 'how-we-started-card' : 'about-card-standard'}
              >
                <span className="feature-icon-tile" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <div className="about-card-body">
                  <h2 className="how-we-started-title">{card.title}</h2>
                  <p className="how-we-started-desc">{card.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <Stats />
    </>
  );
}
