import React from 'react';
import { MapPin, Shield } from 'lucide-react';
import { pages, Label, Button, Link } from './SharedSections';
import { useCms } from '../context/CmsContext';
import { GhreatnessLogo } from './GhreatnessLogo';
import { HoldingBanner } from './HoldingBanner';

export function Footer() {
  const { data } = useCms();
  const { settings } = data;

  return (
    <footer>
      <section className="cta">
        <Label>Start a conversation</Label>
        <h2 className="section-heading">
          Let us build your <em>next important thing.</em>
        </h2>
        <p>Start with a confidential, no-obligation consultation.</p>
        <div className="actions">
          <Button solid>Book a consultation</Button>
          <a className="button" href={`mailto:${settings.contactEmail}`}>
            {settings.contactEmail}
          </a>
        </div>
      </section>

      {/* Holding Group Affiliation Banner near Footer */}
      <div className="footer-holding-wrap">
        <HoldingBanner variant="footer" />
      </div>

      <div className="footer-grid">
        <div className="footer-brand-col">
          <Link to="/" className="inline-block mb-3" aria-label="Ghreatness Laboratory Home">
            <GhreatnessLogo variant="full" height={42} />
          </Link>
          <p>{settings.footerTagline}</p>
        </div>
        <div className="footer-links">
          {pages.slice(1).map(([to, name]) => (
            <Link key={to} to={to}>
              {name}
            </Link>
          ))}
        </div>
        <div>
          <small>{settings.officeCity} HQ</small>
          <p className="footer-address">
            <MapPin />{' '}
            <span>
              {settings.officeAddress}
              <br />
              {settings.officeCity}
            </span>
          </p>
        </div>
      </div>

      <div className="legal">
        <span>{settings.copyrightText}</span>
        <div className="legal-links">
          <span>Privacy · Terms · Accessibility</span>
          <Link to="/admin" className="admin-footer-link">
            <Shield size={12} />
            <span>Admin CMS</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
