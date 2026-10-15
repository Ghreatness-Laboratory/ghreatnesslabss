import React from 'react';
import { MapPin } from 'lucide-react';
import { pages, Label, Button, Link } from './SharedSections';

export function Footer() {
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
          <a className="button" href="mailto:studio@ghreatness.io">
            studio@ghreatness.io
          </a>
        </div>
      </section>

      <div className="footer-grid">
        <div>
          <b className="wordmark">GHREATNESSLABS</b>
          <p>Digital systems and brand experiences built from Lagos for the world.</p>
        </div>
        <div className="footer-links">
          {pages.slice(1).map(([to, name]) => (
            <Link key={to} to={to}>
              {name}
            </Link>
          ))}
        </div>
        <div>
          <small>Lagos HQ</small>
          <p className="footer-address">
            <MapPin />{' '}
            <span>
              Victoria Island
              <br />
              Lagos, Nigeria
            </span>
          </p>
        </div>
      </div>

      <div className="legal">
        <span>© 2026 GHREATNESSLABS. All rights reserved.</span>
        <span>Privacy · Terms · Accessibility</span>
      </div>
    </footer>
  );
}
