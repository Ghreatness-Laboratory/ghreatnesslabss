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
import { BottomTabBar } from './components/BottomTabBar';
import { SiteToast } from './components/SiteToast';
import { ScrollNavigation } from './components/ScrollNavigation';
import { CmsProvider } from './context/CmsContext';
import { SmoothScrollProvider } from './context/SmoothScrollContext';
import { updateDocumentMeta } from './lib/ogImage';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import './styles.css';
import { registerSW } from 'virtual:pwa-register';

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  registerSW({ immediate: true });
}

// Lazy-loaded route pages for optimal bundle splitting
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const HoldingGroup = lazy(() => import('./pages/HoldingGroup'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const StartProject = lazy(() => import('./pages/StartProject'));
const Leadership = lazy(() => import('./pages/Leadership'));
const LeadershipDetail = lazy(() => import('./pages/LeadershipDetail'));
const Clients = lazy(() => import('./pages/Clients'));
const Contact = lazy(() => import('./pages/Contact'));
const Admin = lazy(() => import('./pages/Admin'));

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
  '/admin/links': Admin,
};

const routeMetadata: Record<string, { title: string; description: string; category: string }> = {
  '/': {
    title: 'GhreatnessLabs | Ghreatness Labs - Digital & IT Solutions Studio in Lagos',
    description: 'Ghreatness Labs (also known as Ghreatness Lab or GhreatnessLabs) is a Lagos digital and IT solutions studio engineering high-impact systems, software, and brand infrastructure for ambitious teams.',
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

  // Check for dynamic project detail route (e.g. /projects/[slug])
  const isProjectDetail = path.startsWith('/projects/') && path.length > '/projects/'.length;
  const projectSlug = isProjectDetail ? path.replace(/^\/projects\/?/, '').replace(/\/$/, '') : '';

  // Check for dynamic leadership detail route (e.g. /leadership/[slug])
  const isLeadershipDetail = path.startsWith('/leadership/') && path.length > '/leadership/'.length;
  const leaderSlug = isLeadershipDetail ? path.replace(/^\/leadership\/?/, '').replace(/\/$/, '') : '';

  // Synchronize document title and dynamic Open Graph card metadata on route change
  useEffect(() => {
    if (isAdminRoute) {
      document.title = 'Studio CMS Admin — GhreatnessLabs';
      return;
    }
    // If on a project or leadership detail page, those components update their own specific meta
    if (isProjectDetail || isLeadershipDetail) return;

    const meta = routeMetadata[path] || routeMetadata['/'];
    if (meta) {
      updateDocumentMeta({
        title: meta.title,
        description: meta.description,
        category: meta.category,
        urlPath: path,
      });
    }
  }, [path, isAdminRoute, isProjectDetail, isLeadershipDetail]);

  // Subtle fade-up on scroll reveal for below-the-fold sections
  useEffect(() => {
    if (isAdminRoute) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let observer: IntersectionObserver | null = null;

    const setupTimer = window.setTimeout(() => {
      const targets = Array.from(
        document.querySelectorAll<HTMLElement>(
          'main .section:not(.hero):not(.page-intro), main .stats-section, .app-footer .cta'
        )
      );

      if (targets.length === 0) return;

      if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
        targets.forEach((el) => {
          el.classList.remove('scroll-reveal-pending');
          el.classList.add('scroll-reveal-visible');
        });
        return;
      }

      const viewportH = window.innerHeight || 800;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const target = entry.target as HTMLElement;
              target.classList.remove('scroll-reveal-pending');
              target.classList.add('scroll-reveal-visible');
              observer?.unobserve(target);
            }
          });
        },
        { threshold: 0.05, rootMargin: '0px 0px -16px 0px' }
      );

      targets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < viewportH * 0.96) {
          el.classList.remove('scroll-reveal-pending');
          el.classList.add('scroll-reveal-visible');
        } else {
          el.classList.add('scroll-reveal-pending');
          observer?.observe(el);
        }
      });
    }, 60);

    return () => {
      window.clearTimeout(setupTimer);
      observer?.disconnect();
    };
  }, [path, isAdminRoute]);

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
      <SmoothScrollProvider currentPath={path}>
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
          <div key={path} className="page-transition-enter">
            <Suspense fallback={null}>
              {isProjectDetail ? (
                <ProjectDetail slug={projectSlug} />
              ) : isLeadershipDetail ? (
                <LeadershipDetail slug={leaderSlug} />
              ) : (
                <ActivePage />
              )}
            </Suspense>
          </div>
        </main>

        <Footer />

        {/* Floating native-style bottom tab bar & consultation modal */}
        <BottomTabBar path={path} onNavigate={navigate} />
      </SmoothScrollProvider>
    </CmsProvider>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
