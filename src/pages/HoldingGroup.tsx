import React, { useState } from 'react';
import { Building2, ArrowUpRight } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { SectionHead, icons, EmptyState } from '../components/SharedSections';
import { HoldingBanner } from '../components/HoldingBanner';
import { HoldingItem } from '../types/cms';

function HoldingCompanyCard({
  company,
  index,
}: {
  company: HoldingItem;
  index: number;
}) {
  const [logoFailed, setLogoFailed] = useState(!company.logo_url);
  const Icon = icons[company.icon_name] || Building2;

  return (
    <article className="holding-card-item">
      <div className="holding-card-top">
        <span className="service-row-icon overflow-hidden">
          {company.logo_url && !logoFailed ? (
            <img
              src={company.logo_url}
              alt={`${company.company_name} logo`}
              className="w-full h-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
              onLoad={(e) => {
                if (e.currentTarget.naturalWidth === 0) setLogoFailed(true);
              }}
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <Icon size={17} strokeWidth={1.7} />
          )}
        </span>
        <span className="service-row-index">{String(index + 1).padStart(2, '0')}</span>
      </div>
      <h3>{company.company_name}</h3>
      <p>{company.description}</p>
      {company.website_url && (
        <div className="holding-card-footer">
          <a
            href={company.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="holding-site-link"
            aria-label={`Visit ${company.company_name} website (opens in a new tab)`}
          >
            <span>Visit {company.company_name}</span>
            <ArrowUpRight size={13} strokeWidth={1.7} aria-hidden="true" />
          </a>
        </div>
      )}
    </article>
  );
}

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
        as="h1"
        label="Holding group"
        title={title}
        accent={subtitle}
        copy={intro}
      />

      <div className="holding-banner-wrap">
        <HoldingBanner variant="banner" />
      </div>

      {sortedHolding.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Nothing here yet"
          subtitle="Holding group companies and ventures will appear here."
        />
      ) : (
        <div className="holding-grid">
          {sortedHolding.map((company, index) => (
            <HoldingCompanyCard
              key={company.id || company.company_name}
              company={company}
              index={index}
            />
          ))}
        </div>
      )}
    </section>
  );
}
