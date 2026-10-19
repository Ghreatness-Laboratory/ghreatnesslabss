import React, { useEffect, useRef } from 'react';
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
  Mail,
  Phone,
  Send,
  type LucideIcon,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';

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
  target: Target,
  eye: Eye,
  telescope: Telescope,
  mail: Mail,
  phone: Phone,
  send: Send,
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
  ['/admin', 'Admin CMS'],
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
    if (!element || isNaN(target)) {
      if (element) element.textContent = value;
      return;
    }

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
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const current = Math.floor(progress * target);
          if (element) {
            element.textContent = current.toLocaleString();
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
  const { data } = useCms();
  const sortedStats = [...data.stats].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <section className="stats">
      {sortedStats.map((item) => {
        const Icon = icons[item.icon_name] || icons['building-2'];
        return (
          <article key={item.id}>
            <span className="icon-badge">
              <Icon />
            </span>
            <div>
              <CountUp value={item.value} />
              <p>
                {item.label}
                <span>{item.caption}</span>
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
  const { data } = useCms();
  const sorted = [...data.capabilities].sort((a, b) => a.sort_order - b.sort_order);
  const items = limit ? sorted.slice(0, limit) : sorted;

  return (
    <div className="cap-grid">
      {items.map((item, index) => {
        const Icon = icons[item.icon_name] || icons['pen-tool'];
        return (
          <article className={`cap ${index % 2 ? 'cap-dark' : ''}`} key={item.id || item.title}>
            <div className="cap-header">
              <span className="icon-badge">
                <Icon />
              </span>
              <small>{item.category_label}</small>
              <span className="cap-index">{String(index + 1).padStart(2, '0')}</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <div className="tags">
              {item.tags.map((tag) => (
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
  items: Array<{ id: string; title: string; description: string; icon_name: string }>;
}) {
  return (
    <div className="service-list">
      {items.map((item, index) => {
        const Icon = icons[item.icon_name] || icons['shapes'];
        return (
          <article
            className={`service-item ${index % 2 ? 'service-dark' : ''}`}
            key={item.id || item.title}
          >
            <span className="icon-badge">
              <Icon />
            </span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
            <span className="cap-index">{String(index + 1).padStart(2, '0')}</span>
          </article>
        );
      })}
    </div>
  );
}

export function Ventures({ limit }: { limit?: number }) {
  const { data } = useCms();
  const sorted = [...data.projects].sort((a, b) => a.sort_order - b.sort_order);
  const items = limit ? sorted.slice(0, limit) : sorted;

  return (
    <div className="venture-grid">
      {items.map((item, i) => {
        const projectHref = item.slug
          ? `/projects/${item.slug}`
          : item.project_url && item.project_url.startsWith('/projects')
          ? item.project_url
          : `/projects/${item.id}`;

        return (
          <article className={`venture v${i}`} key={item.id || item.title}>
            <Link to={projectHref} className="venture-visual-link" aria-label={`View ${item.title} case study`}>
              <div className="venture-visual">
                <span className="venture-badge">{item.category_tag}</span>
                <span className="venture-mark">
                  <i />
                  <b />
                </span>
              </div>
            </Link>
            <div className="venture-body">
              <h3>
                <Link to={projectHref} className="venture-title-link">
                  {item.title}
                </Link>
              </h3>
              <p>{item.description}</p>
              {item.detail && <p className="venture-detail">{item.detail}</p>}
              <Link to={projectHref} className="venture-cta-link">
                View case study <ArrowUpRight />
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function Testimonials({ limit }: { limit?: number }) {
  const { data } = useCms();
  const sorted = [...data.testimonials].sort((a, b) => a.sort_order - b.sort_order);
  const items = limit ? sorted.slice(0, limit) : sorted;

  return (
    <div className="trust-grid">
      {items.map((item) => {
        const initials = item.author_name
          .split(' ')
          .map((x) => x[0])
          .join('');
        return (
          <blockquote key={item.id || item.author_name}>
            <Quote className="testimonial-quote" />
            <small>{item.location}</small>
            <p>{item.quote}</p>
            <footer>
              <span className="testimonial-avatar">{initials}</span>
              <span>
                <b>{item.author_name}</b>
                <small>
                  {item.author_role}
                  {item.author_company ? `, ${item.author_company}` : ''}
                </small>
              </span>
            </footer>
          </blockquote>
        );
      })}
    </div>
  );
}

export function AboutPreview() {
  const { data } = useCms();
  const sortedCards = [...data.aboutCards].sort((a, b) => a.sort_order - b.sort_order);
  const cards = sortedCards.slice(0, 3);

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
        {cards.map((item, index) => {
          const Icon = icons[item.icon_name] || icons['target'];
          return (
            <article
              key={item.id || item.title}
              className={`about-preview-card ${index % 2 ? 'about-preview-card-dark' : ''}`}
            >
              <span className="about-preview-icon">
                <Icon />
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          );
        })}
      </div>
      <Link to="/about" className="about-preview-link">
        Learn more about us <ArrowUpRight />
      </Link>
    </section>
  );
}

export function LeadershipPreview() {
  const { data } = useCms();
  const sortedLeaders = [...data.leadership].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <section className="section leadership-preview">
      <SectionHead label="Leadership" title="The brains behind the work" />
      <div className="leadership-row" aria-label="Leadership team">
        {sortedLeaders.map((leader) => (
          <Link key={leader.id || leader.name} to="/leadership" className="leader-preview-card">
            <span className="leader-preview-avatar">
              {leader.name
                .split(' ')
                .map((part) => part[0])
                .join('')}
            </span>
            <b>{leader.name}</b>
            <small>{leader.role}</small>
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
  const { data } = useCms();
  const sortedClients = [...data.clients].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <section className="section partners-section soft-section">
      <SectionHead
        label="Partners & clients"
        title="In good company."
        copy="A few of the ambitious teams and ventures we are proud to work alongside."
      />
      <div className="partner-row" aria-label="Partners and clients">
        {sortedClients.map((partner) => (
          <span className="partner-logo" key={partner.id || partner.name}>
            {partner.name}
          </span>
        ))}
      </div>
    </section>
  );
}
