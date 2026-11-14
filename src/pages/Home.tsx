import React, { useEffect } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
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
            eyebrowVariant="hero"
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

          <div className="glance-block">
            <h2 className="glance-heading">Studio at a glance</h2>
            <div className="dispatch-card">
              <div className="dispatch-row">
                <span>Current availability</span>
                <strong>{settings.availabilityText}</strong>
              </div>
              <div className="dispatch-row">
                <span>Based in</span>
                <strong>{settings.officeCity}</strong>
              </div>
              <div className="dispatch-row">
                <span>Working with</span>
                <strong>Global teams</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Stats />
      <AboutPreview />

      <section className="section home-practice-section">
        <SectionHead
          label="Practice areas"
          title="Core capabilities"
          accent="for ambitious teams."
          copy="Cross-disciplinary expertise for organizations that need a system, not just a surface."
        />
        <Capabilities limit={3} />
        <div className="practice-link-wrap">
          <a href="/services" className="practice-view-all-btn">
            <span>View all services</span>
            <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
      </section>

      <LeadershipPreview />
      <Partners />

      <section className="section home-work-section">
        <SectionHead
          label="Our work"
          title="Check out the projects"
          accent="we've worked on."
          copy="Proprietary platforms, client software, and operational systems built to scale."
        />
        <Ventures limit={3} />
        <div className="section-link-wrap">
          <Button variant="link" href="/projects">
            <span>View all projects</span>
            <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
          </Button>
        </div>
      </section>

      <section className="section">
        <SectionHead
          label="Client perspectives"
          title="Trusted by teams"
          accent="around the world."
        />
        <Testimonials limit={2} />
        <div className="section-link-wrap">
          <Button variant="link" href="/clients">
            <span>Read all perspectives</span>
            <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
          </Button>
        </div>
      </section>

      <FaqSection />
    </>
  );
}
