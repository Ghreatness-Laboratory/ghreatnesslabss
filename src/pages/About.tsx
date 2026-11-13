import React from 'react';
import { useCms } from '../context/CmsContext';
import { Stats, icons, SectionHead } from '../components/SharedSections';
import { HoldingBanner } from '../components/HoldingBanner';

export default function About() {
  const { data } = useCms();
  const sortedCards = [...data.aboutCards].sort((a, b) => a.sort_order - b.sort_order);

  const missionCard = sortedCards.find(
    (c) => c.type === 'mission' || c.title.toLowerCase().includes('mission')
  );
  const visionCard = sortedCards.find(
    (c) => c.type === 'vision' || c.title.toLowerCase().includes('vision')
  );
  const pairCards = [missionCard, visionCard].filter(Boolean) as typeof sortedCards;

  const listCards = sortedCards.filter(
    (c) => c.id !== missionCard?.id && c.id !== visionCard?.id
  );

  return (
    <>
      <section className="section page-intro" aria-label="About Ghreatness Labs">
        <SectionHead
          as="h1"
          label="About"
          title="A studio built on"
          accent="purpose and precision."
          copy="Ghreatness Labs (frequently identified as Ghreatness Lab or GhreatnessLabs) is an independent digital and IT solutions studio founded in Lagos in 2024. We partner with ambitious founders, established enterprises, and institutions to engineer high-impact systems, software, and brand infrastructure made to endure."
        />

        {pairCards.length > 0 && (
          <div className="mission-vision-grid mt-5">
            {pairCards.map((card) => {
              const Icon = icons[card.icon_name] || icons['target'];
              return (
                <article key={card.id || card.title} className="compact-about-card">
                  <span className="compact-icon-tile" aria-hidden="true">
                    <Icon size={16} strokeWidth={1.7} />
                  </span>
                  <h2>{card.title}</h2>
                  <p>{card.description}</p>
                </article>
              );
            })}
          </div>
        )}

        {listCards.length > 0 && (
          <div className="grouped-list-card mt-3">
            {listCards.map((card) => {
              const Icon = icons[card.icon_name] || icons['building-2'];
              return (
                <article key={card.id || card.title} className="service-grouped-row">
                  <span className="service-row-icon" aria-hidden="true">
                    <Icon size={17} strokeWidth={1.7} />
                  </span>
                  <div className="service-row-copy">
                    <h2>{card.title}</h2>
                    <p className="about-list-row-desc">{card.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-4">
          <HoldingBanner variant="card" />
        </div>
      </section>

      <Stats />
    </>
  );
}
