import React from 'react';
import { UsersRound } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { SectionHead, EmptyState, LeaderSnapCard } from '../components/SharedSections';

export default function Leadership() {
  const { data } = useCms();
  const pageCopy = data.pages.find((p) => p.page_slug === 'leadership' && p.section_key === 'hero');

  const title = pageCopy?.title || 'A small team for';
  const subtitle = pageCopy?.subtitle || 'high-stakes work.';
  const intro =
    pageCopy?.content ||
    'Senior thinking stays close to the brief, the details, and the people making decisions.';

  const sortedLeaders = [...data.leadership].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <section className="section page-intro">
      <SectionHead
        as="h1"
        label="Leadership"
        title={title}
        accent={subtitle}
        copy={intro}
      />

      {sortedLeaders.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="Nothing here yet"
          subtitle="Studio leadership team profiles will appear here."
        />
      ) : (
        <div className="leader-snap-row" role="list" aria-label="Studio leadership team">
          {sortedLeaders.map((leader) => (
            <div key={leader.id || leader.name} role="listitem">
              <LeaderSnapCard leader={leader} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
