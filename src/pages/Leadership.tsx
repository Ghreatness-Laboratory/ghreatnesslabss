import React from 'react';
import { Linkedin, Twitter, UsersRound } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { SectionHead, EmptyState } from '../components/SharedSections';
import { BlurImage } from '../components/BlurImage';
import { slugify } from '../components/admin/LinksManager';

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
            const slug = leader.slug || slugify(leader.name);
            const profileUrl = `/leadership/${slug}`;

            return (
              <article
                className={`team-card ${i % 2 ? 'team-dark' : ''}`}
                key={leader.id || leader.name}
              >
                <a
                  href={profileUrl}
                  className="team-avatar-link"
                  aria-label={`View full profile of ${leader.name}, ${leader.role}`}
                >
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
                </a>
                <div className="team-card-content">
                  <h3>
                    <a href={profileUrl} className="team-name-link">
                      {leader.name}
                    </a>
                  </h3>
                  <small className="team-role-label">{leader.role}</small>
                  <p className="team-bio-text">{leader.bio}</p>

                  <div className="team-card-footer">
                    <a
                      href={profileUrl}
                      className="team-view-profile-btn"
                      aria-label={`Read full biography of ${leader.name}`}
                    >
                      <span>Read profile</span>
                      <span aria-hidden="true">→</span>
                    </a>

                    <div className="social-row">
                      {leader.social_links?.linkedin && (
                        <a
                          aria-label={`Visit ${leader.name}'s LinkedIn profile (opens in new tab)`}
                          href={leader.social_links.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-icon-tap"
                        >
                          <Linkedin size={16} />
                        </a>
                      )}
                      {leader.social_links?.twitter && (
                        <a
                          aria-label={`Follow ${leader.name} on X (opens in new tab)`}
                          href={leader.social_links.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-icon-tap"
                        >
                          <Twitter size={16} />
                        </a>
                      )}
                    </div>
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
