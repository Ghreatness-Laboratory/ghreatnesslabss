import React from 'react';
import { Linkedin, Twitter, UsersRound } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { SectionHead, EmptyState } from '../components/SharedSections';
import { BlurImage } from '../components/BlurImage';

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
    <section className="section soft-section page-intro">
      <SectionHead
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
        <div className="team-grid">
          {sortedLeaders.map((leader, i) => {
            const initials = leader.name
              .split(' ')
              .map((x) => x[0])
              .join('');

            return (
              <article className={`team-card ${i % 2 ? 'team-dark' : ''}`} key={leader.id || leader.name}>
                <span className="team-avatar">
                  {leader.avatar_url ? (
                    <BlurImage
                      src={leader.avatar_url}
                      alt={leader.name}
                      fallbackText={initials}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    initials
                  )}
                </span>
                <div>
                  <h3>{leader.name}</h3>
                  <small>{leader.role}</small>
                  <p>{leader.bio}</p>
                  <div className="social-row">
                    {leader.social_links?.linkedin && (
                      <a
                        aria-label={`${leader.name} on LinkedIn`}
                        href={leader.social_links.linkedin}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Linkedin />
                      </a>
                    )}
                    {leader.social_links?.twitter && (
                      <a
                        aria-label={`${leader.name} on X`}
                        href={leader.social_links.twitter}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Twitter />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
