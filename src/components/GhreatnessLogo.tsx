import React from 'react';

export interface GhreatnessLogoProps {
  /**
   * Display variant:
   * - 'full': Mark + GHREATNESS + rule + LABORATORY (default)
   * - 'mark': Just the isometric 3D mark
   * - 'compact': Mark + GHREATNESS (suitable for small mobile headers)
   */
  variant?: 'full' | 'mark' | 'compact';
  /**
   * Color theme:
   * - 'auto': Uses currentColor (adapts to text color of parent)
   * - 'dark': Solid black (#000000) for white/light backgrounds
   * - 'light': Solid white (#ffffff) for black/dark backgrounds
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
 * Official Ghreatness Laboratory Isometric 3D Mark
 */
export function GhreatnessMark({
  size = 32,
  className = '',
  fill = 'currentColor',
}: {
  size?: number;
  className?: string;
  fill?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 102"
      width={size}
      height={(size * 102) / 120}
      fill="none"
      className={`ghreatness-mark ${className}`}
      aria-hidden="true"
    >
      {/* Layer 1: Top Isometric Ring */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 60 4 L 112 34 L 112 43 L 60 73 L 8 43 L 8 34 L 60 4 Z M 60 18 L 94 37.5 L 60 57 L 26 37.5 L 60 18 Z"
        fill={fill}
      />
      {/* Layer 2: Middle Tier & G-crossbar */}
      <path d="M 8 49 L 32 62.5 L 32 71.5 L 8 58 Z" fill={fill} />
      <path d="M 112 49 L 112 58 L 88 71.5 L 88 62.5 Z" fill={fill} />
      <path d="M 88 62.5 L 88 71.5 L 56 53 L 56 44 Z" fill={fill} />
      {/* Layer 3: Bottom Foundation Base */}
      <path d="M 8 64 L 8 76 L 60 98 L 112 76 L 112 64 L 60 86 Z" fill={fill} />
    </svg>
  );
}

/**
 * Official Ghreatness Laboratory Full Lockup
 */
export function GhreatnessLogo({
  variant = 'full',
  theme = 'auto',
  height,
  className = '',
  ariaLabel = 'Ghreatness Laboratory',
}: GhreatnessLogoProps) {
  const color =
    theme === 'dark' ? '#000000' : theme === 'light' ? '#ffffff' : 'currentColor';

  if (variant === 'mark') {
    const markSize = height || 32;
    return (
      <span
        className={`ghreatness-logo-wrap inline-flex items-center ${className}`}
        role="img"
        aria-label={ariaLabel}
      >
        <GhreatnessMark size={markSize} fill={color} />
      </span>
    );
  }

  // Target heights
  const effectiveHeight = height || (variant === 'compact' ? 28 : 34);

  return (
    <span
      className={`ghreatness-logo-wrap inline-flex items-center gap-2.5 sm:gap-3 select-none leading-none ${className}`}
      role="img"
      aria-label={ariaLabel}
      style={{ color }}
    >
      {/* Mark */}
      <GhreatnessMark
        size={Math.round(effectiveHeight * 1.05)}
        fill={color}
        className="flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
      />

      {/* Typography Lockup */}
      <span className="ghreatness-type-block flex flex-col justify-center">
        {/* Main Title: GHREATNESS */}
        <span
          className="ghreatness-title font-extrabold uppercase tracking-tight"
          style={{
            fontFamily: "'Space Grotesk', Inter, -apple-system, sans-serif",
            fontSize: `${Math.round(effectiveHeight * 0.52)}px`,
            lineHeight: 1,
            letterSpacing: '-0.025em',
            fontWeight: 800,
          }}
        >
          GHREATNESS
        </span>

        {/* Horizontal Divider Line matching exact width of GHREATNESS */}
        {variant === 'full' && (
          <>
            <span
              className="ghreatness-rule my-[2px] block w-full bg-current opacity-90"
              style={{
                height: `${Math.max(1.5, Math.round(effectiveHeight * 0.05))}px`,
              }}
              aria-hidden="true"
            />
            {/* Subtitle: LABORATORY */}
            <span
              className="ghreatness-sub font-medium uppercase text-current"
              style={{
                fontFamily: "'Space Grotesk', Inter, -apple-system, sans-serif",
                fontSize: `${Math.round(effectiveHeight * 0.22)}px`,
                letterSpacing: '0.42em',
                lineHeight: 1,
                fontWeight: 500,
                paddingLeft: '0.08em', // optically center tracked text
              }}
            >
              LABORATORY
            </span>
          </>
        )}
      </span>
    </span>
  );
}

export default GhreatnessLogo;
