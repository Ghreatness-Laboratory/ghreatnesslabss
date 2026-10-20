/**
 * Dynamic Open Graph (OG) Image & Meta Manager for GhreatnessLabs
 * Generates crisp 1200x630 branded SVG cards (minimalist flat design,
 * GhreatnessLabs wordmark, category label, and page title) and updates
 * document head metadata for search engines and social platforms.
 */

export const CANONICAL_BASE_URL = 'https://www.ghreatnesslab.com.ng';

export interface PageMetaOptions {
  title: string;
  description: string;
  category?: string;
  urlPath?: string;
  customHeroImage?: string;
}

/**
 * Generates a branded SVG Data URL for Open Graph previews (1200x630)
 * Adheres strictly to the studio palette: white, light gray (#f6f6f6), near-black (#111), and muted gray (#777).
 * Uses Inter font with weights 400 and 500 only.
 */
export function generateBrandedOgSvgUrl(title: string, category: string = 'Digital Systems Studio'): string {
  const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const safeCategory = category.toUpperCase().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#f6f6f6" />
      </linearGradient>

      <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(0, 0, 0, 0.03)" stroke-width="1" />
      </pattern>
    </defs>

    <!-- Canvas Background -->
    <rect width="1200" height="630" fill="url(#bg)" />
    <rect width="1200" height="630" fill="url(#grid)" />

    <!-- Outer Frame Card with 0.5px hairline border and 16px radius -->
    <rect x="40" y="40" width="1120" height="550" rx="16" fill="#ffffff" stroke="#e5e5e5" stroke-width="1" />

    <!-- Studio Header & Wordmark -->
    <g transform="translate(90, 95)">
      <!-- 36px Black Icon Tile with 10px radius -->
      <rect x="0" y="0" width="36" height="36" rx="10" fill="#111111" />
      <circle cx="18" cy="18" r="4.5" fill="#ffffff" />

      <!-- Wordmark Lockup -->
      <g transform="translate(52, 6)">
        <text x="0" y="20" fill="#111111" font-family="Inter, -apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="20" font-weight="500" letter-spacing="-0.03em">GHREATNESSLABS</text>
      </g>
      <text x="310" y="26" fill="#777777" font-family="Inter, -apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="12" font-weight="500" letter-spacing="0.12em">LAGOS · EST 2024</text>
    </g>

    <!-- Small Uppercase Category Label -->
    <g transform="translate(90, 200)">
      <text x="0" y="0" fill="#777777" font-family="Inter, -apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="13" font-weight="500" letter-spacing="0.14em">${safeCategory}</text>
    </g>

    <!-- Page Title with -0.02em letter spacing -->
    <g transform="translate(90, 290)">
      <text x="0" y="0" fill="#111111" font-family="Inter, -apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="44" font-weight="500" letter-spacing="-0.02em">
        ${safeTitle.length > 42 ? safeTitle.slice(0, 40) + '...' : safeTitle}
      </text>
    </g>

    <!-- Subtitle in secondary gray with 1.7 line height -->
    <g transform="translate(90, 360)">
      <text x="0" y="0" fill="#666666" font-family="Inter, -apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="20" font-weight="400">
        Digital systems, platforms, and technological infrastructure engineered in Lagos.
      </text>
    </g>

    <!-- Footer Bar inside Frame -->
    <g transform="translate(90, 520)">
      <line x1="0" y1="0" x2="1020" y2="0" stroke="#e5e5e5" stroke-width="1" />
      <text x="0" y="32" fill="#777777" font-family="Inter, -apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="13" font-weight="400">
        www.ghreatnesslab.com.ng · Lagos Digital Systems Studio
      </text>
      <circle cx="910" cy="27" r="4" fill="#00d084" />
      <text x="922" y="32" fill="#111111" font-family="Inter, -apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="13" font-weight="500">
        Available for Q2 Projects
      </text>
    </g>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Updates all document head metadata dynamically (title, description, OpenGraph, Twitter card, canonical)
 */
export function updateDocumentMeta(options: PageMetaOptions) {
  if (typeof document === 'undefined') return;

  const fullTitle = options.title.includes('GhreatnessLabs')
    ? options.title
    : `${options.title} — GhreatnessLabs`;

  document.title = fullTitle;

  // Set description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', options.description);
  }

  // Canonical tag
  const resolvedUrl = `${CANONICAL_BASE_URL}${options.urlPath || '/'}`;
  let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', resolvedUrl);

  // Generate branded OG image URL
  const ogImageUrl = options.customHeroImage || generateBrandedOgSvgUrl(options.title, options.category);

  // Helper to ensure meta tag exists
  const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
    let tag = document.querySelector(`meta[${attr}="${key}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attr, key);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  };

  // Open Graph standard tags
  setMeta('property', 'og:title', fullTitle);
  setMeta('property', 'og:description', options.description);
  setMeta('property', 'og:image', ogImageUrl);
  setMeta('property', 'og:type', 'website');
  setMeta('property', 'og:url', resolvedUrl);

  // Twitter / X card tags
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', fullTitle);
  setMeta('name', 'twitter:description', options.description);
  setMeta('name', 'twitter:image', ogImageUrl);
}
