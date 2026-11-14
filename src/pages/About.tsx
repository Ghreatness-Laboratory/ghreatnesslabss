import React from 'react';
import { useCms } from '../context/CmsContext';
import { Stats, icons, SectionHead, InfoCard } from '../components/SharedSections';
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
      <section className="section page-intro about-page-section" aria-label="About Ghreatness Labs">
        <SectionHead
          as="h1"
          label="About"
          title="A studio built on"
          accent="purpose and precision."
          copy="Ghreatness Labs (frequently identified as Ghreatness Lab or GhreatnessLabs) is an independent digital and IT solutions studio founded in Lagos in 2024. We partner with ambitious founders, established enterprises, and institutions to engineer high-impact systems, software, and brand infrastructure made to endure."
        />

        {pairCards.length > 0 && (
          <div className="mission-vision-grid">
            {pairCards.map((card) => {
              const isMission = card.type === 'mission' || card.title.toLowerCase().includes('mission');
              const isVision = card.type === 'vision' || card.title.toLowerCase().includes('vision');
              return (
                <InfoCard
                  key={card.id || card.title}
                  iconName={card.icon_name}
                  title={card.title}
                  description={card.description}
                  fallbackIcon="target"
                  tags={isMission ? ['Strategy', 'Identity', 'Product'] : isVision ? ['Engineering', 'Infrastructure'] : undefined}
                />
              );
            })}
          </div>
        )}

        {listCards.length > 0 && (
          <div className="about-compact-stack">
            {listCards.map((card) => {
              const Icon = icons[card.icon_name] || icons['building-2'];
              return (
                <article key={card.id || card.title} className="about-horizontal-card">
                  <span className="about-horizontal-icon" aria-hidden="true">
                    <Icon size={16} strokeWidth={2} />
                  </span>
                  <div className="about-horizontal-body">
                    <h2>{card.title}</h2>
                    <p>{card.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="about-holding-wrap">
          <HoldingBanner variant="card" />
        </div>
      </section>

      <Stats />
    </>
  );
}
