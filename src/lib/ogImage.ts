/**
 * Dynamic Open Graph (OG) Image & Meta Manager for GhreatnessLabs
 * Generates crisp 1200x630 branded SVG cards (dark obsidian background,
 * GhreatnessLabs wordmark, category pill, and page title) and updates
 * document head metadata for social platforms (WhatsApp, Twitter/X, LinkedIn, Facebook).
 */

export interface PageMetaOptions {
  title: string;
  description: string;
  category?: string;
  urlPath?: string;
  customHeroImage?: string;
}

/**
 * Generates a branded SVG Data URL for Open Graph previews (1200x630)
 */
export function generateBrandedOgSvgUrl(title: string, category: string = 'Digital Systems Studio'): string {
  // Sanitize text for SVG XML
  const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const safeCategory = category.toUpperCase().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs>
      <!-- Background Linear Gradient -->
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0c0e12" />
        <stop offset="50%" stop-color="#07080a" />
        <stop offset="100%" stop-color="#040405" />
      </linearGradient>

      <!-- Glow radial -->
      <radialGradient id="glow" cx="80%" cy="20%" r="60%">
        <stop offset="0%" stop-color="#2a303c" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>

      <!-- Fine grid pattern -->
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.035)" stroke-width="1" />
      </pattern>
    </defs>

    <!-- Canvas Background -->
    <rect width="1200" height="630" fill="url(#bg)" />
    <rect width="1200" height="630" fill="url(#glow)" />
    <rect width="1200" height="630" fill="url(#grid)" />

    <!-- Outer Frame Border -->
    <rect x="40" y="40" width="1120" height="550" rx="16" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1.5" />

    <!-- Studio Header & Official Logo Lockup -->
    <g transform="translate(90, 95)">
      <!-- Official Isometric Mark -->
      <g transform="scale(0.48)">
        <!-- Layer 1: Top Ring -->
        <path fill-rule="evenodd" clip-rule="evenodd" d="M 60 4 L 112 34 L 112 43 L 60 73 L 8 43 L 8 34 L 60 4 Z M 60 18 L 94 37.5 L 60 57 L 26 37.5 L 60 18 Z" fill="#ffffff" />
        <!-- Layer 2: Middle Tier & Crossbar -->
        <path d="M 8 49 L 32 62.5 L 32 71.5 L 8 58 Z" fill="#ffffff" />
        <path d="M 112 49 L 112 58 L 88 71.5 L 88 62.5 Z" fill="#ffffff" />
        <path d="M 88 62.5 L 88 71.5 L 56 53 L 56 44 Z" fill="#ffffff" />
        <!-- Layer 3: Base -->
        <path d="M 8 64 L 8 76 L 60 98 L 112 76 L 112 64 L 60 86 Z" fill="#ffffff" />
      </g>
      
      <!-- Wordmark Lockup -->
      <g transform="translate(68, 0)">
        <text x="0" y="24" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Space Grotesk', 'Inter', sans-serif" font-size="24" font-weight="800" letter-spacing="-0.5">GHREATNESS</text>
        <line x1="0" y1="31" x2="200" y2="31" stroke="#ffffff" stroke-width="1.8" />
        <text x="1" y="44" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Space Grotesk', 'Inter', sans-serif" font-size="10" font-weight="500" letter-spacing="4.2">LABORATORY</text>
      </g>
      <text x="320" y="27" fill="#666666" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="500" letter-spacing="1.5">LAGOS · EST 2024</text>
    </g>

    <!-- Category Pill -->
    <g transform="translate(90, 205)">
      <rect x="0" y="0" width="${Math.max(160, safeCategory.length * 10 + 36)}" height="34" rx="17" fill="rgba(255, 255, 255, 0.06)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1" />
      <circle cx="18" cy="17" r="4" fill="#00d084" />
      <text x="32" y="22" fill="#e0e0e0" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="600" letter-spacing="1.5">${safeCategory}</text>
    </g>

    <!-- Page / Case Study Title -->
    <g transform="translate(90, 310)">
      <text x="0" y="0" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Space Grotesk', 'Inter', sans-serif" font-size="52" font-weight="700" letter-spacing="-1">
        ${safeTitle.length > 36 ? safeTitle.slice(0, 34) + '...' : safeTitle}
      </text>
    </g>

    <!-- Subtitle / Value Proposition -->
    <g transform="translate(90, 380)">
      <text x="0" y="0" fill="#999999" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="22" font-weight="400">
        Architects of high-impact digital systems, platforms, and brand infrastructure.
      </text>
    </g>

    <!-- Footer Bar inside Frame -->
    <g transform="translate(90, 520)">
      <line x1="0" y1="0" x2="1020" y2="0" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" />
      <text x="0" y="32" fill="#555555" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="14" font-weight="500">
        ghreatnesslabs.com · Digital &amp; IT Solutions Studio
      </text>
      <text x="1020" y="32" text-anchor="end" fill="#00d084" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="600" letter-spacing="1">
        ● ACCEPTING Q2 PROJECTS
      </text>
    </g>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Updates all document head metadata dynamically (title, description, OpenGraph, Twitter card)
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
  if (options.urlPath && typeof window !== 'undefined') {
    setMeta('property', 'og:url', `${window.location.origin}${options.urlPath}`);
  }

  // Twitter / X card tags
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', fullTitle);
  setMeta('name', 'twitter:description', options.description);
  setMeta('name', 'twitter:image', ogImageUrl);
}
