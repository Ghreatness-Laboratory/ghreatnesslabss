export interface SiteSettings {
  id?: string;
  wordmark: string;
  status: string;
  heroEyebrow: string;
  heroTitlePrimary: string;
  heroTitleSecondary: string;
  heroBody: string;
  contactEmail: string;
  hotline: string;
  whatsappNumber: string;
  officeAddress: string;
  officeCity: string;
  socialInstagram: string;
  socialTwitter: string;
  socialLinkedin: string;
  footerTagline: string;
  copyrightText: string;
  availabilityText: string;
}

export interface StatItem {
  id: string;
  label: string;
  value: string;
  caption: string;
  icon_name: string;
  sort_order: number;
}

export interface AboutCard {
  id: string;
  type: 'mission' | 'vision' | 'core_values' | 'history' | 'what_we_do';
  title: string;
  description: string;
  icon_name: string;
  sort_order: number;
}

export interface CapabilityItem {
  id: string;
  category_label: string;
  title: string;
  description: string;
  icon_name: string;
  tags: string[];
  sort_order: number;
}

export interface ServiceItem {
  id: string;
  category: 'digital' | 'technology';
  title: string;
  description: string;
  icon_name: string;
  sort_order: number;
}

export interface HoldingItem {
  id: string;
  company_name: string;
  description: string;
  icon_name: string;
  sort_order: number;
}

export interface ProjectItem {
  id: string;
  category_tag: string;
  title: string;
  description: string;
  detail?: string;
  image_url?: string;
  project_url?: string;
  sort_order: number;
}

export interface LeaderItem {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar_url?: string;
  social_links: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  sort_order: number;
}

export interface ClientItem {
  id: string;
  name: string;
  logo_url?: string;
  sort_order: number;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author_name: string;
  author_role: string;
  author_company: string;
  location: string;
  sort_order: number;
}

export interface PageCopyItem {
  id: string;
  page_slug: string;
  section_key: string;
  title?: string;
  subtitle?: string;
  content: string;
  updated_at?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export interface CmsData {
  settings: SiteSettings;
  stats: StatItem[];
  aboutCards: AboutCard[];
  capabilities: CapabilityItem[];
  services: ServiceItem[];
  holding: HoldingItem[];
  projects: ProjectItem[];
  leadership: LeaderItem[];
  clients: ClientItem[];
  testimonials: TestimonialItem[];
  faqs: FaqItem[];
  pages: PageCopyItem[];
}

