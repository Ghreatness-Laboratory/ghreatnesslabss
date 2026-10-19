import React, { useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Target,
  Cpu,
  TrendingUp,
  Layers,
  Code2,
  ExternalLink,
  Quote,
  CheckCircle2,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { SectionHead, Button } from '../components/SharedSections';
import { trackProjectDetailView } from '../lib/analytics';
import { updateDocumentMeta } from '../lib/ogImage';

interface ProjectDetailProps {
  slug?: string;
}

export default function ProjectDetail({ slug: propSlug }: ProjectDetailProps) {
  const { data } = useCms();

  // Extract slug from URL if not passed as prop
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const urlSlug = currentPath.replace(/^\/projects\/?/, '').replace(/\/$/, '');
  const activeSlug = propSlug || urlSlug;

  const project =
    data.projects.find((p) => p.slug === activeSlug || p.id === activeSlug) ||
    data.projects[0];

  useEffect(() => {
    if (project) {
      trackProjectDetailView(project.slug, project.title);
      updateDocumentMeta({
        title: `${project.title} — Systems Case Study`,
        description: project.description || `Case study on ${project.title} architecture and technical outcomes.`,
        category: project.category_tag || 'Venture & Systems Case Study',
        urlPath: `/projects/${project.slug}`,
        customHeroImage: project.hero_image_url || project.image_url,
      });
    }
  }, [project]);

  if (!project) {
    return (
      <section className="section soft-section page-intro">
        <SectionHead
          label="Case Studies"
          title="Project not"
          accent="found."
          copy="The requested system architecture brief could not be located."
        />
        <div className="mt-8">
          <Button href="/projects">← Back to all projects</Button>
        </div>
      </section>
    );
  }

  const defaultHero =
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1600&q=80';
  const heroImage = project.hero_image_url || project.image_url || defaultHero;

  return (
    <article className="project-detail-page">
      {/* Top Breadcrumb & Return Nav */}
      <div className="project-detail-header-bar">
        <a href="/projects" className="project-back-link">
          <ArrowLeft size={16} /> Back to all projects
        </a>
        <span className="project-detail-badge">{project.category_tag}</span>
      </div>

      {/* Main Project Hero Section */}
      <section className="section project-detail-hero">
        <div className="project-hero-copy">
          <span className="label">Venture & Systems Case Study</span>
          <h1 className="project-hero-title">{project.title}</h1>
          <p className="project-hero-intro">{project.description}</p>
          {project.detail && (
            <p className="project-hero-detail">{project.detail}</p>
          )}
          <div className="project-hero-actions">
            <Button solid href="/contact">
              Discuss a similar project
            </Button>
            <a
              href="#challenge"
              className="button"
            >
              Read full brief ↓
            </a>
          </div>
        </div>

        {/* Hero Visual Banner */}
        <div className="project-hero-banner-wrap">
          <img
            src={heroImage}
            alt={`${project.title} interface and system architecture`}
            className="project-hero-banner-img"
            loading="eager"
          />
          <div className="project-hero-banner-overlay">
            <span className="project-banner-pill">Deployed in Production</span>
            <span className="project-banner-title">{project.title}</span>
          </div>
        </div>
      </section>

      {/* Three Core Sections: Challenge, Approach, Result */}
      <section className="section project-narrative-section" id="challenge">
        <div className="project-three-pillars">
          {/* Pillar 1: Challenge */}
          <div className="pillar-card pillar-challenge">
            <div className="pillar-icon-badge">
              <Target size={22} />
            </div>
            <span className="pillar-eyebrow">01 · Problem Space</span>
            <h3>The Challenge</h3>
            <p>
              {project.challenge ||
                'Legacy infrastructure, fragmented data stores, and high transaction latency prevented real-time scale and clear operational auditability across markets.'}
            </p>
          </div>

          {/* Pillar 2: Approach */}
          <div className="pillar-card pillar-approach">
            <div className="pillar-icon-badge badge-dark">
              <Cpu size={22} />
            </div>
            <span className="pillar-eyebrow">02 · Systems Architecture</span>
            <h3>The Systems Approach</h3>
            <p>
              {project.approach ||
                'Constructed an event-driven distributed pipeline with modular design tokens, resilient caching layers, automated data reconciliation, and high-trust authorization.'}
            </p>
          </div>

          {/* Pillar 3: Result */}
          <div className="pillar-card pillar-result">
            <div className="pillar-icon-badge badge-accent">
              <TrendingUp size={22} />
            </div>
            <span className="pillar-eyebrow">03 · Verified Outcomes</span>
            <h3>The Result & Impact</h3>
            <p>
              {project.result ||
                'Achieved 99.98% platform reliability, sub-100ms response benchmarks, and significant multi-market operational acceleration within the first quarter.'}
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Pills Row */}
      {project.tech_stack && project.tech_stack.length > 0 && (
        <section className="section soft-section project-tech-section">
          <SectionHead
            label="Engineering Stack"
            title="Technologies"
            accent="deployed."
            copy="Every layer of the system was chosen for resilience, auditability, and speed."
          />
          <div className="project-tech-pill-grid">
            {project.tech_stack.map((tech) => (
              <div key={tech} className="project-tech-pill">
                <Code2 size={14} />
                <span>{tech}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Client Quote Block (Reusing Testimonial Card Style) */}
      {project.client_quote && (
        <section className="section project-quote-section">
          <div className="project-quote-card">
            <span className="project-quote-mark">“</span>
            <blockquote className="project-quote-text">
              {project.client_quote}
            </blockquote>
            {project.client_name && (
              <footer className="project-quote-footer">
                <b>{project.client_name}</b>
                <small>Partner Perspective · {project.title}</small>
              </footer>
            )}
          </div>
        </section>
      )}

      {/* Bottom Conversion Section */}
      <section className="section project-bottom-cta">
        <div className="project-cta-box">
          <span className="label">Ready to Build?</span>
          <h2>Build high-impact systems for your venture</h2>
          <p>
            Schedule a technical consultation to explore scoping, architecture, and timelines.
          </p>
          <div className="actions">
            <Button solid href="/contact">
              Book a consultation
            </Button>
            <Button href="/projects">View more case studies</Button>
          </div>
        </div>
      </section>
    </article>
  );
}
