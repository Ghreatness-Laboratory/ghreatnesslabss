import React, { useEffect, useRef, useState, useMemo } from 'react';
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

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="empty-state" style={{ textAlign: 'center', padding: '48px 16px' }}>
      <div className="icon-badge" style={{ margin: '0 auto 16px', display: 'inline-flex' }}>
        <Icon />
      </div>
      <h3 style={{ margin: '0 0 8px', fontSize: 'var(--font-card-title)', lineHeight: 1.25 }}>{title}</h3>
      <p style={{ margin: 0, color: '#666', fontSize: 'var(--font-body)', lineHeight: 1.6 }}>{subtitle}</p>
    </div>
  );
}

export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    // If it's a foundation year like 2024, never format with a comma
    const isYear = value === '2024' || value === '2,024';
    const cleanValue = isYear ? '2024' : value;
    const target = Number(cleanValue.replace(/,/g, ''));
    const element = ref.current;
    if (!element || isNaN(target)) {
      if (element) element.textContent = cleanValue;
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
            element.textContent = isYear ? String(current) : current.toLocaleString();
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
      }}
    >
      0
    </strong>
  );
}

export function Stats() {
  const { data } = useCms();
  const sortedStats = [...data.stats].sort((a, b) => a.sort_order - b.sort_order);

  // Exact normalized labels, values, and single-line captions with zero duplicate wording:
  // 1) FOUNDED / "Lagos studio launch"
  // 2) CLIENTS / "Served globally"
  // 3) CERTIFIED / "Verified credentials"
  // 4) MARKETS / "Active markets"
  const getCleanStat = (item: (typeof sortedStats)[0], index: number) => {
    const rawLabel = (item.label || '').toUpperCase();
    if (rawLabel.includes('FOUND') || index === 0) {
      return {
        label: 'FOUNDED',
        value: '2024',
        caption: 'Lagos studio launch',
        icon: item.icon_name || 'building-2',
      };
    }
    if (rawLabel.includes('CLIENT') || index === 1) {
      return {
        label: 'CLIENTS',
        value: item.value,
        caption: 'Served globally',
        icon: item.icon_name || 'users-round',
      };
    }
    if (rawLabel.includes('CERT') || index === 2) {
      return {
        label: 'CERTIFIED',
        value: item.value,
        caption: 'Verified credentials',
        icon: item.icon_name || 'badge-check',
      };
    }
    return {
      label: 'MARKETS',
      value: item.value,
      caption: 'Active markets',
      icon: item.icon_name || 'globe-2',
    };
  };

  return (
    <section className="stats-section" aria-label="Studio statistics">
      <div className="stats-grid">
        {sortedStats.slice(0, 4).map((item, idx) => {
          const stat = getCleanStat(item, idx);
          const Icon = icons[stat.icon] || icons['building-2'];
          return (
            <article key={item.id} className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">{stat.label}</span>
                <span className="stat-icon-tile" aria-hidden="true">
                  <Icon size={15} />
                </span>
              </div>
              <div className="stat-card-number">
                <CountUp value={stat.value} />
              </div>
              <p className="stat-card-caption">{stat.caption}</p>
            </article>
          );
        })}
      </div>
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

  // Isolate "How we started" card
  const howWeStartedCard =
    sortedCards.find((c) => c.title.toLowerCase().includes('started')) || sortedCards[0];
  const secondaryCards = sortedCards
    .filter((c) => c.id !== howWeStartedCard?.id)
    .slice(0, 2);

  return (
    <section className="section about-preview" aria-label="About the studio">
      <p className="eyebrow-label">— ABOUT</p>
      <h2 className="about-heading-26">
        A studio built on <span className="text-muted-gray">purpose and precision.</span>
      </h2>
      <p className="about-body-14">
        GhreatnessLabs, also known as Ghreatness Laboratory, is an independent digital and IT solutions studio founded in Lagos in 2024 to create high-impact systems, software, and brand infrastructure for ambitious teams.
      </p>

      <div className="about-cards-stack">
        {/* "How we started": white card with hairline border, black icon tile, 15px title, 13px gray description */}
        {howWeStartedCard && (
          <article className="how-we-started-card">
            <span className="feature-icon-tile" aria-hidden="true">
              {React.createElement(icons[howWeStartedCard.icon_name] || icons['building-2'], { size: 18 })}
            </span>
            <div className="about-card-body">
              <h3 className="how-we-started-title">{howWeStartedCard.title}</h3>
              <p className="how-we-started-desc">{howWeStartedCard.description}</p>
            </div>
          </article>
        )}

        {secondaryCards.map((item) => {
          const Icon = icons[item.icon_name] || icons['target'];
          return (
            <article key={item.id || item.title} className="how-we-started-card">
              <span className="feature-icon-tile" aria-hidden="true">
                <Icon size={18} />
              </span>
              <div className="about-card-body">
                <h3 className="how-we-started-title">{item.title}</h3>
                <p className="how-we-started-desc">{item.description}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6">
        <Link to="/about" className="button">
          Learn more about us <ArrowUpRight size={14} className="ml-1 inline" />
        </Link>
      </div>
    </section>
  );
}

export function LeadershipPreview() {
  const { data } = useCms();
  const [isPaused, setIsPaused] = useState(false);

  // Memoize repeated leaders array to ensure continuous seamless loop across any viewport
  const loopLeaders = useMemo(() => {
    const list = [...data.leadership].sort((a, b) => a.sort_order - b.sort_order);
    if (list.length === 0) return [];
    let repeated = list;
    while (repeated.length < 8) {
      repeated = [...repeated, ...list];
    }
    return repeated;
  }, [data.leadership]);

  const renderLeaderCards = (keyPrefix: string) =>
    loopLeaders.map((leader, idx) => {
      const initials = leader.name
        .split(' ')
        .map((part) => part[0])
        .join('');

      return (
        <Link
          key={`${keyPrefix}-${leader.id}-${idx}`}
          to="/leadership"
          className="leader-preview-card marquee-card"
        >
          <span className="leader-preview-avatar overflow-hidden">
            {leader.avatar_url ? (
              <img
                src={leader.avatar_url}
                alt={leader.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              initials
            )}
          </span>
          <b>{leader.name}</b>
          <small>{leader.role}</small>
        </Link>
      );
    });

  return (
    <section className="section leadership-preview" aria-label="Leadership team">
      <SectionHead label="— LEADERSHIP" title="The brains behind the work" />

      {/* Auto-moving Infinite Marquee (Right to Left) */}
      <div
        className={`marquee-wrapper ${isPaused ? 'marquee-paused' : ''}`}
        aria-label="Leadership team marquee"
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onTouchCancel={() => setIsPaused(false)}
      >
        <div className="marquee-fade-edge marquee-fade-left" aria-hidden="true" />
        <div className="marquee-fade-edge marquee-fade-right" aria-hidden="true" />

        <div className="marquee-track marquee-rtl">
          <div className="marquee-content">{renderLeaderCards('track-1')}</div>
          <div className="marquee-content marquee-duplicate" aria-hidden="true">
            {renderLeaderCards('track-2')}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link to="/leadership" className="button">
          View full leadership team <ArrowUpRight size={14} className="ml-1 inline" />
        </Link>
      </div>
    </section>
  );
}

export function Partners() {
  const { data } = useCms();
  const [isPaused, setIsPaused] = useState(false);

  // Memoize repeated clients array for smooth continuous loop
  const loopClients = useMemo(() => {
    const list = [...data.clients].sort((a, b) => a.sort_order - b.sort_order);
    if (list.length === 0) return [];
    let repeated = list;
    while (repeated.length < 10) {
      repeated = [...repeated, ...list];
    }
    return repeated;
  }, [data.clients]);

  const renderPartnerLogos = (keyPrefix: string) =>
    loopClients.map((partner, idx) => (
      <span
        className="partner-marquee-item"
        key={`${keyPrefix}-${partner.id}-${idx}`}
        title={partner.name}
      >
        {partner.logo_url ? (
          <img
            src={partner.logo_url}
            alt={`${partner.name} logo`}
            className="partner-logo-img"
            loading="lazy"
            width={120}
            height={44}
          />
        ) : (
          <span className="partner-logo-text">{partner.name}</span>
        )}
      </span>
    ));

  return (
    <section className="section partners-section soft-section" aria-label="Partners and clients">
      <SectionHead
        label="— PARTNERS &amp; CLIENTS"
        title="In good company."
        copy="A few of the ambitious teams and ventures we are proud to work alongside."
      />

      {/* Auto-moving Infinite Marquee (Left to Right, opposite direction, slightly different speed) */}
      <div
        className={`marquee-wrapper ${isPaused ? 'marquee-paused' : ''}`}
        aria-label="Partners and clients marquee"
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onTouchCancel={() => setIsPaused(false)}
      >
        <div className="marquee-fade-edge marquee-fade-left" aria-hidden="true" />
        <div className="marquee-fade-edge marquee-fade-right" aria-hidden="true" />

        <div className="marquee-track marquee-ltr">
          <div className="marquee-content">{renderPartnerLogos('partner-track-1')}</div>
          <div className="marquee-content marquee-duplicate" aria-hidden="true">
            {renderPartnerLogos('partner-track-2')}
          </div>
        </div>
      </div>
    </section>
  );
}
