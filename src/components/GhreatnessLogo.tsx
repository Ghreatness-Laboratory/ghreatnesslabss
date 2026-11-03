import React from 'react';

export const OFFICIAL_FAVICON_SRC = '/assets/aistudio/photo_2026-03-05_05-31-45_c5a71d06.jpg';
export const OFFICIAL_SUB_LOGO_SRC = '/assets/aistudio/891e0dd6-88c0-433e-b6b4-1c2edb13a9ed_26bf6581.jpeg';

export interface GhreatnessLogoProps {
  /**
   * Display variant:
   * - 'full': Official Sub Logo (Mark + GHREATNESS + rule + LABORATORY)
   * - 'mark': Just the official favicon mark
   * - 'compact': Compact official sub logo
   */
  variant?: 'full' | 'mark' | 'compact';
  /**
   * Color theme:
   * - 'auto': Standard dark/light mode adaptable
   * - 'dark': Solid black for light backgrounds (default)
   * - 'light': Inverted white for dark backgrounds
   */
  theme?: 'auto' | 'dark' | 'light';
  /**
   * Desired height in pixels
   */
  height?: number;
  /**
   * Custom CSS classes
   */
  className?: string;
  /**
   * Accessible aria-label
   */
  ariaLabel?: string;
}

/**
 * Official Ghreatness Laboratory Favicon Mark
 * Rendered from the official asset: /assets/aistudio/photo_2026-03-05_05-31-45_c5a71d06.jpg
 */
export function GhreatnessMark({
  size = 32,
  className = '',
  fill,
  theme = 'auto',
}: {
  size?: number;
  className?: string;
  fill?: string;
  theme?: 'auto' | 'dark' | 'light';
}) {
  const isLight = theme === 'light' || fill === '#ffffff' || fill === 'white';
  const width = size;
  const height = Math.round((size * 244) / 284);

  return (
    <span
      className={`ghreatness-mark-container inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
      aria-hidden="true"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="70 86 284 244"
        width={width}
        height={height}
        className="ghreatness-mark block w-full h-full"
        style={{
          mixBlendMode: isLight ? 'screen' : 'multiply',
          filter: isLight ? 'brightness(0) invert(1)' : undefined,
        }}
      >
        <image
          href={OFFICIAL_FAVICON_SRC}
          x="0"
          y="0"
          width="420"
          height="420"
          preserveAspectRatio="xMidYMid meet"
        />
      </svg>
    </span>
  );
}

/**
 * Official Ghreatness Laboratory Sub Logo Lockup
 * Rendered from the official asset: /assets/aistudio/891e0dd6-88c0-433e-b6b4-1c2edb13a9ed_26bf6581.jpeg
 */
export function GhreatnessLogo({
  variant = 'full',
  theme = 'auto',
  height,
  className = '',
  ariaLabel = 'Ghreatness Laboratory',
}: GhreatnessLogoProps) {
  const isLight = theme === 'light';

  if (variant === 'mark') {
    const markSize = height || 32;
    return (
      <span
        className={`ghreatness-logo-wrap inline-flex items-center ${className}`}
        role="img"
        aria-label={ariaLabel}
      >
        <GhreatnessMark size={markSize} theme={theme} />
      </span>
    );
  }

  // Target heights and aspect ratios based on measured bounding box (1080x224)
  const effectiveHeight = height || (variant === 'compact' ? 26 : 34);
  const targetWidth = Math.round(effectiveHeight * (1080 / 224));

  return (
    <span
      className={`ghreatness-logo-wrap inline-flex items-center select-none leading-none ${className}`}
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 296 1080 224"
        width={targetWidth}
        height={effectiveHeight}
        className="ghreatness-sub-logo-svg block max-w-full h-auto transition-opacity duration-200 hover:opacity-90"
        style={{
          mixBlendMode: isLight ? 'screen' : 'multiply',
          filter: isLight ? 'invert(1)' : undefined,
        }}
      >
        <image
          href={OFFICIAL_SUB_LOGO_SRC}
          x="0"
          y="0"
          width="1080"
          height="763"
          preserveAspectRatio="xMidYMid meet"
        />
      </svg>
    </span>
  );
}

export default GhreatnessLogo;
