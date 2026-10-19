import React from 'react';
import { Download } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { SectionHead, ServiceList, Button } from '../components/SharedSections';

export default function Services() {
  const { data } = useCms();
  const { settings } = data;
  const pageCopy = data.pages.find((p) => p.page_slug === 'services' && p.section_key === 'hero');

  const title = pageCopy?.title || 'Full-spectrum capabilities';
  const subtitle = pageCopy?.subtitle || 'under one roof.';
  const intro =
    pageCopy?.content ||
    'Digital craft and technology delivery, brought together around the work that will make the greatest difference.';

  const digitalServices = data.services
    .filter((s) => s.category === 'digital')
    .sort((a, b) => a.sort_order - b.sort_order);

  const technologyServices = data.services
    .filter((s) => s.category === 'technology')
    .sort((a, b) => a.sort_order - b.sort_order);

  const deckUrl = settings.capabilityDeckUrl || '/GhreatnessLabs-Services-Overview.pdf';

  return (
    <section className="section soft-section page-intro">
      <SectionHead
        label="Practice areas"
        title={title}
        accent={subtitle}
        copy={intro}
      />

      <div className="services-action-bar">
        <Button solid>Book a consultation</Button>
        <a
          href={deckUrl}
          download="GhreatnessLabs-Services-Overview.pdf"
          className="button download-deck-btn"
          aria-label="Download our services overview PDF"
        >
          <Download size={14} />
          <span>Download our services overview</span>
        </a>
      </div>

      <div className="service-category">
        <SectionHead
          label="01 / Digital services"
          title="Creative work that"
          accent="carries further."
        />
        <ServiceList items={digitalServices} />
      </div>

      <div className="service-category">
        <SectionHead
          label="02 / Information technology"
          title="Systems made"
          accent="to perform."
        />
        <ServiceList items={technologyServices} />
      </div>

      <div className="center-action services-footer-action">
        <Button solid>Book a consultation</Button>
        <a
          href={deckUrl}
          download="GhreatnessLabs-Services-Overview.pdf"
          className="button download-deck-btn"
        >
          <Download size={14} />
          <span>Download our services overview</span>
        </a>
      </div>
    </section>
  );
}
