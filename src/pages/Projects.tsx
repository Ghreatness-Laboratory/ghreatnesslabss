import React from 'react';
import { SectionHead, Ventures } from '../components/SharedSections';

export default function Projects() {
  return (
    <section className="section page-intro">
      <SectionHead
        label="Portfolio"
        title="Ventures and case studies"
        accent="made to move."
        copy="We use systems thinking to make products, platforms, and brands more useful in the real world."
      />
      <Ventures />
    </section>
  );
}
