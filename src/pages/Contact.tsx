import React, { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Twitter, Linkedin, Send } from 'lucide-react';
import { site } from '../content';
import { SectionHead } from '../components/SharedSections';

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <section className="section soft-section page-intro">
      <SectionHead
        label="Contact us"
        title="Start the"
        accent="conversation."
        copy="Tell us what you are building. We will reply with the right next step."
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
              {[...site.digitalServices, ...site.technologyServices].map(([title]) => (
                <option key={title} value={title}>
                  {title}
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
          <a href="mailto:studio@ghreatness.io">studio@ghreatness.io</a>

          <span className="icon-badge">
            <Phone />
          </span>
          <h3>Hotline</h3>
          <a href="tel:+2348000000000">+234 800 000 0000</a>

          <span className="icon-badge">
            <MapPin />
          </span>
          <h3>Lagos HQ</h3>
          <p>
            Victoria Island
            <br />
            Lagos, Nigeria
          </p>

          <div className="contact-social">
            <a
              aria-label="Instagram"
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
            >
              <Instagram />
            </a>
            <a
              aria-label="X"
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
            >
              <Twitter />
            </a>
            <a
              aria-label="LinkedIn"
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
            >
              <Linkedin />
            </a>
          </div>

          <div className="contact-choice">
            <a className="button button-solid" href="mailto:studio@ghreatness.io">
              Email us
            </a>
            <a className="button" href="https://wa.me/2348000000000" target="_blank" rel="noreferrer">
              WhatsApp us
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}
