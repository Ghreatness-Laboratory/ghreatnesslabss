import { CmsData } from '../types/cms';

export const defaultCmsData: CmsData = {
  settings: {
    id: 'default-settings',
    wordmark: 'GHREATNESSLABS',
    status: 'Now accepting select projects for Q2.',
    heroEyebrow: 'Independent digital studio · Lagos, Nigeria',
    heroTitlePrimary: 'Architects of high-impact digital systems',
    heroTitleSecondary: '& brand experiences',
    heroBody:
      'GhreatnessLabs is a Lagos-based digital and IT solutions studio building high-performance platforms, decisive brand identities, enterprise infrastructure, and proprietary products.',
    contactEmail: 'studio@ghreatness.io',
    hotline: '+234 800 000 0000',
    whatsappNumber: '+2348000000000',
    officeAddress: 'Victoria Island',
    officeCity: 'Lagos, Nigeria',
    socialInstagram: 'https://instagram.com',
    socialTwitter: 'https://x.com',
    socialLinkedin: 'https://linkedin.com',
    footerTagline: 'Digital systems and brand experiences built from Lagos for the world.',
    copyrightText: '© 2026 GHREATNESSLABS. All rights reserved.',
    availabilityText: 'Q2 projects',
  },
  stats: [
    {
      id: 'stat-1',
      label: 'Founded',
      value: '2024',
      caption: 'Lagos studio launch',
      icon_name: 'building-2',
      sort_order: 1,
    },
    {
      id: 'stat-2',
      label: 'Clients',
      value: '124',
      caption: 'served globally',
      icon_name: 'users-round',
      sort_order: 2,
    },
    {
      id: 'stat-3',
      label: 'Certifications',
      value: '51',
      caption: 'verified credentials',
      icon_name: 'badge-check',
      sort_order: 3,
    },
    {
      id: 'stat-4',
      label: 'Markets',
      value: '14',
      caption: 'active markets',
      icon_name: 'globe-2',
      sort_order: 4,
    },
  ],
  aboutCards: [
    {
      id: 'about-1',
      type: 'history',
      title: 'How we started',
      description:
        'Founded in Lagos in 2024, GhreatnessLabs began with a simple belief: the digital systems African and global teams rely on should be as considered as their ambition.',
      icon_name: 'building-2',
      sort_order: 1,
    },
    {
      id: 'about-2',
      type: 'mission',
      title: 'Our mission',
      description:
        'Make high-impact work more coherent—bringing strategy, identity, product design, engineering, and infrastructure into one accountable studio practice.',
      icon_name: 'target',
      sort_order: 2,
    },
    {
      id: 'about-3',
      type: 'vision',
      title: 'Our vision',
      description:
        'To be the trusted African studio behind the digital systems and brands shaping what comes next.',
      icon_name: 'eye',
      sort_order: 3,
    },
    {
      id: 'about-4',
      type: 'what_we_do',
      title: 'What we do',
      description:
        'We partner with founders, institutions, and established teams to create products, brands, and operational foundations made to endure.',
      icon_name: 'shapes',
      sort_order: 4,
    },
    {
      id: 'about-5',
      type: 'core_values',
      title: 'Core Values',
      description:
        'We work with curiosity, clear thinking, accountability, and respect for the people who use what we build.',
      icon_name: 'shield-check',
      sort_order: 5,
    },
  ],
  capabilities: [
    {
      id: 'cap-1',
      category_label: 'Product design',
      title: 'UI/UX & Product Design',
      description: 'Interfaces engineered for clarity, momentum, and measurable use.',
      icon_name: 'pen-tool',
      tags: ['UX Research', 'Design Systems', 'Prototyping'],
      sort_order: 1,
    },
    {
      id: 'cap-2',
      category_label: 'Engineering',
      title: 'Web & Mobile Engineering',
      description: 'Resilient products, from public surfaces to operational platforms.',
      icon_name: 'code-2',
      tags: ['Web Apps', 'Mobile', 'API Systems'],
      sort_order: 2,
    },
    {
      id: 'cap-3',
      category_label: 'Identity',
      title: 'Brand Identity & Typography',
      description: 'Distinct visual systems with durable rules and clear recall.',
      icon_name: 'shapes',
      tags: ['Strategy', 'Type', 'Art Direction'],
      sort_order: 3,
    },
    {
      id: 'cap-4',
      category_label: 'Motion',
      title: 'Video & Motion Systems',
      description: 'Moving-image systems that make complex messages legible.',
      icon_name: 'play',
      tags: ['Film', 'Motion', '3D'],
      sort_order: 4,
    },
    {
      id: 'cap-5',
      category_label: 'Growth',
      title: 'Social Media & Growth',
      description: 'Channel programs built around audience intelligence and action.',
      icon_name: 'chart-no-axes-combined',
      tags: ['Content', 'Analytics', 'Campaigns'],
      sort_order: 5,
    },
    {
      id: 'cap-6',
      category_label: 'Infrastructure',
      title: 'Cybersecurity & IT Infrastructure',
      description: 'Secure foundations for teams that cannot afford downtime.',
      icon_name: 'shield-check',
      tags: ['Security', 'Cloud', 'Networks'],
      sort_order: 6,
    },
  ],
  services: [
    {
      id: 'srv-1',
      category: 'digital',
      title: 'Graphic Designing',
      description: 'Clear, versatile visual communication for campaigns, products, and brands.',
      icon_name: 'shapes',
      sort_order: 1,
    },
    {
      id: 'srv-2',
      category: 'digital',
      title: 'Video Editing',
      description: 'Purposeful edits and moving-image stories that hold attention.',
      icon_name: 'play',
      sort_order: 2,
    },
    {
      id: 'srv-3',
      category: 'digital',
      title: 'Social Media Marketing',
      description: 'Audience-led channel plans designed to build momentum.',
      icon_name: 'chart-no-axes-combined',
      sort_order: 3,
    },
    {
      id: 'srv-4',
      category: 'digital',
      title: 'Copywriting',
      description: 'Voice, messaging, and words that make the work easier to understand.',
      icon_name: 'pen-tool',
      sort_order: 4,
    },
    {
      id: 'srv-5',
      category: 'digital',
      title: 'Consulting',
      description: 'Focused direction for teams navigating a meaningful next move.',
      icon_name: 'badge-check',
      sort_order: 5,
    },
    {
      id: 'srv-6',
      category: 'digital',
      title: 'Content Management',
      description: 'Practical systems for planning, publishing, and maintaining content.',
      icon_name: 'globe-2',
      sort_order: 6,
    },
    {
      id: 'srv-7',
      category: 'technology',
      title: 'Front-End Development',
      description: 'Fast, accessible interfaces that faithfully carry the product vision.',
      icon_name: 'code-2',
      sort_order: 7,
    },
    {
      id: 'srv-8',
      category: 'technology',
      title: 'UI/UX Design',
      description: 'Research-informed journeys that make every interaction feel obvious.',
      icon_name: 'pen-tool',
      sort_order: 8,
    },
    {
      id: 'srv-9',
      category: 'technology',
      title: 'Software Development',
      description: 'Reliable bespoke software for operationally important work.',
      icon_name: 'code-2',
      sort_order: 9,
    },
    {
      id: 'srv-10',
      category: 'technology',
      title: 'QA Testing',
      description: 'Deliberate quality assurance before a product reaches its people.',
      icon_name: 'badge-check',
      sort_order: 10,
    },
    {
      id: 'srv-11',
      category: 'technology',
      title: 'Cybersecurity Services',
      description: 'Protection and guidance for systems that need to stay trusted.',
      icon_name: 'shield-check',
      sort_order: 11,
    },
    {
      id: 'srv-12',
      category: 'technology',
      title: 'Web Application Development',
      description: 'Connected web products built for usefulness and scale.',
      icon_name: 'globe-2',
      sort_order: 12,
    },
  ],
  holding: [
    {
      id: 'hold-1',
      company_name: 'FragNaija',
      description: 'Competitive gaming and community for Nigeria’s next generation of players.',
      icon_name: 'play',
      sort_order: 1,
    },
    {
      id: 'hold-2',
      company_name: 'FragAfrica',
      description: 'A platform connecting the wider African gaming ecosystem.',
      icon_name: 'globe-2',
      sort_order: 2,
    },
    {
      id: 'hold-3',
      company_name: 'Univyx',
      description: 'Better digital workflows for modern higher education.',
      icon_name: 'building-2',
      sort_order: 3,
    },
    {
      id: 'hold-4',
      company_name: 'Univyx Arena',
      description: 'Campus competition, events, and community in one arena.',
      icon_name: 'users-round',
      sort_order: 4,
    },
    {
      id: 'hold-5',
      company_name: 'AthleGame Esports',
      description: 'Esports experiences built around competitive play and culture.',
      icon_name: 'play',
      sort_order: 5,
    },
    {
      id: 'hold-6',
      company_name: 'MisplaceMe',
      description: 'A useful layer for recovering, reporting, and reconnecting.',
      icon_name: 'shapes',
      sort_order: 6,
    },
    {
      id: 'hold-7',
      company_name: 'Sonariq Sounds',
      description: 'A home for artist-led sound, culture, and creative direction.',
      icon_name: 'pen-tool',
      sort_order: 7,
    },
    {
      id: 'hold-8',
      company_name: 'Prothlete Esports',
      description: 'Infrastructure for talented players pursuing competitive progress.',
      icon_name: 'chart-no-axes-combined',
      sort_order: 8,
    },
    {
      id: 'hold-9',
      company_name: 'Civyn',
      description: 'Digital civic tools for more connected communities.',
      icon_name: 'building-2',
      sort_order: 9,
    },
  ],
  projects: [
    {
      id: 'proj-1',
      slug: 'fragnaija-athlegame',
      category_tag: 'Esports platform',
      title: 'FragNaija / AthleGame',
      description:
        'A competitive gaming ecosystem constructed for Africa’s next generation of players.',
      detail:
        'A digital arena that brings player profiles, tournaments, live moments, and community into one focused experience.',
      hero_image_url:
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80',
      challenge:
        'Competitive gaming across West Africa faced fragmented tournament organization, erratic matchmaking servers, and lack of verified talent records for international scouts.',
      approach:
        'We designed and architected an authoritative real-time esports platform featuring automated bracket generation, anti-cheat validation, low-latency match telemetry, and unified gamer identity cards.',
      result:
        'Over 48,000 active tournament participants onboarded within 90 days, with 99.98% platform uptime during continental championships and 4 collegiate esports partnerships established.',
      tech_stack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'WebSockets', 'Tailwind CSS'],
      client_name: 'Lanre Balogun, Head of Operations at AthleGame',
      client_quote:
        'GhreatnessLabs built an infrastructure that stood up to tens of thousands of concurrent competitive gamers without breaking a sweat. It set the standard for African esports.',
      project_url: '/projects/fragnaija-athlegame',
      sort_order: 1,
    },
    {
      id: 'proj-2',
      slug: 'civyn',
      category_tag: 'Civic technology',
      title: 'Civyn',
      description:
        'Digital public infrastructure that helps communities participate and organize.',
      detail:
        'A civic operating layer designed to make local action, services, and feedback easier to access and understand.',
      hero_image_url:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
      challenge:
        'Municipal stakeholders and community grassroots organizers lacked a secure, transparent medium for neighborhood budget tracking, public service reporting, and participatory governance.',
      approach:
        'Engineered a mobile-first civic operating layer with end-to-end audit logging, geospatial incident heatmaps, anonymous citizen feedback channels, and automated municipal ticket escalation.',
      result:
        'Deployed across 6 urban districts in Lagos, facilitating over 14,000 resolved civic tickets and increasing citizen participation by 310% within the first municipal fiscal cycle.',
      tech_stack: ['Next.js', 'TypeScript', 'PostGIS', 'Tailwind CSS', 'Supabase', 'Cloudflare Workers'],
      client_name: 'Dr. Amina Yusuf, Municipal Director of Civic Innovation',
      client_quote:
        'The Civyn platform turned bureaucratic logjams into an open, responsive civic dialogue. GhreatnessLabs understands public systems at a fundamental level.',
      project_url: '/projects/civyn',
      sort_order: 2,
    },
    {
      id: 'proj-3',
      slug: 'univyx',
      category_tag: 'Higher-ed workflow',
      title: 'Univyx',
      description: 'A coordinated operating layer for the modern university.',
      detail:
        'A clearer university experience for administrators, students, and faculty working across complex systems.',
      hero_image_url:
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80',
      challenge:
        'Legacy tertiary institutions struggled with siloed student information systems, manual transcript verifications taking months, and disjointed course registration portals.',
      approach:
        'Constructed a unified higher-ed workflow platform combining cryptographic transcript generation, automated prerequisite enrollment engines, and multi-campus administrative analytics.',
      result:
        'Reduced transcript processing time from 42 days to under 3 minutes, while serving over 35,000 active university students across 4 pilot campuses with zero downtime during peak registration weeks.',
      tech_stack: ['React', 'Express', 'GraphQL', 'PostgreSQL', 'Docker', 'AWS ECS'],
      client_name: 'Prof. Emmanuel Cole, Vice Chancellor Academic Systems',
      client_quote:
        'Univyx removed the administrative friction that had burdened our faculties for a decade. The execution speed and design precision were exemplary.',
      project_url: '/projects/univyx',
      sort_order: 3,
    },
    {
      id: 'proj-4',
      slug: 'kora-systems',
      category_tag: 'Financial operations',
      title: 'Kora Systems',
      description: 'A simplified financial operations environment for distributed teams.',
      detail:
        'A unified product language for high-trust workflows, reporting, and everyday decision making.',
      hero_image_url:
        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1600&q=80',
      challenge:
        'Multi-entity pan-African businesses suffered from fragmented treasury visibility, slow multi-currency payroll reconciliations, and high cross-border transaction failure rates.',
      approach:
        'Designed and implemented a high-security treasury control center with real-time multi-currency settlement rails, dual-approval workflow authorization, and instant ledger auditing.',
      result:
        'Over $120M in annualized corporate volume cleared through the system, decreasing reconciliation settlement errors by 98.4% and reducing month-end close time from 9 days to 4 hours.',
      tech_stack: ['TypeScript', 'React', 'Go', 'PostgreSQL', 'Kafka', 'Terraform', 'Vault'],
      client_name: 'Chidi Nnamdi, Chief Financial Officer',
      client_quote:
        'In financial operations, latency and ambiguity are unacceptable. GhreatnessLabs built an institutional-grade platform our treasury relies on daily.',
      project_url: '/projects/kora-systems',
      sort_order: 4,
    },
  ],
  leadership: [
    {
      id: 'lead-1',
      name: 'Gideon Greatness',
      role: 'Founder & Creative Director',
      bio: 'Guides the studio’s creative direction and turns ambitious briefs into clear, ownable systems.',
      social_links: {
        linkedin: 'https://www.linkedin.com',
        twitter: 'https://x.com',
      },
      sort_order: 1,
    },
    {
      id: 'lead-2',
      name: 'Tomi Adeyemi',
      role: 'Product Design Lead',
      bio: 'Shapes thoughtful product experiences from discovery through design-system delivery.',
      social_links: {
        linkedin: 'https://www.linkedin.com',
        twitter: 'https://x.com',
      },
      sort_order: 2,
    },
    {
      id: 'lead-3',
      name: 'David Okafor',
      role: 'Engineering Lead',
      bio: 'Builds the technical foundations that make digital products durable and fast.',
      social_links: {
        linkedin: 'https://www.linkedin.com',
        twitter: 'https://x.com',
      },
      sort_order: 3,
    },
    {
      id: 'lead-4',
      name: 'Ifeoma Nwosu',
      role: 'Strategy & Partnerships',
      bio: 'Connects business priorities to practical programs of work and lasting relationships.',
      social_links: {
        linkedin: 'https://www.linkedin.com',
        twitter: 'https://x.com',
      },
      sort_order: 4,
    },
  ],
  clients: [
    { id: 'client-1', name: 'Vertex', sort_order: 1 },
    { id: 'client-2', name: 'Duct', sort_order: 2 },
    { id: 'client-3', name: 'Mora', sort_order: 3 },
    { id: 'client-4', name: 'AthleGame', sort_order: 4 },
    { id: 'client-5', name: 'Civyn', sort_order: 5 },
    { id: 'client-6', name: 'Univyx', sort_order: 6 },
    { id: 'client-7', name: 'Kora Systems', sort_order: 7 },
    { id: 'client-8', name: 'Northstar', sort_order: 8 },
  ],
  testimonials: [
    {
      id: 'test-1',
      quote: '“They made an ambitious platform feel inevitable. Every detail has a purpose.”',
      author_name: 'Amara Okafor',
      author_role: 'Director',
      author_company: 'Vertex',
      location: 'Lagos, Nigeria',
      sort_order: 1,
    },
    {
      id: 'test-2',
      quote: '“The visual system gave our team a common language and genuine momentum.”',
      author_name: 'Henry Blake',
      author_role: 'Founder',
      author_company: 'Duct',
      location: 'London, United Kingdom',
      sort_order: 2,
    },
    {
      id: 'test-3',
      quote: '“GhreatnessLabs paired strategic rigor with the speed our launch demanded.”',
      author_name: 'Maya Fields',
      author_role: 'VP Product',
      author_company: 'Mora',
      location: 'New York, United States',
      sort_order: 3,
    },
  ],
  pages: [
    {
      id: 'page-about-hero',
      page_slug: 'about',
      section_key: 'hero',
      title: 'Built in Lagos for',
      subtitle: 'important work.',
      content:
        'We are an independent digital and IT solutions studio for teams that need clarity, craft, and capable delivery in equal measure.',
      updated_at: new Date().toISOString(),
    },
    {
      id: 'page-services-hero',
      page_slug: 'services',
      section_key: 'hero',
      title: 'Full-spectrum capabilities',
      subtitle: 'under one roof.',
      content:
        'Digital craft and technology delivery, brought together around the work that will make the greatest difference.',
      updated_at: new Date().toISOString(),
    },
    {
      id: 'page-holding-hero',
      page_slug: 'holding-group',
      section_key: 'hero',
      title: 'Companies built for',
      subtitle: 'distinct worlds.',
      content:
        'GhreatnessLabs owns and supports ventures where thoughtful technology, culture, and community can create enduring value.',
      updated_at: new Date().toISOString(),
    },
    {
      id: 'page-projects-hero',
      page_slug: 'projects',
      section_key: 'hero',
      title: 'Ventures and case studies',
      subtitle: 'made to move.',
      content:
        'We use systems thinking to make products, platforms, and brands more useful in the real world.',
      updated_at: new Date().toISOString(),
    },
    {
      id: 'page-leadership-hero',
      page_slug: 'leadership',
      section_key: 'hero',
      title: 'A small team for',
      subtitle: 'high-stakes work.',
      content:
        'Senior thinking stays close to the brief, the details, and the people making decisions.',
      updated_at: new Date().toISOString(),
    },
    {
      id: 'page-clients-hero',
      page_slug: 'clients',
      section_key: 'hero',
      title: 'Partners with',
      subtitle: 'a point of view.',
      content:
        'We work with organizations that see design and technology as a meaningful advantage.',
      updated_at: new Date().toISOString(),
    },
    {
      id: 'page-contact-hero',
      page_slug: 'contact',
      section_key: 'hero',
      title: 'Start the',
      subtitle: 'conversation.',
      content: 'Tell us what you are building. We will reply with the right next step.',
      updated_at: new Date().toISOString(),
    },
  ],
  faqs: [
    {
      id: 'faq-engagements',
      question: 'How do studio engagements typically start?',
      answer:
        'Every partnership begins with a confidential discovery and technical audit session. We evaluate your product goals, architectural constraints, and organizational timeline to define an exact scope of work, technical blueprint, and delivery milestones before contract execution.',
      sort_order: 1,
    },
    {
      id: 'faq-pricing',
      question: 'What is your pricing and commercial structure?',
      answer:
        'We operate transparently across two primary models: milestone-based fixed sprints for defined scopes (such as brand identity rollouts, core product launches, or cloud infrastructure rebuilds) and dedicated monthly advisory retainers for companies requiring ongoing senior engineering leadership and design stewardship.',
      sort_order: 2,
    },
    {
      id: 'faq-timelines',
      question: 'What are typical project timelines?',
      answer:
        'Focused product sprints and brand design systems typically deliver production-ready within 2 to 4 weeks. Full-scale digital platforms, distributed microservices, and enterprise multi-tenant infrastructure typically span 6 to 12 weeks with weekly demo cycles.',
      sort_order: 3,
    },
    {
      id: 'faq-consultation',
      question: 'What is included in a complimentary consultation?',
      answer:
        'Our initial 30-minute consultation is a deep, direct conversation with a senior systems partner. We review your current technology stack or project brief, identify high-risk technical bottlenecks, discuss scalable architecture choices, and outline immediate recommended next steps.',
      sort_order: 4,
    },
    {
      id: 'faq-support',
      question: 'How does ongoing support, maintenance, and DevOps work?',
      answer:
        'Following deployment, we offer SLA-backed ongoing support packages encompassing 24/7 uptime monitoring, database performance tuning, security patching, dependency upgrades, and proactive scaling adjustments so your platforms remain fast, resilient, and secure.',
      sort_order: 5,
    },
  ],
};

