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
      className={variant === 'hero' ? 'eyebrow-pulse-dot' : 'eyebrow-square'}
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
        <Icon size={16} strokeWidth={2} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{subtitle}</p>
    </div>
  );
}

/**
 * Resilient project/cover image with skeleton shimmer + fallback so broken URLs
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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFailed(!src);
    setLoaded(false);
  }, [src]);

  const initials = title
    .split(/[\s/]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  if (failed || !src) {
    return (
      <div className={`cover-fallback-gradient is-compact ${className}`} aria-label={alt}>
        <div className="cover-fallback-grid" aria-hidden="true" />
        <div className="cover-fallback-content is-horizontal" aria-hidden="true">
          <span className="cover-fallback-monogram">
            {initials || <Layers size={16} strokeWidth={2} />}
          </span>
          <span className="cover-fallback-text-group">
            <span className="cover-fallback-title">{title}</span>
            {category && <span className="cover-fallback-sub">{category}</span>}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`cover-image-shell ${className}`}>
      {!loaded && <div className="image-skeleton" aria-hidden="true" />}
      <img
        src={src}
        alt={alt}
        width={640}
        height={360}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className={`w-full h-full object-cover img-fade-in ${loaded ? 'is-loaded' : ''}`}
        onLoad={(e) => {
          if (e.currentTarget.naturalWidth === 0) {
            setFailed(true);
          } else {
            setLoaded(true);
          }
        }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function isPartnerWallpaperUrl(url?: string): boolean {
  if (!url) return false;
  return (
    url.includes('images.unsplash.com/photo-') ||
    url.includes('/assets/aistudio/') ||
    /\.(jpe?g)(\?|$)/i.test(url)
  );
}

function PartnerMonochromeMark({ name }: { name: string }) {
  const key = name.trim().toLowerCase();

  if (key.includes('vertex')) {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M3 4.5L10 16.5L17 4.5H13.6L10 10.8L6.4 4.5H3Z" fill="currentColor" />
      </svg>
    );
  }
  if (key.includes('duct')) {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="14" height="4" rx="1.5" fill="currentColor" />
        <rect x="3" y="12" width="14" height="4" rx="1.5" fill="currentColor" opacity="0.55" />
      </svg>
    );
  }
  if (key.includes('mora')) {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="7" cy="10" r="4" stroke="currentColor" strokeWidth="2.2" />
        <circle cx="13" cy="10" r="4" stroke="currentColor" strokeWidth="2.2" opacity="0.55" />
      </svg>
    );
  }
  if (key.includes('athle')) {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 2.5L16.5 6.2V13.8L10 17.5L3.5 13.8V6.2L10 2.5Z" stroke="currentColor" strokeWidth="2" />
        <path d="M7.2 12.5L10 6.8L12.8 12.5H7.2Z" fill="currentColor" />
      </svg>
    );
  }
  if (key.includes('civyn')) {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M15.2 6.8A6 6 0 1 0 15.2 13.2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="14.5" cy="10" r="2" fill="currentColor" />
      </svg>
    );
  }
  if (key.includes('univyx')) {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="3.5" y="3.5" width="5.5" height="5.5" rx="1.5" fill="currentColor" />
        <rect x="11" y="3.5" width="5.5" height="5.5" rx="1.5" fill="currentColor" opacity="0.45" />
        <rect x="3.5" y="11" width="5.5" height="5.5" rx="1.5" fill="currentColor" opacity="0.45" />
        <rect x="11" y="11" width="5.5" height="5.5" rx="1.5" fill="currentColor" />
      </svg>
    );
  }
  if (key.includes('kora')) {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="3.5" y="3.5" width="3" height="13" rx="1.2" fill="currentColor" />
        <path d="M8.5 10L15 3.5H17.2L11.2 9.8L17.2 16.5H15L8.5 10Z" fill="currentColor" />
      </svg>
    );
  }
  if (key.includes('northstar')) {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 2L12.1 7.9L18 10L12.1 12.1L10 18L7.9 12.1L2 10L7.9 7.9L10 2Z" fill="currentColor" />
      </svg>
    );
  }

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    <span className="client-chip-monogram" aria-hidden="true">
      {initials || 'GL'}
    </span>
  );
}

/**
 * 52px partner chip with crisp monochrome 20px logo/monogram + 13.5px bold name.
 */
