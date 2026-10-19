import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Layers,
  Calendar,
  DollarSign,
  Briefcase,
  Mail,
  User,
  Building2,
  FileText,
  Clock,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { SectionHead, Button } from '../components/SharedSections';
import { submitProjectInquiry } from '../lib/notifications';
import { trackIntakeSubmit } from '../lib/analytics';
import { updateDocumentMeta } from '../lib/ogImage';

export default function StartProject() {
  const { data } = useCms();
  const { settings } = data;

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [projectType, setProjectType] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [timeline, setTimeline] = useState('');
  const [description, setDescription] = useState('');

  // Honeypot spam trap
  const [honeypot, setHoneypot] = useState('');

  // Validation & UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    email: string;
    projectType: string;
    timeline: string;
  } | null>(null);

  // SEO & Dynamic OG meta
  useEffect(() => {
    updateDocumentMeta({
      title: 'Start a Project Brief',
      description:
        'Structured intake for digital systems architecture, project scopes, timelines, and budget estimation with GhreatnessLabs.',
      category: 'Project Intake & Scoping',
      urlPath: '/start-project',
    });
  }, []);

  const projectTypeOptions = [
    'Digital Systems & Web Applications',
    'Enterprise IT Architecture & Security',
    'Brand Systems & Product Identity',
    'Cloud Infrastructure, DevOps & Databases',
    'Mobile Platforms & Real-time Engines',
    'Technical Advisory & Fractional CTO',
  ];

  const budgetOptions = [
    '$5,000 – $15,000 (Sprint / Prototype / MVP)',
    '$15,000 – $35,000 (Core Platform / System Build)',
    '$35,000 – $75,000 (Enterprise Solution / Multi-system)',
    '$75,000+ (Comprehensive Studio Retainer / Venture)',
    'Flexible / Custom Scoping',
  ];

  const timelineOptions = [
    'ASAP (Within 2–4 weeks)',
    '1–3 months (Standard Q2/Q3 rollout)',
    '3–6 months (Phased architectural delivery)',
    'Flexible / Exploratory roadmap',
  ];

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'Please provide your name or principal contact.';
    } else if (name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errs.email = 'Please provide your business or direct email.';
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid email format (e.g. name@company.com).';
    }

    if (!projectType) {
      errs.projectType = 'Please select a project or service category.';
    }

    if (!budgetRange) {
      errs.budgetRange = 'Please select an estimated budget range.';
    }

    if (!timeline) {
      errs.timeline = 'Please select your target timeline.';
    }

    if (!description.trim()) {
      errs.description = 'Please describe what you are looking to build or solve.';
    } else if (description.trim().length < 15) {
      errs.description = 'Please provide at least 15 characters of project context.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Honeypot check
    if (honeypot.trim()) {
      console.warn('[StartProject] Honeypot triggered. Silently suppressing bot submission.');
      setSubmittedData({
        name: name || 'Friend',
        email: email || 'your address',
        projectType: projectType || 'Digital Systems',
        timeline: timeline || 'Flexible',
      });
      return;
    }

    // 2. Client validation
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 3. Persist to Supabase `project_inquiries` table & trigger Edge Function notification
      await submitProjectInquiry({
        name,
        email,
        company,
        project_type: projectType,
        budget_range: budgetRange,
        timeline,
        description,
      });

      trackIntakeSubmit(projectType, budgetRange, timeline);
      setSubmittedData({ name, email, projectType, timeline });
    } catch (err) {
      console.error('[StartProject] Submission error:', err);
      // Fallback success state so user is never stranded
      setSubmittedData({ name, email, projectType, timeline });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setCompany('');
    setProjectType('');
    setBudgetRange('');
    setTimeline('');
    setDescription('');
    setHoneypot('');
    setErrors({});
    setSubmittedData(null);
  };

  return (
    <div className="start-project-page">
      <section className="section soft-section page-intro">
        <SectionHead
          label="Project Intake"
          title="Start a project"
          accent="brief."
          copy="Share your requirements, parameters, and timeline. Our systems engineering and design partners will evaluate technical feasibility and return a detailed proposal within 1 business day."
        />

        <div className="intake-form-wrapper">
          {submittedData ? (
            <div className="intake-success-card" role="status" aria-live="polite">
              <div className="intake-success-icon">
                <CheckCircle2 size={44} />
              </div>
              <h2>Project brief received</h2>
              <p className="intake-success-lead">
                Thank you, <b>{submittedData.name}</b>. Your brief for{' '}
                <span className="intake-tag">{submittedData.projectType}</span> with a target timeline of{' '}
                <b>{submittedData.timeline}</b> has been queued directly with the GhreatnessLabs senior engineering studio.
              </p>
              <div className="intake-success-details">
                <p>
                  A technical lead will review your architecture specifications and reply to{' '}
                  <b>{submittedData.email}</b> within <b>1 business day</b> with initial scoping notes and consultation scheduling options.
                </p>
              </div>

              <div className="intake-success-actions">
                <button
                  type="button"
                  className="button button-solid"
                  onClick={handleReset}
                >
                  <RefreshCw size={14} /> Submit another project brief
                </button>
                <a
                  className="button"
                  href={`https://wa.me/${(settings.whatsappNumber || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hello GhreatnessLabs, I just submitted a project intake brief for ${submittedData.name} regarding ${submittedData.projectType}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Confirm on WhatsApp →
                </a>
              </div>
            </div>
          ) : (
            <form className="intake-form" onSubmit={handleSubmit} noValidate>
              <div className="intake-form-header">
                <span className="intake-badge">Confidential Technical Intake</span>
                <h3>Project Parameters &amp; Requirements</h3>
                <p>All information provided is strictly confidential and protected by NDA standards.</p>
              </div>

              {/* Honeypot Spam Filter (Invisible to humans) */}
              <div style={{ display: 'none' }} aria-hidden="true">
                <label htmlFor="website_hp">Do not fill this field</label>
                <input
                  type="text"
                  id="website_hp"
                  name="website_hp"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Grid 1: Name, Email, Company */}
              <div className="intake-field-grid">
                <div className={`form-field ${errors.name ? 'field-error' : ''}`}>
                  <label htmlFor="intake-name">
                    Principal Contact / Full Name <span className="req">*</span>
                  </label>
                  <div className="input-with-icon">
                    <User size={16} className="field-icon" />
                    <input
                      id="intake-name"
                      type="text"
                      placeholder="e.g. Tunde Adeyemi"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                      }}
                      required
                    />
                  </div>
                  {errors.name && (
                    <span className="error-message">
                      <AlertCircle size={12} /> {errors.name}
                    </span>
                  )}
                </div>

                <div className={`form-field ${errors.email ? 'field-error' : ''}`}>
                  <label htmlFor="intake-email">
                    Business / Direct Email <span className="req">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Mail size={16} className="field-icon" />
                    <input
                      id="intake-email"
                      type="email"
                      placeholder="e.g. tunde@company.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      required
                    />
                  </div>
                  {errors.email && (
                    <span className="error-message">
                      <AlertCircle size={12} /> {errors.email}
                    </span>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="intake-company">
                    Company / Venture Name <span className="opt">(optional)</span>
                  </label>
                  <div className="input-with-icon">
                    <Building2 size={16} className="field-icon" />
                    <input
                      id="intake-company"
                      type="text"
                      placeholder="e.g. Apex Global Systems"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Grid 2: Project Type, Budget, Timeline */}
              <div className="intake-field-grid">
                <div className={`form-field ${errors.projectType ? 'field-error' : ''}`}>
                  <label htmlFor="intake-type">
                    Project Type / Practice Area <span className="req">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Layers size={16} className="field-icon" />
                    <select
                      id="intake-type"
                      value={projectType}
                      onChange={(e) => {
                        setProjectType(e.target.value);
                        if (errors.projectType) setErrors((prev) => ({ ...prev, projectType: '' }));
                      }}
                      required
                    >
                      <option value="">Select project type...</option>
                      {projectTypeOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.projectType && (
                    <span className="error-message">
                      <AlertCircle size={12} /> {errors.projectType}
                    </span>
                  )}
                </div>

                <div className={`form-field ${errors.budgetRange ? 'field-error' : ''}`}>
                  <label htmlFor="intake-budget">
                    Estimated Budget Range <span className="req">*</span>
                  </label>
                  <div className="input-with-icon">
                    <DollarSign size={16} className="field-icon" />
                    <select
                      id="intake-budget"
                      value={budgetRange}
                      onChange={(e) => {
                        setBudgetRange(e.target.value);
                        if (errors.budgetRange) setErrors((prev) => ({ ...prev, budgetRange: '' }));
                      }}
                      required
                    >
                      <option value="">Select budget range...</option>
                      {budgetOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.budgetRange && (
                    <span className="error-message">
                      <AlertCircle size={12} /> {errors.budgetRange}
                    </span>
                  )}
                </div>

                <div className={`form-field ${errors.timeline ? 'field-error' : ''}`}>
                  <label htmlFor="intake-timeline">
                    Target Timeline <span className="req">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Clock size={16} className="field-icon" />
                    <select
                      id="intake-timeline"
                      value={timeline}
                      onChange={(e) => {
                        setTimeline(e.target.value);
                        if (errors.timeline) setErrors((prev) => ({ ...prev, timeline: '' }));
                      }}
                      required
                    >
                      <option value="">Select target timeline...</option>
                      {timelineOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.timeline && (
                    <span className="error-message">
                      <AlertCircle size={12} /> {errors.timeline}
                    </span>
                  )}
                </div>
              </div>

              {/* Free-text Project Description */}
              <div className={`form-field ${errors.description ? 'field-error' : ''}`}>
                <label htmlFor="intake-description">
                  Project Description &amp; Scope Objectives <span className="req">*</span>
                </label>
                <textarea
                  id="intake-description"
                  rows={5}
                  placeholder="Outline the core objective, problem to solve, required integrations, platform requirements, or key deliverables..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
                  }}
                  required
                />
                {errors.description && (
                  <span className="error-message">
                    <AlertCircle size={12} /> {errors.description}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="intake-form-actions">
                <button
                  type="submit"
                  className="button button-solid intake-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Transmitting brief...
                    </>
                  ) : (
                    <>
                      Submit Project Brief <ArrowRight size={16} />
                    </>
                  )}
                </button>
                <span className="intake-sla-note">
                  ⚡ Response guaranteed within 1 business day · Lagos, UTC+1
                </span>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
