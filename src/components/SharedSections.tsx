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
  ChevronLeft,
  ChevronRight,
  Pause,
  Target,
  Eye,
  Telescope,
  Mail,
  Phone,
  Send,
  Linkedin,
  Twitter,
  Layers,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { HoldingBanner } from './HoldingBanner';
import { slugify } from './admin/LinksManager';
import { ClientItem, LeaderItem } from '../types/cms';

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

export const Label = ({
  children,
  variant = 'section',
}: {
  children: React.ReactNode;
  variant?: 'section' | 'hero';
}) => (
  <p className={`label ${variant === 'hero' ? 'label-hero' : 'label-section'}`}>
    <span
      className={variant === 'hero' ? 'eyebrow-line' : 'eyebrow-square'}
      aria-hidden="true"
    />
    <span className="eyebrow-text">{children}</span>
  </p>
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
  variant,
  href = '/contact',
}: {
  children: React.ReactNode;
  solid?: boolean;
  variant?: 'primary' | 'secondary' | 'link';
  href?: string;
}) => {
  const resolvedVariant = variant ?? (solid ? 'primary' : 'secondary');
  const variantClass =
    resolvedVariant === 'primary'
      ? 'button-solid'
      : resolvedVariant === 'link'
      ? 'button-link'
      : 'button-secondary';
  return (
    <Link to={href} className={`button ${variantClass}`}>
      {children}
    </Link>
  );
};

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
    <div className="empty-state">
      <div className="icon-badge empty-state-icon">
        <Icon size={18} strokeWidth={1.7} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{subtitle}</p>
    </div>
  );
}

/**
 * Resilient project/cover image with gradient mesh fallback so broken URLs
 * never render a broken-image icon or empty black box.
 */
