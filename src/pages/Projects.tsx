import React from 'react';
import { useCms } from '../context/CmsContext';
import { SectionHead, Ventures } from '../components/SharedSections';

export default function Projects() {
  const { data } = useCms();
  const pageCopy = data.pages.find((p) => p.page_slug === 'projects' && p.section_key === 'hero');

  const title = pageCopy?.title || 'Ventures and case studies';
  const subtitle = pageCopy?.subtitle || 'made to move.';
  const intro =
    pageCopy?.content ||
    'We use systems thinking to make products, platforms, and brands more useful in the real world.';

  return (
    <section className="section page-intro">
      <SectionHead
        label="Portfolio"
        title={title}
        accent={subtitle}
        copy={intro}
      />
      <Ventures />
    </section>
  );
}
