import React from 'react';
import { site } from '../content';
import { SectionHead, Testimonials } from '../components/SharedSections';

export default function Clients() {
  return (
    <section className="section page-intro">
      <SectionHead
        label="Clients"
        title="Partners with"
        accent="a point of view."
        copy="We work with organizations that see design and technology as a meaningful advantage."
      />
      <div className="client-list">
        {site.clients.map((client) => (
          <span key={client}>{client}</span>
        ))}
      </div>
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
