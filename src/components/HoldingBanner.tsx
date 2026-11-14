import React, { useState } from 'react';
import { ArrowUpRight, Building2 } from 'lucide-react';
import { useCms } from '../context/CmsContext';

interface HoldingBannerProps {
  className?: string;
  variant?: 'banner' | 'card' | 'footer';
}

export function HoldingBanner({ className = '', variant = 'banner' }: HoldingBannerProps) {
  const { data } = useCms();
  const { settings, holding } = data;
  const [logoError, setLogoError] = useState(false);

  const primaryHoldingItem = holding[0];
  const holdingName =
    settings.holdingGroupName?.trim() ||
    primaryHoldingItem?.company_name ||
    'Ghreatness Group';

  const holdingUrl =
    settings.holdingGroupUrl?.trim() ||
    primaryHoldingItem?.website_url ||
    'https://group.ghreatnesslab.com.ng';

  const holdingLogo =
    settings.holdingGroupLogo?.trim() ||
    primaryHoldingItem?.logo_url ||
    '/logo-mark.svg';

  const holdingDesc =
    settings.holdingGroupDescription?.trim() ||
    primaryHoldingItem?.description ||
    'Parent collective fostering digital technology, ventures, and infrastructure.';

  if (variant === 'card') {
    return (
      <div
        className={`holding-banner-container holding-banner-card ${className}`}
        role="region"
        aria-label={`Holding group affiliation: ${holdingName}`}
      >
        <div className="holding-card-top-row">
          <div className="holding-logo-tile" aria-hidden="true">
            {holdingLogo && !logoError ? (
              <img
                src={holdingLogo}
                alt={`${holdingName} emblem`}
                className="holding-logo-img"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setLogoError(true)}
                width={28}
                height={28}
              />
            ) : (
              <Building2 size={20} strokeWidth={1.8} />
            )}
          </div>
          <span className="holding-banner-eyebrow">Parent Holding Group</span>
        </div>

        <h3 className="holding-banner-statement">
          GhreatnessLabs is part of{' '}
          <strong className="holding-group-name">{holdingName}</strong>
        </h3>

        {holdingDesc && <p className="holding-banner-desc">{holdingDesc}</p>}

        <a
          href={holdingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="holding-visit-button"
          aria-label={`Visit ${holdingName} official website (opens in a new tab)`}
        >
          <span>Visit {holdingName}</span>
          <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
        </a>
      </div>
    );
  }

  return (
    <div
      className={`holding-banner-container holding-banner-${variant} ${className}`}
      role="region"
      aria-label={`Holding group affiliation: ${holdingName}`}
    >
      <div className="holding-banner-inner">
        <div className="holding-banner-brand">
          <div className="holding-logo-wrap" aria-hidden="true">
            {holdingLogo && !logoError ? (
              <img
                src={holdingLogo}
                alt={`${holdingName} emblem`}
                className="holding-logo-img"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setLogoError(true)}
                width={32}
                height={32}
              />
            ) : (
              <div className="holding-logo-fallback">
                <Building2 size={18} strokeWidth={1.7} />
              </div>
            )}
          </div>

          <div className="holding-banner-text">
            <span className="holding-banner-eyebrow">Parent Holding Group</span>
            <p className="holding-banner-statement">
              GhreatnessLabs is part of{' '}
              <strong className="holding-group-name">{holdingName}</strong>
            </p>
            {variant !== 'footer' && holdingDesc && (
              <p className="holding-banner-desc">{holdingDesc}</p>
            )}
          </div>
        </div>

        <div className="holding-banner-action">
          <a
            href={holdingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="holding-visit-button"
            aria-label={`Visit ${holdingName} official website (opens in a new tab)`}
          >
            <span>Visit {holdingName}</span>
            <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
