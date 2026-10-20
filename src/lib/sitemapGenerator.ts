import { CmsData } from '../types/cms';
import { slugify } from '../components/admin/LinksManager';
import { CANONICAL_BASE_URL } from './ogImage';

export function generateSitemapXml(data: CmsData): string {
  const today = new Date().toISOString().split('T')[0];

  const staticRoutes = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/services', priority: '0.9', changefreq: 'monthly' },
    { path: '/projects', priority: '0.9', changefreq: 'weekly' },
    { path: '/start-project', priority: '0.8', changefreq: 'monthly' },
    { path: '/about', priority: '0.8', changefreq: 'monthly' },
    { path: '/leadership', priority: '0.8', changefreq: 'monthly' },
    { path: '/clients', priority: '0.8', changefreq: 'monthly' },
    { path: '/holding-group', priority: '0.8', changefreq: 'monthly' },
    { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  ];

  // Published projects
  const publishedProjects = data.projects.filter((p) => p.published !== false);
  const projectRoutes = publishedProjects.map((p) => ({
    path: `/projects/${p.slug || slugify(p.title)}`,
    priority: '0.8',
    changefreq: 'monthly',
  }));

  // Leadership profiles
  const leaderRoutes = data.leadership.map((l) => ({
    path: `/leadership/${l.slug || slugify(l.name)}`,
    priority: '0.8',
    changefreq: 'monthly',
  }));

  const allUrls = [...staticRoutes, ...projectRoutes, ...leaderRoutes];

  const xmlEntries = allUrls
    .map(
      (item) => `  <url>
    <loc>${CANONICAL_BASE_URL}${item.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>
`;
}

export async function syncSitemapToFile(data: CmsData): Promise<boolean> {
  try {
    const xml = generateSitemapXml(data);
    const response = await fetch('/api/save-sitemap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ xml }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