export function ResilientCoverImage({
  src,
  alt,
  title,
  category,
  className = '',
}: {
  src?: string;
  alt: string;
  title: string;
  category?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(!src);

  useEffect(() => {
    setFailed(!src);
  }, [src]);

  const initials = title
    .split(/[\s/]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  if (failed || !src) {
    return (
      <div className={`cover-fallback-gradient ${className}`} aria-label={alt}>
        <div className="cover-fallback-grid" aria-hidden="true" />
        <div className="cover-fallback-content" aria-hidden="true">
          <span className="cover-fallback-monogram">
            {initials || <Layers size={18} strokeWidth={1.7} />}
          </span>
          <span className="cover-fallback-title">{title}</span>
          {category && <span className="cover-fallback-sub">{category}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className={`cover-image-shell ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover"
        onLoad={(e) => {
          if (e.currentTarget.naturalWidth === 0) setFailed(true);
        }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

/**
 * Resilient 52px client chip: displays logo if it loads cleanly,
 * otherwise falls back to crisp client name text.
 */
export function ClientLogoChip({ client }: { client: ClientItem }) {
  const [imgFailed, setImgFailed] = useState(!client.logo_url);

  useEffect(() => {
    setImgFailed(!client.logo_url);
  }, [client.logo_url]);

  return (
    <div className="client-chip" title={client.name}>
      {client.logo_url && !imgFailed ? (
        <img
          src={client.logo_url}
          alt={`${client.name} logo`}
          className="client-chip-img"
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={(e) => {
            if (e.currentTarget.naturalWidth === 0) setImgFailed(true);
          }}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span className="client-chip-text">{client.name}</span>
      )}
    </div>
  );
}

/**
 * Resilient circular avatar with initials fallback.
 */
export function ResilientAvatar({
  src,
  name,
  className = '',
}: {
  src?: string;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(!src);

  useEffect(() => {
    setFailed(!src);
  }, [src]);

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((x) => x[0])
    .join('')
    .slice(0, 2);

  if (failed || !src) {
    return <span className={`avatar-initials ${className}`}>{initials}</span>;
  }

  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      referrerPolicy="no-referrer"
      className={`w-full h-full object-cover ${className}`}
      onLoad={(e) => {
        if (e.currentTarget.naturalWidth === 0) setFailed(true);
      }}
      onError={() => setFailed(true)}
    />
  );
}

export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const isYear = value === '2024' || value === '2,024';
    const cleanValue = isYear ? '2024' : value;
    const target = Number(cleanValue.replace(/,/g, ''));
    const element = ref.current;
    if (!element || isNaN(target)) {
      if (element) element.textContent = cleanValue;
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      element.textContent = isYear ? String(target) : target.toLocaleString();
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
        const duration = 800;

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
                  <Icon size={14} strokeWidth={1.7} />
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
  as = 'h2',
  eyebrowVariant = 'section',
}: {
  label: string;
  title: string;
  accent?: string;
  copy?: string;
  as?: 'h1' | 'h2';
  eyebrowVariant?: 'section' | 'hero';
}) {
  const HeadingTag = as;
  return (
    <div className={`section-head-block ${eyebrowVariant === 'hero' ? 'is-hero' : ''}`}>
      <Label variant={eyebrowVariant}>{label}</Label>
      <HeadingTag className={as === 'h1' ? 'page-hero-heading' : 'section-heading'}>
        {title} {accent && <em>{accent}</em>}
      </HeadingTag>
      {copy && <p className="section-intro">{copy}</p>}
    </div>
  );
}

export function Capabilities({ limit }: { limit?: number }) {
  const { data } = useCms();
  const sorted = [...data.capabilities].sort((a, b) => a.sort_order - b.sort_order);
  const items = limit ? sorted.slice(0, limit) : sorted;

  return (
    <div className="practice-list-card">
      {items.map((item, index) => {
        const Icon = icons[item.icon_name] || icons['pen-tool'];
        return (
          <article className="practice-row" key={item.id || item.title}>
            <span className="practice-row-icon" aria-hidden="true">
              <Icon size={20} strokeWidth={1.8} />
            </span>
            <div className="practice-row-content">
              <div className="practice-row-header">
                <h3>{item.title}</h3>
                <span className="practice-row-index">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <p className="practice-row-desc">{item.description}</p>
              {item.tags?.length > 0 && (
                <div className="practice-tags-row">
                  {item.tags.map((tag) => (
                    <span key={tag} className="practice-tag-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
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
    <div className="grouped-list-card" role="list">
      {items.map((item, index) => {
        const Icon = icons[item.icon_name] || icons['shapes'];
        return (
          <article
            className="service-grouped-row"
            key={item.id || item.title}
            role="listitem"
          >
            <span className="service-row-icon" aria-hidden="true">
              <Icon size={17} strokeWidth={1.7} />
            </span>
            <div className="service-row-copy">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
            <span className="service-row-index">
              {String(index + 1).padStart(2, '0')}
            </span>
          </article>
        );
      })}
    </div>
  );
}

export function Ventures({ limit }: { limit?: number }) {
  const { data } = useCms();
  const sorted = [...data.projects]
    .filter((p) => p.published !== false)
    .sort((a, b) => a.sort_order - b.sort_order);
  const items = limit ? sorted.slice(0, limit) : sorted;

  return (
    <div className="venture-grid">
      {items.map((item, i) => {
        const projectHref = item.slug
          ? `/projects/${item.slug}`
          : item.project_url && item.project_url.startsWith('/projects')
          ? item.project_url
          : `/projects/${item.id}`;

        const coverImage = item.image_url || item.hero_image_url;
        const liveSiteUrl = item.live_url || item.project_url || '#';

        return (
          <article className={`venture v${i}`} key={item.id || item.title}>
            <a
              href={projectHref}
              className="venture-visual"
              aria-label={`View ${item.title} case study`}
            >
              <span className="venture-badge">{item.category_tag}</span>
              <ResilientCoverImage
                src={coverImage}
                alt={`${item.title} preview`}
                title={item.title}
                category={item.category_tag}
                className="w-full h-full"
              />
            </a>

            <div className="venture-body">
              <h3>
                <a href={projectHref} className="venture-title-link">
                  {item.title}
                </a>
              </h3>
              <p>{item.description}</p>

              <div className="venture-actions">
                <a
                  href={liveSiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="venture-btn venture-btn-primary"
                  aria-label={`Visit ${item.title} website (opens in a new tab)`}
                >
                  <span>Visit site</span>
                  <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
                </a>

                <a
                  href={projectHref}
                  className="venture-btn venture-btn-secondary"
                  aria-label={`Read ${item.title} case study brief`}
                >
                  <span>Case study</span>
                </a>
              </div>
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
            <div className="testimonial-top-row">
              <Quote size={16} strokeWidth={1.7} className="testimonial-quote" />
              <small>{item.location}</small>
            </div>
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

export function InfoCard({
  iconName,
  title,
  description,
  fallbackIcon = 'target',
}: {
  iconName?: string;
  title: string;
  description: string;
  fallbackIcon?: string;
}) {
  const Icon = icons[iconName || ''] || icons[fallbackIcon] || icons['target'];
  return (
    <article className="info-card">
      <div className="info-card-header">
        <span className="info-card-icon-tile" aria-hidden="true">
          <Icon size={20} strokeWidth={1.8} />
        </span>
        <h3 className="info-card-title">{title}</h3>
      </div>
      <p className="info-card-body">{description}</p>
    </article>
  );
}

export function AboutPreview() {
  const { data } = useCms();
  const sortedCards = [...data.aboutCards].sort((a, b) => a.sort_order - b.sort_order);

  const missionCard = sortedCards.find((c) => c.type === 'mission' || c.title.toLowerCase().includes('mission'));
  const visionCard = sortedCards.find((c) => c.type === 'vision' || c.title.toLowerCase().includes('vision'));
  const coreValuesCard = sortedCards.find((c) => c.type === 'core_values' || c.title.toLowerCase().includes('value'));

  const infoCards = [missionCard, visionCard, coreValuesCard].filter(Boolean) as typeof sortedCards;

  return (
    <section className="section about-preview" aria-label="About the studio">
      <SectionHead
        label="About"
        title="A studio built on"
        accent="purpose and precision."
        copy="Ghreatness Labs (Ghreatness Lab / GhreatnessLabs) is an independent digital and IT solutions studio founded in Lagos in 2024 to build high-impact systems, software, and brand infrastructure."
      />

      {infoCards.length > 0 && (
        <div className="about-info-stack">
          {infoCards.map((item) => (
            <InfoCard
              key={item.id || item.title}
              iconName={item.icon_name}
              title={item.title}
              description={item.description}
              fallbackIcon={item.type === 'core_values' ? 'shield-check' : 'target'}
            />
          ))}
        </div>
      )}

      <div className="about-holding-wrap">
        <HoldingBanner variant="card" />
      </div>

      <div className="section-link-wrap">
        <Button variant="link" href="/about">
          <span>Learn more about us</span>
          <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}

export function LeaderSnapCard({ leader }: { leader: LeaderItem }) {
  const slug = leader.slug || slugify(leader.name);
  const profileUrl = `/leadership/${slug}`;

  return (
    <article className="leader-snap-card">
      <a
        href={profileUrl}
        className="leader-snap-main"
        aria-label={`View full profile of ${leader.name}, ${leader.role}`}
      >
        <span className="leader-snap-avatar">
          <ResilientAvatar src={leader.avatar_url} name={leader.name} />
        </span>
        <h3 className="leader-snap-name">{leader.name}</h3>
        <small className="leader-snap-role">{leader.role}</small>
        <p className="leader-snap-bio">{leader.bio}</p>
      </a>

      <div className="leader-snap-socials">
        {leader.social_links?.linkedin && (
          <a
            aria-label={`${leader.name} LinkedIn`}
            href={leader.social_links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="leader-snap-social-btn"
          >
            <Linkedin size={16} strokeWidth={1.8} aria-hidden="true" />
          </a>
        )}
        {leader.social_links?.twitter && (
          <a
            aria-label={`${leader.name} on X`}
            href={leader.social_links.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="leader-snap-social-btn"
          >
            <Twitter size={16} strokeWidth={1.8} aria-hidden="true" />
          </a>
        )}
        <a
          href={profileUrl}
          className="leader-snap-profile-link"
          aria-label={`Profile of ${leader.name}`}
        >
          <span>Profile</span>
          <ArrowUpRight size={13} strokeWidth={1.8} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

export function LeadershipPreview() {
  const { data } = useCms();
  const sortedLeaders = [...data.leadership].sort((a, b) => a.sort_order - b.sort_order);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHoverOrFocusPaused, setIsHoverOrFocusPaused] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const cardStep = 310 + 12; // 310px card + 12px gap
  const maxIndex = Math.max(0, sortedLeaders.length - 1);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const scrollToCard = (index: number, behavior: ScrollBehavior = 'smooth') => {
    const track = trackRef.current;
    if (!track || sortedLeaders.length === 0) return;
    const clamped = Math.max(0, Math.min(maxIndex, index));
    track.scrollTo({ left: clamped * cardStep, behavior });
    setActiveIndex(clamped);
  };

  useEffect(() => {
    if (prefersReducedMotion || hasUserInteracted || isHoverOrFocusPaused || sortedLeaders.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => {
        const next = prev >= maxIndex ? 0 : prev + 1;
        const track = trackRef.current;
        if (track) {
          track.scrollTo({ left: next * cardStep, behavior: 'smooth' });
        }
        return next;
      });
    }, 5000);

    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, hasUserInteracted, isHoverOrFocusPaused, sortedLeaders.length, maxIndex, cardStep]);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || sortedLeaders.length === 0) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 0) {
      setActiveIndex(0);
      return;
    }
    if (track.scrollLeft >= maxScroll - 8) {
      setActiveIndex(maxIndex);
      return;
    }
    const nextIdx = Math.min(maxIndex, Math.max(0, Math.round(track.scrollLeft / cardStep)));
    setActiveIndex(nextIdx);
  };

  const handlePrev = () => {
    setHasUserInteracted(true);
    if (activeIndex <= 0) return;
    scrollToCard(activeIndex - 1);
  };

  const handleNext = () => {
    setHasUserInteracted(true);
    if (activeIndex >= maxIndex) return;
    scrollToCard(activeIndex + 1);
  };

  const handleDotClick = (idx: number) => {
    setHasUserInteracted(true);
    scrollToCard(idx);
  };

  const stopAutoplayOnUserInput = () => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }
  };

  const atStart = activeIndex <= 0;
  const atEnd = activeIndex >= maxIndex;

  return (
    <section
      className="section leadership-preview"
      aria-label="Leadership team"
      onMouseEnter={() => setIsHoverOrFocusPaused(true)}
      onMouseLeave={() => setIsHoverOrFocusPaused(false)}
      onFocus={() => setIsHoverOrFocusPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsHoverOrFocusPaused(false);
        }
      }}
    >
      <div className="section-head-block">
        <Label>Leadership</Label>
        <h2 className="section-heading">
          The brains behind <em>the work.</em>
        </h2>
        <div className="leader-intro-controls-row">
          <p className="section-intro">
            Senior thinking stays close to the brief, the details, and the people making decisions.
          </p>
          {sortedLeaders.length > 1 && (
            <div className="leader-controls" role="group" aria-label="Leadership carousel navigation">
              <button
                type="button"
                className="leader-nav-btn leader-nav-prev"
                onClick={handlePrev}
                disabled={atStart}
                aria-label="Previous team member"
              >
                <ChevronLeft size={18} strokeWidth={2.1} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`leader-nav-btn leader-nav-next ${!atEnd ? 'is-solid' : ''}`}
                onClick={handleNext}
                disabled={atEnd}
                aria-label="Next team member"
              >
                <ChevronRight size={18} strokeWidth={2.1} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        ref={trackRef}
        className="leader-snap-row"
        role="list"
        aria-label="Studio leadership team"
        onScroll={handleScroll}
        onTouchStart={stopAutoplayOnUserInput}
        onPointerDown={stopAutoplayOnUserInput}
        onWheel={stopAutoplayOnUserInput}
      >
        {sortedLeaders.map((leader) => (
          <div key={leader.id || leader.name} role="listitem">
            <LeaderSnapCard leader={leader} />
          </div>
        ))}
      </div>

      {sortedLeaders.length > 1 && (
        <div className="leader-pagination" role="tablist" aria-label="Leadership carousel pagination">
          {sortedLeaders.map((leader, idx) => (
            <button
              key={leader.id || leader.name}
              type="button"
              role="tab"
              aria-selected={activeIndex === idx}
              aria-label={`Show ${leader.name}`}
              className={`leader-pagination-dot ${activeIndex === idx ? 'is-active' : ''}`}
              onClick={() => handleDotClick(idx)}
            />
          ))}
        </div>
      )}

      <div className="section-link-wrap">
        <Button variant="link" href="/leadership">
          <span>View full leadership team</span>
          <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}

function MarqueeClientCard({ client }: { client: ClientItem }) {
  const [imgFailed, setImgFailed] = useState(!client.logo_url);

  useEffect(() => {
    setImgFailed(!client.logo_url);
  }, [client.logo_url]);

  return (
    <div className="partners-marquee-card" title={client.name}>
      {client.logo_url && !imgFailed ? (
        <img
          src={client.logo_url}
          alt={`${client.name} logo`}
          className="partners-marquee-img"
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={(e) => {
            if (e.currentTarget.naturalWidth === 0) setImgFailed(true);
          }}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span className="partners-marquee-text">{client.name}</span>
      )}
    </div>
  );
}

export function Partners() {
  const { data } = useCms();
  const sortedClients = [...data.clients].sort((a, b) => a.sort_order - b.sort_order);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedRowIndex, setPausedRowIndex] = useState<number | null>(null);

  // Guarantee each loop copy is at least as wide as desktop & mobile viewports (>= 10 items * 160px = 1600px)
  const buildRowItems = (source: ClientItem[]) => {
    if (source.length === 0) return [];
    const repeatCount = Math.max(1, Math.ceil(10 / source.length));
    const expanded: ClientItem[] = [];
    for (let i = 0; i < repeatCount; i += 1) {
      expanded.push(...source);
    }
    return expanded;
  };

  const row1Items = buildRowItems(sortedClients);
  const row2Items = buildRowItems([...sortedClients].reverse());

  return (
    <section className="section partners-section" aria-label="Partners and clients">
      <SectionHead
        label="Partners & Clients"
        title="In good"
        accent="company."
        copy="Ambitious teams and ventures we are proud to work alongside."
      />

      <div
        className="partners-marquee-shell"
        data-paused={isPaused ? 'true' : 'false'}
      >
        <div className="partners-marquee-stack">
          {[row1Items, row2Items].map((items, rowIndex) => (
            <div
              key={rowIndex}
              className={`partners-marquee-row ${rowIndex === 1 ? 'is-reverse' : ''}`}
              data-touch-paused={pausedRowIndex === rowIndex ? 'true' : 'false'}
              onPointerDown={() => setPausedRowIndex(rowIndex)}
              onPointerUp={() => setPausedRowIndex(null)}
              onPointerCancel={() => setPausedRowIndex(null)}
              onTouchStart={() => setPausedRowIndex(rowIndex)}
              onTouchEnd={() => setPausedRowIndex(null)}
            >
              <div className="partners-marquee-track">
                <div className="partners-marquee-group">
                  {items.map((client, idx) => (
                    <MarqueeClientCard
                      key={`r${rowIndex}-a-${client.id || client.name}-${idx}`}
                      client={client}
                    />
                  ))}
                </div>
                <div className="partners-marquee-group" aria-hidden="true">
                  {items.map((client, idx) => (
                    <MarqueeClientCard
                      key={`r${rowIndex}-b-${client.id || client.name}-${idx}`}
                      client={client}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="partners-marquee-controls">
        <span className="partners-marquee-caption">
          {isPaused ? 'Partner showcase paused' : 'Trusted partners & ventures'}
        </span>
        <button
          type="button"
          className="partners-pause-btn"
          aria-pressed={isPaused}
          aria-label={isPaused ? 'Play partners marquee' : 'Pause partners marquee'}
          onClick={() => setIsPaused((prev) => !prev)}
        >
          {isPaused ? (
            <Play size={13} strokeWidth={2.2} aria-hidden="true" />
          ) : (
            <Pause size={13} strokeWidth={2.2} aria-hidden="true" />
          )}
        </button>
      </div>
    </section>
  );
}
