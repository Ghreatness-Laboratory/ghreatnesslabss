import React, { useState } from 'react';
import { MapPin, Shield, Check, ArrowRight, Loader2, Lock } from 'lucide-react';
import { pages, Label, Button, Link } from './SharedSections';
import { useCms } from '../context/CmsContext';
import { subscribeToNewsletter } from '../lib/supabase';

export function Footer() {
  const { data } = useCms();
  const { settings } = data;

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<
    'idle' | 'loading' | 'success' | 'already' | 'error'
  >('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    setNewsletterStatus('loading');
    setNewsletterMessage('');

    try {
      const res = await subscribeToNewsletter(newsletterEmail);
      if (res.success) {
        if (res.alreadySubscribed) {
          setNewsletterStatus('already');
          setNewsletterMessage("You're already subscribed.");
        } else {
          setNewsletterStatus('success');
          setNewsletterMessage("Thanks — you're on the list.");
          setNewsletterEmail('');
        }
      } else {
        setNewsletterStatus('error');
        setNewsletterMessage(res.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setNewsletterStatus('error');
      setNewsletterMessage('Unable to complete subscription. Please try again.');
    }
  };

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

      {/* Newsletter signup: Get our latest work and insights */}
      <div className="footer-newsletter-section">
        <div className="footer-newsletter-card">
          <div className="footer-newsletter-copy">
            <span className="footer-newsletter-eyebrow">Studio Dispatch</span>
            <h3 className="footer-newsletter-title">Get our latest work and insights</h3>
            <p className="footer-newsletter-desc">
              Occasional dispatches on digital systems, architecture, and technology releases from Lagos.
            </p>
          </div>

          <form className="footer-newsletter-form" onSubmit={handleNewsletterSubmit}>
            {newsletterStatus === 'success' ? (
              <div className="newsletter-feedback newsletter-success" role="status">
                <span className="newsletter-check-icon">
                  <Check size={14} />
                </span>
                <span>{newsletterMessage || "Thanks — you're on the list."}</span>
              </div>
            ) : newsletterStatus === 'already' ? (
              <div className="newsletter-feedback newsletter-already" role="status">
                <span className="newsletter-check-icon">
                  <Check size={14} />
                </span>
                <span>{newsletterMessage || "You're already subscribed."}</span>
              </div>
            ) : (
              <div className="newsletter-input-group">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => {
                    setNewsletterEmail(e.target.value);
                    if (newsletterStatus === 'error') setNewsletterStatus('idle');
                  }}
                  placeholder="Enter your work email"
                  required
                  aria-label="Email address for newsletter"
                  className="newsletter-email-input"
                  disabled={newsletterStatus === 'loading'}
                />
                <button
                  type="submit"
                  className="button button-solid newsletter-submit-btn"
                  disabled={newsletterStatus === 'loading'}
                >
                  {newsletterStatus === 'loading' ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Joining...</span>
                    </>
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            )}
            {newsletterStatus === 'error' && (
              <p className="newsletter-error-text" role="alert">
                {newsletterMessage}
              </p>
            )}
          </form>
        </div>
      </div>

      <div className="footer-grid">
        <div>
          <b className="wordmark">{settings.wordmark || 'GHREATNESSLABS'}</b>
          <p>{settings.footerTagline}</p>
        </div>
        <div className="footer-links">
          {pages.slice(1).map(([to, name]) => (
            <Link key={to} to={to}>
              {name}
            </Link>
          ))}
          <Link to="/client-login">Client Login</Link>
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
        <div className="legal-left">
          <span>{settings.copyrightText}</span>
          <span className="systems-operational-badge" title="All GhreatnessLabs production systems operational">
            <span className="operational-dot" />
            <span>Systems Operational</span>
          </span>
        </div>
        <div className="legal-links">
          <span>Privacy · Terms · Accessibility</span>
          <Link to="/client-login" className="client-login-link">
            <Lock size={11} />
            <span>Client Login</span>
          </Link>
          <Link to="/admin" className="admin-footer-link">
            <Shield size={12} />
            <span>Admin CMS</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
