import React from 'react';
import { Linkedin, Twitter } from 'lucide-react';
import { site } from '../content';
import { SectionHead } from '../components/SharedSections';

export default function Leadership() {
  return (
    <section className="section soft-section page-intro">
      <SectionHead
        label="Leadership"
        title="A small team for"
        accent="high-stakes work."
        copy="Senior thinking stays close to the brief, the details, and the people making decisions."
      />
      <div className="team-grid">
        {site.team.map(([name, role, bio], i) => (
          <article className={`team-card ${i % 2 ? 'team-dark' : ''}`} key={name}>
            <span className="team-avatar">
              {name
                .split(' ')
                .map((x) => x[0])
                .join('')}
            </span>
            <div>
              <h3>{name}</h3>
              <small>{role}</small>
              <p>{bio}</p>
              <div className="social-row">
                <a
                  aria-label={`${name} on LinkedIn`}
                  href="https://www.linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Linkedin />
                </a>
                <a
                  aria-label={`${name} on X`}
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Twitter />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
