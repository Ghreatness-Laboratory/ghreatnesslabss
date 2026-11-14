import React, { useEffect, useState } from 'react';
import { MapPin, Shield, ArrowUpRight, ArrowRight } from 'lucide-react';
import { pages, Label, Button, Link } from './SharedSections';
import { useCms } from '../context/CmsContext';
import { GhreatnessMark } from './GhreatnessLogo';
import { HoldingBanner } from './HoldingBanner';

export function Footer() {
  const { data } = useCms();
  const { settings } = data;
  const [isAdminSession, setIsAdminSession] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('ghreatness_admin_auth') === 'true';
  });

  useEffect(() => {
    const syncAdminSession = () => {
      setIsAdminSession(localStorage.getItem('ghreatness_admin_auth') === 'true');
    };
    window.addEventListener('storage', syncAdminSession);
    window.addEventListener('focus', syncAdminSession);
    return () => {
      window.removeEventListener('storage', syncAdminSession);
      window.removeEventListener('focus', syncAdminSession);
    };
  }, []);

  const officeAddress = settings.officeAddress?.trim() || 'Victoria Island';
  const officeCity = settings.officeCity?.trim() || 'Lagos, Nigeria';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${officeAddress}, ${officeCity}`
  )}`;

  return (
    <footer className="app-footer">
      <section className="cta">
        <Label>Start a conversation</Label>
        <h2 className="section-heading">
          Let us build your <em>next important thing.</em>
        </h2>
        <p>Start with a confidential, no-obligation consultation.</p>
        <div className="actions">
          <Button solid>
            <span>Book a consultation</span>
            <ArrowRight size={16} strokeWidth={2} className="btn-arrow-green" aria-hidden="true" />
          </Button>
          <a className="button" href={`mailto:${settings.contactEmail}`}>
            {settings.contactEmail}
          </a>
        </div>
      </section>

      <div className="footer-holding-wrap">
        <HoldingBanner variant="footer" />
      </div>

      <div className="footer-sheet">
        <div className="footer-sheet-inner">
          <div className="footer-grid">
            <div className="footer-brand-col">
              <Link to="/" className="footer-brand-lockup" aria-label="Ghreatness Labs Home">
                <span className="footer-brand-tile" aria-hidden="true">
                  <GhreatnessMark size={18} theme="dark" />
                </span>
                <span className="footer-brand-wordmark">
                  <span className="footer-brand-title">GHREATNESS</span>
                  <span className="footer-brand-sub">LABORATORY</span>
                </span>
              </Link>
              <p className="footer-tagline">
                {settings.footerTagline ||
                  'Ghreatness Labs (Ghreatness Lab) — digital systems and brand experiences engineered from Lagos for the world.'}
              </p>
            </div>

            <nav className="footer-links" aria-label="Footer navigation">
              {pages
                .filter(([to]) => to !== '/' && to !== '/admin')
                .map(([to, name]) => (
                  <Link key={to} to={to} className="footer-nav-link">
                    <span>{name}</span>
                    <ArrowUpRight
                      size={14}
                      strokeWidth={2}
                      className="footer-nav-arrow"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
            </nav>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-hq-card"
              aria-label={`Open ${officeCity} HQ (${officeAddress}, ${officeCity}) in Maps`}
            >
              <span className="footer-hq-pin" aria-hidden="true">
                <MapPin size={16} strokeWidth={2} />
              </span>
              <span className="footer-hq-copy">
                <span className="footer-hq-label">{officeCity} HQ</span>
                <span className="footer-hq-address">
                  {officeAddress} / {officeCity}
                </span>
              </span>
            </a>
          </div>

          <div className="legal">
            <span className="legal-copyright">
              {settings.copyrightText || '© 2026 Ghreatness Labs (Ghreatness Lab). All rights reserved.'}
            </span>
            <div className="legal-links">
              <span className="legal-policy-text">Privacy · Terms · Accessibility</span>
              {isAdminSession && (
                <Link to="/admin" className="admin-footer-link">
                  <Shield size={12} strokeWidth={2} aria-hidden="true" />
                  <span>Admin CMS</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

