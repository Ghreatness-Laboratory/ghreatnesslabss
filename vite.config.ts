import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
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
  plugins: [react(), sitemapApiPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
});

