import React, { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Twitter, Linkedin, Send } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { SectionHead } from '../components/SharedSections';

export default function Contact() {
  const { data } = useCms();
  const { settings } = data;
  const [sent, setSent] = useState(false);

  const pageCopy = data.pages.find((p) => p.page_slug === 'contact' && p.section_key === 'hero');
  const title = pageCopy?.title || 'Start the';
  const subtitle = pageCopy?.subtitle || 'conversation.';
  const intro =
    pageCopy?.content || 'Tell us what you are building. We will reply with the right next step.';

  const allServices = [...data.services].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <section className="section soft-section page-intro">
      <SectionHead
        label="Contact us"
        title={title}
        accent={subtitle}
        copy={intro}
      />
      <div className="contact-grid">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <label>
            Name
            <input required name="name" placeholder="Your name" />
          </label>
          <label>
            Email
            <input required type="email" name="email" placeholder="you@company.com" />
          </label>
          <label>
            Company
            <input name="company" placeholder="Company or organization" />
          </label>
          <label>
            Service category
            <select name="service" defaultValue="">
              <option value="" disabled>
                Choose a service
              </option>
              {allServices.map((srv) => (
                <option key={srv.id || srv.title} value={srv.title}>
                  {srv.title}
                </option>
              ))}
            </select>
          </label>
          <label className="form-message">
            Message
            <textarea
              required
              name="message"
              placeholder="A little about the opportunity"
              rows={5}
            />
          </label>
          <button className="button button-solid" type="submit">
            {sent ? (
              'Inquiry received'
            ) : (
              <>
                Send inquiry <Send />
              </>
            )}
          </button>
        </form>

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
