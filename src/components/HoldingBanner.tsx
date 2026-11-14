import React, { useState } from 'react';
import { ArrowUpRight, Building2 } from 'lucide-react';
import { useCms } from '../context/CmsContext';

interface HoldingBannerProps {
  className?: string;
  variant?: 'banner' | 'card' | 'footer';
}

export function HoldingBanner({ className = '' }: HoldingBannerProps) {
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

  return (
    <div
      className={`holding-banner-container ${className}`}
      role="region"
      aria-label={`Holding group affiliation: ${holdingName}`}
    >
      <div className="holding-compact-inner">
        <div className="holding-compact-brand">
          <div className="holding-logo-tile" aria-hidden="true">
            {holdingLogo && !logoError ? (
              <img
                src={holdingLogo}
                alt={`${holdingName} emblem`}
                className="holding-logo-img"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={() => setLogoError(true)}
                width={26}
                height={26}
              />
            ) : (
              <Building2 size={18} strokeWidth={2} />
            )}
          </div>

          <div className="holding-compact-copy">
            <span className="holding-banner-eyebrow">Parent Holding Group</span>
            <h3 className="holding-banner-title">{holdingName}</h3>
            {holdingDesc && <p className="holding-banner-desc">{holdingDesc}</p>}
          </div>
        </div>

        <a
          href={holdingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="holding-visit-button"
          aria-label={`Visit ${holdingName} official website (opens in a new tab)`}
        >
          <span>Visit {holdingName}</span>
          <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
