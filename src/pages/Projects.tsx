import React from 'react';
import { useCms } from '../context/CmsContext';
import { SectionHead, Ventures } from '../components/SharedSections';

export default function Projects() {
  const { data } = useCms();
  const pageCopy = data.pages.find((p) => p.page_slug === 'projects' && p.section_key === 'hero');

  const title = pageCopy?.title || "Check out the projects we've worked on";
  const intro =
    pageCopy?.content ||
    'Selected platforms, technological infrastructure, and digital systems engineered by GhreatnessLabs in Lagos for ambitious teams.';

  return (
    <section className="section page-intro projects-page-section">
      <SectionHead
        label="OUR WORK"
        title={title}
        copy={intro}
      />
      <Ventures />
    </section>
  );
}
