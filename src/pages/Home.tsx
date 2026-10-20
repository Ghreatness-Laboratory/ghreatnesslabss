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

export default function Home() {
  const { data } = useCms();
  const { settings, holding } = data;

  // Dynamically synchronize Schema.org Organization JSON-LD with live holding group & social links
  useEffect(() => {
    const primaryHolding = holding[0];
    const holdingName =
      settings.holdingGroupName?.trim() || primaryHolding?.company_name || 'Ghreatness Group';
    const holdingUrl =
      settings.holdingGroupUrl?.trim() ||
      primaryHolding?.website_url ||
      'https://group.ghreatnesslab.com.ng';

    const sameAsList = [
      settings.socialInstagram || 'https://instagram.com/ghreatnesslabs',
      settings.socialTwitter || 'https://x.com/ghreatnesslabs',
      settings.socialLinkedin || 'https://linkedin.com/company/ghreatnesslabs',
      holdingUrl,
    ].filter(Boolean);

    const orgSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'GhreatnessLabs',
      alternateName: [
        'Ghreatness Labs',
        'GhreatnessLab',
        'Ghreatness Lab',
        'Ghreatness Laboratory',
      ],
      url: 'https://www.ghreatnesslab.com.ng',
      logo: 'https://www.ghreatnesslab.com.ng/logo.png',
      foundingDate: '2024',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Lagos',
        addressCountry: 'NG',
      },
      parentOrganization: {
        '@type': 'Organization',
        name: holdingName,
        url: holdingUrl,
      },
      sameAs: sameAsList,
    };

    let scriptTag = document.getElementById('organization-jsonld') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'organization-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(orgSchema, null, 2);
  }, [settings, holding]);

  return (
    <>
      <section className="hero section">
        <div className="hero-copy">
          <SectionHead
            label={settings.heroEyebrow}
            title={settings.heroTitlePrimary}
            accent={settings.heroTitleSecondary}
            copy={settings.heroBody}
          />
          <div className="actions">
            <Button solid>Book a consultation</Button>
            <Button href="/projects">Explore case studies</Button>
          </div>
        </div>
        <div className="hero-aside">
          <div className="infrastructure-mark" aria-label="Live infrastructure status visual">
            <span className="infrastructure-live">LIVE</span>
            <span className="infrastructure-ring infrastructure-ring-outer" />
            <span className="infrastructure-ring infrastructure-ring-middle" />
            <span className="infrastructure-dot-ping" />
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <GhreatnessMark size={34} fill="#000000" className="hero-center-mark" />
            </div>

            {/* Orbiting nodes */}
            <div className="infrastructure-orbit orbit-1">
              <span className="orbit-node node-1" />
            </div>
            <div className="infrastructure-orbit orbit-2">
              <span className="orbit-node node-2" />
            </div>
            <div className="infrastructure-orbit orbit-3">
              <span className="orbit-node node-3" />
            </div>

            <span className="infrastructure-badge">Infrastructure</span>
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
          label="OUR WORK"
          title="Check out the projects"
          accent="we've worked on."
          copy="Proprietary platforms, client software, and operational systems built to scale."
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

      <FaqSection />
    </>
  );
}
