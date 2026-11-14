/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0B0F',
        paper: '#FFFFFF',
        'page-bg': '#F1F3F6',
        'body-text': '#2B3038',
        'muted-text': '#4A505A',
        'heading-secondary': '#3A3F48',
        'on-dark': '#D5D9DF',
        hairline: '#D2D6DC',
        divider: '#D3D7DD',
        'brand-green': '#0A8F3C',
        'brand-green-bright': '#2BD46B',
        'alert-red': '#E11D2E',
      },
      fontFamily: {
        display: ["'Inter Display'", "'InterDisplay'", "'Inter'", '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        body: ["'Inter'", '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        4: '4px',
        8: '8px',
        12: '12px',
        16: '16px',
        20: '20px',
        24: '24px',
        32: '32px',
        40: '40px',
        48: '48px',
      },
    },
  },
  plugins: [],
};
