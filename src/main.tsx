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
import './styles.css';

// Lazy-loaded route pages for optimal bundle splitting
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const HoldingGroup = lazy(() => import('./pages/HoldingGroup'));
const Projects = lazy(() => import('./pages/Projects'));
const Leadership = lazy(() => import('./pages/Leadership'));
const Clients = lazy(() => import('./pages/Clients'));
const Contact = lazy(() => import('./pages/Contact'));

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
  '/leadership': Leadership,
  '/clients': Clients,
  '/contact': Contact,
};

function App() {
  const [path, setPath] = useState(location.pathname);
  const [isPending, startTransition] = useTransition();
  const [initialLoading, setInitialLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

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
    if ('requestIdleCallback' in window) {
      const handle = (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number })
        .requestIdleCallback(() => setShowChat(true), { timeout: 1500 });
      return () => {
        if ('cancelIdleCallback' in window) {
          (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(handle);
        }
      };
    } else {
      const timer = setTimeout(() => setShowChat(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle client-side routing when links are clicked
  const navigate = (to: string) => {
    if (to === path) return;
    window.history.pushState({}, '', to);
    startTransition(() => {
      setPath(to);
      window.scrollTo(0, 0);
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

  // Scroll reveal animations initialized after layout paints
  useEffect(() => {
    const timer = setTimeout(() => {
      const major = Array.from(
        document.querySelectorAll<HTMLElement>(
          'main > .section, main > .stats, main .service-category, main .testimonials-section, footer .cta'
        )
      );
      const cards = 'article, blockquote, .partner-logo, .leader-preview-card, .client-list > span';

      major.forEach((section) => {
        section.classList.add('reveal');
        section.querySelectorAll<HTMLElement>(cards).forEach((card, index) => {
          card.classList.add('reveal-stagger');
          card.style.setProperty('--stagger-index', String(index));
        });
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -30px' }
      );

      major.forEach((section) => observer.observe(section));
      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, [path]);

  const ActivePage = routes[path] || Home;

  return (
    <>
      {/* Branded loading state: shows on initial asset load or route transitions if >220ms */}
      <LoadingScreen isLoading={initialLoading || isPending} delayMs={220} />

      {/* Ambient background watermark and cursor dot */}
      <AmbientBrandMark />
      <CursorDot />

      <Header path={path} onNavigate={navigate} />

      <main>
        <Suspense fallback={null}>
          <ActivePage />
        </Suspense>
      </main>

      <Footer />

      {/* Deferred non-critical chat assistant */}
      {showChat && (
        <Suspense fallback={null}>
          <ChatBubble />
        </Suspense>
      )}
    </>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
