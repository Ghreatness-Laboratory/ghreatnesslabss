import React, { useEffect, useRef, useState } from 'react';
import {
  BadgeCheck,
  Building2,
  ChartNoAxesCombined,
  Code2,
  Globe2,
  PenTool,
  Play,
  Quote,
  Shapes,
  ShieldCheck,
  UsersRound,
  ArrowUpRight,
  Target,
  Eye,
  Telescope,
  ShieldCheck as ShieldStar,
  type LucideIcon,
} from 'lucide-react';
import { site } from '../content';

export const icons: Record<string, LucideIcon> = {
  'building-2': Building2,
  'users-round': UsersRound,
  'badge-check': BadgeCheck,
  'globe-2': Globe2,
  'pen-tool': PenTool,
  'code-2': Code2,
  shapes: Shapes,
  play: Play,
  'chart-no-axes-combined': ChartNoAxesCombined,
  'shield-check': ShieldCheck,
};

export const pages = [
  ['/', 'Home'],
  ['/about', 'About Us'],
  ['/services', 'Services'],
  ['/holding-group', 'Holding Group'],
  ['/projects', 'Projects'],
  ['/leadership', 'Leadership'],
  ['/clients', 'Clients'],
  ['/contact', 'Contact Us'],
] as const;

export const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="label">{children}</p>
);

export const Link = ({
  to,
  children,
  className = '',
  'aria-label': ariaLabel,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}) => (
  <a className={className} href={to} aria-label={ariaLabel}>
    {children}
  </a>
);

export const Button = ({
  children,
  solid = false,
  href = '/contact',
}: {
  children: React.ReactNode;
  solid?: boolean;
  href?: string;
}) => (
  <Link to={href} className={`button ${solid ? 'button-solid' : ''}`}>
    {children}
  </Link>
);

export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const target = Number(value);
    const element = ref.current;
    if (!element || isNaN(target)) return;

    let frame = 0;
    let started = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        observer.disconnect();

        const start = performance.now();
        const duration = 1000;

        const tick = (now: number) => {
          if (document.hidden) {
            frame = requestAnimationFrame(tick);
            return;
          }
          const progress = Math.min((now - start) / duration, 1);
          const current = Math.round(target * (1 - Math.pow(1 - progress, 3)));
          if (element) {
            element.textContent = String(current);
          }
          if (progress < 1) {
            frame = requestAnimationFrame(tick);
          }
        };

        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <strong
      ref={ref}
      style={{
        fontVariantNumeric: 'tabular-nums',
        display: 'inline-block',
        minWidth: '2ch',
      }}
    >
      0
    </strong>
  );
}

export function Stats() {
  return (
    <section className="stats">
      {site.stats.map(([tag, num, caption, icon]) => {
        const Icon = icons[icon];
        return (
          <article key={tag}>
            <span className="icon-badge">
              {Icon && <Icon />}
            </span>
            <div>
              <CountUp value={num} />
              <p>
                {tag}
                <span>{caption}</span>
              </p>
            </div>
          </article>
        );
      })}
    </section>
  );
}

export function SectionHead({
  label,
  title,
  accent,
  copy,
}: {
  label: string;
  title: string;
  accent?: string;
  copy?: string;
}) {
  return (
    <>
      <Label>{label}</Label>
      <h1 className="section-heading">
        {title} {accent && <em>{accent}</em>}
      </h1>
      {copy && <p className="section-intro">{copy}</p>}
    </>
  );
}