export function ClientLogoChip({
  client,
  className = '',
}: {
  client: ClientItem;
  className?: string;
}) {
  const validLogoUrl = client.logo_url && !isPartnerWallpaperUrl(client.logo_url) ? client.logo_url : undefined;
  const [imgFailed, setImgFailed] = useState(!validLogoUrl);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setImgFailed(!validLogoUrl);
    setLoaded(false);
  }, [validLogoUrl]);

  return (
    <div
      className={`client-chip ${className}`}
      title={client.name}
      aria-label={`${client.name} partner`}
    >
      {validLogoUrl && !imgFailed ? (
        <span className="client-chip-mark-img">
          {!loaded && <span className="image-skeleton" aria-hidden="true" />}
          <img
            src={validLogoUrl}
            alt=""
            width={22}
            height={22}
            className={`client-chip-img img-fade-in ${loaded ? 'is-loaded' : ''}`}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={(e) => {
              if (e.currentTarget.naturalWidth === 0) {
                setImgFailed(true);
              } else {
                setLoaded(true);
              }
            }}
            onError={() => setImgFailed(true)}
          />
        </span>
      ) : (
        <span className="client-chip-mark">
          <PartnerMonochromeMark name={client.name} />
        </span>
      )}
      <span className="client-chip-text">{client.name}</span>
    </div>
  );
}

