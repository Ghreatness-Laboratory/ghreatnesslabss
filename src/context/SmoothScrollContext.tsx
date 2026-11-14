import React, { createContext, useContext, useEffect, useRef, useMemo, useCallback } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

interface SmoothScrollContextValue {
  lenis: Lenis | null;
  scrollTo: (
    target: number | string | HTMLElement,
    options?: {
      offset?: number;
      immediate?: boolean;
      duration?: number;
      easing?: (t: number) => number;
      onComplete?: () => void;
    }
  ) => void;
  lockScroll: () => void;
  unlockScroll: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  scrollTo: () => {},
  lockScroll: () => {},
  unlockScroll: () => {},
});

function clearAllScrollLocks() {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.remove('lenis-stopped', 'no-scroll');
  document.body.classList.remove('no-scroll');
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
}

export function SmoothScrollProvider({
  children,
  currentPath,
}: {
  children: React.ReactNode;
  currentPath?: string;
}) {
  const lenisRef = useRef<Lenis | null>(null);

  const lockScroll = useCallback(() => {
    lenisRef.current?.stop();
  }, []);

  const unlockScroll = useCallback(() => {
    lenisRef.current?.start();
    clearAllScrollLocks();
  }, []);

  useEffect(() => {
    // Respect accessibility settings
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lenis = new Lenis({
      duration: prefersReducedMotion ? 0.01 : 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !prefersReducedMotion,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
      infinite: false,
      autoRaf: false,
    });

    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (href && href.length > 1 && href.startsWith('#')) {
        const targetEl = document.querySelector(href);
        if (targetEl) {
          e.preventDefault();
          lenis.scrollTo(targetEl as HTMLElement, {
            offset: -80,
            duration: 1.2,
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });
    resizeObserver.observe(document.body);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('click', handleAnchorClick);
      resizeObserver.disconnect();
      lenis.destroy();
      lenisRef.current = null;
      clearAllScrollLocks();
    };
  }, []);

  // When path changes, unlock any modal/menu scroll lock and scroll smoothly to the top
  useEffect(() => {
    unlockScroll();
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [currentPath, unlockScroll]);

  const value = useMemo(
    () => ({
      get lenis() {
        return lenisRef.current;
      },
      scrollTo: (
        target: number | string | HTMLElement,
        options?: {
          offset?: number;
          immediate?: boolean;
          duration?: number;
          easing?: (t: number) => number;
          onComplete?: () => void;
        }
      ) => {
        if (lenisRef.current) {
          lenisRef.current.scrollTo(target, options);
        } else {
          if (typeof target === 'number') {
            window.scrollTo({ top: target, behavior: options?.immediate ? 'instant' : 'smooth' });
          } else if (typeof target === 'string') {
            const el = document.querySelector(target);
            el?.scrollIntoView({ behavior: options?.immediate ? 'instant' : 'smooth' });
          } else if (target instanceof HTMLElement) {
            target.scrollIntoView({ behavior: options?.immediate ? 'instant' : 'smooth' });
          }
        }
      },
      lockScroll,
      unlockScroll,
    }),
    [lockScroll, unlockScroll]
  );

  return (
    <SmoothScrollContext.Provider value={value}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}
export default SmoothScrollProvider;

