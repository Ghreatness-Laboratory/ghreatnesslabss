import React, { useEffect } from 'react';
import { useCms } from '../context/CmsContext';
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
import { FaqSection } from '../components/FaqSection';
import { GhreatnessMark } from '../components/GhreatnessLogo';
import { ensureOrganizationJsonLd } from '../lib/ogImage';

export default function Home() {
  const { data } = useCms();
  const { settings } = data;

  useEffect(() => {
    ensureOrganizationJsonLd();
  }, []);

  return (
    <>
      <section className="hero section">
        <div className="hero-copy">
          <SectionHead
            as="h1"
            label={settings.heroEyebrow}
            title={settings.heroTitlePrimary}
            accent={settings.heroTitleSecondary}
            copy={settings.heroBody}
          />
          <div className="actions hero-actions">
            <Button solid>Book a consultation</Button>
            <Button href="/projects">Case studies</Button>
          </div>
        </div>

        <div className="hero-aside">
          <div className="infrastructure-mark" aria-label="Live infrastructure status visual">
            <span className="infrastructure-live">
              <span className="live-status-dot" aria-hidden="true" />
              <span>LIVE</span>
            </span>

            <span className="infrastructure-ring infrastructure-ring-outer" />
            <span className="infrastructure-ring infrastructure-ring-middle" />
            <span className="infrastructure-dot-ping" />

            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <GhreatnessMark size={26} theme="light" className="hero-center-mark" />
            </div>

            <div className="infrastructure-orbit orbit-1">
              <span className="orbit-node node-1" />
            </div>
            <div className="infrastructure-orbit orbit-2">
              <span className="orbit-node node-2" />
            </div>
            <div className="infrastructure-orbit orbit-3">
              <span className="orbit-node node-3" />
            </div>

            <span className="infrastructure-badge">INFRASTRUCTURE</span>
          </div>

          <div className="dispatch">
            <b>Studio at a glance</b>
            <p>
              Current availability <strong>{settings.availabilityText}</strong>
            </p>
            <p>
              Based in <strong>{settings.officeCity}</strong>
            </p>
            <p>
              Working with <strong>Global teams</strong>
            </p>
          </div>
        </div>
      </section>

      <Stats />
      <AboutPreview />

      <section className="section">
        <SectionHead
          label="Practice areas"
          title="Core capabilities"
          accent="for ambitious teams."
          copy="Cross-disciplinary expertise for organizations that need a system, not just a surface."
        />
        <Capabilities limit={3} />
        <div className="mt-4">
          <Button href="/services">View all services</Button>
        </div>
      </section>

      <LeadershipPreview />
      <Partners />

      <section className="section">
        <SectionHead
          label="Our work"
          title="Check out the projects"
          accent="we've worked on."
          copy="Proprietary platforms, client software, and operational systems built to scale."
        />
        <Ventures limit={3} />
        <div className="mt-4">
          <Button href="/projects">View all projects</Button>
        </div>
      </section>

      <section className="section">
        <SectionHead
          label="Client perspectives"
          title="Trusted by teams"
          accent="around the world."
        />
        <Testimonials limit={2} />
        <div className="mt-4">
          <Button href="/clients">Read all perspectives</Button>
        </div>
      </section>

      <FaqSection />
    </>
  );
}
