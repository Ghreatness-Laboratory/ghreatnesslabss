import React from 'react';
import { ExternalLink, Building2 } from 'lucide-react';
import { useCms } from '../context/CmsContext';

interface HoldingBannerProps {
  className?: string;
  variant?: 'banner' | 'card' | 'footer';
}

export function HoldingBanner({ className = '', variant = 'banner' }: HoldingBannerProps) {
  const { data } = useCms();
  const { settings, holding } = data;

  // Derive holding group information from settings or first holding item
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
    'Parent collective fostering technology, digital infrastructure, and ambitious ecosystems across Africa.';

  return (
    <div
      className={`holding-banner-container holding-banner-${variant} ${className}`}
      role="region"
      aria-label={`Holding group affiliation: ${holdingName}`}
    >
      <div className="holding-banner-inner">
        {/* Logo and Brand Identity */}
        <div className="holding-banner-brand">
          <div className="holding-logo-wrap" aria-hidden="true">
            {holdingLogo ? (
              <img
                src={holdingLogo}
                alt={`${holdingName} emblem`}
                className="holding-logo-img"
                loading="lazy"
                width={36}
                height={36}
              />
            ) : (
              <div className="holding-logo-fallback">
                <Building2 size={20} />
              </div>
            )}
          </div>

          <div className="holding-banner-text">
            <span className="holding-banner-eyebrow">PARENT HOLDING GROUP</span>
            <p className="holding-banner-statement">
              GhreatnessLabs is part of{' '}
              <strong className="holding-group-name">{holdingName}</strong>
            </p>
            {variant !== 'footer' && holdingDesc && (
              <p className="holding-banner-desc">{holdingDesc}</p>
            )}
          </div>
        </div>

        {/* Action Button: Real <a href> tag with external attributes & descriptive text */}
        <div className="holding-banner-action">
          <a
            href={holdingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="holding-visit-button"
            aria-label={`Visit ${holdingName} official website (opens in a new tab)`}
          >
            <span>Visit {holdingName}</span>
            <ExternalLink size={14} aria-hidden="true" className="holding-link-icon" />
          </a>
        </div>
      </div>
    </div>
  );
}
