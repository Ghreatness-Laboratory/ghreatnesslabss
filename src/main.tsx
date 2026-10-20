import React, {
  Suspense,
  useEffect,
  useState,
  useTransition,
  lazy,
} from 'react';
import { createRoot } from 'react-dom/client';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LoadingScreen } from './components/LoadingScreen';
import { AmbientBrandMark } from './components/AmbientBrandMark';
import { CursorDot } from './components/CursorDot';
import { StickyConsultationCta } from './components/StickyConsultationCta';
import { SiteToast } from './components/SiteToast';
import { ScrollNavigation } from './components/ScrollNavigation';
import { CmsProvider } from './context/CmsContext';
import { updateDocumentMeta } from './lib/ogImage';
import './styles.css';

// Lazy-loaded route pages for optimal bundle splitting
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const HoldingGroup = lazy(() => import('./pages/HoldingGroup'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const StartProject = lazy(() => import('./pages/StartProject'));
const Leadership = lazy(() => import('./pages/Leadership'));
const Clients = lazy(() => import('./pages/Clients'));
const Contact = lazy(() => import('./pages/Contact'));
const Admin = lazy(() => import('./pages/Admin'));

// Lazy-loaded non-critical widgets
const ChatBubble = lazy(() =>
  import('./components/ChatBubble').then((mod) => ({ default: mod.ChatBubble }))
);

const routes: Record<string, React.LazyExoticComponent<() => React.JSX.Element>> = {
  '/': Home,
  '/about': About,
  '/services': Services,
  '/holding-group': HoldingGroup,
  '/projects': Projects,
  '/start-project': StartProject,
  '/leadership': Leadership,
  '/clients': Clients,
  '/contact': Contact,
  '/admin': Admin,
  '/admin/media': Admin,
};

const routeMetadata: Record<string, { title: string; description: string; category: string }> = {
  '/': {
    title: 'GhreatnessLabs | Digital & IT Solutions Studio in Lagos',
    description: 'GhreatnessLabs (also searched as Ghreatness Lab or Ghreatness Laboratory) is a Lagos digital and IT solutions studio building high-impact systems and brands for ambitious teams.',
    category: 'Digital Systems Studio',
  },
  '/services': {
    title: 'Services & Infrastructure Architecture',
    description: 'Digital systems development, enterprise IT, and brand systems engineered in Lagos.',
    category: 'Studio Services',
  },
  '/projects': {
    title: 'Ventures & Case Studies',
    description: 'Selected digital systems, platforms, and technological infrastructure case studies.',
    category: 'Portfolio & Ventures',
  },
  '/start-project': {
    title: 'Start a Project Brief',
    description: 'Confidential project scoping intake for systems architecture, timelines, and budgets.',
    category: 'Project Intake & Scoping',
  },
  '/holding-group': {
    title: 'Holding Group & Portfolio Ecosystem',
    description: 'Operating companies and ecosystem ventures under the GhreatnessLabs holding structure.',
    category: 'Holding Group',
  },
  '/about': {
    title: 'About the Studio',
    description: 'Independent digital and IT solutions studio founded in Lagos in 2024.',
    category: 'About Studio',
  },
  '/leadership': {
    title: 'Studio Leadership & Governance',
    description: 'Principals, systems architects, and technical directors at GhreatnessLabs.',
    category: 'Leadership Team',
  },
  '/clients': {
    title: 'Clients & Partner Perspectives',
    description: 'High-trust brands and public institutions powered by GhreatnessLabs digital infrastructure.',
    category: 'Client Partners',
  },
  '/contact': {
    title: 'Contact Studio',
    description: 'Inquire about digital systems consulting, project availability, and partnerships.',
    category: 'Direct Contact',
  },
};

function App() {
  const [path, setPath] = useState(location.pathname);
  const [isPending, startTransition] = useTransition();
  const [initialLoading, setInitialLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  const isAdminRoute = path.startsWith('/admin');

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      startTransition(() => {
        setPath(location.pathname);
      });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Clear initial loading state after initial paint
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Defer non-critical JavaScript (chat widget) until after first paint & idle
  useEffect(() => {
    if (isAdminRoute) return;

    if ('requestIdleCallback' in window) {
      const handle = (
        window as unknown as {
          requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number;
        }
      ).requestIdleCallback(() => setShowChat(true), { timeout: 1500 });
      return () => {
        if ('cancelIdleCallback' in window) {
          (
            window as unknown as { cancelIdleCallback: (id: number) => void }
          ).cancelIdleCallback(handle);
        }
      };
    } else {
      const timer = setTimeout(() => setShowChat(true), 600);
      return () => clearTimeout(timer);
    }
  }, [isAdminRoute]);

  // Handle client-side routing when links are clicked
  const navigate = (to: string) => {
    if (to === path) return;
    window.history.pushState({}, '', to);
    startTransition(() => {
      setPath(to);
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest('a[href^="/"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const targetPath = anchor.getAttribute('href');
      if (targetPath && targetPath.startsWith('/') && !targetPath.startsWith('//')) {
        e.preventDefault();
        navigate(targetPath);
      }
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [path]);

  // High-performance batched IntersectionObserver for section reveal
  useEffect(() => {
    if (isAdminRoute) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const timer = setTimeout(() => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>(
          'main > .section, main > .stats, main .service-category, main .testimonials-section, footer .cta'
        )
      );

      if (!sections.length) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.05, rootMargin: '120px 0px 40px 0px' }
      );

      sections.forEach((section) => {
        section.classList.add('reveal');
        observer.observe(section);
      });

      return () => observer.disconnect();
    }, 60);

    return () => clearTimeout(timer);
  }, [path, isAdminRoute]);

  // Check for dynamic project detail route (e.g. /projects/[slug])
  const isProjectDetail = path.startsWith('/projects/') && path.length > '/projects/'.length;
  const projectSlug = isProjectDetail ? path.replace(/^\/projects\/?/, '').replace(/\/$/, '') : '';

  // Synchronize document title and dynamic Open Graph card metadata on route change
  useEffect(() => {
    if (isAdminRoute) {
      document.title = 'Studio CMS Admin — GhreatnessLabs';
      return;
    }
    // If on a project detail page, ProjectDetail component updates its own specific meta
    if (isProjectDetail) return;

    const meta = routeMetadata[path] || routeMetadata['/'];
    if (meta) {
      updateDocumentMeta({
        title: meta.title,
        description: meta.description,
        category: meta.category,
        urlPath: path,
      });
    }
  }, [path, isAdminRoute, isProjectDetail]);

  const ActivePage = routes[path] || Home;

  if (isAdminRoute) {
    return (
      <CmsProvider>
        <Suspense fallback={<LoadingScreen isLoading delayMs={0} />}>
          <Admin />
        </Suspense>
      </CmsProvider>
    );
  }

  return (
    <CmsProvider>
      {/* Branded loading state: shows on initial asset load or route transitions if >220ms */}
      <LoadingScreen isLoading={initialLoading || isPending} delayMs={220} />

      {/* Ambient background watermark and cursor dot */}
      <AmbientBrandMark />
      <CursorDot />

      {/* Global thin scroll progress bar & back-to-top button */}
      <ScrollNavigation />

      {/* Global toast notifications */}
      <SiteToast />

      <Header path={path} onNavigate={navigate} />

      <main>
        <Suspense fallback={null}>
          {isProjectDetail ? <ProjectDetail slug={projectSlug} /> : <ActivePage />}
        </Suspense>
      </main>

      <Footer />

      {/* Sticky Book a Consultation CTA (IntersectionObserver past hero) */}
      <StickyConsultationCta onNavigate={navigate} />

      {/* Deferred non-critical chat assistant */}
      {showChat && (
        <Suspense fallback={null}>
          <ChatBubble />
        </Suspense>
      )}
    </CmsProvider>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
