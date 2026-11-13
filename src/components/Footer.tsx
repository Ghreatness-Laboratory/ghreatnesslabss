import React from 'react';
import { MapPin, Shield, ArrowUpRight } from 'lucide-react';
import { pages, Label, Button, Link } from './SharedSections';
import { useCms } from '../context/CmsContext';
import { GhreatnessMark } from './GhreatnessLogo';
import { HoldingBanner } from './HoldingBanner';

export function Footer() {
  const { data } = useCms();
  const { settings } = data;

  return (
    <footer className="app-footer">
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

      <div className="footer-holding-wrap">
        <HoldingBanner variant="footer" />
      </div>

      <div className="footer-grid">
        <div className="footer-brand-col">
          <Link to="/" className="app-brand-lockup mb-3" aria-label="Ghreatness Labs Home">
            <GhreatnessMark size={24} theme="dark" />
            <span className="app-brand-wordmark">
              <span className="app-brand-title">GHREATNESS</span>
              <span className="app-brand-sub">LABORATORY</span>
            </span>
          </Link>
          <p>
            {settings.footerTagline ||
              'Ghreatness Labs (Ghreatness Lab) — digital systems and brand experiences engineered from Lagos for the world.'}
          </p>
        </div>

        <div className="footer-links">
          {pages
            .filter(([to]) => to !== '/' && to !== '/admin')
            .map(([to, name]) => (
              <Link key={to} to={to} className="footer-nav-link">
                <span>{name}</span>
                <ArrowUpRight size={12} strokeWidth={1.7} aria-hidden="true" />
              </Link>
            ))}
        </div>

        <div className="footer-hq-col">
          <small>{settings.officeCity} HQ</small>
          <p className="footer-address">
            <MapPin size={14} strokeWidth={1.7} aria-hidden="true" />
            <span>
              {settings.officeAddress}
              <br />
              {settings.officeCity}
            </span>
          </p>
        </div>
      </div>

      <div className="legal">
        <span>
          {settings.copyrightText || '© 2026 Ghreatness Labs (Ghreatness Lab). All rights reserved.'}
        </span>
        <div className="legal-links">
          <span>Privacy · Terms · Accessibility</span>
          <Link to="/admin" className="admin-footer-link">
            <Shield size={12} strokeWidth={1.7} aria-hidden="true" />
            <span>Admin CMS</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
