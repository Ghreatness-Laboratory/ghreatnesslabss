import { Building2, ExternalLink } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { SectionHead, icons, EmptyState } from '../components/SharedSections';
import { HoldingBanner } from '../components/HoldingBanner';

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

      {/* Main Parent Holding Collective Banner */}
      <div className="my-8">
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
          {sortedHolding.map((company, index) => {
            const Icon = icons[company.icon_name] || icons['building-2'];
            return (
              <article className={`holding-card-item ${index % 2 ? 'holding-dark' : ''}`} key={company.id || company.company_name}>
                <div className="flex items-center justify-between mb-3">
                  <span className="icon-badge">
                    {company.logo_url ? (
                      <img
                        src={company.logo_url}
                        alt={`${company.company_name} logo`}
                        className="w-5 h-5 object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <Icon />
                    )}
                  </span>
                  <span className="cap-index">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3>{company.company_name}</h3>
                <p>{company.description}</p>
                {company.website_url && (
                  <div className="mt-4 pt-3 border-t border-neutral-200">
                    <a
                      href={company.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="holding-site-link"
                      aria-label={`Visit ${company.company_name} website (opens in a new tab)`}
                    >
                      <span>Visit {company.company_name}</span>
                      <ExternalLink size={13} aria-hidden="true" />
                    </a>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
