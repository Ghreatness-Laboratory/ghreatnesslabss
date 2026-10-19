-- ==============================================================================
-- GHREATNESSLABS CMS — SUPABASE / POSTGRESQL SCHEMA & INITIAL SEED
-- Path: supabase/schema.sql
-- Run this in your Supabase Project -> SQL Editor -> Run
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE TABLES

-- Site Settings & Studio Metadata
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

-- Core Capabilities & Practice Areas
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

-- Detailed Services (Digital & Technology Categories)
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
    slug TEXT UNIQUE,
    category_tag TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    detail TEXT,
    image_url TEXT,
    hero_image_url TEXT,
    challenge TEXT,
    approach TEXT,
    result TEXT,
    tech_stack TEXT[] DEFAULT '{}'::text[],
    client_quote TEXT,
    client_name TEXT,
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

-- Frequently Asked Questions (FAQs)
CREATE TABLE IF NOT EXISTS public.faqs (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- General Contact Submissions
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    service_category TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Structured Project Intake Inquiries
CREATE TABLE IF NOT EXISTS public.project_inquiries (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    project_type TEXT NOT NULL,
    budget_range TEXT NOT NULL,
    timeline TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

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
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_inquiries ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if re-running
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY[
            'site_settings', 'stats', 'about_cards', 'capabilities', 
            'services', 'holding_group', 'projects', 'leadership', 
            'clients', 'testimonials', 'pages', 'faqs',
            'contact_submissions', 'project_inquiries'
        ])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public read access" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Admin write access" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Anon modify for admin panel" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Public insert access" ON public.%I', t);
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
CREATE POLICY "Public read access" ON public.faqs FOR SELECT USING (true);

-- Admin WRITE access (authenticated users or service role)
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
CREATE POLICY "Admin write access" ON public.faqs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write access" ON public.contact_submissions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write access" ON public.project_inquiries FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public INSERT for visitors to submit inquiries
CREATE POLICY "Public insert access" ON public.contact_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public insert access" ON public.project_inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Client-side Passcode Admin Panel modification via anon key
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
CREATE POLICY "Anon modify for admin panel" ON public.faqs FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon modify for admin panel" ON public.contact_submissions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon modify for admin panel" ON public.project_inquiries FOR ALL TO anon USING (true) WITH CHECK (true);

-- ==============================================================================
-- 4. SEED DATA
-- ==============================================================================

-- Site Settings
INSERT INTO public.site_settings (
    id, wordmark, status, hero_eyebrow, hero_title_primary, hero_title_secondary,
    hero_body, contact_email, hotline, whatsapp_number, office_address, office_city,
    social_instagram, social_twitter, social_linkedin, footer_tagline, copyright_text, availability_text
) VALUES (
    'default-settings',
    'GHREATNESSLABS',
    'Now accepting select projects for Q2.',
    'Independent digital studio · Lagos, Nigeria',
    'Architects of high-impact digital systems',
    '& brand experiences',
    'We are an independent digital and IT solutions studio founded in Lagos. We architect resilient software systems, distinct brand languages, and purposeful technological infrastructure for ambitious teams.',
    'studio@ghreatness.io',
    '+234 800 000 0000',
    '+2348000000000',
    'Victoria Island',
    'Lagos, Nigeria',
    'https://instagram.com',
    'https://x.com',
    'https://linkedin.com',
    'Architects of high-impact digital systems and durable brand identities engineered in Lagos, Nigeria.',
    '© 2026 GHREATNESSLABS. All rights reserved.',
    'Q2 projects'
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
INSERT INTO public.stats (id, label, value, caption, icon_name, sort_order) VALUES ('stat-1', 'Founded', '2024', 'Lagos studio launch', 'building-2', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stats (id, label, value, caption, icon_name, sort_order) VALUES ('stat-2', 'Capabilities', '124', 'Core competencies across disciplines', 'shapes', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stats (id, label, value, caption, icon_name, sort_order) VALUES ('stat-3', 'Ventures', '51', 'Holding group and portfolio initiatives', 'globe-2', 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stats (id, label, value, caption, icon_name, sort_order) VALUES ('stat-4', 'Specialists', '14', 'Systems thinkers and makers', 'users-round', 4) ON CONFLICT (id) DO NOTHING;

-- About Cards
INSERT INTO public.about_cards (id, type, title, description, icon_name, sort_order) VALUES ('about-1', 'history', 'History', 'Founded in Lagos in 2024, GhreatnessLabs was established to bring clarity, craft, and senior technical leadership to complex digital initiatives across emerging markets and global frontiers.', 'building-2', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.about_cards (id, type, title, description, icon_name, sort_order) VALUES ('about-2', 'what_we_do', 'What We Do', 'We build digital products, enterprise platforms, brand identities, and high-trust technology systems designed to endure real-world conditions with elegance and speed.', 'code-2', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.about_cards (id, type, title, description, icon_name, sort_order) VALUES ('about-3', 'mission', 'Mission', 'To architect digital infrastructure and brand experiences that turn operational complexity into lasting market advantage for our clients and portfolio ventures.', 'target', 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.about_cards (id, type, title, description, icon_name, sort_order) VALUES ('about-4', 'vision', 'Vision', 'A world where thoughtful design and resilient engineering elevate everyday African and global institutions into high-trust beacons of excellence.', 'telescope', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.about_cards (id, type, title, description, icon_name, sort_order) VALUES ('about-5', 'core_values', 'Core Values', 'We operate with unyielding curiosity, rigorous systems thinking, complete accountability, and deep respect for the people who use what we build.', 'shield-check', 5) ON CONFLICT (id) DO NOTHING;

-- Capabilities
INSERT INTO public.capabilities (id, category_label, title, description, icon_name, tags, sort_order) VALUES ('cap-1', 'Product design', 'UI/UX & Product Design', 'Interfaces engineered for clarity, momentum, and measurable use.', 'pen-tool', '{"UX Research","Design Systems","Prototyping"}'::text[], 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.capabilities (id, category_label, title, description, icon_name, tags, sort_order) VALUES ('cap-2', 'Engineering', 'Web & Mobile Engineering', 'Resilient products, from public surfaces to operational platforms.', 'code-2', '{"Web Apps","Mobile","API Systems"}'::text[], 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.capabilities (id, category_label, title, description, icon_name, tags, sort_order) VALUES ('cap-3', 'Identity', 'Brand Identity & Typography', 'Distinct visual systems with durable rules and clear recall.', 'shapes', '{"Strategy","Type","Art Direction"}'::text[], 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.capabilities (id, category_label, title, description, icon_name, tags, sort_order) VALUES ('cap-4', 'Motion', 'Video & Motion Systems', 'Moving-image systems that make complex messages legible.', 'play', '{"Film","Motion","3D"}'::text[], 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.capabilities (id, category_label, title, description, icon_name, tags, sort_order) VALUES ('cap-5', 'Growth', 'Growth & Marketing Strategy', 'Audience architecture and distribution models that compound.', 'chart-no-axes-combined', '{"Channels","Data","Performance"}'::text[], 5) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.capabilities (id, category_label, title, description, icon_name, tags, sort_order) VALUES ('cap-6', 'Advisory', 'Systems Consulting & Architecture', 'Strategic technical leadership for critical moments and migrations.', 'badge-check', '{"Roadmaps","Audits","Integration"}'::text[], 6) ON CONFLICT (id) DO NOTHING;

-- Services
INSERT INTO public.services (id, category, title, description, icon_name, sort_order) VALUES ('srv-1', 'digital', 'Graphic Design & Art Direction', 'Visual assets shaped by strong typographic rules and deliberate craft.', 'shapes', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.services (id, category, title, description, icon_name, sort_order) VALUES ('srv-2', 'digital', 'Video Editing & Motion Systems', 'Purposeful edits and moving-image stories that hold attention.', 'play', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.services (id, category, title, description, icon_name, sort_order) VALUES ('srv-3', 'digital', 'Social Media Strategy & Marketing', 'Audience-led channel plans designed to build sustainable momentum.', 'chart-no-axes-combined', 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.services (id, category, title, description, icon_name, sort_order) VALUES ('srv-4', 'digital', 'Editorial & Technical Copywriting', 'Voice, messaging, and narrative architecture that makes the work legible.', 'pen-tool', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.services (id, category, title, description, icon_name, sort_order) VALUES ('srv-5', 'digital', 'Strategic Product Consulting', 'Focused direction for teams navigating a high-stakes transition or expansion.', 'badge-check', 5) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.services (id, category, title, description, icon_name, sort_order) VALUES ('srv-6', 'digital', 'Content Management & Workflows', 'Practical systems for planning, publishing, and maintaining content.', 'globe-2', 6) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.services (id, category, title, description, icon_name, sort_order) VALUES ('srv-7', 'technology', 'Front-End Systems Development', 'Fast, accessible interfaces that faithfully carry the product vision.', 'code-2', 7) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.services (id, category, title, description, icon_name, sort_order) VALUES ('srv-8', 'technology', 'Back-End & API Infrastructure', 'Secure data structures, business logic, and transactional backbones.', 'building-2', 8) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.services (id, category, title, description, icon_name, sort_order) VALUES ('srv-9', 'technology', 'Mobile Application Development', 'iOS and Android applications engineered for fluid everyday performance.', 'shapes', 9) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.services (id, category, title, description, icon_name, sort_order) VALUES ('srv-10', 'technology', 'UI/UX Interface Engineering', 'Design-system-driven user experiences grounded in real-world behavior.', 'pen-tool', 10) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.services (id, category, title, description, icon_name, sort_order) VALUES ('srv-11', 'technology', 'DevOps & Cloud Systems Architecture', 'Deployment pipelines, observability, and containerized cloud foundations.', 'shield-check', 11) ON CONFLICT (id) DO NOTHING;

-- Holding Group
INSERT INTO public.holding_group (id, company_name, description, icon_name, sort_order) VALUES ('hold-1', 'GhreatnessLabs Studio', 'The core design, systems architecture, and engineering practice.', 'building-2', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.holding_group (id, company_name, description, icon_name, sort_order) VALUES ('hold-2', 'FragAfrica', 'A digital network and platform connecting the wider African gaming ecosystem.', 'globe-2', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.holding_group (id, company_name, description, icon_name, sort_order) VALUES ('hold-3', 'Univyx', 'Modern digital administrative workflows for African tertiary institutions.', 'building-2', 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.holding_group (id, company_name, description, icon_name, sort_order) VALUES ('hold-4', 'Univyx Arena', 'Campus competition, collegiate tournaments, and student community platform.', 'users-round', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.holding_group (id, company_name, description, icon_name, sort_order) VALUES ('hold-5', 'AthleGame Esports', 'Esports media, live tournament streaming, and youth gaming culture.', 'play', 5) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.holding_group (id, company_name, description, icon_name, sort_order) VALUES ('hold-6', 'MisplaceMe', 'A decentralized lost-and-found recovery network for urban centers.', 'shapes', 6) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.holding_group (id, company_name, description, icon_name, sort_order) VALUES ('hold-7', 'Sonariq Sounds', 'An independent home for sound design, sonic identity, and creative direction.', 'pen-tool', 7) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.holding_group (id, company_name, description, icon_name, sort_order) VALUES ('hold-8', 'Prothlete Esports', 'Talent acceleration and technical coaching infrastructure for pro esports athletes.', 'chart-no-axes-combined', 8) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.holding_group (id, company_name, description, icon_name, sort_order) VALUES ('hold-9', 'Civyn', 'Digital civic tools and transparent reporting systems for municipal communities.', 'shield-check', 9) ON CONFLICT (id) DO NOTHING;

-- Portfolio Projects
INSERT INTO public.projects (id, slug, category_tag, title, description, detail, project_url, sort_order) VALUES ('proj-1', 'fragafrica', 'Community platform', 'FragAfrica', 'A digital network built to organize and connect players, tournament organizers, and gaming culture across Africa.', 'Tournament infrastructure, player rankings, and live event distribution tailored to emerging market networks.', '/projects/fragafrica', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.projects (id, slug, category_tag, title, description, detail, project_url, sort_order) VALUES ('proj-2', 'civyn', 'Civic systems', 'Civyn', 'A lightweight civic reporting interface that helps residents and local teams coordinate neighborhood infrastructure.', 'Geospatial incident logging, real-time resolution metrics, and open municipal visibility.', '/projects/civyn', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.projects (id, slug, category_tag, title, description, detail, project_url, sort_order) VALUES ('proj-3', 'univyx', 'Higher-ed workflow', 'Univyx', 'A coordinated operating layer for the modern African university campus.', 'Cryptographic transcript generation, course enrollment engines, and multi-campus administrative analytics.', '/projects/univyx', 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.projects (id, slug, category_tag, title, description, detail, project_url, sort_order) VALUES ('proj-4', 'kora-systems', 'Financial operations', 'Kora Systems', 'A simplified financial operations environment for distributed pan-African commerce.', 'Multi-currency settlement rails, dual-approval workflow authorization, and instant ledger auditing.', '/projects/kora-systems', 4) ON CONFLICT (id) DO NOTHING;

-- Leadership Team
INSERT INTO public.leadership (id, name, role, bio, social_links, sort_order) VALUES ('lead-1', 'Adebayo Ogunlesi', 'Principal & Systems Architect', 'Directs studio governance, technology architecture, and large-scale platform implementations.', '{"linkedin":"https://www.linkedin.com","twitter":"https://x.com"}'::jsonb, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.leadership (id, name, role, bio, social_links, sort_order) VALUES ('lead-2', 'Chidera Okafor', 'Head of Design & Brand Identity', 'Shapes visual languages, type systems, and user interfaces across studio ventures and client briefs.', '{"linkedin":"https://www.linkedin.com","twitter":"https://x.com"}'::jsonb, 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.leadership (id, name, role, bio, social_links, sort_order) VALUES ('lead-3', 'David Okafor', 'Engineering Lead', 'Oversees software delivery, API contracts, database architecture, and deployment resilience.', '{"linkedin":"https://www.linkedin.com","twitter":"https://x.com"}'::jsonb, 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.leadership (id, name, role, bio, social_links, sort_order) VALUES ('lead-4', 'Ifeoma Nwosu', 'Strategy & Partnerships Lead', 'Connects client priorities to practical project programs and manages venture alliances.', '{"linkedin":"https://www.linkedin.com","twitter":"https://x.com"}'::jsonb, 4) ON CONFLICT (id) DO NOTHING;

-- Clients
INSERT INTO public.clients (id, name, sort_order) VALUES ('client-1', 'Vertex', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.clients (id, name, sort_order) VALUES ('client-2', 'Duct', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.clients (id, name, sort_order) VALUES ('client-3', 'Mora', 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.clients (id, name, sort_order) VALUES ('client-4', 'AthleGame', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.clients (id, name, sort_order) VALUES ('client-5', 'Civyn', 5) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.clients (id, name, sort_order) VALUES ('client-6', 'Univyx', 6) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.clients (id, name, sort_order) VALUES ('client-7', 'Kora Systems', 7) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.clients (id, name, sort_order) VALUES ('client-8', 'Northstar', 8) ON CONFLICT (id) DO NOTHING;

-- Testimonials
INSERT INTO public.testimonials (id, quote, author_name, author_role, author_company, location, sort_order) VALUES ('test-1', '“They made an ambitious platform feel inevitable. Every technical detail has purpose and clarity.”', 'Tunde Folawiyo', 'VP Technology', 'Mora Group', 'Lagos', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.testimonials (id, quote, author_name, author_role, author_company, location, sort_order) VALUES ('test-2', '“Senior thinking stayed close to our project from day one to deployment. Exceptional engineering standards.”', 'Halima Bello', 'Managing Director', 'Northstar Capital', 'Abuja', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.testimonials (id, quote, author_name, author_role, author_company, location, sort_order) VALUES ('test-3', '“GhreatnessLabs built an operational system that scaled across three countries without a single hiccup.”', 'Kofi Mensah', 'Head of Product', 'Duct Logistics', 'Accra', 3) ON CONFLICT (id) DO NOTHING;

-- Freeform Pages
INSERT INTO public.pages (id, page_slug, section_key, title, subtitle, content, updated_at) VALUES ('page-home-hero', 'home', 'hero', 'Architects of high-impact digital systems', '& brand experiences', 'We are an independent digital and IT solutions studio founded in Lagos. We architect resilient software systems, distinct brand languages, and purposeful technological infrastructure for ambitious teams.', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pages (id, page_slug, section_key, title, subtitle, content, updated_at) VALUES ('page-about-hero', 'about', 'hero', 'Built in Lagos for', 'important work.', 'We are an independent digital and IT solutions studio for teams that need clarity, craft, and capable delivery in equal measure.', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pages (id, page_slug, section_key, title, subtitle, content, updated_at) VALUES ('page-services-hero', 'services', 'hero', 'Services shaped by', 'rigor and restraint.', 'We offer dedicated digital and technology services designed to make products clearer, faster, and more dependable.', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pages (id, page_slug, section_key, title, subtitle, content, updated_at) VALUES ('page-holding-hero', 'holding-group', 'hero', 'Companies built for', 'distinct worlds.', 'GhreatnessLabs owns and supports ventures where thoughtful technology, culture, and community can create enduring value.', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pages (id, page_slug, section_key, title, subtitle, content, updated_at) VALUES ('page-projects-hero', 'projects', 'hero', 'Ventures and case studies', 'made to move.', 'We use systems thinking to make products, platforms, and brands more useful in the real world.', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pages (id, page_slug, section_key, title, subtitle, content, updated_at) VALUES ('page-leadership-hero', 'leadership', 'hero', 'A small team for', 'high-stakes work.', 'Senior thinking stays close to the brief, the details, and the people making decisions.', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pages (id, page_slug, section_key, title, subtitle, content, updated_at) VALUES ('page-clients-hero', 'clients', 'hero', 'Partners with', 'a point of view.', 'We work with organizations that see design and technology as a meaningful advantage.', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pages (id, page_slug, section_key, title, subtitle, content, updated_at) VALUES ('page-contact-hero', 'contact', 'hero', 'Start a conversation', 'with the studio.', 'Tell us about the problem you are solving, the timeline you have in mind, and the scale of the ambition.', NOW()) ON CONFLICT (id) DO NOTHING;

-- FAQs
INSERT INTO public.faqs (id, question, answer, sort_order) VALUES ('faq-1', 'What does GhreatnessLabs do?', 'GhreatnessLabs is a Lagos-based digital systems studio that designs and develops high-impact digital products, brand identities, and enterprise IT infrastructure for high-trust organizations and ecosystem ventures.', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.faqs (id, question, answer, sort_order) VALUES ('faq-2', 'Where is the studio based?', 'Our headquarters and primary studio are situated in Victoria Island, Lagos, Nigeria, working with both African leaders and global partners.', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.faqs (id, question, answer, sort_order) VALUES ('faq-3', 'How do you structure project engagements?', 'We typically work on dedicated scoping sprints, fixed-deliverable milestones, or ongoing retainer partnerships for systems architecture and product engineering.', 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.faqs (id, question, answer, sort_order) VALUES ('faq-4', 'How do we schedule a project intake or consultation?', 'You can book a direct consultation through our floating consultation tool, reach us via WhatsApp or hotline, or submit a confidential brief via our Start a Project intake page.', 4) ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- DONE!
-- ==============================================================================
