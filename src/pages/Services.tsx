import React from 'react';
import { site } from '../content';
import { SectionHead, ServiceList, Button } from '../components/SharedSections';

export default function Services() {
  return (
    <section className="section soft-section page-intro">
      <SectionHead
        label="Practice areas"
        title="Full-spectrum capabilities"
        accent="under one roof."
        copy="Digital craft and technology delivery, brought together around the work that will make the greatest difference."
      />
      <div className="service-category">
        <SectionHead
          label="01 / Digital services"
          title="Creative work that"
          accent="carries further."
        />
        <ServiceList items={site.digitalServices} />
      </div>
      <div className="service-category">
        <SectionHead
          label="02 / Information technology"
          title="Systems made"
          accent="to perform."
        />
        <ServiceList items={site.technologyServices} />
      </div>
      <div className="center-action">
        <Button solid>Book a consultation</Button>
      </div>
    </section>
  );
}