export function Capabilities({ limit }: { limit?: number }) {
  return (
    <div className="cap-grid">
      {site.capabilities.slice(0, limit).map(([spec, title, desc, tags, icon], index) => {
        const Icon = icons[icon];
        return (
          <article className={`cap ${index % 2 ? 'cap-dark' : ''}`} key={title}>
            <div className="cap-header">
              <span className="icon-badge">
                {Icon && <Icon />}
              </span>
              <small>{spec}</small>
              <span className="cap-index">{String(index + 1).padStart(2, '0')}</span>
            </div>
            <h3>{title}</h3>
            <p>{desc}</p>
            <div className="tags">
              {tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function ServiceList({
  items,
}: {
  items: ReadonlyArray<readonly [string, string, string]>;
}) {
  return (
    <div className="service-list">
      {items.map(([title, desc, icon], index) => {
        const Icon = icons[icon];
        return (
          <article className={`service-item ${index % 2 ? 'service-dark' : ''}`} key={title}>
            <span className="icon-badge">
              {Icon && <Icon />}
            </span>
            <div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
            <span className="cap-index">{String(index + 1).padStart(2, '0')}</span>
          </article>
        );
      })}
    </div>
  );
}

export function Ventures({ limit }: { limit?: number }) {
  return (
    <div className="venture-grid">
      {site.ventures.slice(0, limit).map(([name, cat, desc, detail], i) => (
        <article className={`venture v${i}`} key={name}>
          <div className="venture-visual">
            <span className="venture-badge">{cat}</span>
            <span className="venture-mark">
              <i />
              <b />
            </span>
          </div>
          <div className="venture-body">
            <h3>{name}</h3>
            <p>{desc}</p>
            {detail && <p className="venture-detail">{detail}</p>}
            <Link to="/contact">
              Discuss this kind of work <ArrowUpRight />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

export function Testimonials({ limit }: { limit?: number }) {
  return (
    <div className="trust-grid">
      {site.testimonials.slice(0, limit).map(([where, quote, name, title]) => {
        const initials = name
          .split(' ')
          .map((x) => x[0])
          .join('');
        return (
          <blockquote key={name}>
            <Quote className="testimonial-quote" />
            <small>{where}</small>
            <p>{quote}</p>
            <footer>
              <span className="testimonial-avatar">{initials}</span>
              <span>
                <b>{name}</b>
                <small>{title}</small>
              </span>
            </footer>
          </blockquote>
        );
      })}
    </div>
  );
}

export function AboutPreview() {
  const cards = [
    [
      'Core Values',
      'We work with curiosity, clear thinking, accountability, and respect for the people who use what we build.',
      ShieldStar,
    ],
    [
      'Mission',
      'Make high-impact work more coherent by bringing strategy, design, engineering, and infrastructure into one accountable studio practice.',
      Target,
    ],
    [
      'Vision',
      'Be the trusted African studio behind the digital systems and brands shaping what comes next.',
      Telescope,
    ],
  ] as const;

  return (
    <section className="section about-preview">
      <SectionHead
        label="About us"
        title="A studio built on"
        accent="purpose and precision."
      />
      <p className="about-preview-intro">
        GhreatnessLabs is an independent digital and IT solutions studio, founded in Lagos in 2024 to create high-impact systems and brands for ambitious teams.
      </p>
      <div className="about-preview-cards">
        {cards.map(([title, copy, Icon], index) => (
          <article
            key={title}
            className={`about-preview-card ${index % 2 ? 'about-preview-card-dark' : ''}`}
          >
            <span className="about-preview-icon">
              <Icon />
            </span>
            <div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
          </article>
        ))}
      </div>
      <Link to="/about" className="about-preview-link">
        Learn more about us <ArrowUpRight />
      </Link>
    </section>
  );
}

export function LeadershipPreview() {
  return (
    <section className="section leadership-preview">
      <SectionHead label="Leadership" title="The brains behind the work" />
      <div className="leadership-row" aria-label="Leadership team">
        {site.team.map(([name, role]) => (
          <Link key={name} to="/leadership" className="leader-preview-card">
            <span className="leader-preview-avatar">
              {name
                .split(' ')
                .map((part) => part[0])
                .join('')}
            </span>
            <b>{name}</b>
            <small>{role}</small>
          </Link>
        ))}
      </div>
      <Link to="/leadership" className="about-preview-link">
        View full leadership team <ArrowUpRight />
      </Link>
    </section>
  );
}

export function Partners() {
  return (
    <section className="section partners-section soft-section">
      <SectionHead
        label="Partners & clients"
        title="In good company."
        copy="A few of the ambitious teams and ventures we are proud to work alongside."
      />
      <div className="partner-row" aria-label="Partners and clients">
        {site.clients.map((partner) => (
          <span className="partner-logo" key={partner}>
            {partner}
          </span>
        ))}
      </div>
    </section>
  );
}
