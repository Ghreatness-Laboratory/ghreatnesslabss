import React, { useState } from 'react';
import {
  Lock,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Activity,
  ArrowLeft,
  Mail,
  MessageSquare,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { SectionHead, Button, Link } from '../components/SharedSections';

export default function ClientPortal() {
  const { data } = useCms();
  const { settings } = data;

  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [attempted, setAttempted] = useState(false);

  const rawNumber = settings.whatsappNumber || '+2348000000000';
  const cleanPhone = rawNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    'Hello GhreatnessLabs, I am requesting access to our project deliverables in the client portal.'
  )}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
  };

  return (
    <section className="section page-intro client-portal-page">
      <div className="client-portal-header">
        <Link to="/" className="portal-back-link">
          <ArrowLeft size={14} /> Back to main site
        </Link>
        <SectionHead
          label="Partner Infrastructure"
          title="Client Portal"
          accent="& Delivery Vault."
          copy="A dedicated environment for project status, staging deployments, architecture documentation, and delivery assets."
        />
      </div>

      <div className="client-portal-grid">
        {/* Login Form Box */}
        <div className="portal-auth-card">
          <div className="portal-card-header">
            <span className="portal-badge">
              <Lock size={12} />
              <span>Private Alpha</span>
            </span>
            <span className="operational-dot" />
          </div>

          <h3>Client Account Sign In</h3>
          <p className="portal-card-intro">
            Access active sprint metrics, codebase staging, and production health.
          </p>

          <form onSubmit={handleSubmit} className="portal-form">
            <div className="portal-field">
              <label htmlFor="client-email">Work Email</label>
              <input
                id="client-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="partner@yourcompany.com"
                required
              />
            </div>

            <div className="portal-field">
              <label htmlFor="client-passcode">Access Token / Passcode</label>
              <input
                id="client-passcode"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>

            <button type="submit" className="button button-solid portal-submit-btn">
              <span>Enter Portal</span>
              <ArrowRight size={14} />
            </button>

            {attempted && (
              <div className="portal-alpha-notice" role="status">
                <b>Notice: Private Preview Only</b>
                <p>
                  The client portal is currently provisioned exclusively for active portfolio ventures
                  and contracted retainers. To request your team's access token or receive direct project
                  reports, contact your studio lead.
                </p>
                <div className="portal-notice-actions">
                  <a
                    href={`mailto:${settings.contactEmail}?subject=Client%20Portal%20Access%20Request`}
                    className="portal-notice-btn"
                  >
                    <Mail size={12} />
                    <span>Email Studio Desk</span>
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="portal-notice-btn"
                  >
                    <MessageSquare size={12} />
                    <span>WhatsApp Priority</span>
                  </a>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Portal Capabilities Overview */}
        <div className="portal-features-card">
          <span className="label">Coming in Version 2.0</span>
          <h2>Centralized visibility for mission-critical builds.</h2>
          <p>
            We are engineering a transparent interface where partners inspect architecture in real time,
            bypassing friction and status meetings.
          </p>

          <div className="portal-feature-list">
            <div className="portal-feature-item">
              <span className="portal-feature-icon">
                <Activity size={18} />
              </span>
              <div>
                <b>Live Sprint Velocity & Burndown</b>
                <p>Track production commits, feature milestones, and deliverables day-by-day.</p>
              </div>
            </div>

            <div className="portal-feature-item">
              <span className="portal-feature-icon">
                <Cpu size={18} />
              </span>
              <div>
                <b>Infrastructure Telemetry & Staging</b>
                <p>Inspect container health, cloud runtime logs, and test coverage metrics.</p>
              </div>
            </div>

            <div className="portal-feature-item">
              <span className="portal-feature-icon">
                <Layers size={18} />
              </span>
              <div>
                <b>Design Token & Asset Vault</b>
                <p>Direct download access to verified Figma design tokens, vector assets, and exports.</p>
              </div>
            </div>

            <div className="portal-feature-item">
              <span className="portal-feature-icon">
                <ShieldCheck size={18} />
              </span>
              <div>
                <b>SOC & SLA Verification</b>
                <p>Audit trail of deployed dependencies, uptime guarantees, and encryption standards.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
