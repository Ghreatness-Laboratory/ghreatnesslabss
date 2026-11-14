import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'node:fs';
import path from 'node:path';

function sitemapApiPlugin(): Plugin {
  return {
    name: 'sitemap-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/save-sitemap', (req: any, res: any) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              if (parsed?.xml) {
                const sitemapPath = path.resolve(process.cwd(), 'public/sitemap.xml');
                fs.writeFileSync(sitemapPath, parsed.xml, 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, path: '/sitemap.xml' }));
                return;
              }
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing xml parameter' }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
          return;
        }
        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    sitemapApiPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'favicon.png',
        'favicon.svg',
        'apple-touch-icon.png',
        'logo-mark.svg',
        'logo.svg',
      ],
      manifest: {
        id: '/',
        name: 'GhreatnessLabs — Lagos Systems Studio',
        short_name: 'Ghreatness',
        description:
          'Ghreatness Labs is a Lagos digital and IT solutions studio engineering high-impact systems, software, and brand infrastructure.',
        theme_color: '#0B0D10',
        background_color: '#F6F7F9',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
});
