import React from 'react';
import { Building2 } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { SectionHead, Testimonials, EmptyState } from '../components/SharedSections';

export default function Clients() {
  const { data } = useCms();
  const pageCopy = data.pages.find((p) => p.page_slug === 'clients' && p.section_key === 'hero');

  const title = pageCopy?.title || 'Partners with';
  const subtitle = pageCopy?.subtitle || 'a point of view.';
  const intro =
    pageCopy?.content ||
    'We work with organizations that see design and technology as a meaningful advantage.';

  const sortedClients = [...data.clients].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <section className="section page-intro">
      <SectionHead
        label="Clients"
        title={title}
        accent={subtitle}
        copy={intro}
      />
      {sortedClients.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Nothing here yet"
          subtitle="Partners and client ventures will be featured here."
        />
      ) : (
        <div className="client-list">
          {sortedClients.map((client) => (
            <span key={client.id || client.name} className="p-3 flex items-center justify-center">
              {client.logo_url ? (
                <img
                  src={client.logo_url}
                  alt={`${client.name} logo`}
                  className="max-h-12 max-w-[130px] object-contain filter grayscale hover:grayscale-0 transition-all duration-200"
                  loading="lazy"
                />
              ) : (
                client.name
              )}
            </span>
          ))}
        </div>
      )}
      <div className="testimonials-section">
        <SectionHead
          label="Client perspectives"
          title="Trusted across"
          accent="markets and moments."
        />
        <Testimonials />
      </div>
    </section>
  );
}
