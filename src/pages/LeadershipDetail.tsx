import React, { useEffect } from 'react';
import {
  ArrowLeft,
  Linkedin,
  Twitter,
  UsersRound,
  ExternalLink,
  ShieldCheck,
  Building2,
  Sparkles,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { SectionHead, Button } from '../components/SharedSections';
import { updateDocumentMeta, CANONICAL_BASE_URL } from '../lib/ogImage';
import { slugify } from '../components/admin/LinksManager';

interface LeadershipDetailProps {
  slug?: string;
}

export default function LeadershipDetail({ slug: propSlug }: LeadershipDetailProps) {
  const { data } = useCms();

  // Extract slug from URL if not passed as prop
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const urlSlug = currentPath.replace(/^\/leadership\/?/, '').replace(/\/$/, '');
  const activeSlug = (propSlug || urlSlug).toLowerCase().trim();

  // Find leader by matching slug, id, or slugified name
  const leader = data.leadership.find((l) => {
    const leaderSlug = (l.slug || slugify(l.name)).toLowerCase();
    return (
      leaderSlug === activeSlug ||
      l.id.toLowerCase() === activeSlug ||
      slugify(l.name) === activeSlug
    );
  });

  // SEO & Head Metadata & Person JSON-LD
  useEffect(() => {
    if (!leader) return;

    const pageTitle = `${leader.name} - ${leader.role} | GhreatnessLabs`;
    const pageDescription =
      leader.bio ||
      `${leader.name} serves as ${leader.role} at GhreatnessLabs, Lagos digital systems studio.`;
    const canonicalPath = `/leadership/${leader.slug || slugify(leader.name)}`;
    const avatarPhoto =
      leader.avatar_url || 'https://www.ghreatnesslab.com.ng/logo.png';

    // Update document title, description, OG tags, canonical tag
    updateDocumentMeta({
      title: pageTitle,
      description: pageDescription,
      category: 'Studio Leadership',
      urlPath: canonicalPath,
      customHeroImage: avatarPhoto,
    });

    // Inject Schema.org Person JSON-LD
    const sameAsList = [
      leader.social_links?.linkedin,
      leader.social_links?.twitter,
    ].filter((link): link is string => Boolean(link && link.trim()));

    const personSchema = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: leader.name,
      jobTitle: leader.role,
      image: avatarPhoto,
      description: leader.bio,
      url: `${CANONICAL_BASE_URL}${canonicalPath}`,
      sameAs: sameAsList,
      worksFor: {
        '@type': 'Organization',
        name: 'GhreatnessLabs',
        url: CANONICAL_BASE_URL,
      },
    };

    let scriptTag = document.getElementById('person-jsonld') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'person-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(personSchema, null, 2);

    return () => {
      const existing = document.getElementById('person-jsonld');
      if (existing) {
        existing.remove();
      }
    };
  }, [leader]);

  if (!leader) {
    return (
      <section className="section soft-section page-intro">
        <SectionHead
          label="Studio Leadership"
          title="Profile not"
          accent="found."
          copy="The requested leadership profile could not be located in our directory."
        />
        <div className="mt-8">
          <Button href="/leadership">← Back to leadership</Button>
        </div>
      </section>
    );
  }

  const initials = leader.name
    .split(' ')
    .map((x) => x[0])
    .join('');

  // Other leaders for quick discovery
  const otherLeaders = data.leadership
    .filter((l) => l.id !== leader.id)
    .slice(0, 3);

  return (
    <article className="leader-profile-page">
      {/* Return Navigation Bar */}
      <div className="leader-nav-bar">
        <div className="leader-nav-inner">
          <a
            href="/leadership"
            className="leader-back-button"
            aria-label="Return to full leadership team directory"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Back to leadership</span>
          </a>
          <span className="leader-crumb-category">STUDIO LEADERSHIP PROFILE</span>
        </div>
      </div>

      {/* Main Leader Hero Profile Section */}
      <section className="section leader-hero-section">
        <div className="leader-profile-grid">
          {/* Large Photo Column */}
          <div className="leader-photo-column">
            <div className="leader-large-photo-frame">
              {leader.avatar_url ? (
                <img
                  src={leader.avatar_url}
                  alt={`${leader.name}, ${leader.role} at GhreatnessLabs`}
                  className="leader-large-photo-img"
                  loading="eager"
                  width={560}
                  height={560}
                />
              ) : (
                <div className="leader-large-photo-fallback">
                  <span>{initials}</span>
                </div>
              )}
              <div className="leader-photo-badge">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Verified Studio Principal</span>
              </div>
            </div>
          </div>

          {/* Biographical Story & Links Column */}
          <div className="leader-bio-column">
            <span className="leader-eyebrow-role">{leader.role}</span>
            <h1 className="leader-name-heading">{leader.name}</h1>

            {/* Brief Bio Highlight Block (max 300 chars) */}
            <div className="leader-brief-highlight">
              <p className="leader-brief-quote">“{leader.bio}”</p>
            </div>

            {/* Full Profile Biography Text */}
            <div className="leader-full-biography">
              <h2 className="leader-bio-subheading">Background &amp; Studio Mandate</h2>
              <p className="leader-bio-text">
                {leader.full_profile || leader.bio}
              </p>
            </div>

            {/* Social Links Row (real <a> tags, descriptive text, 44px tap target) */}
            <div className="leader-social-connections">
              <span className="leader-social-label">Verified Profiles</span>
              <div className="leader-social-buttons">
                {leader.social_links?.linkedin && (
                  <a
                    href={leader.social_links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="leader-social-btn leader-linkedin-btn"
                    aria-label={`Visit ${leader.name}'s LinkedIn profile (opens in a new tab)`}
                  >
                    <Linkedin size={16} aria-hidden="true" />
                    <span>LinkedIn</span>
                    <ExternalLink size={12} aria-hidden="true" className="external-sub-icon" />
                  </a>
                )}

                {leader.social_links?.twitter && (
                  <a
                    href={leader.social_links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="leader-social-btn leader-x-btn"
                    aria-label={`Follow ${leader.name} on X (opens in a new tab)`}
                  >
                    <Twitter size={16} aria-hidden="true" />
                    <span>X / Twitter</span>
                    <ExternalLink size={12} aria-hidden="true" className="external-sub-icon" />
                  </a>
                )}

                <a
                  href="/contact"
                  className="leader-social-btn leader-contact-btn"
                  aria-label={`Book a project consultation with ${leader.name}`}
                >
                  <span>Book Consultation</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Team Members Directory Navigation */}
      {otherLeaders.length > 0 && (
        <section className="section soft-section other-leaders-section">
          <SectionHead
            label="Studio Governance"
            title="Other studio"
            accent="leaders."
            copy="Principals, architects, and technical directors building at GhreatnessLabs."
          />

          <div className="other-leaders-grid">
            {otherLeaders.map((other) => {
              const otherSlug = other.slug || slugify(other.name);
              return (
                <a
                  key={other.id}
                  href={`/leadership/${otherSlug}`}
                  className="other-leader-card"
                  aria-label={`View full profile of ${other.name}, ${other.role}`}
                >
                  <div className="other-leader-avatar">
                    {other.avatar_url ? (
                      <img
                        src={other.avatar_url}
                        alt={other.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span>{other.name[0]}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="other-leader-name">{other.name}</h3>
                    <small className="other-leader-role">{other.role}</small>
                    <p className="other-leader-desc line-clamp-1">{other.bio}</p>
                  </div>
                </a>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <a
              href="/leadership"
              className="button"
              aria-label="View entire leadership team directory"
            >
              ← View full leadership directory
            </a>
          </div>
        </section>
      )}
    </article>
  );
}
