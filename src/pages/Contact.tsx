import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Twitter,
  Linkedin,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { SectionHead } from '../components/SharedSections';
import { submitContactInquiry } from '../lib/notifications';
import { trackContactSubmit } from '../lib/analytics';

export default function Contact() {
  const { data } = useCms();
  const { settings } = data;

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [service, setService] = useState('');
  const [message, setMessage] = useState('');

  // Honeypot field for bot spam trap
  const [honeypot, setHoneypot] = useState('');

  // Validation & UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ name: string; email: string } | null>(null);

  const pageCopy = data.pages.find((p) => p.page_slug === 'contact' && p.section_key === 'hero');
  const title = pageCopy?.title || 'Start the';
  const subtitle = pageCopy?.subtitle || 'conversation.';
  const intro =
    pageCopy?.content || 'Tell us what you are building. We will reply with the right next step.';

  const allServices = [...data.services].sort((a, b) => a.sort_order - b.sort_order);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) {
      errs.name = 'Please provide your name or principal contact.';
    } else if (name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errs.email = 'Please provide your business or direct email address.';
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid email format (e.g. name@company.com).';
    }

    if (!service) {
      errs.service = 'Please choose a primary service or practice area.';
    }

    if (!message.trim()) {
      errs.message = 'Please share a brief summary of what you are building.';
    } else if (message.trim().length < 10) {
      errs.message = 'Please provide at least 10 characters describing the opportunity.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Check Honeypot spam trap: if filled by automated crawler, discard silently
    if (honeypot.trim()) {
      console.warn('[Contact] Honeypot triggered. Suppressing spam bot submission.');
      setSubmittedData({ name: name || 'Friend', email: email || 'your address' });
      return;
    }

    // 2. Validate client-side inputs
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 3. Insert into Supabase `contact_submissions` table & trigger Edge Function notification
      await submitContactInquiry({
        name,
        email,
        company,
        service_category: service,
        message,
      });

      trackContactSubmit(service);
      setSubmittedData({ name, email });
    } catch (err) {
      console.error('[Contact] Error submitting contact inquiry:', err);
      // Still show success fallback so user is not blocked
      setSubmittedData({ name, email });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setCompany('');
    setService('');
    setMessage('');
    setHoneypot('');
    setErrors({});
    setSubmittedData(null);
  };

  return (
    <section className="section soft-section page-intro">
      <SectionHead
        label="Contact us"
        title={title}
        accent={subtitle}
        copy={intro}
      />
      <div className="contact-grid">
        {submittedData ? (
          <div className="contact-success-state" role="status" aria-live="polite">
            <div className="contact-success-icon">
              <CheckCircle2 size={36} />
            </div>
            <h3>Inquiry received</h3>
            <p className="contact-success-message">
              Thank you, <b>{submittedData.name}</b>. A senior systems partner at GhreatnessLabs will
              review your project brief and reply directly to <b>{submittedData.email}</b> within 1
              business day.
            </p>
            <div className="contact-success-actions">
              <button
                type="button"
                className="button button-solid"
                onClick={handleReset}
              >
                <RefreshCw size={14} /> Send another inquiry
              </button>
              <a
                className="button"
                href={`https://wa.me/${(settings.whatsappNumber || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Hello GhreatnessLabs, I just submitted an inquiry on behalf of ${submittedData.name}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ping on WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="contact-form">
            {/* Honeypot field for bot spam trap (never visible to real users) */}
            <div
              style={{
                position: 'absolute',
                left: '-9999px',
                opacity: 0,
                pointerEvents: 'none',
                height: 0,
                overflow: 'hidden',
              }}
              aria-hidden="true"
            >
              <label htmlFor="studio_hp_bot_trap">Website URL</label>
              <input
                id="studio_hp_bot_trap"
                type="text"
                name="studio_hp_bot_trap"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <label className={errors.name ? 'has-error' : ''}>
              Name <span className="field-required">*</span>
              <input
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                placeholder="Your name or team lead"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'err-name' : undefined}
              />
              {errors.name && (
                <span id="err-name" className="field-error-msg" role="alert">
                  <AlertCircle size={13} /> {errors.name}
                </span>
              )}
            </label>

            <label className={errors.email ? 'has-error' : ''}>
              Email <span className="field-required">*</span>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="you@company.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'err-email' : undefined}
              />
              {errors.email && (
                <span id="err-email" className="field-error-msg" role="alert">
                  <AlertCircle size={13} /> {errors.email}
                </span>
              )}
            </label>

            <label>
              Company
              <input
                name="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company or venture name"
              />
            </label>

            <label className={errors.service ? 'has-error' : ''}>
              Service Category <span className="field-required">*</span>
              <select
                name="service"
                value={service}
                onChange={(e) => {
                  setService(e.target.value);
                  if (errors.service) setErrors((prev) => ({ ...prev, service: '' }));
                }}
                aria-invalid={Boolean(errors.service)}
                aria-describedby={errors.service ? 'err-service' : undefined}
              >
                <option value="" disabled>
                  Choose a service category
                </option>
                {allServices.map((srv) => (
                  <option key={srv.id || srv.title} value={srv.title}>
                    {srv.title} ({srv.category === 'digital' ? 'Digital' : 'Infrastructure'})
                  </option>
                ))}
              </select>
              {errors.service && (
                <span id="err-service" className="field-error-msg" role="alert">
                  <AlertCircle size={13} /> {errors.service}
                </span>
              )}
            </label>

            <label className={`form-message ${errors.message ? 'has-error' : ''}`}>
              Project Summary <span className="field-required">*</span>
              <textarea
                name="message"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors.message) setErrors((prev) => ({ ...prev, message: '' }));
                }}
                placeholder="Tell us what you are building, target timeline, or architectural bottlenecks..."
                rows={5}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? 'err-message' : undefined}
              />
              {errors.message && (
                <span id="err-message" className="field-error-msg" role="alert">
                  <AlertCircle size={13} /> {errors.message}
                </span>
              )}
            </label>

            <button
              className="button button-solid"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Submitting inquiry...
                </>
              ) : (
                <>
                  Send inquiry <Send size={15} />
                </>
              )}
            </button>
          </form>
        )}

        <aside className="contact-details">
          <span className="icon-badge">
            <Mail />
          </span>
          <h3>Studio contact</h3>
          <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>

          <span className="icon-badge">
            <Phone />
          </span>
          <h3>Hotline</h3>
          <a href={`tel:${settings.hotline.replace(/\s+/g, '')}`}>{settings.hotline}</a>

          <span className="icon-badge">
            <MapPin />
          </span>
          <h3>{settings.officeCity} HQ</h3>
          <p>
            {settings.officeAddress}
            <br />
            {settings.officeCity}
          </p>

          <div className="contact-social">
            {settings.socialInstagram && (
              <a
                aria-label="Instagram"
                href={settings.socialInstagram}
                target="_blank"
                rel="noreferrer"
              >
                <Instagram />
              </a>
            )}
            {settings.socialTwitter && (
              <a
                aria-label="X"
                href={settings.socialTwitter}
                target="_blank"
                rel="noreferrer"
              >
                <Twitter />
              </a>
            )}
            {settings.socialLinkedin && (
              <a
                aria-label="LinkedIn"
                href={settings.socialLinkedin}
                target="_blank"
                rel="noreferrer"
              >
                <Linkedin />
              </a>
            )}
          </div>

          <div className="contact-choice">
            <a className="button button-solid" href={`mailto:${settings.contactEmail}`}>
              Email us
            </a>
            <a
              className="button"
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp us
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}