/**
 * Resilient circular avatar with skeleton shimmer & initials fallback.
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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFailed(!src);
    setLoaded(false);
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
    <span className="avatar-image-shell">
      {!loaded && <span className="image-skeleton" aria-hidden="true" />}
      <img
        src={src}
        alt={name}
        width={48}
        height={48}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className={`w-full h-full object-cover img-fade-in ${loaded ? 'is-loaded' : ''} ${className}`}
        onLoad={(e) => {
          if (e.currentTarget.naturalWidth === 0) {
            setFailed(true);
          } else {
            setLoaded(true);
          }
        }}
        onError={() => setFailed(true)}
      />
    </span>
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
      <Label>By the numbers</Label>
      <div className="stats-grid">
        {sortedStats.slice(0, 4).map((item, idx) => {
          const stat = getCleanStat(item, idx);
          const Icon = icons[stat.icon] || icons['building-2'];
          return (
            <article key={item.id} className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">{stat.label}</span>
                <span className="stat-icon-tile" aria-hidden="true">
                  <Icon size={16} strokeWidth={2} />
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
              <Icon size={16} strokeWidth={2} />
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
                <p className="practice-meta-line">{item.tags.join(' · ')}</p>
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
              <Icon size={16} strokeWidth={2} />
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
        const hasNoPhoto = !coverImage;

        return (
          <article className={`venture v${i}`} key={item.id || item.title}>
            <a
              href={projectHref}
              className={`venture-visual ${hasNoPhoto ? 'is-fallback' : ''}`}
              aria-label={`View ${item.title} case study`}
            >
              <ResilientCoverImage
                src={coverImage}
                alt={`${item.title} preview`}
                title={item.title}
                category={item.category_tag}
                className="w-full h-full"
              />
            </a>

            <div className="venture-body">
              {item.category_tag && (
                <span className="venture-kicker">{item.category_tag}</span>
              )}
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
                  <ArrowUpRight size={15} strokeWidth={2} className="btn-arrow-green" aria-hidden="true" />
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
              <Quote size={16} strokeWidth={2} className="testimonial-quote" />
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

const MISSION_TAGS = ['Strategy', 'Identity', 'Product'] as const;
const VISION_TAGS = ['Engineering', 'Infrastructure'] as const;

export function InfoCard({
  iconName,
  title,
  description,
  fallbackIcon = 'target',
  tags,
}: {
  iconName?: string;
  title: string;
  description: string;
  fallbackIcon?: string;
  tags?: readonly string[];
}) {
  const Icon = icons[iconName || ''] || icons[fallbackIcon] || icons['target'];
  return (
    <article className="info-card">
      <div className="info-card-header">
        <span className="info-card-icon-tile" aria-hidden="true">
          <Icon size={16} strokeWidth={2} />
        </span>
        <h3 className="info-card-title">{title}</h3>
      </div>
      <p className="info-card-body">{description}</p>
      {tags && tags.length > 0 && (
        <div className="info-card-tags" aria-label="Core disciplines">
          {tags.map((tag) => (
            <span key={tag} className="green-tag-pill">
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

export function AboutPreview() {
  const { data } = useCms();
  const sortedCards = [...data.aboutCards].sort((a, b) => a.sort_order - b.sort_order);

  const missionCard = sortedCards.find((c) => c.type === 'mission' || c.title.toLowerCase().includes('mission'));
  const visionCard = sortedCards.find((c) => c.type === 'vision' || c.title.toLowerCase().includes('vision'));
  const coreValuesCard = sortedCards.find((c) => c.type === 'core_values' || c.title.toLowerCase().includes('value'));

  const pairCards = [missionCard, visionCard].filter(Boolean) as typeof sortedCards;

  return (
    <section className="section about-preview" aria-label="About the studio">
      <SectionHead
        label="About"
        title="A studio built on"
        accent="purpose and precision."
        copy="Ghreatness Labs (Ghreatness Lab / GhreatnessLabs) is an independent digital and IT solutions studio founded in Lagos in 2024 to build high-impact systems, software, and brand infrastructure."
      />

      {pairCards.length > 0 && (
        <div className="mission-vision-grid">
          {pairCards.map((item) => {
            const isMission = item.type === 'mission' || item.title.toLowerCase().includes('mission');
            const isVision = item.type === 'vision' || item.title.toLowerCase().includes('vision');
            return (
              <InfoCard
                key={item.id || item.title}
                iconName={item.icon_name}
                title={item.title}
                description={item.description}
                fallbackIcon="target"
                tags={isMission ? MISSION_TAGS : isVision ? VISION_TAGS : undefined}
              />
            );
          })}
        </div>
      )}

      {coreValuesCard && (
        <div className="about-core-values-card">
          <InfoCard
            iconName={coreValuesCard.icon_name}
            title={coreValuesCard.title}
            description={coreValuesCard.description}
            fallbackIcon="shield-check"
          />
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
        <div className="leader-snap-top">
          <span className="leader-snap-avatar">
            <ResilientAvatar src={leader.avatar_url} name={leader.name} />
          </span>
          <div className="leader-snap-identity">
            <h3 className="leader-snap-name">{leader.name}</h3>
            <small className="leader-snap-role">{leader.role}</small>
          </div>
        </div>
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
            <Linkedin size={14} strokeWidth={2} aria-hidden="true" />
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
            <Twitter size={14} strokeWidth={2} aria-hidden="true" />
          </a>
        )}
        <a
          href={profileUrl}
          className="leader-snap-profile-link"
          aria-label={`Profile of ${leader.name}`}
        >
          <span>Profile</span>
          <ArrowUpRight size={13} strokeWidth={2} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

export function LeadershipPreview() {
  const { data } = useCms();
  const sortedLeaders = [...data.leadership].sort((a, b) => a.sort_order - b.sort_order);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const resumeTimerRef = useRef<number | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHoverOrFocusPaused, setIsHoverOrFocusPaused] = useState(false);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const [isInViewport, setIsInViewport] = useState(true);
  const [isTabHidden, setIsTabHidden] = useState(
    typeof document !== 'undefined' ? document.hidden : false
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const maxIndex = Math.max(0, sortedLeaders.length - 1);

  const getCardStep = () => {
    const track = trackRef.current;
    if (!track) return 246;
    const firstCard = track.querySelector<HTMLElement>('.leader-snap-card');
    if (!firstCard) return 246;
    const trackStyle = getComputedStyle(track);
    const gap = parseFloat(trackStyle.columnGap || trackStyle.gap || '10') || 10;
    return firstCard.getBoundingClientRect().width + gap;
  };

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const handleVisibility = () => setIsTabHidden(document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInViewport(entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current !== null) {
        window.clearTimeout(resumeTimerRef.current);
      }
    };
  }, []);

  const pauseWithAutoResume = () => {
    setIsUserPaused(true);
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = window.setTimeout(() => {
      setIsUserPaused(false);
    }, 5000);
  };

  const scrollToCard = (index: number, behavior: ScrollBehavior = 'smooth') => {
    const track = trackRef.current;
    if (!track || sortedLeaders.length === 0) return;
    const clamped = Math.max(0, Math.min(maxIndex, index));
    track.scrollTo({ left: clamped * getCardStep(), behavior });
    setActiveIndex(clamped);
  };

  useEffect(() => {
    if (
      prefersReducedMotion ||
      isUserPaused ||
      isHoverOrFocusPaused ||
      !isInViewport ||
      isTabHidden ||
      sortedLeaders.length <= 1
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => {
        const next = prev >= maxIndex ? 0 : prev + 1;
        const track = trackRef.current;
        if (track) {
          track.scrollTo({ left: next * getCardStep(), behavior: 'smooth' });
        }
        return next;
      });
    }, 4000);

    return () => window.clearInterval(timer);
  }, [
    prefersReducedMotion,
    isUserPaused,
    isHoverOrFocusPaused,
    isInViewport,
    isTabHidden,
    sortedLeaders.length,
    maxIndex,
  ]);

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
    const nextIdx = Math.min(maxIndex, Math.max(0, Math.round(track.scrollLeft / getCardStep())));
    setActiveIndex(nextIdx);
  };

  const handlePrev = () => {
    pauseWithAutoResume();
    const targetIdx = activeIndex <= 0 ? maxIndex : activeIndex - 1;
    scrollToCard(targetIdx);
  };

  const handleNext = () => {
    pauseWithAutoResume();
    const targetIdx = activeIndex >= maxIndex ? 0 : activeIndex + 1;
    scrollToCard(targetIdx);
  };

  const handleDotClick = (idx: number) => {
    pauseWithAutoResume();
    scrollToCard(idx);
  };

  return (
    <section
      ref={sectionRef}
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
        <div className="leader-heading-meta-row">
          <h2 className="section-heading">
            The brains behind <em>the work.</em>
          </h2>
          {sortedLeaders.length > 1 && !prefersReducedMotion && (
            <span className="leader-autoplay-pill" aria-hidden="true">
              Auto-play · every 4s
            </span>
          )}
        </div>
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
                aria-label="Previous team member"
              >
                <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="leader-nav-btn leader-nav-next is-solid"
                onClick={handleNext}
                aria-label="Next team member"
              >
                <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
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
        onTouchStart={pauseWithAutoResume}
        onPointerDown={pauseWithAutoResume}
        onWheel={pauseWithAutoResume}
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

function buildMarqueeRowItems(items: ClientItem[]): ClientItem[] {
  if (items.length === 0) return [];
  const expanded: ClientItem[] = [];
  while (expanded.length < 8) {
    expanded.push(...items);
  }
  return expanded;
}

export function Partners() {
  const { data } = useCms();
  const sortedClients = [...data.clients].sort((a, b) => a.sort_order - b.sort_order);

  const midpoint = Math.ceil(sortedClients.length / 2);
  const firstHalf = sortedClients.slice(0, midpoint);
  const secondHalf = sortedClients.slice(midpoint);

  const row1Base = buildMarqueeRowItems(firstHalf.length > 0 ? firstHalf : sortedClients);
  const row2Base = buildMarqueeRowItems(secondHalf.length > 0 ? secondHalf : sortedClients);

  return (
    <section className="section partners-section" aria-label="Partners and clients">
      <SectionHead
        label="Partners & Clients"
        title="In good"
        accent="company."
        copy="Ambitious teams and ventures we are proud to work alongside."
      />

      <div className="partners-marquee-stack">
        <div className="partners-marquee-viewport partners-marquee-row" role="region" aria-label="Featured partners row 1">
          <div className="partners-marquee-track is-left">
            {row1Base.map((client, idx) => (
              <ClientLogoChip key={`r1a-${client.id || client.name}-${idx}`} client={client} />
            ))}
            {row1Base.map((client, idx) => (
              <ClientLogoChip
                key={`r1b-${client.id || client.name}-${idx}`}
                client={client}
                className="partners-marquee-dup"
              />
            ))}
          </div>
        </div>

        <div className="partners-marquee-viewport partners-marquee-row" role="region" aria-label="Featured partners row 2">
          <div className="partners-marquee-track is-right">
            {row2Base.map((client, idx) => (
              <ClientLogoChip key={`r2a-${client.id || client.name}-${idx}`} client={client} />
            ))}
            {row2Base.map((client, idx) => (
              <ClientLogoChip
                key={`r2b-${client.id || client.name}-${idx}`}
                client={client}
                className="partners-marquee-dup"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
