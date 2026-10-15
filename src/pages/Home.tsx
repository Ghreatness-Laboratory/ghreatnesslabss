import React from 'react';
import { site } from '../content';
import {
  SectionHead,
  Button,
  Stats,
  AboutPreview,
  Capabilities,
  LeadershipPreview,
  Partners,
  Ventures,
  Testimonials,
} from '../components/SharedSections';

export default function Home() {
  return (
    <>
      <section className="hero section">
        <div className="hero-copy">
          <SectionHead
            label={site.hero.eyebrow}
            title={site.hero.title.primary}
            accent={site.hero.title.secondary}
            copy={site.hero.body}
          />
          <div className="actions">
            <Button solid>Book a consultation</Button>
            <Button href="/projects">Explore case studies</Button>
          </div>
        </div>
        <div className="hero-aside">
          <div className="infrastructure-mark">
            <span className="infrastructure-ring infrastructure-ring-outer" />
            <span className="infrastructure-ring infrastructure-ring-middle" />
            <span className="infrastructure-dot" />
            <span className="infrastructure-badge">Infrastructure</span>
          </div>
          <div className="dispatch">
            <b>Studio at a glance</b>
            <p>
              Current availability <strong>Q2 projects</strong>
            </p>
            <p>
              Based in <strong>Lagos, Nigeria</strong>
            </p>
            <p>
              Working with <strong>Global teams</strong>
            </p>
          </div>
        </div>
      </section>

      <Stats />
      <AboutPreview />

      <section className="section soft-section">
        <SectionHead
          label="Practice areas"
          title="Core capabilities"
          accent="for ambitious teams."
          copy="Cross-disciplinary expertise for organizations that need a system, not just a surface."
        />
        <Capabilities limit={3} />
        <Button href="/services">View all services</Button>
      </section>

      <LeadershipPreview />
      <Partners />

      <section className="section">
        <SectionHead
          label="Selected ventures"
          title="Products with"
          accent="purpose."
        />
        <Ventures limit={3} />
        <Button href="/projects">View all projects</Button>
      </section>

      <section className="section soft-section">
        <SectionHead
          label="Client perspectives"
          title="Trusted by teams"
          accent="around the world."
        />
        <Testimonials limit={2} />
        <Button href="/clients">Read all perspectives</Button>
      </section>
    </>
  );
}
