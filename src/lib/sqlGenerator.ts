import { defaultCmsData } from './defaultData';

export function generateSupabaseSql(): string {
  const escapeSql = (str: string | undefined | null) => {
    if (str === undefined || str === null) return 'NULL';
    return `'${str.replace(/'/g, "''")}'`;
  };

  const escapeJson = (obj: unknown) => {
    return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
  };

  const escapeArray = (arr: string[]) => {
    const formatted = arr.map((item) => `"${item.replace(/"/g, '\\"')}"`).join(',');
    return `'{${formatted}}'::text[]`;
  };

  return `-- ==============================================================================
-- GHREATNESSLABS CMS — SUPABASE SCHEMA, ROW-LEVEL SECURITY & SEED MIGRATION
-- Run this script in your Supabase Project -> SQL Editor -> Run
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE TABLES

-- Site Settings
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default-settings',
    wordmark TEXT NOT NULL DEFAULT 'GHREATNESSLABS',
    status TEXT NOT NULL DEFAULT 'Now accepting select projects for Q2.',
    hero_eyebrow TEXT NOT NULL DEFAULT 'Independent digital studio · Lagos, Nigeria',
    hero_title_primary TEXT NOT NULL DEFAULT 'Architects of high-impact digital systems',
    hero_title_secondary TEXT NOT NULL DEFAULT '& brand experiences',
    hero_body TEXT NOT NULL,
    contact_email TEXT NOT NULL DEFAULT 'studio@ghreatness.io',
    hotline TEXT NOT NULL DEFAULT '+234 800 000 0000',
    whatsapp_number TEXT NOT NULL DEFAULT '+2348000000000',
    office_address TEXT NOT NULL DEFAULT 'Victoria Island',
    office_city TEXT NOT NULL DEFAULT 'Lagos, Nigeria',
    social_instagram TEXT DEFAULT 'https://instagram.com',
    social_twitter TEXT DEFAULT 'https://x.com',
    social_linkedin TEXT DEFAULT 'https://linkedin.com',
    footer_tagline TEXT NOT NULL,
    copyright_text TEXT NOT NULL DEFAULT '© 2026 GHREATNESSLABS. All rights reserved.',
    availability_text TEXT NOT NULL DEFAULT 'Q2 projects',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stats Cards (2024 / 124 / 51 / 14)
CREATE TABLE IF NOT EXISTS public.stats (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    caption TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- About Cards (Mission / Vision / Core Values / History / What We Do)
CREATE TABLE IF NOT EXISTS public.about_cards (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('mission', 'vision', 'core_values', 'history', 'what_we_do')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Capabilities
CREATE TABLE IF NOT EXISTS public.capabilities (
    id TEXT PRIMARY KEY,
    category_label TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Detailed Services (Digital & Technology)
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('digital', 'technology')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Holding Group Companies
CREATE TABLE IF NOT EXISTS public.holding_group (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio Projects & Ventures
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    category_tag TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    detail TEXT,
    image_url TEXT,
    project_url TEXT DEFAULT '/contact',
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leadership Team
CREATE TABLE IF NOT EXISTS public.leadership (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    bio TEXT NOT NULL,
    avatar_url TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients & Partners
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials & Client Perspectives
CREATE TABLE IF NOT EXISTS public.testimonials (
    id TEXT PRIMARY KEY,
    quote TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL,
    author_company TEXT NOT NULL,
    location TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Freeform Page Copy
CREATE TABLE IF NOT EXISTS public.pages (
    id TEXT PRIMARY KEY,
    page_slug TEXT NOT NULL,
    section_key TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    content TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ROW LEVEL SECURITY (RLS)
-- Enable RLS across all tables
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holding_group ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if re-running
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY[
            'site_settings', 'stats', 'about_cards', 'capabilities', 
            'services', 'holding_group', 'projects', 'leadership', 
            'clients', 'testimonials', 'pages'
        ])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public read access" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Admin write access" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Anon modify for admin panel" ON public.%I', t);
    END LOOP;
END $$;

-- Public READ access for anon & authenticated users
CREATE POLICY "Public read access" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.stats FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.about_cards FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.capabilities FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.services FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.holding_group FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.leadership FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.pages FOR SELECT USING (true);

-- Admin WRITE access (authenticated users or service role)
-- Allows authenticated Supabase users to insert, update, and delete
CREATE POLICY "Admin write access" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write access" ON public.stats FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write access" ON public.about_cards FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write access" ON public.capabilities FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write access" ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write access" ON public.holding_group FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write access" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write access" ON public.leadership FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write access" ON public.clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write access" ON public.testimonials FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write access" ON public.pages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Optional: If using anon key directly from the admin panel (client-side passcode security):
CREATE POLICY "Anon modify for admin panel" ON public.site_settings FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon modify for admin panel" ON public.stats FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon modify for admin panel" ON public.about_cards FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon modify for admin panel" ON public.capabilities FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon modify for admin panel" ON public.services FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon modify for admin panel" ON public.holding_group FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon modify for admin panel" ON public.projects FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon modify for admin panel" ON public.leadership FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon modify for admin panel" ON public.clients FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon modify for admin panel" ON public.testimonials FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon modify for admin panel" ON public.pages FOR ALL TO anon USING (true) WITH CHECK (true);

-- 4. SEED DATA

-- Site Settings
INSERT INTO public.site_settings (
    id, wordmark, status, hero_eyebrow, hero_title_primary, hero_title_secondary,
    hero_body, contact_email, hotline, whatsapp_number, office_address, office_city,
    social_instagram, social_twitter, social_linkedin, footer_tagline, copyright_text, availability_text
) VALUES (
    ${escapeSql(defaultCmsData.settings.id)},
    ${escapeSql(defaultCmsData.settings.wordmark)},
    ${escapeSql(defaultCmsData.settings.status)},
    ${escapeSql(defaultCmsData.settings.heroEyebrow)},
    ${escapeSql(defaultCmsData.settings.heroTitlePrimary)},
    ${escapeSql(defaultCmsData.settings.heroTitleSecondary)},
    ${escapeSql(defaultCmsData.settings.heroBody)},
    ${escapeSql(defaultCmsData.settings.contactEmail)},
    ${escapeSql(defaultCmsData.settings.hotline)},
    ${escapeSql(defaultCmsData.settings.whatsappNumber)},
    ${escapeSql(defaultCmsData.settings.officeAddress)},
    ${escapeSql(defaultCmsData.settings.officeCity)},
    ${escapeSql(defaultCmsData.settings.socialInstagram)},
    ${escapeSql(defaultCmsData.settings.socialTwitter)},
    ${escapeSql(defaultCmsData.settings.socialLinkedin)},
    ${escapeSql(defaultCmsData.settings.footerTagline)},
    ${escapeSql(defaultCmsData.settings.copyrightText)},
    ${escapeSql(defaultCmsData.settings.availabilityText)}
) ON CONFLICT (id) DO UPDATE SET
    wordmark = EXCLUDED.wordmark,
    status = EXCLUDED.status,
    hero_eyebrow = EXCLUDED.hero_eyebrow,
    hero_title_primary = EXCLUDED.hero_title_primary,
    hero_title_secondary = EXCLUDED.hero_title_secondary,
    hero_body = EXCLUDED.hero_body,
    contact_email = EXCLUDED.contact_email,
    hotline = EXCLUDED.hotline,
    whatsapp_number = EXCLUDED.whatsapp_number,
    office_address = EXCLUDED.office_address,
    office_city = EXCLUDED.office_city,
    social_instagram = EXCLUDED.social_instagram,
    social_twitter = EXCLUDED.social_twitter,
    social_linkedin = EXCLUDED.social_linkedin,
    footer_tagline = EXCLUDED.footer_tagline,
    copyright_text = EXCLUDED.copyright_text,
    availability_text = EXCLUDED.availability_text;

-- Stats
${defaultCmsData.stats
  .map(
    (s) =>
      `INSERT INTO public.stats (id, label, value, caption, icon_name, sort_order) VALUES (${escapeSql(
        s.id
      )}, ${escapeSql(s.label)}, ${escapeSql(s.value)}, ${escapeSql(s.caption)}, ${escapeSql(
        s.icon_name
      )}, ${s.sort_order}) ON CONFLICT (id) DO NOTHING;`
  )
  .join('\n')}

-- About Cards
${defaultCmsData.aboutCards
  .map(
    (a) =>
      `INSERT INTO public.about_cards (id, type, title, description, icon_name, sort_order) VALUES (${escapeSql(
        a.id
      )}, ${escapeSql(a.type)}, ${escapeSql(a.title)}, ${escapeSql(a.description)}, ${escapeSql(
        a.icon_name
      )}, ${a.sort_order}) ON CONFLICT (id) DO NOTHING;`
  )
  .join('\n')}

-- Capabilities
${defaultCmsData.capabilities
  .map(
    (c) =>
      `INSERT INTO public.capabilities (id, category_label, title, description, icon_name, tags, sort_order) VALUES (${escapeSql(
        c.id
      )}, ${escapeSql(c.category_label)}, ${escapeSql(c.title)}, ${escapeSql(
        c.description
      )}, ${escapeSql(c.icon_name)}, ${escapeArray(c.tags)}, ${c.sort_order}) ON CONFLICT (id) DO NOTHING;`
  )
  .join('\n')}

-- Services
${defaultCmsData.services
  .map(
    (srv) =>
      `INSERT INTO public.services (id, category, title, description, icon_name, sort_order) VALUES (${escapeSql(
        srv.id
      )}, ${escapeSql(srv.category)}, ${escapeSql(srv.title)}, ${escapeSql(
        srv.description
      )}, ${escapeSql(srv.icon_name)}, ${srv.sort_order}) ON CONFLICT (id) DO NOTHING;`
  )
  .join('\n')}

-- Holding Group
${defaultCmsData.holding
  .map(
    (h) =>
      `INSERT INTO public.holding_group (id, company_name, description, icon_name, sort_order) VALUES (${escapeSql(
        h.id
      )}, ${escapeSql(h.company_name)}, ${escapeSql(h.description)}, ${escapeSql(
        h.icon_name
      )}, ${h.sort_order}) ON CONFLICT (id) DO NOTHING;`
  )
  .join('\n')}

-- Projects
${defaultCmsData.projects
  .map(
    (p) =>
      `INSERT INTO public.projects (id, category_tag, title, description, detail, project_url, sort_order) VALUES (${escapeSql(
        p.id
      )}, ${escapeSql(p.category_tag)}, ${escapeSql(p.title)}, ${escapeSql(
        p.description
      )}, ${escapeSql(p.detail)}, ${escapeSql(p.project_url)}, ${p.sort_order}) ON CONFLICT (id) DO NOTHING;`
  )
  .join('\n')}

-- Leadership
${defaultCmsData.leadership
  .map(
    (l) =>
      `INSERT INTO public.leadership (id, name, role, bio, social_links, sort_order) VALUES (${escapeSql(
        l.id
      )}, ${escapeSql(l.name)}, ${escapeSql(l.role)}, ${escapeSql(l.bio)}, ${escapeJson(
        l.social_links
      )}, ${l.sort_order}) ON CONFLICT (id) DO NOTHING;`
  )
  .join('\n')}

-- Clients
${defaultCmsData.clients
  .map(
    (c) =>
      `INSERT INTO public.clients (id, name, sort_order) VALUES (${escapeSql(c.id)}, ${escapeSql(
        c.name
      )}, ${c.sort_order}) ON CONFLICT (id) DO NOTHING;`
  )
  .join('\n')}

-- Testimonials
${defaultCmsData.testimonials
  .map(
    (t) =>
      `INSERT INTO public.testimonials (id, quote, author_name, author_role, author_company, location, sort_order) VALUES (${escapeSql(
        t.id
      )}, ${escapeSql(t.quote)}, ${escapeSql(t.author_name)}, ${escapeSql(
        t.author_role
      )}, ${escapeSql(t.author_company)}, ${escapeSql(t.location)}, ${t.sort_order}) ON CONFLICT (id) DO NOTHING;`
  )
  .join('\n')}

-- Pages
${defaultCmsData.pages
  .map(
    (p) =>
      `INSERT INTO public.pages (id, page_slug, section_key, title, subtitle, content, updated_at) VALUES (${escapeSql(
        p.id
      )}, ${escapeSql(p.page_slug)}, ${escapeSql(p.section_key)}, ${escapeSql(
        p.title
      )}, ${escapeSql(p.subtitle)}, ${escapeSql(p.content)}, NOW()) ON CONFLICT (id) DO NOTHING;`
  )
  .join('\n')}

-- DONE!
`;
}
